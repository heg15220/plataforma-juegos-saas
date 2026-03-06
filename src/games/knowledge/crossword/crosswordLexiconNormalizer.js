import { resolveCrosswordLocaleProfile } from "./crosswordLocaleProfiles.js";

const STRIP_MOJIBAKE_MAP = [
  [/Ã‚/g, ""],
  [/ÃƒÂ¡/g, "a"],
  [/ÃƒÂ©/g, "e"],
  [/ÃƒÂ­/g, "i"],
  [/ÃƒÂ³/g, "o"],
  [/ÃƒÂº/g, "u"],
  [/ÃƒÂ±/g, "n"],
  [/ÃƒÂ¼/g, "u"],
  [/Ãƒ/g, ""]
];

const POS_HINT_PATTERNS = Object.freeze({
  es: Object.freeze({
    adjective: /^(adjetivo|adjetival)\b/i,
    verb: /^(verbo|accion)\b/i,
    adverb: /^(adverbio)\b/i,
    noun: /^(sustantivo|nombre)\b/i
  }),
  en: Object.freeze({
    adjective: /^(adjective)\b/i,
    verb: /^(verb|action)\b/i,
    adverb: /^(adverb)\b/i,
    noun: /^(noun)\b/i
  })
});

const cleanMojibake = (value) => {
  let safe = String(value || "");
  STRIP_MOJIBAKE_MAP.forEach(([pattern, replacement]) => {
    safe = safe.replace(pattern, replacement);
  });
  return safe;
};

export const normalizeCrosswordAscii = (value) => cleanMojibake(value)
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/\s+/g, " ")
  .trim();

export const normalizeCrosswordLettersOnly = (value) =>
  normalizeCrosswordAscii(value).replace(/[^A-Za-z]/g, "").toUpperCase();

export const inferPosFromWord = (word, locale) => {
  const safe = String(word || "").toLowerCase();
  const profile = resolveCrosswordLocaleProfile(locale);

  if (profile.locale === "es") {
    if (/(ar|er|ir)$/.test(safe)) return "verb";
    if (/mente$/.test(safe)) return "adverb";
    if (/(able|ible|oso|osa|ivo|iva|al|ico|ica)$/.test(safe)) return "adjective";
    return "noun";
  }

  if (/(ate|ify|ise|ize|ing|ed)$/.test(safe)) return "verb";
  if (/ly$/.test(safe)) return "adverb";
  if (/(ous|ive|able|ible|al|ic|ary|ful|less)$/.test(safe)) return "adjective";
  return "noun";
};

const inferPosFromLegacyClue = (clue, locale, word) => {
  const profile = resolveCrosswordLocaleProfile(locale);
  const safeClue = normalizeCrosswordAscii(clue).toLowerCase();
  const patterns = POS_HINT_PATTERNS[profile.locale] || {};

  if (patterns.adjective?.test(safeClue)) return "adjective";
  if (patterns.verb?.test(safeClue)) return "verb";
  if (patterns.adverb?.test(safeClue)) return "adverb";
  if (patterns.noun?.test(safeClue)) return "noun";

  return inferPosFromWord(word, locale);
};

export const extractQuotedAnchor = (text) => {
  const normalized = normalizeCrosswordAscii(text);
  const quoted = normalized.match(/"([^"]+)"/);
  if (!quoted?.[1]) return "";
  return quoted[1].trim().toLowerCase();
};

const inferBaseDefinition = (legacyClue, locale, anchor, word) => {
  if (anchor) {
    return locale === "es"
      ? `idea vinculada con ${anchor}`
      : `idea linked to ${anchor}`;
  }

  const cleaned = normalizeCrosswordAscii(legacyClue)
    .replace(
      /^(termino|palabra|entrada|adjetivo|verbo|adverbio|sustantivo|noun|verb|adjective|adverb)\s+/i,
      ""
    )
    .replace(/^que\s+/i, "")
    .replace(/[.!?]+$/g, "")
    .trim()
    .toLowerCase();

  if (cleaned) return cleaned;

  return locale === "es"
    ? `vocablo de ${String(word || "").length} letras`
    : `${String(word || "").length}-letter word`;
};

const inferMorphology = (word) => {
  const safe = normalizeCrosswordLettersOnly(word).toLowerCase();
  return {
    length: safe.length,
    prefix: safe.slice(0, 3),
    suffix: safe.slice(-4),
    transparentVerbEnding: /(ar|er|ir|ate|ify|ise|ize)$/.test(safe),
    transparentAdverbEnding: /(mente|ly)$/.test(safe),
    transparentNounEnding: /(cion|sion|tion|ness|ment|dad|ez|ura)$/.test(safe)
  };
};

export const normalizeLegacyLexiconEntry = (entry, locale, options = {}) => {
  const profile = resolveCrosswordLocaleProfile(locale);
  const word = normalizeCrosswordLettersOnly(entry?.word);
  if (!/^[A-Z]{5,10}$/.test(word)) return null;

  const rawClue = String(entry?.clue || "");
  const anchor = extractQuotedAnchor(rawClue);
  const baseDefinition = inferBaseDefinition(rawClue, profile.locale, anchor, word);
  const pos = inferPosFromLegacyClue(rawClue, profile.locale, word);

  return {
    id: `${profile.locale}:${word}`,
    source: options.source || "legacy_term_bank",
    language: profile.locale,
    word,
    lemma: word.toLowerCase(),
    length: word.length,
    rawClue: normalizeCrosswordAscii(rawClue),
    pos,
    baseDefinition,
    anchor,
    morphology: inferMorphology(word)
  };
};

export const createSyntheticNormalizedEntry = ({
  word,
  locale,
  definition,
  synonyms = [],
  source = "synthetic_seed"
}) => {
  const profile = resolveCrosswordLocaleProfile(locale);
  const normalizedWord = normalizeCrosswordLettersOnly(word);
  if (!/^[A-Z]{5,10}$/.test(normalizedWord)) return null;

  return {
    id: `${profile.locale}:${normalizedWord}`,
    source,
    language: profile.locale,
    word: normalizedWord,
    lemma: normalizedWord.toLowerCase(),
    length: normalizedWord.length,
    rawClue: "",
    pos: inferPosFromWord(normalizedWord, profile.locale),
    baseDefinition: normalizeCrosswordAscii(definition),
    anchor: normalizeCrosswordAscii(synonyms[0] || ""),
    synonyms: synonyms.map((item) => normalizeCrosswordAscii(item).toLowerCase()).filter(Boolean),
    morphology: inferMorphology(normalizedWord)
  };
};
