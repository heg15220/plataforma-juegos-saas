import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const ROOT = process.cwd();
const CLICK_DATA_API = "https://api.github.com/repos/codeforgermany/click_that_hood/contents/public/data";
const CLICK_LIST_CACHE_PATH = path.join(ROOT, "tmp-click-data-files.json");
const META_CACHE_DIR = path.join(ROOT, "tmp-click-country-meta");
const GEO_SOURCE_CACHE_DIR = path.join(ROOT, "tmp-click-country-geo-sources");
const GEO_OUTPUT_DIR = path.join(ROOT, "tmp-click-country-subdivisions");
const COUNTRIES_METADATA_PATH = path.join(ROOT, "tmp-countries-metadata.json");
const OUTPUT_PATH = path.join(ROOT, "src/games/knowledge/mapsCountryProvincesData.js");

const MIN_SUBDIVISIONS = 4;
const MAX_SUBDIVISIONS = 120;
const MAX_COUNTRIES = 120;
const SKIP_COUNTRY_IDS = new Set();
const COUNTRY_DISPLAY_OVERRIDES = {
  "united-kingdom": {
    labelEs: "Inglaterra",
    labelEn: "England"
  }
};

const ensureDir = (directory) => fs.mkdirSync(directory, { recursive: true });

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

const safeReadJson = (filePath, fallback = null) => {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
};

const writeJson = (filePath, value) => {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
};

const fetchText = (url) =>
  new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          "User-Agent": "codex-country-provinces-generator",
          Accept: "application/vnd.github+json"
        }
      },
      (response) => {
        if (response.statusCode && response.statusCode >= 400) {
          reject(new Error(`HTTP ${response.statusCode} while fetching ${url}`));
          response.resume();
          return;
        }
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => resolve(body));
      }
    );
    request.on("error", reject);
  });

const fetchJson = async (url) => JSON.parse(await fetchText(url));

const loadClickDataList = async () => {
  const cached = safeReadJson(CLICK_LIST_CACHE_PATH);
  if (Array.isArray(cached) && cached.length) {
    return cached;
  }
  const fetched = await fetchJson(CLICK_DATA_API);
  writeJson(CLICK_LIST_CACHE_PATH, fetched);
  return fetched;
};

const buildCountryMetadataIndex = () => {
  const countriesMetadata = safeReadJson(COUNTRIES_METADATA_PATH, []);
  const byToken = new Map();
  const knownCountryTokens = new Set();

  for (const country of countriesMetadata) {
    const labelEn = toAscii(country.name?.common || country.name?.official);
    if (!labelEn) continue;
    const labelEs = toAscii(country.translations?.spa?.common) || labelEn;
    knownCountryTokens.add(normalizeToken(labelEn));
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
      byToken.set(token, {
        labelEn,
        labelEs
      });
      knownCountryTokens.add(token);
    }
  }

  return {
    resolve(countryNameRaw) {
      const fallbackEn = toAscii(countryNameRaw);
      const token = normalizeToken(countryNameRaw);
      const found = byToken.get(token);
      if (found) return found;
      return {
        labelEn: fallbackEn,
        labelEs: fallbackEn
      };
    },
    isKnownCountry(countryNameRaw) {
      return knownCountryTokens.has(normalizeToken(countryNameRaw));
    }
  };
};

const buildCandidateScore = (candidate, countrySlug) => {
  const fileName = candidate.geoName.toLowerCase();
  const text = [
    candidate.annotation,
    ...(candidate.neighborhoodNoun ?? [])
  ]
    .map((value) => toAscii(value).toLowerCase())
    .join(" ");

  let score = 0;

  if (fileName === `${countrySlug}.geojson`) score += 50;
  if (fileName.startsWith(`${countrySlug}-`)) score += 25;
  if (/-states?\.geojson$/.test(fileName)) score += 24;
  if (/-provinces?\.geojson$/.test(fileName)) score += 24;
  if (/-regions?\.geojson$/.test(fileName)) score += 20;
  if (/-departments?\.geojson$/.test(fileName)) score += 20;

  if (/\bstate\b/.test(text)) score += 20;
  if (/\bprovince\b/.test(text)) score += 20;
  if (/\bregion\b/.test(text)) score += 16;
  if (/\bdepartment\b/.test(text)) score += 16;
  if (/\bcanton\b/.test(text)) score += 10;
  if (/\bgovernorate\b/.test(text)) score += 10;

  if (/\bcounty\b/.test(text)) score -= 18;
  if (/\bmunicipal/.test(text)) score -= 20;
  if (/\bneighborhood\b/.test(text)) score -= 30;
  if (/\bborough\b/.test(text)) score -= 28;
  if (/\bward\b/.test(text)) score -= 24;
  if (/\bconstituenc/.test(text)) score -= 24;

  return score;
};

const geometryToPolygons = (geometry) => {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  return [];
};

const extractNameFromFeature = (feature) => {
  const props = feature?.properties ?? {};
  const preferredKeys = [
    "name",
    "NAME_1",
    "NAME",
    "nom",
    "Name",
    "state",
    "province",
    "region",
    "department",
    "prefecture"
  ];

  for (const key of preferredKeys) {
    const value = props[key];
    const ascii = toAscii(value);
    if (ascii && ascii.length >= 2) return ascii;
  }

  for (const [key, value] of Object.entries(props)) {
    if (!key || value === null || value === undefined) continue;
    if (typeof value !== "string") continue;
    const ascii = toAscii(value);
    if (!ascii) continue;
    if (ascii.length < 2 || ascii.length > 72) continue;
    return ascii;
  }

  return "";
};

const extractAliasesFromFeature = (feature, label) => {
  const props = feature?.properties ?? {};
  const aliasKeys = [
    "iso_3166_2",
    "sigla",
    "abbr",
    "abbrev",
    "code",
    "name_prefecture",
    "short_name",
    "name_en",
    "name_local"
  ];
  const aliases = new Set();

  for (const key of aliasKeys) {
    const value = props[key];
    const ascii = toAscii(value);
    if (!ascii) continue;
    if (ascii.length < 2 || ascii.length > 48) continue;
    aliases.add(ascii);
  }

  return [...aliases]
    .filter((alias) => normalizeToken(alias) !== normalizeToken(label))
    .filter((value, index, list) => (
      list.findIndex((entry) => normalizeToken(entry) === normalizeToken(value)) === index
    ));
};

const buildTargetsFromGeoJson = (geojson) => {
  const targets = [];
  const idUsage = new Map();

  for (const feature of geojson.features ?? []) {
    const polygons = geometryToPolygons(feature.geometry);
    if (!polygons.length) continue;

    const name = extractNameFromFeature(feature);
    if (!name) continue;

    const baseId = slugify(name);
    if (!baseId) continue;

    const seen = idUsage.get(baseId) ?? 0;
    idUsage.set(baseId, seen + 1);
    const id = seen ? `${baseId}-${seen + 1}` : baseId;

    targets.push({
      id,
      labelEs: name,
      labelEn: name,
      aliases: extractAliasesFromFeature(feature, name)
    });
  }

  targets.sort((left, right) => left.labelEs.localeCompare(right.labelEs, "es"));
  return targets;
};

const toForwardSlashes = (value) => value.replace(/\\/g, "/");

const runWithConcurrency = async (items, limit, worker) => {
  const results = new Array(items.length);
  let cursor = 0;

  const runner = async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      try {
        results[index] = await worker(items[index], index);
      } catch {
        results[index] = null;
      }
    }
  };

  const count = Math.max(1, Math.min(limit, items.length));
  await Promise.all(new Array(count).fill(null).map(() => runner()));
  return results;
};

const main = async () => {
  ensureDir(META_CACHE_DIR);
  ensureDir(GEO_SOURCE_CACHE_DIR);
  ensureDir(GEO_OUTPUT_DIR);

  const clickFiles = await loadClickDataList();
  const filesByName = new Map(clickFiles.map((entry) => [entry.name, entry]));

  const metadataFiles = clickFiles.filter((entry) =>
    entry.name.endsWith(".metadata.json") &&
    !entry.name.startsWith("_")
  );

  const groupedCandidates = new Map();
  const countryMetadataIndex = buildCountryMetadataIndex();

  const metadataPayloads = await runWithConcurrency(
    metadataFiles,
    16,
    async (metadataFile) => {
      const cachedPath = path.join(META_CACHE_DIR, metadataFile.name);
      let metadata = safeReadJson(cachedPath);
      if (!metadata) {
        metadata = await fetchJson(metadataFile.download_url);
        writeJson(cachedPath, metadata);
      }
      return { metadataFile, metadata };
    }
  );

  for (const payload of metadataPayloads) {
    if (!payload?.metadataFile || !payload?.metadata) continue;
    const { metadataFile, metadata } = payload;

    const geoName = metadataFile.name.replace(/\.metadata\.json$/i, ".geojson");
    const geoFile = filesByName.get(geoName);
    if (!geoFile?.download_url) continue;

    const countryName = toAscii(metadata.countryName || metadata.locationName);
    const locationName = toAscii(metadata.locationName);
    if (!countryName || !locationName || /^world$/i.test(countryName)) continue;
    if (!countryMetadataIndex.isKnownCountry(countryName)) continue;

    const countrySlug = slugify(countryName);
    if (!countrySlug || SKIP_COUNTRY_IDS.has(countrySlug)) continue;

    const candidate = {
      countryName,
      countrySlug,
      locationName,
      annotation: toAscii(metadata.annotation),
      neighborhoodNoun: Array.isArray(metadata.neighborhoodNoun)
        ? metadata.neighborhoodNoun.map((value) => toAscii(value)).filter(Boolean)
        : [],
      geoName,
      geoDownloadUrl: geoFile.download_url
    };

    if (!groupedCandidates.has(countrySlug)) {
      groupedCandidates.set(countrySlug, []);
    }
    groupedCandidates.get(countrySlug).push(candidate);
  }

  const resolveCountryNames = countryMetadataIndex.resolve;
  const catalog = [];

  for (const [countrySlug, candidates] of groupedCandidates.entries()) {
    candidates.sort((left, right) => (
      buildCandidateScore(right, countrySlug) - buildCandidateScore(left, countrySlug)
    ));

    let chosen = null;
    let chosenGeo = null;
    let fallback = null;
    let fallbackGeo = null;

    for (const candidate of candidates.slice(0, 5)) {
      const sourceCachePath = path.join(GEO_SOURCE_CACHE_DIR, candidate.geoName);
      let geojson = safeReadJson(sourceCachePath);
      if (!geojson) {
        const body = await fetchText(candidate.geoDownloadUrl);
        geojson = JSON.parse(body);
        writeJson(sourceCachePath, geojson);
      }

      const targets = buildTargetsFromGeoJson(geojson);
      const count = targets.length;
      if (count >= MIN_SUBDIVISIONS && count <= MAX_SUBDIVISIONS) {
        chosen = candidate;
        chosenGeo = geojson;
        break;
      }
      if (!fallback && count >= MIN_SUBDIVISIONS && count <= 180) {
        fallback = candidate;
        fallbackGeo = geojson;
      }
    }

    if (!chosen && fallback) {
      chosen = fallback;
      chosenGeo = fallbackGeo;
    }
    if (!chosen || !chosenGeo) continue;

    const targets = buildTargetsFromGeoJson(chosenGeo);
    if (targets.length < MIN_SUBDIVISIONS) continue;

    const { labelEn, labelEs } = resolveCountryNames(chosen.countryName);
    const countryId = slugify(labelEn) || countrySlug;
    if (!countryId || SKIP_COUNTRY_IDS.has(countryId)) continue;
    const displayNames = COUNTRY_DISPLAY_OVERRIDES[countryId] ?? { labelEs, labelEn };

    const normalizedGeoPath = path.join(GEO_OUTPUT_DIR, `${countryId}.geojson`);
    writeJson(normalizedGeoPath, chosenGeo);

    const subtitleEs = `Subdivisiones de ${displayNames.labelEs} ocultas`;
    const subtitleEn = `Hidden subdivisions of ${displayNames.labelEn}`;

    catalog.push({
      id: countryId,
      name: { es: displayNames.labelEs, en: displayNames.labelEn },
      subtitle: { es: subtitleEs, en: subtitleEn },
      source: toForwardSlashes(path.relative(ROOT, normalizedGeoPath)),
      targets
    });

    if (catalog.length >= MAX_COUNTRIES) {
      break;
    }
  }

  catalog.sort((left, right) => left.name.es.localeCompare(right.name.es, "es"));

  const outputContent = [
    "export const MAP_COUNTRY_PROVINCE_CATALOG = ",
    JSON.stringify(catalog, null, 2),
    ";\n"
  ].join("");

  fs.writeFileSync(OUTPUT_PATH, outputContent, "utf8");

  const totals = {
    countries: catalog.length,
    subdivisions: catalog.reduce((sum, item) => sum + item.targets.length, 0)
  };
  console.log(`Country province catalog generated: ${path.relative(ROOT, OUTPUT_PATH)}`);
  console.log("Totals:", JSON.stringify(totals));
  console.log(
    "Sample countries:",
    catalog.slice(0, 12).map((item) => `${item.id}(${item.targets.length})`).join(", ")
  );
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
