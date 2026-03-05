import { CANVAS_HEIGHT, CANVAS_WIDTH, GROUND_Y } from "../../constants";

function ensureDust(cache) {
  if (cache.dustPoints) {
    return;
  }
  cache.dustPoints = new Array(90);
  for (let i = 0; i < cache.dustPoints.length; i += 1) {
    cache.dustPoints[i] = {
      x: (i * 73) % (CANVAS_WIDTH + 240),
      y: GROUND_Y - 8 - ((i * 29) % 150),
      size: 1 + (i % 3) * 0.8,
      phase: (i * 0.73) % (Math.PI * 2),
    };
  }
}

export function drawForegroundLayer(ctx, runtime, camera, cache, reduceMotion) {
  ensureDust(cache);

  const driftSpeed = reduceMotion ? 0.25 : 0.8;
  const parallaxShift = camera.fgOffset * 0.45;

  ctx.fillStyle = "rgba(194, 237, 255, 0.28)";
  for (const dust of cache.dustPoints) {
    let x = (dust.x - parallaxShift * driftSpeed) % (CANVAS_WIDTH + 220);
    if (x < -12) {
      x += CANVAS_WIDTH + 220;
    }
    const bob = Math.sin(runtime.elapsed * (reduceMotion ? 0.8 : 1.4) + dust.phase) * (reduceMotion ? 0.8 : 2.2);
    ctx.beginPath();
    ctx.arc(x - 110, dust.y + bob, dust.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(7, 15, 25, 0.24)";
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
}
