import { describe, expect, it } from "vitest";
import {
  canClaimDraw,
  claimDraw,
  createChessStateFromFen,
  createInitialChessState,
  findLegalMoveByUci,
  makeMove,
  squareToIndex
} from "./chessEngine";

const play = (state, uci) => {
  const move = findLegalMoveByUci(state, uci);
  expect(move, `Movimiento no encontrado: ${uci}`).toBeTruthy();
  return makeMove(state, move);
};

describe("chessEngine", () => {
  it("genera 20 movimientos legales en la posicion inicial", () => {
    const state = createInitialChessState();
    expect(state.legalMoves.length).toBe(20);
  });

  it("soporta captura al paso", () => {
    let state = createInitialChessState();
    state = play(state, "e2e4");
    state = play(state, "a7a6");
    state = play(state, "e4e5");
    state = play(state, "d7d5");

    const enPassant = findLegalMoveByUci(state, "e5d6");
    expect(enPassant).toBeTruthy();
    expect(enPassant.isEnPassant).toBe(true);

    state = makeMove(state, enPassant);

    const d6 = squareToIndex("d6");
    const d5 = squareToIndex("d5");
    expect(state.board[d6]?.type).toBe("p");
    expect(state.board[d6]?.color).toBe("w");
    expect(state.board[d5]).toBeNull();
  });

  it("permite enroque corto y largo cuando corresponde", () => {
    const state = createChessStateFromFen("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1");

    const shortCastle = findLegalMoveByUci(state, "e1g1");
    const longCastle = findLegalMoveByUci(state, "e1c1");

    expect(shortCastle).toBeTruthy();
    expect(longCastle).toBeTruthy();

    const afterShort = makeMove(state, shortCastle);
    expect(afterShort.board[squareToIndex("g1")]?.type).toBe("k");
    expect(afterShort.board[squareToIndex("f1")]?.type).toBe("r");
  });

  it("permite promocion de peon", () => {
    let state = createChessStateFromFen("4k3/P7/8/8/8/8/8/4K3 w - - 0 1");
    state = play(state, "a7a8q");

    const promoted = state.board[squareToIndex("a8")];
    expect(promoted?.type).toBe("q");
    expect(promoted?.color).toBe("w");
  });

  it("detecta mate del loco", () => {
    let state = createInitialChessState();
    state = play(state, "f2f3");
    state = play(state, "e7e5");
    state = play(state, "g2g4");
    state = play(state, "d8h4");

    expect(state.result).toBeTruthy();
    expect(state.result.reason).toBe("checkmate");
    expect(state.result.winner).toBe("b");
  });

  it("marca tablas por material insuficiente", () => {
    const state = createChessStateFromFen("8/8/8/8/8/8/2k5/3K4 w - - 0 1");
    expect(state.result).toBeTruthy();
    expect(state.result.reason).toBe("insufficient_material");
  });

  it("no declara tablas por material insuficiente con alfil y caballo contra rey", () => {
    const state = createChessStateFromFen("k7/8/8/8/8/8/8/2BKN3 w - - 0 1");
    expect(state.result).toBeNull();
  });

  it("no declara tablas por material insuficiente con caballo contra caballo", () => {
    const state = createChessStateFromFen("k7/8/8/8/8/8/8/3KN2n w - - 0 1");
    expect(state.result).toBeNull();
  });

  it("declara tablas por material insuficiente con dos caballos contra rey", () => {
    const state = createChessStateFromFen("k7/8/8/8/8/8/8/3KNN2 w - - 0 1");
    expect(state.result).toBeTruthy();
    expect(state.result.reason).toBe("insufficient_material");
  });

  it("habilita reclamacion por triple repeticion", () => {
    let state = createInitialChessState();

    state = play(state, "g1f3");
    state = play(state, "g8f6");
    state = play(state, "f3g1");
    state = play(state, "f6g8");
    state = play(state, "g1f3");
    state = play(state, "g8f6");
    state = play(state, "f3g1");
    state = play(state, "f6g8");

    expect(state.drawClaims.threefold).toBe(true);
    expect(canClaimDraw(state)).toBe(true);

    const drawn = claimDraw(state);
    expect(drawn.result?.reason).toBe("threefold_repetition");
  });
});
