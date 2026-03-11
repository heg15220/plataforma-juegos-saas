import { ASSET_REFERENCE, countRuleStatuses } from "./reference";
import {
  FRAME_COUNT,
  FULL_RACK,
  PIN_LAYOUT,
  clamp,
  clampDisplayNumber,
  formatFrameSymbols,
  getBallState,
  getDifficultyLabel,
  getLaneLabel,
} from "./runtime";

function resizeCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const pixelWidth = Math.round(width * dpr);
  const pixelHeight = Math.round(height * dpr);

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const safe = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safe, y);
  ctx.lineTo(x + width - safe, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safe);
  ctx.lineTo(x + width, y + height - safe);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safe, y + height);
  ctx.lineTo(x + safe, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safe);
  ctx.lineTo(x, y + safe);
  ctx.quadraticCurveTo(x, y, x + safe, y);
  ctx.closePath();
}

function drawQuad(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index].x, points[index].y);
  }
  ctx.closePath();
}

function createLaneGeometry(width, height, activeIndex) {
  const nearY = height * 0.88;
  const farY = height * 0.2;
  const left = {
    label: "A",
    active: activeIndex === 0,
    nearCenterX: width * 0.31,
    farCenterX: width * 0.39,
    nearHalfWidth: width * 0.17,
    farHalfWidth: width * 0.106,
    nearY,
    farY,
  };
  const right = {
    label: "B",
    active: activeIndex === 1,
    nearCenterX: width * 0.69,
    farCenterX: width * 0.61,
    nearHalfWidth: width * 0.17,
    farHalfWidth: width * 0.106,
    nearY,
    farY,
  };
  return [left, right];
}

function projectLanePoint(lane, xNorm, depth) {
  const t = clamp(depth, 0, 1);
  const y = lane.nearY + (lane.farY - lane.nearY) * t;
  const centerX = lane.nearCenterX + (lane.farCenterX - lane.nearCenterX) * t;
  const halfWidth = lane.nearHalfWidth + (lane.farHalfWidth - lane.nearHalfWidth) * t;
  return {
    x: centerX + xNorm * halfWidth,
    y,
    centerX,
    halfWidth,
  };
}

function drawBackground(ctx, width, height) {
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#06101e");
  bg.addColorStop(0.55, "#0d1a2d");
  bg.addColorStop(1, "#06101a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Ceiling ambient glow
  const ceilingGlow = ctx.createRadialGradient(
    width * 0.5,
    height * 0.01,
    8,
    width * 0.5,
    height * 0.14,
    width * 0.5
  );
  ceilingGlow.addColorStop(0, "rgba(244, 196, 111, 0.3)");
  ceilingGlow.addColorStop(1, "rgba(244, 196, 111, 0)");
  ctx.fillStyle = ceilingGlow;
  ctx.fillRect(0, 0, width, height * 0.42);

  // Ceiling panel lines
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  for (let index = 0; index < 7; index += 1) {
    const x = width * (0.07 + index * 0.14);
    ctx.fillRect(x, 0, 3, height * 0.13);
  }

  // Overhead hanging light fixtures
  const fixturePositions = [width * 0.22, width * 0.5, width * 0.78];
  for (const fx of fixturePositions) {
    // Wire
    ctx.strokeStyle = "rgba(180, 180, 190, 0.28)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(fx, 0);
    ctx.lineTo(fx, height * 0.068);
    ctx.stroke();

    // Housing body
    const hx = fx - 14;
    const hy = height * 0.064;
    drawRoundedRect(ctx, hx, hy, 28, 14, 4);
    const housing = ctx.createLinearGradient(hx, hy, hx, hy + 14);
    housing.addColorStop(0, "#1e2c42");
    housing.addColorStop(1, "#111c2f");
    ctx.fillStyle = housing;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Bulb glow inner
    const bulbGrad = ctx.createRadialGradient(fx, hy + 14, 2, fx, hy + 14, 6);
    bulbGrad.addColorStop(0, "rgba(255, 240, 180, 0.95)");
    bulbGrad.addColorStop(1, "rgba(255, 220, 120, 0)");
    ctx.fillStyle = bulbGrad;
    ctx.beginPath();
    ctx.arc(fx, hy + 14, 6, 0, Math.PI * 2);
    ctx.fill();

    // Light cone downward
    const coneGrad = ctx.createRadialGradient(fx, hy + 14, 4, fx, hy + 22, width * 0.18);
    coneGrad.addColorStop(0, "rgba(255, 235, 175, 0.22)");
    coneGrad.addColorStop(0.6, "rgba(255, 220, 140, 0.06)");
    coneGrad.addColorStop(1, "rgba(255, 220, 140, 0)");
    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(fx - 13, hy + 14);
    ctx.lineTo(fx + 13, hy + 14);
    ctx.lineTo(fx + width * 0.16, height * 0.72);
    ctx.lineTo(fx - width * 0.16, height * 0.72);
    ctx.closePath();
    ctx.fill();
  }
}

function drawBackWall(ctx, width, height, ui) {
  ctx.fillStyle = "rgba(2, 6, 23, 0.56)";
  ctx.fillRect(0, height * 0.1, width, height * 0.18);

  const signWidth = width * 0.28;
  const signX = width * 0.36;
  const signY = height * 0.145;
  drawRoundedRect(ctx, signX, signY, signWidth, height * 0.08, 18);
  ctx.fillStyle = "rgba(12, 20, 36, 0.92)";
  ctx.fill();
  ctx.strokeStyle = "rgba(247, 196, 94, 0.38)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#f4d199";
  ctx.font = "700 18px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(ui.monitorLabel, signX + signWidth / 2, signY + height * 0.047);
  ctx.textAlign = "start";
}

function drawApproach(ctx, width, height) {
  const topY = height * 0.78;
  const bottomY = height * 0.98;
  const leftTop = width * 0.08;
  const rightTop = width * 0.92;

  const wood = ctx.createLinearGradient(0, topY, 0, bottomY);
  wood.addColorStop(0, "#6f4928");
  wood.addColorStop(1, "#3d2514");
  ctx.fillStyle = wood;
  drawQuad(ctx, [
    { x: leftTop, y: topY },
    { x: rightTop, y: topY },
    { x: width * 0.98, y: bottomY },
    { x: width * 0.02, y: bottomY },
  ]);
  ctx.fill();

  ctx.strokeStyle = "rgba(248, 216, 167, 0.14)";
  ctx.lineWidth = 1;
  for (let index = 0; index <= 24; index += 1) {
    const xTop = leftTop + ((rightTop - leftTop) * index) / 24;
    const xBottom = width * 0.02 + ((width * 0.96) * index) / 24;
    ctx.beginPath();
    ctx.moveTo(xTop, topY);
    ctx.lineTo(xBottom, bottomY);
    ctx.stroke();
  }

  // Approach dots (standard 7 dots near foul line)
  const dotY = topY + (bottomY - topY) * 0.28;
  const dotSpacing = (rightTop - leftTop) / 8;
  ctx.fillStyle = "rgba(248, 216, 167, 0.48)";
  for (let index = 1; index <= 7; index += 1) {
    const dotX = leftTop + dotSpacing * index;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBallReturn(ctx, width, height) {
  const bodyX = width * 0.43;
  const bodyY = height * 0.79;
  const bodyWidth = width * 0.14;
  const bodyHeight = height * 0.11;

  drawRoundedRect(ctx, bodyX, bodyY, bodyWidth, bodyHeight, 18);
  const metallic = ctx.createLinearGradient(bodyX, bodyY, bodyX + bodyWidth, bodyY + bodyHeight);
  metallic.addColorStop(0, "#131f2f");
  metallic.addColorStop(0.5, "#263649");
  metallic.addColorStop(1, "#101826");
  ctx.fillStyle = metallic;
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#0a1018";
  drawRoundedRect(ctx, bodyX + bodyWidth * 0.15, bodyY + bodyHeight * 0.22, bodyWidth * 0.7, bodyHeight * 0.34, 10);
  ctx.fill();

  const balls = [
    { x: bodyX + bodyWidth * 0.28, y: bodyY + bodyHeight * 0.69, color: "#1b2332" },
    { x: bodyX + bodyWidth * 0.5, y: bodyY + bodyHeight * 0.66, color: "#7d1422" },
    { x: bodyX + bodyWidth * 0.7, y: bodyY + bodyHeight * 0.7, color: "#c28b44" },
  ];
  for (const ball of balls) {
    const radius = bodyWidth * 0.06;
    const fill = ctx.createRadialGradient(ball.x - radius * 0.35, ball.y - radius * 0.35, 1, ball.x, ball.y, radius);
    fill.addColorStop(0, "#f5f6f7");
    fill.addColorStop(0.15, ball.color === "#1b2332" ? "#49556a" : ball.color);
    fill.addColorStop(1, "#0b1220");
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLane(ctx, lane, game) {
  const now = Date.now();
  const gutterSpread = lane.active ? 1.24 : 1.18;
  const kickbackSpread = lane.active ? 1.1 : 1.08;
  const lanePoints = [
    projectLanePoint(lane, -1, 0),
    projectLanePoint(lane, 1, 0),
    projectLanePoint(lane, 1, 1),
    projectLanePoint(lane, -1, 1),
  ];
  const outerPoints = [
    projectLanePoint(lane, -gutterSpread, 0),
    projectLanePoint(lane, gutterSpread, 0),
    projectLanePoint(lane, gutterSpread, 1),
    projectLanePoint(lane, -gutterSpread, 1),
  ];
  const kickbackPoints = [
    projectLanePoint(lane, -kickbackSpread, 0),
    projectLanePoint(lane, kickbackSpread, 0),
    projectLanePoint(lane, kickbackSpread, 1),
    projectLanePoint(lane, -kickbackSpread, 1),
  ];

  ctx.fillStyle = "rgba(8, 14, 24, 0.9)";
  drawQuad(ctx, outerPoints);
  ctx.fill();

  ctx.fillStyle = lane.active ? "rgba(29, 42, 62, 0.9)" : "rgba(17, 28, 42, 0.9)";
  drawQuad(ctx, kickbackPoints);
  ctx.fill();

  drawQuad(ctx, lanePoints);
  const wood = ctx.createLinearGradient(0, lane.nearY, 0, lane.farY);
  wood.addColorStop(0, lane.active ? "#b96e35" : "#8f6139");
  wood.addColorStop(0.42, lane.active ? "#d19152" : "#a77748");
  wood.addColorStop(0.72, lane.active ? "#f1d3a0" : "#d0b38b");
  wood.addColorStop(1, lane.active ? "#d8b07d" : "#b99264");
  ctx.fillStyle = wood;
  ctx.fill();

  ctx.save();
  drawQuad(ctx, lanePoints);
  ctx.clip();

  // Plank lines
  ctx.strokeStyle = lane.active ? "rgba(255, 243, 212, 0.18)" : "rgba(255, 238, 201, 0.1)";
  ctx.lineWidth = 1;
  for (let index = 0; index <= 19; index += 1) {
    const xNorm = -0.95 + (1.9 * index) / 19;
    const near = projectLanePoint(lane, xNorm, 0);
    const far = projectLanePoint(lane, xNorm, 1);
    ctx.beginPath();
    ctx.moveTo(near.x, near.y);
    ctx.lineTo(far.x, far.y);
    ctx.stroke();
  }

  // Animated oil pattern with shimmer
  const shimmer = Math.sin(now * 0.0018) * 0.04;
  const oil = ctx.createLinearGradient(0, lane.nearY, 0, lane.farY);
  oil.addColorStop(0, "rgba(255,255,255,0.01)");
  oil.addColorStop(0.25, "rgba(255,255,255,0.02)");
  oil.addColorStop(0.48 + shimmer, lane.active ? "rgba(180,220,255,0.14)" : "rgba(180,210,255,0.07)");
  oil.addColorStop(0.65, lane.active ? "rgba(200,230,255,0.09)" : "rgba(200,225,255,0.04)");
  oil.addColorStop(0.82, "rgba(255,255,255,0.02)");
  oil.addColorStop(1, "rgba(255,255,255,0.01)");
  ctx.fillStyle = oil;
  drawQuad(ctx, [
    projectLanePoint(lane, -0.5, 0.06),
    projectLanePoint(lane, 0.5, 0.06),
    projectLanePoint(lane, 0.38, 0.84),
    projectLanePoint(lane, -0.38, 0.84),
  ]);
  ctx.fill();

  // Arrows (proper arrowhead triangles)
  ctx.fillStyle = lane.active ? "rgba(241, 212, 140, 0.9)" : "rgba(231, 214, 184, 0.52)";
  const arrowDepth = 0.34;
  for (const xNorm of [-0.5, -0.25, 0, 0.25, 0.5]) {
    const tip = projectLanePoint(lane, xNorm, arrowDepth - 0.02);
    const base = projectLanePoint(lane, xNorm, arrowDepth + 0.05);
    const scale = lane.active ? 6 : 4.5;
    const tipY = tip.y;
    const baseY = base.y;
    const cx = tip.x;
    const spread = lane.active ? 5 : 3.8;
    ctx.beginPath();
    ctx.moveTo(cx, tipY);
    ctx.lineTo(cx - spread, baseY);
    ctx.lineTo(cx + spread, baseY);
    ctx.closePath();
    ctx.fill();
    // Arrow tail
    ctx.fillRect(cx - scale * 0.18, baseY, scale * 0.36, (base.halfWidth - tip.halfWidth) * 0.6);
  }

  ctx.restore();

  // Lane border
  ctx.strokeStyle = lane.active ? "rgba(246, 198, 92, 0.92)" : "rgba(117, 147, 184, 0.38)";
  ctx.lineWidth = lane.active ? 2.4 : 1.4;
  drawQuad(ctx, lanePoints);
  ctx.stroke();

  drawLedRail(ctx, lane, game);

  // Foul line
  const foulLineLeft = projectLanePoint(lane, -1, 0);
  const foulLineRight = projectLanePoint(lane, 1, 0);
  ctx.strokeStyle = "rgba(255, 236, 205, 0.9)";
  ctx.lineWidth = 3.5;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(foulLineLeft.x, foulLineLeft.y);
  ctx.lineTo(foulLineRight.x, foulLineRight.y);
  ctx.stroke();

  // Pin deck
  const deckFrontLeft = projectLanePoint(lane, -1, 0.83);
  const deckFrontRight = projectLanePoint(lane, 1, 0.83);
  const deckBackRight = projectLanePoint(lane, 1, 1);
  const deckBackLeft = projectLanePoint(lane, -1, 1);
  const deckFill = ctx.createLinearGradient(0, deckFrontLeft.y, 0, deckBackLeft.y);
  deckFill.addColorStop(0, "rgba(89, 109, 136, 0.94)");
  deckFill.addColorStop(1, "rgba(23, 37, 59, 0.95)");
  ctx.fillStyle = deckFill;
  drawQuad(ctx, [deckFrontLeft, deckFrontRight, deckBackRight, deckBackLeft]);
  ctx.fill();

  drawOverheadMonitor(ctx, lane, game);
}

function drawOverheadMonitor(ctx, lane, game) {
  const center = projectLanePoint(lane, 0, 1);
  const monitorWidth = lane.active ? 128 : 116;
  const monitorHeight = lane.active ? 42 : 38;
  const x = center.x - monitorWidth / 2;
  const y = center.y - 76;

  drawRoundedRect(ctx, x, y, monitorWidth, monitorHeight, 12);
  const fill = ctx.createLinearGradient(x, y, x + monitorWidth, y + monitorHeight);
  fill.addColorStop(0, "rgba(7, 12, 22, 0.94)");
  fill.addColorStop(1, "rgba(22, 34, 54, 0.94)");
  ctx.fillStyle = fill;
  ctx.fill();

  ctx.strokeStyle = lane.active ? "rgba(246, 198, 92, 0.48)" : "rgba(125, 160, 194, 0.28)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#d7e4f1";
  ctx.font = "700 11px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  const currentPlayer = game.players[game.currentPlayer] ?? game.players[0] ?? null;
  const leader = game.players.reduce(
    (best, candidate) => ((candidate?.total ?? 0) > (best?.total ?? 0) ? candidate : best),
    game.players[0] ?? null
  );
  const monitorScore =
    game.players.length <= 2
      ? `${game.players[0]?.total ?? 0}  |  ${game.players[1]?.total ?? 0}`
      : `${currentPlayer?.total ?? 0}  |  L ${leader?.total ?? 0}`;
  ctx.fillText(
    monitorScore,
    x + monitorWidth / 2,
    y + 18
  );
  ctx.fillStyle = lane.active ? "#f4d199" : "#9db0c5";
  ctx.font = "600 10px 'Segoe UI', sans-serif";
  ctx.fillText(lane.label, x + monitorWidth / 2, y + 31);
  ctx.textAlign = "start";
}

function drawLedRail(ctx, lane, game) {
  const isAiTurn =
    game.status !== "menu"
    && game.status !== "finished"
    && game.players[game.currentPlayer]?.type === "ai";
  const pulse = 0.56 + 0.44 * Math.sin(((game.phaseTimerMs ?? 0) + game.rollAnimationProgress * 1000) * 0.012);
  const color = isAiTurn
    ? `rgba(255, 173, 73, ${0.28 + pulse * 0.52})`
    : `rgba(74, 211, 255, ${0.2 + pulse * 0.42})`;
  const glow = isAiTurn
    ? `rgba(255, 173, 73, ${0.14 + pulse * 0.18})`
    : `rgba(74, 211, 255, ${0.1 + pulse * 0.14})`;

  for (const side of [-1.18, 1.18]) {
    for (let index = 0; index <= 14; index += 1) {
      const t = index / 14;
      const point = projectLanePoint(lane, side, t);
      const radius = lane.active ? 4.4 : 3.4;

      // Outer glow
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius * 1.9, 0, Math.PI * 2);
      ctx.fill();

      // Core dot
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawGuide(ctx, lane, ballState, mode) {
  // Bezier hook curve: straight in first half, hooks in backend
  const startXNorm = ballState.lineAim * 0.58;
  const midXNorm = ballState.lineAim * 0.58 + ballState.spin * 0.03;
  const endXNorm = ballState.targetAim * 0.58 + Math.sin(Math.PI) * ballState.spin * 0.11;

  const p0 = projectLanePoint(lane, startXNorm, 0.02);
  const p1 = projectLanePoint(lane, midXNorm, 0.46);
  const p2 = projectLanePoint(lane, endXNorm, 0.79);

  // Loft arc for Y offset
  const loftPeak = ballState.loft * lane.nearHalfWidth * 0.18;

  ctx.save();
  ctx.setLineDash([9, 7]);
  ctx.lineWidth = mode === "ai-thinking" ? 3.2 : 2.4;
  ctx.strokeStyle = mode === "ai-thinking" ? "rgba(248, 197, 74, 0.86)" : "rgba(255, 239, 198, 0.64)";

  ctx.beginPath();
  // Approximate the hook with a quadratic bezier through 3 points
  ctx.moveTo(p0.x, p0.y - loftPeak * 0.1);
  ctx.quadraticCurveTo(
    p1.x,
    p1.y - loftPeak,
    p2.x,
    p2.y
  );
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Pocket target indicator
  const pocket = projectLanePoint(lane, 0.16, 0.79);
  ctx.fillStyle = "rgba(255, 215, 130, 0.82)";
  ctx.beginPath();
  ctx.arc(pocket.x, pocket.y, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Entry point indicator at ball trajectory end
  ctx.fillStyle = mode === "ai-thinking" ? "rgba(255, 210, 80, 0.72)" : "rgba(200, 235, 255, 0.58)";
  ctx.beginPath();
  ctx.arc(p2.x, p2.y, 5, 0, Math.PI * 2);
  ctx.fill();
}

function getAnimatedPinPose(pinId, pinAnimation) {
  if (!pinAnimation) {
    return {
      visible: true,
      standing: true,
      xOffset: 0,
      yOffset: 0,
      tilt: 0,
      opacity: 1,
    };
  }

  const descriptor = pinAnimation.pins.find((entry) => entry.id === pinId);
  if (!descriptor) {
    return { visible: false };
  }

  if (!descriptor.knocked) {
    const sway = Math.sin(pinAnimation.progress * 8 + descriptor.swayPhase) * descriptor.sway;
    return {
      visible: true,
      standing: true,
      xOffset: sway,
      yOffset: 0,
      tilt: sway * 0.18,
      opacity: 1,
    };
  }

  const localProgress = clamp(
    (pinAnimation.progress - descriptor.delay) / Math.max(0.001, descriptor.fade - descriptor.delay),
    0,
    1
  );
  const eased = 1 - (1 - localProgress) ** 2;
  return {
    visible: true,
    standing: false,
    xOffset: descriptor.direction * descriptor.travel * eased,
    yOffset: -descriptor.lift * Math.sin(Math.PI * localProgress) + localProgress * 0.34,
    tilt: descriptor.direction * descriptor.tilt * eased,
    opacity: 1 - Math.max(0, localProgress - 0.68) / 0.32 * 0.42,
  };
}

function drawPin(ctx, x, y, size, pose) {
  if (!pose?.visible || pose.opacity <= 0.02) {
    return;
  }

  ctx.save();
  ctx.translate(x + size * pose.xOffset, y + size * pose.yOffset);
  ctx.rotate(pose.tilt ?? 0);
  ctx.globalAlpha = pose.opacity ?? 1;

  const height = size * 2.5;
  const width = size;
  const topY = -height * 0.9;
  const bottomY = height * 0.22;

  // Shadow ellipse
  ctx.fillStyle = pose.standing ? "rgba(8, 13, 20, 0.26)" : "rgba(8, 13, 20, 0.4)";
  ctx.beginPath();
  ctx.ellipse(
    0,
    size * (pose.standing ? 0.64 : 0.78),
    size * (pose.standing ? 0.82 : 1.1),
    size * (pose.standing ? 0.22 : 0.27),
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Build pin body path
  function pinBodyPath() {
    ctx.beginPath();
    ctx.moveTo(0, topY);
    ctx.bezierCurveTo(
      -width * 0.32, topY + height * 0.08,
      -width * 0.26, topY + height * 0.24,
      -width * 0.18, topY + height * 0.34
    );
    ctx.bezierCurveTo(
      -width * 0.48, topY + height * 0.58,
      -width * 0.68, topY + height * 0.92,
      -width * 0.58, bottomY
    );
    ctx.bezierCurveTo(
      -width * 0.3, bottomY + height * 0.12,
      width * 0.3, bottomY + height * 0.12,
      width * 0.58, bottomY
    );
    ctx.bezierCurveTo(
      width * 0.68, topY + height * 0.92,
      width * 0.48, topY + height * 0.58,
      width * 0.18, topY + height * 0.34
    );
    ctx.bezierCurveTo(
      width * 0.26, topY + height * 0.24,
      width * 0.32, topY + height * 0.08,
      0, topY
    );
    ctx.closePath();
  }

  // Base fill: horizontal gradient for 3D cylinder shading
  pinBodyPath();
  const sideGrad = ctx.createLinearGradient(-width * 0.72, 0, width * 0.72, 0);
  sideGrad.addColorStop(0, "#c8c2b6");
  sideGrad.addColorStop(0.22, "#ede8df");
  sideGrad.addColorStop(0.45, "#fffdf9");
  sideGrad.addColorStop(0.62, "#f5f1e8");
  sideGrad.addColorStop(0.82, "#e0dbd0");
  sideGrad.addColorStop(1, "#bab4a8");
  ctx.fillStyle = sideGrad;
  ctx.fill();

  // Vertical top-to-bottom gradient (ambient occlusion)
  pinBodyPath();
  const vertGrad = ctx.createLinearGradient(0, topY, 0, bottomY);
  vertGrad.addColorStop(0, "rgba(255,255,255,0.1)");
  vertGrad.addColorStop(0.5, "rgba(255,255,255,0)");
  vertGrad.addColorStop(1, "rgba(0,0,0,0.14)");
  ctx.fillStyle = vertGrad;
  ctx.fill();

  // Thin outline
  pinBodyPath();
  ctx.strokeStyle = "rgba(60, 40, 24, 0.16)";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Clip for decorations
  ctx.save();
  pinBodyPath();
  ctx.clip();

  // Red stripes
  ctx.fillStyle = "#c21e2e";
  ctx.fillRect(-width * 0.58, topY + height * 0.22, width * 1.16, size * 0.22);
  ctx.fillRect(-width * 0.54, topY + height * 0.38, width * 1.08, size * 0.12);

  // Edge darkening on red stripe (cylindrical shading)
  const stripeShade = ctx.createLinearGradient(-width * 0.58, 0, width * 0.58, 0);
  stripeShade.addColorStop(0, "rgba(0,0,0,0.38)");
  stripeShade.addColorStop(0.18, "rgba(0,0,0,0)");
  stripeShade.addColorStop(0.82, "rgba(0,0,0,0)");
  stripeShade.addColorStop(1, "rgba(0,0,0,0.38)");
  ctx.fillStyle = stripeShade;
  ctx.fillRect(-width * 0.58, topY + height * 0.22, width * 1.16, size * 0.22);

  // Specular highlight: teardrop shape on upper-left body
  const specGrad = ctx.createRadialGradient(
    -width * 0.12, topY + height * 0.56,
    0,
    -width * 0.08, topY + height * 0.68,
    width * 0.38
  );
  specGrad.addColorStop(0, "rgba(255,255,255,0.72)");
  specGrad.addColorStop(0.4, "rgba(255,255,255,0.22)");
  specGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = specGrad;
  ctx.fillRect(-width * 0.58, topY, width * 1.16, bottomY - topY + height * 0.12);

  ctx.restore(); // end clip

  // Cap highlight at top of pin
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.beginPath();
  ctx.ellipse(-width * 0.06, topY + height * 0.04, width * 0.11, height * 0.036, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPins(ctx, lane, standingPins, pinAnimation) {
  const standingSet = new Set(pinAnimation ? pinAnimation.standingBefore : standingPins);
  for (const pin of FULL_RACK) {
    if (!standingSet.has(pin)) {
      continue;
    }
    const point = PIN_LAYOUT[pin];
    const xNorm = point.x / 2.5;
    const depth = 0.82 + point.y * 0.045;
    const projected = projectLanePoint(lane, xNorm, depth);
    const size = projected.halfWidth * 0.1;
    const pose = pinAnimation
      ? getAnimatedPinPose(pin, pinAnimation)
      : {
          visible: true,
          standing: standingPins.includes(pin),
          xOffset: 0,
          yOffset: 0,
          tilt: 0,
          opacity: 1,
        };
    drawPin(ctx, projected.x, projected.y, size, pose);
  }
}

function drawBall(ctx, lane, ballState, status, playerLabel, playerType) {
  const computePosition = (t) => {
    const tp = clamp(t, 0, 1.08);
    const xNorm =
      ballState.lineAim * 0.58
      + (ballState.targetAim * 0.58 - ballState.lineAim * 0.58) * Math.min(tp, 1)
      + Math.sin(Math.PI * Math.min(tp, 1)) * ballState.spin * 0.11;
    const depth = 0.02 + Math.min(tp, 1) * 0.76 + Math.max(0, tp - 1) * 0.08;
    const base = projectLanePoint(lane, xNorm, depth);
    const airOffset = Math.sin(Math.PI * Math.min(tp, 1)) * ballState.loft * lane.nearHalfWidth * 0.17;
    return { x: base.x, y: base.y - airOffset, halfWidth: base.halfWidth };
  };

  const travelProgress =
    status === "pinfall"
      ? clamp(1 + ballState.pinfallProgress * 0.08, 0, 1.08)
      : ballState.progress;

  // Motion blur trail during rolling
  if (status === "rolling" && travelProgress > 0.06) {
    for (let trailIndex = 4; trailIndex >= 1; trailIndex -= 1) {
      const trailT = travelProgress - trailIndex * 0.038;
      if (trailT < 0) {
        continue;
      }
      const trailPos = computePosition(trailT);
      const trailRadius = clamp(trailPos.halfWidth * 0.09, 7, 17) * (1 - trailIndex * 0.1);
      const alpha = 0.04 + (5 - trailIndex) * 0.03;
      ctx.fillStyle = `rgba(30, 42, 62, ${alpha})`;
      ctx.beginPath();
      ctx.arc(trailPos.x, trailPos.y, trailRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const pos = computePosition(travelProgress);
  const radius = clamp(pos.halfWidth * 0.09, 8, 18);

  // Floor shadow
  const shadowY = pos.y + radius * 0.9 + Math.sin(Math.PI * Math.min(travelProgress, 1)) * ballState.loft * lane.nearHalfWidth * 0.17;
  ctx.fillStyle = "rgba(8, 12, 20, 0.36)";
  ctx.beginPath();
  ctx.ellipse(pos.x, shadowY, radius * 1.06, radius * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glow halo
  const halo = ctx.createRadialGradient(pos.x - radius * 0.2, pos.y - radius * 0.25, 1, pos.x, pos.y, radius * 1.7);
  halo.addColorStop(0, status === "rolling" ? "rgba(100, 160, 255, 0.44)" : "rgba(255, 227, 159, 0.46)");
  halo.addColorStop(1, "rgba(255, 227, 159, 0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius * 1.7, 0, Math.PI * 2);
  ctx.fill();

  // Ball body
  const body = ctx.createRadialGradient(pos.x - radius * 0.3, pos.y - radius * 0.35, 1, pos.x, pos.y, radius);
  body.addColorStop(0, status === "rolling" ? "#58667e" : "#3a4759");
  body.addColorStop(0.28, status === "rolling" ? "#28323f" : "#1e2834");
  body.addColorStop(1, "#0e1420");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Rotating finger holes - spin based on progress and ball spin
  const rotation = travelProgress * Math.PI * 7 + ballState.spin * Math.PI * 0.6;
  const holeRadius = radius * 0.118;
  const holeDist = radius * 0.41;
  const holePositions = [
    { angle: rotation },
    { angle: rotation + (Math.PI * 2) / 3 },
    { angle: rotation + (Math.PI * 4) / 3 },
  ];
  for (const hole of holePositions) {
    const hx = pos.x + Math.cos(hole.angle) * holeDist;
    const hy = pos.y + Math.sin(hole.angle) * holeDist;
    // Only show holes on "front" of ball (not when behind)
    ctx.fillStyle = "rgba(5, 8, 16, 0.86)";
    ctx.beginPath();
    ctx.arc(hx, hy, holeRadius, 0, Math.PI * 2);
    ctx.fill();
    // Hole rim highlight
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }

  // Primary specular
  ctx.fillStyle = "rgba(210, 220, 235, 0.82)";
  ctx.beginPath();
  ctx.arc(pos.x - radius * 0.28, pos.y - radius * 0.3, radius * 0.13, 0, Math.PI * 2);
  ctx.fill();

  // Secondary micro-specular
  ctx.fillStyle = "rgba(255, 255, 255, 0.44)";
  ctx.beginPath();
  ctx.arc(pos.x - radius * 0.19, pos.y - radius * 0.4, radius * 0.06, 0, Math.PI * 2);
  ctx.fill();

  if (playerLabel) {
    const labelY = Math.max(18, pos.y - radius - 28);
    const labelText = String(playerLabel).toUpperCase();
    const textPaddingX = 10;
    const accent = playerType === "human" ? "rgba(74, 211, 255, 0.92)" : "rgba(244, 196, 111, 0.92)";

    ctx.save();
    ctx.font = "800 11px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const textMetrics = ctx.measureText(labelText);
    const labelWidth = textMetrics.width + textPaddingX * 2;
    const labelHeight = 22;

    drawRoundedRect(ctx, pos.x - labelWidth / 2, labelY - labelHeight / 2, labelWidth, labelHeight, 999);
    ctx.fillStyle = "rgba(6, 10, 18, 0.86)";
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.fillText(labelText, pos.x, labelY + 0.5);
    ctx.restore();
  }
}

function drawImpactGlow(ctx, lane, impactX, progress) {
  // Bright flash at pin deck area when ball arrives — fades out quickly
  const flashIntensity = Math.max(0, 1 - progress * 2.8);
  if (flashIntensity <= 0.01) {
    return;
  }

  const depth = 0.83;
  const point = projectLanePoint(lane, impactX * 0.48, depth);
  const radius = point.halfWidth * 0.88;

  const glow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
  glow.addColorStop(0, `rgba(255, 230, 140, ${0.78 * flashIntensity})`);
  glow.addColorStop(0.28, `rgba(255, 185, 60, ${0.44 * flashIntensity})`);
  glow.addColorStop(0.6, `rgba(255, 120, 30, ${0.18 * flashIntensity})`);
  glow.addColorStop(1, "rgba(255, 100, 20, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(point.x, point.y, radius, radius * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCelebration(ctx, width, height, game) {
  if (!game.celebration) {
    return;
  }

  const kind = game.celebration.kind;
  if (kind !== "strike" && kind !== "spare") {
    return;
  }

  const progress =
    1 - (game.celebration.remainingMs / Math.max(game.celebration.durationMs || 1, 1));
  // Fade in fast (0→0.15), hold (0.15→0.72), fade out (0.72→1.0)
  let alpha;
  if (progress < 0.12) {
    alpha = progress / 0.12;
  } else if (progress < 0.72) {
    alpha = 1;
  } else {
    alpha = 1 - (progress - 0.72) / 0.28;
  }

  if (alpha <= 0.02) {
    return;
  }

  const scaleBase = progress < 0.12 ? 0.58 + (progress / 0.12) * 0.42 : 1;
  const cx = width * 0.5;
  const cy = height * 0.42;

  const isStrike = kind === "strike";
  const text = isStrike
    ? (game.locale === "es" ? "¡PLENO!" : "STRIKE!")
    : (game.locale === "es" ? "¡SEMIPLENO!" : "SPARE!");

  const displayText = text.replace(/[^A-Za-z]/g, "");
  const glowColor = isStrike ? "rgba(255, 200, 0, 0.7)" : "rgba(60, 200, 255, 0.7)";
  const textColor = isStrike ? "#ffd44e" : "#72deff";

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.scale(scaleBase, scaleBase);

  // Backdrop pill
  const fontSize = Math.min(width * 0.096, 50);
  ctx.font = `900 ${fontSize}px 'Segoe UI', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const textMetrics = ctx.measureText(displayText);
  const padX = 22;
  const padY = 12;
  const pillW = textMetrics.width + padX * 2;
  const pillH = fontSize + padY * 2;
  drawRoundedRect(ctx, -pillW / 2, -pillH / 2, pillW, pillH, 14);
  ctx.fillStyle = "rgba(4, 8, 18, 0.72)";
  ctx.fill();
  ctx.strokeStyle = isStrike ? "rgba(255, 210, 60, 0.5)" : "rgba(60, 200, 255, 0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Glow shadow
  ctx.shadowBlur = 28;
  ctx.shadowColor = glowColor;

  // Text outline
  ctx.strokeStyle = "rgba(0,0,0,0.7)";
  ctx.lineWidth = 6;
  ctx.strokeText(displayText, 0, 0);

  // Text fill
  ctx.fillStyle = textColor;
  ctx.shadowBlur = 18;
  ctx.fillText(displayText, 0, 0);

  ctx.restore();
}

function drawControlFeedback(ctx, width, height, game, ui) {
  if (!game.controlFeedback) {
    return;
  }

  const { key, direction, value, remainingMs, durationMs } = game.controlFeedback;
  const progress = 1 - (remainingMs / Math.max(durationMs || 1, 1));
  const fadeOut = progress > 0.78 ? 1 - (progress - 0.78) / 0.22 : 1;
  const alpha = Math.max(0, Math.min(1, progress / 0.18, fadeOut));
  if (alpha <= 0.02) {
    return;
  }

  const label =
    key === "power"
      ? ui.power
      : key === "spin"
        ? ui.spin
        : ui.loft;
  const accent =
    key === "power"
      ? "#f4c46f"
      : key === "spin"
        ? "#72deff"
        : "#8cf0b9";
  const directionLabel =
    game.locale === "es"
      ? (direction === "up" ? "Subiendo" : "Bajando")
      : (direction === "up" ? "Increasing" : "Decreasing");

  const cardWidth = Math.min(220, width * 0.3);
  const cardHeight = 68;
  const drift = direction === "up" ? (1 - alpha) * 16 : (1 - alpha) * -16;
  const x = width - cardWidth - 18;
  const y = height - cardHeight - 22 + drift;

  ctx.save();
  ctx.globalAlpha = alpha;

  drawRoundedRect(ctx, x, y, cardWidth, cardHeight, 14);
  ctx.fillStyle = "rgba(7, 12, 22, 0.88)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.fillRect(x + 12, y + cardHeight - 11, (cardWidth - 24) * alpha, 4);

  ctx.fillStyle = "rgba(226, 232, 240, 0.78)";
  ctx.font = "700 11px 'Segoe UI', sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(directionLabel.toUpperCase(), x + 16, y + 24);

  ctx.fillStyle = "#f8fafc";
  ctx.font = "800 20px 'Segoe UI', sans-serif";
  ctx.fillText(`${label} ${value.toFixed(2)}`, x + 16, y + 49);

  ctx.restore();
}

function drawAiThinkingCue(ctx, width, height, game, ui, playerLabel) {
  if (game.status !== "ai-thinking" || !game.aiPlan || !playerLabel) {
    return;
  }

  const deltas = [
    { key: "aim", value: game.aiPlan.aim - game.controls.aim, label: ui.aim },
    { key: "power", value: game.aiPlan.power - game.controls.power, label: ui.power },
    { key: "spin", value: game.aiPlan.spin - game.controls.spin, label: ui.spin },
    { key: "loft", value: game.aiPlan.loft - game.controls.loft, label: ui.loft },
  ].sort((left, right) => Math.abs(right.value) - Math.abs(left.value));

  const dominant = deltas[0];
  const phaseProgress =
    1 - (game.phaseTimerMs / Math.max(game.aiPlan.thinkMs || 1, 1));
  const pulse = 0.72 + 0.28 * Math.sin((phaseProgress * Math.PI * 2) + performance.now() * 0.01);
  const detail =
    Math.abs(dominant?.value ?? 0) >= 0.04 && dominant?.key === "aim"
      ? (game.locale === "es" ? `${playerLabel} recolocando linea` : `${playerLabel} repositioning line`)
      : Math.abs(dominant?.value ?? 0) >= 0.04
        ? (game.locale === "es" ? `${playerLabel} ajustando ${dominant.label.toLowerCase()}` : `${playerLabel} adjusting ${dominant.label.toLowerCase()}`)
        : (game.locale === "es" ? `${playerLabel} fijando tiro` : `${playerLabel} locking shot`);

  const x = 18;
  const y = 18;
  const panelWidth = Math.min(270, width * 0.34);
  const panelHeight = 62;

  ctx.save();
  drawRoundedRect(ctx, x, y, panelWidth, panelHeight, 16);
  ctx.fillStyle = "rgba(8, 12, 20, 0.86)";
  ctx.fill();
  ctx.strokeStyle = `rgba(244, 196, 111, ${0.32 + pulse * 0.36})`;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.fillStyle = "rgba(244, 196, 111, 0.92)";
  ctx.font = "800 11px 'Segoe UI', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(game.locale === "es" ? "IA EN AJUSTE" : "AI ADJUSTING", x + 14, y + 22);

  ctx.fillStyle = "#f8fafc";
  ctx.font = "700 16px 'Segoe UI', sans-serif";
  ctx.fillText(detail, x + 14, y + 43);

  ctx.fillStyle = "rgba(244, 196, 111, 0.2)";
  ctx.fillRect(x + 14, y + panelHeight - 12, panelWidth - 28, 4);
  ctx.fillStyle = `rgba(244, 196, 111, ${0.78 + pulse * 0.14})`;
  ctx.fillRect(x + 14, y + panelHeight - 12, (panelWidth - 28) * Math.max(0.08, phaseProgress), 4);
  ctx.restore();
}

function drawTopBanner(ctx, width, height, game, ui) {
  const panelWidth = width * 0.38;
  const x = width * 0.31;
  const y = height * 0.018;
  drawRoundedRect(ctx, x, y, panelWidth, 44, 16);
  ctx.fillStyle = "rgba(5, 10, 20, 0.86)";
  ctx.fill();
  ctx.strokeStyle = "rgba(246, 198, 92, 0.3)";
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.fillStyle = "#f5d7a2";
  ctx.font = "700 14px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    `${ui.frame} ${Math.min(game.frameIndex + 1, 10)}  |  ${getLaneLabel(game.frameIndex, game.locale)}  |  ${
      game.players[game.currentPlayer]?.name ?? ""
    }`,
    x + panelWidth / 2,
    y + 18
  );
  ctx.fillStyle = "#d7e4f1";
  ctx.font = "600 11px 'Segoe UI', sans-serif";
  ctx.fillText(
    `${game.players[0]?.total ?? 0} - ${game.players[1]?.total ?? 0}`,
    x + panelWidth / 2,
    y + 33
  );
  ctx.textAlign = "start";
}

function drawVignette(ctx, width, height) {
  const vignette = ctx.createRadialGradient(
    width * 0.5, height * 0.5, height * 0.28,
    width * 0.5, height * 0.5, height * 0.9
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.5)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

export function drawScene(canvas, game, ui) {
  if (!canvas) {
    return;
  }

  const { ctx, width, height } = resizeCanvas(canvas);
  ctx.clearRect(0, 0, width, height);

  drawBackground(ctx, width, height);
  drawBackWall(ctx, width, height, ui);
  drawApproach(ctx, width, height);
  drawBallReturn(ctx, width, height);

  const activeLaneIndex = game.frameIndex % 2;
  const lanes = createLaneGeometry(width, height, activeLaneIndex);
  for (const lane of lanes) {
    drawLane(ctx, lane, game);
  }

  const activeLane = lanes[activeLaneIndex];
  drawPins(ctx, activeLane, game.pinsStanding, game.pinAnimation);

  // Impact glow when pinfall animation starts
  if (game.pinAnimation && game.lastRoll) {
    drawImpactGlow(ctx, activeLane, game.lastRoll.impactX ?? 0, game.pinAnimation.progress);
  }

  const ballState = getBallState(game);
  if (ballState) {
    const lane = lanes[ballState.laneIndex];
    const activePlayer = game.players[game.currentPlayer] ?? null;
    const aiMatch = activePlayer?.id ? /ai-(\d+)/.exec(activePlayer.id) : null;
    const playerLabel =
      activePlayer?.type === "human"
        ? "YOU"
        : aiMatch
          ? `IA ${aiMatch[1]}`
          : activePlayer?.type === "ai"
            ? "IA"
            : "";
    if (game.status === "aim" || game.status === "ai-thinking") {
      drawGuide(ctx, lane, ballState, game.status);
    }
    drawBall(ctx, lane, ballState, game.status, playerLabel, activePlayer?.type ?? null);
    drawAiThinkingCue(ctx, width, height, game, ui, playerLabel);
  }

  // Celebration overlay for strike/spare
  drawCelebration(ctx, width, height, game);

  drawVignette(ctx, width, height);
  drawControlFeedback(ctx, width, height, game, ui);
}

export function buildTextPayload(state) {
  const coverage = countRuleStatuses();
  return {
    variant: "bowling-pro-tour",
    mode: state.status,
    coordinateSystem: "canvas origin top-left; x grows right; y grows downward",
    frame: state.frameIndex + 1,
    lane: state.frameIndex % 2 === 0 ? "A" : "B",
    currentPlayerIndex: state.currentPlayer,
    currentPlayerName: state.players[state.currentPlayer]?.name ?? null,
    currentPlayerType: state.players[state.currentPlayer]?.type ?? null,
    controls: {
      aim: Number(clampDisplayNumber(state.controls.aim, 3)),
      power: Number(clampDisplayNumber(state.controls.power, 3)),
      spin: Number(clampDisplayNumber(state.controls.spin, 3)),
      loft: Number(clampDisplayNumber(state.controls.loft, 3)),
    },
    pinsStanding: [...state.pinsStanding],
    pendingRoll:
      state.pendingOutcome != null
        ? {
            playerIndex: state.pendingOutcome.playerIndex,
            frame: state.pendingOutcome.frameIndex + 1,
            roll: state.pendingOutcome.rollIndex + 1,
            progress: Number(clampDisplayNumber(state.rollAnimationProgress, 3)),
          }
        : null,
    ai: {
      difficultyKey: state.difficultyKey,
      difficultyLabel: getDifficultyLabel(state.difficultyKey, state.locale),
      playerCount: state.aiPlayerCount,
      thinking: state.status === "ai-thinking",
      plan: state.aiPlan
        ? {
            aim: Number(clampDisplayNumber(state.aiPlan.aim, 3)),
            power: Number(clampDisplayNumber(state.aiPlan.power, 3)),
            spin: Number(clampDisplayNumber(state.aiPlan.spin, 3)),
            loft: Number(clampDisplayNumber(state.aiPlan.loft, 3)),
            confidence: Number(clampDisplayNumber(state.aiPlan.confidence, 3)),
          }
        : null,
    },
    referencePack: {
      name: ASSET_REFERENCE.name,
      repoUrl: ASSET_REFERENCE.repoUrl,
      license: ASSET_REFERENCE.license,
      files: ASSET_REFERENCE.files.length,
    },
    rulesCoverage: coverage,
    players: state.players.map((player, playerIndex) => ({
      playerIndex,
      name: player.name,
      type: player.type,
      total: player.total,
      cumulative: [...player.cumulative],
      stats: { ...player.stats },
      finished: player.finished,
      frames: player.frames.map((frame, frameIndex) => ({
        frame: frameIndex + 1,
        rolls: [...frame.rolls],
        symbols: formatFrameSymbols(frameIndex, frame),
        split: frame.split,
        fouls: [...frame.fouls],
      })),
    })),
    lastRoll: state.lastRoll
      ? {
          ...state.lastRoll,
          knockedPins: [...state.lastRoll.knockedPins],
        }
      : null,
    celebration: state.celebration
      ? {
          kind: state.celebration.kind,
          playerName: state.celebration.playerName,
          remainingMs: Number(clampDisplayNumber(state.celebration.remainingMs, 0)),
        }
      : null,
    controlFeedback: state.controlFeedback
      ? {
          key: state.controlFeedback.key,
          direction: state.controlFeedback.direction,
          value: state.controlFeedback.value,
          remainingMs: Number(clampDisplayNumber(state.controlFeedback.remainingMs, 0)),
        }
      : null,
    pinAnimation: state.pinAnimation
      ? {
          progress: Number(clampDisplayNumber(state.pinAnimation.progress, 3)),
          knockedPins: [...state.pinAnimation.knockedPins],
          standingBefore: [...state.pinAnimation.standingBefore],
          standingAfter: [...state.pinAnimation.standingAfter],
        }
      : null,
    logs: [...state.logs],
    meta: {
      totalFrames: FRAME_COUNT,
      fullRack: FULL_RACK.length,
      pinLayoutRows: Object.keys(PIN_LAYOUT).length,
      totalPlayers: state.players.length,
    },
  };
}
