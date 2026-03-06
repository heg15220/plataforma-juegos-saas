import { applyEditorialPolish } from "./crosswordEditorialRules.js";
import { scoreClueDifficulty } from "./crosswordDifficultyScorer.js";
import {
  createClueDiversityContext,
  selectClueStrategies
} from "./crosswordClueStrategySelector.js";
import { generateTemplateCandidates } from "./crosswordClueTemplateEngine.js";
import {
  buildForbiddenFragments,
  evaluateClueQuality
} from "./crosswordClueQualityValidator.js";
import {
  buildSyntaxSignature,
  expandClueVariations
} from "./crosswordClueVariationEngine.js";
import {
  normalizeCrosswordAscii,
  normalizeCrosswordLettersOnly
} from "./crosswordLexiconNormalizer.js";

const FALLBACK_CLUE = Object.freeze({
  es: "Definicion breve y natural de uso comun.",
  en: "Brief and natural common-usage definition."
});

const STRATEGY_COMPLEXITY = Object.freeze({
  direct_definition_elegant: 22,
  indirect_definition: 35,
  contextual_synonym: 44,
  antonym_contrast: 58,
  descriptive_periphrasis: 39,
  cultural_reference_light: 55,
  incomplete_idiom: 62,
  frequent_collocation: 33,
  situational_prompt: 31,
  functional_use: 25,
  metaphorical_image: 72,
  register_marker: 63,
  distinctive_trait: 40,
  encyclopedic_light: 53,
  morphosyntactic_hint: 46,
  elliptical_hint: 76,
  subtle_humor: 67,
  literary_association: 71,
  controlled_ambiguity: 68,
  didactic_school: 24,
  lexicographic_humanized: 28
});

const inferenceLoadByStrategy = (strategyId) => {
  if (["direct_definition_elegant", "didactic_school", "functional_use"].includes(strategyId)) return 25;
  if (["indirect_definition", "descriptive_periphrasis", "frequent_collocation"].includes(strategyId)) return 46;
  if (["controlled_ambiguity", "elliptical_hint", "literary_association", "metaphorical_image"].includes(strategyId)) return 72;
  return 55;
};

const ambiguityByStrategy = (strategyId) => {
  if (strategyId === "controlled_ambiguity") return 74;
  if (["elliptical_hint", "metaphorical_image"].includes(strategyId)) return 66;
  if (["direct_definition_elegant", "didactic_school"].includes(strategyId)) return 22;
  return 48;
};

const normalizeDifficulty = (value) => {
  if (value === "easy" || value === "hard") return value;
  return "medium";
};

const safeLocale = (value) =>
  String(value || "en").toLowerCase().startsWith("es") ? "es" : "en";

const dedupeCandidatePool = (items) => {
  const seen = new Set();
  const deduped = [];
  items.forEach((item) => {
    const key = normalizeCrosswordAscii(item?.clue || "").toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    deduped.push(item);
  });
  return deduped;
};

const diversityPenalty = ({ context, strategyId, syntaxSignature, field, clue, word }) => {
  if (!context) return 0;
  let penalty = 0;
  const normalizedClue = normalizeCrosswordAscii(clue).toLowerCase();

  penalty += (Number(context.strategyUsage.get(strategyId) || 0) * 6);
  penalty += (Number(context.syntaxUsage.get(syntaxSignature) || 0) * 4);
  penalty += (Number(context.fieldUsage.get(field) || 0) * 2.5);
  penalty += (Number(context.clueUsage.get(normalizedClue) || 0) * 32);

  const normalizedWord = normalizeCrosswordLettersOnly(word).toLowerCase();
  const recentClues = context.recentCluesByWord.get(normalizedWord) || new Set();
  if (recentClues.has(normalizedClue)) {
    penalty += 40;
  }

  return penalty;
};

const updateDiversityContext = ({
  context,
  strategyId,
  syntaxSignature,
  field,
  word,
  clue
}) => {
  if (!context) return;
  const normalizedClue = normalizeCrosswordAscii(clue).toLowerCase();
  context.strategyUsage.set(strategyId, (context.strategyUsage.get(strategyId) || 0) + 1);
  context.syntaxUsage.set(syntaxSignature, (context.syntaxUsage.get(syntaxSignature) || 0) + 1);
  context.fieldUsage.set(field, (context.fieldUsage.get(field) || 0) + 1);
  context.clueUsage.set(
    normalizedClue,
    (context.clueUsage.get(normalizedClue) || 0) + 1
  );

  const normalizedWord = normalizeCrosswordLettersOnly(word).toLowerCase();
  const recentClues = context.recentCluesByWord.get(normalizedWord) || new Set();
  recentClues.add(normalizedClue);
  if (recentClues.size > 6) {
    const trimmed = [...recentClues].slice(-6);
    context.recentCluesByWord.set(normalizedWord, new Set(trimmed));
  } else {
    context.recentCluesByWord.set(normalizedWord, recentClues);
  }

  context.emittedCount += 1;
};

const fallbackClue = (locale, wordLength) => (
  locale === "es"
    ? `Definicion breve de ${wordLength} letras.`
    : `Brief ${wordLength}-letter definition.`
);

const buildCandidatePool = ({
  entry,
  locale,
  seedKey,
  targetDifficulty,
  context
}) => {
  const strategies = selectClueStrategies({
    entry,
    locale,
    targetDifficulty,
    seedKey,
    context
  });

  const pool = [];
  strategies.forEach((strategy, strategyIndex) => {
    const rawCandidates = generateTemplateCandidates({
      entry,
      strategyId: strategy.id,
      locale,
      seedKey: `${seedKey}:${strategy.id}:${strategyIndex}`
    });
    const variants = expandClueVariations({
      candidates: rawCandidates,
      locale,
      seedKey: `${seedKey}:${strategy.id}:variants`
    });

    variants.forEach((clue) => {
      pool.push({
        strategyId: strategy.id,
        clue: applyEditorialPolish(clue, locale),
        strategyComplexity: STRATEGY_COMPLEXITY[strategy.id] || 45
      });
    });
  });

  return dedupeCandidatePool(pool);
};

export const generateClueForEntry = ({
  entry,
  locale,
  seedKey,
  targetDifficulty,
  context
}) => {
  const localeKey = safeLocale(locale || entry?.language);
  const difficulty = normalizeDifficulty(targetDifficulty || entry?.difficulty || "medium");
  const generationContext = context || createClueDiversityContext();
  const candidatePool = buildCandidatePool({
    entry,
    locale: localeKey,
    seedKey,
    targetDifficulty: difficulty,
    context: generationContext
  });

  const forbiddenFragments = buildForbiddenFragments({
    answer: entry?.word,
    locale: localeKey,
    extraFragments: entry?.traps?.invalidFragments || []
  });

  const scored = candidatePool.map((candidate) => {
    const quality = evaluateClueQuality({
      clue: candidate.clue,
      answer: entry?.word,
      locale: localeKey,
      difficulty,
      extraForbiddenFragments: forbiddenFragments,
      strategyId: candidate.strategyId
    });

    const lexicalDifficultyScore = Number(entry?.lexical?.difficultyModel?.score || 45);
    const difficultyModel = scoreClueDifficulty({
      lexicalDifficulty: lexicalDifficultyScore,
      strategyComplexity: candidate.strategyComplexity,
      inferenceLoad: inferenceLoadByStrategy(candidate.strategyId),
      ambiguityControl: ambiguityByStrategy(candidate.strategyId)
    });

    const syntaxSignature = buildSyntaxSignature(candidate.clue, localeKey);
    const diversity = diversityPenalty({
      context: generationContext,
      strategyId: candidate.strategyId,
      syntaxSignature,
      field: entry?.semantic?.field || "generic",
      clue: candidate.clue,
      word: entry?.word
    });

    const finalScore = quality.score - diversity;
    return {
      ...candidate,
      quality,
      difficultyModel,
      syntaxSignature,
      diversityPenalty: diversity,
      finalScore
    };
  });

  const accepted = scored
    .filter((item) => !item.quality.hardFailReasons.length && item.finalScore >= 72)
    .sort((left, right) => right.finalScore - left.finalScore);
  const ranked = scored.slice().sort((left, right) => right.finalScore - left.finalScore);
  const picked = accepted[0] || ranked[0];

  if (!picked) {
    const clue = applyEditorialPolish(
      fallbackClue(localeKey, entry?.word?.length || 0) || FALLBACK_CLUE[localeKey],
      localeKey
    );
    return {
      clue,
      strategy: "lexicographic_humanized",
      difficulty,
      qualityScore: 50,
      quality: evaluateClueQuality({
        clue,
        answer: entry?.word,
        locale: localeKey,
        difficulty
      }),
      candidatesConsidered: 0
    };
  }

  updateDiversityContext({
    context: generationContext,
    strategyId: picked.strategyId,
    syntaxSignature: picked.syntaxSignature,
    field: entry?.semantic?.field || "generic",
    word: entry?.word,
    clue: picked.clue
  });

  return {
    clue: picked.quality.clue,
    strategy: picked.strategyId,
    difficulty: picked.difficultyModel.band || difficulty,
    qualityScore: Math.max(0, Math.round(picked.finalScore)),
    quality: picked.quality,
    candidatesConsidered: scored.length
  };
};

export {
  createClueDiversityContext
};
