import {
  COLORS,
  makeMoveForSearch,
  oppositeColor,
  toCol,
  toRow
} from "./checkersEngine";

const WHITE = COLORS.WHITE;
const BLACK = COLORS.BLACK;

const PIECE_VALUE = {
  man: 100,
  king: 182
};

const MATE_SCORE = 100000;

const CHECKERS_AI_LEVELS = {
  beginner: {
    id: "beginner",
    label: "Principiante",
    depth: 1,
    timeMs: 80,
    maxNodes: 2800,
    randomness: 0.52,
    blunderRate: 0.2,
    topChoices: 6,
    thinkDelayMs: 420
  },
  intermediate: {
    id: "intermediate",
    label: "Intermedio",
    depth: 3,
    timeMs: 320,
    maxNodes: 25000,
    randomness: 0.2,
    blunderRate: 0.08,
    topChoices: 4,
    thinkDelayMs: 620
  },
  advanced: {
    id: "advanced",
    label: "Avanzado",
    depth: 5,
    timeMs: 980,
    maxNodes: 120000,
    randomness: 0.08,
    blunderRate: 0.02,
    topChoices: 3,
    thinkDelayMs: 820
  },
  expert: {
    id: "expert",
    label: "Experto",
    depth: 6,
    timeMs: 1600,
    maxNodes: 220000,
    randomness: 0.02,
    blunderRate: 0,
    topChoices: 2,
    thinkDelayMs: 960
  }
};

const opposite = oppositeColor;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const centerDistance = (index) => {
  const row = toRow(index);
  const col = toCol(index);
  return Math.abs(row - 3.5) + Math.abs(col - 3.5);
};

const terminalScore = (state, rootColor, ply) => {
  if (!state.result) return null;
  if (state.result.type === "draw") return 0;
  if (state.result.winner === rootColor) return MATE_SCORE - ply;
  return -MATE_SCORE + ply;
};

const evaluateState = (state, rootColor) => {
  const terminal = terminalScore(state, rootColor, 0);
  if (terminal != null) return terminal;

  let score = 0;
  let whitePieces = 0;
  let blackPieces = 0;
  let whiteKings = 0;
  let blackKings = 0;

  for (let index = 0; index < state.board.length; index += 1) {
    const piece = state.board[index];
    if (!piece) continue;

    const sign = piece.color === rootColor ? 1 : -1;
    const baseValue = piece.king ? PIECE_VALUE.king : PIECE_VALUE.man;
    score += sign * baseValue;

    if (piece.color === WHITE) {
      whitePieces += 1;
      if (piece.king) whiteKings += 1;
    } else {
      blackPieces += 1;
      if (piece.king) blackKings += 1;
    }

    const centerBonus = clamp(3.6 - centerDistance(index), -3, 3);
    score += sign * centerBonus * (piece.king ? 7 : 4.5);

    const row = toRow(index);
    const promotionPressure =
      piece.color === WHITE ? (7 - row) : row;
    if (!piece.king) {
      score += sign * promotionPressure * 1.4;
    }
  }

  const materialSkew = (whitePieces - blackPieces) * (rootColor === WHITE ? 1 : -1);
  const kingSkew = (whiteKings - blackKings) * (rootColor === WHITE ? 1 : -1);
  score += materialSkew * 12;
  score += kingSkew * 26;

  const mobility = state.legalMoves.length;
  score += state.turn === rootColor ? mobility * 1.85 : -mobility * 1.85;

  const captures = state.legalMoves.reduce(
    (acc, move) => acc + (move.captureIndex != null ? 1 : 0),
    0
  );
  score += state.turn === rootColor ? captures * 6.2 : -captures * 6.2;

  if (state.forcedPiece != null) {
    score += state.turn === rootColor ? 10 : -10;
  }

  if (state.turnMeta.singlePieceExtraAvailable && !state.turnMeta.extraMoveUsed) {
    score += state.turn === rootColor ? 14 : -14;
  }

  const ownMistakes = state.mistakes[rootColor] || 0;
  const rivalMistakes = state.mistakes[opposite(rootColor)] || 0;
  score += (rivalMistakes - ownMistakes) * 28;

  return score;
};

const moveOrderingScore = (state, move) => {
  let score = 0;
  if (move.captureIndex != null) score += 240;
  if (move.pieceKing) score += 32;

  const piece = state.board[move.from];
  if (piece && !piece.king) {
    const targetRow = toRow(move.to);
    if ((piece.color === WHITE && targetRow === 0) || (piece.color === BLACK && targetRow === 7)) {
      score += 108;
    }
  }
  return score;
};

const orderMoves = (state, moves, previousScores = null) => {
  const entries = moves.map((move) => {
    const key = `${move.from}-${move.to}-${move.captureIndex ?? "-"}`;
    const historyBias = previousScores?.[key] || 0;
    return {
      move,
      score: moveOrderingScore(state, move) + historyBias * 0.18
    };
  });
  entries.sort((a, b) => b.score - a.score);
  return entries.map((entry) => entry.move);
};

const hasTimedOut = (context) =>
  Date.now() >= context.deadline || context.nodes >= context.maxNodes;

const negamax = (state, depth, alpha, beta, context, ply) => {
  if (hasTimedOut(context)) {
    context.aborted = true;
    return evaluateState(state, context.rootColor);
  }

  context.nodes += 1;

  const terminal = terminalScore(state, context.rootColor, ply);
  if (terminal != null) return terminal;

  if (depth <= 0) {
    return evaluateState(state, context.rootColor);
  }

  const moves = state.legalMoves;
  if (!moves.length) {
    return evaluateState(state, context.rootColor);
  }

  const ordered = orderMoves(state, moves);
  let best = -Infinity;

  for (let i = 0; i < ordered.length; i += 1) {
    if (hasTimedOut(context)) {
      context.aborted = true;
      break;
    }

    const child = makeMoveForSearch(state, ordered[i]);
    const score = -negamax(child, depth - 1, -beta, -alpha, context, ply + 1);

    if (score > best) best = score;
    if (score > alpha) alpha = score;
    if (alpha >= beta) break;
  }

  if (best === -Infinity) {
    return evaluateState(state, context.rootColor);
  }

  return best;
};

const evaluateRootMoves = (state, depth, context, previousScores = null) => {
  const ordered = orderMoves(state, state.legalMoves, previousScores);
  let alpha = -Infinity;
  let beta = Infinity;
  let bestScore = -Infinity;
  let bestMoves = [];
  const scoresByMove = {};

  for (let i = 0; i < ordered.length; i += 1) {
    if (hasTimedOut(context)) {
      context.aborted = true;
      break;
    }

    const move = ordered[i];
    const child = makeMoveForSearch(state, move);
    const score = -negamax(child, depth - 1, -beta, -alpha, context, 1);
    const key = `${move.from}-${move.to}-${move.captureIndex ?? "-"}`;
    scoresByMove[key] = score;

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }

    if (score > alpha) alpha = score;
  }

  return {
    aborted: context.aborted,
    bestScore,
    bestMoves,
    scoresByMove
  };
};

const chooseFromTopMoves = (movesWithScore, level) => {
  if (!movesWithScore.length) return null;
  const sorted = [...movesWithScore].sort((a, b) => b.score - a.score);

  if (Math.random() < level.blunderRate) {
    const start = Math.floor(sorted.length / 2);
    const candidates = sorted.slice(start);
    return candidates[Math.floor(Math.random() * candidates.length)]?.move || sorted[0].move;
  }

  const topCount = clamp(level.topChoices, 1, sorted.length);
  const top = sorted.slice(0, topCount);
  if (top.length === 1 || level.randomness <= 0.001) {
    return top[0].move;
  }

  const baseline = top[0].score;
  const spread = 90 + level.randomness * 220;
  const weights = top.map((entry, index) => {
    const normalized = Math.exp((entry.score - baseline) / spread);
    const decay = 1 - index * (level.randomness * 0.11);
    return Math.max(0.01, normalized * Math.max(0.35, decay));
  });
  const sum = weights.reduce((acc, value) => acc + value, 0);
  let roll = Math.random() * sum;
  for (let index = 0; index < top.length; index += 1) {
    roll -= weights[index];
    if (roll <= 0) return top[index].move;
  }
  return top[0].move;
};

export const getAiLevelById = (id) => CHECKERS_AI_LEVELS[id] || CHECKERS_AI_LEVELS.intermediate;

export const chooseAIMove = (state, levelId = "intermediate") => {
  const level = getAiLevelById(levelId);
  const legalMoves = state.legalMoves;
  if (!legalMoves.length) return null;
  if (legalMoves.length === 1) return legalMoves[0];

  const context = {
    rootColor: state.turn,
    deadline: Date.now() + level.timeMs,
    nodes: 0,
    maxNodes: level.maxNodes,
    aborted: false
  };

  let bestSnapshot = null;
  let previousScores = null;
  for (let depth = 1; depth <= level.depth; depth += 1) {
    if (hasTimedOut(context)) {
      context.aborted = true;
      break;
    }
    const result = evaluateRootMoves(state, depth, context, previousScores);
    if (result.bestMoves.length) {
      bestSnapshot = result;
      previousScores = result.scoresByMove;
    }
    if (result.aborted) break;
  }

  if (!bestSnapshot || !bestSnapshot.bestMoves.length) {
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  const scoredMoves = legalMoves.map((move) => {
    const key = `${move.from}-${move.to}-${move.captureIndex ?? "-"}`;
    return {
      move,
      score: previousScores?.[key] ?? -999999
    };
  });

  return chooseFromTopMoves(scoredMoves, level);
};

export { CHECKERS_AI_LEVELS };
