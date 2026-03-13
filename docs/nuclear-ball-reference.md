# NuclearBall Reference

Generated on 2026-03-13.

## Upstream project
- Source: https://github.com/AdriPanG/DVI/tree/master/NuclearBall
- License: MIT
- Copyright: Adrian Panadero Gonzalez y Juan Jose Prieto Escolar

## Local usage in `arcade-reactor-toss`
- Active upstream assets in runtime:
  - `throw.mp3`
  - `explosion.mp3`
  - `lose.mp3`
  - `poison.mp3`
- Local visual copies kept as reference/documentation:
  - `background.png`
  - `ball.png`
  - `ball2.png`
  - `ball3.png`
  - `ball4.png`
  - `BarrelRed.png`
  - `BarrelGreen.png`
  - `Box.png`
  - `Spike.png`
  - `saw.png`
  - `bomb.png`

## Implementation notes
- `src/games/arcade/reactor-toss/` reimplements the runtime, physics, UI, collision model, mission layouts, and QA hooks from scratch.
- The current visuals are redrawn into a softer pastel / toy-like environment to match the user-provided reference image while keeping NuclearBall as a licensed upstream inspiration.
- The upstream MIT license text is stored in `src/games/arcade/reactor-toss/UPSTREAM_LICENSE.txt`.
