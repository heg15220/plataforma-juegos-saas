import { normalizeCrosswordAscii } from "./crosswordLexiconNormalizer.js";

const hashText = (text) => {
  const source = String(text || "");
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const shuffleBySeed = (items, seedKey) => (Array.isArray(items) ? items : [])
  .map((item, index) => ({
    item,
    rank: hashText(`${seedKey}:${index}:${item}`)
  }))
  .sort((left, right) => left.rank - right.rank)
  .map(({ item }) => item);

const normalizeBase = (value) => String(value || "")
  .replace(/\s+/g, " ")
  .replace(/[;]+/g, ",")
  .replace(/\s+([,.;:!?])/g, "$1")
  .trim();

const applyPunctuationVariant = (text, locale) => {
  if (!text) return "";
  if (/[.!?]$/.test(text)) return text;
  return locale === "es" ? `${text}.` : `${text}.`;
};

const generateMicroVariants = (text, locale) => {
  const safe = normalizeBase(text);
  if (!safe) return [];

  const variants = [safe];
  const lower = normalizeCrosswordAscii(safe).toLowerCase();

  if (lower.startsWith("se usa cuando ")) {
    variants.push(safe.replace(/^Se usa cuando /i, "Cuando "));
  }
  if (lower.startsWith("used when ")) {
    variants.push(safe.replace(/^Used when /i, "When "));
  }
  if (lower.startsWith("en esta situacion")) {
    variants.push(safe.replace(/^En esta situacion/i, "En contexto"));
  }
  if (lower.startsWith("in this")) {
    variants.push(safe.replace(/^In this /i, "Within this "));
  }

  if (!/[.!?]$/.test(safe)) {
    variants.push(applyPunctuationVariant(safe, locale));
  }

  return variants;
};

export const buildSyntaxSignature = (text, locale) => {
  const normalized = normalizeCrosswordAscii(text).toLowerCase();
  const tokens = normalized.split(" ").filter(Boolean);
  const head = tokens.slice(0, 2).join("_");
  const tail = tokens.slice(-1)[0] || "none";
  const bucket = tokens.length <= 5 ? "short" : tokens.length <= 9 ? "mid" : "long";
  return `${locale}:${bucket}:${head}:${tail}`;
};

export const expandClueVariations = ({ candidates, locale, seedKey }) => {
  const raw = Array.isArray(candidates) ? candidates : [];
  const expanded = [];

  raw.forEach((candidate) => {
    generateMicroVariants(candidate, locale).forEach((variant) => {
      expanded.push(normalizeBase(variant));
    });
  });

  const deduped = [];
  const seen = new Set();
  expanded.forEach((value) => {
    const key = normalizeCrosswordAscii(value).toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    deduped.push(value);
  });

  return shuffleBySeed(deduped, `${seedKey}:variation`);
};
