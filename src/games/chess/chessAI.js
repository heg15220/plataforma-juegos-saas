import {
  COLORS,
  PIECES,
  makeMoveForSearch,
  moveToUci,
  toRow,
  toCol
} from "./chessEngine";

const WHITE = COLORS.WHITE;
const BLACK = COLORS.BLACK;

const PIECE_VALUE = {
  [PIECES.PAWN]: 100,
  [PIECES.KNIGHT]: 320,
  [PIECES.BISHOP]: 335,
  [PIECES.ROOK]: 500,
  [PIECES.QUEEN]: 900,
  [PIECES.KING]: 0
};

const MATE_SCORE = 100000;
const MAX_QUIESCENCE_DEPTH = 4;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const colorSign = (pieceColor, rootColor) => (pieceColor === rootColor ? 1 : -1);

const centerControl = (index) => {
  const row = toRow(index);
  const col = toCol(index);
  const rowDist = Math.abs(3.5 - row);
  const colDist = Math.abs(3.5 - col);
  return 3.5 - (rowDist + colDist) / 2;
};

const advancement = (pieceColor, row) => {
  if (pieceColor === WHITE) {
    return 6 - row;
  }
  return row - 1;
};

const kingShelter = (pieceColor, row, col) => {
  const homeRow = pieceColor === WHITE ? 7 : 0;
  const sideBias = Math.min(Math.abs(col - 0), Math.abs(col - 7));
  return (homeRow - Math.abs(homeRow - row)) * 0.8 + sideBias * 0.25;
};

const pieceBonus = (piece, index, endgameWeight) => {
  const row = toRow(index);
  const col = toCol(index);
  const center = centerControl(index);

  if (piece.type === PIECES.PAWN) {
    const adv = advancement(piece.color, row);
    const centralFile = 3.5 - Math.abs(3.5 - col);
    return adv * 8 + centralFile * 3;
  }

  if (piece.type === PIECES.KNIGHT) {
    return center * 18;
  }

  if (piece.type === PIECES.BISHOP) {
    return center * 10 + (3.5 - Math.abs(3.5 - col)) * 2;
  }

  if (piece.type === PIECES.ROOK) {
    const rankPressure = piece.color === WHITE ? (7 - row) : row;
    return rankPressure * 3 + center * 2;
  }

  if (piece.type === PIECES.QUEEN) {
    return center * 6;
  }

  if (piece.type === PIECES.KING) {
    const central = center * 12;
    const shelter = kingShelter(piece.color, row, col) * 10;
    return central * endgameWeight + shelter * (1 - endgameWeight);
  }

  return 0;
};

const terminalScore = (result, rootColor, ply) => {
  if (!result) return null;
  if (result.type === "draw") return 0;
  return result.winner === rootColor ? MATE_SCORE - ply : -MATE_SCORE + ply;
};

const evaluateState = (state, rootColor) => {
  const terminal = terminalScore(state.result, rootColor, 0);
  if (terminal != null) {
    return terminal;
  }

  let score = 0;
  let nonPawnMaterial = 0;

  const bishops = {
    [WHITE]: 0,
    [BLACK]: 0
  };

  state.board.forEach((piece, index) => {
    if (!piece) return;

    const sign = colorSign(piece.color, rootColor);
    const value = PIECE_VALUE[piece.type] || 0;
    score += sign * value;

    if (piece.type !== PIECES.PAWN && piece.type !== PIECES.KING) {
      nonPawnMaterial += value;
    }

    if (piece.type === PIECES.BISHOP) {
      bishops[piece.color] += 1;
    }
  });

  const endgameWeight = clamp((2600 - nonPawnMaterial) / 2600, 0, 1);

  state.board.forEach((piece, index) => {
    if (!piece) return;
    const sign = colorSign(piece.color, rootColor);
    score += sign * pieceBonus(piece, index, endgameWeight);
  });

  if (bishops[WHITE] >= 2) score += rootColor === WHITE ? 28 : -28;
  if (bishops[BLACK] >= 2) score += rootColor === BLACK ? 28 : -28;

  if (state.inCheck) {
    score += state.turn === rootColor ? -20 : 20;
  }

  const mobilitySwing = state.legalMoves.length;
  score += state.turn === rootColor ? mobilitySwing * 1.2 : -mobilitySwing * 1.2;

  return score;
};

const moveOrderingScore = (move) => {
  let score = 0;
  if (move.capture) {
    const captureValue = PIECE_VALUE[move.capture] || 0;
    const attackerValue = PIECE_VALUE[move.piece] || 0;
    score += captureValue * 12 - attackerValue;
  }
  if (move.promotion) {
    score += (PIECE_VALUE[move.promotion] || 0) + 250;
  }
  if (move.isCastle) {
    score += 65;
  }
  if (move.isEnPassant) {
    score += 35;
  }
  return score;
};

const orderMoves = (moves, previousScores) => {
  const scored = moves.map((move) => {
    const key = moveToUci(move);
    const prev = previousScores?.get(key) ?? 0;
    return {
      move,
      score: moveOrderingScore(move) + prev * 0.25
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((entry) => entry.move);
};

const hasTimedOut = (context) =>
  Date.now() >= context.deadline || context.nodes >= context.maxNodes;

const quiescence = (state, alpha, beta, context, ply, depthLeft = MAX_QUIESCENCE_DEPTH) => {
  if (context.aborted) {
    return evaluateState(state, context.rootColor);
  }

  const terminal = terminalScore(state.result, context.rootColor, ply);
  if (terminal != null) {
    return terminal;
  }

  const standPat = evaluateState(state, context.rootColor);
  if (standPat >= beta) {
    return beta;
  }
  if (standPat > alpha) {
    alpha = standPat;
  }

  if (depthLeft <= 0) {
    return alpha;
  }

  const tacticalMoves = state.legalMoves.filter((move) => move.capture || move.promotion);
  if (!tacticalMoves.length) {
    return alpha;
  }

  const ordered = orderMoves(tacticalMoves);
  for (let i = 0; i < ordered.length; i += 1) {
    if (hasTimedOut(context)) {
      context.aborted = true;
      return alpha;
    }

    context.nodes += 1;
    const child = makeMoveForSearch(state, ordered[i]);
    const score = -quiescence(child, -beta, -alpha, context, ply + 1, depthLeft - 1);

    if (score >= beta) {
      return beta;
    }
    if (score > alpha) {
      alpha = score;
    }
  }

  return alpha;
};

const negamax = (state, depth, alpha, beta, context, ply) => {
  if (context.aborted) {
    return evaluateState(state, context.rootColor);
  }

  if (hasTimedOut(context)) {
    context.aborted = true;
    return evaluateState(state, context.rootColor);
  }

  context.nodes += 1;

  const terminal = terminalScore(state.result, context.rootColor, ply);
  if (terminal != null) {
    return terminal;
  }

  if (depth <= 0) {
    return quiescence(state, alpha, beta, context, ply);
  }

  const ordered = orderMoves(state.legalMoves);
  if (!ordered.length) {
    return evaluateState(state, context.rootColor);
  }

  let best = -Infinity;

  for (let i = 0; i < ordered.length; i += 1) {
    if (hasTimedOut(context)) {
      context.aborted = true;
      break;
    }

    const child = makeMoveForSearch(state, ordered[i]);
    const score = -negamax(child, depth - 1, -beta, -alpha, context, ply + 1);

    if (score > best) {
      best = score;
    }

    if (score > alpha) {
      alpha = score;
    }

    if (alpha >= beta) {
      break;
    }
  }

  if (best === -Infinity) {
    return evaluateState(state, context.rootColor);
  }

  return best;
};

export const CHESS_AI_LEVELS = {
  beginner: {
    id: "beginner",
    label: "Principiante",
    depth: 1,
    timeMs: 140,
    maxNodes: 3000,
    randomness: 0.38,
    blunderRate: 0.16,
    topChoices: 6,
    thinkDelayMs: 280
  },
  intermediate: {
    id: "intermediate",
    label: "Intermedio",
    depth: 2,
    timeMs: 360,
    maxNodes: 22000,
    randomness: 0.16,
    blunderRate: 0.05,
    topChoices: 4,
    thinkDelayMs: 430
  },
  advanced: {
    id: "advanced",
    label: "Avanzado",
    depth: 3,
    timeMs: 950,
    maxNodes: 85000,
    randomness: 0.06,
    blunderRate: 0.01,
    topChoices: 3,
    thinkDelayMs: 680
  },
  expert: {
    id: "expert",
    label: "Experto",
    depth: 4,
    timeMs: 1800,
    maxNodes: 240000,
    randomness: 0.02,
    blunderRate: 0,
    topChoices: 2,
    thinkDelayMs: 950
  }
};

const defaultLevel = CHESS_AI_LEVELS.intermediate;

export const getAiLevelById = (levelId) => CHESS_AI_LEVELS[levelId] || defaultLevel;

const pickFromTop = (scoredMoves, config, rng) => {
  const ordered = [...scoredMoves].sort((a, b) => b.score - a.score);
  if (!ordered.length) {
    return null;
  }

  if (rng() < config.blunderRate && ordered.length > 1) {
    const from = Math.min(ordered.length - 1, Math.max(1, config.topChoices));
    return ordered[Math.floor(rng() * (from + 1))].move;
  }

  if (rng() < config.randomness && ordered.length > 1) {
    const count = Math.min(config.topChoices, ordered.length);
    const top = ordered.slice(0, count);
    const bestScore = top[0].score;
    const weights = top.map((entry) => Math.max(1, 30 + bestScore - entry.score));
    const total = weights.reduce((acc, value) => acc + value, 0);
    let roll = rng() * total;
    for (let i = 0; i < top.length; i += 1) {
      roll -= weights[i];
      if (roll <= 0) {
        return top[i].move;
      }
    }
    return top[top.length - 1].move;
  }

  return ordered[0].move;
};

export const chooseAIMove = (state, levelId = "intermediate", rng = Math.random) => {
  const config = getAiLevelById(levelId);
  const legalMoves = state.legalMoves || [];

  if (!legalMoves.length) {
    return null;
  }

  if (legalMoves.length === 1) {
    return legalMoves[0];
  }

  const rootColor = state.turn;
  let scoredBest = legalMoves.map((move) => ({ move, score: 0 }));
  let previousScores = new Map();

  for (let depth = 1; depth <= config.depth; depth += 1) {
    const context = {
      rootColor,
      deadline: Date.now() + config.timeMs,
      maxNodes: config.maxNodes,
      nodes: 0,
      aborted: false
    };

    const orderedRoot = orderMoves(legalMoves, previousScores);
    const layerScores = [];

    let alpha = -Infinity;
    const beta = Infinity;

    for (let i = 0; i < orderedRoot.length; i += 1) {
      if (hasTimedOut(context)) {
        context.aborted = true;
        break;
      }

      const move = orderedRoot[i];
      const child = makeMoveForSearch(state, move);
      const score = -negamax(child, depth - 1, -beta, -alpha, context, 1);
      if (context.aborted) {
        break;
      }

      layerScores.push({ move, score });
      if (score > alpha) {
        alpha = score;
      }
    }

    if (layerScores.length === legalMoves.length && !context.aborted) {
      scoredBest = layerScores;
      previousScores = new Map(layerScores.map((entry) => [moveToUci(entry.move), entry.score]));
    } else {
      break;
    }
  }

  return pickFromTop(scoredBest, config, rng) || legalMoves[0];
};
