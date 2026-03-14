import {
  BOARD_OFFSET_X,
  BOARD_OFFSET_Y,
  BOARD_PIXEL_HEIGHT,
  BOARD_PIXEL_WIDTH,
  BOARD_WIDTH,
  CELL_SIZE,
  HIDDEN_ROWS,
  STAGE_HEIGHT,
  STAGE_WIDTH,
} from "../core/constants";
import { buildVisibleBoard, getPieceCells } from "../core/logic";

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawCell(ctx, x, y, cell, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowBlur = 16;
  ctx.shadowColor = cell.glow || "rgba(255,255,255,0.18)";
  drawRoundedRect(ctx, x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4, 8);
  const body = ctx.createLinearGradient(x, y, x + CELL_SIZE, y + CELL_SIZE);
  body.addColorStop(0, cell.accent);
  body.addColorStop(0.42, cell.color);
  body.addColorStop(1, "rgba(8, 16, 24, 0.86)");
  ctx.fillStyle = body;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 1;
  ctx.stroke();

  if (cell.core) {
    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 251, 222, 0.96)";
    ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, 4.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 174, 96, 0.68)";
    ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawBackground(ctx, dangerRatio) {
  const gradient = ctx.createLinearGradient(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
  gradient.addColorStop(0, "#08202c");
  gradient.addColorStop(0.52, "#12333b");
  gradient.addColorStop(1, "#1a514d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

  const glow = ctx.createRadialGradient(STAGE_WIDTH * 0.17, 88, 10, STAGE_WIDTH * 0.17, 88, 230);
  glow.addColorStop(0, "rgba(255, 175, 92, 0.3)");
  glow.addColorStop(1, "rgba(255, 175, 92, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.045)";
  ctx.lineWidth = 1;
  for (let line = -STAGE_HEIGHT; line < STAGE_WIDTH + STAGE_HEIGHT; line += 34) {
    ctx.beginPath();
    ctx.moveTo(line, 0);
    ctx.lineTo(line + STAGE_HEIGHT, STAGE_HEIGHT);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = dangerRatio > 0.6 ? "rgba(255, 121, 107, 0.12)" : "rgba(95, 232, 201, 0.06)";
  ctx.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
}

function drawBoardShell(ctx, state) {
  drawRoundedRect(ctx, BOARD_OFFSET_X - 24, BOARD_OFFSET_Y - 24, BOARD_PIXEL_WIDTH + 48, BOARD_PIXEL_HEIGHT + 60, 28);
  const shell = ctx.createLinearGradient(0, BOARD_OFFSET_Y - 24, 0, BOARD_OFFSET_Y + BOARD_PIXEL_HEIGHT + 36);
  shell.addColorStop(0, "rgba(9, 23, 32, 0.94)");
  shell.addColorStop(1, "rgba(10, 25, 35, 0.8)");
  ctx.fillStyle = shell;
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = state.dangerState === "critical" ? "rgba(255, 121, 107, 0.58)" : "rgba(106, 223, 199, 0.3)";
  ctx.stroke();

  drawRoundedRect(ctx, BOARD_OFFSET_X - 8, 18, BOARD_PIXEL_WIDTH + 16, 40, 20);
  ctx.fillStyle = "rgba(7, 18, 25, 0.76)";
  ctx.fill();

  ctx.fillStyle = "#f2f8f1";
  ctx.font = "600 16px Trebuchet MS, Segoe UI, sans-serif";
  ctx.fillText(`${state.hudLabels.score}: ${state.score}`, BOARD_OFFSET_X + 14, 42);
  ctx.fillText(`${state.hudLabels.phase}: ${state.phaseLabel}`, BOARD_OFFSET_X + 176, 42);

  ctx.textAlign = "right";
  ctx.fillText(`${state.hudLabels.bands}: ${state.bands}`, BOARD_OFFSET_X + BOARD_PIXEL_WIDTH - 16, 42);
  ctx.textAlign = "left";
}

function drawGrid(ctx) {
  drawRoundedRect(ctx, BOARD_OFFSET_X, BOARD_OFFSET_Y, BOARD_PIXEL_WIDTH, BOARD_PIXEL_HEIGHT, 22);
  ctx.fillStyle = "rgba(7, 15, 20, 0.82)";
  ctx.fill();

  ctx.strokeStyle = "rgba(115, 176, 184, 0.14)";
  ctx.lineWidth = 1;

  for (let column = 0; column <= BOARD_WIDTH; column += 1) {
    const x = BOARD_OFFSET_X + column * CELL_SIZE;
    ctx.beginPath();
    ctx.moveTo(x, BOARD_OFFSET_Y);
    ctx.lineTo(x, BOARD_OFFSET_Y + BOARD_PIXEL_HEIGHT);
    ctx.stroke();
  }

  for (let row = 0; row <= 18; row += 1) {
    const y = BOARD_OFFSET_Y + row * CELL_SIZE;
    ctx.beginPath();
    ctx.moveTo(BOARD_OFFSET_X, y);
    ctx.lineTo(BOARD_OFFSET_X + BOARD_PIXEL_WIDTH, y);
    ctx.stroke();
  }
}

function drawPulseHighlight(ctx, state) {
  if (state.pulseFxMs <= 0 || state.pulseColumn < 0) {
    return;
  }

  const alpha = Math.min(1, state.pulseFxMs / 340);
  const x = BOARD_OFFSET_X + state.pulseColumn * CELL_SIZE;
  const columnGradient = ctx.createLinearGradient(x, BOARD_OFFSET_Y, x + CELL_SIZE, BOARD_OFFSET_Y + BOARD_PIXEL_HEIGHT);
  columnGradient.addColorStop(0, `rgba(255, 228, 146, ${0.18 * alpha})`);
  columnGradient.addColorStop(0.5, `rgba(255, 147, 97, ${0.32 * alpha})`);
  columnGradient.addColorStop(1, `rgba(255, 228, 146, ${0.12 * alpha})`);
  ctx.fillStyle = columnGradient;
  ctx.fillRect(x, BOARD_OFFSET_Y, CELL_SIZE, BOARD_PIXEL_HEIGHT);
}

function drawBoardCells(ctx, state) {
  const visibleBoard = buildVisibleBoard(state.board);
  visibleBoard.forEach((row, visibleRow) => {
    row.forEach((cell, column) => {
      if (!cell) {
        return;
      }
      drawCell(
        ctx,
        BOARD_OFFSET_X + column * CELL_SIZE,
        BOARD_OFFSET_Y + visibleRow * CELL_SIZE,
        cell
      );
    });
  });

  if (!state.activePiece) {
    return;
  }

  getPieceCells(state.activePiece)
    .filter((cell) => cell.y >= HIDDEN_ROWS)
    .forEach((cell) => {
      drawCell(
        ctx,
        BOARD_OFFSET_X + cell.x * CELL_SIZE,
        BOARD_OFFSET_Y + (cell.y - HIDDEN_ROWS) * CELL_SIZE,
        cell,
        state.mode === "menu" ? 0.55 : 1
      );
    });
}

function drawFooter(ctx, state) {
  drawRoundedRect(ctx, 42, STAGE_HEIGHT - 82, STAGE_WIDTH - 84, 44, 18);
  ctx.fillStyle = "rgba(8, 18, 25, 0.72)";
  ctx.fill();

  ctx.fillStyle = "#f0f4ef";
  ctx.font = "600 14px Trebuchet MS, Segoe UI, sans-serif";
  ctx.fillText(state.callout || state.message, 60, STAGE_HEIGHT - 55);

  const pressureWidth = 124;
  const pressureX = STAGE_WIDTH - 60 - pressureWidth;
  ctx.textAlign = "right";
  ctx.fillStyle = "#bfd7d4";
  ctx.fillText(`${state.hudLabels.pressure}: ${state.dangerLabel}`, pressureX - 12, STAGE_HEIGHT - 55);
  ctx.textAlign = "left";

  drawRoundedRect(ctx, pressureX, STAGE_HEIGHT - 69, pressureWidth, 12, 7);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fill();
  drawRoundedRect(ctx, pressureX, STAGE_HEIGHT - 69, pressureWidth * state.dangerRatio, 12, 7);
  ctx.fillStyle = state.dangerState === "critical" ? "#ff7a69" : state.dangerState === "warning" ? "#ffd46b" : "#6ddac9";
  ctx.fill();
}

export default function drawScene(ctx, state) {
  ctx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
  drawBackground(ctx, state.dangerRatio);
  drawBoardShell(ctx, state);
  drawGrid(ctx);
  drawPulseHighlight(ctx, state);
  drawBoardCells(ctx, state);
  drawFooter(ctx, state);

  if (state.clearFlashMs > 0) {
    ctx.fillStyle = `rgba(255, 247, 216, ${Math.min(0.22, state.clearFlashMs / 1000)})`;
    ctx.fillRect(BOARD_OFFSET_X, BOARD_OFFSET_Y, BOARD_PIXEL_WIDTH, BOARD_PIXEL_HEIGHT);
  }
}
