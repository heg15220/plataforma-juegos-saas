import { BOSS_SETTINGS, ENEMY_SETTINGS } from "../config";
import { getTileType, isSupportTile, spawnToWorldPosition } from "../levels/levelLoader";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const randomRange = (min, max) => min + Math.random() * Math.max(0, max - min);

const isBossType = (spawn) => String(spawn.type || "walker").toLowerCase() === "boss";

const baseEnemy = (level, spawn, dimensions, id) => {
  const worldSpawn = spawnToWorldPosition(level, spawn, dimensions.w, dimensions.h);
  const patrolTiles = Math.max(2, Number(spawn.patrol) || 5);
  return {
    id: id || `enemy-${spawn.x}-${spawn.y}`,
    x: worldSpawn.x,
    y: worldSpawn.y,
    w: dimensions.w,
    h: dimensions.h,
    vx: 0,
    vy: 0,
    direction: 1,
    patrolMinX: Math.max(0, (spawn.x - patrolTiles) * level.tileSize),
    patrolMaxX: (spawn.x + patrolTiles + 1) * level.tileSize,
    onGround: false,
    active: true,
    animationFrame: 0,
    animationTimer: 0
  };
};

export const createEnemyFromSpawn = (level, spawn, id) => {
  if (isBossType(spawn)) {
    const boss = baseEnemy(
      level,
      spawn,
      { w: BOSS_SETTINGS.width, h: BOSS_SETTINGS.height },
      id
    );
    boss.type = "boss";
    boss.name = spawn.name || "Arena Warden";
    boss.speed = Math.max(24, Number(spawn.speed) || BOSS_SETTINGS.walkSpeed);
    boss.chargeSpeed = Math.max(boss.speed + 28, Number(spawn.chargeSpeed) || BOSS_SETTINGS.chargeSpeed);
    boss.gravity = BOSS_SETTINGS.gravity;
    boss.maxFallSpeed = BOSS_SETTINGS.maxFallSpeed;
    boss.jumpVelocity = BOSS_SETTINGS.jumpVelocity;
    boss.maxHealth = Math.max(4, Number(spawn.health) || BOSS_SETTINGS.maxHealth);
    boss.health = boss.maxHealth;
    boss.contactDamage = Math.max(1, Number(spawn.contactDamage) || 1);
    boss.damageCooldownTimer = 0;
    boss.hurtCooldown = BOSS_SETTINGS.hurtCooldownSeconds;
    boss.flashTimer = 0;
    boss.aiDecisionTimer = randomRange(
      BOSS_SETTINGS.aiDecisionSecondsMin,
      BOSS_SETTINGS.aiDecisionSecondsMax
    );
    boss.chargeTimer = 0;
    boss.jumpCooldownTimer = randomRange(0.3, BOSS_SETTINGS.jumpCooldownSeconds);
    return boss;
  }

  const walker = baseEnemy(
    level,
    spawn,
    { w: ENEMY_SETTINGS.width, h: ENEMY_SETTINGS.height },
    id
  );
  walker.type = "walker";
  walker.speed = Math.max(24, Number(spawn.speed) || ENEMY_SETTINGS.walkSpeed);
  walker.vx = walker.speed;
  walker.maxFallSpeed = ENEMY_SETTINGS.maxFallSpeed;
  return walker;
};

const hasGroundAhead = (enemy, level) => {
  const lookAheadX = enemy.direction > 0 ? enemy.x + enemy.w + 1 : enemy.x - 1;
  const lookAheadY = enemy.y + enemy.h + 2;
  const tx = Math.floor(lookAheadX / level.tileSize);
  const ty = Math.floor(lookAheadY / level.tileSize);
  const tileType = getTileType(level, tx, ty);
  return isSupportTile(tileType);
};

const clampEnemyPatrol = (enemy) => {
  if (enemy.x < enemy.patrolMinX) {
    enemy.x = enemy.patrolMinX;
    enemy.direction = 1;
  }
  if (enemy.x + enemy.w > enemy.patrolMaxX) {
    enemy.x = enemy.patrolMaxX - enemy.w;
    enemy.direction = -1;
  }
};

const handleEnemyTileBounce = (enemy, collision) => {
  if (collision.hitLeft) {
    enemy.direction = 1;
  } else if (collision.hitRight) {
    enemy.direction = -1;
  }
};

const updateWalkerEnemy = (enemy, dt, level, moveEntityWithCollisions) => {
  enemy.vx = enemy.direction * enemy.speed;
  enemy.vy += ENEMY_SETTINGS.gravity * dt;
  enemy.vy = clamp(enemy.vy, -9999, enemy.maxFallSpeed || ENEMY_SETTINGS.maxFallSpeed);

  const collision = moveEntityWithCollisions(enemy, level, dt, { allowOneWay: true });
  enemy.onGround = collision.landed;

  handleEnemyTileBounce(enemy, collision);
  clampEnemyPatrol(enemy);

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

const updateBossEnemy = (enemy, dt, level, moveEntityWithCollisions, context = {}) => {
  const player = context.player || null;

  enemy.damageCooldownTimer = Math.max(0, enemy.damageCooldownTimer - dt);
  enemy.flashTimer = Math.max(0, enemy.flashTimer - dt);
  enemy.aiDecisionTimer = Math.max(0, enemy.aiDecisionTimer - dt);
  enemy.chargeTimer = Math.max(0, enemy.chargeTimer - dt);
  enemy.jumpCooldownTimer = Math.max(0, enemy.jumpCooldownTimer - dt);

  if (enemy.aiDecisionTimer <= 0) {
    if (player) {
      const bossCenter = enemy.x + enemy.w * 0.5;
      const playerCenter = player.x + player.w * 0.5;
      enemy.direction = playerCenter >= bossCenter ? 1 : -1;
    } else {
      enemy.direction *= -1;
    }
    enemy.aiDecisionTimer = randomRange(
      BOSS_SETTINGS.aiDecisionSecondsMin,
      BOSS_SETTINGS.aiDecisionSecondsMax
    );
    enemy.chargeTimer = randomRange(0.35, 0.86);
  }

  if (
    enemy.onGround &&
    enemy.jumpCooldownTimer <= 0 &&
    player &&
    Math.abs((player.x + player.w * 0.5) - (enemy.x + enemy.w * 0.5)) < level.tileSize * 8
  ) {
    enemy.vy = enemy.jumpVelocity;
    enemy.jumpCooldownTimer = BOSS_SETTINGS.jumpCooldownSeconds;
  }

  enemy.vx = enemy.direction * (enemy.chargeTimer > 0 ? enemy.chargeSpeed : enemy.speed);
  enemy.vy += enemy.gravity * dt;
  enemy.vy = clamp(enemy.vy, -9999, enemy.maxFallSpeed);

  const collision = moveEntityWithCollisions(enemy, level, dt, { allowOneWay: true });
  enemy.onGround = collision.landed;

  handleEnemyTileBounce(enemy, collision);
  clampEnemyPatrol(enemy);

  if (enemy.onGround && !hasGroundAhead(enemy, level)) {
    enemy.direction *= -1;
  }

  enemy.animationTimer += dt;
  enemy.animationFrame = Math.floor(enemy.animationTimer * 7) % 2;

  if (collision.fellOut) {
    enemy.active = false;
    enemy.health = 0;
  }

  return collision;
};

export const updateEnemy = (enemy, dt, level, moveEntityWithCollisions, context = {}) => {
  if (!enemy.active) {
    return null;
  }

  if (enemy.type === "boss") {
    return updateBossEnemy(enemy, dt, level, moveEntityWithCollisions, context);
  }

  return updateWalkerEnemy(enemy, dt, level, moveEntityWithCollisions);
};

export const isBossEnemy = (enemy) => Boolean(enemy?.active && enemy.type === "boss");

export const applyEnemyDamage = (enemy, damage = 1) => {
  if (!enemy?.active) {
    return { applied: false, defeated: false, remainingHealth: 0 };
  }

  if (enemy.type !== "boss") {
    defeatEnemy(enemy);
    return { applied: true, defeated: true, remainingHealth: 0 };
  }

  if (enemy.damageCooldownTimer > 0) {
    return { applied: false, defeated: false, remainingHealth: enemy.health };
  }

  const safeDamage = Math.max(1, Math.floor(Number(damage) || 1));
  enemy.health = Math.max(0, enemy.health - safeDamage);
  enemy.damageCooldownTimer = enemy.hurtCooldown || BOSS_SETTINGS.hurtCooldownSeconds;
  enemy.flashTimer = 0.22;

  if (enemy.health <= 0) {
    defeatEnemy(enemy);
    return { applied: true, defeated: true, remainingHealth: 0 };
  }

  return { applied: true, defeated: false, remainingHealth: enemy.health };
};

export const defeatEnemy = (enemy) => {
  enemy.active = false;
  enemy.vx = 0;
  enemy.vy = 0;
  if (enemy.type === "boss") {
    enemy.health = 0;
    enemy.flashTimer = 0;
  }
};
