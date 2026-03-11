import React, { useCallback, useEffect, useRef, useState } from "react";
import useGameRuntimeBridge from "../../../utils/useGameRuntimeBridge";

const TABLE_WIDTH = 960;
const TABLE_HEIGHT = 540;
const PLAY_LEFT = 86;
const PLAY_TOP = 82;
const PLAY_RIGHT = TABLE_WIDTH - 86;
const PLAY_BOTTOM = TABLE_HEIGHT - 82;
const TABLE_CENTER_X = (PLAY_LEFT + PLAY_RIGHT) / 2;
const TABLE_CENTER_Y = (PLAY_TOP + PLAY_BOTTOM) / 2;
const HEAD_STRING_X = PLAY_LEFT + (PLAY_RIGHT - PLAY_LEFT) * 0.24;
const FOOT_SPOT_X = PLAY_LEFT + (PLAY_RIGHT - PLAY_LEFT) * 0.74;
const BALL_RADIUS = 11.2;
const BALL_DIAMETER = BALL_RADIUS * 2;
const CORNER_POCKET_RADIUS = 26;
const SIDE_POCKET_RADIUS = 23;
const FIXED_DT = 1 / 120;
const MAX_FRAME_MS = 50;
const ROLL_DECEL = 138;
const STOP_SPEED = 5;
const RESTITUTION = 0.985;
const AIM_STEP = Math.PI / 180 * 1.6;
const POWER_STEP = 0.05;
const MAX_LOG_ITEMS = 6;
const PLAYER_HUMAN = 0;
const PLAYER_AI = 1;

const MODE_PRESETS = {
  "eight-ball": {
    label: "Bola 8",
    summary: "Mesa abierta, lisas/rayas y cierre cantando la 8.",
  },
  "nine-ball": {
    label: "Bola 9",
    summary: "Orden numerico, blanca en mano y regla de tres faltas.",
  },
};

const DIFFICULTY_PRESETS = {
  casual: {
    label: "Recreativo",
    aimNoise: 0.08,
    powerNoise: 0.13,
    pickSpread: 4,
    thinkMs: 620,
  },
  club: {
    label: "Club",
    aimNoise: 0.04,
    powerNoise: 0.08,
    pickSpread: 2,
    thinkMs: 520,
  },
  pro: {
    label: "Pro",
    aimNoise: 0.018,
    powerNoise: 0.04,
    pickSpread: 1,
    thinkMs: 420,
  },
};

const BALL_COLORS = {
  1: "#facc15",
  2: "#2563eb",
  3: "#ef4444",
  4: "#7c3aed",
  5: "#f97316",
  6: "#16a34a",
  7: "#881337",
  8: "#111827",
  9: "#facc15",
  10: "#2563eb",
  11: "#ef4444",
  12: "#7c3aed",
  13: "#f97316",
  14: "#16a34a",
  15: "#881337",
};

const POCKETS = [
  { id: "tl", label: "Sup. izq.", x: PLAY_LEFT - 10, y: PLAY_TOP - 10, radius: CORNER_POCKET_RADIUS },
  { id: "tm", label: "Sup. centro", x: TABLE_CENTER_X, y: PLAY_TOP - 6, radius: SIDE_POCKET_RADIUS },
  { id: "tr", label: "Sup. dcha.", x: PLAY_RIGHT + 10, y: PLAY_TOP - 10, radius: CORNER_POCKET_RADIUS },
  { id: "bl", label: "Inf. izq.", x: PLAY_LEFT - 10, y: PLAY_BOTTOM + 10, radius: CORNER_POCKET_RADIUS },
  { id: "bm", label: "Inf. centro", x: TABLE_CENTER_X, y: PLAY_BOTTOM + 6, radius: SIDE_POCKET_RADIUS },
  { id: "br", label: "Inf. dcha.", x: PLAY_RIGHT + 10, y: PLAY_BOTTOM + 10, radius: CORNER_POCKET_RADIUS },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function normalizeAngle(angle) {
  let next = angle;
  while (next <= -Math.PI) next += Math.PI * 2;
  while (next > Math.PI) next -= Math.PI * 2;
  return next;
}

function ballGroupFromNumber(number) {
  if (number >= 1 && number <= 7) return "solids";
  if (number >= 9 && number <= 15) return "stripes";
  return null;
}

function groupLabel(group) {
  if (group === "solids") return "lisas";
  if (group === "stripes") return "rayas";
  return "abierta";
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function distancePointToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(px - x1, py - y1);
  const t = clamp(((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy), 0, 1);
  const sx = x1 + dx * t;
  const sy = y1 + dy * t;
  return Math.hypot(px - sx, py - sy);
}

function shuffle(values) {
  const next = [...values];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function makeCueBall(x, y) {
  return {
    id: "cue",
    number: 0,
    x,
    y,
    vx: 0,
    vy: 0,
    pocketed: false,
    stripe: false,
    color: "#f8fafc",
    lastPocketId: null,
  };
}

function makeObjectBall(number, x, y) {
  return {
    id: `ball-${number}`,
    number,
    x,
    y,
    vx: 0,
    vy: 0,
    pocketed: false,
    stripe: number >= 9,
    color: BALL_COLORS[number] ?? "#64748b",
    lastPocketId: null,
  };
}

function buildTriangleRackPositions() {
  const positions = [];
  const xSpacing = BALL_RADIUS * 1.82;
  const ySpacing = BALL_RADIUS * 1.04;
  for (let row = 0; row < 5; row += 1) {
    for (let index = 0; index <= row; index += 1) {
      positions.push({
        x: FOOT_SPOT_X + row * xSpacing,
        y: TABLE_CENTER_Y + (index * 2 - row) * ySpacing,
      });
    }
  }
  return positions;
}

function buildDiamondRackPositions() {
  const offsets = [1, 2, 3, 2, 1];
  const positions = [];
  const xSpacing = BALL_RADIUS * 1.82;
  const ySpacing = BALL_RADIUS * 1.04;
  offsets.forEach((count, row) => {
    for (let index = 0; index < count; index += 1) {
      positions.push({
        x: FOOT_SPOT_X + row * xSpacing,
        y: TABLE_CENTER_Y + (index * 2 - (count - 1)) * ySpacing,
      });
    }
  });
  return positions;
}

function buildEightBallNumbers() {
  const solids = shuffle([1, 2, 3, 4, 5, 6, 7]);
  const stripes = shuffle([9, 10, 11, 12, 13, 14, 15]);
  const cornerLeft = solids.pop();
  const cornerRight = stripes.pop();
  const apexCandidates = shuffle([...solids, ...stripes]);
  const apex = apexCandidates[0];
  const pool = shuffle([
    ...solids.filter((value) => value !== apex),
    ...stripes.filter((value) => value !== apex),
  ]);
  const numbers = new Array(15).fill(null);
  numbers[0] = apex;
  numbers[4] = 8;
  numbers[10] = cornerLeft;
  numbers[14] = cornerRight;
  for (let i = 0; i < numbers.length; i += 1) {
    if (numbers[i] == null) {
      numbers[i] = pool.shift();
    }
  }
  return numbers;
}

function buildRackBalls(modeKey) {
  const cue = makeCueBall(HEAD_STRING_X - 74, TABLE_CENTER_Y);
  if (modeKey === "nine-ball") {
    const positions = buildDiamondRackPositions();
    const rest = shuffle([2, 3, 4, 5, 6, 7, 8, 10]);
    const numbers = [1, rest[0], rest[1], rest[2], 9, rest[3], rest[4], rest[5], rest[6]];
    return [cue, ...positions.map((position, index) => makeObjectBall(numbers[index], position.x, position.y))];
  }
  const positions = buildTriangleRackPositions();
  const numbers = buildEightBallNumbers();
  return [cue, ...positions.map((position, index) => makeObjectBall(numbers[index], position.x, position.y))];
}

function createPlayers(difficultyKey) {
  return [
    { name: "Tu", type: "human", group: null, racksWon: 0, foulsInRow: 0 },
    { name: `IA ${DIFFICULTY_PRESETS[difficultyKey].label}`, type: "ai", group: null, racksWon: 0, foulsInRow: 0 },
  ];
}

function createRuntimeState(modeKey = "eight-ball", difficultyKey = "club") {
  return {
    modeKey,
    difficultyKey,
    raceTo: 3,
    players: createPlayers(difficultyKey),
    currentPlayer: PLAYER_HUMAN,
    breakerIndex: PLAYER_HUMAN,
    nextBreaker: PLAYER_AI,
    phase: "menu",
    balls: [],
    tableOpen: modeKey === "eight-ball",
    breakShot: true,
    ballInHand: { active: false, restrictHeadString: false },
    cueControl: { angle: 0, power: 0.74 },
    calledPocketId: null,
    shot: null,
    aiTimerMs: 0,
    rackWinner: null,
    matchWinner: null,
    message: "Configura la mesa y pulsa Empezar.",
    log: ["Configura la mesa y pulsa Empezar."],
    fullscreen: false,
    shotCount: 0,
  };
}

function cloneWins(players) {
  return players.map((player) => player.racksWon);
}

function getCueBall(state) {
  return state.balls.find((ball) => ball.id === "cue") ?? null;
}

function getBallById(state, ballId) {
  return state.balls.find((ball) => ball.id === ballId) ?? null;
}

function getActiveBalls(state) {
  return state.balls.filter((ball) => !ball.pocketed);
}

function addLog(state, text) {
  state.message = text;
  state.log = [text, ...state.log.filter((entry) => entry !== text)].slice(0, MAX_LOG_ITEMS);
}

function ballMatchesGroup(ball, group) {
  if (!ball || !group) return false;
  return ballGroupFromNumber(ball.number) === group;
}

function countRemainingGroupBalls(state, playerIndex) {
  const group = state.players[playerIndex]?.group;
  if (!group) return 0;
  return state.balls.filter((ball) => !ball.pocketed && ballMatchesGroup(ball, group)).length;
}

function getLowestNumber(state) {
  const numbers = state.balls
    .filter((ball) => !ball.pocketed && ball.number > 0)
    .map((ball) => ball.number)
    .sort((a, b) => a - b);
  return numbers[0] ?? null;
}

function getLegalNumbers(state, playerIndex) {
  if (state.modeKey === "nine-ball") {
    const lowest = getLowestNumber(state);
    return lowest == null ? [] : [lowest];
  }
  const player = state.players[playerIndex];
  if (state.tableOpen || !player.group) {
    return state.balls
      .filter((ball) => !ball.pocketed && ball.number > 0 && ball.number !== 8)
      .map((ball) => ball.number);
  }
  const remainingGroup = countRemainingGroupBalls(state, playerIndex);
  if (remainingGroup === 0) {
    return state.balls.filter((ball) => !ball.pocketed && ball.number === 8).map((ball) => ball.number);
  }
  return state.balls
    .filter((ball) => !ball.pocketed && ballMatchesGroup(ball, player.group))
    .map((ball) => ball.number);
}

function needsPocketCall(state, playerIndex) {
  if (state.modeKey !== "eight-ball") return false;
  if (state.tableOpen) return false;
  const player = state.players[playerIndex];
  if (!player.group) return false;
  return countRemainingGroupBalls(state, playerIndex) === 0;
}

function setCueControlForTurn(state) {
  const cueBall = getCueBall(state);
  if (!cueBall) return;
  const legalNumbers = getLegalNumbers(state, state.currentPlayer);
  const targetBall = state.balls.find((ball) => !ball.pocketed && legalNumbers.includes(ball.number));
  state.cueControl.angle = targetBall
    ? Math.atan2(targetBall.y - cueBall.y, targetBall.x - cueBall.x)
    : 0;
  state.cueControl.power = state.breakShot ? 0.9 : clamp(state.cueControl.power || 0.58, 0.18, 1);
}
function isCuePlacementValid(state, x, y, restrictHeadString) {
  if (x < PLAY_LEFT + BALL_RADIUS + 2 || x > PLAY_RIGHT - BALL_RADIUS - 2) return false;
  if (y < PLAY_TOP + BALL_RADIUS + 2 || y > PLAY_BOTTOM - BALL_RADIUS - 2) return false;
  if (restrictHeadString && x > HEAD_STRING_X - BALL_RADIUS - 2) return false;
  const pocketCollision = POCKETS.some((pocket) => distance(x, y, pocket.x, pocket.y) < pocket.radius - 3);
  if (pocketCollision) return false;
  return state.balls.every((ball) => {
    if (ball.id === "cue" || ball.pocketed) return true;
    return distance(x, y, ball.x, ball.y) > BALL_DIAMETER + 1;
  });
}

function findNearestPlacement(state, preferredX, preferredY, restrictHeadString) {
  const xMin = PLAY_LEFT + BALL_RADIUS + 8;
  const xMax = restrictHeadString ? HEAD_STRING_X - BALL_RADIUS - 8 : PLAY_RIGHT - BALL_RADIUS - 8;
  const yMin = PLAY_TOP + BALL_RADIUS + 8;
  const yMax = PLAY_BOTTOM - BALL_RADIUS - 8;
  let best = null;
  for (let y = yMin; y <= yMax; y += BALL_DIAMETER * 1.05) {
    for (let x = xMin; x <= xMax; x += BALL_DIAMETER * 1.05) {
      if (!isCuePlacementValid(state, x, y, restrictHeadString)) continue;
      const score = distance(x, y, preferredX, preferredY);
      if (!best || score < best.score) {
        best = { x, y, score };
      }
    }
  }
  if (best) return best;
  return {
    x: clamp(preferredX, xMin, xMax),
    y: clamp(preferredY, yMin, yMax),
    score: 9999,
  };
}

function prepareCueBallForPlacement(state, restrictHeadString) {
  const cueBall = getCueBall(state);
  if (!cueBall) return;
  const preferredX = restrictHeadString ? HEAD_STRING_X - 100 : PLAY_LEFT + 120;
  const placement = findNearestPlacement(state, preferredX, TABLE_CENTER_Y, restrictHeadString);
  cueBall.pocketed = false;
  cueBall.vx = 0;
  cueBall.vy = 0;
  cueBall.x = placement.x;
  cueBall.y = placement.y;
}

function moveToTurnStart(state) {
  if (state.matchWinner != null || state.rackWinner != null) return;
  if (!needsPocketCall(state, state.currentPlayer)) {
    state.calledPocketId = null;
  }
  setCueControlForTurn(state);
  if (state.currentPlayer === PLAYER_HUMAN) {
    state.phase = state.ballInHand.active ? "placing" : "aim";
  } else {
    state.phase = "ai-thinking";
    state.aiTimerMs = DIFFICULTY_PRESETS[state.difficultyKey].thinkMs;
  }
}

function startRack(state, breakerIndex) {
  state.players.forEach((player) => {
    player.group = null;
    player.foulsInRow = 0;
  });
  state.balls = buildRackBalls(state.modeKey);
  state.currentPlayer = breakerIndex;
  state.breakerIndex = breakerIndex;
  state.nextBreaker = breakerIndex === PLAYER_HUMAN ? PLAYER_AI : PLAYER_HUMAN;
  state.tableOpen = state.modeKey === "eight-ball";
  state.breakShot = true;
  state.ballInHand = { active: false, restrictHeadString: false };
  state.shot = null;
  state.calledPocketId = null;
  state.rackWinner = null;
  state.matchWinner = null;
  state.shotCount = 0;
  addLog(state, `${state.players[breakerIndex].name} rompe en ${MODE_PRESETS[state.modeKey].label}.`);
  moveToTurnStart(state);
}

function findSpotPlacement(state) {
  const cue = getCueBall(state);
  const occupied = (x, y) => state.balls.some((ball) => {
    if (ball.pocketed) return false;
    if (cue && ball.id === cue.id) return false;
    return distance(x, y, ball.x, ball.y) < BALL_DIAMETER + 1;
  });
  const offsets = [0, BALL_DIAMETER, -BALL_DIAMETER, BALL_DIAMETER * 2, -BALL_DIAMETER * 2, BALL_DIAMETER * 3, -BALL_DIAMETER * 3];
  for (const offset of offsets) {
    const x = FOOT_SPOT_X;
    const y = TABLE_CENTER_Y + offset;
    if (!occupied(x, y)) return { x, y };
  }
  return { x: FOOT_SPOT_X, y: TABLE_CENTER_Y };
}

function respotBall(state, number) {
  const ball = state.balls.find((entry) => entry.number === number);
  if (!ball) return;
  const placement = findSpotPlacement(state);
  ball.pocketed = false;
  ball.x = placement.x;
  ball.y = placement.y;
  ball.vx = 0;
  ball.vy = 0;
  ball.lastPocketId = null;
}

function segmentClear(state, x1, y1, x2, y2, ignoreIds = new Set(), clearance = BALL_DIAMETER * 0.96) {
  return state.balls.every((ball) => {
    if (ball.pocketed || ignoreIds.has(ball.id)) return true;
    return distancePointToSegment(ball.x, ball.y, x1, y1, x2, y2) > clearance;
  });
}

function choosePocketPlans(state, playerIndex, cueX, cueY) {
  const legalNumbers = getLegalNumbers(state, playerIndex);
  const legalBalls = state.balls.filter((ball) => !ball.pocketed && legalNumbers.includes(ball.number));
  const plans = [];

  legalBalls.forEach((ball) => {
    POCKETS.forEach((pocket) => {
      const dx = pocket.x - ball.x;
      const dy = pocket.y - ball.y;
      const length = Math.hypot(dx, dy);
      if (length < 1) return;
      const nx = dx / length;
      const ny = dy / length;
      const contactX = ball.x - nx * BALL_DIAMETER;
      const contactY = ball.y - ny * BALL_DIAMETER;
      if (contactX < PLAY_LEFT || contactX > PLAY_RIGHT || contactY < PLAY_TOP || contactY > PLAY_BOTTOM) return;
      if (!segmentClear(state, ball.x, ball.y, pocket.x, pocket.y, new Set([ball.id, "cue"]), BALL_DIAMETER * 0.92)) return;
      if (!segmentClear(state, cueX, cueY, contactX, contactY, new Set([ball.id, "cue"]), BALL_DIAMETER * 0.92)) return;

      const cueDistance = distance(cueX, cueY, contactX, contactY);
      const objectDistance = distance(ball.x, ball.y, pocket.x, pocket.y);
      const aimAngle = Math.atan2(contactY - cueY, contactX - cueX);
      const centerAngle = Math.atan2(ball.y - cueY, ball.x - cueX);
      const cutPenalty = Math.abs(normalizeAngle(aimAngle - centerAngle));
      const score = cueDistance + objectDistance * 0.82 + cutPenalty * 180 + (ball.number === 8 || ball.number === 9 ? -22 : 0);
      const basePower = clamp(0.34 + cueDistance / 560 + objectDistance / 920, 0.28, 0.88);

      plans.push({
        type: "pot",
        ballId: ball.id,
        ballNumber: ball.number,
        pocketId: pocket.id,
        angle: aimAngle,
        power: basePower,
        score,
      });
    });
  });

  plans.sort((a, b) => a.score - b.score);
  return plans;
}

function chooseFallbackPlan(state, playerIndex, cueX, cueY) {
  const legalNumbers = getLegalNumbers(state, playerIndex);
  const legalBalls = state.balls
    .filter((ball) => !ball.pocketed && legalNumbers.includes(ball.number))
    .sort((a, b) => distance(cueX, cueY, a.x, a.y) - distance(cueX, cueY, b.x, b.y));
  const target = legalBalls[0];
  if (!target) return null;
  return {
    type: "contact",
    ballId: target.id,
    ballNumber: target.number,
    pocketId: null,
    angle: Math.atan2(target.y - cueY, target.x - cueX),
    power: state.breakShot ? 0.92 : 0.48,
    score: 9999,
  };
}

function chooseAiPlan(state, playerIndex, cueX, cueY) {
  const difficulty = DIFFICULTY_PRESETS[state.difficultyKey];
  const plans = choosePocketPlans(state, playerIndex, cueX, cueY);
  const selectedPlan = plans[Math.min(Math.floor(Math.random() * difficulty.pickSpread), Math.max(plans.length - 1, 0))] ?? chooseFallbackPlan(state, playerIndex, cueX, cueY);
  if (!selectedPlan) return null;
  return {
    ...selectedPlan,
    angle: selectedPlan.angle + (Math.random() * 2 - 1) * difficulty.aimNoise,
    power: clamp(selectedPlan.power + (Math.random() * 2 - 1) * difficulty.powerNoise, 0.2, 1),
  };
}

function chooseAiPlacement(state, playerIndex, restrictHeadString) {
  const xStart = PLAY_LEFT + 90;
  const xEnd = restrictHeadString ? HEAD_STRING_X - 20 : PLAY_RIGHT - 120;
  const yStart = PLAY_TOP + 70;
  const yEnd = PLAY_BOTTOM - 70;
  let best = null;

  for (let y = yStart; y <= yEnd; y += 66) {
    for (let x = xStart; x <= xEnd; x += 74) {
      if (!isCuePlacementValid(state, x, y, restrictHeadString)) continue;
      const plan = chooseAiPlan(state, playerIndex, x, y);
      if (!plan) continue;
      const score = plan.score + distance(x, y, HEAD_STRING_X - 80, TABLE_CENTER_Y) * 0.1;
      if (!best || score < best.score) {
        best = { x, y, score };
      }
    }
  }

  if (best) return best;
  return findNearestPlacement(state, restrictHeadString ? HEAD_STRING_X - 90 : PLAY_LEFT + 120, TABLE_CENTER_Y, restrictHeadString);
}

function assignGroup(state, playerIndex, group) {
  if (!group) return;
  state.players[playerIndex].group = group;
  state.players[1 - playerIndex].group = group === "solids" ? "stripes" : "solids";
  state.tableOpen = false;
  addLog(state, `${state.players[playerIndex].name} toma ${groupLabel(group)}.`);
}

function setTurnFoulCount(state, playerIndex, foul) {
  if (state.modeKey !== "nine-ball") return;
  state.players[playerIndex].foulsInRow = foul ? state.players[playerIndex].foulsInRow + 1 : 0;
}

function startShot(state, angle, power) {
  const cueBall = getCueBall(state);
  if (!cueBall || cueBall.pocketed) return false;
  if (!(state.phase === "aim" || state.phase === "placing")) return false;
  if (state.currentPlayer !== PLAYER_HUMAN) return false;
  if (state.phase === "placing") {
    state.phase = "aim";
  }
  if (needsPocketCall(state, state.currentPlayer) && !state.calledPocketId) {
    addLog(state, "Elige una tronera para cantar la 8 antes de tirar.");
    return false;
  }

  const speed = lerp(300, state.breakShot ? 1700 : 1460, clamp(power, 0.18, 1));
  cueBall.vx = Math.cos(angle) * speed;
  cueBall.vy = Math.sin(angle) * speed;
  state.phase = "moving";
  state.shotCount += 1;
  state.shot = {
    playerIndex: state.currentPlayer,
    breakShot: state.breakShot,
    startTableOpen: state.tableOpen,
    requiredFirstNumber: getLegalNumbers(state, state.currentPlayer)[0] ?? null,
    shooterGroup: state.players[state.currentPlayer].group,
    canShootBlack: needsPocketCall(state, state.currentPlayer),
    calledPocketId: state.calledPocketId,
    firstHitBallId: null,
    railAfterContact: false,
    breakRailContacts: new Set(),
    pocketedIds: [],
    cuePocketed: false,
  };
  addLog(state, `${state.players[state.currentPlayer].name} ejecuta el tiro.`);
  return true;
}
function switchTurn(state, ballInHand, restrictHeadString, reason) {
  state.breakShot = false;
  state.currentPlayer = state.currentPlayer === PLAYER_HUMAN ? PLAYER_AI : PLAYER_HUMAN;
  state.ballInHand = { active: ballInHand, restrictHeadString };
  if (ballInHand) {
    prepareCueBallForPlacement(state, restrictHeadString);
  }
  if (reason) addLog(state, reason);
  moveToTurnStart(state);
}

function continueTurn(state, reason) {
  state.breakShot = false;
  state.ballInHand = { active: false, restrictHeadString: false };
  if (reason) addLog(state, reason);
  moveToTurnStart(state);
}

function finishRack(state, winnerIndex, reason) {
  state.players[winnerIndex].racksWon += 1;
  state.rackWinner = winnerIndex;
  state.ballInHand = { active: false, restrictHeadString: false };
  state.calledPocketId = null;
  addLog(state, reason);
  if (state.players[winnerIndex].racksWon >= state.raceTo) {
    state.matchWinner = winnerIndex;
    state.phase = "match-over";
  } else {
    state.phase = "rack-over";
  }
}

function evaluateShot(state) {
  const shot = state.shot;
  if (!shot) return;
  state.shot = null;

  const shooterIndex = shot.playerIndex;
  const opponentIndex = shooterIndex === PLAYER_HUMAN ? PLAYER_AI : PLAYER_HUMAN;
  const shooter = state.players[shooterIndex];
  const firstHitBall = shot.firstHitBallId ? getBallById(state, shot.firstHitBallId) : null;
  const pocketedBalls = shot.pocketedIds.map((ballId) => getBallById(state, ballId)).filter(Boolean);
  const objectPocketed = pocketedBalls.filter((ball) => ball.number > 0);
  const pocketedEight = pocketedBalls.find((ball) => ball.number === 8) ?? null;
  const pocketedNine = pocketedBalls.find((ball) => ball.number === 9) ?? null;
  let foulReason = null;

  if (shot.cuePocketed) {
    foulReason = "Scratch: la blanca cae en tronera.";
  }
  if (!firstHitBall) {
    foulReason = foulReason ?? "Falta: no hubo contacto con una bola objetiva.";
  }

  if (state.modeKey === "nine-ball") {
    const requiredFirst = shot.requiredFirstNumber ?? 9;
    if (firstHitBall && firstHitBall.number !== requiredFirst) {
      foulReason = foulReason ?? `Falta: primero debias tocar la ${requiredFirst}.`;
    }
  } else if (firstHitBall) {
    if (shot.canShootBlack) {
      if (firstHitBall.number !== 8) {
        foulReason = foulReason ?? "Falta: con mesa resuelta debes tocar primero la 8.";
      }
    } else if (shot.startTableOpen) {
      if (firstHitBall.number === 8) {
        foulReason = foulReason ?? "Falta: con mesa abierta no puedes tocar primero la 8.";
      }
    } else if (shooter.group && !ballMatchesGroup(firstHitBall, shooter.group)) {
      foulReason = foulReason ?? `Falta: debias tocar primero una ${groupLabel(shooter.group)}.`;
    }
  }

  if (objectPocketed.length === 0 && !shot.railAfterContact) {
    foulReason = foulReason ?? "Falta: ninguna bola toco banda tras el contacto.";
  }

  if (shot.breakShot && objectPocketed.length === 0 && shot.breakRailContacts.size < 4) {
    foulReason = foulReason ?? "Saque ilegal: menos de cuatro bolas objetivas tocaron banda.";
  }

  if (state.modeKey === "eight-ball") {
    if (pocketedEight) {
      if (shot.breakShot) {
        respotBall(state, 8);
        addLog(state, "La 8 se recoloca tras el saque.");
      } else {
        const correctPocket = shot.calledPocketId && pocketedEight.lastPocketId === shot.calledPocketId;
        if (!shot.canShootBlack || foulReason || !correctPocket) {
          finishRack(state, opponentIndex, `${state.players[opponentIndex].name} gana: 8 ilegal o en tronera incorrecta.`);
          return;
        }
        finishRack(state, shooterIndex, `${shooter.name} cierra la 8 en ${POCKETS.find((pocket) => pocket.id === shot.calledPocketId)?.label ?? "tronera cantada"}.`);
        return;
      }
    }

    if (!foulReason && shot.startTableOpen && !shot.breakShot) {
      const firstScoringBall = objectPocketed.find((ball) => ball.number !== 8);
      if (firstScoringBall && !shooter.group) {
        assignGroup(state, shooterIndex, ballGroupFromNumber(firstScoringBall.number));
      }
    }

    if (foulReason) {
      switchTurn(state, true, false, foulReason);
      return;
    }

    setTurnFoulCount(state, shooterIndex, false);
    const activeGroup = state.players[shooterIndex].group;
    const ownPocketed = activeGroup
      ? objectPocketed.filter((ball) => ballMatchesGroup(ball, activeGroup)).length
      : 0;

    if (ownPocketed > 0) {
      continueTurn(state, `${shooter.name} sigue en mesa con ${ownPocketed} bola(s) de su grupo.`);
      return;
    }

    switchTurn(state, false, false, `${state.players[opponentIndex].name} entra a mesa.`);
    return;
  }

  if (pocketedNine && foulReason) {
    respotBall(state, 9);
  }

  if (foulReason) {
    setTurnFoulCount(state, shooterIndex, true);
    if (state.players[shooterIndex].foulsInRow >= 3) {
      finishRack(state, opponentIndex, `${state.players[opponentIndex].name} gana por tres faltas consecutivas.`);
      return;
    }
    const warning = state.players[shooterIndex].foulsInRow === 2
      ? ` ${shooter.name} queda avisado con dos faltas seguidas.`
      : "";
    switchTurn(state, true, false, `${foulReason}${warning}`);
    return;
  }

  setTurnFoulCount(state, shooterIndex, false);
  if (pocketedNine) {
    finishRack(state, shooterIndex, `${shooter.name} emboca la 9 y gana el rack.`);
    return;
  }
  if (objectPocketed.length > 0) {
    continueTurn(state, `${shooter.name} mantiene la entrada.`);
    return;
  }
  switchTurn(state, false, false, `${state.players[opponentIndex].name} toma el turno.`);
}

function markRailContact(state, ball) {
  if (!state.shot) return;
  if (state.shot.firstHitBallId) {
    state.shot.railAfterContact = true;
  }
  if (state.shot.breakShot && ball.number > 0) {
    state.shot.breakRailContacts.add(ball.id);
  }
}

function pocketBall(state, ball, pocketId) {
  if (ball.pocketed) return;
  ball.pocketed = true;
  ball.vx = 0;
  ball.vy = 0;
  ball.lastPocketId = pocketId;
  if (state.shot) {
    state.shot.pocketedIds.push(ball.id);
    if (ball.id === "cue") {
      state.shot.cuePocketed = true;
    } else {
      state.shot.railAfterContact = true;
    }
  }
}

function rayCircleIntersection(originX, originY, dirX, dirY, centerX, centerY, radius) {
  const ox = originX - centerX;
  const oy = originY - centerY;
  const b = 2 * (ox * dirX + oy * dirY);
  const c = ox * ox + oy * oy - radius * radius;
  const discriminant = b * b - 4 * c;
  if (discriminant < 0) return null;
  const root = Math.sqrt(discriminant);
  const t1 = (-b - root) / 2;
  const t2 = (-b + root) / 2;
  if (t1 > 0) return t1;
  if (t2 > 0) return t2;
  return null;
}

function getAimPreview(state) {
  const cueBall = getCueBall(state);
  if (!cueBall || cueBall.pocketed) return null;
  const dirX = Math.cos(state.cueControl.angle);
  const dirY = Math.sin(state.cueControl.angle);
  let hit = null;

  state.balls.forEach((ball) => {
    if (ball.id === "cue" || ball.pocketed) return;
    const t = rayCircleIntersection(cueBall.x, cueBall.y, dirX, dirY, ball.x, ball.y, BALL_DIAMETER * 0.96);
    if (t != null && (!hit || t < hit.t)) {
      hit = { t, ball };
    }
  });

  const tBounds = [];
  if (dirX > 0) tBounds.push((PLAY_RIGHT - cueBall.x) / dirX);
  if (dirX < 0) tBounds.push((PLAY_LEFT - cueBall.x) / dirX);
  if (dirY > 0) tBounds.push((PLAY_BOTTOM - cueBall.y) / dirY);
  if (dirY < 0) tBounds.push((PLAY_TOP - cueBall.y) / dirY);
  const wallT = tBounds.filter((value) => value > 0).sort((a, b) => a - b)[0] ?? 160;
  const distanceToUse = hit ? Math.min(hit.t, wallT) : wallT;
  return {
    x1: cueBall.x,
    y1: cueBall.y,
    x2: cueBall.x + dirX * distanceToUse,
    y2: cueBall.y + dirY * distanceToUse,
    hitBall: hit?.ball ?? null,
  };
}

function updatePhysics(state, dt) {
  const activeBalls = getActiveBalls(state);
  activeBalls.forEach((ball) => {
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
  });

  for (const ball of activeBalls) {
    const pocket = POCKETS.find((entry) => distance(ball.x, ball.y, entry.x, entry.y) < entry.radius - (ball.id === "cue" ? 3 : 1));
    if (pocket) {
      pocketBall(state, ball, pocket.id);
      continue;
    }

    const nearCornerY = Math.abs(ball.y - PLAY_TOP) < 48 || Math.abs(ball.y - PLAY_BOTTOM) < 48;
    if (ball.x - BALL_RADIUS <= PLAY_LEFT && !nearCornerY) {
      ball.x = PLAY_LEFT + BALL_RADIUS;
      ball.vx = Math.abs(ball.vx) * RESTITUTION;
      markRailContact(state, ball);
    }
    if (ball.x + BALL_RADIUS >= PLAY_RIGHT && !nearCornerY) {
      ball.x = PLAY_RIGHT - BALL_RADIUS;
      ball.vx = -Math.abs(ball.vx) * RESTITUTION;
      markRailContact(state, ball);
    }

    const nearCornerX = Math.abs(ball.x - PLAY_LEFT) < 52 || Math.abs(ball.x - PLAY_RIGHT) < 52;
    const nearSideX = Math.abs(ball.x - TABLE_CENTER_X) < 42;
    if (ball.y - BALL_RADIUS <= PLAY_TOP && !(nearCornerX || nearSideX)) {
      ball.y = PLAY_TOP + BALL_RADIUS;
      ball.vy = Math.abs(ball.vy) * RESTITUTION;
      markRailContact(state, ball);
    }
    if (ball.y + BALL_RADIUS >= PLAY_BOTTOM && !(nearCornerX || nearSideX)) {
      ball.y = PLAY_BOTTOM - BALL_RADIUS;
      ball.vy = -Math.abs(ball.vy) * RESTITUTION;
      markRailContact(state, ball);
    }
  }

  for (let i = 0; i < activeBalls.length; i += 1) {
    const ballA = activeBalls[i];
    if (ballA.pocketed) continue;
    for (let j = i + 1; j < activeBalls.length; j += 1) {
      const ballB = activeBalls[j];
      if (ballB.pocketed) continue;
      const dx = ballB.x - ballA.x;
      const dy = ballB.y - ballA.y;
      const distanceBetween = Math.hypot(dx, dy);
      if (distanceBetween <= 0 || distanceBetween >= BALL_DIAMETER) continue;

      const nx = dx / distanceBetween;
      const ny = dy / distanceBetween;
      const overlap = BALL_DIAMETER - distanceBetween;
      ballA.x -= nx * overlap * 0.5;
      ballA.y -= ny * overlap * 0.5;
      ballB.x += nx * overlap * 0.5;
      ballB.y += ny * overlap * 0.5;

      const relativeVelocity = (ballB.vx - ballA.vx) * nx + (ballB.vy - ballA.vy) * ny;
      if (relativeVelocity < 0) {
        const impulse = -(1 + RESTITUTION) * relativeVelocity * 0.5;
        ballA.vx -= impulse * nx;
        ballA.vy -= impulse * ny;
        ballB.vx += impulse * nx;
        ballB.vy += impulse * ny;
      }

      if (state.shot && !state.shot.firstHitBallId) {
        if (ballA.id === "cue" && ballB.number > 0) {
          state.shot.firstHitBallId = ballB.id;
        }
        if (ballB.id === "cue" && ballA.number > 0) {
          state.shot.firstHitBallId = ballA.id;
        }
      }
    }
  }

  state.balls.forEach((ball) => {
    if (ball.pocketed) return;
    const speed = Math.hypot(ball.vx, ball.vy);
    if (speed <= STOP_SPEED) {
      ball.vx = 0;
      ball.vy = 0;
      return;
    }
    const nextSpeed = Math.max(0, speed - ROLL_DECEL * dt);
    const ratio = nextSpeed / speed;
    ball.vx *= ratio;
    ball.vy *= ratio;
  });

  const allStopped = state.balls.every((ball) => ball.pocketed || Math.hypot(ball.vx, ball.vy) <= STOP_SPEED);
  if (allStopped) {
    state.balls.forEach((ball) => {
      ball.vx = 0;
      ball.vy = 0;
    });
    evaluateShot(state);
  }
}

function updateAi(state, dt) {
  state.aiTimerMs -= dt * 1000;
  if (state.aiTimerMs > 0) return;

  const cueBall = getCueBall(state);
  if (!cueBall) return;

  if (state.ballInHand.active) {
    const placement = chooseAiPlacement(state, state.currentPlayer, state.ballInHand.restrictHeadString);
    cueBall.x = placement.x;
    cueBall.y = placement.y;
    cueBall.pocketed = false;
    cueBall.vx = 0;
    cueBall.vy = 0;
    state.ballInHand = { active: false, restrictHeadString: false };
  }

  if (needsPocketCall(state, state.currentPlayer) && !state.calledPocketId) {
    const planForCall = chooseAiPlan(state, state.currentPlayer, cueBall.x, cueBall.y);
    state.calledPocketId = planForCall?.pocketId ?? POCKETS[0].id;
  }

  const plan = chooseAiPlan(state, state.currentPlayer, cueBall.x, cueBall.y);
  if (!plan) {
    switchTurn(state, false, false, "La IA no encontro tiro claro y cede la mesa.");
    return;
  }

  state.cueControl.angle = plan.angle;
  state.cueControl.power = plan.power;
  const speed = lerp(280, state.breakShot ? 1700 : 1460, clamp(plan.power, 0.18, 1));
  cueBall.vx = Math.cos(plan.angle) * speed;
  cueBall.vy = Math.sin(plan.angle) * speed;
  state.phase = "moving";
  state.shot = {
    playerIndex: state.currentPlayer,
    breakShot: state.breakShot,
    startTableOpen: state.tableOpen,
    requiredFirstNumber: getLegalNumbers(state, state.currentPlayer)[0] ?? null,
    shooterGroup: state.players[state.currentPlayer].group,
    canShootBlack: needsPocketCall(state, state.currentPlayer),
    calledPocketId: state.calledPocketId,
    firstHitBallId: null,
    railAfterContact: false,
    breakRailContacts: new Set(),
    pocketedIds: [],
    cuePocketed: false,
  };
  addLog(state, `${state.players[state.currentPlayer].name} tira ${plan.type === "pot" ? "a tronera" : "de seguridad"}.`);
}

function advanceSimulation(state, milliseconds) {
  const safeMs = clamp(milliseconds, 0, 4000);
  let remaining = safeMs / 1000;
  while (remaining > 0) {
    const step = Math.min(FIXED_DT, remaining);
    if (state.phase === "moving") {
      updatePhysics(state, step);
    } else if (state.phase === "ai-thinking") {
      updateAi(state, step);
    }
    remaining -= step;
  }
}
function drawTable(ctx, state, preview, placementGhost) {
  ctx.clearRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

  const ambient = ctx.createLinearGradient(0, 0, 0, TABLE_HEIGHT);
  ambient.addColorStop(0, "#2a180e");
  ambient.addColorStop(1, "#140d07");
  ctx.fillStyle = ambient;
  ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

  const wood = ctx.createLinearGradient(0, 0, TABLE_WIDTH, TABLE_HEIGHT);
  wood.addColorStop(0, "#8b5a2b");
  wood.addColorStop(0.45, "#5f3417");
  wood.addColorStop(1, "#3c2213");
  ctx.fillStyle = wood;
  drawRoundedRect(ctx, 28, 24, TABLE_WIDTH - 56, TABLE_HEIGHT - 48, 34);
  ctx.fill();

  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  drawRoundedRect(ctx, 48, 44, TABLE_WIDTH - 96, TABLE_HEIGHT - 88, 26);
  ctx.fill();

  const felt = ctx.createLinearGradient(PLAY_LEFT, PLAY_TOP, PLAY_RIGHT, PLAY_BOTTOM);
  felt.addColorStop(0, "#0d7f55");
  felt.addColorStop(0.5, "#0f6f4c");
  felt.addColorStop(1, "#09593d");
  ctx.fillStyle = felt;
  drawRoundedRect(ctx, PLAY_LEFT - 10, PLAY_TOP - 10, PLAY_RIGHT - PLAY_LEFT + 20, PLAY_BOTTOM - PLAY_TOP + 20, 24);
  ctx.fill();

  const sheen = ctx.createRadialGradient(TABLE_CENTER_X - 120, TABLE_CENTER_Y - 90, 40, TABLE_CENTER_X, TABLE_CENTER_Y, 360);
  sheen.addColorStop(0, "rgba(255, 255, 255, 0.12)");
  sheen.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(PLAY_LEFT - 10, PLAY_TOP - 10, PLAY_RIGHT - PLAY_LEFT + 20, PLAY_BOTTOM - PLAY_TOP + 20);

  ctx.strokeStyle = "rgba(229, 231, 235, 0.15)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(HEAD_STRING_X, PLAY_TOP + 18);
  ctx.lineTo(HEAD_STRING_X, PLAY_BOTTOM - 18);
  ctx.stroke();

  ctx.fillStyle = "rgba(248, 250, 252, 0.34)";
  ctx.beginPath();
  ctx.arc(FOOT_SPOT_X, TABLE_CENTER_Y, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(HEAD_STRING_X, TABLE_CENTER_Y, 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(250, 204, 21, 0.52)";
  for (let i = 1; i <= 7; i += 1) {
    const x = PLAY_LEFT + ((PLAY_RIGHT - PLAY_LEFT) / 8) * i;
    const yTop = PLAY_TOP - 24;
    const yBottom = PLAY_BOTTOM + 24;
    ctx.beginPath();
    ctx.moveTo(x, yTop - 5);
    ctx.lineTo(x + 5, yTop);
    ctx.lineTo(x, yTop + 5);
    ctx.lineTo(x - 5, yTop);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, yBottom - 5);
    ctx.lineTo(x + 5, yBottom);
    ctx.lineTo(x, yBottom + 5);
    ctx.lineTo(x - 5, yBottom);
    ctx.closePath();
    ctx.fill();
  }

  POCKETS.forEach((pocket) => {
    const selected = state.calledPocketId === pocket.id;
    ctx.beginPath();
    ctx.fillStyle = selected ? "#fde68a" : "#05080f";
    ctx.arc(pocket.x, pocket.y, pocket.radius, 0, Math.PI * 2);
    ctx.fill();
    if (selected) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(250, 204, 21, 0.8)";
      ctx.lineWidth = 3;
      ctx.arc(pocket.x, pocket.y, pocket.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  });

  if (preview) {
    const legal = preview.hitBall ? getLegalNumbers(state, state.currentPlayer).includes(preview.hitBall.number) : false;
    ctx.strokeStyle = legal ? "rgba(125, 211, 252, 0.86)" : "rgba(248, 113, 113, 0.72)";
    ctx.lineWidth = 2.4;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(preview.x1, preview.y1);
    ctx.lineTo(preview.x2, preview.y2);
    ctx.stroke();
    ctx.setLineDash([]);
    if (preview.hitBall) {
      ctx.beginPath();
      ctx.strokeStyle = legal ? "rgba(125, 211, 252, 0.9)" : "rgba(248, 113, 113, 0.82)";
      ctx.lineWidth = 2;
      ctx.arc(preview.hitBall.x, preview.hitBall.y, BALL_RADIUS + 6, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  if (placementGhost) {
    ctx.save();
    ctx.globalAlpha = placementGhost.valid ? 0.58 : 0.32;
    ctx.fillStyle = placementGhost.valid ? "#f8fafc" : "#f87171";
    ctx.beginPath();
    ctx.arc(placementGhost.x, placementGhost.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const activeBalls = state.balls.filter((ball) => !ball.pocketed).sort((a, b) => {
    if (a.id === "cue") return -1;
    if (b.id === "cue") return 1;
    return a.number - b.number;
  });

  activeBalls.forEach((ball) => {
    ctx.fillStyle = "rgba(15, 23, 42, 0.28)";
    ctx.beginPath();
    ctx.ellipse(ball.x + 3, ball.y + 5, BALL_RADIUS * 0.96, BALL_RADIUS * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();

    if (ball.id === "cue") {
      const cueGradient = ctx.createRadialGradient(ball.x - 4, ball.y - 5, 2, ball.x, ball.y, BALL_RADIUS + 3);
      cueGradient.addColorStop(0, "#ffffff");
      cueGradient.addColorStop(1, "#d7dee8");
      ctx.fillStyle = cueGradient;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(100, 116, 139, 0.7)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      return;
    }

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = ball.stripe ? "#f8fafc" : ball.color;
    ctx.fill();

    if (ball.stripe) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = ball.color;
      ctx.fillRect(ball.x - BALL_RADIUS, ball.y - BALL_RADIUS * 0.48, BALL_DIAMETER, BALL_RADIUS * 0.96);
      ctx.restore();
    }

    const glossy = ctx.createRadialGradient(ball.x - 3, ball.y - 4, 1, ball.x, ball.y, BALL_RADIUS + 2);
    glossy.addColorStop(0, "rgba(255, 255, 255, 0.42)");
    glossy.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glossy;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(15, 23, 42, 0.32)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS * 0.46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.font = `${ball.number >= 10 ? 8 : 9}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(ball.number), ball.x, ball.y + 0.5);
  });

  const cueBall = getCueBall(state);
  if ((state.phase === "aim" || state.phase === "placing") && cueBall && !cueBall.pocketed) {
    const backAngle = state.cueControl.angle + Math.PI;
    const cueLength = 162 + state.cueControl.power * 118;
    const startX = cueBall.x + Math.cos(backAngle) * (BALL_RADIUS + 8 + state.cueControl.power * 14);
    const startY = cueBall.y + Math.sin(backAngle) * (BALL_RADIUS + 8 + state.cueControl.power * 14);
    const endX = cueBall.x + Math.cos(backAngle) * cueLength;
    const endY = cueBall.y + Math.sin(backAngle) * cueLength;
    const cueGradient = ctx.createLinearGradient(startX, startY, endX, endY);
    cueGradient.addColorStop(0, "#f4d3a2");
    cueGradient.addColorStop(0.5, "#bb7a37");
    cueGradient.addColorStop(1, "#5b3415");
    ctx.strokeStyle = cueGradient;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
}

function buildSnapshot(state) {
  const cueBall = getCueBall(state);
  const legalNumbers = getLegalNumbers(state, state.currentPlayer);
  return {
    mode: "billiards_pool",
    variant: state.modeKey,
    status: state.phase,
    coordinates: "origin_top_left_x_right_y_down_table_pixels",
    modeLabel: MODE_PRESETS[state.modeKey].label,
    difficultyKey: state.difficultyKey,
    difficultyLabel: DIFFICULTY_PRESETS[state.difficultyKey].label,
    raceTo: state.raceTo,
    currentPlayer: state.currentPlayer,
    currentPlayerName: state.players[state.currentPlayer]?.name ?? "-",
    breakerIndex: state.breakerIndex,
    nextBreaker: state.nextBreaker,
    tableOpen: state.tableOpen,
    breakShot: state.breakShot,
    ballInHand: state.ballInHand.active,
    restrictHeadString: state.ballInHand.restrictHeadString,
    calledPocketId: state.calledPocketId,
    calledPocketLabel: POCKETS.find((pocket) => pocket.id === state.calledPocketId)?.label ?? null,
    needsPocketCall: needsPocketCall(state, state.currentPlayer),
    legalTargets: legalNumbers,
    lowestBall: getLowestNumber(state),
    cueControl: {
      angleRadians: state.cueControl.angle,
      angleDegrees: Math.round((state.cueControl.angle * 180) / Math.PI),
      power: Number(state.cueControl.power.toFixed(2)),
    },
    players: state.players.map((player, index) => ({
      name: player.name,
      type: player.type,
      group: player.group,
      groupLabel: groupLabel(player.group),
      remainingGroupBalls: countRemainingGroupBalls(state, index),
      racksWon: player.racksWon,
      foulsInRow: player.foulsInRow,
    })),
    cueBall: cueBall
      ? {
          x: Number(cueBall.x.toFixed(1)),
          y: Number(cueBall.y.toFixed(1)),
          vx: Number(cueBall.vx.toFixed(1)),
          vy: Number(cueBall.vy.toFixed(1)),
          pocketed: cueBall.pocketed,
        }
      : null,
    balls: state.balls
      .filter((ball) => ball.number > 0)
      .map((ball) => ({
        id: ball.id,
        number: ball.number,
        group: ballGroupFromNumber(ball.number),
        x: Number(ball.x.toFixed(1)),
        y: Number(ball.y.toFixed(1)),
        vx: Number(ball.vx.toFixed(1)),
        vy: Number(ball.vy.toFixed(1)),
        pocketed: ball.pocketed,
        lastPocketId: ball.lastPocketId,
      })),
    rackWinner: state.rackWinner,
    matchWinner: state.matchWinner,
    shotCount: state.shotCount,
    message: state.message,
    log: state.log,
    controls: {
      keyboard: "Mouse aims, A/D rotate, W/S power, Space shoots, R repeats rack, N next rack, F fullscreen",
      mouse: "Move to aim, click table to place cue ball when you have ball in hand",
      touch: "Use on-screen aim/power buttons and Shoot",
    },
  };
}

function eventToWorld(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const source = event.touches?.[0] ?? event.changedTouches?.[0] ?? event;
  if (!source) return null;
  return {
    x: ((source.clientX - rect.left) / rect.width) * TABLE_WIDTH,
    y: ((source.clientY - rect.top) / rect.height) * TABLE_HEIGHT,
  };
}

function createRuntime({ canvas, onSnapshot, onFullscreenRequest }) {
  const ctx = canvas.getContext("2d");
  const runtime = {
    canvas,
    ctx,
    state: createRuntimeState(),
    pointer: { x: TABLE_CENTER_X, y: TABLE_CENTER_Y, active: false },
    lastFrame: 0,
    rafId: 0,
    publish() {
      onSnapshot(buildSnapshot(this.state));
    },
    draw() {
      const preview = (this.state.phase === "aim" || this.state.phase === "placing") ? getAimPreview(this.state) : null;
      const placementGhost = this.state.phase === "placing" && this.pointer.active
        ? {
            x: this.pointer.x,
            y: this.pointer.y,
            valid: isCuePlacementValid(this.state, this.pointer.x, this.pointer.y, this.state.ballInHand.restrictHeadString),
          }
        : null;
      drawTable(ctx, this.state, preview, placementGhost);
    },
    refresh() {
      this.publish();
      this.draw();
    },
    resetToMenu(modeKey = this.state.modeKey, difficultyKey = this.state.difficultyKey) {
      this.state = createRuntimeState(modeKey, difficultyKey);
      this.refresh();
    },
    startMatch() {
      const nextState = createRuntimeState(this.state.modeKey, this.state.difficultyKey);
      startRack(nextState, PLAYER_HUMAN);
      this.state = nextState;
      this.refresh();
    },
    restartRack() {
      if (this.state.phase === "menu") {
        this.startMatch();
        return;
      }
      const wins = cloneWins(this.state.players);
      const nextState = createRuntimeState(this.state.modeKey, this.state.difficultyKey);
      nextState.players.forEach((player, index) => {
        player.racksWon = wins[index];
      });
      startRack(nextState, this.state.breakerIndex);
      this.state = nextState;
      this.refresh();
    },
    nextRack() {
      if (!(this.state.phase === "rack-over" || this.state.phase === "match-over")) return;
      if (this.state.phase === "match-over") {
        this.resetToMenu();
        return;
      }
      const wins = cloneWins(this.state.players);
      const nextState = createRuntimeState(this.state.modeKey, this.state.difficultyKey);
      nextState.players.forEach((player, index) => {
        player.racksWon = wins[index];
      });
      startRack(nextState, this.state.nextBreaker);
      this.state = nextState;
      this.refresh();
    },
    setMode(modeKey) {
      if (!MODE_PRESETS[modeKey]) return;
      this.resetToMenu(modeKey, this.state.difficultyKey);
    },
    setDifficulty(difficultyKey) {
      if (!DIFFICULTY_PRESETS[difficultyKey]) return;
      this.state.difficultyKey = difficultyKey;
      this.state.players[PLAYER_AI].name = `IA ${DIFFICULTY_PRESETS[difficultyKey].label}`;
      if (this.state.phase === "menu") {
        addLog(this.state, `Dificultad ${DIFFICULTY_PRESETS[difficultyKey].label}.`);
      }
      this.refresh();
    },
    setCalledPocket(pocketId) {
      if (!POCKETS.some((pocket) => pocket.id === pocketId)) return;
      this.state.calledPocketId = pocketId;
      addLog(this.state, `Tronera cantada: ${POCKETS.find((pocket) => pocket.id === pocketId)?.label}.`);
      this.refresh();
    },
    adjustAim(delta) {
      if (this.state.phase !== "aim") return;
      this.state.cueControl.angle = normalizeAngle(this.state.cueControl.angle + delta);
      this.refresh();
    },
    adjustPower(delta) {
      if (!(this.state.phase === "aim" || this.state.phase === "placing")) return;
      this.state.cueControl.power = clamp(this.state.cueControl.power + delta, 0.18, 1);
      this.refresh();
    },
    autoPlaceCueBall() {
      if (!this.state.ballInHand.active || this.state.currentPlayer !== PLAYER_HUMAN) return;
      prepareCueBallForPlacement(this.state, this.state.ballInHand.restrictHeadString);
      this.state.ballInHand = { active: false, restrictHeadString: false };
      this.state.phase = "aim";
      setCueControlForTurn(this.state);
      addLog(this.state, "Blanca colocada automaticamente.");
      this.refresh();
    },
    shoot() {
      const didShoot = startShot(this.state, this.state.cueControl.angle, this.state.cueControl.power);
      if (didShoot) {
        this.refresh();
      } else {
        this.draw();
      }
    },
    setPointer(worldPoint) {
      if (!worldPoint) return;
      this.pointer = { ...worldPoint, active: true };
      if (this.state.currentPlayer === PLAYER_HUMAN && this.state.phase === "aim") {
        const cueBall = getCueBall(this.state);
        if (cueBall) {
          this.state.cueControl.angle = Math.atan2(worldPoint.y - cueBall.y, worldPoint.x - cueBall.x);
          this.refresh();
          return;
        }
      }
      this.draw();
    },
    placeCueFromPointer(worldPoint) {
      if (!worldPoint || this.state.currentPlayer !== PLAYER_HUMAN || this.state.phase !== "placing") return;
      if (!isCuePlacementValid(this.state, worldPoint.x, worldPoint.y, this.state.ballInHand.restrictHeadString)) {
        addLog(this.state, "Posicion invalida para la blanca.");
        this.refresh();
        return;
      }
      const cueBall = getCueBall(this.state);
      if (!cueBall) return;
      cueBall.x = worldPoint.x;
      cueBall.y = worldPoint.y;
      cueBall.pocketed = false;
      cueBall.vx = 0;
      cueBall.vy = 0;
      this.state.ballInHand = { active: false, restrictHeadString: false };
      this.state.phase = "aim";
      setCueControlForTurn(this.state);
      addLog(this.state, "Blanca en mano colocada.");
      this.refresh();
    },
    setFullscreenState(isFullscreen) {
      this.state.fullscreen = Boolean(isFullscreen);
      this.publish();
      this.draw();
    },
    handleKeyDown(event) {
      if (event.target && ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(event.target.tagName)) {
        return;
      }
      if (event.code === "KeyF") {
        onFullscreenRequest?.();
        event.preventDefault();
        return;
      }
      if (event.code === "KeyR") {
        this.restartRack();
        event.preventDefault();
        return;
      }
      if (event.code === "KeyN") {
        this.nextRack();
        event.preventDefault();
        return;
      }
      if (this.state.phase === "menu" && (event.code === "Enter" || event.code === "Space")) {
        this.startMatch();
        event.preventDefault();
        return;
      }
      if (this.state.phase === "placing" && event.code === "KeyP") {
        this.autoPlaceCueBall();
        event.preventDefault();
        return;
      }
      if (this.state.phase !== "aim") return;
      switch (event.code) {
        case "ArrowLeft":
        case "KeyA":
          this.adjustAim(-AIM_STEP);
          event.preventDefault();
          break;
        case "ArrowRight":
        case "KeyD":
          this.adjustAim(AIM_STEP);
          event.preventDefault();
          break;
        case "ArrowUp":
        case "KeyW":
          this.adjustPower(POWER_STEP);
          event.preventDefault();
          break;
        case "ArrowDown":
        case "KeyS":
          this.adjustPower(-POWER_STEP);
          event.preventDefault();
          break;
        case "Enter":
        case "Space":
          this.shoot();
          event.preventDefault();
          break;
        default:
      }
    },
    advanceTime(milliseconds) {
      advanceSimulation(this.state, milliseconds);
      this.refresh();
    },
    frame: (timestamp) => {
      const instance = runtime;
      if (!instance.lastFrame) {
        instance.lastFrame = timestamp;
      }
      const deltaMs = clamp(timestamp - instance.lastFrame, 0, MAX_FRAME_MS);
      instance.lastFrame = timestamp;
      if (instance.state.phase === "moving" || instance.state.phase === "ai-thinking") {
        advanceSimulation(instance.state, deltaMs);
        instance.publish();
      }
      instance.draw();
      instance.rafId = requestAnimationFrame(instance.frame);
    },
    start() {
      const move = (event) => {
        const worldPoint = eventToWorld(canvas, event);
        this.setPointer(worldPoint);
      };
      const down = (event) => {
        const worldPoint = eventToWorld(canvas, event);
        this.placeCueFromPointer(worldPoint);
      };
      const wheel = (event) => {
        if (!(this.state.phase === "aim" || this.state.phase === "placing")) return;
        event.preventDefault();
        this.adjustPower(event.deltaY < 0 ? POWER_STEP : -POWER_STEP);
      };
      this._listeners = {
        move,
        down,
        wheel,
        keydown: (event) => this.handleKeyDown(event),
      };
      canvas.addEventListener("mousemove", move);
      canvas.addEventListener("touchmove", move, { passive: true });
      canvas.addEventListener("mousedown", down);
      canvas.addEventListener("touchstart", down, { passive: true });
      canvas.addEventListener("wheel", wheel, { passive: false });
      window.addEventListener("keydown", this._listeners.keydown);
      this.refresh();
      this.rafId = requestAnimationFrame(this.frame);
    },
    destroy() {
      cancelAnimationFrame(this.rafId);
      if (!this._listeners) return;
      canvas.removeEventListener("mousemove", this._listeners.move);
      canvas.removeEventListener("touchmove", this._listeners.move);
      canvas.removeEventListener("mousedown", this._listeners.down);
      canvas.removeEventListener("touchstart", this._listeners.down);
      canvas.removeEventListener("wheel", this._listeners.wheel);
      window.removeEventListener("keydown", this._listeners.keydown);
    },
  };
  return runtime;
}

function createDefaultSnapshot() {
  return buildSnapshot(createRuntimeState());
}

function BilliardsClubGame() {
  const canvasRef = useRef(null);
  const shellRef = useRef(null);
  const runtimeRef = useRef(null);
  const [snapshot, setSnapshot] = useState(createDefaultSnapshot);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const runtime = createRuntime({
      canvas,
      onSnapshot: setSnapshot,
      onFullscreenRequest: () => {
        const shell = shellRef.current;
        if (!shell) return;
        const request = shell.requestFullscreen || shell.webkitRequestFullscreen;
        if (request) request.call(shell);
      },
    });
    runtimeRef.current = runtime;
    runtime.start();
    return () => {
      runtime.destroy();
      runtimeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onChange = () => {
      runtimeRef.current?.setFullscreenState(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  const startMatch = useCallback(() => runtimeRef.current?.startMatch(), []);
  const restartRack = useCallback(() => runtimeRef.current?.restartRack(), []);
  const nextRack = useCallback(() => runtimeRef.current?.nextRack(), []);
  const resetMatch = useCallback(() => runtimeRef.current?.resetToMenu(), []);
  const setMode = useCallback((modeKey) => runtimeRef.current?.setMode(modeKey), []);
  const setDifficulty = useCallback((difficultyKey) => runtimeRef.current?.setDifficulty(difficultyKey), []);
  const setPocket = useCallback((pocketId) => runtimeRef.current?.setCalledPocket(pocketId), []);
  const adjustAim = useCallback((delta) => runtimeRef.current?.adjustAim(delta), []);
  const adjustPower = useCallback((delta) => runtimeRef.current?.adjustPower(delta), []);
  const shoot = useCallback(() => runtimeRef.current?.shoot(), []);
  const autoPlaceCueBall = useCallback(() => runtimeRef.current?.autoPlaceCueBall(), []);
  const requestFullscreen = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const request = shell.requestFullscreen || shell.webkitRequestFullscreen;
    if (request) request.call(shell);
  }, []);

  const advanceTime = useCallback((ms) => runtimeRef.current?.advanceTime(ms), []);
  useGameRuntimeBridge(snapshot, useCallback((state) => state, []), advanceTime);

  const overlayVisible = snapshot.status === "menu" || snapshot.status === "rack-over" || snapshot.status === "match-over";
  const humanTurn = snapshot.currentPlayer === PLAYER_HUMAN;
  const canAim = snapshot.status === "aim" && humanTurn;
  const canPlace = snapshot.status === "placing" && humanTurn;

  return (
    <div className="mini-game billiards-game">
      <div className="mini-head">
        <div>
          <h4>Billar Pool Club</h4>
          <p>Pool arcade-profesional con fisica top-down, modos Bola 8/Bola 9, faltas, blanca en mano e IA tactica.</p>
        </div>
        <div className="billiards-head-actions">
          {snapshot.status === "menu" ? <button id="billiards-start-btn" type="button" onClick={startMatch}>Empezar</button> : null}
          {snapshot.status === "rack-over" ? <button id="billiards-next-rack-btn" type="button" onClick={nextRack}>Siguiente rack</button> : null}
          <button type="button" onClick={restartRack}>Repetir rack</button>
          <button type="button" onClick={resetMatch}>Nuevo match</button>
          <button id="billiards-fullscreen-btn" type="button" onClick={requestFullscreen}>Pantalla completa</button>
        </div>
      </div>

      <div className="billiards-toolbar">
        <div className="billiards-segment">
          {Object.entries(MODE_PRESETS).map(([modeKey, preset]) => (
            <button
              key={modeKey}
              id={`billiards-mode-${modeKey}`}
              type="button"
              className={snapshot.variant === modeKey ? "active" : ""}
              onClick={() => setMode(modeKey)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="billiards-segment">
          {Object.entries(DIFFICULTY_PRESETS).map(([difficultyKey, preset]) => (
            <button
              key={difficultyKey}
              id={`billiards-difficulty-${difficultyKey}`}
              type="button"
              className={snapshot.difficultyKey === difficultyKey ? "active" : ""}
              onClick={() => setDifficulty(difficultyKey)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="billiards-chipline">
          <span className="hud-pill">Turno: {snapshot.currentPlayerName}</span>
          <span className="hud-pill">Modo: {snapshot.modeLabel}</span>
          <span className="hud-pill">Objetivo: race to {snapshot.raceTo}</span>
          {snapshot.tableOpen ? <span className="hud-pill">Mesa abierta</span> : null}
          {snapshot.ballInHand ? <span className="hud-pill">Blanca en mano</span> : null}
        </div>
      </div>

      <div className="billiards-layout">
        <div className="billiards-stage phaser-canvas-shell" ref={shellRef}>
          <div className="phaser-canvas-host billiards-canvas-host">
            <canvas id="billiards-canvas" ref={canvasRef} width={TABLE_WIDTH} height={TABLE_HEIGHT} className="billiards-canvas" aria-label="Mesa de billar" />
          </div>
          {overlayVisible ? (
            <div className="billiards-overlay">
              {snapshot.status === "menu" ? (
                <>
                  <h5>Billar Pool Club</h5>
                  <p>{MODE_PRESETS[snapshot.variant].summary}</p>
                  <p>Rompe, gestiona faltas, canta la 8 y gana un duelo al mejor de {snapshot.raceTo} racks.</p>
                  <button id="billiards-overlay-start" type="button" onClick={startMatch}>Abrir mesa</button>
                </>
              ) : null}
              {snapshot.status === "rack-over" ? (
                <>
                  <h5>Rack cerrado</h5>
                  <p>{snapshot.message}</p>
                  <button type="button" onClick={nextRack}>Preparar siguiente rack</button>
                </>
              ) : null}
              {snapshot.status === "match-over" ? (
                <>
                  <h5>Match finalizado</h5>
                  <p>{snapshot.message}</p>
                  <button type="button" onClick={resetMatch}>Volver al menu</button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <aside className="billiards-sidepanel">
          <section className="billiards-panel scoreboard">
            <header>
              <span>Marcador</span>
              <strong>{snapshot.players[0]?.racksWon} - {snapshot.players[1]?.racksWon}</strong>
            </header>
            <div className="billiards-score-row">
              {snapshot.players.map((player) => (
                <article key={player.name} className={snapshot.currentPlayerName === player.name ? "active" : ""}>
                  <h6>{player.name}</h6>
                  <p>Grupo: {player.groupLabel}</p>
                  {player.group ? <p>Restantes: {player.remainingGroupBalls}</p> : null}
                  {snapshot.variant === "nine-ball" ? <p>Faltas seguidas: {player.foulsInRow}</p> : null}
                </article>
              ))}
            </div>
          </section>

          <section className="billiards-panel state">
            <header>
              <span>Telemetria</span>
              <strong>{snapshot.status}</strong>
            </header>
            <p>Objetivo legal: {snapshot.legalTargets.length ? snapshot.legalTargets.join(", ") : "-"}</p>
            <p>Potencia: {Math.round(snapshot.cueControl.power * 100)}%</p>
            <p>Angulo: {snapshot.cueControl.angleDegrees}&deg;</p>
            <p>Bola mas baja: {snapshot.lowestBall ?? "-"}</p>
            {snapshot.calledPocketLabel ? <p>Tronera cantada: {snapshot.calledPocketLabel}</p> : null}
          </section>

          {snapshot.needsPocketCall ? (
            <section className="billiards-panel pockets">
              <header>
                <span>Cantar la 8</span>
                <strong>Elige tronera</strong>
              </header>
              <div className="billiards-pocket-grid">
                {POCKETS.map((pocket) => (
                  <button
                    key={pocket.id}
                    id={`billiards-pocket-${pocket.id}`}
                    type="button"
                    className={snapshot.calledPocketId === pocket.id ? "active" : ""}
                    onClick={() => setPocket(pocket.id)}
                  >
                    {pocket.label}
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>

      <div className="billiards-control-deck">
        <div className="billiards-control-group">
          <button id="billiards-aim-left" type="button" onClick={() => adjustAim(-AIM_STEP)} disabled={!canAim}>Aim -</button>
          <button id="billiards-aim-right" type="button" onClick={() => adjustAim(AIM_STEP)} disabled={!canAim}>Aim +</button>
          <button id="billiards-power-minus" type="button" onClick={() => adjustPower(-POWER_STEP)} disabled={!(canAim || canPlace)}>- Potencia</button>
          <button id="billiards-power-plus" type="button" onClick={() => adjustPower(POWER_STEP)} disabled={!(canAim || canPlace)}>+ Potencia</button>
          <button id="billiards-shoot-btn" type="button" onClick={shoot} disabled={!canAim}>Tirar</button>
          <button id="billiards-auto-place" type="button" onClick={autoPlaceCueBall} disabled={!canPlace}>Auto colocar</button>
        </div>
        <div className="billiards-help-copy">
          <span>Raton para apuntar.</span>
          <span>A/D ajustan el taco.</span>
          <span>W/S regulan potencia.</span>
          <span>Space tira.</span>
        </div>
      </div>

      <div className="billiards-log-strip">
        {snapshot.log.map((entry, index) => (
          <span key={`${entry}-${index}`}>{entry}</span>
        ))}
      </div>

      <p className="game-message">{snapshot.message}</p>
    </div>
  );
}

export default BilliardsClubGame;
