import React, { useCallback, useEffect, useRef, useState } from "react";
import useGameRuntimeBridge from "../utils/useGameRuntimeBridge";

const WIDTH = 960;
const HEIGHT = 420;
const CEILING_Y = 28;
const GROUND_Y = 346;
const SCREEN_PLAYER_X = 240;
const START_X = 180;
const PLAYER_W = 34;
const PLAYER_H = 34;
const BASE_SPEED = 314;
const MAX_SPEED = 420;
const GRAVITY = 2300;
const JUMP_VELOCITY = -760;
const COYOTE = 0.095;
const INVULN = 1.05;
const BPM = 132;
const BEAT = 60 / BPM;
const PERFECT_WINDOW = 0.09;
const MAX_CHARGE = 3;
const BASE_SEED = 781357;
const DEFAULT_MSG = "Press START and jump on beat to chain combo.";

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeTrack(seed) {
  const rand = makeRng(seed);
  const obstacles = [];
  const pickups = [];
  let x = 620;
  let id = 0;
  const minLength = 6200;

  while (x < minLength - 320) {
    const p = rand();
    if (p < 0.4) {
      const w = 56 + Math.floor(rand() * 38);
      const h = 70 + Math.floor(rand() * 72);
      obstacles.push({ id: `o-${id++}`, kind: "floor", x, y: GROUND_Y - h, w, h, active: true });
      if (rand() < 0.85) {
        pickups.push({
          id: `p-${id++}`,
          x: x + w * 0.55,
          y: GROUND_Y - 126 - Math.floor(rand() * 84),
          r: 10,
          collected: false,
        });
      }
      x += 210 + Math.floor(rand() * 130);
      continue;
    }

    if (p < 0.72) {
      const w = 58 + Math.floor(rand() * 34);
      const h = 132 + Math.floor(rand() * 86);
      obstacles.push({ id: `o-${id++}`, kind: "ceiling", x, y: CEILING_Y, w, h, active: true });
      if (rand() < 0.76) {
        pickups.push({
          id: `p-${id++}`,
          x: x + w * 0.45,
          y: GROUND_Y - 56 - Math.floor(rand() * 38),
          r: 10,
          collected: false,
        });
      }
      x += 200 + Math.floor(rand() * 122);
      continue;
    }

    const gateW = 32 + Math.floor(rand() * 18);
    const gapTop = 138 + Math.floor(rand() * 60);
    const gapH = 118 + Math.floor(rand() * 42);
    const gapBottom = gapTop + gapH;
    obstacles.push({
      id: `o-${id++}`,
      kind: "gate-ceiling",
      x,
      y: CEILING_Y,
      w: gateW,
      h: Math.max(44, gapTop - CEILING_Y),
      active: true,
    });
    obstacles.push({
      id: `o-${id++}`,
      kind: "gate-floor",
      x,
      y: gapBottom,
      w: gateW,
      h: Math.max(48, GROUND_Y - gapBottom),
      active: true,
    });
    pickups.push({
      id: `p-${id++}`,
      x: x + gateW * 0.5 + 16,
      y: gapTop + gapH * 0.5,
      r: 11,
      collected: false,
    });
    x += 220 + Math.floor(rand() * 126);
  }

  return { obstacles, pickups, length: Math.max(minLength, x + 280) };
}

function initState(seed) {
  const track = makeTrack(seed);
  return {
    mode: "menu",
    elapsed: 0,
    beatTimer: 0,
    beatIndex: 0,
    beatPulse: 0,
    score: 0,
    combo: 0,
    perfectStreak: 0,
    integrity: 3,
    charge: 1.15,
    player: { x: START_X, y: GROUND_Y - PLAYER_H, vy: 0, onGround: true, coyote: COYOTE },
    invuln: 0,
    obstacles: track.obstacles,
    pickups: track.pickups,
    effects: [],
    worldLength: track.length,
    fullscreen: false,
    audioEnabled: true,
    message: DEFAULT_MSG,
    messageTtl: 0,
    lastJump: "none",
  };
}

function playerRect(player) {
  return { x: player.x - PLAYER_W * 0.5, y: player.y, w: PLAYER_W, h: PLAYER_H };
}

function overlapRect(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function overlapCircleRect(circle, rect) {
  const nx = clamp(circle.x, rect.x, rect.x + rect.w);
  const ny = clamp(circle.y, rect.y, rect.y + rect.h);
  const dx = circle.x - nx;
  const dy = circle.y - ny;
  return dx * dx + dy * dy <= circle.r * circle.r;
}

function cameraX(state) {
  return Math.max(0, state.player.x - SCREEN_PLAYER_X);
}

function pushFx(state, x, y, color, r = 18, growth = 170, life = 0.38) {
  state.effects.push({ x, y, color, r, growth, life, maxLife: life });
}

function setMessage(state, msg, ttl = 0.9) {
  state.message = msg;
  state.messageTtl = ttl;
}

function snapshotOf(state) {
  const cam = cameraX(state);
  const progress = clamp((state.player.x - START_X) / Math.max(1, state.worldLength - START_X), 0, 1);
  const nextBeat = Math.max(0, BEAT - state.beatTimer);
  const upcomingObstacles = state.obstacles
    .filter((o) => o.active && o.x + o.w >= state.player.x - 48)
    .slice(0, 6)
    .map((o) => ({
      id: o.id,
      kind: o.kind,
      x: Number(o.x.toFixed(1)),
      y: Number(o.y.toFixed(1)),
      width: Number(o.w.toFixed(1)),
      height: Number(o.h.toFixed(1)),
      distanceFromPlayer: Number((o.x - state.player.x).toFixed(1)),
    }));
  const upcomingOrbs = state.pickups
    .filter((p) => !p.collected && p.x + p.r >= state.player.x - 48)
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      x: Number(p.x.toFixed(1)),
      y: Number(p.y.toFixed(1)),
      radius: p.r,
      distanceFromPlayer: Number((p.x - state.player.x).toFixed(1)),
    }));

  return {
    variant: "pulse-prism-runner",
    status: state.mode,
    message: state.message,
    score: Math.round(state.score),
    combo: state.combo,
    perfectStreak: state.perfectStreak,
    integrity: state.integrity,
    charge: Number(state.charge.toFixed(2)),
    progress: Number((progress * 100).toFixed(2)),
    elapsedSeconds: Number(state.elapsed.toFixed(2)),
    bpm: BPM,
    beatIndex: state.beatIndex,
    nextBeatMs: Math.round(nextBeat * 1000),
    beatPulse: Number(state.beatPulse.toFixed(3)),
    lastJumpRating: state.lastJump,
    player: {
      worldX: Number(state.player.x.toFixed(2)),
      screenX: SCREEN_PLAYER_X,
      y: Number(state.player.y.toFixed(2)),
      vy: Number(state.player.vy.toFixed(2)),
      onGround: state.player.onGround,
      invulnerable: state.invuln > 0,
    },
    worldLength: state.worldLength,
    cameraX: Number(cam.toFixed(2)),
    fullscreen: state.fullscreen,
    audioEnabled: state.audioEnabled,
    upcomingObstacles,
    upcomingOrbs,
  };
}

function draw(ctx, state) {
  const cam = cameraX(state);
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, state.beatPulse > 0.15 ? "#082f49" : "#0f172a");
  sky.addColorStop(1, state.beatPulse > 0.15 ? "#0f766e" : "#134e4a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const farShift = (cam * 0.18) % 180;
  ctx.fillStyle = "rgba(148, 163, 184, 0.24)";
  for (let x = -farShift - 120; x < WIDTH + 200; x += 180) {
    ctx.beginPath();
    ctx.moveTo(x, 286);
    ctx.lineTo(x + 86, 172);
    ctx.lineTo(x + 174, 286);
    ctx.closePath();
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(125, 211, 252, 0.22)";
  const spacing = BASE_SPEED * BEAT;
  const shift = cam % spacing;
  for (let x = -shift; x < WIDTH + spacing; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, CEILING_Y);
    ctx.lineTo(x, GROUND_Y);
    ctx.stroke();
  }

  ctx.fillStyle = "#0b1120";
  ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);
  ctx.fillStyle = "#1e293b";
  for (let x = -((cam * 0.75) % 46); x < WIDTH + 46; x += 46) {
    ctx.fillRect(x, GROUND_Y + 4, 28, 8);
  }

  const finishX = state.worldLength - cam;
  if (finishX > -60 && finishX < WIDTH + 80) {
    ctx.fillStyle = "rgba(250, 204, 21, 0.24)";
    ctx.fillRect(finishX - 8, CEILING_Y, 16, GROUND_Y - CEILING_Y);
    ctx.fillStyle = "#facc15";
    ctx.fillRect(finishX - 3, CEILING_Y, 6, GROUND_Y - CEILING_Y);
  }

  for (const o of state.obstacles) {
    if (!o.active) continue;
    const x = o.x - cam;
    if (x + o.w < -80 || x > WIDTH + 120) continue;
    const isTop = o.kind.includes("ceiling");
    const g = ctx.createLinearGradient(x, o.y, x + o.w, o.y + o.h);
    if (isTop) {
      g.addColorStop(0, "#e0f2fe");
      g.addColorStop(1, "#0284c7");
    } else {
      g.addColorStop(0, "#fde68a");
      g.addColorStop(1, "#d97706");
    }
    const bevel = Math.max(6, Math.min(16, o.w * 0.22));
    ctx.fillStyle = g;
    ctx.strokeStyle = "rgba(15, 23, 42, 0.45)";
    ctx.beginPath();
    if (isTop) {
      ctx.moveTo(x, o.y);
      ctx.lineTo(x + o.w, o.y);
      ctx.lineTo(x + o.w - bevel, o.y + o.h);
      ctx.lineTo(x + bevel, o.y + o.h);
    } else {
      ctx.moveTo(x + bevel, o.y);
      ctx.lineTo(x + o.w - bevel, o.y);
      ctx.lineTo(x + o.w, o.y + o.h);
      ctx.lineTo(x, o.y + o.h);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  for (const p of state.pickups) {
    if (p.collected) continue;
    const x = p.x - cam;
    if (x + p.r < -40 || x > WIDTH + 40) continue;
    ctx.save();
    ctx.translate(x, p.y);
    ctx.rotate((p.x * 0.006) % (Math.PI * 2));
    ctx.fillStyle = "#38bdf8";
    ctx.strokeStyle = "#e0f2fe";
    ctx.beginPath();
    ctx.moveTo(0, -p.r);
    ctx.lineTo(p.r * 0.8, 0);
    ctx.lineTo(0, p.r);
    ctx.lineTo(-p.r * 0.8, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  for (const fx of state.effects) {
    const a = fx.life / fx.maxLife;
    ctx.strokeStyle = `${fx.color}${Math.round(a * 255).toString(16).padStart(2, "0")}`;
    ctx.beginPath();
    ctx.arc(fx.x - cam, fx.y, fx.r, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (!(state.invuln > 0 && Math.floor(state.elapsed * 20) % 2 === 0)) {
    const cx = SCREEN_PLAYER_X;
    const y = state.player.y;
    const cy = y + PLAYER_H * 0.5;
    const t = 4 + Math.min(6, state.combo);
    for (let i = 0; i < t; i += 1) {
      const alpha = 0.26 - i * 0.03;
      ctx.fillStyle = `rgba(125, 211, 252, ${Math.max(0, alpha)})`;
      ctx.fillRect(cx - 18 - i * 9, cy + Math.sin(state.elapsed * 9 + i) * 2, 8, 3);
    }
    const body = ctx.createLinearGradient(cx - PLAYER_W * 0.5, y, cx + PLAYER_W * 0.5, y + PLAYER_H);
    body.addColorStop(0, "#86efac");
    body.addColorStop(1, "#22d3ee");
    ctx.fillStyle = body;
    ctx.strokeStyle = "#0f172a";
    ctx.beginPath();
    ctx.moveTo(cx, y - 8);
    ctx.lineTo(cx + 14, y + 2);
    ctx.lineTo(cx + 15, y + 20);
    ctx.lineTo(cx, y + 30);
    ctx.lineTo(cx - 15, y + 20);
    ctx.lineTo(cx - 14, y + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#e0f2fe";
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  if (state.mode !== "playing") {
    ctx.fillStyle = "rgba(2, 6, 23, 0.52)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    let title = "Pulse Prism Runner";
    let sub = "Press START to begin";
    if (state.mode === "paused") {
      title = "Paused";
      sub = "Press P or RESUME to continue";
    } else if (state.mode === "won") {
      title = "Run Complete";
      sub = "Press START to run a new track";
    } else if (state.mode === "lost") {
      title = "Signal Lost";
      sub = "Press START to retry";
    }
    ctx.textAlign = "center";
    ctx.fillStyle = "#f8fafc";
    ctx.font = "700 42px 'Bricolage Grotesque', sans-serif";
    ctx.fillText(title, WIDTH * 0.5, HEIGHT * 0.44);
    ctx.font = "600 19px 'Bricolage Grotesque', sans-serif";
    ctx.fillStyle = "#bae6fd";
    ctx.fillText(sub, WIDTH * 0.5, HEIGHT * 0.52);
    if (state.mode === "won" || state.mode === "lost") {
      ctx.font = "600 17px 'Bricolage Grotesque', sans-serif";
      ctx.fillStyle = "#fef08a";
      ctx.fillText(`Score ${Math.round(state.score)}`, WIDTH * 0.5, HEIGHT * 0.6);
    }
  }
}

function RhythmPlatformerGame() {
  const canvasRef = useRef(null);
  const shellRef = useRef(null);
  const gameRef = useRef(initState(BASE_SEED));
  const runRef = useRef(0);
  const inputRef = useRef({ jump: false, burst: false });
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const audioRef = useRef({ ctx: null, master: null });
  const [snapshot, setSnapshot] = useState(() => snapshotOf(gameRef.current));

  const drawNow = useCallback((state) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    draw(ctx, state);
  }, []);

  const sync = useCallback(() => setSnapshot(snapshotOf(gameRef.current)), []);

  const ensureAudio = useCallback(() => {
    const state = gameRef.current;
    if (!state.audioEnabled) return null;
    if (!audioRef.current.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      const ctx = new Ctx();
      const master = ctx.createGain();
      master.gain.value = 0.07;
      master.connect(ctx.destination);
      audioRef.current.ctx = ctx;
      audioRef.current.master = master;
    }
    if (audioRef.current.ctx.state === "suspended") {
      audioRef.current.ctx.resume().catch(() => {});
    }
    return audioRef.current.ctx;
  }, []);

  const tone = useCallback((kind, accent = 1) => {
    const state = gameRef.current;
    if (!state.audioEnabled) return;
    const ctx = ensureAudio();
    if (!ctx || !audioRef.current.master) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const now = ctx.currentTime;
    let f = 240;
    let d = 0.08;
    let w = "triangle";
    let v = 0.11;
    if (kind === "beat") { f = accent > 1 ? 124 : 212; d = 0.055; w = "square"; v = 0.06; }
    if (kind === "jump") { f = 410; d = 0.09; v = 0.09; }
    if (kind === "perfect") { f = 640; d = 0.12; w = "sawtooth"; v = 0.11; }
    if (kind === "pickup") { f = 760; d = 0.08; w = "sine"; v = 0.1; }
    if (kind === "burst") { f = 180; d = 0.14; w = "square"; v = 0.13; }
    if (kind === "damage") { f = 140; d = 0.15; w = "sawtooth"; v = 0.13; }
    if (kind === "win") { f = 530; d = 0.22; w = "triangle"; v = 0.14; }
    if (kind === "fail") { f = 110; d = 0.1; w = "square"; v = 0.1; }
    o.type = w;
    o.frequency.setValueAtTime(f, now);
    g.gain.setValueAtTime(v, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + d);
    o.connect(g);
    g.connect(audioRef.current.master);
    o.start(now);
    o.stop(now + d + 0.03);
  }, [ensureAudio]);

  const startRun = useCallback(() => {
    runRef.current += 1;
    const state = initState(BASE_SEED + runRef.current * 97);
    state.mode = "playing";
    setMessage(state, "Sync jumps to beat for PERFECT bonus.", 1.7);
    gameRef.current = state;
    ensureAudio();
    tone("beat", 2);
    drawNow(state);
    sync();
  }, [drawNow, ensureAudio, sync, tone]);

  const togglePause = useCallback(() => {
    const state = gameRef.current;
    if (state.mode === "playing") {
      state.mode = "paused";
      setMessage(state, "Paused");
    } else if (state.mode === "paused") {
      state.mode = "playing";
      setMessage(state, "Back on beat", 0.9);
      ensureAudio();
    }
    drawNow(state);
    sync();
  }, [drawNow, ensureAudio, sync]);

  const toggleAudio = useCallback(() => {
    const state = gameRef.current;
    state.audioEnabled = !state.audioEnabled;
    if (state.audioEnabled) {
      ensureAudio();
      tone("beat");
      setMessage(state, "Audio ON", 0.7);
    } else {
      setMessage(state, "Audio OFF", 0.7);
    }
    sync();
  }, [ensureAudio, sync, tone]);

  const toggleFullscreen = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    } else {
      shell.requestFullscreen?.().catch(() => {});
    }
  }, []);

  const step = useCallback((dt, silent = false) => {
    const s = gameRef.current;
    if (s.mode !== "playing") return;

    s.elapsed += dt;
    s.beatTimer += dt;
    while (s.beatTimer >= BEAT) {
      s.beatTimer -= BEAT;
      s.beatIndex += 1;
      s.beatPulse = 1;
      if (!silent) tone("beat", s.beatIndex % 4 === 0 ? 2 : 1);
    }
    s.beatPulse = Math.max(0, s.beatPulse - dt * 4.1);

    if (s.messageTtl > 0) {
      s.messageTtl = Math.max(0, s.messageTtl - dt);
      if (s.messageTtl === 0) s.message = DEFAULT_MSG;
    }

    if (inputRef.current.jump) {
      if (s.player.onGround || s.player.coyote > 0) {
        const nearest = Math.min(s.beatTimer, Math.abs(BEAT - s.beatTimer));
        const perfect = nearest <= PERFECT_WINDOW;
        s.player.vy = perfect ? JUMP_VELOCITY * 1.08 : JUMP_VELOCITY;
        s.player.onGround = false;
        s.player.coyote = 0;
        if (perfect) {
          s.combo = Math.min(40, s.combo + 1);
          s.perfectStreak += 1;
          s.score += 118 + s.combo * 8;
          s.lastJump = "perfect";
          setMessage(s, "PERFECT jump", 0.7);
          if (!silent) tone("perfect");
        } else {
          s.combo = Math.max(0, s.combo - 1);
          s.perfectStreak = 0;
          s.lastJump = "good";
          if (!silent) tone("jump");
        }
      }
      inputRef.current.jump = false;
    }

    if (inputRef.current.burst) {
      if (s.charge < 1) {
        s.combo = 0;
        s.lastJump = "none";
        setMessage(s, "Not enough pulse charge", 0.7);
        if (!silent) tone("fail");
      } else {
        const target = s.obstacles.find((o) => o.active && o.x + o.w > s.player.x + 8 && o.x - s.player.x < 288);
        if (target) {
          target.active = false;
          s.charge = clamp(s.charge - 1, 0, MAX_CHARGE);
          s.score += 182 + s.combo * 2;
          s.combo = Math.min(40, s.combo + 2);
          pushFx(s, target.x + target.w * 0.5, target.y + target.h * 0.5, "#60a5fa", 22, 210, 0.32);
          setMessage(s, "Pulse burst", 0.62);
          if (!silent) tone("burst");
        } else {
          setMessage(s, "No target in range", 0.6);
          if (!silent) tone("fail");
        }
      }
      inputRef.current.burst = false;
    }

    const speed = Math.min(MAX_SPEED, BASE_SPEED + s.combo * 4.6);
    s.player.x += speed * dt;
    s.score += dt * (18 + s.combo * 1.6);
    s.player.coyote = s.player.onGround ? COYOTE : Math.max(0, s.player.coyote - dt);
    s.player.vy += GRAVITY * dt;
    s.player.y += s.player.vy * dt;
    if (s.player.y < CEILING_Y + 4) {
      s.player.y = CEILING_Y + 4;
      s.player.vy = Math.max(0, s.player.vy);
    }
    if (s.player.y >= GROUND_Y - PLAYER_H) {
      s.player.y = GROUND_Y - PLAYER_H;
      s.player.vy = 0;
      s.player.onGround = true;
    } else {
      s.player.onGround = false;
    }

    s.invuln = Math.max(0, s.invuln - dt);
    const rect = playerRect(s.player);

    for (const p of s.pickups) {
      if (p.collected || p.x < s.player.x - 48) continue;
      if (!overlapCircleRect(p, rect)) continue;
      p.collected = true;
      s.charge = clamp(s.charge + 0.42, 0, MAX_CHARGE);
      s.score += 74 + s.combo * 5;
      s.combo = Math.min(40, s.combo + 1);
      pushFx(s, p.x, p.y, "#e0f2fe", 14, 140, 0.26);
      if (!silent) tone("pickup");
    }

    if (s.invuln <= 0) {
      for (const o of s.obstacles) {
        if (!o.active || o.x + o.w < s.player.x - 12) continue;
        if (o.x - s.player.x > 190) break;
        if (!overlapRect(rect, o)) continue;
        s.integrity -= 1;
        s.combo = 0;
        s.perfectStreak = 0;
        s.charge = clamp(s.charge - 0.4, 0, MAX_CHARGE);
        s.invuln = INVULN;
        s.player.vy = -360;
        pushFx(s, o.x + o.w * 0.5, o.y + o.h * 0.5, "#fb7185", 24, 180, 0.46);
        if (s.integrity <= 0) {
          s.mode = "lost";
          setMessage(s, "Signal lost");
          if (!silent) { tone("damage"); tone("fail"); }
        } else {
          setMessage(s, `Integrity hit - ${s.integrity} left`, 0.95);
          if (!silent) tone("damage");
        }
        break;
      }
    }

    s.effects = s.effects
      .map((fx) => ({ ...fx, life: fx.life - dt, r: fx.r + fx.growth * dt }))
      .filter((fx) => fx.life > 0);

    if (s.mode === "playing" && s.player.x >= s.worldLength) {
      s.mode = "won";
      s.score += 900 + s.integrity * 180 + s.perfectStreak * 40;
      setMessage(s, "Run complete");
      if (!silent) tone("win");
    }
  }, [tone]);

  const advanceTime = useCallback((ms) => {
    let remaining = Math.max(0, Number(ms) || 0);
    while (remaining > 0) {
      const stepMs = Math.min(1000 / 60, remaining);
      step(stepMs / 1000, true);
      remaining -= stepMs;
    }
    drawNow(gameRef.current);
    sync();
  }, [drawNow, step, sync]);

  const buildTextPayload = useCallback((state) => ({
    mode: "rhythm_platformer_original",
    status: state.status,
    coordinateSystem:
      "origin top-left; x grows right, y grows down; worldX uses same axis and camera follows player",
    bpm: state.bpm,
    beat: {
      index: state.beatIndex,
      nextBeatMs: state.nextBeatMs,
      pulse: state.beatPulse,
      perfectWindowMs: Math.round(PERFECT_WINDOW * 1000),
      lastJumpRating: state.lastJumpRating,
    },
    player: state.player,
    score: state.score,
    combo: state.combo,
    perfectStreak: state.perfectStreak,
    integrity: state.integrity,
    charge: state.charge,
    progressPercent: state.progress,
    elapsedSeconds: state.elapsedSeconds,
    cameraX: state.cameraX,
    worldLength: state.worldLength,
    upcomingObstacles: state.upcomingObstacles,
    upcomingOrbs: state.upcomingOrbs,
    message: state.message,
    controls: {
      jump: "Space or ArrowUp",
      burst: "E",
      startRestart: "Enter",
      pause: "P",
      fullscreen: "F",
      audio: "O",
    },
  }), []);

  useGameRuntimeBridge(snapshot, buildTextPayload, advanceTime);

  useEffect(() => {
    drawNow(gameRef.current);
    sync();
  }, [drawNow, sync]);

  useEffect(() => {
    const onFs = () => {
      gameRef.current.fullscreen = Boolean(document.fullscreenElement);
      sync();
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, [sync]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      const code = event.code;
      if (code === "Space" || code === "ArrowUp") {
        event.preventDefault();
        if (!event.repeat) inputRef.current.jump = true;
        return;
      }
      if (code === "KeyE") {
        event.preventDefault();
        if (!event.repeat) inputRef.current.burst = true;
        return;
      }
      if (code === "Enter") {
        event.preventDefault();
        const state = gameRef.current;
        if (state.mode === "playing") return;
        if (state.mode === "paused") togglePause();
        else startRun();
        return;
      }
      if (code === "KeyP") { event.preventDefault(); togglePause(); return; }
      if (code === "KeyF") { event.preventDefault(); toggleFullscreen(); return; }
      if (code === "KeyO") { event.preventDefault(); toggleAudio(); return; }
      if (code === "KeyR") { event.preventDefault(); startRun(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [startRun, toggleAudio, toggleFullscreen, togglePause]);

  useEffect(() => {
    const frame = (ts) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;
      step(dt, false);
      drawNow(gameRef.current);
      sync();
      rafRef.current = window.requestAnimationFrame(frame);
    };
    rafRef.current = window.requestAnimationFrame(frame);
    return () => {
      window.cancelAnimationFrame(rafRef.current);
      lastTsRef.current = 0;
    };
  }, [drawNow, step, sync]);

  useEffect(() => {
    return () => {
      if (audioRef.current.ctx && audioRef.current.ctx.state !== "closed") {
        audioRef.current.ctx.close().catch(() => {});
      }
    };
  }, []);

  const canStart = snapshot.status !== "playing";
  const startLabel =
    snapshot.status === "paused"
      ? "Resume"
      : snapshot.status === "won" || snapshot.status === "lost"
        ? "New run"
        : "Start";

  return (
    <div className="mini-game rhythm-platformer-game">
      <div className="mini-head">
        <div>
          <h4>Pulse Prism Runner</h4>
          <p>
            Original rhythm-action side scroller with custom visuals, procedural synth beat,
            and deterministic QA hooks.
          </p>
        </div>
        <div className="rhythm-runner-toolbar">
          <button
            type="button"
            data-rhythm-start
            onClick={() => (snapshot.status === "paused" ? togglePause() : startRun())}
            disabled={!canStart}
          >
            {startLabel}
          </button>
          <button type="button" onClick={startRun}>Restart</button>
          <button
            type="button"
            onClick={togglePause}
            disabled={snapshot.status !== "playing" && snapshot.status !== "paused"}
          >
            {snapshot.status === "paused" ? "Continue" : "Pause"}
          </button>
          <button type="button" onClick={toggleAudio}>
            {snapshot.audioEnabled ? "Audio ON" : "Audio OFF"}
          </button>
          <button type="button" onClick={toggleFullscreen}>Fullscreen</button>
        </div>
      </div>

      <div className="rhythm-runner-hud">
        <div><span>Status</span><strong>{snapshot.status.toUpperCase()}</strong></div>
        <div><span>Score</span><strong>{snapshot.score}</strong></div>
        <div><span>Combo</span><strong>x{snapshot.combo}</strong></div>
        <div><span>Integrity</span><strong>{snapshot.integrity}/3</strong></div>
        <div><span>Charge</span><strong>{snapshot.charge.toFixed(2)}</strong></div>
        <div><span>Progress</span><strong>{snapshot.progress.toFixed(1)}%</strong></div>
        <div><span>Beat</span><strong>{snapshot.nextBeatMs}ms</strong></div>
      </div>

      <div className="phaser-canvas-shell rhythm-runner-stage-shell" ref={shellRef}>
        <div className="phaser-canvas-host">
          <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} aria-label="Rhythm platformer canvas" />
        </div>
      </div>

      <p className={`rhythm-runner-status mode-${snapshot.status}`}>{snapshot.message}</p>

      <div className="rhythm-runner-touch-controls">
        <button type="button" onClick={() => { inputRef.current.jump = true; }}>Jump</button>
        <button type="button" onClick={() => { inputRef.current.burst = true; }}>Pulse Burst</button>
        <button type="button" onClick={togglePause}>
          {snapshot.status === "paused" ? "Resume" : "Pause"}
        </button>
      </div>

      <p className="rhythm-runner-help">
        Controls: Space/ArrowUp jump, E pulse burst, Enter start/restart, P pause, F fullscreen,
        O audio.
      </p>
    </div>
  );
}

export default RhythmPlatformerGame;
