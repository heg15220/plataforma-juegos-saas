import {
  BASE_GRAVITY,
  BASE_JUMP_VELOCITY,
  CEILING_Y,
  COYOTE_SECONDS,
  GROUND_Y,
  INVULNERABILITY_SECONDS,
  JUMP_BUFFER_SECONDS,
  MAX_CHARGE,
  PLAYER_RADIUS,
  START_X,
} from "./constants";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function overlapCircleRect(cx, cy, r, rect) {
  const nearestX = clamp(cx, rect.x, rect.x + rect.w);
  const nearestY = clamp(cy, rect.y, rect.y + rect.h);
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy <= r * r;
}

function obstacleBlocksPhase(obstacle, phase) {
  return obstacle.phase === "both" || obstacle.phase === phase;
}

function createTrail(maxSegments = 24) {
  const items = new Array(maxSegments);
  for (let i = 0; i < maxSegments; i += 1) {
    items[i] = { x: START_X, y: GROUND_Y - PLAYER_RADIUS, a: 0, s: 1 };
  }
  return {
    items,
    cursor: 0,
    emitTimer: 0,
  };
}

export function createPlayerState() {
  return {
    x: START_X,
    y: GROUND_Y - PLAYER_RADIUS,
    vy: 0,
    onGround: true,
    coyote: COYOTE_SECONDS,
    jumpBuffer: 0,
    invulnerability: 0,
    squash: 0,
    stretch: 0,
    tilt: 0,
    trail: createTrail(),
  };
}

export function createGhostState() {
  return {
    active: false,
    x: START_X,
    y: GROUND_Y - PLAYER_RADIUS,
    vy: 0,
    onGround: true,
    coyote: COYOTE_SECONDS,
    jumpBuffer: 0,
    inputCursor: 0,
    source: null,
  };
}

export function resetPlayerState(player) {
  player.x = START_X;
  player.y = GROUND_Y - PLAYER_RADIUS;
  player.vy = 0;
  player.onGround = true;
  player.coyote = COYOTE_SECONDS;
  player.jumpBuffer = 0;
  player.invulnerability = 0;
  player.squash = 0;
  player.stretch = 0;
  player.tilt = 0;
  player.trail.emitTimer = 0;
  player.trail.cursor = 0;
  for (const segment of player.trail.items) {
    segment.x = player.x;
    segment.y = player.y;
    segment.a = 0;
    segment.s = 1;
  }
}

function pushTrail(player) {
  const trail = player.trail;
  const segment = trail.items[trail.cursor];
  segment.x = player.x;
  segment.y = player.y;
  segment.a = 1;
  segment.s = 1 + Math.abs(player.vy) * 0.00035;
  trail.cursor = (trail.cursor + 1) % trail.items.length;
}

function decayTrail(player, dt) {
  for (const segment of player.trail.items) {
    segment.a = Math.max(0, segment.a - dt * 2.35);
    segment.s = Math.max(0.5, segment.s - dt * 0.64);
  }
}

export function resetFrameEvents(events) {
  events.jumped = false;
  events.landed = false;
  events.damage = false;
  events.collidedObstacle = null;
  events.collectedPickups = 0;
  events.lastCollectedValue = 0;
}

export function evaluateJumpIntent(state, events) {
  const { player } = state;
  if (state.input.jumpPressed) {
    player.jumpBuffer = JUMP_BUFFER_SECONDS;
  }
  if (player.jumpBuffer <= 0) {
    return;
  }
  if (!player.onGround && player.coyote <= 0) {
    return;
  }

  player.jumpBuffer = 0;
  player.vy = BASE_JUMP_VELOCITY * state.jumpVelocityScale;
  player.onGround = false;
  player.coyote = 0;
  player.stretch = 0.34;
  player.squash = 0;
  events.jumped = true;
}

export function performBurst(state, difficulty, events) {
  const { player, obstacles } = state;
  let nearest = null;
  let nearestDist = Number.POSITIVE_INFINITY;
  const maxDistance = difficulty.burstRange;

  for (const obstacle of obstacles) {
    if (obstacle.disabled || obstacle.type === "finish-beacon") {
      continue;
    }
    if (!obstacleBlocksPhase(obstacle, state.phase.active)) {
      continue;
    }
    const dx = obstacle.x - player.x;
    if (dx < -20 || dx > maxDistance) {
      continue;
    }
    if (dx < nearestDist) {
      nearest = obstacle;
      nearestDist = dx;
    }
  }

  if (!nearest) {
    return null;
  }

  nearest.disabled = true;
  state.charge = clamp(state.charge - difficulty.burstCost, 0, MAX_CHARGE);
  events.collidedObstacle = nearest;
  return nearest;
}

function applyDamage(state, events) {
  const player = state.player;
  player.invulnerability = INVULNERABILITY_SECONDS;
  player.vy = -320;
  player.squash = 0.35;
  player.stretch = 0;
  state.integrity = Math.max(0, state.integrity - 1);
  events.damage = true;
}

function updatePlayerKinematics(state, dt, difficulty, events) {
  const player = state.player;
  const comboValue = state.score?.combo ?? 0;
  const speed = Math.min(difficulty.maxSpeed, difficulty.worldSpeed + comboValue * 3.2);
  state.worldSpeed = speed;
  player.x += speed * dt;

  player.coyote = player.onGround ? COYOTE_SECONDS : Math.max(0, player.coyote - dt);
  player.invulnerability = Math.max(0, player.invulnerability - dt);
  player.jumpBuffer = Math.max(0, player.jumpBuffer - dt);

  player.vy += BASE_GRAVITY * dt;
  player.y += player.vy * dt;

  const floorY = GROUND_Y - PLAYER_RADIUS;
  const ceilingY = CEILING_Y + PLAYER_RADIUS;

  if (player.y < ceilingY) {
    player.y = ceilingY;
    player.vy = Math.max(0, player.vy * 0.2);
  }

  if (player.y >= floorY) {
    const wasGrounded = player.onGround;
    player.y = floorY;
    if (player.vy > 160 && !wasGrounded) {
      events.landed = true;
      player.squash = Math.min(0.42, 0.2 + player.vy * 0.00023);
    }
    player.vy = 0;
    player.onGround = true;
  } else {
    player.onGround = false;
  }

  player.stretch = Math.max(0, player.stretch - dt * 2.8);
  player.squash = Math.max(0, player.squash - dt * 3.2);
  player.tilt = clamp(player.vy * 0.0011, -0.35, 0.35);

  player.trail.emitTimer -= dt;
  if (player.trail.emitTimer <= 0) {
    player.trail.emitTimer = 0.028;
    pushTrail(player);
  }
  decayTrail(player, dt);
}

function evaluateObstacleCollisions(state, events) {
  const { player, obstacles } = state;
  const activePhase = state.phase.active;
  const queryMinX = player.x - PLAYER_RADIUS - 24;
  const queryMaxX = player.x + PLAYER_RADIUS + 120;

  while (
    state.obstacleCursor < obstacles.length &&
    obstacles[state.obstacleCursor].x + obstacles[state.obstacleCursor].w < queryMinX
  ) {
    state.obstacleCursor += 1;
  }

  if (player.invulnerability > 0) {
    return;
  }

  for (let i = state.obstacleCursor; i < obstacles.length; i += 1) {
    const obstacle = obstacles[i];
    if (obstacle.disabled || obstacle.type === "finish-beacon") {
      continue;
    }
    if (obstacle.x > queryMaxX) {
      break;
    }
    if (!obstacleBlocksPhase(obstacle, activePhase)) {
      continue;
    }
    if (
      overlapCircleRect(player.x, player.y, PLAYER_RADIUS, {
        x: obstacle.x,
        y: obstacle.y,
        w: obstacle.w,
        h: obstacle.h,
      })
    ) {
      events.collidedObstacle = obstacle;
      applyDamage(state, events);
      return;
    }
  }
}

function evaluatePickupCollection(state, events) {
  const { player, pickups } = state;
  const queryMax = player.x + 160;

  while (state.pickupCursor < pickups.length && pickups[state.pickupCursor].x < player.x - 44) {
    state.pickupCursor += 1;
  }

  for (let i = state.pickupCursor; i < pickups.length; i += 1) {
    const pickup = pickups[i];
    if (pickup.collected) {
      continue;
    }
    if (pickup.x > queryMax) {
      break;
    }
    const dx = pickup.x - player.x;
    const dy = pickup.y - player.y;
    const rr = pickup.r + PLAYER_RADIUS;
    if (dx * dx + dy * dy <= rr * rr) {
      pickup.collected = true;
      events.collectedPickups += 1;
      events.lastCollectedValue = pickup.value;
      state.charge = clamp(state.charge + 0.34 * pickup.value, 0, MAX_CHARGE);
    }
  }
}

export function stepPhysics(state, dt, difficulty, events) {
  evaluateJumpIntent(state, events);
  updatePlayerKinematics(state, dt, difficulty, events);
  evaluateObstacleCollisions(state, events);
  evaluatePickupCollection(state, events);
}

function updateGhostJumpIntent(ghost) {
  if (ghost.jumpBuffer <= 0) {
    return;
  }
  if (!ghost.onGround && ghost.coyote <= 0) {
    return;
  }
  ghost.jumpBuffer = 0;
  ghost.vy = BASE_JUMP_VELOCITY;
  ghost.onGround = false;
  ghost.coyote = 0;
}

export function updateGhostReplay(ghost, dt, elapsed, worldSpeed) {
  if (!ghost.active || !ghost.source) {
    return;
  }

  while (ghost.inputCursor < ghost.source.events.length) {
    const event = ghost.source.events[ghost.inputCursor];
    if (event.time > elapsed) {
      break;
    }
    if (event.type === "jump") {
      ghost.jumpBuffer = JUMP_BUFFER_SECONDS;
    }
    ghost.inputCursor += 1;
  }

  updateGhostJumpIntent(ghost);

  ghost.coyote = ghost.onGround ? COYOTE_SECONDS : Math.max(0, ghost.coyote - dt);
  ghost.jumpBuffer = Math.max(0, ghost.jumpBuffer - dt);
  ghost.vy += BASE_GRAVITY * dt;
  ghost.y += ghost.vy * dt;
  ghost.x += worldSpeed * dt;

  const floorY = GROUND_Y - PLAYER_RADIUS;
  if (ghost.y >= floorY) {
    ghost.y = floorY;
    ghost.vy = 0;
    ghost.onGround = true;
  } else {
    ghost.onGround = false;
  }

  const ceilingY = CEILING_Y + PLAYER_RADIUS;
  if (ghost.y < ceilingY) {
    ghost.y = ceilingY;
    ghost.vy = Math.max(0, ghost.vy);
  }
}

export function resetGhostReplay(ghost, replay) {
  ghost.active = Boolean(replay && replay.events.length);
  ghost.x = START_X;
  ghost.y = GROUND_Y - PLAYER_RADIUS;
  ghost.vy = 0;
  ghost.onGround = true;
  ghost.coyote = COYOTE_SECONDS;
  ghost.jumpBuffer = 0;
  ghost.inputCursor = 0;
  ghost.source = replay || null;
}

export function getObstaclePhaseEnabled(obstacle, phase) {
  return obstacleBlocksPhase(obstacle, phase);
}
