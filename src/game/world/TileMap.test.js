import { describe, expect, it } from "vitest";
import TileMap, { TILE_SYMBOLS } from "./TileMap";

describe("TileMap", () => {
  it("parses rows and extracts spawn markers", () => {
    const map = TileMap.fromRows([
      "#####",
      "#P.o#",
      "#=B #",
      "#####"
    ], { tileSize: 10 });

    expect(map.rows).toBe(4);
    expect(map.cols).toBe(5);
    expect(map.tileSize).toBe(10);

    expect(map.getSpawnTile(TILE_SYMBOLS.PACMAN_SPAWN)).toEqual({ row: 1, col: 1 });
    expect(map.getSpawnTile(TILE_SYMBOLS.BLINKY_SPAWN)).toEqual({ row: 2, col: 2 });

    expect(map.getTile(1, 1)).toBe(TILE_SYMBOLS.EMPTY);
    expect(map.hasPellet(1, 2)).toBe(true);
    expect(map.hasPowerPellet(1, 3)).toBe(true);
  });

  it("consumes pellets and updates remaining count", () => {
    const map = TileMap.fromRows([
      "#####",
      "#.o #",
      "#####"
    ]);

    const startRemaining = map.remainingPellets;

    const pellet = map.eatPellet(1, 1);
    expect(pellet).toEqual({ type: "pellet", points: 10 });
    expect(map.getTile(1, 1)).toBe(TILE_SYMBOLS.EMPTY);
    expect(map.remainingPellets).toBe(startRemaining - 1);

    const powerPellet = map.eatPellet(1, 2);
    expect(powerPellet).toEqual({ type: "power", points: 50 });
    expect(map.remainingPellets).toBe(startRemaining - 2);

    expect(map.eatPellet(1, 2)).toBeNull();
  });
});
