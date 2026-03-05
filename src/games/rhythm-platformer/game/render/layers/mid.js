import { BEAT_SECONDS, CANVAS_HEIGHT, CANVAS_WIDTH, CEILING_Y, GROUND_Y } from "../../constants";

export function drawMidLayer(ctx, runtime, camera, palette) {
  const gridY = GROUND_Y + 4;
  const spacing = 52;

  ctx.strokeStyle = "rgba(53, 142, 199, 0.23)";
  ctx.lineWidth = 1;
  for (let y = gridY; y < CANVAS_HEIGHT + 80; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y + 28);
    ctx.stroke();
  }

  for (let x = -camera.midOffset - spacing; x < CANVAS_WIDTH + spacing; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, gridY);
    ctx.lineTo(x, CANVAS_HEIGHT);
    ctx.stroke();
  }

  const laneSpacing = runtime.worldSpeed * BEAT_SECONDS;
  const phase = camera.x % laneSpacing;
  for (let x = -phase - laneSpacing; x < CANVAS_WIDTH + laneSpacing; x += laneSpacing) {
    const laneIntensity = 0.14 + runtime.beat.pulse * 0.18;
    ctx.strokeStyle = `rgba(123, 234, 255, ${laneIntensity.toFixed(3)})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, CEILING_Y);
    ctx.lineTo(x, GROUND_Y);
    ctx.stroke();

    ctx.strokeStyle = palette.laneSoft;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, CEILING_Y + 24);
    ctx.lineTo(x, GROUND_Y - 24);
    ctx.stroke();
  }

  const pulseStripe = 14 + runtime.beat.pulse * 24;
  ctx.fillStyle = `rgba(104, 230, 255, ${(0.07 + runtime.beat.pulse * 0.08).toFixed(3)})`;
  ctx.fillRect(0, GROUND_Y - pulseStripe, CANVAS_WIDTH, pulseStripe);
}
