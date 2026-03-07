import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const COUNTRIES_GEOMETRY_PATH = path.join(ROOT, "tmp-countries-dataset.geojson");
const COUNTRIES_METADATA_PATH = path.join(ROOT, "tmp-countries-metadata.json");
const OUTPUT_PATH = path.join(ROOT, "src/games/knowledge/mapsCountryGroupsData.js");

const SUPPORTED_REGIONS = new Map([
  ["Europe", "europe"],
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

const toAscii = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const buildFeatureLookups = (features) => {
  const byCode = new Map();
  const byName = new Map();

  for (const feature of features) {
    const code = String(feature.properties?.["ISO3166-1-Alpha-3"] ?? "").toUpperCase();
    if (code && code !== "-99" && !byCode.has(code)) {
      byCode.set(code, feature);
    }

    const name = feature.properties?.name ?? "";
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

  return { byCode, byName };
};

const resolveCountryFeature = (country, lookups) => {
  const candidateTokens = new Set([
    normalizeToken(country.name?.common),
    normalizeToken(country.name?.official),
    normalizeToken(country.translations?.spa?.common),
    normalizeToken(country.translations?.spa?.official),
    ...(country.altSpellings ?? []).map((name) => normalizeToken(name))
  ]);

  const byCode = lookups.byCode.get(country.cca3);
  if (byCode) {
    return byCode;
  }

  for (const token of candidateTokens) {
    if (!token) continue;
    const byName = lookups.byName.get(token);
    if (byName) return byName;
    for (const part of splitNameTokens(token)) {
      const splitByName = lookups.byName.get(part);
      if (splitByName) return splitByName;
    }
  }

  return null;
};

const supportsCountry = (country) => {
  if (!SUPPORTED_REGIONS.has(country.region)) return false;
  if (country.unMember || country.independent) return true;
  return SPECIAL_COUNTRY_CODES.has(country.cca3);
};

const geometry = readJson(COUNTRIES_GEOMETRY_PATH);
const metadata = readJson(COUNTRIES_METADATA_PATH);
const lookups = buildFeatureLookups(geometry.features);

const groups = {
  europe: [],
  america: [],
  asia: [],
  oceania: []
};

for (const country of metadata) {
  if (!supportsCountry(country)) continue;

  const regionId = SUPPORTED_REGIONS.get(country.region);
  const feature = resolveCountryFeature(country, lookups);
  if (!feature) continue;

  const labelEn = toAscii(country.name?.common);
  if (!labelEn) continue;

  const id = slugify(labelEn);
  if (!id) continue;

  const labelEs = toAscii(country.translations?.spa?.common) || labelEn;
  const aliases = new Set([
    country.name?.official,
    country.translations?.spa?.official,
    feature.properties?.name,
    ...(country.altSpellings ?? [])
  ]);

  aliases.delete(labelEs);
  aliases.delete(labelEn);
  aliases.delete(null);
  aliases.delete(undefined);
  aliases.delete("");

  const cleanAliases = [...aliases]
    .map((value) => toAscii(value))
    .filter((value) => value.length >= 3)
    .filter((value) => normalizeToken(value) !== normalizeToken(labelEs))
    .filter((value) => normalizeToken(value) !== normalizeToken(labelEn))
    .filter((value, index, list) => (
      list.findIndex((entry) => normalizeToken(entry) === normalizeToken(value)) === index
    ));

  groups[regionId].push({
    id,
    labelEs,
    labelEn,
    aliases: cleanAliases
  });
}

for (const entries of Object.values(groups)) {
  entries.sort((left, right) => left.labelEs.localeCompare(right.labelEs, "es"));
}

const outputContent = [
  "export const MAP_COUNTRY_GROUPS = ",
  JSON.stringify(groups, null, 2),
  ";\n"
].join("");

fs.writeFileSync(OUTPUT_PATH, outputContent, "utf8");

const counts = Object.fromEntries(
  Object.entries(groups).map(([key, entries]) => [key, entries.length])
);

console.log(`Country groups generated: ${path.relative(ROOT, OUTPUT_PATH)}`);
console.log("Counts:", JSON.stringify(counts));
