import TileMap, { TILE_SYMBOLS } from "../world/TileMap";

const BASE_LEVEL_MAP = [
  "#####################",
  "#o........#........o#",
  "#.###.###.#.###.###.#",
  "#.....#...#...#.....#",
  "###.#.#.#####.#.#.###",
  "#...#.#.......#.#...#",
  "#.###.###.#.###.###.#",
  "#.......#...#.......#",
  "#.###.#.##=##.#.###.#",
  "#.....#.#BYI#.#.....#",
  "#.###.#.#CH# # ###..#",
  "#.....#.#   #.#.....#",
  "###.#.#.#####.#.#.###",
  "#...#.#.......#.#...#",
  "#.###.###.#.###.###.#",
  "#o....#...P...#....o#",
  "#.##.#.#.###.#.#.##.#",
  "#....#...# #...#....#",
  "###.###.#.#.#.###.###",
  ".....................",
  "#####################"
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export default class LevelManager {
  constructor({ tileSize = 20 } = {}) {
    this.tileSize = tileSize;
  }

  getLevelConfig(level) {
    const safeLevel = Math.max(1, Number(level) || 1);
    const speedScale = 1 + (safeLevel - 1) * 0.07;

    return {
      level: safeLevel,
      tileSize: this.tileSize,
      pacmanSpeed: 78 * speedScale,
      ghostSpeed: 72 * speedScale,
      ghostFrightenedSpeed: 52 * speedScale,
      ghostEatenSpeed: 118,
      frightenedDuration: clamp(6.8 - (safeLevel - 1) * 0.65, 2.4, 6.8),
      lifeLostDelay: 1.2,
      levelClearDelay: 1.4,
      cornerBufferPx: this.tileSize * 0.22
    };
  }

  createLevel(level) {
    const config = this.getLevelConfig(level);
    const tileMap = TileMap.fromRows(BASE_LEVEL_MAP, { tileSize: config.tileSize });

    const pacmanSpawn = tileMap.getSpawnTile(TILE_SYMBOLS.PACMAN_SPAWN, { row: 15, col: 10 });
    const homeTile = tileMap.getSpawnTile(TILE_SYMBOLS.GHOST_HOME, { row: 10, col: 10 });

    const ghostSpawns = {
      blinky: tileMap.getSpawnTile(TILE_SYMBOLS.BLINKY_SPAWN, { row: 9, col: 9 }),
      pinky: tileMap.getSpawnTile(TILE_SYMBOLS.PINKY_SPAWN, { row: 9, col: 10 }),
      inky: tileMap.getSpawnTile(TILE_SYMBOLS.INKY_SPAWN, { row: 9, col: 11 }),
      clyde: tileMap.getSpawnTile(TILE_SYMBOLS.CLYDE_SPAWN, { row: 10, col: 9 })
    };

    const scatterTargets = {
      blinky: { row: 1, col: tileMap.cols - 2 },
      pinky: { row: 1, col: 1 },
      inky: { row: tileMap.rows - 2, col: tileMap.cols - 2 },
      clyde: { row: tileMap.rows - 2, col: 1 }
    };

    return {
      config,
      tileMap,
      pacmanSpawn,
      homeTile,
      ghostSpawns,
      scatterTargets
    };
  }
}
