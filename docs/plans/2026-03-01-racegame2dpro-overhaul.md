# RaceGame2DPro — Visual & Gameplay Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform RaceGame2DPro into an F1-quality 2D racing game with layered track rendering, vectorial F1 cars, off-track physics penalty, improved AI racing line, and a 5-light F1 semaphore.

**Architecture:** All changes are in-place edits to `src/games/RaceGame2DPro.jsx` (1549 lines) and minor CSS changes to `src/games/RaceGame2DPro.css`. The rendering pipeline is restructured into 8 named layers. Physics functions are upgraded without breaking the existing game loop. No new files are created.

**Tech Stack:** React 18, Canvas 2D API, Catmull-Rom splines, native requestAnimationFrame game loop.

---

## Context: Current Code Structure

```
RaceGame2DPro.jsx sections:
  Section 1: Utilities (clamp, lerp, catmullRom) — lines 1-20
  Section 2: ENVIRONMENTS constant — lines 22-69
  Section 3: TRACKS array (18 tracks) — lines 71-297
  Section 4: AI_PROFILES, WEATHER_PROFILES, PHYS — lines 299-321
  Section 5: buildTrack, sampleTrackAt, closestS — lines 323-395
  Section 6: createCar, addSparks, updateSparks, updateCar, computeAiInput, checkLapCross — lines 397-575
  Section 7: renderBackground, updateFollowCamera, applyCameraTransform, renderTrack, renderStartGrid, renderCar, renderMinimap — lines 577-889
  Section 8: TrackPreviewCanvas component — lines 891-932
  Section 9: Main RaceGame2DPro component — lines 934-end
CSS root class: .r2p (NOT .race2dpro)
```

**Key constraints:**
- Component takes NO props (GameLaunchModal compatibility)
- Canvas 2D only, no WebGL, no external libraries
- `closestS` is called every frame per car — keep it fast
- `PHYS.CAR_RADIUS` used for collision detection
- Semaphore state: `{ phase: "off"|"countdown"|"go", lights: [bool,bool,bool] }` → will change to 5 bools

---

## Task 1: Enhance ENVIRONMENTS with new visual fields

**Files:**
- Modify: `src/games/RaceGame2DPro.jsx` (Section 2, lines 26-69)

**What to do:**
Replace the existing `ENVIRONMENTS` constant with an enhanced version that adds: `barrierColor`, `runoffColor` (improving existing), `treeColor`, `treeCount`, `hasCrowd`.

**Step 1: Replace the ENVIRONMENTS constant**

Find this exact block (lines 26-69):
```js
const ENVIRONMENTS = {
  "neon-city": {
    name: { es: "Circuito Urbano", en: "Urban Circuit" },
    roadColor: "#3f454d", borderColor: "#f6f6f6", glowColor: "rgba(255,255,255,0.12)",
    runoffColor: "#5c646f", kerbRed: "#d74444", kerbWhite: "#f3f3f3",
    bgColor: "#556273", grassColor: "#76808c", centerLineColor: "rgba(255,255,255,0.24)",
    starfield: false,
  },
```

Replace the entire `ENVIRONMENTS` constant with:

```js
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
```

**Step 2: Verify the app still runs**

Open http://localhost:5173 in browser, navigate to RaceGame2DPro, confirm setup screen loads without errors.

**Step 3: Commit**

```bash
git add src/games/RaceGame2DPro.jsx
git commit -m "feat(race2d): enhance ENVIRONMENTS with barrier, tree, crowd fields"
```

---

## Task 2: Improve `closestS` with 2-phase fine search

**Files:**
- Modify: `src/games/RaceGame2DPro.jsx` (Section 5, `closestS` function, ~line 386)

**What to do:**
Replace the single-pass search with a 2-phase approach: coarse sweep (80 checks) then fine refinement (±20 samples around best).

**Step 1: Replace `closestS` function**

Find:
```js
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
```

Replace with:
```js
function closestS(track, x, y) {
  const N = track.samples.length;
  let bestDist = Infinity, bestI = 0;
  // Phase 1: coarse sweep
  const step = Math.max(1, Math.floor(N / 80));
  for (let i = 0; i < N; i += step) {
    const s = track.samples[i];
    const d = Math.hypot(s.x - x, s.y - y);
    if (d < bestDist) { bestDist = d; bestI = i; }
  }
  // Phase 2: fine search ±20 samples around best
  const lo = bestI - 20, hi = bestI + 20;
  for (let i = lo; i <= hi; i++) {
    const idx = ((i % N) + N) % N;
    const s = track.samples[idx];
    const d = Math.hypot(s.x - x, s.y - y);
    if (d < bestDist) { bestDist = d; bestI = idx; }
  }
  return bestI / N;
}
```

**Step 2: Verify**

Start a race, drive around, car should stay firmly on track. No jitter at track boundaries.

**Step 3: Commit**

```bash
git add src/games/RaceGame2DPro.jsx
git commit -m "feat(race2d): closestS 2-phase fine search for 10x position precision"
```

---

## Task 3: Physics constants + off-track penalty system

**Files:**
- Modify: `src/games/RaceGame2DPro.jsx` (Section 4 PHYS + Section 6 `createCar` + `updateCar`)

**Step 1: Update PHYS constants**

Find:
```js
const PHYS = {
  MAX_SPEED: 420, ACCEL: 340, BRAKE_DECEL: 700, NATURAL_DECEL: 60,
  STEER_RATE: 3.2, GRIP_BASE: 9.5,
  TURBO_BOOST: 190, TURBO_DURATION: 1.8, TURBO_COOLDOWN: 6.0,
  TURBO_FILL_RATE: 0.13, NEAR_MISS_BONUS: 0.20,
  CAR_RADIUS: 14,
};
```

Replace with:
```js
const PHYS = {
  MAX_SPEED: 420, ACCEL: 340, BRAKE_DECEL: 700, NATURAL_DECEL: 60,
  STEER_RATE: 3.8, GRIP_BASE: 11.0,
  TURBO_BOOST: 190, TURBO_DURATION: 1.8, TURBO_COOLDOWN: 6.0,
  TURBO_FILL_RATE: 0.13, NEAR_MISS_BONUS: 0.20,
  CAR_RADIUS: 12,
  OFF_TRACK_GRIP: 0.40,
  OFF_TRACK_MAX_SPEED_FACTOR: 0.65,
  OFF_TRACK_RECOVERY: 0.5,
};
```

**Step 2: Add offTrack fields to `createCar`**

Find in `createCar`:
```js
    trail: [], sparks: [],
```

Replace with:
```js
    trail: [], sparks: [], dustParticles: [],
    offTrack: false, offTrackRecovery: 1.0,
```

**Step 3: Replace the track-constraint block in `updateCar`**

Find this block inside `updateCar` (lines ~472-483):
```js
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
```

Replace with:
```js
  // Constrain to track + off-track penalty
  const tw = track.trackWidth / 2;
  const cs = closestS(track, car.x, car.y);
  const closest = sampleTrackAt(track, cs);
  const dx = car.x - closest.x, dy = car.y - closest.y;
  const dist = Math.hypot(dx, dy);

  if (dist > tw + 4) {
    car.offTrack = true;
    car.offTrackRecovery = Math.max(0, car.offTrackRecovery - dt / PHYS.OFF_TRACK_RECOVERY);
    // Soft boundary push (gentler than before)
    const over = dist - (tw + 4);
    car.x -= (dx / dist) * over * 0.7;
    car.y -= (dy / dist) * over * 0.7;
    // Emit dust particles (max 3 per frame)
    if (car.dustParticles.length < 60 && Math.random() < 0.4) {
      const ang = Math.random() * Math.PI * 2;
      car.dustParticles.push({
        x: car.x, y: car.y,
        vx: Math.cos(ang) * (20 + Math.random() * 30),
        vy: Math.sin(ang) * (20 + Math.random() * 30),
        life: 0.6 + Math.random() * 0.4, maxLife: 1.0,
      });
    }
  } else {
    car.offTrack = false;
    car.offTrackRecovery = Math.min(1, car.offTrackRecovery + dt / PHYS.OFF_TRACK_RECOVERY);
  }

  // Update dust particles
  for (let i = car.dustParticles.length - 1; i >= 0; i--) {
    car.dustParticles[i].x += car.dustParticles[i].vx * dt;
    car.dustParticles[i].y += car.dustParticles[i].vy * dt;
    car.dustParticles[i].vx *= 0.92;
    car.dustParticles[i].vy *= 0.92;
    car.dustParticles[i].life -= dt;
    if (car.dustParticles[i].life <= 0) car.dustParticles.splice(i, 1);
  }
```

**Step 4: Apply off-track grip penalty to the physics**

Find in `updateCar` (just before the `// Constrain to track` section):
```js
  const grip = PHYS.GRIP_BASE * weatherProfile.gripMult;
```

Replace with:
```js
  const offTrackMult = car.offTrack ? lerp(PHYS.OFF_TRACK_GRIP, 1.0, car.offTrackRecovery) : 1.0;
  const grip = PHYS.GRIP_BASE * weatherProfile.gripMult * offTrackMult;
```

Also find in `updateCar`:
```js
  const maxSpeed = (PHYS.MAX_SPEED + turboBonus) * (car.aiProfile ? car.aiProfile.speedFactor : 1);
```

Replace with:
```js
  const offTrackSpeedFactor = car.offTrack ? lerp(PHYS.OFF_TRACK_MAX_SPEED_FACTOR, 1.0, car.offTrackRecovery) : 1.0;
  const maxSpeed = (PHYS.MAX_SPEED + turboBonus) * (car.aiProfile ? car.aiProfile.speedFactor : 1) * offTrackSpeedFactor;
```

**Step 5: Add light braking assist for player**

Find the steer/physics block in `updateCar`:
```js
  if (input.throttle > 0) car.speed += PHYS.ACCEL * dt * input.throttle;
  else if (input.brake > 0) car.speed -= PHYS.BRAKE_DECEL * dt * input.brake;
  else car.speed -= PHYS.NATURAL_DECEL * dt;
```

Replace with:
```js
  if (input.throttle > 0) car.speed += PHYS.ACCEL * dt * input.throttle;
  else if (input.brake > 0) {
    const brakeAssist = (car.isPlayer && closest.curvature > 0.03) ? 1.15 : 1.0;
    car.speed -= PHYS.BRAKE_DECEL * dt * input.brake * brakeAssist;
  } else car.speed -= PHYS.NATURAL_DECEL * dt;
```

**Step 6: Verify**

Start a race. Drive into the grass/runoff area and confirm:
- Car slows down more than before
- Dust particles appear around car
- Car recovers grip when returning to track

**Step 7: Commit**

```bash
git add src/games/RaceGame2DPro.jsx
git commit -m "feat(race2d): off-track grip penalty, dust particles, physics constants update"
```

---

## Task 4: Improved AI racing line with apex positioning

**Files:**
- Modify: `src/games/RaceGame2DPro.jsx` (Section 6, `computeAiInput` function, ~lines 527-563)

**Step 1: Replace `computeAiInput` entirely**

Find the entire `computeAiInput` function (lines 527-563) and replace with:

```js
function computeAiInput(car, track, weatherProfile, allCars) {
  const prof = car.aiProfile;
  const ai = car.ai;
  ai.t += 0.016;

  // Short lookahead for steering, long for braking
  const speedRatio = car.speed / PHYS.MAX_SPEED;
  const shortLook = 0.020 + speedRatio * 0.030;
  const longLook = 0.060 + speedRatio * 0.040;

  const targetS = wrap01(car.s + shortLook);
  const target = sampleTrackAt(track, targetS);
  const longTarget = sampleTrackAt(track, wrap01(car.s + longLook));

  // Compute corner type at short lookahead
  const curvatureAhead = target.curvature;
  const isCorner = curvatureAhead > 0.018;

  // Racing line: outside → apex → outside
  // Determine inside of corner using curvature sign proxy
  const nx = -Math.sin(target.ang), ny = Math.cos(target.ang);
  let apexOffset = 0;
  if (isCorner) {
    // Check which side is inside by sampling angle change
    const prev = sampleTrackAt(track, wrap01(targetS - 0.005));
    const angleChange = angNorm(target.ang - prev.ang);
    // Positive angle change = turning left → inside is left → nx side
    // Move toward inside at apex
    apexOffset = Math.sign(angleChange) * track.trackWidth * 0.28 * prof.apexPrecision;
  }

  // Add small oscillating error + personal line offset
  const noiseOffset = Math.sin(ai.t * 0.35 + ai.noiseSeed) * track.trackWidth * prof.lineOffset * 0.4;
  const lateralOff = apexOffset + noiseOffset + ai.lineOffset * prof.lineOffset * track.trackWidth * 0.15;

  // Overtake awareness: check nearby cars
  let overtakeShift = 0;
  for (const other of allCars) {
    if (other.id === car.id) continue;
    const rdx = other.x - car.x, rdy = other.y - car.y;
    const along = rdx * Math.cos(car.a) + rdy * Math.sin(car.a);
    const lateral = -rdx * Math.sin(car.a) + rdy * Math.cos(car.a);
    if (along > 0 && along < 60 && Math.abs(lateral) < 24) {
      overtakeShift = lateral < 0 ? 10 : -10;
    }
  }

  const tx = target.x + nx * (lateralOff + overtakeShift);
  const ty = target.y + ny * (lateralOff + overtakeShift);

  let angleDiff = angNorm(Math.atan2(ty - car.y, tx - car.x) - car.a);
  if (Math.random() < prof.errorRate) angleDiff += (Math.random() - 0.5) * prof.errorMag * 2;
  const steer = clamp(angleDiff * 2.8, -1, 1);

  // Proportional braking (not binary)
  const targetSpeed = longTarget.speedLimit * prof.speedFactor * weatherProfile.gripMult;
  const speedDiff = car.speed - targetSpeed;
  const throttle = speedDiff < -10 ? clamp((targetSpeed - car.speed) / 60, 0, 1) : 0.3;
  const brake = speedDiff > 0 ? clamp(speedDiff / 80, 0, 1) : 0;

  const useTurbo = Math.random() < prof.turboUse &&
    car.turbo > 0.75 &&
    longTarget.curvature < 0.016 &&
    !car.turboActive &&
    car.turboCooldown <= 0;

  return { throttle, brake, steer, useTurbo };
}
```

**Step 2: Update all call sites of `computeAiInput`**

In the game loop (Section 9), find:
```js
            const aiIn = computeAiInput(car, g.track, g.weather);
```

Replace with:
```js
            const aiIn = computeAiInput(car, g.track, g.weather, g.cars);
```

**Step 3: Verify**

Start race on medium difficulty. AI cars should:
- Take proper racing lines through corners (cut to inside at apex)
- Not brake as suddenly/erratically as before
- Attempt overtakes

**Step 4: Commit**

```bash
git add src/games/RaceGame2DPro.jsx
git commit -m "feat(race2d): AI apex racing line, proportional braking, overtake awareness"
```

---

## Task 5: F1 5-light semaphore system

**Files:**
- Modify: `src/games/RaceGame2DPro.jsx` (Section 4 constants + Section 9 countdown logic)
- Modify: `src/games/RaceGame2DPro.css` (semaphore styles)

**Step 1: Update semaphore initial state**

In Section 9, find:
```js
  const [semaphore, setSemaphore] = useState({ phase: "off", lights: [false, false, false] });
```

Replace with:
```js
  const [semaphore, setSemaphore] = useState({ phase: "off", lights: [false, false, false, false, false] });
```

**Step 2: Update countdown logic in game loop**

Find the countdown block (lines ~1231-1252):
```js
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
```

Replace with:
```js
      if (g.startPhase === "countdown") {
        g.startTimer += dt;
        if (g.startTimer >= 0.80 * (g.countdownStep + 1)) {
          g.countdownStep++;
          if (g.countdownStep <= 5) {
            const lights = [false, false, false, false, false];
            for (let i = 0; i < g.countdownStep; i++) lights[i] = true;
            setSemaphore({ phase: "countdown", lights });
          } else if (g.countdownStep === 6) {
            // All 5 lit — hold briefly then GO
            setSemaphore({ phase: "countdown", lights: [true, true, true, true, true] });
          } else {
            g.startPhase = "fading";
            g.phaseTimer = 0;
            setSemaphore({ phase: "go", lights: [false, false, false, false, false] });
          }
        }
      } else if (g.startPhase === "fading") {
        g.phaseTimer += dt;
        if (g.phaseTimer >= 0.55) {
          g.startPhase = "racing";
          g._raceStartTime = performance.now();
          setSemaphore({ phase: "off", lights: [false, false, false, false, false] });
        }
      }
```

**Step 3: Update semaphore JSX in the race screen**

In Section 9 JSX, find the semaphore render block (look for `r2p__semaphore` or the lights rendering). It should be something like:
```jsx
{semaphore.phase !== "off" && (
  <div className="r2p__semaphore">
    ...3 lights...
  </div>
)}
```

Replace the lights mapping to iterate over 5 lights:
```jsx
{semaphore.phase !== "off" && (
  <div className="r2p__semaphore">
    <div className="r2p__semLights">
      {semaphore.lights.map((on, i) => (
        <div key={i} className={`r2p__semLight${on ? " isOn" : ""}`} />
      ))}
    </div>
    {semaphore.phase === "go" && <div className="r2p__semGo">GO!</div>}
  </div>
)}
```

**Step 4: Update CSS for 5-light semaphore**

In `src/games/RaceGame2DPro.css`, find the `.r2p__semaphore` block and update to accommodate 5 lights. Add/update:

```css
.r2p__semaphore {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 30;
  pointer-events: none;
}

.r2p__semLights {
  display: flex;
  gap: 10px;
  background: rgba(10, 10, 14, 0.92);
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 14px;
  padding: 12px 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
}

.r2p__semLight {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(80, 0, 0, 0.7);
  border: 2px solid rgba(255,255,255,0.15);
  transition: background 0.1s ease, box-shadow 0.1s ease;
}

.r2p__semLight.isOn {
  background: #e80000;
  box-shadow: 0 0 16px 6px rgba(255, 0, 0, 0.7), 0 0 4px 1px #ff4444;
}

.r2p__semGo {
  font-size: 2.4rem;
  font-weight: 900;
  color: #39ff14;
  text-shadow: 0 0 20px rgba(57, 255, 20, 0.8), 0 0 40px rgba(57, 255, 20, 0.4);
  letter-spacing: 0.05em;
  animation: r2p-go-pulse 0.3s ease-out;
}

@keyframes r2p-go-pulse {
  0% { transform: scale(0.6); opacity: 0; }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}
```

**Step 5: Verify**

Start a race. Confirm: 5 red lights appear one by one, all light up, then all go dark simultaneously with "GO!" flash.

**Step 6: Commit**

```bash
git add src/games/RaceGame2DPro.jsx src/games/RaceGame2DPro.css
git commit -m "feat(race2d): F1 5-light semaphore with GO animation"
```

---

## Task 6: Improved track rendering — kerbs, barriers, finish line

**Files:**
- Modify: `src/games/RaceGame2DPro.jsx` (Section 7, `renderTrack` function, lines ~641-748)

**Step 1: Replace the entire `renderTrack` function**

Find `function renderTrack(ctx, track, env) {` and replace the entire function with:

```js
function renderTrack(ctx, track, env) {
  const samples = track.samples;
  const N = samples.length;
  const hw = track.trackWidth / 2;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // ── Layer 1: Wide runoff band ──────────────────────────────────────────
  const runoffW = track.trackWidth + 70;
  let runoffColor = env.runoffColor;
  if (env.runoffType === "grass") runoffColor = env.grassColor || "#2a6030";
  else if (env.runoffType === "sand") runoffColor = env.runoffColor || "#c8a058";
  else if (env.runoffType === "snow") runoffColor = "#dce8f0";
  else if (env.runoffType === "gravel") runoffColor = "#8a7860";

  ctx.beginPath();
  ctx.strokeStyle = runoffColor;
  ctx.lineWidth = runoffW;
  for (let i = 0; i <= N; i++) {
    const s = samples[i % N];
    i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y);
  }
  ctx.stroke();

  // ── Layer 2: Barriers (colored walls) ──────────────────────────────────
  const barrierOffset = hw + 36;
  ctx.lineWidth = 5;
  ctx.strokeStyle = env.barrierColor || "#1e5eff";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const s = samples[i % N];
      const nx = -Math.sin(s.ang) * barrierOffset * side;
      const ny = Math.cos(s.ang) * barrierOffset * side;
      i === 0 ? ctx.moveTo(s.x + nx, s.y + ny) : ctx.lineTo(s.x + nx, s.y + ny);
    }
    ctx.stroke();
  }

  // ── Layer 3: Asphalt with subtle gradient-like shading ──────────────────
  ctx.beginPath();
  ctx.strokeStyle = env.roadColor;
  ctx.lineWidth = track.trackWidth + 2;
  for (let i = 0; i <= N; i++) {
    const s = samples[i % N];
    i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y);
  }
  ctx.stroke();

  // Lighter center strip for depth
  ctx.beginPath();
  const centerColor = env.roadColor.replace(/#/, '');
  const r = parseInt(centerColor.substring(0,2), 16);
  const g2 = parseInt(centerColor.substring(2,4), 16);
  const b = parseInt(centerColor.substring(4,6), 16);
  ctx.strokeStyle = `rgba(${Math.min(255,r+18)},${Math.min(255,g2+18)},${Math.min(255,b+18)},0.5)`;
  ctx.lineWidth = track.trackWidth * 0.5;
  for (let i = 0; i <= N; i++) {
    const s = samples[i % N];
    i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y);
  }
  ctx.stroke();

  // ── Layer 4a: Dashed center line ───────────────────────────────────────
  ctx.setLineDash([20, 15]);
  ctx.strokeStyle = env.centerLineColor;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const s = samples[i % N];
    i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // ── Layer 4b: Finish line (full checker rectangle) ──────────────────────
  const finIdx = Math.floor(0.03 * N);
  const fs = samples[finIdx];
  const fsNext = samples[(finIdx + 3) % N];
  const finLen = 10; // depth of finish line along track direction
  const sqW = Math.max(6, track.trackWidth / 8);
  const sqH = finLen;
  const numSq = Math.round(track.trackWidth / sqW);

  ctx.save();
  ctx.translate(fs.x, fs.y);
  ctx.rotate(fs.ang);
  for (let col = 0; col < numSq; col++) {
    for (let row = 0; row < 2; row++) {
      const isWhite = (col + row) % 2 === 0;
      ctx.fillStyle = isWhite ? "#ffffff" : "#1a1a1a";
      const fx = -sqH / 2 + row * sqH;
      const fy = -track.trackWidth / 2 + col * sqW;
      ctx.fillRect(fx, fy, sqH, sqW);
    }
  }
  ctx.restore();

  // ── Layer 5: Kerbs (wide, on all significant corners) ──────────────────
  const kerbWidth = 8;
  const kerbThreshold = 0.015;
  const kerbSegLen = 14; // approx px between color changes

  let kerbAccum = 0;
  let kerbColorIdx = 0;
  ctx.lineWidth = kerbWidth;

  for (let i = 0; i < N - 1; i++) {
    const a = samples[i];
    const b = samples[i + 1];
    const curvature = (a.curvature + b.curvature) * 0.5;
    if (curvature < kerbThreshold) { kerbAccum = 0; continue; }

    // Segment length in px
    const segPx = Math.hypot(b.x - a.x, b.y - a.y);
    kerbAccum += segPx;
    if (kerbAccum > kerbSegLen) { kerbColorIdx++; kerbAccum = 0; }

    const anX = -Math.sin(a.ang), anY = Math.cos(a.ang);
    const bnX = -Math.sin(b.ang), bnY = Math.cos(b.ang);

    for (const side of [-1, 1]) {
      const ax = a.x + anX * hw * side;
      const ay = a.y + anY * hw * side;
      const bx = b.x + bnX * hw * side;
      const by = b.y + bnY * hw * side;
      const colorFlip = (kerbColorIdx + (side === 1 ? 0 : 1)) % 2 === 0;
      ctx.strokeStyle = colorFlip ? (env.kerbRed || "#e03030") : (env.kerbWhite || "#f3f3f3");
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
  }

  // ── Layer 6: White track edge lines ────────────────────────────────────
  ctx.save();
  ctx.shadowBlur = 8;
  ctx.shadowColor = "rgba(255,255,255,0.3)";
  ctx.strokeStyle = env.borderColor;
  ctx.lineWidth = 2.5;

  for (const side of [-1, 1]) {
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const s = samples[i % N];
      const nx = -Math.sin(s.ang) * hw * side;
      const ny = Math.cos(s.ang) * hw * side;
      i === 0 ? ctx.moveTo(s.x + nx, s.y + ny) : ctx.lineTo(s.x + nx, s.y + ny);
    }
    ctx.stroke();
  }
  ctx.restore();
}
```

**Step 2: Verify visually**

Start race. Check:
- Runoff area visible around track (different color from background)
- Blue/orange/green barrier line outside runoff
- Kerbs are wide and prominent on corners
- Finish line is a proper checkered rectangle

**Step 3: Commit**

```bash
git add src/games/RaceGame2DPro.jsx
git commit -m "feat(race2d): layered track rendering - runoff, barriers, wide kerbs, proper finish line"
```

---

## Task 7: Background decorations (trees & grandstands)

**Files:**
- Modify: `src/games/RaceGame2DPro.jsx` (Section 5 `buildTrack` + Section 7 `renderBackground`)

**Step 1: Add decoration generation to `buildTrack`**

Find in `buildTrack` the return statement:
```js
  return { samples, totalLength, startS: 0.03, trackWidth: trackDef.trackWidth || 48 };
```

Replace with:
```js
  // Generate decorations (trees + grandstand) seeded by track id
  const decorations = [];
  const rng = (() => { let s = (trackDef.id * 9301 + 49297) % 233280; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; })();

  const env = ENVIRONMENTS[trackDef.envId];
  const treeCount = env.treeCount || 16;
  const outerOffset = trackDef.trackWidth / 2 + 80;

  // Trees: placed around the track at random sample points, pushed outward
  for (let t = 0; t < treeCount; t++) {
    const si = Math.floor(rng() * SAMPLES);
    const sp = samples[si];
    const side = rng() > 0.5 ? 1 : -1;
    const dist2 = outerOffset + rng() * 80;
    const nx = -Math.sin(sp.ang), ny = Math.cos(sp.ang);
    const radius = 6 + rng() * 12;
    decorations.push({
      type: "tree",
      x: sp.x + nx * dist2 * side,
      y: sp.y + ny * dist2 * side,
      radius,
      color: env.treeColor || "#1e5a28",
    });
  }

  // Grandstand: near start/finish if hasCrowd
  if (env.hasCrowd) {
    const startSample = samples[Math.floor(0.03 * SAMPLES)];
    const nx = -Math.sin(startSample.ang), ny = Math.cos(startSample.ang);
    const side = 1;
    const dist3 = trackDef.trackWidth / 2 + 65;
    const along = Math.cos(startSample.ang), alongY = Math.sin(startSample.ang);
    for (let row = 0; row < 3; row++) {
      for (let col = -4; col <= 4; col++) {
        const cx = startSample.x + nx * (dist3 + row * 14) * side + along * col * 16;
        const cy = startSample.y + ny * (dist3 + row * 14) * side + alongY * col * 16;
        decorations.push({ type: "crowd", x: cx, y: cy, row, col });
      }
    }
    // Grandstand roof
    decorations.push({
      type: "stand",
      x: startSample.x + nx * (dist3 + 20) * side,
      y: startSample.y + ny * (dist3 + 20) * side,
      ang: startSample.ang,
      w: 160, h: 50,
    });
  }

  return { samples, totalLength, startS: 0.03, trackWidth: trackDef.trackWidth || 48, decorations };
```

**Step 2: Add decoration rendering to `renderBackground`**

Find `function renderBackground(ctx, w, h, env, weatherProfile, starfield, time)` and add decoration rendering at the end of the function. After the rain overlay block, add:

```js
// This function receives track decorations separately — no change needed here
// Decorations are rendered by a new function below
```

Then add a NEW function right after `renderBackground`:

```js
function renderDecorations(ctx, track, env) {
  if (!track.decorations) return;
  for (const d of track.decorations) {
    if (d.type === "tree") {
      // Canopy shadow
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      ctx.ellipse(d.x + 3, d.y + 4, d.radius * 0.9, d.radius * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      // Tree canopy (darker outer ring + lighter center)
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      ctx.fill();
      const brightColor = d.color.replace(/#/, '');
      const tr = Math.min(255, parseInt(brightColor.substring(0,2), 16) + 30);
      const tg = Math.min(255, parseInt(brightColor.substring(2,4), 16) + 30);
      const tb = Math.min(255, parseInt(brightColor.substring(4,6), 16) + 20);
      ctx.fillStyle = `rgb(${tr},${tg},${tb})`;
      ctx.beginPath();
      ctx.arc(d.x - d.radius * 0.2, d.y - d.radius * 0.2, d.radius * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (d.type === "stand") {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.ang + Math.PI / 2);
      // Stand structure
      ctx.fillStyle = "rgba(60,60,80,0.85)";
      ctx.fillRect(-d.w / 2, -d.h / 2, d.w, d.h);
      // Roof
      ctx.fillStyle = "rgba(30,30,50,0.9)";
      ctx.fillRect(-d.w / 2, -d.h / 2, d.w, 10);
      ctx.restore();
    } else if (d.type === "crowd") {
      // Individual crowd person dot
      const crowdColors = ["#c44", "#c84", "#48c", "#8c4", "#c48", "#888"];
      ctx.fillStyle = crowdColors[(d.row * 3 + (d.col + 4)) % crowdColors.length];
      ctx.beginPath();
      ctx.arc(d.x, d.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
```

**Step 3: Call `renderDecorations` in the game loop**

In the game loop render block, find:
```js
      applyCameraTransform(ctx, g.camera, W, H);
      renderTrack(ctx, g.track, g.env);
```

Replace with:
```js
      applyCameraTransform(ctx, g.camera, W, H);
      renderDecorations(ctx, g.track, g.env);
      renderTrack(ctx, g.track, g.env);
```

**Step 4: Verify visually**

Start race. Trees should appear outside the barriers. Grandstand with crowd dots should be visible near start/finish on city/arctic/grandprix environments.

**Step 5: Commit**

```bash
git add src/games/RaceGame2DPro.jsx
git commit -m "feat(race2d): trees and grandstand decorations generated per track"
```

---

## Task 8: F1 vectorial car rendering

**Files:**
- Modify: `src/games/RaceGame2DPro.jsx` (Section 7, `renderCar` function + `CAR_COLORS` constant)

**Step 1: Replace `CAR_COLORS` with team liveries**

Find:
```js
const CAR_COLORS = [
  "#00f5ff", "#ff4500", "#39ff14", "#ffd700",
  "#bf00ff", "#ff69b4", "#00bfff", "#ff8c00",
];
```

Replace with:
```js
const CAR_LIVERIES = [
  { primary: "#e8001e", secondary: "#ffffff", helmet: "#ffff00", number: "#ffffff" }, // Ferrari red
  { primary: "#1e41ff", secondary: "#ffdd00", helmet: "#ffffff", number: "#ffdd00" }, // Blue/Yellow
  { primary: "#ff8000", secondary: "#000000", helmet: "#ffffff", number: "#000000" }, // McLaren orange
  { primary: "#00d2be", secondary: "#c0c0c0", helmet: "#000000", number: "#000000" }, // Mercedes teal
  { primary: "#3671c6", secondary: "#ff0000", helmet: "#ffffff", number: "#ff0000" }, // Alpine blue
  { primary: "#900000", secondary: "#ffd700", helmet: "#ffffff", number: "#ffd700" }, // Burgundy
  { primary: "#005aff", secondary: "#ffffff", helmet: "#ff0000", number: "#ffffff" }, // Williams blue
  { primary: "#2d826d", secondary: "#cedc00", helmet: "#000000", number: "#cedc00" }, // Aston green
];
// Keep CAR_COLORS for backward compat with minimap
const CAR_COLORS = CAR_LIVERIES.map(l => l.primary);
```

**Step 2: Replace `createCar` to include livery**

Find in `createCar`:
```js
function createCar(id, isPlayer, color, aiDifficulty) {
  return {
    id, isPlayer, color,
```

Replace with:
```js
function createCar(id, isPlayer, color, aiDifficulty) {
  const livery = CAR_LIVERIES[id % CAR_LIVERIES.length];
  return {
    id, isPlayer, color: livery.primary, livery,
```

**Step 3: Replace `renderCar` function entirely**

Find `function renderCar(ctx, car, isPlayer) {` and replace the entire function:

```js
function renderCar(ctx, car, isPlayer) {
  if (!car) return;
  const livery = car.livery || { primary: car.color, secondary: "#ffffff", helmet: "#ffffff", number: "#ffffff" };

  // ── Trail ──
  for (let i = 0; i < car.trail.length; i++) {
    const t = car.trail[i];
    const alpha = (1 - i / car.trail.length) * (isPlayer ? 0.35 : 0.18);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(t.x, t.y); ctx.rotate(t.a);
    ctx.fillStyle = livery.primary;
    ctx.beginPath();
    ctx.ellipse(0, 0, Math.max(0.1, 7 - i * 0.2), Math.max(0.1, 3.5 - i * 0.08), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Turbo flame ──
  if (car.turboActive) {
    ctx.save();
    ctx.translate(car.x, car.y); ctx.rotate(car.a);
    for (let f = 0; f < 3; f++) {
      const fScale = 1 - f * 0.25;
      ctx.globalAlpha = 0.55 * fScale;
      ctx.fillStyle = f === 0 ? "#ffffff" : f === 1 ? "#ffe060" : "#ff6020";
      ctx.beginPath();
      ctx.ellipse(-16 - f * 5, 0, (12 - f * 3) * fScale, (5 - f) * fScale, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ── Dust particles ──
  if (car.dustParticles) {
    for (const dp of car.dustParticles) {
      const alpha = (dp.life / dp.maxLife) * 0.55;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(180,160,120,0.8)";
      ctx.beginPath();
      ctx.arc(dp.x, dp.y, 4 * (dp.life / dp.maxLife), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ── Car body ──
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.a);

  if (isPlayer) {
    ctx.shadowBlur = 20;
    ctx.shadowColor = livery.primary;
  }

  // 1. Drop shadow
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.beginPath();
  ctx.ellipse(3, 3, 16, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Rear tires
  ctx.fillStyle = "#111111";
  // Rear left
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(6, -10, 8, 5, 2);
  else ctx.rect(6, -10, 8, 5);
  ctx.fill();
  // Rear right
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(6, 5, 8, 5, 2);
  else ctx.rect(6, 5, 8, 5);
  ctx.fill();

  // 3. Main body (trapezoid via polygon)
  ctx.fillStyle = livery.primary;
  ctx.beginPath();
  ctx.moveTo(-14, -6);   // nose left
  ctx.lineTo(14, -8);    // rear left
  ctx.lineTo(14, 8);     // rear right
  ctx.lineTo(-14, 6);    // nose right
  ctx.closePath();
  ctx.fill();

  // Secondary color stripe on body
  ctx.fillStyle = livery.secondary;
  ctx.beginPath();
  ctx.moveTo(-6, -4.5);
  ctx.lineTo(10, -5.5);
  ctx.lineTo(10, -3.5);
  ctx.lineTo(-6, -2.5);
  ctx.closePath();
  ctx.fill();

  // 4. Front wing (wide, thin)
  ctx.fillStyle = livery.secondary;
  ctx.beginPath();
  ctx.moveTo(-14, -12);
  ctx.lineTo(-10, -8);
  ctx.lineTo(-10, 8);
  ctx.lineTo(-14, 12);
  ctx.closePath();
  ctx.fill();
  // Front wing endplates
  ctx.fillStyle = livery.primary;
  ctx.fillRect(-15, -13, 3, 4);
  ctx.fillRect(-15, 9, 3, 4);

  // 5. Rear wing
  ctx.fillStyle = livery.secondary;
  ctx.fillRect(11, -10, 5, 20);
  // Rear wing support struts
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(13, -5, 1, 10);

  // 6. Front tires
  ctx.fillStyle = "#111111";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-14, -10, 8, 5, 2);
  else ctx.rect(-14, -10, 8, 5);
  ctx.fill();
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-14, 5, 8, 5, 2);
  else ctx.rect(-14, 5, 8, 5);
  ctx.fill();

  // Tire shine
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(-13, -10, 3, 2);
  ctx.fillRect(-13, 5, 3, 2);
  ctx.fillRect(7, -10, 3, 2);
  ctx.fillRect(7, 5, 3, 2);

  // 7. Cockpit opening
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-2, -4, 10, 8, 4);
  else ctx.rect(-2, -4, 10, 8);
  ctx.fill();

  // 8. Halo safety device (thin arc over cockpit)
  ctx.strokeStyle = "rgba(200,200,200,0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(2, 0, 5, Math.PI, 0);
  ctx.stroke();

  // 9. Pilot helmet
  ctx.fillStyle = livery.helmet;
  ctx.beginPath();
  ctx.arc(1, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(0,180,255,0.7)"; // visor
  ctx.beginPath();
  ctx.arc(2, 0, 2, -0.8, 0.8);
  ctx.fill();

  // 10. Car number
  ctx.fillStyle = livery.number;
  ctx.font = "bold 6px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(car.id === 0 ? "P1" : String(car.id), 7, 0);

  ctx.restore();

  // ── Sparks ──
  for (const s of car.sparks) {
    const alpha = s.life / s.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#ffcc40";
    ctx.shadowBlur = 6; ctx.shadowColor = "#ffaa00";
    ctx.beginPath(); ctx.arc(s.x, s.y, 2.0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}
```

**Step 4: Verify visually**

Start race. Cars should look like top-down F1 cars with:
- Visible front and rear wings
- Tires at all 4 corners
- Cockpit with helmet
- Team colors and livery stripe

**Step 5: Commit**

```bash
git add src/games/RaceGame2DPro.jsx
git commit -m "feat(race2d): F1 vectorial top-down cars with team liveries and wings"
```

---

## Task 9: Add numpad controls + keyboard hint update

**Files:**
- Modify: `src/games/RaceGame2DPro.jsx` (game loop keyboard handling, ~line 1268)

**Step 1: Add numpad support to keyboard input**

Find in the game loop:
```js
        if (keys.has("ArrowUp") || keys.has("KeyW")) throttle = 1;
        if (keys.has("ArrowDown") || keys.has("KeyS")) brake = 1;
        if (keys.has("ArrowLeft") || keys.has("KeyA")) steer = -1;
        if (keys.has("ArrowRight") || keys.has("KeyD")) steer = 1;
```

Replace with:
```js
        if (keys.has("ArrowUp") || keys.has("KeyW") || keys.has("Numpad8")) throttle = 1;
        if (keys.has("ArrowDown") || keys.has("KeyS") || keys.has("Numpad2")) brake = 1;
        if (keys.has("ArrowLeft") || keys.has("KeyA") || keys.has("Numpad4")) steer = -1;
        if (keys.has("ArrowRight") || keys.has("KeyD") || keys.has("Numpad6")) steer = 1;
```

Also prevent default for numpad keys. Find:
```js
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
      }
```

Replace with:
```js
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
           "Numpad8", "Numpad2", "Numpad4", "Numpad6"].includes(e.code)) {
        e.preventDefault();
      }
```

**Step 2: Commit**

```bash
git add src/games/RaceGame2DPro.jsx
git commit -m "feat(race2d): add numpad arrow controls"
```

---

## Task 10: Final integration verification

**What to check:**

1. **Setup screen** — 18 track cards load, previews render, all options work
2. **Race start** — 5 red lights appear one by one, all go dark, race starts
3. **Player car** — Looks like F1 car, responds to keyboard, can use turbo (Space)
4. **Off-track** — Driving on grass/sand/gravel slows car, dust particles appear
5. **Track visuals** — Runoff area, barriers, wide kerbs on corners, checkered finish line
6. **Trees/crowd** — Visible outside barriers on city/arctic/grandprix circuits
7. **AI** — Cars follow racing lines, take apexes, attempt overtakes
8. **Race end** — Leaderboard shows correctly with car colors

**If something is broken:**

- If decorations cause performance issues: reduce `treeCount` in all envs to 8
- If kerbs are invisible: check `kerbThreshold` — lower to 0.010 if needed
- If cars disappear off-track: check the `tw + 4` boundary in the constraint — increase to `tw + 8`
- If 5-light semaphore doesn't show: check JSX for `semaphore.lights.map` iterating all 5

**Final commit:**

```bash
git add src/games/RaceGame2DPro.jsx src/games/RaceGame2DPro.css
git commit -m "feat(race2d): complete visual & gameplay overhaul - F1 cars, layered track, off-track physics"
```
