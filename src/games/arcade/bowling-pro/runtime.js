const FRAME_COUNT = 10;
const ROLL_DURATION_MS = 1320;
const PINFALL_DURATION_MS = 760;
const CELEBRATION_DURATION_MS = 1450;
const MAX_LOG_ITEMS = 8;
const MIN_AI_PLAYERS = 1;
const MAX_AI_PLAYERS = 4;
const FULL_RACK = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const DEFAULT_CONTROLS = { aim: 0.2, power: 0.74, spin: 0.1, loft: 0.18 };
const AI_PLAYER_COUNT_OPTIONS = Object.freeze(
  Array.from({ length: MAX_AI_PLAYERS - MIN_AI_PLAYERS + 1 }, (_, index) => index + MIN_AI_PLAYERS)
);

const PIN_LAYOUT = {
  1: { x: 0, y: 0 },
  2: { x: -0.5, y: 1 },
  3: { x: 0.5, y: 1 },
  4: { x: -1, y: 2 },
  5: { x: 0, y: 2 },
  6: { x: 1, y: 2 },
  7: { x: -1.5, y: 3 },
  8: { x: -0.5, y: 3 },
  9: { x: 0.5, y: 3 },
  10: { x: 1.5, y: 3 },
};

const PIN_ROWS = [
  [1],
  [2, 3],
  [4, 5, 6],
  [7, 8, 9, 10],
];

const PIN_NEIGHBORS = {
  1: [2, 3],
  2: [1, 4, 5],
  3: [1, 5, 6],
  4: [2, 5, 7, 8],
  5: [2, 3, 4, 6, 8, 9],
  6: [3, 5, 9, 10],
  7: [4, 8],
  8: [4, 5, 7, 9],
  9: [5, 6, 8, 10],
  10: [6, 9],
};

const PIN_FRONT_SUPPORT = {
  1: [],
  2: [1],
  3: [1],
  4: [2],
  5: [2, 3],
  6: [3],
  7: [4],
  8: [4, 5],
  9: [5, 6],
  10: [6],
};

const HUMAN_PROFILE = {
  consistency: 0.74,
  strikeSkill: 0.52,
  spareSkill: 0.64,
  carry: 0.56,
  aimNoise: 0.03,
  powerNoise: 0.035,
  spinNoise: 0.05,
  loftNoise: 0.045,
  foulBase: 0.01,
  thinkMs: 0,
};

const AI_PROFILES = {
  rookie: {
    label: { es: "Principiante", en: "Beginner" },
    consistency: 0.42,
    strikeSkill: 0.34,
  spareSkill: 0.42,
  carry: 0.44,
  aimNoise: 0.34,
  powerNoise: 0.24,
  spinNoise: 0.31,
  loftNoise: 0.12,
  foulBase: 0.046,
  thinkMs: 2100,
},
club: {
    label: { es: "Club", en: "Club" },
    consistency: 0.6,
    strikeSkill: 0.51,
    spareSkill: 0.58,
    carry: 0.56,
    aimNoise: 0.22,
  powerNoise: 0.16,
  spinNoise: 0.2,
  loftNoise: 0.09,
  foulBase: 0.026,
  thinkMs: 1760,
},
pro: {
    label: { es: "Pro", en: "Pro" },
    consistency: 0.76,
    strikeSkill: 0.68,
    spareSkill: 0.73,
    carry: 0.69,
    aimNoise: 0.12,
  powerNoise: 0.1,
  spinNoise: 0.12,
  loftNoise: 0.06,
  foulBase: 0.014,
  thinkMs: 1480,
},
elite: {
    label: { es: "Elite", en: "Elite" },
    consistency: 0.88,
    strikeSkill: 0.83,
    spareSkill: 0.87,
    carry: 0.83,
    aimNoise: 0.06,
  powerNoise: 0.06,
  spinNoise: 0.07,
  loftNoise: 0.04,
  foulBase: 0.007,
  thinkMs: 1280,
},
};

const ROLL_KIND_COPY = {
  strike: { es: "Pleno", en: "Strike" },
  spare: { es: "Semipleno", en: "Spare" },
  open: { es: "Abierto", en: "Open" },
};

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function localizeLabel(label, locale) {
  if (!label) {
    return "";
  }
  if (typeof label === "string") {
    return label;
  }
  return label[locale] ?? label.es ?? label.en ?? "";
}

function createPlayerStats() {
  return {
    strikes: 0,
    spares: 0,
    opens: 0,
    fouls: 0,
    splits: 0,
    doubles: 0,
    triples: 0,
    bestStrikeRun: 0,
  };
}

function createPlayer(id, type, name) {
  return {
    id,
    type,
    name,
    frames: Array.from({ length: FRAME_COUNT }, () => createFrame()),
    cumulative: Array(FRAME_COUNT).fill(null),
    total: 0,
    stats: createPlayerStats(),
    finished: false,
  };
}

function normalizeAiPlayerCount(value) {
  const parsed = Number(value);
  return clamp(
    Number.isFinite(parsed) ? Math.round(parsed) : MIN_AI_PLAYERS,
    MIN_AI_PLAYERS,
    MAX_AI_PLAYERS
  );
}

function createFrame() {
  return {
    rolls: [],
    fouls: [],
    split: false,
  };
}

function cloneFrame(frame) {
  return {
    rolls: [...frame.rolls],
    fouls: [...frame.fouls],
    split: Boolean(frame.split),
  };
}

function clonePlayer(player) {
  return {
    ...player,
    frames: player.frames.map(cloneFrame),
    cumulative: [...player.cumulative],
    stats: { ...player.stats },
  };
}

function createSeed() {
  const now = Date.now() >>> 0;
  const randomPart = Math.floor(Math.random() * 0xffffffff) >>> 0;
  return (now ^ randomPart ^ 0x9e3779b9) >>> 0;
}

function nextRandom(state) {
  const seed = (Math.imul(state.seed, 1664525) + 1013904223) >>> 0;
  state.seed = seed;
  return seed / 4294967296;
}

function randomSigned(state, amplitude) {
  return (nextRandom(state) * 2 - 1) * amplitude;
}

function easeToward(current, target, ratio) {
  return current + (target - current) * ratio;
}

function animateAiControls(state, deltaMs, remainingMsBeforeTick) {
  if (!state.aiPlan) {
    return;
  }

  const ratio = clamp(
    deltaMs / Math.max(remainingMsBeforeTick, deltaMs),
    0.04,
    0.18
  );

  state.controls.aim = easeToward(state.controls.aim, state.aiPlan.aim, ratio);
  state.controls.power = easeToward(state.controls.power, state.aiPlan.power, ratio);
  state.controls.spin = easeToward(state.controls.spin, state.aiPlan.spin, ratio);
  state.controls.loft = easeToward(state.controls.loft, state.aiPlan.loft, ratio);
}

function createPlayers(locale, difficultyKey, aiPlayerCount = MIN_AI_PLAYERS) {
  const normalizedAiPlayerCount = normalizeAiPlayerCount(aiPlayerCount);
  const aiLabel = getDifficultyLabel(difficultyKey, locale);
  const userName = locale === "es" ? "Tu" : "You";
  const aiBaseName = `${locale === "es" ? "IA" : "AI"} ${aiLabel}`;

  return [
    createPlayer("human", "human", userName),
    ...Array.from({ length: normalizedAiPlayerCount }, (_, index) => {
      const suffix = normalizedAiPlayerCount > 1 ? ` ${index + 1}` : "";
      return createPlayer(`ai-${index + 1}`, "ai", `${aiBaseName}${suffix}`);
    }),
  ];
}

export function createInitialState(
  locale,
  difficultyKey,
  seed = createSeed(),
  aiPlayerCount = MIN_AI_PLAYERS
) {
  const normalizedAiPlayerCount = normalizeAiPlayerCount(aiPlayerCount);
  return {
    locale,
    difficultyKey,
    seed,
    aiPlayerCount: normalizedAiPlayerCount,
    status: "menu",
    frameIndex: 0,
    currentPlayer: 0,
    controls: { ...DEFAULT_CONTROLS },
    pinsStanding: [...FULL_RACK],
    phaseTimerMs: 0,
    rollAnimationProgress: 0,
    pendingOutcome: null,
    pendingResolution: null,
    pinAnimation: null,
    celebration: null,
    controlFeedback: null,
    aiPlan: null,
    lastRoll: null,
    logs: [],
    winner: null,
    fullscreen: false,
    players: createPlayers(locale, difficultyKey, normalizedAiPlayerCount),
  };
}

export function cloneState(state) {
  return {
    ...state,
    players: state.players.map(clonePlayer),
    controls: { ...state.controls },
    pinsStanding: [...state.pinsStanding],
    logs: [...state.logs],
    pendingOutcome: state.pendingOutcome
      ? {
          ...state.pendingOutcome,
          knockedPins: [...state.pendingOutcome.knockedPins],
          controls: { ...state.pendingOutcome.controls },
        }
      : null,
    pendingResolution: state.pendingResolution
      ? {
          ...state.pendingResolution,
          knockedPins: [...state.pendingResolution.knockedPins],
          standingBefore: [...state.pendingResolution.standingBefore],
          standingAfter: [...state.pendingResolution.standingAfter],
          controls: { ...state.pendingResolution.controls },
        }
      : null,
    pinAnimation: state.pinAnimation
      ? {
          ...state.pinAnimation,
          standingBefore: [...state.pinAnimation.standingBefore],
          standingAfter: [...state.pinAnimation.standingAfter],
          knockedPins: [...state.pinAnimation.knockedPins],
          pins: state.pinAnimation.pins.map((pin) => ({ ...pin })),
        }
      : null,
    celebration: state.celebration ? { ...state.celebration } : null,
    controlFeedback: state.controlFeedback ? { ...state.controlFeedback } : null,
    lastRoll: state.lastRoll
      ? {
          ...state.lastRoll,
          knockedPins: [...state.lastRoll.knockedPins],
        }
      : null,
    aiPlan: state.aiPlan ? { ...state.aiPlan } : null,
  };
}

export function pushLog(state, text) {
  state.logs.unshift(text);
  if (state.logs.length > MAX_LOG_ITEMS) {
    state.logs = state.logs.slice(0, MAX_LOG_ITEMS);
  }
}

function formatRollSymbol(value) {
  if (value == null) return "";
  if (value === 0) return "-";
  return String(value);
}

export function frameIsComplete(frameIndex, rolls) {
  if (frameIndex < 9) {
    if (rolls.length === 0) return false;
    if (rolls[0] === 10) return true;
    return rolls.length >= 2;
  }

  if (rolls.length < 2) return false;
  if (rolls[0] === 10 || rolls[0] + rolls[1] === 10) {
    return rolls.length >= 3;
  }
  return true;
}

function playerFinished(player) {
  return frameIsComplete(9, player.frames[9].rolls);
}

function getFlatRolls(frames) {
  const rolls = [];
  for (let frameIndex = 0; frameIndex < FRAME_COUNT; frameIndex += 1) {
    const frame = frames[frameIndex];
    if (frameIndex < 9) {
      const first = frame.rolls[0];
      if (first == null) {
        break;
      }
      rolls.push(first);
      if (first !== 10) {
        const second = frame.rolls[1];
        if (second == null) {
          break;
        }
        rolls.push(second);
      }
    } else {
      for (const roll of frame.rolls) {
        rolls.push(roll);
      }
    }
  }
  return rolls;
}

function computeCumulativeScores(frames) {
  const totals = Array(FRAME_COUNT).fill(null);
  const rolls = getFlatRolls(frames);

  let score = 0;
  let rollIndex = 0;

  for (let frameIndex = 0; frameIndex < FRAME_COUNT; frameIndex += 1) {
    if (frameIndex < 9) {
      const first = rolls[rollIndex];
      if (first == null) {
        break;
      }

      if (first === 10) {
        const bonus1 = rolls[rollIndex + 1];
        const bonus2 = rolls[rollIndex + 2];
        if (bonus1 == null || bonus2 == null) {
          break;
        }
        score += 10 + bonus1 + bonus2;
        totals[frameIndex] = score;
        rollIndex += 1;
        continue;
      }

      const second = rolls[rollIndex + 1];
      if (second == null) {
        break;
      }

      if (first + second === 10) {
        const bonus = rolls[rollIndex + 2];
        if (bonus == null) {
          break;
        }
        score += 10 + bonus;
      } else {
        score += first + second;
      }
      totals[frameIndex] = score;
      rollIndex += 2;
      continue;
    }

    const tenth = frames[9].rolls;
    if (tenth.length < 2) {
      break;
    }
    if ((tenth[0] === 10 || tenth[0] + tenth[1] === 10) && tenth.length < 3) {
      break;
    }
    score += tenth[0] + tenth[1] + (tenth[2] ?? 0);
    totals[9] = score;
  }

  return {
    totals,
    resolvedTotal: score,
  };
}

function computeStats(frames) {
  const stats = {
    strikes: 0,
    spares: 0,
    opens: 0,
    fouls: 0,
    splits: 0,
    doubles: 0,
    triples: 0,
    bestStrikeRun: 0,
  };

  let strikeRun = 0;

  for (let frameIndex = 0; frameIndex < FRAME_COUNT; frameIndex += 1) {
    const frame = frames[frameIndex];
    if (frame.rolls.length === 0) {
      break;
    }

    stats.fouls += frame.fouls.filter(Boolean).length;
    if (frame.split) {
      stats.splits += 1;
    }

    const isStrike = frame.rolls[0] === 10;
    const isSpare =
      frame.rolls.length >= 2 && frame.rolls[0] !== 10 && frame.rolls[0] + frame.rolls[1] === 10;
    const isOpen = frame.rolls.length >= 2 && !isStrike && !isSpare;

    if (isStrike) {
      stats.strikes += 1;
      strikeRun += 1;
      stats.bestStrikeRun = Math.max(stats.bestStrikeRun, strikeRun);
      if (strikeRun >= 2) {
        stats.doubles += 1;
      }
      if (strikeRun >= 3) {
        stats.triples += 1;
      }
    } else {
      strikeRun = 0;
    }

    if (isSpare) {
      stats.spares += 1;
    } else if (isOpen) {
      stats.opens += 1;
    }
  }

  return stats;
}

function symbolForFoul(frameIndex, frame, rollIndex) {
  if (!frame.fouls[rollIndex]) {
    return null;
  }
  if (frameIndex === 9 && rollIndex === 2) {
    const first = frame.rolls[0] ?? 0;
    const second = frame.rolls[1] ?? 0;
    if (first === 10 && second < 10 && second === 10) {
      return "/";
    }
  }
  return "F";
}

export function formatFrameSymbols(frameIndex, frame) {
  if (frameIndex < 9) {
    if (frame.rolls.length === 0) return ["", ""];

    const first = frame.rolls[0];
    const second = frame.rolls[1];

    if (first === 10) {
      return ["X", ""];
    }
    if (second == null) {
      return [symbolForFoul(frameIndex, frame, 0) ?? formatRollSymbol(first), ""];
    }
    if (first + second === 10) {
      return [symbolForFoul(frameIndex, frame, 0) ?? formatRollSymbol(first), "/"];
    }
    return [
      symbolForFoul(frameIndex, frame, 0) ?? formatRollSymbol(first),
      symbolForFoul(frameIndex, frame, 1) ?? formatRollSymbol(second),
    ];
  }

  const [r1, r2, r3] = frame.rolls;
  const slots = ["", "", ""];

  if (r1 != null) {
    slots[0] = frame.fouls[0] ? "F" : r1 === 10 ? "X" : formatRollSymbol(r1);
  }
  if (r2 != null) {
    if (r1 === 10) {
      slots[1] = frame.fouls[1] ? "F" : r2 === 10 ? "X" : formatRollSymbol(r2);
    } else if (r1 + r2 === 10) {
      slots[1] = "/";
    } else {
      slots[1] = frame.fouls[1] ? "F" : formatRollSymbol(r2);
    }
  }
  if (r3 != null) {
    if (r1 === 10 && r2 != null && r2 < 10 && r2 + r3 === 10 && !frame.fouls[2]) {
      slots[2] = "/";
    } else {
      slots[2] = frame.fouls[2] ? "F" : r3 === 10 ? "X" : formatRollSymbol(r3);
    }
  }

  return slots;
}

export function getLaneLabel(frameIndex, locale) {
  const base = frameIndex % 2 === 0 ? "A" : "B";
  if (locale === "es") {
    return `Pista ${base}`;
  }
  return `Lane ${base}`;
}

function centroidX(standingPins) {
  if (!standingPins.length) {
    return 0;
  }
  let total = 0;
  for (const pin of standingPins) {
    total += PIN_LAYOUT[pin].x;
  }
  return total / standingPins.length;
}

function pickClosestPin(standingPins, targetX) {
  let chosen = standingPins[0] ?? null;
  let minDistance = Number.POSITIVE_INFINITY;
  for (const pin of standingPins) {
    const distance = Math.abs(PIN_LAYOUT[pin].x - targetX);
    if (distance < minDistance) {
      minDistance = distance;
      chosen = pin;
    }
  }
  return chosen;
}

function naturalHitWindow(standingCount) {
  if (standingCount <= 1) {
    return 0.34;
  }
  if (standingCount === 2) {
    return 0.42;
  }
  if (standingCount <= 4) {
    return 0.56;
  }
  return 0.9;
}

function strikeLaunchQuality(aim) {
  const lateral = Math.abs(aim);
  if (lateral >= 0.84) {
    return 0;
  }
  if (lateral <= 0.34) {
    return 1;
  }
  const normalized = (lateral - 0.34) / 0.5;
  return clamp(1 - normalized ** 1.7, 0, 1);
}

function getPinPathMetrics(pin, impactX) {
  const pinPosition = PIN_LAYOUT[pin];
  const lateral = Math.abs(pinPosition.x - impactX);
  const travelDistance = Math.hypot(lateral * 1.32, pinPosition.y * 0.34);
  return { pinPosition, lateral, travelDistance };
}

function pinAlignmentFactor(lateral, standingCount) {
  const window =
    standingCount <= 1
      ? 0.07
      : standingCount === 2
        ? 0.12
        : standingCount <= 4
          ? 0.24
          : 0.38;
  return Math.exp(-((lateral) ** 2) / window);
}

function pinProximityFactor(travelDistance, standingCount) {
  const window =
    standingCount <= 1
      ? 0.12
      : standingCount === 2
        ? 0.22
        : standingCount <= 4
          ? 0.34
          : 0.5;
  return Math.exp(-((travelDistance) ** 2) / window);
}

function sortPinsByTrajectory(standingPins, impactX) {
  return [...standingPins].sort((leftPin, rightPin) => {
    const leftMetrics = getPinPathMetrics(leftPin, impactX);
    const rightMetrics = getPinPathMetrics(rightPin, impactX);
    const lateralDelta = leftMetrics.lateral - rightMetrics.lateral;
    if (Math.abs(lateralDelta) > 0.05) {
      return lateralDelta;
    }
    const distanceDelta = leftMetrics.travelDistance - rightMetrics.travelDistance;
    if (Math.abs(distanceDelta) > 0.04) {
      return distanceDelta;
    }
    return leftMetrics.pinPosition.y - rightMetrics.pinPosition.y;
  });
}

function simulatePinCarry(state, standingPins, impactX, power, loft, profile) {
  const standingSet = new Set(standingPins);
  const knocked = new Set();
  const orderedPins = sortPinsByTrajectory(standingPins, impactX);

  // Ball energy model: starts high, decreases with each pin hit and lateral distance
  let ballEnergy = clamp(0.32 + power * 0.68 + loft * 0.1, 0.28, 1.22);

  for (const pin of orderedPins) {
    if (!standingSet.has(pin)) {
      continue;
    }

    const { pinPosition, lateral, travelDistance } = getPinPathMetrics(pin, impactX);
    const directWindow = naturalHitWindow(standingPins.length);
    if (standingPins.length <= 2 && lateral > directWindow) {
      continue;
    }

    const alignmentFactor = pinAlignmentFactor(lateral, standingPins.length);
    const proximityFactor = pinProximityFactor(travelDistance, standingPins.length);

    // Direct hits favor pins aligned with the travel line and, secondarily, the closest ones.
    const inPath = clamp(
      0.04
        + alignmentFactor * 0.78
        + proximityFactor * 0.14
        - pinPosition.y * 0.015,
      0.01,
      1
    );
    const energyAtPin = ballEnergy * inPath;

    // Support weakening: pins whose front supports are down fall more easily
    const supportPins = PIN_FRONT_SUPPORT[pin] ?? [];
    let supportFactor = 1.0;
    if (supportPins.length > 0) {
      const downCount = supportPins.filter(
        (id) => knocked.has(id) || !standingSet.has(id)
      ).length;
      // More supports knocked = pin more likely to fall
      supportFactor = 0.45 + (downCount / supportPins.length) * 0.82;
    }

    const baseChance =
      0.04
      + energyAtPin * 0.46
      + profile.carry * 0.18 * supportFactor
      + supportFactor * 0.12
      - pinPosition.y * 0.04;
    const trajectoryBias = clamp(
      0.08 + alignmentFactor * 0.72 + proximityFactor * 0.2,
      0.04,
      1
    );
    let chance =
      baseChance * trajectoryBias
      + alignmentFactor * 0.1
      + proximityFactor * 0.04;
    if (standingPins.length <= 4) {
      const precisionWindow =
        standingPins.length === 1 ? 0.08 : standingPins.length === 2 ? 0.14 : 0.32;
      const precisionFactor = Math.exp(-((lateral) ** 2) / precisionWindow);
      chance *=
        0.08
        + precisionFactor * 0.52
        + alignmentFactor * 0.3
        + proximityFactor * 0.1;
    }
    chance = clamp(chance, 0.005, 0.97);

    if (nextRandom(state) < chance) {
      knocked.add(pin);
      // Each knocked pin absorbs some ball energy
      ballEnergy = clamp(ballEnergy - 0.055 * (1 - inPath * 0.4), 0.18, 1.22);
    }
  }

  // Secondary scatter: knocked pins ricochet into still-standing neighbors
  // Two passes to allow chain reactions
  for (let pass = 0; pass < 2; pass += 1) {
    const newKnocks = new Set();
    for (const pin of standingPins) {
      if (knocked.has(pin)) {
        continue;
      }
      const neighbors = PIN_NEIGHBORS[pin] ?? [];
      const nearbyDown = neighbors.filter((id) => knocked.has(id)).length;
      if (nearbyDown <= 0) {
        continue;
      }

      // Direction-weighted: more neighbors knocked = higher scatter chance
      const scatterChance = clamp(
        0.03 + nearbyDown * 0.13 + power * 0.07 + loft * 0.04 + profile.carry * 0.07,
        0,
        0.76
      );
      if (nextRandom(state) < scatterChance) {
        newKnocks.add(pin);
      }
    }
    for (const pin of newKnocks) {
      knocked.add(pin);
    }
    if (newKnocks.size === 0) {
      break;
    }
  }

  return Array.from(knocked).sort((a, b) => a - b);
}

function isSplitLeave(standingPins) {
  if (standingPins.length < 2) {
    return false;
  }

  const standing = new Set(standingPins);
  if (standing.has(1)) {
    return false;
  }

  let hasGapByRow = false;
  for (const row of PIN_ROWS) {
    const rowStanding = row.filter((pin) => standing.has(pin));
    if (rowStanding.length >= 2) {
      const positions = rowStanding
        .map((pin) => PIN_LAYOUT[pin].x)
        .sort((a, b) => a - b);
      for (let index = 1; index < positions.length; index += 1) {
        if (positions[index] - positions[index - 1] > 1.01) {
          hasGapByRow = true;
          break;
        }
      }
      if (hasGapByRow) {
        break;
      }
    }
  }

  let unsupportedCount = 0;
  for (const pin of standingPins) {
    const supportPins = PIN_FRONT_SUPPORT[pin] ?? [];
    if (supportPins.length === 0) {
      continue;
    }
    if (supportPins.every((id) => !standing.has(id))) {
      unsupportedCount += 1;
    }
  }

  return hasGapByRow || unsupportedCount >= 2;
}

function chooseAiControls(state) {
  const profile = AI_PROFILES[state.difficultyKey];
  const standingPins = state.pinsStanding;
  const current = state.players[state.currentPlayer];
  const frame = current.frames[state.frameIndex];
  const rollIndex = frame.rolls.length;

  const targetX =
    standingPins.length === 10 && rollIndex === 0 ? 0.22 : centroidX(standingPins);

  const chaos = 1 - profile.consistency;
  const aim = clamp(targetX + randomSigned(state, 0.12 + chaos * 0.38), -1, 1);

  const powerBase =
    standingPins.length === 10 ? 0.74 : standingPins.length <= 2 ? 0.56 : 0.64;
  const power = clamp(powerBase + randomSigned(state, 0.06 + chaos * 0.2), 0.35, 0.98);

  const spinBase = standingPins.length === 10 ? 0.12 : 0.03;
  const spin = clamp(spinBase + randomSigned(state, 0.08 + chaos * 0.26), -0.9, 0.9);
  const loftBase =
    standingPins.length === 10 ? 0.18 : standingPins.length <= 2 ? 0.06 : 0.12;
  const loft = clamp(loftBase + randomSigned(state, 0.04 + chaos * 0.11), 0, 0.92);

  const confidence = clamp(
    profile.consistency * 0.56
      + profile.strikeSkill * 0.24
      + profile.spareSkill * 0.2
      - Math.abs(aim - targetX) * 0.28,
    0.05,
    0.99
  );

  return {
    aim,
    power,
    spin,
    loft,
    confidence,
    targetX,
    thinkMs: profile.thinkMs,
  };
}

function simulateRollOutcome(state, controls, profile, rollIndex, standingPins) {
  const effectiveAim = clamp(controls.aim + randomSigned(state, profile.aimNoise), -1, 1);
  const effectivePower = clamp(controls.power + randomSigned(state, profile.powerNoise), 0.28, 1);
  const effectiveSpin = clamp(controls.spin + randomSigned(state, profile.spinNoise), -1, 1);
  const effectiveLoft = clamp(controls.loft + randomSigned(state, profile.loftNoise), 0, 1);

  const foulChance = clamp(
    profile.foulBase
      + Math.max(0, Math.abs(effectiveAim) - 0.82) * 0.16
      + Math.max(0, effectivePower - 0.93) * 0.22,
    0,
    0.22
  );
  const foul = nextRandom(state) < foulChance;

  if (foul) {
    return {
      foul: true,
      knockedPins: [],
      effectiveAim,
      effectivePower,
      effectiveSpin,
      effectiveLoft,
      impactX: effectiveAim,
      quality: 0,
    };
  }

  const isRackStart = standingPins.length === 10;
  const pocketTarget = 0.22;
  // Hook physics: speed slows lane grip; low loft = more time on lane = more hook
  const speedFactor = clamp(1.1 - effectivePower * 0.78, 0.08, 0.82);
  const loftFactor = clamp(1.18 - effectiveLoft * 0.88, 0.22, 1.0);
  const hookMagnitude = Math.abs(effectiveSpin) * speedFactor * loftFactor * 0.30;
  const hookSign = effectiveSpin >= 0 ? 1 : -1;
  const breakpointX = clamp(effectiveAim + hookSign * hookMagnitude, -1.0, 1.0);
  const laneQuality = Math.exp(
    -((breakpointX - pocketTarget) ** 2) / (0.15 + (1 - profile.consistency) * 0.35)
  );
  const speedQuality = Math.exp(
    -((effectivePower - 0.74) ** 2) / (0.05 + (1 - profile.consistency) * 0.11)
  );
  const loftQuality = Math.exp(
    -((effectiveLoft - 0.18) ** 2) / (0.03 + (1 - profile.consistency) * 0.16)
  );
  const launchQuality = strikeLaunchQuality(effectiveAim);
  const pocketEntryQuality = Math.exp(
    -((breakpointX - pocketTarget) ** 2) / (0.075 + (1 - profile.consistency) * 0.14)
  );
  const strikeChance = clamp(
    profile.strikeSkill
      * (profile === HUMAN_PROFILE ? 0.89 : 1)
      * laneQuality
      * pocketEntryQuality
      * launchQuality
      * speedQuality
      * (0.82 + loftQuality * 0.18)
      + profile.carry * 0.05 * laneQuality * launchQuality,
    0,
    0.92
  );

  let knockedPins = [];
  if (isRackStart && rollIndex === 0 && nextRandom(state) < strikeChance) {
    knockedPins = [...standingPins];
  } else {
    knockedPins = simulatePinCarry(
      state,
      standingPins,
      breakpointX,
      effectivePower,
      effectiveLoft,
      profile
    );

    if (standingPins.length <= 4) {
      const center =
        standingPins.length === 1
          ? PIN_LAYOUT[standingPins[0]].x
          : centroidX(standingPins);
      const spareAccuracy = Math.exp(
        -((breakpointX - center) ** 2)
          / (
            (standingPins.length === 1 ? 0.06 : standingPins.length === 2 ? 0.12 : 0.2)
            + (1 - profile.consistency) * 0.22
          )
      );
      const spareAssist =
        standingPins.length === 1 ? 0.92 : standingPins.length === 2 ? 0.82 : 0.7;
      const spareChance = clamp(
        profile.spareSkill
          * spareAssist
          * (profile === HUMAN_PROFILE ? 0.72 : 0.78)
          * spareAccuracy
          * (0.34 + speedQuality * 0.16 + loftQuality * 0.08),
        0.02,
        0.64
      );
      if (nextRandom(state) < spareChance) {
        knockedPins = [...standingPins];
      }
    }

    if (knockedPins.length === 0 && nextRandom(state) < profile.carry * 0.09) {
      const fallback = pickClosestPin(standingPins, breakpointX);
      if (fallback != null) {
        const fallbackDistance = Math.abs(PIN_LAYOUT[fallback].x - breakpointX);
        if (fallbackDistance <= naturalHitWindow(standingPins.length)) {
          knockedPins = [fallback];
        }
      }
    }
  }

  return {
    foul: false,
    knockedPins: knockedPins.sort((a, b) => a - b),
    effectiveAim,
    effectivePower,
    effectiveSpin,
    effectiveLoft,
    impactX: breakpointX,
    quality: clamp(laneQuality * 0.45 + speedQuality * 0.35 + profile.consistency * 0.2, 0, 1),
  };
}

function standingAfterRoll(frameIndex, rolls, standingBefore, knockedPins, foul) {
  const knockedSet = new Set(knockedPins);

  if (frameIndex < 9) {
    if (foul) {
      return [...standingBefore];
    }
    return standingBefore.filter((pin) => !knockedSet.has(pin));
  }

  if (rolls.length === 1) {
    if (rolls[0] === 10) {
      return [...FULL_RACK];
    }
    if (foul) {
      return [...standingBefore];
    }
    return standingBefore.filter((pin) => !knockedSet.has(pin));
  }

  if (rolls.length === 2) {
    const first = rolls[0];
    const second = rolls[1];
    if (first === 10) {
      if (second === 10 || foul) {
        return [...FULL_RACK];
      }
      return FULL_RACK.filter((pin) => !knockedSet.has(pin));
    }
    if (first + second === 10) {
      return [...FULL_RACK];
    }
    if (foul) {
      return [...standingBefore];
    }
    return standingBefore.filter((pin) => !knockedSet.has(pin));
  }

  return [...standingBefore];
}

function recomputePlayers(state) {
  for (const player of state.players) {
    const scores = computeCumulativeScores(player.frames);
    player.cumulative = scores.totals;
    player.total = scores.resolvedTotal;
    player.stats = computeStats(player.frames);
    player.finished = playerFinished(player);
  }
}

function setTurnPhase(state) {
  const activePlayer = state.players[state.currentPlayer];
  if (!activePlayer) {
    return;
  }

  if (activePlayer.type === "ai") {
    state.status = "ai-thinking";
    state.aiPlan = chooseAiControls(state);
    state.phaseTimerMs = state.aiPlan.thinkMs;
  } else {
    state.status = "aim";
    state.aiPlan = null;
    state.phaseTimerMs = 0;
  }
}

function getRollKindKey(frameIndex, rollNumber, frame) {
  if (frame.rolls[rollNumber] == null) {
    return "open";
  }
  if (frame.rolls[rollNumber] === 10 && (frameIndex < 9 || rollNumber === 0)) {
    return "strike";
  }
  if (rollNumber === 1 && frame.rolls[0] !== 10 && frame.rolls[0] + frame.rolls[1] === 10) {
    return "spare";
  }
  if (
    rollNumber === 2
    && frameIndex === 9
    && frame.rolls[0] === 10
    && frame.rolls[1] < 10
    && frame.rolls[1] + frame.rolls[2] === 10
  ) {
    return "spare";
  }
  return "open";
}

function getRollKindLabel(kind, locale) {
  return localizeLabel(ROLL_KIND_COPY[kind], locale);
}

export function beginRoll(state, controls) {
  const activePlayer = state.players[state.currentPlayer];
  if (!activePlayer) {
    return false;
  }

  if (state.status !== "aim" && state.status !== "ai-thinking") {
    return false;
  }
  if (activePlayer.type === "human" && state.status !== "aim") {
    return false;
  }
  if (activePlayer.type === "ai" && state.status !== "ai-thinking") {
    return false;
  }

  const frame = activePlayer.frames[state.frameIndex];
  const rollIndex = frame.rolls.length;
  const profile = activePlayer.type === "ai" ? AI_PROFILES[state.difficultyKey] : HUMAN_PROFILE;
  const outcome = simulateRollOutcome(state, controls, profile, rollIndex, state.pinsStanding);

  state.pendingOutcome = {
    ...outcome,
    controls: {
      aim: controls.aim,
      power: controls.power,
      spin: controls.spin,
      loft: controls.loft,
    },
    frameIndex: state.frameIndex,
    playerIndex: state.currentPlayer,
    rollIndex,
  };
  state.status = "rolling";
  state.phaseTimerMs = ROLL_DURATION_MS;
  state.rollAnimationProgress = 0;

  return true;
}

function buildRollResolution(state) {
  const outcome = state.pendingOutcome;
  if (!outcome) {
    return null;
  }

  const player = state.players[state.currentPlayer];
  const frame = player.frames[state.frameIndex];
  const standingBefore = [...state.pinsStanding];
  const standingSet = new Set(standingBefore);
  const legalKnocked = outcome.foul
    ? []
    : outcome.knockedPins.filter((pin) => standingSet.has(pin));
  const knockedSet = new Set(legalKnocked);
  const pinfall = legalKnocked.length;
  const rollIndex = frame.rolls.length;
  const previewRolls = [...frame.rolls, pinfall];
  const split =
    rollIndex === 0 && !outcome.foul
      ? isSplitLeave(standingBefore.filter((pin) => !knockedSet.has(pin)))
      : frame.split;
  const previewFrame = {
    ...frame,
    rolls: previewRolls,
    split,
  };
  const rollKind = getRollKindKey(state.frameIndex, rollIndex, previewFrame);
  const rollType = getRollKindLabel(rollKind, state.locale);
  const standingAfter = standingAfterRoll(
    state.frameIndex,
    previewRolls,
    standingBefore,
    legalKnocked,
    outcome.foul
  );

  return {
    playerIndex: state.currentPlayer,
    playerName: player.name,
    playerType: player.type,
    frameIndex: state.frameIndex,
    rollIndex,
    pinfall,
    foul: Boolean(outcome.foul),
    split,
    knockedPins: legalKnocked,
    standingBefore,
    standingAfter,
    lane: getLaneLabel(state.frameIndex, state.locale),
    kind: rollKind,
    type: rollType,
    adjudication: outcome.foul ? "illegal" : "legal",
    impactX: outcome.impactX ?? outcome.effectiveAim ?? 0,
    controls: { ...outcome.controls },
    effectiveAim: outcome.effectiveAim ?? 0,
    effectivePower: outcome.effectivePower ?? 0,
    effectiveSpin: outcome.effectiveSpin ?? 0,
    effectiveLoft: outcome.effectiveLoft ?? 0,
  };
}

function buildPinfallAnimation(state, resolution) {
  const standingSet = new Set(resolution.standingBefore);
  const knockedSet = new Set(resolution.knockedPins);

  // Ball entry angle: derived from aim offset relative to pocket and spin
  // Positive entryAngle = ball coming from left (hooks into pocket)
  const entryAngle = resolution.effectiveSpin * 0.28 + (resolution.impactX - 0.22) * -0.18;

  const pins = FULL_RACK.filter((pin) => standingSet.has(pin)).map((pin) => {
    const point = PIN_LAYOUT[pin];
    // Lateral distance from ball impact: positive = pin is to the right of impact
    const lateral = point.x - resolution.impactX;
    // Delay: back row pins react slightly later (cascade)
    const delay = clamp(
      point.y * 0.052
        + Math.abs(lateral) * 0.028
        + (1 - resolution.effectivePower) * 0.025
        + nextRandom(state) * 0.038,
      0,
      0.30
    );

    if (knockedSet.has(pin)) {
      // Direction considers lateral displacement, ball spin, and entry angle
      // Pins directly in front of ball go backward; pins on sides fly outward
      const spreadComponent = lateral * 0.52;
      const spinComponent = resolution.effectiveSpin * 0.88;
      const entryComponent = entryAngle * 0.34;
      const noise = randomSigned(state, 0.2);
      const direction = clamp(
        spreadComponent + spinComponent + entryComponent + noise,
        -1.55,
        1.55
      );

      // Pins hit directly (low lateral) get more lift and backward travel
      const directHit = clamp(1 - Math.abs(lateral) * 1.1, 0, 1);
      const lift = 0.05 + directHit * 0.14 + resolution.effectiveLoft * 0.2 + resolution.effectivePower * 0.06;
      const travel = 0.08 + directHit * 0.18 + resolution.effectivePower * 0.32 + resolution.effectiveLoft * 0.1;

      return {
        id: pin,
        knocked: true,
        standing: false,
        delay,
        direction,
        travel,
        lift,
        tilt: 0.72 + resolution.effectivePower * 1.28 + Math.abs(direction) * 0.18,
        twist: (direction < 0 ? -1 : 1) * (0.18 + nextRandom(state) * 0.42),
        fade: 0.65 + nextRandom(state) * 0.22,
      };
    }

    // Standing pin: sway proportional to nearby impact energy
    const nearImpact = clamp(1 - Math.abs(lateral) * 0.6 - point.y * 0.12, 0, 1);
    return {
      id: pin,
      knocked: false,
      standing: true,
      delay: 0,
      sway: (0.03 + resolution.effectivePower * 0.04 + nearImpact * 0.04) * (0.7 + nextRandom(state) * 0.6),
      swayPhase: nextRandom(state) * Math.PI * 2,
    };
  });

  return {
    progress: 0,
    durationMs: PINFALL_DURATION_MS,
    standingBefore: [...resolution.standingBefore],
    standingAfter: [...resolution.standingAfter],
    knockedPins: [...resolution.knockedPins],
    impactX: resolution.impactX,
    effectiveSpin: resolution.effectiveSpin,
    effectiveLoft: resolution.effectiveLoft,
    pins,
  };
}

function startPinfall(state) {
  const resolution = buildRollResolution(state);
  if (!resolution) {
    return;
  }

  state.pendingResolution = resolution;
  state.pinAnimation = buildPinfallAnimation(state, resolution);
  state.celebration =
    resolution.kind === "strike" || resolution.kind === "spare"
      ? {
          kind: resolution.kind,
          playerName: resolution.playerName,
          remainingMs: CELEBRATION_DURATION_MS,
          durationMs: CELEBRATION_DURATION_MS,
        }
      : null;
  state.pendingOutcome = null;
  state.status = "pinfall";
  state.phaseTimerMs = PINFALL_DURATION_MS;
  state.rollAnimationProgress = 1;
}

function applyRollResolution(state) {
  const resolution = state.pendingResolution;
  if (!resolution) {
    return;
  }

  const player = state.players[resolution.playerIndex];
  const frame = player.frames[resolution.frameIndex];

  frame.rolls.push(resolution.pinfall);
  frame.fouls[resolution.rollIndex] = resolution.foul;
  if (resolution.rollIndex === 0) {
    frame.split = resolution.split;
  }

  state.lastRoll = {
    playerName: resolution.playerName,
    frame: resolution.frameIndex + 1,
    roll: resolution.rollIndex + 1,
    pinfall: resolution.pinfall,
    foul: resolution.foul,
    split: resolution.rollIndex === 0 ? resolution.split : false,
    knockedPins: [...resolution.knockedPins],
    lane: resolution.lane,
    kind: resolution.kind,
    type: resolution.type,
    adjudication: resolution.adjudication,
    impactX: resolution.impactX,
    loft: resolution.effectiveLoft,
  };

  if (resolution.foul) {
    pushLog(
      state,
      state.locale === "es"
        ? `${resolution.playerName}: falta en ${resolution.lane} (F, 0 bolos).`
        : `${resolution.playerName}: foul on ${resolution.lane} (F, 0 pins).`
    );
  } else {
    const splitTag =
      resolution.rollIndex === 0 && resolution.split
        ? state.locale === "es" ? " | split" : " | split"
        : "";
    pushLog(
      state,
      state.locale === "es"
        ? `${resolution.playerName}: ${resolution.pinfall} bolos (${resolution.type.toLowerCase()}) en ${resolution.lane}.${splitTag}`
        : `${resolution.playerName}: ${resolution.pinfall} pins (${resolution.type.toLowerCase()}) on ${resolution.lane}.${splitTag}`
    );
  }

  state.pendingResolution = null;
  state.pinAnimation = null;
  state.rollAnimationProgress = 0;

  const frameDone = frameIsComplete(resolution.frameIndex, frame.rolls);
  if (!frameDone) {
    state.pinsStanding = [...resolution.standingAfter];
    if (player.type === "ai") {
      state.status = "ai-thinking";
      state.aiPlan = chooseAiControls(state);
      state.phaseTimerMs = state.aiPlan.thinkMs;
    } else {
      state.status = "aim";
      state.phaseTimerMs = 0;
      state.aiPlan = null;
    }
    recomputePlayers(state);
    return;
  }

  if (state.currentPlayer < state.players.length - 1) {
    state.currentPlayer += 1;
  } else {
    state.currentPlayer = 0;
    state.frameIndex += 1;
  }

  recomputePlayers(state);

  if (state.frameIndex >= FRAME_COUNT) {
    state.status = "finished";
    state.phaseTimerMs = 0;
    state.pinsStanding = [...FULL_RACK];
    state.aiPlan = null;

    const topScore = Math.max(...state.players.map((candidate) => candidate.total));
    const leaders = state.players.filter((candidate) => candidate.total === topScore);
    if (leaders.length === 1) {
      const [leader] = leaders;
      state.winner = leader.name;
      pushLog(
        state,
        state.locale === "es"
          ? `${leader.name} gana la serie con ${leader.total}.`
          : `${leader.name} wins the series with ${leader.total}.`
      );
    } else {
      state.winner = null;
      const tiedNames = leaders.map((leader) => leader.name).join(", ");
      pushLog(
        state,
        state.locale === "es"
          ? `Empate a ${topScore} entre ${tiedNames}.`
          : `Tie at ${topScore} between ${tiedNames}.`
      );
    }
    return;
  }

  state.pinsStanding = [...FULL_RACK];
  setTurnPhase(state);
}

export function tickState(previous, deltaMs) {
  if (deltaMs <= 0) {
    return previous;
  }

  const hasActivePhase =
    previous.status === "rolling"
    || previous.status === "ai-thinking"
    || previous.status === "pinfall";
  const hasCelebration = previous.celebration != null;
  const hasControlFeedback = previous.controlFeedback != null;

  if (
    !hasActivePhase
    && !hasCelebration
    && !hasControlFeedback
  ) {
    return previous;
  }

  const next = cloneState(previous);
  let changed = false;

  if (next.celebration) {
    next.celebration.remainingMs = Math.max(0, next.celebration.remainingMs - deltaMs);
    changed = true;
    if (next.celebration.remainingMs <= 0) {
      next.celebration = null;
    }
  }

  if (next.controlFeedback) {
    next.controlFeedback.remainingMs = Math.max(0, next.controlFeedback.remainingMs - deltaMs);
    changed = true;
    if (next.controlFeedback.remainingMs <= 0) {
      next.controlFeedback = null;
    }
  }

  if (!hasActivePhase) {
    return changed ? next : previous;
  }

  if (next.status === "ai-thinking") {
    const remainingMsBeforeTick = next.phaseTimerMs;
    next.phaseTimerMs -= deltaMs;
    changed = true;
    animateAiControls(next, deltaMs, remainingMsBeforeTick);
    if (next.phaseTimerMs <= 0) {
      if (!next.aiPlan) {
        next.aiPlan = chooseAiControls(next);
      }
      next.controls.aim = next.aiPlan.aim;
      next.controls.power = next.aiPlan.power;
      next.controls.spin = next.aiPlan.spin;
      next.controls.loft = next.aiPlan.loft;
      const launched = beginRoll(next, next.aiPlan);
      if (!launched) {
        next.status = "aim";
        next.aiPlan = null;
        next.phaseTimerMs = 0;
      }
    }
  } else if (next.status === "rolling") {
    next.phaseTimerMs -= deltaMs;
    changed = true;
    const elapsed = clamp(ROLL_DURATION_MS - Math.max(0, next.phaseTimerMs), 0, ROLL_DURATION_MS);
    next.rollAnimationProgress = elapsed / ROLL_DURATION_MS;
    if (next.phaseTimerMs <= 0) {
      startPinfall(next);
    }
  } else if (next.status === "pinfall") {
    next.phaseTimerMs -= deltaMs;
    changed = true;
    if (next.pinAnimation) {
      const elapsed = clamp(
        PINFALL_DURATION_MS - Math.max(0, next.phaseTimerMs),
        0,
        PINFALL_DURATION_MS
      );
      next.pinAnimation.progress = elapsed / PINFALL_DURATION_MS;
    }
    if (next.phaseTimerMs <= 0) {
      applyRollResolution(next);
    }
  }

  return changed ? next : previous;
}

export function getStatusLabel(state, ui) {
  if (state.status === "menu") {
    return ui.ready;
  }
  if (state.status === "finished") {
    return state.winner ? `${ui.winner}: ${state.winner}` : ui.tie;
  }
  if (state.status === "ai-thinking") {
    return ui.aiTurn;
  }
  if (state.status === "pinfall") {
    return state.players[state.currentPlayer]?.type === "ai" ? ui.aiTurn : ui.yourTurn;
  }
  if (state.status === "rolling") {
    return state.players[state.currentPlayer]?.type === "ai" ? ui.aiTurn : ui.yourTurn;
  }
  return state.players[state.currentPlayer]?.type === "ai" ? ui.aiTurn : ui.yourTurn;
}

export function clampDisplayNumber(value, digits = 2) {
  return Number.isFinite(value) ? Number(value).toFixed(digits) : "0.00";
}

export function getDifficultyLabel(key, locale) {
  return localizeLabel(AI_PROFILES[key]?.label, locale) || key;
}

export function getBallState(game) {
  const laneIndex = game.frameIndex % 2;
  const controls =
    game.pendingOutcome?.controls
    ?? game.pendingResolution?.controls
    ?? game.controls;
  const effectiveAim = game.pendingOutcome?.effectiveAim ?? controls.aim;
  const effectiveSpin = game.pendingOutcome?.effectiveSpin ?? controls.spin;
  const effectiveLoft =
    game.pendingOutcome?.effectiveLoft
    ?? game.pendingResolution?.effectiveLoft
    ?? controls.loft;

  const progress =
    game.status === "rolling"
      ? game.rollAnimationProgress
      : game.status === "pinfall"
        ? 1
        : game.status === "aim" || game.status === "ai-thinking"
        ? 0
        : null;

  if (progress == null) {
    return null;
  }

  return {
    laneIndex,
    lineAim: controls.aim,
    targetAim: effectiveAim,
    spin: effectiveSpin,
    loft: effectiveLoft,
    progress,
    impactX: game.pendingOutcome?.impactX ?? game.pendingResolution?.impactX ?? effectiveAim,
    pinfallProgress: game.pinAnimation?.progress ?? 0,
  };
}

export {
  AI_PROFILES,
  AI_PLAYER_COUNT_OPTIONS,
  DEFAULT_CONTROLS,
  FRAME_COUNT,
  FULL_RACK,
  PIN_LAYOUT,
};
