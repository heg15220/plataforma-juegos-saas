import { RANK_THRESHOLDS } from "../constants";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function createScoreState() {
  return {
    score: 0,
    combo: 0,
    maxCombo: 0,
    perfects: 0,
    goods: 0,
    misses: 0,
    perfectStreak: 0,
    longestPerfectStreak: 0,
    multiplier: 1,
    damageTaken: 0,
    shiftPerfects: 0,
    burstPerfects: 0,
    lastJudgement: "none",
    lastJudgementTimer: 0,
  };
}

function recalcMultiplier(scoreState) {
  scoreState.multiplier = 1 + Math.floor(scoreState.combo / 6) * 0.12;
  scoreState.multiplier = clamp(scoreState.multiplier, 1, 2.35);
}

export function tickScoreState(scoreState, dt) {
  scoreState.lastJudgementTimer = Math.max(0, scoreState.lastJudgementTimer - dt);
  if (scoreState.lastJudgementTimer === 0 && scoreState.lastJudgement !== "none") {
    scoreState.lastJudgement = "none";
  }
}

export function applyTimingJudgement(scoreState, rating, basePoints, options = {}) {
  const multiplierBoost = options.multiplierBoost ?? 1;
  let points = 0;

  if (rating === "perfect") {
    scoreState.perfects += 1;
    scoreState.combo += 1;
    scoreState.perfectStreak += 1;
    scoreState.longestPerfectStreak = Math.max(scoreState.longestPerfectStreak, scoreState.perfectStreak);
    points = basePoints * 1.45;
  } else if (rating === "good") {
    scoreState.goods += 1;
    scoreState.combo = Math.max(0, scoreState.combo - 1) + 1;
    scoreState.perfectStreak = 0;
    points = basePoints;
  } else {
    scoreState.misses += 1;
    scoreState.combo = Math.max(0, scoreState.combo - 3);
    scoreState.perfectStreak = 0;
    points = basePoints * 0.28;
  }

  recalcMultiplier(scoreState);
  points *= scoreState.multiplier * multiplierBoost;

  scoreState.score += points;
  scoreState.maxCombo = Math.max(scoreState.maxCombo, scoreState.combo);
  scoreState.lastJudgement = rating;
  scoreState.lastJudgementTimer = 0.36;

  return points;
}

export function rewardPickup(scoreState, value = 1) {
  const points = (52 + value * 18) * (1 + scoreState.combo * 0.03) * scoreState.multiplier;
  scoreState.score += points;
  scoreState.combo += 1;
  scoreState.maxCombo = Math.max(scoreState.maxCombo, scoreState.combo);
  recalcMultiplier(scoreState);
  return points;
}

export function rewardBurst(scoreState, rating, inBeatWindow) {
  const points = inBeatWindow ? 260 : 180;
  const bonusMult = rating === "perfect" ? 1.35 : rating === "good" ? 1.15 : 1;
  scoreState.score += points * bonusMult * scoreState.multiplier;
  scoreState.combo += inBeatWindow ? 2 : 1;
  scoreState.maxCombo = Math.max(scoreState.maxCombo, scoreState.combo);
  if (inBeatWindow && rating === "perfect") {
    scoreState.burstPerfects += 1;
  }
  recalcMultiplier(scoreState);
}

export function registerPerfectShift(scoreState) {
  scoreState.shiftPerfects += 1;
  scoreState.score += 140 * scoreState.multiplier;
  scoreState.combo += 1;
  scoreState.maxCombo = Math.max(scoreState.maxCombo, scoreState.combo);
  recalcMultiplier(scoreState);
}

export function registerDamage(scoreState) {
  scoreState.damageTaken += 1;
  scoreState.combo = Math.max(0, scoreState.combo - 4);
  scoreState.perfectStreak = 0;
  recalcMultiplier(scoreState);
}

export function addRuntimeScore(scoreState, dt, speedFactor) {
  const points = (18 + speedFactor * 0.08 + scoreState.combo * 0.35) * dt;
  scoreState.score += points;
}

export function computeAccuracy(scoreState) {
  const attempts = scoreState.perfects + scoreState.goods + scoreState.misses;
  if (!attempts) {
    return 1;
  }
  const weighted = scoreState.perfects + scoreState.goods * 0.66;
  return clamp(weighted / attempts, 0, 1);
}

export function computeRank(scoreState, difficulty) {
  const accuracy = computeAccuracy(scoreState);
  for (const threshold of RANK_THRESHOLDS) {
    if (
      accuracy + (difficulty.rankBias ?? 0) >= threshold.minAccuracy &&
      scoreState.damageTaken <= threshold.maxDamage &&
      scoreState.score >= threshold.minScore
    ) {
      return threshold.rank;
    }
  }
  return "C";
}
