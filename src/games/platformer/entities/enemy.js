import { ENEMY_SETTINGS } from "../config";
import { getTileType, isSupportTile, spawnToWorldPosition } from "../levels/levelLoader";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const createEnemyFromSpawn = (level, spawn, id) => {
  const worldSpawn = spawnToWorldPosition(level, spawn, ENEMY_SETTINGS.width, ENEMY_SETTINGS.height);
  const patrolTiles = Math.max(1, Number(spawn.patrol) || 4);
  return {
    id: id || `enemy-${spawn.x}-${spawn.y}`,
    type: "walker",
    x: worldSpawn.x,
    y: worldSpawn.y,
    w: ENEMY_SETTINGS.width,
    h: ENEMY_SETTINGS.height,
    vx: ENEMY_SETTINGS.walkSpeed,
    vy: 0,
    speed: ENEMY_SETTINGS.walkSpeed,
    direction: 1,
    patrolMinX: (spawn.x - patrolTiles) * level.tileSize,
    patrolMaxX: (spawn.x + patrolTiles + 1) * level.tileSize,
    onGround: false,
    active: true,
    animationFrame: 0,
    animationTimer: 0
  };
};

const hasGroundAhead = (enemy, level) => {
  const lookAheadX = enemy.direction > 0 ? enemy.x + enemy.w + 1 : enemy.x - 1;
  const lookAheadY = enemy.y + enemy.h + 2;
  const tx = Math.floor(lookAheadX / level.tileSize);
  const ty = Math.floor(lookAheadY / level.tileSize);
  const tileType = getTileType(level, tx, ty);
  return isSupportTile(tileType);
};

export const updateEnemy = (enemy, dt, level, moveEntityWithCollisions) => {
  if (!enemy.active) {
    return null;
  }

  enemy.vx = enemy.direction * enemy.speed;
  enemy.vy += ENEMY_SETTINGS.gravity * dt;
  enemy.vy = clamp(enemy.vy, -9999, ENEMY_SETTINGS.maxFallSpeed);

  const collision = moveEntityWithCollisions(enemy, level, dt, { allowOneWay: true });
  enemy.onGround = collision.landed;

  if (collision.hitLeft) {
    enemy.direction = 1;
  } else if (collision.hitRight) {
    enemy.direction = -1;
  }

  if (enemy.x < enemy.patrolMinX) {
    enemy.x = enemy.patrolMinX;
    enemy.direction = 1;
  }
  if (enemy.x + enemy.w > enemy.patrolMaxX) {
    enemy.x = enemy.patrolMaxX - enemy.w;
    enemy.direction = -1;
  }

  if (enemy.onGround && !hasGroundAhead(enemy, level)) {
    enemy.direction *= -1;
  }

  enemy.animationTimer += dt;
  enemy.animationFrame = Math.floor(enemy.animationTimer * 10) % 2;

  if (collision.fellOut) {
    enemy.active = false;
  }

  return collision;
};

export const defeatEnemy = (enemy) => {
  enemy.active = false;
  enemy.vx = 0;
  enemy.vy = 0;
};

