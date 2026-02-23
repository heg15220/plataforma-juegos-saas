import { TILE_SIZE } from "../config";
import { LEVELS } from "./index";

export const TILE_TYPES = {
  EMPTY: "empty",
  GROUND: "ground",
  BRICK: "brick",
  PIPE: "pipe",
  QUESTION: "question",
  PLATFORM: "platform"
};

const CHAR_TILE_MAP = {
  ".": TILE_TYPES.EMPTY,
  "#": TILE_TYPES.GROUND,
  B: TILE_TYPES.BRICK,
  T: TILE_TYPES.PIPE,
  "?": TILE_TYPES.QUESTION,
  "=": TILE_TYPES.PLATFORM
};

const SOLID_TILES = new Set([
  TILE_TYPES.GROUND,
  TILE_TYPES.BRICK,
  TILE_TYPES.PIPE,
  TILE_TYPES.QUESTION
]);

const ONEWAY_TILES = new Set([TILE_TYPES.PLATFORM]);

export const tileKey = (tx, ty) => `${tx},${ty}`;

const numberOrFallback = (value, fallback) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return numeric;
};

const normalizeSpawnList = (list, fallbackType) => {
  if (!Array.isArray(list)) {
    return [];
  }
  return list.map((entry) => ({
    type: String(entry.type || fallbackType),
    x: Math.max(0, Math.floor(numberOrFallback(entry.x, 0))),
    y: Math.max(0, Math.floor(numberOrFallback(entry.y, 0))),
    patrol: Math.max(1, Math.floor(numberOrFallback(entry.patrol, 4)))
  }));
};

const normalizeLevel = (rawLevel) => {
  const mapRows = Array.isArray(rawLevel.map) ? rawLevel.map.map((row) => String(row)) : [];
  const height = Math.max(1, mapRows.length);
  const width = Math.max(1, ...mapRows.map((row) => row.length));
  const tileSize = Math.max(8, Math.floor(numberOrFallback(rawLevel.tileSize, TILE_SIZE)));

  const tiles = Array.from({ length: height }, (_, y) => {
    const row = mapRows[y] || "";
    return Array.from({ length: width }, (_, x) => CHAR_TILE_MAP[row[x]] || TILE_TYPES.EMPTY);
  });

  const rewardMap = new Map();
  const rewards = Array.isArray(rawLevel.questionRewards) ? rawLevel.questionRewards : [];
  for (const reward of rewards) {
    const tx = Math.max(0, Math.floor(numberOrFallback(reward.x, -1)));
    const ty = Math.max(0, Math.floor(numberOrFallback(reward.y, -1)));
    if (tx < 0 || ty < 0) {
      continue;
    }
    const rewardType = reward.type === "mushroom" ? "mushroom" : "coin";
    rewardMap.set(tileKey(tx, ty), rewardType);
  }

  const questionBlocks = [];
  for (let ty = 0; ty < height; ty += 1) {
    for (let tx = 0; tx < width; tx += 1) {
      if (tiles[ty][tx] !== TILE_TYPES.QUESTION) {
        continue;
      }
      questionBlocks.push({
        tx,
        ty,
        used: false,
        reward: rewardMap.get(tileKey(tx, ty)) || "coin"
      });
    }
  }

  const playerSpawn = {
    x: Math.max(0, Math.floor(numberOrFallback(rawLevel.playerSpawn?.x, 2))),
    y: Math.max(0, Math.floor(numberOrFallback(rawLevel.playerSpawn?.y, Math.max(0, height - 3))))
  };

  const goal = {
    x: Math.max(0, Math.floor(numberOrFallback(rawLevel.goal?.x, Math.max(0, width - 3)))),
    y: Math.max(0, Math.floor(numberOrFallback(rawLevel.goal?.y, Math.max(0, height - 4))))
  };

  const itemSpawns = normalizeSpawnList(rawLevel.itemSpawns, "coin");
  const enemySpawns = normalizeSpawnList(rawLevel.enemySpawns, "walker");

  const coinFromItems = itemSpawns.filter((item) => item.type === "coin").length;
  const coinFromQuestionBlocks = questionBlocks.filter((block) => block.reward === "coin").length;

  return {
    id: String(rawLevel.id || "platformer-level"),
    name: String(rawLevel.name || "Arcade Level"),
    theme: rawLevel.theme === "dusk" ? "dusk" : "day",
    timeLimit: Math.max(30, Math.floor(numberOrFallback(rawLevel.timeLimit, 120))),
    goalRequiresAllCoins: Boolean(rawLevel.goalRequiresAllCoins),
    tileSize,
    width,
    height,
    tiles,
    playerSpawn,
    goal,
    itemSpawns,
    enemySpawns,
    questionBlocks,
    coinTarget: coinFromItems + coinFromQuestionBlocks
  };
};

const LEVEL_TEMPLATES = LEVELS.map((level) => normalizeLevel(level));

export const getLevelCount = () => LEVEL_TEMPLATES.length;

export const getLevelTemplate = (index) => {
  if (!LEVEL_TEMPLATES.length) {
    throw new Error("No level definitions found.");
  }
  const safeIndex = ((Math.floor(index) % LEVEL_TEMPLATES.length) + LEVEL_TEMPLATES.length) % LEVEL_TEMPLATES.length;
  return LEVEL_TEMPLATES[safeIndex];
};

export const createLevelRuntime = (index) => {
  const template = getLevelTemplate(index);
  return {
    index,
    id: template.id,
    name: template.name,
    theme: template.theme,
    timeLimit: template.timeLimit,
    goalRequiresAllCoins: template.goalRequiresAllCoins,
    tileSize: template.tileSize,
    width: template.width,
    height: template.height,
    tiles: template.tiles,
    playerSpawn: { ...template.playerSpawn },
    goal: { ...template.goal },
    enemySpawns: template.enemySpawns.map((spawn) => ({ ...spawn })),
    itemSpawns: template.itemSpawns.map((spawn) => ({ ...spawn })),
    questionBlocks: new Map(template.questionBlocks.map((block) => [tileKey(block.tx, block.ty), { ...block }])),
    coinTarget: template.coinTarget
  };
};

export const getTileType = (level, tx, ty) => {
  if (!level || tx < 0 || ty < 0 || tx >= level.width || ty >= level.height) {
    return TILE_TYPES.EMPTY;
  }
  return level.tiles[ty][tx] || TILE_TYPES.EMPTY;
};

export const isSolidTile = (tileType) => SOLID_TILES.has(tileType);
export const isOneWayTile = (tileType) => ONEWAY_TILES.has(tileType);
export const isSupportTile = (tileType) => isSolidTile(tileType) || isOneWayTile(tileType);

export const getWorldWidth = (level) => level.width * level.tileSize;
export const getWorldHeight = (level) => level.height * level.tileSize;

export const spawnToWorldPosition = (level, spawn, width, height) => ({
  x: spawn.x * level.tileSize + (level.tileSize - width) / 2,
  y: spawn.y * level.tileSize + (level.tileSize - height)
});

export const goalToWorldRect = (level) => {
  const width = 26;
  const height = 66;
  return {
    x: level.goal.x * level.tileSize + (level.tileSize - width) / 2,
    y: level.goal.y * level.tileSize + (level.tileSize - height),
    w: width,
    h: height
  };
};
