import { SCREENS, VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from "../config";
import { TILE_TYPES, tileKey } from "../levels/levelLoader";

const round = (value) => Math.round(value);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const hashNoise = (x, y) => {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
};

const ACCENTS = [
  "#57e3af",
  "#f9ca6b",
  "#77d6ff",
  "#fa8f79",
  "#9bf17f",
  "#bfa6ff",
  "#ff7fa5"
];

const THEMES = {
  day: {
    skyTop: "#3cc6ff",
    skyMid: "#82deff",
    skyBottom: "#ffe59d",
    haze: "rgba(255, 233, 178, 0.32)",
    celestial: "#fff6b8",
    cloud: "#ffffff",
    farMount: "#79abc4",
    nearMount: "#4f7f98",
    ridge: "#2f5f45",
    groundTop: "#5ca34f",
    groundMain: "#744a2a",
    brickMain: "#b96537",
    brickDark: "#7d3f1d",
    pipeMain: "#2fbc67",
    pipeDark: "#1d7f44",
    platformMain: "#ca9f66",
    platformDark: "#8f6a43",
    questionMain: "#f8c943",
    questionDark: "#8d6718",
    questionUsed: "#7e6b4a",
    hudBg: "rgba(9, 15, 22, 0.6)",
    hudBorder: "rgba(123, 183, 255, 0.36)",
    text: "#f6fcff"
  },
  dusk: {
    skyTop: "#252e57",
    skyMid: "#435086",
    skyBottom: "#f29b61",
    haze: "rgba(255, 162, 110, 0.26)",
    celestial: "#fff2c6",
    cloud: "#efe8ff",
    farMount: "#3a4970",
    nearMount: "#28385e",
    ridge: "#27463e",
    groundTop: "#4b8e43",
    groundMain: "#6b4023",
    brickMain: "#a85c30",
    brickDark: "#6f3519",
    pipeMain: "#2bad60",
    pipeDark: "#1c7440",
    platformMain: "#c4935e",
    platformDark: "#7d5a37",
    questionMain: "#edbb39",
    questionDark: "#765512",
    questionUsed: "#6f6045",
    hudBg: "rgba(4, 7, 12, 0.68)",
    hudBorder: "rgba(160, 185, 255, 0.34)",
    text: "#eef5ff"
  }
};

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

const drawPanel = (ctx, x, y, w, h, fillColor, borderColor) => {
  ctx.fillStyle = fillColor;
  ctx.fillRect(x, y, w, h);
  if (!borderColor) {
    return;
  }
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
};

const drawCloud = (ctx, x, y, alpha, color) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x, y + 6, 50, 14);
  ctx.fillRect(x + 7, y + 1, 20, 12);
  ctx.fillRect(x + 25, y + 2, 18, 10);
  ctx.fillRect(x + 35, y + 6, 13, 9);
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

const drawStars = (ctx, timeSeconds) => {
  for (let i = 0; i < 70; i += 1) {
    const x = round((i * 89.7) % VIEWPORT_WIDTH);
    const y = round((i * 53.9) % 160);
    const twinkle = Math.sin(timeSeconds * 3.4 + i * 0.7) * 0.5 + 0.5;
    const alpha = 0.22 + twinkle * 0.58;
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
    const size = i % 8 === 0 ? 2 : 1;
    ctx.fillRect(x, y, size, size);
  }
};

const drawGroundDetails = (ctx, x, y, size, tx, ty, palette) => {
  const rockCount = 2 + Math.floor(hashNoise(tx, ty) * 3);
  for (let i = 0; i < rockCount; i += 1) {
    const nx = hashNoise(tx * 3 + i, ty * 5) * (size - 8);
    const ny = hashNoise(tx * 7, ty + i * 4) * (size - 12) + 8;
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.fillRect(x + round(nx), y + round(ny), 2, 2);
  }

  if (hashNoise(tx, ty * 11) > 0.55) {
    const grassX = x + 4 + round(hashNoise(tx * 4, ty * 2) * (size - 10));
    ctx.fillStyle = palette.groundTop;
    ctx.fillRect(grassX, y + 4, 1, 3);
    ctx.fillRect(grassX + 2, y + 3, 1, 4);
  }
};

const drawTile = (ctx, tileType, screenX, screenY, size, options) => {
  const {
    tx,
    ty,
    usedQuestionBlock,
    pulse,
    palette,
    accent
  } = options;

  if (tileType === TILE_TYPES.EMPTY) {
    return;
  }

  if (tileType === TILE_TYPES.GROUND) {
    ctx.fillStyle = palette.groundMain;
    ctx.fillRect(screenX, screenY, size, size);
    ctx.fillStyle = palette.groundTop;
    ctx.fillRect(screenX, screenY, size, 7);
    ctx.fillStyle = "rgba(255,255,255,0.17)";
    ctx.fillRect(screenX + 1, screenY + 1, size - 2, 2);
    ctx.fillStyle = "rgba(0,0,0,0.24)";
    ctx.fillRect(screenX, screenY + size - 4, size, 4);
    drawGroundDetails(ctx, screenX, screenY, size, tx, ty, palette);
    return;
  }

  if (tileType === TILE_TYPES.BRICK) {
    ctx.fillStyle = palette.brickMain;
    ctx.fillRect(screenX, screenY, size, size);
    ctx.strokeStyle = palette.brickDark;
    ctx.lineWidth = 1;
    for (let y = 8; y < size; y += 8) {
      ctx.beginPath();
      ctx.moveTo(screenX, screenY + y + 0.5);
      ctx.lineTo(screenX + size, screenY + y + 0.5);
      ctx.stroke();
    }
    const splitOffset = tx % 2 === 0 ? 8 : 12;
    for (let x = splitOffset; x < size; x += 16) {
      ctx.beginPath();
      ctx.moveTo(screenX + x + 0.5, screenY);
      ctx.lineTo(screenX + x + 0.5, screenY + size);
      ctx.stroke();
    }
    return;
  }

  if (tileType === TILE_TYPES.PIPE) {
    ctx.fillStyle = palette.pipeMain;
    ctx.fillRect(screenX + 4, screenY + 2, size - 8, size - 2);
    ctx.fillStyle = palette.pipeDark;
    ctx.fillRect(screenX + size - 8, screenY + 2, 3, size - 2);
    ctx.fillStyle = accent;
    ctx.fillRect(screenX, screenY, size, 8);
    ctx.fillStyle = "rgba(255,255,255,0.24)";
    ctx.fillRect(screenX + 2, screenY + 1, size - 4, 2);
    return;
  }

  if (tileType === TILE_TYPES.PLATFORM) {
    ctx.fillStyle = palette.platformMain;
    ctx.fillRect(screenX, screenY + 17, size, 9);
    ctx.fillStyle = palette.platformDark;
    ctx.fillRect(screenX, screenY + 25, size, 2);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(screenX, screenY + 16, size, 2);
    for (let x = screenX + 3; x < screenX + size - 3; x += 7) {
      ctx.fillStyle = "rgba(0,0,0,0.24)";
      ctx.fillRect(x, screenY + 20, 1, 4);
    }
    return;
  }

  if (tileType === TILE_TYPES.QUESTION) {
    const shimmer = usedQuestionBlock ? 0 : 0.75 + Math.sin(pulse + tx * 0.5) * 0.14;
    ctx.fillStyle = usedQuestionBlock ? palette.questionUsed : palette.questionMain;
    ctx.fillRect(screenX, screenY, size, size);
    ctx.strokeStyle = usedQuestionBlock ? "#524735" : palette.questionDark;
    ctx.strokeRect(screenX + 1, screenY + 1, size - 2, size - 2);
    ctx.fillStyle = `rgba(255,255,255,${(usedQuestionBlock ? 0.11 : shimmer).toFixed(3)})`;
    ctx.fillRect(screenX + 2, screenY + 2, size - 4, 2);
    ctx.fillStyle = usedQuestionBlock ? "#5d5140" : "#5e4515";
    ctx.fillRect(screenX + 12, screenY + 8, 8, 3);
    ctx.fillRect(screenX + 10, screenY + 12, 4, 3);
    ctx.fillRect(screenX + 16, screenY + 12, 4, 3);
    ctx.fillRect(screenX + 12, screenY + 16, 4, 3);
  }
};

const drawPlayer = (ctx, player, cameraX, accent, timeSeconds) => {
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
  const bodyColor = player.powerLevel > 0 ? "#ef533f" : "#2f82e0";
  const trimColor = player.powerLevel > 0 ? "#ffd27b" : "#9ad3ff";

  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(x + 3, y + player.h - 2, player.w - 6, 3);

  if (player.powerLevel > 0) {
    const aura = 0.14 + (Math.sin(timeSeconds * 7.2) * 0.5 + 0.5) * 0.22;
    ctx.strokeStyle = `rgba(255,219,120,${aura.toFixed(3)})`;
    ctx.strokeRect(x - 1, y - 1, player.w + 2, player.h + 2);
  }

  ctx.save();
  if (player.facing === "left") {
    ctx.translate(x + player.w, 0);
    ctx.scale(-1, 1);
    ctx.translate(-x, 0);
  }

  ctx.fillStyle = "#111820";
  ctx.fillRect(x + 6, y, 10, 1);
  ctx.fillStyle = "#f3c6a4";
  ctx.fillRect(x + 7, y + 1, 8, 8);
  ctx.fillStyle = "#111820";
  ctx.fillRect(x + 8, y + 4, 1, 1);
  ctx.fillRect(x + 12, y + 4, 1, 1);

  ctx.fillStyle = bodyColor;
  ctx.fillRect(x + 5, y + 9, 12, 9);
  ctx.fillStyle = trimColor;
  ctx.fillRect(x + 5, y + 9, 12, 2);

  ctx.fillStyle = "#18324a";
  ctx.fillRect(x + 6 + legOffset, y + 18, 4, 10);
  ctx.fillRect(x + 12 - legOffset, y + 18, 4, 10);
  ctx.fillStyle = "#0f1a2a";
  ctx.fillRect(x + 6 + legOffset, y + 27, 5, 3);
  ctx.fillRect(x + 11 - legOffset, y + 27, 5, 3);

  ctx.fillStyle = "#f3c6a4";
  ctx.fillRect(x + 3, y + 10, 2, 7);
  ctx.fillRect(x + 17, y + 10, 2, 7);

  if (player.animation === "jump") {
    ctx.strokeStyle = accent;
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

  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(x + 3, y + enemy.h - 2, enemy.w - 6, 3);

  ctx.save();
  if (enemy.direction < 0) {
    ctx.translate(x + enemy.w, 0);
    ctx.scale(-1, 1);
    ctx.translate(-x, 0);
  }

  ctx.fillStyle = "#f1ba93";
  ctx.fillRect(x + 8, y + 3, 8, 7);
  ctx.fillStyle = "#c63f38";
  ctx.fillRect(x + 5, y + 10, 14, 8);
  ctx.fillStyle = "#8f1f27";
  ctx.fillRect(x + 6, y + 10, 14, 2);
  ctx.fillStyle = "#311016";
  ctx.fillRect(x + 6 + step, y + 18, 5, 6);
  ctx.fillRect(x + 13 - step, y + 18, 5, 6);
  ctx.fillRect(x + 7 + step, y + 24, 4, 2);
  ctx.fillRect(x + 13 - step, y + 24, 4, 2);
  ctx.fillStyle = "#111820";
  ctx.fillRect(x + 10, y + 5, 1, 1);
  ctx.fillRect(x + 13, y + 5, 1, 1);

  ctx.restore();
};

const drawItem = (ctx, item, cameraX) => {
  if (!item?.active) {
    return;
  }

  const x = round(item.x - cameraX);
  const y = round(item.y);
  if (item.type === "coin") {
    const pulse = Math.sin(item.animationTimer * 9);
    const width = round(item.w * (0.45 + Math.abs(pulse) * 0.5));
    const offset = round((item.w - width) / 2);
    ctx.fillStyle = "#ffde67";
    ctx.fillRect(x + offset, y, width, item.h);
    ctx.strokeStyle = "#a36f19";
    ctx.strokeRect(x + offset, y, width, item.h);
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillRect(x + offset + 1, y + 1, Math.max(1, width - 2), 2);
    return;
  }

  ctx.fillStyle = "#f4d9b4";
  ctx.fillRect(x + 7, y + 8, 10, 12);
  ctx.fillStyle = "#e04f42";
  ctx.fillRect(x + 2, y + 2, 20, 8);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 5, y + 4, 4, 3);
  ctx.fillRect(x + 14, y + 4, 4, 3);
  ctx.fillStyle = "#b92f2f";
  ctx.fillRect(x + 3, y + 9, 18, 1);
};

const drawProjectile = (ctx, projectile, cameraX, timeSeconds) => {
  if (!projectile?.active) {
    return;
  }
  const x = round(projectile.x - cameraX);
  const y = round(projectile.y);
  const glow = 0.45 + (Math.sin(timeSeconds * 22 + projectile.x * 0.04) * 0.5 + 0.5) * 0.4;
  ctx.fillStyle = `rgba(255,128,54,${glow.toFixed(3)})`;
  ctx.fillRect(x - 1, y - 1, projectile.w + 2, projectile.h + 2);
  ctx.fillStyle = "#ff7b2f";
  ctx.fillRect(x, y, projectile.w, projectile.h);
  ctx.fillStyle = "#ffd16b";
  ctx.fillRect(x + 2, y + 2, projectile.w - 4, projectile.h - 4);
};

const drawGoal = (ctx, goalRect, cameraX, accent, timeSeconds) => {
  if (!goalRect) {
    return;
  }
  const x = round(goalRect.x - cameraX);
  const y = round(goalRect.y);
  const wave = Math.sin(timeSeconds * 6) * 2.8;
  ctx.fillStyle = "#75737a";
  ctx.fillRect(x + 10, y, 3, goalRect.h);
  ctx.fillStyle = accent;
  ctx.fillRect(x + 13, y + 6, 15 + wave, 10);
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillRect(x + 14, y + 7, 10 + wave * 0.45, 3);
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.fillRect(x + 8, y + goalRect.h - 6, 8, 3);
};

const drawEffects = (ctx, effects, cameraX) => {
  for (const effect of effects || []) {
    if (!effect || effect.life <= 0) {
      continue;
    }
    const alpha = clamp(effect.life / effect.maxLife, 0, 1);
    const x = round(effect.x - cameraX);
    const y = round(effect.y);
    ctx.fillStyle = effect.color.replace("__ALPHA__", alpha.toFixed(3));
    ctx.fillRect(x, y, effect.size, effect.size);
  }
};

const drawScanlines = (ctx) => {
  ctx.save();
  ctx.globalAlpha = 0.09;
  ctx.fillStyle = "#091018";
  for (let y = 0; y < VIEWPORT_HEIGHT; y += 3) {
    ctx.fillRect(0, y, VIEWPORT_WIDTH, 1);
  }
  const vignette = ctx.createRadialGradient(
    VIEWPORT_WIDTH * 0.5,
    VIEWPORT_HEIGHT * 0.5,
    VIEWPORT_HEIGHT * 0.28,
    VIEWPORT_WIDTH * 0.5,
    VIEWPORT_HEIGHT * 0.5,
    VIEWPORT_HEIGHT * 0.68
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.globalAlpha = 1;
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
  ctx.restore();
};

const resolvePalette = (state) => {
  const themeKey = state.level?.theme === "dusk" ? "dusk" : "day";
  const palette = THEMES[themeKey];
  const accent = ACCENTS[state.levelIndex % ACCENTS.length];
  return { palette, accent, themeKey };
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

  drawBackground(state, paletteData, timeSeconds) {
    const ctx = this.ctx;
    const { palette, themeKey } = paletteData;
    const cameraX = state.camera.x || 0;

    const gradient = ctx.createLinearGradient(0, 0, 0, VIEWPORT_HEIGHT);
    gradient.addColorStop(0, palette.skyTop);
    gradient.addColorStop(0.56, palette.skyMid);
    gradient.addColorStop(1, palette.skyBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    ctx.fillStyle = palette.haze;
    ctx.fillRect(0, VIEWPORT_HEIGHT * 0.58, VIEWPORT_WIDTH, VIEWPORT_HEIGHT * 0.42);

    if (themeKey === "dusk") {
      drawStars(ctx, timeSeconds);
      ctx.fillStyle = "rgba(255,248,223,0.82)";
      ctx.fillRect(600, 54, 20, 20);
    } else {
      ctx.fillStyle = "rgba(255,248,188,0.84)";
      ctx.fillRect(590, 47, 36, 36);
    }

    const cloudOffset = (cameraX * 0.2 + timeSeconds * 10) % (VIEWPORT_WIDTH + 120);
    drawCloud(ctx, 95 - cloudOffset, 72, 0.58, palette.cloud);
    drawCloud(ctx, 350 - cloudOffset, 94, 0.46, palette.cloud);
    drawCloud(ctx, 620 - cloudOffset, 66, 0.52, palette.cloud);
    drawCloud(ctx, 880 - cloudOffset, 86, 0.45, palette.cloud);

    const farOffset = (cameraX * 0.32) % 260;
    for (let i = -1; i < 6; i += 1) {
      drawMountain(ctx, i * 240 - farOffset, 338, 240, 140, palette.farMount);
    }

    const nearOffset = (cameraX * 0.56) % 190;
    for (let i = -1; i < 7; i += 1) {
      drawMountain(ctx, i * 180 - nearOffset, 365, 180, 114, palette.nearMount);
    }

    ctx.fillStyle = palette.ridge;
    ctx.fillRect(0, 364, VIEWPORT_WIDTH, VIEWPORT_HEIGHT - 364);
  }

  drawLevel(state, paletteData, timeSeconds) {
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

        drawTile(ctx, tileType, screenX, screenY, tileSize, {
          tx,
          ty,
          usedQuestionBlock: Boolean(block?.used),
          pulse: timeSeconds * 6,
          palette: paletteData.palette,
          accent: paletteData.accent
        });
      }
    }
  }

  drawWorldObjects(state, paletteData, timeSeconds) {
    const cameraX = state.camera.x || 0;
    drawGoal(this.ctx, state.goalRect, cameraX, paletteData.accent, timeSeconds);
    for (const item of state.items) {
      drawItem(this.ctx, item, cameraX);
    }
    for (const projectile of state.projectiles) {
      drawProjectile(this.ctx, projectile, cameraX, timeSeconds);
    }
    for (const enemy of state.enemies) {
      drawEnemy(this.ctx, enemy, cameraX);
    }
    drawPlayer(this.ctx, state.player, cameraX, paletteData.accent, timeSeconds);
    drawEffects(this.ctx, state.effects, cameraX);
  }

  drawHud(state, paletteData) {
    const ctx = this.ctx;
    const stageLabel = state.level?.name || `Stage ${state.levelIndex + 1}`;
    const coinProgress = state.coinsTotal > 0 ? state.coinsCollected / state.coinsTotal : 0;
    const timeProgress = state.timeLimit > 0 ? state.timeLeft / state.timeLimit : 0;

    drawPanel(ctx, 10, 8, 748, 50, paletteData.palette.hudBg, paletteData.palette.hudBorder);
    drawText(ctx, `SCORE ${state.score}`, 24, 30, {
      font: "bold 14px monospace",
      color: paletteData.palette.text
    });
    drawText(ctx, `LIVES ${state.lives}`, 194, 30, {
      font: "bold 14px monospace",
      color: paletteData.palette.text
    });
    drawText(ctx, `LEVEL ${state.levelIndex + 1}/${state.levelCount}`, 322, 30, {
      font: "bold 14px monospace",
      color: paletteData.palette.text
    });
    drawText(ctx, `COINS ${state.coinsCollected}/${state.coinsTotal}`, 494, 30, {
      font: "bold 14px monospace",
      color: paletteData.palette.text
    });
    drawText(ctx, `TIME ${Math.max(0, Math.ceil(state.timeLeft))}`, 692, 30, {
      font: "bold 14px monospace",
      color: "#ffe8a6",
      align: "right"
    });
    drawText(ctx, stageLabel, 24, 48, {
      font: "12px monospace",
      color: "rgba(238,245,255,0.84)"
    });

    ctx.fillStyle = "rgba(255,255,255,0.13)";
    ctx.fillRect(224, 40, 180, 6);
    ctx.fillRect(480, 40, 180, 6);
    ctx.fillStyle = paletteData.accent;
    ctx.fillRect(224, 40, round(180 * clamp(coinProgress, 0, 1)), 6);
    ctx.fillStyle = "#f7be68";
    ctx.fillRect(480, 40, round(180 * clamp(timeProgress, 0, 1)), 6);
  }

  drawMessage(state) {
    if (!state.message) {
      return;
    }
    drawPanel(this.ctx, 12, VIEWPORT_HEIGHT - 36, 744, 24, "rgba(10, 18, 27, 0.56)", null);
    drawText(this.ctx, state.message, 20, VIEWPORT_HEIGHT - 19, {
      font: "13px monospace",
      color: "#f3fbff"
    });
  }

  drawOverlay(state, paletteData) {
    if (state.screen === SCREENS.PLAYING) {
      return;
    }

    const ctx = this.ctx;
    ctx.fillStyle = "rgba(5, 8, 14, 0.62)";
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    drawPanel(ctx, 102, 82, 564, 268, "rgba(9, 14, 22, 0.9)", "rgba(130, 188, 255, 0.38)");
    drawPanel(ctx, 114, 96, 540, 30, "rgba(255,255,255,0.05)", null);

    const title =
      state.screen === SCREENS.START
        ? "SKY RUNNER DX"
        : state.screen === SCREENS.LEVEL_COMPLETE
          ? "STAGE CLEAR"
          : state.screen === SCREENS.GAME_COMPLETE
            ? "CAMPAIGN COMPLETE"
            : "RUN FAILED";

    drawText(ctx, title, VIEWPORT_WIDTH / 2, 117, {
      align: "center",
      font: "bold 24px monospace",
      color: "#e8f6ff",
      shadowColor: "rgba(130, 188, 255, 0.38)",
      shadowBlur: 6
    });

    const subtitle =
      state.screen === SCREENS.START
        ? "Retro pixel campaign with 7 sequential maps."
        : state.screen === SCREENS.LEVEL_COMPLETE
          ? "Prepare for the next stage."
          : state.screen === SCREENS.GAME_COMPLETE
            ? "All maps cleared. Press Enter to restart."
            : "No lives left. Press Enter to try again.";

    drawText(ctx, subtitle, VIEWPORT_WIDTH / 2, 154, {
      align: "center",
      font: "14px monospace",
      color: "#c8d9ef"
    });

    if (state.screen === SCREENS.START) {
      drawText(ctx, "Move: A/D or Arrow Keys", VIEWPORT_WIDTH / 2, 195, {
        align: "center",
        font: "14px monospace",
        color: "#97efc0"
      });
      drawText(ctx, "Jump: W / Arrow Up / Space (hold for higher jumps)", VIEWPORT_WIDTH / 2, 219, {
        align: "center",
        font: "14px monospace",
        color: "#97efc0"
      });
      drawText(ctx, "Action: F/B (fireball with power-up)", VIEWPORT_WIDTH / 2, 243, {
        align: "center",
        font: "14px monospace",
        color: "#97efc0"
      });
      drawText(ctx, "Goal: reach the flag (coins are optional bonus)", VIEWPORT_WIDTH / 2, 267, {
        align: "center",
        font: "14px monospace",
        color: "#ffe49d"
      });
    }

    drawText(ctx, "Enter: Start   |   R: Restart level", VIEWPORT_WIDTH / 2, 310, {
      align: "center",
      font: "13px monospace",
      color: paletteData.accent
    });
  }

  render(state) {
    if (!this.ctx) {
      return;
    }
    const timeSeconds = (state.elapsedMs || 0) / 1000;
    const paletteData = resolvePalette(state);

    this.drawBackground(state, paletteData, timeSeconds);
    this.drawLevel(state, paletteData, timeSeconds);
    this.drawWorldObjects(state, paletteData, timeSeconds);
    this.drawHud(state, paletteData);
    this.drawMessage(state);
    this.drawOverlay(state, paletteData);
    drawScanlines(this.ctx);
  }
}

