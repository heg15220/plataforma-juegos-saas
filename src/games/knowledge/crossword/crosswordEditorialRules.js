import { resolveCrosswordLocaleProfile } from "./crosswordLocaleProfiles.js";

export const CROSSWORD_EDITORIAL_RULES = Object.freeze({
  minWords: 3,
  maxWords: 18,
  preferredWords: [5, 13],
  bannedFragments: Object.freeze({
    es: [
      "termino relacionado con",
      "palabra relacionada con",
      "entrada lexical vinculada a",
      "concepto general",
      "vocabulario general"
    ],
    en: [
      "word related to",
      "term related to",
      "entry associated with",
      "general concept",
      "general vocabulary"
    ]
  })
});

export const normalizeWhitespace = (value) =>
  String(value || "").replace(/\s+/g, " ").trim();

export const sentenceCase = (value) => {
  const safe = normalizeWhitespace(value);
  if (!safe) return "";
  return `${safe.charAt(0).toUpperCase()}${safe.slice(1)}`;
};

const ensureTerminalPunctuation = (value) => (
  /[.!?]$/.test(value) ? value : `${value}.`
);

export const applyEditorialPolish = (value, locale) => {
  const safe = sentenceCase(value)
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")");

  const profile = resolveCrosswordLocaleProfile(locale);
  const [minWords, maxWords] = profile.preferredWordRange || CROSSWORD_EDITORIAL_RULES.preferredWords;
  const words = normalizeWhitespace(safe).split(" ").filter(Boolean);
  let polished = safe;

  if (words.length > maxWords + 4) {
    polished = words.slice(0, maxWords + 4).join(" ");
  }

  if (words.length < Math.max(2, minWords - 1)) {
    if (profile.locale === "es") {
      polished = `${polished} en uso habitual`;
    } else {
      polished = `${polished} in common usage`;
    }
  }

  return ensureTerminalPunctuation(polished);
};

export const evaluateEditorialFit = (clue, locale) => {
  const safe = normalizeWhitespace(clue);
  const words = safe.split(" ").filter(Boolean);
  const profile = resolveCrosswordLocaleProfile(locale);
  const banned = CROSSWORD_EDITORIAL_RULES.bannedFragments[profile.locale] || [];
  const lower = safe.toLowerCase();

  let penalty = 0;
  const notes = [];

  if (words.length < CROSSWORD_EDITORIAL_RULES.minWords) {
    penalty += 12;
    notes.push("editorial_too_short");
  }
  if (words.length > CROSSWORD_EDITORIAL_RULES.maxWords) {
    penalty += 14;
    notes.push("editorial_too_long");
  }
  if (/[;:]{2,}/.test(safe)) {
    penalty += 6;
    notes.push("editorial_punctuation_noise");
  }

  if (banned.some((fragment) => lower.includes(fragment))) {
    penalty += 35;
    notes.push("editorial_banned_fragment");
  }

  return {
    score: Math.max(0, 100 - penalty),
    penalty,
    notes
  };
};
