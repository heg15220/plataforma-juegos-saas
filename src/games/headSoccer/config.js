export const WIDTH = 960;
export const HEIGHT = 540;
export const STEP_MS = 1000 / 60;

export const FIELD_LEFT = 54;
export const FIELD_RIGHT = WIDTH - 54;
export const FIELD_TOP = 108;
export const FIELD_FLOOR_Y = 468;
export const GOAL_WIDTH = 126;
export const GOAL_HEIGHT = 172;
export const GOAL_DEPTH = 46;
export const GOAL_TOP = FIELD_FLOOR_Y - GOAL_HEIGHT;

export const BALL_RADIUS = 15;
export const GRAVITY = 2100;
export const WALL_BOUNCE = 0.76;
export const FLOOR_BOUNCE = 0.58;
export const BALL_DRAG_AIR = 0.9986;
export const BALL_DRAG_GROUND = 0.972;
export const MAGNUS_FACTOR = 0.44;

export const PLAYER_BODY_HEIGHT = 36;
export const DEFAULT_HEAD_RADIUS = 33;
export const MAX_LOGS = 6;

export const PLAYER_ACCEL = 2100;
export const AIR_ACCEL = 1000;
export const FRICTION = 2700;
export const PLAYER_MARGIN = 20;

export const KICK_DURATION = 0.13;
export const KICK_RANGE = 88;
export const KICK_ARC = 70;
export const KICK_COOLDOWN = 0.28;

export const DASH_SPEED = 740;
export const DASH_DURATION = 0.15;
export const DASH_COOLDOWN = 0.65;

export const PARTICLE_LIMIT = 180;
export const MATCH_GOAL_PAUSE = 1.5;
export const MATCH_BREAK_PAUSE = 1.2;
export const MATCH_CLOCK_MINUTES = 90;
export const BALL_CEILING_Y = FIELD_TOP + 24;
export const BALL_STALL_SPEED = 48;
export const BALL_STALL_BOUNCE = 235;
export const HEADER_ASSIST_X = 180;
export const HEADER_ASSIST_Y = 170;
export const KICK_ZONE_RADIUS = 28;
export const FOOT_OFFSET_X = 34;
export const FOOT_OFFSET_Y = 44;

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const approach = (value, target, amount) => {
  if (value < target) return Math.min(value + amount, target);
  if (value > target) return Math.max(value - amount, target);
  return target;
};

export const CHARACTERS = {
  phoenix: {
    id: "phoenix",
    name: "Phoenix Ace",
    nation: "KR",
    kit: "#f97316",
    trim: "#fde047",
    accent: "#fb7185",
    powerId: "dragon",
    powerLabel: "Dragon shot",
    speed: 322,
    jump: 870,
    shot: 980,
    recharge: 15,
    headScale: 1,
  },
  frost: {
    id: "frost",
    name: "Frost Wall",
    nation: "FR",
    kit: "#38bdf8",
    trim: "#eff6ff",
    accent: "#60a5fa",
    powerId: "ice",
    powerLabel: "Ice field",
    speed: 304,
    jump: 900,
    shot: 910,
    recharge: 16,
    headScale: 1.02,
  },
  bolt: {
    id: "bolt",
    name: "Volt Runner",
    nation: "GB",
    kit: "#facc15",
    trim: "#1d4ed8",
    accent: "#f59e0b",
    powerId: "lightning",
    powerLabel: "Thunder burst",
    speed: 336,
    jump: 848,
    shot: 940,
    recharge: 14,
    headScale: 0.98,
  },
  titan: {
    id: "titan",
    name: "Titan Header",
    nation: "BR",
    kit: "#22c55e",
    trim: "#fde047",
    accent: "#16a34a",
    powerId: "giant",
    powerLabel: "Mega head",
    speed: 296,
    jump: 930,
    shot: 965,
    recharge: 14.5,
    headScale: 1.08,
  },
};

export const OPPONENTS = [
  { id: "union-jack",   name: "Union Rocket",  nation: "GB", characterId: "bolt",    style: "striker" },
  { id: "samba-flick",  name: "Samba Flick",   nation: "BR", characterId: "titan",   style: "acrobat" },
  { id: "berlin-wall",  name: "Berlin Wall",   nation: "DE", characterId: "frost",   style: "keeper"  },
  { id: "furia-aerea",  name: "Furia Aerea",   nation: "ES", characterId: "phoenix", style: "striker" },
  { id: "blue-comet",   name: "Blue Comet",    nation: "AR", characterId: "bolt",    style: "acrobat" },
  { id: "samurai-pop",  name: "Samurai Pop",   nation: "JP", characterId: "frost",   style: "keeper"  },
  { id: "gaul-force",   name: "Gaul Force",    nation: "FR", characterId: "phoenix", style: "striker" },
  { id: "liberty-jump", name: "Liberty Jump",  nation: "US", characterId: "titan",   style: "acrobat" },
];

export const MODES = {
  friendly: {
    id: "friendly",
    label: "Friendly",
    rounds: 1,
    timeLimit: 45,
    goalCap: 5,
    rules: "One quick 1v1 match with regulation time.",
  },
  arcade: {
    id: "arcade",
    label: "Arcade",
    rounds: 5,
    timeLimit: 45,
    goalCap: 5,
    rules: "Beat a fixed ladder of rivals. Lose once and the run ends.",
  },
  tournament: {
    id: "tournament",
    label: "Tournament",
    rounds: 3,
    timeLimit: 50,
    goalCap: 5,
    rules: "Quarterfinal, semifinal and final. Draws go to golden goal.",
    roundNames: ["Quarterfinal", "Semifinal", "Final"],
  },
  survival: {
    id: "survival",
    label: "Survival",
    rounds: Number.POSITIVE_INFINITY,
    timeLimit: 35,
    goalCap: 3,
    lives: 3,
    rules: "Win as many short matches as possible before losing all hearts.",
  },
  league: {
    id: "league",
    label: "League",
    rounds: 6,
    timeLimit: 45,
    goalCap: 5,
    allowDraws: true,
    rules: "Six fixtures. Earn 3 points for a win and 1 for a draw.",
  },
  death: {
    id: "death",
    label: "Death",
    rounds: 1,
    timeLimit: 0,
    goalCap: 1,
    suddenDeath: true,
    rules: "No clock. First goal decides the match instantly.",
  },
  headcup: {
    id: "headcup",
    label: "Head Cup",
    rounds: 4,
    timeLimit: 38,
    goalCap: 4,
    rules: "Short cup run with more aggressive keepers and faster kickoffs.",
  },
};

export const DIFFICULTY = {
  easy: {
    id: "easy",
    label: "Easy",
    speed: 0.9,
    reaction: 0.72,
    jumpBias: 0.84,
    powerBias: 0.62,
  },
  normal: {
    id: "normal",
    label: "Normal",
    speed: 1,
    reaction: 1,
    jumpBias: 1,
    powerBias: 1,
  },
  hard: {
    id: "hard",
    label: "Hard",
    speed: 1.08,
    reaction: 1.18,
    jumpBias: 1.12,
    powerBias: 1.14,
  },
};

export const FLAG_LIBRARY = {
  KR: { type: "circle",        base: "#ffffff", stripes: ["#dc2626", "#2563eb"], bars: "#111827"  },
  GB: { type: "cross",         base: "#1d4ed8", crossOuter: "#ffffff", crossInner: "#dc2626"       },
  BR: { type: "diamond",       base: "#16a34a", shape: "#fde047", disc: "#1d4ed8"                  },
  DE: { type: "horizontal",    colors: ["#111827", "#dc2626", "#fbbf24"]                            },
  ES: { type: "horizontalWide",colors: ["#b91c1c", "#fbbf24", "#b91c1c"]                            },
  AR: { type: "horizontal",    colors: ["#7dd3fc", "#ffffff", "#7dd3fc"]                            },
  JP: { type: "disc",          base: "#ffffff", disc: "#dc2626"                                     },
  FR: { type: "vertical",      colors: ["#1d4ed8", "#ffffff", "#dc2626"]                            },
  US: { type: "us",            colors: ["#dc2626", "#ffffff", "#1d4ed8"]                            },
};

export const CROWD_COLORS = [
  "#f97316", "#facc15", "#38bdf8", "#ef4444", "#22c55e",
  "#a855f7", "#f8fafc", "#fb7185", "#14b8a6",
];

export const BANNER_TEXT = ["HEAD CUP", "LETHAL SHOT", "BONUS TIME", "POWER CLASH", "GOAL RUSH"];

export const getCharacter  = (id)    => CHARACTERS[id]    ?? CHARACTERS.phoenix;
export const getMode       = (id)    => MODES[id]         ?? MODES.friendly;
export const getDifficulty = (id)    => DIFFICULTY[id]    ?? DIFFICULTY.normal;
export const getOpponent   = (index) => OPPONENTS[index % OPPONENTS.length];
