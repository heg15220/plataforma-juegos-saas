import { DEFAULT_LIVES, DEFAULT_MESSAGE, SCREENS } from "../config";

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

export const createInitialSnapshot = () => ({
  mode: "platformer_arcade",
  coordinates: "origin_top_left_x_right_y_down_pixels",
  screen: SCREENS.START,
  score: 0,
  lives: DEFAULT_LIVES,
  catalogLevelCount: 1,
  levelIndex: 0,
  levelCount: 1,
  levelId: "platformer-level-0",
  levelName: "Arcade Stage",
  levelLayout: "horizontal",
  levelVisualStyle: "classic",
  levelBiome: "Frontier Plains",
  levelSubtitle: "",
  levelDifficulty: 1,
  levelMechanics: [],
  isBossLevel: false,
  runLevelIds: [],
  runStages: [],
  runBossLevelCount: 0,
  timeLeft: 0,
  timeLimit: 0,
  coinsCollected: 0,
  coinsTotal: 0,
  checkpoints: {
    total: 0,
    activated: 0,
    activeId: null
  },
  activeWind: null,
  hazardCount: 0,
  message: DEFAULT_MESSAGE,
  activeBoss: null,
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
  const checkpoints = Array.isArray(state.level?.checkpoints) ? state.level.checkpoints : [];
  return {
    mode: "platformer_arcade",
    coordinates: "origin_top_left_x_right_y_down_pixels",
    screen: state.screen,
    score: state.score,
    lives: state.lives,
    catalogLevelCount: Number(state.catalogLevelCount) || 1,
    levelIndex: state.levelIndex,
    levelCount: state.levelCount,
    levelId: state.level?.id || `level-${state.levelIndex + 1}`,
    levelName: state.level?.name || `Level ${state.levelIndex + 1}`,
    levelLayout: state.level?.layoutType || "horizontal",
    levelVisualStyle: state.level?.visualStyle || "classic",
    levelBiome: state.level?.biome || "Frontier Plains",
    levelSubtitle: state.level?.subtitle || "",
    levelDifficulty: Number(state.level?.difficulty) || 1,
    levelMechanics: Array.isArray(state.level?.mechanics) ? [...state.level.mechanics] : [],
    isBossLevel: Boolean(state.level?.isBossLevel),
    runLevelIds: Array.isArray(state.runLevelIds) ? [...state.runLevelIds] : [],
    runStages: Array.isArray(state.runStages)
      ? state.runStages.map((stage) => ({
        id: stage.id,
        name: stage.name,
        biome: stage.biome,
        difficulty: stage.difficulty,
        isBossLevel: Boolean(stage.isBossLevel)
      }))
      : [],
    runBossLevelCount: Number(state.runBossLevelCount) || 0,
    timeLeft: round2(state.timeLeft),
    timeLimit: round2(state.level?.timeLimit || 0),
    coinsCollected: state.coinsCollected,
    coinsTotal: state.coinsTotal,
    checkpoints: {
      total: checkpoints.length,
      activated: checkpoints.filter((checkpoint) => checkpoint.active).length,
      activeId: state.activeCheckpointId || null
    },
    activeWind: state.activeWind
      ? {
        label: state.activeWind.label,
        forceX: round2(state.activeWind.forceX),
        forceY: round2(state.activeWind.forceY)
      }
      : null,
    hazardCount: Array.isArray(state.level?.hazardZones) ? state.level.hazardZones.length : 0,
    message: state.message,
    activeBoss: state.activeBoss
      ? {
        id: state.activeBoss.id,
        name: state.activeBoss.name,
        variant: state.activeBoss.variant || "juggernaut",
        health: state.activeBoss.health,
        maxHealth: state.activeBoss.maxHealth
      }
      : null,
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
        variant: enemy.variant || null,
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
