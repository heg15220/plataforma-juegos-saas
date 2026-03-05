import { CANVAS_WIDTH } from "../../constants";

export function drawUiOverlays(ctx, runtime, palette) {
  if (runtime.score.lastJudgement !== "none") {
    const alpha = Math.max(0, runtime.score.lastJudgementTimer / 0.36);
    const y = 92 - (1 - alpha) * 18;

    let color = palette.good;
    let label = "GOOD";
    if (runtime.score.lastJudgement === "perfect") {
      color = palette.perfect;
      label = "PERFECT";
    } else if (runtime.score.lastJudgement === "miss") {
      color = palette.miss;
      label = "MISS";
    }

    ctx.textAlign = "center";
    ctx.font = "700 30px 'Bricolage Grotesque', sans-serif";
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fillText(label, CANVAS_WIDTH * 0.5, y);
    ctx.globalAlpha = 1;
  }

  if (runtime.phase.justShiftedTimer > 0) {
    const alpha = Math.min(1, runtime.phase.justShiftedTimer / 0.34);
    const phaseColor = runtime.phase.active === "A" ? "#79dcff" : "#ffd082";
    ctx.textAlign = "right";
    ctx.font = "600 16px 'Outfit', sans-serif";
    ctx.fillStyle = phaseColor;
    ctx.globalAlpha = alpha;
    ctx.fillText(`Phase ${runtime.phase.active}`, CANVAS_WIDTH - 24, 36);
    ctx.globalAlpha = 1;
  }
}
