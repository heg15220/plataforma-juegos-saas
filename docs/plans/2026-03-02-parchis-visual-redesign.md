# Parchís Visual Redesign — Design Document

**Date:** 2026-03-02
**Status:** Approved

## Goal

Complete visual redesign of `ParchisStrategyGame.jsx` and its CSS in `styles.css`. The game logic (rules engine, AI, state machine) stays intact. Only the rendering layer changes.

## Board: SVG

- 600×600 viewBox SVG element, scales via `width: 100% / max-width: 620px`
- Classic cross-shaped Parchís board in SVG coordinates
- 68 outer track cells + 8 final lane cells per player
- Cell types: normal (white), safe (light blue + star icon), start (colored border), lane (player color)
- Home corners: colored rounded rect + inner circle ring + 4 piece slots
- Center: 4-color star shape

## Track Cell Coordinates

Computed once as JS constants using the cross-shape grid:
- Bottom arm: cols 6-8, rows 9-14 (cells 0-16 for red side going up)
- Right arm: cols 9-14, rows 6-8 (cells 17-33 for blue side going left)
- Top arm: cols 6-8, rows 0-5 (cells 34-50)
- Left arm: cols 0-5, rows 6-8 (cells 51-67)
Each cell = 40×40px. Grid starts at (0,0).

## Pieces

- SVG `<circle>` with radial gradient (light center → dark edge = 3D sphere effect)
- Shadow: second circle slightly offset, low opacity
- Slot number centered in white text
- Size: r=13 (normal), r=11 (stacked)
- Animated with CSS `transition: cx 400ms ease, cy 400ms ease` via inline style attributes

## Dice

- Two SVG dice components, 56×56px each
- `<rect>` base: rounded corners, white/light-gray gradient, drop shadow
- Pips: `<circle>` at standard positions for each face value 1-6
- Roll animation: CSS `@keyframes` doing `rotateX(360deg) scale(0.9, 1.1)` for 800ms
- Final value shown with a "settle" bounce (scale 1.2 → 1.0)

## Interactions

- After rolling: legal-move pieces get a CSS pulsing glow (`box-shadow` / SVG filter animation)
- Click piece → smooth move (400ms transition)
- Captured piece: flash red + return to home (CSS animation)
- Auto-move when only 1 legal action (no click needed, after 280ms delay)
- Keyboard shortcuts preserved (R=roll, N=new game)

## Layout

```
Desktop (>720px): Side by side
  Left: SVG board (flex: 1, max-width 580px)
  Right: control panel (min-width 200px)
    - Player score cards
    - Dice display
    - Roll button
    - AI status
    - Log (last 6 lines)

Mobile (<720px): Stacked
  Top: SVG board (full width)
  Bottom: control panel
```

## CSS Changes

- All new parchis styles after line ~5991 in styles.css
- Remove old `.parchis-track-grid`, `.parchis-track-cell`, `.parchis-lanes`, `.parchis-lane-*` (replaced by SVG)
- Keep `.parchis-strategy-game` base container styles
- New classes: `.parchis-svg-board`, `.parchis-panel`, `.parchis-die`, `.parchis-die.rolling`, `.parchis-piece-selectable`, `.parchis-piece-flash`

## Out of Scope

- 4-player mode (stays 1v1 human vs AI)
- Sound effects
- Undo/redo
- Multiplayer
