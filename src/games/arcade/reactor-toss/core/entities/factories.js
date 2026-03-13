import { BALL_RADIUS } from "../physics/constants";

export function createBall(spawn) {
  return {
    active: false,
    x: spawn.x,
    y: spawn.y,
    prevX: spawn.x,
    prevY: spawn.y,
    vx: 0,
    vy: 0,
    radius: BALL_RADIUS,
    rotation: 0,
    angularVelocity: 0,
    stretchX: 1,
    stretchY: 1,
    timeAliveMs: 0,
    stillMs: 0,
    targetDwellMs: 0,
    portalLockMs: 0,
    trail: [],
  };
}

export function createRunStats(levelId) {
  return {
    levelId,
    attempts: 1,
    launches: 0,
    rebounds: 0,
    cleanBounces: 0,
    elapsedMs: 0,
    bestShotMs: null,
    result: "none",
    nearMisses: 0,
    firstAttempt: true,
  };
}

export function createTransientFlags() {
  return {
    pointerId: null,
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragCurrentX: 0,
    dragCurrentY: 0,
    previewDots: [],
    impactFlashMs: 0,
    resultTimerMs: 0,
    justLaunchedMs: 0,
    cameraShake: 0,
    lastBounceAtMs: 0,
    message: "",
    callout: "",
  };
}
