import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import "./RaceGame2DPro.css";

/**
 * RaceGame2DPro — Canvas 2D (Frontend only)
 * ✅ 18 circuits (15+), multiple environments + different layouts
 * ✅ Grid start + traffic lights + grid boxes disappear after launch
 * ✅ AI difficulty with clear differences (line, braking, apex speed, errors)
 * ✅ Precomputed track plan (samples/curvature/speed profile)
 * ✅ Car-car collisions + track boundary constraint
 * ✅ Keyboard + touch joystick
 * ✅ Desktop leaderboard (canvas) + Mobile leaderboard (DOM)
 */

// ------------------------
// Utils
// ------------------------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const wrap01 = (x) => ((x % 1) + 1) % 1;

const angNorm = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const signedAngleDiff = (from, to) => angNorm(to - from);

const hypot2 = (x, y) => Math.hypot(x, y);

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function hash01(n) {
  const x = Math.sin(n * 999.123 + 0.12345) * 10000;
  return x - Math.floor(x);
}

function getNormalFromAng(ang) {
  return { nx: -Math.sin(ang), ny: Math.cos(ang) };
}

// ------------------------
// Tracks (18)
// Each track: { id, name, env, ccw?, raw:[ [nx,ny]... ] }
// raw is normalized-ish coordinates (will be scaled to screen)
// ------------------------
const TRACKS = [
  // COAST / FLOW
  {
    id: 0,
    env: "coast",
    name: { es: "Azure Coast GP", en: "Azure Coast GP" },
    raw: [
      [-1.55, -0.10],
      [-1.20, -0.70],
      [-0.30, -1.05],
      [0.70, -0.95],
      [1.55, -0.40],
      [1.40, 0.15],
      [0.95, 0.55],
      [0.25, 0.75],
      [-0.20, 0.25],
      [-0.55, 0.65],
      [-1.10, 0.90],
      [-1.55, 0.55],
      [-1.70, 0.10],
    ],
  },
  {
    id: 1,
    env: "forest",
    name: { es: "Greenwood Classic", en: "Greenwood Classic" },
    raw: [
      [-1.55, -0.25],
      [-1.05, -0.90],
      [-0.25, -1.05],
      [0.55, -0.90],
      [1.25, -0.55],
      [1.55, 0.05],
      [1.10, 0.45],
      [0.60, 0.25],
      [0.35, 0.90],
      [-0.35, 0.85],
      [-0.75, 0.35],
      [-1.05, 0.85],
      [-1.55, 0.55],
      [-1.70, 0.05],
    ],
  },
  {
    id: 2,
    env: "desert",
    name: { es: "Dune Switchbacks", en: "Dune Switchbacks" },
    raw: [
      [-1.55, 0.15],
      [-1.15, -0.65],
      [-0.35, -1.05],
      [0.10, -0.55],
      [0.55, -1.00],
      [1.20, -0.65],
      [1.55, 0.05],
      [1.05, 0.30],
      [0.95, 0.75],
      [0.35, 0.55],
      [0.05, 1.00],
      [-0.45, 0.65],
      [-0.90, 1.00],
      [-1.35, 0.55],
      [-1.60, 0.30],
    ],
  },
  // CITY / STREET
  {
    id: 3,
    env: "city",
    name: { es: "Old Town Street", en: "Old Town Street" },
    raw: [
      [-1.60, -0.25],
      [-1.60, -0.95],
      [-0.70, -0.95],
      [-0.70, -0.20],
      [0.35, -0.20],
      [0.35, -1.05],
      [1.55, -1.05],
      [1.55, 0.10],
      [0.85, 0.10],
      [0.85, 0.55],
      [1.30, 0.55],
      [1.30, 0.95],
      [-0.35, 0.95],
      [-0.35, 0.35],
      [-1.05, 0.35],
      [-1.05, -0.25],
    ],
  },
  {
    id: 4,
    env: "canyon",
    name: { es: "Canyon Ring", en: "Canyon Ring" },
    raw: [
      [-1.60, 0.10],
      [-1.15, -0.75],
      [-0.35, -1.05],
      [0.45, -0.70],
      [0.90, -1.05],
      [1.55, -0.35],
      [1.25, 0.15],
      [0.55, 0.35],
      [0.95, 0.80],
      [0.20, 0.95],
      [-0.35, 0.60],
      [-0.70, 0.95],
      [-1.30, 0.65],
      [-1.55, 0.30],
    ],
  },
  {
    id: 5,
    env: "harbor",
    name: { es: "Harbor Sprint", en: "Harbor Sprint" },
    raw: [
      [-1.55, -0.05],
      [-1.15, -0.85],
      [-0.10, -1.05],
      [0.95, -0.85],
      [1.55, -0.20],
      [1.05, 0.05],
      [1.45, 0.25],
      [1.05, 0.45],
      [1.45, 0.70],
      [0.80, 0.95],
      [-0.10, 0.85],
      [-0.95, 0.70],
      [-1.45, 0.30],
      [-1.65, 0.10],
    ],
  },
  // FAST / HIGH SPEED
  {
    id: 6,
    env: "highlands",
    name: { es: "Highlands Flow", en: "Highlands Flow" },
    raw: [
      [-1.55, -0.10],
      [-1.20, -0.80],
      [-0.45, -1.05],
      [0.15, -0.80],
      [0.55, -1.05],
      [1.25, -0.70],
      [1.55, -0.10],
      [1.20, 0.35],
      [0.65, 0.55],
      [0.35, 1.00],
      [-0.25, 0.85],
      [-0.65, 0.55],
      [-1.10, 0.80],
      [-1.55, 0.35],
    ],
  },
  {
    id: 7,
    env: "speedway",
    name: { es: "Silver Speedway", en: "Silver Speedway" },
    raw: [
      [-1.60, 0.00],
      [-1.25, -0.85],
      [-0.20, -1.05],
      [0.95, -0.90],
      [1.55, -0.10],
      [1.30, 0.75],
      [0.30, 1.05],
      [-0.95, 0.85],
      [-1.60, 0.15],
    ],
  },
  // TECHNICAL
  {
    id: 8,
    env: "needle",
    name: { es: "Needle Chicanes", en: "Needle Chicanes" },
    ccw: true,
    raw: [
      [-1.60, -0.10],
      [-1.20, -0.90],
      [-0.25, -1.05],
      [0.45, -0.85],
      [0.10, -0.55],
      [0.55, -0.35],
      [1.55, -0.55],
      [1.25, 0.05],
      [1.55, 0.35],
      [1.15, 0.55],
      [0.65, 0.75],
      [0.20, 0.95],
      [-0.25, 0.75],
      [-0.75, 0.95],
      [-1.25, 0.55],
      [-1.60, 0.25],
    ],
  },
  {
    id: 9,
    env: "complex",
    name: { es: "Complex Carousel", en: "Complex Carousel" },
    raw: [
      [-1.35, -0.15],
      [-1.55, -0.75],
      [-0.80, -1.05],
      [-0.10, -0.80],
      [0.25, -1.05],
      [1.10, -0.75],
      [1.45, -0.05],
      [1.10, 0.35],
      [0.55, 0.05],
      [0.35, 0.55],
      [0.10, 1.00],
      [-0.35, 0.60],
      [-0.75, 1.00],
      [-1.20, 0.55],
      [-1.35, -0.15],
    ],
  },
  {
    id: 10,
    env: "snow",
    name: { es: "Glacier Loop", en: "Glacier Loop" },
    raw: [
      [-1.55, 0.20],
      [-1.15, -0.55],
      [-0.35, -1.00],
      [0.55, -0.85],
      [1.10, -0.35],
      [1.55, 0.10],
      [1.10, 0.65],
      [0.35, 0.95],
      [-0.25, 0.75],
      [-0.75, 0.95],
      [-1.35, 0.65],
      [-1.55, 0.35],
    ],
  },
  // NIGHT / NEON
  {
    id: 11,
    env: "night",
    name: { es: "Neon Night GP", en: "Neon Night GP" },
    raw: [
      [-1.55, -0.20],
      [-1.10, -0.90],
      [-0.20, -1.05],
      [0.55, -0.70],
      [1.05, -1.05],
      [1.55, -0.40],
      [1.30, 0.20],
      [0.65, 0.55],
      [0.20, 0.15],
      [0.00, 0.95],
      [-0.55, 0.65],
      [-1.05, 0.95],
      [-1.55, 0.55],
      [-1.70, 0.05],
    ],
  },
  // RAIN / WET (visual only, physics slightly lower grip)
  {
    id: 12,
    env: "rain",
    name: { es: "Monsoon Circuit", en: "Monsoon Circuit" },
    raw: [
      [-1.60, 0.05],
      [-1.15, -0.80],
      [-0.35, -1.05],
      [0.20, -0.80],
      [0.55, -1.05],
      [1.25, -0.70],
      [1.55, 0.00],
      [1.05, 0.45],
      [0.55, 0.25],
      [0.25, 0.90],
      [-0.40, 0.80],
      [-0.85, 0.50],
      [-1.15, 0.90],
      [-1.60, 0.45],
    ],
  },
  // MIXED
  {
    id: 13,
    env: "island",
    name: { es: "Island Esses", en: "Island Esses" },
    raw: [
      [-1.55, 0.10],
      [-1.10, -0.55],
      [-0.70, -1.05],
      [0.00, -0.70],
      [0.45, -1.05],
      [1.10, -0.70],
      [1.55, -0.10],
      [1.10, 0.40],
      [0.75, 0.10],
      [0.35, 0.55],
      [-0.10, 0.95],
      [-0.55, 0.55],
      [-0.95, 0.95],
      [-1.55, 0.55],
    ],
  },
  {
    id: 14,
    env: "volcano",
    name: { es: "Volcanic Rift", en: "Volcanic Rift" },
    raw: [
      [-1.55, -0.05],
      [-1.20, -0.85],
      [-0.25, -1.05],
      [0.45, -0.65],
      [0.05, -0.35],
      [0.75, -0.15],
      [1.55, -0.55],
      [1.25, 0.05],
      [1.55, 0.45],
      [0.85, 0.95],
      [0.10, 0.70],
      [-0.35, 0.95],
      [-1.05, 0.65],
      [-1.55, 0.25],
    ],
  },
  {
    id: 15,
    env: "metro",
    name: { es: "Metro Hairpins", en: "Metro Hairpins" },
    raw: [
      [-1.60, -0.10],
      [-1.10, -0.95],
      [-0.20, -1.05],
      [0.35, -0.55],
      [0.00, -0.25],
      [0.65, 0.00],
      [1.55, -0.35],
      [1.10, 0.15],
      [1.55, 0.45],
      [0.95, 0.95],
      [0.20, 0.65],
      [-0.35, 0.95],
      [-1.00, 0.55],
      [-1.60, 0.25],
    ],
  },
  {
    id: 16,
    env: "prairie",
    name: { es: "Prairie Long Straights", en: "Prairie Long Straights" },
    raw: [
      [-1.60, -0.05],
      [-1.25, -0.90],
      [-0.05, -1.05],
      [1.15, -0.90],
      [1.55, 0.00],
      [1.15, 0.90],
      [-0.05, 1.05],
      [-1.25, 0.90],
      [-1.60, 0.15],
    ],
  },
  {
    id: 17,
    env: "atelier",
    name: { es: "Atelier Technical", en: "Atelier Technical" },
    ccw: true,
    raw: [
      [-1.55, 0.15],
      [-1.20, -0.60],
      [-0.55, -1.05],
      [0.15, -0.85],
      [0.55, -1.05],
      [1.25, -0.65],
      [1.55, 0.05],
      [1.20, 0.55],
      [0.65, 0.35],
      [0.35, 0.90],
      [-0.25, 0.70],
      [-0.65, 0.95],
      [-1.15, 0.65],
      [-1.55, 0.35],
    ],
  },
];

// ------------------------
// Environment palettes (visual)
// ------------------------
const ENV = {
  coast: {
    skyA: "#0b2b5c",
    skyB: "#0b0f14",
    ground: "rgba(255,255,255,0.03)",
    grass: "rgba(60,140,120,0.25)",
    dirt: "rgba(120,110,80,0.18)",
    asphalt: "rgba(84, 98, 120, 0.96)",
    curb: "rgba(255,255,255,0.10)",
    decoA: "rgba(90, 190, 220, 0.35)",
  },
  forest: {
    skyA: "#071f1b",
    skyB: "#081016",
    ground: "rgba(255,255,255,0.02)",
    grass: "rgba(55, 145, 85, 0.28)",
    dirt: "rgba(90, 80, 60, 0.20)",
    asphalt: "rgba(80, 94, 112, 0.96)",
    curb: "rgba(255,255,255,0.08)",
    decoA: "rgba(70, 140, 70, 0.45)",
  },
  desert: {
    skyA: "#3a1f0b",
    skyB: "#0b0f14",
    ground: "rgba(255,255,255,0.02)",
    grass: "rgba(210, 170, 80, 0.20)",
    dirt: "rgba(200, 140, 60, 0.18)",
    asphalt: "rgba(90, 98, 110, 0.96)",
    curb: "rgba(255,255,255,0.10)",
    decoA: "rgba(240, 180, 80, 0.15)",
  },
  city: {
    skyA: "#101c2c",
    skyB: "#070b12",
    ground: "rgba(255,255,255,0.015)",
    grass: "rgba(40, 60, 80, 0.20)",
    dirt: "rgba(60, 70, 90, 0.14)",
    asphalt: "rgba(70, 82, 98, 0.98)",
    curb: "rgba(255,255,255,0.12)",
    decoA: "rgba(255,255,255,0.08)",
  },
  canyon: {
    skyA: "#2b1609",
    skyB: "#080b10",
    ground: "rgba(255,255,255,0.02)",
    grass: "rgba(150, 90, 40, 0.18)",
    dirt: "rgba(120, 80, 50, 0.20)",
    asphalt: "rgba(86, 96, 110, 0.96)",
    curb: "rgba(255,255,255,0.10)",
    decoA: "rgba(190, 120, 80, 0.18)",
  },
  harbor: {
    skyA: "#0c2650",
    skyB: "#090d12",
    ground: "rgba(255,255,255,0.02)",
    grass: "rgba(60, 110, 120, 0.22)",
    dirt: "rgba(90, 100, 90, 0.16)",
    asphalt: "rgba(86, 100, 120, 0.96)",
    curb: "rgba(255,255,255,0.10)",
    decoA: "rgba(120, 200, 220, 0.18)",
  },
  highlands: {
    skyA: "#142039",
    skyB: "#090b10",
    ground: "rgba(255,255,255,0.02)",
    grass: "rgba(70, 120, 90, 0.23)",
    dirt: "rgba(100, 90, 70, 0.17)",
    asphalt: "rgba(82, 96, 118, 0.96)",
    curb: "rgba(255,255,255,0.08)",
    decoA: "rgba(180, 210, 255, 0.08)",
  },
  speedway: {
    skyA: "#0d1f3a",
    skyB: "#0b0f14",
    ground: "rgba(255,255,255,0.02)",
    grass: "rgba(70, 120, 80, 0.18)",
    dirt: "rgba(100, 95, 80, 0.14)",
    asphalt: "rgba(78, 92, 110, 0.98)",
    curb: "rgba(255,255,255,0.10)",
    decoA: "rgba(255,255,255,0.05)",
  },
  needle: {
    skyA: "#1a1228",
    skyB: "#070810",
    ground: "rgba(255,255,255,0.02)",
    grass: "rgba(90, 70, 110, 0.16)",
    dirt: "rgba(100, 90, 120, 0.12)",
    asphalt: "rgba(82, 92, 112, 0.98)",
    curb: "rgba(255,255,255,0.11)",
    decoA: "rgba(220, 180, 255, 0.07)",
  },
  complex: {
    skyA: "#0e1e24",
    skyB: "#060a0f",
    ground: "rgba(255,255,255,0.02)",
    grass: "rgba(60, 120, 120, 0.18)",
    dirt: "rgba(100, 95, 80, 0.14)",
    asphalt: "rgba(82, 98, 116, 0.97)",
    curb: "rgba(255,255,255,0.10)",
    decoA: "rgba(255,255,255,0.04)",
  },
  snow: {
    skyA: "#1a2a3a",
    skyB: "#0b0f14",
    ground: "rgba(255,255,255,0.02)",
    grass: "rgba(210, 225, 240, 0.14)",
    dirt: "rgba(190, 210, 225, 0.10)",
    asphalt: "rgba(84, 92, 106, 0.98)",
    curb: "rgba(255,255,255,0.16)",
    decoA: "rgba(255,255,255,0.10)",
  },
  night: {
    skyA: "#050814",
    skyB: "#02040b",
    ground: "rgba(255,255,255,0.01)",
    grass: "rgba(40, 80, 120, 0.10)",
    dirt: "rgba(70, 60, 90, 0.10)",
    asphalt: "rgba(70, 80, 98, 0.98)",
    curb: "rgba(255,255,255,0.11)",
    decoA: "rgba(80, 220, 255, 0.10)",
  },
  rain: {
    skyA: "#0b1422",
    skyB: "#05070c",
    ground: "rgba(255,255,255,0.015)",
    grass: "rgba(70, 110, 90, 0.14)",
    dirt: "rgba(80, 80, 90, 0.12)",
    asphalt: "rgba(60, 70, 88, 0.98)",
    curb: "rgba(255,255,255,0.12)",
    decoA: "rgba(180, 220, 255, 0.08)",
  },
  island: {
    skyA: "#0b284a",
    skyB: "#0b0f14",
    ground: "rgba(255,255,255,0.02)",
    grass: "rgba(65, 150, 105, 0.24)",
    dirt: "rgba(110, 100, 70, 0.16)",
    asphalt: "rgba(82, 98, 120, 0.96)",
    curb: "rgba(255,255,255,0.10)",
    decoA: "rgba(120, 240, 200, 0.12)",
  },
  volcano: {
    skyA: "#240a08",
    skyB: "#07080b",
    ground: "rgba(255,255,255,0.02)",
    grass: "rgba(120, 70, 60, 0.18)",
    dirt: "rgba(160, 70, 50, 0.16)",
    asphalt: "rgba(86, 92, 104, 0.98)",
    curb: "rgba(255,255,255,0.10)",
    decoA: "rgba(255, 120, 80, 0.08)",
  },
  metro: {
    skyA: "#0b1420",
    skyB: "#05070c",
    ground: "rgba(255,255,255,0.015)",
    grass: "rgba(50, 70, 90, 0.18)",
    dirt: "rgba(80, 90, 110, 0.12)",
    asphalt: "rgba(70, 82, 98, 0.98)",
    curb: "rgba(255,255,255,0.12)",
    decoA: "rgba(255,255,255,0.06)",
  },
  prairie: {
    skyA: "#12293d",
    skyB: "#0b0f14",
    ground: "rgba(255,255,255,0.02)",
    grass: "rgba(90, 140, 70, 0.20)",
    dirt: "rgba(120, 105, 70, 0.14)",
    asphalt: "rgba(82, 92, 110, 0.98)",
    curb: "rgba(255,255,255,0.10)",
    decoA: "rgba(255,255,255,0.04)",
  },
  atelier: {
    skyA: "#0c0e20",
    skyB: "#07080f",
    ground: "rgba(255,255,255,0.02)",
    grass: "rgba(120, 90, 160, 0.12)",
    dirt: "rgba(110, 110, 140, 0.10)",
    asphalt: "rgba(78, 90, 110, 0.98)",
    curb: "rgba(255,255,255,0.11)",
    decoA: "rgba(255, 220, 255, 0.06)",
  },
};

// ------------------------
// Track build + sampling
// ------------------------
function densify(points, stepsPerEdge) {
  const dense = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    for (let k = 0; k < stepsPerEdge; k++) {
      const t = k / stepsPerEdge;
      dense.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t)]);
    }
  }
  return dense;
}

function smoothClosed(points, passes = 2) {
  let p = points.slice();
  for (let it = 0; it < passes; it++) {
    const out = new Array(p.length);
    for (let i = 0; i < p.length; i++) {
      const p0 = p[(i - 1 + p.length) % p.length];
      const p1 = p[i];
      const p2 = p[(i + 1) % p.length];
      out[i] = [(p0[0] + 2 * p1[0] + p2[0]) / 4, (p0[1] + 2 * p1[1] + p2[1]) / 4];
    }
    p = out;
  }
  return p;
}

function smooth1D(arr, passes = 2) {
  const n = arr.length;
  let a = arr.slice();
  for (let p = 0; p < passes; p++) {
    const b = new Array(n);
    for (let i = 0; i < n; i++) {
      const im1 = (i - 1 + n) % n;
      const ip1 = (i + 1) % n;
      b[i] = (a[im1] + 2 * a[i] + a[ip1]) / 4;
    }
    a = b;
  }
  return a;
}

// ------------------------
// Main component
// ------------------------
export default function RaceGame2DPro() {
  const lang = navigator.language.startsWith("es") ? "es" : "en";
  const navigate = useNavigate();
  const MINIGAMES_HOME = "/minigames";

  // Tutorial / Setup
  const [showTutorial, setShowTutorial] = useState(true);
  const [showSetup, setShowSetup] = useState(true);

  // Setup options
  const [laps, setLaps] = useState(3);
  const [aiMode, setAiMode] = useState("medium"); // easy|medium|hard
  const [trackPick, setTrackPick] = useState("random"); // "random" or trackId as string
  const [opponents, setOpponents] = useState(5); // includes player? We'll clamp and spawn total = opponents+1

  // UI state
  const [hud, setHud] = useState({ pos: 1, total: 6, lap: "1/3", speed: 0, note: "" });
  const [trackLabel, setTrackLabel] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);

  const tutorial = tutorialTexts["/minigames/race"]?.[lang];

  // Canvas and loop refs
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const lastRef = useRef(performance.now());
  const containerRef = useRef(null);

  // Input refs
  const keysRef = useRef(new Set());
  const inputRef = useRef({ throttle: 0, brake: 0, steer: 0 });

  // Touch joystick
  const joyRef = useRef({ active: false, pointerId: null, cx: 0, cy: 0 });

  // View / dpr
  const viewRef = useRef({ w: 0, h: 0, dpr: 1 });

  // Mobile detection
  const isMobileRef = useRef(false);
  const computeIsMobile = () =>
    window.matchMedia("(max-width: 520px)").matches || window.matchMedia("(pointer: coarse)").matches;

  // Camera
  const cameraRef = useRef({ x: 0, y: 0 });

  // Colors
  const COLORS = useMemo(
    () => ["#f34b4b", "#4bd6ff", "#ffd14b", "#7dff4b", "#c24bff", "#ff4bd8", "#ff8a4b", "#4bffcf"],
    []
  );

  // Translations (local)
  const t = useMemo(() => {
    const es = {
      title: "🏁 Carrera 2D Pro",
      subtitle: "15+ circuitos · IA por dificultad · Parrilla + semáforo · Colisiones",
      startRace: "Empezar carrera",
      backHome: "Volver",
      setup: "Setup",
      chooseLaps: "Vueltas",
      chooseTrack: "Circuito",
      chooseAI: "Dificultad IA",
      chooseOpp: "Rivales",
      random: "Aleatorio",
      easy: "Fácil",
      medium: "Medio",
      hard: "Difícil",
      easyDesc: "Frena antes, más errores, peor trazada.",
      mediumDesc: "Balanceado: rápido, pero con margen.",
      hardDesc: "Trazada ideal, frena tarde, acelera antes, más agresivo.",
      track: "Circuito",
      position: "Posición",
      lap: "Vuelta",
      speed: "Vel",
      sim: "km/h (sim)",
      standings: "Clasificación",
      restart: "Reiniciar",
      backToSetup: "⚙ Setup",
      touchHint: "Touch: joystick (izq) + gas/freno (dcha)",
      aiFinished: "Un rival ya terminó (tu carrera sigue).",
      finish: "Carrera terminada",
      victory: "¡Victoria!",
      winner: "Ganador",
      restartHint: "Pulsa Reiniciar para otra carrera",
      resume: "Continuar",
    };
    const en = {
      title: "🏁 2D Race Pro",
      subtitle: "15+ tracks · Difficulty AI · Grid + lights · Collisions",
      startRace: "Start race",
      backHome: "Back",
      setup: "Setup",
      chooseLaps: "Laps",
      chooseTrack: "Track",
      chooseAI: "AI Difficulty",
      chooseOpp: "Opponents",
      random: "Random",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      easyDesc: "Brakes earlier, more mistakes, worse line.",
      mediumDesc: "Balanced: fast, but keeps margin.",
      hardDesc: "Ideal line, late braking, earlier throttle, more aggressive.",
      track: "Track",
      position: "Position",
      lap: "Lap",
      speed: "Speed",
      sim: "km/h (sim)",
      standings: "Leaderboard",
      restart: "Restart",
      backToSetup: "⚙ Setup",
      touchHint: "Touch: joystick (left) + throttle/brake (right)",
      aiFinished: "A rival finished (your race continues).",
      finish: "Race finished",
      victory: "Victory!",
      winner: "Winner",
      restartHint: "Press Restart to race again",
      resume: "Continue",
    };
    return lang === "es" ? es : en;
  }, [lang]);

  // ------------------------
  // Track data refs
  // ------------------------
  const trackRef = useRef({
    trackId: 0,
    env: "coast",
    width: 88,
    points: [],
    segLen: [],
    totalLen: 0,
    decorations: [],
  });

  // Precomputed plan: samples/curv/target speeds (per difficulty baseline)
  const trackPlanRef = useRef({
    N: 2048,
    samples: null, // {x,y,ang}[]
    curv: null, // number[]
    vProfile: null, // number[] 0..1
    builtForTrackId: null,
  });

  const sampleTrack = useCallback((s01) => {
    const tr = trackRef.current;
    let d = wrap01(s01) * tr.totalLen;

    for (let i = 0; i < tr.points.length; i++) {
      const L = tr.segLen[i];
      if (d <= L) {
        const p = tr.points[i];
        const q = tr.points[(i + 1) % tr.points.length];
        const tt = L === 0 ? 0 : d / L;
        const x = lerp(p[0], q[0], tt);
        const y = lerp(p[1], q[1], tt);
        const ang = Math.atan2(q[1] - p[1], q[0] - p[0]);
        return { x, y, ang };
      }
      d -= L;
    }
    const p = tr.points[0];
    const q = tr.points[1];
    return { x: p[0], y: p[1], ang: Math.atan2(q[1] - p[1], q[0] - p[0]) };
  }, []);

  const closestOnTrack = useCallback((px, py) => {
    const tr = trackRef.current;
    let best = { dist: Infinity, s: 0, cx: 0, cy: 0 };
    let accum = 0;

    for (let i = 0; i < tr.points.length; i++) {
      const a = tr.points[i];
      const b = tr.points[(i + 1) % tr.points.length];
      const vx = b[0] - a[0];
      const vy = b[1] - a[1];
      const L2 = vx * vx + vy * vy;

      let tt = 0;
      if (L2 > 1e-6) {
        tt = ((px - a[0]) * vx + (py - a[1]) * vy) / L2;
        tt = clamp(tt, 0, 1);
      }

      const cx = a[0] + tt * vx;
      const cy = a[1] + tt * vy;

      const dx = px - cx;
      const dy = py - cy;
      const dist = Math.hypot(dx, dy);
      const L = Math.sqrt(L2);

      if (dist < best.dist) {
        best = { dist, s: (accum + L * tt) / tr.totalLen, cx, cy };
      }
      accum += L;
    }
    return best;
  }, []);

  const buildTrackPlan = useCallback(
    (N = 2048) => {
      const samples = new Array(N);
      const curv = new Array(N);

      for (let i = 0; i < N; i++) {
        const s = i / N;
        const sp = sampleTrack(s);
        samples[i] = sp;

        const spN = sampleTrack(wrap01(s + 1 / N));
        const dAng = Math.abs(signedAngleDiff(sp.ang, spN.ang));
        curv[i] = dAng * N; // proxy ~ dAng/ds
      }

      const curvSm = smooth1D(curv, 3);

      // base speed profile: high curvature => lower speed
      const v0 = new Array(N);
      for (let i = 0; i < N; i++) {
        // normalize curvature range
        const cNorm = clamp(curvSm[i] * 0.015, 0, 1);
        // non-linear shaping: only harsh on tight corners
        const shaped = Math.pow(cNorm, 1.35);
        let v = 1 - 0.60 * shaped;
        v = clamp(v, 0.32, 1.0);
        v0[i] = v;
      }

      // forward/back pass for “anticipation braking”
      const accelPerStep = 0.019;
      const brakeFast = 0.034;
      const brakeTight = 0.016;

      let v = v0.slice();
      for (let i = 1; i < N; i++) v[i] = Math.min(v[i], v[i - 1] + accelPerStep);
      v[0] = Math.min(v[0], v[N - 1] + accelPerStep);

      for (let i = N - 2; i >= 0; i--) {
        const cNorm = clamp(curvSm[i] * 0.015, 0, 1);
        const brakeStep = lerp(brakeFast, brakeTight, cNorm);
        v[i] = Math.min(v[i], v[i + 1] + brakeStep);
      }
      {
        const cNorm = clamp(curvSm[N - 1] * 0.015, 0, 1);
        const brakeStep = lerp(brakeFast, brakeTight, cNorm);
        v[N - 1] = Math.min(v[N - 1], v[0] + brakeStep);
      }

      const vSm = smooth1D(v, 2);
      return { N, samples, curv: curvSm, vProfile: vSm };
    },
    [sampleTrack]
  );

  const buildTrack = useCallback(
    (trackId) => {
      const tr = trackRef.current;
      const def = TRACKS.find((x) => x.id === trackId) || TRACKS[0];

      tr.trackId = trackId;
      tr.env = def.env || "coast";

      // scale based on viewport
      const { w, h } = viewRef.current;
      const base = Math.min(w || window.innerWidth, h || window.innerHeight);
      const s = base * 0.95;
      const xStretch = 1.45;
      const yStretch = 1.12;

      let raw = def.raw.slice();
      if (def.ccw) raw = raw.slice().reverse();

      // raw -> world coords
      const rawWorld = raw.map(([nx, ny]) => [nx * s * xStretch, ny * s * yStretch]);

      // more points => longer track feel
      const dense = densify(rawWorld, 36);
      const sm = smoothClosed(dense, 3);

      tr.points = sm;
      tr.segLen = [];
      tr.totalLen = 0;

      for (let i = 0; i < tr.points.length; i++) {
        const p = tr.points[i];
        const q = tr.points[(i + 1) % tr.points.length];
        const L = hypot2(q[0] - p[0], q[1] - p[1]);
        tr.segLen.push(L);
        tr.totalLen += L;
      }

      // track width varies a bit per environment (small flavor)
      const env = tr.env;
      const baseW = 86;
      const envMod =
        env === "city" ? 78 : env === "needle" ? 76 : env === "speedway" ? 92 : env === "snow" ? 82 : 88;
      tr.width = clamp(envMod, 72, 98);

      // decorations near track (cheap procedural)
      const decorations = [];
      const step = 14;
      const shoulder = tr.width + 95;

      for (let i = 0; i < tr.points.length; i += step) {
        const p = tr.points[i];
        const q = tr.points[(i + 1) % tr.points.length];
        const ang = Math.atan2(q[1] - p[1], q[0] - p[0]);
        const { nx, ny } = getNormalFromAng(ang);

        const r1 = hash01(i * 11.7 + trackId * 99.3);
        const r2 = hash01(i * 19.3 + trackId * 77.1);
        const side = r1 > 0.5 ? 1 : -1;
        const off = shoulder + r2 * 120;

        const x = p[0] + nx * off * side + (hash01(i * 2.1) - 0.5) * 40;
        const y = p[1] + ny * off * side + (hash01(i * 3.1) - 0.5) * 40;

        // choose deco type by env
        let type = "tree";
        if (env === "desert" || env === "canyon" || env === "volcano") type = hash01(i * 4.7) > 0.5 ? "rock" : "cactus";
        if (env === "city" || env === "metro") type = hash01(i * 5.1) > 0.55 ? "light" : "block";
        if (env === "snow") type = hash01(i * 6.3) > 0.5 ? "pine" : "snowRock";
        if (env === "night") type = hash01(i * 7.3) > 0.5 ? "neon" : "light";
        if (env === "harbor" || env === "coast" || env === "island") type = hash01(i * 8.1) > 0.6 ? "palm" : "rock";

        const scale = 0.75 + hash01(i * 5.9 + trackId * 17.9) * 1.15;
        decorations.push({ x, y, type, scale });
      }
      tr.decorations = decorations;

      // UI label
      setTrackLabel(def.name?.[lang] || def.name?.en || "Track");

      // build plan if needed
      const plan = buildTrackPlan(2048);
      trackPlanRef.current = { ...plan, builtForTrackId: trackId };
    },
    [buildTrackPlan, lang]
  );

  // ------------------------
  // Game state refs
  // ------------------------
  const carsRef = useRef([]);
  const stateRef = useRef({
    running: false,
    raceOver: false,
    totalLaps: 3,
    raceTime: 0,
    finishCounter: 0,
    winnerName: null,
    winnerIsPlayer: null,
    aiMode: "medium",

    // start lights
    startPhase: "lights", // lights | go
    startTimer: 0,
    lightsCount: 5,
    goFlash: 0,
    startHold: 0,

    // grid
    grid: {
      startS: 0.03,
      halfWidth: 20,
      rowSpacingS: 0.0105,
      staggerS: 0.0048,
      visible: true,
      hideAfterProgressS: 0.16,
    },
  });

  // ------------------------
  // Resize canvas
  // ------------------------
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    viewRef.current = { w, h, dpr };
    isMobileRef.current = computeIsMobile();
  }, []);

  // ------------------------
  // Car factory
  // ------------------------
  const makeCar = useCallback((opts) => {
    const tr = trackRef.current;
    const env = tr.env;
    const wet = env === "rain";

    // Slight grip differences by env
    const envGrip = wet ? 0.92 : env === "snow" ? 0.94 : 1.0;

    return {
      name: opts.name ?? "CAR",
      isPlayer: !!opts.isPlayer,
      color: opts.color ?? "#fff",

      x: 0,
      y: 0,
      a: 0,
      vx: 0,
      vy: 0,
      speed: 0,

      s: 0,
      lap: 1,
      finished: false,
      finishTime: null,
      finishOrder: null,

      accel: (opts.accel ?? 620) * 1.0,
      brake: (opts.brake ?? 780) * 1.0,
      maxSpeed: opts.maxSpeed ?? 500,
      turnRate: opts.turnRate ?? 3.1,
      grip: (opts.grip ?? 8.4) * envGrip,
      drag: opts.drag ?? 1.45,

      radius: opts.radius ?? 18,
      mass: opts.mass ?? 1.0,

      spawnGrace: 0,

      ai: {
        t: 0,
        decisionCd: 0,
        cached: { throttle: 0, brake: 0, steer: 0 },
        noiseSeed: Math.random() * 9999,
        lineOffset: 0,
        prevErr: 0,
      },

      grid: null,
    };
  }, []);

  // ------------------------
  // Race setup / reset
  // ------------------------
  const pickTrackId = useCallback(() => {
    if (trackPick === "random") return Math.floor(Math.random() * TRACKS.length);
    const id = parseInt(trackPick, 10);
    if (Number.isFinite(id)) return clamp(id, 0, TRACKS.length - 1);
    return 0;
  }, [trackPick]);

  const placeCarOnGrid = useCallback(
    (car, rowIdx, sideSign) => {
      const st = stateRef.current;
      const g = st.grid;

      const startS = g.startS;
      const stagger = sideSign > 0 ? 0 : -g.staggerS;
      const s = wrap01(startS - rowIdx * g.rowSpacingS + stagger);

      const sp = sampleTrack(s);
      const sp2 = sampleTrack(wrap01(s + 0.01));
      const baseAng = sp2.ang;

      const { nx, ny } = getNormalFromAng(baseAng);
      const lateral = sideSign * g.halfWidth;

      car.x = sp.x + nx * lateral;
      car.y = sp.y + ny * lateral;
      car.a = sp.ang;
      car.s = s;

      car.lap = 1;
      car.finished = false;
      car.finishTime = null;
      car.finishOrder = null;

      car.vx = 0;
      car.vy = 0;
      car.speed = 0;
      car.spawnGrace = 1.0;

      car.grid = { rowIdx, sideSign, s, lateral };

      if (car.ai) {
        car.ai.t = 0;
        car.ai.decisionCd = 0;
        car.ai.cached = { throttle: 0, brake: 0, steer: 0 };
        car.ai.lineOffset = 0;
        car.ai.prevErr = 0;
      }
    },
    [sampleTrack]
  );

  const resetRace = useCallback(() => {
    const st = stateRef.current;

    st.totalLaps = laps;
    st.aiMode = aiMode;
    st.running = true;
    st.raceOver = false;
    st.raceTime = 0;
    st.finishCounter = 0;
    st.winnerName = null;
    st.winnerIsPlayer = null;

    st.grid.visible = true;

    // lights
    st.startPhase = "lights";
    st.startTimer = 0;
    st.lightsCount = 5;
    st.goFlash = 0;
    st.startHold = 0.35 + Math.random() * 0.85;

    // build track
    const tid = pickTrackId();
    buildTrack(tid);

    const totalCars = clamp(opponents + 1, 4, 10); // player + opponents
    const slots = [];
    const maxRows = Math.ceil(totalCars / 2);
    for (let r = 0; r < maxRows; r++) {
      slots.push({ rowIdx: r, sideSign: -1 });
      slots.push({ rowIdx: r, sideSign: +1 });
    }
    slots.length = totalCars;

    const playerSlotIndex = Math.floor(Math.random() * slots.length);

    const cars = [];

    // player
    const player = makeCar({
      name: "YOU",
      isPlayer: true,
      color: COLORS[0],
      maxSpeed: 520,
      accel: 680,
      brake: 860,
      grip: 9.0,
      turnRate: 3.2,
      drag: 1.38,
      radius: 18,
      mass: 1.06,
    });
    placeCarOnGrid(player, slots[playerSlotIndex].rowIdx, slots[playerSlotIndex].sideSign);
    cars.push(player);

    // AI tuning per difficulty
    const baseAI = { radius: 17, mass: 0.96 };

    const mode = aiMode;

    // Big noticeable differences:
    // - Hard: higher maxSpeed, higher accel, better grip, lower drag, better steering gains in AI logic
    // - Easy: lower speed and more error/noise
    const easyTuning = {
      maxSpeed: 440 + (Math.random() * 28 - 14),
      accel: 520 + (Math.random() * 60 - 30),
      brake: 720 + (Math.random() * 70 - 35),
      grip: 7.1 + Math.random() * 0.8,
      turnRate: 2.55 + Math.random() * 0.35,
      drag: 1.72 + Math.random() * 0.22,
    };

    const mediumTuning = {
      maxSpeed: 485 + (Math.random() * 28 - 14),
      accel: 590 + (Math.random() * 70 - 35),
      brake: 800 + (Math.random() * 80 - 40),
      grip: 7.9 + Math.random() * 0.9,
      turnRate: 2.85 + Math.random() * 0.35,
      drag: 1.52 + Math.random() * 0.18,
    };

    const hardTuning = {
      maxSpeed: 535 + (Math.random() * 30 - 10),
      accel: 690 + (Math.random() * 80 - 30),
      brake: 900 + (Math.random() * 90 - 45),
      grip: 8.7 + Math.random() * 0.9,
      turnRate: 3.10 + (Math.random() * 0.35),
      drag: 1.30 + Math.random() * 0.14,
    };

    const tunePick = mode === "hard" ? hardTuning : mode === "easy" ? easyTuning : mediumTuning;

    let aiNum = 1;
    for (let i = 0; i < slots.length; i++) {
      if (i === playerSlotIndex) continue;

      const ai = makeCar({
        name: `AI-${aiNum}`,
        color: COLORS[(aiNum) % COLORS.length],
        ...baseAI,
        ...tunePick,
      });

      placeCarOnGrid(ai, slots[i].rowIdx, slots[i].sideSign);
      cars.push(ai);

      aiNum++;
    }

    carsRef.current = cars;

    // camera initial
    cameraRef.current.x = player.x;
    cameraRef.current.y = player.y;

    // clear UI caches
    setLeaderboard([]);
    setHud({ pos: 1, total: cars.length, lap: `1/${laps}`, speed: 0, note: "" });
  }, [aiMode, buildTrack, COLORS, laps, makeCar, opponents, pickTrackId, placeCarOnGrid]);

  // ------------------------
  // Ranking
  // ------------------------
  const computeRanking = useCallback(() => {
    const st = stateRef.current;
    const cars = carsRef.current.slice();

    cars.sort((a, b) => {
      if (a.finished && !b.finished) return -1;
      if (!a.finished && b.finished) return 1;

      if (a.finished && b.finished) return (a.finishOrder ?? 9999) - (b.finishOrder ?? 9999);

      const aLap = Math.min(a.lap, st.totalLaps + 1);
      const bLap = Math.min(b.lap, st.totalLaps + 1);
      if (aLap !== bLap) return bLap - aLap;

      return b.s - a.s;
    });

    return cars;
  }, []);

  // ------------------------
  // Collision solver
  // ------------------------
  const resolveCarCollisions = useCallback(() => {
    const cars = carsRef.current;
    const restitution = 0.16;
    const friction = 0.05;

    for (let i = 0; i < cars.length; i++) {
      for (let j = i + 1; j < cars.length; j++) {
        const a = cars[i];
        const b = cars[j];
        if (a.finished && b.finished) continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        const minDist = a.radius + b.radius;

        if (dist <= 1e-6 || dist >= minDist) continue;

        const nx = dx / dist;
        const ny = dy / dist;

        const penetration = minDist - dist;
        const totalMass = a.mass + b.mass;

        const pushA = (penetration * (b.mass / totalMass)) * 1.05;
        const pushB = (penetration * (a.mass / totalMass)) * 1.05;

        a.x -= nx * pushA;
        a.y -= ny * pushA;
        b.x += nx * pushB;
        b.y += ny * pushB;

        const rvx = b.vx - a.vx;
        const rvy = b.vy - a.vy;
        const relVelN = rvx * nx + rvy * ny;

        if (relVelN > 0) continue;

        const invA = 1 / a.mass;
        const invB = 1 / b.mass;
        const jImp = (-(1 + restitution) * relVelN) / (invA + invB);

        const impX = jImp * nx;
        const impY = jImp * ny;

        a.vx -= impX * invA;
        a.vy -= impY * invA;
        b.vx += impX * invB;
        b.vy += impY * invB;

        // tangential friction
        const tx = -ny;
        const ty = nx;
        const relVelT = rvx * tx + rvy * ty;
        const jt = -relVelT / (invA + invB);

        a.vx -= jt * tx * friction * invA;
        a.vy -= jt * ty * friction * invA;
        b.vx += jt * tx * friction * invB;
        b.vy += jt * ty * friction * invB;

        a.speed *= 0.988;
        b.speed *= 0.988;
      }
    }
  }, []);

  // ------------------------
  // AI logic (difficulty changes are strong)
  // ------------------------
  const aiControl = useCallback((car, dt) => {
    const st = stateRef.current;
    const tr = trackRef.current;
    const plan = trackPlanRef.current;

    const mode = st.aiMode || "medium";

    // traffic sensing (simple cone)
    const cars = carsRef.current;
    let ahead = null;
    let aheadDist = Infinity;
    const fwdx = Math.cos(car.a);
    const fwdy = Math.sin(car.a);

    for (const other of cars) {
      if (other === car || other.finished) continue;
      const dx = other.x - car.x;
      const dy = other.y - car.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > 280 * 280) continue;
      const d = Math.sqrt(d2);
      const dot = (dx / d) * fwdx + (dy / d) * fwdy;
      if (dot < 0.45) continue;
      if (d < aheadDist) {
        aheadDist = d;
        ahead = other;
      }
    }

    car.ai.t += dt;

    // decision periods: easy is “laggier”
    const period = mode === "hard" ? 0.0 : mode === "medium" ? 0.03 : 0.11;

    if (car.ai.decisionCd > 0) {
      car.ai.decisionCd -= dt;
      return car.ai.cached;
    }
    car.ai.decisionCd = period;

    const cNow = closestOnTrack(car.x, car.y);
    const sBase = cNow.s;

    const v01 = clamp(car.speed / car.maxSpeed, 0, 1);

    // Lookahead (hard reads further, but with steering “anti-early-turn”)
    const lookSpeed =
      mode === "hard" ? (0.020 + v01 * 0.060) :
      mode === "medium" ? (0.018 + v01 * 0.052) :
      (0.016 + v01 * 0.045);

    const lookSteer =
      mode === "hard" ? clamp(0.010 + v01 * 0.022, 0.008, 0.030) :
      mode === "medium" ? clamp(0.011 + v01 * 0.020, 0.009, 0.034) :
      clamp(0.012 + v01 * 0.018, 0.010, 0.040);

    const sp0 = sampleTrack(sBase);
    const sp1 = sampleTrack(wrap01(sBase + lookSteer));

    // Avoid “turning before the corner”: blend angles based on upcoming curvature
    const upcoming = Math.abs(signedAngleDiff(sp0.ang, sp1.ang));
    const w =
      clamp(upcoming * (mode === "hard" ? 2.8 : mode === "medium" ? 2.45 : 2.2), 0, 1) *
      clamp(v01 * 1.15, 0, 1);

    const desiredAng = angNorm(sp0.ang + signedAngleDiff(sp0.ang, sp1.ang) * w);
    let err = signedAngleDiff(car.a, desiredAng);

    // lateral error toward centerline (or small offset when overtaking)
    const n0 = getNormalFromAng(sp0.ang);
    const latPx = (car.x - sp0.x) * n0.nx + (car.y - sp0.y) * n0.ny;

    let desiredOffset = 0;
    if (ahead && aheadDist < (mode === "hard" ? 120 : mode === "medium" ? 130 : 145)) {
      const side = Math.sign((ahead.y - car.y) * fwdx - (ahead.x - car.x) * fwdy) || 1;
      desiredOffset = (mode === "hard" ? 0.22 : mode === "medium" ? 0.16 : 0.28) * side;
    }

    car.ai.lineOffset = lerp(car.ai.lineOffset, desiredOffset, clamp(6 * dt, 0, 1));
    const latTargetPx = car.ai.lineOffset * (tr.width * 0.62);

    const latErr = (latPx - latTargetPx) / Math.max(1, tr.width);

    // PD steer
    const prevErr = car.ai.prevErr ?? err;
    const derr = (err - prevErr) / Math.max(1e-3, dt);
    car.ai.prevErr = err;

    const kp = mode === "hard" ? 1.38 : mode === "medium" ? 1.28 : 1.18;
    const kd = mode === "hard" ? 0.05 : mode === "medium" ? 0.035 : 0.02;
    const kLat = mode === "hard" ? 0.86 : mode === "medium" ? 0.70 : 0.55;

    let steer = clamp(kp * err + kd * derr - kLat * latErr, -1, 1);

    // Target speed from plan (hard uses it most efficiently)
    let targetSpeed = car.maxSpeed * 0.75;
    if (plan?.vProfile) {
      const idx = Math.floor(wrap01(sBase + lookSpeed) * plan.N);
      const vRel = plan.vProfile[idx];

      if (mode === "hard") {
        targetSpeed = car.maxSpeed * vRel;
        // minimal penalty for small errors (keeps fast in quick bends)
        const absErr = Math.abs(err);
        const dead = 0.18;
        const eff = Math.max(0, absErr - dead);
        const pen = clamp(eff / 1.05, 0, 1);
        targetSpeed *= (1 - 0.22 * pen);
        if (vRel > 0.78 && absErr < 0.45) targetSpeed = Math.max(targetSpeed, car.maxSpeed * 0.90);
        targetSpeed = Math.max(targetSpeed, car.maxSpeed * 0.22);
      } else if (mode === "medium") {
        targetSpeed = car.maxSpeed * (0.92 * vRel + 0.03);
        const absErr = Math.abs(err);
        const dead = 0.14;
        const eff = Math.max(0, absErr - dead);
        const pen = clamp(eff / 0.95, 0, 1);
        targetSpeed *= (1 - 0.32 * pen);
        if (vRel > 0.78 && absErr < 0.45) targetSpeed = Math.max(targetSpeed, car.maxSpeed * 0.84);
        targetSpeed = Math.max(targetSpeed, car.maxSpeed * 0.20);
      } else {
        // easy: more conservative in curves
        targetSpeed = car.maxSpeed * (0.86 * vRel);
        targetSpeed = Math.max(targetSpeed, car.maxSpeed * 0.18);
      }
    }

    // Traffic
    if (ahead) {
      if (aheadDist < 105) targetSpeed = Math.min(targetSpeed, ahead.speed * 0.98);
      else if (aheadDist < 150) targetSpeed = Math.min(targetSpeed, ahead.speed * 1.03);
    }

    // Easy humanization
    if (mode === "easy") {
      const n = Math.sin((car.ai.t + car.ai.noiseSeed) * 7.1) * 0.12;
      steer = clamp(steer + n, -1, 1);
      // occasional misjudgment
      const glitch = Math.sin((car.ai.t + car.ai.noiseSeed) * 0.55) > 0.995;
      if (glitch) targetSpeed *= 1.10;
    }

    // Throttle / Brake with clear differences
    const margin = mode === "hard" ? 10 : mode === "medium" ? 16 : 26;
    let throttle = 0;
    let brake = 0;

    if (car.speed < targetSpeed - margin) {
      throttle = 1;
      brake = 0;
    } else if (car.speed > targetSpeed + margin) {
      throttle = 0;
      brake = mode === "hard" ? 0.58 : mode === "medium" ? 0.70 : 0.82;
    } else {
      throttle = mode === "hard" ? 0.60 : mode === "medium" ? 0.46 : 0.34;
      brake = 0;
    }

    // easy safety
    if (mode === "easy" && ahead && aheadDist < 90) {
      throttle *= 0.25;
      brake = Math.max(brake, 0.55);
    }

    const out = { throttle, brake, steer };
    car.ai.cached = out;
    return out;
  }, [closestOnTrack, sampleTrack]);

  // ------------------------
  // Update car
  // ------------------------
  const updateCar = useCallback((car, dt) => {
    const st = stateRef.current;
    const tr = trackRef.current;

    if (car.finished) return;

    const startLocked = st.startPhase !== "go";

    let throttle = 0, brake = 0, steer = 0;

    if (car.isPlayer) {
      if (!startLocked) {
        throttle = inputRef.current.throttle;
        brake = inputRef.current.brake;
        steer = inputRef.current.steer;
      }
      // respawn only after GO
      if (!startLocked && (keysRef.current.has(" ") || keysRef.current.has("r") || keysRef.current.has("R"))) {
        const c = closestOnTrack(car.x, car.y);
        const sp = sampleTrack(c.s);
        car.x = sp.x; car.y = sp.y; car.a = sp.ang;
        car.vx = 0; car.vy = 0; car.speed = 0;
        car.spawnGrace = 1.0;
      }
    } else {
      if (!startLocked) {
        const ai = aiControl(car, dt);
        throttle = ai.throttle;
        brake = ai.brake;
        steer = ai.steer;
      }
    }

    // physics
    const acc = throttle * car.accel - brake * car.brake;
    car.speed += acc * dt;

    // drag
    car.speed -= car.drag * car.speed * dt;
    car.speed = clamp(car.speed, 0, car.maxSpeed);

    // steer effectiveness reduces with speed slightly
    const speed01 = car.speed / car.maxSpeed;
    const steerEffect = car.turnRate * (0.55 + 0.45 * (1 - speed01));
    car.a += steer * steerEffect * dt;

    const fx = Math.cos(car.a);
    const fy = Math.sin(car.a);

    const desiredVx = fx * car.speed;
    const desiredVy = fy * car.speed;

    car.vx = lerp(car.vx, desiredVx, clamp(car.grip * dt, 0, 1));
    car.vy = lerp(car.vy, desiredVy, clamp(car.grip * dt, 0, 1));

    car.x += car.vx * dt;
    car.y += car.vy * dt;

    // track boundary constraint
    const c = closestOnTrack(car.x, car.y);
    if (c.dist > tr.width) {
      const push = c.dist - tr.width;
      const nx = (car.x - c.cx) / (c.dist + 1e-6);
      const ny = (car.y - c.cy) / (c.dist + 1e-6);
      car.x -= nx * push;
      car.y -= ny * push;
      car.speed *= 0.96;
      car.vx *= 0.96;
      car.vy *= 0.96;
    }

    // laps / finish
    const prevS = car.s;
    const newS = c.s;
    if (car.spawnGrace > 0) car.spawnGrace -= dt;

    const crossed = car.spawnGrace <= 0 && prevS > 0.88 && newS < 0.12;
    car.s = newS;

    if (crossed) {
      car.lap += 1;
      if (car.lap > st.totalLaps) {
        car.finished = true;
        if (car.finishTime == null) car.finishTime = st.raceTime;
        if (car.finishOrder == null) car.finishOrder = (++st.finishCounter);

        if (st.winnerName == null) {
          st.winnerName = car.name;
          st.winnerIsPlayer = !!car.isPlayer;
        }
      }
      car.spawnGrace = 0.35;
    }
  }, [aiControl, closestOnTrack, sampleTrack]);

  // ------------------------
  // Drawing
  // ------------------------
  const drawBackground = useCallback((ctx, cam) => {
    const tr = trackRef.current;
    const pal = ENV[tr.env] || ENV.coast;
    const { w, h } = viewRef.current;

    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, pal.skyA);
    g.addColorStop(1, pal.skyB);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = pal.ground;
    ctx.fillRect(0, h * 0.48, w, h * 0.52);

    // parallax silhouettes
    const baseY = h * 0.58;
    const shift = (cam.x * 0.08) % 700;

    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.beginPath();
    ctx.moveTo(-900 + shift, baseY);
    for (let x = -900; x <= w + 900; x += 70) {
      const hh = 45 + 32 * Math.sin((x + shift) * 0.012) + 22 * Math.sin((x + shift) * 0.02);
      ctx.lineTo(x + shift, baseY - hh);
    }
    ctx.lineTo(w + 1000, h);
    ctx.lineTo(-1000, h);
    ctx.closePath();
    ctx.fill();

    // rain overlay (visual)
    if (tr.env === "rain") {
      ctx.fillStyle = "rgba(180,220,255,0.03)";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(200,230,255,0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 90; i++) {
        const x = (hash01(i * 11.1 + cam.x * 0.0002) * w) | 0;
        const y = (hash01(i * 9.3 + cam.y * 0.0002) * h) | 0;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 10, y + 24);
        ctx.stroke();
      }
    }
  }, []);

  const drawDecorations = useCallback((ctx, cam) => {
    const tr = trackRef.current;
    const pal = ENV[tr.env] || ENV.coast;
    const maxDist2 = 1500 * 1500;

    for (const d of tr.decorations) {
      const dx = d.x - cam.x;
      const dy = d.y - cam.y;
      const dist2 = dx * dx + dy * dy;
      if (dist2 > maxDist2) continue;

      const s = d.scale;

      switch (d.type) {
        case "tree": {
          ctx.fillStyle = "rgba(70,45,30,0.85)";
          ctx.fillRect(d.x - 3 * s, d.y - 2 * s, 6 * s, 14 * s);
          ctx.fillStyle = pal.decoA;
          ctx.beginPath();
          ctx.ellipse(d.x, d.y - 14 * s, 18 * s, 16 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case "pine": {
          ctx.fillStyle = "rgba(70,45,30,0.78)";
          ctx.fillRect(d.x - 2.5 * s, d.y + 3 * s, 5 * s, 10 * s);
          ctx.fillStyle = "rgba(180,220,255,0.10)";
          ctx.beginPath();
          ctx.moveTo(d.x, d.y - 18 * s);
          ctx.lineTo(d.x - 14 * s, d.y + 4 * s);
          ctx.lineTo(d.x + 14 * s, d.y + 4 * s);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case "rock":
        case "snowRock": {
          ctx.fillStyle = d.type === "snowRock" ? "rgba(220,235,255,0.10)" : "rgba(140,150,165,0.55)";
          ctx.beginPath();
          ctx.moveTo(d.x - 14 * s, d.y + 6 * s);
          ctx.lineTo(d.x - 6 * s, d.y - 10 * s);
          ctx.lineTo(d.x + 12 * s, d.y - 6 * s);
          ctx.lineTo(d.x + 16 * s, d.y + 8 * s);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case "cactus": {
          ctx.fillStyle = "rgba(80, 180, 120, 0.18)";
          ctx.fillRect(d.x - 3 * s, d.y - 14 * s, 6 * s, 22 * s);
          ctx.fillRect(d.x - 9 * s, d.y - 6 * s, 5 * s, 10 * s);
          ctx.fillRect(d.x + 4 * s, d.y - 8 * s, 5 * s, 12 * s);
          break;
        }
        case "block": {
          ctx.fillStyle = "rgba(255,255,255,0.05)";
          ctx.fillRect(d.x - 14 * s, d.y - 14 * s, 28 * s, 28 * s);
          ctx.fillStyle = "rgba(255,255,255,0.08)";
          ctx.fillRect(d.x - 8 * s, d.y - 8 * s, 16 * s, 16 * s);
          break;
        }
        case "light": {
          ctx.fillStyle = "rgba(255,255,255,0.08)";
          ctx.fillRect(d.x - 1.8 * s, d.y - 20 * s, 3.6 * s, 26 * s);
          ctx.fillStyle = "rgba(255,255,255,0.12)";
          ctx.beginPath();
          ctx.arc(d.x, d.y - 22 * s, 6 * s, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case "neon": {
          ctx.fillStyle = "rgba(80,220,255,0.08)";
          ctx.fillRect(d.x - 2 * s, d.y - 24 * s, 4 * s, 30 * s);
          ctx.fillStyle = "rgba(255,80,220,0.08)";
          ctx.beginPath();
          ctx.arc(d.x, d.y - 26 * s, 7 * s, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case "palm": {
          ctx.fillStyle = "rgba(70,45,30,0.75)";
          ctx.fillRect(d.x - 2.5 * s, d.y - 2 * s, 5 * s, 18 * s);
          ctx.strokeStyle = "rgba(120,240,200,0.12)";
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y - 10 * s);
          ctx.quadraticCurveTo(d.x + 18 * s, d.y - 18 * s, d.x + 24 * s, d.y - 8 * s);
          ctx.moveTo(d.x, d.y - 10 * s);
          ctx.quadraticCurveTo(d.x - 18 * s, d.y - 18 * s, d.x - 24 * s, d.y - 8 * s);
          ctx.stroke();
          break;
        }
        default:
          break;
      }
    }
  }, []);

  const drawTrack = useCallback((ctx, sCenter) => {
    const tr = trackRef.current;
    const pal = ENV[tr.env] || ENV.coast;
    const n = tr.points.length;

    const s01 = wrap01(sCenter);
    const centerIdx = Math.floor(s01 * n);

    const behind = 130;
    const ahead = 350;

    const pts = [];
    for (let k = -behind; k <= ahead; k++) pts.push(tr.points[(centerIdx + k + n) % n]);

    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // grass band
    ctx.strokeStyle = pal.grass;
    ctx.lineWidth = tr.width * 2 + 280;
    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
    ctx.stroke();

    // dirt
    ctx.strokeStyle = pal.dirt;
    ctx.lineWidth = tr.width * 2 + 140;
    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
    ctx.stroke();

    // curb edge
    ctx.strokeStyle = pal.curb;
    ctx.lineWidth = tr.width * 2 + 38;
    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
    ctx.stroke();

    // asphalt
    ctx.strokeStyle = pal.asphalt;
    ctx.lineWidth = tr.width * 2;
    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
    ctx.stroke();

    // center dashed
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 12]);
    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
    ctx.stroke();
    ctx.setLineDash([]);

    // finish line at s=0
    const a = sampleTrack(0.0);
    const b = sampleTrack(0.006);
    const ang = b.ang;
    const { nx, ny } = getNormalFromAng(ang);

    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(a.x + nx * (tr.width + 10), a.y + ny * (tr.width + 10));
    ctx.lineTo(a.x - nx * (tr.width + 10), a.y - ny * (tr.width + 10));
    ctx.stroke();
  }, [sampleTrack]);

  const drawGridBoxes = useCallback((ctx) => {
    const st = stateRef.current;
    const tr = trackRef.current;
    if (!st.grid?.visible) return;
    if (!st.running || st.raceOver) return;

    const cars = carsRef.current;
    if (!cars?.length || !cars[0]?.grid) return;

    const boxLen = 56;
    const boxW = 22;

    ctx.save();
    ctx.lineWidth = 2;

    for (const car of cars) {
      if (!car.grid) continue;
      const sp = sampleTrack(car.grid.s);

      const ang = sp.ang;
      const fx = Math.cos(ang);
      const fy = Math.sin(ang);
      const { nx, ny } = getNormalFromAng(ang);

      const cx = sp.x + nx * car.grid.lateral;
      const cy = sp.y + ny * car.grid.lateral;

      const hx = fx * (boxLen * 0.5);
      const hy = fy * (boxLen * 0.5);
      const wx = nx * (boxW * 0.5);
      const wy = ny * (boxW * 0.5);

      const p1 = [cx - hx - wx, cy - hy - wy];
      const p2 = [cx + hx - wx, cy + hy - wy];
      const p3 = [cx + hx + wx, cy + hy + wy];
      const p4 = [cx - hx + wx, cy - hy + wy];

      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.lineTo(p3[0], p3[1]);
      ctx.lineTo(p4[0], p4[1]);
      ctx.closePath();
      ctx.stroke();

      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath();
      ctx.moveTo(p2[0], p2[1]);
      ctx.lineTo(p3[0], p3[1]);
      ctx.stroke();

      ctx.fillStyle = "rgba(255,255,255,0.030)";
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.lineTo(p3[0], p3[1]);
      ctx.lineTo(p4[0], p4[1]);
      ctx.closePath();
      ctx.fill();
    }

    // extra: grid “start banner” hint (subtle)
    const s0 = st.grid.startS;
    const sp0 = sampleTrack(s0);
    const sp1 = sampleTrack(wrap01(s0 + 0.004));
    const { nx, ny } = getNormalFromAng(sp1.ang);

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    roundRect(ctx, sp0.x - 70, sp0.y - tr.width - 54, 140, 30, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.font = "12px system-ui, sans-serif";
    const msg = "GRID";
    ctx.fillText(msg, sp0.x - ctx.measureText(msg).width / 2, sp0.y - tr.width - 34);

    // small marker
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.beginPath();
    ctx.moveTo(sp0.x + nx * (tr.width + 10), sp0.y + ny * (tr.width + 10));
    ctx.lineTo(sp0.x - nx * (tr.width + 10), sp0.y - ny * (tr.width + 10));
    ctx.stroke();

    ctx.restore();
  }, [sampleTrack]);

  const drawCar = useCallback((ctx, car) => {
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.a);

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(2, 7, 20, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // wheels
    ctx.fillStyle = "#101114";
    ctx.fillRect(14, -14, 8, 10);
    ctx.fillRect(14, 4, 8, 10);
    ctx.fillRect(-22, -16, 10, 12);
    ctx.fillRect(-22, 4, 10, 12);

    // body
    ctx.fillStyle = car.color;
    ctx.beginPath();
    ctx.moveTo(-18, -8);
    ctx.lineTo(8, -10);
    ctx.lineTo(18, -4);
    ctx.lineTo(18, 4);
    ctx.lineTo(8, 10);
    ctx.lineTo(-18, 8);
    ctx.closePath();
    ctx.fill();

    // cockpit
    ctx.fillStyle = "rgba(10,10,10,0.75)";
    ctx.beginPath();
    ctx.ellipse(-2, 0, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // wings
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.fillRect(16, -12, 4, 24);
    ctx.fillRect(-22, -14, 4, 28);

    // center stripe
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(15, 0);
    ctx.stroke();

    ctx.restore();

    // label
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText(car.name, car.x + 12, car.y - 12);
  }, []);

  const drawLeaderboardCanvas = useCallback((ctx, ranking) => {
    const { w } = viewRef.current;
    const pad = 12;
    const boxW = 248;
    const x = w - boxW - pad;
    const y = pad;

    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, boxW, 54 + ranking.length * 18, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "13px system-ui, sans-serif";
    ctx.fillText(t.standings, x + 12, y + 19);

    const st = stateRef.current;
    ctx.font = "12px system-ui, sans-serif";
    ranking.forEach((c, i) => {
      const yy = y + 62 + i * 18;
      ctx.fillStyle = c.color;
      ctx.fillText(`${i + 1}. ${c.name}`, x + 12, yy);

      ctx.fillStyle = "rgba(255,255,255,0.72)";
      const l = c.finished ? "FIN" : `L${Math.min(c.lap, st.totalLaps)}`;
      ctx.fillText(l, x + 196, yy);
    });
  }, [t.standings]);

  const drawStartLights = useCallback((ctx) => {
    const st = stateRef.current;
    if (st.startPhase === "go" && st.goFlash <= 0) return;

    const { w, h } = viewRef.current;

    const boxW = 320;
    const boxH = 120;
    const x = w * 0.5 - boxW * 0.5;
    const y = h * 0.16;

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, boxW, boxH, 16);
    ctx.fill();
    ctx.stroke();

    const step = 0.80;
    const lit = st.startPhase === "lights" ? Math.min(st.lightsCount, Math.floor(st.startTimer / step) + 1) : st.lightsCount;

    const cx = w * 0.5;
    const cy = y + 56;
    const r = 12;
    const gap = 18;
    const total = st.lightsCount;
    const startX = cx - ((total - 1) * (2 * r + gap)) / 2;

    for (let i = 0; i < total; i++) {
      const on = st.startPhase === "go" ? false : i < lit;
      ctx.fillStyle = on ? "rgba(255,40,40,0.95)" : "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.arc(startX + i * (2 * r + gap), cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (st.startPhase === "go") {
      const msg = lang === "es" ? "¡SALIDA!" : "GO!";
      ctx.globalAlpha = clamp(st.goFlash, 0, 1);
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "900 26px system-ui, sans-serif";
      ctx.fillText(msg, cx - ctx.measureText(msg).width / 2, y + 32);
      ctx.globalAlpha = 1;
    } else {
      const msg = lang === "es" ? "Prepárate..." : "Get ready...";
      ctx.fillStyle = "rgba(231,238,247,0.8)";
      ctx.font = "700 16px system-ui, sans-serif";
      ctx.fillText(msg, cx - ctx.measureText(msg).width / 2, y + 32);
    }
  }, [lang]);

  const drawRaceOverOverlay = useCallback((ctx, ranking) => {
    const st = stateRef.current;
    const { w, h } = viewRef.current;

    const youWin = ranking[0]?.isPlayer;
    const title = youWin ? t.victory : t.finish;

    ctx.fillStyle = "rgba(0,0,0,0.62)";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "900 40px system-ui, sans-serif";
    ctx.fillText(title, w * 0.5 - ctx.measureText(title).width / 2, h * 0.42);

    ctx.font = "16px system-ui, sans-serif";
    const winnerLine = `${t.winner}: ${ranking[0]?.name ?? "-"}`;
    ctx.fillText(winnerLine, w * 0.5 - ctx.measureText(winnerLine).width / 2, h * 0.42 + 34);

    ctx.font = "16px system-ui, sans-serif";
    ctx.fillText(
      t.restartHint,
      w * 0.5 - ctx.measureText(t.restartHint).width / 2,
      h * 0.42 + 94
    );
  }, [t.finish, t.restartHint, t.victory, t.winner]);

  // ------------------------
  // Loop
  // ------------------------
  const loop = useCallback((now) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }
    const ctx = canvas.getContext("2d");
    const st = stateRef.current;

    const dt = Math.min(0.033, (now - lastRef.current) / 1000);
    lastRef.current = now;
    st.raceTime += dt;

    // update start lights
    if (st.running && !st.raceOver) {
      if (st.startPhase === "lights") {
        st.startTimer += dt;
        const step = 0.80;
        const totalTime = st.lightsCount * step;
        if (st.startTimer >= totalTime + (st.startHold ?? 0.6)) {
          st.startPhase = "go";
          st.goFlash = 0.90;
        }
      } else if (st.goFlash > 0) {
        st.goFlash -= dt;
      }
    }

    // sim
    if (st.running && !st.raceOver) {
      for (const car of carsRef.current) updateCar(car, dt);
      // collisions twice for stability
      resolveCarCollisions();
      resolveCarCollisions();
    }

    const ranking = computeRanking();
    const you = carsRef.current.find((c) => c.isPlayer);

    // hide grid boxes after launch by player progress
    if (you && st.grid?.visible && st.startPhase === "go") {
      const prog = wrap01(you.s - st.grid.startS);
      if (you.lap > 1) st.grid.visible = false;
      else if (prog > st.grid.hideAfterProgressS) st.grid.visible = false;
    }

    // camera
    if (you) {
      const isMobile = isMobileRef.current;
      const look = isMobile ? 95 : 190;
      const tx = you.x + Math.cos(you.a) * look;
      const ty = you.y + Math.sin(you.a) * look;
      cameraRef.current.x = lerp(cameraRef.current.x, tx, clamp(6.8 * dt, 0, 1));
      cameraRef.current.y = lerp(cameraRef.current.y, ty, clamp(6.8 * dt, 0, 1));
    }

    // render
    const { w, h } = viewRef.current;
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    drawBackground(ctx, cameraRef.current);

    const cam = cameraRef.current;
    const anchorX = w * 0.5;
    const anchorY = isMobileRef.current ? h * 0.50 : h * 0.62;

    ctx.save();
    ctx.translate(anchorX - cam.x, anchorY - cam.y);

    drawDecorations(ctx, cam);
    drawTrack(ctx, you?.s ?? 0);
    drawGridBoxes(ctx);

    carsRef.current
      .slice()
      .sort((a, b) => a.y - b.y)
      .forEach((c) => drawCar(ctx, c));

    ctx.restore();

    // leaderboard
    if (!isMobileRef.current) {
      drawLeaderboardCanvas(ctx, ranking);
    } else {
      if (now % 6 < 1) {
        setLeaderboard(
          ranking.map((c) => ({
            name: c.name,
            color: c.color,
            finished: c.finished,
            lap: c.lap,
            isPlayer: c.isPlayer,
          }))
        );
      }
    }

    // start lights overlay
    drawStartLights(ctx);

    // HUD
    if (you) {
      const yourPos = ranking.findIndex((c) => c.isPlayer) + 1;
      const curLap = you.finished ? st.totalLaps : Math.min(you.lap, st.totalLaps);
      const lapText = `${curLap}/${st.totalLaps}`;
      const anyAiFinished = carsRef.current.some((c) => !c.isPlayer && c.finished);
      const note = !you.finished && anyAiFinished ? t.aiFinished : "";

      if (now % 6 < 1) {
        setHud({
          pos: yourPos,
          total: carsRef.current.length,
          lap: lapText,
          speed: Math.round(you.speed),
          note,
        });
      }
    }

    // finish condition: only when player finishes
    if (you?.finished && !st.raceOver) {
      st.raceOver = true;
      st.running = false;
      st.winnerName = ranking[0]?.name ?? null;
    }

    if (st.raceOver) drawRaceOverOverlay(ctx, ranking);

    rafRef.current = requestAnimationFrame(loop);
  }, [
    computeRanking,
    drawBackground,
    drawCar,
    drawDecorations,
    drawGridBoxes,
    drawLeaderboardCanvas,
    drawRaceOverOverlay,
    drawStartLights,
    drawTrack,
    resolveCarCollisions,
    t.aiFinished,
    updateCar,
  ]);

  // ------------------------
  // Input
  // ------------------------
  const syncKeyboardToInput = useCallback(() => {
    const keys = keysRef.current;

    const tUp = keys.has("ArrowUp") || keys.has("w") || keys.has("W") ? 1 : 0;
    const tDown = keys.has("ArrowDown") || keys.has("s") || keys.has("S") ? 1 : 0;

    const left = keys.has("ArrowLeft") || keys.has("a") || keys.has("A") ? 1 : 0;
    const right = keys.has("ArrowRight") || keys.has("d") || keys.has("D") ? 1 : 0;

    inputRef.current.throttle = Math.max(inputRef.current.throttle, tUp);
    inputRef.current.brake = Math.max(inputRef.current.brake, tDown);

    if (!joyRef.current.active) inputRef.current.steer = right - left;
  }, []);

  // touch helpers
  const onTouchThrottle = (on) => (inputRef.current.throttle = on ? 1 : 0);
  const onTouchBrake = (on) => (inputRef.current.brake = on ? 1 : 0);

  const onJoyPointerDown = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    joyRef.current.active = true;
    joyRef.current.pointerId = e.pointerId;
    joyRef.current.cx = rect.left + rect.width / 2;
    joyRef.current.cy = rect.top + rect.height / 2;
    el.setPointerCapture(e.pointerId);
  };

  const onJoyPointerMove = (e) => {
    if (!joyRef.current.active || joyRef.current.pointerId !== e.pointerId) return;
    const dx = e.clientX - joyRef.current.cx;
    const max = 60;
    const sx = clamp(dx / max, -1, 1);
    inputRef.current.steer = lerp(inputRef.current.steer, sx, 0.35);
  };

  const onJoyPointerUp = (e) => {
    if (joyRef.current.pointerId !== e.pointerId) return;
    joyRef.current.active = false;
    joyRef.current.pointerId = null;
    inputRef.current.steer = 0;
  };

  // ------------------------
  // Lifecycle: start/stop loop
  // ------------------------
  useEffect(() => {
    if (showTutorial) return;
    if (showSetup) return;

    const down = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
      keysRef.current.add(e.key);
      syncKeyboardToInput();
    };

    const up = (e) => {
      keysRef.current.delete(e.key);

      if (!joyRef.current.active) inputRef.current.steer = 0;

      const keys = keysRef.current;
      inputRef.current.throttle = keys.has("ArrowUp") || keys.has("w") || keys.has("W") ? 1 : 0;
      inputRef.current.brake = keys.has("ArrowDown") || keys.has("s") || keys.has("S") ? 1 : 0;

      if (!joyRef.current.active) {
        const left = keys.has("ArrowLeft") || keys.has("a") || keys.has("A") ? 1 : 0;
        const right = keys.has("ArrowRight") || keys.has("d") || keys.has("D") ? 1 : 0;
        inputRef.current.steer = right - left;
      }
    };

    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);

    const onResize = () => {
      resizeCanvas();
      buildTrack(trackRef.current.trackId ?? 0);
    };
    window.addEventListener("resize", onResize);

    resizeCanvas();

    resetRace();

    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);

    // ensure visible
    requestAnimationFrame(() => {
      if (containerRef.current) containerRef.current.scrollIntoView({ block: "start", behavior: "auto" });
      window.scrollTo({ top: 0, behavior: "auto" });
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("resize", onResize);
    };
  }, [buildTrack, loop, resetRace, resizeCanvas, showSetup, showTutorial, syncKeyboardToInput]);

  useEffect(() => {
    stateRef.current.totalLaps = laps;
  }, [laps]);

  // ------------------------
  // UI handlers
  // ------------------------
  const handleRestart = () => {
    stateRef.current.raceOver = false;
    stateRef.current.running = true;
    resetRace();
  };

  const handleBackToSetup = () => {
    stateRef.current.running = false;
    stateRef.current.raceOver = false;

    inputRef.current.throttle = 0;
    inputRef.current.brake = 0;
    inputRef.current.steer = 0;
    keysRef.current.clear();

    joyRef.current.active = false;
    joyRef.current.pointerId = null;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    setShowSetup(true);
  };

  // ------------------------
  // Render branches (hooks already declared above)
  // ------------------------
  if (showTutorial) {
    return (
      <MinigameTutorial
        title={tutorial?.title || t.title}
        description={tutorial?.description || ""}
        image={sourceImages(`./RaceGame.png`)}
        onStart={() => {
          setShowTutorial(false);
          setShowSetup(true);
        }}
        lang={lang}
      />
    );
  }

  if (showSetup) {
    return (
      <div className="race2dpro race2dpro--setup">
        <div className="race2dpro__setupCard">
          <div className="race2dpro__setupTop">
            <div>
              <div className="race2dpro__setupTitle">{t.title}</div>
              <div className="race2dpro__setupSub">{t.subtitle}</div>
            </div>

            <button className="race2dpro__setupBack" onClick={() => navigate(MINIGAMES_HOME)} type="button">
              ⟵ {t.backHome}
            </button>
          </div>

          <div className="race2dpro__setupBlock">
            <div className="race2dpro__setupBlockTitle">{t.chooseTrack}</div>
            <select
              className="race2dpro__select"
              value={trackPick}
              onChange={(e) => setTrackPick(e.target.value)}
            >
              <option value="random">🎲 {t.random}</option>
              {TRACKS.map((tr) => (
                <option key={tr.id} value={String(tr.id)}>
                  {tr.name?.[lang] || tr.name?.en || `Track ${tr.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="race2dpro__setupBlock">
            <div className="race2dpro__setupBlockTitle">{t.chooseLaps}</div>
            <div className="race2dpro__grid2">
              {[3, 5, 7].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`race2dpro__choiceCard ${laps === n ? "isActive" : ""}`}
                  onClick={() => setLaps(n)}
                >
                  <div className="race2dpro__choiceBig">{n}</div>
                  <div className="race2dpro__choiceSmall">{lang === "es" ? "Vueltas" : "Laps"}</div>
                  <div className="race2dpro__choiceMeta">
                    {n === 3 ? (lang === "es" ? "Sprint" : "Sprint") : n === 5 ? (lang === "es" ? "Carrera" : "Race") : (lang === "es" ? "Endurance" : "Endurance")}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="race2dpro__setupBlock">
            <div className="race2dpro__setupBlockTitle">{t.chooseAI}</div>

            <div className="race2dpro__grid2">
              <button
                type="button"
                className={`race2dpro__choiceCard race2dpro__choiceCard--ai ${aiMode === "easy" ? "isActive" : ""}`}
                onClick={() => setAiMode("easy")}
              >
                <div className="race2dpro__choiceHeader">
                  <div className="race2dpro__choiceTag">{t.easy}</div>
                  <div className="race2dpro__choicePill">{aiMode === "easy" ? "✓" : ""}</div>
                </div>
                <div className="race2dpro__choiceDesc">{t.easyDesc}</div>
              </button>

              <button
                type="button"
                className={`race2dpro__choiceCard race2dpro__choiceCard--ai ${aiMode === "medium" ? "isActive" : ""}`}
                onClick={() => setAiMode("medium")}
              >
                <div className="race2dpro__choiceHeader">
                  <div className="race2dpro__choiceTag">{t.medium}</div>
                  <div className="race2dpro__choicePill">{aiMode === "medium" ? "✓" : ""}</div>
                </div>
                <div className="race2dpro__choiceDesc">{t.mediumDesc}</div>
              </button>

              <button
                type="button"
                className={`race2dpro__choiceCard race2dpro__choiceCard--ai ${aiMode === "hard" ? "isActive" : ""}`}
                onClick={() => setAiMode("hard")}
              >
                <div className="race2dpro__choiceHeader">
                  <div className="race2dpro__choiceTag">{t.hard}</div>
                  <div className="race2dpro__choicePill">{aiMode === "hard" ? "✓" : ""}</div>
                </div>
                <div className="race2dpro__choiceDesc">{t.hardDesc}</div>
              </button>
            </div>
          </div>

          <div className="race2dpro__setupBlock">
            <div className="race2dpro__setupBlockTitle">{t.chooseOpp}</div>
            <div className="race2dpro__row">
              <input
                className="race2dpro__range"
                type="range"
                min={3}
                max={9}
                value={opponents}
                onChange={(e) => setOpponents(parseInt(e.target.value, 10))}
              />
              <div className="race2dpro__pill">{opponents}</div>
            </div>
            <div className="race2dpro__hint">{t.touchHint}</div>
          </div>

          <div className="race2dpro__setupFooter">
            <button
              className="race2dpro__start"
              type="button"
              onClick={() => {
                // ensure any previous loop is stopped
                if (rafRef.current) cancelAnimationFrame(rafRef.current);
                setShowSetup(false);
              }}
            >
              {t.startRace}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Gameplay render
  return (
    <div ref={containerRef} className="race2dpro">
      <div className="race2dpro__ui">
        <div className="race2dpro__hudTop">
          <div className="race2dpro__hudTitle">
            <div className="race2dpro__titleMain">{t.title}</div>
            <div className="race2dpro__titleSub">{t.subtitle}</div>
          </div>

          <div className="race2dpro__trackPill" title={trackLabel}>
            <span className="race2dpro__trackDot" />
            <span>{t.track}: {trackLabel}</span>
          </div>
        </div>

        <div className="race2dpro__hudStrip">
          <div className="race2dpro__hudBottom">
            <div className="race2dpro__chips">
              <div className="race2dpro__chip">
                <span className="race2dpro__chipLabel">{t.position}</span>
                <span className="race2dpro__chipValue">{hud.pos}/{hud.total}</span>
              </div>
              <div className="race2dpro__chip">
                <span className="race2dpro__chipLabel">{t.lap}</span>
                <span className="race2dpro__chipValue">{hud.lap}</span>
              </div>
              <div className="race2dpro__chip">
                <span className="race2dpro__chipLabel">{t.speed}</span>
                <span className="race2dpro__chipValue">{hud.speed} {t.sim}</span>
              </div>

              <div className={`race2dpro__statusPill ${hud.note ? "isVisible" : ""}`}>
                <strong>INFO</strong> {hud.note || "·"}
              </div>
            </div>

            <div className="race2dpro__controls">
              <button className="race2dpro__btn" onClick={handleRestart} type="button">{t.restart}</button>
              <button className="race2dpro__btn race2dpro__btn--ghost" onClick={handleBackToSetup} type="button">{t.backToSetup}</button>
              <button className="race2dpro__btn race2dpro__btn--ghost" onClick={() => navigate(MINIGAMES_HOME)} type="button">
                ⟵ {t.backHome}
              </button>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="race2dpro__canvas" />

      {/* Mobile leaderboard */}
      <div className="race2dpro__leaderboard">
        <div className="race2dpro__leaderboardTitle">{t.standings}</div>
        {leaderboard.slice(0, 8).map((c, i) => {
          const st = stateRef.current;
          const l = c.finished ? "FIN" : `L${Math.min(c.lap, st.totalLaps)}`;
          return (
            <div key={c.name + i} className={`race2dpro__leaderboardRow ${c.isPlayer ? "isPlayer" : ""}`}>
              <span className="race2dpro__leaderboardPos">{i + 1}.</span>
              <span className="race2dpro__leaderboardName" style={{ color: c.color }}>
                {c.name}
              </span>
              <span className="race2dpro__leaderboardLap">{l}</span>
            </div>
          );
        })}
      </div>

      {/* Touch controls */}
      <div className="race2dpro__touch">
        <div
          className="race2dpro__joy"
          onPointerDown={onJoyPointerDown}
          onPointerMove={onJoyPointerMove}
          onPointerUp={onJoyPointerUp}
          onPointerCancel={onJoyPointerUp}
        >
          <div className={`race2dpro__joyKnob ${joyRef.current.active ? "isActive" : ""}`} />
        </div>

        <div className="race2dpro__touchRight">
          <button
            className="race2dpro__touchBtn"
            onPointerDown={() => onTouchThrottle(true)}
            onPointerUp={() => onTouchThrottle(false)}
            onPointerCancel={() => onTouchThrottle(false)}
          >
            ⬆
          </button>
          <button
            className="race2dpro__touchBtn"
            onPointerDown={() => onTouchBrake(true)}
            onPointerUp={() => onTouchBrake(false)}
            onPointerCancel={() => onTouchBrake(false)}
          >
            ⬇
          </button>
        </div>
      </div>
    </div>
  );
}