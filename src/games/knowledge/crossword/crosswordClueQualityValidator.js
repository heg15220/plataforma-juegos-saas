import {
  applyEditorialPolish,
  evaluateEditorialFit
} from "./crosswordEditorialRules.js";
import { resolveCrosswordLocaleProfile } from "./crosswordLocaleProfiles.js";
import {
  normalizeCrosswordAscii,
  normalizeCrosswordLettersOnly
} from "./crosswordLexiconNormalizer.js";

const STEM_SUFFIXES_BY_LOCALE = Object.freeze({
  es: [
    "aciones",
    "iciones",
    "amiento",
    "imiento",
    "mente",
    "acion",
    "icion",
    "adora",
    "ador",
    "dora",
    "dor",
    "ista",
    "ismo",
    "able",
    "ible",
    "idad",
    "dad",
    "ico",
    "ica",
    "oso",
    "osa",
    "ivo",
    "iva",
    "ando",
    "iendo",
    "ado",
    "ada",
    "ido",
    "ida",
    "ar",
    "er",
    "ir"
  ],
  en: [
    "ation",
    "ition",
    "ingly",
    "edly",
    "ness",
    "ment",
    "able",
    "ible",
    "ally",
    "ical",
    "izer",
    "ised",
    "ized",
    "ing",
    "ers",
    "est",
    "ies",
    "ied",
    "ed",
    "er",
    "ly",
    "al",
    "ic",
    "es",
    "s"
  ]
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const countWords = (text) =>
  normalizeCrosswordAscii(text).split(" ").filter(Boolean).length;

const tokenList = (text) => normalizeCrosswordAscii(text)
  .replace(/[^a-z0-9\s]/g, " ")
  .split(" ")
  .filter(Boolean);

const lexicalDiversity = (text) => {
  const tokens = tokenList(text);
  if (!tokens.length) return 0;
  return new Set(tokens).size / tokens.length;
};

const tokenRepetitionRatio = (text) => {
  const tokens = tokenList(text);
  if (!tokens.length) return 1;
  return 1 - (new Set(tokens).size / tokens.length);
};

const deriveStem = (lettersOnly, locale) => {
  const suffixes = STEM_SUFFIXES_BY_LOCALE[locale] || STEM_SUFFIXES_BY_LOCALE.en;
  for (let index = 0; index < suffixes.length; index += 1) {
    const suffix = suffixes[index];
    if (lettersOnly.length - suffix.length >= 4 && lettersOnly.endsWith(suffix)) {
      return lettersOnly.slice(0, -suffix.length);
    }
  }
  return lettersOnly;
};

const addFragment = (set, value) => {
  const safe = normalizeCrosswordLettersOnly(value).toLowerCase();
  if (safe.length >= 4) {
    set.add(safe);
  }
};

export const buildForbiddenFragments = ({ answer, locale, extraFragments = [] }) => {
  const safeLocale = String(locale || "en").toLowerCase().startsWith("es") ? "es" : "en";
  const answerLetters = normalizeCrosswordLettersOnly(answer).toLowerCase();
  const fragments = new Set();
  addFragment(fragments, answerLetters);
  addFragment(fragments, deriveStem(answerLetters, safeLocale));
  if (answerLetters.length >= 7) {
    addFragment(fragments, answerLetters.slice(0, 5));
    addFragment(fragments, answerLetters.slice(-5));
  }
  extraFragments.forEach((fragment) => {
    addFragment(fragments, fragment);
    addFragment(fragments, deriveStem(normalizeCrosswordLettersOnly(fragment).toLowerCase(), safeLocale));
  });
  return [...fragments].sort((left, right) => right.length - left.length);
};

const detectPattern = (text, patterns = []) => {
  for (let index = 0; index < patterns.length; index += 1) {
    if (patterns[index].test(text)) return patterns[index].source;
  }
  return "";
};

const hasSemanticVacuum = (text, localeProfile) => {
  const tokens = tokenList(text);
  const content = tokens.filter((token) => !localeProfile.stopWords.has(token));
  return content.length < 2;
};

const difficultyPenalty = (difficulty, clueWordCount, clueText) => {
  const normalized = normalizeCrosswordAscii(clueText).toLowerCase();
  let penalty = 0;
  const notes = [];

  if (difficulty === "easy" && clueWordCount > 12) {
    penalty += 8;
    notes.push("easy_too_dense");
  }
  if (difficulty === "hard" && clueWordCount < 5) {
    penalty += 9;
    notes.push("hard_too_obvious");
  }
  if (difficulty === "hard" && /\b(definicion|definition|nombre preciso|precise name)\b/.test(normalized)) {
    penalty += 7;
    notes.push("hard_over_direct");
  }

  return { penalty, notes };
};

export const evaluateClueQuality = ({
  clue,
  answer,
  locale,
  difficulty = "medium",
  extraForbiddenFragments = [],
  strategyId = ""
}) => {
  const localeProfile = resolveCrosswordLocaleProfile(locale);
  const polished = applyEditorialPolish(clue, localeProfile.locale);
  const compactClue = normalizeCrosswordLettersOnly(polished).toLowerCase();
  const normalizedAnswer = normalizeCrosswordLettersOnly(answer).toLowerCase();
  const hardFailReasons = [];
  const notes = [];
  let score = 100;

  if (!normalizeCrosswordAscii(polished)) {
    hardFailReasons.push("empty_clue");
  }
  if (normalizedAnswer && compactClue.includes(normalizedAnswer)) {
    hardFailReasons.push("contains_answer");
  }

  const fragments = buildForbiddenFragments({
    answer,
    locale: localeProfile.locale,
    extraFragments: extraForbiddenFragments
  });
  const derivativeHit = fragments.find((fragment) =>
    fragment !== normalizedAnswer
      && fragment.length >= 4
      && compactClue.includes(fragment)
  );
  if (derivativeHit) {
    hardFailReasons.push(`contains_derivative_fragment:${derivativeHit}`);
  }

  const genericPattern = detectPattern(polished, localeProfile.genericPatterns);
  if (genericPattern) {
    hardFailReasons.push("generic_pattern");
  }

  const awkwardSyntax = detectPattern(polished, localeProfile.awkwardSyntaxPatterns);
  if (awkwardSyntax) {
    hardFailReasons.push("awkward_syntax");
  }

  const wordCount = countWords(polished);
  const diversity = lexicalDiversity(polished);
  const repetition = tokenRepetitionRatio(polished);
  const editorial = evaluateEditorialFit(polished, localeProfile.locale);
  const coldPattern = detectPattern(polished, localeProfile.coldDictionaryPatterns);
  const semanticVacuum = hasSemanticVacuum(polished, localeProfile);

  score -= editorial.penalty;
  editorial.notes.forEach((note) => notes.push(note));

  if (wordCount < 3) {
    score -= 20;
    notes.push("too_short");
  }
  if (wordCount > localeProfile.maxWords) {
    score -= 17;
    notes.push("too_long");
  }
  if (wordCount > 22) {
    hardFailReasons.push("extreme_length");
  }

  if (diversity < 0.55) {
    score -= 11;
    notes.push("low_diversity");
  }
  if (repetition > 0.45) {
    score -= 13;
    notes.push("high_repetition");
  }
  if (coldPattern) {
    score -= 18;
    notes.push("cold_dictionary_tone");
  }
  if (semanticVacuum) {
    score -= 18;
    notes.push("semantic_vacuum");
  }
  if (!/[.!?]$/.test(polished)) {
    score -= 3;
    notes.push("missing_terminal_punctuation");
  }

  const diff = difficultyPenalty(difficulty, wordCount, polished);
  score -= diff.penalty;
  diff.notes.forEach((note) => notes.push(note));

  if (strategyId === "controlled_ambiguity" && wordCount < 5) {
    score -= 6;
    notes.push("ambiguity_without_support");
  }

  return {
    score: clamp(Math.round(score), 0, 100),
    hardFailReasons,
    notes,
    metrics: {
      wordCount,
      lexicalDiversity: Number(diversity.toFixed(3)),
      repetitionRatio: Number(repetition.toFixed(3)),
      editorialScore: editorial.score
    },
    clue: polished
  };
};

export const pickBestScoredClue = ({
  candidates,
  answer,
  locale,
  difficulty,
  extraForbiddenFragments = [],
  strategyId = "",
  acceptanceThreshold = 74
}) => {
  const safeCandidates = Array.isArray(candidates) ? candidates : [];
  let best = null;
  let accepted = null;

  safeCandidates.forEach((candidate, index) => {
    const quality = evaluateClueQuality({
      clue: candidate,
      answer,
      locale,
      difficulty,
      extraForbiddenFragments,
      strategyId
    });
    const payload = {
      clue: quality.clue,
      quality,
      index
    };

    if (!best || payload.quality.score > best.quality.score) {
      best = payload;
    }
    if (!quality.hardFailReasons.length && quality.score >= acceptanceThreshold && !accepted) {
      accepted = payload;
    }
  });

  return {
    selected: accepted || best,
    accepted: Boolean(accepted),
    best,
    acceptedCandidate: accepted
  };
};

export const scoreClueBatch = ({ entries, locale }) => {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const byReason = {};
  let totalScore = 0;

  safeEntries.forEach((entry) => {
    const evaluation = evaluateClueQuality({
      clue: entry.clue,
      answer: entry.answer,
      locale,
      difficulty: entry.difficulty || "medium"
    });
    totalScore += evaluation.score;
    evaluation.hardFailReasons.forEach((reason) => {
      byReason[reason] = (byReason[reason] || 0) + 1;
    });
  });

  return {
    total: safeEntries.length,
    averageScore: safeEntries.length ? Number((totalScore / safeEntries.length).toFixed(2)) : 0,
    hardFailReasons: byReason
  };
};
