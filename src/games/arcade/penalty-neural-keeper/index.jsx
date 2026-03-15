import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useGameRuntimeBridge from "../../../utils/useGameRuntimeBridge";
import resolveBrowserLanguage from "../../../utils/resolveBrowserLanguage";

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 620;
const TOTAL_PENALTIES = 10;
const FIXED_STEP_MS = 1000 / 60;
const MAX_DELTA_MS = 50;
const COORDINATE_SYSTEM = "origin_top_left_x_right_y_down_pixels";

const GOAL_FRAME = {
  x: 286,
  y: 84,
  w: 508,
  h: 212,
};

const PENALTY_SPOT = {
  x: CANVAS_WIDTH / 2,
  y: 515,
};

const GOAL_CENTER_X = GOAL_FRAME.x + GOAL_FRAME.w * 0.5;
const KEEPER_BASE_Y = GOAL_FRAME.y + GOAL_FRAME.h - 22;

const SHOT_ZONES = [
  {
    id: "down-left",
    row: 1,
    col: 0,
    side: "left",
    target: { x: GOAL_FRAME.x + 86, y: GOAL_FRAME.y + GOAL_FRAME.h - 26 },
    label: { es: "Abajo izquierda", en: "Bottom left" },
    short: { es: "AI", en: "BL" },
  },
  {
    id: "down-right",
    row: 1,
    col: 2,
    side: "right",
    target: { x: GOAL_FRAME.x + GOAL_FRAME.w - 86, y: GOAL_FRAME.y + GOAL_FRAME.h - 26 },
    label: { es: "Abajo derecha", en: "Bottom right" },
    short: { es: "AD", en: "BR" },
  },
  {
    id: "top-left",
    row: 0,
    col: 0,
    side: "left",
    target: { x: GOAL_FRAME.x + 80, y: GOAL_FRAME.y + 36 },
    label: { es: "Arriba izquierda", en: "Top left" },
    short: { es: "ArI", en: "TL" },
  },
  {
    id: "top-right",
    row: 0,
    col: 2,
    side: "right",
    target: { x: GOAL_FRAME.x + GOAL_FRAME.w - 80, y: GOAL_FRAME.y + 36 },
    label: { es: "Arriba derecha", en: "Top right" },
    short: { es: "ArD", en: "TR" },
  },
  {
    id: "center",
    row: 1,
    col: 1,
    side: "center",
    target: { x: GOAL_CENTER_X, y: GOAL_FRAME.y + GOAL_FRAME.h * 0.52 },
    label: { es: "Centro", en: "Center" },
    short: { es: "C", en: "C" },
  },
];

const ZONE_BY_ID = Object.fromEntries(SHOT_ZONES.map((zone) => [zone.id, zone]));
const ZONE_IDS = SHOT_ZONES.map((zone) => zone.id);

const UI_COPY = {
  es: {
    title: "Penalty Neural Keeper",
    subtitle:
      "Tanda de 10 penaltis con IA adaptativa: el portero aprende patrones recientes y mejora cada parada.",
    start: "Empezar tanda",
    restart: "Nueva tanda",
    fullscreen: "Pantalla completa",
    continue: "Continuar",
    attempt: "Penalti",
    goals: "Goles",
    saves: "Paradas",
    score: "Marcador",
    aiTitle: "Analitica del portero",
    adaptation: "Adaptacion",
    confidence: "Confianza",
    learningIndex: "Indice de aprendizaje",
    tendency: "Tendencia detectada",
    diveRead: "Lectura probable",
    saveChance: "Prob. de parada estimada",
    controlsTitle: "Seleccion de zona",
    controlsHint:
      "Raton/touch o teclado: 1=abajo izq, 2=abajo der, 3=arriba izq, 4=arriba der, 5=centro. R reinicia, F pantalla completa.",
    timelineTitle: "Ultimas tiradas",
    timelineEmpty: "Sin historial todavia.",
    menuTitle: "Penalty Neural Keeper",
    menuBody:
      "Define una de cinco zonas por disparo. El portero IA analiza frecuencia, repeticion y transiciones para anticipar la siguiente decision.",
    menuHint:
      "Si repites patrones, la IA aumenta su cobertura lateral, reduce su reaccion y sube su probabilidad de parada.",
    finishedTitle: "Tanda finalizada",
    finishedBody: "Resume y vuelve a lanzar otra serie para medir si puedes romper la lectura del portero.",
    chooseZone: "Elige una zona de disparo para iniciar el siguiente penalti.",
    preparing: "Preparando ejecucion...",
    shotGoal: "Gol: el balon supera la estirada del portero.",
    shotSave: "Parada: el portero cierra la zona y bloquea el tiro.",
    nextPenalty: "Listo para el siguiente penalti.",
    finalMessage: "Resultado final",
    tendencyUnknown: "Sin patron claro aun",
    controlsAria: "Controles de disparo de penaltis",
  },
  en: {
    title: "Penalty Neural Keeper",
    subtitle:
      "10-penalty shootout with adaptive AI: the goalkeeper learns recent patterns and improves each save.",
    start: "Start shootout",
    restart: "New shootout",
    fullscreen: "Fullscreen",
    continue: "Continue",
    attempt: "Penalty",
    goals: "Goals",
    saves: "Saves",
    score: "Score",
    aiTitle: "Goalkeeper analytics",
    adaptation: "Adaptation",
    confidence: "Confidence",
    learningIndex: "Learning index",
    tendency: "Detected tendency",
    diveRead: "Likely read",
    saveChance: "Estimated save chance",
    controlsTitle: "Shot target",
    controlsHint:
      "Mouse/touch or keyboard: 1=bottom left, 2=bottom right, 3=top left, 4=top right, 5=center. R restarts, F fullscreen.",
    timelineTitle: "Recent shots",
    timelineEmpty: "No history yet.",
    menuTitle: "Penalty Neural Keeper",
    menuBody:
      "Choose one of five target zones each shot. The AI goalkeeper analyzes frequency, repetition, and transitions to anticipate your next decision.",
    menuHint:
      "If you repeat patterns, the AI increases lateral coverage, lowers reaction time, and raises save probability.",
    finishedTitle: "Shootout complete",
    finishedBody: "Review the run and fire a new series to see whether you can break the goalkeeper read.",
    chooseZone: "Pick a target zone to launch the next penalty.",
    preparing: "Preparing shot...",
    shotGoal: "Goal: the ball beats the goalkeeper stretch.",
    shotSave: "Save: the goalkeeper closes the lane and blocks the shot.",
    nextPenalty: "Ready for the next penalty.",
    finalMessage: "Final result",
    tendencyUnknown: "No clear pattern yet",
    controlsAria: "Penalty shot controls",
  },
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function easeOutCubic(t) {
  const clamped = clamp(t, 0, 1);
  return 1 - (1 - clamped) ** 3;
}

function easeInOutSine(t) {
  const clamped = clamp(t, 0, 1);
  return -(Math.cos(Math.PI * clamped) - 1) * 0.5;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createZoneMap(seedValue = 0) {
  return ZONE_IDS.reduce((accumulator, zoneId) => {
    accumulator[zoneId] = seedValue;
    return accumulator;
  }, {});
}

function normalizeMap(values) {
  const sum = Object.values(values).reduce((accumulator, value) => accumulator + value, 0);
  if (sum <= 0) {
    const equal = 1 / ZONE_IDS.length;
    return createZoneMap(equal);
  }
  return ZONE_IDS.reduce((accumulator, zoneId) => {
    accumulator[zoneId] = values[zoneId] / sum;
    return accumulator;
  }, {});
}

function localizeZone(zoneId, locale) {
  const zone = ZONE_BY_ID[zoneId];
  if (!zone) {
    return zoneId;
  }
  return zone.label[locale] ?? zone.label.en;
}

function shortZone(zoneId, locale) {
  const zone = ZONE_BY_ID[zoneId];
  if (!zone) {
    return zoneId;
  }
  return zone.short[locale] ?? zone.short.en;
}

function findTendencyZone(history) {
  if (!history.length) {
    return null;
  }
  const weighted = createZoneMap(0.4);
  for (let index = 0; index < history.length; index += 1) {
    const shot = history[index];
    const age = history.length - 1 - index;
    const decay = 0.82 ** age;
    weighted[shot.zoneId] += 1.15 * decay;
  }
  let bestZone = ZONE_IDS[0];
  let bestScore = -Infinity;
  for (const zoneId of ZONE_IDS) {
    if (weighted[zoneId] > bestScore) {
      bestScore = weighted[zoneId];
      bestZone = zoneId;
    }
  }
  return bestZone;
}

function computePredictability(history) {
  if (history.length <= 1) {
    return 0.16;
  }
  const counts = createZoneMap(0);
  for (const shot of history) {
    counts[shot.zoneId] += 1;
  }
  const maxCount = Math.max(...Object.values(counts));
  const frequencyScore = maxCount / history.length;
  let repeatTransitions = 0;
  let alternatingTransitions = 0;
  for (let index = 1; index < history.length; index += 1) {
    if (history[index].zoneId === history[index - 1].zoneId) {
      repeatTransitions += 1;
    }
    if (index >= 2 && history[index].zoneId === history[index - 2].zoneId) {
      alternatingTransitions += 1;
    }
  }
  const repeatScore = repeatTransitions / (history.length - 1);
  const alternatingScore = alternatingTransitions / Math.max(1, history.length - 2);
  return clamp(frequencyScore * 0.52 + repeatScore * 0.28 + alternatingScore * 0.2, 0, 1);
}

function computeFrequencyScores(history) {
  const weighted = createZoneMap(0.7);
  for (let index = 0; index < history.length; index += 1) {
    const shot = history[index];
    const age = history.length - 1 - index;
    const decay = 0.84 ** age;
    weighted[shot.zoneId] += 1.2 * decay;
  }
  return normalizeMap(weighted);
}

function computeTransitionScores(history, previousZoneId) {
  if (!previousZoneId) {
    return normalizeMap(createZoneMap(1));
  }
  const weighted = createZoneMap(0.55);
  for (let index = 1; index < history.length; index += 1) {
    if (history[index - 1].zoneId !== previousZoneId) {
      continue;
    }
    const age = history.length - 1 - index;
    const decay = 0.8 ** age;
    weighted[history[index].zoneId] += 1.08 * decay;
  }
  return normalizeMap(weighted);
}

function patternBonus(history, zoneId) {
  if (history.length < 2) {
    return 0;
  }
  const last = history[history.length - 1]?.zoneId;
  const previous = history[history.length - 2]?.zoneId;
  const currentZone = ZONE_BY_ID[zoneId];
  const lastZone = ZONE_BY_ID[last];
  if (!lastZone || !currentZone) {
    return 0;
  }
  let bonus = 0;
  if (last === previous && last === zoneId) {
    bonus += 0.24;
  }
  if (lastZone.side === currentZone.side && lastZone.side !== "center") {
    bonus += 0.08;
  }
  if (lastZone.row === currentZone.row) {
    bonus += 0.05;
  }
  return bonus;
}

function resolveKeeperPrediction(history, attemptsTaken, sample = true) {
  const adaptation = clamp(0.18 + (attemptsTaken / TOTAL_PENALTIES) * 0.74, 0.18, 0.96);
  const frequency = computeFrequencyScores(history);
  const previousZoneId = history.length ? history[history.length - 1].zoneId : null;
  const transitions = computeTransitionScores(history, previousZoneId);
  const tendencyZone = findTendencyZone(history);
  const predictability = computePredictability(history);
  const learningIndex = clamp(adaptation * 0.57 + predictability * 0.43, 0.1, 0.99);
  const scores = createZoneMap(0);
  for (const zoneId of ZONE_IDS) {
    let score = 0.12;
    score += frequency[zoneId] * (0.34 + adaptation * 0.3);
    score += transitions[zoneId] * (0.24 + adaptation * 0.23);
    score += patternBonus(history, zoneId) * (0.36 + adaptation * 0.2);
    if (tendencyZone && tendencyZone === zoneId) {
      score += 0.12 * learningIndex;
    }
    if (previousZoneId && previousZoneId === zoneId) {
      score += 0.06 * adaptation;
    }
    scores[zoneId] = score;
  }

  const ordered = [...ZONE_IDS].sort((left, right) => scores[right] - scores[left]);
  const topScore = scores[ordered[0]];
  const secondScore = scores[ordered[1]] ?? topScore;
  const confidenceGap = (topScore - secondScore) / Math.max(topScore, 0.001);
  const confidence = clamp(0.2 + confidenceGap * 0.68 + adaptation * 0.2, 0.12, 0.99);
  const noiseAmplitude = sample ? lerp(0.24, 0.04, adaptation) : 0;

  let predictedZoneId = ordered[0];
  if (noiseAmplitude > 0) {
    let bestNoisyScore = -Infinity;
    for (const zoneId of ZONE_IDS) {
      const noisyScore = scores[zoneId] + randomBetween(-noiseAmplitude, noiseAmplitude);
      if (noisyScore > bestNoisyScore) {
        bestNoisyScore = noisyScore;
        predictedZoneId = zoneId;
      }
    }
  }

  const reactionMs = Math.round(
    clamp(
      340 - adaptation * 124 - learningIndex * 94 - confidence * 68 + (sample ? randomBetween(-18, 18) : 0),
      96,
      360
    )
  );
  const diveDurationMs = Math.round(clamp(512 - adaptation * 132 - confidence * 74, 210, 520));
  const reachPx = clamp(74 + learningIndex * 64 + adaptation * 46 + confidence * 26, 70, 188);

  return {
    predictedZoneId,
    tendencyZone,
    adaptation,
    confidence,
    learningIndex,
    reactionMs,
    diveDurationMs,
    reachPx,
    scores,
  };
}

function zoneDistance(zoneAId, zoneBId) {
  const zoneA = ZONE_BY_ID[zoneAId];
  const zoneB = ZONE_BY_ID[zoneBId];
  if (!zoneA || !zoneB) {
    return 3;
  }
  return Math.abs(zoneA.col - zoneB.col) + Math.abs(zoneA.row - zoneB.row);
}

function quadraticPoint(start, control, end, t) {
  const clamped = clamp(t, 0, 1);
  const oneMinusT = 1 - clamped;
  const x =
    oneMinusT * oneMinusT * start.x +
    2 * oneMinusT * clamped * control.x +
    clamped * clamped * end.x;
  const y =
    oneMinusT * oneMinusT * start.y +
    2 * oneMinusT * clamped * control.y +
    clamped * clamped * end.y;
  return { x, y };
}

function keeperDiveX(zoneId) {
  const zone = ZONE_BY_ID[zoneId];
  if (!zone) {
    return GOAL_CENTER_X;
  }
  const jitter = zone.side === "center" ? 0 : randomBetween(-10, 10);
  return clamp(zone.target.x + jitter, GOAL_FRAME.x + 44, GOAL_FRAME.x + GOAL_FRAME.w - 44);
}

function saveProbabilityForShot(zoneId, prediction, history) {
  const distance = zoneDistance(zoneId, prediction.predictedZoneId);
  const zone = ZONE_BY_ID[zoneId];
  const baseByDistance = distance === 0 ? 0.35 : distance === 1 ? 0.23 : distance === 2 ? 0.14 : 0.08;
  const heightModifier = zone?.row === 0 ? -0.08 : zoneId === "center" ? 0.07 : -0.015;
  const repeatedZone = history.length > 0 && history[history.length - 1].zoneId === zoneId;
  const repetitionBonus = repeatedZone ? 0.1 * prediction.learningIndex : 0;
  const tendencyBonus = prediction.tendencyZone === zoneId ? 0.07 * prediction.adaptation : 0;
  const trackingBonus = prediction.learningIndex * 0.24 + prediction.confidence * 0.16 + prediction.adaptation * 0.14;
  const strikeVariance = randomBetween(-0.085, 0.08);
  return clamp(
    baseByDistance + heightModifier + repetitionBonus + tendencyBonus + trackingBonus - strikeVariance,
    0.05,
    0.9
  );
}

function createShot(state, zoneId) {
  const zone = ZONE_BY_ID[zoneId];
  if (!zone) {
    return null;
  }

  const prediction = resolveKeeperPrediction(state.history, state.attemptsTaken, true);
  const saveProbability = saveProbabilityForShot(zoneId, prediction, state.history);
  const isSave = Math.random() < saveProbability;
  const shotPower =
    zone.row === 0
      ? randomBetween(0.8, 1)
      : zoneId === "center"
        ? randomBetween(0.62, 0.84)
        : randomBetween(0.69, 0.92);
  const targetX = zone.target.x + randomBetween(-16, 16);
  const targetY = zone.target.y + randomBetween(zone.row === 0 ? -8 : -6, zone.row === 0 ? 10 : 14);
  const curveDirection = zone.side === "left" ? -1 : zone.side === "right" ? 1 : 0;
  const controlX = lerp(PENALTY_SPOT.x, targetX, 0.5) + curveDirection * randomBetween(24, 54) + randomBetween(-10, 10);
  const arcLift = zone.row === 0 ? randomBetween(-206, -154) : randomBetween(-138, -94);
  const controlY = Math.min(PENALTY_SPOT.y - 40, lerp(PENALTY_SPOT.y, targetY, 0.48) + arcLift);
  const durationMs = Math.round(clamp(990 - shotPower * 410 + randomBetween(-36, 54), 480, 960));
  const interceptT = clamp(0.68 + prediction.confidence * 0.13 + prediction.learningIndex * 0.08, 0.66, 0.9);
  const interceptPoint = quadraticPoint(PENALTY_SPOT, { x: controlX, y: controlY }, { x: targetX, y: targetY }, interceptT);
  const reboundDistance = randomBetween(136, 232);
  const reboundAngle =
    zone.side === "left" ? randomBetween(-0.58, -0.18) : zone.side === "right" ? randomBetween(0.18, 0.58) : randomBetween(-0.22, 0.22);
  const reboundPoint = {
    x: clamp(interceptPoint.x + Math.sin(reboundAngle) * reboundDistance, GOAL_FRAME.x - 32, GOAL_FRAME.x + GOAL_FRAME.w + 32),
    y: clamp(interceptPoint.y + randomBetween(78, 170), GOAL_FRAME.y + GOAL_FRAME.h - 12, PENALTY_SPOT.y - 24),
  };

  return {
    shotNumber: state.attemptsTaken + 1,
    zoneId,
    start: { ...PENALTY_SPOT },
    target: { x: targetX, y: targetY },
    control: { x: controlX, y: controlY },
    elapsedMs: 0,
    durationMs,
    totalMs: durationMs + (isSave ? 330 : 260),
    interceptT,
    interceptPoint,
    reboundPoint,
    shotPower,
    ball: {
      x: PENALTY_SPOT.x,
      y: PENALTY_SPOT.y,
      rotation: 0,
      trail: [],
    },
    keeper: {
      x: GOAL_CENTER_X,
      y: KEEPER_BASE_Y,
      predictedZoneId: prediction.predictedZoneId,
      tendencyZone: prediction.tendencyZone,
      confidence: prediction.confidence,
      adaptation: prediction.adaptation,
      learningIndex: prediction.learningIndex,
      reactionMs: prediction.reactionMs,
      diveDurationMs: prediction.diveDurationMs,
      reachPx: prediction.reachPx,
      targetX: keeperDiveX(prediction.predictedZoneId),
      stretch: 1,
      lift: 0,
    },
    outcome: {
      isSave,
      saveProbability,
      settled: false,
    },
    impactTriggered: false,
  };
}

function baseTelemetry() {
  return {
    adaptation: 0.18,
    confidence: 0.18,
    learningIndex: 0.14,
    tendencyZone: null,
    predictedZoneId: null,
    saveProbability: 0,
  };
}

function createInitialState(locale) {
  return {
    locale,
    phase: "menu",
    attemptsTaken: 0,
    goals: 0,
    saves: 0,
    history: [],
    activeShot: null,
    intermissionMs: 0,
    message: "",
    aiTelemetry: baseTelemetry(),
    netRippleMs: 0,
    cameraShakeMs: 0,
    crowdPulseMs: 0,
  };
}

function beginShootout(state) {
  const next = createInitialState(state.locale);
  const read = resolveKeeperPrediction([], 0, false);
  next.phase = "ready";
  next.aiTelemetry = {
    adaptation: read.adaptation,
    confidence: read.confidence,
    learningIndex: read.learningIndex,
    tendencyZone: read.tendencyZone,
    predictedZoneId: read.predictedZoneId,
    saveProbability: 0,
  };
  return next;
}

function settleShot(state) {
  if (!state.activeShot || state.activeShot.outcome.settled) {
    return state;
  }
  const shot = state.activeShot;
  const isSave = shot.outcome.isSave;
  const attemptsTaken = state.attemptsTaken + 1;
  const historyEntry = {
    attempt: shot.shotNumber,
    zoneId: shot.zoneId,
    keeperZoneId: shot.keeper.predictedZoneId,
    result: isSave ? "save" : "goal",
    saveProbability: shot.outcome.saveProbability,
    confidence: shot.keeper.confidence,
    adaptation: shot.keeper.adaptation,
  };
  const nextHistory = [...state.history, historyEntry];
  const completed = attemptsTaken >= TOTAL_PENALTIES;

  return {
    ...state,
    phase: completed ? "finished" : "intermission",
    attemptsTaken,
    goals: state.goals + (isSave ? 0 : 1),
    saves: state.saves + (isSave ? 1 : 0),
    history: nextHistory,
    intermissionMs: completed ? 0 : 880,
    activeShot: null,
    aiTelemetry: {
      adaptation: shot.keeper.adaptation,
      confidence: shot.keeper.confidence,
      learningIndex: shot.keeper.learningIndex,
      tendencyZone: shot.keeper.tendencyZone,
      predictedZoneId: shot.keeper.predictedZoneId,
      saveProbability: shot.outcome.saveProbability,
    },
    crowdPulseMs: isSave ? 300 : 420,
    cameraShakeMs: isSave ? 200 : 160,
    netRippleMs: isSave ? state.netRippleMs : 520,
  };
}

function launchShot(state, zoneId) {
  if (state.phase !== "ready") {
    return state;
  }
  const shot = createShot(state, zoneId);
  if (!shot) {
    return state;
  }

  return {
    ...state,
    phase: "shot",
    activeShot: shot,
    aiTelemetry: {
      adaptation: shot.keeper.adaptation,
      confidence: shot.keeper.confidence,
      learningIndex: shot.keeper.learningIndex,
      tendencyZone: shot.keeper.tendencyZone,
      predictedZoneId: shot.keeper.predictedZoneId,
      saveProbability: shot.outcome.saveProbability,
    },
  };
}

function updateActiveShot(shot, deltaMs) {
  const elapsedMs = Math.min(shot.totalMs, shot.elapsedMs + deltaMs);
  const flightRaw = clamp(elapsedMs / shot.durationMs, 0, 1);
  const flightT = easeOutCubic(flightRaw);
  let ballX;
  let ballY;

  if (shot.outcome.isSave && flightRaw >= shot.interceptT) {
    const localT = clamp((flightRaw - shot.interceptT) / (1 - shot.interceptT), 0, 1);
    ballX = lerp(shot.interceptPoint.x, shot.reboundPoint.x, easeOutCubic(localT));
    ballY = lerp(shot.interceptPoint.y, shot.reboundPoint.y, easeInOutSine(localT));
  } else {
    const point = quadraticPoint(shot.start, shot.control, shot.target, flightT);
    ballX = point.x;
    ballY = point.y;
  }

  const keeperElapsed = Math.max(0, elapsedMs - shot.keeper.reactionMs);
  const keeperT = clamp(keeperElapsed / shot.keeper.diveDurationMs, 0, 1);
  const keeperEase = easeOutCubic(keeperT);
  const keeperX = lerp(GOAL_CENTER_X, shot.keeper.targetX, keeperEase);
  const liftFactor = Math.sin(Math.PI * keeperT);
  const keeperLift = liftFactor * (shot.keeper.predictedZoneId === "center" ? 16 : 24);
  const keeperStretch = 1 + keeperEase * 0.46 + shot.keeper.learningIndex * 0.12;
  const rotationStep = (0.045 + shot.shotPower * 0.07) * (deltaMs / 16.67);
  const fadedTrail = shot.ball.trail.map((entry) => ({
    ...entry,
    alpha: Math.max(0, entry.alpha - deltaMs / 290),
  }));
  const compactTrail = [...fadedTrail, { x: ballX, y: ballY, alpha: 1 }].slice(-20);

  return {
    ...shot,
    elapsedMs,
    ball: {
      x: ballX,
      y: ballY,
      rotation: shot.ball.rotation + rotationStep,
      trail: compactTrail,
    },
    keeper: {
      ...shot.keeper,
      x: keeperX,
      y: KEEPER_BASE_Y,
      lift: keeperLift,
      stretch: keeperStretch,
    },
  };
}

function tickGame(state, deltaMs) {
  const safeDeltaMs = clamp(deltaMs, 0, MAX_DELTA_MS);
  if (safeDeltaMs <= 0) {
    return state;
  }

  let next = state;
  let changed = false;

  if (next.netRippleMs > 0) {
    next = { ...next, netRippleMs: Math.max(0, next.netRippleMs - safeDeltaMs * 1.25) };
    changed = true;
  }
  if (next.cameraShakeMs > 0) {
    next = { ...next, cameraShakeMs: Math.max(0, next.cameraShakeMs - safeDeltaMs) };
    changed = true;
  }
  if (next.crowdPulseMs > 0) {
    next = { ...next, crowdPulseMs: Math.max(0, next.crowdPulseMs - safeDeltaMs) };
    changed = true;
  }

  if (next.phase === "shot" && next.activeShot) {
    const updatedShot = updateActiveShot(next.activeShot, safeDeltaMs);
    next = {
      ...next,
      activeShot: updatedShot,
    };
    changed = true;

    const triggerPoint = updatedShot.outcome.isSave ? updatedShot.durationMs * updatedShot.interceptT : updatedShot.durationMs * 0.95;
    if (!updatedShot.impactTriggered && updatedShot.elapsedMs >= triggerPoint) {
      next = {
        ...next,
        activeShot: { ...updatedShot, impactTriggered: true },
        cameraShakeMs: updatedShot.outcome.isSave ? 220 : Math.max(next.cameraShakeMs, 160),
        netRippleMs: updatedShot.outcome.isSave ? next.netRippleMs : 540,
        crowdPulseMs: updatedShot.outcome.isSave ? 340 : 460,
      };
    }

    if (updatedShot.elapsedMs >= updatedShot.totalMs) {
      next = settleShot(next);
    }
  } else if (next.phase === "intermission") {
    const remainingMs = next.intermissionMs - safeDeltaMs;
    if (remainingMs > 0) {
      next = {
        ...next,
        intermissionMs: remainingMs,
      };
      changed = true;
    } else {
      const read = resolveKeeperPrediction(next.history, next.attemptsTaken, false);
      next = {
        ...next,
        phase: "ready",
        intermissionMs: 0,
        aiTelemetry: {
          adaptation: read.adaptation,
          confidence: read.confidence,
          learningIndex: read.learningIndex,
          tendencyZone: read.tendencyZone,
          predictedZoneId: read.predictedZoneId,
          saveProbability: next.aiTelemetry.saveProbability,
        },
      };
      changed = true;
    }
  }

  return changed ? next : state;
}

function runTime(state, milliseconds) {
  let next = state;
  let remaining = Math.max(0, Number(milliseconds) || 0);
  while (remaining > 0) {
    const step = Math.min(FIXED_STEP_MS, remaining);
    next = tickGame(next, step);
    remaining -= step;
  }
  return next;
}

function drawPitch(ctx) {
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, "#0b2232");
  gradient.addColorStop(0.2, "#122d42");
  gradient.addColorStop(1, "#06131f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = "#15374d";
  ctx.fillRect(0, 64, CANVAS_WIDTH, 84);

  const fieldGradient = ctx.createLinearGradient(0, 140, 0, CANVAS_HEIGHT);
  fieldGradient.addColorStop(0, "#2e9f47");
  fieldGradient.addColorStop(1, "#1b6f34");
  ctx.fillStyle = fieldGradient;
  ctx.fillRect(0, 140, CANVAS_WIDTH, CANVAS_HEIGHT - 140);

  const stripeHeight = (CANVAS_HEIGHT - 140) / 12;
  for (let index = 0; index < 12; index += 1) {
    ctx.fillStyle = index % 2 === 0 ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.06)";
    ctx.fillRect(0, 140 + index * stripeHeight, CANVAS_WIDTH, stripeHeight);
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 5;
  ctx.strokeRect(124, 212, CANVAS_WIDTH - 248, CANVAS_HEIGHT - 248);
  ctx.strokeRect(250, 160, CANVAS_WIDTH - 500, 206);
  ctx.beginPath();
  ctx.arc(PENALTY_SPOT.x, PENALTY_SPOT.y, 11, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(PENALTY_SPOT.x, PENALTY_SPOT.y - 78, 85, Math.PI * 0.17, Math.PI * 0.83);
  ctx.stroke();
}

function drawGoal(ctx, game) {
  const rippleStrength = clamp(game.netRippleMs / 540, 0, 1);
  const rippleWave = Math.sin((performance.now() / 1000) * 8) * rippleStrength * 6;
  const frameShadow = ctx.createLinearGradient(0, GOAL_FRAME.y, 0, GOAL_FRAME.y + GOAL_FRAME.h + 30);
  frameShadow.addColorStop(0, "rgba(0, 0, 0, 0.34)");
  frameShadow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = frameShadow;
  ctx.fillRect(GOAL_FRAME.x - 24, GOAL_FRAME.y - 4, GOAL_FRAME.w + 48, GOAL_FRAME.h + 56);

  ctx.fillStyle = "#f6f7fb";
  ctx.fillRect(GOAL_FRAME.x - 8, GOAL_FRAME.y - 12, GOAL_FRAME.w + 16, 12);
  ctx.fillRect(GOAL_FRAME.x - 8, GOAL_FRAME.y - 12, 10, GOAL_FRAME.h + 20);
  ctx.fillRect(GOAL_FRAME.x + GOAL_FRAME.w - 2, GOAL_FRAME.y - 12, 10, GOAL_FRAME.h + 20);

  ctx.save();
  ctx.beginPath();
  ctx.rect(GOAL_FRAME.x + 4, GOAL_FRAME.y + 4, GOAL_FRAME.w - 8, GOAL_FRAME.h - 8);
  ctx.clip();

  ctx.fillStyle = "#e8eef7";
  ctx.fillRect(GOAL_FRAME.x + 4, GOAL_FRAME.y + 4, GOAL_FRAME.w - 8, GOAL_FRAME.h - 8);

  ctx.strokeStyle = "rgba(63, 85, 116, 0.45)";
  ctx.lineWidth = 1.6;
  for (let x = GOAL_FRAME.x + 10; x <= GOAL_FRAME.x + GOAL_FRAME.w - 10; x += 28) {
    const offset = rippleWave * Math.sin((x - GOAL_FRAME.x) / 46);
    ctx.beginPath();
    ctx.moveTo(x + offset, GOAL_FRAME.y + 4);
    ctx.lineTo(x - offset, GOAL_FRAME.y + GOAL_FRAME.h - 4);
    ctx.stroke();
  }
  for (let y = GOAL_FRAME.y + 10; y <= GOAL_FRAME.y + GOAL_FRAME.h - 10; y += 18) {
    const offset = rippleWave * Math.cos((y - GOAL_FRAME.y) / 38);
    ctx.beginPath();
    ctx.moveTo(GOAL_FRAME.x + 4, y + offset);
    ctx.lineTo(GOAL_FRAME.x + GOAL_FRAME.w - 4, y - offset);
    ctx.stroke();
  }
  ctx.restore();
}

function drawKeeper(ctx, keeper) {
  const torsoWidth = 70 * keeper.stretch;
  const torsoHeight = 88;
  const diveTilt = (keeper.x - GOAL_CENTER_X) / 310;

  ctx.save();
  ctx.translate(keeper.x, keeper.y - keeper.lift);
  ctx.rotate(diveTilt * 0.33);

  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 28, 66, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  const jersey = ctx.createLinearGradient(-torsoWidth * 0.4, -84, torsoWidth * 0.4, 0);
  jersey.addColorStop(0, "#f97316");
  jersey.addColorStop(1, "#dc2626");
  ctx.fillStyle = jersey;
  ctx.fillRect(-torsoWidth * 0.42, -84, torsoWidth * 0.84, torsoHeight);

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(-torsoWidth * 0.5, -8, torsoWidth, 28);

  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  const armReach = 64 + keeper.stretch * 26;
  ctx.beginPath();
  ctx.moveTo(-torsoWidth * 0.34, -58);
  ctx.lineTo(-armReach, -32);
  ctx.moveTo(torsoWidth * 0.34, -58);
  ctx.lineTo(armReach, -32);
  ctx.stroke();

  ctx.fillStyle = "#f6d6b6";
  ctx.beginPath();
  ctx.arc(0, -106, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#111827";
  ctx.fillRect(-18, -128, 36, 8);
  ctx.restore();
}

function drawBall(ctx, ball) {
  for (const trailNode of ball.trail) {
    if (trailNode.alpha <= 0) continue;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.35 * trailNode.alpha})`;
    ctx.beginPath();
    ctx.arc(trailNode.x, trailNode.y, 5.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.rotate(ball.rotation);
  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-9, -4);
  ctx.lineTo(-2, -10);
  ctx.lineTo(6, -8);
  ctx.lineTo(9, 0);
  ctx.lineTo(2, 8);
  ctx.lineTo(-6, 8);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0.35, 2.5);
  ctx.stroke();
  ctx.restore();
}

function drawZoneHints(ctx, locale) {
  ctx.save();
  ctx.font = "600 17px 'Trebuchet MS', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let index = 0; index < SHOT_ZONES.length; index += 1) {
    const zone = SHOT_ZONES[index];
    const pulse = 1 + Math.sin((performance.now() / 1000) * 4 + index) * 0.05;
    ctx.fillStyle = "rgba(56, 189, 248, 0.27)";
    ctx.beginPath();
    ctx.arc(zone.target.x, zone.target.y, 22 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(224, 242, 254, 0.7)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#f8fafc";
    ctx.fillText(String(index + 1), zone.target.x, zone.target.y);
    ctx.fillStyle = "rgba(226, 232, 240, 0.8)";
    ctx.font = "500 11px 'Trebuchet MS', sans-serif";
    ctx.fillText(shortZone(zone.id, locale), zone.target.x, zone.target.y + 20);
    ctx.font = "600 17px 'Trebuchet MS', sans-serif";
  }
  ctx.restore();
}

function drawCanvasScene(canvas, game, locale) {
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawPitch(ctx);

  ctx.save();
  if (game.cameraShakeMs > 0) {
    const amplitude = 4.2 * clamp(game.cameraShakeMs / 220, 0, 1);
    ctx.translate(randomBetween(-amplitude, amplitude), randomBetween(-amplitude, amplitude));
  }
  drawGoal(ctx, game);

  const keeper = game.activeShot?.keeper ?? {
    x: GOAL_CENTER_X,
    y: KEEPER_BASE_Y,
    stretch: 1,
    lift: 0,
  };
  drawKeeper(ctx, keeper);

  const ball = game.activeShot?.ball ?? {
    x: PENALTY_SPOT.x,
    y: PENALTY_SPOT.y,
    rotation: 0,
    trail: [],
  };
  drawBall(ctx, ball);
  ctx.restore();

  if (game.phase === "menu" || game.phase === "ready") {
    drawZoneHints(ctx, locale);
  }
}

function buildTextPayload(state) {
  const preview = resolveKeeperPrediction(state.history, state.attemptsTaken, false);
  const liveShot = state.activeShot;
  const predictedZone = liveShot?.keeper.predictedZoneId ?? preview.predictedZoneId;
  return {
    mode: "arcade-penalty-neural-keeper",
    phase: state.phase,
    coordinates: COORDINATE_SYSTEM,
    penalties: {
      taken: state.attemptsTaken,
      remaining: TOTAL_PENALTIES - state.attemptsTaken,
      total: TOTAL_PENALTIES,
    },
    score: {
      goals: state.goals,
      saves: state.saves,
    },
    ai: {
      adaptation: Number((liveShot?.keeper.adaptation ?? preview.adaptation).toFixed(3)),
      confidence: Number((liveShot?.keeper.confidence ?? preview.confidence).toFixed(3)),
      learningIndex: Number((liveShot?.keeper.learningIndex ?? preview.learningIndex).toFixed(3)),
      tendencyZone: liveShot?.keeper.tendencyZone ?? preview.tendencyZone,
      predictedZone,
      saveProbability: Number((state.aiTelemetry.saveProbability ?? 0).toFixed(3)),
    },
    activeShot: liveShot
      ? {
          shotNumber: liveShot.shotNumber,
          selectedZone: liveShot.zoneId,
          keeperZone: liveShot.keeper.predictedZoneId,
          progress: Number(clamp(liveShot.elapsedMs / liveShot.durationMs, 0, 1).toFixed(3)),
          ball: {
            x: Number(liveShot.ball.x.toFixed(2)),
            y: Number(liveShot.ball.y.toFixed(2)),
          },
          keeper: {
            x: Number(liveShot.keeper.x.toFixed(2)),
            y: Number((liveShot.keeper.y - liveShot.keeper.lift).toFixed(2)),
          },
          isSaveForecast: liveShot.outcome.isSave,
        }
      : null,
    recentShots: state.history.slice(-6).map((entry) => ({
      attempt: entry.attempt,
      zone: entry.zoneId,
      keeperZone: entry.keeperZoneId,
      result: entry.result,
      saveProbability: Number(entry.saveProbability.toFixed(3)),
    })),
    selectableZones: ZONE_IDS,
    message: state.message,
  };
}

function PenaltyNeuralKeeperGame() {
  const locale = useMemo(() => (resolveBrowserLanguage() === "es" ? "es" : "en"), []);
  const ui = useMemo(() => UI_COPY[locale] ?? UI_COPY.en, [locale]);
  const canvasRef = useRef(null);
  const shellRef = useRef(null);
  const [game, setGame] = useState(() => createInitialState(locale));

  useEffect(() => {
    drawCanvasScene(canvasRef.current, game, locale);
  }, [game, locale]);

  useEffect(() => {
    let frameId = 0;
    let previousTimestamp = performance.now();

    const animate = (timestamp) => {
      const deltaMs = Math.min(MAX_DELTA_MS, timestamp - previousTimestamp);
      previousTimestamp = timestamp;
      setGame((previous) => tickGame(previous, deltaMs));
      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const startShootout = useCallback(() => {
    setGame((previous) => beginShootout(previous));
  }, []);

  const restartShootout = useCallback(() => {
    setGame((previous) => beginShootout(previous));
  }, []);

  const launchShotForZone = useCallback((zoneId) => {
    setGame((previous) => launchShot(previous, zoneId));
  }, []);

  const requestFullscreen = useCallback(async () => {
    const shell = shellRef.current;
    if (!shell) {
      return;
    }
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      } else if (shell.requestFullscreen) {
        await shell.requestFullscreen();
      } else if (shell.webkitRequestFullscreen) {
        shell.webkitRequestFullscreen();
      }
    } catch {
      // Ignore fullscreen errors from browser restrictions.
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const keyMap = {
        "1": "down-left",
        "2": "down-right",
        "3": "top-left",
        "4": "top-right",
        "5": "center",
      };

      if (keyMap[key]) {
        event.preventDefault();
        launchShotForZone(keyMap[key]);
        return;
      }
      if (key === "r") {
        event.preventDefault();
        restartShootout();
        return;
      }
      if (key === "f") {
        event.preventDefault();
        requestFullscreen();
        return;
      }
      if ((event.key === "Enter" || event.key === " ") && (game.phase === "menu" || game.phase === "finished")) {
        event.preventDefault();
        startShootout();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [game.phase, launchShotForZone, requestFullscreen, restartShootout, startShootout]);

  const advanceTime = useCallback((milliseconds) => {
    setGame((previous) => runTime(previous, milliseconds));
  }, []);

  useGameRuntimeBridge(game, buildTextPayload, advanceTime);

  const previewRead = useMemo(
    () => resolveKeeperPrediction(game.history, game.attemptsTaken, false),
    [game.history, game.attemptsTaken]
  );
  const attemptDisplay = game.phase === "menu" ? 0 : game.phase === "finished" ? TOTAL_PENALTIES : Math.min(TOTAL_PENALTIES, game.attemptsTaken + 1);
  const readZoneId = game.activeShot?.keeper.predictedZoneId ?? previewRead.predictedZoneId;
  const tendencyZoneId = game.activeShot?.keeper.tendencyZone ?? previewRead.tendencyZone;
  const adaptation = game.activeShot?.keeper.adaptation ?? previewRead.adaptation;
  const confidence = game.activeShot?.keeper.confidence ?? previewRead.confidence;
  const learningIndex = game.activeShot?.keeper.learningIndex ?? previewRead.learningIndex;
  const saveProbability = game.activeShot?.outcome.saveProbability ?? game.aiTelemetry.saveProbability ?? 0;
  const actionDisabled = game.phase !== "ready";
  const trendLabel = tendencyZoneId ? localizeZone(tendencyZoneId, locale) : ui.tendencyUnknown;
  const readLabel = readZoneId ? localizeZone(readZoneId, locale) : ui.tendencyUnknown;
  const historyRows = game.history.slice(-6).reverse();
  const finalSummary =
    game.phase === "finished"
      ? `${ui.finalMessage}: ${game.goals} ${ui.goals.toLowerCase()} / ${game.saves} ${ui.saves.toLowerCase()}`
      : null;

  let statusMessage = game.message;
  if (!statusMessage) {
    if (game.phase === "ready") statusMessage = ui.chooseZone;
    if (game.phase === "shot") statusMessage = ui.preparing;
    if (game.phase === "intermission") statusMessage = ui.nextPenalty;
    if (game.phase === "finished") statusMessage = finalSummary;
  }
  if (game.phase === "shot" && game.activeShot?.outcome.isSave) {
    statusMessage = ui.shotSave;
  } else if (game.phase === "shot" && game.activeShot) {
    statusMessage = ui.shotGoal;
  }

  return (
    <div className="mini-game penalty-shootout-game">
      <div className="mini-head">
        <div>
          <h4>{ui.title}</h4>
          <p>{ui.subtitle}</p>
        </div>
        <div className="penalty-head-actions">
          {(game.phase === "menu" || game.phase === "finished") ? (
            <button id="penalty-start-btn" type="button" onClick={startShootout}>
              {game.phase === "finished" ? ui.continue : ui.start}
            </button>
          ) : null}
          <button id="penalty-restart-btn" type="button" onClick={restartShootout}>
            {ui.restart}
          </button>
          <button id="penalty-fullscreen-btn" type="button" onClick={requestFullscreen}>
            {ui.fullscreen}
          </button>
        </div>
      </div>

      <div className="penalty-shootout-shell">
        <section className="mini-stage penalty-stage phaser-canvas-shell" ref={shellRef}>
          <div className="phaser-canvas-host penalty-canvas-host">
            <canvas
              ref={canvasRef}
              className="penalty-canvas"
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              aria-label="Penalty shootout canvas"
            />
          </div>

          {(game.phase === "menu" || game.phase === "finished") ? (
            <div className="penalty-overlay">
              <h5>{game.phase === "menu" ? ui.menuTitle : ui.finishedTitle}</h5>
              <p>{game.phase === "menu" ? ui.menuBody : ui.finishedBody}</p>
              <p>{game.phase === "menu" ? ui.menuHint : finalSummary}</p>
              <button type="button" onClick={startShootout}>
                {game.phase === "menu" ? ui.start : ui.continue}
              </button>
            </div>
          ) : null}
        </section>

        <aside className="penalty-sidepanel">
          <section className="penalty-panel">
            <header>
              <span>{ui.score}</span>
              <strong>
                {ui.attempt} {attemptDisplay}/{TOTAL_PENALTIES}
              </strong>
            </header>
            <div className="penalty-score-grid">
              <article>
                <h6>{ui.goals}</h6>
                <p>{game.goals}</p>
              </article>
              <article>
                <h6>{ui.saves}</h6>
                <p>{game.saves}</p>
              </article>
            </div>
          </section>

          <section className="penalty-panel">
            <header>
              <span>{ui.aiTitle}</span>
              <strong>{readLabel}</strong>
            </header>
            <div className="penalty-ai-metric">
              <span>{ui.adaptation}</span>
              <div className="penalty-meter">
                <div className="penalty-meter-fill" style={{ width: `${Math.round(adaptation * 100)}%` }} />
              </div>
              <strong>{Math.round(adaptation * 100)}%</strong>
            </div>
            <div className="penalty-ai-metric">
              <span>{ui.confidence}</span>
              <div className="penalty-meter">
                <div className="penalty-meter-fill confidence" style={{ width: `${Math.round(confidence * 100)}%` }} />
              </div>
              <strong>{Math.round(confidence * 100)}%</strong>
            </div>
            <div className="penalty-ai-metric">
              <span>{ui.learningIndex}</span>
              <div className="penalty-meter">
                <div className="penalty-meter-fill learning" style={{ width: `${Math.round(learningIndex * 100)}%` }} />
              </div>
              <strong>{Math.round(learningIndex * 100)}%</strong>
            </div>
            <p>{ui.tendency}: <strong>{trendLabel}</strong></p>
            <p>{ui.diveRead}: <strong>{readLabel}</strong></p>
            <p>{ui.saveChance}: <strong>{Math.round(saveProbability * 100)}%</strong></p>
          </section>

          <section className="penalty-panel">
            <header>
              <span>{ui.controlsTitle}</span>
              <strong>{ui.attempt} {attemptDisplay}</strong>
            </header>
            <div className="penalty-zone-grid" role="group" aria-label={ui.controlsAria}>
              {SHOT_ZONES.map((zone, index) => (
                <button
                  id={`penalty-zone-${zone.id}`}
                  key={zone.id}
                  type="button"
                  disabled={actionDisabled}
                  onClick={() => launchShotForZone(zone.id)}
                  className={zone.id === "center" ? "center-zone" : ""}
                >
                  <span>{index + 1}</span>
                  {localizeZone(zone.id, locale)}
                </button>
              ))}
            </div>
            <p className="penalty-controls-hint">{ui.controlsHint}</p>
          </section>

          <section className="penalty-panel">
            <header>
              <span>{ui.timelineTitle}</span>
              <strong>{historyRows.length}</strong>
            </header>
            {historyRows.length ? (
              <ul className="penalty-history-list">
                {historyRows.map((entry) => (
                  <li key={`shot-${entry.attempt}`}>
                    <span>#{entry.attempt}</span>
                    <span>{shortZone(entry.zoneId, locale)}</span>
                    <span>{entry.result === "save" ? ui.saves : ui.goals}</span>
                    <span>{Math.round(entry.saveProbability * 100)}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="penalty-history-empty">{ui.timelineEmpty}</p>
            )}
          </section>
        </aside>
      </div>

      <p className="game-message">{statusMessage}</p>
    </div>
  );
}

export default PenaltyNeuralKeeperGame;
