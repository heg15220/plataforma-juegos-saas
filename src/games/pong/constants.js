export const PONG_WIDTH = 960;
export const PONG_HEIGHT = 540;

export const FIXED_DT = 1 / 120;
export const MAX_FRAME_DELTA = 0.05;

export const PADDLE_CONFIG = {
  width: 16,
  height: 116,
  margin: 40,
  keyboardMaxSpeed: 680,
  keyboardAcceleration: 5200,
  keyboardDrag: 3900,
  mouseFollowGain: 14,
  mouseMaxSpeed: 920,
  aiAcceleration: 4200,
  aiDrag: 2800,
  aiCenterPull: 0.16
};

export const BALL_CONFIG = {
  radius: 9,
  serveSpeed: 370,
  minSpeed: 330,
  maxSpeed: 1060,
  hitSpeedGain: 28,
  englishSpeedGain: 110,
  maxBounceAngle: Math.PI * 0.39,
  wallSpeedDamp: 0.995,
  trailLength: 18
};

export const MATCH_CONFIG = {
  targetScore: 9,
  matchSeconds: 120,
  serveDelay: 1.2,
  roundBreakSeconds: 0.95,
  startCountdown: 2.4,
  maxComboWindow: 2.2,
  maxParticles: 90
};

export const DIFFICULTY_PRESETS = {
  rookie: {
    key: "rookie",
    label: "Rookie",
    aiBaseSpeed: 330,
    aiPrecisionError: 78,
    aiReaction: 0.22,
    aiPredictionWeight: 0.52,
    aiJitter: 44
  },
  arcade: {
    key: "arcade",
    label: "Arcade",
    aiBaseSpeed: 430,
    aiPrecisionError: 52,
    aiReaction: 0.16,
    aiPredictionWeight: 0.7,
    aiJitter: 30
  },
  pro: {
    key: "pro",
    label: "Pro",
    aiBaseSpeed: 540,
    aiPrecisionError: 30,
    aiReaction: 0.1,
    aiPredictionWeight: 0.86,
    aiJitter: 20
  }
};

export const DIFFICULTY_ORDER = ["rookie", "arcade", "pro"];

export const AI_PERSONALITIES = {
  calm: {
    key: "calm",
    label: "CALM",
    centerBias: 0.32,
    aggression: 0.7,
    precisionFactor: 1.05
  },
  balanced: {
    key: "balanced",
    label: "BAL",
    centerBias: 0.2,
    aggression: 1,
    precisionFactor: 1
  },
  hunter: {
    key: "hunter",
    label: "HUNT",
    centerBias: 0.08,
    aggression: 1.18,
    precisionFactor: 0.86
  }
};

export const STORAGE_KEYS = {
  wins: "pong_arcade_wins",
  bestRally: "pong_arcade_best_rally"
};
