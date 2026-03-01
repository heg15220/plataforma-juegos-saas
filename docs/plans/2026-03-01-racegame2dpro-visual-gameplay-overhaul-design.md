# RaceGame2DPro — Visual & Gameplay Overhaul Design

**Date:** 2026-03-01
**Author:** Claude Code
**Approach:** B — Complete refactor of rendering pipeline + physics improvements

---

## Summary

Deep improvement of RaceGame2DPro covering:
1. Full layered rendering pipeline with F1-quality track visuals
2. F1-style vectorial top-down cars with team liveries
3. Physics improvements: precise off-track detection, grip penalty, better AI racing line
4. Semaphore upgraded to 5-light F1 format

---

## Section 1: Rendering Pipeline (Layer System)

Rendering order (each layer drawn over the previous):

| Layer | Name | What it draws |
|-------|------|--------------|
| 0 | Background | Solid env color + decorative elements (trees, grandstands) |
| 1 | Wide runoff | ~60px band of gravel/grass/sand around asphalt |
| 2 | Barriers | Colored walls ~50px outside track edge (blue/orange/green per env) |
| 3 | Asphalt | Track surface with subtle transverse gradient (lighter center) |
| 4 | Track markings | Center line, DRS activation zone (blue stripe on long straights), full checkered finish line |
| 5 | Kerbs | Wide 8px bordillos on ALL corners with curvature > 0.015, 12px red/white stripes |
| 6 | White limits | 2.5px white edge lines on both sides |
| 7 | Tire marks | Dark persistent marks accumulating at corners |
| 8 | Cars + effects | F1 vectorial cars, trails, sparks, dust |

### Background decorations

Tree clusters and grandstands are generated once per track (seeded from track.id) and placed outside the runoff zone:
- Trees: circles in env color (dark green for jungle/arctic, brown for desert, etc.), radius 6–14px
- Grandstands: rectangles with stippled crowd texture, only near start/finish straight
- Both stored in `track.decorations` array, rendered before barriers

### Kerbs change
- lineWidth: 4.2px → **8px**
- Threshold: curvature > 0.022 → **curvature > 0.015** (appears on more corners)
- Segment length: 3 samples → **12px visual stripes** drawn with alternating colors
- Applied to **both sides** of track in all curves (current: conditional)

### Finish line change
- Current: 10 dots alternating black/white
- New: Full perpendicular rectangle across track width, composed of 8×6 checker squares, each ~(trackWidth/8) wide × 7px tall

---

## Section 2: F1 Cars (Top-Down Vectorial)

Each car drawn with Canvas 2D path commands in local coordinates.

### Drawing order

1. Drop shadow (semi-transparent black ellipse offset +3px)
2. Rear tires (black rounded rect 8×5px at ±8px lateral from center, rear)
3. Main body (trapezoid: wider at rear, tapers to nose)
4. Front wing (wide thin rect ~22px × 4px at nose)
5. Rear wing (rect ~18px × 5px at tail)
6. Front tires (same as rear, at front position)
7. Cockpit opening (dark ellipse)
8. Pilot helmet (small circle with contrasting color)
9. Car number (bold white text, 8px font)
10. Carbon fiber lines on nose (2 thin dark lines)

### Car dimensions (local coords, car faces right)
- Total length: 30px (nose at x=-15, tail at x=+15)
- Body width at center: 14px
- Body width at rear: 16px
- Front wing: x=-14 to x=-18, y=±11
- Rear wing: x=+12 to x=+16, y=±9

### Team liveries (8 slots)

| Slot | Primary | Secondary | Helmet |
|------|---------|-----------|--------|
| 0 (Player) | #e8001e (Ferrari red) | #ffffff | #ffff00 |
| 1 | #1e41ff (Blue) | #ffdd00 (Yellow) | #ffffff |
| 2 | #ff8000 (McLaren orange) | #000000 | #ffffff |
| 3 | #00d2be (Mercedes teal) | #c0c0c0 | #000000 |
| 4 | #3671c6 (Alpine blue) | #ff0000 | #ffffff |
| 5 | #900000 (Burgundy) | #ffd700 | #ffffff |
| 6 | #005aff (Williams blue) | #ffffff | #ff0000 |
| 7 | #2d826d (Aston green) | #cedc00 | #000000 |

---

## Section 3: Physics & Gameplay

### 3.1 Improved `closestS` (2-phase search)

```
Phase 1: Sample every (N/80) — same 80 checks as now
Phase 2: Fine-search ±20 samples around best result
→ 10× precision improvement with minimal CPU cost
```

### 3.2 Off-track penalty system

When `dist > trackHalfWidth`:
- `gripMult` → 0.40 (was effectively 0.86 via speed reduction)
- `maxSpeed` → clamped to 65% of normal
- Dust particles emitted (color from env.grassColor)
- Recovery: grip lerps back to normal over 0.5s after returning to asphalt

Track off-track state stored per car: `car.offTrack` (boolean), `car.offTrackRecovery` (0→1 timer)

### 3.3 AI racing line improvement

New lookahead system:
- Short lookahead (0.02) for immediate steering correction
- Long lookahead (0.08) for speed management through corners
- Apex positioning: on curves, target shifts to inside of corner at apex, outside on entry/exit
- Braking proportional: `brake = clamp((speed - targetSpeed) / 80, 0, 1)` instead of binary
- Overtake awareness: if another car is within 60px laterally and 40px ahead, shift racing line by 8px to attempt pass

### 3.4 Control improvements

Physics constants updates:
- `STEER_RATE`: 3.2 → **3.8**
- `GRIP_BASE`: 9.5 → **11.0**
- `CAR_RADIUS`: 14 → **12** (smaller collision radius feels better)

Added controls:
- Numpad arrows supported (Numpad8/2/4/6)
- `KeyW/A/S/D` already supported — no change

Light assisted braking:
- If player brakes (`brake > 0`) and curvature > 0.03, add 15% extra deceleration

### 3.5 F1 Semaphore (5 lights)

Replace 3-light system with 5-light F1 format:
- Lights 1-5 turn on one per 0.8s
- All 5 on for ~0.2s hold
- All extinguish simultaneously → race starts
- Visual: 5 red circular lights in a horizontal row, dark housing panel

---

## Section 4: Environment Enhancements

Each `ENVIRONMENTS` entry gets additional fields:

```js
{
  barrierColor: ...,    // color for TireWall/barrier objects
  runoffTexture: ...,   // 'gravel' | 'grass' | 'sand' | 'asphalt'
  treeColor: ...,       // color for decorative tree circles
  treeCount: ...,       // number of tree clusters per track
  hasCrowd: ...,        // boolean — grandstands near start/finish
}
```

| Environment | Barrier | Runoff | Trees | Crowd |
|-------------|---------|--------|-------|-------|
| neon-city | #1e5eff (blue) | asphalt | #3a6840 | true |
| volcano | #ff6600 (orange) | gravel | #5c4a2a | false |
| arctic | #4488ff (light blue) | snow-white | #2d5c40 | true |
| jungle | #228B22 (dark green) | grass | #1a5c20 | false |
| desert | #d4a017 (tan) | sand | #8B6914 | false |
| space (Grand Prix) | #0055ff (blue) | asphalt | #2a6030 | true |

---

## Files to Modify

| File | Change type |
|------|-------------|
| `src/games/RaceGame2DPro.jsx` | Major — all sections |
| `src/games/RaceGame2DPro.css` | Minor — semaphore 5 lights style |

No new files needed. All changes in-place.

---

## Out of Scope

- Multiplayer
- Sound effects
- Saving lap times / leaderboard persistence
- Mobile virtual joystick redesign (keep as-is)
