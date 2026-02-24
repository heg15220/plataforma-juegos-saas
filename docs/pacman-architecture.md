# Pac-Man architecture

## High-level design

The Pac-Man feature is split into a game runtime layer (`src/game/*`) and React UI layer (`src/ui/*` + `src/games/PacmanGame.jsx`).

- Runtime owns deterministic simulation, state transitions, AI, collisions, and Canvas render.
- React owns menus, HUD, pause/game-over overlays, and touch controls.
- `useGameRuntimeBridge` publishes `window.render_game_to_text` and `window.advanceTime(ms)` for automated QA.

This separation keeps game logic framework-agnostic and prevents React re-render loops from affecting gameplay timing.

## Module map

### `src/game/engine/`
- `GameLoop.js`: fixed-step game loop with RAF render and metrics.
- `InputManager.js`: keyboard + buffered direction + action triggers.
- `AudioManager.js`: optional synthesized SFX and mute toggle.
- `AssetLoader.js`: image preloader placeholder for sprite pipelines.

### `src/game/world/`
- `TileMap.js`: tile parsing, pellet lifecycle, tunnel wrapping, coordinate helpers.
- `Collision.js`: walkability, movement/collision on grid, entity overlap checks.
- `NavigationGraph.js`: intersection graph and legal direction queries with anti-reverse rules.
- `directions.js`: canonical direction vectors and helpers.

### `src/game/entities/`
- `Pacman.js`: buffered turning/cornering and tile-aligned movement.
- `GhostBase.js`: shared ghost movement, state handling, targeting selection.
- `Blinky.js`, `Pinky.js`, `Inky.js`, `Clyde.js`: differentiated ghosts with unique chase targeting.

### `src/game/ai/`
- `GhostFSM.js`: scatter/chase/frightened timers and eaten score chain.
- `Targeting.js`: ghost-specific target calculation (Blinky/Pinky/Inky/Clyde).
- `Pathfinding.js`: BFS distance on grid for direction choice.

### `src/game/state/`
- `GameState.js`: score/lives/level/mode/high-score persistence.
- `LevelManager.js`: map source, spawn extraction, per-level speed/difficulty scaling.

### Runtime + UI integration
- `src/game/PacmanRuntime.js`: orchestration layer that connects all modules.
- `src/ui/PacmanHUD.jsx`: score/lives/level/high-score/FPS and controls.
- `src/ui/PacmanMenu.jsx`: start screen and controls summary.
- `src/ui/PacmanPauseOverlay.jsx`: pause flow.
- `src/ui/PacmanEndOverlay.jsx`: game over / victory flow.
- `src/games/PacmanGame.jsx`: React host for Canvas + overlays + touch controls.

## Why BFS

The map is an unweighted tile grid and ghost decisions happen at intersections. BFS gives deterministic shortest-path distance with very low overhead on this board size, making it simpler and easier to test than A* while still staying well within 60 FPS targets.

## Tests

- `src/game/world/TileMap.test.js`: tilemap parsing + pellet lifecycle.
- `src/game/world/Collision.test.js`: wall collisions + ghost-door rules.
- `src/game/ai/GhostFSM.test.js`: scatter/chase timers, frightened transitions, eaten score scaling.
