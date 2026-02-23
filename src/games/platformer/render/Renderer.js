import { SCREENS, VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from "../config";
import { TILE_TYPES, tileKey } from "../levels/levelLoader";

const round = (value) => Math.round(value);

const drawText = (ctx, text, x, y, options = {}) => {
  ctx.save();
  ctx.font = options.font || "14px monospace";
  ctx.fillStyle = options.color || "#ffffff";
  ctx.textAlign = options.align || "left";
  ctx.textBaseline = options.baseline || "alphabetic";
  if (options.shadowColor) {
    ctx.shadowColor = options.shadowColor;
    ctx.shadowBlur = options.shadowBlur || 0;
  }
  ctx.fillText(text, x, y);
  ctx.restore();
};

const drawPanel = (ctx, x, y, w, h, color, border) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  if (border) {
    ctx.strokeStyle = border;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  }
};

const drawCloud = (ctx, x, y, alpha = 0.5) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y + 6, 44, 14);
  ctx.fillRect(x + 8, y, 18, 10);
  ctx.fillRect(x + 24, y + 2, 16, 8);
  ctx.restore();
};

const drawMountain = (ctx, x, baseY, width, height, color) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.lineTo(x + width * 0.5, baseY - height);
  ctx.lineTo(x + width, baseY);
  ctx.closePath();
  ctx.fill();
};

const drawTile = (ctx, tileType, screenX, screenY, size, usedQuestionBlock) => {
  if (tileType === TILE_TYPES.EMPTY) {
    return;
  }

  if (tileType === TILE_TYPES.GROUND) {
    ctx.fillStyle = "#6e4b29";
    ctx.fillRect(screenX, screenY, size, size);
    ctx.fillStyle = "#4f8a3f";
    ctx.fillRect(screenX, screenY, size, 6);
    ctx.fillStyle = "#8ac06a";
    ctx.fillRect(screenX + 1, screenY + 1, size - 2, 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(screenX, screenY + size - 4, size, 4);
    return;
  }

  if (tileType === TILE_TYPES.BRICK) {
    ctx.fillStyle = "#ae5f2f";
    ctx.fillRect(screenX, screenY, size, size);
    ctx.strokeStyle = "#7a3d1a";
    ctx.lineWidth = 1;
    for (let y = 8; y < size; y += 8) {
      ctx.beginPath();
      ctx.moveTo(screenX, screenY + y + 0.5);
      ctx.lineTo(screenX + size, screenY + y + 0.5);
      ctx.stroke();
    }
    for (let x = 8; x < size; x += 16) {
      ctx.beginPath();
      ctx.moveTo(screenX + x + 0.5, screenY);
      ctx.lineTo(screenX + x + 0.5, screenY + size);
      ctx.stroke();
    }
    return;
  }

  if (tileType === TILE_TYPES.PIPE) {
    ctx.fillStyle = "#1c9751";
    ctx.fillRect(screenX + 4, screenY + 2, size - 8, size - 2);
    ctx.fillStyle = "#2fc96c";
    ctx.fillRect(screenX, screenY, size, 8);
    ctx.fillStyle = "#3ee183";
    ctx.fillRect(screenX + 2, screenY + 1, size - 4, 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
    ctx.fillRect(screenX + size - 7, screenY + 2, 3, size - 2);
    return;
  }

  if (tileType === TILE_TYPES.PLATFORM) {
    ctx.fillStyle = "#8a6a44";
    ctx.fillRect(screenX, screenY + 18, size, 8);
    ctx.fillStyle = "#be955f";
    ctx.fillRect(screenX, screenY + 16, size, 3);
    return;
  }

  if (tileType === TILE_TYPES.QUESTION) {
    ctx.fillStyle = usedQuestionBlock ? "#7c6b49" : "#f1bc3a";
    ctx.fillRect(screenX, screenY, size, size);
    ctx.strokeStyle = usedQuestionBlock ? "#594d36" : "#9a6b18";
    ctx.strokeRect(screenX + 1, screenY + 1, size - 2, size - 2);
    ctx.fillStyle = usedQuestionBlock ? "#5d5038" : "#5b4317";
    ctx.fillRect(screenX + 12, screenY + 8, 8, 3);
    ctx.fillRect(screenX + 10, screenY + 12, 4, 3);
    ctx.fillRect(screenX + 16, screenY + 12, 4, 3);
    ctx.fillRect(screenX + 12, screenY + 16, 4, 3);
  }
};

const drawPlayer = (ctx, player, cameraX) => {
  if (!player) {
    return;
  }
  if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer * 14) % 2 === 0) {
    return;
  }

  const x = round(player.x - cameraX);
  const y = round(player.y);
  const running = player.animation === "run";
  const runFrame = running ? Math.floor(player.animationTimer * 12) % 2 : 0;
  const legOffset = running ? (runFrame === 0 ? -2 : 2) : 0;

  ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
  ctx.fillRect(x + 3, y + player.h - 2, player.w - 6, 3);

  ctx.save();
  if (player.facing === "left") {
    ctx.translate(x + player.w, 0);
    ctx.scale(-1, 1);
    ctx.translate(-x, 0);
  }

  ctx.fillStyle = "#f3c5a1";
  ctx.fillRect(x + 7, y + 1, 8, 8);

  ctx.fillStyle = player.powerLevel > 0 ? "#ed4436" : "#2b79d7";
  ctx.fillRect(x + 5, y + 9, 12, 9);

  ctx.fillStyle = "#18324a";
  ctx.fillRect(x + 6 + legOffset, y + 18, 4, 10);
  ctx.fillRect(x + 12 - legOffset, y + 18, 4, 10);

  ctx.fillStyle = "#f3c5a1";
  ctx.fillRect(x + 3, y + 10, 2, 7);
  ctx.fillRect(x + 17, y + 10, 2, 7);

  ctx.fillStyle = "#101820";
  ctx.fillRect(x + 6 + legOffset, y + 27, 5, 3);
  ctx.fillRect(x + 11 - legOffset, y + 27, 5, 3);

  if (player.animation === "jump") {
    ctx.strokeStyle = "rgba(121, 181, 255, 0.7)";
    ctx.strokeRect(x + 1, y + 2, player.w - 2, player.h - 4);
  }
  ctx.restore();
};

const drawEnemy = (ctx, enemy, cameraX) => {
  if (!enemy?.active) {
    return;
  }
  const x = round(enemy.x - cameraX);
  const y = round(enemy.y);
  const step = enemy.animationFrame === 0 ? 0 : 1;

  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.fillRect(x + 4, y + enemy.h - 2, enemy.w - 8, 3);

  ctx.save();
  if (enemy.direction < 0) {
    ctx.translate(x + enemy.w, 0);
    ctx.scale(-1, 1);
    ctx.translate(-x, 0);
  }

  ctx.fillStyle = "#f4b88e";
  ctx.fillRect(x + 8, y + 3, 8, 7);

  ctx.fillStyle = "#c43f3a";
  ctx.fillRect(x + 5, y + 10, 14, 8);

  ctx.fillStyle = "#311016";
  ctx.fillRect(x + 6 + step, y + 18, 5, 6);
  ctx.fillRect(x + 13 - step, y + 18, 5, 6);
  ctx.fillRect(x + 7 + step, y + 24, 4, 2);
  ctx.fillRect(x + 13 - step, y + 24, 4, 2);

  ctx.restore();
};

const drawItem = (ctx, item, cameraX) => {
  if (!item?.active) {
    return;
  }

  const x = round(item.x - cameraX);
  const y = round(item.y);
  if (item.type === "coin") {
    const pulse = Math.sin(item.animationTimer * 8);
    const width = round(item.w * (0.5 + Math.abs(pulse) * 0.45));
    const offset = round((item.w - width) / 2);
    ctx.fillStyle = "#ffe16d";
    ctx.fillRect(x + offset, y, width, item.h);
    ctx.strokeStyle = "#b37d1f";
    ctx.strokeRect(x + offset, y, width, item.h);
    return;
  }

  ctx.fillStyle = "#f4d7b6";
  ctx.fillRect(x + 7, y + 8, 10, 12);
  ctx.fillStyle = "#e34a3e";
  ctx.fillRect(x + 2, y + 2, 20, 8);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 5, y + 4, 4, 3);
  ctx.fillRect(x + 14, y + 4, 4, 3);
};

const drawProjectile = (ctx, projectile, cameraX) => {
  if (!projectile?.active) {
    return;
  }
  const x = round(projectile.x - cameraX);
  const y = round(projectile.y);
  ctx.fillStyle = "#ff7b2f";
  ctx.fillRect(x, y, projectile.w, projectile.h);
  ctx.fillStyle = "#ffd16b";
  ctx.fillRect(x + 2, y + 2, projectile.w - 4, projectile.h - 4);
};

const drawGoal = (ctx, goalRect, cameraX) => {
  if (!goalRect) {
    return;
  }
  const x = round(goalRect.x - cameraX);
  const y = round(goalRect.y);
  ctx.fillStyle = "#75737a";
  ctx.fillRect(x + 10, y, 3, goalRect.h);
  ctx.fillStyle = "#35b9b6";
  ctx.fillRect(x + 13, y + 6, 15, 10);
  ctx.fillStyle = "#79ece7";
  ctx.fillRect(x + 14, y + 7, 10, 3);
};

export default class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.canvas.width = VIEWPORT_WIDTH;
    this.canvas.height = VIEWPORT_HEIGHT;
    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = false;
    }
  }

  drawBackground(state) {
    const ctx = this.ctx;
    const theme = state.level?.theme || "day";
    const cameraX = state.camera.x || 0;

    const gradient = ctx.createLinearGradient(0, 0, 0, VIEWPORT_HEIGHT);
    if (theme === "dusk") {
      gradient.addColorStop(0, "#2f355f");
      gradient.addColorStop(0.5, "#4f4e78");
      gradient.addColorStop(1, "#ffaf65");
    } else {
      gradient.addColorStop(0, "#68d3ff");
      gradient.addColorStop(0.6, "#a2e9ff");
      gradient.addColorStop(1, "#fff0a8");
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    if (theme === "dusk") {
      ctx.fillStyle = "rgba(255, 248, 223, 0.85)";
      ctx.fillRect(600, 56, 22, 22);
    } else {
      ctx.fillStyle = "rgba(255, 249, 182, 0.86)";
      ctx.fillRect(590, 50, 36, 36);
    }

    const cloudOffset = (cameraX * 0.2) % (VIEWPORT_WIDTH + 80);
    drawCloud(ctx, 120 - cloudOffset, 72, 0.55);
    drawCloud(ctx, 360 - cloudOffset, 94, 0.45);
    drawCloud(ctx, 640 - cloudOffset, 62, 0.5);
    drawCloud(ctx, 850 - cloudOffset, 86, 0.42);

    const farOffset = (cameraX * 0.35) % 240;
    for (let i = -1; i < 6; i += 1) {
      drawMountain(ctx, i * 220 - farOffset, 338, 220, 138, theme === "dusk" ? "#3b476f" : "#7fa7bd");
    }
    const nearOffset = (cameraX * 0.55) % 180;
    for (let i = -1; i < 7; i += 1) {
      drawMountain(ctx, i * 170 - nearOffset, 362, 170, 112, theme === "dusk" ? "#2e3b60" : "#58869e");
    }
  }

  drawLevel(state) {
    const level = state.level;
    if (!level) {
      return;
    }
    const ctx = this.ctx;
    const cameraX = state.camera.x || 0;
    const tileSize = level.tileSize;
    const startTx = Math.max(0, Math.floor(cameraX / tileSize) - 1);
    const endTx = Math.min(level.width - 1, Math.ceil((cameraX + VIEWPORT_WIDTH) / tileSize) + 1);

    for (let ty = 0; ty < level.height; ty += 1) {
      for (let tx = startTx; tx <= endTx; tx += 1) {
        const tileType = level.tiles[ty][tx];
        if (tileType === TILE_TYPES.EMPTY) {
          continue;
        }
        const screenX = round(tx * tileSize - cameraX);
        const screenY = round(ty * tileSize);
        const block = level.questionBlocks.get(tileKey(tx, ty));
        drawTile(ctx, tileType, screenX, screenY, tileSize, Boolean(block?.used));
      }
    }
  }

  drawWorldObjects(state) {
    const cameraX = state.camera.x || 0;
    drawGoal(this.ctx, state.goalRect, cameraX);
    for (const item of state.items) {
      drawItem(this.ctx, item, cameraX);
    }
    for (const projectile of state.projectiles) {
      drawProjectile(this.ctx, projectile, cameraX);
    }
    for (const enemy of state.enemies) {
      drawEnemy(this.ctx, enemy, cameraX);
    }
    drawPlayer(this.ctx, state.player, cameraX);
  }

  drawHud(state) {
    const ctx = this.ctx;
    drawPanel(ctx, 10, 8, 748, 44, "rgba(9, 14, 25, 0.62)", "rgba(130, 180, 255, 0.28)");
    drawText(ctx, `SCORE ${state.score}`, 24, 31, { font: "bold 14px monospace", color: "#f8f8f8" });
    drawText(ctx, `LIVES ${state.lives}`, 190, 31, { font: "bold 14px monospace", color: "#f8f8f8" });
    drawText(ctx, `LEVEL ${state.levelIndex + 1}/${state.levelCount}`, 322, 31, {
      font: "bold 14px monospace",
      color: "#f8f8f8"
    });
    drawText(ctx, `COINS ${state.coinsCollected}/${state.coinsTotal}`, 504, 31, {
      font: "bold 14px monospace",
      color: "#f8f8f8"
    });
    drawText(ctx, `TIME ${Math.max(0, Math.ceil(state.timeLeft))}`, 686, 31, {
      font: "bold 14px monospace",
      color: "#ffe9ad",
      align: "right"
    });
  }

  drawMessage(state) {
    if (!state.message) {
      return;
    }
    drawPanel(this.ctx, 12, VIEWPORT_HEIGHT - 35, 744, 24, "rgba(9, 16, 24, 0.55)", null);
    drawText(this.ctx, state.message, 20, VIEWPORT_HEIGHT - 18, {
      font: "13px monospace",
      color: "#f9fbff"
    });
  }

  drawOverlay(state) {
    if (state.screen === SCREENS.PLAYING) {
      return;
    }

    const ctx = this.ctx;
    ctx.fillStyle = "rgba(4, 6, 10, 0.56)";
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    drawPanel(ctx, 112, 90, 544, 252, "rgba(12, 17, 26, 0.86)", "rgba(132, 201, 255, 0.32)");

    const title =
      state.screen === SCREENS.START
        ? "SKY RUNNER ARCADE"
        : state.screen === SCREENS.LEVEL_COMPLETE
          ? "LEVEL CLEAR"
          : state.screen === SCREENS.GAME_COMPLETE
            ? "YOU WIN"
            : "GAME OVER";

    drawText(ctx, title, VIEWPORT_WIDTH / 2, 142, {
      align: "center",
      font: "bold 28px monospace",
      color: "#e8f5ff"
    });

    const subtitle =
      state.screen === SCREENS.START
        ? "Classic 2D platformer. Collect coins, defeat enemies, clear all seven stages."
        : state.screen === SCREENS.LEVEL_COMPLETE
          ? "Get ready for the next map."
          : state.screen === SCREENS.GAME_COMPLETE
            ? "All stages complete. Press Enter to start a new run."
            : "No lives left. Press Enter to retry.";

    drawText(ctx, subtitle, VIEWPORT_WIDTH / 2, 184, {
      align: "center",
      font: "14px monospace",
      color: "#c9d9ef"
    });

    if (state.screen === SCREENS.START) {
      drawText(ctx, "Move: A/D or Arrow Keys", VIEWPORT_WIDTH / 2, 220, {
        align: "center",
        font: "14px monospace",
        color: "#9deebc"
      });
      drawText(ctx, "Jump: W / Arrow Up / Space (hold for higher jumps)", VIEWPORT_WIDTH / 2, 244, {
        align: "center",
        font: "14px monospace",
        color: "#9deebc"
      });
      drawText(ctx, "Action: F (fireball with power-up)", VIEWPORT_WIDTH / 2, 268, {
        align: "center",
        font: "14px monospace",
        color: "#9deebc"
      });
    }

    drawText(ctx, "Enter: Start  |  R: Restart Level", VIEWPORT_WIDTH / 2, 306, {
      align: "center",
      font: "13px monospace",
      color: "#9cb6d8"
    });
  }

  render(state) {
    if (!this.ctx) {
      return;
    }
    this.drawBackground(state);
    this.drawLevel(state);
    this.drawWorldObjects(state);
    this.drawHud(state);
    this.drawMessage(state);
    this.drawOverlay(state);
  }
}
