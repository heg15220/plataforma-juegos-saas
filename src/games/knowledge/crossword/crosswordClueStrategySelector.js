import { resolveCrosswordLocaleProfile } from "./crosswordLocaleProfiles.js";

export const CROSSWORD_CLUE_TAXONOMY = Object.freeze({
  direct_definition_elegant: Object.freeze({
    label: "Definicion directa elegante",
    goodForPos: ["noun", "verb", "adjective", "generic"],
    complexity: 20
  }),
  indirect_definition: Object.freeze({
    label: "Definicion indirecta",
    goodForPos: ["noun", "verb", "adjective", "adverb", "generic"],
    complexity: 34
  }),
  contextual_synonym: Object.freeze({
    label: "Sinonimo contextual",
    goodForPos: ["noun", "verb", "adjective"],
    complexity: 42
  }),
  antonym_contrast: Object.freeze({
    label: "Contraste conceptual",
    goodForPos: ["adjective", "adverb", "noun"],
    complexity: 58
  }),
  descriptive_periphrasis: Object.freeze({
    label: "Perifrasis descriptiva",
    goodForPos: ["noun", "adjective", "generic"],
    complexity: 36
  }),
  cultural_reference_light: Object.freeze({
    label: "Referencia cultural ligera",
    goodForPos: ["noun", "adjective", "generic"],
    complexity: 55
  }),
  incomplete_idiom: Object.freeze({
    label: "Frase hecha incompleta",
    goodForPos: ["noun", "verb"],
    complexity: 62
  }),
  frequent_collocation: Object.freeze({
    label: "Colocacion frecuente",
    goodForPos: ["noun", "verb", "adjective"],
    complexity: 31
  }),
  situational_prompt: Object.freeze({
    label: "Pista situacional",
    goodForPos: ["verb", "noun", "adverb", "generic"],
    complexity: 29
  }),
  functional_use: Object.freeze({
    label: "Funcion o uso",
    goodForPos: ["verb", "noun", "generic"],
    complexity: 24
  }),
  metaphorical_image: Object.freeze({
    label: "Pista metaforica",
    goodForPos: ["noun", "adjective", "generic"],
    complexity: 70
  }),
  register_marker: Object.freeze({
    label: "Registro linguistico",
    goodForPos: ["adjective", "noun", "generic"],
    complexity: 66
  }),
  distinctive_trait: Object.freeze({
    label: "Rasgo distintivo",
    goodForPos: ["adjective", "noun", "generic"],
    complexity: 41
  }),
  encyclopedic_light: Object.freeze({
    label: "Enciclopedica ligera",
    goodForPos: ["noun", "generic"],
    complexity: 51
  }),
  morphosyntactic_hint: Object.freeze({
    label: "Morfosintactica",
    goodForPos: ["verb", "adverb", "adjective", "noun"],
    complexity: 44
  }),
  elliptical_hint: Object.freeze({
    label: "Elipsis",
    goodForPos: ["noun", "adjective", "generic"],
    complexity: 74
  }),
  subtle_humor: Object.freeze({
    label: "Humor sutil",
    goodForPos: ["noun", "adjective", "verb"],
    complexity: 63
  }),
  literary_association: Object.freeze({
    label: "Asociacion literaria",
    goodForPos: ["noun", "adjective", "generic"],
    complexity: 72
  }),
  controlled_ambiguity: Object.freeze({
    label: "Ambiguedad controlada",
    goodForPos: ["noun", "adjective", "adverb", "generic"],
    complexity: 68
  }),
  didactic_school: Object.freeze({
    label: "Escolar didactica",
    goodForPos: ["noun", "verb", "adjective", "generic"],
    complexity: 22
  }),
  lexicographic_humanized: Object.freeze({
    label: "Definidor humanizado",
    goodForPos: ["noun", "verb", "adjective", "adverb", "generic"],
    complexity: 28
  })
});

const hashText = (text) => {
  const safe = String(text || "");
  let hash = 2166136261;
  for (let index = 0; index < safe.length; index += 1) {
    hash ^= safe.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const seededNoise = (seedKey, strategyId) =>
  (hashText(`${seedKey}::${strategyId}`) % 1000) / 1000;

const difficultyTarget = (difficulty) => {
  if (difficulty === "easy") return 28;
  if (difficulty === "hard") return 66;
  return 46;
};

export const createClueDiversityContext = () => ({
  strategyUsage: new Map(),
  syntaxUsage: new Map(),
  fieldUsage: new Map(),
  clueUsage: new Map(),
  recentCluesByWord: new Map(),
  emittedCount: 0
});

export const selectClueStrategies = ({
  entry,
  locale,
  targetDifficulty,
  seedKey,
  context,
  limit = 6
}) => {
  const profile = resolveCrosswordLocaleProfile(locale);
  const safeDifficulty = targetDifficulty || entry?.difficulty || "medium";
  const recommended = new Set(entry?.styleConstraints?.recommendedStrategies || []);
  const forbidden = new Set(entry?.styleConstraints?.forbiddenStrategies || []);
  const field = entry?.semantic?.field || "generic";

  const pool = profile.difficultyStrategies[safeDifficulty] || profile.difficultyStrategies.medium || [];
  const taxonomyEntries = Object.entries(CROSSWORD_CLUE_TAXONOMY)
    .filter(([id, data]) => {
      if (forbidden.has(id)) return false;
      return (data.goodForPos || []).includes(entry?.pos || "generic");
    })
    .map(([id, data]) => ({ id, ...data }));

  const ranked = taxonomyEntries.map((strategy) => {
    const usagePenalty = Number(context?.strategyUsage?.get(strategy.id) || 0) * 8;
    const fieldPenalty = Number(context?.fieldUsage?.get(field) || 0) * 2.5;
    const recommendationBonus = recommended.has(strategy.id) ? 20 : 0;
    const localPoolBonus = pool.includes(strategy.id) ? 12 : -6;
    const complexityDistance = Math.abs(strategy.complexity - difficultyTarget(safeDifficulty));
    const complexityScore = Math.max(0, 30 - complexityDistance);
    const noise = seededNoise(seedKey, strategy.id) * 6;

    const score = (
      30
      + recommendationBonus
      + localPoolBonus
      + complexityScore
      - usagePenalty
      - fieldPenalty
      + noise
    );

    return {
      id: strategy.id,
      label: strategy.label,
      complexity: strategy.complexity,
      score
    };
  });

  const fallbackSorted = ranked
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.max(1, limit));

  if (!fallbackSorted.length) {
    return [
      {
        id: "lexicographic_humanized",
        label: CROSSWORD_CLUE_TAXONOMY.lexicographic_humanized.label,
        complexity: CROSSWORD_CLUE_TAXONOMY.lexicographic_humanized.complexity,
        score: 1
      }
    ];
  }

  return fallbackSorted;
};
