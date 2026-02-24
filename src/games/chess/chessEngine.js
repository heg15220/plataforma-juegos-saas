
export const COLORS = {
  WHITE: "w",
  BLACK: "b"
};

const WHITE = COLORS.WHITE;
const BLACK = COLORS.BLACK;

export const PIECES = {
  PAWN: "p",
  KNIGHT: "n",
  BISHOP: "b",
  ROOK: "r",
  QUEEN: "q",
  KING: "k"
};

const FILES = "abcdefgh";
const RANKS = "12345678";
const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const PROMOTION_PIECES = [PIECES.QUEEN, PIECES.ROOK, PIECES.BISHOP, PIECES.KNIGHT];

const SAN_LETTER = {
  [PIECES.KING]: "R",
  [PIECES.QUEEN]: "D",
  [PIECES.ROOK]: "T",
  [PIECES.BISHOP]: "A",
  [PIECES.KNIGHT]: "C",
  [PIECES.PAWN]: ""
};

const COLOR_NAMES = {
  [WHITE]: "blancas",
  [BLACK]: "negras"
};

const KNIGHT_OFFSETS = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1]
];

const KING_OFFSETS = [
  [-1, -1], [-1, 0], [-1, 1], [0, -1],
  [0, 1], [1, -1], [1, 0], [1, 1]
];

const BISHOP_DIRECTIONS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const ROOK_DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

const oppositeColor = (color) => (color === WHITE ? BLACK : WHITE);

export const isInsideBoard = (row, col) => row >= 0 && row < 8 && col >= 0 && col < 8;
export const toIndex = (row, col) => row * 8 + col;
export const toRow = (index) => Math.floor(index / 8);
export const toCol = (index) => index % 8;

export const indexToSquare = (index) => `${FILES[toCol(index)]}${8 - toRow(index)}`;

export const squareToIndex = (square) => {
  if (typeof square !== "string" || square.length !== 2) {
    return null;
  }
  const file = FILES.indexOf(square[0].toLowerCase());
  const rank = RANKS.indexOf(square[1]);
  if (file < 0 || rank < 0) {
    return null;
  }
  return toIndex(7 - rank, file);
};

const createEmptyBoard = () => Array(64).fill(null);

const cloneCastling = (castling) => ({
  wK: Boolean(castling?.wK),
  wQ: Boolean(castling?.wQ),
  bK: Boolean(castling?.bK),
  bQ: Boolean(castling?.bQ)
});

const clonePositionCounts = (counts) => {
  const result = {};
  Object.keys(counts || {}).forEach((key) => {
    result[key] = counts[key];
  });
  return result;
};

const cloneStateForSearch = (state) => ({
  board: state.board.slice(),
  kingPos: { ...state.kingPos },
  turn: state.turn,
  castling: cloneCastling(state.castling),
  enPassant: state.enPassant,
  halfmoveClock: state.halfmoveClock,
  fullmoveNumber: state.fullmoveNumber,
  legalMoves: [],
  inCheck: false,
  result: null,
  drawClaims: { threefold: false, fiftyMove: false },
  moveHistory: [],
  positionCounts: {},
  lastMove: state.lastMove || null,
  statusText: ""
});

const parsePiece = (char) => {
  const lower = char.toLowerCase();
  if (!Object.values(PIECES).includes(lower)) {
    return null;
  }
  return {
    type: lower,
    color: char === lower ? BLACK : WHITE
  };
};

const pieceToFen = (piece) => {
  const symbol = piece.type;
  return piece.color === WHITE ? symbol.toUpperCase() : symbol;
};

const buildFenPlacement = (board) => {
  const rows = [];
  for (let row = 0; row < 8; row += 1) {
    let line = "";
    let empty = 0;
    for (let col = 0; col < 8; col += 1) {
      const piece = board[toIndex(row, col)];
      if (!piece) {
        empty += 1;
      } else {
        if (empty) {
          line += String(empty);
          empty = 0;
        }
        line += pieceToFen(piece);
      }
    }
    if (empty) {
      line += String(empty);
    }
    rows.push(line);
  }
  return rows.join("/");
};

const buildCastlingField = (castling) => {
  let field = "";
  if (castling.wK) field += "K";
  if (castling.wQ) field += "Q";
  if (castling.bK) field += "k";
  if (castling.bQ) field += "q";
  return field || "-";
};

const buildPositionKey = (state) => {
  const placement = buildFenPlacement(state.board);
  const turn = state.turn;
  const castling = buildCastlingField(state.castling);
  const enPassant = state.enPassant == null ? "-" : indexToSquare(state.enPassant);
  return `${placement} ${turn} ${castling} ${enPassant}`;
};

export const exportFen = (state) => {
  const placement = buildFenPlacement(state.board);
  const turn = state.turn;
  const castling = buildCastlingField(state.castling);
  const enPassant = state.enPassant == null ? "-" : indexToSquare(state.enPassant);
  const halfmove = Number.isFinite(state.halfmoveClock) ? Math.max(0, Math.floor(state.halfmoveClock)) : 0;
  const fullmove = Number.isFinite(state.fullmoveNumber) ? Math.max(1, Math.floor(state.fullmoveNumber)) : 1;
  return `${placement} ${turn} ${castling} ${enPassant} ${halfmove} ${fullmove}`;
};

const buildBoardFromPlacement = (placement) => {
  const board = createEmptyBoard();
  const kingPos = { w: null, b: null };
  const rows = placement.split("/");
  if (rows.length !== 8) {
    throw new Error("FEN invalido: filas incorrectas");
  }

  rows.forEach((line, row) => {
    let col = 0;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (/^[1-8]$/.test(char)) {
        col += Number(char);
      } else {
        const piece = parsePiece(char);
        if (!piece) {
          throw new Error(`FEN invalido: pieza desconocida '${char}'`);
        }
        if (col > 7) {
          throw new Error("FEN invalido: columnas fuera de rango");
        }
        const square = toIndex(row, col);
        board[square] = piece;
        if (piece.type === PIECES.KING) {
          kingPos[piece.color] = square;
        }
        col += 1;
      }
    }
    if (col !== 8) {
      throw new Error("FEN invalido: fila incompleta");
    }
  });

  if (kingPos.w == null || kingPos.b == null) {
    throw new Error("FEN invalido: falta algun rey");
  }

  return { board, kingPos };
};

const parseCastling = (field) => ({
  wK: field.includes("K"),
  wQ: field.includes("Q"),
  bK: field.includes("k"),
  bQ: field.includes("q")
});

const statusTextFor = (state) => {
  if (state.result) {
    if (state.result.type === "draw") {
      const map = {
        stalemate: "Tablas por ahogado.",
        insufficient_material: "Tablas por material insuficiente.",
        threefold_repetition: "Tablas por triple repeticion (reclamada).",
        fivefold_repetition: "Tablas por quintuple repeticion.",
        fifty_move_rule: "Tablas por regla de 50 movimientos (reclamada).",
        seventy_five_move_rule: "Tablas por regla de 75 movimientos."
      };
      return map[state.result.reason] || "Tablas.";
    }
    return `Jaque mate. Ganan las ${COLOR_NAMES[state.result.winner] || "blancas"}.`;
  }
  if (state.inCheck) {
    return `Jaque a ${state.turn === WHITE ? "blancas" : "negras"}.`;
  }
  return `Turno de ${state.turn === WHITE ? "blancas" : "negras"}.`;
};

const createBaseState = ({
  board,
  kingPos,
  turn,
  castling,
  enPassant,
  halfmoveClock,
  fullmoveNumber
}) => ({
  board,
  kingPos,
  turn,
  castling,
  enPassant,
  halfmoveClock,
  fullmoveNumber,
  legalMoves: [],
  inCheck: false,
  result: null,
  drawClaims: { threefold: false, fiftyMove: false },
  moveHistory: [],
  positionCounts: {},
  lastMove: null,
  statusText: ""
});

export const createChessStateFromFen = (fen, options = {}) => {
  const source = typeof fen === "string" && fen.trim() ? fen.trim() : START_FEN;
  const fields = source.split(/\s+/);
  if (fields.length < 4) {
    throw new Error("FEN invalido: campos insuficientes");
  }

  const [placement, rawTurn, castlingField, enPassantField, halfmoveField, fullmoveField] = fields;
  const { board, kingPos } = buildBoardFromPlacement(placement);
  const turn = rawTurn === BLACK ? BLACK : WHITE;
  const castling = parseCastling(castlingField === "-" ? "" : castlingField);
  const enPassant = enPassantField === "-" ? null : squareToIndex(enPassantField);
  const halfmoveClock = Number.isFinite(Number(halfmoveField)) ? Math.max(0, Math.floor(Number(halfmoveField))) : 0;
  const fullmoveNumber = Number.isFinite(Number(fullmoveField)) ? Math.max(1, Math.floor(Number(fullmoveField))) : 1;

  const state = createBaseState({
    board,
    kingPos,
    turn,
    castling,
    enPassant,
    halfmoveClock,
    fullmoveNumber
  });

  finalizeState(state, {
    forSearch: Boolean(options.forSearch),
    updatePositionCount: !options.forSearch
  });

  if (!options.forSearch) {
    state.moveHistory = [];
    state.lastMove = null;
  }

  return state;
};

export const createInitialChessState = () => createChessStateFromFen(START_FEN);

const getPieceAt = (board, index) => board[index] || null;

const isSquareAttackedOnBoard = (board, square, byColor) => {
  const row = toRow(square);
  const col = toCol(square);

  const pawnRow = row + (byColor === WHITE ? 1 : -1);
  if (pawnRow >= 0 && pawnRow < 8) {
    const left = col - 1;
    const right = col + 1;
    if (left >= 0) {
      const piece = getPieceAt(board, toIndex(pawnRow, left));
      if (piece && piece.color === byColor && piece.type === PIECES.PAWN) {
        return true;
      }
    }
    if (right < 8) {
      const piece = getPieceAt(board, toIndex(pawnRow, right));
      if (piece && piece.color === byColor && piece.type === PIECES.PAWN) {
        return true;
      }
    }
  }

  for (const [dRow, dCol] of KNIGHT_OFFSETS) {
    const nRow = row + dRow;
    const nCol = col + dCol;
    if (!isInsideBoard(nRow, nCol)) continue;
    const piece = getPieceAt(board, toIndex(nRow, nCol));
    if (piece && piece.color === byColor && piece.type === PIECES.KNIGHT) {
      return true;
    }
  }

  for (const [dRow, dCol] of BISHOP_DIRECTIONS) {
    let nRow = row + dRow;
    let nCol = col + dCol;
    while (isInsideBoard(nRow, nCol)) {
      const piece = getPieceAt(board, toIndex(nRow, nCol));
      if (piece) {
        if (piece.color === byColor && (piece.type === PIECES.BISHOP || piece.type === PIECES.QUEEN)) {
          return true;
        }
        break;
      }
      nRow += dRow;
      nCol += dCol;
    }
  }

  for (const [dRow, dCol] of ROOK_DIRECTIONS) {
    let nRow = row + dRow;
    let nCol = col + dCol;
    while (isInsideBoard(nRow, nCol)) {
      const piece = getPieceAt(board, toIndex(nRow, nCol));
      if (piece) {
        if (piece.color === byColor && (piece.type === PIECES.ROOK || piece.type === PIECES.QUEEN)) {
          return true;
        }
        break;
      }
      nRow += dRow;
      nCol += dCol;
    }
  }

  for (const [dRow, dCol] of KING_OFFSETS) {
    const nRow = row + dRow;
    const nCol = col + dCol;
    if (!isInsideBoard(nRow, nCol)) continue;
    const piece = getPieceAt(board, toIndex(nRow, nCol));
    if (piece && piece.color === byColor && piece.type === PIECES.KING) {
      return true;
    }
  }

  return false;
};

export const isSquareAttacked = (state, square, byColor) =>
  isSquareAttackedOnBoard(state.board, square, byColor);

const castlingMap = {
  w: {
    kingStart: squareToIndex("e1"),
    kingSide: {
      to: squareToIndex("g1"),
      rookFrom: squareToIndex("h1"),
      rookTo: squareToIndex("f1"),
      empty: [squareToIndex("f1"), squareToIndex("g1")],
      safe: [squareToIndex("e1"), squareToIndex("f1"), squareToIndex("g1")]
    },
    queenSide: {
      to: squareToIndex("c1"),
      rookFrom: squareToIndex("a1"),
      rookTo: squareToIndex("d1"),
      empty: [squareToIndex("d1"), squareToIndex("c1"), squareToIndex("b1")],
      safe: [squareToIndex("e1"), squareToIndex("d1"), squareToIndex("c1")]
    }
  },
  b: {
    kingStart: squareToIndex("e8"),
    kingSide: {
      to: squareToIndex("g8"),
      rookFrom: squareToIndex("h8"),
      rookTo: squareToIndex("f8"),
      empty: [squareToIndex("f8"), squareToIndex("g8")],
      safe: [squareToIndex("e8"), squareToIndex("f8"), squareToIndex("g8")]
    },
    queenSide: {
      to: squareToIndex("c8"),
      rookFrom: squareToIndex("a8"),
      rookTo: squareToIndex("d8"),
      empty: [squareToIndex("d8"), squareToIndex("c8"), squareToIndex("b8")],
      safe: [squareToIndex("e8"), squareToIndex("d8"), squareToIndex("c8")]
    }
  }
};

const canCastle = (state, color, side) => {
  const map = castlingMap[color][side];
  const king = state.board[castlingMap[color].kingStart];
  if (!king || king.type !== PIECES.KING || king.color !== color) return false;
  const rook = state.board[map.rookFrom];
  if (!rook || rook.type !== PIECES.ROOK || rook.color !== color) return false;
  if (!map.empty.every((square) => !state.board[square])) return false;
  const enemy = oppositeColor(color);
  if (map.safe.some((square) => isSquareAttacked(state, square, enemy))) return false;
  return true;
};

const pseudoPawnMoves = (state, from, piece, moves) => {
  const row = toRow(from);
  const col = toCol(from);
  const dir = piece.color === WHITE ? -1 : 1;
  const startRow = piece.color === WHITE ? 6 : 1;
  const promotionRow = piece.color === WHITE ? 0 : 7;

  const oneRow = row + dir;
  if (isInsideBoard(oneRow, col)) {
    const one = toIndex(oneRow, col);
    if (!state.board[one]) {
      if (oneRow === promotionRow) {
        PROMOTION_PIECES.forEach((promotion) => {
          moves.push({ from, to: one, piece: piece.type, color: piece.color, promotion });
        });
      } else {
        moves.push({ from, to: one, piece: piece.type, color: piece.color });
      }

      const twoRow = row + dir * 2;
      if (row === startRow && isInsideBoard(twoRow, col)) {
        const two = toIndex(twoRow, col);
        if (!state.board[two]) {
          moves.push({
            from,
            to: two,
            piece: piece.type,
            color: piece.color,
            isDoublePawn: true
          });
        }
      }
    }
  }

  [-1, 1].forEach((stepCol) => {
    const tRow = row + dir;
    const tCol = col + stepCol;
    if (!isInsideBoard(tRow, tCol)) return;
    const to = toIndex(tRow, tCol);
    const target = state.board[to];
    if (target && target.color !== piece.color) {
      if (tRow === promotionRow) {
        PROMOTION_PIECES.forEach((promotion) => {
          moves.push({
            from,
            to,
            piece: piece.type,
            color: piece.color,
            capture: target.type,
            promotion
          });
        });
      } else {
        moves.push({
          from,
          to,
          piece: piece.type,
          color: piece.color,
          capture: target.type
        });
      }
      return;
    }

    if (state.enPassant != null && to === state.enPassant) {
      const captureIndex = toIndex(row, tCol);
      const captured = state.board[captureIndex];
      if (captured && captured.type === PIECES.PAWN && captured.color !== piece.color) {
        moves.push({
          from,
          to,
          piece: piece.type,
          color: piece.color,
          capture: PIECES.PAWN,
          isEnPassant: true,
          captureIndex
        });
      }
    }
  });
};

const pseudoKnightMoves = (state, from, piece, moves) => {
  const row = toRow(from);
  const col = toCol(from);
  KNIGHT_OFFSETS.forEach(([dRow, dCol]) => {
    const tRow = row + dRow;
    const tCol = col + dCol;
    if (!isInsideBoard(tRow, tCol)) return;
    const to = toIndex(tRow, tCol);
    const target = state.board[to];
    if (!target) {
      moves.push({ from, to, piece: piece.type, color: piece.color });
    } else if (target.color !== piece.color) {
      moves.push({
        from,
        to,
        piece: piece.type,
        color: piece.color,
        capture: target.type
      });
    }
  });
};

const pseudoSlidingMoves = (state, from, piece, dirs, moves) => {
  const row = toRow(from);
  const col = toCol(from);
  dirs.forEach(([dRow, dCol]) => {
    let tRow = row + dRow;
    let tCol = col + dCol;
    while (isInsideBoard(tRow, tCol)) {
      const to = toIndex(tRow, tCol);
      const target = state.board[to];
      if (!target) {
        moves.push({ from, to, piece: piece.type, color: piece.color });
      } else {
        if (target.color !== piece.color) {
          moves.push({
            from,
            to,
            piece: piece.type,
            color: piece.color,
            capture: target.type
          });
        }
        break;
      }
      tRow += dRow;
      tCol += dCol;
    }
  });
};

const pseudoKingMoves = (state, from, piece, moves) => {
  const row = toRow(from);
  const col = toCol(from);
  KING_OFFSETS.forEach(([dRow, dCol]) => {
    const tRow = row + dRow;
    const tCol = col + dCol;
    if (!isInsideBoard(tRow, tCol)) return;
    const to = toIndex(tRow, tCol);
    const target = state.board[to];
    if (!target) {
      moves.push({ from, to, piece: piece.type, color: piece.color });
    } else if (target.color !== piece.color) {
      moves.push({
        from,
        to,
        piece: piece.type,
        color: piece.color,
        capture: target.type
      });
    }
  });

  if (piece.color === WHITE) {
    if (state.castling.wK && canCastle(state, WHITE, "kingSide")) {
      moves.push({
        from,
        to: castlingMap.w.kingSide.to,
        piece: piece.type,
        color: piece.color,
        isCastle: "K"
      });
    }
    if (state.castling.wQ && canCastle(state, WHITE, "queenSide")) {
      moves.push({
        from,
        to: castlingMap.w.queenSide.to,
        piece: piece.type,
        color: piece.color,
        isCastle: "Q"
      });
    }
  } else {
    if (state.castling.bK && canCastle(state, BLACK, "kingSide")) {
      moves.push({
        from,
        to: castlingMap.b.kingSide.to,
        piece: piece.type,
        color: piece.color,
        isCastle: "K"
      });
    }
    if (state.castling.bQ && canCastle(state, BLACK, "queenSide")) {
      moves.push({
        from,
        to: castlingMap.b.queenSide.to,
        piece: piece.type,
        color: piece.color,
        isCastle: "Q"
      });
    }
  }
};

const generatePseudoMoves = (state, color) => {
  const moves = [];
  for (let from = 0; from < 64; from += 1) {
    const piece = state.board[from];
    if (!piece || piece.color !== color) continue;
    if (piece.type === PIECES.PAWN) {
      pseudoPawnMoves(state, from, piece, moves);
    } else if (piece.type === PIECES.KNIGHT) {
      pseudoKnightMoves(state, from, piece, moves);
    } else if (piece.type === PIECES.BISHOP) {
      pseudoSlidingMoves(state, from, piece, BISHOP_DIRECTIONS, moves);
    } else if (piece.type === PIECES.ROOK) {
      pseudoSlidingMoves(state, from, piece, ROOK_DIRECTIONS, moves);
    } else if (piece.type === PIECES.QUEEN) {
      pseudoSlidingMoves(state, from, piece, [...BISHOP_DIRECTIONS, ...ROOK_DIRECTIONS], moves);
    } else if (piece.type === PIECES.KING) {
      pseudoKingMoves(state, from, piece, moves);
    }
  }
  return moves;
};

const applyToBoard = (board, move) => {
  const nextBoard = board.slice();
  const movingPiece = nextBoard[move.from];
  if (!movingPiece) {
    return {
      board: nextBoard,
      movingPiece: null,
      capturedPiece: null,
      captureIndex: null
    };
  }

  nextBoard[move.from] = null;

  let captureIndex = null;
  let capturedPiece = null;
  if (move.isEnPassant) {
    captureIndex = move.captureIndex != null ? move.captureIndex : toIndex(toRow(move.from), toCol(move.to));
    capturedPiece = nextBoard[captureIndex];
    nextBoard[captureIndex] = null;
  } else {
    captureIndex = move.to;
    capturedPiece = nextBoard[captureIndex];
  }

  if (move.isCastle) {
    if (movingPiece.color === WHITE) {
      const map = move.isCastle === "K" ? castlingMap.w.kingSide : castlingMap.w.queenSide;
      const rook = nextBoard[map.rookFrom];
      nextBoard[map.rookFrom] = null;
      nextBoard[map.rookTo] = rook;
    } else {
      const map = move.isCastle === "K" ? castlingMap.b.kingSide : castlingMap.b.queenSide;
      const rook = nextBoard[map.rookFrom];
      nextBoard[map.rookFrom] = null;
      nextBoard[map.rookTo] = rook;
    }
  }

  nextBoard[move.to] = move.promotion
    ? { type: move.promotion, color: movingPiece.color }
    : movingPiece;

  return {
    board: nextBoard,
    movingPiece,
    capturedPiece,
    captureIndex
  };
};

const isLegalPseudoMove = (state, move, color) => {
  const simulation = applyToBoard(state.board, move);
  if (!simulation.movingPiece) return false;
  const kingSquare = simulation.movingPiece.type === PIECES.KING
    ? move.to
    : state.kingPos[color];
  return !isSquareAttackedOnBoard(simulation.board, kingSquare, oppositeColor(color));
};

export const generateLegalMoves = (state, color = state.turn) => {
  const pseudo = generatePseudoMoves(state, color);
  const legal = [];
  pseudo.forEach((move) => {
    if (isLegalPseudoMove(state, move, color)) {
      legal.push(move);
    }
  });
  return legal;
};

const squareColor = (index) => (toRow(index) + toCol(index)) % 2;

const isInsufficientMaterial = (board) => {
  const material = {
    w: { bishops: [], knights: 0, heavyOrPawn: 0 },
    b: { bishops: [], knights: 0, heavyOrPawn: 0 }
  };

  board.forEach((piece, index) => {
    if (!piece || piece.type === PIECES.KING) return;
    const side = material[piece.color];
    if (piece.type === PIECES.PAWN || piece.type === PIECES.ROOK || piece.type === PIECES.QUEEN) {
      side.heavyOrPawn += 1;
      return;
    }
    if (piece.type === PIECES.BISHOP) {
      side.bishops.push(squareColor(index));
      return;
    }
    if (piece.type === PIECES.KNIGHT) {
      side.knights += 1;
    }
  });

  if (material.w.heavyOrPawn || material.b.heavyOrPawn) {
    return false;
  }

  const wB = material.w.bishops.length;
  const bB = material.b.bishops.length;
  const wN = material.w.knights;
  const bN = material.b.knights;
  const totalMinors = wB + bB + wN + bN;

  if (totalMinors === 0) return true;
  if (totalMinors === 1) return true;

  if (totalMinors === 2 && wB === 1 && bB === 1 && wN === 0 && bN === 0) {
    return material.w.bishops[0] === material.b.bishops[0];
  }

  if (totalMinors === 2 && wN === 2 && bN === 0 && wB === 0 && bB === 0) return true;
  if (totalMinors === 2 && bN === 2 && wN === 0 && wB === 0 && bB === 0) return true;

  if (totalMinors === 2 && wB === 2 && bB === 0 && wN === 0 && bN === 0) {
    return material.w.bishops[0] === material.w.bishops[1];
  }
  if (totalMinors === 2 && bB === 2 && wB === 0 && wN === 0 && bN === 0) {
    return material.b.bishops[0] === material.b.bishops[1];
  }

  return false;
};

const addPositionCount = (state) => {
  const key = buildPositionKey(state);
  const count = (state.positionCounts[key] || 0) + 1;
  state.positionCounts[key] = count;
  state.currentPositionKey = key;
  state.currentPositionCount = count;
};

const setDrawClaims = (state) => {
  state.drawClaims = {
    threefold: (state.currentPositionCount || 0) >= 3,
    fiftyMove: state.halfmoveClock >= 100
  };
};

const buildResult = (type, reason, winner = null) => ({ type, reason, winner });

const finalizeState = (state, options = {}) => {
  state.legalMoves = generateLegalMoves(state, state.turn);
  state.inCheck = isSquareAttacked(state, state.kingPos[state.turn], oppositeColor(state.turn));
  state.result = null;

  if (!state.legalMoves.length) {
    state.result = state.inCheck
      ? buildResult("win", "checkmate", oppositeColor(state.turn))
      : buildResult("draw", "stalemate");
  }

  if (!state.result && isInsufficientMaterial(state.board)) {
    state.result = buildResult("draw", "insufficient_material");
  }

  if (!options.forSearch && options.updatePositionCount !== false) {
    addPositionCount(state);
    setDrawClaims(state);
    if (!state.result && state.currentPositionCount >= 5) {
      state.result = buildResult("draw", "fivefold_repetition");
    }
    if (!state.result && state.halfmoveClock >= 150) {
      state.result = buildResult("draw", "seventy_five_move_rule");
    }
  } else {
    state.drawClaims = { threefold: false, fiftyMove: false };
  }

  state.statusText = statusTextFor(state);
  return state;
};

const updateCastlingRights = (castling, move, movingPiece, capturedPiece) => {
  const next = cloneCastling(castling);

  if (movingPiece.type === PIECES.KING) {
    if (movingPiece.color === WHITE) {
      next.wK = false;
      next.wQ = false;
    } else {
      next.bK = false;
      next.bQ = false;
    }
  }

  if (movingPiece.type === PIECES.ROOK) {
    if (move.from === squareToIndex("a1")) next.wQ = false;
    if (move.from === squareToIndex("h1")) next.wK = false;
    if (move.from === squareToIndex("a8")) next.bQ = false;
    if (move.from === squareToIndex("h8")) next.bK = false;
  }

  if (capturedPiece && capturedPiece.type === PIECES.ROOK) {
    if (move.to === squareToIndex("a1")) next.wQ = false;
    if (move.to === squareToIndex("h1")) next.wK = false;
    if (move.to === squareToIndex("a8")) next.bQ = false;
    if (move.to === squareToIndex("h8")) next.bK = false;
  }

  return next;
};

const normalizeMove = (move) => {
  if (!move || typeof move !== "object") return null;
  const from = typeof move.from === "number" ? move.from : squareToIndex(move.from);
  const to = typeof move.to === "number" ? move.to : squareToIndex(move.to);
  if (from == null || to == null) return null;
  const promotion = move.promotion ? String(move.promotion).toLowerCase() : undefined;
  return { from, to, promotion };
};

const sameMove = (a, b) =>
  a.from === b.from &&
  a.to === b.to &&
  (a.promotion || "") === (b.promotion || "");

const selectLegalMove = (state, move) => {
  const normalized = normalizeMove(move);
  if (!normalized) return null;
  const legalMoves = state.legalMoves?.length ? state.legalMoves : generateLegalMoves(state, state.turn);
  return legalMoves.find((candidate) => sameMove(candidate, normalized)) || null;
};

const fileLabel = (square) => FILES[toCol(square)];
const rankLabel = (square) => String(8 - toRow(square));

const resolveDisambiguation = (stateBefore, move) => {
  if (move.piece === PIECES.PAWN || move.piece === PIECES.KING) return "";
  const legalMoves = stateBefore.legalMoves?.length
    ? stateBefore.legalMoves
    : generateLegalMoves(stateBefore, stateBefore.turn);
  const alternatives = legalMoves.filter((candidate) =>
    candidate !== move &&
    candidate.piece === move.piece &&
    candidate.to === move.to &&
    candidate.from !== move.from
  );
  if (!alternatives.length) return "";
  const sameFile = alternatives.some((candidate) => fileLabel(candidate.from) === fileLabel(move.from));
  const sameRank = alternatives.some((candidate) => rankLabel(candidate.from) === rankLabel(move.from));
  if (!sameFile) return fileLabel(move.from);
  if (!sameRank) return rankLabel(move.from);
  return `${fileLabel(move.from)}${rankLabel(move.from)}`;
};

const buildSan = (stateBefore, move, stateAfter) => {
  if (move.isCastle) {
    const base = move.isCastle === "K" ? "0-0" : "0-0-0";
    if (stateAfter.result?.reason === "checkmate" && stateAfter.result.winner === move.color) return `${base}#`;
    if (stateAfter.inCheck) return `${base}+`;
    return base;
  }

  const capture = Boolean(move.capture || move.isEnPassant);
  let san = "";

  if (move.piece === PIECES.PAWN) {
    if (capture) {
      san += fileLabel(move.from);
    }
  } else {
    san += SAN_LETTER[move.piece] || "";
    san += resolveDisambiguation(stateBefore, move);
  }

  if (capture) san += "x";
  san += indexToSquare(move.to);
  if (move.promotion) {
    san += `=${SAN_LETTER[move.promotion] || "D"}`;
  }

  if (stateAfter.result?.reason === "checkmate" && stateAfter.result.winner === move.color) san += "#";
  else if (stateAfter.inCheck) san += "+";

  return san;
};

const deriveMoveNumberLabel = (historyLength, color) => {
  const number = Math.floor(historyLength / 2) + 1;
  return color === WHITE ? `${number}.` : `${number}...`;
};

const nextEnPassantSquare = (move) => {
  if (!move.isDoublePawn) return null;
  const direction = move.color === WHITE ? -1 : 1;
  return toIndex(toRow(move.from) + direction, toCol(move.from));
};

const appendMoveEntry = (stateBefore, stateAfter, move, san) => {
  const entry = {
    ply: stateBefore.moveHistory.length + 1,
    moveNumber: deriveMoveNumberLabel(stateBefore.moveHistory.length, move.color),
    color: move.color,
    san,
    uci: moveToUci(move),
    from: move.from,
    to: move.to,
    fromSquare: indexToSquare(move.from),
    toSquare: indexToSquare(move.to),
    piece: move.piece,
    capture: move.capture || null,
    promotion: move.promotion || null,
    isCastle: move.isCastle || null,
    isEnPassant: Boolean(move.isEnPassant),
    check: stateAfter.inCheck,
    mate: stateAfter.result?.reason === "checkmate"
  };
  stateAfter.moveHistory = [...stateBefore.moveHistory, entry];
  stateAfter.lastMove = {
    from: move.from,
    to: move.to,
    san: entry.san,
    uci: entry.uci,
    color: move.color,
    piece: move.piece,
    capture: move.capture || null,
    promotion: move.promotion || null
  };
};

const applyLegalMoveInternal = (state, legalMove, options = {}) => {
  const applied = applyToBoard(state.board, legalMove);
  if (!applied.movingPiece) return state;

  const kingPos = { ...state.kingPos };
  if (applied.movingPiece.type === PIECES.KING) {
    kingPos[applied.movingPiece.color] = legalMove.to;
  }

  const castling = updateCastlingRights(state.castling, legalMove, applied.movingPiece, applied.capturedPiece);
  const enPassant = nextEnPassantSquare(legalMove);
  const halfmoveClock = (applied.movingPiece.type === PIECES.PAWN || applied.capturedPiece) ? 0 : state.halfmoveClock + 1;
  const fullmoveNumber = state.turn === BLACK ? state.fullmoveNumber + 1 : state.fullmoveNumber;

  const next = createBaseState({
    board: applied.board,
    kingPos,
    turn: oppositeColor(state.turn),
    castling,
    enPassant,
    halfmoveClock,
    fullmoveNumber
  });

  if (options.forSearch) {
    finalizeState(next, { forSearch: true, updatePositionCount: false });
    next.lastMove = {
      from: legalMove.from,
      to: legalMove.to,
      san: null,
      uci: moveToUci(legalMove),
      color: legalMove.color,
      piece: legalMove.piece,
      capture: legalMove.capture || null,
      promotion: legalMove.promotion || null
    };
    return next;
  }

  next.positionCounts = clonePositionCounts(state.positionCounts);
  finalizeState(next, { forSearch: false, updatePositionCount: true });
  const san = buildSan(state, legalMove, next);
  appendMoveEntry(state, next, legalMove, san);
  return next;
};

export const makeMove = (state, move) => {
  const legal = selectLegalMove(state, move);
  if (!legal) return state;
  return applyLegalMoveInternal(state, legal, { forSearch: false });
};

export const makeMoveForSearch = (state, move) => {
  const legal = move && move.from != null && move.to != null ? move : selectLegalMove(state, move);
  if (!legal) return state;
  const base = cloneStateForSearch(state);
  return applyLegalMoveInternal(base, legal, { forSearch: true });
};

export const moveToUci = (move) => {
  if (!move) return "";
  const from = typeof move.from === "number" ? indexToSquare(move.from) : String(move.from || "");
  const to = typeof move.to === "number" ? indexToSquare(move.to) : String(move.to || "");
  const promotion = move.promotion ? String(move.promotion).toLowerCase() : "";
  return `${from}${to}${promotion}`;
};

export const findLegalMoveByUci = (state, uci) => {
  if (typeof uci !== "string") return null;
  const raw = uci.trim().toLowerCase();
  if (raw.length < 4) return null;
  const from = squareToIndex(raw.slice(0, 2));
  const to = squareToIndex(raw.slice(2, 4));
  const promotion = raw.length > 4 ? raw[4] : undefined;
  if (from == null || to == null) return null;
  const legalMoves = state.legalMoves?.length ? state.legalMoves : generateLegalMoves(state, state.turn);
  return legalMoves.find((move) =>
    move.from === from &&
    move.to === to &&
    (move.promotion || "") === (promotion || "")
  ) || null;
};

export const canClaimDraw = (state) =>
  !state.result && Boolean(state.drawClaims?.threefold || state.drawClaims?.fiftyMove);

export const claimDraw = (state) => {
  if (state.result) return state;
  let reason = null;
  if (state.drawClaims?.threefold) reason = "threefold_repetition";
  else if (state.drawClaims?.fiftyMove) reason = "fifty_move_rule";
  if (!reason) return state;

  const next = {
    ...state,
    result: buildResult("draw", reason),
    statusText: ""
  };
  next.statusText = statusTextFor(next);
  return next;
};

export const getPieceSummary = (board) => {
  const initial = {
    w: { p: 8, n: 2, b: 2, r: 2, q: 1 },
    b: { p: 8, n: 2, b: 2, r: 2, q: 1 }
  };
  const current = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
  };

  board.forEach((piece) => {
    if (!piece || piece.type === PIECES.KING) return;
    current[piece.color][piece.type] += 1;
  });

  const captured = { w: [], b: [] };
  [WHITE, BLACK].forEach((color) => {
    [PIECES.QUEEN, PIECES.ROOK, PIECES.BISHOP, PIECES.KNIGHT, PIECES.PAWN].forEach((type) => {
      const missing = Math.max(0, initial[color][type] - current[color][type]);
      for (let i = 0; i < missing; i += 1) {
        captured[color].push(type);
      }
    });
  });
  return captured;
};

export const getMoveHistoryRows = (history) => {
  const rows = [];
  for (let i = 0; i < history.length; i += 2) {
    rows.push({
      number: Math.floor(i / 2) + 1,
      white: history[i]?.san || "",
      black: history[i + 1]?.san || ""
    });
  }
  return rows;
};

export const cloneGameState = (state) => {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(state);
  }
  return JSON.parse(JSON.stringify(state));
};

export const getColorName = (color) => COLOR_NAMES[color] || "blancas";
