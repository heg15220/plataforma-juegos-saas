export const COLORS = {
  WHITE: "w",
  BLACK: "b"
};

export const BLOCKED_RULES = {
  LOSE: "lose",
  DRAW: "draw",
  MATERIAL: "material"
};

const WHITE = COLORS.WHITE;
const BLACK = COLORS.BLACK;

const DIAGONAL_DIRECTIONS = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1]
];

const DEFAULT_NO_CAPTURE_PLY = 80;

export const DEFAULT_SETTINGS = {
  captureMandatory: false,
  kingCapturePriority: true,
  extraMoveSinglePiece: true,
  maxMistakes: 3,
  blockedRule: BLOCKED_RULES.LOSE,
  drawNoCapturePly: DEFAULT_NO_CAPTURE_PLY,
  repetitionLimit: 3
};

export const oppositeColor = (color) => (color === WHITE ? BLACK : WHITE);

export const isInsideBoard = (row, col) => row >= 0 && row < 8 && col >= 0 && col < 8;
export const isDarkSquare = (row, col) => (row + col) % 2 === 1;
export const toIndex = (row, col) => row * 8 + col;
export const toRow = (index) => Math.floor(index / 8);
export const toCol = (index) => index % 8;

export const indexToSquare = (index) => {
  const file = String.fromCharCode(97 + toCol(index));
  const rank = String(8 - toRow(index));
  return `${file}${rank}`;
};

const clampPositiveInt = (value, fallback) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.floor(numeric));
};

const normalizeSettings = (input = {}) => {
  const blockedRuleValues = Object.values(BLOCKED_RULES);
  const blockedRule = blockedRuleValues.includes(input.blockedRule)
    ? input.blockedRule
    : DEFAULT_SETTINGS.blockedRule;

  const maxMistakes = Math.max(1, clampPositiveInt(input.maxMistakes, DEFAULT_SETTINGS.maxMistakes));
  const drawNoCapturePly = Math.max(
    10,
    clampPositiveInt(input.drawNoCapturePly, DEFAULT_SETTINGS.drawNoCapturePly)
  );
  const repetitionLimit = Math.max(
    2,
    clampPositiveInt(input.repetitionLimit, DEFAULT_SETTINGS.repetitionLimit)
  );

  return {
    captureMandatory: Boolean(input.captureMandatory ?? DEFAULT_SETTINGS.captureMandatory),
    kingCapturePriority: Boolean(input.kingCapturePriority ?? DEFAULT_SETTINGS.kingCapturePriority),
    extraMoveSinglePiece: Boolean(input.extraMoveSinglePiece ?? DEFAULT_SETTINGS.extraMoveSinglePiece),
    maxMistakes,
    blockedRule,
    drawNoCapturePly,
    repetitionLimit
  };
};

const createEmptyBoard = () => Array(64).fill(null);

const cloneBoard = (board) =>
  board.map((piece) => (piece ? { color: piece.color, king: Boolean(piece.king) } : null));

const createInitialBoard = () => {
  const board = createEmptyBoard();
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      if (!isDarkSquare(row, col)) continue;
      const index = toIndex(row, col);
      if (row <= 2) {
        board[index] = { color: BLACK, king: false };
      } else if (row >= 5) {
        board[index] = { color: WHITE, king: false };
      }
    }
  }
  return board;
};

const countPieces = (board, color) => {
  let total = 0;
  for (let index = 0; index < board.length; index += 1) {
    const piece = board[index];
    if (piece && piece.color === color) total += 1;
  }
  return total;
};

const countKings = (board, color) => {
  let total = 0;
  for (let index = 0; index < board.length; index += 1) {
    const piece = board[index];
    if (piece && piece.color === color && piece.king) total += 1;
  }
  return total;
};

const createTurnMeta = (board, turn, settings) => ({
  singlePieceExtraAvailable: Boolean(settings.extraMoveSinglePiece && countPieces(board, turn) === 1),
  extraMoveUsed: false
});

const pieceSymbol = (piece) => {
  if (!piece) return ".";
  if (piece.color === WHITE) return piece.king ? "W" : "w";
  return piece.king ? "B" : "b";
};

const buildPositionKey = (state) => {
  let boardKey = "";
  for (let index = 0; index < state.board.length; index += 1) {
    boardKey += pieceSymbol(state.board[index]);
  }
  const forced = state.forcedPiece == null ? "-" : String(state.forcedPiece);
  const extra = state.turnMeta.extraMoveUsed ? "1" : "0";
  return `${boardKey}|t:${state.turn}|f:${forced}|x:${extra}`;
};

const buildBaseState = (settings) => {
  const board = createInitialBoard();
  const base = {
    board,
    turn: WHITE,
    forcedPiece: null,
    legalMoves: [],
    noCapturePly: 0,
    mistakes: {
      [WHITE]: 0,
      [BLACK]: 0
    },
    moveHistory: [],
    lastMove: null,
    result: null,
    statusText: "",
    turnMeta: createTurnMeta(board, WHITE, settings),
    settings,
    positionCounts: {}
  };
  const key = buildPositionKey(base);
  base.positionCounts[key] = 1;
  return base;
};

const sanitizePiece = (piece) => {
  if (!piece) return null;
  if (piece.color !== WHITE && piece.color !== BLACK) return null;
  return {
    color: piece.color,
    king: Boolean(piece.king)
  };
};

const normalizeBoardInput = (boardInput) => {
  if (!Array.isArray(boardInput) || boardInput.length !== 64) {
    return createInitialBoard();
  }
  const board = createEmptyBoard();
  for (let index = 0; index < 64; index += 1) {
    board[index] = sanitizePiece(boardInput[index]);
  }
  return board;
};

const pushPositionCount = (state) => {
  const key = buildPositionKey(state);
  const updated = { ...state.positionCounts };
  const count = (updated[key] || 0) + 1;
  updated[key] = count;
  state.positionCounts = updated;
  return count;
};

const pieceCanPromote = (piece, row) => {
  if (!piece || piece.king) return false;
  if (piece.color === WHITE) return row === 0;
  return row === 7;
};

const generateMovesForPiece = (board, from, piece, options = {}) => {
  const capturesOnly = Boolean(options.capturesOnly);
  const moves = [];
  const row = toRow(from);
  const col = toCol(from);

  for (const [dr, dc] of DIAGONAL_DIRECTIONS) {
    const nearRow = row + dr;
    const nearCol = col + dc;
    if (!isInsideBoard(nearRow, nearCol)) continue;

    const nearIndex = toIndex(nearRow, nearCol);
    const nearPiece = board[nearIndex];
    if (!capturesOnly && !nearPiece) {
      moves.push({
        from,
        to: nearIndex,
        captureIndex: null,
        pieceColor: piece.color,
        pieceKing: piece.king
      });
    }

    const landingRow = row + dr * 2;
    const landingCol = col + dc * 2;
    if (!isInsideBoard(landingRow, landingCol)) continue;

    const landingIndex = toIndex(landingRow, landingCol);
    const landingPiece = board[landingIndex];
    if (
      nearPiece &&
      nearPiece.color !== piece.color &&
      !landingPiece
    ) {
      moves.push({
        from,
        to: landingIndex,
        captureIndex: nearIndex,
        pieceColor: piece.color,
        pieceKing: piece.king
      });
    }
  }

  if (capturesOnly) {
    return moves.filter((move) => move.captureIndex != null);
  }
  return moves;
};

const computeLegalMoves = (state, color = state.turn) => {
  if (state.result) return [];

  if (state.forcedPiece != null) {
    const piece = state.board[state.forcedPiece];
    if (!piece || piece.color !== color) return [];
    return generateMovesForPiece(state.board, state.forcedPiece, piece, { capturesOnly: true });
  }

  const normalMoves = [];
  const captureMoves = [];
  const kingCaptureMoves = [];

  for (let index = 0; index < state.board.length; index += 1) {
    const piece = state.board[index];
    if (!piece || piece.color !== color) continue;
    const pieceMoves = generateMovesForPiece(state.board, index, piece);
    for (const move of pieceMoves) {
      if (move.captureIndex == null) {
        normalMoves.push(move);
      } else {
        captureMoves.push(move);
        if (piece.king) {
          kingCaptureMoves.push(move);
        }
      }
    }
  }

  const prioritizedCaptures =
    state.settings.kingCapturePriority && kingCaptureMoves.length > 0
      ? kingCaptureMoves
      : captureMoves;

  if (state.settings.captureMandatory && prioritizedCaptures.length) {
    return prioritizedCaptures;
  }

  return [...normalMoves, ...prioritizedCaptures];
};

const resolveBlockedResult = (state, blockedColor) => {
  const opponent = oppositeColor(blockedColor);
  if (state.settings.blockedRule === BLOCKED_RULES.DRAW) {
    return {
      type: "draw",
      reason: "blocked_draw"
    };
  }

  if (state.settings.blockedRule === BLOCKED_RULES.MATERIAL) {
    const blockedPieces = countPieces(state.board, blockedColor);
    const opponentPieces = countPieces(state.board, opponent);
    if (blockedPieces !== opponentPieces) {
      return {
        type: "win",
        winner: blockedPieces > opponentPieces ? blockedColor : opponent,
        reason: "blocked_material"
      };
    }
    const blockedKings = countKings(state.board, blockedColor);
    const opponentKings = countKings(state.board, opponent);
    if (blockedKings !== opponentKings) {
      return {
        type: "win",
        winner: blockedKings > opponentKings ? blockedColor : opponent,
        reason: "blocked_material_kings"
      };
    }
    return {
      type: "draw",
      reason: "blocked_draw_equal_material"
    };
  }

  return {
    type: "win",
    winner: opponent,
    reason: "blocked"
  };
};

const formatResultStatus = (result) => {
  if (!result) return "";

  if (result.type === "draw") {
    const drawReason = {
      blocked_draw: "Tablas por bloqueo.",
      blocked_draw_equal_material: "Tablas por bloqueo con material equivalente.",
      no_capture_limit: "Tablas por demasiados turnos sin captura.",
      threefold_repetition: "Tablas por triple repeticion de posicion."
    };
    return drawReason[result.reason] || "Tablas.";
  }

  const winnerText = result.winner === WHITE ? "blancas" : "negras";
  const winReason = {
    no_pieces: "sin piezas rivales.",
    blocked: "por bloqueo del rival.",
    blocked_material: "por regla material en bloqueo.",
    blocked_material_kings: "por regla material y damas en bloqueo.",
    mistakes_limit: "por limite de errores del rival.",
    resign: "por rendicion rival."
  };
  return `Ganan las ${winnerText} ${winReason[result.reason] || ""}`.trim();
};

const finalizeStatusText = (state, options = {}) => {
  if (state.result) {
    state.statusText = formatResultStatus(state.result);
    return;
  }

  if (options.messageOverride) {
    state.statusText = options.messageOverride;
    return;
  }

  if (state.forcedPiece != null) {
    state.statusText = "Cadena de captura activa: continua con la misma ficha.";
    return;
  }

  const turnText = state.turn === WHITE ? "blancas" : "negras";
  state.statusText = `Turno de ${turnText}.`;
};

const runTerminalChecks = (state, options = {}) => {
  if (state.result) {
    finalizeStatusText(state, options);
    return state;
  }

  const whitePieces = countPieces(state.board, WHITE);
  const blackPieces = countPieces(state.board, BLACK);
  if (!whitePieces || !blackPieces) {
    state.result = {
      type: "win",
      winner: whitePieces ? WHITE : BLACK,
      reason: "no_pieces"
    };
    finalizeStatusText(state, options);
    return state;
  }

  if (state.noCapturePly >= state.settings.drawNoCapturePly) {
    state.result = {
      type: "draw",
      reason: "no_capture_limit"
    };
    finalizeStatusText(state, options);
    return state;
  }

  const repetitionCount = pushPositionCount(state);
  if (repetitionCount >= state.settings.repetitionLimit) {
    state.result = {
      type: "draw",
      reason: "threefold_repetition"
    };
    finalizeStatusText(state, options);
    return state;
  }

  if (!state.legalMoves.length) {
    state.result = resolveBlockedResult(state, state.turn);
    finalizeStatusText(state, options);
    return state;
  }

  finalizeStatusText(state, options);
  return state;
};

const buildMoveNotation = (move, promoted, chainContinues, extraGranted) => {
  const from = indexToSquare(move.from);
  const to = indexToSquare(move.to);
  let notation = `${from}${move.captureIndex != null ? "x" : "-"}${to}`;
  if (promoted) notation += "=D";
  if (chainContinues) notation += "!";
  if (extraGranted) notation += "+";
  return notation;
};

const cloneStateForMutation = (state) => ({
  ...state,
  board: cloneBoard(state.board),
  legalMoves: state.legalMoves.slice(),
  moveHistory: state.moveHistory.slice(),
  mistakes: { ...state.mistakes },
  turnMeta: { ...state.turnMeta },
  settings: { ...state.settings },
  positionCounts: { ...state.positionCounts }
});

export const createInitialCheckersState = (settingsInput = {}) => {
  const settings = normalizeSettings(settingsInput);
  const base = buildBaseState(settings);
  base.legalMoves = computeLegalMoves(base, base.turn);
  return runTerminalChecks(base);
};

export const createCheckersStateFromConfig = (config = {}) => {
  const settings = normalizeSettings(config.settings || {});
  const board = normalizeBoardInput(config.board);
  const turn = config.turn === BLACK ? BLACK : WHITE;
  const forcedPiece = Number.isInteger(config.forcedPiece) ? config.forcedPiece : null;

  const state = {
    board,
    turn,
    forcedPiece,
    legalMoves: [],
    noCapturePly: clampPositiveInt(config.noCapturePly, 0),
    mistakes: {
      [WHITE]: clampPositiveInt(config.mistakes?.[WHITE], 0),
      [BLACK]: clampPositiveInt(config.mistakes?.[BLACK], 0)
    },
    moveHistory: Array.isArray(config.moveHistory)
      ? config.moveHistory.map((entry) => ({ ...entry }))
      : [],
    lastMove: config.lastMove ? { ...config.lastMove } : null,
    result: config.result ? { ...config.result } : null,
    statusText: "",
    turnMeta: config.turnMeta
      ? {
        singlePieceExtraAvailable: Boolean(config.turnMeta.singlePieceExtraAvailable),
        extraMoveUsed: Boolean(config.turnMeta.extraMoveUsed)
      }
      : createTurnMeta(board, turn, settings),
    settings,
    positionCounts: {}
  };

  if (config.positionCounts && typeof config.positionCounts === "object") {
    state.positionCounts = { ...config.positionCounts };
  } else {
    const key = buildPositionKey(state);
    state.positionCounts[key] = 1;
  }

  state.legalMoves = computeLegalMoves(state, state.turn);
  return runTerminalChecks(state);
};

export const cloneCheckersState = (state) => ({
  ...state,
  board: cloneBoard(state.board),
  legalMoves: state.legalMoves.map((move) => ({ ...move })),
  moveHistory: state.moveHistory.map((entry) => ({ ...entry })),
  mistakes: { ...state.mistakes },
  turnMeta: { ...state.turnMeta },
  settings: { ...state.settings },
  positionCounts: { ...state.positionCounts }
});

export const getPieceSummary = (board) => {
  const summary = {
    [WHITE]: { pieces: 0, kings: 0, men: 0 },
    [BLACK]: { pieces: 0, kings: 0, men: 0 }
  };
  for (let index = 0; index < board.length; index += 1) {
    const piece = board[index];
    if (!piece) continue;
    summary[piece.color].pieces += 1;
    if (piece.king) summary[piece.color].kings += 1;
    else summary[piece.color].men += 1;
  }
  return summary;
};

export const findLegalMove = (state, from, to, captureIndex = undefined) => {
  return state.legalMoves.find((move) => {
    if (move.from !== from || move.to !== to) return false;
    if (captureIndex === undefined) return true;
    return move.captureIndex === captureIndex;
  }) || null;
};

const normalizeMove = (state, move) => {
  if (!move) return null;
  if (typeof move.from !== "number" || typeof move.to !== "number") return null;
  const captureIndex = Number.isInteger(move.captureIndex) ? move.captureIndex : undefined;
  return findLegalMove(state, move.from, move.to, captureIndex);
};

export const makeMove = (state, move, options = {}) => {
  if (!state || state.result) return state;
  const legalMove = normalizeMove(state, move);
  if (!legalMove) return state;

  const forSearch = Boolean(options.forSearch);
  const next = cloneStateForMutation(state);
  const movingColor = state.turn;
  const movingPiece = next.board[legalMove.from];
  if (!movingPiece || movingPiece.color !== movingColor) {
    return state;
  }

  next.board[legalMove.from] = null;
  if (legalMove.captureIndex != null) {
    next.board[legalMove.captureIndex] = null;
  }
  next.board[legalMove.to] = movingPiece;

  const targetRow = toRow(legalMove.to);
  const promoted = pieceCanPromote(movingPiece, targetRow);
  if (promoted) {
    movingPiece.king = true;
  }

  next.noCapturePly = legalMove.captureIndex != null ? 0 : state.noCapturePly + 1;
  next.lastMove = {
    from: legalMove.from,
    to: legalMove.to,
    captureIndex: legalMove.captureIndex,
    color: movingColor,
    promoted
  };

  const enemyPieces = countPieces(next.board, oppositeColor(movingColor));
  if (!enemyPieces) {
    next.forcedPiece = null;
    next.legalMoves = [];
    next.result = {
      type: "win",
      winner: movingColor,
      reason: "no_pieces"
    };
    const notation = buildMoveNotation(legalMove, promoted, false, false);
    next.moveHistory.push({
      ply: next.moveHistory.length + 1,
      turn: movingColor,
      from: legalMove.from,
      to: legalMove.to,
      captureIndex: legalMove.captureIndex,
      promoted,
      notation
    });
    return runTerminalChecks(next);
  }

  let chainContinues = false;
  let extraGranted = false;

  if (legalMove.captureIndex != null) {
    const continuationMoves = generateMovesForPiece(next.board, legalMove.to, movingPiece, {
      capturesOnly: true
    });
    if (continuationMoves.length) {
      next.turn = movingColor;
      next.forcedPiece = legalMove.to;
      next.legalMoves = continuationMoves;
      chainContinues = true;
    }
  }

  if (!chainContinues) {
    next.forcedPiece = null;
    const canUseExtraMove =
      next.settings.extraMoveSinglePiece &&
      next.turnMeta.singlePieceExtraAvailable &&
      !next.turnMeta.extraMoveUsed &&
      countPieces(next.board, movingColor) === 1;

    if (canUseExtraMove) {
      next.turn = movingColor;
      next.turnMeta = {
        ...next.turnMeta,
        extraMoveUsed: true
      };
      next.legalMoves = computeLegalMoves(next, movingColor);
      if (next.legalMoves.length) {
        extraGranted = true;
      }
    }

    if (!extraGranted) {
      const nextTurn = oppositeColor(movingColor);
      next.turn = nextTurn;
      next.turnMeta = createTurnMeta(next.board, nextTurn, next.settings);
      next.legalMoves = computeLegalMoves(next, nextTurn);
    }
  }

  const notation = buildMoveNotation(legalMove, promoted, chainContinues, extraGranted);
  next.moveHistory.push({
    ply: next.moveHistory.length + 1,
    turn: movingColor,
    from: legalMove.from,
    to: legalMove.to,
    captureIndex: legalMove.captureIndex,
    promoted,
    chainContinues,
    extraGranted,
    notation
  });

  const override = chainContinues
    ? "Cadena de captura activa: continua con la misma ficha."
    : extraGranted
      ? "Solo queda una ficha: dispones de movimiento extra."
      : null;

  if (forSearch) {
    return runTerminalChecks(next, { messageOverride: override });
  }

  return runTerminalChecks(next, { messageOverride: override });
};

export const makeMoveForSearch = (state, move) => makeMove(state, move, { forSearch: true });

export const applyMistake = (state, color) => {
  if (!state || state.result) return state;
  if (color !== WHITE && color !== BLACK) return state;

  const next = cloneStateForMutation(state);
  const previous = next.mistakes[color] || 0;
  const updated = previous + 1;
  next.mistakes[color] = updated;

  if (updated >= next.settings.maxMistakes) {
    next.result = {
      type: "win",
      winner: oppositeColor(color),
      reason: "mistakes_limit",
      loser: color
    };
    next.legalMoves = [];
    finalizeStatusText(next);
    return next;
  }

  const turnText = next.turn === WHITE ? "blancas" : "negras";
  next.statusText = `Error registrado para ${color === WHITE ? "blancas" : "negras"} (${updated}/${next.settings.maxMistakes}). Turno de ${turnText}.`;
  return next;
};

export const resignPlayer = (state, color) => {
  if (!state || state.result) return state;
  if (color !== WHITE && color !== BLACK) return state;

  const next = cloneStateForMutation(state);
  next.result = {
    type: "win",
    winner: oppositeColor(color),
    reason: "resign",
    loser: color
  };
  next.legalMoves = [];
  finalizeStatusText(next);
  return next;
};

export const summarizeLegalMoves = (moves) => {
  return moves.map((move) => ({
    from: move.from,
    to: move.to,
    captureIndex: move.captureIndex,
    fromSquare: indexToSquare(move.from),
    toSquare: indexToSquare(move.to)
  }));
};
