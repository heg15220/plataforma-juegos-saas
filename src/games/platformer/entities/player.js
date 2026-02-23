import { PLAYER_SETTINGS } from "../config";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const createPlayer = (spawn) => ({
  x: spawn.x,
  y: spawn.y,
  w: PLAYER_SETTINGS.width,
  h: PLAYER_SETTINGS.height,
  vx: 0,
  vy: 0,
  onGround: false,
  facing: "right",
  jumpBufferTimer: 0,
  coyoteTimer: 0,
  jumpHoldTimer: 0,
  canShortHop: false,
  invulnerableTimer: 0,
  fireCooldownTimer: 0,
  powerLevel: 0,
  animation: "idle",
  animationTimer: 0
});

export const resetPlayer = (player, spawn, options = {}) => {
  player.x = spawn.x;
  player.y = spawn.y;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  player.jumpBufferTimer = 0;
  player.coyoteTimer = 0;
  player.jumpHoldTimer = 0;
  player.canShortHop = false;
  player.fireCooldownTimer = 0;
  player.invulnerableTimer = options.invulnerable ? PLAYER_SETTINGS.invulnerableSeconds : 0;
  if (!options.keepPower) {
    player.powerLevel = 0;
  }
  player.animation = "idle";
  player.animationTimer = 0;
};

export const queueJump = (player) => {
  player.jumpBufferTimer = PLAYER_SETTINGS.jumpBufferSeconds;
};

export const tickPlayerTimers = (player, dt) => {
  player.jumpBufferTimer = Math.max(0, player.jumpBufferTimer - dt);
  player.fireCooldownTimer = Math.max(0, player.fireCooldownTimer - dt);
  player.invulnerableTimer = Math.max(0, player.invulnerableTimer - dt);
  if (!player.onGround) {
    player.coyoteTimer = Math.max(0, player.coyoteTimer - dt);
  }
  player.animationTimer += dt;
};

export const applyHorizontalInput = (player, axis, dt) => {
  const acceleration = player.onGround
    ? PLAYER_SETTINGS.accelerationGround
    : PLAYER_SETTINGS.accelerationAir;
  const deceleration = player.onGround
    ? PLAYER_SETTINGS.decelerationGround
    : PLAYER_SETTINGS.decelerationAir;

  if (axis !== 0) {
    const targetSpeed = axis * PLAYER_SETTINGS.maxSpeedX;
    if (player.vx < targetSpeed) {
      player.vx = Math.min(targetSpeed, player.vx + acceleration * dt);
    } else if (player.vx > targetSpeed) {
      player.vx = Math.max(targetSpeed, player.vx - acceleration * dt);
    }
    player.facing = axis > 0 ? "right" : "left";
  } else if (player.vx !== 0) {
    const reduction = deceleration * dt;
    if (Math.abs(player.vx) <= reduction) {
      player.vx = 0;
    } else {
      player.vx -= Math.sign(player.vx) * reduction;
    }
  }

  player.vx = clamp(player.vx, -PLAYER_SETTINGS.maxSpeedX, PLAYER_SETTINGS.maxSpeedX);
};

export const tryStartJump = (player) => {
  if (player.jumpBufferTimer <= 0) {
    return false;
  }
  const canJump = player.onGround || player.coyoteTimer > 0;
  if (!canJump) {
    return false;
  }

  player.jumpBufferTimer = 0;
  player.coyoteTimer = 0;
  player.onGround = false;
  player.vy = PLAYER_SETTINGS.jumpVelocity;
  player.jumpHoldTimer = PLAYER_SETTINGS.jumpHoldSeconds;
  player.canShortHop = true;
  return true;
};

export const applyVerticalForces = (player, jumpHeld, dt) => {
  const usingJumpHold = jumpHeld && player.jumpHoldTimer > 0 && player.vy < 0;
  if (usingJumpHold) {
    player.jumpHoldTimer = Math.max(0, player.jumpHoldTimer - dt);
  } else if (!jumpHeld && player.canShortHop && player.vy < 0) {
    player.vy *= PLAYER_SETTINGS.jumpCutMultiplier;
    player.canShortHop = false;
    player.jumpHoldTimer = 0;
  } else {
    player.jumpHoldTimer = Math.max(0, player.jumpHoldTimer - dt);
  }

  const gravityScale = usingJumpHold ? PLAYER_SETTINGS.jumpHoldGravityMultiplier : 1;
  player.vy += PLAYER_SETTINGS.gravity * gravityScale * dt;
  player.vy = clamp(player.vy, -9999, PLAYER_SETTINGS.maxFallSpeed);
};

export const setPlayerGrounded = (player, grounded) => {
  player.onGround = grounded;
  if (grounded) {
    player.coyoteTimer = PLAYER_SETTINGS.coyoteSeconds;
    player.canShortHop = false;
  }
};

export const setPlayerAnimation = (player) => {
  if (player.invulnerableTimer > 0 && player.animation !== "hurt") {
    player.animation = "hurt";
    return;
  }

  if (!player.onGround) {
    player.animation = "jump";
    return;
  }

  if (Math.abs(player.vx) > 26) {
    player.animation = "run";
    return;
  }
  player.animation = "idle";
};

export const canShootProjectile = (player) =>
  player.powerLevel > 0 && player.fireCooldownTimer <= 0;

export const markProjectileFired = (player) => {
  player.fireCooldownTimer = PLAYER_SETTINGS.fireCooldownSeconds;
};

