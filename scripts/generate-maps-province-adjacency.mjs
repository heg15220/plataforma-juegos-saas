import fs from "node:fs";
import path from "node:path";
import { MAP_COUNTRY_PROVINCE_CATALOG } from "../src/games/knowledge/mapsCountryProvincesData.js";

const ROOT = process.cwd();
const OUTPUT_PATH = path.join(ROOT, "src/games/knowledge/mapsProvinceAdjacencyData.js");

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

const geometryToPolygons = (geometry) => {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  return [];
};

const toQuantizedPoint = ([lon, lat], precision = 4) => {
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

const buildSegments = (feature, precision = 4) => {
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

const buildFeatureLookup = (features) => {
  const byName = new Map();
  for (const feature of features ?? []) {
    const propertyValues = Object.values(feature.properties ?? {})
      .filter((value) => typeof value === "string")
      .map((value) => String(value).trim())
      .filter((value) => value.length >= 1 && value.length <= 120);
    const names = new Set([
      feature.properties?.name,
      feature.properties?.NAME_1,
      feature.properties?.NAME,
      ...propertyValues
    ]);
    for (const name of names) {
      const normalized = normalizeToken(name);
      if (normalized && !byName.has(normalized)) byName.set(normalized, feature);
      const slug = slugify(name);
      if (slug && !byName.has(slug)) byName.set(slug, feature);
      for (const token of splitNameTokens(name)) {
        if (token && !byName.has(token)) byName.set(token, feature);
      }
    }
  }
  return byName;
};

const resolveTargetFeature = (target, byName) => {
  const candidates = new Set([
    target.id,
    normalizeToken(target.labelEs),
    normalizeToken(target.labelEn),
    ...(target.aliases ?? []).map((alias) => normalizeToken(alias))
  ]);
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (byName.has(candidate)) return byName.get(candidate);
    for (const token of splitNameTokens(candidate)) {
      if (byName.has(token)) return byName.get(token);
    }
  }
  return null;
};

const adjacencyByCountry = {};
const unresolvedByCountry = {};

for (const countryEntry of MAP_COUNTRY_PROVINCE_CATALOG ?? []) {
  const sourcePath = path.join(ROOT, countryEntry.source ?? "");
  if (!fs.existsSync(sourcePath)) {
    adjacencyByCountry[countryEntry.id] = Object.fromEntries(
      (countryEntry.targets ?? []).map((target) => [target.id, []])
    );
    unresolvedByCountry[countryEntry.id] = (countryEntry.targets ?? []).map((target) => target.id);
    continue;
  }

  const geojson = readJson(sourcePath);
  const features = geojson.features ?? [];
  const byName = buildFeatureLookup(features);

  const featuresByTargetId = new Map();
  const unresolved = [];
  const segmentOwners = new Map();

  for (const target of countryEntry.targets ?? []) {
    const feature = resolveTargetFeature(target, byName);
    if (!feature) {
      unresolved.push(target.id);
      continue;
    }
    featuresByTargetId.set(target.id, feature);
    const segments = buildSegments(feature);
    for (const segmentKey of segments) {
      if (!segmentOwners.has(segmentKey)) {
        segmentOwners.set(segmentKey, new Set());
      }
      segmentOwners.get(segmentKey).add(target.id);
    }
  }

  const neighborsById = new Map();
  for (const target of countryEntry.targets ?? []) {
    neighborsById.set(target.id, new Set());
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

  adjacencyByCountry[countryEntry.id] = Object.fromEntries(
    [...neighborsById.entries()]
      .sort(([leftId], [rightId]) => leftId.localeCompare(rightId))
      .map(([targetId, neighbors]) => [targetId, [...neighbors].sort()])
  );
  unresolvedByCountry[countryEntry.id] = unresolved;
}

const outputContent = [
  "export const MAP_PROVINCE_ADJACENCY = ",
  JSON.stringify(adjacencyByCountry, null, 2),
  ";\n"
].join("");

fs.writeFileSync(OUTPUT_PATH, outputContent, "utf8");

const stats = Object.fromEntries(
  Object.entries(adjacencyByCountry).map(([countryId, adjacency]) => {
    const nodes = Object.keys(adjacency).length;
    const edgeCount = Object.values(adjacency).reduce((acc, neighbors) => acc + neighbors.length, 0) / 2;
    return [countryId, { nodes, edges: edgeCount }];
  })
);

console.log(`Province adjacency generated: ${path.relative(ROOT, OUTPUT_PATH)}`);
console.log("Graph stats:", JSON.stringify(stats));
console.log("Unresolved entries:", JSON.stringify(unresolvedByCountry));

