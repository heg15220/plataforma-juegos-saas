# Sky Runner DX - Platformer architecture

## Technology choice

The platformer uses **JavaScript + HTML5 Canvas** inside React.

Why this stack:
- Tight control over input, physics feel and frame pacing.
- Deterministic fixed-step update loop (`60 FPS`) with `window.advanceTime(ms)` for QA automation.
- Easy modular split by domain (render, input, physics, entities, level loading, UI).
- Lightweight runtime footprint for browser and mobile web.

## Folder structure

```text
src/games/platformer/
  audio/ArcadeAudio.js
  config.js
  core/PlatformerEngine.js
  entities/
    enemy.js
    item.js
    player.js
    projectile.js
  input/InputController.js
  levels/
    index.js
    level-1.json ... level-7.json
    levelLoader.js
  physics/collision.js
  render/Renderer.js
  ui/hudModel.js
```

`src/games/PlatformerGame.jsx` is the React shell that mounts the engine, shows HUD controls, and exposes QA hooks.

## Modules

- `render/Renderer.js`
  - Draws parallax background, tilemap, entities, HUD and overlays (start, level clear, game over, victory).
  - Uses pixel-friendly rendering (`image-rendering: pixelated`).

- `input/InputController.js`
  - Keyboard + gamepad support.
  - Virtual controls for touch buttons.
  - Normalized per-frame commands (`axis`, `jumpPressed`, `jumpHeld`, `actionPressed`, etc.).

- `physics/collision.js`
  - Arcade collision against tilemap.
  - Solid and one-way platform handling.
  - AABB helper for entity interactions.

- `entities/*`
  - `player.js`: acceleration/deceleration, coyote time, jump buffer, variable jump height, invulnerability.
  - `enemy.js`: horizontal patrol AI, wall/edge reaction.
  - `item.js`: coins and mushroom power-up behavior.
  - `projectile.js`: fireball projectile logic.

- `levels/levelLoader.js`
  - Loads level JSON maps.
  - Converts tile chars into runtime tile types.
  - Builds spawn lists and question-block rewards.

- `ui/hudModel.js`
  - Defines the snapshot contract for React HUD and `render_game_to_text`.

- `core/PlatformerEngine.js`
  - Orchestrates game states, update loop, level transitions, score/lives/time, and camera follow.

## Game loop

Fixed-step architecture:

1. Read input (`InputController.consume()`).
2. Update state machine (`start`, `playing`, `level_complete`, `game_over`, `game_complete`).
3. During gameplay:
   - Player update (input, jump physics, tile collision).
   - Enemy/item/projectile updates.
   - Collision passes (player vs world/enemies/items, projectiles vs enemies, goal detection).
   - Camera follow and cleanup.
4. Render current state to canvas.
5. Publish throttled snapshot for UI and automation.

The loop runs at `60 FPS` fixed updates and supports deterministic stepping through:

```js
window.advanceTime(ms)
window.render_game_to_text()
```

## Level format and adding new levels

Create a new file under `src/games/platformer/levels/`:

```json
{
  "id": "forest-3",
  "name": "Forest Rush III",
  "theme": "day",
  "timeLimit": 120,
  "map": [
    "....",
    "....",
    "####"
  ],
  "playerSpawn": { "x": 2, "y": 5 },
  "goal": { "x": 70, "y": 10 },
  "enemySpawns": [{ "type": "walker", "x": 20, "y": 11, "patrol": 4 }],
  "itemSpawns": [{ "type": "coin", "x": 18, "y": 6 }],
  "questionRewards": [{ "x": 24, "y": 5, "type": "mushroom" }]
}
```

Tile legend:
- `.` empty
- `#` ground
- `=` one-way platform
- `B` brick
- `T` pipe
- `?` question block

Then register it in `src/games/platformer/levels/index.js`.

## Adding a new enemy type

1. Add spawn type to level JSON:
```json
{ "type": "jumper", "x": 30, "y": 11, "patrol": 3 }
```

2. Extend enemy factory and updater:
- `src/games/platformer/entities/enemy.js`
  - Add behavior branch for `type === "jumper"` (jump timer + vertical impulse).

3. Render new sprite variant:
- `src/games/platformer/render/Renderer.js`
  - Add a visual branch in `drawEnemy`.

No engine-level changes are needed if the entity contract (`x/y/w/h/vx/vy/active`) is preserved.

## Run instructions

```bash
npm install
npm run dev
```

Open the app, choose **Sky Runner DX**, then:
- `A/D` or arrows: move
- `W`, `ArrowUp`, or `Space`: jump (hold for higher jump)
- `F`: action (fireball if power-up active)
- `Enter`: start
- `R`: restart level
