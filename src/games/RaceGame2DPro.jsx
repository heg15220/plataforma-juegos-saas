import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import "./RaceGame2DPro.css";

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: Utilities
// ─────────────────────────────────────────────────────────────────────────────

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const wrap01 = (x) => ((x % 1) + 1) % 1;
const angNorm = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const signedAngleDiff = (from, to) => angNorm(to - from);

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return [
    0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
    0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: ENVIRONMENTS
// ─────────────────────────────────────────────────────────────────────────────

const ENVIRONMENTS = {
  "neon-city": {
    name: { es: "Neon City", en: "Neon City" },
    roadColor: "#12122a", borderColor: "#00f5ff", glowColor: "#00f5ff",
    bgColor: "#060610", grassColor: "#0a0a1e", centerLineColor: "rgba(255,255,255,0.08)",
    starfield: false,
  },
  "volcano": {
    name: { es: "Volcán Ridge", en: "Volcano Ridge" },
    roadColor: "#1f0a00", borderColor: "#ff4500", glowColor: "#ff6a00",
    bgColor: "#0d0400", grassColor: "#1a0600", centerLineColor: "rgba(255,80,0,0.1)",
    starfield: false,
  },
  "arctic": {
    name: { es: "Ártico", en: "Arctic" },
    roadColor: "#0d1b2e", borderColor: "#a8e0ff", glowColor: "#c8f0ff",
    bgColor: "#050d14", grassColor: "#0a1420", centerLineColor: "rgba(168,224,255,0.1)",
    starfield: false,
  },
  "jungle": {
    name: { es: "Jungla", en: "Jungle" },
    roadColor: "#0a1a0a", borderColor: "#39ff14", glowColor: "#50ff25",
    bgColor: "#040d04", grassColor: "#0d1a08", centerLineColor: "rgba(57,255,20,0.1)",
    starfield: false,
  },
  "desert": {
    name: { es: "Desierto", en: "Desert" },
    roadColor: "#1a1208", borderColor: "#ffd700", glowColor: "#ffea50",
    bgColor: "#0d0a04", grassColor: "#1a1304", centerLineColor: "rgba(255,215,0,0.1)",
    starfield: false,
  },
  "space": {
    name: { es: "Espacio", en: "Space" },
    roadColor: "#06061c", borderColor: "#bf00ff", glowColor: "#d400ff",
    bgColor: "#020208", grassColor: "#050510", centerLineColor: "rgba(191,0,255,0.1)",
    starfield: true,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: TRACKS (18 tracks — 3 per environment)
// ─────────────────────────────────────────────────────────────────────────────

const TRACKS = [
  // ── neon-city ──────────────────────────────────────────────────────────────
  {
    id: 0, envId: "neon-city", layout: "flow",
    name: { es: "Neon Loop", en: "Neon Loop" },
    trackWidth: 48,
    raw: [
      [-1.7, 0.1], [-1.2, -0.8], [-0.3, -1.1], [0.5, -1.0],
      [1.3, -0.6], [1.6, 0.1], [1.2, 0.8], [0.2, 1.1],
      [-0.7, 1.0], [-1.3, 0.5],
    ],
  },
  {
    id: 1, envId: "neon-city", layout: "technical",
    name: { es: "Neon Circuit", en: "Neon Circuit" },
    trackWidth: 42,
    raw: [
      [-1.6, 0.0], [-1.5, -0.5], [-1.1, -0.9], [-0.6, -1.1],
      [0.0, -0.9], [0.4, -0.4], [0.8, -0.8], [1.3, -1.0],
      [1.6, -0.5], [1.5, 0.3], [1.0, 0.8], [0.3, 1.0],
      [-0.5, 0.7],
    ],
  },
  {
    id: 2, envId: "neon-city", layout: "oval",
    name: { es: "Neon Speedway", en: "Neon Speedway" },
    trackWidth: 52,
    raw: [
      [-1.7, -0.35], [-1.7, 0.35], [-1.3, 0.80],
      [0.0, 0.80], [1.3, 0.80], [1.7, 0.35],
      [1.7, -0.35], [1.3, -0.80], [0.0, -0.80], [-1.3, -0.80],
    ],
  },

  // ── volcano ────────────────────────────────────────────────────────────────
  {
    id: 3, envId: "volcano", layout: "flow",
    name: { es: "Magma Flow", en: "Magma Flow" },
    trackWidth: 46,
    raw: [
      [-1.5, 0.2], [-1.3, -0.7], [-0.6, -1.2], [0.3, -1.1],
      [1.1, -0.7], [1.5, 0.0], [1.2, 0.8], [0.4, 1.2],
      [-0.5, 1.1], [-1.2, 0.7],
    ],
  },
  {
    id: 4, envId: "volcano", layout: "technical",
    name: { es: "Crater Run", en: "Crater Run" },
    trackWidth: 40,
    raw: [
      [-1.5, 0.0], [-1.4, -0.6], [-0.9, -1.0], [-0.3, -1.2],
      [0.2, -0.8], [0.0, -0.3], [0.5, 0.1], [1.0, -0.5],
      [1.5, -0.9], [1.6, -0.2], [1.3, 0.6], [0.7, 1.0],
      [0.0, 1.1], [-0.7, 0.9], [-1.3, 0.5],
    ],
  },
  {
    id: 5, envId: "volcano", layout: "oval",
    name: { es: "Lava Strip", en: "Lava Strip" },
    trackWidth: 50,
    raw: [
      [-1.8, -0.3], [-1.8, 0.3], [-1.4, 0.75],
      [0.0, 0.75], [1.4, 0.75], [1.8, 0.3],
      [1.8, -0.3], [1.4, -0.75], [0.0, -0.75], [-1.4, -0.75],
    ],
  },

  // ── arctic ─────────────────────────────────────────────────────────────────
  {
    id: 6, envId: "arctic", layout: "flow",
    name: { es: "Ice Drift", en: "Ice Drift" },
    trackWidth: 48,
    raw: [
      [-1.6, 0.1], [-1.1, -0.9], [-0.1, -1.2], [0.9, -0.9],
      [1.5, -0.1], [1.4, 0.8], [0.5, 1.2], [-0.6, 1.1],
      [-1.4, 0.6],
    ],
  },
  {
    id: 7, envId: "arctic", layout: "technical",
    name: { es: "Frozen Maze", en: "Frozen Maze" },
    trackWidth: 38,
    raw: [
      [-1.5, 0.0], [-1.4, -0.55], [-0.9, -0.9], [-0.4, -1.1],
      [0.1, -0.7], [-0.1, -0.2], [0.4, 0.2], [0.9, -0.4],
      [1.4, -0.8], [1.6, -0.1], [1.4, 0.7], [0.7, 1.1],
      [-0.3, 1.0],
    ],
  },
  {
    id: 8, envId: "arctic", layout: "oval",
    name: { es: "Polar Oval", en: "Polar Oval" },
    trackWidth: 54,
    raw: [
      [-1.75, -0.32], [-1.75, 0.32], [-1.35, 0.78],
      [0.0, 0.78], [1.35, 0.78], [1.75, 0.32],
      [1.75, -0.32], [1.35, -0.78], [0.0, -0.78], [-1.35, -0.78],
    ],
  },

  // ── jungle ─────────────────────────────────────────────────────────────────
  {
    id: 9, envId: "jungle", layout: "flow",
    name: { es: "Jungle Run", en: "Jungle Run" },
    trackWidth: 46,
    raw: [
      [-1.6, 0.2], [-1.4, -0.6], [-0.8, -1.1], [-0.1, -1.3],
      [0.7, -1.0], [1.3, -0.4], [1.5, 0.3], [1.1, 0.9],
      [0.3, 1.2], [-0.5, 1.0], [-1.2, 0.6],
    ],
  },
  {
    id: 10, envId: "jungle", layout: "technical",
    name: { es: "Canopy Chase", en: "Canopy Chase" },
    trackWidth: 40,
    raw: [
      [-1.5, 0.0], [-1.4, -0.5], [-0.8, -1.0], [-0.2, -1.2],
      [0.3, -0.8], [0.1, -0.3], [0.6, 0.1], [1.1, -0.4],
      [1.5, -0.8], [1.6, -0.1], [1.3, 0.6], [0.6, 1.0],
      [-0.1, 1.1],
    ],
  },
  {
    id: 11, envId: "jungle", layout: "oval",
    name: { es: "Jungle Sprint", en: "Jungle Sprint" },
    trackWidth: 50,
    raw: [
      [-1.55, -0.30], [-1.55, 0.30], [-1.15, 0.70],
      [0.0, 0.70], [1.15, 0.70], [1.55, 0.30],
      [1.55, -0.30], [1.15, -0.70], [0.0, -0.70], [-1.15, -0.70],
    ],
  },

  // ── desert ─────────────────────────────────────────────────────────────────
  {
    id: 12, envId: "desert", layout: "flow",
    name: { es: "Sahara Drift", en: "Sahara Drift" },
    trackWidth: 55,
    raw: [
      [-1.7, 0.15], [-1.4, -0.75], [-0.5, -1.2], [0.5, -1.1],
      [1.4, -0.6], [1.7, 0.1], [1.3, 0.9], [0.3, 1.2],
      [-0.6, 1.1], [-1.4, 0.65],
    ],
  },
  {
    id: 13, envId: "desert", layout: "technical",
    name: { es: "Dune Maze", en: "Dune Maze" },
    trackWidth: 42,
    raw: [
      [-1.6, 0.0], [-1.5, -0.5], [-1.1, -0.9], [-0.6, -1.2],
      [-0.1, -0.9], [0.2, -0.4], [0.7, -0.7], [1.1, -1.1],
      [1.5, -0.7], [1.6, -0.1], [1.4, 0.6], [1.0, 1.0],
      [0.4, 1.1], [-0.2, 0.9], [-0.8, 1.1], [-1.4, 0.6],
    ],
  },
  {
    id: 14, envId: "desert", layout: "oval",
    name: { es: "Desert Storm", en: "Desert Storm" },
    trackWidth: 58,
    raw: [
      [-1.85, -0.30], [-1.85, 0.30], [-1.45, 0.80],
      [0.0, 0.80], [1.45, 0.80], [1.85, 0.30],
      [1.85, -0.30], [1.45, -0.80], [0.0, -0.80], [-1.45, -0.80],
    ],
  },

  // ── space ──────────────────────────────────────────────────────────────────
  {
    id: 15, envId: "space", layout: "flow",
    name: { es: "Orbital Ring", en: "Orbital Ring" },
    trackWidth: 48,
    raw: [
      [-1.6, 0.0], [-1.3, -0.85], [-0.4, -1.2], [0.5, -1.1],
      [1.3, -0.6], [1.6, 0.2], [1.2, 0.9], [0.2, 1.2],
      [-0.6, 1.0], [-1.3, 0.55],
    ],
  },
  {
    id: 16, envId: "space", layout: "technical",
    name: { es: "Station Grid", en: "Station Grid" },
    trackWidth: 38,
    raw: [
      [-1.5, 0.0], [-1.5, -0.6], [-1.0, -1.0], [-0.4, -1.2],
      [0.1, -0.8], [-0.1, -0.2], [0.5, 0.1], [0.9, -0.5],
      [1.4, -0.9], [1.6, -0.2], [1.5, 0.6], [0.9, 1.0],
      [0.2, 1.1], [-0.5, 0.8], [-1.2, 0.6],
    ],
  },
  {
    id: 17, envId: "space", layout: "oval",
    name: { es: "Hyperdrive", en: "Hyperdrive" },
    trackWidth: 55,
    raw: [
      [-1.80, -0.30], [-1.80, 0.30], [-1.40, 0.78],
      [0.0, 0.78], [1.40, 0.78], [1.80, 0.30],
      [1.80, -0.30], [1.40, -0.78], [0.0, -0.78], [-1.40, -0.78],
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: AI profiles, weather profiles, physics constants
// ─────────────────────────────────────────────────────────────────────────────

const AI_PROFILES = {
  easy:   { speedFactor: 0.78, lineOffset: 0.55, brakeMargin: 1.45, errorRate: 0.18,  errorMag: 0.4,  turboUse: 0.00, apexPrecision: 0.6  },
  medium: { speedFactor: 0.91, lineOffset: 0.28, brakeMargin: 1.10, errorRate: 0.05,  errorMag: 0.18, turboUse: 0.25, apexPrecision: 0.82 },
  hard:   { speedFactor: 1.00, lineOffset: 0.08, brakeMargin: 0.88, errorRate: 0.008, errorMag: 0.05, turboUse: 0.75, apexPrecision: 0.97 },
};

const WEATHER_PROFILES = {
  dry:  { label: { es: "Seco",       en: "Dry"   }, icon: "☀️",  gripMult: 1.00, rainOverlay: false },
  rain: { label: { es: "Lluvia",     en: "Rain"  }, icon: "🌧️", gripMult: 0.72, rainOverlay: true  },
  dusk: { label: { es: "Crepúsculo", en: "Dusk"  }, icon: "🌅",  gripMult: 0.90, rainOverlay: false },
};

const PHYS = {
  MAX_SPEED: 420, ACCEL: 340, BRAKE_DECEL: 700, NATURAL_DECEL: 60,
  STEER_RATE: 3.2, GRIP_BASE: 9.5,
  TURBO_BOOST: 190, TURBO_DURATION: 1.8, TURBO_COOLDOWN: 6.0,
  TURBO_FILL_RATE: 0.13, NEAR_MISS_BONUS: 0.20,
  CAR_RADIUS: 14,
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: Track engine — buildTrack and query functions
// ─────────────────────────────────────────────────────────────────────────────

function buildTrack(trackDef, canvasW, canvasH) {
  const SAMPLES = 800;
  const raw = trackDef.raw;
  const n = raw.length;
  const scaleX = canvasW * 0.42;
  const scaleY = canvasH * 0.42;
  const pts = raw.map(([x, y]) => [canvasW / 2 + x * scaleX, canvasH / 2 + y * scaleY]);

  const samples = [];
  for (let i = 0; i < SAMPLES; i++) {
    const t = i / SAMPLES;
    const seg = t * n;
    const idx = Math.floor(seg);
    const frac = seg - idx;
    const p0 = pts[(idx - 1 + n) % n], p1 = pts[idx % n];
    const p2 = pts[(idx + 1) % n],     p3 = pts[(idx + 2) % n];
    const [x, y] = catmullRom(p0, p1, p2, p3, frac);
    samples.push({ x, y, ang: 0, curvature: 0, speedLimit: PHYS.MAX_SPEED });
  }

  // Angles
  for (let i = 0; i < SAMPLES; i++) {
    const next = samples[(i + 1) % SAMPLES], prev = samples[(i - 1 + SAMPLES) % SAMPLES];
    samples[i].ang = Math.atan2(next.y - prev.y, next.x - prev.x);
  }

  // Curvature and speed limit
  for (let i = 0; i < SAMPLES; i++) {
    const prev = samples[(i - 1 + SAMPLES) % SAMPLES], next = samples[(i + 1) % SAMPLES];
    const da = Math.abs(angNorm(next.ang - prev.ang));
    samples[i].curvature = da;
    samples[i].speedLimit = PHYS.MAX_SPEED * clamp(1 - da * 3.5, 0.30, 1.0);
  }

  let totalLength = 0;
  for (let i = 0; i < SAMPLES; i++) {
    const next = samples[(i + 1) % SAMPLES];
    totalLength += Math.hypot(next.x - samples[i].x, next.y - samples[i].y);
  }

  return { samples, totalLength, startS: 0.03, trackWidth: trackDef.trackWidth || 48 };
}

function sampleTrackAt(track, s) {
  const s01 = wrap01(s);
  const idx = s01 * track.samples.length;
  const i0 = Math.floor(idx) % track.samples.length;
  const i1 = (i0 + 1) % track.samples.length;
  const frac = idx - Math.floor(idx);
  const a = track.samples[i0], b = track.samples[i1];
  return {
    x: lerp(a.x, b.x, frac),
    y: lerp(a.y, b.y, frac),
    ang: a.ang + signedAngleDiff(a.ang, b.ang) * frac,
    curvature: lerp(a.curvature, b.curvature, frac),
    speedLimit: lerp(a.speedLimit, b.speedLimit, frac),
  };
}

function closestS(track, x, y) {
  let bestDist = Infinity, bestS = 0;
  const step = Math.max(1, Math.floor(track.samples.length / 80));
  for (let i = 0; i < track.samples.length; i += step) {
    const s = track.samples[i];
    const d = Math.hypot(s.x - x, s.y - y);
    if (d < bestDist) { bestDist = d; bestS = i / track.samples.length; }
  }
  return bestS;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: Car creation and physics
// ─────────────────────────────────────────────────────────────────────────────

function createCar(id, isPlayer, color, aiDifficulty) {
  return {
    id, isPlayer, color,
    x: 0, y: 0, a: 0, vx: 0, vy: 0, speed: 0, s: 0,
    lap: 1, finished: false, finishTime: null, finishOrder: null,
    turbo: 0, turboActive: false, turboCooldown: 0, turboTimeLeft: 0,
    spawnGrace: 1.5,
    trail: [], sparks: [],
    aiProfile: isPlayer ? null : AI_PROFILES[aiDifficulty],
    ai: isPlayer ? null : {
      t: 0, noiseSeed: Math.random() * 9999,
      lineOffset: (Math.random() - 0.5) * 0.4,
      prevErr: 0,
    },
  };
}

function addSparks(sparks, x, y, color) {
  for (let i = 0; i < 5; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = 40 + Math.random() * 80;
    sparks.push({
      x, y, color,
      vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      life: 0.35 + Math.random() * 0.25, maxLife: 0.6,
    });
  }
}

function updateSparks(sparks, dt) {
  for (let i = sparks.length - 1; i >= 0; i--) {
    sparks[i].x += sparks[i].vx * dt;
    sparks[i].y += sparks[i].vy * dt;
    sparks[i].life -= dt;
    if (sparks[i].life <= 0) sparks.splice(i, 1);
  }
}

function updateCar(car, dt, input, track, weatherProfile, allCars, startLocked) {
  if (car.finished) return;
  if (startLocked && car.isPlayer) return;

  const grip = PHYS.GRIP_BASE * weatherProfile.gripMult;
  let turboBonus = 0;
  if (car.turboActive) {
    car.turboTimeLeft -= dt;
    turboBonus = PHYS.TURBO_BOOST;
    if (car.turboTimeLeft <= 0) {
      car.turboActive = false;
      car.turboCooldown = PHYS.TURBO_COOLDOWN;
    }
  }
  if (car.turboCooldown > 0) car.turboCooldown -= dt;

  const maxSpeed = (PHYS.MAX_SPEED + turboBonus) * (car.aiProfile ? car.aiProfile.speedFactor : 1);

  if (input.throttle > 0) car.speed += PHYS.ACCEL * dt * input.throttle;
  else if (input.brake > 0) car.speed -= PHYS.BRAKE_DECEL * dt * input.brake;
  else car.speed -= PHYS.NATURAL_DECEL * dt;
  car.speed = clamp(car.speed, 0, maxSpeed);

  const steerEffect = input.steer * PHYS.STEER_RATE * clamp(car.speed / PHYS.MAX_SPEED, 0.1, 1);
  car.a += steerEffect * dt;

  car.vx = lerp(car.vx, Math.cos(car.a) * car.speed, grip * dt);
  car.vy = lerp(car.vy, Math.sin(car.a) * car.speed, grip * dt);
  car.x += car.vx * dt;
  car.y += car.vy * dt;
  car.speed = Math.hypot(car.vx, car.vy);

  // Constrain to track
  const tw = track.trackWidth / 2 + 6;
  const cs = closestS(track, car.x, car.y);
  const closest = sampleTrackAt(track, cs);
  const dx = car.x - closest.x, dy = car.y - closest.y;
  const dist = Math.hypot(dx, dy);
  if (dist > tw) {
    const over = dist - tw;
    car.x -= (dx / dist) * over * 0.88;
    car.y -= (dy / dist) * over * 0.88;
    car.speed *= 0.86; car.vx *= 0.86; car.vy *= 0.86;
  }

  // Car-car collisions
  if (car.spawnGrace <= 0) {
    for (const other of allCars) {
      if (other.id === car.id || other.spawnGrace > 0) continue;
      const cdx = car.x - other.x, cdy = car.y - other.y;
      const cd = Math.hypot(cdx, cdy);
      const minD = PHYS.CAR_RADIUS * 2;
      if (cd < minD && cd > 0.5) {
        const push = (minD - cd) / 2;
        car.x += (cdx / cd) * push; car.y += (cdy / cd) * push;
        car.speed *= 0.80; car.vx *= 0.80; car.vy *= 0.80;
        addSparks(car.sparks, car.x, car.y, car.color);
      }
    }
  }
  if (car.spawnGrace > 0) car.spawnGrace -= dt;

  // Update s
  const newS = closestS(track, car.x, car.y);
  const ds = wrap01(newS - car.s + 0.5) - 0.5;
  if (ds > 0) car.s = newS;

  // Near-miss turbo bonus and turbo fill (player only)
  if (car.isPlayer) {
    for (const other of allCars) {
      if (other.id === car.id) continue;
      const nd = Math.hypot(car.x - other.x, car.y - other.y);
      if (nd < PHYS.CAR_RADIUS * 3.5 && nd > PHYS.CAR_RADIUS * 2.2) {
        car.turbo = Math.min(1, car.turbo + PHYS.NEAR_MISS_BONUS * dt * 5);
      }
    }
    if (!car.turboActive && car.turboCooldown <= 0 && car.speed > 50) {
      car.turbo = Math.min(1, car.turbo + PHYS.TURBO_FILL_RATE * dt);
    }
  }

  // Trail
  car.trail.unshift({ x: car.x, y: car.y, a: car.a });
  if (car.trail.length > 28) car.trail.pop();
}

function computeAiInput(car, track, weatherProfile) {
  const prof = car.aiProfile;
  const ai = car.ai;
  ai.t += 0.016;

  const lookahead = 0.025 + (car.speed / PHYS.MAX_SPEED) * 0.055;
  const targetS = wrap01(car.s + lookahead);
  const target = sampleTrackAt(track, targetS);

  // Racing line offset
  const nx = -Math.sin(target.ang), ny = Math.cos(target.ang);
  const lateralOff = (Math.sin(ai.t * 0.35 + ai.noiseSeed) * 0.5 + ai.lineOffset) * prof.lineOffset * track.trackWidth;
  const tx = target.x + nx * lateralOff;
  const ty = target.y + ny * lateralOff;

  let angleDiff = angNorm(Math.atan2(ty - car.y, tx - car.x) - car.a);
  if (Math.random() < prof.errorRate) angleDiff += (Math.random() - 0.5) * prof.errorMag * 2;
  const steer = clamp(angleDiff * 2.8, -1, 1);

  // Target speed
  const curveLook = sampleTrackAt(track, wrap01(car.s + 0.05));
  const targetSpeed = curveLook.speedLimit * prof.speedFactor * weatherProfile.gripMult;
  const brakeThreshold = targetSpeed * prof.brakeMargin;

  let throttle = 0, brake = 0;
  if (car.speed < targetSpeed - 8) throttle = 1;
  else if (car.speed > brakeThreshold) brake = 1;
  else throttle = 0.5;

  const useTurbo = Math.random() < prof.turboUse &&
    car.turbo > 0.75 &&
    curveLook.curvature < 0.018 &&
    !car.turboActive &&
    car.turboCooldown <= 0;

  return { throttle, brake, steer, useTurbo };
}

function checkLapCross(car, prevS, totalLaps, onFinish) {
  const crossed = prevS > 0.85 && car.s < 0.15;
  if (!crossed) return;
  if (car.lap >= totalLaps) {
    car.finished = true;
    car.finishTime = performance.now();
    onFinish(car);
  } else {
    car.lap++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7: Canvas rendering pipeline
// ─────────────────────────────────────────────────────────────────────────────

function renderBackground(ctx, w, h, env, weatherProfile, starfield, time) {
  ctx.fillStyle = env.bgColor;
  ctx.fillRect(0, 0, w, h);

  if (starfield && starfield.length) {
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    for (const s of starfield) {
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    }
  }

  if (weatherProfile.rainOverlay) {
    ctx.save();
    ctx.strokeStyle = "rgba(140,190,255,0.16)";
    ctx.lineWidth = 1;
    const off = (time * 280) % 55;
    for (let x = -60; x < w + 60; x += 11) {
      ctx.beginPath();
      ctx.moveTo(x + off, 0);
      ctx.lineTo(x + off + 28, h);
      ctx.stroke();
    }
    ctx.restore();
  }

  if (weatherProfile.id === "dusk") {
    const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.15, w / 2, h / 2, h * 0.85);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(25,12,0,0.50)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}

function renderTrack(ctx, track, env) {
  const samples = track.samples;
  const N = samples.length;
  const hw = track.trackWidth / 2;

  // Road surface
  ctx.beginPath();
  ctx.strokeStyle = env.roadColor;
  ctx.lineWidth = track.trackWidth + 4;
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  for (let i = 0; i <= N; i++) {
    const s = samples[i % N];
    i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y);
  }
  ctx.stroke();

  // Dashed center line
  ctx.setLineDash([16, 13]);
  ctx.strokeStyle = env.centerLineColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const s = samples[i % N];
    i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Neon borders with glow
  ctx.save();
  ctx.shadowBlur = 20; ctx.shadowColor = env.glowColor;
  ctx.strokeStyle = env.borderColor; ctx.lineWidth = 2.5;

  // Left border
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const s = samples[i % N];
    const nx = -Math.sin(s.ang) * hw, ny = Math.cos(s.ang) * hw;
    i === 0 ? ctx.moveTo(s.x + nx, s.y + ny) : ctx.lineTo(s.x + nx, s.y + ny);
  }
  ctx.stroke();

  // Right border
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const s = samples[i % N];
    const nx = Math.sin(s.ang) * hw, ny = -Math.cos(s.ang) * hw;
    i === 0 ? ctx.moveTo(s.x + nx, s.y + ny) : ctx.lineTo(s.x + nx, s.y + ny);
  }
  ctx.stroke();
  ctx.restore();

  // Finish line (checkerboard dots) at startS
  const finIdx = Math.floor(0.03 * N);
  const fs = samples[finIdx];
  ctx.save();
  for (let i = 0; i < 10; i++) {
    const t = i / 10 - 0.5;
    ctx.fillStyle = i % 2 === 0 ? "#fff" : "#222";
    const fx = fs.x + (-Math.sin(fs.ang) * hw) * (2 * t + 0.1);
    const fy = fs.y + (Math.cos(fs.ang) * hw) * (2 * t + 0.1);
    ctx.beginPath(); ctx.arc(fx, fy, 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function renderStartGrid(ctx, cars, phase, phaseTimer, env) {
  if (phase === "go" || phase === "racing") return;
  const alpha = phase === "fading" ? Math.max(0, 1 - phaseTimer / 0.55) : 1.0;
  ctx.save();
  ctx.globalAlpha = alpha * 0.75;
  ctx.strokeStyle = env.borderColor;
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 10; ctx.shadowColor = env.borderColor;
  for (const car of cars) {
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.a);
    ctx.strokeRect(-17, -10, 34, 20);
    ctx.restore();
  }
  ctx.restore();
}

function renderCar(ctx, car, isPlayer) {
  if (!car) return;

  // Trail
  for (let i = 0; i < car.trail.length; i++) {
    const t = car.trail[i];
    const alpha = (1 - i / car.trail.length) * (isPlayer ? 0.40 : 0.25);
    const rx = Math.max(0.1, 8 - i * 0.25);
    const ry = Math.max(0.1, 4.5 - i * 0.1);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(t.x, t.y); ctx.rotate(t.a);
    ctx.fillStyle = car.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Turbo extra trail
  if (car.turboActive) {
    ctx.save();
    ctx.translate(car.x, car.y); ctx.rotate(car.a);
    ctx.globalAlpha = 0.65;
    ctx.shadowBlur = 22; ctx.shadowColor = car.color;
    ctx.fillStyle = car.color;
    ctx.beginPath();
    ctx.ellipse(-18, 0, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Car body
  ctx.save();
  ctx.translate(car.x, car.y); ctx.rotate(car.a);
  if (isPlayer) { ctx.shadowBlur = 18; ctx.shadowColor = car.color; }

  // Main body
  ctx.fillStyle = car.color;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-13, -7.5, 26, 15, 4);
  else ctx.rect(-13, -7.5, 26, 15);
  ctx.fill();

  // Cabin
  ctx.fillStyle = "rgba(0,0,0,0.60)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-4, -5, 13, 10, 3);
  else ctx.rect(-4, -5, 13, 10);
  ctx.fill();

  // Wheels
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillRect(-10, -9, 5, 3);
  ctx.fillRect(-10, 6, 5, 3);
  ctx.fillRect(6, -9, 5, 3);
  ctx.fillRect(6, 6, 5, 3);

  // Headlights
  ctx.fillStyle = isPlayer ? "#ffffff" : "rgba(255,255,200,0.85)";
  ctx.beginPath();
  ctx.ellipse(13, -4.5, 2.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(13, 4.5, 2.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Number on roof
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "bold 7px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(car.id === 0 ? "P" : String(car.id), 1, 2.5);

  ctx.restore();

  // Sparks
  for (const s of car.sparks) {
    const alpha = s.life / s.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = s.color;
    ctx.shadowBlur = 8; ctx.shadowColor = s.color;
    ctx.beginPath(); ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

function renderMinimap(ctx, track, cars, w, h) {
  ctx.fillStyle = "rgba(4,4,12,0.92)";
  ctx.fillRect(0, 0, w, h);

  // Bounding box of track
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const s of track.samples) {
    if (s.x < minX) minX = s.x; if (s.x > maxX) maxX = s.x;
    if (s.y < minY) minY = s.y; if (s.y > maxY) maxY = s.y;
  }
  const pad = 7;
  const sc = Math.min((w - pad * 2) / (maxX - minX || 1), (h - pad * 2) / (maxY - minY || 1));
  const ox = pad + ((w - pad * 2) - (maxX - minX) * sc) / 2 - minX * sc;
  const oy = pad + ((h - pad * 2) - (maxY - minY) * sc) / 2 - minY * sc;

  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 3; ctx.lineJoin = "round";
  ctx.beginPath();
  for (let i = 0; i <= track.samples.length; i++) {
    const s = track.samples[i % track.samples.length];
    i === 0 ? ctx.moveTo(s.x * sc + ox, s.y * sc + oy) : ctx.lineTo(s.x * sc + ox, s.y * sc + oy);
  }
  ctx.stroke();

  for (const car of cars) {
    ctx.save();
    ctx.shadowBlur = car.isPlayer ? 8 : 0;
    ctx.shadowColor = car.color;
    ctx.fillStyle = car.color;
    ctx.beginPath();
    ctx.arc(car.x * sc + ox, car.y * sc + oy, car.isPlayer ? 3.5 : 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8: TrackPreviewCanvas auxiliary component
// ─────────────────────────────────────────────────────────────────────────────

function TrackPreviewCanvas({ track, active }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = (canvas.offsetWidth || 80) * dpr;
    const H = (canvas.offsetHeight || 60) * dpr;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    const env = ENVIRONMENTS[track.envId];
    ctx.fillStyle = env.bgColor;
    ctx.fillRect(0, 0, W, H);

    const pts = track.raw;
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const pad2 = 0.15;
    const sc2 = Math.min(W * (1 - pad2 * 2) / (maxX - minX || 1), H * (1 - pad2 * 2) / (maxY - minY || 1));
    const ox2 = W / 2 - ((maxX + minX) / 2) * sc2;
    const oy2 = H / 2 - ((maxY + minY) / 2) * sc2;

    ctx.shadowBlur = 8; ctx.shadowColor = env.borderColor;
    ctx.strokeStyle = active ? env.borderColor : "rgba(255,255,255,0.30)";
    ctx.lineWidth = 2.5; ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.beginPath();
    for (let i = 0; i <= pts.length; i++) {
      const p = pts[i % pts.length];
      const px = p[0] * sc2 + ox2, py = p[1] * sc2 + oy2;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.stroke();
  }, [track, active]);

  return <canvas ref={ref} className="r2p__trackPreview" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 9: Main RaceGame2DPro component
// ─────────────────────────────────────────────────────────────────────────────

const CAR_COLORS = [
  "#00f5ff", "#ff4500", "#39ff14", "#ffd700",
  "#bf00ff", "#ff69b4", "#00bfff", "#ff8c00",
];

export default function RaceGame2DPro() {
  const lang = navigator.language?.startsWith("es") ? "es" : "en";

  const T = {
    es: {
      title: "Race 2D Pro", subtitle: "18 circuitos · 3 dificultades · Turbo · Clima",
      selectTrack: "Circuito", selectDifficulty: "Dificultad IA",
      selectWeather: "Clima", selectLaps: "Vueltas", selectRivals: "Rivales",
      easy: "Fácil", medium: "Medio", hard: "Difícil",
      startRace: "Iniciar Carrera",
      raceOver: "¡Carrera Terminada!", restart: "Reiniciar",
      backToSetup: "⚙ Setup",
      posLabel: "POS", lapLabel: "VUELTA", speedUnit: "km/h",
      you: "Tú", rival: "Rival",
      laps: "Vueltas", rivals: "Rivales",
      keyHint: "↑↓ Acelerar/Frenar · ←→ Girar · SPACE Turbo · R Reiniciar",
    },
    en: {
      title: "Race 2D Pro", subtitle: "18 circuits · 3 difficulties · Turbo · Weather",
      selectTrack: "Circuit", selectDifficulty: "AI Difficulty",
      selectWeather: "Weather", selectLaps: "Laps", selectRivals: "Rivals",
      easy: "Easy", medium: "Medium", hard: "Hard",
      startRace: "Start Race",
      raceOver: "Race Over!", restart: "Restart",
      backToSetup: "⚙ Setup",
      posLabel: "POS", lapLabel: "LAP", speedUnit: "km/h",
      you: "You", rival: "Rival",
      laps: "Laps", rivals: "Rivals",
      keyHint: "↑↓ Throttle/Brake · ←→ Steer · SPACE Turbo · R Restart",
    },
  };
  const t = T[lang];

  // ── State ──────────────────────────────────────────────────────────────────
  const [screen, setScreen] = useState("setup");
  const [selectedTrackId, setSelectedTrackId] = useState(0);
  const [aiDifficulty, setAiDifficulty] = useState("medium");
  const [weatherKey, setWeatherKey] = useState("dry");
  const [laps, setLaps] = useState(3);
  const [rivals, setRivals] = useState(5);
  const [hud, setHud] = useState({
    pos: 1, total: 6, lap: 1, totalLaps: 3,
    speed: 0, turbo: 0, turboActive: false, weatherIcon: "☀️",
  });
  const [semaphore, setSemaphore] = useState({ phase: "off", lights: [false, false, false] });
  const [joyKnob, setJoyKnob] = useState({ dx: 0, dy: 0 });
  const [endData, setEndData] = useState(null);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const canvasRef = useRef(null);
  const minimapRef = useRef(null);
  const rafRef = useRef(null);
  const lastRef = useRef(performance.now());
  const gameRef = useRef(null);
  const keysRef = useRef(new Set());
  const inputRef = useRef({ throttle: 0, brake: 0, steer: 0, touchThrottle: false, touchBrake: false });
  const joyRef = useRef({ active: false, pointerId: null, cx: 0, cy: 0, dx: 0, dy: 0 });
  const starfieldRef = useRef([]);
  const frameCountRef = useRef(0);

  // ── startRace ──────────────────────────────────────────────────────────────
  const startRace = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const W = (canvas.clientWidth || 800) * dpr;
    const H = (canvas.clientHeight || 600) * dpr;
    canvas.width = W;
    canvas.height = H;

    const trackDef = TRACKS[selectedTrackId];
    const track = buildTrack(trackDef, W, H);
    const env = ENVIRONMENTS[trackDef.envId];
    const weather = WEATHER_PROFILES[weatherKey];
    const totalCars = rivals + 1;

    // Generate starfield if needed
    if (env.starfield) {
      const stars = [];
      for (let i = 0; i < 180; i++) {
        stars.push({ x: Math.random() * W, y: Math.random() * H, r: 0.5 + Math.random() * 1.5 });
      }
      starfieldRef.current = stars;
    } else {
      starfieldRef.current = [];
    }

    // Create cars
    const cars = [];
    for (let i = 0; i < totalCars; i++) {
      const isPlayer = i === 0;
      const color = CAR_COLORS[i % CAR_COLORS.length];
      cars.push(createCar(i, isPlayer, color, aiDifficulty));
    }

    // Position cars on start grid (2 per row, staggered behind startS)
    const startPt = sampleTrackAt(track, track.startS);
    const perpX = -Math.sin(startPt.ang);
    const perpY = Math.cos(startPt.ang);
    const backX = -Math.cos(startPt.ang);
    const backY = -Math.sin(startPt.ang);
    const rowSpacing = 36;
    const lateralSpacing = track.trackWidth * 0.28;

    for (let i = 0; i < cars.length; i++) {
      const row = Math.floor(i / 2);
      const col = i % 2 === 0 ? -0.5 : 0.5;
      const car = cars[i];
      car.x = startPt.x + perpX * col * lateralSpacing - backX * row * rowSpacing;
      car.y = startPt.y + perpY * col * lateralSpacing - backY * row * rowSpacing;
      car.a = startPt.ang;
      car.s = closestS(track, car.x, car.y);
    }

    gameRef.current = {
      cars,
      track,
      trackDef,
      env,
      weather,
      weatherKey,
      totalLaps: laps,
      startPhase: "countdown",
      startTimer: 0,
      countdownStep: 0,
      phaseTimer: 0,
      finishOrder: [],
      time: 0,
      _raceStartTime: null,
      _endTriggered: false,
    };

    frameCountRef.current = 0;
    keysRef.current.clear();
    inputRef.current = { throttle: 0, brake: 0, steer: 0, touchThrottle: false, touchBrake: false };
    joyRef.current = { active: false, pointerId: null, cx: 0, cy: 0, dx: 0, dy: 0 };

    setEndData(null);
    setScreen("race");
    setSemaphore({ phase: "countdown", lights: [false, false, false] });
  }, [selectedTrackId, aiDifficulty, weatherKey, laps, rivals]);

  // ── Touch handlers ─────────────────────────────────────────────────────────
  const onJoyStart = useCallback((e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    joyRef.current = { active: true, pointerId: e.pointerId, cx, cy, dx: 0, dy: 0 };
  }, []);

  const onJoyMove = useCallback((e) => {
    const joy = joyRef.current;
    if (!joy.active || e.pointerId !== joy.pointerId) return;
    const rawDx = e.clientX - joy.cx;
    const rawDy = e.clientY - joy.cy;
    const maxR = 45;
    const dist = Math.hypot(rawDx, rawDy);
    const clamped = dist > maxR ? maxR / dist : 1;
    const dx = rawDx * clamped;
    const dy = rawDy * clamped;
    joyRef.current.dx = dx;
    joyRef.current.dy = dy;
    setJoyKnob({ dx, dy });
  }, []);

  const onJoyEnd = useCallback((e) => {
    if (e.pointerId !== joyRef.current.pointerId) return;
    joyRef.current = { active: false, pointerId: null, cx: 0, cy: 0, dx: 0, dy: 0 };
    setJoyKnob({ dx: 0, dy: 0 });
  }, []);

  const onTouchThrottle = useCallback((val) => {
    inputRef.current.touchThrottle = val;
  }, []);

  const onTouchBrake = useCallback((val) => {
    inputRef.current.touchBrake = val;
  }, []);

  const onTouchTurbo = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    const player = g.cars.find(c => c.isPlayer);
    if (!player) return;
    if (player.turbo >= 0.25 && !player.turboActive && player.turboCooldown <= 0) {
      player.turboActive = true;
      player.turboTimeLeft = PHYS.TURBO_DURATION;
      player.turbo = 0;
    }
  }, []);

  // ── Game loop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "race") return;

    const canvas = canvasRef.current;
    const minimap = minimapRef.current;
    if (!canvas || !minimap) return;

    const dpr = window.devicePixelRatio || 1;

    // Resize handler
    const resize = () => {
      const W = canvas.clientWidth * dpr;
      const H = canvas.clientHeight * dpr;
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
        const g = gameRef.current;
        if (g) {
          const newTrack = buildTrack(g.trackDef, W, H);
          g.track = newTrack;
          for (const car of g.cars) {
            const sp = sampleTrackAt(newTrack, car.s);
            car.x = sp.x; car.y = sp.y;
          }
        }
      }
    };
    window.addEventListener("resize", resize);

    // Minimap canvas
    const MM_W = 92, MM_H = 72;
    minimap.width = MM_W * dpr;
    minimap.height = MM_H * dpr;
    const mmCtx = minimap.getContext("2d");
    mmCtx.scale(dpr, dpr);

    // Keyboard listeners
    const onKeyDown = (e) => {
      keysRef.current.add(e.code);
      if (e.code === "Space") {
        e.preventDefault();
        const g = gameRef.current;
        if (!g) return;
        const player = g.cars.find(c => c.isPlayer);
        if (!player) return;
        if (player.turbo >= 0.25 && !player.turboActive && player.turboCooldown <= 0) {
          player.turboActive = true;
          player.turboTimeLeft = PHYS.TURBO_DURATION;
          player.turbo = 0;
        }
      }
      if (e.code === "KeyR") startRace();
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
      }
    };
    const onKeyUp = (e) => {
      keysRef.current.delete(e.code);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    lastRef.current = performance.now();

    // ── RAF loop ────────────────────────────────────────────────────────────
    const loop = (now) => {
      rafRef.current = requestAnimationFrame(loop);

      const rawDt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      const dt = Math.min(rawDt, 0.05);

      const g = gameRef.current;
      if (!g) return;

      const ctx = canvas.getContext("2d");
      const W = canvas.width, H = canvas.height;

      g.time += dt;
      frameCountRef.current++;

      // ── Countdown / semaphore ─────────────────────────────────────────────
      if (g.startPhase === "countdown") {
        g.startTimer += dt;
        if (g.startTimer >= 0.85 * (g.countdownStep + 1)) {
          g.countdownStep++;
          if (g.countdownStep <= 3) {
            const lights = [false, false, false];
            for (let i = 0; i < g.countdownStep; i++) lights[i] = true;
            setSemaphore({ phase: "countdown", lights });
          } else {
            g.startPhase = "fading";
            g.phaseTimer = 0;
            setSemaphore({ phase: "go", lights: [false, false, false] });
          }
        }
      } else if (g.startPhase === "fading") {
        g.phaseTimer += dt;
        if (g.phaseTimer >= 0.55) {
          g.startPhase = "racing";
          g._raceStartTime = performance.now();
          setSemaphore({ phase: "off", lights: [false, false, false] });
        }
      }

      const startLocked = g.startPhase === "countdown" || g.startPhase === "fading";

      // ── Keyboard / joystick input ─────────────────────────────────────────
      const keys = keysRef.current;
      const joy = joyRef.current;
      const inp = inputRef.current;

      let throttle = 0, brake = 0, steer = 0;

      if (joy.active) {
        throttle = clamp(-joy.dy / 42, 0, 1);
        brake = clamp(joy.dy / 42, 0, 1);
        steer = clamp(joy.dx / 42, -1, 1);
      } else {
        if (keys.has("ArrowUp") || keys.has("KeyW")) throttle = 1;
        if (keys.has("ArrowDown") || keys.has("KeyS")) brake = 1;
        if (keys.has("ArrowLeft") || keys.has("KeyA")) steer = -1;
        if (keys.has("ArrowRight") || keys.has("KeyD")) steer = 1;
      }

      if (inp.touchThrottle) throttle = 1;
      if (inp.touchBrake) brake = 1;

      const playerInput = { throttle, brake, steer };

      // ── Update cars ───────────────────────────────────────────────────────
      for (const car of g.cars) {
        const prevS = car.s;
        let carInput;

        if (car.isPlayer) {
          carInput = startLocked ? { throttle: 0, brake: 0, steer: 0 } : playerInput;
        } else {
          if (g.startPhase === "racing") {
            const aiIn = computeAiInput(car, g.track, g.weather);
            carInput = aiIn;
            if (aiIn.useTurbo) {
              car.turboActive = true;
              car.turboTimeLeft = PHYS.TURBO_DURATION;
              car.turbo = 0;
            }
            // AI turbo fill
            if (!car.turboActive && car.turboCooldown <= 0 && car.speed > 50) {
              car.turbo = Math.min(1, car.turbo + PHYS.TURBO_FILL_RATE * dt * 0.6);
            }
          } else {
            // Slight creep AI during countdown
            carInput = { throttle: 0.05, brake: 0, steer: 0 };
          }
        }

        updateCar(car, dt, carInput, g.track, g.weather, g.cars, startLocked);
        updateSparks(car.sparks, dt);

        // Lap crossing
        if (g.startPhase === "racing") {
          checkLapCross(car, prevS, g.totalLaps, (finishedCar) => {
            finishedCar.finishOrder = g.finishOrder.length + 1;
            g.finishOrder.push(finishedCar.id);
          });
        }
      }

      // ── Render ────────────────────────────────────────────────────────────
      ctx.save();
      renderBackground(ctx, W, H, g.env, g.weather, starfieldRef.current, g.time);
      renderTrack(ctx, g.track, g.env);
      renderStartGrid(ctx, g.cars, g.startPhase, g.phaseTimer, g.env);

      const playerCar = g.cars.find(c => c.isPlayer);
      for (const car of g.cars) {
        if (!car.isPlayer) renderCar(ctx, car, false);
      }
      if (playerCar) renderCar(ctx, playerCar, true);
      ctx.restore();

      // ── Minimap ───────────────────────────────────────────────────────────
      mmCtx.save();
      renderMinimap(mmCtx, g.track, g.cars, MM_W, MM_H);
      mmCtx.restore();

      // ── HUD update (every ~8 frames) ──────────────────────────────────────
      if (frameCountRef.current % 8 === 0 && playerCar) {
        const playerProgress = (playerCar.lap - 1) + playerCar.s;
        let pos = 1;
        for (const car of g.cars) {
          if (car.id === playerCar.id) continue;
          const otherProgress = (car.lap - 1) + car.s;
          if (otherProgress > playerProgress) pos++;
        }
        setHud({
          pos,
          total: g.cars.length,
          lap: playerCar.lap,
          totalLaps: g.totalLaps,
          speed: Math.round(playerCar.speed * 0.36),
          turbo: playerCar.turbo,
          turboActive: playerCar.turboActive,
          weatherIcon: g.weather.icon,
        });
      }

      // ── End detection ─────────────────────────────────────────────────────
      if (g.startPhase === "racing" && !g._endTriggered) {
        const playerFinished = playerCar && playerCar.finished;
        const allFinished = g.cars.every(c => c.finished);

        if (playerFinished || allFinished) {
          g._endTriggered = true;

          const unfinished = g.cars.filter(c => !c.finished);
          unfinished.sort((a, b) => {
            const pa = (a.lap - 1) + a.s;
            const pb = (b.lap - 1) + b.s;
            return pb - pa;
          });

          const ordered = [
            ...g.finishOrder.map(id => g.cars.find(c => c.id === id)),
            ...unfinished,
          ].filter(Boolean);

          const raceStartMs = g._raceStartTime || performance.now();
          const leaderboard = ordered.map((car, i) => {
            let timeStr = "--:--.-";
            if (car.finishTime) {
              const elapsed = (car.finishTime - raceStartMs) / 1000;
              const mins = Math.floor(elapsed / 60);
              const secs = (elapsed % 60).toFixed(1).padStart(4, "0");
              timeStr = `${mins}:${secs}`;
            }
            return {
              pos: i + 1,
              isPlayer: car.isPlayer,
              color: car.color,
              time: timeStr,
            };
          });

          setEndData(leaderboard);
          setTimeout(() => setScreen("end"), 800);
        }
      }
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", resize);
    };
  }, [screen, startRace]);

  // ── JSX ────────────────────────────────────────────────────────────────────

  // Setup screen
  if (screen === "setup") {
    return (
      <div className="r2p">
        <div className="r2p__setup">
          <div className="r2p__setupCard">
            <div className="r2p__setupHeader">
              <div>
                <div className="r2p__setupTitle">🏁 {t.title}</div>
                <div className="r2p__setupSub">{t.subtitle}</div>
              </div>
            </div>
            <div className="r2p__setupDivider" />

            <div className="r2p__sectionLabel">{t.selectTrack}</div>
            <div className="r2p__trackGrid">
              {TRACKS.map(tr => (
                <div
                  key={tr.id}
                  className={`r2p__trackCard${selectedTrackId === tr.id ? " isActive" : ""}`}
                  onClick={() => setSelectedTrackId(tr.id)}
                >
                  <TrackPreviewCanvas track={tr} active={selectedTrackId === tr.id} />
                  <div className="r2p__trackName">{tr.name[lang]}</div>
                  <div className="r2p__trackEnv">{ENVIRONMENTS[tr.envId].name[lang]}</div>
                  <div className="r2p__trackLayout">{tr.layout}</div>
                </div>
              ))}
            </div>

            <div className="r2p__optionsRow">
              {/* Weather */}
              <div className="r2p__optBlock">
                <div className="r2p__sectionLabel">{t.selectWeather}</div>
                <div className="r2p__choiceGroup">
                  {Object.entries(WEATHER_PROFILES).map(([k, w]) => (
                    <button
                      key={k}
                      className={`r2p__choiceBtn${weatherKey === k ? " isActive" : ""}`}
                      onClick={() => setWeatherKey(k)}
                      type="button"
                    >
                      {w.icon} {w.label[lang]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="r2p__optBlock">
                <div className="r2p__sectionLabel">{t.selectDifficulty}</div>
                <div className="r2p__choiceGroup">
                  {["easy", "medium", "hard"].map(d => (
                    <button
                      key={d}
                      type="button"
                      className={`r2p__choiceBtn diff-${d}${aiDifficulty === d ? " isActive" : ""}`}
                      onClick={() => setAiDifficulty(d)}
                    >
                      {t[d]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Laps */}
              <div className="r2p__optBlock">
                <div className="r2p__sectionLabel">{t.laps}</div>
                <div className="r2p__choiceGroup">
                  {[3, 5, 7].map(n => (
                    <button
                      key={n}
                      type="button"
                      className={`r2p__choiceBtn${laps === n ? " isActive" : ""}`}
                      onClick={() => setLaps(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rivals */}
              <div className="r2p__optBlock">
                <div className="r2p__sectionLabel">{t.rivals}</div>
                <div className="r2p__choiceGroup">
                  {[3, 5, 7].map(n => (
                    <button
                      key={n}
                      type="button"
                      className={`r2p__choiceBtn${rivals === n ? " isActive" : ""}`}
                      onClick={() => setRivals(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button className="r2p__startBtn" onClick={startRace} type="button">
              {t.startRace} ▶
            </button>
          </div>
        </div>
      </div>
    );
  }

  // End screen
  if (screen === "end") {
    return (
      <div className="r2p">
        <div className="r2p__endOverlay">
          <div className="r2p__endCard">
            <div className="r2p__endTitle">🏁 {t.raceOver}</div>
            <table className="r2p__endTable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{lang === "es" ? "Piloto" : "Driver"}</th>
                  <th>{lang === "es" ? "Tiempo" : "Time"}</th>
                </tr>
              </thead>
              <tbody>
                {(endData || []).map(row => (
                  <tr key={row.pos} className={row.isPlayer ? "isPlayer" : ""}>
                    <td>
                      <span className="r2p__endPosIcon">
                        {row.pos === 1 ? "🥇" : row.pos === 2 ? "🥈" : row.pos === 3 ? "🥉" : row.pos}
                      </span>
                    </td>
                    <td>
                      <span
                        className="r2p__endColorDot"
                        style={{ background: row.color, boxShadow: `0 0 5px ${row.color}` }}
                      />
                      {row.isPlayer ? t.you : `${t.rival} ${row.pos}`}
                    </td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="r2p__endBtns">
              <button className="r2p__endBtnPrimary" type="button" onClick={startRace}>
                {t.restart} ↺
              </button>
              <button className="r2p__endBtnSecondary" type="button" onClick={() => setScreen("setup")}>
                {t.backToSetup}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Race screen
  return (
    <div className="r2p">
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />

      {/* HUD */}
      <div className="r2p__hud">
        <div className="r2p__hudPanel">
          <div className="r2p__hudPos">
            {hud.pos}<sub>/{hud.total}</sub>
          </div>
          <div className="r2p__hudPosLabel">{t.posLabel}</div>
          <div className="r2p__hudLap">{t.lapLabel} {hud.lap}/{hud.totalLaps}</div>
          <div className="r2p__hudSpeed">{hud.speed} {t.speedUnit}</div>
          <div className="r2p__hudWeather">{hud.weatherIcon}</div>
          <div className="r2p__turboRow">
            <span className="r2p__turboLabel">TURBO</span>
            <div className="r2p__turboBar">
              <div
                className={`r2p__turboFill${hud.turboActive ? " active" : ""}`}
                style={{ width: `${hud.turbo * 100}%` }}
              />
            </div>
          </div>
        </div>
        <div className="r2p__minimapWrap">
          <canvas ref={minimapRef} className="r2p__minimapCanvas" />
        </div>
      </div>

      {/* Semaphore */}
      {semaphore.phase !== "off" && (
        <div className="r2p__semaphore">
          <div className="r2p__semLights">
            {semaphore.lights.map((on, i) => (
              <div key={i} className={`r2p__semLight${on ? " on-red" : ""}`} />
            ))}
          </div>
          {semaphore.phase === "go" && <div className="r2p__semGo">GO!</div>}
        </div>
      )}

      {/* Touch controls */}
      <div className="r2p__touch">
        <div
          className="r2p__joystick"
          onPointerDown={onJoyStart}
          onPointerMove={onJoyMove}
          onPointerUp={onJoyEnd}
          onPointerCancel={onJoyEnd}
        >
          <div
            className="r2p__joystickKnob"
            style={{
              transform: `translate(calc(-50% + ${joyKnob.dx}px), calc(-50% + ${joyKnob.dy}px))`,
            }}
          />
        </div>
        <div className="r2p__touchRight">
          <button
            className="r2p__touchTurbo"
            type="button"
            onPointerDown={onTouchTurbo}
          >
            TURBO
          </button>
          <button
            className="r2p__touchBtn"
            type="button"
            onPointerDown={() => onTouchThrottle(true)}
            onPointerUp={() => onTouchThrottle(false)}
            onPointerCancel={() => onTouchThrottle(false)}
          >
            ⬆
          </button>
          <button
            className="r2p__touchBtn"
            type="button"
            onPointerDown={() => onTouchBrake(true)}
            onPointerUp={() => onTouchBrake(false)}
            onPointerCancel={() => onTouchBrake(false)}
          >
            ⬇
          </button>
        </div>
      </div>

      <div className="r2p__keyHint">{t.keyHint}</div>
    </div>
  );
}
