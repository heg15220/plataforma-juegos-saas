# Race 2D Pro Track Methodology

`RaceGame2DPro` uses a new track-authoring system based on ordered straight and corner segments.

## Attribution

The approach was informed by the repository `Resaj/basic-circuit-maker` by Ruben Espino San Jose:

- Repository: https://github.com/Resaj/basic-circuit-maker
- License: CC BY-SA 4.0

This project does not embed the original MATLAB code or bitmap assets. Instead, it reimplements the same high-level idea in JavaScript for the game runtime:

- define an origin point and heading,
- chain straight segments and turns,
- sample the resulting center line,
- derive a closed racing loop and its boundaries from track width.

## Why this was reused

The repository provides a practical way to describe realistic circuits with explicit geometry instead of hand-drawing arbitrary loops. That is a good fit for:

- consistent start/finish placement,
- predictable corner sequences,
- different track personalities without changing the rendering engine,
- controlled AI racing lines and overtaking zones.

## Local implementation

The local implementation lives in [src/games/race2dpro/circuits.js](/C:/Users/hugoe/Downloads/plataforma-juegos-saas/src/games/race2dpro/circuits.js).

Each circuit blueprint defines:

- environment,
- nominal distance,
- track width,
- start position on the lap,
- a sequence of straights and turns.

The runtime compiles those blueprints into the center line used by rendering, minimap generation, grid placement, and AI path following.
