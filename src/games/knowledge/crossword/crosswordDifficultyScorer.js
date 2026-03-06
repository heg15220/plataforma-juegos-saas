const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const difficultyBand = (score) => {
  if (score < 34) return "easy";
  if (score < 58) return "medium";
  return "hard";
};

const scoreFrequency = (entry) => {
  const length = Number(entry?.length || entry?.word?.length || 0);
  if (length <= 6) return 18;
  if (length <= 8) return 42;
  return 74;
};

const scoreAbstraction = (entry) => {
  const definition = String(entry?.baseDefinition || entry?.definition || "").toLowerCase();
  let score = 30;
  if (/\b(teoria|sistema|doctrina|abstr|concept|process|framework)\b/.test(definition)) {
    score += 20;
  }
  if (/\b(objeto|animal|planta|tool|place|person)\b/.test(definition)) {
    score -= 12;
  }
  return clamp(score, 10, 80);
};

const scoreCulturalFamiliarity = (entry) => {
  const field = String(entry?.semanticField || "").toLowerCase();
  if (!field || field === "generic") return 34;
  if (["science", "culture", "society", "education"].includes(field)) return 42;
  if (["technology", "language"].includes(field)) return 48;
  return 38;
};

const scoreMorphologicalTransparency = (entry) => {
  const morphology = entry?.morphology || {};
  let score = 46;
  if (morphology.transparentVerbEnding || morphology.transparentAdverbEnding) {
    score -= 11;
  }
  if (morphology.transparentNounEnding) {
    score -= 6;
  }
  if ((morphology.prefix || "").length && (morphology.suffix || "").length) {
    score += 2;
  }
  return clamp(score, 12, 76);
};

export const scoreLexicalDifficulty = (entry) => {
  const factors = {
    frequency: scoreFrequency(entry),
    abstraction: scoreAbstraction(entry),
    cultural: scoreCulturalFamiliarity(entry),
    morphology: scoreMorphologicalTransparency(entry)
  };

  const weighted = (
    factors.frequency * 0.3
    + factors.abstraction * 0.28
    + factors.cultural * 0.2
    + factors.morphology * 0.22
  );
  const score = clamp(Math.round(weighted), 0, 100);

  return {
    score,
    band: difficultyBand(score),
    factors
  };
};

export const scoreClueDifficulty = ({
  lexicalDifficulty,
  strategyComplexity = 45,
  inferenceLoad = 45,
  ambiguityControl = 45
}) => {
  const lexical = Number(lexicalDifficulty || 0);
  const score = clamp(Math.round(
    lexical * 0.42
      + strategyComplexity * 0.28
      + inferenceLoad * 0.2
      + ambiguityControl * 0.1
  ), 0, 100);

  return {
    score,
    band: difficultyBand(score)
  };
};
