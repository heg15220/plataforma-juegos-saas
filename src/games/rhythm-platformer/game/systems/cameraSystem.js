import { CANVAS_WIDTH, SCREEN_PLAYER_X } from "../constants";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function createCameraState() {
  return {
    x: 0,
    y: 0,
    targetX: 0,
    zoom: 1,
    beatZoom: 0,
    shakeX: 0,
    shakeY: 0,
    farOffset: 0,
    midOffset: 0,
    fgOffset: 0,
  };
}

export function updateCamera(camera, runtimeState, fx, dt) {
  camera.targetX = Math.max(0, runtimeState.player.x - SCREEN_PLAYER_X);
  const followLerp = 1 - Math.exp(-dt * 9.5);
  camera.x += (camera.targetX - camera.x) * followLerp;

  const speedNorm = clamp(runtimeState.worldSpeed / 480, 0, 1.2);
  const beatPush = runtimeState.beat.pulse * 0.012;
  camera.beatZoom = camera.beatZoom * (1 - dt * 6) + beatPush;
  camera.zoom = 1 + speedNorm * 0.01 + camera.beatZoom;

  camera.shakeX += (fx.shakeX - camera.shakeX) * (1 - Math.exp(-dt * 18));
  camera.shakeY += (fx.shakeY - camera.shakeY) * (1 - Math.exp(-dt * 18));

  camera.farOffset = (camera.x * 0.16 + fx.beatBloom * CANVAS_WIDTH * 0.3) % CANVAS_WIDTH;
  camera.midOffset = (camera.x * 0.42 + runtimeState.beat.pulse * 18) % 72;
  camera.fgOffset = (camera.x * 0.9) % 96;
}

export function worldToScreenX(camera, worldX) {
  return worldX - camera.x + camera.shakeX;
}
