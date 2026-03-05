import {
  BEAT_SECONDS,
  CEILING_Y,
  DIFFICULTY_PRESETS,
  GROUND_Y,
  PLAYER_RADIUS,
  TRACK_BASE_LENGTH,
  TRACK_START_X,
} from "./constants";
import { createSeededRng, intRange, pick } from "./rng";

function createObstacle(id, type, x, y, w, h, phase = "both", extra = {}) {
  return {
    id: `obs-${id}`,
    type,
    x,
    y,
    w,
    h,
    phase,
    telegraphLeadBeats: extra.telegraphLeadBeats ?? 0.9,
    beatThreat: extra.beatThreat ?? 1,
    pulse: 0,
    disabled: false,
  };
}

function createPickup(id, x, y, value = 1) {
  return {
    id: `orb-${id}`,
    x,
    y,
    r: 12,
    value,
    collected: false,
    spin: 0,
  };
}

function choosePhase(rand, density, allowBoth = true) {
  if (density < 0.92 && allowBoth) {
    return "both";
  }
  const roll = rand();
  if (allowBoth && roll < 0.2) {
    return "both";
  }
  return roll < 0.55 ? "A" : "B";
}

const CHUNKS = [
  {
    id: "starter-stride",
    minComplexity: 0,
    beats: 11,
    build(ctx) {
      const { startX, beatStep, addObstacle, addPickup, rand, phaseFor } = ctx;
      for (let i = 1; i <= 5; i += 1) {
        const x = startX + i * beatStep * 1.55;
        const h = 52 + intRange(rand, 0, 26);
        addObstacle("prism-block", x, GROUND_Y - h, 68, h, phaseFor(true));
        addPickup(x + 38, GROUND_Y - h - 72 - intRange(rand, 0, 24));
      }
    },
  },
  {
    id: "shutter-duet",
    minComplexity: 0.8,
    beats: 12,
    build(ctx) {
      const { startX, beatStep, addObstacle, addPickup, rand, phaseFor } = ctx;
      for (let i = 0; i < 4; i += 1) {
        const x = startX + beatStep * (2 + i * 2.3);
        const topHeight = 96 + intRange(rand, 0, 48);
        const bottomHeight = 92 + intRange(rand, 0, 52);
        addObstacle("energy-shutter", x, CEILING_Y, 44, topHeight, phaseFor(false), {
          telegraphLeadBeats: 1.2,
          beatThreat: 1.2,
        });
        addObstacle("energy-shutter", x + 20, GROUND_Y - bottomHeight, 42, bottomHeight, phaseFor(false), {
          telegraphLeadBeats: 1.2,
          beatThreat: 1.1,
        });
        if (i % 2 === 1) {
          addPickup(x + 54, GROUND_Y - 170 - intRange(rand, 0, 20));
        }
      }
    },
  },
  {
    id: "laser-corridor",
    minComplexity: 0.9,
    beats: 13,
    build(ctx) {
      const { startX, beatStep, addObstacle, addPickup, rand, phaseFor } = ctx;
      for (let i = 0; i < 3; i += 1) {
        const x = startX + beatStep * (3 + i * 3.1);
        const gapCenter = GROUND_Y - 162 - intRange(rand, 0, 42);
        const gapSize = 126 - intRange(rand, 0, 18);
        const topHeight = Math.max(84, gapCenter - gapSize * 0.5 - CEILING_Y);
        const bottomY = gapCenter + gapSize * 0.5;
        addObstacle("laser-gate", x, CEILING_Y, 36, topHeight, phaseFor(false), {
          telegraphLeadBeats: 1.35,
          beatThreat: 1.28,
        });
        addObstacle("laser-gate", x, bottomY, 36, Math.max(88, GROUND_Y - bottomY), phaseFor(false), {
          telegraphLeadBeats: 1.35,
          beatThreat: 1.28,
        });
        addPickup(x + 18, gapCenter - 3, 1.2);
      }
    },
  },
  {
    id: "pylon-climb",
    minComplexity: 1,
    beats: 11,
    build(ctx) {
      const { startX, beatStep, addObstacle, addPickup, rand, phaseFor } = ctx;
      for (let i = 0; i < 5; i += 1) {
        const x = startX + beatStep * (1.8 + i * 1.8);
        const h = 84 + i * 18 + intRange(rand, -10, 14);
        addObstacle("pulse-pylon", x, GROUND_Y - h, 50, h, phaseFor(i < 2), {
          telegraphLeadBeats: 1,
          beatThreat: 1.08,
        });
      }
      addPickup(startX + beatStep * 6.8, GROUND_Y - 214, 1.4);
    },
  },
  {
    id: "phase-zigzag",
    minComplexity: 1.08,
    beats: 14,
    build(ctx) {
      const { startX, beatStep, addObstacle, addPickup } = ctx;
      const sequence = ["A", "B", "A", "B", "A"];
      sequence.forEach((phase, index) => {
        const x = startX + beatStep * (2 + index * 2.2);
        const y = index % 2 === 0 ? GROUND_Y - 104 : CEILING_Y + 48;
        const h = index % 2 === 0 ? 104 : 120;
        addObstacle("prism-block", x, y, 62, h, phase, {
          telegraphLeadBeats: 1.25,
          beatThreat: 1.18,
        });
        if (index < 4) {
          addPickup(x + 30, GROUND_Y - 206 + (index % 2) * 28, 1.05);
        }
      });
    },
  },
  {
    id: "drop-run",
    minComplexity: 1.16,
    beats: 15,
    build(ctx) {
      const { startX, beatStep, addObstacle, addPickup, rand, phaseFor } = ctx;
      for (let i = 0; i < 7; i += 1) {
        const x = startX + beatStep * (1.2 + i * 1.45);
        const narrow = i % 2 === 0;
        const h = narrow ? 72 + intRange(rand, 0, 28) : 118 + intRange(rand, 0, 30);
        addObstacle("pulse-pylon", x, GROUND_Y - h, narrow ? 38 : 56, h, phaseFor(i < 1), {
          telegraphLeadBeats: 0.86,
          beatThreat: 1.34,
        });
        if (i % 2 === 1) {
          addPickup(x + 32, GROUND_Y - h - 56, 0.9);
        }
      }
    },
  },
];

export function generateTrack({ seed, difficultyId }) {
  const difficulty = DIFFICULTY_PRESETS[difficultyId] ?? DIFFICULTY_PRESETS.core;
  const rand = createSeededRng(seed ^ 0x9e3779b9);
  const beatStep = difficulty.worldSpeed * BEAT_SECONDS;
  const targetLength = TRACK_BASE_LENGTH * (0.96 + difficulty.chunkComplexity * 0.24);

  const obstacles = [];
  const pickups = [];
  let obstacleId = 0;
  let pickupId = 0;

  const addObstacle = (type, x, y, w, h, phase, extra) => {
    obstacles.push(createObstacle(obstacleId, type, x, y, w, h, phase, extra));
    obstacleId += 1;
  };

  const addPickup = (x, y, value = 1) => {
    pickups.push(createPickup(pickupId, x, y, value));
    pickupId += 1;
  };

  let cursorX = TRACK_START_X;
  let chunkIndex = 0;

  while (cursorX < targetLength) {
    const allowed = CHUNKS.filter((chunk) => chunk.minComplexity <= difficulty.chunkComplexity + 0.08);
    const weighted = [];
    for (const chunk of allowed) {
      const weight = Math.max(1, Math.round(5 - Math.abs(chunk.minComplexity - difficulty.chunkComplexity) * 6));
      for (let i = 0; i < weight; i += 1) {
        weighted.push(chunk);
      }
    }
    const selected = pick(rand, weighted);

    const phaseBias = rand() < 0.5 ? "A" : "B";

    selected.build({
      startX: cursorX,
      beatStep,
      rand,
      addObstacle,
      addPickup,
      phaseFor: (preferBoth) => {
        if (difficulty.chunkComplexity > 1.12 && !preferBoth) {
          return rand() < 0.55 ? phaseBias : phaseBias === "A" ? "B" : "A";
        }
        return choosePhase(rand, difficulty.obstacleDensity, preferBoth);
      },
    });

    chunkIndex += 1;
    const spacingBeats = selected.beats + 2 + intRange(rand, 0, 2);
    cursorX += spacingBeats * beatStep;
  }

  const finishGateX = cursorX + beatStep * 2;

  addObstacle("finish-beacon", finishGateX, CEILING_Y, 28, GROUND_Y - CEILING_Y, "both", {
    telegraphLeadBeats: 0,
    beatThreat: 0,
  });

  obstacles.sort((a, b) => a.x - b.x);
  pickups.sort((a, b) => a.x - b.x);

  const worldLength = finishGateX + 260;

  return {
    seed,
    chunkCount: chunkIndex,
    obstacles,
    pickups,
    worldLength,
    finishX: finishGateX,
    beatStep,
    safeFloorY: GROUND_Y - PLAYER_RADIUS,
  };
}
