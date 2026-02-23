import { DEFAULT_LIVES, DEFAULT_MESSAGE, SCREENS } from "../config";

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

export const createInitialSnapshot = () => ({
  mode: "platformer_arcade",
  coordinates: "origin_top_left_x_right_y_down_pixels",
  screen: SCREENS.START,
  score: 0,
  lives: DEFAULT_LIVES,
  levelIndex: 0,
  levelCount: 1,
  levelName: "Arcade Stage",
  timeLeft: 0,
  timeLimit: 0,
  coinsCollected: 0,
  coinsTotal: 0,
  message: DEFAULT_MESSAGE,
  player: {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    onGround: false,
    facing: "right",
    powerLevel: 0,
    animation: "idle"
  },
  enemies: [],
  items: [],
  projectiles: [],
  goal: { x: 0, y: 0 },
  camera: { x: 0, y: 0 }
});

export const buildHudSnapshot = (state) => {
  const player = state.player || {};
  return {
    mode: "platformer_arcade",
    coordinates: "origin_top_left_x_right_y_down_pixels",
    screen: state.screen,
    score: state.score,
    lives: state.lives,
    levelIndex: state.levelIndex,
    levelCount: state.levelCount,
    levelName: state.level?.name || `Level ${state.levelIndex + 1}`,
    timeLeft: round2(state.timeLeft),
    timeLimit: round2(state.level?.timeLimit || 0),
    coinsCollected: state.coinsCollected,
    coinsTotal: state.coinsTotal,
    message: state.message,
    player: {
      x: round2(player.x),
      y: round2(player.y),
      vx: round2(player.vx),
      vy: round2(player.vy),
      onGround: Boolean(player.onGround),
      facing: player.facing || "right",
      powerLevel: player.powerLevel || 0,
      animation: player.animation || "idle"
    },
    enemies: (state.enemies || [])
      .filter((enemy) => enemy.active)
      .map((enemy) => ({
        id: enemy.id,
        type: enemy.type,
        x: round2(enemy.x),
        y: round2(enemy.y),
        vx: round2(enemy.vx),
        direction: enemy.direction
      })),
    items: (state.items || [])
      .filter((item) => item.active)
      .map((item) => ({
        id: item.id,
        type: item.type,
        x: round2(item.x),
        y: round2(item.y)
      })),
    projectiles: (state.projectiles || [])
      .filter((projectile) => projectile.active)
      .map((projectile) => ({
        id: projectile.id,
        x: round2(projectile.x),
        y: round2(projectile.y),
        vx: round2(projectile.vx),
        vy: round2(projectile.vy)
      })),
    goal: {
      x: round2(state.goalRect?.x || 0),
      y: round2(state.goalRect?.y || 0)
    },
    camera: {
      x: round2(state.camera?.x || 0),
      y: round2(state.camera?.y || 0)
    }
  };
};
