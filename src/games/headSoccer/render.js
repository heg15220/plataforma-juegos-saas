import {
  BANNER_TEXT,
  CROWD_COLORS,
  FIELD_FLOOR_Y,
  FIELD_LEFT,
  FIELD_RIGHT,
  FIELD_TOP,
  FLAG_LIBRARY,
  GOAL_DEPTH,
  GOAL_HEIGHT,
  GOAL_TOP,
  GOAL_WIDTH,
  HEIGHT,
  PLAYER_BODY_HEIGHT,
  WIDTH,
  clamp,
} from "./config.js";

// ─── utilities ───────────────────────────────────────────────────────────────

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}

function drawStar(ctx, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const o = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const k = o + Math.PI / 5;
    ctx.lineTo(Math.cos(o) * r, Math.sin(o) * r);
    ctx.lineTo(Math.cos(k) * (r * 0.44), Math.sin(k) * (r * 0.44));
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ─── flag drawing ────────────────────────────────────────────────────────────

function drawFlag(ctx, x, y, w, h, nation) {
  const flag = FLAG_LIBRARY[nation] ?? FLAG_LIBRARY.GB;
  ctx.save();
  ctx.translate(x, y);
  roundRect(ctx, 0, 0, w, h, 6);
  ctx.clip();

  ctx.fillStyle = flag.base ?? "#ffffff";
  ctx.fillRect(0, 0, w, h);

  if (flag.type === "horizontal") {
    const sH = h / flag.colors.length;
    flag.colors.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, i * sH, w, sH + 1); });
  }
  if (flag.type === "horizontalWide") {
    ctx.fillStyle = flag.colors[0]; ctx.fillRect(0, 0, w, h * 0.24);
    ctx.fillStyle = flag.colors[1]; ctx.fillRect(0, h * 0.24, w, h * 0.52);
    ctx.fillStyle = flag.colors[2]; ctx.fillRect(0, h * 0.76, w, h * 0.24);
  }
  if (flag.type === "vertical") {
    const sW = w / flag.colors.length;
    flag.colors.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(i * sW, 0, sW + 1, h); });
  }
  if (flag.type === "circle") {
    ctx.beginPath(); ctx.fillStyle = flag.stripes[0];
    ctx.arc(w * 0.5, h * 0.5, h * 0.2, Math.PI / 2, Math.PI * 1.5); ctx.fill();
    ctx.beginPath(); ctx.fillStyle = flag.stripes[1];
    ctx.arc(w * 0.5, h * 0.5, h * 0.2, -Math.PI / 2, Math.PI / 2); ctx.fill();
    ctx.strokeStyle = flag.bars; ctx.lineWidth = 2;
    [0.18, 0.82].forEach((lx) => {
      ctx.beginPath();
      ctx.moveTo(w * lx - 4, h * 0.22); ctx.lineTo(w * lx + 2, h * 0.34);
      ctx.moveTo(w * lx - 1, h * 0.18); ctx.lineTo(w * lx + 5, h * 0.30);
      ctx.moveTo(w * lx - 5, h * 0.68); ctx.lineTo(w * lx + 1, h * 0.80);
      ctx.moveTo(w * lx - 2, h * 0.64); ctx.lineTo(w * lx + 4, h * 0.76);
      ctx.stroke();
    });
  }
  if (flag.type === "cross") {
    ctx.fillStyle = flag.base; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = flag.crossOuter;
    ctx.fillRect(w * 0.38, 0, w * 0.24, h); ctx.fillRect(0, h * 0.38, w, h * 0.24);
    ctx.fillStyle = flag.crossInner;
    ctx.fillRect(w * 0.44, 0, w * 0.12, h); ctx.fillRect(0, h * 0.44, w, h * 0.12);
  }
  if (flag.type === "diamond") {
    ctx.fillStyle = flag.base; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = flag.shape;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.12); ctx.lineTo(w * 0.86, h * 0.5);
    ctx.lineTo(w * 0.5, h * 0.88); ctx.lineTo(w * 0.14, h * 0.5);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = flag.disc;
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.5, h * 0.18, 0, Math.PI * 2); ctx.fill();
  }
  if (flag.type === "disc") {
    ctx.fillStyle = flag.base; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = flag.disc;
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.5, h * 0.22, 0, Math.PI * 2); ctx.fill();
  }
  if (flag.type === "us") {
    const sH = h / 7;
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = i % 2 === 0 ? flag.colors[0] : flag.colors[1];
      ctx.fillRect(0, i * sH, w, sH + 1);
    }
    ctx.fillStyle = flag.colors[2]; ctx.fillRect(0, 0, w * 0.44, h * 0.54);
  }

  ctx.restore();
  ctx.strokeStyle = "rgba(17,24,39,0.4)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, w, h, 6);
  ctx.stroke();
}

// ─── stadium / backdrop ──────────────────────────────────────────────────────

function drawCrowd(ctx, time) {
  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, 200);
  sky.addColorStop(0, "#5cbcff");
  sky.addColorStop(1, "#a8dcff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, 200);

  // Stands background blocks
  ctx.fillStyle = "#6aacd4";
  for (let pane = 0; pane < 13; pane++) {
    const px = pane * 76;
    ctx.fillStyle = pane % 2 === 0 ? "#72b8de" : "#65a8ce";
    ctx.fillRect(px, 58, 72, 72);
    ctx.fillRect(px + 16, 132, 58, 26);
  }

  // Crowd separator bars
  ctx.fillStyle = "#2b4460";
  ctx.fillRect(0, 130, WIDTH, 20);
  ctx.fillStyle = "#213650";
  ctx.fillRect(0, 186, WIDTH, 20);

  // Crowd figures (3 rows × 30 columns)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 32; col++) {
      const seed  = row * 32 + col;
      const color = CROWD_COLORS[seed % CROWD_COLORS.length];
      const cx    = 14 + col * 30 + ((row + col) % 2) * 4;
      const cy    = 155 + row * 30 + Math.sin(time * 0.0018 + seed * 0.38) * 2.5;
      ctx.fillStyle = "#1a2a3a";
      ctx.beginPath(); ctx.arc(cx, cy, 6.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(cx, cy + 10, 9, 0, Math.PI * 2); ctx.fill();
    }
  }
}

function drawBanners(ctx) {
  // Advertisement strip
  ctx.fillStyle = "#f5e28a";
  ctx.fillRect(0, 244, WIDTH, 26);
  // Sponsor segments
  const sponsors = ["HEAD CUP", "DYNAMIC SPORT", "LETHAL SHOT", "BONUS POWER", "DREAM FC", "GOAL RUSH"];
  ctx.fillStyle = "#1f2937";
  ctx.font = "bold 13px 'Bricolage Grotesque', sans-serif";
  ctx.textAlign = "center";
  sponsors.forEach((s, i) => ctx.fillText(s, 90 + i * 164, 262));
  ctx.strokeStyle = "#c0a840";
  ctx.lineWidth = 1;
  sponsors.forEach((_, i) => {
    ctx.beginPath(); ctx.moveTo(4 + i * 164, 244); ctx.lineTo(4 + i * 164, 270); ctx.stroke();
  });
}

function drawField(ctx) {
  const fGrad = ctx.createLinearGradient(0, 270, 0, HEIGHT);
  fGrad.addColorStop(0, "#72cc44");
  fGrad.addColorStop(1, "#0f9030");
  ctx.fillStyle = fGrad;
  ctx.fillRect(0, 270, WIDTH, HEIGHT - 270);

  // Grass stripes
  ctx.fillStyle = "rgba(0, 100, 20, 0.22)";
  for (let s = 0; s < 8; s++) ctx.fillRect(0, 288 + s * 24, WIDTH, 12);

  // Field border
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 4;
  ctx.strokeRect(FIELD_LEFT, 344, FIELD_RIGHT - FIELD_LEFT, FIELD_FLOOR_Y - 344);

  // Centre line
  ctx.beginPath();
  ctx.moveTo(WIDTH * 0.5, 344); ctx.lineTo(WIDTH * 0.5, FIELD_FLOOR_Y); ctx.stroke();

  // Centre circle
  ctx.beginPath();
  ctx.arc(WIDTH * 0.5, FIELD_FLOOR_Y, 58, Math.PI, 0); ctx.stroke();

  // Penalty areas
  const penW = 148, penH = 88;
  ctx.strokeRect(FIELD_LEFT,              FIELD_FLOOR_Y - penH, penW, penH);
  ctx.strokeRect(FIELD_RIGHT - penW,      FIELD_FLOOR_Y - penH, penW, penH);

  // Goal areas (6-yard box)
  const gaW = 66, gaH = 44;
  ctx.strokeRect(FIELD_LEFT,              FIELD_FLOOR_Y - gaH, gaW, gaH);
  ctx.strokeRect(FIELD_RIGHT - gaW,       FIELD_FLOOR_Y - gaH, gaW, gaH);

  // Penalty spots
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath(); ctx.arc(FIELD_LEFT  + 98,    FIELD_FLOOR_Y - 28, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(FIELD_RIGHT - 98,    FIELD_FLOOR_Y - 28, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(WIDTH * 0.5,         FIELD_FLOOR_Y - 22, 4, 0, Math.PI * 2); ctx.fill();
}

// ─── goals ───────────────────────────────────────────────────────────────────

function drawGoal(ctx, side, assets) {
  const goalAsset = side === "left" ? assets?.goalLeft : assets?.goalRight;
  if (goalAsset?.complete) {
    const dw = GOAL_WIDTH + 34;
    const dh = GOAL_HEIGHT + 24;
    const dx = side === "left" ? -18 : WIDTH - dw + 18;
    ctx.drawImage(goalAsset, dx, GOAL_TOP - 8, dw, dh);
    return;
  }

  const netX   = side === "left" ? FIELD_LEFT - 4      : FIELD_RIGHT - GOAL_DEPTH - 14;
  const frameX = side === "left" ? FIELD_LEFT           : FIELD_RIGHT - GOAL_DEPTH - 4;
  const netW   = GOAL_DEPTH + 12;

  // Net interior
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(netX, GOAL_TOP + 6, netW, GOAL_HEIGHT + 6);

  // Net grid (vertical)
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1;
  for (let l = 0; l <= 8; l++) {
    const lx = netX + (netW / 8) * l;
    ctx.beginPath(); ctx.moveTo(lx, GOAL_TOP + 6); ctx.lineTo(lx, FIELD_FLOOR_Y + 4); ctx.stroke();
  }
  // Net grid (horizontal)
  for (let r = 0; r <= 8; r++) {
    const ry = GOAL_TOP + 6 + ((GOAL_HEIGHT) / 8) * r;
    ctx.beginPath(); ctx.moveTo(netX, ry); ctx.lineTo(netX + netW, ry); ctx.stroke();
  }

  // Goal frame
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  // Top bar + back post + (implied) front
  ctx.moveTo(frameX, GOAL_TOP);
  ctx.lineTo(frameX + GOAL_DEPTH * (side === "left" ? -1 : 1), GOAL_TOP);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(frameX,               GOAL_TOP);
  ctx.lineTo(frameX,               FIELD_FLOOR_Y + 4);
  ctx.stroke();

  // Shadow/depth on goal post
  ctx.strokeStyle = "rgba(0,0,0,0.28)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(frameX + (side === "left" ? -3 : 3), GOAL_TOP + 2);
  ctx.lineTo(frameX + (side === "left" ? -3 : 3), FIELD_FLOOR_Y + 6);
  ctx.stroke();
}

// ─── top HUD ─────────────────────────────────────────────────────────────────

function drawPowerWing(ctx, side, powerPct, kitColor, time) {
  const barW = 188;
  const barH = 18;
  const barX = side === "left" ? 10 : WIDTH - barW - 10;
  const barY = 38;
  const skew = 10;

  // Wing shape (parallelogram)
  ctx.save();
  ctx.beginPath();
  if (side === "left") {
    ctx.moveTo(barX,        barY - skew * 0.5);
    ctx.lineTo(barX + barW, barY + skew * 0.5);
    ctx.lineTo(barX + barW, barY + barH + skew * 0.5);
    ctx.lineTo(barX,        barY + barH - skew * 0.5);
  } else {
    ctx.moveTo(barX + barW, barY - skew * 0.5);
    ctx.lineTo(barX,        barY + skew * 0.5);
    ctx.lineTo(barX,        barY + barH + skew * 0.5);
    ctx.lineTo(barX + barW, barY + barH - skew * 0.5);
  }
  ctx.closePath();

  // Background
  ctx.fillStyle = "rgba(6, 18, 34, 0.85)";
  ctx.fill();
  ctx.clip();

  // Fill by power
  const fillW = barW * (powerPct / 100);
  if (fillW > 0) {
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    if (side === "left") {
      grad.addColorStop(0, kitColor);
      grad.addColorStop(0.7, kitColor + "cc");
      grad.addColorStop(1, kitColor + "44");
    } else {
      grad.addColorStop(0, kitColor + "44");
      grad.addColorStop(0.3, kitColor + "cc");
      grad.addColorStop(1, kitColor);
    }
    ctx.fillStyle = grad;
    if (side === "left") ctx.fillRect(barX, barY - skew, fillW, barH + skew * 2);
    else                 ctx.fillRect(barX + barW - fillW, barY - skew, fillW, barH + skew * 2);
  }

  // Glow when full
  if (powerPct >= 100) {
    const pulse = 0.6 + Math.sin(time * 0.008) * 0.4;
    ctx.fillStyle = `rgba(255,255,255,${pulse * 0.18})`;
    ctx.fillRect(barX, barY - skew, barW, barH + skew * 2);
  }

  // Segment dividers
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  for (let i = 1; i < 8; i++) ctx.fillRect(barX + barW * (i / 8) - 1, barY - skew, 2, barH + skew * 2);

  ctx.restore();

  // POWER label
  ctx.fillStyle = powerPct >= 100 ? "#fde047" : "#94a3b8";
  ctx.font = "700 10px 'Bricolage Grotesque', sans-serif";
  ctx.textAlign = side === "left" ? "left" : "right";
  ctx.fillText("POWER", side === "left" ? barX : barX + barW, barY - skew - 3);

  // Chevron arrows
  ctx.fillStyle = powerPct >= 100 ? kitColor : "rgba(148,163,184,0.5)";
  ctx.font = "bold 14px monospace";
  const arrowX = side === "left" ? barX + barW + 6 : barX - 8;
  ctx.textAlign = side === "left" ? "left" : "right";
  ctx.fillText(side === "left" ? "▶▶" : "◀◀", arrowX, barY + barH * 0.5 + skew * 0.5 + 5);
}

function drawHUD(ctx, state, time) {
  // Full top strip
  const hudH = 96;
  const grad = ctx.createLinearGradient(0, 0, 0, hudH);
  grad.addColorStop(0, "#0d2440");
  grad.addColorStop(1, "#091828");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WIDTH, hudH);

  ctx.strokeStyle = "rgba(56,189,248,0.22)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, hudH); ctx.lineTo(WIDTH, hudH); ctx.stroke();

  // Player power wing (left, orange kit)
  const playerKit = state.player.kit ?? "#f97316";
  const cpuKit    = state.cpu.kit    ?? "#38bdf8";
  drawPowerWing(ctx, "left",  state.player.powerMeter, playerKit, time);
  drawPowerWing(ctx, "right", state.cpu.powerMeter,    cpuKit,    time);

  // Flags
  const flagW = 52, flagH = 34;
  const flagY = (hudH - flagH) * 0.5 - 2;
  drawFlag(ctx, 212, flagY, flagW, flagH, state.player.nation);
  drawFlag(ctx, WIDTH - 264, flagY, flagW, flagH, state.opponentNation);

  // ── Centre scorebox ──────────────────────────────────────────────────────
  const boxW = 260, boxH = 86;
  const boxX = WIDTH * 0.5 - boxW * 0.5;
  const boxY = 5;

  ctx.fillStyle = "#0a1e33";
  roundRect(ctx, boxX, boxY, boxW, boxH, 14);
  ctx.fill();
  ctx.strokeStyle = "#1e4d78";
  ctx.lineWidth = 2;
  roundRect(ctx, boxX, boxY, boxW, boxH, 14);
  ctx.stroke();

  const cx = WIDTH * 0.5;

  const isSuddenDeath = !state.timer && !state.clockSeconds && !state.goldenGoal;
  const ribbonLabel = isSuddenDeath
    ? "SUDDEN DEATH"
    : state.goldenGoal
      ? "GOLDEN GOAL"
      : state.period >= 2
        ? "2ND HALF"
        : "1ST HALF";
  const timerStr = isSuddenDeath
    ? "--:--"
    : state.goldenGoal
      ? "90:00"
      : state.clockLabel ?? "00:00";

  ctx.fillStyle = state.goldenGoal ? "#fb923c" : "#facc15";
  ctx.font = "700 11px 'Bricolage Grotesque', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(ribbonLabel, cx, boxY + 17);

  ctx.fillStyle = state.goldenGoal ? "#fb923c" : "#f8fafc";
  ctx.font = "800 30px 'Bricolage Grotesque', sans-serif";
  ctx.fillText(timerStr, cx, boxY + 47);

  // Score
  ctx.fillStyle = "#fde68a";
  ctx.font = "900 28px 'Bricolage Grotesque', sans-serif";
  ctx.fillText(`${state.score.player}  :  ${state.score.cpu}`, cx, boxY + 78);

  if (!isSuddenDeath) {
    const totalProgress = state.matchElapsed + state.timer;
    const progress = totalProgress > 0 ? clamp(state.matchElapsed / totalProgress, 0, 1) : 1;
    ctx.fillStyle = "rgba(148,163,184,0.28)";
    roundRect(ctx, boxX + 26, boxY + boxH - 14, boxW - 52, 7, 4);
    ctx.fill();
    ctx.fillStyle = state.goldenGoal ? "#fb923c" : "#38bdf8";
    roundRect(ctx, boxX + 26, boxY + boxH - 14, (boxW - 52) * progress, 7, 4);
    ctx.fill();
  }

  // Stars (3 gold)
  ctx.fillStyle = "#f59e0b";
  for (let s = 0; s < 3; s++) drawStar(ctx, cx - 20 + s * 20, boxY + 90, 7);

  // Pause icon (two bars)
  ctx.fillStyle = "#475569";
  ctx.fillRect(WIDTH - 36, 12, 7, 20);
  ctx.fillRect(WIDTH - 25, 12, 7, 20);

  // ── Left side: WINS / GOAL ───────────────────────────────────────────────
  ctx.font = "900 22px 'Bricolage Grotesque', sans-serif";
  ctx.textAlign = "left";
  ctx.fillStyle = "#fde047";
  ctx.fillText("WINS:", 16, 124);
  ctx.fillText("GOAL:", 16, 154);
  ctx.fillStyle = "#f8fafc";
  ctx.fillText(`${state.series.wins}`, 106, 124);
  ctx.fillText(
    state.gameModeId === "survival" ? `${state.series.lives}` : `${state.roundTarget}`,
    106, 154,
  );

  // Lives / hearts for survival
  if (state.gameModeId === "survival") {
    for (let l = 0; l < 3; l++) {
      ctx.fillStyle = l < state.series.lives ? "#ef4444" : "#374151";
      ctx.font = "18px serif";
      ctx.textAlign = "left";
      ctx.fillText("♥", 16 + l * 22, 178);
    }
  }

  // Golden goal flash banner
  if (state.goldenGoal) {
    ctx.save();
    ctx.globalAlpha = 0.6 + Math.sin(time * 0.01) * 0.4;
    ctx.fillStyle = "#f97316";
    ctx.font = "800 13px 'Bricolage Grotesque', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⚡ GOLDEN GOAL ⚡", cx, boxY + 95 + 14);
    ctx.restore();
  }
}

// ─── player (big-head cartoon style) ─────────────────────────────────────────

function drawPlayer(ctx, actor, time) {
  const headR  = actor.headRadius;
  const bodyH  = PLAYER_BODY_HEIGHT * 0.88;
  const bodyW  = 28;
  const legLen = 22;
  const swing  = Math.sin(actor.bodySwing * Math.PI * 5) * 5;

  ctx.save();
  ctx.translate(actor.x, actor.y);

  // Ground shadow
  ctx.fillStyle = "rgba(15,23,42,0.24)";
  ctx.beginPath();
  ctx.ellipse(0, headR + bodyH + legLen + 8, headR * 0.85, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body (torso)
  ctx.fillStyle = actor.kit;
  roundRect(ctx, -bodyW * 0.5, headR * 0.72, bodyW, bodyH, 9);
  ctx.fill();

  // Kit chest stripe
  ctx.fillStyle = actor.trim;
  ctx.fillRect(-bodyW * 0.5, headR * 0.72, bodyW, 5);

  // Shorts
  ctx.fillStyle = actor.trim;
  roundRect(ctx, -bodyW * 0.5 - 1, headR * 0.72 + bodyH - 8, bodyW + 2, 12, 5);
  ctx.fill();

  // Legs
  ctx.strokeStyle = "#1c2833";
  ctx.lineWidth = 4.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-8, headR * 0.72 + bodyH);
  ctx.quadraticCurveTo(-12 - swing, headR * 0.72 + bodyH + legLen * 0.55, -10 - swing * 0.7, headR * 0.72 + bodyH + legLen);
  ctx.moveTo(8, headR * 0.72 + bodyH);
  ctx.quadraticCurveTo(12 + swing,  headR * 0.72 + bodyH + legLen * 0.55, 10 + swing * 0.7,  headR * 0.72 + bodyH + legLen);
  ctx.stroke();

  // Boots
  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.ellipse(-10 - swing * 0.7, headR * 0.72 + bodyH + legLen + 1, 9, 5, 0, 0, Math.PI * 2);
  ctx.ellipse( 10 + swing * 0.7, headR * 0.72 + bodyH + legLen + 1, 9, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── BIG HEAD ─────────────────────────────────────────────────────────────

  // Skin
  ctx.fillStyle = actor.freezeTimer > 0 ? "#bae6fd" : "#f5d5a8";
  ctx.beginPath(); ctx.arc(0, 0, headR, 0, Math.PI * 2); ctx.fill();

  // Hair / kit colour cap
  ctx.fillStyle = actor.kit;
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, headR, Math.PI + 0.25, Math.PI * 2 - 0.25);
  ctx.lineTo(0, -headR * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Eyes
  const eox = headR * 0.30;
  const eoy = -headR * 0.06;
  const eWR = headR * 0.22;
  const ePR = headR * 0.13;

  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(-eox, eoy, eWR, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc( eox, eoy, eWR, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#16213e";
  ctx.beginPath(); ctx.arc(-eox + actor.facing * 3, eoy + 1, ePR, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc( eox + actor.facing * 3, eoy + 1, ePR, 0, Math.PI * 2); ctx.fill();

  // Eye shine
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.beginPath(); ctx.arc(-eox + actor.facing * 2 - 2, eoy - 2, ePR * 0.38, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc( eox + actor.facing * 2 - 2, eoy - 2, ePR * 0.38, 0, Math.PI * 2); ctx.fill();

  // Eyebrows (angry slant)
  ctx.strokeStyle = "#2d1a0e";
  ctx.lineWidth = 2.8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-eox - eWR * 0.9, eoy - eWR * 0.9);
  ctx.lineTo(-eox + eWR * 0.9, eoy - eWR * 0.65 - actor.facing * 3);
  ctx.moveTo( eox - eWR * 0.9, eoy - eWR * 0.65 + actor.facing * 3);
  ctx.lineTo( eox + eWR * 0.9, eoy - eWR * 0.9);
  ctx.stroke();

  // Nose dot
  ctx.fillStyle = "rgba(180,100,58,0.55)";
  ctx.beginPath(); ctx.arc(actor.facing * 2, headR * 0.18, 2.5, 0, Math.PI * 2); ctx.fill();

  // Mouth (slight smirk)
  ctx.strokeStyle = "#7b3f20";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(actor.facing * 2, headR * 0.36, headR * 0.15, 0.15, Math.PI - 0.15);
  ctx.stroke();

  // Ears
  ctx.fillStyle = "#f5d5a8";
  ctx.beginPath(); ctx.ellipse(-headR,  0, 5, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( headR,  0, 5, 8, 0, 0, Math.PI * 2); ctx.fill();

  // ── Kick leg animation ────────────────────────────────────────────────────
  if (actor.kickTimer > 0) {
    ctx.strokeStyle = actor.trim;
    ctx.lineWidth = 5.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(actor.facing * 8,  headR * 0.72 + bodyH - 8);
    ctx.lineTo(actor.facing * 30, headR * 0.72 + bodyH - 24);
    ctx.stroke();
    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.ellipse(actor.facing * 34, headR * 0.72 + bodyH - 26, 10, 6, actor.facing * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Dash trail ───────────────────────────────────────────────────────────
  if (actor.dashTimer > 0) {
    ctx.save();
    for (let i = 1; i <= 4; i++) {
      ctx.globalAlpha = actor.dashTimer * 3.5 * (1 - i * 0.22);
      ctx.strokeStyle = actor.kit;
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 5]);
      const off = i * (actor.dashDir ?? actor.facing) * -10;
      roundRect(ctx, -headR - 2 + off, -headR - 2, (headR + 2) * 2, headR * 2 + bodyH + legLen + 4, 8);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  // ── Status effects ───────────────────────────────────────────────────────
  if (actor.freezeTimer > 0) {
    ctx.strokeStyle = "rgba(186,230,253,0.9)";
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.arc(0, 0, headR + 10, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#7dd3fc";
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (headR + 5), Math.sin(a) * (headR + 5));
      ctx.lineTo(Math.cos(a) * (headR + 13), Math.sin(a) * (headR + 13));
      ctx.lineWidth = 2; ctx.strokeStyle = "#7dd3fc"; ctx.stroke();
    }
  }

  if (actor.giantTimer > 0) {
    const pulse = 0.65 + Math.sin(time * 0.012) * 0.35;
    ctx.strokeStyle = `rgba(250,204,21,${pulse * 0.9})`;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, 0, headR + 11, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#fde047";
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + time * 0.002;
      ctx.beginPath(); ctx.arc(Math.cos(a) * (headR + 15), Math.sin(a) * (headR + 15), 3.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Charged shot orb
  if (actor.chargedShot) {
    const shotColor = actor.chargedShot.id === "dragon" ? "#f97316"
      : actor.chargedShot.id === "lightning" ? "#facc15" : "#38bdf8";
    const orbPulse = 0.65 + Math.sin(time * 0.01) * 0.35;
    ctx.fillStyle = shotColor;
    ctx.globalAlpha = orbPulse;
    ctx.beginPath();
    ctx.arc(actor.facing * (headR + 6), -headR * 0.42, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(actor.facing * (headR + 5), -headR * 0.44, 3, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Name label
  ctx.fillStyle = "#ffffffcc";
  ctx.font = `700 ${Math.max(10, Math.round(headR * 0.40))}px 'Bricolage Grotesque', sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(actor.label, 0, -headR - 6);

  ctx.restore();
}

// ─── ball ────────────────────────────────────────────────────────────────────

function drawBall(ctx, ball) {
  ctx.save();
  ctx.translate(ball.x, ball.y);

  // Shadow
  ctx.fillStyle = "rgba(15,23,42,0.22)";
  ctx.beginPath();
  ctx.ellipse(0, ball.radius + 26, ball.radius + 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Trail
  if (ball.trailTimer > 0) {
    const trailPalette = {
      fire:      [["rgba(251,146,60,0.52)","rgba(249,115,22,0.30)","rgba(253,186,116,0.16)"]],
      ice:       [["rgba(125,211,252,0.44)","rgba(191,219,254,0.26)","rgba(224,242,254,0.14)"]],
      lightning: [["rgba(250,204,21,0.40)","rgba(254,240,138,0.24)","rgba(255,255,200,0.12)"]],
      gold:      [["rgba(250,204,21,0.34)","rgba(253,224,71,0.20)"]],
      cyan:      [["rgba(56,189,248,0.34)","rgba(125,211,252,0.20)"]],
    };
    const cols = (trailPalette[ball.trail] ?? trailPalette.gold)[0];
    cols.forEach((color, i) => {
      ctx.globalAlpha = ball.trailTimer * (1 - i * 0.38);
      ctx.fillStyle = color;
      ctx.beginPath();
      const ox = -(ball.vx * 0.011 * (i + 1));
      const oy = -(ball.vy * 0.007 * (i + 1));
      ctx.arc(ox, oy, ball.radius + 5 + i * 5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  // Ball base
  ctx.fillStyle = ball.flashTimer > 0 ? "#fffde7" : "#ffffff";
  ctx.beginPath(); ctx.arc(0, 0, ball.radius, 0, Math.PI * 2); ctx.fill();

  // Pentagon patches (clipped + rotated)
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, ball.radius - 0.5, 0, Math.PI * 2); ctx.clip();
  ctx.rotate(ball.angle ?? 0);

  const r   = ball.radius;
  const pR  = r * 0.36;
  const pD  = r * 0.56;
  const pts = [
    [0, 0],
    [ Math.cos(Math.PI * 0.5)  * pD,  Math.sin(Math.PI * 0.5)  * pD],
    [ Math.cos(Math.PI * 1.1)  * pD,  Math.sin(Math.PI * 1.1)  * pD],
    [ Math.cos(Math.PI * 1.7)  * pD,  Math.sin(Math.PI * 1.7)  * pD],
    [ Math.cos(Math.PI * 0.30) * pD * 0.9, Math.sin(Math.PI * 0.30) * pD * 0.9],
    [ Math.cos(Math.PI * 1.92) * pD * 0.9, Math.sin(Math.PI * 1.92) * pD * 0.9],
  ];

  ctx.fillStyle = "#1e293b";
  pts.forEach(([px, py]) => {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const x = px + Math.cos(a) * pR;
      const y = py + Math.sin(a) * pR;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();

  // Outline
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(0, 0, ball.radius, 0, Math.PI * 2); ctx.stroke();

  // Shine
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.arc(-r * 0.3, -r * 0.32, r * 0.26, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ─── particles ───────────────────────────────────────────────────────────────

function drawParticles(ctx, particles) {
  particles.forEach((p) => {
    const alpha = clamp(p.life * 1.6, 0, 1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    if (p.type === "star") {
      drawStar(ctx, p.x, p.y, p.radius + 1);
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1;
}

// ─── overlay ─────────────────────────────────────────────────────────────────

function drawOverlay(ctx, state) {
  if (state.status === "playing" || state.status === "goal" || state.status === "halftime" || state.status === "fulltime") return;

  ctx.fillStyle = "rgba(8,18,32,0.52)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const boxW = 460, boxH = 180;
  const boxX = WIDTH * 0.5 - boxW * 0.5;
  const boxY = 116;

  ctx.fillStyle = "rgba(10,28,50,0.94)";
  roundRect(ctx, boxX, boxY, boxW, boxH, 26);
  ctx.fill();
  ctx.strokeStyle = "#1e4d78";
  ctx.lineWidth = 2;
  roundRect(ctx, boxX, boxY, boxW, boxH, 26);
  ctx.stroke();

  ctx.textAlign = "center";
  const cx = WIDTH * 0.5;
  ctx.fillStyle = "#f8fafc";
  ctx.font = "800 34px 'Bricolage Grotesque', sans-serif";
  ctx.fillText(
    state.status === "series-end" ? "Series Complete" :
    state.status === "round-end"  ? "Round Over"      : "Head Soccer",
    cx, boxY + 50,
  );

  ctx.font = "700 18px 'Bricolage Grotesque', sans-serif";
  ctx.fillStyle = "#93c5fd";
  ctx.fillText(state.message, cx, boxY + 86);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "600 14px 'Bricolage Grotesque', sans-serif";
  ctx.fillText("← → move  ↑ jump  Space kick  B power  double-tap dash", cx, boxY + 122);
  ctx.fillStyle = "#fde047";
  ctx.font = "700 15px 'Bricolage Grotesque', sans-serif";
  ctx.fillText("Press Enter / Start to play", cx, boxY + 154);
}

// ─── goal flash ──────────────────────────────────────────────────────────────

function drawGoalFlash(ctx, state, time) {
  if (!["goal", "halftime", "fulltime"].includes(state.status) || state.goalPause <= 0) return;
  const alpha = clamp(state.goalPause * 1.2, 0, 0.6);
  const lastTouch = state.ball?.lastTouch ?? "none";
  const color = state.status === "goal"
    ? (lastTouch === "player" ? "rgba(249,115,22," : "rgba(56,189,248,")
    : state.status === "halftime"
      ? "rgba(14,116,144,"
      : "rgba(245,158,11,";
  ctx.fillStyle = `${color}${alpha})`;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.textAlign = "center";
  ctx.font = "900 72px 'Bricolage Grotesque', sans-serif";
  ctx.fillStyle = `rgba(255,255,255,${Math.min(1, state.goalPause * 2)})`;
  ctx.fillText(
    state.status === "goal" ? "GOAL!" : state.status === "halftime" ? "HALF TIME" : "FULL TIME",
    WIDTH * 0.5,
    HEIGHT * 0.48,
  );
  ctx.font = "700 22px 'Bricolage Grotesque', sans-serif";
  ctx.fillText(state.message, WIDTH * 0.5, HEIGHT * 0.56);
}

// ─── backdrop ────────────────────────────────────────────────────────────────

function drawBackdrop(ctx, assets, time) {
  if (assets?.backdrop?.complete) {
    ctx.drawImage(assets.backdrop, 0, 0, WIDTH, HEIGHT);
    return;
  }
  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, 270);
  sky.addColorStop(0, "#5cbcff");
  sky.addColorStop(1, "#b0deff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawCrowd(ctx, time);
  drawBanners(ctx);
  drawField(ctx);
}

// ─── main export ─────────────────────────────────────────────────────────────

export function renderHeadSoccer(ctx, state, time, assets = {}) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawBackdrop(ctx, assets, time);
  drawGoal(ctx, "left",  assets);
  drawGoal(ctx, "right", assets);
  drawParticles(ctx, state.particles);
  drawPlayer(ctx, state.player, time);
  drawPlayer(ctx, state.cpu,    time);
  drawBall(ctx, state.ball);
  drawGoalFlash(ctx, state, time);
  drawHUD(ctx, state, time);
  drawOverlay(ctx, state);
}
