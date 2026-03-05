import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CEILING_Y,
  GROUND_Y,
  PLAYER_CORE_RADIUS,
  PLAYER_RADIUS,
  SCREEN_PLAYER_X,
} from "../constants";
import { getObstaclePhaseEnabled } from "../physics";
import { worldToScreenX } from "../systems/cameraSystem";
import { drawBackgroundLayer } from "./layers/bg";
import { drawMidLayer } from "./layers/mid";
import { drawForegroundLayer } from "./layers/fg";
import { drawUiOverlays } from "./layers/uiOverlays";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function ensurePatternCache(ctx, cache, paletteKey, palette) {
  if (cache.patterns && cache.paletteKey === paletteKey) {
    return cache.patterns;
  }

  const createPattern = (drawFn) => {
    const canvas = document.createElement("canvas");
    canvas.width = 52;
    canvas.height = 52;
    const pctx = canvas.getContext("2d");
    drawFn(pctx);
    return ctx.createPattern(canvas, "repeat");
  };

  const patterns = {
    "prism-block": createPattern((pctx) => {
      pctx.fillStyle = "rgba(118, 237, 255, 0.48)";
      pctx.fillRect(0, 0, 52, 52);
      pctx.strokeStyle = "rgba(8, 26, 44, 0.45)";
      pctx.lineWidth = 2;
      pctx.beginPath();
      pctx.moveTo(0, 26);
      pctx.lineTo(52, 26);
      pctx.stroke();
      pctx.beginPath();
      pctx.moveTo(0, 0);
      pctx.lineTo(52, 52);
      pctx.stroke();
    }),
    "energy-shutter": createPattern((pctx) => {
      pctx.fillStyle = "rgba(255, 150, 106, 0.5)";
      pctx.fillRect(0, 0, 52, 52);
      pctx.strokeStyle = "rgba(37, 15, 6, 0.45)";
      pctx.lineWidth = 3;
      for (let y = 6; y < 52; y += 9) {
        pctx.beginPath();
        pctx.moveTo(0, y);
        pctx.lineTo(52, y - 4);
        pctx.stroke();
      }
    }),
    "laser-gate": createPattern((pctx) => {
      pctx.fillStyle = "rgba(126, 134, 255, 0.44)";
      pctx.fillRect(0, 0, 52, 52);
      pctx.strokeStyle = "rgba(205, 222, 255, 0.56)";
      pctx.lineWidth = 2;
      for (let x = 6; x < 52; x += 10) {
        pctx.beginPath();
        pctx.moveTo(x, 0);
        pctx.lineTo(x, 52);
        pctx.stroke();
      }
    }),
    "pulse-pylon": createPattern((pctx) => {
      pctx.fillStyle = "rgba(255, 226, 113, 0.45)";
      pctx.fillRect(0, 0, 52, 52);
      pctx.fillStyle = "rgba(255, 242, 186, 0.52)";
      pctx.beginPath();
      pctx.arc(26, 26, 8, 0, Math.PI * 2);
      pctx.fill();
      pctx.strokeStyle = "rgba(61, 43, 0, 0.4)";
      pctx.lineWidth = 2;
      pctx.beginPath();
      pctx.moveTo(0, 0);
      pctx.lineTo(52, 52);
      pctx.moveTo(52, 0);
      pctx.lineTo(0, 52);
      pctx.stroke();
    }),
    "finish-beacon": createPattern((pctx) => {
      pctx.fillStyle = "rgba(255, 242, 157, 0.6)";
      pctx.fillRect(0, 0, 52, 52);
      pctx.strokeStyle = "rgba(255, 252, 222, 0.75)";
      pctx.lineWidth = 3;
      pctx.beginPath();
      pctx.moveTo(26, 0);
      pctx.lineTo(26, 52);
      pctx.stroke();
    }),
  };

  cache.patterns = patterns;
  cache.paletteKey = paletteKey;
  cache.bgGradient = null;
  cache.vignette = null;
  return patterns;
}

function drawObstacleShape(ctx, obstacle, x, alpha, telegraph, pattern, phaseEnabled) {
  const y = obstacle.y;
  const w = obstacle.w;
  const h = obstacle.h;

  const phaseAlpha = phaseEnabled ? alpha : alpha * 0.22;
  ctx.globalAlpha = phaseAlpha;
  ctx.fillStyle = pattern || "rgba(132, 220, 255, 0.5)";

  if (obstacle.type === "prism-block") {
    const bevel = Math.max(6, Math.min(16, w * 0.22));
    ctx.beginPath();
    ctx.moveTo(x + bevel, y);
    ctx.lineTo(x + w - bevel, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();
  } else if (obstacle.type === "energy-shutter") {
    ctx.beginPath();
    ctx.moveTo(x + 4, y);
    ctx.lineTo(x + w, y + 8);
    ctx.lineTo(x + w - 4, y + h);
    ctx.lineTo(x, y + h - 8);
    ctx.closePath();
    ctx.fill();
  } else if (obstacle.type === "laser-gate") {
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = phaseAlpha * 0.8;
    ctx.fillStyle = "rgba(226, 236, 255, 0.55)";
    ctx.fillRect(x + w * 0.33, y, 3, h);
    ctx.fillRect(x + w * 0.66, y, 3, h);
  } else if (obstacle.type === "pulse-pylon") {
    const topH = Math.min(16, h * 0.22);
    ctx.fillRect(x + 4, y + topH, w - 8, h - topH);
    ctx.fillRect(x, y, w, topH);
  } else {
    ctx.fillRect(x, y, w, h);
  }

  if (telegraph > 0.01 && obstacle.type !== "finish-beacon") {
    ctx.globalAlpha = telegraph * (phaseEnabled ? 0.62 : 0.2);
    ctx.fillStyle = "rgba(255, 250, 214, 0.9)";
    ctx.fillRect(x - 6, y - 6, w + 12, h + 12);
  }

  ctx.globalAlpha = phaseEnabled ? alpha : alpha * 0.35;
  ctx.strokeStyle = "rgba(9, 18, 28, 0.55)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);
  ctx.globalAlpha = 1;
}

function drawPickups(ctx, runtime, camera) {
  const pulse = runtime.beat.pulse;
  for (const pickup of runtime.pickups) {
    if (pickup.collected) {
      continue;
    }
    const x = worldToScreenX(camera, pickup.x);
    if (x < -40 || x > CANVAS_WIDTH + 40) {
      continue;
    }

    const ping = Math.sin((runtime.elapsed + pickup.spin) * 6) * 0.5 + 0.5;
    const glow = pickup.r + 8 + pulse * 8;

    ctx.globalAlpha = 0.18 + pulse * 0.18;
    ctx.fillStyle = "#8fdfff";
    ctx.beginPath();
    ctx.arc(x, pickup.y, glow, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.74;
    ctx.fillStyle = "#96f5ff";
    ctx.save();
    ctx.translate(x, pickup.y);
    ctx.rotate(runtime.elapsed * 2 + pickup.spin);
    ctx.beginPath();
    ctx.moveTo(0, -pickup.r);
    ctx.lineTo(pickup.r * 0.82, 0);
    ctx.lineTo(0, pickup.r);
    ctx.lineTo(-pickup.r * 0.82, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.globalAlpha = 0.4 + ping * 0.2;
    ctx.strokeStyle = "#def9ff";
    ctx.beginPath();
    ctx.arc(x, pickup.y, pickup.r + 7 + ping * 8, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawParticles(ctx, runtime, camera) {
  for (const particle of runtime.fx.particles) {
    if (!particle.active || particle.alpha <= 0) {
      continue;
    }
    const x = worldToScreenX(camera, particle.x);
    const y = particle.y + camera.shakeY;
    if (x < -40 || x > CANVAS_WIDTH + 40 || y < -40 || y > CANVAS_HEIGHT + 40) {
      continue;
    }

    ctx.globalAlpha = particle.alpha;
    ctx.strokeStyle = particle.color;
    ctx.fillStyle = particle.color;

    if (particle.shape === "line") {
      ctx.lineWidth = Math.max(1, particle.size * 0.33);
      ctx.beginPath();
      ctx.moveTo(x - particle.size, y - particle.size * 0.5);
      ctx.lineTo(x + particle.size, y + particle.size * 0.5);
      ctx.stroke();
    } else if (particle.shape === "spark") {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(particle.rot);
      ctx.fillRect(-particle.size * 0.2, -particle.size, particle.size * 0.4, particle.size * 2);
      ctx.fillRect(-particle.size, -particle.size * 0.2, particle.size * 2, particle.size * 0.4);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function drawGhost(ctx, runtime, camera) {
  const ghost = runtime.ghost;
  if (!ghost.active) {
    return;
  }
  const x = worldToScreenX(camera, ghost.x);
  const y = ghost.y + camera.shakeY;
  ctx.globalAlpha = 0.32;
  ctx.strokeStyle = "#92dfff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = "#8fdfff";
  ctx.beginPath();
  ctx.arc(x, y, PLAYER_CORE_RADIUS * 1.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawPlayerTrail(ctx, runtime) {
  const { player, camera } = runtime;
  for (const segment of player.trail.items) {
    if (segment.a <= 0.01) {
      continue;
    }
    const x = worldToScreenX(camera, segment.x);
    const y = segment.y + camera.shakeY;
    ctx.globalAlpha = segment.a * 0.35;
    ctx.fillStyle = "#82e7ff";
    ctx.beginPath();
    ctx.arc(x, y, (PLAYER_RADIUS * 0.58) * segment.s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawPlayer(ctx, runtime) {
  const player = runtime.player;
  if (player.invulnerability > 0 && Math.floor(runtime.elapsed * 22) % 2 === 0) {
    return;
  }

  const x = SCREEN_PLAYER_X + runtime.camera.shakeX;
  const y = player.y + runtime.camera.shakeY;
  const squashX = 1 + player.squash * 0.52 - player.stretch * 0.12;
  const squashY = 1 - player.squash * 0.34 + player.stretch * 0.58;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(player.tilt);
  ctx.scale(squashX, squashY);

  const glow = 20 + runtime.beat.pulse * 18;
  ctx.globalAlpha = 0.35 + runtime.beat.pulse * 0.14;
  ctx.fillStyle = "#80e8ff";
  ctx.beginPath();
  ctx.arc(0, 0, glow, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.fillStyle = "#66dfff";
  ctx.strokeStyle = "#ddfcff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    const px = Math.cos(angle) * PLAYER_RADIUS;
    const py = Math.sin(angle) * PLAYER_RADIUS;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#edfff9";
  ctx.beginPath();
  ctx.arc(0, 0, PLAYER_CORE_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawObstacles(ctx, runtime, camera, patterns, palette) {
  const beatNear = clamp(1 - Math.abs(runtime.beat.timer / runtime.beatSeconds - 1), 0, 1);
  const activePhase = runtime.phase.active;

  for (const obstacle of runtime.obstacles) {
    if (obstacle.disabled) {
      continue;
    }
    const x = worldToScreenX(camera, obstacle.x);
    if (x + obstacle.w < -60 || x > CANVAS_WIDTH + 70) {
      continue;
    }

    const distance = obstacle.x - runtime.player.x;
    const distanceFactor = clamp(1 - distance / 420, 0, 1);
    const telegraph = clamp(beatNear * distanceFactor * obstacle.beatThreat, 0, 1);

    const phaseEnabled = getObstaclePhaseEnabled(obstacle, activePhase);
    const pattern = patterns[obstacle.type] ?? patterns["prism-block"];

    drawObstacleShape(ctx, obstacle, x, 1, telegraph, pattern, phaseEnabled);

    if (obstacle.type === "finish-beacon") {
      ctx.globalAlpha = 0.22 + runtime.beat.pulse * 0.2;
      ctx.fillStyle = "rgba(255, 236, 146, 0.55)";
      ctx.fillRect(x - 8, CEILING_Y, obstacle.w + 16, GROUND_Y - CEILING_Y);
      ctx.globalAlpha = 1;
    }
  }

  ctx.fillStyle = `rgba(17, 25, 38, ${(0.33 + runtime.beat.pulse * 0.1).toFixed(3)})`;
  ctx.fillRect(0, GROUND_Y + 1, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
}

function drawPhaseIndicator(ctx, runtime) {
  const phaseText = `Phase ${runtime.phase.active}`;
  ctx.textAlign = "left";
  ctx.font = "600 15px 'Outfit', sans-serif";
  ctx.fillStyle = runtime.phase.active === "A" ? "#8be6ff" : "#ffd196";
  ctx.fillText(phaseText, 20, 28);

  const cooldownRatio = clamp(runtime.phase.cooldown / runtime.phase.cooldownMax, 0, 1);
  ctx.strokeStyle = "rgba(177, 231, 255, 0.42)";
  ctx.strokeRect(16, 34, 120, 8);
  ctx.fillStyle = "rgba(130, 226, 255, 0.62)";
  ctx.fillRect(16, 34, 120 * (1 - cooldownRatio), 8);
}

export function createRenderer() {
  return {
    cache: {
      paletteKey: "",
      patterns: null,
      bgGradient: null,
      vignette: null,
      dustPoints: null,
    },
  };
}

export function drawFrame(ctx, runtime, palette, renderer) {
  const cache = renderer.cache;
  const paletteKey = `${palette.bgTop}-${palette.bgBottom}-${palette.lane}`;
  const patterns = ensurePatternCache(ctx, cache, paletteKey, palette);

  ctx.save();
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawBackgroundLayer(ctx, runtime, runtime.camera, palette, cache);
  drawMidLayer(ctx, runtime, runtime.camera, palette);
  drawObstacles(ctx, runtime, runtime.camera, patterns, palette);
  drawPickups(ctx, runtime, runtime.camera);

  drawPlayerTrail(ctx, runtime);
  drawGhost(ctx, runtime, runtime.camera);
  drawPlayer(ctx, runtime);

  drawParticles(ctx, runtime, runtime.camera);
  drawForegroundLayer(ctx, runtime, runtime.camera, cache, runtime.settings.reduceMotion);
  drawPhaseIndicator(ctx, runtime);
  drawUiOverlays(ctx, runtime, palette);

  if (runtime.fx.flashAlpha > 0.01) {
    ctx.globalAlpha = runtime.fx.flashAlpha;
    ctx.fillStyle = runtime.fx.flashColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}
