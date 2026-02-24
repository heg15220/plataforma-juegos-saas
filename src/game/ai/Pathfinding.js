import { DIRECTION_NAMES } from "../world/directions";
import { canEnterTile } from "../world/Collision";

const tileKey = (row, col) => `${row}:${col}`;

export const findPathDistance = (
  tileMap,
  navigationGraph,
  start,
  target,
  { entityType = "ghost", maxNodes = 4096 } = {}
) => {
  if (!start || !target) return Number.POSITIVE_INFINITY;
  if (start.row === target.row && start.col === target.col) return 0;

  const visited = new Set();
  const queue = [{ row: start.row, col: start.col, distance: 0 }];
  let cursor = 0;

  visited.add(tileKey(start.row, start.col));

  while (cursor < queue.length && cursor < maxNodes) {
    const current = queue[cursor];
    cursor += 1;

    for (const direction of DIRECTION_NAMES) {
      const next = navigationGraph.stepTile(current.row, current.col, direction);
      const key = tileKey(next.row, next.col);
      if (visited.has(key)) {
        continue;
      }
      if (!canEnterTile(tileMap, next.row, next.col, entityType)) {
        continue;
      }

      if (next.row === target.row && next.col === target.col) {
        return current.distance + 1;
      }

      visited.add(key);
      queue.push({
        row: next.row,
        col: next.col,
        distance: current.distance + 1
      });
    }
  }

  return Number.POSITIVE_INFINITY;
};
