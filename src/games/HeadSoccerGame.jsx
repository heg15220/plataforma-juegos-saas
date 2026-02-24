import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useGameRuntimeBridge from "../utils/useGameRuntimeBridge";

const WIDTH = 960;
const HEIGHT = 540;
const STEP_MS = 1000 / 60;
const GROUND_Y = 468;
const GRAVITY = 2100;
const GOAL_W = 132;
const GOAL_H = 172;
const MATCH_TIME = 120;
const WIN_SCORE = 5;
const KICK_CHARGE_WINDOW = 0.7;
const DASH_COOLDOWN = 1.1;
const DASH_DURATION = 0.14;
const DASH_LOCK = 0.18;
const DASH_SPEED = 780;
const AIR_CONTROL = 0.56;
const MOMENTUM_DURATION = 8;
const MAX_MOMENTUM = 3;
const DOUBLE_TAP_WINDOW_MS = 220;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const rand = (min, max) => min + Math.random() * (max - min);

const DIFFICULTY = {
  easy: { id: "easy", label: "Facil", react: 0.28, error: 90, kick: 0.45, speed: 0.86 },
  medium: { id: "medium", label: "Medio", react: 0.18, error: 54, kick: 0.66, speed: 1 },
  hard: { id: "hard", label: "Dificil", react: 0.1, error: 26, kick: 0.84, speed: 1.12 }
};

const CPU_PERSONALITY = {
  aggressive: { id: "aggressive", label: "Agresivo", reactMul: 0.84, errorMul: 0.82, kickMul: 1.24, jumpMul: 1.1, abilityMul: 1.25, dashBias: 0.11, holdLine: 0.72, charge: 0.48 },
  defensive: { id: "defensive", label: "Defensivo", reactMul: 1.08, errorMul: 1.04, kickMul: 0.78, jumpMul: 0.82, abilityMul: 0.72, dashBias: 0.04, holdLine: 0.82, charge: 0.3 },
  technical: { id: "technical", label: "Tecnico", reactMul: 0.94, errorMul: 0.7, kickMul: 1, jumpMul: 1.02, abilityMul: 1, dashBias: 0.07, holdLine: 0.76, charge: 0.62 }
};

const STADIUM = {
  day: { id: "day", label: "Dia", skyA: "#7dd3fc", skyB: "#ecfeff", grassA: "#22c55e", grassB: "#16a34a" },
  night: { id: "night", label: "Noche", skyA: "#1e1b4b", skyB: "#0f172a", grassA: "#15803d", grassB: "#166534" },
  future: { id: "future", label: "Futurista", skyA: "#0f172a", skyB: "#1d4ed8", grassA: "#0284c7", grassB: "#0369a1" }
};

const CHAR = {
  blaze: { id: "blaze", name: "Blaze Striker", ability: "fire-shot", abilityLabel: "Disparo de fuego", cd: 8.5, color: "#f97316" },
  frost: { id: "frost", name: "Frost Guardian", ability: "freeze", abilityLabel: "Congelar rival", cd: 10.8, color: "#38bdf8" },
  titan: { id: "titan", name: "Titan Hopper", ability: "super-jump", abilityLabel: "Salto superalto", cd: 7.4, color: "#f59e0b" },
  mega: { id: "mega", name: "Mega Head", ability: "grow", abilityLabel: "Mega tamano", cd: 10.2, color: "#a855f7" }
};

const cpuCharacter = (playerCharacter) => {
  const pool = Object.keys(CHAR).filter((id) => id !== playerCharacter);
  return pool[Math.floor(Math.random() * pool.length)] || "frost";
};

const pickCpuPersonality = () => {
  const ids = Object.keys(CPU_PERSONALITY);
  return ids[Math.floor(Math.random() * ids.length)] || "aggressive";
};

const createPlayer = (side, tag, characterId) => ({
  side,
  tag,
  characterId,
  x: side === "left" ? WIDTH * 0.24 : WIDTH * 0.76,
  y: GROUND_Y,
  vx: 0,
  vy: 0,
  speed: 360,
  jump: 860,
  headR: 34,
  facing: side === "left" ? 1 : -1,
  onGround: true,
  kickT: 0,
  kickCharge: 0,
  kickPower: 0,
  freezeT: 0,
  growT: 0,
  superT: 0,
  fireT: 0,
  abilityCd: 0,
  dashCd: 0,
  dashT: 0,
  dashLock: 0,
  ai: { axis: 0, jump: false, kick: false, kickPower: 0.35, ability: false, dashDir: 0, react: 0 },
  anim: "idle"
});

const createState = () => ({
  mode: "start",
  score: { you: 0, cpu: 0 },
  timer: MATCH_TIME,
  difficultyId: "medium",
  stadiumId: "day",
  cpuPersonalityId: pickCpuPersonality(),
  player: createPlayer("left", "YOU", "blaze"),
  cpu: createPlayer("right", "CPU", "frost"),
  momentum: {
    left: { stacks: 0, timer: 0 },
    right: { stacks: 0, timer: 0 }
  },
  ball: { x: WIDTH * 0.5, y: GROUND_Y - 70, vx: 120, vy: -140, r: 22, spin: 0, hotT: 0, speed: 0, lastTouch: "none" },
  particles: [],
  logs: ["Head Soccer listo. Enter para empezar."],
  message: "Pulsa Start para jugar.",
  goalPause: 0
});

const resetPlayerForKickoff = (player, x, facing) => {
  player.x = x;
  player.y = GROUND_Y;
  player.vx = 0;
  player.vy = 0;
  player.onGround = true;
  player.facing = facing;
  player.kickT = 0;
  player.kickCharge = 0;
  player.kickPower = 0;
  player.dashCd = 0;
  player.dashT = 0;
  player.dashLock = 0;
  player.freezeT = 0;
  player.growT = 0;
  player.superT = 0;
  player.fireT = 0;
};

const resetKickoff = (state, dir = 1) => {
  resetPlayerForKickoff(state.player, WIDTH * 0.24, 1);
  resetPlayerForKickoff(state.cpu, WIDTH * 0.76, -1);

  state.ball.x = WIDTH * 0.5;
  state.ball.y = GROUND_Y - 70;
  state.ball.vx = 180 * dir;
  state.ball.vy = -160;
  state.ball.hotT = 0;
  state.ball.lastTouch = "none";
  state.particles = [];
};

const log = (state, text) => {
  state.logs = [text, ...state.logs].slice(0, 8);
};

const particles = (state, x, y, color, amount = 9, power = 1) => {
  for (let i = 0; i < amount; i += 1) {
    state.particles.push({
      x,
      y,
      vx: rand(-220, 220) * power,
      vy: rand(-220, 30) * power,
      life: rand(0.2, 0.55),
      maxLife: rand(0.2, 0.55),
      r: rand(1.8, 3.8),
      color
    });
  }
  if (state.particles.length > 220) {
    state.particles = state.particles.slice(state.particles.length - 220);
  }
};

const clearMomentum = (state, side) => {
  state.momentum[side].stacks = 0;
  state.momentum[side].timer = 0;
};

const pushMomentum = (state, side, amount = 1) => {
  const meter = state.momentum[side];
  const prev = meter.stacks;
  meter.stacks = clamp(meter.stacks + amount, 0, MAX_MOMENTUM);
  meter.timer = MOMENTUM_DURATION;
  if (meter.stacks === MAX_MOMENTUM && prev < MAX_MOMENTUM) {
    log(state, `${side === "left" ? "YOU" : "CPU"} entra en momentum maximo.`);
  }
};

const tickMomentum = (state, dt) => {
  ["left", "right"].forEach((side) => {
    const meter = state.momentum[side];
    meter.timer = Math.max(0, meter.timer - dt);
    if (meter.timer <= 0) meter.stacks = 0;
  });
};

const startMatch = (state) => {
  state.mode = "playing";
  state.score.you = 0;
  state.score.cpu = 0;
  state.timer = MATCH_TIME;
  state.goalPause = 0;
  state.cpuPersonalityId = pickCpuPersonality();
  clearMomentum(state, "left");
  clearMomentum(state, "right");
  resetKickoff(state, Math.random() > 0.5 ? 1 : -1);
  const personality = CPU_PERSONALITY[state.cpuPersonalityId]?.label || "Agresivo";
  state.message = `Rival IA ${personality}.`;
  log(state, `Partido nuevo. Rival ${personality}.`);
};

const applyAbility = (state, actor, rival, emit) => {
  const character = CHAR[actor.characterId] || CHAR.blaze;
  if (actor.abilityCd > 0 || actor.freezeT > 0) return;
  actor.abilityCd = character.cd;
  log(state, `${actor.tag} usa ${character.abilityLabel}.`);

  if (character.ability === "fire-shot") {
    const nearBall = Math.hypot(actor.x - state.ball.x, actor.y - 70 - state.ball.y) < 180;
    if (nearBall) {
      state.ball.vx = (actor.side === "left" ? 1 : -1) * rand(860, 980);
      state.ball.vy = rand(-260, -130);
      state.ball.hotT = 1.7;
      state.ball.lastTouch = actor.side;
      particles(state, state.ball.x, state.ball.y, "#fb923c", 16, 1.2);
      pushMomentum(state, actor.side, 1);
      emit("fire");
    } else {
      actor.fireT = 2.6;
      emit("ability");
    }
    return;
  }
  if (character.ability === "freeze") {
    rival.freezeT = 1.8;
    particles(state, rival.x, rival.y - 90, "#7dd3fc", 12, 0.9);
    pushMomentum(state, actor.side, 1);
    emit("freeze");
    return;
  }
  if (character.ability === "super-jump") {
    actor.superT = 3.4;
    actor.vy = -1080;
    actor.onGround = false;
    pushMomentum(state, actor.side, 1);
    emit("jump");
    return;
  }
  actor.growT = 4.4;
  pushMomentum(state, actor.side, 1);
  emit("ability");
};

const collideBallWithPlayer = (state, player, emit) => {
  const ball = state.ball;
  const headX = player.x;
  const headY = player.y - 82;
  const playerR = player.headR * (player.growT > 0 ? 1.32 : 1);
  const dX = ball.x - headX;
  const dY = ball.y - headY;
  const dist = Math.hypot(dX, dY) || 0.001;
  const overlap = playerR + ball.r - dist;
  if (overlap > 0) {
    const nX = dX / dist;
    const nY = dY / dist;
    ball.x += nX * overlap;
    ball.y += nY * overlap;
    const rel = (ball.vx - player.vx) * nX + (ball.vy - player.vy) * nY;
    if (rel < 0) {
      ball.vx -= 1.6 * rel * nX;
      ball.vy -= 1.6 * rel * nY;
    }
    const sideBoost = 1 + (state.momentum[player.side]?.stacks || 0) * 0.05;
    const kickPower = player.kickT > 0 ? clamp(player.kickPower, 0.1, 1) : 0;
    const shoot = player.kickT > 0 ? 120 + kickPower * 320 : 0;
    const fire = player.fireT > 0 ? 220 : 0;
    const impulse = (150 + Math.abs(player.vx) * 0.6 + shoot + fire) * sideBoost;
    ball.vx += nX * impulse + player.vx * 0.2;
    ball.vy += nY * impulse * 0.65 - (shoot > 0 ? 28 + kickPower * 100 : 0);
    ball.lastTouch = player.side;
    if (fire > 0) {
      player.fireT = 0;
      ball.hotT = 1.6;
      particles(state, ball.x, ball.y, "#fb923c", 14, 1.25);
      pushMomentum(state, player.side, 1);
      emit("fire");
    } else {
      const speedAfter = Math.hypot(ball.vx, ball.vy);
      if (kickPower > 0.35 && speedAfter > 420) {
        pushMomentum(state, player.side, 1);
        emit("kick");
      } else {
        emit("hit");
      }
      particles(state, ball.x, ball.y, "#f8fafc", 8, 0.8);
    }
  }
};

const updatePlayer = (player, controls, dt, emit) => {
  const axis = controls.axis ?? 0;
  const jumpPressed = controls.jumpPressed ?? false;
  const kickHold = controls.kickHold ?? false;
  const kickRelease = controls.kickRelease ?? false;
  const kickTap = controls.kickTap ?? false;
  const dashDir = controls.dashDir ?? 0;
  const kickPower = controls.kickPower ?? 0.3;
  const momentumStacks = controls.momentumStacks ?? 0;
  const speedBoost = 1 + momentumStacks * 0.04;
  const abilityRegen = 1 + momentumStacks * 0.05;

  if (player.freezeT > 0) {
    player.vx *= 0.86;
    player.kickT = 0;
    player.kickCharge = 0;
  } else {
    if (dashDir !== 0 && player.dashCd <= 0) {
      player.dashCd = DASH_COOLDOWN;
      player.dashT = DASH_DURATION;
      player.dashLock = DASH_LOCK;
      player.vx = dashDir * DASH_SPEED;
      player.facing = dashDir > 0 ? 1 : -1;
      emit("dash");
    }
    if (Math.abs(axis) > 0.01) {
      player.facing = axis > 0 ? 1 : -1;
    }

    if (kickHold) {
      player.kickCharge = clamp(player.kickCharge + dt / KICK_CHARGE_WINDOW, 0, 1);
    }
    if (kickRelease) {
      const power = clamp(Math.max(player.kickCharge, 0.12), 0.12, 1);
      if (player.kickT <= 0) {
        player.kickT = 0.2;
        player.kickPower = power;
      }
      player.kickCharge = 0;
      emit("kick");
    }
    if (kickTap && player.kickT <= 0) {
      player.kickT = 0.17;
      player.kickPower = clamp(kickPower, 0.12, 1);
    }

    if (player.dashT <= 0) {
      const airFactor = player.onGround ? 1 : AIR_CONTROL;
      const accel = player.onGround ? 2900 : 1500;
      player.vx += (axis * player.speed * speedBoost * airFactor - player.vx) * clamp(accel * dt, 0, 1);
      if (Math.abs(axis) < 0.05) player.vx *= player.onGround ? 0.76 : 0.94;
    } else {
      player.vx *= 0.985;
    }

    if (jumpPressed && player.onGround && player.dashLock <= 0) {
      player.vy = -player.jump * (player.superT > 0 ? 1.2 : 1);
      player.onGround = false;
      emit("jump");
    }
  }

  player.vy += GRAVITY * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;
  if (player.y >= GROUND_Y) {
    player.y = GROUND_Y;
    player.vy = 0;
    player.onGround = true;
  }
  player.x = clamp(player.x, 30, WIDTH - 30);

  player.kickT = Math.max(0, player.kickT - dt);
  if (player.kickT <= 0) player.kickPower = 0;
  player.freezeT = Math.max(0, player.freezeT - dt);
  player.growT = Math.max(0, player.growT - dt);
  player.superT = Math.max(0, player.superT - dt);
  player.fireT = Math.max(0, player.fireT - dt);
  player.dashT = Math.max(0, player.dashT - dt);
  player.dashCd = Math.max(0, player.dashCd - dt);
  player.dashLock = Math.max(0, player.dashLock - dt);
  player.abilityCd = Math.max(0, player.abilityCd - dt * abilityRegen);

  if (player.freezeT > 0) player.anim = "frozen";
  else if (player.dashT > 0) player.anim = "dash";
  else if (!player.onGround) player.anim = "jump";
  else if (player.kickCharge > 0.05) player.anim = "charge";
  else if (player.kickT > 0) player.anim = "shoot";
  else if (Math.abs(player.vx) > 30) player.anim = "run";
  else player.anim = "idle";
};

const updateCpu = (state, dt) => {
  const cpu = state.cpu;
  const ball = state.ball;
  const profile = DIFFICULTY[state.difficultyId] || DIFFICULTY.medium;
  const personality = CPU_PERSONALITY[state.cpuPersonalityId] || CPU_PERSONALITY.aggressive;
  cpu.ai.react -= dt;
  if (cpu.ai.react > 0) return;
  cpu.ai.react = profile.react * personality.reactMul;

  const prediction = ball.x + ball.vx * (personality.id === "technical" ? 0.22 : 0.13);
  const tracked = prediction + rand(-profile.error * personality.errorMul, profile.error * personality.errorMul);
  const holdTarget = WIDTH * personality.holdLine;
  const targetX = personality.id === "defensive" && ball.x < WIDTH * 0.58
    ? holdTarget
    : tracked;

  const delta = clamp(targetX, WIDTH * 0.5 + 32, WIDTH - 40) - cpu.x;
  cpu.ai.axis = Math.abs(delta) < 12 ? 0 : delta > 0 ? 1 : -1;
  cpu.ai.jump = cpu.onGround && ball.y < cpu.y - 45 && Math.abs(ball.x - cpu.x) < 190 && Math.random() < profile.kick * personality.jumpMul;
  cpu.ai.kick = Math.abs(ball.x - cpu.x) < 108 && ball.y > cpu.y - 130 && Math.random() < profile.kick * personality.kickMul;
  cpu.ai.kickPower = clamp(personality.charge + rand(-0.12, 0.14), 0.12, 1);
  cpu.ai.ability = cpu.abilityCd <= 0 && Math.random() < (0.03 + profile.kick * 0.05) * personality.abilityMul;
  cpu.ai.dashDir = 0;
  if (cpu.dashCd <= 0 && Math.abs(delta) > 58 && Math.abs(delta) < 220 && Math.random() < personality.dashBias) {
    cpu.ai.dashDir = delta > 0 ? 1 : -1;
  }
  cpu.speed = 360 * profile.speed * (1 + state.momentum.right.stacks * 0.04);
};

const step = (state, input, dt, emit) => {
  tickMomentum(state, dt);

  if (input.restart) {
    startMatch(state);
    emit("start");
  }
  if (state.mode === "start" && input.start) {
    startMatch(state);
    emit("start");
  }
  if (state.mode === "finished") {
    if (input.start) {
      startMatch(state);
      emit("start");
    }
  }
  if (state.mode === "goal") {
    state.goalPause = Math.max(0, state.goalPause - dt);
    if (state.goalPause <= 0) {
      if (state.timer <= 0 || state.score.you >= WIN_SCORE || state.score.cpu >= WIN_SCORE) {
        state.mode = "finished";
      } else {
        state.mode = "playing";
        resetKickoff(state, state.score.you >= state.score.cpu ? -1 : 1);
      }
    }
  }
  if (state.mode !== "playing") return;

  state.timer = Math.max(0, state.timer - dt);
  if (state.timer <= 0) {
    state.mode = "finished";
    state.message = "Tiempo agotado.";
    emit("finish");
    return;
  }

  updateCpu(state, dt);

  const axis = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const dashDir = input.dashLeft ? -1 : input.dashRight ? 1 : 0;
  updatePlayer(
    state.player,
    {
      axis,
      jumpPressed: input.jump,
      kickHold: input.kickHold,
      kickRelease: input.kickRelease,
      dashDir,
      momentumStacks: state.momentum.left.stacks
    },
    dt,
    emit
  );
  updatePlayer(
    state.cpu,
    {
      axis: state.cpu.ai.axis,
      jumpPressed: state.cpu.ai.jump,
      kickTap: state.cpu.ai.kick,
      kickPower: state.cpu.ai.kickPower,
      dashDir: state.cpu.ai.dashDir,
      momentumStacks: state.momentum.right.stacks
    },
    dt,
    emit
  );
  state.cpu.ai.jump = false;
  state.cpu.ai.kick = false;
  state.cpu.ai.dashDir = 0;

  if (input.ability) applyAbility(state, state.player, state.cpu, emit);
  if (state.cpu.ai.ability) applyAbility(state, state.cpu, state.player, emit);
  state.cpu.ai.ability = false;

  collideBallWithPlayer(state, state.player, emit);
  collideBallWithPlayer(state, state.cpu, emit);

  state.ball.vy += GRAVITY * dt;
  state.ball.x += state.ball.vx * dt;
  state.ball.y += state.ball.vy * dt;
  if (state.ball.y > GROUND_Y - state.ball.r) {
    state.ball.y = GROUND_Y - state.ball.r;
    state.ball.vy = -Math.abs(state.ball.vy) * 0.82;
    state.ball.vx *= 0.994;
  }
  if (state.ball.x < state.ball.r) {
    state.ball.x = state.ball.r;
    state.ball.vx = Math.abs(state.ball.vx) * 0.9;
  }
  if (state.ball.x > WIDTH - state.ball.r) {
    state.ball.x = WIDTH - state.ball.r;
    state.ball.vx = -Math.abs(state.ball.vx) * 0.9;
  }
  if (state.ball.y < state.ball.r) {
    state.ball.y = state.ball.r;
    state.ball.vy = Math.abs(state.ball.vy) * 0.88;
  }
  state.ball.hotT = Math.max(0, state.ball.hotT - dt);
  state.ball.spin += state.ball.vx * dt * 0.02;
  state.ball.speed = Math.hypot(state.ball.vx, state.ball.vy);

  const leftGoal = { x: 20, y: GROUND_Y - GOAL_H, w: GOAL_W, h: GOAL_H };
  const rightGoal = { x: WIDTH - GOAL_W - 20, y: GROUND_Y - GOAL_H, w: GOAL_W, h: GOAL_H };
  const inLeft = state.ball.x - state.ball.r > leftGoal.x && state.ball.x + state.ball.r < leftGoal.x + leftGoal.w && state.ball.y - state.ball.r > leftGoal.y && state.ball.y + state.ball.r < leftGoal.y + leftGoal.h;
  const inRight = state.ball.x - state.ball.r > rightGoal.x && state.ball.x + state.ball.r < rightGoal.x + rightGoal.w && state.ball.y - state.ball.r > rightGoal.y && state.ball.y + state.ball.r < rightGoal.y + rightGoal.h;
  if (inLeft || inRight) {
    state.mode = "goal";
    state.goalPause = 1.6;
    if (inLeft) {
      state.score.cpu += 1;
      pushMomentum(state, "right", 2);
      clearMomentum(state, "left");
      state.message = `Gol CPU. Momentum x${state.momentum.right.stacks}.`;
      log(state, "CPU marca gol.");
    } else {
      state.score.you += 1;
      pushMomentum(state, "left", 2);
      clearMomentum(state, "right");
      state.message = `Gol YOU. Momentum x${state.momentum.left.stacks}.`;
      log(state, "YOU marca gol.");
    }
    particles(state, state.ball.x, state.ball.y, inLeft ? "#fb923c" : "#22c55e", 24, 1.5);
    emit("goal");
  }

  state.particles = state.particles
    .map((p) => ({ ...p, life: p.life - dt, x: p.x + p.vx * dt, y: p.y + p.vy * dt, vy: p.vy + 620 * dt }))
    .filter((p) => p.life > 0.01);
};

const snapshotOf = (state) => {
  const pChar = CHAR[state.player.characterId] || CHAR.blaze;
  const cChar = CHAR[state.cpu.characterId] || CHAR.frost;
  const cpuPersonality = CPU_PERSONALITY[state.cpuPersonalityId] || CPU_PERSONALITY.aggressive;
  return {
    mode: state.mode,
    score: { ...state.score },
    timer: Number(state.timer.toFixed(2)),
    difficultyId: state.difficultyId,
    stadiumId: state.stadiumId,
    cpuPersonalityId: state.cpuPersonalityId,
    cpuPersonalityLabel: cpuPersonality.label,
    playerCharacterId: state.player.characterId,
    cpuCharacterId: state.cpu.characterId,
    playerCharacterName: pChar.name,
    cpuCharacterName: cChar.name,
    playerAbilityLabel: pChar.abilityLabel,
    cpuAbilityLabel: cChar.abilityLabel,
    playerCooldown: Number(state.player.abilityCd.toFixed(2)),
    cpuCooldown: Number(state.cpu.abilityCd.toFixed(2)),
    player: { x: Number(state.player.x.toFixed(2)), y: Number(state.player.y.toFixed(2)), anim: state.player.anim, frozen: state.player.freezeT > 0, charge: Number(state.player.kickCharge.toFixed(3)), dashCd: Number(state.player.dashCd.toFixed(2)) },
    cpu: { x: Number(state.cpu.x.toFixed(2)), y: Number(state.cpu.y.toFixed(2)), anim: state.cpu.anim, frozen: state.cpu.freezeT > 0, charge: Number(state.cpu.kickCharge.toFixed(3)), dashCd: Number(state.cpu.dashCd.toFixed(2)) },
    momentum: {
      you: { stacks: state.momentum.left.stacks, timer: Number(state.momentum.left.timer.toFixed(2)) },
      cpu: { stacks: state.momentum.right.stacks, timer: Number(state.momentum.right.timer.toFixed(2)) }
    },
    ball: { x: Number(state.ball.x.toFixed(2)), y: Number(state.ball.y.toFixed(2)), vx: Number(state.ball.vx.toFixed(2)), vy: Number(state.ball.vy.toFixed(2)), speed: Number(state.ball.speed.toFixed(2)), hot: state.ball.hotT > 0.05, lastTouch: state.ball.lastTouch },
    particles: state.particles.length,
    message: state.message,
    logs: [...state.logs]
  };
};

const createAudio = () => {
  let ctx;
  const ensure = () => {
    if (!ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      ctx = new Ctx();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  };
  const tone = (f, to, d, type, g = 0.06) => {
    const audio = ensure();
    if (!audio) return;
    const now = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f, now);
    osc.frequency.linearRampToValueAtTime(to, now + d);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(g, now + Math.min(0.03, d * 0.5));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + d + 0.03);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now);
    osc.stop(now + d + 0.04);
  };
  return {
    play(name) {
      if (name === "start") tone(320, 560, 0.12, "triangle", 0.08);
      if (name === "hit") tone(220, 170, 0.05, "square", 0.05);
      if (name === "kick") tone(180, 80, 0.09, "sawtooth", 0.08);
      if (name === "ability") tone(520, 780, 0.1, "triangle", 0.07);
      if (name === "fire") tone(180, 900, 0.11, "sawtooth", 0.08);
      if (name === "freeze") tone(600, 260, 0.12, "triangle", 0.07);
      if (name === "jump") tone(280, 520, 0.08, "triangle", 0.06);
      if (name === "goal") tone(260, 820, 0.16, "triangle", 0.08);
      if (name === "dash") tone(340, 180, 0.08, "square", 0.07);
      if (name === "finish") tone(420, 300, 0.16, "triangle", 0.07);
    },
    unlock() {
      ensure();
    }
  };
};

function HeadSoccerGame() {
  const canvasRef = useRef(null);
  const stateRef = useRef(createState());
  const inputRef = useRef({
    left: false,
    right: false,
    jump: false,
    kickHold: false,
    kickRelease: false,
    ability: false,
    dashLeft: false,
    dashRight: false,
    start: false,
    restart: false
  });
  const tapRef = useRef({ left: 0, right: 0 });
  const frameRef = useRef(0);
  const accRef = useRef(0);
  const prevRef = useRef(0);
  const audioRef = useRef(null);
  const [snapshot, setSnapshot] = useState(snapshotOf(stateRef.current));

  if (!audioRef.current) audioRef.current = createAudio();

  const applyConfig = useCallback((changes) => {
    const state = stateRef.current;
    if (changes.difficultyId) state.difficultyId = changes.difficultyId;
    if (changes.stadiumId) state.stadiumId = changes.stadiumId;
    if (changes.playerCharacterId) {
      state.player.characterId = changes.playerCharacterId;
      state.cpu.characterId = cpuCharacter(changes.playerCharacterId);
      state.player.abilityCd = 0;
      state.cpu.abilityCd = 0;
      resetKickoff(state, 1);
      log(state, "Personaje cambiado.");
    }
    setSnapshot(snapshotOf(state));
  }, []);

  const releaseKickHold = useCallback(() => {
    if (inputRef.current.kickHold) {
      inputRef.current.kickHold = false;
      inputRef.current.kickRelease = true;
    }
  }, []);

  useEffect(() => {
    const down = (event) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space", "Enter", "KeyB", "KeyR", "KeyA", "KeyD", "KeyW"].includes(event.code)) event.preventDefault();
      const now = performance.now();
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        if (!event.repeat && now - tapRef.current.left < DOUBLE_TAP_WINDOW_MS) inputRef.current.dashLeft = true;
        tapRef.current.left = now;
        inputRef.current.left = true;
      }
      if (event.code === "ArrowRight" || event.code === "KeyD") {
        if (!event.repeat && now - tapRef.current.right < DOUBLE_TAP_WINDOW_MS) inputRef.current.dashRight = true;
        tapRef.current.right = now;
        inputRef.current.right = true;
      }
      if ((event.code === "ArrowUp" || event.code === "KeyW") && !event.repeat) inputRef.current.jump = true;
      if (event.code === "Space") inputRef.current.kickHold = true;
      if (event.code === "KeyB" && !event.repeat) inputRef.current.ability = true;
      if (event.code === "Enter" && !event.repeat) inputRef.current.start = true;
      if (event.code === "KeyR" && !event.repeat) inputRef.current.restart = true;
      audioRef.current?.unlock();
    };
    const up = (event) => {
      if (event.code === "ArrowLeft" || event.code === "KeyA") inputRef.current.left = false;
      if (event.code === "ArrowRight" || event.code === "KeyD") inputRef.current.right = false;
      if (event.code === "Space") releaseKickHold();
    };
    const onBlur = () => {
      inputRef.current.left = false;
      inputRef.current.right = false;
      inputRef.current.kickHold = false;
      inputRef.current.kickRelease = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", onBlur);
    };
  }, [releaseKickHold]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const draw = (timestamp) => {
      const state = stateRef.current;
      const theme = STADIUM[state.stadiumId] || STADIUM.day;

      const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      sky.addColorStop(0, theme.skyA);
      sky.addColorStop(1, theme.skyB);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, WIDTH, GROUND_Y);

      for (let i = 0; i < 38; i += 1) {
        const x = 18 + i * 24;
        const y = 258 + Math.sin(timestamp * 0.006 + i * 0.5) * 3;
        ctx.fillStyle = i % 2 === 0 ? "#f59e0b" : "#2563eb";
        ctx.fillRect(x, y, 10, 8);
      }

      ctx.fillStyle = theme.grassA;
      ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);
      for (let i = 0; i < 8; i += 1) {
        ctx.fillStyle = i % 2 === 0 ? theme.grassA : theme.grassB;
        ctx.fillRect(0, GROUND_Y + i * 9, WIDTH, 10);
      }

      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 3;
      ctx.strokeRect(30, GROUND_Y - 118, WIDTH - 60, 118);
      ctx.beginPath();
      ctx.arc(WIDTH / 2, GROUND_Y, 58, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2, GROUND_Y - 118);
      ctx.lineTo(WIDTH / 2, GROUND_Y);
      ctx.stroke();

      const drawGoal = (x) => {
        ctx.fillStyle = "rgba(15,23,42,0.18)";
        ctx.fillRect(x, GROUND_Y - GOAL_H, GOAL_W, GOAL_H);
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, GROUND_Y - GOAL_H, GOAL_W, GOAL_H);
      };
      drawGoal(20);
      drawGoal(WIDTH - GOAL_W - 20);

      const drawPlayer = (player) => {
        const c = CHAR[player.characterId] || CHAR.blaze;
        const scale = player.growT > 0 ? 1.32 : 1;
        ctx.save();
        ctx.translate(player.x, player.y);
        if (player.freezeT > 0) ctx.globalAlpha = 0.82;
        if (player.dashT > 0) {
          ctx.globalAlpha = 0.25;
          ctx.fillStyle = c.color;
          ctx.fillRect((-18 - player.facing * 22) * scale, -74 * scale, 36 * scale, 58 * scale);
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = c.color;
        ctx.fillRect(-18 * scale, -74 * scale, 36 * scale, 58 * scale);
        ctx.strokeStyle = "#1f2937";
        ctx.lineWidth = 4 * scale;
        ctx.beginPath();
        ctx.moveTo(-10 * scale, -16 * scale);
        ctx.lineTo(-14 * scale, 0);
        ctx.moveTo(10 * scale, -16 * scale);
        ctx.lineTo(14 * scale, 0);
        ctx.stroke();
        ctx.fillStyle = "#fde7cf";
        ctx.beginPath();
        ctx.arc(0, -90 * scale, 34 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc((player.facing > 0 ? 1 : -1) * 5 - 5, -94 * scale, 3, 0, Math.PI * 2);
        ctx.arc((player.facing > 0 ? 1 : -1) * 5 + 5, -94 * scale, 3, 0, Math.PI * 2);
        ctx.fill();
        if (player.freezeT > 0) {
          ctx.fillStyle = "rgba(186,230,253,0.45)";
          ctx.beginPath();
          ctx.arc(0, -90 * scale, 42 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        if (player.kickCharge > 0.02) {
          ctx.strokeStyle = player.side === "left" ? "rgba(251,146,60,0.9)" : "rgba(56,189,248,0.9)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, -90 * scale, 42 * scale, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * player.kickCharge);
          ctx.stroke();
        }
        ctx.restore();
      };
      drawPlayer(state.player);
      drawPlayer(state.cpu);

      if (state.ball.hotT > 0 || state.ball.speed > 760) {
        ctx.fillStyle = "rgba(251,146,60,0.42)";
        for (let i = 0; i < 4; i += 1) {
          ctx.beginPath();
          ctx.arc(state.ball.x - state.ball.vx * 0.003 * i, state.ball.y - state.ball.vy * 0.003 * i, state.ball.r + 4 - i, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.save();
      ctx.translate(state.ball.x, state.ball.y);
      ctx.rotate(state.ball.spin);
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.arc(0, 0, state.ball.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      state.particles.forEach((p) => {
        ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      ctx.fillStyle = "rgba(15,23,42,0.75)";
      ctx.fillRect(WIDTH * 0.5 - 120, 18, 240, 92);
      ctx.fillStyle = "#f8fafc";
      ctx.textAlign = "center";
      ctx.font = "700 16px Outfit, sans-serif";
      ctx.fillText(`${state.score.you} : ${state.score.cpu}`, WIDTH * 0.5, 44);
      ctx.font = "600 12px Outfit, sans-serif";
      ctx.fillText(`Tiempo ${Math.ceil(state.timer)}s`, WIDTH * 0.5, 62);
      ctx.fillText(`${CPU_PERSONALITY[state.cpuPersonalityId]?.label || "Agresivo"}`, WIDTH * 0.5, 78);
      ctx.fillStyle = "rgba(241,245,249,0.26)";
      ctx.fillRect(WIDTH * 0.5 - 102, 84, 84, 10);
      ctx.fillRect(WIDTH * 0.5 + 18, 84, 84, 10);
      ctx.fillStyle = "#f97316";
      ctx.fillRect(WIDTH * 0.5 - 102, 84, 84 * (state.momentum.left.stacks / MAX_MOMENTUM), 10);
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(WIDTH * 0.5 + 18, 84, 84 * (state.momentum.right.stacks / MAX_MOMENTUM), 10);

      if (state.mode === "start" || state.mode === "finished") {
        ctx.fillStyle = "rgba(2,6,23,0.58)";
        ctx.fillRect(WIDTH * 0.5 - 245, HEIGHT * 0.5 - 84, 490, 168);
        ctx.strokeStyle = "rgba(241,245,249,0.58)";
        ctx.strokeRect(WIDTH * 0.5 - 245, HEIGHT * 0.5 - 84, 490, 168);
        ctx.fillStyle = "#f8fafc";
        ctx.font = "700 26px Bricolage Grotesque, sans-serif";
        ctx.fillText(state.mode === "start" ? "Head Soccer Arena X" : "Partido finalizado", WIDTH * 0.5, HEIGHT * 0.5 - 30);
        ctx.font = "600 14px Outfit, sans-serif";
        ctx.fillText(state.message, WIDTH * 0.5, HEIGHT * 0.5 + 2);
        ctx.fillText("Enter iniciar | Flechas mover/saltar | Space mantener/cargar tiro", WIDTH * 0.5, HEIGHT * 0.5 + 30);
        ctx.fillText("Doble toque izquierda/derecha para dash | B habilidad", WIDTH * 0.5, HEIGHT * 0.5 + 50);
      }
    };

    const tick = (time) => {
      if (!prevRef.current) prevRef.current = time;
      let delta = time - prevRef.current;
      prevRef.current = time;
      delta = clamp(delta, 0, 40);
      accRef.current += delta;
      while (accRef.current >= STEP_MS) {
        step(stateRef.current, inputRef.current, STEP_MS / 1000, (cue) => audioRef.current?.play(cue));
        inputRef.current.jump = false;
        inputRef.current.kickRelease = false;
        inputRef.current.ability = false;
        inputRef.current.dashLeft = false;
        inputRef.current.dashRight = false;
        inputRef.current.start = false;
        inputRef.current.restart = false;
        accRef.current -= STEP_MS;
      }
      draw(time);
      setSnapshot(snapshotOf(stateRef.current));
      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameRef.current);
  }, []);

  const buildTextPayload = useCallback((current) => ({
    mode: "head_soccer_arcade",
    coordinates: "origin_top_left_x_right_y_down",
    status: current.mode,
    difficulty: current.difficultyId,
    stadium: current.stadiumId,
    score: current.score,
    timer: current.timer,
    cpuPersonality: { id: current.cpuPersonalityId, label: current.cpuPersonalityLabel },
    momentum: current.momentum,
    playerCharacter: { id: current.playerCharacterId, name: current.playerCharacterName, ability: current.playerAbilityLabel, cooldown: current.playerCooldown },
    cpuCharacter: { id: current.cpuCharacterId, name: current.cpuCharacterName, ability: current.cpuAbilityLabel, cooldown: current.cpuCooldown },
    player: current.player,
    cpu: current.cpu,
    ball: current.ball,
    particles: current.particles,
    message: current.message,
    logs: current.logs
  }), []);

  const advanceTime = useCallback((ms) => {
    const loops = Math.max(1, Math.round(ms / STEP_MS));
    for (let i = 0; i < loops; i += 1) {
      step(stateRef.current, inputRef.current, STEP_MS / 1000, () => {});
      inputRef.current.jump = false;
      inputRef.current.kickRelease = false;
      inputRef.current.ability = false;
      inputRef.current.dashLeft = false;
      inputRef.current.dashRight = false;
      inputRef.current.start = false;
      inputRef.current.restart = false;
    }
    setSnapshot(snapshotOf(stateRef.current));
  }, []);

  useGameRuntimeBridge(snapshot, buildTextPayload, advanceTime);

  const playerEnergy = useMemo(() => {
    const c = CHAR[snapshot.playerCharacterId] || CHAR.blaze;
    return clamp(1 - snapshot.playerCooldown / c.cd, 0, 1) * 100;
  }, [snapshot.playerCharacterId, snapshot.playerCooldown]);
  const cpuEnergy = useMemo(() => {
    const c = CHAR[snapshot.cpuCharacterId] || CHAR.frost;
    return clamp(1 - snapshot.cpuCooldown / c.cd, 0, 1) * 100;
  }, [snapshot.cpuCharacterId, snapshot.cpuCooldown]);
  const playerChargePercent = clamp((snapshot.player?.charge || 0) * 100, 0, 100);
  const momentumYouPercent = clamp(((snapshot.momentum?.you?.stacks || 0) / MAX_MOMENTUM) * 100, 0, 100);
  const momentumCpuPercent = clamp(((snapshot.momentum?.cpu?.stacks || 0) / MAX_MOMENTUM) * 100, 0, 100);

  const hold = (key, value) => {
    inputRef.current[key] = value;
    audioRef.current?.unlock();
  };

  const triggerDash = () => {
    const axis = inputRef.current.right ? 1 : inputRef.current.left ? -1 : stateRef.current.ball.x >= stateRef.current.player.x ? 1 : -1;
    if (axis < 0) inputRef.current.dashLeft = true;
    else inputRef.current.dashRight = true;
    audioRef.current?.play("dash");
  };

  return (
    <div className="mini-game head-soccer-game">
      <div className="mini-head">
        <div>
          <h4>Head Soccer Arena X</h4>
          <p>Futbol 1v1 arcade con dash, tiro cargado, momentum e IA con personalidad.</p>
        </div>
        <div className="head-soccer-actions">
          <button type="button" onClick={() => { inputRef.current.start = true; audioRef.current?.play("start"); }}>{snapshot.mode === "start" ? "Start match" : "Continue"}</button>
          <button type="button" onClick={() => { inputRef.current.restart = true; audioRef.current?.play("start"); }}>Restart</button>
        </div>
      </div>

      <div className="head-soccer-config">
        <label htmlFor="hs-character">Personaje
          <select id="hs-character" value={snapshot.playerCharacterId} onChange={(event) => applyConfig({ playerCharacterId: event.target.value })}>
            {Object.values(CHAR).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label htmlFor="hs-difficulty">Dificultad IA
          <select id="hs-difficulty" value={snapshot.difficultyId} onChange={(event) => applyConfig({ difficultyId: event.target.value })}>
            {Object.values(DIFFICULTY).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label htmlFor="hs-stadium">Escenario
          <select id="hs-stadium" value={snapshot.stadiumId} onChange={(event) => applyConfig({ stadiumId: event.target.value })}>
            {Object.values(STADIUM).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
      </div>

      <div className="status-row">
        <span className={`status-pill ${snapshot.mode}`}>{snapshot.mode}</span>
        <span>Marcador: {snapshot.score.you} - {snapshot.score.cpu}</span>
        <span>Tiempo: {Math.ceil(snapshot.timer)}s</span>
        <span>CPU IA: {snapshot.cpuPersonalityLabel}</span>
        <span>Momentum: YOU {snapshot.momentum.you.stacks} | CPU {snapshot.momentum.cpu.stacks}</span>
      </div>

      <div className="meter-stack">
        <div className="meter-line compact">
          <p>Energia habilidad YOU</p>
          <div className="meter-track"><span className="meter-fill player" style={{ width: `${playerEnergy}%` }} /></div>
          <strong>{Math.round(playerEnergy)}%</strong>
        </div>
        <div className="meter-line compact">
          <p>Energia habilidad CPU</p>
          <div className="meter-track"><span className="meter-fill enemy" style={{ width: `${cpuEnergy}%` }} /></div>
          <strong>{Math.round(cpuEnergy)}%</strong>
        </div>
        <div className="meter-line compact">
          <p>Carga de tiro YOU</p>
          <div className="meter-track"><span className="meter-fill race" style={{ width: `${playerChargePercent}%` }} /></div>
          <strong>{Math.round(playerChargePercent)}%</strong>
        </div>
        <div className="meter-line compact">
          <p>Momentum YOU/CPU</p>
          <div className="meter-track"><span className="meter-fill player" style={{ width: `${momentumYouPercent}%` }} /></div>
          <div className="meter-track"><span className="meter-fill enemy" style={{ width: `${momentumCpuPercent}%` }} /></div>
          <strong>{snapshot.momentum.you.stacks} / {snapshot.momentum.cpu.stacks}</strong>
        </div>
      </div>

      <div className="phaser-canvas-shell">
        <div className="phaser-canvas-host">
          <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} aria-label="Canvas de futbol arcade 1v1" />
        </div>
      </div>

      <div className="phaser-controls">
        <button type="button" onMouseDown={() => hold("left", true)} onMouseUp={() => hold("left", false)} onMouseLeave={() => hold("left", false)} onTouchStart={() => hold("left", true)} onTouchEnd={() => hold("left", false)} onTouchCancel={() => hold("left", false)}>Left</button>
        <button type="button" onMouseDown={() => hold("right", true)} onMouseUp={() => hold("right", false)} onMouseLeave={() => hold("right", false)} onTouchStart={() => hold("right", true)} onTouchEnd={() => hold("right", false)} onTouchCancel={() => hold("right", false)}>Right</button>
        <button type="button" onClick={() => { inputRef.current.jump = true; audioRef.current?.play("jump"); }}>Jump</button>
        <button type="button" onMouseDown={() => hold("kickHold", true)} onMouseUp={releaseKickHold} onMouseLeave={releaseKickHold} onTouchStart={() => hold("kickHold", true)} onTouchEnd={releaseKickHold} onTouchCancel={releaseKickHold}>Kick Hold</button>
        <button type="button" onClick={triggerDash}>Dash</button>
        <button type="button" onClick={() => { inputRef.current.ability = true; audioRef.current?.play("ability"); }}>Ability</button>
      </div>

      <p className="game-message">
        {snapshot.message} Controles: flechas izquierda/derecha, flecha arriba para salto, Space mantener para cargar tiro y soltar para disparar, doble toque izquierda/derecha para dash, B para habilidad, Enter para iniciar.
      </p>
      <ul className="game-log">
        {snapshot.logs.map((entry, index) => <li key={`${entry}-${index}`}>{entry}</li>)}
      </ul>
    </div>
  );
}

export default HeadSoccerGame;
