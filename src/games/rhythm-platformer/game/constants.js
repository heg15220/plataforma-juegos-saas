export const GAME_NAME = "Pulse Prism Runner";

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;

export const CEILING_Y = 28;
export const GROUND_Y = 452;
export const START_X = 180;
export const SCREEN_PLAYER_X = 280;

export const PLAYER_RADIUS = 19;
export const PLAYER_CORE_RADIUS = 8;

export const BASE_SEED = 417209;

export const BPM = 136;
export const BEAT_SECONDS = 60 / BPM;
export const BEATS_PER_BAR = 4;

export const BASE_GRAVITY = 2500;
export const BASE_JUMP_VELOCITY = -790;
export const COYOTE_SECONDS = 0.1;
export const JUMP_BUFFER_SECONDS = 0.11;
export const INVULNERABILITY_SECONDS = 1.05;

export const MAX_INTEGRITY = 3;
export const MAX_CHARGE = 3;
export const BASE_CHARGE_REGEN = 0.09;

export const SNAPSHOT_HZ = 12;

export const TRACK_START_X = 640;
export const TRACK_BASE_LENGTH = 8600;

export const SHIFT_KEY = "KeyQ";

export const DIFFICULTY_PRESETS = {
  casual: {
    id: "casual",
    label: "Casual",
    worldSpeed: 286,
    maxSpeed: 366,
    perfectWindow: 0.108,
    goodWindow: 0.22,
    obstacleDensity: 0.8,
    chunkComplexity: 0.82,
    chargeRegen: BASE_CHARGE_REGEN + 0.06,
    burstRange: 270,
    burstCost: 0.9,
    shiftDuration: 0.66,
    shiftCooldown: 2.3,
    damagePenalty: 1,
    rankBias: 0.05,
  },
  core: {
    id: "core",
    label: "Core",
    worldSpeed: 326,
    maxSpeed: 422,
    perfectWindow: 0.084,
    goodWindow: 0.168,
    obstacleDensity: 1,
    chunkComplexity: 1,
    chargeRegen: BASE_CHARGE_REGEN,
    burstRange: 292,
    burstCost: 1,
    shiftDuration: 0.6,
    shiftCooldown: 2.8,
    damagePenalty: 1,
    rankBias: 0,
  },
  expert: {
    id: "expert",
    label: "Expert",
    worldSpeed: 356,
    maxSpeed: 468,
    perfectWindow: 0.064,
    goodWindow: 0.13,
    obstacleDensity: 1.16,
    chunkComplexity: 1.25,
    chargeRegen: BASE_CHARGE_REGEN - 0.03,
    burstRange: 312,
    burstCost: 1.15,
    shiftDuration: 0.56,
    shiftCooldown: 3.2,
    damagePenalty: 1,
    rankBias: -0.06,
  },
};

export const DEFAULT_SETTINGS = {
  difficultyId: "core",
  audioEnabled: true,
  reduceMotion: false,
  debugEnabled: false,
  deterministic: true,
  seed: BASE_SEED,
  colorblindSafe: false,
};

export const RANK_THRESHOLDS = [
  { rank: "S", minAccuracy: 0.9, maxDamage: 0, minScore: 15000 },
  { rank: "A", minAccuracy: 0.78, maxDamage: 1, minScore: 11000 },
  { rank: "B", minAccuracy: 0.62, maxDamage: 2, minScore: 7600 },
  { rank: "C", minAccuracy: 0, maxDamage: 9, minScore: 0 },
];

export const COLOR_SETS = {
  normal: {
    bgTop: "#06172f",
    bgBottom: "#051116",
    lane: "#3ad8ff",
    laneSoft: "rgba(58, 216, 255, 0.18)",
    accentA: "#67f4ff",
    accentB: "#ffd46a",
    alert: "#ff5668",
    good: "#6be2ff",
    perfect: "#9bff86",
    miss: "#ff6882",
  },
  colorblind: {
    bgTop: "#0f1f3c",
    bgBottom: "#11131f",
    lane: "#5ad7ff",
    laneSoft: "rgba(90, 215, 255, 0.18)",
    accentA: "#6ec7ff",
    accentB: "#ffd271",
    alert: "#ff9a54",
    good: "#80d4ff",
    perfect: "#f8ff7a",
    miss: "#ffa77d",
  },
};

export const SECTION_ORDER = ["intro", "build", "drop", "outro"];

export const MOBILE_TOUCH_IDS = {
  jump: "jump",
  burst: "burst",
  shift: "shift",
};
