# RaceGame2DPro Complete Rewrite — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reescribir completamente `RaceGame2DPro.jsx` y `RaceGame2DPro.css` como un juego de carreras top-down neon/futurista de calidad profesional con 18 circuitos, 3 modos de IA, turbo, clima y efectos visuales neon completos.

**Architecture:** Un único componente React autocontenido con Canvas 2D. Se divide en secciones: constantes/datos (entornos, 18 pistas, perfiles de IA/clima), motor de física (actualización de coches, colisiones, turbo), pipeline de renderizado (fondo, pista con glow, coches con trail, efectos), lógica de carrera (semáforo, vueltas, clasificación), y UI React (setup, HUD, leaderboard DOM).

**Tech Stack:** React 18, Canvas 2D API nativa, CSS BEM con prefijo `.r2p`, Vite

---

## Contexto crítico

- Archivos a reescribir: `src/games/RaceGame2DPro.jsx` y `src/games/RaceGame2DPro.css`
- El componente se llama `RaceGame2DPro` (default export) y NO recibe props
- NO usa react-router-dom ni ninguna librería de juegos
- El CSS usa clase raíz `.r2p` (renombrada del `.race2dpro` actual para mayor limpieza)
- Se renderiza dentro de `GameLaunchModal` — el modal ya tiene botón de cierre, el juego NO necesita botón "Volver"
- El canvas ocupa toda la zona de juego (`width: 100%; height: calc(100vh - 95px)`)

---

### Task 1: CSS completo — tema neon

**Files:**
- Rewrite: `src/games/RaceGame2DPro.css`

Escribe el CSS completo con estas secciones. Usa la clase raíz `.r2p`:

#### 1A — Contenedor principal
```css
.r2p {
  position: relative;
  width: 100%;
  height: calc(100vh - 95px);
  background: #060610;
  overflow: hidden;
  touch-action: none;
  color: rgba(255,255,255,0.93);
  font-family: 'Segoe UI', system-ui, sans-serif;
}
@media (max-width: 768px) { .r2p { height: calc(100vh - 70px); } }
@media (max-width: 520px) { .r2p { height: calc(100vh - 60px); } }
```

#### 1B — Setup screen
```css
/* Overlay centrado */
.r2p__setup {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  background: linear-gradient(135deg, #060610 0%, #0a0a1a 100%);
  overflow-y: auto;
  z-index: 10;
}

.r2p__setupCard {
  width: min(980px, 96vw);
  background: rgba(8,8,20,0.85);
  border: 1px solid rgba(0,245,255,0.18);
  border-radius: 20px;
  box-shadow: 0 0 40px rgba(0,245,255,0.08), 0 24px 60px rgba(0,0,0,0.7);
  backdrop-filter: blur(12px);
  padding: 20px;
}

.r2p__setupTitle {
  font-size: 26px; font-weight: 900;
  background: linear-gradient(90deg, #00f5ff, #bf00ff);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  letter-spacing: 0.5px;
}
.r2p__setupSub { font-size: 13px; color: rgba(255,255,255,0.55); margin-top: 4px; }

/* Divider */
.r2p__setupDivider {
  height: 1px; background: rgba(0,245,255,0.12); margin: 14px 0;
}

/* Section label */
.r2p__sectionLabel {
  font-size: 11px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 1.2px; color: rgba(0,245,255,0.7);
  margin-bottom: 10px;
}

/* Track grid: 6 columns on desktop, 3 on mobile */
.r2p__trackGrid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}
@media (max-width: 768px) { .r2p__trackGrid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 520px) { .r2p__trackGrid { grid-template-columns: repeat(2, 1fr); } }

.r2p__trackCard {
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 12px;
  padding: 8px 6px;
  cursor: pointer;
  transition: border-color 120ms, transform 120ms, box-shadow 120ms;
  background: rgba(255,255,255,0.03);
  display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.r2p__trackCard:hover { transform: translateY(-2px); border-color: rgba(0,245,255,0.35); }
.r2p__trackCard.isActive {
  border-color: #00f5ff;
  box-shadow: 0 0 16px rgba(0,245,255,0.25);
  background: rgba(0,245,255,0.07);
}
.r2p__trackPreview { /* canvas element inside card */
  width: 100%; aspect-ratio: 4/3; border-radius: 8px;
  display: block;
}
.r2p__trackName {
  font-size: 10px; font-weight: 700; text-align: center;
  color: rgba(255,255,255,0.8); line-height: 1.2;
}
.r2p__trackEnv {
  font-size: 9px; text-align: center;
  color: rgba(255,255,255,0.4);
}

/* Options row: weather, difficulty, laps, rivals */
.r2p__optionsRow {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  margin-top: 14px;
}
@media (max-width: 640px) { .r2p__optionsRow { grid-template-columns: repeat(2, 1fr); } }

.r2p__optBlock { display: flex; flex-direction: column; gap: 8px; }

.r2p__choiceGroup { display: flex; gap: 6px; flex-wrap: wrap; }

.r2p__choiceBtn {
  flex: 1; min-width: 60px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.80);
  border-radius: 10px;
  padding: 8px 6px;
  font-size: 12px; font-weight: 700;
  cursor: pointer;
  transition: all 120ms;
  text-align: center;
}
.r2p__choiceBtn:hover { border-color: rgba(0,245,255,0.4); background: rgba(0,245,255,0.06); }
.r2p__choiceBtn.isActive {
  border-color: #00f5ff; color: #00f5ff;
  background: rgba(0,245,255,0.12);
  box-shadow: 0 0 10px rgba(0,245,255,0.2);
}

/* Difficulty colors */
.r2p__choiceBtn.diff-easy.isActive { border-color: #39ff14; color: #39ff14; background: rgba(57,255,20,0.1); box-shadow: 0 0 10px rgba(57,255,20,0.2); }
.r2p__choiceBtn.diff-medium.isActive { border-color: #ffd700; color: #ffd700; background: rgba(255,215,0,0.1); box-shadow: 0 0 10px rgba(255,215,0,0.2); }
.r2p__choiceBtn.diff-hard.isActive { border-color: #ff4500; color: #ff4500; background: rgba(255,69,0,0.1); box-shadow: 0 0 10px rgba(255,69,0,0.2); }

/* Start button */
.r2p__startBtn {
  width: 100%; margin-top: 16px;
  padding: 14px;
  border: none; border-radius: 14px;
  background: linear-gradient(90deg, #00c8d4, #8000cc);
  color: #fff; font-size: 16px; font-weight: 900;
  cursor: pointer; letter-spacing: 0.5px;
  transition: transform 120ms, opacity 120ms;
  box-shadow: 0 0 20px rgba(0,245,255,0.3);
}
.r2p__startBtn:hover { transform: translateY(-1px); opacity: 0.93; }
.r2p__startBtn:active { transform: translateY(0); }
```

#### 1C — HUD en carrera
```css
.r2p__hud {
  position: absolute; top: 10px; left: 10px; right: 10px;
  display: flex; justify-content: space-between; align-items: flex-start;
  pointer-events: none; z-index: 5;
}

.r2p__hudLeft, .r2p__hudRight {
  background: rgba(6,6,16,0.78);
  border: 1px solid rgba(0,245,255,0.18);
  border-radius: 12px; padding: 8px 12px;
  backdrop-filter: blur(8px);
  display: flex; flex-direction: column; gap: 4px;
  min-width: 110px;
}

.r2p__hudPos {
  font-size: 28px; font-weight: 900; color: #00f5ff; line-height: 1;
}
.r2p__hudPosLabel { font-size: 10px; color: rgba(255,255,255,0.5); font-weight: 700; letter-spacing: 0.8px; }
.r2p__hudLap { font-size: 13px; font-weight: 800; color: rgba(255,255,255,0.85); }
.r2p__hudSpeed { font-size: 13px; font-weight: 700; color: #ffd700; }
.r2p__hudWeather { font-size: 12px; color: rgba(255,255,255,0.55); }

/* Turbo bar */
.r2p__turboBar {
  width: 100%; height: 6px; background: rgba(255,255,255,0.1);
  border-radius: 3px; overflow: hidden;
  margin-top: 4px;
}
.r2p__turboFill {
  height: 100%; border-radius: 3px;
  background: linear-gradient(90deg, #00f5ff, #bf00ff);
  transition: width 80ms linear;
  box-shadow: 0 0 8px rgba(0,245,255,0.6);
}
.r2p__turboLabel { font-size: 9px; color: rgba(0,245,255,0.7); font-weight: 800; letter-spacing: 0.8px; }

/* Minimap */
.r2p__minimap {
  width: 90px; height: 70px;
  background: rgba(6,6,16,0.78);
  border: 1px solid rgba(0,245,255,0.18);
  border-radius: 10px;
  overflow: hidden;
  pointer-events: none;
}
```

#### 1D — Semáforo (countdown overlay)
```css
.r2p__semaphore {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  pointer-events: none; z-index: 20;
}
.r2p__semLights {
  display: flex; gap: 10px;
  background: rgba(6,6,16,0.85);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 50px; padding: 10px 16px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.6);
}
.r2p__semLight {
  width: 28px; height: 28px; border-radius: 50%;
  background: #1a1a1a;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
  transition: background 100ms, box-shadow 100ms;
}
.r2p__semLight.on-red { background: #ff2020; box-shadow: 0 0 14px #ff2020, inset 0 2px 4px rgba(0,0,0,0.3); }
.r2p__semLight.on-green { background: #39ff14; box-shadow: 0 0 20px #39ff14, inset 0 2px 4px rgba(0,0,0,0.3); }
.r2p__semGo {
  font-size: 36px; font-weight: 900; color: #39ff14;
  text-shadow: 0 0 20px #39ff14, 0 0 40px #39ff14;
  letter-spacing: 4px;
}
```

#### 1E — Leaderboard final
```css
.r2p__endOverlay {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(4,4,12,0.88);
  backdrop-filter: blur(6px);
  z-index: 30;
}
.r2p__endCard {
  width: min(520px, 94vw);
  background: rgba(8,8,20,0.92);
  border: 1px solid rgba(0,245,255,0.25);
  border-radius: 20px; padding: 24px;
  box-shadow: 0 0 40px rgba(0,245,255,0.12), 0 24px 60px rgba(0,0,0,0.7);
}
.r2p__endTitle {
  font-size: 22px; font-weight: 900; text-align: center;
  background: linear-gradient(90deg, #00f5ff, #bf00ff);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  margin-bottom: 16px;
}
.r2p__endTable { width: 100%; border-collapse: collapse; }
.r2p__endTable th {
  font-size: 10px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.8px; color: rgba(0,245,255,0.6);
  padding: 6px 8px; text-align: left;
  border-bottom: 1px solid rgba(0,245,255,0.12);
}
.r2p__endTable td {
  font-size: 13px; padding: 8px 8px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.82);
}
.r2p__endTable tr.isPlayer td { color: #00f5ff; font-weight: 800; }
.r2p__endTable tr:first-child td { color: #ffd700; }
.r2p__posmedal { font-size: 16px; }

.r2p__endBtns { display: flex; gap: 10px; margin-top: 18px; }
.r2p__endBtnPrimary {
  flex: 1; padding: 12px; border: none; border-radius: 12px;
  background: linear-gradient(90deg, #00c8d4, #8000cc);
  color: #fff; font-size: 14px; font-weight: 800; cursor: pointer;
  transition: transform 100ms; box-shadow: 0 0 16px rgba(0,245,255,0.25);
}
.r2p__endBtnPrimary:hover { transform: translateY(-1px); }
.r2p__endBtnSecondary {
  flex: 1; padding: 12px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.8); font-size: 14px; font-weight: 700;
  border-radius: 12px; cursor: pointer; transition: border-color 100ms;
}
.r2p__endBtnSecondary:hover { border-color: rgba(0,245,255,0.4); }
```

#### 1F — Mobile touch controls
```css
.r2p__touch {
  position: absolute; bottom: 16px; left: 0; right: 0;
  display: none;
  justify-content: space-between; align-items: flex-end;
  padding: 0 16px; pointer-events: none; z-index: 5;
}
@media (max-width: 700px), (pointer: coarse) { .r2p__touch { display: flex; } }

.r2p__joystick {
  width: 100px; height: 100px; border-radius: 50%;
  border: 2px solid rgba(0,245,255,0.25);
  background: rgba(0,0,0,0.4); pointer-events: auto;
  position: relative;
}
.r2p__joystickKnob {
  position: absolute; width: 36px; height: 36px;
  border-radius: 50%; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,245,255,0.5);
  box-shadow: 0 0 10px rgba(0,245,255,0.5);
  pointer-events: none;
}

.r2p__touchRight {
  display: flex; flex-direction: column; gap: 8px; pointer-events: auto;
}
.r2p__touchBtn {
  width: 64px; height: 64px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.2);
  background: rgba(0,0,0,0.45); color: rgba(255,255,255,0.8);
  font-size: 22px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  -webkit-tap-highlight-color: transparent;
}
.r2p__touchBtn:active { background: rgba(0,245,255,0.2); border-color: #00f5ff; }

.r2p__touchTurbo {
  width: 64px; height: 64px; border-radius: 50%;
  border: 2px solid rgba(0,245,255,0.4);
  background: rgba(0,0,0,0.45); color: #00f5ff;
  font-size: 11px; font-weight: 800; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  -webkit-tap-highlight-color: transparent;
}
.r2p__touchTurbo:active { background: rgba(0,245,255,0.3); box-shadow: 0 0 14px rgba(0,245,255,0.5); }
```

#### 1G — Nota de controles teclado
```css
.r2p__keyHint {
  position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
  font-size: 11px; color: rgba(255,255,255,0.3);
  pointer-events: none; white-space: nowrap;
}
@media (max-width: 700px), (pointer: coarse) { .r2p__keyHint { display: none; } }
```

**Commit:**
```bash
git add src/games/RaceGame2DPro.css
git commit -m "feat: rewrite RaceGame2DPro CSS with full neon theme"
```

---

### Task 2: JSX — Constantes, entornos y 18 pistas

**Files:**
- Rewrite: `src/games/RaceGame2DPro.jsx` (comenzar desde cero, solo las secciones de esta tarea)

Escribe la primera sección del archivo. Empieza con:

```js
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import "./RaceGame2DPro.css";
```

#### 2A — Utilidades matemáticas
```js
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const wrap01 = (x) => ((x % 1) + 1) % 1;
const angNorm = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const signedAngleDiff = (from, to) => angNorm(to - from);
function catmullRom(p0, p1, p2, p3, t) {
  // Returns interpolated [x,y] point on Catmull-Rom spline
  const t2 = t * t, t3 = t2 * t;
  return [
    0.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
    0.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)
  ];
}
```

#### 2B — Perfiles de entorno (6 entornos)
```js
const ENVIRONMENTS = {
  "neon-city": {
    name: { es: "Neon City", en: "Neon City" },
    roadColor: "#12122a", borderColor: "#00f5ff", glowColor: "#00f5ff",
    bgColor: "#060610", grassColor: "#0a0a1e", centerLineColor: "#ffffff22",
    starfield: false,
  },
  "volcano": {
    name: { es: "Volcán", en: "Volcano" },
    roadColor: "#1a0800", borderColor: "#ff4500", glowColor: "#ff6a00",
    bgColor: "#0d0400", grassColor: "#1a0600", centerLineColor: "#ff450022",
    starfield: false,
  },
  "arctic": {
    name: { es: "Ártico", en: "Arctic" },
    roadColor: "#0d1b2a", borderColor: "#a8e0ff", glowColor: "#c8f0ff",
    bgColor: "#060d14", grassColor: "#0a1420", centerLineColor: "#a8e0ff22",
    starfield: false,
  },
  "jungle": {
    name: { es: "Jungla", en: "Jungle" },
    roadColor: "#0a1a0a", borderColor: "#39ff14", glowColor: "#50ff25",
    bgColor: "#060d06", grassColor: "#0d1a08", centerLineColor: "#39ff1422",
    starfield: false,
  },
  "desert": {
    name: { es: "Desierto", en: "Desert" },
    roadColor: "#1a1008", borderColor: "#ffd700", glowColor: "#ffea50",
    bgColor: "#0d0a04", grassColor: "#1a1204", centerLineColor: "#ffd70022",
    starfield: false,
  },
  "space": {
    name: { es: "Espacio", en: "Space" },
    roadColor: "#06061a", borderColor: "#bf00ff", glowColor: "#d400ff",
    bgColor: "#020208", grassColor: "#050510", centerLineColor: "#bf00ff22",
    starfield: true,
  },
};
```

#### 2C — Las 18 pistas

Escribe el array `TRACKS` con 18 entradas (3 por entorno). Cada entrada:
```js
{
  id: number,           // 0-17
  envId: string,        // clave en ENVIRONMENTS
  layout: string,       // "flow" | "technical" | "oval"
  name: { es, en },
  trackWidth: number,   // ancho en px mundo (40–60)
  raw: [[x,y], ...],   // 8-15 puntos de control normalizados (~[-2,2])
  ccw: boolean,         // sentido antihorario
}
```

**Diseño de los 18 circuitos — sigue estas especificaciones de trazado:**

**neon-city (3):**
- id 0 `flow`: Bucle amplio tipo óvalo con 2 curvas largas y 2 rectas. ~10 puntos. Ej: `[[-1.7,0.1],[-1.2,-0.8],[-0.3,-1.1],[0.5,-1.0],[1.3,-0.6],[1.6,0.1],[1.2,0.8],[0.2,1.1],[-0.7,1.0],[-1.3,0.5]]`
- id 1 `technical`: Muchas curvas + chicane en S. ~13 puntos con cambios de dirección frecuentes.
- id 2 `oval`: 2 rectas largas + 2 curvas de herradura en los extremos. ~8 puntos.

**volcano (3):**
- id 3 `flow`: Figura sinuosa tipo serpiente, 3 curvas amplias. ~11 puntos.
- id 4 `technical`: Horquillas y curvas lentas, ~14 puntos, rectas cortas.
- id 5 `oval`: 2 rectas muy largas + 2 curvas cerradas. trackWidth: 45.

**arctic (3):**
- id 6 `flow`: Curvas suaves como un río. ~9 puntos.
- id 7 `technical`: Estrecho y técnico, ~12 puntos. trackWidth: 38.
- id 8 `oval`: Óvalo ancho y rápido. trackWidth: 52.

**jungle (3):**
- id 9 `flow`: Serpentea entre la vegetación, ~11 puntos.
- id 10 `technical`: Giros cerrados en zigzag, ~13 puntos.
- id 11 `oval`: Circuito corto pero rápido, ~8 puntos.

**desert (3):**
- id 12 `flow`: Grandes barridos, curvas muy amplias, ~10 puntos. trackWidth: 55.
- id 13 `technical`: Laberinto de curvas lentas, ~15 puntos.
- id 14 `oval`: Recta de 2km simulada + curvas anchas. trackWidth: 58.

**space (3):**
- id 15 `flow`: Circuito orbital suave, ~10 puntos.
- id 16 `technical`: Pasillo de estación, muy técnico ~14 puntos. trackWidth: 38.
- id 17 `oval`: Speedway interestelar con rectas enormes, trackWidth: 55.

**Commit:**
```bash
git add src/games/RaceGame2DPro.jsx
git commit -m "feat: add environments and 18 track definitions"
```

---

### Task 3: JSX — Perfiles de IA, clima y física del coche

**Files:**
- Continue: `src/games/RaceGame2DPro.jsx` (añadir al final del archivo existente)

#### 3A — Perfiles IA y clima
```js
const AI_PROFILES = {
  easy: {
    speedFactor: 0.78,       // velocidad punta como fracción del máximo
    lineOffset: 0.55,        // desviación de la trazada ideal (0=perfecto)
    brakeMargin: 1.45,       // multiplica la distancia de frenada (>1=frena antes)
    errorRate: 0.18,         // probabilidad por frame de cometer error
    errorMag: 0.4,           // magnitud del error de dirección
    turboUse: 0.0,           // probabilidad de usar turbo
    apexPrecision: 0.6,      // precisión al pasar por el apex (0-1)
  },
  medium: {
    speedFactor: 0.91,
    lineOffset: 0.28,
    brakeMargin: 1.10,
    errorRate: 0.05,
    errorMag: 0.18,
    turboUse: 0.25,
    apexPrecision: 0.82,
  },
  hard: {
    speedFactor: 1.00,
    lineOffset: 0.08,
    brakeMargin: 0.88,
    errorRate: 0.008,
    errorMag: 0.05,
    turboUse: 0.75,
    apexPrecision: 0.97,
  },
};

const WEATHER_PROFILES = {
  dry:  { label: { es: "Seco", en: "Dry" },     icon: "☀️", gripMult: 1.00, visMult: 1.00, rainOverlay: false },
  rain: { label: { es: "Lluvia", en: "Rain" },  icon: "🌧️", gripMult: 0.72, visMult: 0.75, rainOverlay: true },
  dusk: { label: { es: "Crepúsculo", en: "Dusk" }, icon: "🌅", gripMult: 0.90, visMult: 0.85, rainOverlay: false },
};
```

#### 3B — Constantes de física
```js
const PHYS = {
  MAX_SPEED: 420,          // px/s
  ACCEL: 320,              // px/s²
  BRAKE_DECEL: 680,        // px/s²
  NATURAL_DECEL: 55,       // fricción natural
  STEER_RATE: 3.2,         // rad/s de giro máximo
  GRIP_BASE: 9.0,          // rigidez lateral (mayor = menos derrape)
  TURBO_BOOST: 180,        // px/s extra durante turbo
  TURBO_DURATION: 1.8,     // segundos de turbo
  TURBO_COOLDOWN: 6.0,     // segundos de recarga tras turbo
  TURBO_FILL_RATE: 0.12,   // fracción por segundo al conducir
  NEAR_MISS_BONUS: 0.22,   // turbo ganado por near-miss
  CAR_RADIUS: 14,          // radio de colisión
};
```

#### 3C — Pre-cómputo de pista (función buildTrack)

Esta función toma las definiciones de pista y genera:
- `samples[]`: array de N puntos `{ x, y, ang, curvature, speedLimit }` a lo largo del spline
- `totalLength`: longitud aproximada de la pista en px
- `startS`: posición de la parrilla
- `gridPositions[]`: posiciones para N coches en la parrilla (2 filas × N/2)

```js
function buildTrack(trackDef, canvasW, canvasH) {
  const SAMPLES = 800;
  const raw = trackDef.raw;
  const n = raw.length;

  // Scale raw coords to canvas
  const scaleX = canvasW * 0.42;
  const scaleY = canvasH * 0.42;
  const pts = raw.map(([x, y]) => [canvasW/2 + x * scaleX, canvasH/2 + y * scaleY]);

  // Sample the Catmull-Rom spline
  const samples = [];
  for (let i = 0; i < SAMPLES; i++) {
    const t = i / SAMPLES;
    const seg = t * n;
    const idx = Math.floor(seg);
    const frac = seg - idx;
    const p0 = pts[(idx - 1 + n) % n];
    const p1 = pts[idx % n];
    const p2 = pts[(idx + 1) % n];
    const p3 = pts[(idx + 2) % n];
    const [x, y] = catmullRom(p0, p1, p2, p3, frac);
    samples.push({ x, y, ang: 0, curvature: 0, speedLimit: PHYS.MAX_SPEED });
  }

  // Compute angles
  for (let i = 0; i < SAMPLES; i++) {
    const next = samples[(i + 1) % SAMPLES];
    const prev = samples[(i - 1 + SAMPLES) % SAMPLES];
    samples[i].ang = Math.atan2(next.y - prev.y, next.x - prev.x);
  }

  // Compute curvature + speed limits
  for (let i = 0; i < SAMPLES; i++) {
    const prev = samples[(i - 1 + SAMPLES) % SAMPLES];
    const next = samples[(i + 1) % SAMPLES];
    const da = Math.abs(angNorm(next.ang - prev.ang));
    samples[i].curvature = da;
    // High curvature = lower speed limit
    const curveFactor = clamp(1 - da * 3.5, 0.32, 1.0);
    samples[i].speedLimit = PHYS.MAX_SPEED * curveFactor;
  }

  // Total length approximation
  let totalLength = 0;
  for (let i = 0; i < SAMPLES; i++) {
    const next = samples[(i + 1) % SAMPLES];
    totalLength += Math.hypot(next.x - samples[i].x, next.y - samples[i].y);
  }

  // Grid start = sample 0 area; grid extends backwards
  const startS = 0.03;

  return { samples, totalLength, startS, trackWidth: trackDef.trackWidth || 48 };
}
```

#### 3D — Funciones de query de pista

```js
// Interpola posición/ángulo en cualquier s (0-1) del track
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

// Encuentra el s más cercano al punto (x,y)
function closestS(track, x, y) {
  let bestDist = Infinity, bestS = 0;
  const step = Math.floor(track.samples.length / 60);
  for (let i = 0; i < track.samples.length; i += step) {
    const s = track.samples[i];
    const d = Math.hypot(s.x - x, s.y - y);
    if (d < bestDist) { bestDist = d; bestS = i / track.samples.length; }
  }
  return bestS;
}
```

**Commit:**
```bash
git add src/games/RaceGame2DPro.jsx
git commit -m "feat: add AI/weather profiles, physics constants and track engine"
```

---

### Task 4: JSX — Lógica de coches, IA y gestión de carrera

**Files:**
- Continue: `src/games/RaceGame2DPro.jsx`

#### 4A — Creación de coche
```js
function createCar(id, isPlayer, color, aiDifficulty) {
  return {
    id, isPlayer, color,
    x: 0, y: 0, a: 0,
    vx: 0, vy: 0, speed: 0,
    s: 0,                     // track progress 0-1
    lap: 1, finished: false, finishTime: null, finishOrder: null,
    turbo: 0,                 // 0-1 acumulado
    turboActive: false,
    turboCooldown: 0,
    turboTimeLeft: 0,
    spawnGrace: 1.5,          // segundos invulnerable al inicio
    trail: [],                // array de {x,y,a} últimas posiciones para el trail
    sparks: [],               // partículas de colisión
    aiProfile: isPlayer ? null : AI_PROFILES[aiDifficulty],
    ai: isPlayer ? null : {
      t: 0,
      targetS: 0,
      lineOffset: (Math.random() - 0.5) * 0.3,  // variación individual
      noiseSeed: Math.random() * 9999,
      prevErr: 0,
    },
    // near-miss detection
    nearMissTimer: 0,
  };
}
```

#### 4B — Actualización de coche (física)

```js
function updateCar(car, dt, input, track, weather, allCars) {
  if (car.finished) return;

  const grip = PHYS.GRIP_BASE * weather.gripMult;

  // Turbo activo
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

  const maxSpeed = PHYS.MAX_SPEED + turboBonus;

  // Throttle / brake / steer
  let throttle = input.throttle;
  let brake = input.brake;
  let steer = input.steer;

  // Velocidad longitudinal
  if (throttle > 0 && car.speed < maxSpeed) {
    car.speed += PHYS.ACCEL * dt * throttle;
  } else if (brake > 0) {
    car.speed -= PHYS.BRAKE_DECEL * dt * brake;
  } else {
    car.speed -= PHYS.NATURAL_DECEL * dt;
  }
  car.speed = clamp(car.speed, 0, maxSpeed);

  // Giro
  const steerEffect = steer * PHYS.STEER_RATE * (car.speed / PHYS.MAX_SPEED);
  car.a += steerEffect * dt;

  // Actualizar posición
  const prevX = car.x, prevY = car.y;
  car.vx = lerp(car.vx, Math.cos(car.a) * car.speed, grip * dt);
  car.vy = lerp(car.vy, Math.sin(car.a) * car.speed, grip * dt);
  car.x += car.vx * dt;
  car.y += car.vy * dt;
  car.speed = Math.hypot(car.vx, car.vy);

  // Constraint a pista (fuera del límite = reducir velocidad + reposicionar)
  const tw = track.trackWidth / 2 + 4;
  const closest = sampleTrackAt(track, closestS(track, car.x, car.y));
  const dx = car.x - closest.x, dy = car.y - closest.y;
  const dist = Math.hypot(dx, dy);
  if (dist > tw) {
    const overshoot = dist - tw;
    car.x -= (dx / dist) * overshoot * 0.9;
    car.y -= (dy / dist) * overshoot * 0.9;
    car.speed *= 0.88;
    car.vx *= 0.88; car.vy *= 0.88;
  }

  // Colisiones con otros coches
  if (car.spawnGrace <= 0) {
    for (const other of allCars) {
      if (other.id === car.id || other.spawnGrace > 0) continue;
      const cdx = car.x - other.x, cdy = car.y - other.y;
      const cd = Math.hypot(cdx, cdy);
      const minD = PHYS.CAR_RADIUS * 2;
      if (cd < minD && cd > 0.1) {
        const push = (minD - cd) / 2;
        car.x += (cdx / cd) * push;
        car.y += (cdy / cd) * push;
        car.speed *= 0.82;
        car.vx *= 0.82; car.vy *= 0.82;
        // Sparks en la posición del impacto
        addSparks(car.sparks, car.x, car.y, car.color);
      }
    }
  }
  if (car.spawnGrace > 0) car.spawnGrace -= dt;

  // Actualizar s (progreso en pista)
  const newS = closestS(track, car.x, car.y);
  const ds = wrap01(newS - car.s + 0.5) - 0.5;
  if (ds > 0) car.s = newS;

  // Near-miss: si un coche pasa MUY cerca sin chocar → acumular turbo
  if (!car.isPlayer) return; // solo para el jugador
  for (const other of allCars) {
    if (other.id === car.id) continue;
    const nd = Math.hypot(car.x - other.x, car.y - other.y);
    if (nd < PHYS.CAR_RADIUS * 3.5 && nd > PHYS.CAR_RADIUS * 2.2) {
      car.turbo = Math.min(1, car.turbo + PHYS.NEAR_MISS_BONUS * dt * 4);
    }
  }
  // Recarga normal de turbo mientras conduce
  if (!car.turboActive && car.turboCooldown <= 0 && car.speed > 50) {
    car.turbo = Math.min(1, car.turbo + PHYS.TURBO_FILL_RATE * dt);
  }

  // Trail
  car.trail.unshift({ x: car.x, y: car.y, a: car.a });
  if (car.trail.length > 25) car.trail.pop();
}
```

#### 4C — IA

```js
function computeAiInput(car, track, weather, totalLaps) {
  const prof = car.aiProfile;
  const ai = car.ai;
  ai.t += 0.016;

  // Lookahead en pista según velocidad
  const lookahead = 0.03 + car.speed / PHYS.MAX_SPEED * 0.06;
  const targetS = wrap01(car.s + lookahead);
  const target = sampleTrackAt(track, targetS);

  // Lateral offset del racing line
  const lateralOffset = prof.lineOffset * (Math.sin(ai.t * 0.4 + ai.noiseSeed) * 0.6 + ai.lineOffset);
  const nx = -Math.sin(target.ang), ny = Math.cos(target.ang);
  const tx = target.x + nx * track.trackWidth * lateralOffset;
  const ty = target.y + ny * track.trackWidth * lateralOffset;

  // Ángulo al target
  const wantAngle = Math.atan2(ty - car.y, tx - car.x);
  let angleDiff = angNorm(wantAngle - car.a);

  // Error aleatorio
  if (Math.random() < prof.errorRate) {
    angleDiff += (Math.random() - 0.5) * prof.errorMag * 2;
  }

  const steer = clamp(angleDiff * 2.5, -1, 1);

  // Velocidad objetivo (curvatura ahead)
  const curveLook = sampleTrackAt(track, wrap01(car.s + 0.05));
  const targetSpeed = curveLook.speedLimit * prof.speedFactor * weather.gripMult;
  const brakeThreshold = targetSpeed * prof.brakeMargin;

  let throttle = 0, brake = 0;
  if (car.speed < targetSpeed - 10) throttle = 1;
  else if (car.speed > brakeThreshold) brake = 1;
  else throttle = 0.5;

  // Turbo: usar si en recta
  let useTurbo = false;
  if (Math.random() < prof.turboUse && car.turbo > 0.8 && curveLook.curvature < 0.02 && !car.turboActive && car.turboCooldown <= 0) {
    useTurbo = true;
  }

  return { throttle, brake, steer, useTurbo };
}
```

#### 4D — Partículas

```js
function addSparks(sparks, x, y, color) {
  for (let i = 0; i < 6; i++) {
    const ang = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 80;
    sparks.push({
      x, y, color,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      life: 0.35 + Math.random() * 0.3,
      maxLife: 0.65,
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
```

#### 4E — Lap tracking
```js
// Detecta si el coche cruzó la línea de meta (s pasa de ~0.97 a ~0.03)
function checkLapCross(car, prevS, totalLaps, onFinish) {
  const finishS = 0.02;
  const crossed = prevS > 0.85 && car.s < 0.15;
  if (crossed) {
    if (car.lap >= totalLaps) {
      car.finished = true;
      car.finishTime = performance.now();
      onFinish(car);
    } else {
      car.lap++;
    }
  }
}
```

**Commit:**
```bash
git add src/games/RaceGame2DPro.jsx
git commit -m "feat: add car physics, AI engine and lap tracking"
```

---

### Task 5: JSX — Pipeline de renderizado Canvas

**Files:**
- Continue: `src/games/RaceGame2DPro.jsx`

#### 5A — Render de fondo (por entorno)
```js
function renderBackground(ctx, w, h, env, weather, starfield, time) {
  ctx.fillStyle = env.bgColor;
  ctx.fillRect(0, 0, w, h);

  // Starfield para space
  if (starfield && starfield.length) {
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    for (const s of starfield) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Lluvia overlay
  if (weather.rainOverlay) {
    ctx.save();
    ctx.strokeStyle = "rgba(150,200,255,0.18)";
    ctx.lineWidth = 1;
    const offset = (time * 300) % 60;
    for (let x = -60; x < w + 60; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x + offset, 0);
      ctx.lineTo(x + offset + 30, h);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Dusk fog vignette
  if (weather.id === "dusk") {
    const grad = ctx.createRadialGradient(w/2, h/2, h*0.2, w/2, h/2, h*0.8);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(20,10,0,0.45)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}
```

#### 5B — Render de pista
```js
function renderTrack(ctx, track, env, weather) {
  const samples = track.samples;
  const N = samples.length;
  const hw = track.trackWidth / 2;
  const glowWidth = 6;

  // 1. Grass (zona exterior) — simplificado: el fondo ya es el color del grass
  //    Pintamos la carretera encima

  // 2. Asfalto (carretera)
  ctx.beginPath();
  ctx.strokeStyle = env.roadColor;
  ctx.lineWidth = track.trackWidth + 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i <= N; i++) {
    const s = samples[i % N];
    if (i === 0) ctx.moveTo(s.x, s.y); else ctx.lineTo(s.x, s.y);
  }
  ctx.stroke();

  // 3. Línea central punteada
  ctx.setLineDash([18, 14]);
  ctx.strokeStyle = env.centerLineColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const s = samples[i % N];
    if (i === 0) ctx.moveTo(s.x, s.y); else ctx.lineTo(s.x, s.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // 4. Bordes neon con glow
  ctx.save();
  ctx.shadowBlur = 18;
  ctx.shadowColor = env.glowColor;
  // Borde izquierdo
  ctx.beginPath();
  ctx.strokeStyle = env.borderColor;
  ctx.lineWidth = 2.5;
  for (let i = 0; i <= N; i++) {
    const s = samples[i % N];
    const nx = -Math.sin(s.ang) * hw, ny = Math.cos(s.ang) * hw;
    if (i === 0) ctx.moveTo(s.x + nx, s.y + ny); else ctx.lineTo(s.x + nx, s.y + ny);
  }
  ctx.stroke();
  // Borde derecho
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const s = samples[i % N];
    const nx = Math.sin(s.ang) * hw, ny = -Math.cos(s.ang) * hw;
    if (i === 0) ctx.moveTo(s.x + nx, s.y + ny); else ctx.lineTo(s.x + nx, s.y + ny);
  }
  ctx.stroke();
  ctx.restore();

  // 5. Línea de meta (blanco + negro a cuadros) en s≈0
  const finishSamp = samples[Math.floor(0.02 * N)];
  ctx.save();
  const fnx = -Math.sin(finishSamp.ang) * hw, fny = Math.cos(finishSamp.ang) * hw;
  for (let i = 0; i < 8; i++) {
    const t = i / 8;
    ctx.fillStyle = (i % 2 === 0) ? "#fff" : "#222";
    ctx.fillRect(
      finishSamp.x + fnx * (2*t - 1) - 2,
      finishSamp.y + fny * (2*t - 1) - 2,
      4, 4
    );
  }
  ctx.restore();
}
```

#### 5C — Render de coches (con trail y glow)
```js
function renderCar(ctx, car, isPlayer) {
  if (!car) return;

  // Trail neon
  for (let i = 0; i < car.trail.length; i++) {
    const t = car.trail[i];
    const alpha = (1 - i / car.trail.length) * 0.35;
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(t.a);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = car.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 7 - i * 0.2, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Turbo trail extra
  if (car.turboActive) {
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.a);
    ctx.shadowBlur = 20;
    ctx.shadowColor = car.color;
    ctx.fillStyle = car.color;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.ellipse(-16, 0, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Cuerpo del coche
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.a);

  // Glow del jugador
  if (isPlayer) {
    ctx.shadowBlur = 16;
    ctx.shadowColor = car.color;
  }

  // Carrocería
  ctx.fillStyle = car.color;
  ctx.beginPath();
  ctx.roundRect(-12, -7, 24, 14, 4);
  ctx.fill();

  // Cabina
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.beginPath();
  ctx.roundRect(-4, -5, 12, 10, 3);
  ctx.fill();

  // Faros delanteros
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(12, -4, 2.5, 2, 0, 0, Math.PI * 2);
  ctx.ellipse(12, 4, 2.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Sparks
  renderSparks(ctx, car.sparks);
}

function renderSparks(ctx, sparks) {
  for (const s of sparks) {
    const alpha = s.life / s.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = s.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = s.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
```

#### 5D — Minimap
```js
function renderMinimap(ctx, track, cars, w, h) {
  // Fondo
  ctx.fillStyle = "rgba(6,6,16,0.9)";
  ctx.fillRect(0, 0, w, h);

  // Escalar pista al minimap
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const s of track.samples) {
    if (s.x < minX) minX = s.x; if (s.x > maxX) maxX = s.x;
    if (s.y < minY) minY = s.y; if (s.y > maxY) maxY = s.y;
  }
  const pad = 8;
  const sx = (w - pad*2) / (maxX - minX);
  const sy = (h - pad*2) / (maxY - minY);
  const sc = Math.min(sx, sy);
  const ox = pad + ((w - pad*2) - (maxX - minX) * sc) / 2 - minX * sc;
  const oy = pad + ((h - pad*2) - (maxY - minY) * sc) / 2 - minY * sc;

  // Pista
  ctx.beginPath();
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 3;
  for (let i = 0; i <= track.samples.length; i++) {
    const s = track.samples[i % track.samples.length];
    const mx = s.x * sc + ox, my = s.y * sc + oy;
    if (i === 0) ctx.moveTo(mx, my); else ctx.lineTo(mx, my);
  }
  ctx.stroke();

  // Coches
  for (const car of cars) {
    const mx = car.x * sc + ox, my = car.y * sc + oy;
    ctx.beginPath();
    ctx.arc(mx, my, car.isPlayer ? 3.5 : 2.5, 0, Math.PI * 2);
    ctx.fillStyle = car.color;
    if (car.isPlayer) {
      ctx.shadowBlur = 6;
      ctx.shadowColor = car.color;
    }
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
```

#### 5E — Semáforo en canvas (durante countdown)
```js
function renderStartGrid(ctx, track, cars, phase, phaseTimer, env) {
  // Grid boxes bajo cada coche
  if (phase !== "go") {
    for (const car of cars) {
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.a);
      const alpha = phase === "fading" ? phaseTimer / 0.5 : 1.0;
      ctx.globalAlpha = alpha * 0.7;
      ctx.strokeStyle = env.borderColor;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = env.borderColor;
      ctx.strokeRect(-16, -9, 32, 18);
      ctx.restore();
    }
  }
}
```

**Commit:**
```bash
git add src/games/RaceGame2DPro.jsx
git commit -m "feat: add complete canvas rendering pipeline"
```

---

### Task 6: JSX — Componente React (game loop, UI, setup, HUD, leaderboard)

**Files:**
- Continue: `src/games/RaceGame2DPro.jsx` — añadir el componente React principal al final

Este es el componente principal. Debe:

#### 6A — State y refs
```js
export default function RaceGame2DPro() {
  const lang = navigator.language?.startsWith("es") ? "es" : "en";

  // — Setup state —
  const [screen, setScreen] = useState("setup"); // "setup" | "race" | "end"
  const [selectedTrackId, setSelectedTrackId] = useState(0);
  const [aiDifficulty, setAiDifficulty] = useState("medium");
  const [weather, setWeather] = useState("dry");
  const [laps, setLaps] = useState(3);
  const [rivals, setRivals] = useState(5);

  // — Race state (updated via RAF, shown in HUD) —
  const [hud, setHud] = useState({ pos: 1, total: 6, lap: 1, totalLaps: 3, speed: 0, turbo: 0 });
  const [semaphore, setSemaphore] = useState({ phase: "off", lights: [false, false, false] });
  const [endData, setEndData] = useState(null); // leaderboard

  // — Canvas refs —
  const canvasRef = useRef(null);
  const minimapRef = useRef(null);
  const rafRef = useRef(null);
  const lastRef = useRef(performance.now());

  // — Game state ref (mutable, read by RAF) —
  const gameRef = useRef(null); // { cars, track, weather, laps, startPhase, startTimer, finishOrder }

  // — Input —
  const keysRef = useRef(new Set());
  const inputRef = useRef({ throttle: 0, brake: 0, steer: 0, turboPressed: false });
  const joyRef = useRef({ active: false, pointerId: null, cx: 0, cy: 0, dx: 0, dy: 0 });

  // — Starfield (for space env) —
  const starfieldRef = useRef([]);
}
```

#### 6B — Traducciones locales
Incluye un objeto `T` con todas las cadenas en `es` y `en`:
- `title`, `subtitle`, `selectTrack`, `selectDifficulty`, `selectWeather`, `selectLaps`, `selectRivals`
- `easy`, `medium`, `hard`, `dry`, `rain`, `dusk`
- `startRace`, `position`, `lap`, `speed`, `turbo`, `restart`, `backToSetup`
- `winner`, `podium`, `yourResult`, `lapTime`, `raceOver`
- Medallas para posiciones 1-3: "🥇", "🥈", "🥉"

#### 6C — Inicialización de carrera (startRace)

```js
const startRace = useCallback(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const W = canvas.width, H = canvas.height;
  const trackDef = TRACKS[selectedTrackId];
  const builtTrack = buildTrack(trackDef, W, H);
  const wxProfile = WEATHER_PROFILES[weather];

  // Generar colores de coches (jugador primero)
  const carColors = ["#00f5ff", "#ff4500", "#ffd700", "#39ff14", "#bf00ff", "#ff69b4", "#ff8c00", "#00ff7f"];

  // Crear coches
  const totalCars = rivals + 1;
  const cars = [];
  for (let i = 0; i < totalCars; i++) {
    cars.push(createCar(i, i === 0, carColors[i % carColors.length], aiDifficulty));
  }

  // Posicionar en parrilla (2 por fila, detrás de la línea de meta)
  const startS = builtTrack.startS;
  const rowSpacing = 0.025;
  for (let i = 0; i < totalCars; i++) {
    const row = Math.floor(i / 2);
    const side = i % 2 === 0 ? 1 : -1;
    const s = wrap01(startS - row * rowSpacing);
    const sp = sampleTrackAt(builtTrack, s);
    const nx = -Math.sin(sp.ang), ny = Math.cos(sp.ang);
    cars[i].x = sp.x + nx * side * (builtTrack.trackWidth * 0.28);
    cars[i].y = sp.y + ny * side * (builtTrack.trackWidth * 0.28);
    cars[i].a = sp.ang;
    cars[i].s = s;
  }

  // Starfield
  if (ENVIRONMENTS[trackDef.envId].starfield) {
    starfieldRef.current = Array.from({ length: 120 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3
    }));
  } else {
    starfieldRef.current = [];
  }

  gameRef.current = {
    cars, track: builtTrack, trackDef,
    weather: wxProfile, weatherId: weather,
    totalLaps: laps,
    startPhase: "countdown", // "countdown" | "fading" | "racing" | "finished"
    startTimer: 0,
    countdownStep: 0,    // 0=nada, 1=luz1, 2=luz2, 3=luz3, 4=go
    finishOrder: [],
    time: 0,
    lapTimes: Array(totalCars).fill(null).map(() => []),
    lapStart: Array(totalCars).fill(0),
  };

  setScreen("race");
  setSemaphore({ phase: "countdown", lights: [false, false, false] });
}, [selectedTrackId, aiDifficulty, weather, laps, rivals]);
```

#### 6D — Game loop (useEffect con RAF)

El loop debe:
1. Calcular `dt` (capped a 0.05s para evitar glitches)
2. Gestionar la fase de semáforo:
   - Cada 0.9s avanza de light 1→2→3→green→racing
   - Al pasar a "racing" las grid boxes empiezan a desvanecerse
3. Si `startPhase === "racing"`:
   - Para cada coche: calcular input (AI o teclado) → `updateCar()` → `checkLapCross()`
   - IA activa el turbo si `computeAiInput` devuelve `useTurbo: true`
4. Actualizar sparks de todos los coches
5. Renderizar: `renderBackground → renderTrack → renderStartGrid → todos los coches`
6. Renderizar minimap en `minimapRef`
7. Actualizar HUD state (no en cada frame, solo si cambió)
8. Detectar fin de carrera (todos acabaron o jugador acabó)

```js
useEffect(() => {
  if (screen !== "race") return;
  // keyboard listeners
  const onKeyDown = (e) => {
    keysRef.current.add(e.code);
    if (e.code === "Space" && gameRef.current) {
      const player = gameRef.current.cars[0];
      if (player.turbo >= 0.3 && !player.turboActive && player.turboCooldown <= 0 && gameRef.current.startPhase === "racing") {
        player.turboActive = true;
        player.turboTimeLeft = PHYS.TURBO_DURATION;
        player.turbo = 0;
      }
      e.preventDefault();
    }
    if (e.code === "KeyR") {
      startRace();
      e.preventDefault();
    }
  };
  const onKeyUp = (e) => keysRef.current.delete(e.code);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  const canvas = canvasRef.current;
  const resizeCanvas = () => {
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    // Si hay track activo, reconstruirlo con nuevo tamaño
    if (gameRef.current && gameRef.current.trackDef) {
      gameRef.current.track = buildTrack(gameRef.current.trackDef, canvas.width, canvas.height);
      // Reposicionar coches en nuevo track (básico: reset s)
    }
  };
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const loop = (now) => {
    if (screen !== "race") return;
    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    const g = gameRef.current;
    if (!g) { rafRef.current = requestAnimationFrame(loop); return; }

    g.time += dt;

    // — Semáforo / countdown —
    if (g.startPhase === "countdown") {
      g.startTimer += dt;
      const step = Math.floor(g.startTimer / 0.85); // 0.85s por luz
      const newStep = clamp(step, 0, 4);
      if (newStep !== g.countdownStep) {
        g.countdownStep = newStep;
        if (newStep <= 3) {
          const lights = [newStep >= 1, newStep >= 2, newStep >= 3];
          setSemaphore({ phase: "countdown", lights });
        } else {
          setSemaphore({ phase: "go", lights: [false, false, false] });
          g.startPhase = "fading";
          g.startTimer = 0;
        }
      }
    } else if (g.startPhase === "fading") {
      g.startTimer += dt;
      if (g.startTimer > 0.5) {
        g.startPhase = "racing";
        setSemaphore({ phase: "off", lights: [false, false, false] });
      }
    }

    // — Input del jugador —
    const keys = keysRef.current;
    const canDrive = g.startPhase === "racing";
    const joy = joyRef.current;
    let playerThrottle = 0, playerBrake = 0, playerSteer = 0;
    if (canDrive) {
      if (keys.has("ArrowUp") || keys.has("KeyW")) playerThrottle = 1;
      if (keys.has("ArrowDown") || keys.has("KeyS")) playerBrake = 1;
      if (keys.has("ArrowLeft") || keys.has("KeyA")) playerSteer = -1;
      if (keys.has("ArrowRight") || keys.has("KeyD")) playerSteer = 1;
      // Touch joystick
      if (joy.active) {
        playerThrottle = clamp(-joy.dy / 40, 0, 1);
        playerBrake = clamp(joy.dy / 40, 0, 1);
        playerSteer = clamp(joy.dx / 40, -1, 1);
      }
    }

    // — Actualizar coches —
    for (const car of g.cars) {
      const prevS = car.s;
      if (g.startPhase === "racing" || g.startPhase === "fading") {
        if (car.isPlayer) {
          updateCar(car, dt, { throttle: playerThrottle, brake: playerBrake, steer: playerSteer }, g.track, g.weather, g.cars);
        } else {
          const aiInput = computeAiInput(car, g.track, g.weather, g.totalLaps);
          if (aiInput.useTurbo && car.turbo > 0.5 && !car.turboActive && car.turboCooldown <= 0) {
            car.turboActive = true;
            car.turboTimeLeft = PHYS.TURBO_DURATION;
            car.turbo = 0;
          }
          updateCar(car, dt, aiInput, g.track, g.weather, g.cars);
        }
        updateSparks(car.sparks, dt);
        if (!car.finished) {
          checkLapCross(car, prevS, g.totalLaps, (finishedCar) => {
            finishedCar.finishOrder = g.finishOrder.length + 1;
            g.finishOrder.push(finishedCar.id);
          });
        }
      }
    }

    // — Render —
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const env = ENVIRONMENTS[g.trackDef.envId];
    ctx.clearRect(0, 0, W, H);

    renderBackground(ctx, W, H, env, g.weather, starfieldRef.current, g.time);
    renderTrack(ctx, g.track, env, g.weather);

    // Grid boxes
    if (g.startPhase === "countdown" || g.startPhase === "fading") {
      renderStartGrid(ctx, g.track, g.cars, g.startPhase, g.startTimer, env);
    }

    // Coches (los no-jugadores primero, jugador encima)
    for (const car of g.cars) if (!car.isPlayer) renderCar(ctx, car, false);
    renderCar(ctx, g.cars[0], true);

    // — Minimap —
    const mm = minimapRef.current;
    if (mm) {
      const mctx = mm.getContext("2d");
      mm.width = 90 * window.devicePixelRatio;
      mm.height = 70 * window.devicePixelRatio;
      mctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      renderMinimap(mctx, g.track, g.cars, 90, 70);
      mctx.setTransform(1,0,0,1,0,0);
    }

    // — HUD update (cada ~8 frames) —
    if (Math.round(g.time * 60) % 8 === 0) {
      const player = g.cars[0];
      const pos = g.cars.filter(c => {
        if (c.finished && !player.finished) return true;
        if (!c.finished && player.finished) return false;
        const cProgress = (c.lap - 1) + c.s;
        const pProgress = (player.lap - 1) + player.s;
        return cProgress > pProgress;
      }).length + 1;
      setHud({
        pos, total: g.cars.length,
        lap: player.lap, totalLaps: g.totalLaps,
        speed: Math.round(player.speed * 0.28),  // ~km/h simulados
        turbo: player.turbo,
        turboActive: player.turboActive,
      });
    }

    // — Fin de carrera —
    const allFinished = g.cars.every(c => c.finished) ||
      (g.cars[0].finished && g.startPhase === "racing");
    if (allFinished && g.startPhase === "racing") {
      // Forzar a todos a finish si el jugador ya terminó
      if (!g._endTriggered) {
        g._endTriggered = true;
        // Build leaderboard
        const sorted = [...g.cars].sort((a, b) => {
          if (a.finished && b.finished) return a.finishOrder - b.finishOrder;
          if (a.finished) return -1;
          if (b.finished) return 1;
          const ap = (a.lap - 1) + a.s, bp = (b.lap - 1) + b.s;
          return bp - ap;
        });
        setEndData(sorted.map((c, idx) => ({
          pos: idx + 1,
          isPlayer: c.isPlayer,
          color: c.color,
          time: c.finishTime ? ((c.finishTime - (g._raceStartTime || c.finishTime)) / 1000).toFixed(2) : "DNF",
        })));
        setTimeout(() => setScreen("end"), 800);
      }
    }

    rafRef.current = requestAnimationFrame(loop);
  };

  rafRef.current = requestAnimationFrame(loop);
  return () => {
    cancelAnimationFrame(rafRef.current);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("resize", resizeCanvas);
  };
}, [screen, startRace]);
```

#### 6E — Touch handlers (joystick + botones)

Implementar `onJoyStart`, `onJoyMove`, `onJoyEnd` para el joystick, y `onTouchThrottle`, `onTouchBrake`, `onTouchTurbo` para los botones.

#### 6F — Render del componente React (JSX)

```jsx
// Setup screen
if (screen === "setup") {
  return (
    <div className="r2p">
      <div className="r2p__setup">
        <div className="r2p__setupCard">
          <div className="r2p__setupTitle">🏁 {T[lang].title}</div>
          <div className="r2p__setupSub">{T[lang].subtitle}</div>
          <div className="r2p__setupDivider" />

          {/* Track grid */}
          <div className="r2p__sectionLabel">{T[lang].selectTrack}</div>
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
              </div>
            ))}
          </div>

          {/* Options */}
          <div className="r2p__optionsRow">
            {/* Weather */}
            <div className="r2p__optBlock">
              <div className="r2p__sectionLabel">{T[lang].selectWeather}</div>
              <div className="r2p__choiceGroup">
                {Object.entries(WEATHER_PROFILES).map(([k, w]) => (
                  <button
                    key={k}
                    className={`r2p__choiceBtn${weather === k ? " isActive" : ""}`}
                    onClick={() => setWeather(k)}
                  >{w.icon} {w.label[lang]}</button>
                ))}
              </div>
            </div>
            {/* Difficulty */}
            <div className="r2p__optBlock">
              <div className="r2p__sectionLabel">{T[lang].selectDifficulty}</div>
              <div className="r2p__choiceGroup">
                {["easy","medium","hard"].map(d => (
                  <button
                    key={d}
                    className={`r2p__choiceBtn diff-${d}${aiDifficulty === d ? " isActive" : ""}`}
                    onClick={() => setAiDifficulty(d)}
                  >{T[lang][d]}</button>
                ))}
              </div>
            </div>
            {/* Laps */}
            <div className="r2p__optBlock">
              <div className="r2p__sectionLabel">{T[lang].selectLaps}</div>
              <div className="r2p__choiceGroup">
                {[3, 5, 7].map(n => (
                  <button key={n} className={`r2p__choiceBtn${laps === n ? " isActive" : ""}`}
                    onClick={() => setLaps(n)}>{n}</button>
                ))}
              </div>
            </div>
            {/* Rivals */}
            <div className="r2p__optBlock">
              <div className="r2p__sectionLabel">{T[lang].selectRivals}</div>
              <div className="r2p__choiceGroup">
                {[3, 5, 7].map(n => (
                  <button key={n} className={`r2p__choiceBtn${rivals === n ? " isActive" : ""}`}
                    onClick={() => setRivals(n)}>{n}</button>
                ))}
              </div>
            </div>
          </div>

          <button className="r2p__startBtn" onClick={startRace}>
            {T[lang].startRace} ▶
          </button>
        </div>
      </div>
    </div>
  );
}

// Race screen
if (screen === "race") {
  return (
    <div className="r2p">
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />

      {/* HUD */}
      <div className="r2p__hud">
        <div className="r2p__hudLeft">
          <div className="r2p__hudPos">{hud.pos}<span style={{fontSize:14,opacity:0.5}}>/{hud.total}</span></div>
          <div className="r2p__hudPosLabel">POSICIÓN</div>
          <div className="r2p__hudLap">Vuelta {hud.lap}/{hud.totalLaps}</div>
          <div className="r2p__hudSpeed">{hud.speed} km/h</div>
          <div className="r2p__turboLabel">TURBO</div>
          <div className="r2p__turboBar">
            <div className="r2p__turboFill" style={{ width: `${hud.turbo * 100}%`, opacity: hud.turboActive ? 1 : 0.8 }} />
          </div>
        </div>
        <canvas ref={minimapRef} className="r2p__minimap" style={{width:90,height:70}} />
      </div>

      {/* Semáforo */}
      {semaphore.phase !== "off" && (
        <div className="r2p__semaphore">
          <div className="r2p__semLights">
            {semaphore.lights.map((on, i) => (
              <div key={i} className={`r2p__semLight ${on ? "on-red" : ""}`} />
            ))}
          </div>
          {semaphore.phase === "go" && <div className="r2p__semGo">GO!</div>}
        </div>
      )}

      {/* Touch controls */}
      <div className="r2p__touch">
        <div className="r2p__joystick"
          onPointerDown={onJoyStart} onPointerMove={onJoyMove}
          onPointerUp={onJoyEnd} onPointerCancel={onJoyEnd}>
          <div className="r2p__joystickKnob"
            style={{ transform: `translate(calc(-50% + ${joyRef.current.dx||0}px), calc(-50% + ${joyRef.current.dy||0}px))` }} />
        </div>
        <div className="r2p__touchRight">
          <button className="r2p__touchTurbo" onPointerDown={onTouchTurbo}>TURBO</button>
          <button className="r2p__touchBtn" onPointerDown={() => onTouchThrottle(true)} onPointerUp={() => onTouchThrottle(false)} onPointerCancel={() => onTouchThrottle(false)}>⬆</button>
          <button className="r2p__touchBtn" onPointerDown={() => onTouchBrake(true)} onPointerUp={() => onTouchBrake(false)} onPointerCancel={() => onTouchBrake(false)}>⬇</button>
        </div>
      </div>

      <div className="r2p__keyHint">↑↓ Accel/Brake · ←→ Steer · Space Turbo · R Restart</div>
    </div>
  );
}

// End screen
if (screen === "end") {
  return (
    <div className="r2p">
      <div className="r2p__endOverlay">
        <div className="r2p__endCard">
          <div className="r2p__endTitle">🏁 {T[lang].raceOver}</div>
          <table className="r2p__endTable">
            <thead>
              <tr><th>#</th><th>{T[lang].yourResult}</th><th>{T[lang].lapTime}</th></tr>
            </thead>
            <tbody>
              {(endData || []).map(row => (
                <tr key={row.pos} className={row.isPlayer ? "isPlayer" : ""}>
                  <td><span className="r2p__posmedal">{row.pos <= 3 ? ["🥇","🥈","🥉"][row.pos-1] : row.pos}</span></td>
                  <td>
                    <span style={{ display:"inline-block", width:10, height:10, borderRadius:"50%",
                      background: row.color, marginRight:6, verticalAlign:"middle",
                      boxShadow: `0 0 6px ${row.color}` }} />
                    {row.isPlayer ? (lang==="es"?"Tú":"You") : `Rival ${row.pos}`}
                  </td>
                  <td>{row.time}s</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="r2p__endBtns">
            <button className="r2p__endBtnPrimary" onClick={startRace}>{T[lang].restart} ↺</button>
            <button className="r2p__endBtnSecondary" onClick={() => setScreen("setup")}>{T[lang].backToSetup}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### 6G — `TrackPreviewCanvas` (componente auxiliar)

Mini-componente que dibuja un preview pequeño del trazado:
```js
function TrackPreviewCanvas({ track, active }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = canvas.offsetWidth * window.devicePixelRatio || 80;
    const H = canvas.height = canvas.offsetHeight * window.devicePixelRatio || 60;
    ctx.clearRect(0, 0, W, H);
    const env = ENVIRONMENTS[track.envId];
    ctx.fillStyle = env.bgColor;
    ctx.fillRect(0, 0, W, H);

    // Escalar puntos al preview
    const pts = track.raw;
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const pad = 0.15;
    const scX = W * (1 - pad*2) / (maxX - minX || 1);
    const scY = H * (1 - pad*2) / (maxY - minY || 1);
    const sc = Math.min(scX, scY);
    const ox = W/2 - ((maxX + minX)/2) * sc;
    const oy = H/2 - ((maxY + minY)/2) * sc;

    ctx.shadowBlur = 6;
    ctx.shadowColor = env.borderColor;
    ctx.strokeStyle = env.borderColor;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (let i = 0; i <= pts.length; i++) {
      const p = pts[i % pts.length];
      const px = p[0] * sc + ox, py = p[1] * sc + oy;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }, [track, active]);

  return <canvas ref={ref} className="r2p__trackPreview" />;
}
```

**Commit final:**
```bash
git add src/games/RaceGame2DPro.jsx
git commit -m "feat: complete RaceGame2DPro React component with game loop and UI"
```

---

### Task 7: Verificación

**Step 1:** `npm run dev` — debe compilar sin errores de TypeScript/ESLint.

**Step 2:** Abrir el juego desde el catálogo. Verificar:
- Setup screen con 18 circuitos en la grid, previews visibles
- Selectores de clima, dificultad, vueltas, rivales funcionan
- Al iniciar: semáforo 3 luces rojas → verde → GO!, grid boxes desaparecen
- Canvas renderiza pista con glow neon y colores del entorno
- Coches se mueven, teclado responde (flechas/WASD + Espacio turbo)
- HUD muestra posición, vuelta, velocidad y barra de turbo
- Minimap visible en esquina
- Al terminar: pantalla de leaderboard con opciones reiniciar/setup

**Step 3:** Probar los 3 modos de dificultad — fácil debe ser notablemente más lento y comete más errores.

**Step 4:** Probar lluvia — el coche debe deslizar más en curvas.

**Step 5:** Commit si hay ajustes menores.
```bash
git add src/games/RaceGame2DPro.jsx src/games/RaceGame2DPro.css
git commit -m "fix: post-verification adjustments RaceGame2DPro"
```
