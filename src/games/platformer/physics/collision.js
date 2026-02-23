import {
  getTileType,
  getWorldHeight,
  getWorldWidth,
  isOneWayTile,
  isSolidTile
} from "../levels/levelLoader";

const ONE_WAY_SNAP = 3;

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const aabbIntersects = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

const getTileRangeForBody = (entity, tileSize) => {
  const minTx = Math.floor(entity.x / tileSize);
  const maxTx = Math.floor((entity.x + entity.w - 1) / tileSize);
  const minTy = Math.floor(entity.y / tileSize);
  const maxTy = Math.floor((entity.y + entity.h - 1) / tileSize);
  return { minTx, maxTx, minTy, maxTy };
};

const resolveHorizontal = (entity, level) => {
  let hitLeft = false;
  let hitRight = false;
  const tileSize = level.tileSize;

  if (entity.vx === 0) {
    return { hitLeft, hitRight };
  }

  const worldWidth = getWorldWidth(level);
  const unclamped = entity.x;
  entity.x = clamp(entity.x, 0, Math.max(0, worldWidth - entity.w));
  if (entity.x !== unclamped) {
    if (unclamped < entity.x) {
      hitLeft = true;
    } else {
      hitRight = true;
    }
    entity.vx = 0;
    return { hitLeft, hitRight };
  }

  const { minTy, maxTy } = getTileRangeForBody(entity, tileSize);
  if (entity.vx > 0) {
    const tx = Math.floor((entity.x + entity.w - 1) / tileSize);
    for (let ty = minTy; ty <= maxTy; ty += 1) {
      const tileType = getTileType(level, tx, ty);
      if (!isSolidTile(tileType)) {
        continue;
      }
      const tileLeft = tx * tileSize;
      if (entity.x + entity.w > tileLeft) {
        entity.x = tileLeft - entity.w;
        entity.vx = 0;
        hitRight = true;
        break;
      }
    }
  } else if (entity.vx < 0) {
    const tx = Math.floor(entity.x / tileSize);
    for (let ty = minTy; ty <= maxTy; ty += 1) {
      const tileType = getTileType(level, tx, ty);
      if (!isSolidTile(tileType)) {
        continue;
      }
      const tileRight = tx * tileSize + tileSize;
      if (entity.x < tileRight) {
        entity.x = tileRight;
        entity.vx = 0;
        hitLeft = true;
        break;
      }
    }
  }

  return { hitLeft, hitRight };
};

const resolveVertical = (entity, level, previousY, allowOneWay) => {
  let landed = false;
  let hitCeiling = false;
  let ceilingTile = null;
  const tileSize = level.tileSize;
  const previousTop = previousY;
  const previousBottom = previousY + entity.h;

  if (entity.vy > 0) {
    const startTy = Math.floor(previousBottom / tileSize);
    const endTy = Math.floor((entity.y + entity.h - 1) / tileSize);
    const { minTx, maxTx } = getTileRangeForBody(entity, tileSize);
    for (let ty = startTy; ty <= endTy; ty += 1) {
      for (let tx = minTx; tx <= maxTx; tx += 1) {
        const tileType = getTileType(level, tx, ty);
        const tileTop = ty * tileSize;
        const collideOneWay =
          allowOneWay && isOneWayTile(tileType) && previousBottom <= tileTop + ONE_WAY_SNAP;
        if (!isSolidTile(tileType) && !collideOneWay) {
          continue;
        }
        if (entity.y + entity.h > tileTop) {
          entity.y = tileTop - entity.h;
          entity.vy = 0;
          landed = true;
          return { landed, hitCeiling, ceilingTile };
        }
      }
    }
    return { landed, hitCeiling, ceilingTile };
  }

  if (entity.vy < 0) {
    const startTy = Math.floor(entity.y / tileSize);
    const endTy = Math.floor(previousTop / tileSize);
    const { minTx, maxTx } = getTileRangeForBody(entity, tileSize);
    for (let ty = endTy; ty >= startTy; ty -= 1) {
      for (let tx = minTx; tx <= maxTx; tx += 1) {
        const tileType = getTileType(level, tx, ty);
        if (!isSolidTile(tileType)) {
          continue;
        }
        const tileBottom = ty * tileSize + tileSize;
        if (entity.y < tileBottom) {
          entity.y = tileBottom;
          entity.vy = 0;
          hitCeiling = true;
          ceilingTile = { tx, ty, type: tileType };
          return { landed, hitCeiling, ceilingTile };
        }
      }
    }
  }

  return { landed, hitCeiling, ceilingTile };
};

export const moveEntityWithWorldCollisions = (entity, level, dt, options = {}) => {
  const allowOneWay = options.allowOneWay !== false;
  const worldHeight = getWorldHeight(level);

  const previousY = entity.y;
  entity.x += entity.vx * dt;
  const horizontalResult = resolveHorizontal(entity, level);

  entity.y += entity.vy * dt;
  const verticalResult = resolveVertical(entity, level, previousY, allowOneWay);

  const maxAllowedY = worldHeight + 160;
  entity.y = clamp(entity.y, -level.tileSize * 4, maxAllowedY);

  return {
    ...horizontalResult,
    ...verticalResult,
    fellOut: entity.y >= worldHeight + 64
  };
};

