import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import "./RaceGame2DPro.css";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SECTION 1: Utilities
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SECTION 2: ENVIRONMENTS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ENVIRONMENTS = {
  "neon-city": {
    name: { es: "Circuito Urbano", en: "Urban Circuit" },
    roadColor: "#3a4048", borderColor: "#f6f6f6", glowColor: "rgba(255,255,255,0.12)",
    runoffColor: "#6b7480", kerbRed: "#e03030", kerbWhite: "#f3f3f3",
    bgColor: "#4a5a6e", grassColor: "#5a7060", centerLineColor: "rgba(255,255,255,0.30)",
    starfield: false,
    barrierColor: "#1e5eff",
    treeColor: "#2e5535",
    treeCount: 22,
    hasCrowd: true,
    runoffType: "asphalt",
  },
  "volcano": {
    name: { es: "Circuito Montana", en: "Mountain Circuit" },
    roadColor: "#444850", borderColor: "#f6f6f6", glowColor: "rgba(255,255,255,0.12)",
    runoffColor: "#9c8060", kerbRed: "#d8402e", kerbWhite: "#f4f4f4",
    bgColor: "#7a6040", grassColor: "#8a7050", centerLineColor: "rgba(255,255,255,0.28)",
    starfield: false,
    barrierColor: "#e05500",
    treeColor: "#6a5030",
    treeCount: 14,
    hasCrowd: false,
    runoffType: "gravel",
  },
  "arctic": {
    name: { es: "Circuito Costa", en: "Coastal Circuit" },
    roadColor: "#464c54", borderColor: "#f7f7f7", glowColor: "rgba(255,255,255,0.14)",
    runoffColor: "#dce8f0", kerbRed: "#d04040", kerbWhite: "#f5f5f5",
    bgColor: "#7090b0", grassColor: "#a0b8c8", centerLineColor: "rgba(255,255,255,0.32)",
    starfield: false,
    barrierColor: "#4488ff",
    treeColor: "#2a5038",
    treeCount: 18,
    hasCrowd: true,
    runoffType: "snow",
  },
  "jungle": {
    name: { es: "Circuito Bosque", en: "Forest Circuit" },
    roadColor: "#404848", borderColor: "#f7f7f7", glowColor: "rgba(255,255,255,0.12)",
    runoffColor: "#3a6830", kerbRed: "#cc4030", kerbWhite: "#f4f4f4",
    bgColor: "#2a6840", grassColor: "#1e5428", centerLineColor: "rgba(255,255,255,0.28)",
    starfield: false,
    barrierColor: "#208020",
    treeColor: "#144a18",
    treeCount: 30,
    hasCrowd: false,
    runoffType: "grass",
  },
  "desert": {
    name: { es: "Circuito Desierto", en: "Desert Circuit" },
    roadColor: "#4c5058", borderColor: "#f7f7f7", glowColor: "rgba(255,255,255,0.12)",
    runoffColor: "#c8a058", kerbRed: "#c84030", kerbWhite: "#f5f5f5",
    bgColor: "#d4a84c", grassColor: "#c09040", centerLineColor: "rgba(255,255,255,0.28)",
    starfield: false,
    barrierColor: "#cc8800",
    treeColor: "#8a6810",
    treeCount: 10,
    hasCrowd: false,
    runoffType: "sand",
  },
  "space": {
    name: { es: "Grand Prix", en: "Grand Prix" },
    roadColor: "#424850", borderColor: "#f8f8f8", glowColor: "rgba(255,255,255,0.14)",
    runoffColor: "#606878", kerbRed: "#d04040", kerbWhite: "#f4f4f4",
    bgColor: "#7090b8", grassColor: "#607858", centerLineColor: "rgba(255,255,255,0.30)",
    starfield: false,
    barrierColor: "#0055ff",
    treeColor: "#204a28",
    treeCount: 20,
    hasCrowd: true,
    runoffType: "asphalt",
  },
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SECTION 3: TRACKS (18 tracks â€” 3 per environment)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const TRACKS = [
  {
    id: 0,
    envId: "neon-city",
    layout: "flow",
    name: { es: "Metropolitan GP", en: "Metropolitan GP" },
    trackWidth: 46,
    raw: [
      [-1.78, -0.16], [-1.62, -0.68], [-1.10, -1.02], [-0.40, -1.12], [0.36, -1.06], [1.04, -0.82],
      [1.52, -0.42], [1.74, 0.18], [1.56, 0.72], [1.02, 1.02], [0.30, 1.10], [-0.34, 0.94],
      [-0.72, 0.58], [-0.60, 0.20], [-0.24, -0.04], [-0.52, -0.30], [-1.00, -0.38], [-1.42, -0.10],
    ],
  },
  {
    id: 1,
    envId: "neon-city",
    layout: "technical",
    name: { es: "Harbor Street", en: "Harbor Street" },
    trackWidth: 42,
    raw: [
      [-1.72, -0.08], [-1.64, -0.64], [-1.22, -1.02], [-0.64, -1.12], [-0.06, -0.96], [0.18, -0.56],
      [-0.02, -0.16], [0.30, 0.16], [0.90, 0.04], [1.46, -0.30], [1.72, 0.08], [1.56, 0.60],
      [1.06, 0.96], [0.32, 1.10], [-0.40, 0.98], [-0.82, 0.66], [-0.64, 0.30], [-1.06, 0.18], [-1.42, 0.42],
    ],
  },
  {
    id: 2,
    envId: "neon-city",
    layout: "oval",
    name: { es: "City Speedway", en: "City Speedway" },
    trackWidth: 52,
    raw: [
      [-1.90, -0.30], [-1.90, 0.34], [-1.56, 0.76], [-0.96, 0.94], [-0.14, 0.98], [0.64, 0.90],
      [1.30, 0.66], [1.76, 0.26], [1.86, -0.20], [1.56, -0.58], [0.96, -0.82], [0.14, -0.92],
      [-0.62, -0.86], [-1.20, -0.62], [-1.52, -0.22],
    ],
  },
  {
    id: 3,
    envId: "volcano",
    layout: "flow",
    name: { es: "Caldera GP", en: "Caldera GP" },
    trackWidth: 46,
    raw: [
      [-1.80, 0.00], [-1.56, -0.56], [-1.00, -0.96], [-0.24, -1.12], [0.58, -1.02], [1.24, -0.68],
      [1.66, -0.14], [1.72, 0.46], [1.38, 0.90], [0.78, 1.10], [0.04, 1.06], [-0.54, 0.82],
      [-0.90, 0.46], [-0.82, 0.10], [-0.42, -0.16], [-0.72, -0.42], [-1.24, -0.32], [-1.56, 0.08],
    ],
  },
  {
    id: 4,
    envId: "volcano",
    layout: "technical",
    name: { es: "Crater Complex", en: "Crater Complex" },
    trackWidth: 40,
    raw: [
      [-1.72, -0.04], [-1.62, -0.60], [-1.24, -0.98], [-0.74, -1.14], [-0.20, -1.00], [0.06, -0.62],
      [-0.10, -0.24], [0.24, 0.06], [0.80, -0.06], [1.28, -0.42], [1.60, -0.86], [1.78, -0.36],
      [1.70, 0.26], [1.36, 0.74], [0.84, 1.04], [0.24, 1.12], [-0.42, 1.02], [-0.94, 0.74],
      [-1.22, 0.36], [-1.40, 0.62],
    ],
  },
  {
    id: 5,
    envId: "volcano",
    layout: "oval",
    name: { es: "Lava Speedway", en: "Lava Speedway" },
    trackWidth: 50,
    raw: [
      [-1.92, -0.28], [-1.92, 0.32], [-1.64, 0.74], [-1.06, 0.90], [-0.20, 0.94], [0.70, 0.86],
      [1.36, 0.58], [1.78, 0.18], [1.90, -0.18], [1.70, -0.50], [1.30, -0.72], [0.70, -0.86],
      [-0.08, -0.92], [-0.82, -0.84], [-1.40, -0.62], [-1.72, -0.34],
    ],
  },
  {
    id: 6,
    envId: "arctic",
    layout: "flow",
    name: { es: "North Loop", en: "North Loop" },
    trackWidth: 48,
    raw: [
      [-1.76, -0.12], [-1.52, -0.70], [-0.94, -1.06], [-0.16, -1.14], [0.62, -1.00], [1.26, -0.64],
      [1.64, -0.08], [1.68, 0.54], [1.30, 0.98], [0.64, 1.14], [-0.12, 1.06], [-0.70, 0.78],
      [-1.00, 0.36], [-0.86, -0.04], [-0.46, -0.26], [-0.74, -0.52], [-1.28, -0.44], [-1.58, -0.08],
    ],
  },
  {
    id: 7,
    envId: "arctic",
    layout: "technical",
    name: { es: "Ice Chicane", en: "Ice Chicane" },
    trackWidth: 38,
    raw: [
      [-1.68, -0.06], [-1.58, -0.58], [-1.20, -0.96], [-0.66, -1.12], [-0.12, -0.96], [0.12, -0.62],
      [-0.04, -0.28], [0.30, -0.02], [0.84, -0.22], [1.30, -0.64], [1.62, -0.90], [1.78, -0.42],
      [1.72, 0.22], [1.42, 0.70], [0.92, 1.00], [0.30, 1.10], [-0.34, 0.96], [-0.76, 0.62],
      [-0.54, 0.24], [-1.04, 0.22], [-1.40, 0.46],
    ],
  },
  {
    id: 8,
    envId: "arctic",
    layout: "oval",
    name: { es: "Polar Ring", en: "Polar Ring" },
    trackWidth: 54,
    raw: [
      [-1.88, -0.26], [-1.88, 0.30], [-1.58, 0.70], [-1.02, 0.88], [-0.18, 0.96], [0.72, 0.88],
      [1.40, 0.62], [1.82, 0.22], [1.90, -0.22], [1.62, -0.60], [1.00, -0.84], [0.16, -0.92],
      [-0.70, -0.86], [-1.30, -0.64], [-1.66, -0.32],
    ],
  },
  {
    id: 9,
    envId: "jungle",
    layout: "flow",
    name: { es: "Rainforest GP", en: "Rainforest GP" },
    trackWidth: 46,
    raw: [
      [-1.78, 0.04], [-1.58, -0.54], [-1.08, -0.96], [-0.34, -1.14], [0.44, -1.08], [1.08, -0.78],
      [1.54, -0.30], [1.72, 0.30], [1.50, 0.86], [0.96, 1.10], [0.22, 1.16], [-0.44, 1.00],
      [-0.88, 0.66], [-0.80, 0.24], [-0.40, -0.02], [-0.64, -0.34], [-1.16, -0.36], [-1.54, -0.08],
    ],
  },
  {
    id: 10,
    envId: "jungle",
    layout: "technical",
    name: { es: "Canopy Chicane", en: "Canopy Chicane" },
    trackWidth: 40,
    raw: [
      [-1.70, 0.00], [-1.62, -0.56], [-1.24, -0.96], [-0.74, -1.12], [-0.18, -1.00], [0.08, -0.66],
      [-0.08, -0.32], [0.26, -0.02], [0.80, 0.06], [1.34, -0.22], [1.66, -0.62], [1.80, -0.16],
      [1.66, 0.42], [1.28, 0.84], [0.74, 1.08], [0.10, 1.14], [-0.50, 0.98], [-0.90, 0.60],
      [-0.66, 0.20], [-1.12, 0.12], [-1.46, 0.46],
    ],
  },
  {
    id: 11,
    envId: "jungle",
    layout: "oval",
    name: { es: "Jungle Sprint", en: "Jungle Sprint" },
    trackWidth: 50,
    raw: [
      [-1.82, -0.24], [-1.82, 0.30], [-1.52, 0.66], [-0.96, 0.84], [-0.10, 0.92], [0.80, 0.86],
      [1.44, 0.62], [1.78, 0.26], [1.86, -0.12], [1.64, -0.48], [1.20, -0.70], [0.58, -0.84],
      [-0.18, -0.90], [-0.88, -0.82], [-1.42, -0.62], [-1.70, -0.30],
    ],
  },
  {
    id: 12,
    envId: "desert",
    layout: "flow",
    name: { es: "Sahara GP", en: "Sahara GP" },
    trackWidth: 55,
    raw: [
      [-1.86, -0.02], [-1.64, -0.60], [-1.04, -0.98], [-0.24, -1.14], [0.62, -1.06], [1.28, -0.74],
      [1.70, -0.24], [1.82, 0.34], [1.54, 0.86], [0.94, 1.12], [0.16, 1.16], [-0.52, 0.98],
      [-0.96, 0.62], [-0.86, 0.18], [-0.40, -0.08], [-0.66, -0.40], [-1.24, -0.40], [-1.62, -0.10],
    ],
  },
  {
    id: 13,
    envId: "desert",
    layout: "technical",
    name: { es: "Dune Technical", en: "Dune Technical" },
    trackWidth: 42,
    raw: [
      [-1.78, -0.04], [-1.66, -0.62], [-1.28, -1.00], [-0.76, -1.14], [-0.22, -0.98], [0.02, -0.60],
      [-0.12, -0.26], [0.24, 0.04], [0.86, -0.08], [1.40, -0.42], [1.74, -0.82], [1.86, -0.28],
      [1.72, 0.34], [1.34, 0.78], [0.78, 1.06], [0.12, 1.14], [-0.58, 1.00], [-1.06, 0.70],
      [-1.34, 0.30], [-1.50, 0.60],
    ],
  },
  {
    id: 14,
    envId: "desert",
    layout: "oval",
    name: { es: "Desert Storm", en: "Desert Storm" },
    trackWidth: 58,
    raw: [
      [-1.96, -0.28], [-1.96, 0.30], [-1.66, 0.72], [-1.08, 0.90], [-0.18, 0.98], [0.74, 0.90],
      [1.42, 0.64], [1.86, 0.24], [1.94, -0.20], [1.66, -0.60], [1.08, -0.84], [0.24, -0.94],
      [-0.66, -0.88], [-1.32, -0.66], [-1.74, -0.34],
    ],
  },
  {
    id: 15,
    envId: "space",
    layout: "flow",
    name: { es: "Orbital GP", en: "Orbital GP" },
    trackWidth: 48,
    raw: [
      [-1.80, -0.10], [-1.56, -0.64], [-0.98, -1.00], [-0.20, -1.12], [0.58, -1.02], [1.22, -0.70],
      [1.64, -0.20], [1.72, 0.38], [1.44, 0.88], [0.88, 1.10], [0.14, 1.12], [-0.50, 0.94],
      [-0.92, 0.58], [-0.82, 0.20], [-0.42, -0.06], [-0.70, -0.34], [-1.22, -0.34], [-1.56, -0.08],
    ],
  },
  {
    id: 16,
    envId: "space",
    layout: "technical",
    name: { es: "Station Complex", en: "Station Complex" },
    trackWidth: 38,
    raw: [
      [-1.72, -0.02], [-1.62, -0.60], [-1.24, -0.98], [-0.70, -1.12], [-0.14, -0.96], [0.10, -0.62],
      [-0.06, -0.26], [0.30, 0.02], [0.86, -0.12], [1.34, -0.46], [1.66, -0.86], [1.80, -0.32],
      [1.68, 0.28], [1.32, 0.74], [0.82, 1.02], [0.20, 1.12], [-0.46, 1.00], [-0.94, 0.68],
      [-1.20, 0.30], [-1.42, 0.56],
    ],
  },
  {
    id: 17,
    envId: "space",
    layout: "oval",
    name: { es: "Hyperdrive", en: "Hyperdrive" },
    trackWidth: 55,
    raw: [
      [-1.94, -0.26], [-1.94, 0.28], [-1.62, 0.70], [-1.04, 0.88], [-0.18, 0.96], [0.72, 0.88],
      [1.40, 0.62], [1.86, 0.24], [1.96, -0.18], [1.72, -0.56], [1.20, -0.82], [0.38, -0.92],
      [-0.48, -0.90], [-1.18, -0.70], [-1.68, -0.36],
    ],
  },
];

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SECTION 4: AI profiles, weather profiles, physics constants
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const AI_PROFILES = {
  easy:   { speedFactor: 0.78, lineOffset: 0.55, brakeMargin: 1.45, errorRate: 0.18,  errorMag: 0.4,  turboUse: 0.00, apexPrecision: 0.6  },
  medium: { speedFactor: 0.91, lineOffset: 0.28, brakeMargin: 1.10, errorRate: 0.05,  errorMag: 0.18, turboUse: 0.25, apexPrecision: 0.82 },
  hard:   { speedFactor: 1.00, lineOffset: 0.08, brakeMargin: 0.88, errorRate: 0.008, errorMag: 0.05, turboUse: 0.75, apexPrecision: 0.97 },
};

const WEATHER_PROFILES = {
  dry:  { label: { es: "Seco", en: "Dry" }, icon: "SUN", gripMult: 1.00, rainOverlay: false },
  rain: { label: { es: "Lluvia", en: "Rain" }, icon: "RAIN", gripMult: 0.72, rainOverlay: true },
  dusk: { label: { es: "Crepusculo", en: "Dusk" }, icon: "DUSK", gripMult: 0.90, rainOverlay: false },
};

const PHYS = {
  MAX_SPEED: 420, ACCEL: 340, BRAKE_DECEL: 700, NATURAL_DECEL: 60,
  STEER_RATE: 3.2, GRIP_BASE: 9.5,
  TURBO_BOOST: 190, TURBO_DURATION: 1.8, TURBO_COOLDOWN: 6.0,
  TURBO_FILL_RATE: 0.13, NEAR_MISS_BONUS: 0.20,
  CAR_RADIUS: 14,
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SECTION 5: Track engine â€” buildTrack and query functions
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function buildTrack(trackDef, canvasW, canvasH) {
  const SAMPLES = 800;
  const raw = trackDef.raw;
  const n = raw.length;
  const scaleX = canvasW * 0.92;
  const scaleY = canvasH * 0.84;
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SECTION 6: Car creation and physics
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  car.collided = false;

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
        car.collided = true;
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SECTION 7: Canvas rendering pipeline
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

function updateFollowCamera(camera, player, dt) {
  if (!camera || !player) return;
  const lookAhead = 110 + player.speed * 0.46;
  const tx = player.x + Math.cos(player.a) * lookAhead + player.vx * 0.14;
  const ty = player.y + Math.sin(player.a) * lookAhead + player.vy * 0.14;
  const blend = clamp(dt * 4.0, 0, 1);
  camera.x = lerp(camera.x, tx, blend);
  camera.y = lerp(camera.y, ty, blend);
  const targetZoom = clamp(0.94 - (player.speed / PHYS.MAX_SPEED) * 0.20, 0.68, 0.94);
  camera.zoom = lerp(camera.zoom, targetZoom, clamp(dt * 2.6, 0, 1));
  camera.shakeX = lerp(camera.shakeX || 0, 0, clamp(dt * 8, 0, 1));
  camera.shakeY = lerp(camera.shakeY || 0, 0, clamp(dt * 8, 0, 1));
}

function applyCameraTransform(ctx, camera, w, h) {
  if (!camera) return;
  ctx.setTransform(
    camera.zoom,
    0,
    0,
    camera.zoom,
    w / 2 - (camera.x + (camera.shakeX || 0)) * camera.zoom,
    h / 2 - (camera.y + (camera.shakeY || 0)) * camera.zoom
  );
}

function renderTrack(ctx, track, env) {
  const samples = track.samples;
  const N = samples.length;
  const hw = track.trackWidth / 2;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Runoff area around the asphalt.
  ctx.beginPath();
  ctx.strokeStyle = env.runoffColor || "rgba(86, 92, 102, 0.95)";
  ctx.lineWidth = track.trackWidth + 30;
  for (let i = 0; i <= N; i++) {
    const s = samples[i % N];
    i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y);
  }
  ctx.stroke();

  // Main asphalt.
  ctx.beginPath();
  ctx.strokeStyle = env.roadColor;
  ctx.lineWidth = track.trackWidth + 4;
  for (let i = 0; i <= N; i++) {
    const s = samples[i % N];
    i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y);
  }
  ctx.stroke();

  // Dashed center line.
  ctx.setLineDash([18, 14]);
  ctx.strokeStyle = env.centerLineColor;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const s = samples[i % N];
    i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // White limits on both sides.
  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = env.glowColor;
  ctx.strokeStyle = env.borderColor;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const s = samples[i % N];
    const nx = -Math.sin(s.ang) * hw;
    const ny = Math.cos(s.ang) * hw;
    i === 0 ? ctx.moveTo(s.x + nx, s.y + ny) : ctx.lineTo(s.x + nx, s.y + ny);
  }
  ctx.stroke();

  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const s = samples[i % N];
    const nx = Math.sin(s.ang) * hw;
    const ny = -Math.cos(s.ang) * hw;
    i === 0 ? ctx.moveTo(s.x + nx, s.y + ny) : ctx.lineTo(s.x + nx, s.y + ny);
  }
  ctx.stroke();
  ctx.restore();

  // Curb paint on high-curvature zones.
  const kerbStep = 3;
  const kerbThreshold = 0.022;
  ctx.lineWidth = 4.2;
  for (let i = 0; i < N; i += kerbStep) {
    const a = samples[i % N];
    const b = samples[(i + kerbStep) % N];
    const curvature = (a.curvature + b.curvature) * 0.5;
    if (curvature < kerbThreshold) continue;

    const anX = -Math.sin(a.ang);
    const anY = Math.cos(a.ang);
    const bnX = -Math.sin(b.ang);
    const bnY = Math.cos(b.ang);

    for (const side of [-1, 1]) {
      const ax = a.x + anX * hw * side;
      const ay = a.y + anY * hw * side;
      const bx = b.x + bnX * hw * side;
      const by = b.y + bnY * hw * side;
      const paintIndex = Math.floor(i / kerbStep) + (side === 1 ? 0 : 1);
      ctx.strokeStyle = paintIndex % 2 === 0 ? (env.kerbRed || "#d94848") : (env.kerbWhite || "#f5f5f5");
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
  }

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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SECTION 8: TrackPreviewCanvas auxiliary component
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SECTION 9: Main RaceGame2DPro component
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const CAR_COLORS = [
  "#00f5ff", "#ff4500", "#39ff14", "#ffd700",
  "#bf00ff", "#ff69b4", "#00bfff", "#ff8c00",
];

export default function RaceGame2DPro() {
  const lang = navigator.language?.startsWith("es") ? "es" : "en";

  const T = {
    es: {
      title: "Race 2D Pro", subtitle: "18 circuitos | 3 dificultades | Turbo | Clima",
      selectTrack: "Circuito", selectDifficulty: "Dificultad IA",
      selectWeather: "Clima", selectLaps: "Vueltas", selectRivals: "Rivales",
      easy: "Facil", medium: "Medio", hard: "Dificil",
      startRace: "Iniciar Carrera",
      raceOver: "Carrera terminada", restart: "Reiniciar",
      backToSetup: "Setup",
      posLabel: "POS", lapLabel: "VUELTA", speedUnit: "km/h",
      you: "Tu", rival: "Rival",
      laps: "Vueltas", rivals: "Rivales",
      keyHint: "UP/DOWN Acelerar/Frenar | LEFT/RIGHT Girar | SPACE Turbo | R Reiniciar",
    },
    en: {
      title: "Race 2D Pro", subtitle: "18 circuits | 3 difficulties | Turbo | Weather",
      selectTrack: "Circuit", selectDifficulty: "AI Difficulty",
      selectWeather: "Weather", selectLaps: "Laps", selectRivals: "Rivals",
      easy: "Easy", medium: "Medium", hard: "Hard",
      startRace: "Start Race",
      raceOver: "Race Over!", restart: "Restart",
      backToSetup: "Setup",
      posLabel: "POS", lapLabel: "LAP", speedUnit: "km/h",
      you: "You", rival: "Rival",
      laps: "Laps", rivals: "Rivals",
      keyHint: "UP/DOWN Throttle/Brake | LEFT/RIGHT Steer | SPACE Turbo | R Restart",
    },
  };
  const t = T[lang];

  // â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [screen, setScreen] = useState("setup");
  const [selectedTrackId, setSelectedTrackId] = useState(0);
  const [aiDifficulty, setAiDifficulty] = useState("medium");
  const [weatherKey, setWeatherKey] = useState("dry");
  const [laps, setLaps] = useState(3);
  const [rivals, setRivals] = useState(5);
  const [hud, setHud] = useState({
    pos: 1, total: 6, lap: 1, totalLaps: 3,
    speed: 0, turbo: 0, turboActive: false, weatherIcon: "SUN",
  });
  const [semaphore, setSemaphore] = useState({ phase: "off", lights: [false, false, false] });
  const [joyKnob, setJoyKnob] = useState({ dx: 0, dy: 0 });
  const [endData, setEndData] = useState(null);

  // â”€â”€ Refs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  const pendingStartRef = useRef(false);

  // â”€â”€ startRace â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const initializeRace = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

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
      camera: { x: startPt.x, y: startPt.y, zoom: 1, shakeX: 0, shakeY: 0 },
    };

    frameCountRef.current = 0;
    keysRef.current.clear();
    inputRef.current = { throttle: 0, brake: 0, steer: 0, touchThrottle: false, touchBrake: false };
    joyRef.current = { active: false, pointerId: null, cx: 0, cy: 0, dx: 0, dy: 0 };

    setEndData(null);
    setSemaphore({ phase: "countdown", lights: [false, false, false] });
    return true;
  }, [selectedTrackId, aiDifficulty, weatherKey, laps, rivals]);

  const startRace = useCallback(() => {
    setScreen("race");
    pendingStartRef.current = !initializeRace();
  }, [initializeRace]);

  useEffect(() => {
    if (screen !== "race" || !pendingStartRef.current) return;
    if (initializeRace()) pendingStartRef.current = false;
  }, [screen, initializeRace]);

  // â”€â”€ Touch handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Game loop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€ RAF loop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

      // â”€â”€ Countdown / semaphore â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

      // â”€â”€ Keyboard / joystick input â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

      // â”€â”€ Update cars â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

      // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      ctx.save();
      renderBackground(ctx, W, H, g.env, g.weather, starfieldRef.current, g.time);

      const playerCar = g.cars.find(c => c.isPlayer);
      if (playerCar) {
        if (playerCar.collided) {
          g.camera.shakeX += (Math.random() - 0.5) * 22;
          g.camera.shakeY += (Math.random() - 0.5) * 22;
        }
        updateFollowCamera(g.camera, playerCar, dt);
      }
      applyCameraTransform(ctx, g.camera, W, H);
      renderTrack(ctx, g.track, g.env);
      renderStartGrid(ctx, g.cars, g.startPhase, g.phaseTimer, g.env);
      for (const car of g.cars) {
        if (!car.isPlayer) renderCar(ctx, car, false);
      }
      if (playerCar) renderCar(ctx, playerCar, true);
      ctx.restore();
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // â”€â”€ Minimap â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      mmCtx.save();
      renderMinimap(mmCtx, g.track, g.cars, MM_W, MM_H);
      mmCtx.restore();

      // â”€â”€ HUD update (every ~8 frames) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

      // â”€â”€ End detection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ JSX â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // Setup screen
  if (screen === "setup") {
    return (
      <div className="r2p">
        <div className="r2p__setup">
          <div className="r2p__setupCard">
            <div className="r2p__setupHeader">
              <div>
                <div className="r2p__setupTitle">GRID | {t.title}</div>
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
              {t.startRace} GO
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
            <div className="r2p__endTitle">FINISH | {t.raceOver}</div>
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
                        {row.pos === 1 ? "1ST" : row.pos === 2 ? "2ND" : row.pos === 3 ? "3RD" : row.pos}
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
                {t.restart} AGAIN
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
            UP
          </button>
          <button
            className="r2p__touchBtn"
            type="button"
            onPointerDown={() => onTouchBrake(true)}
            onPointerUp={() => onTouchBrake(false)}
            onPointerCancel={() => onTouchBrake(false)}
          >
            DOWN
          </button>
        </div>
      </div>

      <div className="r2p__keyHint">{t.keyHint}</div>
    </div>
  );
}


const CIRCUIT_REFERENCE_TELEMETRY = [
  { circuitId: 0, marker: 0, s: 0.0000, segment: 'chicane' },
  { circuitId: 0, marker: 1, s: 0.0059, segment: 'corner' },
  { circuitId: 0, marker: 2, s: 0.0118, segment: 'corner' },
  { circuitId: 0, marker: 3, s: 0.0176, segment: 'corner' },
  { circuitId: 0, marker: 4, s: 0.0235, segment: 'corner' },
  { circuitId: 0, marker: 5, s: 0.0294, segment: 'straight' },
  { circuitId: 0, marker: 6, s: 0.0353, segment: 'corner' },
  { circuitId: 0, marker: 7, s: 0.0412, segment: 'hairpin' },
  { circuitId: 0, marker: 8, s: 0.0471, segment: 'corner' },
  { circuitId: 0, marker: 9, s: 0.0529, segment: 'corner' },
  { circuitId: 0, marker: 10, s: 0.0588, segment: 'straight' },
  { circuitId: 0, marker: 11, s: 0.0647, segment: 'chicane' },
  { circuitId: 0, marker: 12, s: 0.0706, segment: 'corner' },
  { circuitId: 0, marker: 13, s: 0.0765, segment: 'corner' },
  { circuitId: 0, marker: 14, s: 0.0824, segment: 'hairpin' },
  { circuitId: 0, marker: 15, s: 0.0882, segment: 'straight' },
  { circuitId: 0, marker: 16, s: 0.0941, segment: 'corner' },
  { circuitId: 0, marker: 17, s: 0.1000, segment: 'corner' },
  { circuitId: 0, marker: 18, s: 0.1059, segment: 'corner' },
  { circuitId: 0, marker: 19, s: 0.1118, segment: 'corner' },
  { circuitId: 0, marker: 20, s: 0.1176, segment: 'straight' },
  { circuitId: 0, marker: 21, s: 0.1235, segment: 'hairpin' },
  { circuitId: 0, marker: 22, s: 0.1294, segment: 'chicane' },
  { circuitId: 0, marker: 23, s: 0.1353, segment: 'corner' },
  { circuitId: 0, marker: 24, s: 0.1412, segment: 'corner' },
  { circuitId: 0, marker: 25, s: 0.1471, segment: 'straight' },
  { circuitId: 0, marker: 26, s: 0.1529, segment: 'corner' },
  { circuitId: 0, marker: 27, s: 0.1588, segment: 'corner' },
  { circuitId: 0, marker: 28, s: 0.1647, segment: 'hairpin' },
  { circuitId: 0, marker: 29, s: 0.1706, segment: 'corner' },
  { circuitId: 0, marker: 30, s: 0.1765, segment: 'straight' },
  { circuitId: 0, marker: 31, s: 0.1824, segment: 'corner' },
  { circuitId: 0, marker: 32, s: 0.1882, segment: 'corner' },
  { circuitId: 0, marker: 33, s: 0.1941, segment: 'chicane' },
  { circuitId: 0, marker: 34, s: 0.2000, segment: 'corner' },
  { circuitId: 0, marker: 35, s: 0.2059, segment: 'hairpin' },
  { circuitId: 0, marker: 36, s: 0.2118, segment: 'corner' },
  { circuitId: 0, marker: 37, s: 0.2176, segment: 'corner' },
  { circuitId: 0, marker: 38, s: 0.2235, segment: 'corner' },
  { circuitId: 0, marker: 39, s: 0.2294, segment: 'corner' },
  { circuitId: 0, marker: 40, s: 0.2353, segment: 'straight' },
  { circuitId: 0, marker: 41, s: 0.2412, segment: 'corner' },
  { circuitId: 0, marker: 42, s: 0.2471, segment: 'hairpin' },
  { circuitId: 0, marker: 43, s: 0.2529, segment: 'corner' },
  { circuitId: 0, marker: 44, s: 0.2588, segment: 'chicane' },
  { circuitId: 0, marker: 45, s: 0.2647, segment: 'straight' },
  { circuitId: 0, marker: 46, s: 0.2706, segment: 'corner' },
  { circuitId: 0, marker: 47, s: 0.2765, segment: 'corner' },
  { circuitId: 0, marker: 48, s: 0.2824, segment: 'corner' },
  { circuitId: 0, marker: 49, s: 0.2882, segment: 'hairpin' },
  { circuitId: 0, marker: 50, s: 0.2941, segment: 'straight' },
  { circuitId: 0, marker: 51, s: 0.3000, segment: 'corner' },
  { circuitId: 0, marker: 52, s: 0.3059, segment: 'corner' },
  { circuitId: 0, marker: 53, s: 0.3118, segment: 'corner' },
  { circuitId: 0, marker: 54, s: 0.3176, segment: 'corner' },
  { circuitId: 0, marker: 55, s: 0.3235, segment: 'chicane' },
  { circuitId: 0, marker: 56, s: 0.3294, segment: 'hairpin' },
  { circuitId: 0, marker: 57, s: 0.3353, segment: 'corner' },
  { circuitId: 0, marker: 58, s: 0.3412, segment: 'corner' },
  { circuitId: 0, marker: 59, s: 0.3471, segment: 'corner' },
  { circuitId: 0, marker: 60, s: 0.3529, segment: 'straight' },
  { circuitId: 0, marker: 61, s: 0.3588, segment: 'corner' },
  { circuitId: 0, marker: 62, s: 0.3647, segment: 'corner' },
  { circuitId: 0, marker: 63, s: 0.3706, segment: 'hairpin' },
  { circuitId: 0, marker: 64, s: 0.3765, segment: 'corner' },
  { circuitId: 0, marker: 65, s: 0.3824, segment: 'straight' },
  { circuitId: 0, marker: 66, s: 0.3882, segment: 'chicane' },
  { circuitId: 0, marker: 67, s: 0.3941, segment: 'corner' },
  { circuitId: 0, marker: 68, s: 0.4000, segment: 'corner' },
  { circuitId: 0, marker: 69, s: 0.4059, segment: 'corner' },
  { circuitId: 0, marker: 70, s: 0.4118, segment: 'hairpin' },
  { circuitId: 0, marker: 71, s: 0.4176, segment: 'corner' },
  { circuitId: 0, marker: 72, s: 0.4235, segment: 'corner' },
  { circuitId: 0, marker: 73, s: 0.4294, segment: 'corner' },
  { circuitId: 0, marker: 74, s: 0.4353, segment: 'corner' },
  { circuitId: 0, marker: 75, s: 0.4412, segment: 'straight' },
  { circuitId: 0, marker: 76, s: 0.4471, segment: 'corner' },
  { circuitId: 0, marker: 77, s: 0.4529, segment: 'chicane' },
  { circuitId: 0, marker: 78, s: 0.4588, segment: 'corner' },
  { circuitId: 0, marker: 79, s: 0.4647, segment: 'corner' },
  { circuitId: 0, marker: 80, s: 0.4706, segment: 'straight' },
  { circuitId: 0, marker: 81, s: 0.4765, segment: 'corner' },
  { circuitId: 0, marker: 82, s: 0.4824, segment: 'corner' },
  { circuitId: 0, marker: 83, s: 0.4882, segment: 'corner' },
  { circuitId: 0, marker: 84, s: 0.4941, segment: 'hairpin' },
  { circuitId: 0, marker: 85, s: 0.5000, segment: 'straight' },
  { circuitId: 0, marker: 86, s: 0.5059, segment: 'corner' },
  { circuitId: 0, marker: 87, s: 0.5118, segment: 'corner' },
  { circuitId: 0, marker: 88, s: 0.5176, segment: 'chicane' },
  { circuitId: 0, marker: 89, s: 0.5235, segment: 'corner' },
  { circuitId: 0, marker: 90, s: 0.5294, segment: 'straight' },
  { circuitId: 0, marker: 91, s: 0.5353, segment: 'hairpin' },
  { circuitId: 0, marker: 92, s: 0.5412, segment: 'corner' },
  { circuitId: 0, marker: 93, s: 0.5471, segment: 'corner' },
  { circuitId: 0, marker: 94, s: 0.5529, segment: 'corner' },
  { circuitId: 0, marker: 95, s: 0.5588, segment: 'straight' },
  { circuitId: 0, marker: 96, s: 0.5647, segment: 'corner' },
  { circuitId: 0, marker: 97, s: 0.5706, segment: 'corner' },
  { circuitId: 0, marker: 98, s: 0.5765, segment: 'hairpin' },
  { circuitId: 0, marker: 99, s: 0.5824, segment: 'chicane' },
  { circuitId: 0, marker: 100, s: 0.5882, segment: 'straight' },
  { circuitId: 0, marker: 101, s: 0.5941, segment: 'corner' },
  { circuitId: 0, marker: 102, s: 0.6000, segment: 'corner' },
  { circuitId: 0, marker: 103, s: 0.6059, segment: 'corner' },
  { circuitId: 0, marker: 104, s: 0.6118, segment: 'corner' },
  { circuitId: 0, marker: 105, s: 0.6176, segment: 'hairpin' },
  { circuitId: 0, marker: 106, s: 0.6235, segment: 'corner' },
  { circuitId: 0, marker: 107, s: 0.6294, segment: 'corner' },
  { circuitId: 0, marker: 108, s: 0.6353, segment: 'corner' },
  { circuitId: 0, marker: 109, s: 0.6412, segment: 'corner' },
  { circuitId: 0, marker: 110, s: 0.6471, segment: 'chicane' },
  { circuitId: 0, marker: 111, s: 0.6529, segment: 'corner' },
  { circuitId: 0, marker: 112, s: 0.6588, segment: 'hairpin' },
  { circuitId: 0, marker: 113, s: 0.6647, segment: 'corner' },
  { circuitId: 0, marker: 114, s: 0.6706, segment: 'corner' },
  { circuitId: 0, marker: 115, s: 0.6765, segment: 'straight' },
  { circuitId: 0, marker: 116, s: 0.6824, segment: 'corner' },
  { circuitId: 0, marker: 117, s: 0.6882, segment: 'corner' },
  { circuitId: 0, marker: 118, s: 0.6941, segment: 'corner' },
  { circuitId: 0, marker: 119, s: 0.7000, segment: 'hairpin' },
  { circuitId: 0, marker: 120, s: 0.7059, segment: 'straight' },
  { circuitId: 0, marker: 121, s: 0.7118, segment: 'chicane' },
  { circuitId: 0, marker: 122, s: 0.7176, segment: 'corner' },
  { circuitId: 0, marker: 123, s: 0.7235, segment: 'corner' },
  { circuitId: 0, marker: 124, s: 0.7294, segment: 'corner' },
  { circuitId: 0, marker: 125, s: 0.7353, segment: 'straight' },
  { circuitId: 0, marker: 126, s: 0.7412, segment: 'hairpin' },
  { circuitId: 0, marker: 127, s: 0.7471, segment: 'corner' },
  { circuitId: 0, marker: 128, s: 0.7529, segment: 'corner' },
  { circuitId: 0, marker: 129, s: 0.7588, segment: 'corner' },
  { circuitId: 0, marker: 130, s: 0.7647, segment: 'straight' },
  { circuitId: 0, marker: 131, s: 0.7706, segment: 'corner' },
  { circuitId: 0, marker: 132, s: 0.7765, segment: 'chicane' },
  { circuitId: 0, marker: 133, s: 0.7824, segment: 'hairpin' },
  { circuitId: 0, marker: 134, s: 0.7882, segment: 'corner' },
  { circuitId: 0, marker: 135, s: 0.7941, segment: 'straight' },
  { circuitId: 0, marker: 136, s: 0.8000, segment: 'corner' },
  { circuitId: 0, marker: 137, s: 0.8059, segment: 'corner' },
  { circuitId: 0, marker: 138, s: 0.8118, segment: 'corner' },
  { circuitId: 0, marker: 139, s: 0.8176, segment: 'corner' },
  { circuitId: 0, marker: 140, s: 0.8235, segment: 'hairpin' },
  { circuitId: 0, marker: 141, s: 0.8294, segment: 'corner' },
  { circuitId: 0, marker: 142, s: 0.8353, segment: 'corner' },
  { circuitId: 0, marker: 143, s: 0.8412, segment: 'chicane' },
  { circuitId: 0, marker: 144, s: 0.8471, segment: 'corner' },
  { circuitId: 0, marker: 145, s: 0.8529, segment: 'straight' },
  { circuitId: 0, marker: 146, s: 0.8588, segment: 'corner' },
  { circuitId: 0, marker: 147, s: 0.8647, segment: 'hairpin' },
  { circuitId: 0, marker: 148, s: 0.8706, segment: 'corner' },
  { circuitId: 0, marker: 149, s: 0.8765, segment: 'corner' },
  { circuitId: 0, marker: 150, s: 0.8824, segment: 'straight' },
  { circuitId: 0, marker: 151, s: 0.8882, segment: 'corner' },
  { circuitId: 0, marker: 152, s: 0.8941, segment: 'corner' },
  { circuitId: 0, marker: 153, s: 0.9000, segment: 'corner' },
  { circuitId: 0, marker: 154, s: 0.9059, segment: 'chicane' },
  { circuitId: 0, marker: 155, s: 0.9118, segment: 'straight' },
  { circuitId: 0, marker: 156, s: 0.9176, segment: 'corner' },
  { circuitId: 0, marker: 157, s: 0.9235, segment: 'corner' },
  { circuitId: 0, marker: 158, s: 0.9294, segment: 'corner' },
  { circuitId: 0, marker: 159, s: 0.9353, segment: 'corner' },
  { circuitId: 0, marker: 160, s: 0.9412, segment: 'straight' },
  { circuitId: 0, marker: 161, s: 0.9471, segment: 'hairpin' },
  { circuitId: 0, marker: 162, s: 0.9529, segment: 'corner' },
  { circuitId: 0, marker: 163, s: 0.9588, segment: 'corner' },
  { circuitId: 0, marker: 164, s: 0.9647, segment: 'corner' },
  { circuitId: 0, marker: 165, s: 0.9706, segment: 'chicane' },
  { circuitId: 0, marker: 166, s: 0.9765, segment: 'corner' },
  { circuitId: 0, marker: 167, s: 0.9824, segment: 'corner' },
  { circuitId: 0, marker: 168, s: 0.9882, segment: 'hairpin' },
  { circuitId: 0, marker: 169, s: 0.9941, segment: 'corner' },
  { circuitId: 1, marker: 0, s: 0.0000, segment: 'chicane' },
  { circuitId: 1, marker: 1, s: 0.0059, segment: 'corner' },
  { circuitId: 1, marker: 2, s: 0.0118, segment: 'corner' },
  { circuitId: 1, marker: 3, s: 0.0176, segment: 'corner' },
  { circuitId: 1, marker: 4, s: 0.0235, segment: 'corner' },
  { circuitId: 1, marker: 5, s: 0.0294, segment: 'straight' },
  { circuitId: 1, marker: 6, s: 0.0353, segment: 'corner' },
  { circuitId: 1, marker: 7, s: 0.0412, segment: 'hairpin' },
  { circuitId: 1, marker: 8, s: 0.0471, segment: 'corner' },
  { circuitId: 1, marker: 9, s: 0.0529, segment: 'corner' },
  { circuitId: 1, marker: 10, s: 0.0588, segment: 'straight' },
  { circuitId: 1, marker: 11, s: 0.0647, segment: 'chicane' },
  { circuitId: 1, marker: 12, s: 0.0706, segment: 'corner' },
  { circuitId: 1, marker: 13, s: 0.0765, segment: 'corner' },
  { circuitId: 1, marker: 14, s: 0.0824, segment: 'hairpin' },
  { circuitId: 1, marker: 15, s: 0.0882, segment: 'straight' },
  { circuitId: 1, marker: 16, s: 0.0941, segment: 'corner' },
  { circuitId: 1, marker: 17, s: 0.1000, segment: 'corner' },
  { circuitId: 1, marker: 18, s: 0.1059, segment: 'corner' },
  { circuitId: 1, marker: 19, s: 0.1118, segment: 'corner' },
  { circuitId: 1, marker: 20, s: 0.1176, segment: 'straight' },
  { circuitId: 1, marker: 21, s: 0.1235, segment: 'hairpin' },
  { circuitId: 1, marker: 22, s: 0.1294, segment: 'chicane' },
  { circuitId: 1, marker: 23, s: 0.1353, segment: 'corner' },
  { circuitId: 1, marker: 24, s: 0.1412, segment: 'corner' },
  { circuitId: 1, marker: 25, s: 0.1471, segment: 'straight' },
  { circuitId: 1, marker: 26, s: 0.1529, segment: 'corner' },
  { circuitId: 1, marker: 27, s: 0.1588, segment: 'corner' },
  { circuitId: 1, marker: 28, s: 0.1647, segment: 'hairpin' },
  { circuitId: 1, marker: 29, s: 0.1706, segment: 'corner' },
  { circuitId: 1, marker: 30, s: 0.1765, segment: 'straight' },
  { circuitId: 1, marker: 31, s: 0.1824, segment: 'corner' },
  { circuitId: 1, marker: 32, s: 0.1882, segment: 'corner' },
  { circuitId: 1, marker: 33, s: 0.1941, segment: 'chicane' },
  { circuitId: 1, marker: 34, s: 0.2000, segment: 'corner' },
  { circuitId: 1, marker: 35, s: 0.2059, segment: 'hairpin' },
  { circuitId: 1, marker: 36, s: 0.2118, segment: 'corner' },
  { circuitId: 1, marker: 37, s: 0.2176, segment: 'corner' },
  { circuitId: 1, marker: 38, s: 0.2235, segment: 'corner' },
  { circuitId: 1, marker: 39, s: 0.2294, segment: 'corner' },
  { circuitId: 1, marker: 40, s: 0.2353, segment: 'straight' },
  { circuitId: 1, marker: 41, s: 0.2412, segment: 'corner' },
  { circuitId: 1, marker: 42, s: 0.2471, segment: 'hairpin' },
  { circuitId: 1, marker: 43, s: 0.2529, segment: 'corner' },
  { circuitId: 1, marker: 44, s: 0.2588, segment: 'chicane' },
  { circuitId: 1, marker: 45, s: 0.2647, segment: 'straight' },
  { circuitId: 1, marker: 46, s: 0.2706, segment: 'corner' },
  { circuitId: 1, marker: 47, s: 0.2765, segment: 'corner' },
  { circuitId: 1, marker: 48, s: 0.2824, segment: 'corner' },
  { circuitId: 1, marker: 49, s: 0.2882, segment: 'hairpin' },
  { circuitId: 1, marker: 50, s: 0.2941, segment: 'straight' },
  { circuitId: 1, marker: 51, s: 0.3000, segment: 'corner' },
  { circuitId: 1, marker: 52, s: 0.3059, segment: 'corner' },
  { circuitId: 1, marker: 53, s: 0.3118, segment: 'corner' },
  { circuitId: 1, marker: 54, s: 0.3176, segment: 'corner' },
  { circuitId: 1, marker: 55, s: 0.3235, segment: 'chicane' },
  { circuitId: 1, marker: 56, s: 0.3294, segment: 'hairpin' },
  { circuitId: 1, marker: 57, s: 0.3353, segment: 'corner' },
  { circuitId: 1, marker: 58, s: 0.3412, segment: 'corner' },
  { circuitId: 1, marker: 59, s: 0.3471, segment: 'corner' },
  { circuitId: 1, marker: 60, s: 0.3529, segment: 'straight' },
  { circuitId: 1, marker: 61, s: 0.3588, segment: 'corner' },
  { circuitId: 1, marker: 62, s: 0.3647, segment: 'corner' },
  { circuitId: 1, marker: 63, s: 0.3706, segment: 'hairpin' },
  { circuitId: 1, marker: 64, s: 0.3765, segment: 'corner' },
  { circuitId: 1, marker: 65, s: 0.3824, segment: 'straight' },
  { circuitId: 1, marker: 66, s: 0.3882, segment: 'chicane' },
  { circuitId: 1, marker: 67, s: 0.3941, segment: 'corner' },
  { circuitId: 1, marker: 68, s: 0.4000, segment: 'corner' },
  { circuitId: 1, marker: 69, s: 0.4059, segment: 'corner' },
  { circuitId: 1, marker: 70, s: 0.4118, segment: 'hairpin' },
  { circuitId: 1, marker: 71, s: 0.4176, segment: 'corner' },
  { circuitId: 1, marker: 72, s: 0.4235, segment: 'corner' },
  { circuitId: 1, marker: 73, s: 0.4294, segment: 'corner' },
  { circuitId: 1, marker: 74, s: 0.4353, segment: 'corner' },
  { circuitId: 1, marker: 75, s: 0.4412, segment: 'straight' },
  { circuitId: 1, marker: 76, s: 0.4471, segment: 'corner' },
  { circuitId: 1, marker: 77, s: 0.4529, segment: 'chicane' },
  { circuitId: 1, marker: 78, s: 0.4588, segment: 'corner' },
  { circuitId: 1, marker: 79, s: 0.4647, segment: 'corner' },
  { circuitId: 1, marker: 80, s: 0.4706, segment: 'straight' },
  { circuitId: 1, marker: 81, s: 0.4765, segment: 'corner' },
  { circuitId: 1, marker: 82, s: 0.4824, segment: 'corner' },
  { circuitId: 1, marker: 83, s: 0.4882, segment: 'corner' },
  { circuitId: 1, marker: 84, s: 0.4941, segment: 'hairpin' },
  { circuitId: 1, marker: 85, s: 0.5000, segment: 'straight' },
  { circuitId: 1, marker: 86, s: 0.5059, segment: 'corner' },
  { circuitId: 1, marker: 87, s: 0.5118, segment: 'corner' },
  { circuitId: 1, marker: 88, s: 0.5176, segment: 'chicane' },
  { circuitId: 1, marker: 89, s: 0.5235, segment: 'corner' },
  { circuitId: 1, marker: 90, s: 0.5294, segment: 'straight' },
  { circuitId: 1, marker: 91, s: 0.5353, segment: 'hairpin' },
  { circuitId: 1, marker: 92, s: 0.5412, segment: 'corner' },
  { circuitId: 1, marker: 93, s: 0.5471, segment: 'corner' },
  { circuitId: 1, marker: 94, s: 0.5529, segment: 'corner' },
  { circuitId: 1, marker: 95, s: 0.5588, segment: 'straight' },
  { circuitId: 1, marker: 96, s: 0.5647, segment: 'corner' },
  { circuitId: 1, marker: 97, s: 0.5706, segment: 'corner' },
  { circuitId: 1, marker: 98, s: 0.5765, segment: 'hairpin' },
  { circuitId: 1, marker: 99, s: 0.5824, segment: 'chicane' },
  { circuitId: 1, marker: 100, s: 0.5882, segment: 'straight' },
  { circuitId: 1, marker: 101, s: 0.5941, segment: 'corner' },
  { circuitId: 1, marker: 102, s: 0.6000, segment: 'corner' },
  { circuitId: 1, marker: 103, s: 0.6059, segment: 'corner' },
  { circuitId: 1, marker: 104, s: 0.6118, segment: 'corner' },
  { circuitId: 1, marker: 105, s: 0.6176, segment: 'hairpin' },
  { circuitId: 1, marker: 106, s: 0.6235, segment: 'corner' },
  { circuitId: 1, marker: 107, s: 0.6294, segment: 'corner' },
  { circuitId: 1, marker: 108, s: 0.6353, segment: 'corner' },
  { circuitId: 1, marker: 109, s: 0.6412, segment: 'corner' },
  { circuitId: 1, marker: 110, s: 0.6471, segment: 'chicane' },
  { circuitId: 1, marker: 111, s: 0.6529, segment: 'corner' },
  { circuitId: 1, marker: 112, s: 0.6588, segment: 'hairpin' },
  { circuitId: 1, marker: 113, s: 0.6647, segment: 'corner' },
  { circuitId: 1, marker: 114, s: 0.6706, segment: 'corner' },
  { circuitId: 1, marker: 115, s: 0.6765, segment: 'straight' },
  { circuitId: 1, marker: 116, s: 0.6824, segment: 'corner' },
  { circuitId: 1, marker: 117, s: 0.6882, segment: 'corner' },
  { circuitId: 1, marker: 118, s: 0.6941, segment: 'corner' },
  { circuitId: 1, marker: 119, s: 0.7000, segment: 'hairpin' },
  { circuitId: 1, marker: 120, s: 0.7059, segment: 'straight' },
  { circuitId: 1, marker: 121, s: 0.7118, segment: 'chicane' },
  { circuitId: 1, marker: 122, s: 0.7176, segment: 'corner' },
  { circuitId: 1, marker: 123, s: 0.7235, segment: 'corner' },
  { circuitId: 1, marker: 124, s: 0.7294, segment: 'corner' },
  { circuitId: 1, marker: 125, s: 0.7353, segment: 'straight' },
  { circuitId: 1, marker: 126, s: 0.7412, segment: 'hairpin' },
  { circuitId: 1, marker: 127, s: 0.7471, segment: 'corner' },
  { circuitId: 1, marker: 128, s: 0.7529, segment: 'corner' },
  { circuitId: 1, marker: 129, s: 0.7588, segment: 'corner' },
  { circuitId: 1, marker: 130, s: 0.7647, segment: 'straight' },
  { circuitId: 1, marker: 131, s: 0.7706, segment: 'corner' },
  { circuitId: 1, marker: 132, s: 0.7765, segment: 'chicane' },
  { circuitId: 1, marker: 133, s: 0.7824, segment: 'hairpin' },
  { circuitId: 1, marker: 134, s: 0.7882, segment: 'corner' },
  { circuitId: 1, marker: 135, s: 0.7941, segment: 'straight' },
  { circuitId: 1, marker: 136, s: 0.8000, segment: 'corner' },
  { circuitId: 1, marker: 137, s: 0.8059, segment: 'corner' },
  { circuitId: 1, marker: 138, s: 0.8118, segment: 'corner' },
  { circuitId: 1, marker: 139, s: 0.8176, segment: 'corner' },
  { circuitId: 1, marker: 140, s: 0.8235, segment: 'hairpin' },
  { circuitId: 1, marker: 141, s: 0.8294, segment: 'corner' },
  { circuitId: 1, marker: 142, s: 0.8353, segment: 'corner' },
  { circuitId: 1, marker: 143, s: 0.8412, segment: 'chicane' },
  { circuitId: 1, marker: 144, s: 0.8471, segment: 'corner' },
  { circuitId: 1, marker: 145, s: 0.8529, segment: 'straight' },
  { circuitId: 1, marker: 146, s: 0.8588, segment: 'corner' },
  { circuitId: 1, marker: 147, s: 0.8647, segment: 'hairpin' },
  { circuitId: 1, marker: 148, s: 0.8706, segment: 'corner' },
  { circuitId: 1, marker: 149, s: 0.8765, segment: 'corner' },
  { circuitId: 1, marker: 150, s: 0.8824, segment: 'straight' },
  { circuitId: 1, marker: 151, s: 0.8882, segment: 'corner' },
  { circuitId: 1, marker: 152, s: 0.8941, segment: 'corner' },
  { circuitId: 1, marker: 153, s: 0.9000, segment: 'corner' },
  { circuitId: 1, marker: 154, s: 0.9059, segment: 'chicane' },
  { circuitId: 1, marker: 155, s: 0.9118, segment: 'straight' },
  { circuitId: 1, marker: 156, s: 0.9176, segment: 'corner' },
  { circuitId: 1, marker: 157, s: 0.9235, segment: 'corner' },
  { circuitId: 1, marker: 158, s: 0.9294, segment: 'corner' },
  { circuitId: 1, marker: 159, s: 0.9353, segment: 'corner' },
  { circuitId: 1, marker: 160, s: 0.9412, segment: 'straight' },
  { circuitId: 1, marker: 161, s: 0.9471, segment: 'hairpin' },
  { circuitId: 1, marker: 162, s: 0.9529, segment: 'corner' },
  { circuitId: 1, marker: 163, s: 0.9588, segment: 'corner' },
  { circuitId: 1, marker: 164, s: 0.9647, segment: 'corner' },
  { circuitId: 1, marker: 165, s: 0.9706, segment: 'chicane' },
  { circuitId: 1, marker: 166, s: 0.9765, segment: 'corner' },
  { circuitId: 1, marker: 167, s: 0.9824, segment: 'corner' },
  { circuitId: 1, marker: 168, s: 0.9882, segment: 'hairpin' },
  { circuitId: 1, marker: 169, s: 0.9941, segment: 'corner' },
  { circuitId: 2, marker: 0, s: 0.0000, segment: 'chicane' },
  { circuitId: 2, marker: 1, s: 0.0059, segment: 'corner' },
  { circuitId: 2, marker: 2, s: 0.0118, segment: 'corner' },
  { circuitId: 2, marker: 3, s: 0.0176, segment: 'corner' },
  { circuitId: 2, marker: 4, s: 0.0235, segment: 'corner' },
  { circuitId: 2, marker: 5, s: 0.0294, segment: 'straight' },
  { circuitId: 2, marker: 6, s: 0.0353, segment: 'corner' },
  { circuitId: 2, marker: 7, s: 0.0412, segment: 'hairpin' },
  { circuitId: 2, marker: 8, s: 0.0471, segment: 'corner' },
  { circuitId: 2, marker: 9, s: 0.0529, segment: 'corner' },
  { circuitId: 2, marker: 10, s: 0.0588, segment: 'straight' },
  { circuitId: 2, marker: 11, s: 0.0647, segment: 'chicane' },
  { circuitId: 2, marker: 12, s: 0.0706, segment: 'corner' },
  { circuitId: 2, marker: 13, s: 0.0765, segment: 'corner' },
  { circuitId: 2, marker: 14, s: 0.0824, segment: 'hairpin' },
  { circuitId: 2, marker: 15, s: 0.0882, segment: 'straight' },
  { circuitId: 2, marker: 16, s: 0.0941, segment: 'corner' },
  { circuitId: 2, marker: 17, s: 0.1000, segment: 'corner' },
  { circuitId: 2, marker: 18, s: 0.1059, segment: 'corner' },
  { circuitId: 2, marker: 19, s: 0.1118, segment: 'corner' },
  { circuitId: 2, marker: 20, s: 0.1176, segment: 'straight' },
  { circuitId: 2, marker: 21, s: 0.1235, segment: 'hairpin' },
  { circuitId: 2, marker: 22, s: 0.1294, segment: 'chicane' },
  { circuitId: 2, marker: 23, s: 0.1353, segment: 'corner' },
  { circuitId: 2, marker: 24, s: 0.1412, segment: 'corner' },
  { circuitId: 2, marker: 25, s: 0.1471, segment: 'straight' },
  { circuitId: 2, marker: 26, s: 0.1529, segment: 'corner' },
  { circuitId: 2, marker: 27, s: 0.1588, segment: 'corner' },
  { circuitId: 2, marker: 28, s: 0.1647, segment: 'hairpin' },
  { circuitId: 2, marker: 29, s: 0.1706, segment: 'corner' },
  { circuitId: 2, marker: 30, s: 0.1765, segment: 'straight' },
  { circuitId: 2, marker: 31, s: 0.1824, segment: 'corner' },
  { circuitId: 2, marker: 32, s: 0.1882, segment: 'corner' },
  { circuitId: 2, marker: 33, s: 0.1941, segment: 'chicane' },
  { circuitId: 2, marker: 34, s: 0.2000, segment: 'corner' },
  { circuitId: 2, marker: 35, s: 0.2059, segment: 'hairpin' },
  { circuitId: 2, marker: 36, s: 0.2118, segment: 'corner' },
  { circuitId: 2, marker: 37, s: 0.2176, segment: 'corner' },
  { circuitId: 2, marker: 38, s: 0.2235, segment: 'corner' },
  { circuitId: 2, marker: 39, s: 0.2294, segment: 'corner' },
  { circuitId: 2, marker: 40, s: 0.2353, segment: 'straight' },
  { circuitId: 2, marker: 41, s: 0.2412, segment: 'corner' },
  { circuitId: 2, marker: 42, s: 0.2471, segment: 'hairpin' },
  { circuitId: 2, marker: 43, s: 0.2529, segment: 'corner' },
  { circuitId: 2, marker: 44, s: 0.2588, segment: 'chicane' },
  { circuitId: 2, marker: 45, s: 0.2647, segment: 'straight' },
  { circuitId: 2, marker: 46, s: 0.2706, segment: 'corner' },
  { circuitId: 2, marker: 47, s: 0.2765, segment: 'corner' },
  { circuitId: 2, marker: 48, s: 0.2824, segment: 'corner' },
  { circuitId: 2, marker: 49, s: 0.2882, segment: 'hairpin' },
  { circuitId: 2, marker: 50, s: 0.2941, segment: 'straight' },
  { circuitId: 2, marker: 51, s: 0.3000, segment: 'corner' },
  { circuitId: 2, marker: 52, s: 0.3059, segment: 'corner' },
  { circuitId: 2, marker: 53, s: 0.3118, segment: 'corner' },
  { circuitId: 2, marker: 54, s: 0.3176, segment: 'corner' },
  { circuitId: 2, marker: 55, s: 0.3235, segment: 'chicane' },
  { circuitId: 2, marker: 56, s: 0.3294, segment: 'hairpin' },
  { circuitId: 2, marker: 57, s: 0.3353, segment: 'corner' },
  { circuitId: 2, marker: 58, s: 0.3412, segment: 'corner' },
  { circuitId: 2, marker: 59, s: 0.3471, segment: 'corner' },
  { circuitId: 2, marker: 60, s: 0.3529, segment: 'straight' },
  { circuitId: 2, marker: 61, s: 0.3588, segment: 'corner' },
  { circuitId: 2, marker: 62, s: 0.3647, segment: 'corner' },
  { circuitId: 2, marker: 63, s: 0.3706, segment: 'hairpin' },
  { circuitId: 2, marker: 64, s: 0.3765, segment: 'corner' },
  { circuitId: 2, marker: 65, s: 0.3824, segment: 'straight' },
  { circuitId: 2, marker: 66, s: 0.3882, segment: 'chicane' },
  { circuitId: 2, marker: 67, s: 0.3941, segment: 'corner' },
  { circuitId: 2, marker: 68, s: 0.4000, segment: 'corner' },
  { circuitId: 2, marker: 69, s: 0.4059, segment: 'corner' },
  { circuitId: 2, marker: 70, s: 0.4118, segment: 'hairpin' },
  { circuitId: 2, marker: 71, s: 0.4176, segment: 'corner' },
  { circuitId: 2, marker: 72, s: 0.4235, segment: 'corner' },
  { circuitId: 2, marker: 73, s: 0.4294, segment: 'corner' },
  { circuitId: 2, marker: 74, s: 0.4353, segment: 'corner' },
  { circuitId: 2, marker: 75, s: 0.4412, segment: 'straight' },
  { circuitId: 2, marker: 76, s: 0.4471, segment: 'corner' },
  { circuitId: 2, marker: 77, s: 0.4529, segment: 'chicane' },
  { circuitId: 2, marker: 78, s: 0.4588, segment: 'corner' },
  { circuitId: 2, marker: 79, s: 0.4647, segment: 'corner' },
  { circuitId: 2, marker: 80, s: 0.4706, segment: 'straight' },
  { circuitId: 2, marker: 81, s: 0.4765, segment: 'corner' },
  { circuitId: 2, marker: 82, s: 0.4824, segment: 'corner' },
  { circuitId: 2, marker: 83, s: 0.4882, segment: 'corner' },
  { circuitId: 2, marker: 84, s: 0.4941, segment: 'hairpin' },
  { circuitId: 2, marker: 85, s: 0.5000, segment: 'straight' },
  { circuitId: 2, marker: 86, s: 0.5059, segment: 'corner' },
  { circuitId: 2, marker: 87, s: 0.5118, segment: 'corner' },
  { circuitId: 2, marker: 88, s: 0.5176, segment: 'chicane' },
  { circuitId: 2, marker: 89, s: 0.5235, segment: 'corner' },
  { circuitId: 2, marker: 90, s: 0.5294, segment: 'straight' },
  { circuitId: 2, marker: 91, s: 0.5353, segment: 'hairpin' },
  { circuitId: 2, marker: 92, s: 0.5412, segment: 'corner' },
  { circuitId: 2, marker: 93, s: 0.5471, segment: 'corner' },
  { circuitId: 2, marker: 94, s: 0.5529, segment: 'corner' },
  { circuitId: 2, marker: 95, s: 0.5588, segment: 'straight' },
  { circuitId: 2, marker: 96, s: 0.5647, segment: 'corner' },
  { circuitId: 2, marker: 97, s: 0.5706, segment: 'corner' },
  { circuitId: 2, marker: 98, s: 0.5765, segment: 'hairpin' },
  { circuitId: 2, marker: 99, s: 0.5824, segment: 'chicane' },
  { circuitId: 2, marker: 100, s: 0.5882, segment: 'straight' },
  { circuitId: 2, marker: 101, s: 0.5941, segment: 'corner' },
  { circuitId: 2, marker: 102, s: 0.6000, segment: 'corner' },
  { circuitId: 2, marker: 103, s: 0.6059, segment: 'corner' },
  { circuitId: 2, marker: 104, s: 0.6118, segment: 'corner' },
  { circuitId: 2, marker: 105, s: 0.6176, segment: 'hairpin' },
  { circuitId: 2, marker: 106, s: 0.6235, segment: 'corner' },
  { circuitId: 2, marker: 107, s: 0.6294, segment: 'corner' },
  { circuitId: 2, marker: 108, s: 0.6353, segment: 'corner' },
  { circuitId: 2, marker: 109, s: 0.6412, segment: 'corner' },
  { circuitId: 2, marker: 110, s: 0.6471, segment: 'chicane' },
  { circuitId: 2, marker: 111, s: 0.6529, segment: 'corner' },
  { circuitId: 2, marker: 112, s: 0.6588, segment: 'hairpin' },
  { circuitId: 2, marker: 113, s: 0.6647, segment: 'corner' },
  { circuitId: 2, marker: 114, s: 0.6706, segment: 'corner' },
  { circuitId: 2, marker: 115, s: 0.6765, segment: 'straight' },
  { circuitId: 2, marker: 116, s: 0.6824, segment: 'corner' },
  { circuitId: 2, marker: 117, s: 0.6882, segment: 'corner' },
  { circuitId: 2, marker: 118, s: 0.6941, segment: 'corner' },
  { circuitId: 2, marker: 119, s: 0.7000, segment: 'hairpin' },
  { circuitId: 2, marker: 120, s: 0.7059, segment: 'straight' },
  { circuitId: 2, marker: 121, s: 0.7118, segment: 'chicane' },
  { circuitId: 2, marker: 122, s: 0.7176, segment: 'corner' },
  { circuitId: 2, marker: 123, s: 0.7235, segment: 'corner' },
  { circuitId: 2, marker: 124, s: 0.7294, segment: 'corner' },
  { circuitId: 2, marker: 125, s: 0.7353, segment: 'straight' },
  { circuitId: 2, marker: 126, s: 0.7412, segment: 'hairpin' },
  { circuitId: 2, marker: 127, s: 0.7471, segment: 'corner' },
  { circuitId: 2, marker: 128, s: 0.7529, segment: 'corner' },
  { circuitId: 2, marker: 129, s: 0.7588, segment: 'corner' },
  { circuitId: 2, marker: 130, s: 0.7647, segment: 'straight' },
  { circuitId: 2, marker: 131, s: 0.7706, segment: 'corner' },
  { circuitId: 2, marker: 132, s: 0.7765, segment: 'chicane' },
  { circuitId: 2, marker: 133, s: 0.7824, segment: 'hairpin' },
  { circuitId: 2, marker: 134, s: 0.7882, segment: 'corner' },
  { circuitId: 2, marker: 135, s: 0.7941, segment: 'straight' },
  { circuitId: 2, marker: 136, s: 0.8000, segment: 'corner' },
  { circuitId: 2, marker: 137, s: 0.8059, segment: 'corner' },
  { circuitId: 2, marker: 138, s: 0.8118, segment: 'corner' },
  { circuitId: 2, marker: 139, s: 0.8176, segment: 'corner' },
  { circuitId: 2, marker: 140, s: 0.8235, segment: 'hairpin' },
  { circuitId: 2, marker: 141, s: 0.8294, segment: 'corner' },
  { circuitId: 2, marker: 142, s: 0.8353, segment: 'corner' },
  { circuitId: 2, marker: 143, s: 0.8412, segment: 'chicane' },
  { circuitId: 2, marker: 144, s: 0.8471, segment: 'corner' },
  { circuitId: 2, marker: 145, s: 0.8529, segment: 'straight' },
  { circuitId: 2, marker: 146, s: 0.8588, segment: 'corner' },
  { circuitId: 2, marker: 147, s: 0.8647, segment: 'hairpin' },
  { circuitId: 2, marker: 148, s: 0.8706, segment: 'corner' },
  { circuitId: 2, marker: 149, s: 0.8765, segment: 'corner' },
  { circuitId: 2, marker: 150, s: 0.8824, segment: 'straight' },
  { circuitId: 2, marker: 151, s: 0.8882, segment: 'corner' },
  { circuitId: 2, marker: 152, s: 0.8941, segment: 'corner' },
  { circuitId: 2, marker: 153, s: 0.9000, segment: 'corner' },
  { circuitId: 2, marker: 154, s: 0.9059, segment: 'chicane' },
  { circuitId: 2, marker: 155, s: 0.9118, segment: 'straight' },
  { circuitId: 2, marker: 156, s: 0.9176, segment: 'corner' },
  { circuitId: 2, marker: 157, s: 0.9235, segment: 'corner' },
  { circuitId: 2, marker: 158, s: 0.9294, segment: 'corner' },
  { circuitId: 2, marker: 159, s: 0.9353, segment: 'corner' },
  { circuitId: 2, marker: 160, s: 0.9412, segment: 'straight' },
  { circuitId: 2, marker: 161, s: 0.9471, segment: 'hairpin' },
  { circuitId: 2, marker: 162, s: 0.9529, segment: 'corner' },
  { circuitId: 2, marker: 163, s: 0.9588, segment: 'corner' },
  { circuitId: 2, marker: 164, s: 0.9647, segment: 'corner' },
  { circuitId: 2, marker: 165, s: 0.9706, segment: 'chicane' },
  { circuitId: 2, marker: 166, s: 0.9765, segment: 'corner' },
  { circuitId: 2, marker: 167, s: 0.9824, segment: 'corner' },
  { circuitId: 2, marker: 168, s: 0.9882, segment: 'hairpin' },
  { circuitId: 2, marker: 169, s: 0.9941, segment: 'corner' },
  { circuitId: 3, marker: 0, s: 0.0000, segment: 'chicane' },
  { circuitId: 3, marker: 1, s: 0.0059, segment: 'corner' },
  { circuitId: 3, marker: 2, s: 0.0118, segment: 'corner' },
  { circuitId: 3, marker: 3, s: 0.0176, segment: 'corner' },
  { circuitId: 3, marker: 4, s: 0.0235, segment: 'corner' },
  { circuitId: 3, marker: 5, s: 0.0294, segment: 'straight' },
  { circuitId: 3, marker: 6, s: 0.0353, segment: 'corner' },
  { circuitId: 3, marker: 7, s: 0.0412, segment: 'hairpin' },
  { circuitId: 3, marker: 8, s: 0.0471, segment: 'corner' },
  { circuitId: 3, marker: 9, s: 0.0529, segment: 'corner' },
  { circuitId: 3, marker: 10, s: 0.0588, segment: 'straight' },
  { circuitId: 3, marker: 11, s: 0.0647, segment: 'chicane' },
  { circuitId: 3, marker: 12, s: 0.0706, segment: 'corner' },
  { circuitId: 3, marker: 13, s: 0.0765, segment: 'corner' },
  { circuitId: 3, marker: 14, s: 0.0824, segment: 'hairpin' },
  { circuitId: 3, marker: 15, s: 0.0882, segment: 'straight' },
  { circuitId: 3, marker: 16, s: 0.0941, segment: 'corner' },
  { circuitId: 3, marker: 17, s: 0.1000, segment: 'corner' },
  { circuitId: 3, marker: 18, s: 0.1059, segment: 'corner' },
  { circuitId: 3, marker: 19, s: 0.1118, segment: 'corner' },
  { circuitId: 3, marker: 20, s: 0.1176, segment: 'straight' },
  { circuitId: 3, marker: 21, s: 0.1235, segment: 'hairpin' },
  { circuitId: 3, marker: 22, s: 0.1294, segment: 'chicane' },
  { circuitId: 3, marker: 23, s: 0.1353, segment: 'corner' },
  { circuitId: 3, marker: 24, s: 0.1412, segment: 'corner' },
  { circuitId: 3, marker: 25, s: 0.1471, segment: 'straight' },
  { circuitId: 3, marker: 26, s: 0.1529, segment: 'corner' },
  { circuitId: 3, marker: 27, s: 0.1588, segment: 'corner' },
  { circuitId: 3, marker: 28, s: 0.1647, segment: 'hairpin' },
  { circuitId: 3, marker: 29, s: 0.1706, segment: 'corner' },
  { circuitId: 3, marker: 30, s: 0.1765, segment: 'straight' },
  { circuitId: 3, marker: 31, s: 0.1824, segment: 'corner' },
  { circuitId: 3, marker: 32, s: 0.1882, segment: 'corner' },
  { circuitId: 3, marker: 33, s: 0.1941, segment: 'chicane' },
  { circuitId: 3, marker: 34, s: 0.2000, segment: 'corner' },
  { circuitId: 3, marker: 35, s: 0.2059, segment: 'hairpin' },
  { circuitId: 3, marker: 36, s: 0.2118, segment: 'corner' },
  { circuitId: 3, marker: 37, s: 0.2176, segment: 'corner' },
  { circuitId: 3, marker: 38, s: 0.2235, segment: 'corner' },
  { circuitId: 3, marker: 39, s: 0.2294, segment: 'corner' },
  { circuitId: 3, marker: 40, s: 0.2353, segment: 'straight' },
  { circuitId: 3, marker: 41, s: 0.2412, segment: 'corner' },
  { circuitId: 3, marker: 42, s: 0.2471, segment: 'hairpin' },
  { circuitId: 3, marker: 43, s: 0.2529, segment: 'corner' },
  { circuitId: 3, marker: 44, s: 0.2588, segment: 'chicane' },
  { circuitId: 3, marker: 45, s: 0.2647, segment: 'straight' },
  { circuitId: 3, marker: 46, s: 0.2706, segment: 'corner' },
  { circuitId: 3, marker: 47, s: 0.2765, segment: 'corner' },
  { circuitId: 3, marker: 48, s: 0.2824, segment: 'corner' },
  { circuitId: 3, marker: 49, s: 0.2882, segment: 'hairpin' },
  { circuitId: 3, marker: 50, s: 0.2941, segment: 'straight' },
  { circuitId: 3, marker: 51, s: 0.3000, segment: 'corner' },
  { circuitId: 3, marker: 52, s: 0.3059, segment: 'corner' },
  { circuitId: 3, marker: 53, s: 0.3118, segment: 'corner' },
  { circuitId: 3, marker: 54, s: 0.3176, segment: 'corner' },
  { circuitId: 3, marker: 55, s: 0.3235, segment: 'chicane' },
  { circuitId: 3, marker: 56, s: 0.3294, segment: 'hairpin' },
  { circuitId: 3, marker: 57, s: 0.3353, segment: 'corner' },
  { circuitId: 3, marker: 58, s: 0.3412, segment: 'corner' },
  { circuitId: 3, marker: 59, s: 0.3471, segment: 'corner' },
  { circuitId: 3, marker: 60, s: 0.3529, segment: 'straight' },
  { circuitId: 3, marker: 61, s: 0.3588, segment: 'corner' },
  { circuitId: 3, marker: 62, s: 0.3647, segment: 'corner' },
  { circuitId: 3, marker: 63, s: 0.3706, segment: 'hairpin' },
  { circuitId: 3, marker: 64, s: 0.3765, segment: 'corner' },
  { circuitId: 3, marker: 65, s: 0.3824, segment: 'straight' },
  { circuitId: 3, marker: 66, s: 0.3882, segment: 'chicane' },
  { circuitId: 3, marker: 67, s: 0.3941, segment: 'corner' },
  { circuitId: 3, marker: 68, s: 0.4000, segment: 'corner' },
  { circuitId: 3, marker: 69, s: 0.4059, segment: 'corner' },
  { circuitId: 3, marker: 70, s: 0.4118, segment: 'hairpin' },
  { circuitId: 3, marker: 71, s: 0.4176, segment: 'corner' },
  { circuitId: 3, marker: 72, s: 0.4235, segment: 'corner' },
  { circuitId: 3, marker: 73, s: 0.4294, segment: 'corner' },
  { circuitId: 3, marker: 74, s: 0.4353, segment: 'corner' },
  { circuitId: 3, marker: 75, s: 0.4412, segment: 'straight' },
  { circuitId: 3, marker: 76, s: 0.4471, segment: 'corner' },
  { circuitId: 3, marker: 77, s: 0.4529, segment: 'chicane' },
  { circuitId: 3, marker: 78, s: 0.4588, segment: 'corner' },
  { circuitId: 3, marker: 79, s: 0.4647, segment: 'corner' },
  { circuitId: 3, marker: 80, s: 0.4706, segment: 'straight' },
  { circuitId: 3, marker: 81, s: 0.4765, segment: 'corner' },
  { circuitId: 3, marker: 82, s: 0.4824, segment: 'corner' },
  { circuitId: 3, marker: 83, s: 0.4882, segment: 'corner' },
  { circuitId: 3, marker: 84, s: 0.4941, segment: 'hairpin' },
  { circuitId: 3, marker: 85, s: 0.5000, segment: 'straight' },
  { circuitId: 3, marker: 86, s: 0.5059, segment: 'corner' },
  { circuitId: 3, marker: 87, s: 0.5118, segment: 'corner' },
  { circuitId: 3, marker: 88, s: 0.5176, segment: 'chicane' },
  { circuitId: 3, marker: 89, s: 0.5235, segment: 'corner' },
  { circuitId: 3, marker: 90, s: 0.5294, segment: 'straight' },
  { circuitId: 3, marker: 91, s: 0.5353, segment: 'hairpin' },
  { circuitId: 3, marker: 92, s: 0.5412, segment: 'corner' },
  { circuitId: 3, marker: 93, s: 0.5471, segment: 'corner' },
  { circuitId: 3, marker: 94, s: 0.5529, segment: 'corner' },
  { circuitId: 3, marker: 95, s: 0.5588, segment: 'straight' },
  { circuitId: 3, marker: 96, s: 0.5647, segment: 'corner' },
  { circuitId: 3, marker: 97, s: 0.5706, segment: 'corner' },
  { circuitId: 3, marker: 98, s: 0.5765, segment: 'hairpin' },
  { circuitId: 3, marker: 99, s: 0.5824, segment: 'chicane' },
  { circuitId: 3, marker: 100, s: 0.5882, segment: 'straight' },
  { circuitId: 3, marker: 101, s: 0.5941, segment: 'corner' },
  { circuitId: 3, marker: 102, s: 0.6000, segment: 'corner' },
  { circuitId: 3, marker: 103, s: 0.6059, segment: 'corner' },
  { circuitId: 3, marker: 104, s: 0.6118, segment: 'corner' },
  { circuitId: 3, marker: 105, s: 0.6176, segment: 'hairpin' },
  { circuitId: 3, marker: 106, s: 0.6235, segment: 'corner' },
  { circuitId: 3, marker: 107, s: 0.6294, segment: 'corner' },
  { circuitId: 3, marker: 108, s: 0.6353, segment: 'corner' },
  { circuitId: 3, marker: 109, s: 0.6412, segment: 'corner' },
  { circuitId: 3, marker: 110, s: 0.6471, segment: 'chicane' },
  { circuitId: 3, marker: 111, s: 0.6529, segment: 'corner' },
  { circuitId: 3, marker: 112, s: 0.6588, segment: 'hairpin' },
  { circuitId: 3, marker: 113, s: 0.6647, segment: 'corner' },
  { circuitId: 3, marker: 114, s: 0.6706, segment: 'corner' },
  { circuitId: 3, marker: 115, s: 0.6765, segment: 'straight' },
  { circuitId: 3, marker: 116, s: 0.6824, segment: 'corner' },
  { circuitId: 3, marker: 117, s: 0.6882, segment: 'corner' },
  { circuitId: 3, marker: 118, s: 0.6941, segment: 'corner' },
  { circuitId: 3, marker: 119, s: 0.7000, segment: 'hairpin' },
  { circuitId: 3, marker: 120, s: 0.7059, segment: 'straight' },
  { circuitId: 3, marker: 121, s: 0.7118, segment: 'chicane' },
  { circuitId: 3, marker: 122, s: 0.7176, segment: 'corner' },
  { circuitId: 3, marker: 123, s: 0.7235, segment: 'corner' },
  { circuitId: 3, marker: 124, s: 0.7294, segment: 'corner' },
  { circuitId: 3, marker: 125, s: 0.7353, segment: 'straight' },
  { circuitId: 3, marker: 126, s: 0.7412, segment: 'hairpin' },
  { circuitId: 3, marker: 127, s: 0.7471, segment: 'corner' },
  { circuitId: 3, marker: 128, s: 0.7529, segment: 'corner' },
  { circuitId: 3, marker: 129, s: 0.7588, segment: 'corner' },
  { circuitId: 3, marker: 130, s: 0.7647, segment: 'straight' },
  { circuitId: 3, marker: 131, s: 0.7706, segment: 'corner' },
  { circuitId: 3, marker: 132, s: 0.7765, segment: 'chicane' },
  { circuitId: 3, marker: 133, s: 0.7824, segment: 'hairpin' },
  { circuitId: 3, marker: 134, s: 0.7882, segment: 'corner' },
  { circuitId: 3, marker: 135, s: 0.7941, segment: 'straight' },
  { circuitId: 3, marker: 136, s: 0.8000, segment: 'corner' },
  { circuitId: 3, marker: 137, s: 0.8059, segment: 'corner' },
  { circuitId: 3, marker: 138, s: 0.8118, segment: 'corner' },
  { circuitId: 3, marker: 139, s: 0.8176, segment: 'corner' },
  { circuitId: 3, marker: 140, s: 0.8235, segment: 'hairpin' },
  { circuitId: 3, marker: 141, s: 0.8294, segment: 'corner' },
  { circuitId: 3, marker: 142, s: 0.8353, segment: 'corner' },
  { circuitId: 3, marker: 143, s: 0.8412, segment: 'chicane' },
  { circuitId: 3, marker: 144, s: 0.8471, segment: 'corner' },
  { circuitId: 3, marker: 145, s: 0.8529, segment: 'straight' },
  { circuitId: 3, marker: 146, s: 0.8588, segment: 'corner' },
  { circuitId: 3, marker: 147, s: 0.8647, segment: 'hairpin' },
  { circuitId: 3, marker: 148, s: 0.8706, segment: 'corner' },
  { circuitId: 3, marker: 149, s: 0.8765, segment: 'corner' },
  { circuitId: 3, marker: 150, s: 0.8824, segment: 'straight' },
  { circuitId: 3, marker: 151, s: 0.8882, segment: 'corner' },
  { circuitId: 3, marker: 152, s: 0.8941, segment: 'corner' },
  { circuitId: 3, marker: 153, s: 0.9000, segment: 'corner' },
  { circuitId: 3, marker: 154, s: 0.9059, segment: 'chicane' },
  { circuitId: 3, marker: 155, s: 0.9118, segment: 'straight' },
  { circuitId: 3, marker: 156, s: 0.9176, segment: 'corner' },
  { circuitId: 3, marker: 157, s: 0.9235, segment: 'corner' },
  { circuitId: 3, marker: 158, s: 0.9294, segment: 'corner' },
  { circuitId: 3, marker: 159, s: 0.9353, segment: 'corner' },
  { circuitId: 3, marker: 160, s: 0.9412, segment: 'straight' },
  { circuitId: 3, marker: 161, s: 0.9471, segment: 'hairpin' },
  { circuitId: 3, marker: 162, s: 0.9529, segment: 'corner' },
  { circuitId: 3, marker: 163, s: 0.9588, segment: 'corner' },
  { circuitId: 3, marker: 164, s: 0.9647, segment: 'corner' },
  { circuitId: 3, marker: 165, s: 0.9706, segment: 'chicane' },
  { circuitId: 3, marker: 166, s: 0.9765, segment: 'corner' },
  { circuitId: 3, marker: 167, s: 0.9824, segment: 'corner' },
  { circuitId: 3, marker: 168, s: 0.9882, segment: 'hairpin' },
  { circuitId: 3, marker: 169, s: 0.9941, segment: 'corner' },
  { circuitId: 4, marker: 0, s: 0.0000, segment: 'chicane' },
  { circuitId: 4, marker: 1, s: 0.0059, segment: 'corner' },
  { circuitId: 4, marker: 2, s: 0.0118, segment: 'corner' },
  { circuitId: 4, marker: 3, s: 0.0176, segment: 'corner' },
  { circuitId: 4, marker: 4, s: 0.0235, segment: 'corner' },
  { circuitId: 4, marker: 5, s: 0.0294, segment: 'straight' },
  { circuitId: 4, marker: 6, s: 0.0353, segment: 'corner' },
  { circuitId: 4, marker: 7, s: 0.0412, segment: 'hairpin' },
  { circuitId: 4, marker: 8, s: 0.0471, segment: 'corner' },
  { circuitId: 4, marker: 9, s: 0.0529, segment: 'corner' },
  { circuitId: 4, marker: 10, s: 0.0588, segment: 'straight' },
  { circuitId: 4, marker: 11, s: 0.0647, segment: 'chicane' },
  { circuitId: 4, marker: 12, s: 0.0706, segment: 'corner' },
  { circuitId: 4, marker: 13, s: 0.0765, segment: 'corner' },
  { circuitId: 4, marker: 14, s: 0.0824, segment: 'hairpin' },
  { circuitId: 4, marker: 15, s: 0.0882, segment: 'straight' },
  { circuitId: 4, marker: 16, s: 0.0941, segment: 'corner' },
  { circuitId: 4, marker: 17, s: 0.1000, segment: 'corner' },
  { circuitId: 4, marker: 18, s: 0.1059, segment: 'corner' },
  { circuitId: 4, marker: 19, s: 0.1118, segment: 'corner' },
  { circuitId: 4, marker: 20, s: 0.1176, segment: 'straight' },
  { circuitId: 4, marker: 21, s: 0.1235, segment: 'hairpin' },
  { circuitId: 4, marker: 22, s: 0.1294, segment: 'chicane' },
  { circuitId: 4, marker: 23, s: 0.1353, segment: 'corner' },
  { circuitId: 4, marker: 24, s: 0.1412, segment: 'corner' },
  { circuitId: 4, marker: 25, s: 0.1471, segment: 'straight' },
  { circuitId: 4, marker: 26, s: 0.1529, segment: 'corner' },
  { circuitId: 4, marker: 27, s: 0.1588, segment: 'corner' },
  { circuitId: 4, marker: 28, s: 0.1647, segment: 'hairpin' },
  { circuitId: 4, marker: 29, s: 0.1706, segment: 'corner' },
  { circuitId: 4, marker: 30, s: 0.1765, segment: 'straight' },
  { circuitId: 4, marker: 31, s: 0.1824, segment: 'corner' },
  { circuitId: 4, marker: 32, s: 0.1882, segment: 'corner' },
  { circuitId: 4, marker: 33, s: 0.1941, segment: 'chicane' },
  { circuitId: 4, marker: 34, s: 0.2000, segment: 'corner' },
  { circuitId: 4, marker: 35, s: 0.2059, segment: 'hairpin' },
  { circuitId: 4, marker: 36, s: 0.2118, segment: 'corner' },
  { circuitId: 4, marker: 37, s: 0.2176, segment: 'corner' },
  { circuitId: 4, marker: 38, s: 0.2235, segment: 'corner' },
  { circuitId: 4, marker: 39, s: 0.2294, segment: 'corner' },
  { circuitId: 4, marker: 40, s: 0.2353, segment: 'straight' },
  { circuitId: 4, marker: 41, s: 0.2412, segment: 'corner' },
  { circuitId: 4, marker: 42, s: 0.2471, segment: 'hairpin' },
  { circuitId: 4, marker: 43, s: 0.2529, segment: 'corner' },
  { circuitId: 4, marker: 44, s: 0.2588, segment: 'chicane' },
  { circuitId: 4, marker: 45, s: 0.2647, segment: 'straight' },
  { circuitId: 4, marker: 46, s: 0.2706, segment: 'corner' },
  { circuitId: 4, marker: 47, s: 0.2765, segment: 'corner' },
  { circuitId: 4, marker: 48, s: 0.2824, segment: 'corner' },
  { circuitId: 4, marker: 49, s: 0.2882, segment: 'hairpin' },
  { circuitId: 4, marker: 50, s: 0.2941, segment: 'straight' },
  { circuitId: 4, marker: 51, s: 0.3000, segment: 'corner' },
  { circuitId: 4, marker: 52, s: 0.3059, segment: 'corner' },
  { circuitId: 4, marker: 53, s: 0.3118, segment: 'corner' },
  { circuitId: 4, marker: 54, s: 0.3176, segment: 'corner' },
  { circuitId: 4, marker: 55, s: 0.3235, segment: 'chicane' },
  { circuitId: 4, marker: 56, s: 0.3294, segment: 'hairpin' },
  { circuitId: 4, marker: 57, s: 0.3353, segment: 'corner' },
  { circuitId: 4, marker: 58, s: 0.3412, segment: 'corner' },
  { circuitId: 4, marker: 59, s: 0.3471, segment: 'corner' },
  { circuitId: 4, marker: 60, s: 0.3529, segment: 'straight' },
  { circuitId: 4, marker: 61, s: 0.3588, segment: 'corner' },
  { circuitId: 4, marker: 62, s: 0.3647, segment: 'corner' },
  { circuitId: 4, marker: 63, s: 0.3706, segment: 'hairpin' },
  { circuitId: 4, marker: 64, s: 0.3765, segment: 'corner' },
  { circuitId: 4, marker: 65, s: 0.3824, segment: 'straight' },
  { circuitId: 4, marker: 66, s: 0.3882, segment: 'chicane' },
  { circuitId: 4, marker: 67, s: 0.3941, segment: 'corner' },
  { circuitId: 4, marker: 68, s: 0.4000, segment: 'corner' },
  { circuitId: 4, marker: 69, s: 0.4059, segment: 'corner' },
  { circuitId: 4, marker: 70, s: 0.4118, segment: 'hairpin' },
  { circuitId: 4, marker: 71, s: 0.4176, segment: 'corner' },
  { circuitId: 4, marker: 72, s: 0.4235, segment: 'corner' },
  { circuitId: 4, marker: 73, s: 0.4294, segment: 'corner' },
  { circuitId: 4, marker: 74, s: 0.4353, segment: 'corner' },
  { circuitId: 4, marker: 75, s: 0.4412, segment: 'straight' },
  { circuitId: 4, marker: 76, s: 0.4471, segment: 'corner' },
  { circuitId: 4, marker: 77, s: 0.4529, segment: 'chicane' },
  { circuitId: 4, marker: 78, s: 0.4588, segment: 'corner' },
  { circuitId: 4, marker: 79, s: 0.4647, segment: 'corner' },
  { circuitId: 4, marker: 80, s: 0.4706, segment: 'straight' },
  { circuitId: 4, marker: 81, s: 0.4765, segment: 'corner' },
  { circuitId: 4, marker: 82, s: 0.4824, segment: 'corner' },
  { circuitId: 4, marker: 83, s: 0.4882, segment: 'corner' },
  { circuitId: 4, marker: 84, s: 0.4941, segment: 'hairpin' },
  { circuitId: 4, marker: 85, s: 0.5000, segment: 'straight' },
  { circuitId: 4, marker: 86, s: 0.5059, segment: 'corner' },
  { circuitId: 4, marker: 87, s: 0.5118, segment: 'corner' },
  { circuitId: 4, marker: 88, s: 0.5176, segment: 'chicane' },
  { circuitId: 4, marker: 89, s: 0.5235, segment: 'corner' },
  { circuitId: 4, marker: 90, s: 0.5294, segment: 'straight' },
  { circuitId: 4, marker: 91, s: 0.5353, segment: 'hairpin' },
  { circuitId: 4, marker: 92, s: 0.5412, segment: 'corner' },
  { circuitId: 4, marker: 93, s: 0.5471, segment: 'corner' },
  { circuitId: 4, marker: 94, s: 0.5529, segment: 'corner' },
  { circuitId: 4, marker: 95, s: 0.5588, segment: 'straight' },
  { circuitId: 4, marker: 96, s: 0.5647, segment: 'corner' },
  { circuitId: 4, marker: 97, s: 0.5706, segment: 'corner' },
  { circuitId: 4, marker: 98, s: 0.5765, segment: 'hairpin' },
  { circuitId: 4, marker: 99, s: 0.5824, segment: 'chicane' },
  { circuitId: 4, marker: 100, s: 0.5882, segment: 'straight' },
  { circuitId: 4, marker: 101, s: 0.5941, segment: 'corner' },
  { circuitId: 4, marker: 102, s: 0.6000, segment: 'corner' },
  { circuitId: 4, marker: 103, s: 0.6059, segment: 'corner' },
  { circuitId: 4, marker: 104, s: 0.6118, segment: 'corner' },
  { circuitId: 4, marker: 105, s: 0.6176, segment: 'hairpin' },
  { circuitId: 4, marker: 106, s: 0.6235, segment: 'corner' },
  { circuitId: 4, marker: 107, s: 0.6294, segment: 'corner' },
  { circuitId: 4, marker: 108, s: 0.6353, segment: 'corner' },
  { circuitId: 4, marker: 109, s: 0.6412, segment: 'corner' },
  { circuitId: 4, marker: 110, s: 0.6471, segment: 'chicane' },
  { circuitId: 4, marker: 111, s: 0.6529, segment: 'corner' },
  { circuitId: 4, marker: 112, s: 0.6588, segment: 'hairpin' },
  { circuitId: 4, marker: 113, s: 0.6647, segment: 'corner' },
  { circuitId: 4, marker: 114, s: 0.6706, segment: 'corner' },
  { circuitId: 4, marker: 115, s: 0.6765, segment: 'straight' },
  { circuitId: 4, marker: 116, s: 0.6824, segment: 'corner' },
  { circuitId: 4, marker: 117, s: 0.6882, segment: 'corner' },
  { circuitId: 4, marker: 118, s: 0.6941, segment: 'corner' },
  { circuitId: 4, marker: 119, s: 0.7000, segment: 'hairpin' },
  { circuitId: 4, marker: 120, s: 0.7059, segment: 'straight' },
  { circuitId: 4, marker: 121, s: 0.7118, segment: 'chicane' },
  { circuitId: 4, marker: 122, s: 0.7176, segment: 'corner' },
  { circuitId: 4, marker: 123, s: 0.7235, segment: 'corner' },
  { circuitId: 4, marker: 124, s: 0.7294, segment: 'corner' },
  { circuitId: 4, marker: 125, s: 0.7353, segment: 'straight' },
  { circuitId: 4, marker: 126, s: 0.7412, segment: 'hairpin' },
  { circuitId: 4, marker: 127, s: 0.7471, segment: 'corner' },
  { circuitId: 4, marker: 128, s: 0.7529, segment: 'corner' },
  { circuitId: 4, marker: 129, s: 0.7588, segment: 'corner' },
  { circuitId: 4, marker: 130, s: 0.7647, segment: 'straight' },
  { circuitId: 4, marker: 131, s: 0.7706, segment: 'corner' },
  { circuitId: 4, marker: 132, s: 0.7765, segment: 'chicane' },
  { circuitId: 4, marker: 133, s: 0.7824, segment: 'hairpin' },
  { circuitId: 4, marker: 134, s: 0.7882, segment: 'corner' },
  { circuitId: 4, marker: 135, s: 0.7941, segment: 'straight' },
  { circuitId: 4, marker: 136, s: 0.8000, segment: 'corner' },
  { circuitId: 4, marker: 137, s: 0.8059, segment: 'corner' },
  { circuitId: 4, marker: 138, s: 0.8118, segment: 'corner' },
  { circuitId: 4, marker: 139, s: 0.8176, segment: 'corner' },
  { circuitId: 4, marker: 140, s: 0.8235, segment: 'hairpin' },
  { circuitId: 4, marker: 141, s: 0.8294, segment: 'corner' },
  { circuitId: 4, marker: 142, s: 0.8353, segment: 'corner' },
  { circuitId: 4, marker: 143, s: 0.8412, segment: 'chicane' },
  { circuitId: 4, marker: 144, s: 0.8471, segment: 'corner' },
  { circuitId: 4, marker: 145, s: 0.8529, segment: 'straight' },
  { circuitId: 4, marker: 146, s: 0.8588, segment: 'corner' },
  { circuitId: 4, marker: 147, s: 0.8647, segment: 'hairpin' },
  { circuitId: 4, marker: 148, s: 0.8706, segment: 'corner' },
  { circuitId: 4, marker: 149, s: 0.8765, segment: 'corner' },
  { circuitId: 4, marker: 150, s: 0.8824, segment: 'straight' },
  { circuitId: 4, marker: 151, s: 0.8882, segment: 'corner' },
  { circuitId: 4, marker: 152, s: 0.8941, segment: 'corner' },
  { circuitId: 4, marker: 153, s: 0.9000, segment: 'corner' },
  { circuitId: 4, marker: 154, s: 0.9059, segment: 'chicane' },
  { circuitId: 4, marker: 155, s: 0.9118, segment: 'straight' },
  { circuitId: 4, marker: 156, s: 0.9176, segment: 'corner' },
  { circuitId: 4, marker: 157, s: 0.9235, segment: 'corner' },
  { circuitId: 4, marker: 158, s: 0.9294, segment: 'corner' },
  { circuitId: 4, marker: 159, s: 0.9353, segment: 'corner' },
  { circuitId: 4, marker: 160, s: 0.9412, segment: 'straight' },
  { circuitId: 4, marker: 161, s: 0.9471, segment: 'hairpin' },
  { circuitId: 4, marker: 162, s: 0.9529, segment: 'corner' },
  { circuitId: 4, marker: 163, s: 0.9588, segment: 'corner' },
  { circuitId: 4, marker: 164, s: 0.9647, segment: 'corner' },
  { circuitId: 4, marker: 165, s: 0.9706, segment: 'chicane' },
  { circuitId: 4, marker: 166, s: 0.9765, segment: 'corner' },
  { circuitId: 4, marker: 167, s: 0.9824, segment: 'corner' },
  { circuitId: 4, marker: 168, s: 0.9882, segment: 'hairpin' },
  { circuitId: 4, marker: 169, s: 0.9941, segment: 'corner' },
  { circuitId: 5, marker: 0, s: 0.0000, segment: 'chicane' },
  { circuitId: 5, marker: 1, s: 0.0059, segment: 'corner' },
  { circuitId: 5, marker: 2, s: 0.0118, segment: 'corner' },
  { circuitId: 5, marker: 3, s: 0.0176, segment: 'corner' },
  { circuitId: 5, marker: 4, s: 0.0235, segment: 'corner' },
  { circuitId: 5, marker: 5, s: 0.0294, segment: 'straight' },
  { circuitId: 5, marker: 6, s: 0.0353, segment: 'corner' },
  { circuitId: 5, marker: 7, s: 0.0412, segment: 'hairpin' },
  { circuitId: 5, marker: 8, s: 0.0471, segment: 'corner' },
  { circuitId: 5, marker: 9, s: 0.0529, segment: 'corner' },
  { circuitId: 5, marker: 10, s: 0.0588, segment: 'straight' },
  { circuitId: 5, marker: 11, s: 0.0647, segment: 'chicane' },
  { circuitId: 5, marker: 12, s: 0.0706, segment: 'corner' },
  { circuitId: 5, marker: 13, s: 0.0765, segment: 'corner' },
  { circuitId: 5, marker: 14, s: 0.0824, segment: 'hairpin' },
  { circuitId: 5, marker: 15, s: 0.0882, segment: 'straight' },
  { circuitId: 5, marker: 16, s: 0.0941, segment: 'corner' },
  { circuitId: 5, marker: 17, s: 0.1000, segment: 'corner' },
  { circuitId: 5, marker: 18, s: 0.1059, segment: 'corner' },
  { circuitId: 5, marker: 19, s: 0.1118, segment: 'corner' },
  { circuitId: 5, marker: 20, s: 0.1176, segment: 'straight' },
  { circuitId: 5, marker: 21, s: 0.1235, segment: 'hairpin' },
  { circuitId: 5, marker: 22, s: 0.1294, segment: 'chicane' },
  { circuitId: 5, marker: 23, s: 0.1353, segment: 'corner' },
  { circuitId: 5, marker: 24, s: 0.1412, segment: 'corner' },
  { circuitId: 5, marker: 25, s: 0.1471, segment: 'straight' },
  { circuitId: 5, marker: 26, s: 0.1529, segment: 'corner' },
  { circuitId: 5, marker: 27, s: 0.1588, segment: 'corner' },
  { circuitId: 5, marker: 28, s: 0.1647, segment: 'hairpin' },
  { circuitId: 5, marker: 29, s: 0.1706, segment: 'corner' },
  { circuitId: 5, marker: 30, s: 0.1765, segment: 'straight' },
  { circuitId: 5, marker: 31, s: 0.1824, segment: 'corner' },
  { circuitId: 5, marker: 32, s: 0.1882, segment: 'corner' },
  { circuitId: 5, marker: 33, s: 0.1941, segment: 'chicane' },
  { circuitId: 5, marker: 34, s: 0.2000, segment: 'corner' },
  { circuitId: 5, marker: 35, s: 0.2059, segment: 'hairpin' },
  { circuitId: 5, marker: 36, s: 0.2118, segment: 'corner' },
  { circuitId: 5, marker: 37, s: 0.2176, segment: 'corner' },
  { circuitId: 5, marker: 38, s: 0.2235, segment: 'corner' },
  { circuitId: 5, marker: 39, s: 0.2294, segment: 'corner' },
  { circuitId: 5, marker: 40, s: 0.2353, segment: 'straight' },
  { circuitId: 5, marker: 41, s: 0.2412, segment: 'corner' },
  { circuitId: 5, marker: 42, s: 0.2471, segment: 'hairpin' },
  { circuitId: 5, marker: 43, s: 0.2529, segment: 'corner' },
  { circuitId: 5, marker: 44, s: 0.2588, segment: 'chicane' },
  { circuitId: 5, marker: 45, s: 0.2647, segment: 'straight' },
  { circuitId: 5, marker: 46, s: 0.2706, segment: 'corner' },
  { circuitId: 5, marker: 47, s: 0.2765, segment: 'corner' },
  { circuitId: 5, marker: 48, s: 0.2824, segment: 'corner' },
  { circuitId: 5, marker: 49, s: 0.2882, segment: 'hairpin' },
  { circuitId: 5, marker: 50, s: 0.2941, segment: 'straight' },
  { circuitId: 5, marker: 51, s: 0.3000, segment: 'corner' },
  { circuitId: 5, marker: 52, s: 0.3059, segment: 'corner' },
  { circuitId: 5, marker: 53, s: 0.3118, segment: 'corner' },
  { circuitId: 5, marker: 54, s: 0.3176, segment: 'corner' },
  { circuitId: 5, marker: 55, s: 0.3235, segment: 'chicane' },
  { circuitId: 5, marker: 56, s: 0.3294, segment: 'hairpin' },
  { circuitId: 5, marker: 57, s: 0.3353, segment: 'corner' },
  { circuitId: 5, marker: 58, s: 0.3412, segment: 'corner' },
  { circuitId: 5, marker: 59, s: 0.3471, segment: 'corner' },
  { circuitId: 5, marker: 60, s: 0.3529, segment: 'straight' },
  { circuitId: 5, marker: 61, s: 0.3588, segment: 'corner' },
  { circuitId: 5, marker: 62, s: 0.3647, segment: 'corner' },
  { circuitId: 5, marker: 63, s: 0.3706, segment: 'hairpin' },
  { circuitId: 5, marker: 64, s: 0.3765, segment: 'corner' },
  { circuitId: 5, marker: 65, s: 0.3824, segment: 'straight' },
  { circuitId: 5, marker: 66, s: 0.3882, segment: 'chicane' },
  { circuitId: 5, marker: 67, s: 0.3941, segment: 'corner' },
  { circuitId: 5, marker: 68, s: 0.4000, segment: 'corner' },
  { circuitId: 5, marker: 69, s: 0.4059, segment: 'corner' },
  { circuitId: 5, marker: 70, s: 0.4118, segment: 'hairpin' },
  { circuitId: 5, marker: 71, s: 0.4176, segment: 'corner' },
  { circuitId: 5, marker: 72, s: 0.4235, segment: 'corner' },
  { circuitId: 5, marker: 73, s: 0.4294, segment: 'corner' },
  { circuitId: 5, marker: 74, s: 0.4353, segment: 'corner' },
  { circuitId: 5, marker: 75, s: 0.4412, segment: 'straight' },
  { circuitId: 5, marker: 76, s: 0.4471, segment: 'corner' },
  { circuitId: 5, marker: 77, s: 0.4529, segment: 'chicane' },
  { circuitId: 5, marker: 78, s: 0.4588, segment: 'corner' },
  { circuitId: 5, marker: 79, s: 0.4647, segment: 'corner' },
  { circuitId: 5, marker: 80, s: 0.4706, segment: 'straight' },
  { circuitId: 5, marker: 81, s: 0.4765, segment: 'corner' },
  { circuitId: 5, marker: 82, s: 0.4824, segment: 'corner' },
  { circuitId: 5, marker: 83, s: 0.4882, segment: 'corner' },
  { circuitId: 5, marker: 84, s: 0.4941, segment: 'hairpin' },
  { circuitId: 5, marker: 85, s: 0.5000, segment: 'straight' },
  { circuitId: 5, marker: 86, s: 0.5059, segment: 'corner' },
  { circuitId: 5, marker: 87, s: 0.5118, segment: 'corner' },
  { circuitId: 5, marker: 88, s: 0.5176, segment: 'chicane' },
  { circuitId: 5, marker: 89, s: 0.5235, segment: 'corner' },
  { circuitId: 5, marker: 90, s: 0.5294, segment: 'straight' },
  { circuitId: 5, marker: 91, s: 0.5353, segment: 'hairpin' },
  { circuitId: 5, marker: 92, s: 0.5412, segment: 'corner' },
  { circuitId: 5, marker: 93, s: 0.5471, segment: 'corner' },
  { circuitId: 5, marker: 94, s: 0.5529, segment: 'corner' },
  { circuitId: 5, marker: 95, s: 0.5588, segment: 'straight' },
  { circuitId: 5, marker: 96, s: 0.5647, segment: 'corner' },
  { circuitId: 5, marker: 97, s: 0.5706, segment: 'corner' },
  { circuitId: 5, marker: 98, s: 0.5765, segment: 'hairpin' },
  { circuitId: 5, marker: 99, s: 0.5824, segment: 'chicane' },
  { circuitId: 5, marker: 100, s: 0.5882, segment: 'straight' },
  { circuitId: 5, marker: 101, s: 0.5941, segment: 'corner' },
  { circuitId: 5, marker: 102, s: 0.6000, segment: 'corner' },
  { circuitId: 5, marker: 103, s: 0.6059, segment: 'corner' },
  { circuitId: 5, marker: 104, s: 0.6118, segment: 'corner' },
  { circuitId: 5, marker: 105, s: 0.6176, segment: 'hairpin' },
  { circuitId: 5, marker: 106, s: 0.6235, segment: 'corner' },
  { circuitId: 5, marker: 107, s: 0.6294, segment: 'corner' },
  { circuitId: 5, marker: 108, s: 0.6353, segment: 'corner' },
  { circuitId: 5, marker: 109, s: 0.6412, segment: 'corner' },
  { circuitId: 5, marker: 110, s: 0.6471, segment: 'chicane' },
  { circuitId: 5, marker: 111, s: 0.6529, segment: 'corner' },
  { circuitId: 5, marker: 112, s: 0.6588, segment: 'hairpin' },
  { circuitId: 5, marker: 113, s: 0.6647, segment: 'corner' },
  { circuitId: 5, marker: 114, s: 0.6706, segment: 'corner' },
  { circuitId: 5, marker: 115, s: 0.6765, segment: 'straight' },
  { circuitId: 5, marker: 116, s: 0.6824, segment: 'corner' },
  { circuitId: 5, marker: 117, s: 0.6882, segment: 'corner' },
  { circuitId: 5, marker: 118, s: 0.6941, segment: 'corner' },
  { circuitId: 5, marker: 119, s: 0.7000, segment: 'hairpin' },
  { circuitId: 5, marker: 120, s: 0.7059, segment: 'straight' },
  { circuitId: 5, marker: 121, s: 0.7118, segment: 'chicane' },
  { circuitId: 5, marker: 122, s: 0.7176, segment: 'corner' },
  { circuitId: 5, marker: 123, s: 0.7235, segment: 'corner' },
  { circuitId: 5, marker: 124, s: 0.7294, segment: 'corner' },
  { circuitId: 5, marker: 125, s: 0.7353, segment: 'straight' },
  { circuitId: 5, marker: 126, s: 0.7412, segment: 'hairpin' },
  { circuitId: 5, marker: 127, s: 0.7471, segment: 'corner' },
  { circuitId: 5, marker: 128, s: 0.7529, segment: 'corner' },
  { circuitId: 5, marker: 129, s: 0.7588, segment: 'corner' },
  { circuitId: 5, marker: 130, s: 0.7647, segment: 'straight' },
  { circuitId: 5, marker: 131, s: 0.7706, segment: 'corner' },
  { circuitId: 5, marker: 132, s: 0.7765, segment: 'chicane' },
  { circuitId: 5, marker: 133, s: 0.7824, segment: 'hairpin' },
  { circuitId: 5, marker: 134, s: 0.7882, segment: 'corner' },
  { circuitId: 5, marker: 135, s: 0.7941, segment: 'straight' },
  { circuitId: 5, marker: 136, s: 0.8000, segment: 'corner' },
  { circuitId: 5, marker: 137, s: 0.8059, segment: 'corner' },
  { circuitId: 5, marker: 138, s: 0.8118, segment: 'corner' },
  { circuitId: 5, marker: 139, s: 0.8176, segment: 'corner' },
  { circuitId: 5, marker: 140, s: 0.8235, segment: 'hairpin' },
  { circuitId: 5, marker: 141, s: 0.8294, segment: 'corner' },
  { circuitId: 5, marker: 142, s: 0.8353, segment: 'corner' },
  { circuitId: 5, marker: 143, s: 0.8412, segment: 'chicane' },
  { circuitId: 5, marker: 144, s: 0.8471, segment: 'corner' },
  { circuitId: 5, marker: 145, s: 0.8529, segment: 'straight' },
  { circuitId: 5, marker: 146, s: 0.8588, segment: 'corner' },
  { circuitId: 5, marker: 147, s: 0.8647, segment: 'hairpin' },
  { circuitId: 5, marker: 148, s: 0.8706, segment: 'corner' },
  { circuitId: 5, marker: 149, s: 0.8765, segment: 'corner' },
  { circuitId: 5, marker: 150, s: 0.8824, segment: 'straight' },
  { circuitId: 5, marker: 151, s: 0.8882, segment: 'corner' },
  { circuitId: 5, marker: 152, s: 0.8941, segment: 'corner' },
  { circuitId: 5, marker: 153, s: 0.9000, segment: 'corner' },
  { circuitId: 5, marker: 154, s: 0.9059, segment: 'chicane' },
  { circuitId: 5, marker: 155, s: 0.9118, segment: 'straight' },
  { circuitId: 5, marker: 156, s: 0.9176, segment: 'corner' },
  { circuitId: 5, marker: 157, s: 0.9235, segment: 'corner' },
  { circuitId: 5, marker: 158, s: 0.9294, segment: 'corner' },
  { circuitId: 5, marker: 159, s: 0.9353, segment: 'corner' },
  { circuitId: 5, marker: 160, s: 0.9412, segment: 'straight' },
  { circuitId: 5, marker: 161, s: 0.9471, segment: 'hairpin' },
  { circuitId: 5, marker: 162, s: 0.9529, segment: 'corner' },
  { circuitId: 5, marker: 163, s: 0.9588, segment: 'corner' },
  { circuitId: 5, marker: 164, s: 0.9647, segment: 'corner' },
  { circuitId: 5, marker: 165, s: 0.9706, segment: 'chicane' },
  { circuitId: 5, marker: 166, s: 0.9765, segment: 'corner' },
  { circuitId: 5, marker: 167, s: 0.9824, segment: 'corner' },
  { circuitId: 5, marker: 168, s: 0.9882, segment: 'hairpin' },
  { circuitId: 5, marker: 169, s: 0.9941, segment: 'corner' },
  { circuitId: 6, marker: 0, s: 0.0000, segment: 'chicane' },
  { circuitId: 6, marker: 1, s: 0.0059, segment: 'corner' },
  { circuitId: 6, marker: 2, s: 0.0118, segment: 'corner' },
  { circuitId: 6, marker: 3, s: 0.0176, segment: 'corner' },
  { circuitId: 6, marker: 4, s: 0.0235, segment: 'corner' },
  { circuitId: 6, marker: 5, s: 0.0294, segment: 'straight' },
  { circuitId: 6, marker: 6, s: 0.0353, segment: 'corner' },
  { circuitId: 6, marker: 7, s: 0.0412, segment: 'hairpin' },
  { circuitId: 6, marker: 8, s: 0.0471, segment: 'corner' },
  { circuitId: 6, marker: 9, s: 0.0529, segment: 'corner' },
  { circuitId: 6, marker: 10, s: 0.0588, segment: 'straight' },
  { circuitId: 6, marker: 11, s: 0.0647, segment: 'chicane' },
  { circuitId: 6, marker: 12, s: 0.0706, segment: 'corner' },
  { circuitId: 6, marker: 13, s: 0.0765, segment: 'corner' },
  { circuitId: 6, marker: 14, s: 0.0824, segment: 'hairpin' },
  { circuitId: 6, marker: 15, s: 0.0882, segment: 'straight' },
  { circuitId: 6, marker: 16, s: 0.0941, segment: 'corner' },
  { circuitId: 6, marker: 17, s: 0.1000, segment: 'corner' },
  { circuitId: 6, marker: 18, s: 0.1059, segment: 'corner' },
  { circuitId: 6, marker: 19, s: 0.1118, segment: 'corner' },
  { circuitId: 6, marker: 20, s: 0.1176, segment: 'straight' },
  { circuitId: 6, marker: 21, s: 0.1235, segment: 'hairpin' },
  { circuitId: 6, marker: 22, s: 0.1294, segment: 'chicane' },
  { circuitId: 6, marker: 23, s: 0.1353, segment: 'corner' },
  { circuitId: 6, marker: 24, s: 0.1412, segment: 'corner' },
  { circuitId: 6, marker: 25, s: 0.1471, segment: 'straight' },
  { circuitId: 6, marker: 26, s: 0.1529, segment: 'corner' },
  { circuitId: 6, marker: 27, s: 0.1588, segment: 'corner' },
  { circuitId: 6, marker: 28, s: 0.1647, segment: 'hairpin' },
  { circuitId: 6, marker: 29, s: 0.1706, segment: 'corner' },
  { circuitId: 6, marker: 30, s: 0.1765, segment: 'straight' },
  { circuitId: 6, marker: 31, s: 0.1824, segment: 'corner' },
  { circuitId: 6, marker: 32, s: 0.1882, segment: 'corner' },
  { circuitId: 6, marker: 33, s: 0.1941, segment: 'chicane' },
  { circuitId: 6, marker: 34, s: 0.2000, segment: 'corner' },
  { circuitId: 6, marker: 35, s: 0.2059, segment: 'hairpin' },
  { circuitId: 6, marker: 36, s: 0.2118, segment: 'corner' },
  { circuitId: 6, marker: 37, s: 0.2176, segment: 'corner' },
  { circuitId: 6, marker: 38, s: 0.2235, segment: 'corner' },
  { circuitId: 6, marker: 39, s: 0.2294, segment: 'corner' },
  { circuitId: 6, marker: 40, s: 0.2353, segment: 'straight' },
  { circuitId: 6, marker: 41, s: 0.2412, segment: 'corner' },
  { circuitId: 6, marker: 42, s: 0.2471, segment: 'hairpin' },
  { circuitId: 6, marker: 43, s: 0.2529, segment: 'corner' },
  { circuitId: 6, marker: 44, s: 0.2588, segment: 'chicane' },
  { circuitId: 6, marker: 45, s: 0.2647, segment: 'straight' },
  { circuitId: 6, marker: 46, s: 0.2706, segment: 'corner' },
  { circuitId: 6, marker: 47, s: 0.2765, segment: 'corner' },
  { circuitId: 6, marker: 48, s: 0.2824, segment: 'corner' },
  { circuitId: 6, marker: 49, s: 0.2882, segment: 'hairpin' },
  { circuitId: 6, marker: 50, s: 0.2941, segment: 'straight' },
  { circuitId: 6, marker: 51, s: 0.3000, segment: 'corner' },
  { circuitId: 6, marker: 52, s: 0.3059, segment: 'corner' },
  { circuitId: 6, marker: 53, s: 0.3118, segment: 'corner' },
  { circuitId: 6, marker: 54, s: 0.3176, segment: 'corner' },
  { circuitId: 6, marker: 55, s: 0.3235, segment: 'chicane' },
  { circuitId: 6, marker: 56, s: 0.3294, segment: 'hairpin' },
  { circuitId: 6, marker: 57, s: 0.3353, segment: 'corner' },
  { circuitId: 6, marker: 58, s: 0.3412, segment: 'corner' },
  { circuitId: 6, marker: 59, s: 0.3471, segment: 'corner' },
  { circuitId: 6, marker: 60, s: 0.3529, segment: 'straight' },
  { circuitId: 6, marker: 61, s: 0.3588, segment: 'corner' },
  { circuitId: 6, marker: 62, s: 0.3647, segment: 'corner' },
  { circuitId: 6, marker: 63, s: 0.3706, segment: 'hairpin' },
  { circuitId: 6, marker: 64, s: 0.3765, segment: 'corner' },
  { circuitId: 6, marker: 65, s: 0.3824, segment: 'straight' },
  { circuitId: 6, marker: 66, s: 0.3882, segment: 'chicane' },
  { circuitId: 6, marker: 67, s: 0.3941, segment: 'corner' },
  { circuitId: 6, marker: 68, s: 0.4000, segment: 'corner' },
  { circuitId: 6, marker: 69, s: 0.4059, segment: 'corner' },
  { circuitId: 6, marker: 70, s: 0.4118, segment: 'hairpin' },
  { circuitId: 6, marker: 71, s: 0.4176, segment: 'corner' },
  { circuitId: 6, marker: 72, s: 0.4235, segment: 'corner' },
  { circuitId: 6, marker: 73, s: 0.4294, segment: 'corner' },
  { circuitId: 6, marker: 74, s: 0.4353, segment: 'corner' },
  { circuitId: 6, marker: 75, s: 0.4412, segment: 'straight' },
  { circuitId: 6, marker: 76, s: 0.4471, segment: 'corner' },
  { circuitId: 6, marker: 77, s: 0.4529, segment: 'chicane' },
  { circuitId: 6, marker: 78, s: 0.4588, segment: 'corner' },
  { circuitId: 6, marker: 79, s: 0.4647, segment: 'corner' },
  { circuitId: 6, marker: 80, s: 0.4706, segment: 'straight' },
  { circuitId: 6, marker: 81, s: 0.4765, segment: 'corner' },
  { circuitId: 6, marker: 82, s: 0.4824, segment: 'corner' },
  { circuitId: 6, marker: 83, s: 0.4882, segment: 'corner' },
  { circuitId: 6, marker: 84, s: 0.4941, segment: 'hairpin' },
  { circuitId: 6, marker: 85, s: 0.5000, segment: 'straight' },
  { circuitId: 6, marker: 86, s: 0.5059, segment: 'corner' },
  { circuitId: 6, marker: 87, s: 0.5118, segment: 'corner' },
  { circuitId: 6, marker: 88, s: 0.5176, segment: 'chicane' },
  { circuitId: 6, marker: 89, s: 0.5235, segment: 'corner' },
  { circuitId: 6, marker: 90, s: 0.5294, segment: 'straight' },
  { circuitId: 6, marker: 91, s: 0.5353, segment: 'hairpin' },
  { circuitId: 6, marker: 92, s: 0.5412, segment: 'corner' },
  { circuitId: 6, marker: 93, s: 0.5471, segment: 'corner' },
  { circuitId: 6, marker: 94, s: 0.5529, segment: 'corner' },
  { circuitId: 6, marker: 95, s: 0.5588, segment: 'straight' },
  { circuitId: 6, marker: 96, s: 0.5647, segment: 'corner' },
  { circuitId: 6, marker: 97, s: 0.5706, segment: 'corner' },
  { circuitId: 6, marker: 98, s: 0.5765, segment: 'hairpin' },
  { circuitId: 6, marker: 99, s: 0.5824, segment: 'chicane' },
  { circuitId: 6, marker: 100, s: 0.5882, segment: 'straight' },
  { circuitId: 6, marker: 101, s: 0.5941, segment: 'corner' },
  { circuitId: 6, marker: 102, s: 0.6000, segment: 'corner' },
  { circuitId: 6, marker: 103, s: 0.6059, segment: 'corner' },
  { circuitId: 6, marker: 104, s: 0.6118, segment: 'corner' },
  { circuitId: 6, marker: 105, s: 0.6176, segment: 'hairpin' },
  { circuitId: 6, marker: 106, s: 0.6235, segment: 'corner' },
  { circuitId: 6, marker: 107, s: 0.6294, segment: 'corner' },
  { circuitId: 6, marker: 108, s: 0.6353, segment: 'corner' },
  { circuitId: 6, marker: 109, s: 0.6412, segment: 'corner' },
  { circuitId: 6, marker: 110, s: 0.6471, segment: 'chicane' },
  { circuitId: 6, marker: 111, s: 0.6529, segment: 'corner' },
  { circuitId: 6, marker: 112, s: 0.6588, segment: 'hairpin' },
  { circuitId: 6, marker: 113, s: 0.6647, segment: 'corner' },
  { circuitId: 6, marker: 114, s: 0.6706, segment: 'corner' },
  { circuitId: 6, marker: 115, s: 0.6765, segment: 'straight' },
  { circuitId: 6, marker: 116, s: 0.6824, segment: 'corner' },
  { circuitId: 6, marker: 117, s: 0.6882, segment: 'corner' },
  { circuitId: 6, marker: 118, s: 0.6941, segment: 'corner' },
  { circuitId: 6, marker: 119, s: 0.7000, segment: 'hairpin' },
  { circuitId: 6, marker: 120, s: 0.7059, segment: 'straight' },
  { circuitId: 6, marker: 121, s: 0.7118, segment: 'chicane' },
  { circuitId: 6, marker: 122, s: 0.7176, segment: 'corner' },
  { circuitId: 6, marker: 123, s: 0.7235, segment: 'corner' },
  { circuitId: 6, marker: 124, s: 0.7294, segment: 'corner' },
  { circuitId: 6, marker: 125, s: 0.7353, segment: 'straight' },
  { circuitId: 6, marker: 126, s: 0.7412, segment: 'hairpin' },
  { circuitId: 6, marker: 127, s: 0.7471, segment: 'corner' },
  { circuitId: 6, marker: 128, s: 0.7529, segment: 'corner' },
  { circuitId: 6, marker: 129, s: 0.7588, segment: 'corner' },
  { circuitId: 6, marker: 130, s: 0.7647, segment: 'straight' },
  { circuitId: 6, marker: 131, s: 0.7706, segment: 'corner' },
  { circuitId: 6, marker: 132, s: 0.7765, segment: 'chicane' },
  { circuitId: 6, marker: 133, s: 0.7824, segment: 'hairpin' },
  { circuitId: 6, marker: 134, s: 0.7882, segment: 'corner' },
  { circuitId: 6, marker: 135, s: 0.7941, segment: 'straight' },
  { circuitId: 6, marker: 136, s: 0.8000, segment: 'corner' },
  { circuitId: 6, marker: 137, s: 0.8059, segment: 'corner' },
  { circuitId: 6, marker: 138, s: 0.8118, segment: 'corner' },
  { circuitId: 6, marker: 139, s: 0.8176, segment: 'corner' },
  { circuitId: 6, marker: 140, s: 0.8235, segment: 'hairpin' },
  { circuitId: 6, marker: 141, s: 0.8294, segment: 'corner' },
  { circuitId: 6, marker: 142, s: 0.8353, segment: 'corner' },
  { circuitId: 6, marker: 143, s: 0.8412, segment: 'chicane' },
  { circuitId: 6, marker: 144, s: 0.8471, segment: 'corner' },
  { circuitId: 6, marker: 145, s: 0.8529, segment: 'straight' },
  { circuitId: 6, marker: 146, s: 0.8588, segment: 'corner' },
  { circuitId: 6, marker: 147, s: 0.8647, segment: 'hairpin' },
  { circuitId: 6, marker: 148, s: 0.8706, segment: 'corner' },
  { circuitId: 6, marker: 149, s: 0.8765, segment: 'corner' },
  { circuitId: 6, marker: 150, s: 0.8824, segment: 'straight' },
  { circuitId: 6, marker: 151, s: 0.8882, segment: 'corner' },
  { circuitId: 6, marker: 152, s: 0.8941, segment: 'corner' },
  { circuitId: 6, marker: 153, s: 0.9000, segment: 'corner' },
  { circuitId: 6, marker: 154, s: 0.9059, segment: 'chicane' },
  { circuitId: 6, marker: 155, s: 0.9118, segment: 'straight' },
  { circuitId: 6, marker: 156, s: 0.9176, segment: 'corner' },
  { circuitId: 6, marker: 157, s: 0.9235, segment: 'corner' },
  { circuitId: 6, marker: 158, s: 0.9294, segment: 'corner' },
  { circuitId: 6, marker: 159, s: 0.9353, segment: 'corner' },
  { circuitId: 6, marker: 160, s: 0.9412, segment: 'straight' },
  { circuitId: 6, marker: 161, s: 0.9471, segment: 'hairpin' },
  { circuitId: 6, marker: 162, s: 0.9529, segment: 'corner' },
  { circuitId: 6, marker: 163, s: 0.9588, segment: 'corner' },
  { circuitId: 6, marker: 164, s: 0.9647, segment: 'corner' },
  { circuitId: 6, marker: 165, s: 0.9706, segment: 'chicane' },
  { circuitId: 6, marker: 166, s: 0.9765, segment: 'corner' },
  { circuitId: 6, marker: 167, s: 0.9824, segment: 'corner' },
  { circuitId: 6, marker: 168, s: 0.9882, segment: 'hairpin' },
  { circuitId: 6, marker: 169, s: 0.9941, segment: 'corner' },
  { circuitId: 7, marker: 0, s: 0.0000, segment: 'chicane' },
  { circuitId: 7, marker: 1, s: 0.0059, segment: 'corner' },
  { circuitId: 7, marker: 2, s: 0.0118, segment: 'corner' },
  { circuitId: 7, marker: 3, s: 0.0176, segment: 'corner' },
  { circuitId: 7, marker: 4, s: 0.0235, segment: 'corner' },
  { circuitId: 7, marker: 5, s: 0.0294, segment: 'straight' },
  { circuitId: 7, marker: 6, s: 0.0353, segment: 'corner' },
  { circuitId: 7, marker: 7, s: 0.0412, segment: 'hairpin' },
  { circuitId: 7, marker: 8, s: 0.0471, segment: 'corner' },
  { circuitId: 7, marker: 9, s: 0.0529, segment: 'corner' },
  { circuitId: 7, marker: 10, s: 0.0588, segment: 'straight' },
  { circuitId: 7, marker: 11, s: 0.0647, segment: 'chicane' },
  { circuitId: 7, marker: 12, s: 0.0706, segment: 'corner' },
  { circuitId: 7, marker: 13, s: 0.0765, segment: 'corner' },
  { circuitId: 7, marker: 14, s: 0.0824, segment: 'hairpin' },
  { circuitId: 7, marker: 15, s: 0.0882, segment: 'straight' },
  { circuitId: 7, marker: 16, s: 0.0941, segment: 'corner' },
  { circuitId: 7, marker: 17, s: 0.1000, segment: 'corner' },
  { circuitId: 7, marker: 18, s: 0.1059, segment: 'corner' },
  { circuitId: 7, marker: 19, s: 0.1118, segment: 'corner' },
  { circuitId: 7, marker: 20, s: 0.1176, segment: 'straight' },
  { circuitId: 7, marker: 21, s: 0.1235, segment: 'hairpin' },
  { circuitId: 7, marker: 22, s: 0.1294, segment: 'chicane' },
  { circuitId: 7, marker: 23, s: 0.1353, segment: 'corner' },
  { circuitId: 7, marker: 24, s: 0.1412, segment: 'corner' },
  { circuitId: 7, marker: 25, s: 0.1471, segment: 'straight' },
  { circuitId: 7, marker: 26, s: 0.1529, segment: 'corner' },
  { circuitId: 7, marker: 27, s: 0.1588, segment: 'corner' },
  { circuitId: 7, marker: 28, s: 0.1647, segment: 'hairpin' },
  { circuitId: 7, marker: 29, s: 0.1706, segment: 'corner' },
  { circuitId: 7, marker: 30, s: 0.1765, segment: 'straight' },
  { circuitId: 7, marker: 31, s: 0.1824, segment: 'corner' },
  { circuitId: 7, marker: 32, s: 0.1882, segment: 'corner' },
  { circuitId: 7, marker: 33, s: 0.1941, segment: 'chicane' },
  { circuitId: 7, marker: 34, s: 0.2000, segment: 'corner' },
  { circuitId: 7, marker: 35, s: 0.2059, segment: 'hairpin' },
  { circuitId: 7, marker: 36, s: 0.2118, segment: 'corner' },
  { circuitId: 7, marker: 37, s: 0.2176, segment: 'corner' },
  { circuitId: 7, marker: 38, s: 0.2235, segment: 'corner' },
  { circuitId: 7, marker: 39, s: 0.2294, segment: 'corner' },
  { circuitId: 7, marker: 40, s: 0.2353, segment: 'straight' },
  { circuitId: 7, marker: 41, s: 0.2412, segment: 'corner' },
  { circuitId: 7, marker: 42, s: 0.2471, segment: 'hairpin' },
  { circuitId: 7, marker: 43, s: 0.2529, segment: 'corner' },
  { circuitId: 7, marker: 44, s: 0.2588, segment: 'chicane' },
  { circuitId: 7, marker: 45, s: 0.2647, segment: 'straight' },
  { circuitId: 7, marker: 46, s: 0.2706, segment: 'corner' },
  { circuitId: 7, marker: 47, s: 0.2765, segment: 'corner' },
  { circuitId: 7, marker: 48, s: 0.2824, segment: 'corner' },
  { circuitId: 7, marker: 49, s: 0.2882, segment: 'hairpin' },
  { circuitId: 7, marker: 50, s: 0.2941, segment: 'straight' },
  { circuitId: 7, marker: 51, s: 0.3000, segment: 'corner' },
  { circuitId: 7, marker: 52, s: 0.3059, segment: 'corner' },
  { circuitId: 7, marker: 53, s: 0.3118, segment: 'corner' },
  { circuitId: 7, marker: 54, s: 0.3176, segment: 'corner' },
  { circuitId: 7, marker: 55, s: 0.3235, segment: 'chicane' },
  { circuitId: 7, marker: 56, s: 0.3294, segment: 'hairpin' },
  { circuitId: 7, marker: 57, s: 0.3353, segment: 'corner' },
  { circuitId: 7, marker: 58, s: 0.3412, segment: 'corner' },
  { circuitId: 7, marker: 59, s: 0.3471, segment: 'corner' },
  { circuitId: 7, marker: 60, s: 0.3529, segment: 'straight' },
  { circuitId: 7, marker: 61, s: 0.3588, segment: 'corner' },
  { circuitId: 7, marker: 62, s: 0.3647, segment: 'corner' },
  { circuitId: 7, marker: 63, s: 0.3706, segment: 'hairpin' },
  { circuitId: 7, marker: 64, s: 0.3765, segment: 'corner' },
  { circuitId: 7, marker: 65, s: 0.3824, segment: 'straight' },
  { circuitId: 7, marker: 66, s: 0.3882, segment: 'chicane' },
  { circuitId: 7, marker: 67, s: 0.3941, segment: 'corner' },
  { circuitId: 7, marker: 68, s: 0.4000, segment: 'corner' },
  { circuitId: 7, marker: 69, s: 0.4059, segment: 'corner' },
  { circuitId: 7, marker: 70, s: 0.4118, segment: 'hairpin' },
  { circuitId: 7, marker: 71, s: 0.4176, segment: 'corner' },
  { circuitId: 7, marker: 72, s: 0.4235, segment: 'corner' },
  { circuitId: 7, marker: 73, s: 0.4294, segment: 'corner' },
  { circuitId: 7, marker: 74, s: 0.4353, segment: 'corner' },
  { circuitId: 7, marker: 75, s: 0.4412, segment: 'straight' },
  { circuitId: 7, marker: 76, s: 0.4471, segment: 'corner' },
  { circuitId: 7, marker: 77, s: 0.4529, segment: 'chicane' },
  { circuitId: 7, marker: 78, s: 0.4588, segment: 'corner' },
  { circuitId: 7, marker: 79, s: 0.4647, segment: 'corner' },
  { circuitId: 7, marker: 80, s: 0.4706, segment: 'straight' },
  { circuitId: 7, marker: 81, s: 0.4765, segment: 'corner' },
  { circuitId: 7, marker: 82, s: 0.4824, segment: 'corner' },
  { circuitId: 7, marker: 83, s: 0.4882, segment: 'corner' },
  { circuitId: 7, marker: 84, s: 0.4941, segment: 'hairpin' },
  { circuitId: 7, marker: 85, s: 0.5000, segment: 'straight' },
  { circuitId: 7, marker: 86, s: 0.5059, segment: 'corner' },
  { circuitId: 7, marker: 87, s: 0.5118, segment: 'corner' },
  { circuitId: 7, marker: 88, s: 0.5176, segment: 'chicane' },
  { circuitId: 7, marker: 89, s: 0.5235, segment: 'corner' },
  { circuitId: 7, marker: 90, s: 0.5294, segment: 'straight' },
  { circuitId: 7, marker: 91, s: 0.5353, segment: 'hairpin' },
  { circuitId: 7, marker: 92, s: 0.5412, segment: 'corner' },
  { circuitId: 7, marker: 93, s: 0.5471, segment: 'corner' },
  { circuitId: 7, marker: 94, s: 0.5529, segment: 'corner' },
  { circuitId: 7, marker: 95, s: 0.5588, segment: 'straight' },
  { circuitId: 7, marker: 96, s: 0.5647, segment: 'corner' },
  { circuitId: 7, marker: 97, s: 0.5706, segment: 'corner' },
  { circuitId: 7, marker: 98, s: 0.5765, segment: 'hairpin' },
  { circuitId: 7, marker: 99, s: 0.5824, segment: 'chicane' },
  { circuitId: 7, marker: 100, s: 0.5882, segment: 'straight' },
  { circuitId: 7, marker: 101, s: 0.5941, segment: 'corner' },
  { circuitId: 7, marker: 102, s: 0.6000, segment: 'corner' },
  { circuitId: 7, marker: 103, s: 0.6059, segment: 'corner' },
  { circuitId: 7, marker: 104, s: 0.6118, segment: 'corner' },
  { circuitId: 7, marker: 105, s: 0.6176, segment: 'hairpin' },
  { circuitId: 7, marker: 106, s: 0.6235, segment: 'corner' },
  { circuitId: 7, marker: 107, s: 0.6294, segment: 'corner' },
  { circuitId: 7, marker: 108, s: 0.6353, segment: 'corner' },
  { circuitId: 7, marker: 109, s: 0.6412, segment: 'corner' },
  { circuitId: 7, marker: 110, s: 0.6471, segment: 'chicane' },
  { circuitId: 7, marker: 111, s: 0.6529, segment: 'corner' },
  { circuitId: 7, marker: 112, s: 0.6588, segment: 'hairpin' },
  { circuitId: 7, marker: 113, s: 0.6647, segment: 'corner' },
  { circuitId: 7, marker: 114, s: 0.6706, segment: 'corner' },
  { circuitId: 7, marker: 115, s: 0.6765, segment: 'straight' },
  { circuitId: 7, marker: 116, s: 0.6824, segment: 'corner' },
  { circuitId: 7, marker: 117, s: 0.6882, segment: 'corner' },
  { circuitId: 7, marker: 118, s: 0.6941, segment: 'corner' },
  { circuitId: 7, marker: 119, s: 0.7000, segment: 'hairpin' },
  { circuitId: 7, marker: 120, s: 0.7059, segment: 'straight' },
  { circuitId: 7, marker: 121, s: 0.7118, segment: 'chicane' },
  { circuitId: 7, marker: 122, s: 0.7176, segment: 'corner' },
  { circuitId: 7, marker: 123, s: 0.7235, segment: 'corner' },
  { circuitId: 7, marker: 124, s: 0.7294, segment: 'corner' },
  { circuitId: 7, marker: 125, s: 0.7353, segment: 'straight' },
  { circuitId: 7, marker: 126, s: 0.7412, segment: 'hairpin' },
  { circuitId: 7, marker: 127, s: 0.7471, segment: 'corner' },
  { circuitId: 7, marker: 128, s: 0.7529, segment: 'corner' },
  { circuitId: 7, marker: 129, s: 0.7588, segment: 'corner' },
  { circuitId: 7, marker: 130, s: 0.7647, segment: 'straight' },
  { circuitId: 7, marker: 131, s: 0.7706, segment: 'corner' },
  { circuitId: 7, marker: 132, s: 0.7765, segment: 'chicane' },
  { circuitId: 7, marker: 133, s: 0.7824, segment: 'hairpin' },
  { circuitId: 7, marker: 134, s: 0.7882, segment: 'corner' },
  { circuitId: 7, marker: 135, s: 0.7941, segment: 'straight' },
  { circuitId: 7, marker: 136, s: 0.8000, segment: 'corner' },
  { circuitId: 7, marker: 137, s: 0.8059, segment: 'corner' },
  { circuitId: 7, marker: 138, s: 0.8118, segment: 'corner' },
  { circuitId: 7, marker: 139, s: 0.8176, segment: 'corner' },
  { circuitId: 7, marker: 140, s: 0.8235, segment: 'hairpin' },
  { circuitId: 7, marker: 141, s: 0.8294, segment: 'corner' },
  { circuitId: 7, marker: 142, s: 0.8353, segment: 'corner' },
  { circuitId: 7, marker: 143, s: 0.8412, segment: 'chicane' },
  { circuitId: 7, marker: 144, s: 0.8471, segment: 'corner' },
  { circuitId: 7, marker: 145, s: 0.8529, segment: 'straight' },
  { circuitId: 7, marker: 146, s: 0.8588, segment: 'corner' },
  { circuitId: 7, marker: 147, s: 0.8647, segment: 'hairpin' },
  { circuitId: 7, marker: 148, s: 0.8706, segment: 'corner' },
  { circuitId: 7, marker: 149, s: 0.8765, segment: 'corner' },
  { circuitId: 7, marker: 150, s: 0.8824, segment: 'straight' },
  { circuitId: 7, marker: 151, s: 0.8882, segment: 'corner' },
  { circuitId: 7, marker: 152, s: 0.8941, segment: 'corner' },
  { circuitId: 7, marker: 153, s: 0.9000, segment: 'corner' },
  { circuitId: 7, marker: 154, s: 0.9059, segment: 'chicane' },
  { circuitId: 7, marker: 155, s: 0.9118, segment: 'straight' },
  { circuitId: 7, marker: 156, s: 0.9176, segment: 'corner' },
  { circuitId: 7, marker: 157, s: 0.9235, segment: 'corner' },
  { circuitId: 7, marker: 158, s: 0.9294, segment: 'corner' },
  { circuitId: 7, marker: 159, s: 0.9353, segment: 'corner' },
  { circuitId: 7, marker: 160, s: 0.9412, segment: 'straight' },
  { circuitId: 7, marker: 161, s: 0.9471, segment: 'hairpin' },
  { circuitId: 7, marker: 162, s: 0.9529, segment: 'corner' },
  { circuitId: 7, marker: 163, s: 0.9588, segment: 'corner' },
  { circuitId: 7, marker: 164, s: 0.9647, segment: 'corner' },
  { circuitId: 7, marker: 165, s: 0.9706, segment: 'chicane' },
  { circuitId: 7, marker: 166, s: 0.9765, segment: 'corner' },
  { circuitId: 7, marker: 167, s: 0.9824, segment: 'corner' },
  { circuitId: 7, marker: 168, s: 0.9882, segment: 'hairpin' },
  { circuitId: 7, marker: 169, s: 0.9941, segment: 'corner' },
  { circuitId: 8, marker: 0, s: 0.0000, segment: 'chicane' },
  { circuitId: 8, marker: 1, s: 0.0059, segment: 'corner' },
  { circuitId: 8, marker: 2, s: 0.0118, segment: 'corner' },
  { circuitId: 8, marker: 3, s: 0.0176, segment: 'corner' },
  { circuitId: 8, marker: 4, s: 0.0235, segment: 'corner' },
  { circuitId: 8, marker: 5, s: 0.0294, segment: 'straight' },
  { circuitId: 8, marker: 6, s: 0.0353, segment: 'corner' },
  { circuitId: 8, marker: 7, s: 0.0412, segment: 'hairpin' },
  { circuitId: 8, marker: 8, s: 0.0471, segment: 'corner' },
  { circuitId: 8, marker: 9, s: 0.0529, segment: 'corner' },
  { circuitId: 8, marker: 10, s: 0.0588, segment: 'straight' },
  { circuitId: 8, marker: 11, s: 0.0647, segment: 'chicane' },
  { circuitId: 8, marker: 12, s: 0.0706, segment: 'corner' },
  { circuitId: 8, marker: 13, s: 0.0765, segment: 'corner' },
  { circuitId: 8, marker: 14, s: 0.0824, segment: 'hairpin' },
  { circuitId: 8, marker: 15, s: 0.0882, segment: 'straight' },
  { circuitId: 8, marker: 16, s: 0.0941, segment: 'corner' },
  { circuitId: 8, marker: 17, s: 0.1000, segment: 'corner' },
  { circuitId: 8, marker: 18, s: 0.1059, segment: 'corner' },
  { circuitId: 8, marker: 19, s: 0.1118, segment: 'corner' },
  { circuitId: 8, marker: 20, s: 0.1176, segment: 'straight' },
  { circuitId: 8, marker: 21, s: 0.1235, segment: 'hairpin' },
  { circuitId: 8, marker: 22, s: 0.1294, segment: 'chicane' },
  { circuitId: 8, marker: 23, s: 0.1353, segment: 'corner' },
  { circuitId: 8, marker: 24, s: 0.1412, segment: 'corner' },
  { circuitId: 8, marker: 25, s: 0.1471, segment: 'straight' },
  { circuitId: 8, marker: 26, s: 0.1529, segment: 'corner' },
  { circuitId: 8, marker: 27, s: 0.1588, segment: 'corner' },
  { circuitId: 8, marker: 28, s: 0.1647, segment: 'hairpin' },
  { circuitId: 8, marker: 29, s: 0.1706, segment: 'corner' },
  { circuitId: 8, marker: 30, s: 0.1765, segment: 'straight' },
  { circuitId: 8, marker: 31, s: 0.1824, segment: 'corner' },
  { circuitId: 8, marker: 32, s: 0.1882, segment: 'corner' },
  { circuitId: 8, marker: 33, s: 0.1941, segment: 'chicane' },
  { circuitId: 8, marker: 34, s: 0.2000, segment: 'corner' },
  { circuitId: 8, marker: 35, s: 0.2059, segment: 'hairpin' },
  { circuitId: 8, marker: 36, s: 0.2118, segment: 'corner' },
  { circuitId: 8, marker: 37, s: 0.2176, segment: 'corner' },
  { circuitId: 8, marker: 38, s: 0.2235, segment: 'corner' },
  { circuitId: 8, marker: 39, s: 0.2294, segment: 'corner' },
  { circuitId: 8, marker: 40, s: 0.2353, segment: 'straight' },
  { circuitId: 8, marker: 41, s: 0.2412, segment: 'corner' },
  { circuitId: 8, marker: 42, s: 0.2471, segment: 'hairpin' },
  { circuitId: 8, marker: 43, s: 0.2529, segment: 'corner' },
  { circuitId: 8, marker: 44, s: 0.2588, segment: 'chicane' },
  { circuitId: 8, marker: 45, s: 0.2647, segment: 'straight' },
  { circuitId: 8, marker: 46, s: 0.2706, segment: 'corner' },
  { circuitId: 8, marker: 47, s: 0.2765, segment: 'corner' },
  { circuitId: 8, marker: 48, s: 0.2824, segment: 'corner' },
  { circuitId: 8, marker: 49, s: 0.2882, segment: 'hairpin' },
  { circuitId: 8, marker: 50, s: 0.2941, segment: 'straight' },
  { circuitId: 8, marker: 51, s: 0.3000, segment: 'corner' },
  { circuitId: 8, marker: 52, s: 0.3059, segment: 'corner' },
  { circuitId: 8, marker: 53, s: 0.3118, segment: 'corner' },
  { circuitId: 8, marker: 54, s: 0.3176, segment: 'corner' },
  { circuitId: 8, marker: 55, s: 0.3235, segment: 'chicane' },
  { circuitId: 8, marker: 56, s: 0.3294, segment: 'hairpin' },
  { circuitId: 8, marker: 57, s: 0.3353, segment: 'corner' },
  { circuitId: 8, marker: 58, s: 0.3412, segment: 'corner' },
  { circuitId: 8, marker: 59, s: 0.3471, segment: 'corner' },
  { circuitId: 8, marker: 60, s: 0.3529, segment: 'straight' },
  { circuitId: 8, marker: 61, s: 0.3588, segment: 'corner' },
  { circuitId: 8, marker: 62, s: 0.3647, segment: 'corner' },
  { circuitId: 8, marker: 63, s: 0.3706, segment: 'hairpin' },
  { circuitId: 8, marker: 64, s: 0.3765, segment: 'corner' },
  { circuitId: 8, marker: 65, s: 0.3824, segment: 'straight' },
  { circuitId: 8, marker: 66, s: 0.3882, segment: 'chicane' },
  { circuitId: 8, marker: 67, s: 0.3941, segment: 'corner' },
  { circuitId: 8, marker: 68, s: 0.4000, segment: 'corner' },
  { circuitId: 8, marker: 69, s: 0.4059, segment: 'corner' },
  { circuitId: 8, marker: 70, s: 0.4118, segment: 'hairpin' },
  { circuitId: 8, marker: 71, s: 0.4176, segment: 'corner' },
  { circuitId: 8, marker: 72, s: 0.4235, segment: 'corner' },
  { circuitId: 8, marker: 73, s: 0.4294, segment: 'corner' },
  { circuitId: 8, marker: 74, s: 0.4353, segment: 'corner' },
  { circuitId: 8, marker: 75, s: 0.4412, segment: 'straight' },
  { circuitId: 8, marker: 76, s: 0.4471, segment: 'corner' },
  { circuitId: 8, marker: 77, s: 0.4529, segment: 'chicane' },
  { circuitId: 8, marker: 78, s: 0.4588, segment: 'corner' },
  { circuitId: 8, marker: 79, s: 0.4647, segment: 'corner' },
  { circuitId: 8, marker: 80, s: 0.4706, segment: 'straight' },
  { circuitId: 8, marker: 81, s: 0.4765, segment: 'corner' },
  { circuitId: 8, marker: 82, s: 0.4824, segment: 'corner' },
  { circuitId: 8, marker: 83, s: 0.4882, segment: 'corner' },
  { circuitId: 8, marker: 84, s: 0.4941, segment: 'hairpin' },
  { circuitId: 8, marker: 85, s: 0.5000, segment: 'straight' },
  { circuitId: 8, marker: 86, s: 0.5059, segment: 'corner' },
  { circuitId: 8, marker: 87, s: 0.5118, segment: 'corner' },
  { circuitId: 8, marker: 88, s: 0.5176, segment: 'chicane' },
  { circuitId: 8, marker: 89, s: 0.5235, segment: 'corner' },
  { circuitId: 8, marker: 90, s: 0.5294, segment: 'straight' },
  { circuitId: 8, marker: 91, s: 0.5353, segment: 'hairpin' },
  { circuitId: 8, marker: 92, s: 0.5412, segment: 'corner' },
  { circuitId: 8, marker: 93, s: 0.5471, segment: 'corner' },
  { circuitId: 8, marker: 94, s: 0.5529, segment: 'corner' },
  { circuitId: 8, marker: 95, s: 0.5588, segment: 'straight' },
  { circuitId: 8, marker: 96, s: 0.5647, segment: 'corner' },
  { circuitId: 8, marker: 97, s: 0.5706, segment: 'corner' },
  { circuitId: 8, marker: 98, s: 0.5765, segment: 'hairpin' },
  { circuitId: 8, marker: 99, s: 0.5824, segment: 'chicane' },
  { circuitId: 8, marker: 100, s: 0.5882, segment: 'straight' },
  { circuitId: 8, marker: 101, s: 0.5941, segment: 'corner' },
  { circuitId: 8, marker: 102, s: 0.6000, segment: 'corner' },
  { circuitId: 8, marker: 103, s: 0.6059, segment: 'corner' },
  { circuitId: 8, marker: 104, s: 0.6118, segment: 'corner' },
  { circuitId: 8, marker: 105, s: 0.6176, segment: 'hairpin' },
  { circuitId: 8, marker: 106, s: 0.6235, segment: 'corner' },
  { circuitId: 8, marker: 107, s: 0.6294, segment: 'corner' },
  { circuitId: 8, marker: 108, s: 0.6353, segment: 'corner' },
  { circuitId: 8, marker: 109, s: 0.6412, segment: 'corner' },
  { circuitId: 8, marker: 110, s: 0.6471, segment: 'chicane' },
  { circuitId: 8, marker: 111, s: 0.6529, segment: 'corner' },
  { circuitId: 8, marker: 112, s: 0.6588, segment: 'hairpin' },
  { circuitId: 8, marker: 113, s: 0.6647, segment: 'corner' },
  { circuitId: 8, marker: 114, s: 0.6706, segment: 'corner' },
  { circuitId: 8, marker: 115, s: 0.6765, segment: 'straight' },
  { circuitId: 8, marker: 116, s: 0.6824, segment: 'corner' },
  { circuitId: 8, marker: 117, s: 0.6882, segment: 'corner' },
  { circuitId: 8, marker: 118, s: 0.6941, segment: 'corner' },
  { circuitId: 8, marker: 119, s: 0.7000, segment: 'hairpin' },
  { circuitId: 8, marker: 120, s: 0.7059, segment: 'straight' },
  { circuitId: 8, marker: 121, s: 0.7118, segment: 'chicane' },
  { circuitId: 8, marker: 122, s: 0.7176, segment: 'corner' },
  { circuitId: 8, marker: 123, s: 0.7235, segment: 'corner' },
  { circuitId: 8, marker: 124, s: 0.7294, segment: 'corner' },
  { circuitId: 8, marker: 125, s: 0.7353, segment: 'straight' },
  { circuitId: 8, marker: 126, s: 0.7412, segment: 'hairpin' },
  { circuitId: 8, marker: 127, s: 0.7471, segment: 'corner' },
  { circuitId: 8, marker: 128, s: 0.7529, segment: 'corner' },
  { circuitId: 8, marker: 129, s: 0.7588, segment: 'corner' },
  { circuitId: 8, marker: 130, s: 0.7647, segment: 'straight' },
  { circuitId: 8, marker: 131, s: 0.7706, segment: 'corner' },
  { circuitId: 8, marker: 132, s: 0.7765, segment: 'chicane' },
  { circuitId: 8, marker: 133, s: 0.7824, segment: 'hairpin' },
  { circuitId: 8, marker: 134, s: 0.7882, segment: 'corner' },
  { circuitId: 8, marker: 135, s: 0.7941, segment: 'straight' },
  { circuitId: 8, marker: 136, s: 0.8000, segment: 'corner' },
  { circuitId: 8, marker: 137, s: 0.8059, segment: 'corner' },
  { circuitId: 8, marker: 138, s: 0.8118, segment: 'corner' },
  { circuitId: 8, marker: 139, s: 0.8176, segment: 'corner' },
  { circuitId: 8, marker: 140, s: 0.8235, segment: 'hairpin' },
  { circuitId: 8, marker: 141, s: 0.8294, segment: 'corner' },
  { circuitId: 8, marker: 142, s: 0.8353, segment: 'corner' },
  { circuitId: 8, marker: 143, s: 0.8412, segment: 'chicane' },
  { circuitId: 8, marker: 144, s: 0.8471, segment: 'corner' },
  { circuitId: 8, marker: 145, s: 0.8529, segment: 'straight' },
  { circuitId: 8, marker: 146, s: 0.8588, segment: 'corner' },
  { circuitId: 8, marker: 147, s: 0.8647, segment: 'hairpin' },
  { circuitId: 8, marker: 148, s: 0.8706, segment: 'corner' },
  { circuitId: 8, marker: 149, s: 0.8765, segment: 'corner' },
  { circuitId: 8, marker: 150, s: 0.8824, segment: 'straight' },
  { circuitId: 8, marker: 151, s: 0.8882, segment: 'corner' },
  { circuitId: 8, marker: 152, s: 0.8941, segment: 'corner' },
  { circuitId: 8, marker: 153, s: 0.9000, segment: 'corner' },
  { circuitId: 8, marker: 154, s: 0.9059, segment: 'chicane' },
  { circuitId: 8, marker: 155, s: 0.9118, segment: 'straight' },
  { circuitId: 8, marker: 156, s: 0.9176, segment: 'corner' },
  { circuitId: 8, marker: 157, s: 0.9235, segment: 'corner' },
  { circuitId: 8, marker: 158, s: 0.9294, segment: 'corner' },
  { circuitId: 8, marker: 159, s: 0.9353, segment: 'corner' },
  { circuitId: 8, marker: 160, s: 0.9412, segment: 'straight' },
  { circuitId: 8, marker: 161, s: 0.9471, segment: 'hairpin' },
  { circuitId: 8, marker: 162, s: 0.9529, segment: 'corner' },
  { circuitId: 8, marker: 163, s: 0.9588, segment: 'corner' },
  { circuitId: 8, marker: 164, s: 0.9647, segment: 'corner' },
  { circuitId: 8, marker: 165, s: 0.9706, segment: 'chicane' },
  { circuitId: 8, marker: 166, s: 0.9765, segment: 'corner' },
  { circuitId: 8, marker: 167, s: 0.9824, segment: 'corner' },
  { circuitId: 8, marker: 168, s: 0.9882, segment: 'hairpin' },
  { circuitId: 8, marker: 169, s: 0.9941, segment: 'corner' },
  { circuitId: 9, marker: 0, s: 0.0000, segment: 'chicane' },
  { circuitId: 9, marker: 1, s: 0.0059, segment: 'corner' },
  { circuitId: 9, marker: 2, s: 0.0118, segment: 'corner' },
  { circuitId: 9, marker: 3, s: 0.0176, segment: 'corner' },
  { circuitId: 9, marker: 4, s: 0.0235, segment: 'corner' },
  { circuitId: 9, marker: 5, s: 0.0294, segment: 'straight' },
  { circuitId: 9, marker: 6, s: 0.0353, segment: 'corner' },
  { circuitId: 9, marker: 7, s: 0.0412, segment: 'hairpin' },
  { circuitId: 9, marker: 8, s: 0.0471, segment: 'corner' },
  { circuitId: 9, marker: 9, s: 0.0529, segment: 'corner' },
  { circuitId: 9, marker: 10, s: 0.0588, segment: 'straight' },
  { circuitId: 9, marker: 11, s: 0.0647, segment: 'chicane' },
  { circuitId: 9, marker: 12, s: 0.0706, segment: 'corner' },
  { circuitId: 9, marker: 13, s: 0.0765, segment: 'corner' },
  { circuitId: 9, marker: 14, s: 0.0824, segment: 'hairpin' },
  { circuitId: 9, marker: 15, s: 0.0882, segment: 'straight' },
  { circuitId: 9, marker: 16, s: 0.0941, segment: 'corner' },
  { circuitId: 9, marker: 17, s: 0.1000, segment: 'corner' },
  { circuitId: 9, marker: 18, s: 0.1059, segment: 'corner' },
  { circuitId: 9, marker: 19, s: 0.1118, segment: 'corner' },
  { circuitId: 9, marker: 20, s: 0.1176, segment: 'straight' },
  { circuitId: 9, marker: 21, s: 0.1235, segment: 'hairpin' },
  { circuitId: 9, marker: 22, s: 0.1294, segment: 'chicane' },
  { circuitId: 9, marker: 23, s: 0.1353, segment: 'corner' },
  { circuitId: 9, marker: 24, s: 0.1412, segment: 'corner' },
  { circuitId: 9, marker: 25, s: 0.1471, segment: 'straight' },
  { circuitId: 9, marker: 26, s: 0.1529, segment: 'corner' },
  { circuitId: 9, marker: 27, s: 0.1588, segment: 'corner' },
  { circuitId: 9, marker: 28, s: 0.1647, segment: 'hairpin' },
  { circuitId: 9, marker: 29, s: 0.1706, segment: 'corner' },
  { circuitId: 9, marker: 30, s: 0.1765, segment: 'straight' },
  { circuitId: 9, marker: 31, s: 0.1824, segment: 'corner' },
  { circuitId: 9, marker: 32, s: 0.1882, segment: 'corner' },
  { circuitId: 9, marker: 33, s: 0.1941, segment: 'chicane' },
  { circuitId: 9, marker: 34, s: 0.2000, segment: 'corner' },
  { circuitId: 9, marker: 35, s: 0.2059, segment: 'hairpin' },
  { circuitId: 9, marker: 36, s: 0.2118, segment: 'corner' },
  { circuitId: 9, marker: 37, s: 0.2176, segment: 'corner' },
  { circuitId: 9, marker: 38, s: 0.2235, segment: 'corner' },
  { circuitId: 9, marker: 39, s: 0.2294, segment: 'corner' },
  { circuitId: 9, marker: 40, s: 0.2353, segment: 'straight' },
  { circuitId: 9, marker: 41, s: 0.2412, segment: 'corner' },
  { circuitId: 9, marker: 42, s: 0.2471, segment: 'hairpin' },
  { circuitId: 9, marker: 43, s: 0.2529, segment: 'corner' },
  { circuitId: 9, marker: 44, s: 0.2588, segment: 'chicane' },
  { circuitId: 9, marker: 45, s: 0.2647, segment: 'straight' },
  { circuitId: 9, marker: 46, s: 0.2706, segment: 'corner' },
  { circuitId: 9, marker: 47, s: 0.2765, segment: 'corner' },
  { circuitId: 9, marker: 48, s: 0.2824, segment: 'corner' },
  { circuitId: 9, marker: 49, s: 0.2882, segment: 'hairpin' },
  { circuitId: 9, marker: 50, s: 0.2941, segment: 'straight' },
  { circuitId: 9, marker: 51, s: 0.3000, segment: 'corner' },
  { circuitId: 9, marker: 52, s: 0.3059, segment: 'corner' },
  { circuitId: 9, marker: 53, s: 0.3118, segment: 'corner' },
  { circuitId: 9, marker: 54, s: 0.3176, segment: 'corner' },
  { circuitId: 9, marker: 55, s: 0.3235, segment: 'chicane' },
  { circuitId: 9, marker: 56, s: 0.3294, segment: 'hairpin' },
  { circuitId: 9, marker: 57, s: 0.3353, segment: 'corner' },
  { circuitId: 9, marker: 58, s: 0.3412, segment: 'corner' },
  { circuitId: 9, marker: 59, s: 0.3471, segment: 'corner' },
  { circuitId: 9, marker: 60, s: 0.3529, segment: 'straight' },
  { circuitId: 9, marker: 61, s: 0.3588, segment: 'corner' },
  { circuitId: 9, marker: 62, s: 0.3647, segment: 'corner' },
  { circuitId: 9, marker: 63, s: 0.3706, segment: 'hairpin' },
  { circuitId: 9, marker: 64, s: 0.3765, segment: 'corner' },
  { circuitId: 9, marker: 65, s: 0.3824, segment: 'straight' },
  { circuitId: 9, marker: 66, s: 0.3882, segment: 'chicane' },
  { circuitId: 9, marker: 67, s: 0.3941, segment: 'corner' },
  { circuitId: 9, marker: 68, s: 0.4000, segment: 'corner' },
  { circuitId: 9, marker: 69, s: 0.4059, segment: 'corner' },
  { circuitId: 9, marker: 70, s: 0.4118, segment: 'hairpin' },
  { circuitId: 9, marker: 71, s: 0.4176, segment: 'corner' },
  { circuitId: 9, marker: 72, s: 0.4235, segment: 'corner' },
  { circuitId: 9, marker: 73, s: 0.4294, segment: 'corner' },
  { circuitId: 9, marker: 74, s: 0.4353, segment: 'corner' },
  { circuitId: 9, marker: 75, s: 0.4412, segment: 'straight' },
  { circuitId: 9, marker: 76, s: 0.4471, segment: 'corner' },
  { circuitId: 9, marker: 77, s: 0.4529, segment: 'chicane' },
  { circuitId: 9, marker: 78, s: 0.4588, segment: 'corner' },
  { circuitId: 9, marker: 79, s: 0.4647, segment: 'corner' },
  { circuitId: 9, marker: 80, s: 0.4706, segment: 'straight' },
  { circuitId: 9, marker: 81, s: 0.4765, segment: 'corner' },
  { circuitId: 9, marker: 82, s: 0.4824, segment: 'corner' },
  { circuitId: 9, marker: 83, s: 0.4882, segment: 'corner' },
  { circuitId: 9, marker: 84, s: 0.4941, segment: 'hairpin' },
  { circuitId: 9, marker: 85, s: 0.5000, segment: 'straight' },
  { circuitId: 9, marker: 86, s: 0.5059, segment: 'corner' },
  { circuitId: 9, marker: 87, s: 0.5118, segment: 'corner' },
  { circuitId: 9, marker: 88, s: 0.5176, segment: 'chicane' },
  { circuitId: 9, marker: 89, s: 0.5235, segment: 'corner' },
  { circuitId: 9, marker: 90, s: 0.5294, segment: 'straight' },
  { circuitId: 9, marker: 91, s: 0.5353, segment: 'hairpin' },
  { circuitId: 9, marker: 92, s: 0.5412, segment: 'corner' },
  { circuitId: 9, marker: 93, s: 0.5471, segment: 'corner' },
  { circuitId: 9, marker: 94, s: 0.5529, segment: 'corner' },
  { circuitId: 9, marker: 95, s: 0.5588, segment: 'straight' },
  { circuitId: 9, marker: 96, s: 0.5647, segment: 'corner' },
  { circuitId: 9, marker: 97, s: 0.5706, segment: 'corner' },
  { circuitId: 9, marker: 98, s: 0.5765, segment: 'hairpin' },
  { circuitId: 9, marker: 99, s: 0.5824, segment: 'chicane' },
  { circuitId: 9, marker: 100, s: 0.5882, segment: 'straight' },
  { circuitId: 9, marker: 101, s: 0.5941, segment: 'corner' },
  { circuitId: 9, marker: 102, s: 0.6000, segment: 'corner' },
  { circuitId: 9, marker: 103, s: 0.6059, segment: 'corner' },
  { circuitId: 9, marker: 104, s: 0.6118, segment: 'corner' },
  { circuitId: 9, marker: 105, s: 0.6176, segment: 'hairpin' },
  { circuitId: 9, marker: 106, s: 0.6235, segment: 'corner' },
  { circuitId: 9, marker: 107, s: 0.6294, segment: 'corner' },
  { circuitId: 9, marker: 108, s: 0.6353, segment: 'corner' },
  { circuitId: 9, marker: 109, s: 0.6412, segment: 'corner' },
  { circuitId: 9, marker: 110, s: 0.6471, segment: 'chicane' },
  { circuitId: 9, marker: 111, s: 0.6529, segment: 'corner' },
  { circuitId: 9, marker: 112, s: 0.6588, segment: 'hairpin' },
  { circuitId: 9, marker: 113, s: 0.6647, segment: 'corner' },
  { circuitId: 9, marker: 114, s: 0.6706, segment: 'corner' },
  { circuitId: 9, marker: 115, s: 0.6765, segment: 'straight' },
  { circuitId: 9, marker: 116, s: 0.6824, segment: 'corner' },
  { circuitId: 9, marker: 117, s: 0.6882, segment: 'corner' },
  { circuitId: 9, marker: 118, s: 0.6941, segment: 'corner' },
  { circuitId: 9, marker: 119, s: 0.7000, segment: 'hairpin' },
  { circuitId: 9, marker: 120, s: 0.7059, segment: 'straight' },
  { circuitId: 9, marker: 121, s: 0.7118, segment: 'chicane' },
  { circuitId: 9, marker: 122, s: 0.7176, segment: 'corner' },
  { circuitId: 9, marker: 123, s: 0.7235, segment: 'corner' },
  { circuitId: 9, marker: 124, s: 0.7294, segment: 'corner' },
  { circuitId: 9, marker: 125, s: 0.7353, segment: 'straight' },
  { circuitId: 9, marker: 126, s: 0.7412, segment: 'hairpin' },
  { circuitId: 9, marker: 127, s: 0.7471, segment: 'corner' },
  { circuitId: 9, marker: 128, s: 0.7529, segment: 'corner' },
  { circuitId: 9, marker: 129, s: 0.7588, segment: 'corner' },
  { circuitId: 9, marker: 130, s: 0.7647, segment: 'straight' },
  { circuitId: 9, marker: 131, s: 0.7706, segment: 'corner' },
  { circuitId: 9, marker: 132, s: 0.7765, segment: 'chicane' },
  { circuitId: 9, marker: 133, s: 0.7824, segment: 'hairpin' },
  { circuitId: 9, marker: 134, s: 0.7882, segment: 'corner' },
  { circuitId: 9, marker: 135, s: 0.7941, segment: 'straight' },
  { circuitId: 9, marker: 136, s: 0.8000, segment: 'corner' },
  { circuitId: 9, marker: 137, s: 0.8059, segment: 'corner' },
  { circuitId: 9, marker: 138, s: 0.8118, segment: 'corner' },
  { circuitId: 9, marker: 139, s: 0.8176, segment: 'corner' },
  { circuitId: 9, marker: 140, s: 0.8235, segment: 'hairpin' },
  { circuitId: 9, marker: 141, s: 0.8294, segment: 'corner' },
  { circuitId: 9, marker: 142, s: 0.8353, segment: 'corner' },
  { circuitId: 9, marker: 143, s: 0.8412, segment: 'chicane' },
  { circuitId: 9, marker: 144, s: 0.8471, segment: 'corner' },
  { circuitId: 9, marker: 145, s: 0.8529, segment: 'straight' },
  { circuitId: 9, marker: 146, s: 0.8588, segment: 'corner' },
  { circuitId: 9, marker: 147, s: 0.8647, segment: 'hairpin' },
  { circuitId: 9, marker: 148, s: 0.8706, segment: 'corner' },
  { circuitId: 9, marker: 149, s: 0.8765, segment: 'corner' },
  { circuitId: 9, marker: 150, s: 0.8824, segment: 'straight' },
  { circuitId: 9, marker: 151, s: 0.8882, segment: 'corner' },
  { circuitId: 9, marker: 152, s: 0.8941, segment: 'corner' },
  { circuitId: 9, marker: 153, s: 0.9000, segment: 'corner' },
  { circuitId: 9, marker: 154, s: 0.9059, segment: 'chicane' },
  { circuitId: 9, marker: 155, s: 0.9118, segment: 'straight' },
  { circuitId: 9, marker: 156, s: 0.9176, segment: 'corner' },
  { circuitId: 9, marker: 157, s: 0.9235, segment: 'corner' },
  { circuitId: 9, marker: 158, s: 0.9294, segment: 'corner' },
  { circuitId: 9, marker: 159, s: 0.9353, segment: 'corner' },
  { circuitId: 9, marker: 160, s: 0.9412, segment: 'straight' },
  { circuitId: 9, marker: 161, s: 0.9471, segment: 'hairpin' },
  { circuitId: 9, marker: 162, s: 0.9529, segment: 'corner' },
  { circuitId: 9, marker: 163, s: 0.9588, segment: 'corner' },
  { circuitId: 9, marker: 164, s: 0.9647, segment: 'corner' },
  { circuitId: 9, marker: 165, s: 0.9706, segment: 'chicane' },
  { circuitId: 9, marker: 166, s: 0.9765, segment: 'corner' },
  { circuitId: 9, marker: 167, s: 0.9824, segment: 'corner' },
  { circuitId: 9, marker: 168, s: 0.9882, segment: 'hairpin' },
  { circuitId: 9, marker: 169, s: 0.9941, segment: 'corner' },
  { circuitId: 10, marker: 0, s: 0.0000, segment: 'chicane' },
  { circuitId: 10, marker: 1, s: 0.0059, segment: 'corner' },
  { circuitId: 10, marker: 2, s: 0.0118, segment: 'corner' },
  { circuitId: 10, marker: 3, s: 0.0176, segment: 'corner' },
  { circuitId: 10, marker: 4, s: 0.0235, segment: 'corner' },
  { circuitId: 10, marker: 5, s: 0.0294, segment: 'straight' },
  { circuitId: 10, marker: 6, s: 0.0353, segment: 'corner' },
  { circuitId: 10, marker: 7, s: 0.0412, segment: 'hairpin' },
  { circuitId: 10, marker: 8, s: 0.0471, segment: 'corner' },
  { circuitId: 10, marker: 9, s: 0.0529, segment: 'corner' },
  { circuitId: 10, marker: 10, s: 0.0588, segment: 'straight' },
  { circuitId: 10, marker: 11, s: 0.0647, segment: 'chicane' },
  { circuitId: 10, marker: 12, s: 0.0706, segment: 'corner' },
  { circuitId: 10, marker: 13, s: 0.0765, segment: 'corner' },
  { circuitId: 10, marker: 14, s: 0.0824, segment: 'hairpin' },
  { circuitId: 10, marker: 15, s: 0.0882, segment: 'straight' },
  { circuitId: 10, marker: 16, s: 0.0941, segment: 'corner' },
  { circuitId: 10, marker: 17, s: 0.1000, segment: 'corner' },
  { circuitId: 10, marker: 18, s: 0.1059, segment: 'corner' },
  { circuitId: 10, marker: 19, s: 0.1118, segment: 'corner' },
  { circuitId: 10, marker: 20, s: 0.1176, segment: 'straight' },
  { circuitId: 10, marker: 21, s: 0.1235, segment: 'hairpin' },
  { circuitId: 10, marker: 22, s: 0.1294, segment: 'chicane' },
  { circuitId: 10, marker: 23, s: 0.1353, segment: 'corner' },
  { circuitId: 10, marker: 24, s: 0.1412, segment: 'corner' },
  { circuitId: 10, marker: 25, s: 0.1471, segment: 'straight' },
  { circuitId: 10, marker: 26, s: 0.1529, segment: 'corner' },
  { circuitId: 10, marker: 27, s: 0.1588, segment: 'corner' },
  { circuitId: 10, marker: 28, s: 0.1647, segment: 'hairpin' },
  { circuitId: 10, marker: 29, s: 0.1706, segment: 'corner' },
  { circuitId: 10, marker: 30, s: 0.1765, segment: 'straight' },
  { circuitId: 10, marker: 31, s: 0.1824, segment: 'corner' },
  { circuitId: 10, marker: 32, s: 0.1882, segment: 'corner' },
  { circuitId: 10, marker: 33, s: 0.1941, segment: 'chicane' },
  { circuitId: 10, marker: 34, s: 0.2000, segment: 'corner' },
  { circuitId: 10, marker: 35, s: 0.2059, segment: 'hairpin' },
  { circuitId: 10, marker: 36, s: 0.2118, segment: 'corner' },
  { circuitId: 10, marker: 37, s: 0.2176, segment: 'corner' },
  { circuitId: 10, marker: 38, s: 0.2235, segment: 'corner' },
  { circuitId: 10, marker: 39, s: 0.2294, segment: 'corner' },
  { circuitId: 10, marker: 40, s: 0.2353, segment: 'straight' },
  { circuitId: 10, marker: 41, s: 0.2412, segment: 'corner' },
  { circuitId: 10, marker: 42, s: 0.2471, segment: 'hairpin' },
  { circuitId: 10, marker: 43, s: 0.2529, segment: 'corner' },
  { circuitId: 10, marker: 44, s: 0.2588, segment: 'chicane' },
  { circuitId: 10, marker: 45, s: 0.2647, segment: 'straight' },
  { circuitId: 10, marker: 46, s: 0.2706, segment: 'corner' },
  { circuitId: 10, marker: 47, s: 0.2765, segment: 'corner' },
  { circuitId: 10, marker: 48, s: 0.2824, segment: 'corner' },
  { circuitId: 10, marker: 49, s: 0.2882, segment: 'hairpin' },
  { circuitId: 10, marker: 50, s: 0.2941, segment: 'straight' },
  { circuitId: 10, marker: 51, s: 0.3000, segment: 'corner' },
  { circuitId: 10, marker: 52, s: 0.3059, segment: 'corner' },
  { circuitId: 10, marker: 53, s: 0.3118, segment: 'corner' },
  { circuitId: 10, marker: 54, s: 0.3176, segment: 'corner' },
  { circuitId: 10, marker: 55, s: 0.3235, segment: 'chicane' },
  { circuitId: 10, marker: 56, s: 0.3294, segment: 'hairpin' },
  { circuitId: 10, marker: 57, s: 0.3353, segment: 'corner' },
  { circuitId: 10, marker: 58, s: 0.3412, segment: 'corner' },
  { circuitId: 10, marker: 59, s: 0.3471, segment: 'corner' },
  { circuitId: 10, marker: 60, s: 0.3529, segment: 'straight' },
  { circuitId: 10, marker: 61, s: 0.3588, segment: 'corner' },
  { circuitId: 10, marker: 62, s: 0.3647, segment: 'corner' },
  { circuitId: 10, marker: 63, s: 0.3706, segment: 'hairpin' },
  { circuitId: 10, marker: 64, s: 0.3765, segment: 'corner' },
  { circuitId: 10, marker: 65, s: 0.3824, segment: 'straight' },
  { circuitId: 10, marker: 66, s: 0.3882, segment: 'chicane' },
  { circuitId: 10, marker: 67, s: 0.3941, segment: 'corner' },
  { circuitId: 10, marker: 68, s: 0.4000, segment: 'corner' },
  { circuitId: 10, marker: 69, s: 0.4059, segment: 'corner' },
  { circuitId: 10, marker: 70, s: 0.4118, segment: 'hairpin' },
  { circuitId: 10, marker: 71, s: 0.4176, segment: 'corner' },
  { circuitId: 10, marker: 72, s: 0.4235, segment: 'corner' },
  { circuitId: 10, marker: 73, s: 0.4294, segment: 'corner' },
  { circuitId: 10, marker: 74, s: 0.4353, segment: 'corner' },
  { circuitId: 10, marker: 75, s: 0.4412, segment: 'straight' },
  { circuitId: 10, marker: 76, s: 0.4471, segment: 'corner' },
  { circuitId: 10, marker: 77, s: 0.4529, segment: 'chicane' },
  { circuitId: 10, marker: 78, s: 0.4588, segment: 'corner' },
  { circuitId: 10, marker: 79, s: 0.4647, segment: 'corner' },
  { circuitId: 10, marker: 80, s: 0.4706, segment: 'straight' },
  { circuitId: 10, marker: 81, s: 0.4765, segment: 'corner' },
  { circuitId: 10, marker: 82, s: 0.4824, segment: 'corner' },
  { circuitId: 10, marker: 83, s: 0.4882, segment: 'corner' },
  { circuitId: 10, marker: 84, s: 0.4941, segment: 'hairpin' },
  { circuitId: 10, marker: 85, s: 0.5000, segment: 'straight' },
  { circuitId: 10, marker: 86, s: 0.5059, segment: 'corner' },
  { circuitId: 10, marker: 87, s: 0.5118, segment: 'corner' },
  { circuitId: 10, marker: 88, s: 0.5176, segment: 'chicane' },
  { circuitId: 10, marker: 89, s: 0.5235, segment: 'corner' },
  { circuitId: 10, marker: 90, s: 0.5294, segment: 'straight' },
  { circuitId: 10, marker: 91, s: 0.5353, segment: 'hairpin' },
  { circuitId: 10, marker: 92, s: 0.5412, segment: 'corner' },
  { circuitId: 10, marker: 93, s: 0.5471, segment: 'corner' },
  { circuitId: 10, marker: 94, s: 0.5529, segment: 'corner' },
  { circuitId: 10, marker: 95, s: 0.5588, segment: 'straight' },
  { circuitId: 10, marker: 96, s: 0.5647, segment: 'corner' },
  { circuitId: 10, marker: 97, s: 0.5706, segment: 'corner' },
  { circuitId: 10, marker: 98, s: 0.5765, segment: 'hairpin' },
  { circuitId: 10, marker: 99, s: 0.5824, segment: 'chicane' },
  { circuitId: 10, marker: 100, s: 0.5882, segment: 'straight' },
  { circuitId: 10, marker: 101, s: 0.5941, segment: 'corner' },
  { circuitId: 10, marker: 102, s: 0.6000, segment: 'corner' },
  { circuitId: 10, marker: 103, s: 0.6059, segment: 'corner' },
  { circuitId: 10, marker: 104, s: 0.6118, segment: 'corner' },
  { circuitId: 10, marker: 105, s: 0.6176, segment: 'hairpin' },
  { circuitId: 10, marker: 106, s: 0.6235, segment: 'corner' },
  { circuitId: 10, marker: 107, s: 0.6294, segment: 'corner' },
  { circuitId: 10, marker: 108, s: 0.6353, segment: 'corner' },
  { circuitId: 10, marker: 109, s: 0.6412, segment: 'corner' },
  { circuitId: 10, marker: 110, s: 0.6471, segment: 'chicane' },
  { circuitId: 10, marker: 111, s: 0.6529, segment: 'corner' },
  { circuitId: 10, marker: 112, s: 0.6588, segment: 'hairpin' },
  { circuitId: 10, marker: 113, s: 0.6647, segment: 'corner' },
  { circuitId: 10, marker: 114, s: 0.6706, segment: 'corner' },
  { circuitId: 10, marker: 115, s: 0.6765, segment: 'straight' },
  { circuitId: 10, marker: 116, s: 0.6824, segment: 'corner' },
  { circuitId: 10, marker: 117, s: 0.6882, segment: 'corner' },
  { circuitId: 10, marker: 118, s: 0.6941, segment: 'corner' },
  { circuitId: 10, marker: 119, s: 0.7000, segment: 'hairpin' },
  { circuitId: 10, marker: 120, s: 0.7059, segment: 'straight' },
  { circuitId: 10, marker: 121, s: 0.7118, segment: 'chicane' },
  { circuitId: 10, marker: 122, s: 0.7176, segment: 'corner' },
  { circuitId: 10, marker: 123, s: 0.7235, segment: 'corner' },
  { circuitId: 10, marker: 124, s: 0.7294, segment: 'corner' },
  { circuitId: 10, marker: 125, s: 0.7353, segment: 'straight' },
  { circuitId: 10, marker: 126, s: 0.7412, segment: 'hairpin' },
  { circuitId: 10, marker: 127, s: 0.7471, segment: 'corner' },
  { circuitId: 10, marker: 128, s: 0.7529, segment: 'corner' },
  { circuitId: 10, marker: 129, s: 0.7588, segment: 'corner' },
  { circuitId: 10, marker: 130, s: 0.7647, segment: 'straight' },
  { circuitId: 10, marker: 131, s: 0.7706, segment: 'corner' },
  { circuitId: 10, marker: 132, s: 0.7765, segment: 'chicane' },
  { circuitId: 10, marker: 133, s: 0.7824, segment: 'hairpin' },
  { circuitId: 10, marker: 134, s: 0.7882, segment: 'corner' },
  { circuitId: 10, marker: 135, s: 0.7941, segment: 'straight' },
  { circuitId: 10, marker: 136, s: 0.8000, segment: 'corner' },
  { circuitId: 10, marker: 137, s: 0.8059, segment: 'corner' },
  { circuitId: 10, marker: 138, s: 0.8118, segment: 'corner' },
  { circuitId: 10, marker: 139, s: 0.8176, segment: 'corner' },
  { circuitId: 10, marker: 140, s: 0.8235, segment: 'hairpin' },
  { circuitId: 10, marker: 141, s: 0.8294, segment: 'corner' },
  { circuitId: 10, marker: 142, s: 0.8353, segment: 'corner' },
  { circuitId: 10, marker: 143, s: 0.8412, segment: 'chicane' },
  { circuitId: 10, marker: 144, s: 0.8471, segment: 'corner' },
  { circuitId: 10, marker: 145, s: 0.8529, segment: 'straight' },
  { circuitId: 10, marker: 146, s: 0.8588, segment: 'corner' },
  { circuitId: 10, marker: 147, s: 0.8647, segment: 'hairpin' },
  { circuitId: 10, marker: 148, s: 0.8706, segment: 'corner' },
  { circuitId: 10, marker: 149, s: 0.8765, segment: 'corner' },
  { circuitId: 10, marker: 150, s: 0.8824, segment: 'straight' },
  { circuitId: 10, marker: 151, s: 0.8882, segment: 'corner' },
  { circuitId: 10, marker: 152, s: 0.8941, segment: 'corner' },
  { circuitId: 10, marker: 153, s: 0.9000, segment: 'corner' },
  { circuitId: 10, marker: 154, s: 0.9059, segment: 'chicane' },
  { circuitId: 10, marker: 155, s: 0.9118, segment: 'straight' },
  { circuitId: 10, marker: 156, s: 0.9176, segment: 'corner' },
  { circuitId: 10, marker: 157, s: 0.9235, segment: 'corner' },
  { circuitId: 10, marker: 158, s: 0.9294, segment: 'corner' },
  { circuitId: 10, marker: 159, s: 0.9353, segment: 'corner' },
  { circuitId: 10, marker: 160, s: 0.9412, segment: 'straight' },
  { circuitId: 10, marker: 161, s: 0.9471, segment: 'hairpin' },
  { circuitId: 10, marker: 162, s: 0.9529, segment: 'corner' },
  { circuitId: 10, marker: 163, s: 0.9588, segment: 'corner' },
  { circuitId: 10, marker: 164, s: 0.9647, segment: 'corner' },
  { circuitId: 10, marker: 165, s: 0.9706, segment: 'chicane' },
  { circuitId: 10, marker: 166, s: 0.9765, segment: 'corner' },
  { circuitId: 10, marker: 167, s: 0.9824, segment: 'corner' },
  { circuitId: 10, marker: 168, s: 0.9882, segment: 'hairpin' },
  { circuitId: 10, marker: 169, s: 0.9941, segment: 'corner' },
  { circuitId: 11, marker: 0, s: 0.0000, segment: 'chicane' },
  { circuitId: 11, marker: 1, s: 0.0059, segment: 'corner' },
  { circuitId: 11, marker: 2, s: 0.0118, segment: 'corner' },
  { circuitId: 11, marker: 3, s: 0.0176, segment: 'corner' },
  { circuitId: 11, marker: 4, s: 0.0235, segment: 'corner' },
  { circuitId: 11, marker: 5, s: 0.0294, segment: 'straight' },
  { circuitId: 11, marker: 6, s: 0.0353, segment: 'corner' },
  { circuitId: 11, marker: 7, s: 0.0412, segment: 'hairpin' },
  { circuitId: 11, marker: 8, s: 0.0471, segment: 'corner' },
  { circuitId: 11, marker: 9, s: 0.0529, segment: 'corner' },
  { circuitId: 11, marker: 10, s: 0.0588, segment: 'straight' },
  { circuitId: 11, marker: 11, s: 0.0647, segment: 'chicane' },
  { circuitId: 11, marker: 12, s: 0.0706, segment: 'corner' },
  { circuitId: 11, marker: 13, s: 0.0765, segment: 'corner' },
  { circuitId: 11, marker: 14, s: 0.0824, segment: 'hairpin' },
  { circuitId: 11, marker: 15, s: 0.0882, segment: 'straight' },
  { circuitId: 11, marker: 16, s: 0.0941, segment: 'corner' },
  { circuitId: 11, marker: 17, s: 0.1000, segment: 'corner' },
  { circuitId: 11, marker: 18, s: 0.1059, segment: 'corner' },
  { circuitId: 11, marker: 19, s: 0.1118, segment: 'corner' },
  { circuitId: 11, marker: 20, s: 0.1176, segment: 'straight' },
  { circuitId: 11, marker: 21, s: 0.1235, segment: 'hairpin' },
  { circuitId: 11, marker: 22, s: 0.1294, segment: 'chicane' },
  { circuitId: 11, marker: 23, s: 0.1353, segment: 'corner' },
  { circuitId: 11, marker: 24, s: 0.1412, segment: 'corner' },
  { circuitId: 11, marker: 25, s: 0.1471, segment: 'straight' },
  { circuitId: 11, marker: 26, s: 0.1529, segment: 'corner' },
  { circuitId: 11, marker: 27, s: 0.1588, segment: 'corner' },
  { circuitId: 11, marker: 28, s: 0.1647, segment: 'hairpin' },
  { circuitId: 11, marker: 29, s: 0.1706, segment: 'corner' },
  { circuitId: 11, marker: 30, s: 0.1765, segment: 'straight' },
  { circuitId: 11, marker: 31, s: 0.1824, segment: 'corner' },
  { circuitId: 11, marker: 32, s: 0.1882, segment: 'corner' },
  { circuitId: 11, marker: 33, s: 0.1941, segment: 'chicane' },
  { circuitId: 11, marker: 34, s: 0.2000, segment: 'corner' },
  { circuitId: 11, marker: 35, s: 0.2059, segment: 'hairpin' },
  { circuitId: 11, marker: 36, s: 0.2118, segment: 'corner' },
  { circuitId: 11, marker: 37, s: 0.2176, segment: 'corner' },
  { circuitId: 11, marker: 38, s: 0.2235, segment: 'corner' },
  { circuitId: 11, marker: 39, s: 0.2294, segment: 'corner' },
  { circuitId: 11, marker: 40, s: 0.2353, segment: 'straight' },
  { circuitId: 11, marker: 41, s: 0.2412, segment: 'corner' },
  { circuitId: 11, marker: 42, s: 0.2471, segment: 'hairpin' },
  { circuitId: 11, marker: 43, s: 0.2529, segment: 'corner' },
  { circuitId: 11, marker: 44, s: 0.2588, segment: 'chicane' },
  { circuitId: 11, marker: 45, s: 0.2647, segment: 'straight' },
  { circuitId: 11, marker: 46, s: 0.2706, segment: 'corner' },
  { circuitId: 11, marker: 47, s: 0.2765, segment: 'corner' },
  { circuitId: 11, marker: 48, s: 0.2824, segment: 'corner' },
  { circuitId: 11, marker: 49, s: 0.2882, segment: 'hairpin' },
  { circuitId: 11, marker: 50, s: 0.2941, segment: 'straight' },
  { circuitId: 11, marker: 51, s: 0.3000, segment: 'corner' },
  { circuitId: 11, marker: 52, s: 0.3059, segment: 'corner' },
  { circuitId: 11, marker: 53, s: 0.3118, segment: 'corner' },
  { circuitId: 11, marker: 54, s: 0.3176, segment: 'corner' },
  { circuitId: 11, marker: 55, s: 0.3235, segment: 'chicane' },
  { circuitId: 11, marker: 56, s: 0.3294, segment: 'hairpin' },
  { circuitId: 11, marker: 57, s: 0.3353, segment: 'corner' },
  { circuitId: 11, marker: 58, s: 0.3412, segment: 'corner' },
  { circuitId: 11, marker: 59, s: 0.3471, segment: 'corner' },
  { circuitId: 11, marker: 60, s: 0.3529, segment: 'straight' },
  { circuitId: 11, marker: 61, s: 0.3588, segment: 'corner' },
  { circuitId: 11, marker: 62, s: 0.3647, segment: 'corner' },
  { circuitId: 11, marker: 63, s: 0.3706, segment: 'hairpin' },
  { circuitId: 11, marker: 64, s: 0.3765, segment: 'corner' },
  { circuitId: 11, marker: 65, s: 0.3824, segment: 'straight' },
  { circuitId: 11, marker: 66, s: 0.3882, segment: 'chicane' },
  { circuitId: 11, marker: 67, s: 0.3941, segment: 'corner' },
  { circuitId: 11, marker: 68, s: 0.4000, segment: 'corner' },
  { circuitId: 11, marker: 69, s: 0.4059, segment: 'corner' },
  { circuitId: 11, marker: 70, s: 0.4118, segment: 'hairpin' },
  { circuitId: 11, marker: 71, s: 0.4176, segment: 'corner' },
  { circuitId: 11, marker: 72, s: 0.4235, segment: 'corner' },
  { circuitId: 11, marker: 73, s: 0.4294, segment: 'corner' },
  { circuitId: 11, marker: 74, s: 0.4353, segment: 'corner' },
  { circuitId: 11, marker: 75, s: 0.4412, segment: 'straight' },
  { circuitId: 11, marker: 76, s: 0.4471, segment: 'corner' },
  { circuitId: 11, marker: 77, s: 0.4529, segment: 'chicane' },
  { circuitId: 11, marker: 78, s: 0.4588, segment: 'corner' },
  { circuitId: 11, marker: 79, s: 0.4647, segment: 'corner' },
  { circuitId: 11, marker: 80, s: 0.4706, segment: 'straight' },
  { circuitId: 11, marker: 81, s: 0.4765, segment: 'corner' },
  { circuitId: 11, marker: 82, s: 0.4824, segment: 'corner' },
  { circuitId: 11, marker: 83, s: 0.4882, segment: 'corner' },
  { circuitId: 11, marker: 84, s: 0.4941, segment: 'hairpin' },
  { circuitId: 11, marker: 85, s: 0.5000, segment: 'straight' },
  { circuitId: 11, marker: 86, s: 0.5059, segment: 'corner' },
  { circuitId: 11, marker: 87, s: 0.5118, segment: 'corner' },
  { circuitId: 11, marker: 88, s: 0.5176, segment: 'chicane' },
  { circuitId: 11, marker: 89, s: 0.5235, segment: 'corner' },
  { circuitId: 11, marker: 90, s: 0.5294, segment: 'straight' },
  { circuitId: 11, marker: 91, s: 0.5353, segment: 'hairpin' },
  { circuitId: 11, marker: 92, s: 0.5412, segment: 'corner' },
  { circuitId: 11, marker: 93, s: 0.5471, segment: 'corner' },
  { circuitId: 11, marker: 94, s: 0.5529, segment: 'corner' },
  { circuitId: 11, marker: 95, s: 0.5588, segment: 'straight' },
  { circuitId: 11, marker: 96, s: 0.5647, segment: 'corner' },
  { circuitId: 11, marker: 97, s: 0.5706, segment: 'corner' },
  { circuitId: 11, marker: 98, s: 0.5765, segment: 'hairpin' },
  { circuitId: 11, marker: 99, s: 0.5824, segment: 'chicane' },
  { circuitId: 11, marker: 100, s: 0.5882, segment: 'straight' },
  { circuitId: 11, marker: 101, s: 0.5941, segment: 'corner' },
  { circuitId: 11, marker: 102, s: 0.6000, segment: 'corner' },
  { circuitId: 11, marker: 103, s: 0.6059, segment: 'corner' },
  { circuitId: 11, marker: 104, s: 0.6118, segment: 'corner' },
  { circuitId: 11, marker: 105, s: 0.6176, segment: 'hairpin' },
  { circuitId: 11, marker: 106, s: 0.6235, segment: 'corner' },
  { circuitId: 11, marker: 107, s: 0.6294, segment: 'corner' },
  { circuitId: 11, marker: 108, s: 0.6353, segment: 'corner' },
  { circuitId: 11, marker: 109, s: 0.6412, segment: 'corner' },
  { circuitId: 11, marker: 110, s: 0.6471, segment: 'chicane' },
  { circuitId: 11, marker: 111, s: 0.6529, segment: 'corner' },
  { circuitId: 11, marker: 112, s: 0.6588, segment: 'hairpin' },
  { circuitId: 11, marker: 113, s: 0.6647, segment: 'corner' },
  { circuitId: 11, marker: 114, s: 0.6706, segment: 'corner' },
  { circuitId: 11, marker: 115, s: 0.6765, segment: 'straight' },
  { circuitId: 11, marker: 116, s: 0.6824, segment: 'corner' },
  { circuitId: 11, marker: 117, s: 0.6882, segment: 'corner' },
  { circuitId: 11, marker: 118, s: 0.6941, segment: 'corner' },
  { circuitId: 11, marker: 119, s: 0.7000, segment: 'hairpin' },
  { circuitId: 11, marker: 120, s: 0.7059, segment: 'straight' },
  { circuitId: 11, marker: 121, s: 0.7118, segment: 'chicane' },
  { circuitId: 11, marker: 122, s: 0.7176, segment: 'corner' },
  { circuitId: 11, marker: 123, s: 0.7235, segment: 'corner' },
  { circuitId: 11, marker: 124, s: 0.7294, segment: 'corner' },
  { circuitId: 11, marker: 125, s: 0.7353, segment: 'straight' },
  { circuitId: 11, marker: 126, s: 0.7412, segment: 'hairpin' },
  { circuitId: 11, marker: 127, s: 0.7471, segment: 'corner' },
  { circuitId: 11, marker: 128, s: 0.7529, segment: 'corner' },
  { circuitId: 11, marker: 129, s: 0.7588, segment: 'corner' },
  { circuitId: 11, marker: 130, s: 0.7647, segment: 'straight' },
  { circuitId: 11, marker: 131, s: 0.7706, segment: 'corner' },
  { circuitId: 11, marker: 132, s: 0.7765, segment: 'chicane' },
  { circuitId: 11, marker: 133, s: 0.7824, segment: 'hairpin' },
  { circuitId: 11, marker: 134, s: 0.7882, segment: 'corner' },
  { circuitId: 11, marker: 135, s: 0.7941, segment: 'straight' },
  { circuitId: 11, marker: 136, s: 0.8000, segment: 'corner' },
  { circuitId: 11, marker: 137, s: 0.8059, segment: 'corner' },
  { circuitId: 11, marker: 138, s: 0.8118, segment: 'corner' },
  { circuitId: 11, marker: 139, s: 0.8176, segment: 'corner' },
  { circuitId: 11, marker: 140, s: 0.8235, segment: 'hairpin' },
  { circuitId: 11, marker: 141, s: 0.8294, segment: 'corner' },
  { circuitId: 11, marker: 142, s: 0.8353, segment: 'corner' },
  { circuitId: 11, marker: 143, s: 0.8412, segment: 'chicane' },
  { circuitId: 11, marker: 144, s: 0.8471, segment: 'corner' },
  { circuitId: 11, marker: 145, s: 0.8529, segment: 'straight' },
  { circuitId: 11, marker: 146, s: 0.8588, segment: 'corner' },
  { circuitId: 11, marker: 147, s: 0.8647, segment: 'hairpin' },
  { circuitId: 11, marker: 148, s: 0.8706, segment: 'corner' },
  { circuitId: 11, marker: 149, s: 0.8765, segment: 'corner' },
  { circuitId: 11, marker: 150, s: 0.8824, segment: 'straight' },
  { circuitId: 11, marker: 151, s: 0.8882, segment: 'corner' },
  { circuitId: 11, marker: 152, s: 0.8941, segment: 'corner' },
  { circuitId: 11, marker: 153, s: 0.9000, segment: 'corner' },
  { circuitId: 11, marker: 154, s: 0.9059, segment: 'chicane' },
  { circuitId: 11, marker: 155, s: 0.9118, segment: 'straight' },
  { circuitId: 11, marker: 156, s: 0.9176, segment: 'corner' },
  { circuitId: 11, marker: 157, s: 0.9235, segment: 'corner' },
  { circuitId: 11, marker: 158, s: 0.9294, segment: 'corner' },
  { circuitId: 11, marker: 159, s: 0.9353, segment: 'corner' },
  { circuitId: 11, marker: 160, s: 0.9412, segment: 'straight' },
  { circuitId: 11, marker: 161, s: 0.9471, segment: 'hairpin' },
  { circuitId: 11, marker: 162, s: 0.9529, segment: 'corner' },
  { circuitId: 11, marker: 163, s: 0.9588, segment: 'corner' },
  { circuitId: 11, marker: 164, s: 0.9647, segment: 'corner' },
  { circuitId: 11, marker: 165, s: 0.9706, segment: 'chicane' },
  { circuitId: 11, marker: 166, s: 0.9765, segment: 'corner' },
  { circuitId: 11, marker: 167, s: 0.9824, segment: 'corner' },
  { circuitId: 11, marker: 168, s: 0.9882, segment: 'hairpin' },
  { circuitId: 11, marker: 169, s: 0.9941, segment: 'corner' },
  { circuitId: 12, marker: 0, s: 0.0000, segment: 'chicane' },
  { circuitId: 12, marker: 1, s: 0.0059, segment: 'corner' },
  { circuitId: 12, marker: 2, s: 0.0118, segment: 'corner' },
  { circuitId: 12, marker: 3, s: 0.0176, segment: 'corner' },
  { circuitId: 12, marker: 4, s: 0.0235, segment: 'corner' },
  { circuitId: 12, marker: 5, s: 0.0294, segment: 'straight' },
  { circuitId: 12, marker: 6, s: 0.0353, segment: 'corner' },
  { circuitId: 12, marker: 7, s: 0.0412, segment: 'hairpin' },
  { circuitId: 12, marker: 8, s: 0.0471, segment: 'corner' },
  { circuitId: 12, marker: 9, s: 0.0529, segment: 'corner' },
  { circuitId: 12, marker: 10, s: 0.0588, segment: 'straight' },
  { circuitId: 12, marker: 11, s: 0.0647, segment: 'chicane' },
  { circuitId: 12, marker: 12, s: 0.0706, segment: 'corner' },
  { circuitId: 12, marker: 13, s: 0.0765, segment: 'corner' },
  { circuitId: 12, marker: 14, s: 0.0824, segment: 'hairpin' },
  { circuitId: 12, marker: 15, s: 0.0882, segment: 'straight' },
  { circuitId: 12, marker: 16, s: 0.0941, segment: 'corner' },
  { circuitId: 12, marker: 17, s: 0.1000, segment: 'corner' },
  { circuitId: 12, marker: 18, s: 0.1059, segment: 'corner' },
  { circuitId: 12, marker: 19, s: 0.1118, segment: 'corner' },
  { circuitId: 12, marker: 20, s: 0.1176, segment: 'straight' },
  { circuitId: 12, marker: 21, s: 0.1235, segment: 'hairpin' },
  { circuitId: 12, marker: 22, s: 0.1294, segment: 'chicane' },
  { circuitId: 12, marker: 23, s: 0.1353, segment: 'corner' },
  { circuitId: 12, marker: 24, s: 0.1412, segment: 'corner' },
  { circuitId: 12, marker: 25, s: 0.1471, segment: 'straight' },
  { circuitId: 12, marker: 26, s: 0.1529, segment: 'corner' },
  { circuitId: 12, marker: 27, s: 0.1588, segment: 'corner' },
  { circuitId: 12, marker: 28, s: 0.1647, segment: 'hairpin' },
  { circuitId: 12, marker: 29, s: 0.1706, segment: 'corner' },
  { circuitId: 12, marker: 30, s: 0.1765, segment: 'straight' },
  { circuitId: 12, marker: 31, s: 0.1824, segment: 'corner' },
  { circuitId: 12, marker: 32, s: 0.1882, segment: 'corner' },
  { circuitId: 12, marker: 33, s: 0.1941, segment: 'chicane' },
  { circuitId: 12, marker: 34, s: 0.2000, segment: 'corner' },
  { circuitId: 12, marker: 35, s: 0.2059, segment: 'hairpin' },
  { circuitId: 12, marker: 36, s: 0.2118, segment: 'corner' },
  { circuitId: 12, marker: 37, s: 0.2176, segment: 'corner' },
  { circuitId: 12, marker: 38, s: 0.2235, segment: 'corner' },
  { circuitId: 12, marker: 39, s: 0.2294, segment: 'corner' },
  { circuitId: 12, marker: 40, s: 0.2353, segment: 'straight' },
  { circuitId: 12, marker: 41, s: 0.2412, segment: 'corner' },
  { circuitId: 12, marker: 42, s: 0.2471, segment: 'hairpin' },
  { circuitId: 12, marker: 43, s: 0.2529, segment: 'corner' },
  { circuitId: 12, marker: 44, s: 0.2588, segment: 'chicane' },
  { circuitId: 12, marker: 45, s: 0.2647, segment: 'straight' },
  { circuitId: 12, marker: 46, s: 0.2706, segment: 'corner' },
  { circuitId: 12, marker: 47, s: 0.2765, segment: 'corner' },
  { circuitId: 12, marker: 48, s: 0.2824, segment: 'corner' },
  { circuitId: 12, marker: 49, s: 0.2882, segment: 'hairpin' },
  { circuitId: 12, marker: 50, s: 0.2941, segment: 'straight' },
  { circuitId: 12, marker: 51, s: 0.3000, segment: 'corner' },
  { circuitId: 12, marker: 52, s: 0.3059, segment: 'corner' },
  { circuitId: 12, marker: 53, s: 0.3118, segment: 'corner' },
  { circuitId: 12, marker: 54, s: 0.3176, segment: 'corner' },
  { circuitId: 12, marker: 55, s: 0.3235, segment: 'chicane' },
  { circuitId: 12, marker: 56, s: 0.3294, segment: 'hairpin' },
  { circuitId: 12, marker: 57, s: 0.3353, segment: 'corner' },
  { circuitId: 12, marker: 58, s: 0.3412, segment: 'corner' },
  { circuitId: 12, marker: 59, s: 0.3471, segment: 'corner' },
  { circuitId: 12, marker: 60, s: 0.3529, segment: 'straight' },
  { circuitId: 12, marker: 61, s: 0.3588, segment: 'corner' },
  { circuitId: 12, marker: 62, s: 0.3647, segment: 'corner' },
  { circuitId: 12, marker: 63, s: 0.3706, segment: 'hairpin' },
  { circuitId: 12, marker: 64, s: 0.3765, segment: 'corner' },
  { circuitId: 12, marker: 65, s: 0.3824, segment: 'straight' },
  { circuitId: 12, marker: 66, s: 0.3882, segment: 'chicane' },
  { circuitId: 12, marker: 67, s: 0.3941, segment: 'corner' },
  { circuitId: 12, marker: 68, s: 0.4000, segment: 'corner' },
  { circuitId: 12, marker: 69, s: 0.4059, segment: 'corner' },
  { circuitId: 12, marker: 70, s: 0.4118, segment: 'hairpin' },
  { circuitId: 12, marker: 71, s: 0.4176, segment: 'corner' },
  { circuitId: 12, marker: 72, s: 0.4235, segment: 'corner' },
  { circuitId: 12, marker: 73, s: 0.4294, segment: 'corner' },
  { circuitId: 12, marker: 74, s: 0.4353, segment: 'corner' },
  { circuitId: 12, marker: 75, s: 0.4412, segment: 'straight' },
  { circuitId: 12, marker: 76, s: 0.4471, segment: 'corner' },
  { circuitId: 12, marker: 77, s: 0.4529, segment: 'chicane' },
  { circuitId: 12, marker: 78, s: 0.4588, segment: 'corner' },
  { circuitId: 12, marker: 79, s: 0.4647, segment: 'corner' },
  { circuitId: 12, marker: 80, s: 0.4706, segment: 'straight' },
  { circuitId: 12, marker: 81, s: 0.4765, segment: 'corner' },
  { circuitId: 12, marker: 82, s: 0.4824, segment: 'corner' },
  { circuitId: 12, marker: 83, s: 0.4882, segment: 'corner' },
  { circuitId: 12, marker: 84, s: 0.4941, segment: 'hairpin' },
  { circuitId: 12, marker: 85, s: 0.5000, segment: 'straight' },
  { circuitId: 12, marker: 86, s: 0.5059, segment: 'corner' },
  { circuitId: 12, marker: 87, s: 0.5118, segment: 'corner' },
  { circuitId: 12, marker: 88, s: 0.5176, segment: 'chicane' },
  { circuitId: 12, marker: 89, s: 0.5235, segment: 'corner' },
  { circuitId: 12, marker: 90, s: 0.5294, segment: 'straight' },
  { circuitId: 12, marker: 91, s: 0.5353, segment: 'hairpin' },
  { circuitId: 12, marker: 92, s: 0.5412, segment: 'corner' },
  { circuitId: 12, marker: 93, s: 0.5471, segment: 'corner' },
  { circuitId: 12, marker: 94, s: 0.5529, segment: 'corner' },
  { circuitId: 12, marker: 95, s: 0.5588, segment: 'straight' },
  { circuitId: 12, marker: 96, s: 0.5647, segment: 'corner' },
  { circuitId: 12, marker: 97, s: 0.5706, segment: 'corner' },
  { circuitId: 12, marker: 98, s: 0.5765, segment: 'hairpin' },
  { circuitId: 12, marker: 99, s: 0.5824, segment: 'chicane' },
  { circuitId: 12, marker: 100, s: 0.5882, segment: 'straight' },
  { circuitId: 12, marker: 101, s: 0.5941, segment: 'corner' },
  { circuitId: 12, marker: 102, s: 0.6000, segment: 'corner' },
  { circuitId: 12, marker: 103, s: 0.6059, segment: 'corner' },
  { circuitId: 12, marker: 104, s: 0.6118, segment: 'corner' },
  { circuitId: 12, marker: 105, s: 0.6176, segment: 'hairpin' },
  { circuitId: 12, marker: 106, s: 0.6235, segment: 'corner' },
  { circuitId: 12, marker: 107, s: 0.6294, segment: 'corner' },
  { circuitId: 12, marker: 108, s: 0.6353, segment: 'corner' },
  { circuitId: 12, marker: 109, s: 0.6412, segment: 'corner' },
  { circuitId: 12, marker: 110, s: 0.6471, segment: 'chicane' },
  { circuitId: 12, marker: 111, s: 0.6529, segment: 'corner' },
  { circuitId: 12, marker: 112, s: 0.6588, segment: 'hairpin' },
  { circuitId: 12, marker: 113, s: 0.6647, segment: 'corner' },
  { circuitId: 12, marker: 114, s: 0.6706, segment: 'corner' },
  { circuitId: 12, marker: 115, s: 0.6765, segment: 'straight' },
  { circuitId: 12, marker: 116, s: 0.6824, segment: 'corner' },
  { circuitId: 12, marker: 117, s: 0.6882, segment: 'corner' },
  { circuitId: 12, marker: 118, s: 0.6941, segment: 'corner' },
  { circuitId: 12, marker: 119, s: 0.7000, segment: 'hairpin' },
  { circuitId: 12, marker: 120, s: 0.7059, segment: 'straight' },
  { circuitId: 12, marker: 121, s: 0.7118, segment: 'chicane' },
  { circuitId: 12, marker: 122, s: 0.7176, segment: 'corner' },
  { circuitId: 12, marker: 123, s: 0.7235, segment: 'corner' },
  { circuitId: 12, marker: 124, s: 0.7294, segment: 'corner' },
  { circuitId: 12, marker: 125, s: 0.7353, segment: 'straight' },
  { circuitId: 12, marker: 126, s: 0.7412, segment: 'hairpin' },
  { circuitId: 12, marker: 127, s: 0.7471, segment: 'corner' },
  { circuitId: 12, marker: 128, s: 0.7529, segment: 'corner' },
  { circuitId: 12, marker: 129, s: 0.7588, segment: 'corner' },
  { circuitId: 12, marker: 130, s: 0.7647, segment: 'straight' },
  { circuitId: 12, marker: 131, s: 0.7706, segment: 'corner' },
  { circuitId: 12, marker: 132, s: 0.7765, segment: 'chicane' },
  { circuitId: 12, marker: 133, s: 0.7824, segment: 'hairpin' },
  { circuitId: 12, marker: 134, s: 0.7882, segment: 'corner' },
  { circuitId: 12, marker: 135, s: 0.7941, segment: 'straight' },
  { circuitId: 12, marker: 136, s: 0.8000, segment: 'corner' },
  { circuitId: 12, marker: 137, s: 0.8059, segment: 'corner' },
  { circuitId: 12, marker: 138, s: 0.8118, segment: 'corner' },
  { circuitId: 12, marker: 139, s: 0.8176, segment: 'corner' },
  { circuitId: 12, marker: 140, s: 0.8235, segment: 'hairpin' },
  { circuitId: 12, marker: 141, s: 0.8294, segment: 'corner' },
  { circuitId: 12, marker: 142, s: 0.8353, segment: 'corner' },
  { circuitId: 12, marker: 143, s: 0.8412, segment: 'chicane' },
  { circuitId: 12, marker: 144, s: 0.8471, segment: 'corner' },
  { circuitId: 12, marker: 145, s: 0.8529, segment: 'straight' },
  { circuitId: 12, marker: 146, s: 0.8588, segment: 'corner' },
  { circuitId: 12, marker: 147, s: 0.8647, segment: 'hairpin' },
  { circuitId: 12, marker: 148, s: 0.8706, segment: 'corner' },
  { circuitId: 12, marker: 149, s: 0.8765, segment: 'corner' },
  { circuitId: 12, marker: 150, s: 0.8824, segment: 'straight' },
  { circuitId: 12, marker: 151, s: 0.8882, segment: 'corner' },
  { circuitId: 12, marker: 152, s: 0.8941, segment: 'corner' },
  { circuitId: 12, marker: 153, s: 0.9000, segment: 'corner' },
  { circuitId: 12, marker: 154, s: 0.9059, segment: 'chicane' },
  { circuitId: 12, marker: 155, s: 0.9118, segment: 'straight' },
  { circuitId: 12, marker: 156, s: 0.9176, segment: 'corner' },
  { circuitId: 12, marker: 157, s: 0.9235, segment: 'corner' },
  { circuitId: 12, marker: 158, s: 0.9294, segment: 'corner' },
  { circuitId: 12, marker: 159, s: 0.9353, segment: 'corner' },
  { circuitId: 12, marker: 160, s: 0.9412, segment: 'straight' },
  { circuitId: 12, marker: 161, s: 0.9471, segment: 'hairpin' },
  { circuitId: 12, marker: 162, s: 0.9529, segment: 'corner' },
  { circuitId: 12, marker: 163, s: 0.9588, segment: 'corner' },
  { circuitId: 12, marker: 164, s: 0.9647, segment: 'corner' },
  { circuitId: 12, marker: 165, s: 0.9706, segment: 'chicane' },
  { circuitId: 12, marker: 166, s: 0.9765, segment: 'corner' },
  { circuitId: 12, marker: 167, s: 0.9824, segment: 'corner' },
  { circuitId: 12, marker: 168, s: 0.9882, segment: 'hairpin' },
  { circuitId: 12, marker: 169, s: 0.9941, segment: 'corner' },
  { circuitId: 13, marker: 0, s: 0.0000, segment: 'chicane' },
  { circuitId: 13, marker: 1, s: 0.0059, segment: 'corner' },
  { circuitId: 13, marker: 2, s: 0.0118, segment: 'corner' },
  { circuitId: 13, marker: 3, s: 0.0176, segment: 'corner' },
  { circuitId: 13, marker: 4, s: 0.0235, segment: 'corner' },
  { circuitId: 13, marker: 5, s: 0.0294, segment: 'straight' },
  { circuitId: 13, marker: 6, s: 0.0353, segment: 'corner' },
  { circuitId: 13, marker: 7, s: 0.0412, segment: 'hairpin' },
  { circuitId: 13, marker: 8, s: 0.0471, segment: 'corner' },
  { circuitId: 13, marker: 9, s: 0.0529, segment: 'corner' },
  { circuitId: 13, marker: 10, s: 0.0588, segment: 'straight' },
  { circuitId: 13, marker: 11, s: 0.0647, segment: 'chicane' },
  { circuitId: 13, marker: 12, s: 0.0706, segment: 'corner' },
  { circuitId: 13, marker: 13, s: 0.0765, segment: 'corner' },
  { circuitId: 13, marker: 14, s: 0.0824, segment: 'hairpin' },
  { circuitId: 13, marker: 15, s: 0.0882, segment: 'straight' },
  { circuitId: 13, marker: 16, s: 0.0941, segment: 'corner' },
  { circuitId: 13, marker: 17, s: 0.1000, segment: 'corner' },
  { circuitId: 13, marker: 18, s: 0.1059, segment: 'corner' },
  { circuitId: 13, marker: 19, s: 0.1118, segment: 'corner' },
  { circuitId: 13, marker: 20, s: 0.1176, segment: 'straight' },
  { circuitId: 13, marker: 21, s: 0.1235, segment: 'hairpin' },
  { circuitId: 13, marker: 22, s: 0.1294, segment: 'chicane' },
  { circuitId: 13, marker: 23, s: 0.1353, segment: 'corner' },
  { circuitId: 13, marker: 24, s: 0.1412, segment: 'corner' },
  { circuitId: 13, marker: 25, s: 0.1471, segment: 'straight' },
  { circuitId: 13, marker: 26, s: 0.1529, segment: 'corner' },
  { circuitId: 13, marker: 27, s: 0.1588, segment: 'corner' },
  { circuitId: 13, marker: 28, s: 0.1647, segment: 'hairpin' },
  { circuitId: 13, marker: 29, s: 0.1706, segment: 'corner' },
  { circuitId: 13, marker: 30, s: 0.1765, segment: 'straight' },
  { circuitId: 13, marker: 31, s: 0.1824, segment: 'corner' },
  { circuitId: 13, marker: 32, s: 0.1882, segment: 'corner' },
  { circuitId: 13, marker: 33, s: 0.1941, segment: 'chicane' },
  { circuitId: 13, marker: 34, s: 0.2000, segment: 'corner' },
  { circuitId: 13, marker: 35, s: 0.2059, segment: 'hairpin' },
  { circuitId: 13, marker: 36, s: 0.2118, segment: 'corner' },
  { circuitId: 13, marker: 37, s: 0.2176, segment: 'corner' },
  { circuitId: 13, marker: 38, s: 0.2235, segment: 'corner' },
  { circuitId: 13, marker: 39, s: 0.2294, segment: 'corner' },
  { circuitId: 13, marker: 40, s: 0.2353, segment: 'straight' },
  { circuitId: 13, marker: 41, s: 0.2412, segment: 'corner' },
  { circuitId: 13, marker: 42, s: 0.2471, segment: 'hairpin' },
  { circuitId: 13, marker: 43, s: 0.2529, segment: 'corner' },
  { circuitId: 13, marker: 44, s: 0.2588, segment: 'chicane' },
  { circuitId: 13, marker: 45, s: 0.2647, segment: 'straight' },
  { circuitId: 13, marker: 46, s: 0.2706, segment: 'corner' },
  { circuitId: 13, marker: 47, s: 0.2765, segment: 'corner' },
  { circuitId: 13, marker: 48, s: 0.2824, segment: 'corner' },
  { circuitId: 13, marker: 49, s: 0.2882, segment: 'hairpin' },
  { circuitId: 13, marker: 50, s: 0.2941, segment: 'straight' },
  { circuitId: 13, marker: 51, s: 0.3000, segment: 'corner' },
  { circuitId: 13, marker: 52, s: 0.3059, segment: 'corner' },
  { circuitId: 13, marker: 53, s: 0.3118, segment: 'corner' },
  { circuitId: 13, marker: 54, s: 0.3176, segment: 'corner' },
  { circuitId: 13, marker: 55, s: 0.3235, segment: 'chicane' },
  { circuitId: 13, marker: 56, s: 0.3294, segment: 'hairpin' },
  { circuitId: 13, marker: 57, s: 0.3353, segment: 'corner' },
  { circuitId: 13, marker: 58, s: 0.3412, segment: 'corner' },
  { circuitId: 13, marker: 59, s: 0.3471, segment: 'corner' },
  { circuitId: 13, marker: 60, s: 0.3529, segment: 'straight' },
  { circuitId: 13, marker: 61, s: 0.3588, segment: 'corner' },
  { circuitId: 13, marker: 62, s: 0.3647, segment: 'corner' },
  { circuitId: 13, marker: 63, s: 0.3706, segment: 'hairpin' },
  { circuitId: 13, marker: 64, s: 0.3765, segment: 'corner' },
  { circuitId: 13, marker: 65, s: 0.3824, segment: 'straight' },
  { circuitId: 13, marker: 66, s: 0.3882, segment: 'chicane' },
  { circuitId: 13, marker: 67, s: 0.3941, segment: 'corner' },
  { circuitId: 13, marker: 68, s: 0.4000, segment: 'corner' },
  { circuitId: 13, marker: 69, s: 0.4059, segment: 'corner' },
  { circuitId: 13, marker: 70, s: 0.4118, segment: 'hairpin' },
  { circuitId: 13, marker: 71, s: 0.4176, segment: 'corner' },
  { circuitId: 13, marker: 72, s: 0.4235, segment: 'corner' },
  { circuitId: 13, marker: 73, s: 0.4294, segment: 'corner' },
  { circuitId: 13, marker: 74, s: 0.4353, segment: 'corner' },
  { circuitId: 13, marker: 75, s: 0.4412, segment: 'straight' },
  { circuitId: 13, marker: 76, s: 0.4471, segment: 'corner' },
  { circuitId: 13, marker: 77, s: 0.4529, segment: 'chicane' },
  { circuitId: 13, marker: 78, s: 0.4588, segment: 'corner' },
  { circuitId: 13, marker: 79, s: 0.4647, segment: 'corner' },
  { circuitId: 13, marker: 80, s: 0.4706, segment: 'straight' },
  { circuitId: 13, marker: 81, s: 0.4765, segment: 'corner' },
  { circuitId: 13, marker: 82, s: 0.4824, segment: 'corner' },
  { circuitId: 13, marker: 83, s: 0.4882, segment: 'corner' },
  { circuitId: 13, marker: 84, s: 0.4941, segment: 'hairpin' },
  { circuitId: 13, marker: 85, s: 0.5000, segment: 'straight' },
  { circuitId: 13, marker: 86, s: 0.5059, segment: 'corner' },
  { circuitId: 13, marker: 87, s: 0.5118, segment: 'corner' },
  { circuitId: 13, marker: 88, s: 0.5176, segment: 'chicane' },
  { circuitId: 13, marker: 89, s: 0.5235, segment: 'corner' },
  { circuitId: 13, marker: 90, s: 0.5294, segment: 'straight' },
  { circuitId: 13, marker: 91, s: 0.5353, segment: 'hairpin' },
  { circuitId: 13, marker: 92, s: 0.5412, segment: 'corner' },
  { circuitId: 13, marker: 93, s: 0.5471, segment: 'corner' },
  { circuitId: 13, marker: 94, s: 0.5529, segment: 'corner' },
  { circuitId: 13, marker: 95, s: 0.5588, segment: 'straight' },
  { circuitId: 13, marker: 96, s: 0.5647, segment: 'corner' },
  { circuitId: 13, marker: 97, s: 0.5706, segment: 'corner' },
  { circuitId: 13, marker: 98, s: 0.5765, segment: 'hairpin' },
  { circuitId: 13, marker: 99, s: 0.5824, segment: 'chicane' },
  { circuitId: 13, marker: 100, s: 0.5882, segment: 'straight' },
  { circuitId: 13, marker: 101, s: 0.5941, segment: 'corner' },
  { circuitId: 13, marker: 102, s: 0.6000, segment: 'corner' },
  { circuitId: 13, marker: 103, s: 0.6059, segment: 'corner' },
  { circuitId: 13, marker: 104, s: 0.6118, segment: 'corner' },
  { circuitId: 13, marker: 105, s: 0.6176, segment: 'hairpin' },
  { circuitId: 13, marker: 106, s: 0.6235, segment: 'corner' },
  { circuitId: 13, marker: 107, s: 0.6294, segment: 'corner' },
  { circuitId: 13, marker: 108, s: 0.6353, segment: 'corner' },
  { circuitId: 13, marker: 109, s: 0.6412, segment: 'corner' },
  { circuitId: 13, marker: 110, s: 0.6471, segment: 'chicane' },
  { circuitId: 13, marker: 111, s: 0.6529, segment: 'corner' },
  { circuitId: 13, marker: 112, s: 0.6588, segment: 'hairpin' },
  { circuitId: 13, marker: 113, s: 0.6647, segment: 'corner' },
  { circuitId: 13, marker: 114, s: 0.6706, segment: 'corner' },
  { circuitId: 13, marker: 115, s: 0.6765, segment: 'straight' },
  { circuitId: 13, marker: 116, s: 0.6824, segment: 'corner' },
  { circuitId: 13, marker: 117, s: 0.6882, segment: 'corner' },
  { circuitId: 13, marker: 118, s: 0.6941, segment: 'corner' },
  { circuitId: 13, marker: 119, s: 0.7000, segment: 'hairpin' },
  { circuitId: 13, marker: 120, s: 0.7059, segment: 'straight' },
  { circuitId: 13, marker: 121, s: 0.7118, segment: 'chicane' },
  { circuitId: 13, marker: 122, s: 0.7176, segment: 'corner' },
  { circuitId: 13, marker: 123, s: 0.7235, segment: 'corner' },
  { circuitId: 13, marker: 124, s: 0.7294, segment: 'corner' },
  { circuitId: 13, marker: 125, s: 0.7353, segment: 'straight' },
  { circuitId: 13, marker: 126, s: 0.7412, segment: 'hairpin' },
  { circuitId: 13, marker: 127, s: 0.7471, segment: 'corner' },
  { circuitId: 13, marker: 128, s: 0.7529, segment: 'corner' },
  { circuitId: 13, marker: 129, s: 0.7588, segment: 'corner' },
  { circuitId: 13, marker: 130, s: 0.7647, segment: 'straight' },
  { circuitId: 13, marker: 131, s: 0.7706, segment: 'corner' },
  { circuitId: 13, marker: 132, s: 0.7765, segment: 'chicane' },
  { circuitId: 13, marker: 133, s: 0.7824, segment: 'hairpin' },
  { circuitId: 13, marker: 134, s: 0.7882, segment: 'corner' },
  { circuitId: 13, marker: 135, s: 0.7941, segment: 'straight' },
  { circuitId: 13, marker: 136, s: 0.8000, segment: 'corner' },
  { circuitId: 13, marker: 137, s: 0.8059, segment: 'corner' },
  { circuitId: 13, marker: 138, s: 0.8118, segment: 'corner' },
  { circuitId: 13, marker: 139, s: 0.8176, segment: 'corner' },
  { circuitId: 13, marker: 140, s: 0.8235, segment: 'hairpin' },
  { circuitId: 13, marker: 141, s: 0.8294, segment: 'corner' },
  { circuitId: 13, marker: 142, s: 0.8353, segment: 'corner' },
  { circuitId: 13, marker: 143, s: 0.8412, segment: 'chicane' },
  { circuitId: 13, marker: 144, s: 0.8471, segment: 'corner' },
  { circuitId: 13, marker: 145, s: 0.8529, segment: 'straight' },
  { circuitId: 13, marker: 146, s: 0.8588, segment: 'corner' },
  { circuitId: 13, marker: 147, s: 0.8647, segment: 'hairpin' },
  { circuitId: 13, marker: 148, s: 0.8706, segment: 'corner' },
  { circuitId: 13, marker: 149, s: 0.8765, segment: 'corner' },
  { circuitId: 13, marker: 150, s: 0.8824, segment: 'straight' },
  { circuitId: 13, marker: 151, s: 0.8882, segment: 'corner' },
  { circuitId: 13, marker: 152, s: 0.8941, segment: 'corner' },
  { circuitId: 13, marker: 153, s: 0.9000, segment: 'corner' },
  { circuitId: 13, marker: 154, s: 0.9059, segment: 'chicane' },
  { circuitId: 13, marker: 155, s: 0.9118, segment: 'straight' },
  { circuitId: 13, marker: 156, s: 0.9176, segment: 'corner' },
  { circuitId: 13, marker: 157, s: 0.9235, segment: 'corner' },
  { circuitId: 13, marker: 158, s: 0.9294, segment: 'corner' },
  { circuitId: 13, marker: 159, s: 0.9353, segment: 'corner' },
  { circuitId: 13, marker: 160, s: 0.9412, segment: 'straight' },
  { circuitId: 13, marker: 161, s: 0.9471, segment: 'hairpin' },
  { circuitId: 13, marker: 162, s: 0.9529, segment: 'corner' },
  { circuitId: 13, marker: 163, s: 0.9588, segment: 'corner' },
  { circuitId: 13, marker: 164, s: 0.9647, segment: 'corner' },
  { circuitId: 13, marker: 165, s: 0.9706, segment: 'chicane' },
  { circuitId: 13, marker: 166, s: 0.9765, segment: 'corner' },
  { circuitId: 13, marker: 167, s: 0.9824, segment: 'corner' },
  { circuitId: 13, marker: 168, s: 0.9882, segment: 'hairpin' },
  { circuitId: 13, marker: 169, s: 0.9941, segment: 'corner' },
  { circuitId: 14, marker: 0, s: 0.0000, segment: 'chicane' },
  { circuitId: 14, marker: 1, s: 0.0059, segment: 'corner' },
  { circuitId: 14, marker: 2, s: 0.0118, segment: 'corner' },
  { circuitId: 14, marker: 3, s: 0.0176, segment: 'corner' },
  { circuitId: 14, marker: 4, s: 0.0235, segment: 'corner' },
  { circuitId: 14, marker: 5, s: 0.0294, segment: 'straight' },
  { circuitId: 14, marker: 6, s: 0.0353, segment: 'corner' },
  { circuitId: 14, marker: 7, s: 0.0412, segment: 'hairpin' },
  { circuitId: 14, marker: 8, s: 0.0471, segment: 'corner' },
  { circuitId: 14, marker: 9, s: 0.0529, segment: 'corner' },
  { circuitId: 14, marker: 10, s: 0.0588, segment: 'straight' },
  { circuitId: 14, marker: 11, s: 0.0647, segment: 'chicane' },
  { circuitId: 14, marker: 12, s: 0.0706, segment: 'corner' },
  { circuitId: 14, marker: 13, s: 0.0765, segment: 'corner' },
  { circuitId: 14, marker: 14, s: 0.0824, segment: 'hairpin' },
  { circuitId: 14, marker: 15, s: 0.0882, segment: 'straight' },
  { circuitId: 14, marker: 16, s: 0.0941, segment: 'corner' },
  { circuitId: 14, marker: 17, s: 0.1000, segment: 'corner' },
  { circuitId: 14, marker: 18, s: 0.1059, segment: 'corner' },
  { circuitId: 14, marker: 19, s: 0.1118, segment: 'corner' },
  { circuitId: 14, marker: 20, s: 0.1176, segment: 'straight' },
  { circuitId: 14, marker: 21, s: 0.1235, segment: 'hairpin' },
  { circuitId: 14, marker: 22, s: 0.1294, segment: 'chicane' },
  { circuitId: 14, marker: 23, s: 0.1353, segment: 'corner' },
  { circuitId: 14, marker: 24, s: 0.1412, segment: 'corner' },
  { circuitId: 14, marker: 25, s: 0.1471, segment: 'straight' },
  { circuitId: 14, marker: 26, s: 0.1529, segment: 'corner' },
  { circuitId: 14, marker: 27, s: 0.1588, segment: 'corner' },
  { circuitId: 14, marker: 28, s: 0.1647, segment: 'hairpin' },
  { circuitId: 14, marker: 29, s: 0.1706, segment: 'corner' },
  { circuitId: 14, marker: 30, s: 0.1765, segment: 'straight' },
  { circuitId: 14, marker: 31, s: 0.1824, segment: 'corner' },
  { circuitId: 14, marker: 32, s: 0.1882, segment: 'corner' },
  { circuitId: 14, marker: 33, s: 0.1941, segment: 'chicane' },
  { circuitId: 14, marker: 34, s: 0.2000, segment: 'corner' },
  { circuitId: 14, marker: 35, s: 0.2059, segment: 'hairpin' },
  { circuitId: 14, marker: 36, s: 0.2118, segment: 'corner' },
  { circuitId: 14, marker: 37, s: 0.2176, segment: 'corner' },
  { circuitId: 14, marker: 38, s: 0.2235, segment: 'corner' },
  { circuitId: 14, marker: 39, s: 0.2294, segment: 'corner' },
  { circuitId: 14, marker: 40, s: 0.2353, segment: 'straight' },
  { circuitId: 14, marker: 41, s: 0.2412, segment: 'corner' },
  { circuitId: 14, marker: 42, s: 0.2471, segment: 'hairpin' },
  { circuitId: 14, marker: 43, s: 0.2529, segment: 'corner' },
  { circuitId: 14, marker: 44, s: 0.2588, segment: 'chicane' },
  { circuitId: 14, marker: 45, s: 0.2647, segment: 'straight' },
  { circuitId: 14, marker: 46, s: 0.2706, segment: 'corner' },
  { circuitId: 14, marker: 47, s: 0.2765, segment: 'corner' },
  { circuitId: 14, marker: 48, s: 0.2824, segment: 'corner' },
  { circuitId: 14, marker: 49, s: 0.2882, segment: 'hairpin' },
  { circuitId: 14, marker: 50, s: 0.2941, segment: 'straight' },
  { circuitId: 14, marker: 51, s: 0.3000, segment: 'corner' },
  { circuitId: 14, marker: 52, s: 0.3059, segment: 'corner' },
  { circuitId: 14, marker: 53, s: 0.3118, segment: 'corner' },
  { circuitId: 14, marker: 54, s: 0.3176, segment: 'corner' },
  { circuitId: 14, marker: 55, s: 0.3235, segment: 'chicane' },
  { circuitId: 14, marker: 56, s: 0.3294, segment: 'hairpin' },
  { circuitId: 14, marker: 57, s: 0.3353, segment: 'corner' },
  { circuitId: 14, marker: 58, s: 0.3412, segment: 'corner' },
  { circuitId: 14, marker: 59, s: 0.3471, segment: 'corner' },
  { circuitId: 14, marker: 60, s: 0.3529, segment: 'straight' },
  { circuitId: 14, marker: 61, s: 0.3588, segment: 'corner' },
  { circuitId: 14, marker: 62, s: 0.3647, segment: 'corner' },
  { circuitId: 14, marker: 63, s: 0.3706, segment: 'hairpin' },
  { circuitId: 14, marker: 64, s: 0.3765, segment: 'corner' },
  { circuitId: 14, marker: 65, s: 0.3824, segment: 'straight' },
  { circuitId: 14, marker: 66, s: 0.3882, segment: 'chicane' },
  { circuitId: 14, marker: 67, s: 0.3941, segment: 'corner' },
  { circuitId: 14, marker: 68, s: 0.4000, segment: 'corner' },
  { circuitId: 14, marker: 69, s: 0.4059, segment: 'corner' },
  { circuitId: 14, marker: 70, s: 0.4118, segment: 'hairpin' },
  { circuitId: 14, marker: 71, s: 0.4176, segment: 'corner' },
  { circuitId: 14, marker: 72, s: 0.4235, segment: 'corner' },
  { circuitId: 14, marker: 73, s: 0.4294, segment: 'corner' },
  { circuitId: 14, marker: 74, s: 0.4353, segment: 'corner' },
  { circuitId: 14, marker: 75, s: 0.4412, segment: 'straight' },
  { circuitId: 14, marker: 76, s: 0.4471, segment: 'corner' },
  { circuitId: 14, marker: 77, s: 0.4529, segment: 'chicane' },
  { circuitId: 14, marker: 78, s: 0.4588, segment: 'corner' },
  { circuitId: 14, marker: 79, s: 0.4647, segment: 'corner' },
  { circuitId: 14, marker: 80, s: 0.4706, segment: 'straight' },
  { circuitId: 14, marker: 81, s: 0.4765, segment: 'corner' },
  { circuitId: 14, marker: 82, s: 0.4824, segment: 'corner' },
  { circuitId: 14, marker: 83, s: 0.4882, segment: 'corner' },
  { circuitId: 14, marker: 84, s: 0.4941, segment: 'hairpin' },
  { circuitId: 14, marker: 85, s: 0.5000, segment: 'straight' },
  { circuitId: 14, marker: 86, s: 0.5059, segment: 'corner' },
  { circuitId: 14, marker: 87, s: 0.5118, segment: 'corner' },
  { circuitId: 14, marker: 88, s: 0.5176, segment: 'chicane' },
  { circuitId: 14, marker: 89, s: 0.5235, segment: 'corner' },
  { circuitId: 14, marker: 90, s: 0.5294, segment: 'straight' },
  { circuitId: 14, marker: 91, s: 0.5353, segment: 'hairpin' },
  { circuitId: 14, marker: 92, s: 0.5412, segment: 'corner' },
  { circuitId: 14, marker: 93, s: 0.5471, segment: 'corner' },
  { circuitId: 14, marker: 94, s: 0.5529, segment: 'corner' },
  { circuitId: 14, marker: 95, s: 0.5588, segment: 'straight' },
  { circuitId: 14, marker: 96, s: 0.5647, segment: 'corner' },
  { circuitId: 14, marker: 97, s: 0.5706, segment: 'corner' },
  { circuitId: 14, marker: 98, s: 0.5765, segment: 'hairpin' },
  { circuitId: 14, marker: 99, s: 0.5824, segment: 'chicane' },
  { circuitId: 14, marker: 100, s: 0.5882, segment: 'straight' },
  { circuitId: 14, marker: 101, s: 0.5941, segment: 'corner' },
  { circuitId: 14, marker: 102, s: 0.6000, segment: 'corner' },
  { circuitId: 14, marker: 103, s: 0.6059, segment: 'corner' },
  { circuitId: 14, marker: 104, s: 0.6118, segment: 'corner' },
  { circuitId: 14, marker: 105, s: 0.6176, segment: 'hairpin' },
  { circuitId: 14, marker: 106, s: 0.6235, segment: 'corner' },
  { circuitId: 14, marker: 107, s: 0.6294, segment: 'corner' },
  { circuitId: 14, marker: 108, s: 0.6353, segment: 'corner' },
  { circuitId: 14, marker: 109, s: 0.6412, segment: 'corner' },
  { circuitId: 14, marker: 110, s: 0.6471, segment: 'chicane' },
  { circuitId: 14, marker: 111, s: 0.6529, segment: 'corner' },
  { circuitId: 14, marker: 112, s: 0.6588, segment: 'hairpin' },
  { circuitId: 14, marker: 113, s: 0.6647, segment: 'corner' },
  { circuitId: 14, marker: 114, s: 0.6706, segment: 'corner' },
  { circuitId: 14, marker: 115, s: 0.6765, segment: 'straight' },
  { circuitId: 14, marker: 116, s: 0.6824, segment: 'corner' },
  { circuitId: 14, marker: 117, s: 0.6882, segment: 'corner' },
  { circuitId: 14, marker: 118, s: 0.6941, segment: 'corner' },
  { circuitId: 14, marker: 119, s: 0.7000, segment: 'hairpin' },
  { circuitId: 14, marker: 120, s: 0.7059, segment: 'straight' },
  { circuitId: 14, marker: 121, s: 0.7118, segment: 'chicane' },
  { circuitId: 14, marker: 122, s: 0.7176, segment: 'corner' },
  { circuitId: 14, marker: 123, s: 0.7235, segment: 'corner' },
  { circuitId: 14, marker: 124, s: 0.7294, segment: 'corner' },
  { circuitId: 14, marker: 125, s: 0.7353, segment: 'straight' },
  { circuitId: 14, marker: 126, s: 0.7412, segment: 'hairpin' },
  { circuitId: 14, marker: 127, s: 0.7471, segment: 'corner' },
  { circuitId: 14, marker: 128, s: 0.7529, segment: 'corner' },
  { circuitId: 14, marker: 129, s: 0.7588, segment: 'corner' },
  { circuitId: 14, marker: 130, s: 0.7647, segment: 'straight' },
  { circuitId: 14, marker: 131, s: 0.7706, segment: 'corner' },
  { circuitId: 14, marker: 132, s: 0.7765, segment: 'chicane' },
  { circuitId: 14, marker: 133, s: 0.7824, segment: 'hairpin' },
  { circuitId: 14, marker: 134, s: 0.7882, segment: 'corner' },
  { circuitId: 14, marker: 135, s: 0.7941, segment: 'straight' },
  { circuitId: 14, marker: 136, s: 0.8000, segment: 'corner' },
  { circuitId: 14, marker: 137, s: 0.8059, segment: 'corner' },
  { circuitId: 14, marker: 138, s: 0.8118, segment: 'corner' },
  { circuitId: 14, marker: 139, s: 0.8176, segment: 'corner' },
  { circuitId: 14, marker: 140, s: 0.8235, segment: 'hairpin' },
  { circuitId: 14, marker: 141, s: 0.8294, segment: 'corner' },
  { circuitId: 14, marker: 142, s: 0.8353, segment: 'corner' },
  { circuitId: 14, marker: 143, s: 0.8412, segment: 'chicane' },
  { circuitId: 14, marker: 144, s: 0.8471, segment: 'corner' },
  { circuitId: 14, marker: 145, s: 0.8529, segment: 'straight' },
  { circuitId: 14, marker: 146, s: 0.8588, segment: 'corner' },
  { circuitId: 14, marker: 147, s: 0.8647, segment: 'hairpin' },
  { circuitId: 14, marker: 148, s: 0.8706, segment: 'corner' },
  { circuitId: 14, marker: 149, s: 0.8765, segment: 'corner' },
  { circuitId: 14, marker: 150, s: 0.8824, segment: 'straight' },
  { circuitId: 14, marker: 151, s: 0.8882, segment: 'corner' },
  { circuitId: 14, marker: 152, s: 0.8941, segment: 'corner' },
  { circuitId: 14, marker: 153, s: 0.9000, segment: 'corner' },
  { circuitId: 14, marker: 154, s: 0.9059, segment: 'chicane' },
  { circuitId: 14, marker: 155, s: 0.9118, segment: 'straight' },
  { circuitId: 14, marker: 156, s: 0.9176, segment: 'corner' },
  { circuitId: 14, marker: 157, s: 0.9235, segment: 'corner' },
  { circuitId: 14, marker: 158, s: 0.9294, segment: 'corner' },
  { circuitId: 14, marker: 159, s: 0.9353, segment: 'corner' },
  { circuitId: 14, marker: 160, s: 0.9412, segment: 'straight' },
  { circuitId: 14, marker: 161, s: 0.9471, segment: 'hairpin' },
  { circuitId: 14, marker: 162, s: 0.9529, segment: 'corner' },
  { circuitId: 14, marker: 163, s: 0.9588, segment: 'corner' },
  { circuitId: 14, marker: 164, s: 0.9647, segment: 'corner' },
  { circuitId: 14, marker: 165, s: 0.9706, segment: 'chicane' },
  { circuitId: 14, marker: 166, s: 0.9765, segment: 'corner' },
  { circuitId: 14, marker: 167, s: 0.9824, segment: 'corner' },
  { circuitId: 14, marker: 168, s: 0.9882, segment: 'hairpin' },
  { circuitId: 14, marker: 169, s: 0.9941, segment: 'corner' },
  { circuitId: 15, marker: 0, s: 0.0000, segment: 'chicane' },
  { circuitId: 15, marker: 1, s: 0.0059, segment: 'corner' },
  { circuitId: 15, marker: 2, s: 0.0118, segment: 'corner' },
  { circuitId: 15, marker: 3, s: 0.0176, segment: 'corner' },
  { circuitId: 15, marker: 4, s: 0.0235, segment: 'corner' },
  { circuitId: 15, marker: 5, s: 0.0294, segment: 'straight' },
  { circuitId: 15, marker: 6, s: 0.0353, segment: 'corner' },
  { circuitId: 15, marker: 7, s: 0.0412, segment: 'hairpin' },
  { circuitId: 15, marker: 8, s: 0.0471, segment: 'corner' },
  { circuitId: 15, marker: 9, s: 0.0529, segment: 'corner' },
  { circuitId: 15, marker: 10, s: 0.0588, segment: 'straight' },
  { circuitId: 15, marker: 11, s: 0.0647, segment: 'chicane' },
  { circuitId: 15, marker: 12, s: 0.0706, segment: 'corner' },
  { circuitId: 15, marker: 13, s: 0.0765, segment: 'corner' },
  { circuitId: 15, marker: 14, s: 0.0824, segment: 'hairpin' },
  { circuitId: 15, marker: 15, s: 0.0882, segment: 'straight' },
  { circuitId: 15, marker: 16, s: 0.0941, segment: 'corner' },
  { circuitId: 15, marker: 17, s: 0.1000, segment: 'corner' },
  { circuitId: 15, marker: 18, s: 0.1059, segment: 'corner' },
  { circuitId: 15, marker: 19, s: 0.1118, segment: 'corner' },
  { circuitId: 15, marker: 20, s: 0.1176, segment: 'straight' },
  { circuitId: 15, marker: 21, s: 0.1235, segment: 'hairpin' },
  { circuitId: 15, marker: 22, s: 0.1294, segment: 'chicane' },
  { circuitId: 15, marker: 23, s: 0.1353, segment: 'corner' },
  { circuitId: 15, marker: 24, s: 0.1412, segment: 'corner' },
  { circuitId: 15, marker: 25, s: 0.1471, segment: 'straight' },
  { circuitId: 15, marker: 26, s: 0.1529, segment: 'corner' },
  { circuitId: 15, marker: 27, s: 0.1588, segment: 'corner' },
  { circuitId: 15, marker: 28, s: 0.1647, segment: 'hairpin' },
  { circuitId: 15, marker: 29, s: 0.1706, segment: 'corner' },
  { circuitId: 15, marker: 30, s: 0.1765, segment: 'straight' },
  { circuitId: 15, marker: 31, s: 0.1824, segment: 'corner' },
  { circuitId: 15, marker: 32, s: 0.1882, segment: 'corner' },
  { circuitId: 15, marker: 33, s: 0.1941, segment: 'chicane' },
  { circuitId: 15, marker: 34, s: 0.2000, segment: 'corner' },
  { circuitId: 15, marker: 35, s: 0.2059, segment: 'hairpin' },
  { circuitId: 15, marker: 36, s: 0.2118, segment: 'corner' },
  { circuitId: 15, marker: 37, s: 0.2176, segment: 'corner' },
  { circuitId: 15, marker: 38, s: 0.2235, segment: 'corner' },
  { circuitId: 15, marker: 39, s: 0.2294, segment: 'corner' },
  { circuitId: 15, marker: 40, s: 0.2353, segment: 'straight' },
  { circuitId: 15, marker: 41, s: 0.2412, segment: 'corner' },
  { circuitId: 15, marker: 42, s: 0.2471, segment: 'hairpin' },
  { circuitId: 15, marker: 43, s: 0.2529, segment: 'corner' },
  { circuitId: 15, marker: 44, s: 0.2588, segment: 'chicane' },
  { circuitId: 15, marker: 45, s: 0.2647, segment: 'straight' },
  { circuitId: 15, marker: 46, s: 0.2706, segment: 'corner' },
  { circuitId: 15, marker: 47, s: 0.2765, segment: 'corner' },
  { circuitId: 15, marker: 48, s: 0.2824, segment: 'corner' },
  { circuitId: 15, marker: 49, s: 0.2882, segment: 'hairpin' },
  { circuitId: 15, marker: 50, s: 0.2941, segment: 'straight' },
  { circuitId: 15, marker: 51, s: 0.3000, segment: 'corner' },
  { circuitId: 15, marker: 52, s: 0.3059, segment: 'corner' },
  { circuitId: 15, marker: 53, s: 0.3118, segment: 'corner' },
  { circuitId: 15, marker: 54, s: 0.3176, segment: 'corner' },
  { circuitId: 15, marker: 55, s: 0.3235, segment: 'chicane' },
  { circuitId: 15, marker: 56, s: 0.3294, segment: 'hairpin' },
  { circuitId: 15, marker: 57, s: 0.3353, segment: 'corner' },
  { circuitId: 15, marker: 58, s: 0.3412, segment: 'corner' },
  { circuitId: 15, marker: 59, s: 0.3471, segment: 'corner' },
  { circuitId: 15, marker: 60, s: 0.3529, segment: 'straight' },
  { circuitId: 15, marker: 61, s: 0.3588, segment: 'corner' },
  { circuitId: 15, marker: 62, s: 0.3647, segment: 'corner' },
  { circuitId: 15, marker: 63, s: 0.3706, segment: 'hairpin' },
  { circuitId: 15, marker: 64, s: 0.3765, segment: 'corner' },
  { circuitId: 15, marker: 65, s: 0.3824, segment: 'straight' },
  { circuitId: 15, marker: 66, s: 0.3882, segment: 'chicane' },
  { circuitId: 15, marker: 67, s: 0.3941, segment: 'corner' },
  { circuitId: 15, marker: 68, s: 0.4000, segment: 'corner' },
  { circuitId: 15, marker: 69, s: 0.4059, segment: 'corner' },
  { circuitId: 15, marker: 70, s: 0.4118, segment: 'hairpin' },
  { circuitId: 15, marker: 71, s: 0.4176, segment: 'corner' },
  { circuitId: 15, marker: 72, s: 0.4235, segment: 'corner' },
  { circuitId: 15, marker: 73, s: 0.4294, segment: 'corner' },
  { circuitId: 15, marker: 74, s: 0.4353, segment: 'corner' },
  { circuitId: 15, marker: 75, s: 0.4412, segment: 'straight' },
  { circuitId: 15, marker: 76, s: 0.4471, segment: 'corner' },
  { circuitId: 15, marker: 77, s: 0.4529, segment: 'chicane' },
  { circuitId: 15, marker: 78, s: 0.4588, segment: 'corner' },
  { circuitId: 15, marker: 79, s: 0.4647, segment: 'corner' },
  { circuitId: 15, marker: 80, s: 0.4706, segment: 'straight' },
  { circuitId: 15, marker: 81, s: 0.4765, segment: 'corner' },
  { circuitId: 15, marker: 82, s: 0.4824, segment: 'corner' },
  { circuitId: 15, marker: 83, s: 0.4882, segment: 'corner' },
  { circuitId: 15, marker: 84, s: 0.4941, segment: 'hairpin' },
  { circuitId: 15, marker: 85, s: 0.5000, segment: 'straight' },
  { circuitId: 15, marker: 86, s: 0.5059, segment: 'corner' },
  { circuitId: 15, marker: 87, s: 0.5118, segment: 'corner' },
  { circuitId: 15, marker: 88, s: 0.5176, segment: 'chicane' },
  { circuitId: 15, marker: 89, s: 0.5235, segment: 'corner' },
  { circuitId: 15, marker: 90, s: 0.5294, segment: 'straight' },
  { circuitId: 15, marker: 91, s: 0.5353, segment: 'hairpin' },
  { circuitId: 15, marker: 92, s: 0.5412, segment: 'corner' },
  { circuitId: 15, marker: 93, s: 0.5471, segment: 'corner' },
  { circuitId: 15, marker: 94, s: 0.5529, segment: 'corner' },
  { circuitId: 15, marker: 95, s: 0.5588, segment: 'straight' },
  { circuitId: 15, marker: 96, s: 0.5647, segment: 'corner' },
  { circuitId: 15, marker: 97, s: 0.5706, segment: 'corner' },
  { circuitId: 15, marker: 98, s: 0.5765, segment: 'hairpin' },
  { circuitId: 15, marker: 99, s: 0.5824, segment: 'chicane' },
  { circuitId: 15, marker: 100, s: 0.5882, segment: 'straight' },
  { circuitId: 15, marker: 101, s: 0.5941, segment: 'corner' },
  { circuitId: 15, marker: 102, s: 0.6000, segment: 'corner' },
  { circuitId: 15, marker: 103, s: 0.6059, segment: 'corner' },
  { circuitId: 15, marker: 104, s: 0.6118, segment: 'corner' },
  { circuitId: 15, marker: 105, s: 0.6176, segment: 'hairpin' },
  { circuitId: 15, marker: 106, s: 0.6235, segment: 'corner' },
  { circuitId: 15, marker: 107, s: 0.6294, segment: 'corner' },
  { circuitId: 15, marker: 108, s: 0.6353, segment: 'corner' },
  { circuitId: 15, marker: 109, s: 0.6412, segment: 'corner' },
  { circuitId: 15, marker: 110, s: 0.6471, segment: 'chicane' },
  { circuitId: 15, marker: 111, s: 0.6529, segment: 'corner' },
  { circuitId: 15, marker: 112, s: 0.6588, segment: 'hairpin' },
  { circuitId: 15, marker: 113, s: 0.6647, segment: 'corner' },
  { circuitId: 15, marker: 114, s: 0.6706, segment: 'corner' },
  { circuitId: 15, marker: 115, s: 0.6765, segment: 'straight' },
  { circuitId: 15, marker: 116, s: 0.6824, segment: 'corner' },
  { circuitId: 15, marker: 117, s: 0.6882, segment: 'corner' },
  { circuitId: 15, marker: 118, s: 0.6941, segment: 'corner' },
  { circuitId: 15, marker: 119, s: 0.7000, segment: 'hairpin' },
  { circuitId: 15, marker: 120, s: 0.7059, segment: 'straight' },
  { circuitId: 15, marker: 121, s: 0.7118, segment: 'chicane' },
  { circuitId: 15, marker: 122, s: 0.7176, segment: 'corner' },
  { circuitId: 15, marker: 123, s: 0.7235, segment: 'corner' },
  { circuitId: 15, marker: 124, s: 0.7294, segment: 'corner' },
  { circuitId: 15, marker: 125, s: 0.7353, segment: 'straight' },
  { circuitId: 15, marker: 126, s: 0.7412, segment: 'hairpin' },
  { circuitId: 15, marker: 127, s: 0.7471, segment: 'corner' },
  { circuitId: 15, marker: 128, s: 0.7529, segment: 'corner' },
  { circuitId: 15, marker: 129, s: 0.7588, segment: 'corner' },
  { circuitId: 15, marker: 130, s: 0.7647, segment: 'straight' },
  { circuitId: 15, marker: 131, s: 0.7706, segment: 'corner' },
  { circuitId: 15, marker: 132, s: 0.7765, segment: 'chicane' },
  { circuitId: 15, marker: 133, s: 0.7824, segment: 'hairpin' },
  { circuitId: 15, marker: 134, s: 0.7882, segment: 'corner' },
  { circuitId: 15, marker: 135, s: 0.7941, segment: 'straight' },
  { circuitId: 15, marker: 136, s: 0.8000, segment: 'corner' },
  { circuitId: 15, marker: 137, s: 0.8059, segment: 'corner' },
  { circuitId: 15, marker: 138, s: 0.8118, segment: 'corner' },
  { circuitId: 15, marker: 139, s: 0.8176, segment: 'corner' },
  { circuitId: 15, marker: 140, s: 0.8235, segment: 'hairpin' },
  { circuitId: 15, marker: 141, s: 0.8294, segment: 'corner' },
  { circuitId: 15, marker: 142, s: 0.8353, segment: 'corner' },
  { circuitId: 15, marker: 143, s: 0.8412, segment: 'chicane' },
  { circuitId: 15, marker: 144, s: 0.8471, segment: 'corner' },
  { circuitId: 15, marker: 145, s: 0.8529, segment: 'straight' },
  { circuitId: 15, marker: 146, s: 0.8588, segment: 'corner' },
  { circuitId: 15, marker: 147, s: 0.8647, segment: 'hairpin' },
  { circuitId: 15, marker: 148, s: 0.8706, segment: 'corner' },
  { circuitId: 15, marker: 149, s: 0.8765, segment: 'corner' },
  { circuitId: 15, marker: 150, s: 0.8824, segment: 'straight' },
  { circuitId: 15, marker: 151, s: 0.8882, segment: 'corner' },
  { circuitId: 15, marker: 152, s: 0.8941, segment: 'corner' },
  { circuitId: 15, marker: 153, s: 0.9000, segment: 'corner' },
  { circuitId: 15, marker: 154, s: 0.9059, segment: 'chicane' },
  { circuitId: 15, marker: 155, s: 0.9118, segment: 'straight' },
  { circuitId: 15, marker: 156, s: 0.9176, segment: 'corner' },
  { circuitId: 15, marker: 157, s: 0.9235, segment: 'corner' },
  { circuitId: 15, marker: 158, s: 0.9294, segment: 'corner' },
  { circuitId: 15, marker: 159, s: 0.9353, segment: 'corner' },
  { circuitId: 15, marker: 160, s: 0.9412, segment: 'straight' },
  { circuitId: 15, marker: 161, s: 0.9471, segment: 'hairpin' },
  { circuitId: 15, marker: 162, s: 0.9529, segment: 'corner' },
  { circuitId: 15, marker: 163, s: 0.9588, segment: 'corner' },
  { circuitId: 15, marker: 164, s: 0.9647, segment: 'corner' },
  { circuitId: 15, marker: 165, s: 0.9706, segment: 'chicane' },
  { circuitId: 15, marker: 166, s: 0.9765, segment: 'corner' },
  { circuitId: 15, marker: 167, s: 0.9824, segment: 'corner' },
  { circuitId: 15, marker: 168, s: 0.9882, segment: 'hairpin' },
  { circuitId: 15, marker: 169, s: 0.9941, segment: 'corner' },
  { circuitId: 16, marker: 0, s: 0.0000, segment: 'chicane' },
  { circuitId: 16, marker: 1, s: 0.0059, segment: 'corner' },
  { circuitId: 16, marker: 2, s: 0.0118, segment: 'corner' },
  { circuitId: 16, marker: 3, s: 0.0176, segment: 'corner' },
  { circuitId: 16, marker: 4, s: 0.0235, segment: 'corner' },
  { circuitId: 16, marker: 5, s: 0.0294, segment: 'straight' },
  { circuitId: 16, marker: 6, s: 0.0353, segment: 'corner' },
  { circuitId: 16, marker: 7, s: 0.0412, segment: 'hairpin' },
  { circuitId: 16, marker: 8, s: 0.0471, segment: 'corner' },
  { circuitId: 16, marker: 9, s: 0.0529, segment: 'corner' },
  { circuitId: 16, marker: 10, s: 0.0588, segment: 'straight' },
  { circuitId: 16, marker: 11, s: 0.0647, segment: 'chicane' },
  { circuitId: 16, marker: 12, s: 0.0706, segment: 'corner' },
  { circuitId: 16, marker: 13, s: 0.0765, segment: 'corner' },
  { circuitId: 16, marker: 14, s: 0.0824, segment: 'hairpin' },
  { circuitId: 16, marker: 15, s: 0.0882, segment: 'straight' },
  { circuitId: 16, marker: 16, s: 0.0941, segment: 'corner' },
  { circuitId: 16, marker: 17, s: 0.1000, segment: 'corner' },
  { circuitId: 16, marker: 18, s: 0.1059, segment: 'corner' },
  { circuitId: 16, marker: 19, s: 0.1118, segment: 'corner' },
  { circuitId: 16, marker: 20, s: 0.1176, segment: 'straight' },
  { circuitId: 16, marker: 21, s: 0.1235, segment: 'hairpin' },
  { circuitId: 16, marker: 22, s: 0.1294, segment: 'chicane' },
  { circuitId: 16, marker: 23, s: 0.1353, segment: 'corner' },
  { circuitId: 16, marker: 24, s: 0.1412, segment: 'corner' },
  { circuitId: 16, marker: 25, s: 0.1471, segment: 'straight' },
  { circuitId: 16, marker: 26, s: 0.1529, segment: 'corner' },
  { circuitId: 16, marker: 27, s: 0.1588, segment: 'corner' },
  { circuitId: 16, marker: 28, s: 0.1647, segment: 'hairpin' },
  { circuitId: 16, marker: 29, s: 0.1706, segment: 'corner' },
  { circuitId: 16, marker: 30, s: 0.1765, segment: 'straight' },
  { circuitId: 16, marker: 31, s: 0.1824, segment: 'corner' },
  { circuitId: 16, marker: 32, s: 0.1882, segment: 'corner' },
  { circuitId: 16, marker: 33, s: 0.1941, segment: 'chicane' },
  { circuitId: 16, marker: 34, s: 0.2000, segment: 'corner' },
  { circuitId: 16, marker: 35, s: 0.2059, segment: 'hairpin' },
  { circuitId: 16, marker: 36, s: 0.2118, segment: 'corner' },
  { circuitId: 16, marker: 37, s: 0.2176, segment: 'corner' },
  { circuitId: 16, marker: 38, s: 0.2235, segment: 'corner' },
  { circuitId: 16, marker: 39, s: 0.2294, segment: 'corner' },
  { circuitId: 16, marker: 40, s: 0.2353, segment: 'straight' },
  { circuitId: 16, marker: 41, s: 0.2412, segment: 'corner' },
  { circuitId: 16, marker: 42, s: 0.2471, segment: 'hairpin' },
  { circuitId: 16, marker: 43, s: 0.2529, segment: 'corner' },
  { circuitId: 16, marker: 44, s: 0.2588, segment: 'chicane' },
  { circuitId: 16, marker: 45, s: 0.2647, segment: 'straight' },
  { circuitId: 16, marker: 46, s: 0.2706, segment: 'corner' },
  { circuitId: 16, marker: 47, s: 0.2765, segment: 'corner' },
  { circuitId: 16, marker: 48, s: 0.2824, segment: 'corner' },
  { circuitId: 16, marker: 49, s: 0.2882, segment: 'hairpin' },
  { circuitId: 16, marker: 50, s: 0.2941, segment: 'straight' },
  { circuitId: 16, marker: 51, s: 0.3000, segment: 'corner' },
  { circuitId: 16, marker: 52, s: 0.3059, segment: 'corner' },
  { circuitId: 16, marker: 53, s: 0.3118, segment: 'corner' },
  { circuitId: 16, marker: 54, s: 0.3176, segment: 'corner' },
  { circuitId: 16, marker: 55, s: 0.3235, segment: 'chicane' },
  { circuitId: 16, marker: 56, s: 0.3294, segment: 'hairpin' },
  { circuitId: 16, marker: 57, s: 0.3353, segment: 'corner' },
  { circuitId: 16, marker: 58, s: 0.3412, segment: 'corner' },
  { circuitId: 16, marker: 59, s: 0.3471, segment: 'corner' },
  { circuitId: 16, marker: 60, s: 0.3529, segment: 'straight' },
  { circuitId: 16, marker: 61, s: 0.3588, segment: 'corner' },
  { circuitId: 16, marker: 62, s: 0.3647, segment: 'corner' },
  { circuitId: 16, marker: 63, s: 0.3706, segment: 'hairpin' },
  { circuitId: 16, marker: 64, s: 0.3765, segment: 'corner' },
  { circuitId: 16, marker: 65, s: 0.3824, segment: 'straight' },
  { circuitId: 16, marker: 66, s: 0.3882, segment: 'chicane' },
  { circuitId: 16, marker: 67, s: 0.3941, segment: 'corner' },
  { circuitId: 16, marker: 68, s: 0.4000, segment: 'corner' },
  { circuitId: 16, marker: 69, s: 0.4059, segment: 'corner' },
  { circuitId: 16, marker: 70, s: 0.4118, segment: 'hairpin' },
  { circuitId: 16, marker: 71, s: 0.4176, segment: 'corner' },
  { circuitId: 16, marker: 72, s: 0.4235, segment: 'corner' },
  { circuitId: 16, marker: 73, s: 0.4294, segment: 'corner' },
  { circuitId: 16, marker: 74, s: 0.4353, segment: 'corner' },
  { circuitId: 16, marker: 75, s: 0.4412, segment: 'straight' },
  { circuitId: 16, marker: 76, s: 0.4471, segment: 'corner' },
  { circuitId: 16, marker: 77, s: 0.4529, segment: 'chicane' },
  { circuitId: 16, marker: 78, s: 0.4588, segment: 'corner' },
  { circuitId: 16, marker: 79, s: 0.4647, segment: 'corner' },
  { circuitId: 16, marker: 80, s: 0.4706, segment: 'straight' },
  { circuitId: 16, marker: 81, s: 0.4765, segment: 'corner' },
  { circuitId: 16, marker: 82, s: 0.4824, segment: 'corner' },
  { circuitId: 16, marker: 83, s: 0.4882, segment: 'corner' },
  { circuitId: 16, marker: 84, s: 0.4941, segment: 'hairpin' },
  { circuitId: 16, marker: 85, s: 0.5000, segment: 'straight' },
  { circuitId: 16, marker: 86, s: 0.5059, segment: 'corner' },
  { circuitId: 16, marker: 87, s: 0.5118, segment: 'corner' },
  { circuitId: 16, marker: 88, s: 0.5176, segment: 'chicane' },
  { circuitId: 16, marker: 89, s: 0.5235, segment: 'corner' },
  { circuitId: 16, marker: 90, s: 0.5294, segment: 'straight' },
  { circuitId: 16, marker: 91, s: 0.5353, segment: 'hairpin' },
  { circuitId: 16, marker: 92, s: 0.5412, segment: 'corner' },
  { circuitId: 16, marker: 93, s: 0.5471, segment: 'corner' },
  { circuitId: 16, marker: 94, s: 0.5529, segment: 'corner' },
  { circuitId: 16, marker: 95, s: 0.5588, segment: 'straight' },
  { circuitId: 16, marker: 96, s: 0.5647, segment: 'corner' },
  { circuitId: 16, marker: 97, s: 0.5706, segment: 'corner' },
  { circuitId: 16, marker: 98, s: 0.5765, segment: 'hairpin' },
  { circuitId: 16, marker: 99, s: 0.5824, segment: 'chicane' },
  { circuitId: 16, marker: 100, s: 0.5882, segment: 'straight' },
  { circuitId: 16, marker: 101, s: 0.5941, segment: 'corner' },
  { circuitId: 16, marker: 102, s: 0.6000, segment: 'corner' },
  { circuitId: 16, marker: 103, s: 0.6059, segment: 'corner' },
  { circuitId: 16, marker: 104, s: 0.6118, segment: 'corner' },
  { circuitId: 16, marker: 105, s: 0.6176, segment: 'hairpin' },
  { circuitId: 16, marker: 106, s: 0.6235, segment: 'corner' },
  { circuitId: 16, marker: 107, s: 0.6294, segment: 'corner' },
  { circuitId: 16, marker: 108, s: 0.6353, segment: 'corner' },
  { circuitId: 16, marker: 109, s: 0.6412, segment: 'corner' },
  { circuitId: 16, marker: 110, s: 0.6471, segment: 'chicane' },
  { circuitId: 16, marker: 111, s: 0.6529, segment: 'corner' },
  { circuitId: 16, marker: 112, s: 0.6588, segment: 'hairpin' },
  { circuitId: 16, marker: 113, s: 0.6647, segment: 'corner' },
  { circuitId: 16, marker: 114, s: 0.6706, segment: 'corner' },
  { circuitId: 16, marker: 115, s: 0.6765, segment: 'straight' },
  { circuitId: 16, marker: 116, s: 0.6824, segment: 'corner' },
  { circuitId: 16, marker: 117, s: 0.6882, segment: 'corner' },
  { circuitId: 16, marker: 118, s: 0.6941, segment: 'corner' },
  { circuitId: 16, marker: 119, s: 0.7000, segment: 'hairpin' },
  { circuitId: 16, marker: 120, s: 0.7059, segment: 'straight' },
  { circuitId: 16, marker: 121, s: 0.7118, segment: 'chicane' },
  { circuitId: 16, marker: 122, s: 0.7176, segment: 'corner' },
  { circuitId: 16, marker: 123, s: 0.7235, segment: 'corner' },
  { circuitId: 16, marker: 124, s: 0.7294, segment: 'corner' },
  { circuitId: 16, marker: 125, s: 0.7353, segment: 'straight' },
  { circuitId: 16, marker: 126, s: 0.7412, segment: 'hairpin' },
  { circuitId: 16, marker: 127, s: 0.7471, segment: 'corner' },
  { circuitId: 16, marker: 128, s: 0.7529, segment: 'corner' },
  { circuitId: 16, marker: 129, s: 0.7588, segment: 'corner' },
  { circuitId: 16, marker: 130, s: 0.7647, segment: 'straight' },
  { circuitId: 16, marker: 131, s: 0.7706, segment: 'corner' },
  { circuitId: 16, marker: 132, s: 0.7765, segment: 'chicane' },
  { circuitId: 16, marker: 133, s: 0.7824, segment: 'hairpin' },
  { circuitId: 16, marker: 134, s: 0.7882, segment: 'corner' },
  { circuitId: 16, marker: 135, s: 0.7941, segment: 'straight' },
  { circuitId: 16, marker: 136, s: 0.8000, segment: 'corner' },
  { circuitId: 16, marker: 137, s: 0.8059, segment: 'corner' },
  { circuitId: 16, marker: 138, s: 0.8118, segment: 'corner' },
  { circuitId: 16, marker: 139, s: 0.8176, segment: 'corner' },
  { circuitId: 16, marker: 140, s: 0.8235, segment: 'hairpin' },
  { circuitId: 16, marker: 141, s: 0.8294, segment: 'corner' },
  { circuitId: 16, marker: 142, s: 0.8353, segment: 'corner' },
  { circuitId: 16, marker: 143, s: 0.8412, segment: 'chicane' },
  { circuitId: 16, marker: 144, s: 0.8471, segment: 'corner' },
  { circuitId: 16, marker: 145, s: 0.8529, segment: 'straight' },
  { circuitId: 16, marker: 146, s: 0.8588, segment: 'corner' },
  { circuitId: 16, marker: 147, s: 0.8647, segment: 'hairpin' },
  { circuitId: 16, marker: 148, s: 0.8706, segment: 'corner' },
  { circuitId: 16, marker: 149, s: 0.8765, segment: 'corner' },
  { circuitId: 16, marker: 150, s: 0.8824, segment: 'straight' },
  { circuitId: 16, marker: 151, s: 0.8882, segment: 'corner' },
  { circuitId: 16, marker: 152, s: 0.8941, segment: 'corner' },
  { circuitId: 16, marker: 153, s: 0.9000, segment: 'corner' },
  { circuitId: 16, marker: 154, s: 0.9059, segment: 'chicane' },
  { circuitId: 16, marker: 155, s: 0.9118, segment: 'straight' },
  { circuitId: 16, marker: 156, s: 0.9176, segment: 'corner' },
  { circuitId: 16, marker: 157, s: 0.9235, segment: 'corner' },
  { circuitId: 16, marker: 158, s: 0.9294, segment: 'corner' },
  { circuitId: 16, marker: 159, s: 0.9353, segment: 'corner' },
  { circuitId: 16, marker: 160, s: 0.9412, segment: 'straight' },
  { circuitId: 16, marker: 161, s: 0.9471, segment: 'hairpin' },
  { circuitId: 16, marker: 162, s: 0.9529, segment: 'corner' },
  { circuitId: 16, marker: 163, s: 0.9588, segment: 'corner' },
  { circuitId: 16, marker: 164, s: 0.9647, segment: 'corner' },
  { circuitId: 16, marker: 165, s: 0.9706, segment: 'chicane' },
  { circuitId: 16, marker: 166, s: 0.9765, segment: 'corner' },
  { circuitId: 16, marker: 167, s: 0.9824, segment: 'corner' },
  { circuitId: 16, marker: 168, s: 0.9882, segment: 'hairpin' },
  { circuitId: 16, marker: 169, s: 0.9941, segment: 'corner' },
  { circuitId: 17, marker: 0, s: 0.0000, segment: 'chicane' },
  { circuitId: 17, marker: 1, s: 0.0059, segment: 'corner' },
  { circuitId: 17, marker: 2, s: 0.0118, segment: 'corner' },
  { circuitId: 17, marker: 3, s: 0.0176, segment: 'corner' },
  { circuitId: 17, marker: 4, s: 0.0235, segment: 'corner' },
  { circuitId: 17, marker: 5, s: 0.0294, segment: 'straight' },
  { circuitId: 17, marker: 6, s: 0.0353, segment: 'corner' },
  { circuitId: 17, marker: 7, s: 0.0412, segment: 'hairpin' },
  { circuitId: 17, marker: 8, s: 0.0471, segment: 'corner' },
  { circuitId: 17, marker: 9, s: 0.0529, segment: 'corner' },
  { circuitId: 17, marker: 10, s: 0.0588, segment: 'straight' },
  { circuitId: 17, marker: 11, s: 0.0647, segment: 'chicane' },
  { circuitId: 17, marker: 12, s: 0.0706, segment: 'corner' },
  { circuitId: 17, marker: 13, s: 0.0765, segment: 'corner' },
  { circuitId: 17, marker: 14, s: 0.0824, segment: 'hairpin' },
  { circuitId: 17, marker: 15, s: 0.0882, segment: 'straight' },
  { circuitId: 17, marker: 16, s: 0.0941, segment: 'corner' },
  { circuitId: 17, marker: 17, s: 0.1000, segment: 'corner' },
  { circuitId: 17, marker: 18, s: 0.1059, segment: 'corner' },
  { circuitId: 17, marker: 19, s: 0.1118, segment: 'corner' },
  { circuitId: 17, marker: 20, s: 0.1176, segment: 'straight' },
  { circuitId: 17, marker: 21, s: 0.1235, segment: 'hairpin' },
  { circuitId: 17, marker: 22, s: 0.1294, segment: 'chicane' },
  { circuitId: 17, marker: 23, s: 0.1353, segment: 'corner' },
  { circuitId: 17, marker: 24, s: 0.1412, segment: 'corner' },
  { circuitId: 17, marker: 25, s: 0.1471, segment: 'straight' },
  { circuitId: 17, marker: 26, s: 0.1529, segment: 'corner' },
  { circuitId: 17, marker: 27, s: 0.1588, segment: 'corner' },
  { circuitId: 17, marker: 28, s: 0.1647, segment: 'hairpin' },
  { circuitId: 17, marker: 29, s: 0.1706, segment: 'corner' },
  { circuitId: 17, marker: 30, s: 0.1765, segment: 'straight' },
  { circuitId: 17, marker: 31, s: 0.1824, segment: 'corner' },
  { circuitId: 17, marker: 32, s: 0.1882, segment: 'corner' },
  { circuitId: 17, marker: 33, s: 0.1941, segment: 'chicane' },
  { circuitId: 17, marker: 34, s: 0.2000, segment: 'corner' },
  { circuitId: 17, marker: 35, s: 0.2059, segment: 'hairpin' },
  { circuitId: 17, marker: 36, s: 0.2118, segment: 'corner' },
  { circuitId: 17, marker: 37, s: 0.2176, segment: 'corner' },
  { circuitId: 17, marker: 38, s: 0.2235, segment: 'corner' },
  { circuitId: 17, marker: 39, s: 0.2294, segment: 'corner' },
  { circuitId: 17, marker: 40, s: 0.2353, segment: 'straight' },
  { circuitId: 17, marker: 41, s: 0.2412, segment: 'corner' },
  { circuitId: 17, marker: 42, s: 0.2471, segment: 'hairpin' },
  { circuitId: 17, marker: 43, s: 0.2529, segment: 'corner' },
  { circuitId: 17, marker: 44, s: 0.2588, segment: 'chicane' },
  { circuitId: 17, marker: 45, s: 0.2647, segment: 'straight' },
  { circuitId: 17, marker: 46, s: 0.2706, segment: 'corner' },
  { circuitId: 17, marker: 47, s: 0.2765, segment: 'corner' },
  { circuitId: 17, marker: 48, s: 0.2824, segment: 'corner' },
  { circuitId: 17, marker: 49, s: 0.2882, segment: 'hairpin' },
  { circuitId: 17, marker: 50, s: 0.2941, segment: 'straight' },
  { circuitId: 17, marker: 51, s: 0.3000, segment: 'corner' },
  { circuitId: 17, marker: 52, s: 0.3059, segment: 'corner' },
  { circuitId: 17, marker: 53, s: 0.3118, segment: 'corner' },
  { circuitId: 17, marker: 54, s: 0.3176, segment: 'corner' },
  { circuitId: 17, marker: 55, s: 0.3235, segment: 'chicane' },
  { circuitId: 17, marker: 56, s: 0.3294, segment: 'hairpin' },
  { circuitId: 17, marker: 57, s: 0.3353, segment: 'corner' },
  { circuitId: 17, marker: 58, s: 0.3412, segment: 'corner' },
  { circuitId: 17, marker: 59, s: 0.3471, segment: 'corner' },
  { circuitId: 17, marker: 60, s: 0.3529, segment: 'straight' },
  { circuitId: 17, marker: 61, s: 0.3588, segment: 'corner' },
  { circuitId: 17, marker: 62, s: 0.3647, segment: 'corner' },
  { circuitId: 17, marker: 63, s: 0.3706, segment: 'hairpin' },
  { circuitId: 17, marker: 64, s: 0.3765, segment: 'corner' },
  { circuitId: 17, marker: 65, s: 0.3824, segment: 'straight' },
  { circuitId: 17, marker: 66, s: 0.3882, segment: 'chicane' },
  { circuitId: 17, marker: 67, s: 0.3941, segment: 'corner' },
  { circuitId: 17, marker: 68, s: 0.4000, segment: 'corner' },
  { circuitId: 17, marker: 69, s: 0.4059, segment: 'corner' },
  { circuitId: 17, marker: 70, s: 0.4118, segment: 'hairpin' },
  { circuitId: 17, marker: 71, s: 0.4176, segment: 'corner' },
  { circuitId: 17, marker: 72, s: 0.4235, segment: 'corner' },
  { circuitId: 17, marker: 73, s: 0.4294, segment: 'corner' },
  { circuitId: 17, marker: 74, s: 0.4353, segment: 'corner' },
  { circuitId: 17, marker: 75, s: 0.4412, segment: 'straight' },
  { circuitId: 17, marker: 76, s: 0.4471, segment: 'corner' },
  { circuitId: 17, marker: 77, s: 0.4529, segment: 'chicane' },
  { circuitId: 17, marker: 78, s: 0.4588, segment: 'corner' },
  { circuitId: 17, marker: 79, s: 0.4647, segment: 'corner' },
  { circuitId: 17, marker: 80, s: 0.4706, segment: 'straight' },
  { circuitId: 17, marker: 81, s: 0.4765, segment: 'corner' },
  { circuitId: 17, marker: 82, s: 0.4824, segment: 'corner' },
  { circuitId: 17, marker: 83, s: 0.4882, segment: 'corner' },
  { circuitId: 17, marker: 84, s: 0.4941, segment: 'hairpin' },
  { circuitId: 17, marker: 85, s: 0.5000, segment: 'straight' },
  { circuitId: 17, marker: 86, s: 0.5059, segment: 'corner' },
  { circuitId: 17, marker: 87, s: 0.5118, segment: 'corner' },
  { circuitId: 17, marker: 88, s: 0.5176, segment: 'chicane' },
  { circuitId: 17, marker: 89, s: 0.5235, segment: 'corner' },
  { circuitId: 17, marker: 90, s: 0.5294, segment: 'straight' },
  { circuitId: 17, marker: 91, s: 0.5353, segment: 'hairpin' },
  { circuitId: 17, marker: 92, s: 0.5412, segment: 'corner' },
  { circuitId: 17, marker: 93, s: 0.5471, segment: 'corner' },
  { circuitId: 17, marker: 94, s: 0.5529, segment: 'corner' },
  { circuitId: 17, marker: 95, s: 0.5588, segment: 'straight' },
  { circuitId: 17, marker: 96, s: 0.5647, segment: 'corner' },
  { circuitId: 17, marker: 97, s: 0.5706, segment: 'corner' },
  { circuitId: 17, marker: 98, s: 0.5765, segment: 'hairpin' },
  { circuitId: 17, marker: 99, s: 0.5824, segment: 'chicane' },
  { circuitId: 17, marker: 100, s: 0.5882, segment: 'straight' },
  { circuitId: 17, marker: 101, s: 0.5941, segment: 'corner' },
  { circuitId: 17, marker: 102, s: 0.6000, segment: 'corner' },
  { circuitId: 17, marker: 103, s: 0.6059, segment: 'corner' },
  { circuitId: 17, marker: 104, s: 0.6118, segment: 'corner' },
  { circuitId: 17, marker: 105, s: 0.6176, segment: 'hairpin' },
  { circuitId: 17, marker: 106, s: 0.6235, segment: 'corner' },
  { circuitId: 17, marker: 107, s: 0.6294, segment: 'corner' },
  { circuitId: 17, marker: 108, s: 0.6353, segment: 'corner' },
  { circuitId: 17, marker: 109, s: 0.6412, segment: 'corner' },
  { circuitId: 17, marker: 110, s: 0.6471, segment: 'chicane' },
  { circuitId: 17, marker: 111, s: 0.6529, segment: 'corner' },
  { circuitId: 17, marker: 112, s: 0.6588, segment: 'hairpin' },
  { circuitId: 17, marker: 113, s: 0.6647, segment: 'corner' },
  { circuitId: 17, marker: 114, s: 0.6706, segment: 'corner' },
  { circuitId: 17, marker: 115, s: 0.6765, segment: 'straight' },
  { circuitId: 17, marker: 116, s: 0.6824, segment: 'corner' },
  { circuitId: 17, marker: 117, s: 0.6882, segment: 'corner' },
  { circuitId: 17, marker: 118, s: 0.6941, segment: 'corner' },
  { circuitId: 17, marker: 119, s: 0.7000, segment: 'hairpin' },
  { circuitId: 17, marker: 120, s: 0.7059, segment: 'straight' },
  { circuitId: 17, marker: 121, s: 0.7118, segment: 'chicane' },
  { circuitId: 17, marker: 122, s: 0.7176, segment: 'corner' },
  { circuitId: 17, marker: 123, s: 0.7235, segment: 'corner' },
  { circuitId: 17, marker: 124, s: 0.7294, segment: 'corner' },
  { circuitId: 17, marker: 125, s: 0.7353, segment: 'straight' },
  { circuitId: 17, marker: 126, s: 0.7412, segment: 'hairpin' },
  { circuitId: 17, marker: 127, s: 0.7471, segment: 'corner' },
  { circuitId: 17, marker: 128, s: 0.7529, segment: 'corner' },
  { circuitId: 17, marker: 129, s: 0.7588, segment: 'corner' },
  { circuitId: 17, marker: 130, s: 0.7647, segment: 'straight' },
  { circuitId: 17, marker: 131, s: 0.7706, segment: 'corner' },
  { circuitId: 17, marker: 132, s: 0.7765, segment: 'chicane' },
  { circuitId: 17, marker: 133, s: 0.7824, segment: 'hairpin' },
  { circuitId: 17, marker: 134, s: 0.7882, segment: 'corner' },
  { circuitId: 17, marker: 135, s: 0.7941, segment: 'straight' },
  { circuitId: 17, marker: 136, s: 0.8000, segment: 'corner' },
  { circuitId: 17, marker: 137, s: 0.8059, segment: 'corner' },
  { circuitId: 17, marker: 138, s: 0.8118, segment: 'corner' },
  { circuitId: 17, marker: 139, s: 0.8176, segment: 'corner' },
  { circuitId: 17, marker: 140, s: 0.8235, segment: 'hairpin' },
  { circuitId: 17, marker: 141, s: 0.8294, segment: 'corner' },
  { circuitId: 17, marker: 142, s: 0.8353, segment: 'corner' },
  { circuitId: 17, marker: 143, s: 0.8412, segment: 'chicane' },
  { circuitId: 17, marker: 144, s: 0.8471, segment: 'corner' },
  { circuitId: 17, marker: 145, s: 0.8529, segment: 'straight' },
  { circuitId: 17, marker: 146, s: 0.8588, segment: 'corner' },
  { circuitId: 17, marker: 147, s: 0.8647, segment: 'hairpin' },
  { circuitId: 17, marker: 148, s: 0.8706, segment: 'corner' },
  { circuitId: 17, marker: 149, s: 0.8765, segment: 'corner' },
  { circuitId: 17, marker: 150, s: 0.8824, segment: 'straight' },
  { circuitId: 17, marker: 151, s: 0.8882, segment: 'corner' },
  { circuitId: 17, marker: 152, s: 0.8941, segment: 'corner' },
  { circuitId: 17, marker: 153, s: 0.9000, segment: 'corner' },
  { circuitId: 17, marker: 154, s: 0.9059, segment: 'chicane' },
  { circuitId: 17, marker: 155, s: 0.9118, segment: 'straight' },
  { circuitId: 17, marker: 156, s: 0.9176, segment: 'corner' },
  { circuitId: 17, marker: 157, s: 0.9235, segment: 'corner' },
  { circuitId: 17, marker: 158, s: 0.9294, segment: 'corner' },
  { circuitId: 17, marker: 159, s: 0.9353, segment: 'corner' },
  { circuitId: 17, marker: 160, s: 0.9412, segment: 'straight' },
  { circuitId: 17, marker: 161, s: 0.9471, segment: 'hairpin' },
  { circuitId: 17, marker: 162, s: 0.9529, segment: 'corner' },
  { circuitId: 17, marker: 163, s: 0.9588, segment: 'corner' },
  { circuitId: 17, marker: 164, s: 0.9647, segment: 'corner' },
  { circuitId: 17, marker: 165, s: 0.9706, segment: 'chicane' },
  { circuitId: 17, marker: 166, s: 0.9765, segment: 'corner' },
  { circuitId: 17, marker: 167, s: 0.9824, segment: 'corner' },
  { circuitId: 17, marker: 168, s: 0.9882, segment: 'hairpin' },
  { circuitId: 17, marker: 169, s: 0.9941, segment: 'corner' },
];

