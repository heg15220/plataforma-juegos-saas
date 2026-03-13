import { DEFAULT_PHYSICS, STAGE_HEIGHT, STAGE_WIDTH } from "../physics/constants";
import { OBSTACLE_LIBRARY } from "./obstacleCatalog";

const DEFAULT_BOUNDS = {
  left: -120,
  right: STAGE_WIDTH + 120,
  top: -180,
  bottom: STAGE_HEIGHT + 120,
};

export function createLevel(definition) {
  const obstacles = (definition.obstacles ?? []).map((obstacle, index) => {
    const prefab = OBSTACLE_LIBRARY[obstacle.type];
    if (!prefab) {
      throw new Error(`Unsupported obstacle type: ${obstacle.type}`);
    }
    return {
      id: obstacle.id ?? `${definition.id}-obstacle-${index + 1}`,
      ...prefab,
      ...obstacle,
    };
  });

  return {
    id: definition.id,
    index: definition.index ?? 0,
    world: definition.world ?? "neon-foundry",
    theme: definition.theme ?? "neon-foundry",
    name: definition.name,
    taxonomy: definition.taxonomy ?? "direct",
    difficultyBand: definition.difficultyBand ?? "teach",
    ballSpawn: {
      padWidth: 132,
      padHeight: 18,
      dragRadius: 88,
      aimDeg: -36,
      power: 0.56,
      ...definition.ballSpawn,
    },
    target: {
      w: 108,
      h: 110,
      innerW: 58,
      innerH: 62,
      tolerance: 18,
      magnetRadius: 84,
      holdMs: DEFAULT_PHYSICS.targetHoldMs,
      settleSpeed: DEFAULT_PHYSICS.settleSpeed,
      rimForgiveness: DEFAULT_PHYSICS.edgeForgiveness,
      ...definition.target,
    },
    obstacles,
    physicsProfile: {
      ...DEFAULT_PHYSICS,
      ...definition.physicsProfile,
    },
    starRules: {
      parTimeMs: 7000,
      parBounces: 3,
      parAttempts: 1,
      cleanPathBonus: true,
      ...definition.starRules,
    },
    cameraFrame: definition.cameraFrame ?? { x: 0, y: 0, w: STAGE_WIDTH, h: STAGE_HEIGHT },
    bounds: {
      ...DEFAULT_BOUNDS,
      ...definition.bounds,
    },
    tutorialHints: definition.tutorialHints ?? { es: [], en: [] },
    backgroundId: definition.backgroundId ?? "neon-grid",
    musicId: definition.musicId ?? "world1-loop",
  };
}
