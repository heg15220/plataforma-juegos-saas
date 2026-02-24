const TILE_SYMBOLS = {
  WALL: "#",
  EMPTY: " ",
  PELLET: ".",
  POWER_PELLET: "o",
  GHOST_DOOR: "=",
  PACMAN_SPAWN: "P",
  BLINKY_SPAWN: "B",
  PINKY_SPAWN: "Y",
  INKY_SPAWN: "I",
  CLYDE_SPAWN: "C",
  GHOST_HOME: "H"
};

const SPAWN_MARKERS = new Set([
  TILE_SYMBOLS.PACMAN_SPAWN,
  TILE_SYMBOLS.BLINKY_SPAWN,
  TILE_SYMBOLS.PINKY_SPAWN,
  TILE_SYMBOLS.INKY_SPAWN,
  TILE_SYMBOLS.CLYDE_SPAWN,
  TILE_SYMBOLS.GHOST_HOME
]);

const WALKABLE_TILES = new Set([
  TILE_SYMBOLS.EMPTY,
  TILE_SYMBOLS.PELLET,
  TILE_SYMBOLS.POWER_PELLET,
  TILE_SYMBOLS.GHOST_DOOR
]);

const sanitizeTile = (tile) => {
  if (WALKABLE_TILES.has(tile) || tile === TILE_SYMBOLS.WALL) {
    return tile;
  }
  if (SPAWN_MARKERS.has(tile)) {
    return TILE_SYMBOLS.EMPTY;
  }
  return TILE_SYMBOLS.WALL;
};

const cloneGrid = (grid) => grid.map((row) => [...row]);

export default class TileMap {
  constructor({ grid, originalGrid, spawnPoints, tileSize = 20 }) {
    this.grid = grid;
    this.originalGrid = originalGrid;
    this.spawnPoints = spawnPoints;
    this.rows = grid.length;
    this.cols = grid[0]?.length ?? 0;
    this.tileSize = tileSize;
    this.pixelWidth = this.cols * this.tileSize;
    this.pixelHeight = this.rows * this.tileSize;
    this.tunnelRows = this.#computeTunnelRows();
    this.remainingPellets = this.#countPellets();
  }

  static fromRows(rows, options = {}) {
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("TileMap.fromRows expects a non-empty array of strings.");
    }

    const safeRows = rows.map((row) => String(row));
    const cols = safeRows.reduce((max, row) => Math.max(max, row.length), 0);
    const spawnPoints = {};

    const grid = safeRows.map((row, rowIndex) => {
      const chars = [];
      for (let colIndex = 0; colIndex < cols; colIndex += 1) {
        const tile = row[colIndex] ?? TILE_SYMBOLS.WALL;
        if (SPAWN_MARKERS.has(tile)) {
          spawnPoints[tile] = { row: rowIndex, col: colIndex };
        }
        chars.push(sanitizeTile(tile));
      }
      return chars;
    });

    return new TileMap({
      grid,
      originalGrid: cloneGrid(grid),
      spawnPoints,
      tileSize: options.tileSize ?? 20
    });
  }

  #computeTunnelRows() {
    const rows = new Set();
    for (let row = 0; row < this.rows; row += 1) {
      if (this.#isBaseWalkable(row, 0) && this.#isBaseWalkable(row, this.cols - 1)) {
        rows.add(row);
      }
    }
    return rows;
  }

  #countPellets() {
    let count = 0;
    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        const tile = this.grid[row][col];
        if (tile === TILE_SYMBOLS.PELLET || tile === TILE_SYMBOLS.POWER_PELLET) {
          count += 1;
        }
      }
    }
    return count;
  }

  #isBaseWalkable(row, col) {
    if (!this.inBounds(row, col)) return false;
    const tile = this.grid[row][col];
    return tile !== TILE_SYMBOLS.WALL;
  }

  resetDynamicTiles() {
    this.grid = cloneGrid(this.originalGrid);
    this.remainingPellets = this.#countPellets();
  }

  inBounds(row, col) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  getSpawnTile(marker, fallback = { row: 1, col: 1 }) {
    return this.spawnPoints[marker] ?? fallback;
  }

  getTile(row, col) {
    if (!this.inBounds(row, col)) {
      return TILE_SYMBOLS.WALL;
    }
    return this.grid[row][col];
  }

  setTile(row, col, tile) {
    if (!this.inBounds(row, col)) return;
    this.grid[row][col] = tile;
  }

  isWall(row, col) {
    return this.getTile(row, col) === TILE_SYMBOLS.WALL;
  }

  isDoor(row, col) {
    return this.getTile(row, col) === TILE_SYMBOLS.GHOST_DOOR;
  }

  hasTunnelAtRow(row) {
    return this.tunnelRows.has(row);
  }

  wrapColumn(row, col) {
    if (!this.hasTunnelAtRow(row)) {
      return col;
    }
    if (col < 0) return this.cols - 1;
    if (col >= this.cols) return 0;
    return col;
  }

  wrapPositionIfTunnel(x, y) {
    const { row } = this.worldToTile(x, y);
    if (!this.hasTunnelAtRow(row)) {
      return x;
    }
    if (x < 0) {
      return x + this.pixelWidth;
    }
    if (x >= this.pixelWidth) {
      return x - this.pixelWidth;
    }
    return x;
  }

  isWalkable(row, col, { entityType = "pacman" } = {}) {
    if (!this.inBounds(row, col)) {
      return this.hasTunnelAtRow(row) && (col < 0 || col >= this.cols);
    }

    const tile = this.grid[row][col];
    if (tile === TILE_SYMBOLS.WALL) return false;
    if (tile === TILE_SYMBOLS.GHOST_DOOR) {
      return entityType === "ghost";
    }
    return true;
  }

  hasPellet(row, col) {
    return this.getTile(row, col) === TILE_SYMBOLS.PELLET;
  }

  hasPowerPellet(row, col) {
    return this.getTile(row, col) === TILE_SYMBOLS.POWER_PELLET;
  }

  eatPellet(row, col) {
    if (!this.inBounds(row, col)) return null;
    const tile = this.grid[row][col];

    if (tile === TILE_SYMBOLS.PELLET) {
      this.grid[row][col] = TILE_SYMBOLS.EMPTY;
      this.remainingPellets = Math.max(0, this.remainingPellets - 1);
      return { type: "pellet", points: 10 };
    }

    if (tile === TILE_SYMBOLS.POWER_PELLET) {
      this.grid[row][col] = TILE_SYMBOLS.EMPTY;
      this.remainingPellets = Math.max(0, this.remainingPellets - 1);
      return { type: "power", points: 50 };
    }

    return null;
  }

  worldToTile(x, y) {
    return {
      row: Math.floor(y / this.tileSize),
      col: Math.floor(x / this.tileSize)
    };
  }

  worldToClampedTile(x, y) {
    const tile = this.worldToTile(x, y);
    return {
      row: Math.max(0, Math.min(this.rows - 1, tile.row)),
      col: Math.max(0, Math.min(this.cols - 1, tile.col))
    };
  }

  tileToWorld(row, col) {
    return {
      x: col * this.tileSize + this.tileSize / 2,
      y: row * this.tileSize + this.tileSize / 2
    };
  }

  isNearTileCenter(x, y, tolerance = this.tileSize * 0.2) {
    const tile = this.worldToClampedTile(x, y);
    const center = this.tileToWorld(tile.row, tile.col);
    return Math.abs(x - center.x) <= tolerance && Math.abs(y - center.y) <= tolerance;
  }

  alignToTileCenter(entity) {
    const tile = this.worldToClampedTile(entity.x, entity.y);
    const center = this.tileToWorld(tile.row, tile.col);
    entity.x = center.x;
    entity.y = center.y;
    entity.row = tile.row;
    entity.col = tile.col;
  }

  forEachTile(visitor) {
    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        visitor(this.grid[row][col], row, col);
      }
    }
  }
}

export { TILE_SYMBOLS };
