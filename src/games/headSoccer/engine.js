import {
  AIR_ACCEL,
  BALL_CEILING_Y,
  BALL_DRAG_AIR,
  BALL_DRAG_GROUND,
  BALL_RADIUS,
  BALL_STALL_BOUNCE,
  BALL_STALL_SPEED,
  CHARACTERS,
  DASH_COOLDOWN,
  DASH_DURATION,
  DASH_SPEED,
  DEFAULT_HEAD_RADIUS,
  FIELD_FLOOR_Y,
  FIELD_LEFT,
  FIELD_RIGHT,
  FIELD_TOP,
  FLOOR_BOUNCE,
  FOOT_OFFSET_X,
  FOOT_OFFSET_Y,
  FRICTION,
  GOAL_DEPTH,
  GOAL_TOP,
  GRAVITY,
  HEADER_ASSIST_X,
  HEADER_ASSIST_Y,
  KICK_ZONE_RADIUS,
  KICK_ARC,
  KICK_COOLDOWN,
  KICK_DURATION,
  KICK_RANGE,
  MAGNUS_FACTOR,
  MATCH_BREAK_PAUSE,
  MATCH_CLOCK_MINUTES,
  MATCH_GOAL_PAUSE,
  MAX_LOGS,
  PARTICLE_LIMIT,
  PLAYER_ACCEL,
  PLAYER_BODY_HEIGHT,
  PLAYER_MARGIN,
  WALL_BOUNCE,
  WIDTH,
  approach,
  clamp,
  getCharacter,
  getDifficulty,
  getMode,
  getOpponent,
} from "./config.js";

// ─── helpers ─────────────────────────────────────────────────────────────────

function fieldGroundY(headRadius) {
  return FIELD_FLOOR_Y - PLAYER_BODY_HEIGHT - headRadius;
}

function pushLog(state, text) {
  state.logs = [text, ...state.logs].slice(0, MAX_LOGS);
}

function pushHistory(state, result) {
  state.series.history = [
    {
      round: state.roundLabel,
      rival: state.opponentName,
      score: `${state.score.player}-${state.score.cpu}`,
      result,
    },
    ...state.series.history,
  ].slice(0, 6);
}

function roundLabelFor(modeId, roundIndex) {
  const mode = getMode(modeId);
  if (modeId === "survival") return `Wave ${roundIndex + 1}`;
  if (mode.roundNames?.length) return mode.roundNames[Math.min(roundIndex, mode.roundNames.length - 1)];
  if (!Number.isFinite(mode.rounds)) return `Round ${roundIndex + 1}`;
  return `Round ${roundIndex + 1}/${mode.rounds}`;
}

function opponentIndexFor(modeId, roundIndex) {
  const offsets = { friendly: 0, arcade: 0, tournament: 2, survival: 4, league: 1, death: 6, headcup: 3 };
  return roundIndex + (offsets[modeId] ?? 0);
}

function freezeBodies(state) {
  state.player.vx = 0;
  state.player.vy = 0;
  state.cpu.vx = 0;
  state.cpu.vy = 0;
  state.ball.vx = 0;
  state.ball.vy = 0;
  state.ball.spin = 0;
}

function formatClock(clockSeconds) {
  const safeSeconds = clamp(Math.round(clockSeconds), 0, MATCH_CLOCK_MINUTES * 60);
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function getPeriodLabel(state) {
  if (!getMode(state.gameModeId).timeLimit) return "Sudden death";
  if (state.goldenGoal) return "Golden goal";
  return state.period >= 2 ? "2nd half" : "1st half";
}

function stampBallTouch(ball, actor, type, trail = "none", trailTimer = 0.18) {
  ball.lastTouch = actor.side;
  ball.lastTouchType = type;
  ball.stallTimer = 0;
  ball.flashTimer = Math.max(ball.flashTimer, 0.08);
  if (trail !== "none") {
    ball.trail = trail;
    ball.trailTimer = trailTimer;
  }
}

// ─── factory ─────────────────────────────────────────────────────────────────

function createPlayer(side, label, characterId, nation) {
  const character = getCharacter(characterId);
  const headRadius = DEFAULT_HEAD_RADIUS * character.headScale;
  const startX = side === "left" ? FIELD_LEFT + 170 : FIELD_RIGHT - 170;
  return {
    side,
    label,
    nation,
    characterId,
    powerId: character.powerId,
    powerLabel: character.powerLabel,
    kit: character.kit,
    trim: character.trim,
    accent: character.accent,
    baseHeadRadius: headRadius,
    headRadius,
    x: startX,
    y: fieldGroundY(headRadius),
    vx: 0,
    vy: 0,
    facing: side === "left" ? 1 : -1,
    onGround: true,
    speed: character.speed,
    jump: character.jump,
    shot: character.shot,
    recharge: character.recharge,
    kickTimer: 0,
    kickCooldown: 0,
    dashTimer: 0,
    dashDir: 0,
    dashCooldown: 0,
    headerCooldown: 0,
    jumpCount: 0,
    freezeTimer: 0,
    giantTimer: 0,
    powerMeter: 55,
    chargedShot: null,
    bodySwing: 0,
  };
}

function createBall() {
  return {
    x: WIDTH * 0.5,
    y: 310,
    vx: 180,
    vy: -80,
    radius: BALL_RADIUS,
    spin: 0,
    angle: 0,
    trail: "none",
    trailTimer: 0,
    lastTouch: "none",
    lastTouchType: "none",
    flashTimer: 0,
    stallTimer: 0,
  };
}

function createSeriesState(modeId) {
  const mode = getMode(modeId);
  return {
    wins: 0, losses: 0, draws: 0, points: 0,
    goalsFor: 0, goalsAgainst: 0,
    streak: 0, bestStreak: 0,
    lives: mode.lives ?? 0,
    history: [],
  };
}

// ─── round management ─────────────────────────────────────────────────────────

function clearRound(state) {
  const playerCharacter = getCharacter(state.playerCharacterId);
  const opponent = getOpponent(opponentIndexFor(state.gameModeId, state.roundIndex));
  const difficulty = getDifficulty(state.difficultyId);
  const mode = getMode(state.gameModeId);
  const cpuBoost = 1 + state.roundIndex * (state.gameModeId === "survival" ? 0.035 : 0.018);

  state.player = createPlayer("left", "YOU", state.playerCharacterId, playerCharacter.nation);
  state.cpu    = createPlayer("right", opponent.name, opponent.characterId, opponent.nation);

  state.cpu.speed   *= difficulty.speed     * cpuBoost;
  state.cpu.jump    *= difficulty.jumpBias  * Math.min(cpuBoost, 1.18);
  state.cpu.shot    *= difficulty.speed     * cpuBoost;
  state.cpu.recharge /= difficulty.powerBias;

  state.cpuStyle       = opponent.style;
  state.opponentId     = opponent.id;
  state.opponentName   = opponent.name;
  state.opponentNation = opponent.nation;
  state.ball           = createBall();
  state.score          = { player: 0, cpu: 0 };
  state.goalPause      = 0;
  state.pendingRoundResult   = null;
  state.goldenGoal           = false;
  state.timer                = mode.timeLimit;
  state.matchElapsed         = 0;
  state.clockSeconds         = 0;
  state.clockLabel           = formatClock(0);
  state.period               = 1;
  state.halftimePlayed       = false;
  state.roundLabel           = roundLabelFor(state.gameModeId, state.roundIndex);
  state.roundTarget          = mode.goalCap;
  state.message              = "Press Start or Enter to kick off.";
  state.status               = "menu";
  state.particles            = [];
  pushLog(state, `Opponent: ${opponent.name} (${opponent.nation}).`);
}

// ─── particles ───────────────────────────────────────────────────────────────

function spawnBurst(state, x, y, colors, count = 12, force = 1) {
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
    const speed = (70 + Math.random() * 60 + i * 4) * force;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 130,
      life: 0.55 + Math.random() * 0.35,
      color: colors[i % colors.length],
      radius: 2 + (i % 5),
      type: i % 4 === 0 ? "star" : "circle",
    });
  }
  if (state.particles.length > PARTICLE_LIMIT) {
    state.particles = state.particles.slice(state.particles.length - PARTICLE_LIMIT);
  }
}

// ─── kickoff reset ───────────────────────────────────────────────────────────

function kickoff(state, direction = 1) {
  const pH = state.player.giantTimer > 0 ? state.player.baseHeadRadius * 1.28 : state.player.baseHeadRadius;
  const cH = state.cpu.giantTimer    > 0 ? state.cpu.baseHeadRadius    * 1.28 : state.cpu.baseHeadRadius;

  state.player.headRadius = pH;
  state.player.x = FIELD_LEFT + 170;
  state.player.y = fieldGroundY(pH);
  state.player.vx = state.player.vy = 0;
  state.player.kickTimer = state.player.kickCooldown = 0;
  state.player.dashTimer = state.player.dashCooldown = 0;
  state.player.headerCooldown = 0;
  state.player.onGround = true;
  state.player.facing = 1;

  state.cpu.headRadius = cH;
  state.cpu.x = FIELD_RIGHT - 170;
  state.cpu.y = fieldGroundY(cH);
  state.cpu.vx = state.cpu.vy = 0;
  state.cpu.kickTimer = state.cpu.kickCooldown = 0;
  state.cpu.dashTimer = state.cpu.dashCooldown = 0;
  state.cpu.headerCooldown = 0;
  state.cpu.onGround = true;
  state.cpu.facing = -1;

  state.ball = createBall();
  state.ball.vx = 190 * direction;
  state.ball.vy = -90;
  state.goalPause = 0;
}

// ─── AI trajectory prediction ────────────────────────────────────────────────

function predictBallPosition(ball, timeAhead) {
  let x = ball.x, y = ball.y, vx = ball.vx, vy = ball.vy;
  const steps = Math.max(4, Math.ceil(timeAhead / 0.025));
  const dt = timeAhead / steps;
  const airDrag = Math.pow(BALL_DRAG_AIR, dt * 60);
  for (let i = 0; i < steps; i++) {
    vy += GRAVITY * 0.88 * dt;
    vx *= airDrag;
    x += vx * dt;
    y += vy * dt;
    if (y + BALL_RADIUS > FIELD_FLOOR_Y) { y = FIELD_FLOOR_Y - BALL_RADIUS; vy = -Math.abs(vy) * FLOOR_BOUNCE; vx *= 0.95; }
    if (x - BALL_RADIUS < FIELD_LEFT)    { x = FIELD_LEFT  + BALL_RADIUS;   vx =  Math.abs(vx) * WALL_BOUNCE; }
    if (x + BALL_RADIUS > FIELD_RIGHT)   { x = FIELD_RIGHT - BALL_RADIUS;   vx = -Math.abs(vx) * WALL_BOUNCE; }
  }
  return { x, y };
}

// ─── intent ──────────────────────────────────────────────────────────────────

function actorIntent(state, actor, input, isCpu) {
  if (!isCpu) {
    return {
      axis:    (input.right ? 1 : 0) - (input.left ? 1 : 0),
      jump:    input.jump,
      kick:    input.kick,
      power:   input.power,
      dash:    input.dash,
      dashDir: input.dashDir ?? 0,
    };
  }

  const difficulty     = getDifficulty(state.difficultyId);
  const ball           = state.ball;
  const cpuGoalX       = FIELD_RIGHT - GOAL_DEPTH - 18;
  const predTime       = 0.38 * difficulty.reaction;
  const pred           = predictBallPosition(ball, predTime);
  const blend          = difficulty.reaction * 0.52;
  const tgtBallX       = ball.x * (1 - blend) + pred.x * blend;
  const tgtBallY       = ball.y * (1 - blend) + pred.y * blend;
  const ballOnCpuSide  = ball.x > WIDTH * 0.5;

  let targetX;
  if (state.cpuStyle === "keeper") {
    const advance = ballOnCpuSide && Math.abs(ball.x - actor.x) < 230;
    targetX = advance
      ? clamp(tgtBallX - 60, WIDTH * 0.54, cpuGoalX - 38)
      : clamp(cpuGoalX - 96 + (ball.x - WIDTH * 0.5) * 0.12, WIDTH * 0.52, cpuGoalX - 18);
  } else if (state.cpuStyle === "striker") {
    targetX = clamp(tgtBallX - 55, WIDTH * 0.52, FIELD_RIGHT - 68);
  } else {
    targetX = clamp(tgtBallX - 44, WIDTH * 0.50, FIELD_RIGHT - 68);
  }

  const dx         = targetX - actor.x;
  const axis       = Math.abs(dx) < 14 ? 0 : Math.sign(dx);
  const ballAbove  = tgtBallY < actor.y - 30;
  const ballClose  = Math.abs(tgtBallX - actor.x) < 140;
  const directDist = Math.hypot(ball.x - actor.x, ball.y - actor.y);
  const ballDanger = ball.x > WIDTH * 0.54 && ball.y < FIELD_FLOOR_Y - 48;

  return {
    axis,
    jump:    ballAbove && ballClose && actor.onGround && Math.random() < difficulty.jumpBias,
    kick:    directDist < KICK_RANGE + 18,
    power:   actor.powerMeter >= 100 && ballDanger && directDist < 210 && Math.random() < difficulty.powerBias,
    dash:    ballOnCpuSide && Math.abs(dx) > 230 && actor.onGround && actor.dashCooldown <= 0 && difficulty.reaction >= 0.9,
    dashDir: Math.sign(dx),
  };
}

// ─── actor update ────────────────────────────────────────────────────────────

function updateActor(actor, intent, dt) {
  actor.freezeTimer  = Math.max(0, actor.freezeTimer  - dt);
  actor.giantTimer   = Math.max(0, actor.giantTimer   - dt);
  actor.kickTimer    = Math.max(0, actor.kickTimer    - dt);
  actor.kickCooldown = Math.max(0, actor.kickCooldown - dt);
  actor.dashTimer    = Math.max(0, actor.dashTimer    - dt);
  actor.dashCooldown = Math.max(0, actor.dashCooldown - dt);
  actor.headerCooldown = Math.max(0, actor.headerCooldown - dt);
  actor.chargedShot  = actor.chargedShot && actor.chargedShot.timer > 0
    ? { ...actor.chargedShot, timer: actor.chargedShot.timer - dt }
    : null;

  const currentHead = actor.giantTimer > 0 ? actor.baseHeadRadius * 1.28 : actor.baseHeadRadius;
  actor.headRadius  = currentHead;
  if (actor.onGround) actor.y = fieldGroundY(currentHead);

  const frozen     = actor.freezeTimer > 0;
  const moveScale  = frozen ? 0 : 1;
  const axis       = moveScale ? intent.axis : 0;

  // Dash initiation
  if (intent.dash && actor.dashCooldown <= 0 && moveScale) {
    actor.dashTimer    = DASH_DURATION;
    actor.dashDir      = intent.dashDir !== 0 ? Math.sign(intent.dashDir) : (axis !== 0 ? axis : actor.facing);
    actor.dashCooldown = DASH_COOLDOWN;
    if (actor.dashDir !== 0) actor.facing = actor.dashDir;
  }

  // Horizontal velocity
  if (actor.dashTimer > 0) {
    actor.vx = approach(actor.vx, actor.dashDir * DASH_SPEED, 5200 * dt);
  } else {
    const accel      = actor.onGround ? PLAYER_ACCEL : AIR_ACCEL;
    const targetVx   = axis * actor.speed;
    actor.vx         = axis === 0
      ? approach(actor.vx, 0, FRICTION * dt)
      : approach(actor.vx, targetVx, accel * dt);
  }
  if (axis !== 0) actor.facing = axis;

  // Unity reference behaviour: grounded single jump only.
  if (intent.jump && moveScale && actor.onGround) {
    actor.vy        = -actor.jump * (actor.giantTimer > 0 ? 1.06 : 1);
    actor.onGround  = false;
    actor.jumpCount = 1;
  }
  if (actor.onGround) actor.jumpCount = 0;

  // Kick request (gated by cooldown)
  if (intent.kick && actor.kickCooldown <= 0 && moveScale) {
    actor.kickTimer = KICK_DURATION;
  }

  actor.powerMeter = clamp(actor.powerMeter + (100 / actor.recharge) * dt, 0, 100);
  actor.bodySwing  = Math.min(1, Math.abs(actor.vx) / Math.max(actor.speed, 1));

  actor.vy += GRAVITY * dt;
  actor.x  += actor.vx * dt;
  actor.y  += actor.vy * dt;

  actor.x  = clamp(actor.x, FIELD_LEFT  + currentHead + PLAYER_MARGIN, FIELD_RIGHT - currentHead - PLAYER_MARGIN);

  const ground = fieldGroundY(actor.headRadius);
  if (actor.y >= ground) {
    actor.y        = ground;
    actor.vy       = 0;
    actor.onGround = true;
  }
}

// ─── kick resolution ─────────────────────────────────────────────────────────

function getKickAnchor(actor) {
  return {
    x: actor.x + actor.facing * FOOT_OFFSET_X,
    y: actor.y + FOOT_OFFSET_Y + (actor.onGround ? 0 : -8),
  };
}

function applyKick(actor, ball, liftBias) {
  const dx = ball.x - actor.x;
  const dy = ball.y - actor.y;
  const kickAnchor = getKickAnchor(actor);
  const kickDx = ball.x - kickAnchor.x;
  const kickDy = ball.y - kickAnchor.y;
  const contactRadius = KICK_ZONE_RADIUS + ball.radius + (actor.giantTimer > 0 ? 5 : 0);
  const footContact = Math.hypot(kickDx, kickDy) <= contactRadius;
  const bodyContact = Math.abs(dx) <= KICK_RANGE && Math.abs(dy) <= KICK_ARC;
  if (!footContact && !bodyContact) return false;
  if (Math.sign(dx || actor.facing) !== actor.facing && Math.abs(dx) > 28) return false;

  const power      = actor.shot;
  const speedBonus = Math.abs(actor.vx) * 0.62;
  let   trail      = actor.side === "left" ? "gold" : "cyan";
  const liftBoost = ball.y < actor.y - actor.headRadius * 0.1 ? 1.12 : actor.onGround ? 0.94 : 1.02;
  const kickRise = Math.max(115, 155 + Math.max(0, kickAnchor.y - ball.y) * 3.2);
  ball.vx = actor.facing * (power * 0.94 + speedBonus + (footContact ? 80 : 30));
  ball.vy = -kickRise * liftBias * liftBoost;
  ball.spin = actor.facing * (footContact ? 8 : 12);

  if (actor.chargedShot?.id === "dragon") {
    ball.vx *= 1.28;
    ball.vy -= 200;
    trail    = "fire";
    ball.spin = actor.facing * 22;
  }
  if (actor.chargedShot?.id === "lightning") {
    ball.vx *= 1.22;
    trail    = "lightning";
    ball.spin = actor.facing * 18;
  }

  stampBallTouch(ball, actor, "kick", trail, 0.88);
  actor.chargedShot = null;
  actor.kickTimer   = 0;
  actor.kickCooldown = KICK_COOLDOWN;
  return true;
}

// ─── powers ──────────────────────────────────────────────────────────────────

function activatePower(state, actor, opponent) {
  if (actor.powerMeter < 100 || actor.freezeTimer > 0) return false;
  actor.powerMeter = 0;

  if (actor.powerId === "dragon") {
    actor.chargedShot = { id: "dragon", timer: 2.3 };
    spawnBurst(state, actor.x + actor.facing * 22, actor.y - 12, ["#fb923c", "#f97316", "#fde047"], 18, 1.2);
    pushLog(state, `${actor.label} arms Dragon shot!`);
    return true;
  }
  if (actor.powerId === "ice") {
    opponent.freezeTimer = 1.65;
    state.ball.vx *= 0.72;
    state.ball.vy *= 0.88;
    state.ball.trail = "ice";
    state.ball.trailTimer = 1.2;
    spawnBurst(state, opponent.x, opponent.y - 10, ["#bae6fd", "#38bdf8", "#dbeafe", "#e0f2fe"], 20, 0.92);
    pushLog(state, `${actor.label} freezes the rival!`);
    return true;
  }
  if (actor.powerId === "lightning") {
    actor.chargedShot = { id: "lightning", timer: 1.4 };
    actor.vx += actor.facing * 280;
    actor.vy  = Math.min(actor.vy, -165);
    actor.onGround = false;
    spawnBurst(state, actor.x, actor.y, ["#fef08a", "#facc15", "#fde68a", "#fbbf24"], 22, 1.3);
    pushLog(state, `${actor.label} charges Thunder burst!`);
    return true;
  }
  if (actor.powerId === "giant") {
    actor.giantTimer = 4.5;
    actor.vy = -actor.jump * 0.94;
    actor.onGround = false;
    spawnBurst(state, actor.x, actor.y, ["#bbf7d0", "#22c55e", "#fde047", "#86efac"], 24, 1.4);
    pushLog(state, `${actor.label} goes Mega Head!`);
    return true;
  }
  return false;
}

// ─── ball ────────────────────────────────────────────────────────────────────

function resolveBallAgainstActor(ball, actor) {
  const dx       = ball.x - actor.x;
  const dy       = ball.y - actor.y;
  const dist     = Math.hypot(dx, dy) || 0.0001;
  const sum      = ball.radius + actor.headRadius;
  if (dist >= sum) return false;

  const nx      = dx / dist;
  const ny      = dy / dist;
  const overlap = sum - dist;
  ball.x += nx * overlap * 1.04;
  ball.y += ny * overlap * 1.04;

  const relV = (ball.vx - actor.vx) * nx + (ball.vy - actor.vy) * ny;
  if (relV < 0) {
    const rest    = 1.12 + (actor.giantTimer > 0 ? 0.10 : 0);
    const impulse = -rest * relV;
    ball.vx += nx * impulse + actor.vx * 0.26;
    ball.vy += ny * impulse + actor.vy * 0.24;
    ball.spin += (actor.vx - ball.vx * 0.2) * 0.018;
  }
  const headerWindow = dy < -actor.headRadius * 0.08 || !actor.onGround;
  if (headerWindow && actor.headerCooldown <= 0) {
    ball.vx = actor.facing * (HEADER_ASSIST_X + Math.abs(actor.vx) * 0.28 + actor.shot * 0.12);
    ball.vy = Math.min(ball.vy - 25, -(HEADER_ASSIST_Y + Math.max(0, -actor.vy * 0.18)));
    ball.spin = actor.facing * 10;
    actor.headerCooldown = 0.14;
    stampBallTouch(ball, actor, "header", actor.side === "left" ? "gold" : "cyan", 0.48);
    return true;
  }
  stampBallTouch(ball, actor, "head");
  return true;
}

function updateBall(state, dt) {
  const { ball } = state;
  ball.trailTimer = Math.max(0, ball.trailTimer - dt);
  ball.flashTimer = Math.max(0, ball.flashTimer - dt);

  const onGround = ball.y + ball.radius >= FIELD_FLOOR_Y - 2;

  ball.vy   += GRAVITY * 0.88 * dt;
  ball.vx   += ball.spin * MAGNUS_FACTOR * dt;  // Magnus effect

  if (onGround) {
    ball.vx  *= Math.pow(BALL_DRAG_GROUND, dt * 60);
    ball.spin *= Math.pow(0.87, dt * 60);
  } else {
    ball.vx  *= Math.pow(BALL_DRAG_AIR, dt * 60);
    ball.spin *= Math.pow(0.992, dt * 60);
  }

  ball.x    += ball.vx * dt;
  ball.y    += ball.vy * dt;
  ball.angle = ((ball.angle ?? 0) + (ball.vx * 0.03 + ball.spin * 0.005) * dt) % (Math.PI * 2);

  // Ceiling
  const ceiling = BALL_CEILING_Y;
  if (ball.y - ball.radius < ceiling) {
    ball.y   = ceiling + ball.radius;
    ball.vy  = Math.max(Math.abs(ball.vy) * WALL_BOUNCE, 145);
    ball.spin *= -0.7;
  }

  // Side walls — allow passage into goal zones
  const inLeftGoal  = ball.y + ball.radius > GOAL_TOP + 10 && ball.x < FIELD_LEFT  + GOAL_DEPTH + 4;
  const inRightGoal = ball.y + ball.radius > GOAL_TOP + 10 && ball.x > FIELD_RIGHT - GOAL_DEPTH - 4;

  if (!inLeftGoal && ball.x - ball.radius < FIELD_LEFT) {
    ball.x = FIELD_LEFT + ball.radius;
    ball.vx = Math.max(Math.abs(ball.vx) * WALL_BOUNCE, 150);
    ball.spin *= -0.55;
  }
  if (!inRightGoal && ball.x + ball.radius > FIELD_RIGHT) {
    ball.x = FIELD_RIGHT - ball.radius;
    ball.vx = -Math.max(Math.abs(ball.vx) * WALL_BOUNCE, 150);
    ball.spin *= -0.55;
  }

  // Floor
  if (ball.y + ball.radius > FIELD_FLOOR_Y) {
    ball.y    = FIELD_FLOOR_Y - ball.radius;
    ball.vy   = -Math.abs(ball.vy) * FLOOR_BOUNCE;
    ball.spin += ball.vx * 0.012;
    if (Math.abs(ball.vy) < 55) ball.vy = 0;
  }

  const currentSpeed = Math.hypot(ball.vx, ball.vy);
  if (ball.y + ball.radius >= FIELD_FLOOR_Y - 1 && currentSpeed < BALL_STALL_SPEED) {
    ball.stallTimer += dt;
  } else {
    ball.stallTimer = 0;
  }

  if (ball.stallTimer >= 0.16 || ball.y - ball.radius > FIELD_FLOOR_Y + 10) {
    ball.y = FIELD_FLOOR_Y - ball.radius;
    ball.vy = -BALL_STALL_BOUNCE;
    if (ball.lastTouch === "player") ball.vx = Math.max(ball.vx, 55);
    if (ball.lastTouch === "cpu") ball.vx = Math.min(ball.vx, -55);
    ball.stallTimer = 0;
  }
}

// ─── particles update ────────────────────────────────────────────────────────

function updateParticles(state, dt) {
  state.particles = state.particles
    .map((p) => ({
      ...p,
      x:    p.x + p.vx * dt,
      y:    p.y + p.vy * dt,
      vx:   p.vx * 0.97,
      vy:   p.vy + GRAVITY * 0.1 * dt,
      life: p.life - dt,
    }))
    .filter((p) => p.life > 0);
}

// ─── goal scoring ────────────────────────────────────────────────────────────

function detectGoal(state) {
  const { ball } = state;
  if (ball.y < GOAL_TOP + 8 || ball.y > FIELD_FLOOR_Y - 8) return null;
  if (ball.x - ball.radius <= FIELD_LEFT  + GOAL_DEPTH) return "cpu";
  if (ball.x + ball.radius >= FIELD_RIGHT - GOAL_DEPTH) return "player";
  return null;
}

function beginStoppage(state, status, message, pause) {
  state.status = status;
  state.goalPause = pause;
  state.message = message;
  freezeBodies(state);
}

function scoreGoal(state, scorerSide) {
  if (scorerSide === "player") state.score.player += 1;
  else state.score.cpu += 1;

  beginStoppage(state, "goal", scorerSide === "player" ? "GOAL for YOU!" : "CPU scores!", MATCH_GOAL_PAUSE);
  state.pendingKickoffDirection = scorerSide === "player" ? -1 : 1;

  spawnBurst(
    state,
    scorerSide === "player" ? FIELD_RIGHT - 120 : FIELD_LEFT + 120,
    GOAL_TOP + 50,
    scorerSide === "player"
      ? ["#f97316", "#fde047", "#fb7185", "#fbbf24"]
      : ["#38bdf8", "#dbeafe", "#60a5fa", "#7dd3fc"],
    28, 1.5,
  );
  spawnBurst(state, WIDTH * 0.5, 250, ["#ffffff", "#fde047", "#f97316", "#38bdf8"], 14, 0.9);
  pushLog(state, `${scorerSide === "player" ? "YOU" : "CPU"} scored!`);

  const mode      = getMode(state.gameModeId);
  const capReached = mode.goalCap && (state.score.player >= mode.goalCap || state.score.cpu >= mode.goalCap);
  if (mode.suddenDeath || capReached) {
    state.pendingRoundResult = state.score.player > state.score.cpu ? "player" : "cpu";
  } else if (state.goldenGoal && state.score.player !== state.score.cpu) {
    state.pendingRoundResult = state.score.player > state.score.cpu ? "player" : "cpu";
  }
}

// ─── round / series end ──────────────────────────────────────────────────────

function finishRound(state, result) {
  const mode       = getMode(state.gameModeId);
  const normalized = result === "draw" && !mode.allowDraws ? "cpu" : result;

  state.series.goalsFor     += state.score.player;
  state.series.goalsAgainst += state.score.cpu;
  pushHistory(state, normalized);

  if (normalized === "player") {
    state.series.wins   += 1;
    state.series.streak += 1;
    state.series.bestStreak = Math.max(state.series.bestStreak, state.series.streak);
  } else if (normalized === "cpu") {
    state.series.losses += 1;
    state.series.streak  = 0;
  } else {
    state.series.draws  += 1;
  }

  if (state.gameModeId === "league") {
    if (normalized === "player") state.series.points += 3;
    if (normalized === "draw")   state.series.points += 1;
  }
  if (state.gameModeId === "survival" && normalized === "cpu") {
    state.series.lives = Math.max(0, state.series.lives - 1);
  }

  const hasNext = (() => {
    if (state.gameModeId === "survival") return state.series.lives > 0;
    if (state.gameModeId === "league")   return state.roundIndex + 1 < mode.rounds;
    return state.roundIndex + 1 < mode.rounds && normalized === "player";
  })();

  if ((state.gameModeId === "league" && state.roundIndex + 1 < mode.rounds)
    || (state.gameModeId === "survival" && state.series.lives > 0)
    || (hasNext && state.gameModeId !== "friendly" && state.gameModeId !== "death")) {
    state.status = "round-end";
  } else {
    state.status = "series-end";
  }

  state.message = normalized === "player" ? "You win the match!" : normalized === "cpu" ? "CPU wins the match." : "Draw!";

  if (state.status === "round-end") {
    state.roundIndex += 1;
    state.roundLabel  = roundLabelFor(state.gameModeId, state.roundIndex);
    pushLog(state, "Press Start for the next rival.");
  } else {
    pushLog(state, "Series complete. Press Start to play again.");
  }
}

// ─── time handling ───────────────────────────────────────────────────────────

function handleTime(state, dt) {
  const mode = getMode(state.gameModeId);
  if (!mode.timeLimit || state.goldenGoal) return;

  state.matchElapsed = clamp(state.matchElapsed + dt, 0, mode.timeLimit);
  state.timer = Math.max(0, mode.timeLimit - state.matchElapsed);
  state.clockSeconds = Math.round((state.matchElapsed / mode.timeLimit) * MATCH_CLOCK_MINUTES * 60);
  state.clockLabel = formatClock(state.clockSeconds);

  if (!state.halftimePlayed && state.matchElapsed >= mode.timeLimit * 0.5) {
    state.halftimePlayed = true;
    state.period = 2;
    state.pendingKickoffDirection = -1;
    beginStoppage(state, "halftime", "HALF TIME", MATCH_BREAK_PAUSE);
    pushLog(state, "Half-time reset. Second half next.");
    return;
  }

  if (state.matchElapsed < mode.timeLimit) return;

  if (state.score.player === state.score.cpu && !mode.allowDraws) {
    state.goldenGoal = true;
    state.timer = 0;
    state.clockSeconds = MATCH_CLOCK_MINUTES * 60;
    state.clockLabel = formatClock(state.clockSeconds);
    state.message = "FULL TIME - Golden goal decides it.";
    pushLog(state, "Full time level. Next goal wins.");
    return;
  }

  state.pendingRoundResult = state.score.player === state.score.cpu ? "draw"
    : state.score.player > state.score.cpu ? "player" : "cpu";
  beginStoppage(state, "fulltime", "FULL TIME", MATCH_BREAK_PAUSE);
  pushLog(state, "Full time whistle.");
}

// ─── public API ──────────────────────────────────────────────────────────────

export function createInputState() {
  return {
    left: false, right: false, jump: false, kick: false,
    power: false, start: false, restart: false,
    dash: false, dashDir: 0,
  };
}

export function createInitialHeadSoccerState() {
  const firstOpponent = getOpponent(0);
  const state = {
    status: "menu",
    gameModeId: "friendly",
    difficultyId: "normal",
    playerCharacterId: "phoenix",
    roundIndex: 0,
    roundLabel: "Round 1/1",
    roundTarget: getMode("friendly").goalCap,
    timer: getMode("friendly").timeLimit,
    matchElapsed: 0,
    clockSeconds: 0,
    clockLabel: formatClock(0),
    period: 1,
    halftimePlayed: false,
    score: { player: 0, cpu: 0 },
    player: createPlayer("left", "YOU", "phoenix", CHARACTERS.phoenix.nation),
    cpu:    createPlayer("right", "CPU", "bolt",    CHARACTERS.bolt.nation),
    cpuStyle: "striker",
    opponentId:     firstOpponent.id,
    opponentName:   firstOpponent.name,
    opponentNation: firstOpponent.nation,
    ball: createBall(),
    particles: [],
    logs: ["Head Soccer ready. Press Start."],
    message: "Press Start or Enter to kick off.",
    goalPause: 0,
    pendingKickoffDirection: 1,
    pendingRoundResult: null,
    goldenGoal: false,
    series: createSeriesState("friendly"),
  };
  clearRound(state);
  return state;
}

export function applyHeadSoccerConfig(state, patch) {
  const nextMode = patch.gameModeId ?? state.gameModeId;
  state.gameModeId         = nextMode;
  state.difficultyId       = patch.difficultyId       ?? state.difficultyId;
  state.playerCharacterId  = patch.playerCharacterId  ?? state.playerCharacterId;
  state.roundIndex         = 0;
  state.series             = createSeriesState(nextMode);
  state.logs               = ["Configuration updated. Press Start."];
  clearRound(state);
}

function advanceFlow(state) {
  if (state.status === "round-end") {
    clearRound(state);
  } else if (state.status === "series-end") {
    state.roundIndex = 0;
    state.series     = createSeriesState(state.gameModeId);
    clearRound(state);
  }
}

export function updateHeadSoccer(state, input, dt) {
  if (input.restart) { applyHeadSoccerConfig(state, {}); return; }

  if (input.start) {
    if (state.status === "menu") {
      state.status  = "playing";
      state.message = "Match live!";
      pushLog(state, "Kickoff!");
    } else if (state.status === "round-end" || state.status === "series-end") {
      advanceFlow(state);
    }
  }

  updateParticles(state, dt);

  if (state.status === "goal" || state.status === "halftime" || state.status === "fulltime") {
    state.goalPause = Math.max(0, state.goalPause - dt);
    if (state.goalPause <= 0) {
      if (state.status === "goal" && state.pendingRoundResult) {
        finishRound(state, state.pendingRoundResult);
        state.pendingRoundResult = null;
      } else if (state.status === "goal") {
        kickoff(state, state.pendingKickoffDirection);
        state.status  = "playing";
        state.message = state.period >= 2 ? "Second half live!" : "Kickoff!";
      } else if (state.status === "halftime") {
        kickoff(state, state.pendingKickoffDirection);
        state.status = "playing";
        state.message = "Second half live!";
        pushLog(state, "Second half live.");
      } else if (state.status === "fulltime") {
        finishRound(state, state.pendingRoundResult);
        state.pendingRoundResult = null;
      }
    }
    return;
  }

  if (state.status !== "playing") return;

  const pi = actorIntent(state, state.player, input, false);
  const ci = actorIntent(state, state.cpu,    input, true);

  updateActor(state.player, pi, dt);
  updateActor(state.cpu,    ci, dt);

  if (pi.power) activatePower(state, state.player, state.cpu);
  if (ci.power) activatePower(state, state.cpu,    state.player);

  updateBall(state, dt);
  resolveBallAgainstActor(state.ball, state.player);
  resolveBallAgainstActor(state.ball, state.cpu);

  if (state.player.kickTimer > 0) applyKick(state.player, state.ball, state.player.onGround ? 1 : 1.12);
  if (state.cpu.kickTimer    > 0) applyKick(state.cpu,    state.ball, state.cpu.onGround    ? 1 : 1.08);

  const goal = detectGoal(state);
  if (goal) { scoreGoal(state, goal); return; }

  handleTime(state, dt);
}

export function snapshotHeadSoccerState(state) {
  const mode           = getMode(state.gameModeId);
  const playerChar     = getCharacter(state.playerCharacterId);
  const cpuChar        = getCharacter(state.cpu.characterId);

  const snapActor = (a) => ({
    x: a.x, y: a.y, vx: a.vx, vy: a.vy,
    headRadius: a.headRadius,
    powerMeter: a.powerMeter,
    freezeTimer: a.freezeTimer,
    giantTimer: a.giantTimer,
    facing: a.facing,
    dashTimer: a.dashTimer,
    kickTimer: a.kickTimer,
    chargedShot: a.chargedShot ? { id: a.chargedShot.id } : null,
  });

  return {
    status: state.status,
    gameModeId: state.gameModeId,
    gameModeLabel: mode.label,
    rules: mode.rules,
    difficultyId: state.difficultyId,
    roundIndex: state.roundIndex,
    roundLabel: state.roundLabel,
    roundTarget: state.roundTarget,
    timer: state.timer,
    clock: {
      elapsed: state.matchElapsed,
      displaySeconds: state.clockSeconds,
      displayLabel: state.clockLabel,
      period: state.period,
      periodLabel: getPeriodLabel(state),
      halftimePlayed: state.halftimePlayed,
    },
    goldenGoal: state.goldenGoal,
    opponentName: state.opponentName,
    opponentNation: state.opponentNation,
    score: state.score,
    playerCharacterId:   state.playerCharacterId,
    playerCharacterName: playerChar.name,
    playerPowerLabel:    playerChar.powerLabel,
    player: snapActor(state.player),
    cpuCharacterId:   state.cpu.characterId,
    cpuCharacterName: cpuChar.name,
    cpuPowerLabel:    cpuChar.powerLabel,
    cpu: snapActor(state.cpu),
    ball: {
      x: state.ball.x, y: state.ball.y, vx: state.ball.vx, vy: state.ball.vy,
      radius: state.ball.radius, trail: state.ball.trail,
      angle: state.ball.angle ?? 0, lastTouch: state.ball.lastTouch,
      lastTouchType: state.ball.lastTouchType,
    },
    series: { ...state.series },
    message: state.message,
    logs: state.logs,
    particles: state.particles.map((p) => ({
      x: p.x, y: p.y, life: p.life, color: p.color, radius: p.radius, type: p.type ?? "circle",
    })),
  };
}
