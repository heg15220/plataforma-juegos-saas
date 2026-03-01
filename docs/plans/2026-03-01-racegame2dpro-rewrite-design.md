# RaceGame2DPro — Complete Rewrite Design

**Date:** 2026-03-01
**Goal:** Rewrite RaceGame2DPro as a professional neon-themed top-down 2D racing game with 18 circuits, 3 AI difficulty modes, turbo, weather, and full visual polish.

---

## Visual Style
- **Perspective:** Top-down cenital (bird's eye)
- **Theme:** Neon / Futuristic — dark backgrounds, glowing track borders, vibrant car colors
- **Environments:** 6 neon environments × 3 track layouts each = 18 circuits

## Environments & Palettes
| ID | Name | Asphalt | Border glow | Bg color |
|----|------|---------|-------------|----------|
| neon-city | Neon City | #1a1a2e | #00f5ff cyan | #080812 |
| volcano | Volcano Ridge | #1a0a00 | #ff4500 orange | #0d0500 |
| arctic | Arctic Circuit | #0d1b2a | #a8e0ff ice blue | #060d14 |
| jungle | Jungle Speedway | #0d1a0d | #39ff14 green | #060d06 |
| desert | Desert Run | #1a120a | #ffd700 gold | #0d0a05 |
| space | Space Ring | #050510 | #bf00ff magenta | #020208 |

## Track Layout Types (3 per environment)
- **flow**: Long sweeping corners, few straights — rewards smooth driving
- **technical**: Many tight slow corners, chicanes — punishes poor braking
- **oval+**: Long straights + heavy corners at ends — turbo-friendly

## Mechanics
- **Turbo**: Accumulates by near-misses and clean corners. Space to activate. Visual: neon trail.
- **Weather**: Dry / Rain / Dusk — chosen at setup. Rain: grip -25%, sliding physics. Dusk: canvas fog overlay.
- **No damage system** (not requested)
- **No items** (not requested)

## AI Difficulty
| Mode | Speed | Line | Braking | Errors | Turbo use |
|------|-------|------|---------|--------|-----------|
| Easy | -20% max | Wide line | Early | Frequent | Never |
| Medium | -8% max | Semi-ideal | On point | Occasional | Rarely |
| Hard | 100% max | Apex-perfect | Late | Rare | Strategic |

## Screens
1. **Setup**: Circuit selector (with inline mini-preview of track shape), weather, difficulty, laps, rivals count
2. **Race**: HUD (position, lap, speed, turbo bar, weather icon, minimap with car dots)
3. **Starting grid**: Traffic lights (3 red → green), grid boxes dissolve on GO
4. **Finish**: Animated leaderboard with lap times

## Canvas Effects
- Track border: shadowBlur glow matching environment color
- Car trail: fading neon trail behind each car
- Collision sparks: small particle burst
- Rain overlay: diagonal semi-transparent lines
- Space bg: animated star field
- Turbo activation: flash + elongated trail
