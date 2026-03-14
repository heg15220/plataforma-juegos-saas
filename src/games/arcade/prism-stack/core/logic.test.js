import { describe, expect, it } from "vitest";
import {
  applyPulse,
  buildBoardStrings,
  clearBands,
  createActivePiece,
  createEmptyBoard,
  lockPiece,
  rewardPulseCharge,
  rotatePiece,
  scoreBandClear,
} from "./logic";

describe("prism-stack logic", () => {
  it("clears full bands and keeps the board height stable", () => {
    const board = createEmptyBoard();
    board[20] = Array.from({ length: 9 }, () => ({
      token: "S",
      core: false,
      color: "#fff",
      accent: "#fff",
      glow: "rgba(255,255,255,0.2)",
    }));
    board[19][4] = {
      token: "N",
      core: true,
      color: "#fff",
      accent: "#fff",
      glow: "rgba(255,255,255,0.2)",
    };

    const result = clearBands(board);

    expect(result.clearedRows).toEqual([20]);
    expect(result.board).toHaveLength(21);
    expect(result.board[20][4]?.token).toBe("N");
  });

  it("removes the top cell from the tallest column when pulse is used", () => {
    const board = createEmptyBoard();
    board[17][4] = { token: "S", core: false };
    board[18][4] = { token: "S", core: false };
    board[19][4] = { token: "S", core: false };
    board[20][4] = { token: "S", core: false };
    board[20][1] = { token: "H", core: false };

    const result = applyPulse(board);

    expect(result.column).toBe(4);
    expect(result.row).toBe(17);
    expect(result.board[17][4]).toBeNull();
    expect(result.board[20][1]?.token).toBe("H");
  });

  it("kicks rotated pieces away from a wall when possible", () => {
    const board = createEmptyBoard();
    const piece = createActivePiece("hook", { x: 0, y: 2 });

    const rotated = rotatePiece(board, piece, 1);

    expect(rotated.rotation).toBe(1);
    expect(rotated.x).toBeGreaterThanOrEqual(0);
  });

  it("awards pulse charges every four cleared bands", () => {
    const charge = rewardPulseCharge(1, 2, 3);

    expect(charge.pulseCharges).toBe(2);
    expect(charge.pulseProgress).toBe(1);
    expect(charge.gainedCharge).toBe(true);
  });

  it("scores clears using level, combo, and core bonuses", () => {
    expect(
      scoreBandClear({
        rowsCleared: 2,
        level: 3,
        combo: 3,
        coreCellsCleared: 2,
      })
    ).toBe((360 + 100 + 60) * 3);
  });

  it("serializes the visible matrix for QA", () => {
    const board = createEmptyBoard();
    const piece = createActivePiece("nova", { x: 4, y: 4 });
    const locked = lockPiece(board, piece);
    const strings = buildBoardStrings(locked);

    expect(strings).toHaveLength(18);
    expect(strings.some((row) => row.includes("N"))).toBe(true);
  });
});
