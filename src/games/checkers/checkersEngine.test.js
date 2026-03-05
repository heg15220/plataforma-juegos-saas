import { describe, expect, it } from "vitest";
import {
  BLOCKED_RULES,
  COLORS,
  applyMistake,
  createCheckersStateFromConfig,
  createInitialCheckersState,
  findLegalMove,
  makeMove
} from "./checkersEngine";

const WHITE = COLORS.WHITE;
const BLACK = COLORS.BLACK;

const squareToIndex = (square) => {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  return (8 - rank) * 8 + file;
};

const piece = (color, king = false) => ({ color, king });

const play = (state, from, to) => {
  const move = findLegalMove(state, squareToIndex(from), squareToIndex(to));
  expect(move, `Movimiento no encontrado: ${from}-${to}`).toBeTruthy();
  return makeMove(state, move);
};

describe("checkersEngine", () => {
  it("crea tablero inicial con 12 fichas por lado y blancas al turno", () => {
    const state = createInitialCheckersState();
    const whitePieces = state.board.filter((p) => p?.color === WHITE).length;
    const blackPieces = state.board.filter((p) => p?.color === BLACK).length;
    expect(whitePieces).toBe(12);
    expect(blackPieces).toBe(12);
    expect(state.turn).toBe(WHITE);
    expect(state.legalMoves.length).toBeGreaterThan(0);
  });

  it("permite que una ficha normal retroceda en un movimiento no capturante", () => {
    let state = createInitialCheckersState();
    state = play(state, "c3", "d4");
    state = play(state, "b6", "a5");
    const backwardMove = findLegalMove(state, squareToIndex("d4"), squareToIndex("c3"));
    expect(backwardMove).toBeTruthy();
    expect(backwardMove.captureIndex).toBeNull();
  });

  it("mantiene cadena de captura con forcedPiece hasta terminar", () => {
    const board = Array(64).fill(null);
    board[squareToIndex("c3")] = piece(WHITE);
    board[squareToIndex("d4")] = piece(BLACK);
    board[squareToIndex("f6")] = piece(BLACK);
    board[squareToIndex("h8")] = piece(BLACK);

    let state = createCheckersStateFromConfig({
      board,
      turn: WHITE,
      settings: {
        extraMoveSinglePiece: false
      }
    });

    state = play(state, "c3", "e5");
    expect(state.forcedPiece).toBe(squareToIndex("e5"));
    expect(state.turn).toBe(WHITE);
    expect(state.legalMoves.every((move) => move.from === squareToIndex("e5"))).toBe(true);

    state = play(state, "e5", "g7");
    expect(state.forcedPiece).toBeNull();
    expect(state.turn).toBe(BLACK);
  });

  it("aplica prioridad de captura de dama frente a capturas de ficha normal", () => {
    const board = Array(64).fill(null);
    board[squareToIndex("c3")] = piece(WHITE, true);
    board[squareToIndex("a3")] = piece(WHITE, false);
    board[squareToIndex("d4")] = piece(BLACK);
    board[squareToIndex("b4")] = piece(BLACK);

    const state = createCheckersStateFromConfig({
      board,
      turn: WHITE,
      settings: {
        kingCapturePriority: true,
        captureMandatory: false
      }
    });

    const kingCapture = findLegalMove(state, squareToIndex("c3"), squareToIndex("e5"));
    const manCapture = findLegalMove(state, squareToIndex("a3"), squareToIndex("c5"));

    expect(kingCapture).toBeTruthy();
    expect(kingCapture.captureIndex).not.toBeNull();
    expect(manCapture).toBeNull();
  });

  it("declara derrota al tercer error", () => {
    let state = createInitialCheckersState({
      maxMistakes: 3
    });
    state = applyMistake(state, WHITE);
    state = applyMistake(state, WHITE);
    state = applyMistake(state, WHITE);

    expect(state.result).toBeTruthy();
    expect(state.result.reason).toBe("mistakes_limit");
    expect(state.result.winner).toBe(BLACK);
  });

  it("resuelve bloqueo como tablas cuando se selecciona esa regla", () => {
    const board = Array(64).fill(null);
    board[squareToIndex("a1")] = piece(BLACK);
    board[squareToIndex("b2")] = piece(WHITE);
    board[squareToIndex("c3")] = piece(WHITE);

    const state = createCheckersStateFromConfig({
      board,
      turn: BLACK,
      settings: {
        blockedRule: BLOCKED_RULES.DRAW
      }
    });

    expect(state.result).toBeTruthy();
    expect(state.result.type).toBe("draw");
    expect(state.result.reason).toBe("blocked_draw");
  });

  it("con una sola ficha activa habilita un movimiento extra", () => {
    const board = Array(64).fill(null);
    board[squareToIndex("c3")] = piece(WHITE);
    board[squareToIndex("h8")] = piece(BLACK);

    let state = createCheckersStateFromConfig({
      board,
      turn: WHITE,
      settings: {
        extraMoveSinglePiece: true
      }
    });

    state = play(state, "c3", "d4");
    expect(state.turn).toBe(WHITE);
    expect(state.turnMeta.extraMoveUsed).toBe(true);
    expect(state.result).toBeNull();
  });
});
