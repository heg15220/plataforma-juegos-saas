import { directionVector } from "./directions";

const DEFAULT_STEP = 2;

export const canEnterTile = (tileMap, row, col, entityType = "pacman") =>
  tileMap.isWalkable(row, col, { entityType });

export const nextTileFrom = (tileMap, row, col, direction) => {
  const vector = directionVector(direction);
  const nextRow = row + vector.y;
  const nextCol = tileMap.wrapColumn(nextRow, col + vector.x);
  return { row: nextRow, col: nextCol };
};

export const canMoveFromTile = (tileMap, row, col, direction, entityType = "pacman") => {
  if (!direction) return false;
  const nextTile = nextTileFrom(tileMap, row, col, direction);
  return canEnterTile(tileMap, nextTile.row, nextTile.col, entityType);
};

export const moveEntityOnGrid = ({ tileMap, entity, direction, distance, entityType = "pacman" }) => {
  if (!direction || distance <= 0) {
    return 0;
  }

  const vector = directionVector(direction);
  if (!vector.x && !vector.y) return 0;

  const stepDistance = Math.min(DEFAULT_STEP, tileMap.tileSize * 0.2);
  let moved = 0;

  while (moved < distance) {
    const increment = Math.min(stepDistance, distance - moved);
    let nextX = entity.x + vector.x * increment;
    let nextY = entity.y + vector.y * increment;

    nextX = tileMap.wrapPositionIfTunnel(nextX, nextY);

    const tile = tileMap.worldToTile(nextX, nextY);
    const wrappedCol = tileMap.wrapColumn(tile.row, tile.col);
    if (wrappedCol !== tile.col) {
      nextX = tileMap.tileToWorld(tile.row, wrappedCol).x;
    }

    if (!canEnterTile(tileMap, tile.row, wrappedCol, entityType)) {
      break;
    }

    entity.x = nextX;
    entity.y = nextY;
    entity.row = tile.row;
    entity.col = wrappedCol;
    moved += increment;
  }

  return moved;
};

export const distanceBetweenEntities = (a, b) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
};
