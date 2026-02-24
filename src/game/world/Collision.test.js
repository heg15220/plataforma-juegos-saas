import { describe, expect, it } from "vitest";
import TileMap from "./TileMap";
import { canEnterTile, canMoveFromTile, moveEntityOnGrid } from "./Collision";

describe("Collision", () => {
  it("blocks movement against walls", () => {
    const map = TileMap.fromRows([
      "#####",
      "#...#",
      "#####"
    ], { tileSize: 10 });

    expect(canMoveFromTile(map, 1, 1, "right", "pacman")).toBe(true);
    expect(canMoveFromTile(map, 1, 1, "up", "pacman")).toBe(false);

    const entity = {
      ...map.tileToWorld(1, 1),
      row: 1,
      col: 1
    };

    moveEntityOnGrid({
      tileMap: map,
      entity,
      direction: "up",
      distance: 6,
      entityType: "pacman"
    });

    expect(entity.row).toBe(1);
    expect(entity.col).toBe(1);
  });

  it("treats ghost door as passable for ghosts only", () => {
    const map = TileMap.fromRows([
      "#####",
      "#.=.#",
      "#####"
    ]);

    expect(canEnterTile(map, 1, 2, "pacman")).toBe(false);
    expect(canEnterTile(map, 1, 2, "ghost")).toBe(true);
  });
});
