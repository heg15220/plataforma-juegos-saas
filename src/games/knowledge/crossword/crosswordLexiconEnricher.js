import {
  createSyntheticNormalizedEntry,
  normalizeCrosswordAscii,
  normalizeCrosswordLettersOnly
} from "./crosswordLexiconNormalizer.js";
import { resolveCrosswordLocaleProfile } from "./crosswordLocaleProfiles.js";
import { scoreLexicalDifficulty } from "./crosswordDifficultyScorer.js";

const FIELD_KEYWORDS = Object.freeze({
  science: ["atomo", "ciencia", "quim", "bio", "astro", "fis", "math", "science", "lab"],
  language: ["gramatica", "lexico", "verbo", "palabra", "idioma", "syntax", "word", "language"],
  culture: ["arte", "literatura", "museo", "teatro", "poesia", "art", "novel", "drama"],
  society: ["politica", "estado", "ley", "voto", "sociedad", "policy", "law", "society"],
  technology: ["algorit", "digital", "procesador", "sistema", "software", "network", "device"],
  education: ["escuela", "aula", "didact", "profesor", "estudio", "lesson", "classroom", "textbook"]
});

const DEFAULT_COLLOCATIONS = Object.freeze({
  es: Object.freeze({
    science: ["metodo cientifico", "dato medible", "prueba de laboratorio"],
    language: ["uso correcto", "regla gramatical", "giro verbal"],
    culture: ["obra clasica", "escena central", "lectura guiada"],
    society: ["debate publico", "acuerdo social", "marco legal"],
    technology: ["sistema digital", "proceso automatizado", "calculo preciso"],
    education: ["ejercicio de aula", "pregunta de examen", "material didactico"],
    generic: ["uso habitual", "contexto comun", "idea conocida"]
  }),
  en: Object.freeze({
    science: ["scientific method", "measured data", "lab evidence"],
    language: ["correct usage", "grammar rule", "verbal turn"],
    culture: ["classic work", "key scene", "guided reading"],
    society: ["public debate", "social agreement", "legal frame"],
    technology: ["digital system", "automated process", "precise computation"],
    education: ["classroom exercise", "exam prompt", "teaching material"],
    generic: ["common usage", "shared context", "known idea"]
  })
});

const pickFieldFromText = (text) => {
  const safe = String(text || "").toLowerCase();
  const pairs = Object.entries(FIELD_KEYWORDS);
  for (let index = 0; index < pairs.length; index += 1) {
    const [field, keywords] = pairs[index];
    if (keywords.some((keyword) => safe.includes(keyword))) {
      return field;
    }
  }
  return "generic";
};

const guessCulturalTags = (field, locale) => {
  if (field === "culture") {
    return locale === "es"
      ? ["canon_general", "referencia_literaria_ligera"]
      : ["general_canon", "light_literary_reference"];
  }
  if (field === "society") {
    return locale === "es"
      ? ["actualidad_civica"]
      : ["civic_context"];
  }
  if (field === "science") {
    return locale === "es"
      ? ["conocimiento_escolar"]
      : ["school_knowledge"];
  }
  return locale === "es" ? ["uso_general"] : ["common_usage"];
};

const buildRecommendedStrategies = (pos, field, difficultyBand) => {
  const shared = ["direct_definition_elegant", "indirect_definition", "lexicographic_humanized"];
  const byPos = {
    noun: ["descriptive_periphrasis", "frequent_collocation", "encyclopedic_light"],
    verb: ["functional_use", "situational_prompt", "morphosyntactic_hint"],
    adjective: ["distinctive_trait", "antonym_contrast", "register_marker"],
    adverb: ["morphosyntactic_hint", "situational_prompt", "controlled_ambiguity"],
    generic: ["descriptive_periphrasis", "functional_use"]
  };
  const byField = {
    science: ["didactic_school", "encyclopedic_light"],
    culture: ["literary_association", "cultural_reference_light"],
    technology: ["functional_use", "frequent_collocation"],
    language: ["morphosyntactic_hint", "didactic_school"],
    society: ["controlled_ambiguity", "contextual_synonym"],
    generic: ["situational_prompt", "contextual_synonym"]
  };
  const byDifficulty = {
    easy: ["didactic_school", "direct_definition_elegant"],
    medium: ["contextual_synonym", "descriptive_periphrasis"],
    hard: ["metaphorical_image", "elliptical_hint", "subtle_humor"]
  };

  return [
    ...shared,
    ...(byPos[pos] || byPos.generic),
    ...(byField[field] || byField.generic),
    ...(byDifficulty[difficultyBand] || [])
  ].filter((value, index, list) => list.indexOf(value) === index);
};

const buildForbiddenStrategies = (pos, difficultyBand) => {
  const forbidden = new Set();
  if (pos === "adverb") {
    forbidden.add("incomplete_idiom");
  }
  if (difficultyBand === "easy") {
    forbidden.add("elliptical_hint");
  }
  return [...forbidden];
};

const buildDefinitionPayload = (normalized, locale) => {
  const nuclear = normalizeCrosswordAscii(normalized.baseDefinition || "")
    .replace(/[.!?]+$/g, "");
  const short = nuclear || (locale === "es" ? "idea de uso comun" : "commonly used idea");

  return {
    nuclear: short,
    gloss: short,
    humanized: locale === "es"
      ? `Nocion ligada a ${short}`
      : `Notion linked to ${short}`
  };
};

const buildExampleUsage = ({ word, field, locale }) => {
  if (locale === "es") {
    if (field === "science") return `En clase se estudio ${word.toLowerCase()} con ejemplos.`;
    if (field === "culture") return `La cronica menciona ${word.toLowerCase()} de forma central.`;
    return `Uso habitual de ${word.toLowerCase()} en contexto general.`;
  }

  if (field === "science") return `The lesson framed ${word.toLowerCase()} with examples.`;
  if (field === "culture") return `The review mentions ${word.toLowerCase()} in context.`;
  return `Common usage of ${word.toLowerCase()} in context.`;
};

const mergeSynonyms = (normalized, overrides = []) => {
  const items = [];
  if (normalized.anchor) items.push(normalized.anchor);
  (normalized.synonyms || []).forEach((value) => items.push(value));
  overrides.forEach((value) => items.push(value));

  return items
    .map((item) => normalizeCrosswordAscii(item).toLowerCase())
    .filter((item, index, list) => item && list.indexOf(item) === index)
    .slice(0, 6);
};

const buildTraps = (word, synonyms = []) => {
  const normalizedWord = normalizeCrosswordLettersOnly(word).toLowerCase();
  const fragments = new Set();
  if (normalizedWord.length >= 4) {
    fragments.add(normalizedWord);
    fragments.add(normalizedWord.slice(0, Math.min(5, normalizedWord.length)));
    fragments.add(normalizedWord.slice(-Math.min(5, normalizedWord.length)));
  }
  synonyms.forEach((syn) => {
    const normalized = normalizeCrosswordLettersOnly(syn).toLowerCase();
    if (normalized.length >= 4) fragments.add(normalized);
  });
  return [...fragments];
};

export const enrichNormalizedLexiconEntry = (normalized, options = {}) => {
  if (!normalized?.word) return null;

  const profile = resolveCrosswordLocaleProfile(normalized.language);
  const definition = buildDefinitionPayload(normalized, profile.locale);
  const semanticField = options.semanticField || pickFieldFromText(
    `${definition.nuclear} ${normalized.anchor || ""} ${normalized.rawClue || ""}`
  );
  const lexicalDifficulty = scoreLexicalDifficulty({
    ...normalized,
    semanticField
  });
  const synonyms = mergeSynonyms(normalized, options.synonyms || []);
  const collocations = DEFAULT_COLLOCATIONS[profile.locale]?.[semanticField]
    || DEFAULT_COLLOCATIONS[profile.locale]?.generic
    || [];

  const recommendedStrategies = buildRecommendedStrategies(
    normalized.pos || "generic",
    semanticField,
    lexicalDifficulty.band
  );
  const forbiddenStrategies = buildForbiddenStrategies(
    normalized.pos || "generic",
    lexicalDifficulty.band
  );
  const example = buildExampleUsage({
    word: normalized.word,
    field: semanticField,
    locale: profile.locale
  });

  return {
    id: normalized.id,
    source: normalized.source,
    language: profile.locale,
    word: normalized.word,
    lemma: normalized.lemma,
    length: normalized.length,
    pos: normalized.pos || "generic",
    definition: definition.nuclear,
    synonyms,
    example,
    difficulty: lexicalDifficulty.band,
    lexical: {
      frequencyBand: lexicalDifficulty.factors.frequency < 30 ? "high" : "medium_low",
      difficultyModel: lexicalDifficulty,
      polysemyHint: lexicalDifficulty.factors.abstraction > 45 ? "possible_polysemy" : "low_polysemy",
      rawClue: normalized.rawClue
    },
    semantic: {
      coreConcept: definition.nuclear,
      field: semanticField,
      traits: [normalized.pos || "generic", semanticField],
      culturalTags: guessCulturalTags(semanticField, profile.locale),
      anchor: normalized.anchor || ""
    },
    morphology: normalized.morphology,
    lexicalRelations: {
      synonyms,
      antonyms: [],
      collocations,
      examples: [example]
    },
    styleConstraints: {
      recommendedStrategies,
      forbiddenStrategies
    },
    traps: {
      invalidFragments: buildTraps(normalized.word, synonyms),
      forbiddenStrategies
    }
  };
};

export const buildSyntheticLexiconEntry = ({
  word,
  locale,
  definition,
  synonyms = []
}) => {
  const normalized = createSyntheticNormalizedEntry({
    word,
    locale,
    definition,
    synonyms
  });
  if (!normalized) return null;
  return enrichNormalizedLexiconEntry(normalized, { synonyms });
};
