import fs from "node:fs";
import path from "node:path";
import { MAP_COUNTRY_GROUPS } from "../src/games/knowledge/mapsCountryGroupsData.js";

const ROOT = process.cwd();
const COUNTRIES_GEOMETRY_PATH = path.join(ROOT, "tmp-countries-dataset.geojson");
const COUNTRIES_METADATA_PATH = path.join(ROOT, "tmp-countries-metadata.json");
const OUTPUT_PATH = path.join(ROOT, "src/games/knowledge/mapsCountryAdjacencyData.js");

const SUPPORTED_REGIONS = new Map([
  ["Europe", "europe"],
  ["Africa", "africa"],
  ["Americas", "america"],
  ["Asia", "asia"],
  ["Oceania", "oceania"]
]);

const SPECIAL_COUNTRY_CODES = new Set(["UNK", "TWN", "PSE", "VAT"]);

const normalizeToken = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const splitNameTokens = (value) =>
  String(value ?? "")
    .split(/[\/,()\-]/g)
    .map((part) => normalizeToken(part))
    .filter(Boolean);

const slugify = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

const buildFeatureLookups = (features) => {
  const byCode = new Map();
  const byName = new Map();

  for (const feature of features) {
    const code = String(feature.properties?.["ISO3166-1-Alpha-3"] ?? "").toUpperCase();
    if (code && code !== "-99" && !byCode.has(code)) {
      byCode.set(code, feature);
    }

    const propertyValues = Object.values(feature.properties ?? {})
      .filter((value) => typeof value === "string")
      .map((value) => String(value).trim())
      .filter((value) => value.length >= 2 && value.length <= 90)
      .filter((value) => /[a-zA-Z]/.test(value));
    const candidateNames = new Set([feature.properties?.name, ...propertyValues]);

    for (const name of candidateNames) {
      const normalizedName = normalizeToken(name);
      if (normalizedName && !byName.has(normalizedName)) {
        byName.set(normalizedName, feature);
      }

      for (const token of splitNameTokens(name)) {
        if (token && !byName.has(token)) {
          byName.set(token, feature);
        }
      }
    }
  }

  return { byCode, byName };
};

const resolveCountryFeatureFromMetadata = (country, lookups) => {
  const byCode = lookups.byCode.get(country.cca3);
  if (byCode) return byCode;

  const candidateTokens = new Set([
    normalizeToken(country.name?.common),
    normalizeToken(country.name?.official),
    normalizeToken(country.translations?.spa?.common),
    normalizeToken(country.translations?.spa?.official),
    ...(country.altSpellings ?? []).map((name) => normalizeToken(name))
  ]);

  for (const token of candidateTokens) {
    if (!token) continue;
    const byName = lookups.byName.get(token);
    if (byName) return byName;
  }

  return null;
};

const resolveCountryFeatureFromLabels = (entry, lookups) => {
  const candidateTokens = new Set([
    normalizeToken(entry.labelEs),
    normalizeToken(entry.labelEn),
    ...(entry.aliases ?? []).map((name) => normalizeToken(name))
  ]);

  for (const token of candidateTokens) {
    if (!token) continue;
    const byName = lookups.byName.get(token);
    if (byName) return byName;
    for (const splitToken of splitNameTokens(token)) {
      if (lookups.byName.has(splitToken)) {
        return lookups.byName.get(splitToken);
      }
    }
  }

  return null;
};

const geometryToPolygons = (geometry) => {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  return [];
};

const toQuantizedPoint = ([lon, lat], precision = 3) => {
  const scale = 10 ** precision;
  return [
    Math.round(Number(lon) * scale) / scale,
    Math.round(Number(lat) * scale) / scale
  ];
};

const makeSegmentKey = (left, right) => {
  const leftKey = `${left[0]},${left[1]}`;
  const rightKey = `${right[0]},${right[1]}`;
  return leftKey < rightKey ? `${leftKey}|${rightKey}` : `${rightKey}|${leftKey}`;
};

const buildCountrySegments = (feature, precision = 3) => {
  const segmentKeys = new Set();
  const polygons = geometryToPolygons(feature?.geometry);
  for (const polygon of polygons) {
    for (const ring of polygon) {
      if (!Array.isArray(ring) || ring.length < 2) continue;
      for (let index = 0; index < ring.length - 1; index += 1) {
        const pointA = toQuantizedPoint(ring[index], precision);
        const pointB = toQuantizedPoint(ring[index + 1], precision);
        if (pointA[0] === pointB[0] && pointA[1] === pointB[1]) continue;
        segmentKeys.add(makeSegmentKey(pointA, pointB));
      }
    }
  }
  return segmentKeys;
};

const supportsCountry = (country) => {
  if (!SUPPORTED_REGIONS.has(country.region)) return false;
  if (country.unMember || country.independent) return true;
  return SPECIAL_COUNTRY_CODES.has(country.cca3);
};

const countriesGeometry = readJson(COUNTRIES_GEOMETRY_PATH);
const countriesMetadata = readJson(COUNTRIES_METADATA_PATH);
const lookups = buildFeatureLookups(countriesGeometry.features ?? []);

const countryByRegionAndId = new Map();
for (const country of countriesMetadata) {
  if (!supportsCountry(country)) continue;
  const regionId = SUPPORTED_REGIONS.get(country.region);
  const id = slugify(country.name?.common);
  if (!id) continue;
  countryByRegionAndId.set(`${regionId}:${id}`, country);
}

const adjacencyByRegion = {};
const unresolvedByRegion = {};

for (const [regionId, entries] of Object.entries(MAP_COUNTRY_GROUPS ?? {})) {
  const featuresById = new Map();
  const segmentOwners = new Map();
  const unresolved = [];

  for (const entry of entries ?? []) {
    const metadataCountry = countryByRegionAndId.get(`${regionId}:${entry.id}`);
    const feature =
      (metadataCountry && resolveCountryFeatureFromMetadata(metadataCountry, lookups)) ||
      resolveCountryFeatureFromLabels(entry, lookups);
    if (!feature) {
      unresolved.push(entry.id);
      continue;
    }

    featuresById.set(entry.id, feature);
    const segments = buildCountrySegments(feature);
    for (const segmentKey of segments) {
      if (!segmentOwners.has(segmentKey)) {
        segmentOwners.set(segmentKey, new Set());
      }
      segmentOwners.get(segmentKey).add(entry.id);
    }
  }

  const neighborsById = new Map();
  for (const entry of entries ?? []) {
    neighborsById.set(entry.id, new Set());
  }

  for (const ownerSet of segmentOwners.values()) {
    if (ownerSet.size < 2) continue;
    const owners = [...ownerSet];
    for (let leftIndex = 0; leftIndex < owners.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < owners.length; rightIndex += 1) {
        const leftId = owners[leftIndex];
        const rightId = owners[rightIndex];
        neighborsById.get(leftId)?.add(rightId);
        neighborsById.get(rightId)?.add(leftId);
      }
    }
  }

  adjacencyByRegion[regionId] = Object.fromEntries(
    [...neighborsById.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([countryId, neighbors]) => [countryId, [...neighbors].sort()])
  );
  unresolvedByRegion[regionId] = unresolved;
}

const outputContent = [
  "export const MAP_COUNTRY_ADJACENCY = ",
  JSON.stringify(adjacencyByRegion, null, 2),
  ";\n"
].join("");

fs.writeFileSync(OUTPUT_PATH, outputContent, "utf8");

const counts = Object.fromEntries(
  Object.entries(adjacencyByRegion).map(([regionId, adjacency]) => {
    const edgeCount = Object.values(adjacency).reduce((total, neighbors) => total + neighbors.length, 0) / 2;
    return [regionId, { countries: Object.keys(adjacency).length, edges: edgeCount }];
  })
);

console.log(`Country adjacency generated: ${path.relative(ROOT, OUTPUT_PATH)}`);
console.log("Graph stats:", JSON.stringify(counts));
console.log("Unresolved entries:", JSON.stringify(unresolvedByRegion));
