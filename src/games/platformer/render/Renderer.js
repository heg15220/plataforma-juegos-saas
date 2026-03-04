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
    skyTop: "#1a8fd4",
    skyMid: "#5ec8f8",
    skyBottom: "#ffe78a",
    haze: "rgba(255, 228, 160, 0.28)",
    celestial: "#fff6b8",
    cloud: "#ffffff",
    cloudShadow: "rgba(180,200,220,0.45)",
    farMount: "#6ba0bc",
    nearMount: "#456e85",
    midGround: "#3a7a50",
    midGroundDark: "#295838",
    ridge: "#2a5940",
    groundTop: "#4db542",
    groundMain: "#6a3f20",
    groundStone: "#7a6348",
    brickMain: "#b85f32",
    brickDark: "#7a3a18",
    pipeMain: "#28b05e",
    pipeDark: "#1a7840",
    pipeHighlight: "rgba(255,255,255,0.22)",
    platformMain: "#c89855",
    platformDark: "#8a6038",
    platformHighlight: "rgba(255,255,255,0.28)",
    questionMain: "#f8c032",
    questionDark: "#8a5e10",
    questionUsed: "#7e6b4a",
    questionGlow: "rgba(255,200,60,0.35)",
    hudBg: "rgba(6, 12, 20, 0.72)",
    hudBorder: "rgba(110, 180, 255, 0.42)",
    hudAccentBar: "rgba(120,200,255,0.18)",
    text: "#f0faff",
    textDim: "rgba(200,230,255,0.7)"
  },
  dusk: {
    skyTop: "#1a1e40",
    skyMid: "#3a3e72",
    skyBottom: "#e8854a",
    haze: "rgba(255, 148, 96, 0.22)",
    celestial: "#fff2c6",
    cloud: "#f0e8ff",
    cloudShadow: "rgba(100,80,140,0.4)",
    farMount: "#32406a",
    nearMount: "#233058",
    midGround: "#1e3830",
    midGroundDark: "#152820",
    ridge: "#243e36",
    groundTop: "#427a3a",
    groundMain: "#5e3618",
    groundStone: "#6a5238",
    brickMain: "#a05428",
    brickDark: "#682e12",
    pipeMain: "#269050",
    pipeDark: "#186032",
    pipeHighlight: "rgba(255,255,255,0.18)",
    platformMain: "#ba8850",
    platformDark: "#725630",
    platformHighlight: "rgba(255,255,255,0.22)",
    questionMain: "#e8b030",
    questionDark: "#6e4a0e",
    questionUsed: "#6a5840",
    questionGlow: "rgba(240,175,40,0.28)",
    hudBg: "rgba(4, 6, 12, 0.78)",
    hudBorder: "rgba(148, 175, 255, 0.38)",
    hudAccentBar: "rgba(140,165,255,0.16)",
    text: "#e8f0ff",
    textDim: "rgba(180,200,255,0.65)"
  }
};

const STYLE_OVERRIDES = {
  classic: {},
  ice: {
    skyTop: "#7ecdf2",
    skyMid: "#c0eaff",
    skyBottom: "#e8f8ff",
    haze: "rgba(205, 238, 255, 0.36)",
    cloud: "#f0fbff",
    cloudShadow: "rgba(160,210,240,0.4)",
    farMount: "#8fc0da",
    nearMount: "#60a0c0",
    midGround: "#4882a0",
    midGroundDark: "#2e6080",
    ridge: "#2a5870",
    groundTop: "#a8e0ff",
    groundMain: "#607890",
    groundStone: "#7898b0",
    brickMain: "#90aac0",
    brickDark: "#5e7888",
    pipeMain: "#60a8d8",
    pipeDark: "#386898",
    pipeHighlight: "rgba(255,255,255,0.32)",
    platformMain: "#c8e8ff",
    platformDark: "#7898b2",
    platformHighlight: "rgba(255,255,255,0.38)",
    questionMain: "#d8f2ff",
    questionDark: "#6888a0",
    questionUsed: "#6a8098",
    questionGlow: "rgba(180,230,255,0.4)",
    hudBg: "rgba(4, 18, 32, 0.70)",
    hudBorder: "rgba(150, 225, 255, 0.48)",
    hudAccentBar: "rgba(160,230,255,0.18)",
    text: "#f0fbff",
    textDim: "rgba(200,240,255,0.7)"
  },
  lava: {
    skyTop: "#280900",
    skyMid: "#5e1a08",
    skyBottom: "#e87020",
    haze: "rgba(255, 130, 60, 0.24)",
    cloud: "#f0c8a0",
    cloudShadow: "rgba(140,60,20,0.45)",
    farMount: "#502010",
    nearMount: "#3c1808",
    midGround: "#401200",
    midGroundDark: "#280c00",
    ridge: "#340e0a",
    groundTop: "#804018",
    groundMain: "#482010",
    groundStone: "#604028",
    brickMain: "#803818",
    brickDark: "#502010",
    pipeMain: "#703018",
    pipeDark: "#422010",
    pipeHighlight: "rgba(255,120,60,0.22)",
    platformMain: "#a85e28",
    platformDark: "#603418",
    platformHighlight: "rgba(255,160,80,0.3)",
    questionMain: "#ffa030",
    questionDark: "#704010",
    questionUsed: "#5e3e28",
    questionGlow: "rgba(255,140,60,0.5)",
    hudBg: "rgba(15, 5, 2, 0.80)",
    hudBorder: "rgba(255, 140, 100, 0.48)",
    hudAccentBar: "rgba(255,120,60,0.22)",
    text: "#fff0e4",
    textDim: "rgba(255,210,170,0.65)"
  },
  fortress: {
    skyTop: "#0e1218",
    skyMid: "#222c3a",
    skyBottom: "#5a4a42",
    haze: "rgba(140, 118, 102, 0.18)",
    cloud: "#cccdd2",
    cloudShadow: "rgba(80,85,100,0.4)",
    farMount: "#2e3845",
    nearMount: "#202832",
    midGround: "#1c2228",
    midGroundDark: "#141820",
    ridge: "#1c1e24",
    groundTop: "#808090",
    groundMain: "#404252",
    groundStone: "#5a5868",
    brickMain: "#686070",
    brickDark: "#404048",
    pipeMain: "#525a68",
    pipeDark: "#343a48",
    pipeHighlight: "rgba(255,255,255,0.18)",
    platformMain: "#7e786a",
    platformDark: "#504a40",
    platformHighlight: "rgba(255,255,255,0.22)",
    questionMain: "#c8ae7c",
    questionDark: "#645230",
    questionUsed: "#625d52",
    questionGlow: "rgba(200,180,120,0.3)",
    hudBg: "rgba(8, 10, 16, 0.80)",
    hudBorder: "rgba(158, 168, 190, 0.42)",
    hudAccentBar: "rgba(160,170,195,0.16)",
    text: "#eef0f8",
    textDim: "rgba(200,210,235,0.65)"
  },
  boss_arena: {
    skyTop: "#04050a",
    skyMid: "#0c1018",
    skyBottom: "#300e10",
    haze: "rgba(255, 70, 50, 0.12)",
    cloud: "#b8b6c2",
    cloudShadow: "rgba(60,30,35,0.45)",
    farMount: "#1c1a22",
    nearMount: "#141218",
    midGround: "#160e10",
    midGroundDark: "#100810",
    ridge: "#140e14",
    groundTop: "#7a3838",
    groundMain: "#301414",
    groundStone: "#503030",
    brickMain: "#523030",
    brickDark: "#281414",
    pipeMain: "#3e2e38",
    pipeDark: "#241820",
    pipeHighlight: "rgba(255,100,100,0.18)",
    platformMain: "#7e4840",
    platformDark: "#4e2820",
    platformHighlight: "rgba(255,160,140,0.28)",
    questionMain: "#c08040",
    questionDark: "#583510",
    questionUsed: "#504240",
    questionGlow: "rgba(255,120,80,0.55)",
    hudBg: "rgba(6, 4, 8, 0.84)",
    hudBorder: "rgba(255, 100, 100, 0.50)",
    hudAccentBar: "rgba(255,80,80,0.22)",
    text: "#fff0ee",
    textDim: "rgba(255,200,195,0.65)"
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
    ctx.shadowOffsetX = options.shadowOffsetX || 0;
    ctx.shadowOffsetY = options.shadowOffsetY || 0;
  }
  if (options.strokeColor) {
    ctx.strokeStyle = options.strokeColor;
    ctx.lineWidth = options.strokeWidth || 2;
    ctx.lineJoin = "round";
    ctx.strokeText(text, x, y);
  }
  ctx.fillText(text, x, y);
  ctx.restore();
};

const drawPanel = (ctx, x, y, w, h, fillColor, borderColor, radius = 0) => {
  ctx.fillStyle = fillColor;
  if (radius > 0) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    if (borderColor) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  } else {
    ctx.fillRect(x, y, w, h);
    if (!borderColor) {
      return;
    }
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5);
  }
};

const drawCloud = (ctx, x, y, alpha, color, shadowColor) => {
  ctx.save();
  ctx.globalAlpha = alpha * 0.55;
  ctx.fillStyle = shadowColor || "rgba(180,200,220,0.4)";
  ctx.fillRect(x + 2, y + 10, 50, 14);
  ctx.fillRect(x + 9, y + 4, 20, 13);
  ctx.fillRect(x + 27, y + 5, 18, 11);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x, y + 6, 50, 14);
  ctx.fillRect(x + 7, y + 1, 22, 13);
  ctx.fillRect(x + 25, y + 2, 20, 11);
  ctx.fillRect(x + 36, y + 6, 14, 9);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(x + 2, y + 7, 20, 3);
  ctx.fillRect(x + 8, y + 2, 10, 3);
  ctx.restore();
};

const drawMountain = (ctx, x, baseY, width, height, color, snowColor) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.lineTo(x + width * 0.5, baseY - height);
  ctx.lineTo(x + width, baseY);
  ctx.closePath();
  ctx.fill();

  if (snowColor && height > 60) {
    const snowH = height * 0.28;
    ctx.fillStyle = snowColor;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.5, baseY - height);
    ctx.lineTo(x + width * 0.5 - snowH * 0.7, baseY - height + snowH);
    ctx.lineTo(x + width * 0.5 + snowH * 0.7, baseY - height + snowH);
    ctx.closePath();
    ctx.fill();
  }
};

const drawMidGroundLayer = (ctx, cameraX, timeSeconds, palette, visualStyle) => {
  const offset = (cameraX * 0.72) % 130;

  if (visualStyle === "ice") {
    ctx.fillStyle = palette.midGround || "#508aaa";
    for (let i = -1; i < 8; i += 1) {
      const bx = i * 130 - offset;
      const bh = 48 + (i % 3) * 16;
      ctx.fillRect(bx, VIEWPORT_HEIGHT - 150 - bh, 80, bh);
      ctx.fillRect(bx + 26, VIEWPORT_HEIGHT - 162 - bh, 28, 12);
      ctx.fillStyle = "rgba(220,240,255,0.6)";
      ctx.fillRect(bx + 10, VIEWPORT_HEIGHT - 152 - bh, 60, 6);
      ctx.fillStyle = palette.midGround || "#508aaa";
    }
    return;
  }

  if (visualStyle === "lava" || visualStyle === "boss_arena") {
    ctx.fillStyle = palette.midGround || "#401200";
    for (let i = -1; i < 7; i += 1) {
      const bx = i * 140 - offset;
      const bh = 55 + (i % 4) * 20;
      ctx.fillRect(bx, VIEWPORT_HEIGHT - 140 - bh, 90, bh);
      ctx.fillStyle = palette.midGroundDark || "#280c00";
      ctx.fillRect(bx, VIEWPORT_HEIGHT - 142 - bh, 90, 4);
      ctx.fillStyle = palette.midGround || "#401200";
    }
    return;
  }

  if (visualStyle === "fortress") {
    ctx.fillStyle = palette.midGround || "#1c2228";
    for (let i = -1; i < 8; i += 1) {
      const bx = i * 122 - offset;
      const bh = 50 + (i % 3) * 22;
      ctx.fillRect(bx, VIEWPORT_HEIGHT - 148 - bh, 72, bh);
      ctx.fillRect(bx + 18, VIEWPORT_HEIGHT - 162 - bh, 36, 14);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      for (let wx = bx + 8; wx < bx + 68; wx += 16) {
        ctx.fillRect(wx, VIEWPORT_HEIGHT - 148 - bh + 8, 6, 26);
      }
      ctx.fillStyle = palette.midGround || "#1c2228";
    }
    return;
  }

  ctx.fillStyle = palette.midGround || "#3a7a50";
  for (let i = -1; i < 8; i += 1) {
    const bx = i * 110 - offset;
    const bh = 20 + (i % 4) * 8;
    ctx.fillRect(bx, VIEWPORT_HEIGHT - 148 - bh, 70, bh);
    ctx.fillStyle = palette.midGroundDark || "#295838";
    ctx.fillRect(bx, VIEWPORT_HEIGHT - 148 - bh, 70, 6);
    ctx.fillStyle = palette.midGround || "#3a7a50";
    for (let t = bx + 5; t < bx + 65; t += 12) {
      const th = 8 + (hashNoise(t, i) * 6);
      ctx.fillRect(t, VIEWPORT_HEIGHT - 148 - bh - th, 4, th);
    }
    ctx.fillStyle = palette.midGround || "#3a7a50";
  }
};

const drawStars = (ctx, timeSeconds) => {
  for (let i = 0; i < 90; i += 1) {
    const x = round((i * 89.7 + 13) % VIEWPORT_WIDTH);
    const y = round((i * 53.9 + 7) % 180);
    const twinkle = Math.sin(timeSeconds * 2.8 + i * 0.9) * 0.5 + 0.5;
    const alpha = 0.18 + twinkle * 0.64;
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
    const size = i % 11 === 0 ? 2 : 1;
    ctx.fillRect(x, y, size, size);
  }
};

const drawSnowDrift = (ctx, timeSeconds) => {
  for (let i = 0; i < 80; i += 1) {
    const baseX = (i * 53.1) % VIEWPORT_WIDTH;
    const drift = Math.sin(timeSeconds * 1.4 + i * 0.55) * 11;
    const fall = (timeSeconds * (16 + (i % 7) * 2.2) + i * 14.3) % (VIEWPORT_HEIGHT + 50);
    const x = round((baseX + drift + VIEWPORT_WIDTH) % VIEWPORT_WIDTH);
    const y = round(fall - 22);
    const size = i % 5 === 0 ? 2 : 1;
    const alpha = i % 3 === 0 ? 0.85 : 0.62;
    ctx.fillStyle = `rgba(235,248,255,${alpha.toFixed(2)})`;
    ctx.fillRect(x, y, size, size);
  }
};

const drawEmbers = (ctx, timeSeconds) => {
  for (let i = 0; i < 40; i += 1) {
    const baseX = (i * 47.3 + timeSeconds * (25 + i % 9) * 0.7) % VIEWPORT_WIDTH;
    const rise = ((timeSeconds * (22 + i % 8) + i * 17.9)) % (VIEWPORT_HEIGHT + 30);
    const x = round((baseX + Math.sin(timeSeconds * 2.1 + i) * 8 + VIEWPORT_WIDTH) % VIEWPORT_WIDTH);
    const y = round(VIEWPORT_HEIGHT - rise);
    const alpha = clamp(0.7 - rise / VIEWPORT_HEIGHT, 0.1, 0.8);
    const hue = 20 + (i % 5) * 8;
    ctx.fillStyle = `hsla(${hue},100%,60%,${alpha.toFixed(2)})`;
    const size = i % 7 === 0 ? 2 : 1;
    ctx.fillRect(x, y, size, size);
  }
};

const drawLightning = (ctx, timeSeconds) => {
  const flashCycle = Math.floor(timeSeconds * 0.22);
  if (Math.sin(flashCycle * 1237.5) < 0.82) {
    return;
  }
  ctx.save();
  ctx.strokeStyle = "rgba(255,200,255,0.55)";
  ctx.lineWidth = 1;
  const lx = ((flashCycle * 3197) % (VIEWPORT_WIDTH - 80)) + 40;
  ctx.beginPath();
  ctx.moveTo(lx, 0);
  let cy = 0;
  let cx = lx;
  while (cy < VIEWPORT_HEIGHT * 0.55) {
    cy += 22 + (Math.sin(cy * 0.3) * 10);
    cx += (Math.sin(cy * 0.7 + flashCycle) * 14);
    ctx.lineTo(round(cx), round(cy));
  }
  ctx.stroke();
  ctx.restore();
};

const drawFortressBackdrop = (ctx, colorPrimary, colorSecondary) => {
  ctx.fillStyle = colorPrimary;
  for (let i = -1; i < 7; i += 1) {
    const x = i * 128 + 20;
    const h = 90 + (i % 3) * 24;
    ctx.fillRect(x, VIEWPORT_HEIGHT - 164 - h, 76, h);
    ctx.fillRect(x + 20, VIEWPORT_HEIGHT - 178 - h, 36, 14);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    for (let wx = x + 8; wx < x + 70; wx += 18) {
      ctx.fillRect(wx, VIEWPORT_HEIGHT - 164 - h + 10, 7, h - 18);
    }
    ctx.fillStyle = colorPrimary;
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
    const wave = Math.sin(timeSeconds * 3.8 + x * 0.085) * 3.5;
    ctx.fillStyle = glowColor;
    ctx.fillRect(x, y - 3 + wave, 10, 5);
  }

  for (let i = 0; i < 30; i += 1) {
    const bx = (i * 37 + timeSeconds * (22 + i * 1.1)) % VIEWPORT_WIDTH;
    const by = y + ((timeSeconds * 40 + i * 11.5) % Math.max(20, VIEWPORT_HEIGHT - y));
    const alpha = 0.14 + (i % 5) * 0.05;
    ctx.fillStyle = `rgba(255,195,120,${alpha.toFixed(2)})`;
    ctx.fillRect(round(bx), round(by), 2, 2);
  }
};

const drawGroundDetails = (ctx, x, y, size, tx, ty, palette) => {
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(x, y + size - 6, size, 6);

  const rockCount = 1 + Math.floor(hashNoise(tx, ty) * 3);
  for (let i = 0; i < rockCount; i += 1) {
    const nx = hashNoise(tx * 3 + i, ty * 5) * (size - 8);
    const ny = hashNoise(tx * 7, ty + i * 4) * (size - 14) + 10;
    ctx.fillStyle = palette.groundStone || "rgba(0,0,0,0.14)";
    ctx.fillRect(x + round(nx), y + round(ny), 3, 2);
  }

  if (hashNoise(tx, ty * 11) > 0.52) {
    const grassX = x + 3 + round(hashNoise(tx * 4, ty * 2) * (size - 8));
    ctx.fillStyle = palette.groundTop;
    ctx.fillRect(grassX, y + 4, 1, 4);
    ctx.fillRect(grassX + 2, y + 3, 1, 5);
    ctx.fillRect(grassX + 4, y + 5, 1, 3);
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
    ctx.fillRect(screenX, screenY, size, 8);
    ctx.fillStyle = "rgba(255,255,255,0.20)";
    ctx.fillRect(screenX + 1, screenY + 1, size - 2, 3);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(screenX, screenY + 8, size, 3);
    drawGroundDetails(ctx, screenX, screenY, size, tx, ty, palette);
    return;
  }

  if (tileType === TILE_TYPES.BRICK) {
    ctx.fillStyle = palette.brickMain;
    ctx.fillRect(screenX, screenY, size, size);
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    ctx.fillRect(screenX + 1, screenY + 1, size - 2, 3);
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
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.fillRect(screenX, screenY + size - 4, size, 4);
    return;
  }

  if (tileType === TILE_TYPES.PIPE) {
    ctx.fillStyle = palette.pipeMain;
    ctx.fillRect(screenX + 4, screenY + 8, size - 8, size - 8);
    ctx.fillStyle = palette.pipeDark;
    ctx.fillRect(screenX + size - 10, screenY + 8, 4, size - 8);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(screenX + 4, screenY + size - 5, size - 8, 5);

    ctx.fillStyle = accent;
    ctx.fillRect(screenX, screenY, size, 8);
    ctx.fillStyle = palette.pipeDark;
    ctx.fillRect(screenX + size - 8, screenY, 4, 8);

    ctx.fillStyle = palette.pipeHighlight || "rgba(255,255,255,0.22)";
    ctx.fillRect(screenX + 2, screenY + 1, 4, 5);
    ctx.fillRect(screenX + 6, screenY + 10, 3, size - 14);
    return;
  }

  if (tileType === TILE_TYPES.PLATFORM) {
    ctx.fillStyle = palette.platformMain;
    ctx.fillRect(screenX, screenY + 14, size, 10);

    ctx.fillStyle = palette.platformDark;
    ctx.fillRect(screenX, screenY + 23, size, 3);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(screenX, screenY + 25, size, 2);

    ctx.fillStyle = palette.platformHighlight || "rgba(255,255,255,0.28)";
    ctx.fillRect(screenX, screenY + 14, size, 3);

    ctx.fillStyle = "rgba(0,0,0,0.22)";
    for (let x = screenX + 4; x < screenX + size - 4; x += 8) {
      ctx.fillRect(x, screenY + 18, 2, 5);
    }
    return;
  }

  if (tileType === TILE_TYPES.QUESTION) {
    const shimmer = usedQuestionBlock ? 0 : 0.72 + Math.sin(pulse + tx * 0.6) * 0.18;

    if (!usedQuestionBlock) {
      const glowAlpha = 0.25 + Math.sin(pulse + tx * 0.4) * 0.2;
      ctx.fillStyle = (palette.questionGlow || "rgba(255,200,60,0.35)").replace(/[\d.]+\)$/, `${(glowAlpha).toFixed(3)})`);
      ctx.fillRect(screenX - 3, screenY - 3, size + 6, size + 6);
    }

    ctx.fillStyle = usedQuestionBlock ? palette.questionUsed : palette.questionMain;
    ctx.fillRect(screenX, screenY, size, size);

    ctx.strokeStyle = usedQuestionBlock ? "#504030" : palette.questionDark;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(screenX + 0.75, screenY + 0.75, size - 1.5, size - 1.5);

    ctx.fillStyle = `rgba(255,255,255,${(usedQuestionBlock ? 0.10 : shimmer).toFixed(3)})`;
    ctx.fillRect(screenX + 2, screenY + 2, size - 4, 3);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(screenX, screenY + size - 4, size, 4);

    const markColor = usedQuestionBlock ? "rgba(90,75,60,0.9)" : "rgba(80,50,10,0.9)";
    ctx.fillStyle = markColor;
    ctx.fillRect(screenX + 12, screenY + 7, 8, 4);
    ctx.fillRect(screenX + 10, screenY + 12, 4, 4);
    ctx.fillRect(screenX + 16, screenY + 12, 4, 4);
    ctx.fillRect(screenX + 12, screenY + 17, 8, 4);
    ctx.fillRect(screenX + 13, screenY + 22, 6, 3);
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
  const legOffset = running ? (runFrame === 0 ? -3 : 3) : 0;
  const bodyColor = player.powerLevel > 0 ? "#e8472c" : "#2478d8";
  const trimColor = player.powerLevel > 0 ? "#ffcc60" : "#88c8ff";
  const hatColor = player.powerLevel > 0 ? "#cc2a1c" : "#1858b8";

  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(x + 2, y + player.h - 2, player.w - 4, 3);

  if (player.powerLevel > 0) {
    const aura = 0.12 + (Math.sin(timeSeconds * 7.5) * 0.5 + 0.5) * 0.26;
    ctx.strokeStyle = `rgba(255,210,100,${aura.toFixed(3)})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 2, y - 2, player.w + 4, player.h + 4);
  }

  ctx.save();
  if (player.facing === "left") {
    ctx.translate(x + player.w, 0);
    ctx.scale(-1, 1);
    ctx.translate(-x, 0);
  }

  ctx.fillStyle = hatColor;
  ctx.fillRect(x + 4, y - 2, 14, 5);
  ctx.fillRect(x + 6, y - 5, 10, 5);

  ctx.fillStyle = "#f4c8a8";
  ctx.fillRect(x + 7, y + 3, 8, 7);
  ctx.fillStyle = "#111820";
  ctx.fillRect(x + 8, y + 5, 2, 2);
  ctx.fillRect(x + 12, y + 5, 2, 2);
  ctx.fillStyle = "#cc6655";
  ctx.fillRect(x + 10, y + 8, 2, 1);

  ctx.fillStyle = bodyColor;
  ctx.fillRect(x + 4, y + 10, 14, 9);
  ctx.fillStyle = trimColor;
  ctx.fillRect(x + 4, y + 10, 14, 3);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(x + 5, y + 10, 6, 6);

  ctx.fillStyle = "#183a52";
  ctx.fillRect(x + 5 + legOffset, y + 19, 5, 9);
  ctx.fillRect(x + 12 - legOffset, y + 19, 5, 9);
  ctx.fillStyle = "#0e2030";
  ctx.fillRect(x + 4 + legOffset, y + 27, 6, 3);
  ctx.fillRect(x + 12 - legOffset, y + 27, 6, 3);

  ctx.fillStyle = "#f4c8a8";
  ctx.fillRect(x + 2, y + 11, 2, 7);
  ctx.fillRect(x + 18, y + 11, 2, 7);
  ctx.fillStyle = "#dda888";
  ctx.fillRect(x + 2, y + 17, 2, 2);
  ctx.fillRect(x + 18, y + 17, 2, 2);

  if (player.animation === "jump") {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 1, y + 1, player.w - 2, player.h - 2);
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

  ctx.fillStyle = "#c03030";
  ctx.fillRect(x + 4, y, enemy.w - 8, 4);
  ctx.fillStyle = "#f0b880";
  ctx.fillRect(x + 7, y + 4, 10, 7);
  ctx.fillStyle = "#a02020";
  ctx.fillRect(x + 4, y + 11, 16, 8);
  ctx.fillStyle = "#801818";
  ctx.fillRect(x + 5, y + 11, 16, 3);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(x + 5, y + 12, 6, 5);

  ctx.fillStyle = "#282030";
  ctx.fillRect(x + 5 + step, y + 19, 6, 5);
  ctx.fillRect(x + 13 - step, y + 19, 6, 5);
  ctx.fillRect(x + 4 + step, y + 23, 7, 2);
  ctx.fillRect(x + 13 - step, y + 23, 7, 2);

  ctx.fillStyle = "#111820";
  ctx.fillRect(x + 9, y + 6, 2, 2);
  ctx.fillRect(x + 13, y + 6, 2, 2);
  ctx.fillStyle = "#ee5533";
  ctx.fillRect(x + 9, y + 9, 6, 1);

  ctx.restore();
};

const drawBoss = (ctx, enemy, cameraX, cameraY, timeSeconds) => {
  if (!enemy?.active) {
    return;
  }

  const x = round(enemy.x - cameraX);
  const y = round(enemy.y - cameraY);
  const flash = enemy.flashTimer > 0 && Math.floor(enemy.flashTimer * 22) % 2 === 0;
  const pulse = 0.16 + (Math.sin(timeSeconds * 7.2) * 0.5 + 0.5) * 0.24;
  const eyeGlow = 0.6 + Math.sin(timeSeconds * 4.8) * 0.3;

  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.fillRect(x + 4, y + enemy.h - 2, enemy.w - 8, 5);

  if (!flash) {
    ctx.fillStyle = `rgba(255,80,70,${(pulse * 0.7).toFixed(3)})`;
    ctx.fillRect(x - 4, y - 4, enemy.w + 8, enemy.h + 8);
    ctx.fillStyle = `rgba(255,60,50,${(pulse * 0.4).toFixed(3)})`;
    ctx.fillRect(x - 8, y - 8, enemy.w + 16, enemy.h + 16);
  }

  ctx.fillStyle = flash ? "#ffe0d4" : "#aa2c30";
  ctx.fillRect(x + 2, y + 10, enemy.w - 4, enemy.h - 12);
  ctx.fillStyle = "#7a1c22";
  ctx.fillRect(x + 4, y + 12, enemy.w - 8, 5);
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.fillRect(x + 4, y + 11, 10, enemy.h - 18);

  ctx.fillStyle = "#f0ba98";
  ctx.fillRect(x + 10, y + 2, enemy.w - 20, 10);
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(x + 10, y + 10, enemy.w - 20, 3);

  ctx.fillStyle = `rgba(255,230,80,${eyeGlow.toFixed(2)})`;
  ctx.fillRect(x + 14, y + 4, 5, 5);
  ctx.fillRect(x + enemy.w - 19, y + 4, 5, 5);
  ctx.fillStyle = "#111018";
  ctx.fillRect(x + 15, y + 5, 3, 3);
  ctx.fillRect(x + enemy.w - 18, y + 5, 3, 3);
  ctx.fillStyle = "rgba(255,240,100,0.8)";
  ctx.fillRect(x + 16, y + 5, 1, 1);
  ctx.fillRect(x + enemy.w - 17, y + 5, 1, 1);

  ctx.fillStyle = "#f0e068";
  ctx.fillRect(x + 12, y - 3, enemy.w - 24, 4);
  ctx.fillRect(x + 7, y - 1, 4, 5);
  ctx.fillRect(x + enemy.w - 11, y - 1, 4, 5);
  ctx.fillRect(x + 10, y - 6, 3, 5);
  ctx.fillRect(x + enemy.w - 13, y - 6, 3, 5);

  const step = enemy.animationFrame === 0 ? 0 : 3;
  ctx.fillStyle = "#2a101a";
  ctx.fillRect(x + 7 + step, y + enemy.h - 9, 8, 9);
  ctx.fillRect(x + enemy.w - 15 - step, y + enemy.h - 9, 8, 9);
  ctx.fillStyle = "#180810";
  ctx.fillRect(x + 6 + step, y + enemy.h - 4, 10, 4);
  ctx.fillRect(x + enemy.w - 16 - step, y + enemy.h - 4, 10, 4);
};

const drawItem = (ctx, item, cameraX, cameraY, timeSeconds) => {
  if (!item?.active) {
    return;
  }

  const x = round(item.x - cameraX);
  const y = round(item.y - cameraY);
  if (item.type === "coin") {
    const pulse = Math.sin(item.animationTimer * 9);
    const width = round(item.w * (0.42 + Math.abs(pulse) * 0.54));
    const offset = round((item.w - width) / 2);
    const shimmer = 0.4 + Math.abs(pulse) * 0.5;
    const glowAlpha = 0.18 + Math.abs(pulse) * 0.32;

    ctx.fillStyle = `rgba(255,220,60,${glowAlpha.toFixed(2)})`;
    ctx.fillRect(x + offset - 2, y - 2, width + 4, item.h + 4);

    ctx.fillStyle = "#ffe040";
    ctx.fillRect(x + offset, y, width, item.h);
    ctx.strokeStyle = "#a86810";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + offset, y, width, item.h);
    ctx.fillStyle = `rgba(255,255,200,${shimmer.toFixed(2)})`;
    ctx.fillRect(x + offset + 1, y + 1, Math.max(1, round(width * 0.5)), 3);
    return;
  }

  const bobY = Math.sin(timeSeconds * 3.5 + item.x * 0.05) * 2;
  ctx.fillStyle = "#e8c898";
  ctx.fillRect(x + 7, y + 8 + bobY, 10, 12);
  ctx.fillStyle = "#e84040";
  ctx.fillRect(x + 2, y + 2 + bobY, 20, 8);
  ctx.fillStyle = "#ff6060";
  ctx.fillRect(x + 3, y + 2 + bobY, 4, 3);
  ctx.fillRect(x + 17, y + 2 + bobY, 4, 3);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 5, y + 4 + bobY, 4, 3);
  ctx.fillRect(x + 15, y + 4 + bobY, 4, 3);
  ctx.fillStyle = "#b82828";
  ctx.fillRect(x + 3, y + 9 + bobY, 18, 1);
  const stemColor = "#22884a";
  ctx.fillStyle = stemColor;
  ctx.fillRect(x + 9, y + bobY, 6, 4);
};

const drawProjectile = (ctx, projectile, cameraX, cameraY, timeSeconds) => {
  if (!projectile?.active) {
    return;
  }
  const x = round(projectile.x - cameraX);
  const y = round(projectile.y - cameraY);
  const glow = 0.5 + (Math.sin(timeSeconds * 24 + projectile.x * 0.04) * 0.5 + 0.5) * 0.4;
  ctx.fillStyle = `rgba(255,100,30,${(glow * 0.7).toFixed(3)})`;
  ctx.fillRect(x - 2, y - 2, projectile.w + 4, projectile.h + 4);
  ctx.fillStyle = "#ff7020";
  ctx.fillRect(x, y, projectile.w, projectile.h);
  ctx.fillStyle = "#ffd060";
  ctx.fillRect(x + 2, y + 2, projectile.w - 4, projectile.h - 4);
  ctx.fillStyle = "rgba(255,255,200,0.8)";
  ctx.fillRect(x + 3, y + 3, 2, 2);
};

const drawGoal = (ctx, goalRect, cameraX, cameraY, accent, timeSeconds) => {
  if (!goalRect) {
    return;
  }
  const x = round(goalRect.x - cameraX);
  const y = round(goalRect.y - cameraY);
  const wave = Math.sin(timeSeconds * 6.5) * 3;
  const waveB = Math.sin(timeSeconds * 6.5 + 0.3) * 2;

  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(x + 11, y, 4, goalRect.h);
  ctx.fillStyle = "#908070";
  ctx.fillRect(x + 10, y, 4, goalRect.h);

  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.fillRect(x + 10, y, 2, goalRect.h);

  ctx.fillStyle = accent;
  ctx.fillRect(x + 14, y + 5, 16 + wave, 12);
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(x + 14, y + 5 + waveB, 16 + wave * 0.5, 3);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillRect(x + 15, y + 6, 12 + wave * 0.4, 3);

  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(x + 7, y + goalRect.h - 8, 10, 4);

  const starGlow = 0.5 + Math.sin(timeSeconds * 5) * 0.4;
  ctx.fillStyle = `rgba(255,255,180,${starGlow.toFixed(2)})`;
  ctx.fillRect(x + 9, y - 4, 5, 5);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillRect(x + 11, y - 3, 2, 3);
  ctx.fillRect(x + 10, y - 2, 4, 1);
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
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = "#05080f";
  for (let y = 0; y < VIEWPORT_HEIGHT; y += 3) {
    ctx.fillRect(0, y, VIEWPORT_WIDTH, 1);
  }
  const vignette = ctx.createRadialGradient(
    VIEWPORT_WIDTH * 0.5,
    VIEWPORT_HEIGHT * 0.5,
    VIEWPORT_HEIGHT * 0.24,
    VIEWPORT_WIDTH * 0.5,
    VIEWPORT_HEIGHT * 0.5,
    VIEWPORT_HEIGHT * 0.72
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.28)");
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

const timeBarColor = (ratio) => {
  if (ratio > 0.55) {
    return "#3ee878";
  }
  if (ratio > 0.28) {
    return "#f8c840";
  }
  return "#ff4848";
};

const drawHearts = (ctx, lives, x, y, palette) => {
  const maxShown = Math.min(lives, 5);
  for (let i = 0; i < maxShown; i += 1) {
    const hx = x + i * 15;
    ctx.fillStyle = "#ff4466";
    ctx.fillRect(hx + 2, y, 3, 2);
    ctx.fillRect(hx + 6, y, 3, 2);
    ctx.fillRect(hx, y + 2, 10, 3);
    ctx.fillRect(hx + 1, y + 5, 8, 2);
    ctx.fillRect(hx + 2, y + 7, 6, 2);
    ctx.fillRect(hx + 3, y + 9, 4, 1);
    ctx.fillRect(hx + 4, y + 10, 2, 1);
    ctx.fillStyle = "rgba(255,200,200,0.5)";
    ctx.fillRect(hx + 2, y + 1, 2, 2);
  }
  if (lives > 5) {
    drawText(ctx, `+${lives - 5}`, x + 76, y + 10, {
      font: "10px monospace",
      color: "#ff7798"
    });
  }
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
    gradient.addColorStop(0.38, palette.skyMid);
    gradient.addColorStop(0.78, palette.skyBottom);
    gradient.addColorStop(1, palette.ridge);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    ctx.fillStyle = palette.haze;
    ctx.fillRect(0, VIEWPORT_HEIGHT * 0.52, VIEWPORT_WIDTH, VIEWPORT_HEIGHT * 0.48);

    if (themeKey === "dusk" || visualStyle === "boss_arena") {
      drawStars(ctx, timeSeconds);
      ctx.fillStyle = "rgba(255,245,215,0.86)";
      ctx.fillRect(596, 50, 22, 22);
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(590, 44, 34, 34);
    } else if (visualStyle !== "lava") {
      ctx.fillStyle = "rgba(255,248,180,0.90)";
      ctx.fillRect(586, 44, 38, 38);
      ctx.fillStyle = "rgba(255,255,220,0.25)";
      ctx.fillRect(580, 38, 50, 50);
    }

    const cloudOffset = ((cameraX * 0.18 + timeSeconds * 9) % (VIEWPORT_WIDTH + 130));
    if (visualStyle !== "boss_arena") {
      const cs = palette.cloud;
      const csh = palette.cloudShadow;
      drawCloud(ctx, 80 - cloudOffset, 68, 0.62, cs, csh);
      drawCloud(ctx, 340 - cloudOffset, 90, 0.50, cs, csh);
      drawCloud(ctx, 600 - cloudOffset, 62, 0.56, cs, csh);
      drawCloud(ctx, 860 - cloudOffset, 82, 0.48, cs, csh);
      if (cloudOffset < 120) {
        drawCloud(ctx, VIEWPORT_WIDTH + 80 - cloudOffset, 74, 0.44, cs, csh);
      }
    }

    const farOffset = (cameraX * 0.30) % 260;
    const snowCap = (visualStyle === "ice") ? "rgba(220,244,255,0.85)" : null;
    for (let i = -1; i < 6; i += 1) {
      drawMountain(ctx, i * 240 - farOffset, 342, 240, 148, palette.farMount, snowCap);
    }

    const nearOffset = (cameraX * 0.54) % 200;
    const snowCapN = (visualStyle === "ice") ? "rgba(240,252,255,0.75)" : null;
    for (let i = -1; i < 7; i += 1) {
      drawMountain(ctx, i * 190 - nearOffset, 366, 190, 118, palette.nearMount, snowCapN);
    }

    if (visualStyle === "fortress" || visualStyle === "boss_arena") {
      drawFortressBackdrop(ctx, "rgba(16, 20, 30, 0.55)", "rgba(10, 12, 20, 0.70)");
    }

    drawMidGroundLayer(ctx, cameraX, timeSeconds, palette, visualStyle);

    if (visualStyle === "ice") {
      drawSnowDrift(ctx, timeSeconds);
    }
    if (visualStyle === "lava" || visualStyle === "boss_arena") {
      drawEmbers(ctx, timeSeconds);
    }
    if (visualStyle === "boss_arena") {
      drawLightning(ctx, timeSeconds);
    }

    ctx.fillStyle = palette.ridge;
    ctx.fillRect(0, 368, VIEWPORT_WIDTH, VIEWPORT_HEIGHT - 368);

    if (visualStyle === "lava") {
      drawLavaSea(ctx, timeSeconds, 380, "rgba(145, 42, 16, 0.94)", "rgba(255, 190, 100, 0.75)");
    } else if (visualStyle === "boss_arena") {
      drawLavaSea(ctx, timeSeconds, 372, "rgba(115, 30, 25, 0.97)", "rgba(255, 130, 80, 0.82)");
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
      drawItem(this.ctx, item, cameraX, cameraY, timeSeconds);
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

  drawHud(state, paletteData, timeSeconds) {
    const ctx = this.ctx;
    const { palette, accent } = paletteData;
    const coinProgress = state.coinsTotal > 0 ? state.coinsCollected / state.coinsTotal : 0;
    const timeProgress = state.timeLimit > 0 ? state.timeLeft / state.timeLimit : 0;
    const timeColor = timeBarColor(timeProgress);
    const timeUrgent = timeProgress < 0.28;
    const powerLabel = state.player.powerLevel > 0 ? "FIRE" : "BASE";
    const powerColor = state.player.powerLevel > 0 ? "#ff9940" : palette.textDim;
    const stageShort = (state.level?.name || `Stage ${state.levelIndex + 1}`).substring(0, 22);

    drawPanel(ctx, 8, 6, VIEWPORT_WIDTH - 16, 58, palette.hudBg, palette.hudBorder, 4);

    ctx.fillStyle = palette.hudAccentBar || "rgba(120,200,255,0.12)";
    ctx.fillRect(11, 9, VIEWPORT_WIDTH - 22, 2);
    ctx.fillRect(11, 62, VIEWPORT_WIDTH - 22, 1);

    drawText(ctx, `${state.score}`, 24, 28, {
      font: "bold 14px monospace",
      color: accent,
      shadowColor: accent,
      shadowBlur: 4
    });
    drawText(ctx, "SCORE", 24, 38, {
      font: "10px monospace",
      color: palette.textDim
    });

    ctx.save();
    const livesX = 148;
    drawHearts(ctx, Math.max(0, state.lives), livesX, 18, palette);
    drawText(ctx, "LIVES", livesX, 38, {
      font: "10px monospace",
      color: palette.textDim
    });
    ctx.restore();

    const lvW = 100;
    const lvX = 244;
    drawText(ctx, `${state.levelIndex + 1} / ${state.levelCount}`, lvX + lvW * 0.5, 27, {
      font: "bold 13px monospace",
      color: palette.text,
      align: "center"
    });
    drawText(ctx, "STAGE", lvX + lvW * 0.5, 38, {
      font: "10px monospace",
      color: palette.textDim,
      align: "center"
    });

    const coinBarX = 358;
    const coinBarW = 148;
    drawText(ctx, `${state.coinsCollected}/${state.coinsTotal}`, coinBarX, 24, {
      font: "bold 12px monospace",
      color: "#ffe060"
    });
    drawText(ctx, "COINS", coinBarX, 35, {
      font: "10px monospace",
      color: palette.textDim
    });
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(coinBarX, 41, coinBarW, 6);
    ctx.fillStyle = "#ffe040";
    ctx.fillRect(coinBarX, 41, round(coinBarW * clamp(coinProgress, 0, 1)), 6);
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillRect(coinBarX, 41, round(coinBarW * clamp(coinProgress, 0, 1) * 0.5), 2);

    const timeBarX = 530;
    const timeBarW = 148;
    const timeFlash = timeUrgent && Math.floor(timeSeconds * 4) % 2 === 0;
    const timeVal = Math.max(0, Math.ceil(state.timeLeft));
    drawText(ctx, `${timeVal}s`, timeBarX, 24, {
      font: "bold 12px monospace",
      color: timeFlash ? "#ffffff" : timeColor,
      shadowColor: timeUrgent ? timeColor : null,
      shadowBlur: timeUrgent ? 6 : 0
    });
    drawText(ctx, "TIME", timeBarX, 35, {
      font: "10px monospace",
      color: palette.textDim
    });
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(timeBarX, 41, timeBarW, 6);
    ctx.fillStyle = timeColor;
    ctx.fillRect(timeBarX, 41, round(timeBarW * clamp(timeProgress, 0, 1)), 6);

    drawText(ctx, powerLabel, VIEWPORT_WIDTH - 14, 24, {
      font: "bold 11px monospace",
      color: powerColor,
      align: "right"
    });
    drawText(ctx, "POWER", VIEWPORT_WIDTH - 14, 35, {
      font: "10px monospace",
      color: palette.textDim,
      align: "right"
    });

    drawText(ctx, stageShort, 8 + 16, 54, {
      font: "11px monospace",
      color: "rgba(200,225,255,0.78)"
    });

    if (state.activeBoss) {
      const bossRatio = state.activeBoss.maxHealth > 0
        ? clamp(state.activeBoss.health / state.activeBoss.maxHealth, 0, 1)
        : 0;
      const bossBarX = 160;
      const bossBarW = VIEWPORT_WIDTH - 320;
      drawPanel(ctx, bossBarX - 6, 68, bossBarW + 12, 22, "rgba(28, 6, 8, 0.80)", "rgba(255, 110, 110, 0.50)", 3);
      const bossLabel = `BOSS: ${state.activeBoss.name.toUpperCase()}  ${state.activeBoss.health}/${state.activeBoss.maxHealth}`;
      drawText(ctx, bossLabel, VIEWPORT_WIDTH * 0.5, 82, {
        align: "center",
        font: "bold 11px monospace",
        color: "#ffc8c8"
      });
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(bossBarX, 72, bossBarW, 5);
      const bossFill = round(bossBarW * bossRatio);
      if (bossFill > 0) {
        ctx.fillStyle = `hsl(${Math.round(bossRatio * 30)},100%,48%)`;
        ctx.fillRect(bossBarX, 72, bossFill, 5);
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.fillRect(bossBarX, 72, round(bossFill * 0.55), 2);
      }
    }
  }

  drawMessage(state, paletteData) {
    if (!state.message) {
      return;
    }
    const msg = state.message;
    let msgColor = "#d8f0ff";
    let panelColor = "rgba(8, 16, 26, 0.62)";

    if (/boss|defeated|warden|titan|overseer/i.test(msg)) {
      msgColor = "#ffb0b0";
      panelColor = "rgba(30, 6, 8, 0.68)";
    } else if (/coin|collected|hidden/i.test(msg)) {
      msgColor = "#ffe878";
      panelColor = "rgba(24, 16, 4, 0.60)";
    } else if (/power.up|fire|mushroom/i.test(msg)) {
      msgColor = "#9aefb8";
      panelColor = "rgba(4, 20, 10, 0.60)";
    } else if (/fell|time|void|lives|no lives/i.test(msg)) {
      msgColor = "#ff8888";
      panelColor = "rgba(30, 6, 6, 0.68)";
    }

    drawPanel(this.ctx, 10, VIEWPORT_HEIGHT - 34, VIEWPORT_WIDTH - 20, 22, panelColor, null, 3);
    drawText(this.ctx, msg, 20, VIEWPORT_HEIGHT - 18, {
      font: "12px monospace",
      color: msgColor
    });
  }

  drawOverlay(state, paletteData, timeSeconds) {
    if (state.screen === SCREENS.PLAYING) {
      return;
    }

    const ctx = this.ctx;
    ctx.fillStyle = "rgba(4, 7, 14, 0.66)";
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    const { palette, accent } = paletteData;
    drawPanel(ctx, 96, 78, 576, 282, "rgba(7, 12, 22, 0.94)", palette.hudBorder, 6);
    ctx.fillStyle = palette.hudAccentBar || "rgba(120,200,255,0.12)";
    ctx.fillRect(100, 82, 568, 3);

    const title =
      state.screen === SCREENS.START
        ? "SKY RUNNER DX"
        : state.screen === SCREENS.LEVEL_COMPLETE
          ? "STAGE CLEAR!"
          : state.screen === SCREENS.GAME_COMPLETE
            ? "CAMPAIGN COMPLETE!"
            : "RUN FAILED";

    const titleColor =
      state.screen === SCREENS.GAME_COMPLETE
        ? "#80ff98"
        : state.screen === SCREENS.GAME_OVER
          ? "#ff7070"
          : "#d8f0ff";

    drawText(ctx, title, VIEWPORT_WIDTH / 2, 120, {
      align: "center",
      font: "bold 26px monospace",
      color: titleColor,
      shadowColor: titleColor,
      shadowBlur: 10
    });

    if (state.screen === SCREENS.LEVEL_COMPLETE || state.screen === SCREENS.GAME_COMPLETE) {
      drawText(ctx, `Score: ${state.score}`, VIEWPORT_WIDTH / 2, 148, {
        align: "center",
        font: "14px monospace",
        color: accent
      });
    }

    const subtitle =
      state.screen === SCREENS.START
        ? "Random 5-map route · horizontal, hybrid & vertical stages"
        : state.screen === SCREENS.LEVEL_COMPLETE
          ? `Loading next stage... (${state.levelIndex + 2}/${state.levelCount})`
          : state.screen === SCREENS.GAME_COMPLETE
            ? "All bosses defeated! Press Enter for a new route."
            : `Lives ran out. Score: ${state.score} · Press Enter to retry.`;

    drawText(ctx, subtitle, VIEWPORT_WIDTH / 2, state.screen === SCREENS.LEVEL_COMPLETE ? 170 : 162, {
      align: "center",
      font: "13px monospace",
      color: "rgba(185,210,240,0.90)"
    });

    if (state.screen === SCREENS.START) {
      const controls = [
        { key: "A / D  or  ← →", label: "Move" },
        { key: "W / ↑ / Space",  label: "Jump  (hold = higher)" },
        { key: "F / B",          label: "Fire  (needs power-up)" },
        { key: "R",              label: "Restart current level" }
      ];
      controls.forEach((ctrl, i) => {
        const cy = 192 + i * 24;
        drawPanel(ctx, 150, cy - 14, 468, 20, "rgba(255,255,255,0.04)", null, 3);
        drawText(ctx, ctrl.key, 246, cy, {
          font: "bold 12px monospace",
          color: "#97f0c0",
          align: "right"
        });
        drawText(ctx, `  ${ctrl.label}`, 250, cy, {
          font: "12px monospace",
          color: "#c0d8f0"
        });
      });

      drawText(ctx, "Objective: defeat all bosses and capture the flag!", VIEWPORT_WIDTH / 2, 300, {
        align: "center",
        font: "12px monospace",
        color: "#ffe89a"
      });
    }

    drawPanel(ctx, 200, 326, 368, 24, "rgba(255,255,255,0.06)", null, 4);
    drawText(ctx, "Enter / Jump: Start    |    R: Restart", VIEWPORT_WIDTH / 2, 341, {
      align: "center",
      font: "12px monospace",
      color: accent
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
    this.drawHud(state, paletteData, timeSeconds);
    this.drawMessage(state, paletteData);
    this.drawOverlay(state, paletteData, timeSeconds);
    drawScanlines(this.ctx);
  }
}
