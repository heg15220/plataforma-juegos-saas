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

const STYLE_OVERRIDES = {
  classic: {},
  ice: {
    skyTop: "#9ed8f7",
    skyMid: "#d6f2ff",
    skyBottom: "#eaf7ff",
    haze: "rgba(217, 244, 255, 0.4)",
    cloud: "#f4fbff",
    farMount: "#9bc6df",
    nearMount: "#6ea0c3",
    ridge: "#335a74",
    groundTop: "#b7e5ff",
    groundMain: "#6f8ba0",
    brickMain: "#9eb4c4",
    brickDark: "#667988",
    pipeMain: "#6bb6df",
    pipeDark: "#3f7898",
    platformMain: "#d6ecff",
    platformDark: "#8ea6ba",
    questionMain: "#e2f6ff",
    questionDark: "#7f9bb0",
    questionUsed: "#7b8f9f",
    hudBg: "rgba(6, 23, 37, 0.62)",
    hudBorder: "rgba(165, 228, 255, 0.42)",
    text: "#f4fbff"
  },
  lava: {
    skyTop: "#2d0d04",
    skyMid: "#6d210d",
    skyBottom: "#ff8737",
    haze: "rgba(255, 146, 74, 0.28)",
    cloud: "#ffd7b6",
    farMount: "#5f2d20",
    nearMount: "#492016",
    ridge: "#3a180f",
    groundTop: "#8f4f22",
    groundMain: "#4f2617",
    brickMain: "#8b4525",
    brickDark: "#572614",
    pipeMain: "#7a3c2a",
    pipeDark: "#4a2418",
    platformMain: "#bb6c33",
    platformDark: "#6c3d1f",
    questionMain: "#ffb24d",
    questionDark: "#7d4317",
    questionUsed: "#6e4e3e",
    hudBg: "rgba(17, 6, 4, 0.72)",
    hudBorder: "rgba(255, 157, 115, 0.42)",
    text: "#fff2ea"
  },
  fortress: {
    skyTop: "#121621",
    skyMid: "#2a3242",
    skyBottom: "#65534c",
    haze: "rgba(153, 129, 114, 0.2)",
    cloud: "#d8d9dd",
    farMount: "#353d4b",
    nearMount: "#262d39",
    ridge: "#1f222a",
    groundTop: "#8e8f9a",
    groundMain: "#4b4d5a",
    brickMain: "#72707d",
    brickDark: "#454350",
    pipeMain: "#5e6673",
    pipeDark: "#3b434f",
    platformMain: "#8c8477",
    platformDark: "#5b5449",
    questionMain: "#d3bc8e",
    questionDark: "#6b5a3f",
    questionUsed: "#6a655b",
    hudBg: "rgba(10, 12, 18, 0.74)",
    hudBorder: "rgba(166, 173, 193, 0.38)",
    text: "#f0f2fb"
  },
  boss_arena: {
    skyTop: "#06070d",
    skyMid: "#101421",
    skyBottom: "#3a1713",
    haze: "rgba(255, 83, 63, 0.16)",
    cloud: "#cbcad7",
    farMount: "#23212b",
    nearMount: "#1a1821",
    ridge: "#17131a",
    groundTop: "#8b4340",
    groundMain: "#381a1a",
    brickMain: "#5d3535",
    brickDark: "#2f1a1a",
    pipeMain: "#4a3541",
    pipeDark: "#2b1d25",
    platformMain: "#8f5848",
    platformDark: "#543227",
    questionMain: "#d1934e",
    questionDark: "#5f3a1d",
    questionUsed: "#5c4943",
    hudBg: "rgba(7, 6, 10, 0.78)",
    hudBorder: "rgba(255, 115, 115, 0.45)",
    text: "#fff1f0"
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

const drawSnowDrift = (ctx, timeSeconds) => {
  for (let i = 0; i < 70; i += 1) {
    const baseX = (i * 53.1) % VIEWPORT_WIDTH;
    const drift = Math.sin(timeSeconds * 1.7 + i * 0.45) * 9;
    const fall = (timeSeconds * (18 + (i % 7) * 2) + i * 13.7) % (VIEWPORT_HEIGHT + 40);
    const x = round((baseX + drift + VIEWPORT_WIDTH) % VIEWPORT_WIDTH);
    const y = round(fall - 20);
    const size = i % 5 === 0 ? 2 : 1;
    const alpha = i % 3 === 0 ? 0.82 : 0.64;
    ctx.fillStyle = `rgba(245,250,255,${alpha.toFixed(2)})`;
    ctx.fillRect(x, y, size, size);
  }
};

const drawFortressBackdrop = (ctx, colorPrimary, colorSecondary) => {
  ctx.fillStyle = colorPrimary;
  for (let i = -1; i < 7; i += 1) {
    const x = i * 128 + 20;
    const h = 90 + (i % 3) * 24;
    ctx.fillRect(x, VIEWPORT_HEIGHT - 164 - h, 76, h);
    ctx.fillRect(x + 20, VIEWPORT_HEIGHT - 178 - h, 36, 14);
  }
  ctx.fillStyle = colorSecondary;
  for (let i = -1; i < 8; i += 1) {
    const x = i * 102 + 6;
    const h = 55 + (i % 4) * 15;
    ctx.fillRect(x, VIEWPORT_HEIGHT - 128 - h, 58, h);
  }
};

const drawLavaSea = (ctx, timeSeconds, y, baseColor, glowColor) => {
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, y, VIEWPORT_WIDTH, VIEWPORT_HEIGHT - y);

  for (let x = 0; x < VIEWPORT_WIDTH; x += 14) {
    const wave = Math.sin(timeSeconds * 3.2 + x * 0.08) * 3;
    ctx.fillStyle = glowColor;
    ctx.fillRect(x, y - 2 + wave, 10, 4);
  }

  for (let i = 0; i < 24; i += 1) {
    const bubbleX = (i * 39 + (timeSeconds * (20 + i)) % VIEWPORT_WIDTH) % VIEWPORT_WIDTH;
    const bubbleY = y + ((timeSeconds * 38 + i * 11) % Math.max(18, VIEWPORT_HEIGHT - y));
    const alpha = 0.16 + (i % 4) * 0.06;
    ctx.fillStyle = `rgba(255,214,140,${alpha.toFixed(2)})`;
    ctx.fillRect(round(bubbleX), round(bubbleY), 2, 2);
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

const drawPlayer = (ctx, player, cameraX, cameraY, accent, timeSeconds) => {
  if (!player) {
    return;
  }
  if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer * 14) % 2 === 0) {
    return;
  }

  const x = round(player.x - cameraX);
  const y = round(player.y - cameraY);
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

const drawEnemy = (ctx, enemy, cameraX, cameraY) => {
  if (!enemy?.active) {
    return;
  }
  const x = round(enemy.x - cameraX);
  const y = round(enemy.y - cameraY);
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

const drawBoss = (ctx, enemy, cameraX, cameraY, timeSeconds) => {
  if (!enemy?.active) {
    return;
  }

  const x = round(enemy.x - cameraX);
  const y = round(enemy.y - cameraY);
  const flash = enemy.flashTimer > 0 && Math.floor(enemy.flashTimer * 22) % 2 === 0;
  const pulse = 0.18 + (Math.sin(timeSeconds * 6.8) * 0.5 + 0.5) * 0.22;

  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.fillRect(x + 5, y + enemy.h - 2, enemy.w - 10, 4);

  if (!flash) {
    ctx.fillStyle = `rgba(255,94,87,${pulse.toFixed(3)})`;
    ctx.fillRect(x - 3, y - 3, enemy.w + 6, enemy.h + 6);
  }

  ctx.fillStyle = flash ? "#ffe5d9" : "#bb393d";
  ctx.fillRect(x + 2, y + 9, enemy.w - 4, enemy.h - 10);
  ctx.fillStyle = "#8c2228";
  ctx.fillRect(x + 4, y + 11, enemy.w - 8, 4);

  ctx.fillStyle = "#f2c3a0";
  ctx.fillRect(x + 10, y + 2, enemy.w - 20, 11);
  ctx.fillStyle = "#1b1c24";
  ctx.fillRect(x + 14, y + 6, 2, 2);
  ctx.fillRect(x + enemy.w - 16, y + 6, 2, 2);

  ctx.fillStyle = "#f8e58f";
  ctx.fillRect(x + 11, y - 2, enemy.w - 22, 3);
  ctx.fillRect(x + 7, y - 1, 3, 4);
  ctx.fillRect(x + enemy.w - 10, y - 1, 3, 4);

  const step = enemy.animationFrame === 0 ? 0 : 2;
  ctx.fillStyle = "#33131b";
  ctx.fillRect(x + 8 + step, y + enemy.h - 8, 7, 8);
  ctx.fillRect(x + enemy.w - 15 - step, y + enemy.h - 8, 7, 8);
};

const drawItem = (ctx, item, cameraX, cameraY) => {
  if (!item?.active) {
    return;
  }

  const x = round(item.x - cameraX);
  const y = round(item.y - cameraY);
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

const drawProjectile = (ctx, projectile, cameraX, cameraY, timeSeconds) => {
  if (!projectile?.active) {
    return;
  }
  const x = round(projectile.x - cameraX);
  const y = round(projectile.y - cameraY);
  const glow = 0.45 + (Math.sin(timeSeconds * 22 + projectile.x * 0.04) * 0.5 + 0.5) * 0.4;
  ctx.fillStyle = `rgba(255,128,54,${glow.toFixed(3)})`;
  ctx.fillRect(x - 1, y - 1, projectile.w + 2, projectile.h + 2);
  ctx.fillStyle = "#ff7b2f";
  ctx.fillRect(x, y, projectile.w, projectile.h);
  ctx.fillStyle = "#ffd16b";
  ctx.fillRect(x + 2, y + 2, projectile.w - 4, projectile.h - 4);
};

const drawGoal = (ctx, goalRect, cameraX, cameraY, accent, timeSeconds) => {
  if (!goalRect) {
    return;
  }
  const x = round(goalRect.x - cameraX);
  const y = round(goalRect.y - cameraY);
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

const drawEffects = (ctx, effects, cameraX, cameraY) => {
  for (const effect of effects || []) {
    if (!effect || effect.life <= 0) {
      continue;
    }
    const alpha = clamp(effect.life / effect.maxLife, 0, 1);
    const x = round(effect.x - cameraX);
    const y = round(effect.y - cameraY);
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
  const visualStyle = STYLE_OVERRIDES[state.level?.visualStyle]
    ? state.level.visualStyle
    : "classic";
  const palette = {
    ...THEMES[themeKey],
    ...STYLE_OVERRIDES[visualStyle]
  };
  const accent = ACCENTS[(state.levelTemplateIndex ?? state.levelIndex ?? 0) % ACCENTS.length];
  return { palette, accent, themeKey, visualStyle };
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
    const { palette, themeKey, visualStyle } = paletteData;
    const cameraX = state.camera.x || 0;

    const gradient = ctx.createLinearGradient(0, 0, 0, VIEWPORT_HEIGHT);
    gradient.addColorStop(0, palette.skyTop);
    gradient.addColorStop(0.56, palette.skyMid);
    gradient.addColorStop(1, palette.skyBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    ctx.fillStyle = palette.haze;
    ctx.fillRect(0, VIEWPORT_HEIGHT * 0.58, VIEWPORT_WIDTH, VIEWPORT_HEIGHT * 0.42);

    if (themeKey === "dusk" || visualStyle === "boss_arena") {
      drawStars(ctx, timeSeconds);
      ctx.fillStyle = "rgba(255,248,223,0.82)";
      ctx.fillRect(600, 54, 20, 20);
    } else {
      ctx.fillStyle = "rgba(255,248,188,0.84)";
      ctx.fillRect(590, 47, 36, 36);
    }

    const cloudOffset = (cameraX * 0.2 + timeSeconds * 10) % (VIEWPORT_WIDTH + 120);
    if (visualStyle !== "boss_arena") {
      drawCloud(ctx, 95 - cloudOffset, 72, 0.58, palette.cloud);
      drawCloud(ctx, 350 - cloudOffset, 94, 0.46, palette.cloud);
      drawCloud(ctx, 620 - cloudOffset, 66, 0.52, palette.cloud);
      drawCloud(ctx, 880 - cloudOffset, 86, 0.45, palette.cloud);
    }

    const farOffset = (cameraX * 0.32) % 260;
    for (let i = -1; i < 6; i += 1) {
      drawMountain(ctx, i * 240 - farOffset, 338, 240, 140, palette.farMount);
    }

    const nearOffset = (cameraX * 0.56) % 190;
    for (let i = -1; i < 7; i += 1) {
      drawMountain(ctx, i * 180 - nearOffset, 365, 180, 114, palette.nearMount);
    }

    if (visualStyle === "fortress" || visualStyle === "boss_arena") {
      drawFortressBackdrop(ctx, "rgba(18, 22, 32, 0.58)", "rgba(11, 14, 21, 0.72)");
    }
    if (visualStyle === "ice") {
      drawSnowDrift(ctx, timeSeconds);
    }

    ctx.fillStyle = palette.ridge;
    ctx.fillRect(0, 364, VIEWPORT_WIDTH, VIEWPORT_HEIGHT - 364);

    if (visualStyle === "lava") {
      drawLavaSea(ctx, timeSeconds, 382, "rgba(152, 46, 20, 0.92)", "rgba(255, 197, 114, 0.72)");
    } else if (visualStyle === "boss_arena") {
      drawLavaSea(ctx, timeSeconds, 374, "rgba(121, 35, 30, 0.95)", "rgba(255, 144, 95, 0.78)");
    }
  }

  drawLevel(state, paletteData, timeSeconds) {
    const level = state.level;
    if (!level) {
      return;
    }
    const ctx = this.ctx;
    const cameraX = state.camera.x || 0;
    const cameraY = state.camera.y || 0;
    const tileSize = level.tileSize;
    const startTx = Math.max(0, Math.floor(cameraX / tileSize) - 1);
    const endTx = Math.min(level.width - 1, Math.ceil((cameraX + VIEWPORT_WIDTH) / tileSize) + 1);
    const startTy = Math.max(0, Math.floor(cameraY / tileSize) - 1);
    const endTy = Math.min(level.height - 1, Math.ceil((cameraY + VIEWPORT_HEIGHT) / tileSize) + 1);

    for (let ty = startTy; ty <= endTy; ty += 1) {
      for (let tx = startTx; tx <= endTx; tx += 1) {
        const tileType = level.tiles[ty][tx];
        if (tileType === TILE_TYPES.EMPTY) {
          continue;
        }

        const screenX = round(tx * tileSize - cameraX);
        const screenY = round(ty * tileSize - cameraY);
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
    const cameraY = state.camera.y || 0;
    drawGoal(this.ctx, state.goalRect, cameraX, cameraY, paletteData.accent, timeSeconds);
    for (const item of state.items) {
      drawItem(this.ctx, item, cameraX, cameraY);
    }
    for (const projectile of state.projectiles) {
      drawProjectile(this.ctx, projectile, cameraX, cameraY, timeSeconds);
    }
    for (const enemy of state.enemies) {
      if (enemy.type === "boss") {
        drawBoss(this.ctx, enemy, cameraX, cameraY, timeSeconds);
      } else {
        drawEnemy(this.ctx, enemy, cameraX, cameraY);
      }
    }
    drawPlayer(this.ctx, state.player, cameraX, cameraY, paletteData.accent, timeSeconds);
    drawEffects(this.ctx, state.effects, cameraX, cameraY);
  }

  drawHud(state, paletteData) {
    const ctx = this.ctx;
    const layoutLabel = state.level?.layoutType === "vertical"
      ? "VERTICAL"
      : state.level?.layoutType === "hybrid"
        ? "HYBRID"
        : "HORIZONTAL";
    const stageLabel = `${state.level?.name || `Stage ${state.levelIndex + 1}`} - ${layoutLabel}`;
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

    if (state.activeBoss) {
      const bossRatio = state.activeBoss.maxHealth > 0
        ? clamp(state.activeBoss.health / state.activeBoss.maxHealth, 0, 1)
        : 0;
      drawPanel(ctx, 174, 62, 420, 24, "rgba(30, 7, 9, 0.72)", "rgba(255, 131, 131, 0.45)");
      drawText(
        ctx,
        `BOSS ${state.activeBoss.name.toUpperCase()} ${state.activeBoss.health}/${state.activeBoss.maxHealth}`,
        384,
        78,
        {
          align: "center",
          font: "bold 12px monospace",
          color: "#ffd9d9"
        }
      );
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(188, 67, 392, 5);
      ctx.fillStyle = "#ff5f61";
      ctx.fillRect(188, 67, round(392 * bossRatio), 5);
    }
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
        ? "Random 5-map route with horizontal, hybrid and vertical stages."
        : state.screen === SCREENS.LEVEL_COMPLETE
          ? "Prepare for the next stage."
          : state.screen === SCREENS.GAME_COMPLETE
            ? "Run completed. Press Enter for a new randomized route."
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
      drawText(ctx, "Goal: defeat bosses and capture the final flag", VIEWPORT_WIDTH / 2, 267, {
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
