import { ART_ASSETS, WORLD_THEMES } from "../core/level/themes";
import { STAGE_HEIGHT, STAGE_WIDTH, clamp, easeOutCubic } from "../core/physics/constants";

const imageCache = new Map();

function getImage(src) {
  if (!src) {
    return null;
  }
  if (!imageCache.has(src)) {
    const image = new Image();
    image.src = src;
    imageCache.set(src, image);
  }
  return imageCache.get(src);
}

function roundRectPath(ctx, x, y, w, h, radius) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function coverImage(ctx, image, x, y, width, height) {
  if (!image?.complete || !image.naturalWidth) {
    return false;
  }
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const dx = x + (width - drawWidth) / 2;
  const dy = y + (height - drawHeight) / 2;
  ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
  return true;
}

function drawProceduralBackground(ctx, background) {
  const gradient = ctx.createLinearGradient(0, 0, 0, STAGE_HEIGHT);
  gradient.addColorStop(0, background.skyTop ?? "#091427");
  gradient.addColorStop(1, background.skyBottom ?? "#16213f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

  ctx.strokeStyle = background.grid ?? "#223f6a";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.45;
  for (let x = 0; x <= STAGE_WIDTH; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, STAGE_HEIGHT * 0.58);
    ctx.lineTo(x, STAGE_HEIGHT);
    ctx.stroke();
  }
  for (let y = STAGE_HEIGHT * 0.58; y <= STAGE_HEIGHT; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(STAGE_WIDTH, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawBackground(ctx, level, clockMs) {
  const theme = WORLD_THEMES[level.world];
  const background = theme.backgrounds[level.backgroundId] ?? theme.backgrounds["prism-bay"];
  ctx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

  if (background.kind === "procedural") {
    drawProceduralBackground(ctx, background);
  } else {
    const image = getImage(ART_ASSETS.backgrounds[level.backgroundId]);
    if (!coverImage(ctx, image, 0, 0, STAGE_WIDTH, STAGE_HEIGHT)) {
      drawProceduralBackground(ctx, theme.backgrounds["prism-bay"]);
    }
    ctx.fillStyle = background.overlayTop ?? "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT * 0.56);
    const overlay = ctx.createLinearGradient(0, STAGE_HEIGHT * 0.28, 0, STAGE_HEIGHT);
    overlay.addColorStop(0, "rgba(5, 10, 24, 0)");
    overlay.addColorStop(1, background.overlayBottom ?? "rgba(0,0,0,0.35)");
    ctx.fillStyle = overlay;
    ctx.fillRect(0, STAGE_HEIGHT * 0.28, STAGE_WIDTH, STAGE_HEIGHT * 0.72);
  }

  ctx.globalAlpha = 0.2;
  ctx.fillStyle = theme.palette.accent;
  ctx.beginPath();
  ctx.arc(140 + Math.sin(clockMs / 1900) * 40, 84, 96, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = theme.palette.accentWarm;
  ctx.beginPath();
  ctx.arc(802 + Math.cos(clockMs / 2200) * 48, 126, 72, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = "rgba(7, 12, 25, 0.7)";
  ctx.fillRect(0, STAGE_HEIGHT - 70, STAGE_WIDTH, 70);
}

function drawSpawnPad(ctx, spawn) {
  const x = spawn.x - spawn.padWidth / 2;
  const y = spawn.y + 8;
  roundRectPath(ctx, x, y, spawn.padWidth, spawn.padHeight, 14);
  ctx.fillStyle = "#574f68";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawTarget(ctx, target, captureRatio = 0) {
  const shelfX = target.x - 126 / 2;
  const shelfY = target.y - 54;
  roundRectPath(ctx, shelfX, shelfY, 126, 22, 14);
  ctx.fillStyle = "#574f68";
  ctx.fill();

  ctx.save();
  ctx.globalAlpha = 0.95;
  const glow = 22 + captureRatio * 30;
  ctx.shadowColor = `rgba(98, 231, 255, ${0.38 + captureRatio * 0.32})`;
  ctx.shadowBlur = glow;
  const bucket = getImage(ART_ASSETS.bucketTargetUrl);
  if (bucket?.complete && bucket.naturalWidth) {
    ctx.drawImage(bucket, target.x - target.w / 2, target.y - 8, target.w, target.h);
  } else {
    roundRectPath(ctx, target.x - target.w / 2, target.y + 4, target.w, target.h * 0.72, 22);
    ctx.fillStyle = "#62a6ea";
    ctx.fill();
  }
  ctx.restore();

  ctx.strokeStyle = `rgba(146, 244, 255, ${0.5 + captureRatio * 0.4})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(target.x, target.y + 6, target.innerW * 0.7, 14, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawWall(ctx, obstacle, fill = "#536385") {
  roundRectPath(ctx, obstacle.x - obstacle.w / 2, obstacle.y - obstacle.h / 2, obstacle.w, obstacle.h, Math.min(16, obstacle.h / 2));
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawRamp(ctx, obstacle) {
  ctx.lineWidth = obstacle.thickness ?? 18;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#68c6d6";
  ctx.beginPath();
  ctx.moveTo(obstacle.x1, obstacle.y1);
  ctx.lineTo(obstacle.x2, obstacle.y2);
  ctx.stroke();
  ctx.lineWidth = Math.max(2, (obstacle.thickness ?? 18) * 0.2);
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.stroke();
}

function drawBumper(ctx, obstacle, clockMs) {
  const image = getImage(ART_ASSETS.bumperRoundUrl);
  ctx.save();
  ctx.translate(obstacle.x, obstacle.y);
  ctx.rotate(Math.sin(clockMs / 500) * 0.04);
  ctx.shadowColor = "rgba(93, 255, 214, 0.38)";
  ctx.shadowBlur = 14;
  if (image?.complete && image.naturalWidth) {
    ctx.drawImage(image, -obstacle.radius, -obstacle.radius, obstacle.radius * 2, obstacle.radius * 2);
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, obstacle.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#46e1bf";
    ctx.fill();
  }
  ctx.restore();
}

function drawSpikeStrip(ctx, obstacle) {
  const image = getImage(ART_ASSETS.spikeStripUrl);
  if (image?.complete && image.naturalWidth) {
    ctx.drawImage(image, obstacle.x - obstacle.w / 2, obstacle.y - obstacle.h / 2, obstacle.w, obstacle.h);
    return;
  }
  ctx.fillStyle = "#c9d1df";
  const startX = obstacle.x - obstacle.w / 2;
  const count = Math.max(4, Math.floor(obstacle.w / 18));
  const width = obstacle.w / count;
  for (let index = 0; index < count; index += 1) {
    const x = startX + index * width;
    ctx.beginPath();
    ctx.moveTo(x, obstacle.y + obstacle.h / 2);
    ctx.lineTo(x + width / 2, obstacle.y - obstacle.h / 2);
    ctx.lineTo(x + width, obstacle.y + obstacle.h / 2);
    ctx.closePath();
    ctx.fill();
  }
}

function drawFan(ctx, obstacle, clockMs) {
  roundRectPath(ctx, obstacle.x - obstacle.w / 2, obstacle.y - obstacle.h / 2, obstacle.w, obstacle.h, 18);
  ctx.fillStyle = "rgba(99, 191, 255, 0.14)";
  ctx.fill();
  ctx.strokeStyle = "rgba(99, 191, 255, 0.42)";
  ctx.setLineDash([8, 8]);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.globalAlpha = 0.32;
  ctx.strokeStyle = "#9fe3ff";
  for (let index = 0; index < 5; index += 1) {
    const offset = ((clockMs / 1000) * 48 + index * 26) % obstacle.h;
    ctx.beginPath();
    ctx.moveTo(obstacle.x - obstacle.w / 2 + 12, obstacle.y + obstacle.h / 2 - offset);
    ctx.lineTo(obstacle.x + obstacle.w / 2 - 12, obstacle.y + obstacle.h / 2 - offset - 18);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawGravityWell(ctx, obstacle, clockMs) {
  const pulse = 0.84 + Math.sin(clockMs / 280) * 0.08;
  ctx.save();
  ctx.translate(obstacle.x, obstacle.y);
  ctx.strokeStyle = "rgba(132, 160, 255, 0.48)";
  ctx.lineWidth = 3;
  for (let ring = 0; ring < 3; ring += 1) {
    ctx.beginPath();
    ctx.arc(0, 0, obstacle.radius * (0.45 + ring * 0.22) * pulse, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(121, 135, 255, 0.2)";
  ctx.beginPath();
  ctx.arc(0, 0, obstacle.radius * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPortal(ctx, obstacle, clockMs) {
  ctx.save();
  ctx.translate(obstacle.x, obstacle.y);
  ctx.rotate(clockMs / 620);
  ctx.strokeStyle = "#85f8ff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, obstacle.radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.46;
  ctx.strokeStyle = "#bb6cff";
  ctx.beginPath();
  ctx.arc(0, 0, obstacle.radius * 0.68, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawParticles(ctx, particles) {
  particles.forEach((particle) => {
    ctx.save();
    ctx.globalAlpha = particle.alpha;
    ctx.fillStyle = particle.color;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = particle.glow ?? 0;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawBall(ctx, ball, skin, clockMs) {
  const baseImage = getImage(ART_ASSETS.ballOrangeUrl);
  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.rotate(ball.rotation + clockMs / 5000);
  ctx.scale(ball.stretchX ?? 1, ball.stretchY ?? 1);

  const gradient = ctx.createRadialGradient(-6, -8, 2, 0, 0, ball.radius + 2);
  gradient.addColorStop(0, skin.colors[1]);
  gradient.addColorStop(0.45, skin.colors[0]);
  gradient.addColorStop(1, skin.colors[2]);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(-5, -7, ball.radius * 0.38, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  if (baseImage?.complete && baseImage.naturalWidth) {
    ctx.globalAlpha = 0.35;
    ctx.drawImage(baseImage, -ball.radius - 2, -ball.radius - 2, (ball.radius + 2) * 2, (ball.radius + 2) * 2);
  }
  ctx.restore();
}

function drawTrail(ctx, trail) {
  trail.forEach((point, index) => {
    const alpha = (index + 1) / Math.max(1, trail.length) * 0.28;
    ctx.fillStyle = `rgba(190, 247, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawAimPreview(ctx, level, aim) {
  if (!aim?.dots?.length) {
    return;
  }

  ctx.strokeStyle = "rgba(188, 245, 255, 0.38)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(level.ballSpawn.x, level.ballSpawn.y);
  aim.dots.forEach((dot) => ctx.lineTo(dot.x, dot.y));
  ctx.stroke();

  aim.dots.forEach((dot, index) => {
    const t = easeOutCubic(index / Math.max(1, aim.dots.length - 1));
    ctx.fillStyle = `rgba(255, 255, 255, ${0.24 + t * 0.52})`;
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, 2 + t * 2.4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawTopHud(ctx, level, runtime) {
  ctx.save();
  roundRectPath(ctx, 18, 16, 324, 52, 16);
  ctx.fillStyle = "rgba(9, 19, 37, 0.78)";
  ctx.fill();
  ctx.strokeStyle = "rgba(115, 228, 255, 0.18)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#f1fbff";
  ctx.font = "700 18px Outfit";
  ctx.fillText(`${runtime.locale === "es" ? "Nivel" : "Level"} ${level.index + 1} · ${level.name[runtime.locale]}`, 34, 38);
  ctx.fillStyle = "rgba(214, 236, 255, 0.82)";
  ctx.font = "600 13px Outfit";
  ctx.fillText(
    `${runtime.locale === "es" ? "Intento" : "Attempt"} ${runtime.runStats.attempts} · ${runtime.locale === "es" ? "Rebotes" : "Bounces"} ${runtime.runStats.rebounds} · ${Math.ceil((runtime.level.physicsProfile.timeLimitMs - runtime.runStats.elapsedMs) / 1000)}s`,
    34,
    56
  );
  ctx.restore();
}

export function drawFluxScene(ctx, runtime) {
  const { level, ball, posedTarget, posedObstacles, aim, particles, clockMs } = runtime;
  const selectedSkin =
    runtime.selectedSkin ??
    runtime.getSelectedSkin?.() ?? {
      colors: ["#ff9b33", "#ffcf68", "#8f3f08"],
    };
  if (!level) {
    ctx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    return;
  }

  drawBackground(ctx, level, clockMs);
  ctx.save();
  ctx.translate(runtime.shakeOffset.x, runtime.shakeOffset.y);

  drawSpawnPad(ctx, level.ballSpawn);
  drawTarget(ctx, posedTarget, clamp(ball.targetDwellMs / Math.max(1, posedTarget.holdMs), 0, 1));

  posedObstacles.forEach((obstacle) => {
    if (obstacle.type === "wall") {
      drawWall(ctx, obstacle);
    } else if (obstacle.type === "movingBar") {
      const image = getImage(ART_ASSETS.movingBarUrl);
      if (image?.complete && image.naturalWidth) {
        ctx.drawImage(image, obstacle.x - obstacle.w / 2, obstacle.y - obstacle.h / 2, obstacle.w, obstacle.h);
      } else {
        drawWall(ctx, obstacle, "#53c6b2");
      }
    } else if (obstacle.type === "gate") {
      if (!obstacle.open) {
        drawWall(ctx, obstacle, "#4f5d80");
      }
    } else if (obstacle.type === "stickyPad") {
      drawWall(ctx, obstacle, "#4dd0b2");
    } else if (obstacle.type === "ramp") {
      drawRamp(ctx, obstacle);
    } else if (obstacle.type === "bumper") {
      drawBumper(ctx, obstacle, clockMs);
    } else if (obstacle.type === "spikeStrip") {
      drawSpikeStrip(ctx, obstacle);
    } else if (obstacle.type === "fan") {
      drawFan(ctx, obstacle, clockMs);
    } else if (obstacle.type === "gravityWell") {
      drawGravityWell(ctx, obstacle, clockMs);
    } else if (obstacle.type === "portal") {
      drawPortal(ctx, obstacle, clockMs);
    }
  });

  if (runtime.playState === "aiming") {
    drawAimPreview(ctx, level, aim);
  }

  drawTrail(ctx, ball.trail ?? []);
  drawParticles(ctx, particles);
  drawBall(ctx, ball, selectedSkin, clockMs);
  ctx.restore();
  drawTopHud(ctx, level, runtime);
}
