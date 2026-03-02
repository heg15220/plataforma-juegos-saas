import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useGameRuntimeBridge from "../utils/useGameRuntimeBridge";
import LudoBoard from "./parchis/LudoBoard";
import { PARCHIS_BOARD_MODEL, getOwnerColor } from "./parchis/boardModel";

const TRACK_LENGTH = 68;
const FINAL_LANE_STEPS = 8;
const GOAL_PROGRESS = TRACK_LENGTH + FINAL_LANE_STEPS;
const PIECES_PER_PLAYER = 4;
const INITIAL_TRACK_PIECES = 0;
const MAX_LOG_LINES = 14;
const HUMAN_PLAYER_ID = "human";

const SAFE_TRACK_INDEXES = new Set([0, 5, 12, 17, 22, 29, 34, 39, 46, 51, 56, 63]);

const PLAYERS = [
  { id: HUMAN_PLAYER_ID, label: "Tu (Rojo)", short: "R", color: "red", startIndex: 0 },
  { id: "ai-blue", label: "IA Azul", short: "B", color: "blue", startIndex: 17 },
  { id: "ai-yellow", label: "IA Amarilla", short: "Y", color: "yellow", startIndex: 34 },
  { id: "ai-green", label: "IA Verde", short: "G", color: "green", startIndex: 51 }
];

const TURN_ORDER = PLAYERS.map((player) => player.id);
const PLAYER_BY_ID = Object.fromEntries(PLAYERS.map((player) => [player.id, player]));
const NEXT_PLAYER_BY_ID = Object.fromEntries(
  TURN_ORDER.map((playerId, index) => [playerId, TURN_ORDER[(index + 1) % TURN_ORDER.length]])
);
const AI_PLAYER_IDS = TURN_ORDER.filter((playerId) => playerId !== HUMAN_PLAYER_ID);
const isAiPlayer = (playerId) => AI_PLAYER_IDS.includes(playerId);
const getOpponentIds = (ownerId) => TURN_ORDER.filter((playerId) => playerId !== ownerId);
const getNextTurnId = (ownerId) => NEXT_PLAYER_BY_ID[ownerId] || TURN_ORDER[0];
const createLastRollByOwner = () => Object.fromEntries(TURN_ORDER.map((playerId) => [playerId, [null, null]]));

const AI_LEVELS = {
  easy: {
    id: "easy",
    label: "Facil",
    thinkMs: 520,
    captureWeight: 65,
    goalWeight: 85,
    enterWeight: 26,
    safeWeight: 10,
    barrierWeight: 12,
    positionWeight: 0.18,
    threatWeight: 3,
    exposureWeight: 0.2
  },
  medium: {
    id: "medium",
    label: "Media",
    thinkMs: 860,
    captureWeight: 145,
    goalWeight: 165,
    enterWeight: 58,
    safeWeight: 22,
    barrierWeight: 36,
    positionWeight: 0.36,
    threatWeight: 8,
    exposureWeight: 0.42
  },
  hard: {
    id: "hard",
    label: "Dificil",
    thinkMs: 1220,
    captureWeight: 210,
    goalWeight: 240,
    enterWeight: 64,
    safeWeight: 32,
    barrierWeight: 54,
    positionWeight: 0.62,
    threatWeight: 14,
    exposureWeight: 0.7
  }
};

const RULES_PROMPT = `PARCHIS LUDOTEKA (ADAPTACION EN ESTA IMPLEMENTACION)
- Modalidad activa: Individual a 4 (tu color rojo contra 3 IAs: azul, amarilla y verde).
- Salida inicial: las 4 fichas comienzan en casa (circulos de color).
- Objetivo: completar el recorrido con las 4 fichas antes que cualquier rival.

REGLAS IMPLEMENTADAS
- Si sale 5 en cualquiera de los dos dados mostrados y tienes fichas en casa, debes sacar una obligatoriamente.
- Si sale 5 y otro valor (ej. 5 y 3), primero sale ficha obligatoria y luego se aplica el otro dado.
- Las fichas avanzan por recorrido comun y luego entran al pasillo final de su color.
- Si sale 6 y todas tus fichas estan fuera de casa, ese 6 avanza 7 casillas.
- Cualquier doble (mismo numero en ambos dados) concede turno extra.
- Maximo 2 fichas por casilla.
- No puedes atravesar barreras (2 fichas del mismo color en la misma casilla).
- Para llegar a meta necesitas numero exacto.
- Al coronar una ficha, obtienes bono de +10 con otra ficha.
- Al comer ficha rival, obtienes bono de +20 con otra ficha.
- Casillas seguras: no permiten captura normal.
- En casilla de salida, al sacar ficha puedes capturar rival aunque sea segura.
- Tres dobles 6 consecutivos: el tercer movimiento se cancela y la ficha movida con el segundo doble 6 vuelve a casa (salvo si ya estaba en pasillo final).
- Si no hay jugadas legales, no se mueve.

IA POR DIFICULTAD
- Facil: decisiones mas aleatorias y menos proteccion defensiva.
- Media: heuristica tactica (capturas, progreso, seguridad y barreras).
- Dificil: heuristica avanzada + estimacion de amenaza futura de todos los rivales.

FUERA DE ALCANCE EN ESTE COMPONENTE
- Modalidades por parejas, 1 contra 1 con dos colores, parchis de 6 fichas y tablero 3 contra 3 de 6 colores.
- Preferencia de color antes de entrar a partida, preseleccion de ficha antes del turno y vista previa del dado (opciones de lobby/UX externo).`;

const clampMs = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const randomInt = (maxExclusive) => (maxExclusive > 0 ? Math.floor(Math.random() * maxExclusive) : 0);
const rollDie = () => Math.floor(Math.random() * 6) + 1;

const appendLog = (logs, line) => [line, ...logs].slice(0, MAX_LOG_LINES);

const pieceCode = (piece) => `${PLAYER_BY_ID[piece.owner]?.short || "?"}${piece.slot}`;
const playerLabel = (playerId) => PLAYER_BY_ID[playerId]?.label || playerId;
const isSafeTrackIndex = (index) => SAFE_TRACK_INDEXES.has(index);

const progressToTrackIndex = (ownerId, progress) => {
  const player = PLAYER_BY_ID[ownerId];
  if (!player) return null;
  return ((player.startIndex + progress) % TRACK_LENGTH + TRACK_LENGTH) % TRACK_LENGTH;
};

const isPieceHome = (piece) => piece.progress == null && !piece.finished;
const isPieceInTrack = (piece) => piece.progress != null && !piece.finished && piece.progress < TRACK_LENGTH;
const isPieceInLane = (piece) =>
  piece.progress != null && !piece.finished && piece.progress >= TRACK_LENGTH && piece.progress < GOAL_PROGRESS;
const isPieceFinished = (piece) => Boolean(piece.finished);

const getLaneStep = (piece) => (isPieceInLane(piece) ? piece.progress - TRACK_LENGTH + 1 : null);

const getTrackOccupants = (state, trackIndex, excludePieceId = null) => {
  const occupants = [];
  for (const piece of state.pieces) {
    if (excludePieceId && piece.id === excludePieceId) continue;
    if (!isPieceInTrack(piece)) continue;
    const index = progressToTrackIndex(piece.owner, piece.progress);
    if (index === trackIndex) occupants.push(piece);
  }
  return occupants;
};

const getLaneOccupants = (state, ownerId, laneProgress, excludePieceId = null) => {
  const occupants = [];
  for (const piece of state.pieces) {
    if (excludePieceId && piece.id === excludePieceId) continue;
    if (piece.owner !== ownerId) continue;
    if (!isPieceInLane(piece)) continue;
    if (piece.progress === laneProgress) occupants.push(piece);
  }
  return occupants;
};

const isBarrier = (pieces) => pieces.length >= 2 && pieces.every((piece) => piece.owner === pieces[0].owner);
const isTrackBarrier = (state, trackIndex, excludePieceId = null) => isBarrier(getTrackOccupants(state, trackIndex, excludePieceId));
const isLaneBarrier = (state, ownerId, laneProgress, excludePieceId = null) =>
  isBarrier(getLaneOccupants(state, ownerId, laneProgress, excludePieceId));

const countPieces = (state, ownerId) => state.pieces.filter((piece) => piece.owner === ownerId);
const countHomePieces = (state, ownerId) => countPieces(state, ownerId).filter(isPieceHome).length;
const countFinishedPieces = (state, ownerId) => countPieces(state, ownerId).filter(isPieceFinished).length;
const allPiecesOutOfHome = (state, ownerId) => countHomePieces(state, ownerId) === 0;
const moveStepsFromDie = (state, ownerId, die) => (die === 6 && allPiecesOutOfHome(state, ownerId) ? 7 : die);

const clonePieces = (pieces) => pieces.map((piece) => ({ ...piece }));

const createInitialState = (difficultyId = "medium") => {
  const pieces = [];
  let stamp = 0;
  for (const player of PLAYERS) {
    for (let slot = 1; slot <= PIECES_PER_PLAYER; slot += 1) {
      const startsOnTrack = slot <= INITIAL_TRACK_PIECES;
      pieces.push({
        id: `${player.id}-${slot}`,
        owner: player.id,
        slot,
        progress: startsOnTrack ? 0 : null,
        finished: false,
        stamp: startsOnTrack ? (stamp += 1) : 0
      });
    }
  }

  return {
    phase: "await-start",
    turn: HUMAN_PLAYER_ID,
    turnCount: 1,
    pieces,
    moveCounter: stamp,
    difficultyId,
    dice: null,
    diceAux: null,
    steps: null,
    rollWasSix: false,
    sixStreak: 0,
    sixMovedPieceIds: [],
    queuedDiceValues: [],
    mandatoryEntry: false,
    pendingBonus: null,
    pendingBonusSource: null,
    winner: null,
    message: "Partida lista. Pulsa Iniciar partida.",
    logs: ["Partida lista. Pulsa Iniciar partida."]
  };
};

const pieceById = (state, pieceId) => state.pieces.find((piece) => piece.id === pieceId) || null;

const describeTarget = (action) => {
  if (action.destinationType === "goal") return "meta";
  if (action.destinationType === "lane") return `pasillo ${action.targetLaneStep}`;
  if (action.destinationType === "track") return `C${action.targetTrackIndex}`;
  return "destino";
};

const describeAction = (state, action) => {
  const piece = pieceById(state, action.pieceId);
  const ref = piece ? pieceCode(piece) : action.pieceId;
  if (action.type === "enter") {
    if (action.capturePieceId) {
      const captured = pieceById(state, action.capturePieceId);
      return `Sacar ${ref} a salida (${describeTarget(action)}) y comer ${captured ? pieceCode(captured) : "rival"}`;
    }
    return `Sacar ${ref} a salida (${describeTarget(action)})`;
  }
  const base = `Mover ${ref} +${action.steps} a ${describeTarget(action)}`;
  if (action.capturePieceId) {
    const captured = pieceById(state, action.capturePieceId);
    return `${base} y comer ${captured ? pieceCode(captured) : "rival"}`;
  }
  if (action.reachesGoal) return `${base} (corona)`;
  return base;
};

const evaluateEnterAction = (state, ownerId, piece) => {
  if (!piece || piece.owner !== ownerId || !isPieceHome(piece)) return null;
  const startIndex = PLAYER_BY_ID[ownerId].startIndex;
  const occupants = getTrackOccupants(state, startIndex, piece.id);

  if (occupants.length >= 2) {
    const enemies = occupants.filter((entry) => entry.owner !== ownerId);
    if (!enemies.length) return null;
    const captureTarget = enemies.reduce((latest, current) => (current.stamp > latest.stamp ? current : latest), enemies[0]);
    return {
      id: `enter-${piece.id}`,
      type: "enter",
      pieceId: piece.id,
      ownerId,
      steps: 5,
      destinationType: "track",
      targetProgress: 0,
      targetTrackIndex: startIndex,
      targetLaneStep: null,
      capturePieceId: captureTarget.id,
      reachesGoal: false,
      createsBarrier: occupants.some((entry) => entry.owner === ownerId),
      landingSafe: true
    };
  }

  const enemy = occupants.find((entry) => entry.owner !== ownerId);
  return {
    id: `enter-${piece.id}`,
    type: "enter",
    pieceId: piece.id,
    ownerId,
    steps: 5,
    destinationType: "track",
    targetProgress: 0,
    targetTrackIndex: startIndex,
    targetLaneStep: null,
    capturePieceId: enemy?.id || null,
    reachesGoal: false,
    createsBarrier: occupants.some((entry) => entry.owner === ownerId),
    landingSafe: true
  };
};

const evaluateMoveAction = (state, ownerId, piece, steps) => {
  if (!piece || piece.owner !== ownerId || isPieceHome(piece) || isPieceFinished(piece)) return null;
  const startProgress = piece.progress;
  const destination = startProgress + steps;
  if (destination > GOAL_PROGRESS) return null;

  for (let offset = 1; offset <= steps; offset += 1) {
    const progress = startProgress + offset;
    if (progress <= TRACK_LENGTH - 1) {
      const trackIndex = progressToTrackIndex(ownerId, progress);
      if (offset < steps && isTrackBarrier(state, trackIndex, piece.id)) return null;
    } else if (progress < GOAL_PROGRESS) {
      if (offset < steps && isLaneBarrier(state, ownerId, progress, piece.id)) return null;
    }
  }

  if (destination <= TRACK_LENGTH - 1) {
    const trackIndex = progressToTrackIndex(ownerId, destination);
    const occupants = getTrackOccupants(state, trackIndex, piece.id);
    if (occupants.length >= 2) return null;

    let capturePieceId = null;
    if (occupants.length === 1 && occupants[0].owner !== ownerId && !isSafeTrackIndex(trackIndex)) {
      capturePieceId = occupants[0].id;
    }

    return {
      id: `move-${piece.id}-${destination}`,
      type: "move",
      pieceId: piece.id,
      ownerId,
      steps,
      destinationType: "track",
      targetProgress: destination,
      targetTrackIndex: trackIndex,
      targetLaneStep: null,
      capturePieceId,
      reachesGoal: false,
      createsBarrier: occupants.length === 1 && occupants[0].owner === ownerId,
      landingSafe: isSafeTrackIndex(trackIndex)
    };
  }

  if (destination < GOAL_PROGRESS) {
    const occupants = getLaneOccupants(state, ownerId, destination, piece.id);
    if (occupants.length >= 2) return null;
    return {
      id: `move-${piece.id}-${destination}`,
      type: "move",
      pieceId: piece.id,
      ownerId,
      steps,
      destinationType: "lane",
      targetProgress: destination,
      targetTrackIndex: null,
      targetLaneStep: destination - TRACK_LENGTH + 1,
      capturePieceId: null,
      reachesGoal: false,
      createsBarrier: occupants.length === 1,
      landingSafe: true
    };
  }

  return {
    id: `move-${piece.id}-goal`,
    type: "move",
    pieceId: piece.id,
    ownerId,
    steps,
    destinationType: "goal",
    targetProgress: GOAL_PROGRESS,
    targetTrackIndex: null,
    targetLaneStep: null,
    capturePieceId: null,
    reachesGoal: true,
    createsBarrier: false,
    landingSafe: true
  };
};

const getActionSteps = (state) => state.pendingBonus ?? state.steps ?? 0;

const getLegalActions = (state, ownerId) => {
  if (state.phase !== "await-action" || state.turn !== ownerId) return [];
  const steps = getActionSteps(state);
  if (steps <= 0) return [];

  const ownerPieces = state.pieces.filter((piece) => piece.owner === ownerId);
  const homePieces = ownerPieces.filter(isPieceHome);
  const mandatoryEntry = state.pendingBonus == null && state.mandatoryEntry && homePieces.length > 0;
  const actions = [];

  if (mandatoryEntry) {
    for (const piece of homePieces) {
      const action = evaluateEnterAction(state, ownerId, piece);
      if (action) actions.push(action);
    }
    return actions;
  }

  for (const piece of ownerPieces) {
    if (isPieceHome(piece)) continue;
    if (isPieceFinished(piece)) continue;
    const action = evaluateMoveAction(state, ownerId, piece, steps);
    if (action) actions.push(action);
  }

  return actions;
};

const getTrackDistance = (fromIndex, toIndex) => ((toIndex - fromIndex + TRACK_LENGTH) % TRACK_LENGTH);

const countThreatenedTrackPieces = (state, ownerId) => {
  const opponents = state.pieces.filter((piece) => piece.owner !== ownerId && isPieceInTrack(piece));
  const ownTargets = state.pieces.filter(
    (piece) => piece.owner === ownerId && isPieceInTrack(piece) && !isSafeTrackIndex(progressToTrackIndex(piece.owner, piece.progress))
  );
  let threatened = 0;

  for (const target of ownTargets) {
    const targetIndex = progressToTrackIndex(target.owner, target.progress);
    const isThreatened = opponents.some((enemy) => {
      const enemyIndex = progressToTrackIndex(enemy.owner, enemy.progress);
      const distance = getTrackDistance(enemyIndex, targetIndex);
      return distance >= 1 && distance <= 7;
    });
    if (isThreatened) threatened += 1;
  }
  return threatened;
};

const estimatePieceExposure = (state, ownerId, pieceId) => {
  const piece = pieceById(state, pieceId);
  if (!piece || piece.owner !== ownerId || !isPieceInTrack(piece)) return 0;

  const targetIndex = progressToTrackIndex(ownerId, piece.progress);
  if (targetIndex == null || isSafeTrackIndex(targetIndex)) return 0;

  const opponents = state.pieces.filter((entry) => entry.owner !== ownerId && isPieceInTrack(entry));
  let risk = 0;

  for (const enemy of opponents) {
    const enemyIndex = progressToTrackIndex(enemy.owner, enemy.progress);
    const distance = getTrackDistance(enemyIndex, targetIndex);
    if (distance >= 1 && distance <= 6) {
      risk += (7 - distance) * 1.85;
    } else if (distance === 7) {
      risk += 0.5;
    }
  }

  for (const opponentId of getOpponentIds(ownerId)) {
    if (countHomePieces(state, opponentId) <= 0) continue;
    const enemyStartIndex = PLAYER_BY_ID[opponentId]?.startIndex;
    if (enemyStartIndex == null) continue;
    const entryDistance = getTrackDistance(enemyStartIndex, targetIndex);
    if (entryDistance === 5) risk += 5.5;
  }

  const alliedOnCell = getTrackOccupants(state, targetIndex, piece.id).some((entry) => entry.owner === ownerId);
  if (alliedOnCell) risk *= 0.55;

  return risk;
};

const evaluatePosition = (state, ownerId) => {
  const scoreFor = (playerId) => {
    let total = 0;
    for (const piece of state.pieces) {
      if (piece.owner !== playerId) continue;
      if (isPieceFinished(piece)) {
        total += 420;
      } else if (isPieceHome(piece)) {
        total -= 28;
      } else if (isPieceInLane(piece)) {
        total += 165 + (piece.progress - TRACK_LENGTH + 1) * 14;
      } else {
        total += piece.progress * 4.4;
        const trackIndex = progressToTrackIndex(piece.owner, piece.progress);
        if (isSafeTrackIndex(trackIndex)) total += 10;
      }
    }
    total -= countThreatenedTrackPieces(state, playerId) * 12;
    return total;
  };

  const ownerScore = scoreFor(ownerId);
  const opponentIds = getOpponentIds(ownerId);
  if (!opponentIds.length) return ownerScore;
  const averageOpponentScore = opponentIds.reduce((sum, opponentId) => sum + scoreFor(opponentId), 0) / opponentIds.length;
  return ownerScore - averageOpponentScore;
};

const makeHypotheticalRollState = (state, ownerId, die, auxDie) => {
  const isDouble = die === auxDie;
  const sixLike = isDouble && die === 6;
  const mandatoryEntry = (die === 5 || auxDie === 5) && countHomePieces(state, ownerId) > 0;
  let steps = moveStepsFromDie(state, ownerId, die);
  let queuedDiceValues = [];

  if (mandatoryEntry) {
    steps = 5;
    if (die === 5 && auxDie === 5) queuedDiceValues = [5];
    else if (die === 5) queuedDiceValues = [auxDie];
    else queuedDiceValues = [die];
  }

  return {
    ...state,
    turn: ownerId,
    phase: "await-action",
    dice: die,
    diceAux: auxDie,
    steps,
    rollWasSix: isDouble,
    sixStreak: sixLike ? state.sixStreak + 1 : 0,
    queuedDiceValues,
    mandatoryEntry,
    pendingBonus: null,
    pendingBonusSource: null
  };
};

const estimateOpponentRollPressure = (state, ownerId) => {
  let totalPressure = 0;
  for (let die = 1; die <= 6; die += 1) {
    for (let auxDie = 1; auxDie <= 6; auxDie += 1) {
      const hypothetical = makeHypotheticalRollState(state, ownerId, die, auxDie);
      const actions = getLegalActions(hypothetical, ownerId);
      if (!actions.length) continue;
      let best = -Infinity;
      for (const action of actions) {
        let score = 0;
        if (action.capturePieceId) score += 90;
        if (action.reachesGoal) score += 120;
        if (action.type === "enter") score += 32;
        if (action.createsBarrier) score += 20;
        best = Math.max(best, score);
      }
      totalPressure += best / 36;
    }
  }
  return totalPressure;
};

const estimateCombinedOpponentPressure = (state, ownerId) => {
  const opponentIds = getOpponentIds(ownerId);
  if (!opponentIds.length) return 0;
  const total = opponentIds.reduce((sum, opponentId) => sum + estimateOpponentRollPressure(state, opponentId), 0);
  return total / opponentIds.length;
};

const scoreAction = (state, action, ownerId, profile) => {
  let score = 0;
  if (action.capturePieceId) score += profile.captureWeight;
  if (action.reachesGoal) score += profile.goalWeight;
  if (action.type === "enter") score += profile.enterWeight;
  if (action.landingSafe) score += profile.safeWeight;
  if (action.createsBarrier) score += profile.barrierWeight;
  return score;
};

const passTurn = (state, reason) => ({
  ...state,
  turn: getNextTurnId(state.turn),
  turnCount: state.turnCount + 1,
  phase: "await-roll",
  dice: null,
  diceAux: null,
  steps: null,
  rollWasSix: false,
  sixStreak: 0,
  sixMovedPieceIds: [],
  queuedDiceValues: [],
  mandatoryEntry: false,
  pendingBonus: null,
  pendingBonusSource: null,
  message: reason
});

const continueExtraTurn = (state, reason) => ({
  ...state,
  phase: "await-roll",
  dice: null,
  diceAux: null,
  steps: null,
  rollWasSix: false,
  queuedDiceValues: [],
  mandatoryEntry: false,
  pendingBonus: null,
  pendingBonusSource: null,
  message: reason
});

const finishAfterResolvedMove = (state, actorId, reason) => {
  if (state.rollWasSix) {
    return continueExtraTurn(state, `${reason} Turno extra por dobles.`);
  }
  return passTurn(state, reason);
};

const resolveNoLegalActions = (state, actorId) => {
  if (state.phase !== "await-action" || state.turn !== actorId) return state;

  const reason = state.pendingBonus != null
    ? `No hay jugada legal para el bono de +${state.pendingBonus}.`
    : state.mandatoryEntry
      ? "No puedes sacar ficha con 5 porque la salida esta bloqueada."
      : `No hay movimiento legal con ${getActionSteps(state)}.`;

  const withLog = {
    ...state,
    mandatoryEntry: false,
    queuedDiceValues: [],
    pendingBonus: state.pendingBonus != null ? null : state.pendingBonus,
    pendingBonusSource: state.pendingBonus != null ? null : state.pendingBonusSource,
    logs: appendLog(state.logs, `${playerLabel(actorId)}: ${reason}`),
    message: reason
  };

  return finishAfterResolvedMove(withLog, actorId, reason);
};

const resolveTripleSixPenalty = (state, actorId) => {
  const pieces = clonePieces(state.pieces);
  const secondMovedPieceId = state.sixMovedPieceIds[1] || null;
  let movedBackText = "No hay ficha valida para penalizar.";

  if (secondMovedPieceId) {
    const piece = pieces.find((entry) => entry.id === secondMovedPieceId && entry.owner === actorId);
    if (piece && !piece.finished) {
      if (isPieceInTrack(piece)) {
        piece.progress = null;
        piece.finished = false;
        movedBackText = `${pieceCode(piece)} vuelve a casa por tercer 6 consecutivo.`;
      } else if (isPieceInLane(piece)) {
        movedBackText = `${pieceCode(piece)} se salva de la penalizacion por estar en pasillo final.`;
      }
    }
  }

  const summary = `Tercer doble 6 consecutivo: se cancela el movimiento. ${movedBackText}`;
  const nextState = {
    ...state,
    pieces,
    logs: appendLog(state.logs, `${playerLabel(actorId)}: ${summary}`),
    message: summary
  };
  return passTurn(nextState, summary);
};

const activateQueuedDieMove = (state, actorId, simulate = false) => {
  const queue = Array.isArray(state.queuedDiceValues) ? state.queuedDiceValues : [];
  if (!queue.length) return null;

  const [dieValue, ...rest] = queue;
  const steps = moveStepsFromDie(state, actorId, dieValue);
  const text = `Salida obligatoria completada. Se aplica el otro dado (${dieValue})${steps !== dieValue ? ` como ${steps}` : ""}.`;

  const nextState = {
    ...state,
    phase: "await-action",
    steps,
    mandatoryEntry: false,
    queuedDiceValues: rest,
    message: text,
    logs: simulate ? state.logs : appendLog(state.logs, `${playerLabel(actorId)}: ${text}`)
  };

  const actions = getLegalActions(nextState, actorId);
  if (!actions.length) {
    return resolveNoLegalActions(nextState, actorId);
  }

  return nextState;
};

const applyActionAndAdvance = (state, action, actorId, options = {}) => {
  const { simulate = false } = options;
  if (state.phase !== "await-action" || state.turn !== actorId) return state;
  if (!action || action.ownerId !== actorId) return state;

  const pieces = clonePieces(state.pieces);
  const mover = pieces.find((piece) => piece.id === action.pieceId && piece.owner === actorId);
  if (!mover) return state;

  const wasDiceMove = state.pendingBonus == null;
  let moveCounter = state.moveCounter;
  const bumpStamp = (piece) => {
    moveCounter += 1;
    piece.stamp = moveCounter;
  };

  if (action.type === "enter") {
    mover.progress = 0;
    mover.finished = false;
    bumpStamp(mover);
  } else if (action.type === "move") {
    mover.progress = action.targetProgress;
    mover.finished = action.reachesGoal;
    bumpStamp(mover);
  } else {
    return state;
  }

  if (action.capturePieceId) {
    const captured = pieces.find((piece) => piece.id === action.capturePieceId);
    if (captured) {
      captured.progress = null;
      captured.finished = false;
    }
  }

  let sixMovedPieceIds = [...state.sixMovedPieceIds];
  if (wasDiceMove && state.dice === 6 && state.rollWasSix) {
    sixMovedPieceIds = [...sixMovedPieceIds, mover.id].slice(-2);
  }

  let logs = state.logs;
  let message = state.message;

  if (!simulate) {
    const actionText = describeAction(state, action);
    const line = `${playerLabel(actorId)}: ${actionText}.`;
    logs = appendLog(state.logs, line);
    message = line;
  }

  const nextBase = {
    ...state,
    pieces,
    moveCounter,
    sixMovedPieceIds,
    logs,
    message
  };

  if (countFinishedPieces(nextBase, actorId) >= PIECES_PER_PLAYER) {
    const winnerText = `${playerLabel(actorId)} completa sus 4 fichas y gana la partida.`;
    return {
      ...nextBase,
      winner: actorId,
      phase: "game-over",
      dice: null,
      diceAux: null,
      steps: null,
      rollWasSix: false,
      pendingBonus: null,
      pendingBonusSource: null,
      queuedDiceValues: [],
      mandatoryEntry: false,
      message: winnerText,
      logs: simulate ? nextBase.logs : appendLog(nextBase.logs, winnerText)
    };
  }

  let producedBonus = null;
  let producedSource = null;
  if (action.capturePieceId) {
    producedBonus = 20;
    producedSource = "capture";
  } else if (action.reachesGoal) {
    producedBonus = 10;
    producedSource = "goal";
  }

  if (producedBonus != null) {
    const text = producedSource === "capture"
      ? `${playerLabel(actorId)} obtiene bono +20 por captura.`
      : `${playerLabel(actorId)} obtiene bono +10 por coronar.`;
    return {
      ...nextBase,
      phase: "await-action",
      pendingBonus: producedBonus,
      pendingBonusSource: producedSource,
      mandatoryEntry: false,
      message: text,
      logs: simulate ? nextBase.logs : appendLog(nextBase.logs, text)
    };
  }

  const afterBonusClear = {
    ...nextBase,
    pendingBonus: null,
    pendingBonusSource: null,
    mandatoryEntry: false
  };

  const queuedState = activateQueuedDieMove(afterBonusClear, actorId, simulate);
  if (queuedState) return queuedState;

  return finishAfterResolvedMove(afterBonusClear, actorId, message);
};

const rollForPlayer = (state, actorId, forcedRoll = null) => {
  if (state.phase !== "await-roll" || state.turn !== actorId || state.winner) return state;
  let die = null;
  let auxDie = null;

  if (forcedRoll && typeof forcedRoll === "object") {
    const main = Number.isInteger(forcedRoll.main) && forcedRoll.main >= 1 && forcedRoll.main <= 6 ? forcedRoll.main : null;
    const aux = Number.isInteger(forcedRoll.aux) && forcedRoll.aux >= 1 && forcedRoll.aux <= 6 ? forcedRoll.aux : null;
    die = main ?? rollDie();
    auxDie = aux ?? rollDie();
  } else {
    die = Number.isInteger(forcedRoll) && forcedRoll >= 1 && forcedRoll <= 6 ? forcedRoll : rollDie();
    auxDie = rollDie();
  }

  const isDouble = die === auxDie;
  const isDoubleSix = isDouble && die === 6;

  if (isDoubleSix && state.sixStreak >= 2) {
    return resolveTripleSixPenalty(state, actorId);
  }

  const mandatoryEntry = (die === 5 || auxDie === 5) && countHomePieces(state, actorId) > 0;
  let steps = moveStepsFromDie(state, actorId, die);
  let queuedDiceValues = [];

  if (mandatoryEntry) {
    steps = 5;
    if (die === 5 && auxDie === 5) queuedDiceValues = [5];
    else if (die === 5) queuedDiceValues = [auxDie];
    else queuedDiceValues = [die];
  }

  const sixStreak = isDoubleSix ? state.sixStreak + 1 : 0;
  const rollText = `Dados ${die} y ${auxDie}${isDouble ? " (dobles)" : ""}${die === 6 && !mandatoryEntry && steps === 7 ? " (se aplica avance de 7)" : ""}.`;
  const rolledState = {
    ...state,
    phase: "await-action",
    dice: die,
    diceAux: auxDie,
    steps,
    rollWasSix: isDouble,
    sixStreak,
    queuedDiceValues,
    mandatoryEntry,
    pendingBonus: null,
    pendingBonusSource: null,
    message: rollText,
    logs: appendLog(state.logs, `${playerLabel(actorId)} tira: ${rollText}`)
  };

  const actions = getLegalActions(rolledState, actorId);
  if (!actions.length) {
    return resolveNoLegalActions(rolledState, actorId);
  }
  return rolledState;
};

const pickAiAction = (state, actions, difficultyId, ownerId) => {
  if (!actions.length) return null;
  const level = AI_LEVELS[difficultyId] || AI_LEVELS.medium;

  if (level.id === "easy") {
    if (actions.length === 1) return actions[0];
    const soft = actions.filter((action) => !action.capturePieceId && !action.reachesGoal);
    if (soft.length && Math.random() < 0.58) {
      return soft[randomInt(soft.length)];
    }
    return actions[randomInt(actions.length)];
  }

  let bestAction = actions[0];
  let bestScore = -Infinity;

  for (const action of actions) {
    const immediate = scoreAction(state, action, ownerId, level);
    const nextState = applyActionAndAdvance(state, action, ownerId, { simulate: true });
    const positionScore = evaluatePosition(nextState, ownerId) * level.positionWeight;
    const threatPenalty = countThreatenedTrackPieces(nextState, ownerId) * level.threatWeight;
    const exposurePenalty = estimatePieceExposure(nextState, ownerId, action.pieceId) * level.exposureWeight;
    let score = immediate + positionScore - threatPenalty - exposurePenalty;

    if (level.id === "hard") {
      const pressure = estimateCombinedOpponentPressure(nextState, ownerId);
      score -= pressure;
      if (nextState.turn === ownerId) {
        score += 22;
      }
    }

    score += Math.random() * (level.id === "hard" ? 0.2 : 0.8);
    if (score > bestScore) {
      bestScore = score;
      bestAction = action;
    }
  }

  return bestAction;
};

const DIE_PIPS = {
  1: [[28, 28]],
  2: [[14, 14], [42, 42]],
  3: [[14, 14], [28, 28], [42, 42]],
  4: [[14, 14], [42, 14], [14, 42], [42, 42]],
  5: [[14, 14], [42, 14], [28, 28], [14, 42], [42, 42]],
  6: [[14, 12], [42, 12], [14, 28], [42, 28], [14, 44], [42, 44]]
};

function SvgDie({ value, rolling, size = 56, idSuffix }) {
  const pips = DIE_PIPS[value] || DIE_PIPS[1];
  const gradientId = `die-grad-${idSuffix}`;
  const shadowId = `die-shadow-${idSuffix}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      className={`parchis-svg-die${rolling ? " rolling" : ""}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e8e8e8" />
        </linearGradient>
        <filter id={shadowId}>
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.3" />
        </filter>
      </defs>
      <rect
        x="3"
        y="3"
        width="50"
        height="50"
        rx="9"
        ry="9"
        fill={`url(#${gradientId})`}
        filter={`url(#${shadowId})`}
        stroke="#ccc"
        strokeWidth="1"
      />
      {pips.map(([cx, cy], index) => (
        <circle key={`${idSuffix}-pip-${index}`} cx={cx} cy={cy} r="5" fill="#1a1a2e" />
      ))}
    </svg>
  );
}

function ParchisStrategyGame() {
  const [state, setState] = useState(() => createInitialState("medium"));
  const [aiThinking, setAiThinking] = useState(false);
  const [selectedPieceId, setSelectedPieceId] = useState(null);
  const [diceUi, setDiceUi] = useState(() => ({
    rolling: false,
    activeOwner: null,
    faces: [1, 1],
    lastByOwner: createLastRollByOwner()
  }));

  const aiPendingRef = useRef(false);
  const aiDelayRef = useRef(0);
  const rollPendingRef = useRef(false);
  const rollOwnerRef = useRef(null);
  const rollDelayRef = useRef(0);
  const rollPulseRef = useRef(0);
  const autoMovePendingRef = useRef(false);
  const autoMoveMsRef = useRef(0);
  const autoMoveActionIdRef = useRef(null);
  const frameRef = useRef(0);
  const lastFrameRef = useRef(0);

  const stopAiThinking = useCallback(() => {
    aiPendingRef.current = false;
    aiDelayRef.current = 0;
    setAiThinking(false);
  }, []);

  const stopAutoMove = useCallback(() => {
    autoMovePendingRef.current = false;
    autoMoveMsRef.current = 0;
    autoMoveActionIdRef.current = null;
  }, []);

  const resetDiceAnimation = useCallback(() => {
    rollPendingRef.current = false;
    rollOwnerRef.current = null;
    rollDelayRef.current = 0;
    rollPulseRef.current = 0;
    setDiceUi((previous) => ({
      ...previous,
      rolling: false,
      activeOwner: null
    }));
  }, []);

  const startDiceRoll = useCallback((ownerId) => {
    if (rollPendingRef.current) return;
    rollPendingRef.current = true;
    rollOwnerRef.current = ownerId;
    rollDelayRef.current = 820;
    rollPulseRef.current = 0;
    setDiceUi((previous) => ({
      ...previous,
      rolling: true,
      activeOwner: ownerId,
      faces: [rollDie(), rollDie()]
    }));
  }, []);

  const startMatch = useCallback(() => {
    if (rollPendingRef.current) return;
    setSelectedPieceId(null);
    stopAiThinking();
    stopAutoMove();
    resetDiceAnimation();
    setState((previous) => {
      if (previous.phase !== "await-start") return previous;
      const text = `Partida iniciada. Turno para ${playerLabel(HUMAN_PLAYER_ID)}.`;
      return {
        ...previous,
        phase: "await-roll",
        turn: HUMAN_PLAYER_ID,
        turnCount: 1,
        message: text,
        logs: appendLog(previous.logs, text)
      };
    });
  }, [resetDiceAnimation, stopAiThinking, stopAutoMove]);

  const restartMatch = useCallback(() => {
    setState((previous) => createInitialState(previous.difficultyId));
    setSelectedPieceId(null);
    stopAiThinking();
    stopAutoMove();
    resetDiceAnimation();
    setDiceUi({
      rolling: false,
      activeOwner: null,
      faces: [1, 1],
      lastByOwner: createLastRollByOwner()
    });
  }, [resetDiceAnimation, stopAiThinking, stopAutoMove]);

  const rollHuman = useCallback(() => {
    if (state.winner || state.turn !== HUMAN_PLAYER_ID || state.phase !== "await-roll") return;
    if (rollPendingRef.current) return;
    setSelectedPieceId(null);
    startDiceRoll(HUMAN_PLAYER_ID);
  }, [startDiceRoll, state.phase, state.turn, state.winner]);

  const humanActions = useMemo(() => getLegalActions(state, HUMAN_PLAYER_ID), [state]);
  const orderedHumanActions = useMemo(() => {
    if (!selectedPieceId) return humanActions;
    const selected = [];
    const other = [];
    for (const action of humanActions) {
      if (action.pieceId === selectedPieceId) selected.push(action);
      else other.push(action);
    }
    return [...selected, ...other];
  }, [humanActions, selectedPieceId]);
  const selectedHumanAction = useMemo(
    () => (selectedPieceId ? humanActions.find((action) => action.pieceId === selectedPieceId) || null : null),
    [humanActions, selectedPieceId]
  );
  const defaultHumanAction = selectedHumanAction || orderedHumanActions[0] || null;
  const selectablePieceIds = useMemo(() => new Set(humanActions.map((action) => action.pieceId)), [humanActions]);

  const playHumanAction = useCallback(
    (action) => {
      if (!action) return;
      setSelectedPieceId(null);
      setState((previous) => applyActionAndAdvance(previous, action, HUMAN_PLAYER_ID));
    },
    []
  );

  const resolveHumanNoMoves = useCallback(() => {
    setSelectedPieceId(null);
    setState((previous) => resolveNoLegalActions(previous, HUMAN_PLAYER_ID));
  }, []);

  const handlePieceClick = useCallback(
    (pieceId) => {
      if (state.winner || state.turn !== HUMAN_PLAYER_ID || state.phase !== "await-action" || diceUi.rolling) return;
      const pieceActions = humanActions.filter((action) => action.pieceId === pieceId);
      if (!pieceActions.length) return;
      if (selectedPieceId === pieceId) {
        playHumanAction(pieceActions[0]);
        return;
      }
      setSelectedPieceId(pieceId);
      stopAutoMove();
    },
    [diceUi.rolling, humanActions, playHumanAction, selectedPieceId, state.phase, state.turn, state.winner, stopAutoMove]
  );

  const actionToSquareId = useCallback((action) => {
    if (!action) return null;
    const color = getOwnerColor(action.ownerId);
    if (action.destinationType === "track" && action.targetTrackIndex != null) {
      return `track-${action.targetTrackIndex}`;
    }
    if (action.destinationType === "lane" && action.targetLaneStep != null) {
      return `home-${color}-${action.targetLaneStep - 1}`;
    }
    if (action.destinationType === "goal") {
      return "goal-center";
    }
    return null;
  }, []);

  const handleSquareClick = useCallback(
    (squareId) => {
      if (state.winner || state.turn !== HUMAN_PLAYER_ID || state.phase !== "await-action" || diceUi.rolling) return;
      const candidates = humanActions.filter((action) => actionToSquareId(action) === squareId);
      if (!candidates.length) return;

      const selectedCandidate = selectedPieceId
        ? candidates.find((action) => action.pieceId === selectedPieceId) || null
        : null;
      if (selectedCandidate) {
        playHumanAction(selectedCandidate);
        return;
      }

      if (candidates.length === 1) {
        playHumanAction(candidates[0]);
        return;
      }

      setSelectedPieceId(candidates[0].pieceId);
      stopAutoMove();
    },
    [
      actionToSquareId,
      diceUi.rolling,
      humanActions,
      playHumanAction,
      selectedPieceId,
      state.phase,
      state.turn,
      state.winner,
      stopAutoMove
    ]
  );

  const runAiStep = useCallback(() => {
    setState((previous) => {
      if (previous.winner || !isAiPlayer(previous.turn)) return previous;
      const actorId = previous.turn;
      if (previous.phase === "await-roll") {
        startDiceRoll(actorId);
        return previous;
      }
      if (previous.phase === "await-action") {
        const actions = getLegalActions(previous, actorId);
        if (!actions.length) return resolveNoLegalActions(previous, actorId);
        const selected = pickAiAction(previous, actions, previous.difficultyId, actorId);
        if (!selected) return resolveNoLegalActions(previous, actorId);
        return applyActionAndAdvance(previous, selected, actorId);
      }
      return previous;
    });
  }, [startDiceRoll]);

  const tickAi = useCallback(
    (ms) => {
      if (!aiPendingRef.current) return;
      aiDelayRef.current -= ms;
      if (aiDelayRef.current <= 0) {
        aiPendingRef.current = false;
        aiDelayRef.current = 0;
        setAiThinking(false);
        runAiStep();
      }
    },
    [runAiStep]
  );

  const tickRollAnimation = useCallback((ms) => {
    if (!rollPendingRef.current) return;
    rollDelayRef.current -= ms;
    rollPulseRef.current += ms;

    while (rollPulseRef.current >= 90 && rollPendingRef.current) {
      rollPulseRef.current -= 90;
      setDiceUi((previous) => ({
        ...previous,
        faces: [rollDie(), rollDie()]
      }));
    }

    if (rollDelayRef.current > 0) return;

    const ownerId = rollOwnerRef.current;
    rollPendingRef.current = false;
    rollOwnerRef.current = null;
    rollDelayRef.current = 0;
    rollPulseRef.current = 0;
    if (!ownerId) return;

    const finalDie = rollDie();
    const secondDie = rollDie();

    setDiceUi((previous) => ({
      ...previous,
      rolling: false,
      activeOwner: null,
      faces: [finalDie, secondDie],
      lastByOwner: {
        ...previous.lastByOwner,
        [ownerId]: [finalDie, secondDie]
      }
    }));

    setState((previous) => rollForPlayer(previous, ownerId, { main: finalDie, aux: secondDie }));
  }, []);

  const tickAutoMove = useCallback((ms) => {
    if (!autoMovePendingRef.current) return;
    autoMoveMsRef.current -= ms;
    if (autoMoveMsRef.current > 0) return;
    autoMovePendingRef.current = false;

    const actionId = autoMoveActionIdRef.current;
    autoMoveActionIdRef.current = null;
    if (!actionId) return;

    setState((previous) => {
      if (previous.winner || previous.turn !== HUMAN_PLAYER_ID || previous.phase !== "await-action") return previous;
      const actions = getLegalActions(previous, HUMAN_PLAYER_ID);
      const targetAction = actions.find((entry) => entry.id === actionId) || (actions.length === 1 ? actions[0] : null);
      if (!targetAction) return previous;
      return applyActionAndAdvance(previous, targetAction, HUMAN_PLAYER_ID);
    });
  }, []);

  const tickRuntime = useCallback((ms) => {
    tickRollAnimation(ms);
    tickAutoMove(ms);
    tickAi(ms);
  }, [tickAi, tickAutoMove, tickRollAnimation]);

  const advanceTime = useCallback(
    (ms) => {
      let remaining = clampMs(ms);
      while (remaining > 0 && (aiPendingRef.current || rollPendingRef.current || autoMovePendingRef.current)) {
        const step = Math.min(80, remaining);
        tickRuntime(step);
        remaining -= step;
      }
    },
    [tickRuntime]
  );

  useEffect(() => {
    if (
      state.winner ||
      !isAiPlayer(state.turn) ||
      (state.phase !== "await-roll" && state.phase !== "await-action") ||
      diceUi.rolling
    ) {
      stopAiThinking();
      return;
    }

    // Keep current countdown; only schedule when there is no pending AI action.
    if (aiPendingRef.current) return;

    const profile = AI_LEVELS[state.difficultyId] || AI_LEVELS.medium;
    aiPendingRef.current = true;
    aiDelayRef.current = profile.thinkMs + randomInt(220);
    setAiThinking(true);
  }, [
    diceUi.rolling,
    state.winner,
    state.turn,
    state.phase,
    state.difficultyId,
    state.dice,
    state.diceAux,
    state.steps,
    state.pendingBonus,
    state.pendingBonusSource,
    state.mandatoryEntry,
    state.queuedDiceValues,
    stopAiThinking
  ]);

  useEffect(() => {
    if (state.winner || state.turn !== HUMAN_PLAYER_ID || state.phase !== "await-action" || diceUi.rolling) {
      stopAutoMove();
      return;
    }

    const actions = getLegalActions(state, HUMAN_PLAYER_ID);
    if (actions.length === 1 && !selectedPieceId) {
      autoMovePendingRef.current = true;
      autoMoveMsRef.current = 280;
      autoMoveActionIdRef.current = actions[0].id;
      return;
    }

    stopAutoMove();
  }, [diceUi.rolling, selectedPieceId, state, stopAutoMove]);

  useEffect(() => {
    if (state.winner || state.turn !== HUMAN_PLAYER_ID || state.phase !== "await-action" || diceUi.rolling) {
      if (selectedPieceId) setSelectedPieceId(null);
      return;
    }

    if (selectedPieceId && !selectablePieceIds.has(selectedPieceId)) {
      setSelectedPieceId(null);
    }
  }, [diceUi.rolling, selectablePieceIds, selectedPieceId, state.phase, state.turn, state.winner]);

  useEffect(() => {
    const animate = (timestamp) => {
      if (!lastFrameRef.current) lastFrameRef.current = timestamp;
      const delta = Math.min(120, timestamp - lastFrameRef.current);
      lastFrameRef.current = timestamp;
      tickRuntime(delta);
      frameRef.current = window.requestAnimationFrame(animate);
    };
    frameRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [tickRuntime]);

  const changeDifficulty = useCallback((difficultyId) => {
    if (!AI_LEVELS[difficultyId]) return;
    setState((previous) => ({
      ...previous,
      difficultyId,
      message: `Dificultad IA cambiada a ${AI_LEVELS[difficultyId].label}.`,
      logs: appendLog(previous.logs, `Configuracion: IA ${AI_LEVELS[difficultyId].label}.`)
    }));
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      const tag = event.target?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      const key = event.key.toLowerCase();

      if (key === "n") {
        event.preventDefault();
        restartMatch();
        return;
      }

      if (state.phase === "await-start" && (key === "s" || event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        startMatch();
        return;
      }

      if (state.turn !== HUMAN_PLAYER_ID || state.winner) return;
      if (diceUi.rolling) return;

      if (state.phase === "await-roll" && (key === "r" || event.key === " " || key === "enter")) {
        event.preventDefault();
        rollHuman();
        return;
      }

      if (state.phase === "await-action") {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (defaultHumanAction) playHumanAction(defaultHumanAction);
          else resolveHumanNoMoves();
          return;
        }

        if (key === "x") {
          event.preventDefault();
          resolveHumanNoMoves();
          return;
        }

        if (/[1-9]/.test(key)) {
          const index = Number(key) - 1;
          if (orderedHumanActions[index]) {
            event.preventDefault();
            playHumanAction(orderedHumanActions[index]);
          }
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    defaultHumanAction,
    diceUi.rolling,
    orderedHumanActions,
    playHumanAction,
    resolveHumanNoMoves,
    restartMatch,
    rollHuman,
    startMatch,
    state.phase,
    state.turn,
    state.winner
  ]);

  const pieceStats = useMemo(() => {
    const result = {};
    for (const player of PLAYERS) {
      const own = state.pieces.filter((piece) => piece.owner === player.id);
      result[player.id] = {
        home: own.filter(isPieceHome).length,
        active: own.filter((piece) => !isPieceHome(piece) && !isPieceFinished(piece)).length,
        goal: own.filter(isPieceFinished).length
      };
    }
    return result;
  }, [state.pieces]);

  const highlightedSquares = useMemo(() => {
    if (state.turn !== HUMAN_PLAYER_ID || state.phase !== "await-action" || state.winner) return [];
    const seen = new Set();
    const ids = [];
    for (const action of humanActions) {
      const squareId = actionToSquareId(action);
      if (!squareId || seen.has(squareId)) continue;
      seen.add(squareId);
      ids.push(squareId);
    }
    return ids;
  }, [actionToSquareId, humanActions, state.phase, state.turn, state.winner]);

  const boardPositions = useMemo(() => {
    const tokens = [];

    for (const piece of state.pieces) {
      const color = getOwnerColor(piece.owner);
      let squareId = null;

      if (isPieceHome(piece)) {
        squareId = `home-${color}-slot-${Math.max(0, piece.slot - 1)}`;
      } else if (isPieceFinished(piece)) {
        squareId = `goal-${color}-slot-${Math.max(0, piece.slot - 1)}`;
      } else if (isPieceInLane(piece)) {
        const laneStep = getLaneStep(piece);
        if (laneStep != null) squareId = `home-${color}-${laneStep - 1}`;
      } else if (isPieceInTrack(piece)) {
        const trackIndex = progressToTrackIndex(piece.owner, piece.progress);
        if (trackIndex != null) squareId = `track-${trackIndex}`;
      }

      if (!squareId) continue;
      tokens.push({
        tokenId: piece.id,
        color,
        squareId,
        label: String(piece.slot),
        movable: selectablePieceIds.has(piece.id),
        selected: selectedPieceId === piece.id
      });
    }

    return { tokens };
  }, [selectablePieceIds, selectedPieceId, state.pieces]);

  const bridgeState = useMemo(() => ({ ...state, aiThinking, diceUi }), [state, aiThinking, diceUi]);
  const payloadBuilder = useCallback((snapshot) => {
    const legal = snapshot.turn === HUMAN_PLAYER_ID ? getLegalActions(snapshot, HUMAN_PLAYER_ID) : [];
    return {
      mode: "strategy-parchis-ludoteka",
      variant: "parchis-4p-human-vs-3ai",
      coordinates: "track_index_0_to_67_counterclockwise_from_red_start",
      phase: snapshot.phase,
      turn: snapshot.turn,
      turnCount: snapshot.turnCount,
      difficulty: snapshot.difficultyId,
      dice: snapshot.dice,
      diceAux: snapshot.diceAux,
      steps: snapshot.pendingBonus ?? snapshot.steps ?? null,
      pendingBonus: snapshot.pendingBonus,
      pendingBonusSource: snapshot.pendingBonusSource,
      queuedDiceValues: snapshot.queuedDiceValues,
      mandatoryEntry: snapshot.mandatoryEntry,
      sixStreak: snapshot.sixStreak,
      aiThinking: snapshot.aiThinking,
      diceUi: snapshot.diceUi,
      winner: snapshot.winner,
      players: PLAYERS.map((player) => ({
        id: player.id,
        label: player.label,
        startIndex: player.startIndex,
        home: snapshot.pieces.filter((piece) => piece.owner === player.id && isPieceHome(piece)).length,
        active: snapshot.pieces.filter((piece) => piece.owner === player.id && !isPieceHome(piece) && !isPieceFinished(piece)).length,
        goal: snapshot.pieces.filter((piece) => piece.owner === player.id && isPieceFinished(piece)).length
      })),
      pieces: snapshot.pieces.map((piece) => {
        const trackIndex = isPieceInTrack(piece) ? progressToTrackIndex(piece.owner, piece.progress) : null;
        const laneStep = isPieceInLane(piece) ? getLaneStep(piece) : null;
        return {
          id: piece.id,
          owner: piece.owner,
          slot: piece.slot,
          home: isPieceHome(piece),
          finished: isPieceFinished(piece),
          progress: piece.progress,
          trackIndex,
          laneStep
        };
      }),
      legalActionsHuman: legal.map((action, index) => ({
        index: index + 1,
        type: action.type,
        pieceId: action.pieceId,
        steps: action.steps,
        destinationType: action.destinationType,
        targetTrackIndex: action.targetTrackIndex,
        targetLaneStep: action.targetLaneStep,
        capturePieceId: action.capturePieceId,
        reachesGoal: action.reachesGoal
      })),
      message: snapshot.message,
      logs: snapshot.logs.slice(0, 8),
      rulesPrompt: RULES_PROMPT
    };
  }, []);

  useGameRuntimeBridge(bridgeState, payloadBuilder, advanceTime);

  const statusLabel = diceUi.rolling
    ? "Tirada en curso"
    : state.phase === "await-start"
    ? "Pendiente de inicio"
    : state.phase === "await-roll"
    ? "Esperando tirada"
    : state.phase === "await-action"
      ? "Esperando jugada"
      : "Partida cerrada";

  const currentSteps = state.pendingBonus ?? state.steps ?? null;
  const currentPlayer = playerLabel(state.turn);
  const currentDifficulty = AI_LEVELS[state.difficultyId] || AI_LEVELS.medium;
  const selectedPiece = selectedPieceId ? pieceById(state, selectedPieceId) : null;
  const selectedPieceRef = selectedPiece ? pieceCode(selectedPiece) : null;

  return (
    <div className="mini-game parchis-strategy-game">
      <div className="mini-head">
        <div>
          <h4>Parchis Ludoteka Arena</h4>
          <p>Implementacion individual a 4 (Tu + 3 IAs) con reglas clave de Ludoteka y 3 niveles de IA.</p>
        </div>
        <div className="parchis-head-actions">
          <button type="button" onClick={startMatch} disabled={state.phase !== "await-start"}>Iniciar partida</button>
          <button type="button" onClick={restartMatch}>Reiniciar partida</button>
        </div>
      </div>

      <div className="parchis-config">
        <label htmlFor="parchis-ai-level">
          Dificultad IA
          <select
            id="parchis-ai-level"
            value={state.difficultyId}
            onChange={(event) => changeDifficulty(event.target.value)}
          >
            {Object.values(AI_LEVELS).map((level) => (
              <option key={level.id} value={level.id}>{level.label}</option>
            ))}
          </select>
        </label>

        <p className="parchis-config-note">
          Controles: S/Enter inicia, R/Enter/Space tira dado, 1..9 para jugada, Enter confirma la seleccion, X continuar sin jugada y N reiniciar.
        </p>
      </div>

      <div className="status-row parchis-status-row">
        <span className={`status-pill ${state.phase === "game-over" ? "finished" : "playing"}`}>{statusLabel}</span>
        <span>Turno: {currentPlayer}</span>
        <span>Dados: {state.dice ?? (diceUi.rolling ? "..." : "--")} / {state.diceAux ?? (diceUi.rolling ? "..." : "--")}</span>
        <span>Movimiento: {currentSteps ?? "--"}</span>
        <span>Racha doble 6: {state.sixStreak}</span>
        <span>Nivel IA: {currentDifficulty.label}</span>
        {state.pendingBonus != null ? <span>Bono pendiente: +{state.pendingBonus}</span> : null}
        {aiThinking ? <span>IA pensando...</span> : null}
        {diceUi.rolling ? <span>Tirando: {playerLabel(diceUi.activeOwner || "")}</span> : null}
      </div>

      <div className="parchis-game-layout">
        <div className="parchis-board-wrap">
          <LudoBoard
            model={PARCHIS_BOARD_MODEL}
            positions={boardPositions}
            highlightedSquares={highlightedSquares}
            onSquareClick={handleSquareClick}
            onTokenClick={handlePieceClick}
            theme={{
              boardBg: "#efede6",
              frameOuter: "#8f8161",
              frameInner: "#cdc1a7",
              line: "#2c2c2c",
              crossBg: "#f8f5eb",
              squareBg: "#fbfbfb",
              safeBg: "#e7ecef",
              highlight: "#1f69b8",
              glow: "rgba(31, 105, 184, 0.36)",
              colors: {
                red: "#e12020",
                blue: "#1690d9",
                yellow: "#e8d215",
                green: "#109541"
              }
            }}
          />

          <div className="parchis-board-legend">
            <span><strong>Salida roja:</strong> C0</span>
            <span><strong>Salida azul:</strong> C17</span>
            <span><strong>Salida amarilla:</strong> C34</span>
            <span><strong>Salida verde:</strong> C51</span>
            <span><strong>Seguros:</strong> casillas resaltadas</span>
            <span><strong>Interaccion:</strong> casillas y fichas soportan clic + Enter/Espacio</span>
          </div>
        </div>

        <aside className="parchis-panel">
          <div className="parchis-dice-panel">
            <article className="dice-roll-card">
              <p>Tirada actual</p>
              <div className="dice-pair">
                {diceUi.faces.map((face, index) => (
                  <SvgDie
                    key={`die-face-${index}`}
                    value={face}
                    rolling={diceUi.rolling}
                    idSuffix={`${diceUi.activeOwner || "idle"}-${index}`}
                  />
                ))}
              </div>
              <small>{diceUi.rolling ? `Lanzando ${playerLabel(diceUi.activeOwner || "")}...` : "Tirada resuelta"}</small>
            </article>

            <article className="dice-history-card">
              <p>Ultimas tiradas</p>
              {PLAYERS.map((player) => (
                <div key={`dice-history-${player.id}`} className="dice-history-row">
                  <span>{player.label}</span>
                  <strong>
                    {diceUi.lastByOwner[player.id]?.[0] ?? "--"} / {diceUi.lastByOwner[player.id]?.[1] ?? "--"}
                  </strong>
                </div>
              ))}
            </article>
          </div>

          <div className="parchis-scoreboard">
            {PLAYERS.map((player) => (
              <article key={player.id} className={`parchis-score-card ${player.id === state.turn ? "is-turn" : ""}`}>
                <p>{player.label}</p>
                <strong>{pieceStats[player.id].goal} / {PIECES_PER_PLAYER}</strong>
                <span>Casa: {pieceStats[player.id].home}</span>
                <span>En juego: {pieceStats[player.id].active}</span>
              </article>
            ))}
          </div>

          <div className="parchis-actions">
            {state.winner ? (
              <div className="parchis-end-panel">
                <strong>
                  {state.winner === HUMAN_PLAYER_ID ? "Ganaste la partida." : `${playerLabel(state.winner)} gana la partida.`}
                </strong>
                <button type="button" onClick={restartMatch}>Revancha</button>
              </div>
            ) : state.phase === "await-start" ? (
              <p className="parchis-ai-wait">Pulsa Iniciar partida para comenzar. (Atajo: S o Enter)</p>
            ) : state.turn === HUMAN_PLAYER_ID ? (
              <>
                {state.phase === "await-roll" ? (
                  <button type="button" className="primary" onClick={rollHuman} disabled={diceUi.rolling}>Tirar dado</button>
                ) : null}

                {state.phase === "await-action" ? (
                  <>
                    {orderedHumanActions.length ? (
                      <>
                        <p className="parchis-selection-note">
                          {selectedPieceRef
                            ? `Ficha seleccionada: ${selectedPieceRef}. Pulsa Enter o vuelve a pulsar la ficha para mover.`
                            : "Selecciona una ficha en el tablero para priorizar su jugada."}
                        </p>
                        {selectedHumanAction ? (
                          <button
                            type="button"
                            className="primary"
                            onClick={() => playHumanAction(selectedHumanAction)}
                            disabled={diceUi.rolling}
                          >
                            Mover ficha seleccionada
                          </button>
                        ) : null}
                        <div className="parchis-action-list">
                          {orderedHumanActions.map((action, index) => (
                            <button
                              key={action.id}
                              type="button"
                              className={action.pieceId === selectedPieceId ? "is-focused" : ""}
                              onClick={() => {
                                setSelectedPieceId(action.pieceId);
                                playHumanAction(action);
                              }}
                              disabled={diceUi.rolling}
                            >
                              <span className="action-index">{index + 1}.</span> {describeAction(state, action)}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <button type="button" className="ghost" onClick={resolveHumanNoMoves} disabled={diceUi.rolling}>
                        Continuar (sin jugada legal)
                      </button>
                    )}
                    {orderedHumanActions.length === 1 && !diceUi.rolling && !selectedPieceId ? (
                      <p className="parchis-auto-note">Auto-movimiento activo: solo hay una jugada legal.</p>
                    ) : null}
                  </>
                ) : null}
              </>
            ) : (
              <p className="parchis-ai-wait">
                Turno de {currentPlayer}. {aiThinking ? "Analizando jugada..." : "Resolviendo..."}
              </p>
            )}
          </div>
        </aside>
      </div>

      <details className="parchis-rules">
        <summary>Reglas activas de parchis (prompt base)</summary>
        <pre>{RULES_PROMPT}</pre>
      </details>

      <p className="game-message">{state.message}</p>

      <ul className="game-log">
        {state.logs.map((entry, index) => (
          <li key={`parchis-log-${index}`}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

export default ParchisStrategyGame;

