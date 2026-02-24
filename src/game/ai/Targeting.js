import { DIRECTION_NAMES, directionVector } from "../world/directions";

const key = (row, col) => `${row}:${col}`;

const clampTile = (tileMap, tile) => ({
  row: Math.max(0, Math.min(tileMap.rows - 1, tile.row)),
  col: Math.max(0, Math.min(tileMap.cols - 1, tile.col))
});

const findNearestWalkableTile = (tileMap, startTile) => {
  const seed = clampTile(tileMap, startTile);
  const queue = [seed];
  const visited = new Set([key(seed.row, seed.col)]);
  let cursor = 0;

  while (cursor < queue.length) {
    const current = queue[cursor];
    cursor += 1;

    if (tileMap.isWalkable(current.row, current.col, { entityType: "ghost" })) {
      return current;
    }

    for (const direction of DIRECTION_NAMES) {
      const vector = directionVector(direction);
      const nextRow = current.row + vector.y;
      const nextCol = tileMap.wrapColumn(nextRow, current.col + vector.x);
      const label = key(nextRow, nextCol);

      if (!tileMap.inBounds(nextRow, nextCol) || visited.has(label)) {
        continue;
      }

      visited.add(label);
      queue.push({ row: nextRow, col: nextCol });
    }
  }

  return seed;
};

export const projectAheadTiles = (tileMap, startTile, direction, distance) => {
  const vector = directionVector(direction);
  let row = startTile.row;
  let col = startTile.col;

  for (let step = 0; step < distance; step += 1) {
    const nextRow = row + vector.y;
    const nextCol = tileMap.wrapColumn(nextRow, col + vector.x);
    if (!tileMap.inBounds(nextRow, nextCol)) {
      break;
    }
    row = nextRow;
    col = nextCol;
  }

  return findNearestWalkableTile(tileMap, { row, col });
};

const addVector = (origin, vector) => ({
  row: origin.row + vector.row,
  col: origin.col + vector.col
});

const tileVector = (from, to) => ({
  row: to.row - from.row,
  col: to.col - from.col
});

const tileDistance = (a, b) => {
  const dx = a.col - b.col;
  const dy = a.row - b.row;
  return Math.hypot(dx, dy);
};

export const getGhostChaseTarget = ({
  ghostId,
  tileMap,
  pacmanTile,
  pacmanDirection,
  blinkyTile,
  ghostTile,
  scatterTarget
}) => {
  if (ghostId === "blinky") {
    return findNearestWalkableTile(tileMap, pacmanTile);
  }

  if (ghostId === "pinky") {
    return projectAheadTiles(tileMap, pacmanTile, pacmanDirection, 4);
  }

  if (ghostId === "inky") {
    const ahead = projectAheadTiles(tileMap, pacmanTile, pacmanDirection, 2);
    const vector = tileVector(blinkyTile ?? ghostTile, ahead);
    const projected = addVector(ahead, vector);
    return findNearestWalkableTile(tileMap, projected);
  }

  if (ghostId === "clyde") {
    const distanceToPacman = tileDistance(ghostTile, pacmanTile);
    if (distanceToPacman > 8) {
      return findNearestWalkableTile(tileMap, pacmanTile);
    }
    return findNearestWalkableTile(tileMap, scatterTarget);
  }

  return findNearestWalkableTile(tileMap, pacmanTile);
};
