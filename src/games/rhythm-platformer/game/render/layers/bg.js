import { CANVAS_HEIGHT, CANVAS_WIDTH, GROUND_Y } from "../../constants";

export function drawBackgroundLayer(ctx, runtime, camera, palette, cache) {
  if (!cache.bgGradient) {
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, palette.bgTop);
    gradient.addColorStop(1, palette.bgBottom);
    cache.bgGradient = gradient;
  }

  ctx.fillStyle = cache.bgGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const farShift = camera.farOffset;
  ctx.fillStyle = "rgba(116, 172, 255, 0.12)";
  for (let x = -farShift - 220; x < CANVAS_WIDTH + 260; x += 220) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y - 24);
    ctx.lineTo(x + 110, 142 + (x % 4) * 8);
    ctx.lineTo(x + 220, GROUND_Y - 24);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = "rgba(123, 220, 255, 0.06)";
  for (let x = -farShift * 1.45 - 260; x < CANVAS_WIDTH + 280; x += 260) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y + 10);
    ctx.lineTo(x + 132, 204 + (x % 3) * 10);
    ctx.lineTo(x + 264, GROUND_Y + 10);
    ctx.closePath();
    ctx.fill();
  }

  const fogAlpha = 0.08 + runtime.beat.pulse * 0.06 + runtime.fx.beatBloom * 0.12;
  ctx.fillStyle = `rgba(162, 223, 255, ${fogAlpha.toFixed(3)})`;
  ctx.fillRect(0, GROUND_Y - 96, CANVAS_WIDTH, 160);

  if (!cache.vignette) {
    const vignette = ctx.createRadialGradient(
      CANVAS_WIDTH * 0.5,
      CANVAS_HEIGHT * 0.42,
      120,
      CANVAS_WIDTH * 0.5,
      CANVAS_HEIGHT * 0.46,
      CANVAS_WIDTH * 0.62
    );
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(1, "rgba(0, 0, 0, 0.5)");
    cache.vignette = vignette;
  }

  ctx.fillStyle = cache.vignette;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}
