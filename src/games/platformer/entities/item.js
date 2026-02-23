import { ITEM_SETTINGS } from "../config";
import { spawnToWorldPosition } from "../levels/levelLoader";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const createItemFromSpawn = (level, spawn, id) => {
  if (spawn.type === "mushroom") {
    const worldSpawn = spawnToWorldPosition(
      level,
      spawn,
      ITEM_SETTINGS.mushroomWidth,
      ITEM_SETTINGS.mushroomHeight
    );
    return {
      id: id || `mushroom-${spawn.x}-${spawn.y}`,
      type: "mushroom",
      x: worldSpawn.x,
      y: worldSpawn.y,
      w: ITEM_SETTINGS.mushroomWidth,
      h: ITEM_SETTINGS.mushroomHeight,
      vx: ITEM_SETTINGS.mushroomSpeed,
      vy: 0,
      direction: 1,
      active: true,
      animationTimer: 0,
      emergeTimer: 0
    };
  }

  const coinSize = ITEM_SETTINGS.coinSize;
  return {
    id: id || `coin-${spawn.x}-${spawn.y}`,
    type: "coin",
    x: spawn.x * level.tileSize + (level.tileSize - coinSize) / 2,
    y: spawn.y * level.tileSize + (level.tileSize - coinSize) / 2,
    w: coinSize,
    h: coinSize,
    vx: 0,
    vy: 0,
    active: true,
    animationTimer: Math.random() * Math.PI * 2
  };
};

export const createQuestionReward = (level, tx, ty, rewardType) => {
  if (rewardType !== "mushroom") {
    return null;
  }
  const worldSpawn = {
    x: tx * level.tileSize + (level.tileSize - ITEM_SETTINGS.mushroomWidth) / 2,
    y: ty * level.tileSize + (level.tileSize - ITEM_SETTINGS.mushroomHeight)
  };

  return {
    id: `reward-mushroom-${tx}-${ty}`,
    type: "mushroom",
    x: worldSpawn.x,
    y: worldSpawn.y,
    w: ITEM_SETTINGS.mushroomWidth,
    h: ITEM_SETTINGS.mushroomHeight,
    vx: ITEM_SETTINGS.mushroomSpeed,
    vy: 0,
    direction: 1,
    active: true,
    animationTimer: 0,
    emergeTimer: 0.28,
    emergeOriginY: worldSpawn.y
  };
};

export const updateItem = (item, dt, level, moveEntityWithCollisions) => {
  if (!item.active) {
    return null;
  }

  item.animationTimer += dt;

  if (item.type === "coin") {
    return null;
  }

  if (item.emergeTimer > 0) {
    item.emergeTimer = Math.max(0, item.emergeTimer - dt);
    item.y -= 44 * dt;
    if (item.emergeTimer <= 0 && Number.isFinite(item.emergeOriginY)) {
      item.y = item.emergeOriginY - item.h - 2;
    }
    return null;
  }

  item.vx = item.direction * ITEM_SETTINGS.mushroomSpeed;
  item.vy += ITEM_SETTINGS.mushroomGravity * dt;
  item.vy = clamp(item.vy, -9999, ITEM_SETTINGS.mushroomMaxFallSpeed);

  const collision = moveEntityWithCollisions(item, level, dt, { allowOneWay: true });
  if (collision.hitLeft) {
    item.direction = 1;
  } else if (collision.hitRight) {
    item.direction = -1;
  }
  if (collision.fellOut) {
    item.active = false;
  }

  return collision;
};

