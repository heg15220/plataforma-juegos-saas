import {
  BALL_RADIUS,
  MAX_AIM_DOTS,
  MAX_BALL_SPEED,
  STAGE_HEIGHT,
  STAGE_WIDTH,
  TARGET_SETTLE_SPEED,
  clamp,
} from "./constants";

const EPSILON = 0.0001;

const sqr = (value) => value * value;

const distance = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

const ballSpeed = (ball) => Math.hypot(ball.vx, ball.vy);

const normalize = (x, y) => {
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length };
};

const closestPointOnSegment = (px, py, x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq <= EPSILON) {
    return { x: x1, y: y1, t: 0 };
  }
  const t = clamp(((px - x1) * dx + (py - y1) * dy) / lenSq, 0, 1);
  return {
    x: x1 + dx * t,
    y: y1 + dy * t,
    t,
  };
};

const rectCollision = (ball, rect) => {
  const nearestX = clamp(ball.x, rect.x - rect.w / 2, rect.x + rect.w / 2);
  const nearestY = clamp(ball.y, rect.y - rect.h / 2, rect.y + rect.h / 2);
  const dx = ball.x - nearestX;
  const dy = ball.y - nearestY;
  const radiusSq = sqr(ball.radius);
  const distSq = dx * dx + dy * dy;
  if (distSq > radiusSq) {
    return null;
  }
  if (distSq > EPSILON) {
    const dist = Math.sqrt(distSq);
    return {
      nx: dx / dist,
      ny: dy / dist,
      penetration: ball.radius - dist,
    };
  }

  const overlapX = rect.w / 2 + ball.radius - Math.abs(ball.x - rect.x);
  const overlapY = rect.h / 2 + ball.radius - Math.abs(ball.y - rect.y);
  if (overlapX < overlapY) {
    return {
      nx: ball.x < rect.x ? -1 : 1,
      ny: 0,
      penetration: overlapX,
    };
  }
  return {
    nx: 0,
    ny: ball.y < rect.y ? -1 : 1,
    penetration: overlapY,
  };
};

const circleCollision = (ball, circle, extraRadius = 0) => {
  const dx = ball.x - circle.x;
  const dy = ball.y - circle.y;
  const radius = ball.radius + circle.radius + extraRadius;
  const distSq = dx * dx + dy * dy;
  if (distSq > radius * radius) {
    return null;
  }
  if (distSq > EPSILON) {
    const dist = Math.sqrt(distSq);
    return {
      nx: dx / dist,
      ny: dy / dist,
      penetration: radius - dist,
    };
  }
  return { nx: 0, ny: -1, penetration: radius };
};

const segmentCollision = (ball, segment) => {
  const closest = closestPointOnSegment(ball.x, ball.y, segment.x1, segment.y1, segment.x2, segment.y2);
  const dx = ball.x - closest.x;
  const dy = ball.y - closest.y;
  const radius = ball.radius + (segment.thickness ?? 0) * 0.5;
  const distSq = dx * dx + dy * dy;
  if (distSq > radius * radius) {
    return null;
  }
  if (distSq > EPSILON) {
    const dist = Math.sqrt(distSq);
    return {
      nx: dx / dist,
      ny: dy / dist,
      penetration: radius - dist,
    };
  }

  const normal = normalize(segment.y1 - segment.y2, segment.x2 - segment.x1);
  return { nx: normal.x, ny: normal.y, penetration: radius };
};

const reflectVelocity = (ball, nx, ny, restitution, friction = 0.02) => {
  const normalSpeed = ball.vx * nx + ball.vy * ny;
  if (normalSpeed >= 0) {
    return 0;
  }

  const tangentX = -ny;
  const tangentY = nx;
  const tangentSpeed = ball.vx * tangentX + ball.vy * tangentY;
  const bouncedNormal = -(1 + restitution) * normalSpeed;
  const dampedTangent = tangentSpeed * Math.max(0, 1 - friction);

  ball.vx = tangentX * dampedTangent + nx * bouncedNormal;
  ball.vy = tangentY * dampedTangent + ny * bouncedNormal;
  return Math.abs(normalSpeed);
};

export function createPortalPairs(obstacles) {
  const pairs = new Map();
  obstacles.forEach((obstacle) => {
    if (obstacle.type !== "portal" || !obstacle.pairId) {
      return;
    }
    const list = pairs.get(obstacle.pairId) ?? [];
    list.push(obstacle);
    pairs.set(obstacle.pairId, list);
  });
  return pairs;
}

export function resolveOscillation(base, movement, clockMs) {
  if (!movement) {
    return { x: base.x, y: base.y };
  }

  const range = movement.max - movement.min;
  const center = movement.min + range / 2;
  const amplitude = range / 2;
  const phase = (movement.phase ?? 0) * Math.PI * 2;
  const t = clockMs / 1000;
  const offset = Math.sin(t * (movement.speed ?? 1) * 0.5 + phase) * amplitude;

  if (movement.axis === "x") {
    return { x: center + offset, y: base.y };
  }
  return { x: base.x, y: center + offset };
}

export function resolveObstaclePose(obstacle, clockMs) {
  if (obstacle.type === "movingBar") {
    return {
      ...obstacle,
      ...resolveOscillation(obstacle, obstacle.movement, clockMs),
    };
  }

  if (obstacle.type === "gate") {
    const periodMs = Math.max(300, obstacle.periodMs ?? 2000);
    const openMs = Math.max(120, Math.min(periodMs, obstacle.openMs ?? 900));
    const phase = ((clockMs + (obstacle.phaseMs ?? 0)) % periodMs + periodMs) % periodMs;
    return {
      ...obstacle,
      open: phase < openMs,
    };
  }

  return obstacle;
}

export function resolveTargetPose(target, clockMs) {
  if (!target?.moving) {
    return target;
  }
  return {
    ...target,
    ...resolveOscillation(target, target.moving, clockMs),
  };
}

export function integrateBall(ball, physicsProfile, dt) {
  ball.prevX = ball.x;
  ball.prevY = ball.y;
  ball.vy += physicsProfile.gravity * dt;
  const damping = Math.max(0, 1 - physicsProfile.drag - physicsProfile.linearDamping * dt);
  ball.vx *= damping;
  ball.vy *= damping;

  const speed = ballSpeed(ball);
  if (speed > MAX_BALL_SPEED) {
    const scale = MAX_BALL_SPEED / speed;
    ball.vx *= scale;
    ball.vy *= scale;
  }

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  ball.rotation += ball.angularVelocity * dt;
  ball.angularVelocity *= Math.max(0.92, 1 - physicsProfile.angularDamping * dt);
  ball.portalLockMs = Math.max(0, ball.portalLockMs - dt * 1000);
}

export function applyFieldForces(ball, obstacle, dt) {
  if (obstacle.type === "fan") {
    const inside =
      ball.x > obstacle.x - obstacle.w / 2 &&
      ball.x < obstacle.x + obstacle.w / 2 &&
      ball.y > obstacle.y - obstacle.h / 2 &&
      ball.y < obstacle.y + obstacle.h / 2;
    if (inside) {
      ball.vx += (obstacle.forceX ?? 0) * dt;
      ball.vy += (obstacle.forceY ?? 0) * dt;
      return { type: "fan" };
    }
    return null;
  }

  if (obstacle.type === "gravityWell") {
    const dx = obstacle.x - ball.x;
    const dy = obstacle.y - ball.y;
    const distSq = dx * dx + dy * dy;
    const radiusSq = sqr(obstacle.radius ?? 80);
    if (distSq < radiusSq && distSq > EPSILON) {
      const pull = (obstacle.strength ?? 64000) / distSq;
      const normal = normalize(dx, dy);
      ball.vx += normal.x * pull * dt;
      ball.vy += normal.y * pull * dt;
      return { type: "gravityWell" };
    }
    return null;
  }

  return null;
}

function resolveRectObstacle(ball, obstacle, physicsProfile) {
  const hit = rectCollision(ball, obstacle);
  if (!hit) {
    return null;
  }

  ball.x += hit.nx * hit.penetration;
  ball.y += hit.ny * hit.penetration;
  const impactSpeed = reflectVelocity(
    ball,
    hit.nx,
    hit.ny,
    obstacle.restitution ?? physicsProfile.restitution,
    physicsProfile.friction
  );
  if (impactSpeed > 0) {
    ball.angularVelocity += Math.min(10, impactSpeed / 90) * (hit.nx * 0.4 - hit.ny * 0.5);
    return { type: "bounce", obstacle, impactSpeed, nx: hit.nx, ny: hit.ny };
  }
  return null;
}

function resolveCircleObstacle(ball, obstacle, physicsProfile) {
  const hit = circleCollision(ball, obstacle);
  if (!hit) {
    return null;
  }

  ball.x += hit.nx * hit.penetration;
  ball.y += hit.ny * hit.penetration;
  const impactSpeed = reflectVelocity(
    ball,
    hit.nx,
    hit.ny,
    obstacle.restitution ?? physicsProfile.restitution,
    physicsProfile.friction
  );
  if (impactSpeed > 0) {
    ball.angularVelocity += Math.min(12, impactSpeed / 80) * 0.7;
    return { type: "bounce", obstacle, impactSpeed, nx: hit.nx, ny: hit.ny };
  }
  return null;
}

function resolveSegmentObstacle(ball, obstacle, physicsProfile) {
  const hit = segmentCollision(ball, obstacle);
  if (!hit) {
    return null;
  }
  ball.x += hit.nx * hit.penetration;
  ball.y += hit.ny * hit.penetration;
  const impactSpeed = reflectVelocity(
    ball,
    hit.nx,
    hit.ny,
    obstacle.restitution ?? physicsProfile.restitution,
    physicsProfile.friction
  );
  if (impactSpeed > 0) {
    ball.angularVelocity += Math.min(11, impactSpeed / 95) * 0.55;
    return { type: "bounce", obstacle, impactSpeed, nx: hit.nx, ny: hit.ny };
  }
  return null;
}

export function stepObstacles(ball, level, posedObstacles, portalPairs, physicsProfile) {
  const events = [];

  posedObstacles.forEach((obstacle) => {
    if (obstacle.type === "fan" || obstacle.type === "gravityWell") {
      return;
    }

    if (obstacle.type === "spikeStrip") {
      if (rectCollision(ball, obstacle)) {
        events.push({ type: "hazard", obstacle });
      }
      return;
    }

    if (obstacle.type === "portal") {
      const hit = circleCollision(ball, obstacle, 2);
      if (hit && ball.portalLockMs <= 0) {
        const siblings = portalPairs.get(obstacle.pairId) ?? [];
        const exit = siblings.find((candidate) => candidate.id !== obstacle.id);
        if (exit) {
          ball.x = exit.x;
          ball.y = exit.y;
          ball.portalLockMs = PORTAL_COOLDOWN_MS;
          events.push({ type: "portal", entry: obstacle, exit });
        }
      }
      return;
    }

    if (obstacle.type === "gate" && obstacle.open) {
      return;
    }

    let event = null;
    if (obstacle.type === "wall" || obstacle.type === "movingBar" || obstacle.type === "stickyPad" || obstacle.type === "gate") {
      event = resolveRectObstacle(ball, obstacle, physicsProfile);
      if (obstacle.type === "stickyPad" && rectCollision(ball, obstacle)) {
        ball.vx *= 0.92;
        ball.vy *= 0.87;
      }
    } else if (obstacle.type === "bumper") {
      event = resolveCircleObstacle(ball, obstacle, physicsProfile);
    } else if (obstacle.type === "ramp") {
      event = resolveSegmentObstacle(ball, obstacle, physicsProfile);
    }

    if (event) {
      events.push(event);
    }
  });

  return events;
}

export function applyTargetForces(ball, target, dt) {
  const speed = ballSpeed(ball);
  const dx = target.x - ball.x;
  const dy = target.y - ball.y;
  const distToCenter = Math.hypot(dx, dy);

  if (distToCenter < (target.magnetRadius ?? 84) && speed < 420) {
    const normal = normalize(dx, dy);
    const attraction = (1 - distToCenter / (target.magnetRadius ?? 84)) * 240;
    ball.vx += normal.x * attraction * dt;
    ball.vy += (normal.y * attraction + 40) * dt;
  }

  const insideInterior =
    ball.x > target.x - target.innerW / 2 &&
    ball.x < target.x + target.innerW / 2 &&
    ball.y > target.y - target.h * 0.08 &&
    ball.y < target.y + target.innerH;

  if (insideInterior) {
    ball.vx *= 0.92;
    ball.vy *= 0.88;
    ball.targetDwellMs += dt * 1000;
    if (ballSpeed(ball) <= (target.settleSpeed ?? TARGET_SETTLE_SPEED) && ball.targetDwellMs >= (target.holdMs ?? 180)) {
      return { insideInterior: true, captured: true, nearMiss: false };
    }
    return { insideInterior: true, captured: false, nearMiss: false };
  }

  ball.targetDwellMs = Math.max(0, ball.targetDwellMs - dt * 1400);

  const nearOpening =
    ball.y > target.y - target.h * 0.28 &&
    ball.y < target.y + target.innerH * 0.32 &&
    Math.abs(ball.x - target.x) < target.innerW / 2 + (target.tolerance ?? 16);

  if (nearOpening && ball.vy > -20) {
    ball.vx += clamp((target.x - ball.x) * 6, -120, 120) * dt;
    ball.vy *= 0.96;
    return { insideInterior: false, captured: false, nearMiss: true };
  }

  return { insideInterior: false, captured: false, nearMiss: false };
}

export function computeBallSquash(ball) {
  const speed = ballSpeed(ball);
  const tension = clamp(speed / 760, 0, 0.22);
  ball.stretchX += (1 + tension - ball.stretchX) * 0.16;
  ball.stretchY += (1 - tension * 0.7 - ball.stretchY) * 0.16;
}

export function isBallOutOfBounds(ball, bounds) {
  return (
    ball.x < bounds.left ||
    ball.x > bounds.right ||
    ball.y < bounds.top ||
    ball.y > bounds.bottom
  );
}

export function buildPreviewDots(level, aim, clockMs, sampleCount = MAX_AIM_DOTS) {
  const physicsProfile = level.physicsProfile;
  const ball = {
    x: level.ballSpawn.x,
    y: level.ballSpawn.y,
    vx: Math.cos((aim.angleDeg * Math.PI) / 180) * aim.launchSpeed,
    vy: Math.sin((aim.angleDeg * Math.PI) / 180) * aim.launchSpeed,
    prevX: level.ballSpawn.x,
    prevY: level.ballSpawn.y,
    radius: BALL_RADIUS,
    angularVelocity: 0,
    targetDwellMs: 0,
    portalLockMs: 0,
  };

  const posedObstacles = level.obstacles.map((obstacle) => resolveObstaclePose(obstacle, clockMs));
  const portalPairs = createPortalPairs(posedObstacles);
  const target = resolveTargetPose(level.target, clockMs);
  const dots = [];

  for (let frame = 0; frame < 240 && dots.length < sampleCount; frame += 1) {
    posedObstacles.forEach((obstacle) => applyFieldForces(ball, obstacle, 1 / 60));
    integrateBall(ball, physicsProfile, 1 / 60);
    stepObstacles(ball, level, posedObstacles, portalPairs, physicsProfile);
    const capture = applyTargetForces(ball, target, 1 / 60);

    if (frame % 8 === 0) {
      dots.push({ x: ball.x, y: ball.y });
    }
    if (capture.captured || isBallOutOfBounds(ball, level.bounds)) {
      break;
    }
  }

  return dots;
}

export function withinStage(ball) {
  return ball.x > -BALL_RADIUS && ball.x < STAGE_WIDTH + BALL_RADIUS && ball.y > -BALL_RADIUS && ball.y < STAGE_HEIGHT + BALL_RADIUS;
}

export function getBallSpeed(ball) {
  return ballSpeed(ball);
}
