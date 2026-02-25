import { describe, expect, it } from "vitest";
import { TILE_TYPES, createLevelRuntime, getLevelCount, isSupportTile } from "./levelLoader";

const MAX_STEP_X = 4;
const MAX_STEP_UP = 3;
const MAX_STEP_DOWN = 6;

const getTile = (level, x, y) => {
  if (x < 0 || y < 0 || x >= level.width || y >= level.height) {
    return TILE_TYPES.EMPTY;
  }
  return level.tiles[y]?.[x] || TILE_TYPES.EMPTY;
};

const collectStandNodes = (level) => {
  const nodes = [];
  for (let y = 1; y < level.height; y += 1) {
    for (let x = 0; x < level.width; x += 1) {
      const tile = getTile(level, x, y);
      const above = getTile(level, x, y - 1);
      if (isSupportTile(tile) && above === TILE_TYPES.EMPTY) {
        nodes.push({ x, y });
      }
    }
  }
  return nodes;
};

const makeNodeMap = (nodes) => {
  const map = new Map();
  for (const node of nodes) {
    map.set(`${node.x},${node.y}`, node);
  }
  return map;
};

const closestNodes = (nodes, targetX, targetY, radiusX, radiusY) =>
  nodes.filter((node) => Math.abs(node.x - targetX) <= radiusX && Math.abs(node.y - targetY) <= radiusY);

const hasConservativeRoute = (level) => {
  const nodes = collectStandNodes(level);
  if (!nodes.length) {
    return false;
  }

  const spawnSupportY = Math.min(level.height - 1, level.playerSpawn.y + 1);
  let starts = closestNodes(nodes, level.playerSpawn.x, spawnSupportY, 2, 2);
  if (!starts.length) {
    starts = closestNodes(nodes, level.playerSpawn.x, spawnSupportY, 4, 4);
  }
  if (!starts.length) {
    return false;
  }

  let targets = nodes.filter(
    (node) => Math.abs(node.x - level.goal.x) <= 2 && node.y <= level.goal.y + 2
  );
  if (!targets.length) {
    targets = nodes.filter((node) => Math.abs(node.x - level.goal.x) <= 2);
  }
  if (!targets.length) {
    return false;
  }

  const targetKeys = new Set(targets.map((node) => `${node.x},${node.y}`));
  const nodeMap = makeNodeMap(nodes);
  const queue = [...starts];
  const visited = new Set();

  while (queue.length) {
    const current = queue.shift();
    const key = `${current.x},${current.y}`;
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);

    if (targetKeys.has(key)) {
      return true;
    }

    for (let nx = current.x - MAX_STEP_X; nx <= current.x + MAX_STEP_X; nx += 1) {
      if (nx < 0 || nx >= level.width) {
        continue;
      }
      for (let ny = current.y - MAX_STEP_UP; ny <= current.y + MAX_STEP_DOWN; ny += 1) {
        if (ny < 1 || ny >= level.height) {
          continue;
        }
        const candidateKey = `${nx},${ny}`;
        if (visited.has(candidateKey)) {
          continue;
        }
        const candidate = nodeMap.get(candidateKey);
        if (!candidate) {
          continue;
        }
        const dx = Math.abs(candidate.x - current.x);
        const dyUp = current.y - candidate.y;
        if (dyUp > MAX_STEP_UP || dx > MAX_STEP_X) {
          continue;
        }
        if (dx >= 4 && dyUp > 1) {
          continue;
        }
        queue.push(candidate);
      }
    }
  }

  return false;
};

describe("platformer level reachability", () => {
  it("mantiene ruta completable en mapas 3+ con restricciones conservadoras", () => {
    const count = getLevelCount();
    for (let index = 2; index < count; index += 1) {
      const level = createLevelRuntime(index);
      const reachable = hasConservativeRoute(level);
      expect(reachable, `level ${index + 1} (${level.id}) is not conservatively reachable`).toBe(true);
    }
  });
});
