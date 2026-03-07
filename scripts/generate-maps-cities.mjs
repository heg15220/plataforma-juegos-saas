import fs from "node:fs";
import path from "node:path";
import { MAP_COUNTRY_PROVINCE_CATALOG } from "../src/games/knowledge/mapsCountryProvincesData.js";

const ROOT = process.cwd();
const CITIES_SOURCE_PATH = path.join(ROOT, "tmp-world-cities.geojson");
const COUNTRIES_METADATA_PATH = path.join(ROOT, "tmp-countries-metadata.json");
const OUTPUT_PATH = path.join(ROOT, "src/games/knowledge/mapsCitiesData.js");

const MIN_CITIES = 5;
const MAX_CITIES = 12;
const PROJECT_PADDING_PERCENT = 4.8;
const COUNTRY_CODE_OVERRIDES = {
  "united-kingdom": ["GBR", "UK"]
};

const toAscii = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const normalizeToken = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

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

const computeBounds = (polygons) => {
  let minLon = Number.POSITIVE_INFINITY;
  let maxLon = Number.NEGATIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;
  for (const polygon of polygons) {
    for (const ring of polygon) {
      for (const [lon, lat] of ring) {
        if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    }
  }
  if (!Number.isFinite(minLon) || !Number.isFinite(maxLon) || !Number.isFinite(minLat) || !Number.isFinite(maxLat)) {
    return null;
  }
  return { minLon, maxLon, minLat, maxLat };
};

const createProjector = (rawBounds, paddingPercent = PROJECT_PADDING_PERCENT) => {
  const lonSpan = Math.max(1e-6, rawBounds.maxLon - rawBounds.minLon);
  const latSpan = Math.max(1e-6, rawBounds.maxLat - rawBounds.minLat);
  const padLon = lonSpan * (paddingPercent / 100);
  const padLat = latSpan * (paddingPercent / 100);
  const minLon = rawBounds.minLon - padLon;
  const maxLon = rawBounds.maxLon + padLon;
  const minLat = rawBounds.minLat - padLat;
  const maxLat = rawBounds.maxLat + padLat;
  const safeLonSpan = maxLon - minLon;
  const safeLatSpan = maxLat - minLat;

  return (lon, lat) => {
    const x = ((lon - minLon) / safeLonSpan) * 100;
    const y = ((maxLat - lat) / safeLatSpan) * 100;
    return [Number(x.toFixed(3)), Number(y.toFixed(3))];
  };
};

const buildCountryCodeResolver = () => {
  const metadata = readJson(COUNTRIES_METADATA_PATH);
  const byToken = new Map();
  for (const country of metadata) {
    const codes = new Set([
      String(country.cca3 ?? "").toUpperCase(),
      String(country.cioc ?? "").toUpperCase()
    ]);
    const variants = new Set([
      country.name?.common,
      country.name?.official,
      country.translations?.spa?.common,
      country.translations?.spa?.official,
      ...(country.altSpellings ?? [])
    ]);
    for (const variant of variants) {
      const token = normalizeToken(variant);
      if (!token || byToken.has(token)) continue;
      byToken.set(token, [...codes].filter((code) => code && code !== "undefined"));
    }
  }

  return (countryName) => byToken.get(normalizeToken(countryName)) ?? [];
};

const collectCountryPolygons = (sourcePath) => {
  const geojson = readJson(path.join(ROOT, sourcePath));
  const polygons = [];
  for (const feature of geojson.features ?? []) {
    polygons.push(...geometryToPolygons(feature.geometry));
  }
  return polygons;
};

const dedupeByToken = (items, tokenResolver) => {
  const seen = new Set();
  return items.filter((item) => {
    const token = tokenResolver(item);
    if (!token || seen.has(token)) return false;
    seen.add(token);
    return true;
  });
};

const citiesSource = readJson(CITIES_SOURCE_PATH);
const resolveCountryCodes = buildCountryCodeResolver();

const cityMaps = [];
const cityBaseCountries = [
  ...MAP_COUNTRY_PROVINCE_CATALOG.map((country) => ({
    ...country,
    baseSilhouetteTheme: country.id,
    baseSilhouetteIds: (country.targets ?? []).map((target) => target.id)
  })),
  {
    id: "spain",
    name: { es: "Espana", en: "Spain" },
    source: "tmp-spain-provinces.geojson",
    targets: [],
    baseSilhouetteTheme: "spain",
    baseSilhouetteIds: []
  }
];

const uniqueBaseCountries = dedupeByToken(
  cityBaseCountries,
  (country) => normalizeToken(country.id)
);

for (const country of uniqueBaseCountries) {
  const overrideCodes = (COUNTRY_CODE_OVERRIDES[country.id] ?? []).map((code) =>
    String(code).toUpperCase()
  );
  const countryCodes = new Set([
    ...resolveCountryCodes(country.name.en),
    ...overrideCodes
  ]);
  const countryPolygons = collectCountryPolygons(country.source);
  const bounds = computeBounds(countryPolygons);
  if (!bounds) continue;
  const project = createProjector(bounds);

  const filteredCities = citiesSource.features
    .filter((feature) => {
      const code = String(feature.properties?.ADM0_A3 ?? "").toUpperCase();
      const sovCode = String(feature.properties?.SOV_A3 ?? "").toUpperCase();
      if (countryCodes.size) {
        return countryCodes.has(code) || countryCodes.has(sovCode);
      }
      const countryName = feature.properties?.ADM0NAME;
      return normalizeToken(countryName) === normalizeToken(country.name.en);
    })
    .map((feature) => {
      const cityNameEn = toAscii(
        feature.properties?.NAME_EN ||
        feature.properties?.NAMEASCII ||
        feature.properties?.NAME
      );
      const cityNameEs = toAscii(
        feature.properties?.NAME_ES ||
        feature.properties?.NAME ||
        cityNameEn
      ) || cityNameEn;
      const longitude = Number(feature.properties?.LONGITUDE);
      const latitude = Number(feature.properties?.LATITUDE);
      const population = Number(feature.properties?.POP_MAX ?? 0);
      if (!cityNameEn || !Number.isFinite(longitude) || !Number.isFinite(latitude)) {
        return null;
      }
      const [x, y] = project(longitude, latitude);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return null;
      }
      if (x < -5 || x > 105 || y < -5 || y > 105) {
        return null;
      }
      return {
        labelEn: cityNameEn,
        labelEs: cityNameEs,
        population,
        x: Math.min(100, Math.max(0, x)),
        y: Math.min(100, Math.max(0, y)),
        aliases: dedupeByToken(
          [
            toAscii(feature.properties?.NAME),
            toAscii(feature.properties?.NAMEASCII),
            toAscii(feature.properties?.NAME_EN),
            toAscii(feature.properties?.NAME_ES)
          ].filter(Boolean),
          (value) => normalizeToken(value)
        ).filter((alias) => normalizeToken(alias) !== normalizeToken(cityNameEn))
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.population - left.population);

  const uniqueCities = dedupeByToken(filteredCities, (item) => normalizeToken(item.labelEn))
    .slice(0, MAX_CITIES)
    .map((city) => ({
      id: slugify(city.labelEn),
      labelEs: city.labelEs,
      labelEn: city.labelEn,
      x: Number(city.x.toFixed(3)),
      y: Number(city.y.toFixed(3)),
      aliases: city.aliases
    }))
    .filter((city) => city.id);

  if (uniqueCities.length < MIN_CITIES) continue;

  cityMaps.push({
    id: country.id,
    name: country.name,
    subtitle: {
      es: `Ciudades principales de ${country.name.es} ocultas`,
      en: `Hidden major cities of ${country.name.en}`
    },
    baseSilhouette: {
      theme: country.baseSilhouetteTheme ?? country.id,
      ids: country.baseSilhouetteIds ?? country.targets.map((target) => target.id)
    },
    targets: uniqueCities
  });
}

cityMaps.sort((left, right) => left.name.es.localeCompare(right.name.es, "es"));

const outputContent = [
  "export const MAP_CITY_COUNTRY_MAPS = ",
  JSON.stringify(cityMaps, null, 2),
  ";\n"
].join("");

fs.writeFileSync(OUTPUT_PATH, outputContent, "utf8");
console.log(`City map catalog generated: ${path.relative(ROOT, OUTPUT_PATH)}`);
console.log(
  "Totals:",
  JSON.stringify({
    countries: cityMaps.length,
    cities: cityMaps.reduce((sum, entry) => sum + entry.targets.length, 0)
  })
);
