import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useGameRuntimeBridge from "../utils/useGameRuntimeBridge";

const OPPONENT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];
const STARTING_STACK_OPTIONS = [80, 120, 160];
const TARGET_OPTIONS_BY_STACK = {
  80: [100, 130, 150],
  120: [150, 180, 220],
  160: [200, 260, 300]
};
const BLIND_LEVELS = {
  slow: { id: "slow", label: "1 / 2", small: 1, big: 2 },
  standard: { id: "standard", label: "2 / 4", small: 2, big: 4 },
  turbo: { id: "turbo", label: "5 / 10", small: 5, big: 10 }
};
const DEFAULT_STARTING_STACK = 120;
const DEFAULT_TARGET_CHIPS = 180;
const DEFAULT_BLIND_LEVEL_ID = "standard";
const MAX_LOGS = 14;
const AUTO_NEXT_MS = 3400;
const HAND_CARDS = 5;
const PHASES = ["pre-bet", "discard", "post-bet"];
const PHASE_LABEL = { "pre-bet": "Apuesta inicial", discard: "Descarte", "post-bet": "Apuesta final" };
const HAND_LABELS = ["Carta mayor", "Pareja", "Dobles parejas", "Trio", "Escalera", "Color", "Full", "Poker", "Escalera de color", "Escalera real"];

const SUITS = [
  { id: "spades", symbol: "\u2660", colorClass: "suit-black" },
  { id: "hearts", symbol: "\u2665", colorClass: "suit-red" },
  { id: "diamonds", symbol: "\u2666", colorClass: "suit-red" },
  { id: "clubs", symbol: "\u2663", colorClass: "suit-black" }
];
const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const RANK_LABEL = { 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "J", 12: "Q", 13: "K", 14: "A" };
const AI_LEVELS = {
  rookie: { id: "rookie", label: "Basica", thinkMs: 520 },
  tactical: { id: "tactical", label: "Tactica", thinkMs: 820 },
  expert: { id: "expert", label: "Experta", thinkMs: 1120 }
};
const RULES_PROMPT = `POKER CLASICO 5 CARTAS (CON APUESTAS)
- Ciegas pequena/grande al inicio de cada mano.
- Ronda de apuesta inicial, descarte, ronda final y showdown.
- Acciones: pasar, igualar, subir, all-in, retirarse.
- Gana el bote la mejor mano o el ultimo jugador que no se retire.
- Meta: alcanzar la meta de fichas o dejar al resto sin stack.`;

const resolveBlindLevel = (id) => BLIND_LEVELS[id] || BLIND_LEVELS[DEFAULT_BLIND_LEVEL_ID];
const resolveTargetOptions = (stack) => TARGET_OPTIONS_BY_STACK[stack] || TARGET_OPTIONS_BY_STACK[DEFAULT_STARTING_STACK];
const ensureTargetForStack = (target, stack) => {
  const options = resolveTargetOptions(stack);
  if (options.includes(target)) return target;
  return options[Math.floor(options.length / 2)] || options[0] || DEFAULT_TARGET_CHIPS;
};
const clampMs = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};
const randomInt = (max) => (max > 0 ? Math.floor(Math.random() * max) : 0);
const appendLog = (logs, line) => [line, ...logs].slice(0, MAX_LOGS);
const cardText = (card) => (card ? `${RANK_LABEL[card.rank]}${card.symbol}` : "--");
const cloneCards = (cards) => cards.map((card) => ({ ...card }));
const emptyDiscardSelection = () => Array.from({ length: HAND_CARDS }, () => false);

const clampPercent = (value, min, max) => Math.max(min, Math.min(max, value));
const seatPosition = (seat, total) => {
  if (seat === 0) return { x: 50, y: 88 };
  const aiCount = Math.max(1, total - 1);
  const index = Math.max(0, seat - 1);
  const startDeg = -168;
  const endDeg = -12;
  const angleDeg = aiCount === 1 ? -90 : startDeg + ((endDeg - startDeg) * index) / (aiCount - 1);
  const angle = (angleDeg * Math.PI) / 180;
  return {
    x: clampPercent(50 + Math.cos(angle) * 39, 9, 91),
    y: clampPercent(50 + Math.sin(angle) * 33, 14, 74)
  };
};

const createDeck = () => {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) deck.push({ id: `${rank}-${suit.id}`, rank, suit: suit.id, symbol: suit.symbol, colorClass: suit.colorClass });
  }
  return deck;
};
const shuffle = (cards) => {
  const next = cloneCards(cards);
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const straightHigh = (ranks) => {
  const uniq = [...new Set(ranks)].sort((a, b) => a - b);
  if (uniq.includes(14)) uniq.unshift(1);
  let run = 1;
  let high = 0;
  for (let i = 1; i < uniq.length; i += 1) {
    if (uniq[i] === uniq[i - 1] + 1) {
      run += 1;
      if (run >= 5) high = uniq[i];
    } else if (uniq[i] !== uniq[i - 1]) {
      run = 1;
    }
  }
  return high;
};

const evalFive = (cards) => {
  const ranks = cards.map((c) => c.rank);
  const counts = new Map();
  for (const rank of ranks) counts.set(rank, (counts.get(rank) || 0) + 1);
  const rows = [...counts.entries()].map(([rank, count]) => ({ rank, count })).sort((a, b) => b.count - a.count || b.rank - a.rank);
  const sorted = [...ranks].sort((a, b) => b - a);
  const flush = cards.every((c) => c.suit === cards[0].suit);
  const sHigh = straightHigh(ranks);
  const royal = flush && sHigh === 14 && [10, 11, 12, 13, 14].every((rank) => ranks.includes(rank));

  if (royal) return { cat: 9, tie: [14], label: HAND_LABELS[9] };
  if (flush && sHigh) return { cat: 8, tie: [sHigh], label: `${HAND_LABELS[8]} al ${RANK_LABEL[sHigh]}` };
  if (rows[0].count === 4) return { cat: 7, tie: [rows[0].rank, rows.find((row) => row.count === 1).rank], label: `${HAND_LABELS[7]} de ${RANK_LABEL[rows[0].rank]}` };
  if (rows[0].count === 3 && rows[1].count === 2) return { cat: 6, tie: [rows[0].rank, rows[1].rank], label: `${HAND_LABELS[6]} ${RANK_LABEL[rows[0].rank]}/${RANK_LABEL[rows[1].rank]}` };
  if (flush) return { cat: 5, tie: sorted, label: `${HAND_LABELS[5]} al ${RANK_LABEL[sorted[0]]}` };
  if (sHigh) return { cat: 4, tie: [sHigh], label: `${HAND_LABELS[4]} al ${RANK_LABEL[sHigh]}` };
  if (rows[0].count === 3) {
    const kickers = rows.filter((row) => row.count === 1).map((row) => row.rank).sort((a, b) => b - a);
    return { cat: 3, tie: [rows[0].rank, ...kickers], label: `${HAND_LABELS[3]} de ${RANK_LABEL[rows[0].rank]}` };
  }
  if (rows[0].count === 2 && rows[1].count === 2) {
    const hi = Math.max(rows[0].rank, rows[1].rank);
    const lo = Math.min(rows[0].rank, rows[1].rank);
    return { cat: 2, tie: [hi, lo, rows.find((row) => row.count === 1).rank], label: `${HAND_LABELS[2]} ${RANK_LABEL[hi]}/${RANK_LABEL[lo]}` };
  }
  if (rows[0].count === 2) {
    const kickers = rows.filter((row) => row.count === 1).map((row) => row.rank).sort((a, b) => b - a);
    return { cat: 1, tie: [rows[0].rank, ...kickers], label: `${HAND_LABELS[1]} de ${RANK_LABEL[rows[0].rank]}` };
  }
  return { cat: 0, tie: sorted, label: `${HAND_LABELS[0]} ${RANK_LABEL[sorted[0]]}` };
};

const compareEval = (a, b) => {
  if (a.cat !== b.cat) return a.cat - b.cat;
  const len = Math.max(a.tie.length, b.tie.length);
  for (let i = 0; i < len; i += 1) {
    const diff = (a.tie[i] || 0) - (b.tie[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
};
const orderFrom = (start, total) => {
  const row = [];
  for (let i = 0; i < total; i += 1) row.push((start + i) % total);
  return row;
};
const queueFrom = (players, start, predicate, exclude = null) => orderFrom(start, players.length).filter((seat) => seat !== exclude && predicate(players[seat]));
const aliveSeats = (players) => players.filter((player) => !player.folded && !player.busted).map((player) => player.seatIndex);
const canActBet = (player) => Boolean(player && !player.folded && !player.busted && !player.allIn && player.chips > 0);
const canActDiscard = (player) => Boolean(player && !player.folded && !player.busted && !player.discarded);
const sanitizeDiscardIndices = (indices) => {
  const unique = new Set();
  for (const value of indices || []) {
    const idx = Number(value);
    if (Number.isInteger(idx) && idx >= 0 && idx < HAND_CARDS) unique.add(idx);
  }
  return [...unique].slice(0, HAND_CARDS).sort((a, b) => a - b);
};
const postWager = (player, amount) => {
  const raw = Math.max(0, Math.floor(Number(amount) || 0));
  const paid = Math.min(player.chips, raw);
  player.chips -= paid;
  player.currentBet += paid;
  player.totalCommitted += paid;
  if (!player.folded && player.chips <= 0) player.allIn = true;
  return paid;
};
const nextSeatWithChips = (players, start) => orderFrom(start, players.length).find((seat) => players[seat]?.chips > 0) ?? null;

const recommendedDiscardIndices = (hand) => {
  if (!hand || hand.length !== HAND_CARDS) return [];
  const value = evalFive(hand);
  if (value.cat >= 4) return [];
  const byRank = new Map();
  hand.forEach((card, index) => {
    const row = byRank.get(card.rank) || [];
    row.push(index);
    byRank.set(card.rank, row);
  });
  const groups = [...byRank.entries()].map(([rank, indices]) => ({ rank, indices, count: indices.length })).sort((a, b) => b.count - a.count || b.rank - a.rank);

  if (value.cat === 3) {
    const keep = new Set(groups.find((group) => group.count === 3)?.indices || []);
    return hand.map((_, index) => index).filter((index) => !keep.has(index));
  }
  if (value.cat === 2) {
    const keep = new Set(groups.filter((group) => group.count === 2).flatMap((group) => group.indices));
    return hand.map((_, index) => index).filter((index) => !keep.has(index));
  }
  if (value.cat === 1) {
    const keep = new Set(groups.find((group) => group.count === 2)?.indices || []);
    return hand.map((_, index) => index).filter((index) => !keep.has(index));
  }

  const sorted = hand.map((card, index) => ({ rank: card.rank, index })).sort((a, b) => b.rank - a.rank);
  const high = sorted.filter((entry) => entry.rank >= 11).slice(0, 2);
  const keep = new Set((high.length ? high : sorted.slice(0, 1)).map((entry) => entry.index));
  return hand.map((_, index) => index).filter((index) => !keep.has(index));
};

const createPlayers = (opponents, stack) => {
  const players = [{
    id: "human-0",
    seatIndex: 0,
    name: "Tu",
    type: "human",
    chips: stack,
    handsWon: 0,
    hand: [],
    folded: false,
    discarded: false,
    discardCount: 0,
    allIn: false,
    busted: false,
    currentBet: 0,
    totalCommitted: 0,
    intent: ""
  }];
  for (let i = 1; i <= opponents; i += 1) {
    players.push({
      id: `ai-${i}`,
      seatIndex: i,
      name: `IA ${i}`,
      type: "ai",
      chips: stack,
      handsWon: 0,
      hand: [],
      folded: false,
      discarded: false,
      discardCount: 0,
      allIn: false,
      busted: false,
      currentBet: 0,
      totalCommitted: 0,
      intent: ""
    });
  }
  return players;
};

const distributePot = (players, winners, pot, dealer) => {
  const nextPlayers = players.map((player) => ({ ...player }));
  const payouts = {};
  for (const seat of winners) {
    nextPlayers[seat].handsWon += 1;
    payouts[seat] = 0;
  }
  if (!winners.length || pot <= 0) return { players: nextPlayers, payouts };
  const ordered = orderFrom((dealer + 1) % players.length, players.length).filter((seat) => winners.includes(seat));
  const base = Math.floor(pot / winners.length);
  let rest = pot % winners.length;
  for (const seat of ordered) {
    const extra = rest > 0 ? 1 : 0;
    const gain = base + extra;
    rest = Math.max(0, rest - extra);
    nextPlayers[seat].chips += gain;
    payouts[seat] = gain;
  }
  return { players: nextPlayers, payouts };
};

const finalizeHand = (state, players, deck, logs, result) => {
  const nextPlayers = players.map((player) => ({ ...player, busted: player.chips <= 0 }));
  const contenders = nextPlayers.filter((player) => player.chips > 0);
  const max = Math.max(...nextPlayers.map((player) => player.chips), 0);
  const leaders = nextPlayers.filter((player) => player.chips === max);
  let matchWinner = null;
  if (contenders.length === 1) matchWinner = contenders[0];
  else if (max >= state.targetChips && leaders.length === 1) matchWinner = leaders[0];
  else if (nextPlayers[0].chips <= 0) matchWinner = leaders[0] || null;
  const winnerNames = result.winners.map((seat) => nextPlayers[seat]?.name).filter(Boolean);

  return {
    ...state,
    mode: matchWinner ? "match-over" : "hand-over",
    players: nextPlayers,
    deck,
    phase: "showdown",
    turnQueue: [],
    turnIndex: null,
    selectedDiscards: emptyDiscardSelection(),
    pot: 0,
    currentBet: 0,
    overlay: {
      kind: matchWinner ? "match" : "hand",
      title: winnerNames.length === 1 ? `${winnerNames[0]} gana la mano` : `Mano empatada: ${winnerNames.join(" y ")}`,
      subtitle: result.reason,
      detail: result.detail || "",
      winners: result.winners
    },
    message: matchWinner
      ? `Partida cerrada: ${matchWinner.name} lidera con ${matchWinner.chips} fichas.`
      : `${result.reason} Siguiente mano automatica...`,
    logs: appendLog(logs, result.reason),
    lastResult: { ...result, handNumber: state.handNumber }
  };
};

const resolveFold = (state, players, deck, logs, winnerSeat) => {
  const nextPlayers = players.map((player) => ({ ...player }));
  const pot = Math.max(0, state.pot);
  if (winnerSeat != null) {
    nextPlayers[winnerSeat].chips += pot;
    nextPlayers[winnerSeat].handsWon += 1;
  }
  return finalizeHand(state, nextPlayers, deck, logs, {
    type: "fold",
    winners: winnerSeat != null ? [winnerSeat] : [],
    reason: `${winnerSeat != null ? nextPlayers[winnerSeat].name : "Sin ganador"} gana por retirada general y recoge ${pot} fichas.`,
    detail: "Sin showdown.",
    handLabel: null,
    pot,
    payouts: winnerSeat != null ? { [winnerSeat]: pot } : {},
    showdown: []
  });
};

const resolveShowdown = (state, players, deck, logs) => {
  const alive = aliveSeats(players);
  const entries = alive.map((seat) => ({ seat, eval: evalFive(players[seat].hand) }));
  let best = entries[0].eval;
  for (const entry of entries.slice(1)) if (compareEval(entry.eval, best) > 0) best = entry.eval;
  const winners = entries.filter((entry) => compareEval(entry.eval, best) === 0).map((entry) => entry.seat);
  const { players: nextPlayers, payouts } = distributePot(players, winners, state.pot, state.dealerIndex);
  const payoutText = winners.map((seat) => `${nextPlayers[seat].name} +${payouts[seat] ?? 0}`).join(", ");
  return finalizeHand(state, nextPlayers, deck, logs, {
    type: "showdown",
    winners,
    reason: winners.length === 1 ? `${nextPlayers[winners[0]].name} gana showdown con ${best.label}.` : `Showdown empatado con ${best.label}.`,
    detail: `Bote ${state.pot}. Reparto: ${payoutText || "sin cambios"}.`,
    handLabel: best.label,
    pot: state.pot,
    payouts,
    showdown: entries.map((entry) => ({
      seatIndex: entry.seat,
      name: nextPlayers[entry.seat].name,
      handLabel: entry.eval.label,
      hole: nextPlayers[entry.seat].hand.map(cardText),
      payout: payouts[entry.seat] ?? 0
    }))
  });
};
const advancePhase = (state, players, deck, logs) => {
  const alive = aliveSeats(players);
  if (alive.length <= 1) return resolveFold(state, players, deck, logs, alive[0] ?? 0);

  if (state.phase === "pre-bet") {
    const nextPlayers = players.map((player) => ({ ...player, currentBet: 0 }));
    const queue = queueFrom(nextPlayers, (state.dealerIndex + 1) % nextPlayers.length, canActDiscard);
    const line = "Ronda de descarte (0 a 5 cartas).";
    const nextLogs = appendLog(logs, line);
    const nextState = {
      ...state,
      players: nextPlayers,
      deck,
      phase: "discard",
      currentBet: 0,
      turnQueue: queue,
      turnIndex: queue[0] ?? null,
      selectedDiscards: emptyDiscardSelection(),
      message: line,
      logs: nextLogs
    };
    return queue.length ? nextState : advancePhase(nextState, nextPlayers, deck, nextLogs);
  }

  if (state.phase === "discard") {
    const nextPlayers = players.map((player) => ({ ...player, currentBet: 0 }));
    const queue = queueFrom(nextPlayers, (state.dealerIndex + 1) % nextPlayers.length, canActBet);
    const line = "Ronda final de apuestas tras el descarte.";
    const nextLogs = appendLog(logs, line);
    const nextState = {
      ...state,
      players: nextPlayers,
      deck,
      phase: "post-bet",
      currentBet: 0,
      turnQueue: queue,
      turnIndex: queue[0] ?? null,
      selectedDiscards: emptyDiscardSelection(),
      message: line,
      logs: nextLogs
    };
    return queue.length ? nextState : resolveShowdown(nextState, nextPlayers, deck, nextLogs);
  }

  return resolveShowdown(state, players, deck, logs);
};

const startHand = (state, dealer, handNumber, resetLast = false) => {
  const blind = resolveBlindLevel(state.blindLevelId);
  const players = state.players.map((player) => {
    const busted = player.chips <= 0;
    return {
      ...player,
      hand: [],
      folded: busted,
      discarded: busted,
      discardCount: 0,
      allIn: false,
      busted,
      currentBet: 0,
      totalCommitted: 0,
      intent: busted ? "Sin fichas" : ""
    };
  });

  const active = players.filter((player) => player.chips > 0).map((player) => player.seatIndex);
  if (active.length < 2) {
    const winner = players.find((player) => player.chips > 0) || players[0];
    return {
      ...state,
      mode: "match-over",
      handNumber,
      dealerIndex: dealer,
      phase: "showdown",
      players,
      turnQueue: [],
      turnIndex: null,
      pot: 0,
      currentBet: 0,
      selectedDiscards: emptyDiscardSelection(),
      overlay: {
        kind: "match",
        title: "Fin de partida",
        subtitle: `${winner.name} gana por eliminacion.`,
        detail: `Stack final: ${winner.chips} fichas.`,
        winners: [winner.seatIndex]
      },
      message: `${winner.name} gana la mesa por eliminacion.`,
      logs: appendLog(state.logs, `${winner.name} gana la mesa por eliminacion.`),
      lastResult: resetLast ? null : state.lastResult
    };
  }

  const deck = shuffle(createDeck());
  for (let c = 0; c < HAND_CARDS; c += 1) {
    for (const seat of active) players[seat].hand.push(deck.pop());
  }

  const order = orderFrom((dealer + 1) % players.length, players.length).filter((seat) => players[seat].chips > 0);
  const sbSeat = order[0] ?? dealer;
  const bbSeat = order[1] ?? order[0] ?? dealer;
  let pot = 0;
  const sbPaid = postWager(players[sbSeat], blind.small);
  pot += sbPaid;
  const bbPaid = postWager(players[bbSeat], blind.big);
  pot += bbPaid;
  const currentBet = Math.max(...players.map((player) => player.currentBet), 0);
  const turnQueue = queueFrom(players, (bbSeat + 1) % players.length, canActBet);

  let logs = appendLog(state.logs, `Ciegas ${blind.small}/${blind.big}: ${players[sbSeat].name} ${sbPaid}, ${players[bbSeat].name} ${bbPaid}.`);
  logs = appendLog(logs, `Mano ${handNumber}: reparte ${players[dealer].name}.`);

  const nextState = {
    ...state,
    mode: "hand-active",
    handNumber,
    dealerIndex: dealer,
    smallBlind: blind.small,
    bigBlind: blind.big,
    smallBlindSeat: sbSeat,
    bigBlindSeat: bbSeat,
    phase: "pre-bet",
    deck,
    pot,
    currentBet,
    players,
    turnQueue,
    turnIndex: turnQueue[0] ?? null,
    selectedDiscards: emptyDiscardSelection(),
    overlay: null,
    message: `Turno para ${turnQueue[0] != null ? players[turnQueue[0]].name : "--"}.`,
    logs,
    lastResult: resetLast ? null : state.lastResult
  };
  return turnQueue.length ? nextState : advancePhase(nextState, players, deck, logs);
};

const decideAi = (state, seat) => {
  const actor = state.players[seat];
  if (!actor || actor.folded || actor.busted) return { type: "check" };
  const level = AI_LEVELS[state.aiLevelId] || AI_LEVELS.tactical;
  const handValue = evalFive(actor.hand);

  if (state.phase === "discard") {
    if (actor.discarded) return { type: "stand", note: "Ya esta servido." };
    const indices = recommendedDiscardIndices(actor.hand);
    if (!indices.length || handValue.cat >= 3) return { type: "stand", note: "Mantiene su mano." };
    return { type: "discard", indices, note: "Busca mejorar." };
  }

  const toCall = Math.max(0, state.currentBet - actor.currentBet);
  const strong = handValue.cat >= 4;
  const medium = handValue.cat >= 2;

  if (toCall <= 0) {
    if (strong && actor.chips > state.bigBlind) return { type: "raise", amount: state.bigBlind * 2, note: "Sube por valor." };
    if (medium && level.id !== "rookie" && actor.chips > state.bigBlind) return { type: "raise", amount: state.bigBlind, note: "Sube controlando riesgo." };
    return { type: "check", note: "Pasa." };
  }

  if (strong) {
    if (actor.chips <= toCall) return { type: "all-in", note: "All-in forzado." };
    if (level.id === "expert" && actor.chips > toCall + state.bigBlind) return { type: "raise", amount: state.bigBlind * 2, note: "Resube fuerte." };
    return { type: "call", note: "Iguala con mano fuerte." };
  }

  if (medium) {
    return toCall <= Math.max(1, Math.floor(actor.chips * 0.25))
      ? { type: "call", note: "Iguala por precio." }
      : { type: "fold", note: "Retirada tactica." };
  }

  return toCall <= Math.max(1, Math.floor(state.bigBlind / 2))
    ? { type: "call", note: "Defensa minima." }
    : { type: "fold", note: "No compensa pagar." };
};

const applyAction = (state, seat, action, isAi = false) => {
  if (state.mode !== "hand-active") return state;
  if (state.turnIndex !== seat) return isAi ? state : { ...state, message: "Espera a que llegue tu turno." };
  const actor = state.players[seat];
  if (!actor || actor.folded || actor.busted) return state;

  const players = state.players.map((player) => ({ ...player, hand: cloneCards(player.hand) }));
  const deck = cloneCards(state.deck);
  let logs = [...state.logs];
  let pot = state.pot;
  let currentBet = state.currentBet;
  let selectedDiscards = state.selectedDiscards;
  let raiseOccurred = false;
  const me = players[seat];
  const betting = state.phase !== "discard";
  const reject = (message) => (isAi ? state : { ...state, message });

  if (betting) {
    const toCall = Math.max(0, currentBet - me.currentBet);
    const minRaise = Math.max(state.bigBlind, 1);
    const type = String(action?.type || "");
    if (type === "fold") {
      me.folded = true;
      me.intent = action.note || "Se retira.";
      logs = appendLog(logs, `${me.name} se retira.`);
    } else if (type === "check") {
      if (toCall > 0) return reject(`Debes igualar ${toCall} fichas o retirarte.`);
      me.intent = action.note || "Pasa.";
      logs = appendLog(logs, `${me.name} pasa.`);
    } else if (type === "call") {
      if (toCall <= 0) return reject("No hay apuesta pendiente para igualar.");
      const paid = postWager(me, toCall);
      pot += paid;
      me.intent = action.note || `Iguala ${paid}.`;
      logs = appendLog(logs, `${me.name} iguala ${paid} ficha(s).`);
    } else if (type === "raise" || type === "bet") {
      if (me.chips <= toCall) return reject("No tienes margen para subir.");
      const raise = Math.max(minRaise, Math.floor(Number(action.amount) || minRaise));
      const before = currentBet;
      const paid = postWager(me, toCall + raise);
      pot += paid;
      if (me.currentBet > before) {
        currentBet = me.currentBet;
        raiseOccurred = true;
      }
      me.intent = action.note || `Sube a ${me.currentBet}.`;
      logs = appendLog(logs, `${me.name} sube a ${me.currentBet}.`);
    } else if (type === "all-in") {
      if (me.chips <= 0) return reject("No tienes fichas para all-in.");
      const before = currentBet;
      const paid = postWager(me, me.chips);
      pot += paid;
      if (me.currentBet > before) {
        currentBet = me.currentBet;
        raiseOccurred = true;
      }
      me.allIn = true;
      me.intent = action.note || "All-in.";
      logs = appendLog(logs, `${me.name} va all-in (${me.currentBet}).`);
    } else {
      return reject("Accion no valida.");
    }
    selectedDiscards = emptyDiscardSelection();
  } else {
    const type = String(action?.type || "");
    if (type === "fold") {
      me.folded = true;
      me.intent = action.note || "Se retira.";
      logs = appendLog(logs, `${me.name} se retira en descarte.`);
    } else if (type === "discard") {
      if (me.discarded) return reject("Ya realizaste el descarte en esta mano.");
      const indices = sanitizeDiscardIndices(action.indices);
      const drawCount = Math.min(indices.length, deck.length);
      const used = indices.slice(0, drawCount);
      used.forEach((index) => {
        me.hand[index] = deck.pop();
      });
      me.discarded = true;
      me.discardCount = used.length;
      me.intent = action.note || `Descarta ${used.length}.`;
      logs = appendLog(logs, used.length ? `${me.name} descarta ${used.length} carta(s).` : `${me.name} se sirve.`);
    } else {
      me.discarded = true;
      me.discardCount = 0;
      me.intent = action.note || "Se sirve.";
      logs = appendLog(logs, `${me.name} se sirve sin descartar.`);
    }
    selectedDiscards = emptyDiscardSelection();
  }

  const alive = aliveSeats(players);
  if (alive.length <= 1) return resolveFold(state, players, deck, logs, alive[0] ?? seat);

  let nextQueue = [];
  if (betting && raiseOccurred) nextQueue = queueFrom(players, (seat + 1) % players.length, canActBet, seat);
  else nextQueue = state.turnQueue.slice(1).filter((candidate) => (state.phase === "discard" ? canActDiscard(players[candidate]) : canActBet(players[candidate])));

  if (nextQueue.length > 0) {
    return {
      ...state,
      players,
      deck,
      pot,
      currentBet,
      turnQueue: nextQueue,
      turnIndex: nextQueue[0],
      selectedDiscards,
      message: `${me.name} actua. Turno para ${players[nextQueue[0]].name}.`,
      logs
    };
  }

  return advancePhase(
    {
      ...state,
      players,
      deck,
      pot,
      currentBet,
      selectedDiscards,
      logs,
      message: `${me.name} cierra su accion.`
    },
    players,
    deck,
    logs
  );
};

const availableActions = (state, seat) => {
  if (state.mode !== "hand-active" || state.turnIndex !== seat) return [];
  const player = state.players[seat];
  if (!player || player.folded || player.busted) return [];
  if (state.phase === "discard") {
    if (player.discarded) return [];
    return ["discard", "stand", "fold"];
  }
  const toCall = Math.max(0, state.currentBet - player.currentBet);
  const actions = ["fold"];
  if (toCall > 0) {
    if (player.chips > 0) actions.push("call");
    if (player.chips > toCall) actions.push("raise");
    if (player.chips > 0) actions.push("all-in");
  } else {
    actions.push("check");
    if (player.chips > 0) actions.push("raise", "all-in");
  }
  return actions;
};

const createMatch = (opponents, aiLevelId, startingStack, targetChips, blindLevelId = DEFAULT_BLIND_LEVEL_ID) => {
  const stack = STARTING_STACK_OPTIONS.includes(startingStack) ? startingStack : DEFAULT_STARTING_STACK;
  const target = ensureTargetForStack(targetChips, stack);
  const players = createPlayers(opponents, stack);
  const dealer = randomInt(players.length);
  const blind = resolveBlindLevel(blindLevelId);
  return startHand(
    {
      mode: "hand-active",
      opponentCount: opponents,
      aiLevelId,
      startingStack: stack,
      targetChips: target,
      blindLevelId: blind.id,
      smallBlind: blind.small,
      bigBlind: blind.big,
      handNumber: 1,
      dealerIndex: dealer,
      smallBlindSeat: null,
      bigBlindSeat: null,
      phase: "pre-bet",
      deck: [],
      pot: 0,
      currentBet: 0,
      players,
      turnQueue: [],
      turnIndex: null,
      selectedDiscards: emptyDiscardSelection(),
      message: "",
      logs: [],
      lastResult: null,
      overlay: null
    },
    dealer,
    1,
    true
  );
};
function PokerCard({ card, hidden = false, slot = false, selectable = false, selected = false, onClick }) {
  if (slot || !card) {
    return (
      <span className="poker-card slot">
        <span className="slot-label">?</span>
      </span>
    );
  }
  if (hidden) {
    return (
      <span className="poker-card hidden">
        <span className="back-mark">IA</span>
      </span>
    );
  }
  const className = ["poker-card", card.colorClass || "", selected ? "selected" : ""].filter(Boolean).join(" ");
  if (selectable) {
    return (
      <button type="button" className={className} onClick={onClick}>
        <span className="rank">{RANK_LABEL[card.rank]}</span>
        <span className="suit">{card.symbol}</span>
      </button>
    );
  }
  return (
    <span className={className}>
      <span className="rank">{RANK_LABEL[card.rank]}</span>
      <span className="suit">{card.symbol}</span>
    </span>
  );
}

function PokerTexasHoldemGame() {
  const [state, setState] = useState(() => createMatch(1, "tactical", DEFAULT_STARTING_STACK, DEFAULT_TARGET_CHIPS, DEFAULT_BLIND_LEVEL_ID));
  const [pendingOpp, setPendingOpp] = useState(1);
  const [pendingLevel, setPendingLevel] = useState("tactical");
  const [pendingStack, setPendingStack] = useState(DEFAULT_STARTING_STACK);
  const [pendingBlindLevel, setPendingBlindLevel] = useState(DEFAULT_BLIND_LEVEL_ID);
  const [pendingTarget, setPendingTarget] = useState(DEFAULT_TARGET_CHIPS);
  const [aiThinking, setAiThinking] = useState(false);

  const aiTimerRef = useRef({ active: false, ms: 0, hand: 0, phase: "", turn: null });
  const autoTimerRef = useRef({ active: false, ms: 0, hand: 0 });
  const frameRef = useRef(0);
  const lastRef = useRef(0);

  const stopAiTimer = useCallback(() => {
    aiTimerRef.current = { active: false, ms: 0, hand: 0, phase: "", turn: null };
    setAiThinking(false);
  }, []);
  const stopAutoTimer = useCallback(() => {
    autoTimerRef.current = { active: false, ms: 0, hand: 0 };
  }, []);
  const restartMatch = useCallback(() => {
    setState((previous) => createMatch(previous.opponentCount, previous.aiLevelId, previous.startingStack, previous.targetChips, previous.blindLevelId));
  }, []);
  const applyConfiguration = useCallback(() => {
    setState(() => createMatch(pendingOpp, pendingLevel, pendingStack, pendingTarget, pendingBlindLevel));
  }, [pendingOpp, pendingLevel, pendingStack, pendingTarget, pendingBlindLevel]);
  const startNextHand = useCallback(() => {
    setState((previous) => {
      if (previous.mode !== "hand-over") return previous;
      const dealer = nextSeatWithChips(previous.players, (previous.dealerIndex + 1) % previous.players.length);
      if (dealer == null) return previous;
      return startHand(previous, dealer, previous.handNumber + 1, false);
    });
  }, []);
  const runAiTurn = useCallback(() => {
    setState((previous) => {
      if (previous.mode !== "hand-active" || previous.turnIndex == null) return previous;
      const actor = previous.players[previous.turnIndex];
      if (!actor || actor.type !== "ai" || actor.folded || actor.busted) return previous;
      return applyAction(previous, previous.turnIndex, decideAi(previous, previous.turnIndex), true);
    });
  }, []);
  const playerCheck = useCallback(() => setState((previous) => applyAction(previous, 0, { type: "check" }, false)), []);
  const playerCall = useCallback(() => setState((previous) => applyAction(previous, 0, { type: "call" }, false)), []);
  const playerRaise = useCallback(() => setState((previous) => applyAction(previous, 0, { type: "raise", amount: previous.bigBlind }, false)), []);
  const playerAllIn = useCallback(() => setState((previous) => applyAction(previous, 0, { type: "all-in" }, false)), []);
  const playerFold = useCallback(() => setState((previous) => applyAction(previous, 0, { type: "fold" }, false)), []);
  const playerStandPat = useCallback(() => setState((previous) => applyAction(previous, 0, { type: "stand" }, false)), []);
  const playerDiscardSelected = useCallback(() => {
    setState((previous) => {
      if (previous.mode !== "hand-active" || previous.turnIndex !== 0 || previous.phase !== "discard") return previous;
      const indices = previous.selectedDiscards.map((selected, index) => (selected ? index : -1)).filter((index) => index >= 0);
      if (!indices.length) return { ...previous, message: "Selecciona al menos una carta o pulsa Servirse." };
      return applyAction(previous, 0, { type: "discard", indices }, false);
    });
  }, []);
  const toggleDiscardSelection = useCallback((index) => {
    setState((previous) => {
      if (previous.mode !== "hand-active" || previous.turnIndex !== 0 || previous.phase !== "discard") return previous;
      if (!Number.isInteger(index) || index < 0 || index >= HAND_CARDS) return previous;
      const selectedDiscards = [...previous.selectedDiscards];
      selectedDiscards[index] = !selectedDiscards[index];
      return { ...previous, selectedDiscards };
    });
  }, []);
  const handleStackChange = useCallback((nextStack) => {
    const stack = STARTING_STACK_OPTIONS.includes(nextStack) ? nextStack : DEFAULT_STARTING_STACK;
    setPendingStack(stack);
    setPendingTarget((previousTarget) => ensureTargetForStack(previousTarget, stack));
  }, []);

  const processTimers = useCallback((deltaMs) => {
    let remaining = clampMs(deltaMs);
    while (remaining > 0) {
      const step = Math.min(80, remaining);
      remaining -= step;
      if (aiTimerRef.current.active) {
        aiTimerRef.current.ms -= step;
        if (aiTimerRef.current.ms <= 0) {
          aiTimerRef.current.active = false;
          setAiThinking(false);
          runAiTurn();
        }
      }
      if (autoTimerRef.current.active) {
        autoTimerRef.current.ms -= step;
        if (autoTimerRef.current.ms <= 0) {
          autoTimerRef.current.active = false;
          startNextHand();
        }
      }
    }
  }, [runAiTurn, startNextHand]);
  const advanceTime = useCallback((ms) => processTimers(ms), [processTimers]);

  useEffect(() => {
    const isAiTurn =
      state.mode === "hand-active" &&
      state.turnIndex != null &&
      state.players[state.turnIndex]?.type === "ai" &&
      !state.players[state.turnIndex]?.folded &&
      !state.players[state.turnIndex]?.busted;
    if (!isAiTurn) {
      stopAiTimer();
      return;
    }
    const current = aiTimerRef.current;
    if (current.active && current.hand === state.handNumber && current.phase === state.phase && current.turn === state.turnIndex) return;
    const level = AI_LEVELS[state.aiLevelId] || AI_LEVELS.tactical;
    aiTimerRef.current = { active: true, ms: level.thinkMs + randomInt(220), hand: state.handNumber, phase: state.phase, turn: state.turnIndex };
    setAiThinking(true);
  }, [state.mode, state.turnIndex, state.players, state.handNumber, state.phase, state.aiLevelId, stopAiTimer]);

  useEffect(() => {
    const isAiTurn =
      state.mode === "hand-active" &&
      state.turnIndex != null &&
      state.players[state.turnIndex]?.type === "ai" &&
      !state.players[state.turnIndex]?.folded &&
      !state.players[state.turnIndex]?.busted;
    if (!isAiTurn) return undefined;
    const expectedHand = state.handNumber;
    const expectedPhase = state.phase;
    const expectedTurn = state.turnIndex;
    const watchdog = window.setTimeout(() => {
      setState((previous) => {
        if (
          previous.mode !== "hand-active" ||
          previous.handNumber !== expectedHand ||
          previous.phase !== expectedPhase ||
          previous.turnIndex !== expectedTurn
        ) return previous;
        const actor = previous.players[expectedTurn];
        if (!actor || actor.type !== "ai" || actor.folded || actor.busted) return previous;
        return applyAction(previous, expectedTurn, decideAi(previous, expectedTurn), true);
      });
    }, 2800);
    return () => window.clearTimeout(watchdog);
  }, [state.mode, state.turnIndex, state.players, state.handNumber, state.phase]);

  useEffect(() => {
    if (state.mode !== "hand-over") {
      stopAutoTimer();
      return;
    }
    const current = autoTimerRef.current;
    if (current.active && current.hand === state.handNumber) return;
    autoTimerRef.current = { active: true, ms: AUTO_NEXT_MS, hand: state.handNumber };
  }, [state.mode, state.handNumber, stopAutoTimer]);

  useEffect(() => {
    const loop = (timestamp) => {
      if (!lastRef.current) lastRef.current = timestamp;
      const delta = Math.min(120, timestamp - lastRef.current);
      lastRef.current = timestamp;
      processTimers(delta);
      frameRef.current = window.requestAnimationFrame(loop);
    };
    frameRef.current = window.requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      stopAiTimer();
      stopAutoTimer();
    };
  }, [processTimers, stopAiTimer, stopAutoTimer]);
  useEffect(() => {
    const onKeyDown = (event) => {
      const tag = event.target?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      const key = event.key.toLowerCase();
      const human = state.players[0];
      const toCall = Math.max(0, (state.currentBet || 0) - (human?.currentBet || 0));
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (state.phase === "discard" && state.mode === "hand-active" && state.turnIndex === 0) playerStandPat();
        else if (toCall > 0) playerCall();
        else playerCheck();
        return;
      }
      if (key === "c") { event.preventDefault(); playerCall(); return; }
      if (key === "x") { event.preventDefault(); playerCheck(); return; }
      if (key === "u") { event.preventDefault(); playerRaise(); return; }
      if (key === "a") { event.preventDefault(); playerAllIn(); return; }
      if (key === "f") { event.preventDefault(); playerFold(); return; }
      if (key === "d") { event.preventDefault(); playerDiscardSelected(); return; }
      if (key === "s") { event.preventDefault(); playerStandPat(); return; }
      if (key === "n") { event.preventDefault(); startNextHand(); return; }
      if (key === "r") { event.preventDefault(); restartMatch(); return; }
      if (["1", "2", "3", "4", "5"].includes(key)) {
        event.preventDefault();
        toggleDiscardSelection(Number(key) - 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [playerAllIn, playerCall, playerCheck, playerDiscardSelected, playerFold, playerRaise, playerStandPat, restartMatch, startNextHand, state.currentBet, state.mode, state.phase, state.players, state.turnIndex, toggleDiscardSelection]);

  const human = state.players[0];
  const toCall = Math.max(0, state.currentBet - human.currentBet);
  const canAct = state.mode === "hand-active" && state.turnIndex === 0 && !human.folded && !human.busted;
  const canBetAct = canAct && state.phase !== "discard" && !human.allIn;
  const canCheck = canBetAct && toCall === 0;
  const canCall = canBetAct && toCall > 0 && human.chips > 0;
  const canRaise = canBetAct && human.chips > toCall;
  const canAllIn = canBetAct && human.chips > 0;
  const canFold = canAct;
  const canSelectDiscard = canAct && state.phase === "discard" && !human.discarded;
  const selectedDiscardCount = state.selectedDiscards.filter(Boolean).length;
  const canDiscardSelected = canSelectDiscard && selectedDiscardCount > 0;
  const canStand = canSelectDiscard;
  const level = AI_LEVELS[state.aiLevelId] || AI_LEVELS.tactical;
  const targetOptions = useMemo(() => resolveTargetOptions(pendingStack), [pendingStack]);
  const activeBlind = useMemo(() => resolveBlindLevel(state.blindLevelId), [state.blindLevelId]);
  const insight = useMemo(() => evalFive(human.hand).label, [human.hand]);
  const recommended = useMemo(() => recommendedDiscardIndices(human.hand).map((index) => index + 1), [human.hand]);
  const actionsNow = useMemo(() => availableActions(state, 0), [state]);
  const roundCenterCards = useMemo(() => {
    if (state.mode === "hand-active") return [];
    const winnerSeat = state.lastResult?.winners?.[0];
    if (winnerSeat == null) return [];
    return (state.players[winnerSeat]?.hand || []).slice(0, HAND_CARDS);
  }, [state.mode, state.lastResult, state.players]);

  const bridgePayload = useCallback((snapshot) => ({
    mode: "strategy-poker-clasico-bet",
    variant: "draw_poker_five_card_with_betting",
    coordinates: "seat_index_clockwise_start_player_0",
    stateMode: snapshot.mode === "hand-active" ? "playing" : snapshot.mode,
    hand: snapshot.handNumber,
    phase: snapshot.phase,
    dealer: snapshot.dealerIndex,
    turn: snapshot.turnIndex,
    opponents: snapshot.opponentCount,
    profile: snapshot.aiLevelId,
    startingStack: snapshot.startingStack,
    targetChips: snapshot.targetChips,
    blindLevel: snapshot.blindLevelId,
    smallBlind: snapshot.smallBlind,
    bigBlind: snapshot.bigBlind,
    pot: snapshot.pot,
    currentBet: snapshot.currentBet,
    toCall: Math.max(0, snapshot.currentBet - (snapshot.players[0]?.currentBet || 0)),
    aiThinking,
    rulesPrompt: RULES_PROMPT,
    scores: snapshot.players.map((player) => ({
      seatIndex: player.seatIndex,
      name: player.name,
      chips: player.chips,
      handsWon: player.handsWon,
      currentBet: player.currentBet,
      totalCommitted: player.totalCommitted,
      busted: player.busted
    })),
    seats: snapshot.players.map((player) => ({
      seatIndex: player.seatIndex,
      name: player.name,
      folded: player.folded,
      busted: player.busted,
      allIn: player.allIn,
      discarded: player.discarded,
      discardCount: player.discardCount,
      currentBet: player.currentBet,
      totalCommitted: player.totalCommitted,
      holeVisible: player.type === "human" || snapshot.mode !== "hand-active",
      hole: player.type === "human" || snapshot.mode !== "hand-active" ? player.hand.map(cardText) : Array.from({ length: HAND_CARDS }, () => "hidden")
    })),
    selectedDiscards: snapshot.selectedDiscards.map((selected, index) => (selected ? index + 1 : null)).filter(Boolean),
    playerActions: availableActions(snapshot, 0),
    lastResult: snapshot.lastResult,
    overlay: snapshot.overlay,
    message: snapshot.message
  }), [aiThinking]);
  useGameRuntimeBridge(state, bridgePayload, advanceTime);

  return (
    <div className="mini-game poker-holdem-game">
      <div className="mini-head">
        <div>
          <h4>Poker Clasico 5 Cartas - Con Apuestas</h4>
          <p>Mesa de casino con ciegas, bote real y apuestas de fichas en cada mano.</p>
        </div>
        <div className="poker-head-actions">
          <button type="button" onClick={restartMatch}>Nueva partida</button>
        </div>
      </div>

      <div className="poker-config">
        <label htmlFor="poker-opponents">Rivales IA
          <select id="poker-opponents" value={pendingOpp} onChange={(event) => setPendingOpp(Number(event.target.value) || 1)}>
            {OPPONENT_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label htmlFor="poker-profile">Perfil IA
          <select id="poker-profile" value={pendingLevel} onChange={(event) => setPendingLevel(event.target.value)}>
            {Object.values(AI_LEVELS).map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
          </select>
        </label>
        <label htmlFor="poker-stack">Stack inicial
          <select id="poker-stack" value={pendingStack} onChange={(event) => handleStackChange(Number(event.target.value) || DEFAULT_STARTING_STACK)}>
            {STARTING_STACK_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label htmlFor="poker-blinds">Nivel de ciegas
          <select id="poker-blinds" value={pendingBlindLevel} onChange={(event) => setPendingBlindLevel(event.target.value)}>
            {Object.values(BLIND_LEVELS).map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
          </select>
        </label>
        <label htmlFor="poker-target">Meta de fichas
          <select id="poker-target" value={pendingTarget} onChange={(event) => setPendingTarget(Number(event.target.value) || DEFAULT_TARGET_CHIPS)}>
            {targetOptions.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <button type="button" className="poker-apply" onClick={applyConfiguration}>Aplicar y reiniciar</button>
      </div>

      <div className="status-row poker-status-row">
        <span className={`status-pill ${state.mode === "hand-active" ? "playing" : "finished"}`}>
          {state.mode === "hand-active" ? "en juego" : state.mode === "match-over" ? "partida cerrada" : "mano cerrada"}
        </span>
        <span>Mano: {state.handNumber}</span>
        <span>Fase: {PHASE_LABEL[state.phase] || "Showdown"}</span>
        <span>Dealer: {state.players[state.dealerIndex]?.name || "--"}</span>
        <span>Turno: {state.turnIndex != null ? state.players[state.turnIndex]?.name : "--"}</span>
        <span>Activos: {aliveSeats(state.players).length}</span>
        <span>Bote: {state.pot}</span>
        <span>Apuesta: {state.currentBet}</span>
        <span>Ciegas: {activeBlind.label}</span>
        <span>Meta: {state.targetChips}</span>
        <span>IA: {level.label}</span>
        {aiThinking ? <span>IA pensando...</span> : null}
      </div>

      <div className="poker-scoreboard">
        {state.players.map((player) => (
          <article key={player.id} className="poker-score-card">
            <p>{player.name}</p>
            <strong>{player.chips}</strong>
            <span>{player.handsWon} manos</span>
            <span>En ronda: {player.currentBet}</span>
          </article>
        ))}
      </div>

      <div className="poker-table">
        <div className="poker-round-table">
          <div className="poker-felt-ring" />
          {state.players.map((player) => {
            const humanSeat = player.type === "human";
            const hidden = !humanSeat && state.mode === "hand-active";
            const isTurn = state.mode === "hand-active" && state.turnIndex === player.seatIndex;
            const isDealer = state.dealerIndex === player.seatIndex;
            const seat = seatPosition(player.seatIndex, state.players.length);
            const statusLabel = player.busted ? "Sin fichas" : player.folded ? "Retirado" : player.allIn ? "All-in" : isTurn ? "Activa" : "En mano";
            return (
              <div key={player.id} className={["poker-table-seat", humanSeat ? "poker-player-seat" : "poker-ai-seat"].join(" ")} style={{ "--seat-x": `${seat.x}%`, "--seat-y": `${seat.y}%` }}>
                <article className={["poker-seat", player.folded ? "folded" : "", isTurn ? "active-turn" : "", isDealer ? "dealer" : ""].filter(Boolean).join(" ")}>
                  <header><h5>{player.name}</h5><p>{statusLabel}</p></header>
                  <div className={`poker-hole-cards ${hidden ? "hidden-hand" : "shown-hand"}`}>
                    {Array.from({ length: HAND_CARDS }, (_, index) => (
                      <PokerCard
                        key={`${player.id}-${index}`}
                        card={player.hand[index]}
                        hidden={hidden}
                        selectable={humanSeat && canSelectDiscard}
                        selected={humanSeat && state.selectedDiscards[index]}
                        onClick={() => toggleDiscardSelection(index)}
                      />
                    ))}
                  </div>
                  <div className="seat-chip-row"><span>Stack: {player.chips}</span><span>Bote: {player.totalCommitted}</span></div>
                  <span className="swap-chip">{player.discarded ? `Descarte: ${player.discardCount}` : "Descarte pendiente"}</span>
                  {player.intent ? <span className="swap-chip">{player.intent}</span> : null}
                </article>
              </div>
            );
          })}

          <div className="poker-board-zone">
            <div className="poker-phase-track">
              {PHASES.map((phase) => {
                const current = PHASES.indexOf(state.phase);
                const index = PHASES.indexOf(phase);
                const active = state.mode === "hand-active" && current === index;
                const completed = state.mode !== "hand-active" || current > index;
                return <span key={phase} className={["poker-phase-chip", active ? "active" : "", completed ? "completed" : ""].filter(Boolean).join(" ")}>{PHASE_LABEL[phase]}</span>;
              })}
            </div>
            <div className="poker-pot-panel">
              <span>Bote total</span>
              <strong>{state.pot}</strong>
              <span>Apuesta actual: {state.currentBet}</span>
              <span>Ciegas: {state.smallBlind}/{state.bigBlind}</span>
            </div>
            <p className="poker-round-cards-title">Cartas de cierre</p>
            <div className="poker-board-cards">
              {roundCenterCards.length
                ? roundCenterCards.map((card, index) => <PokerCard key={`round-${index}`} card={card} />)
                : Array.from({ length: HAND_CARDS }, (_, index) => <PokerCard key={`round-slot-${index}`} slot />)}
            </div>
            <ul className="poker-discard-status">
              {state.players.map((player) => <li key={`discard-${player.id}`}>{player.name}: {player.discarded ? `${player.discardCount} carta(s)` : "sin resolver"}</li>)}
            </ul>
            <p className="poker-bet-note">Subida minima: +{state.bigBlind} fichas.</p>
            <p className="poker-bet-note">{toCall > 0 ? `Debes igualar ${toCall} ficha(s) para seguir.` : "Sin apuesta pendiente: puedes pasar o subir."}</p>
          </div>

          {state.overlay ? (
            <div className={`poker-winner-overlay ${state.overlay.kind === "match" ? "match-end" : "hand-end"}`}>
              <div className="poker-winner-card">
                <p className="poker-winner-tag">{state.overlay.kind === "match" ? "Fin de partida" : "Fin de mano"}</p>
                <h5>{state.overlay.title}</h5>
                <p>{state.overlay.subtitle}</p>
                {state.overlay.detail ? <strong>{state.overlay.detail}</strong> : null}
                {state.mode === "hand-over" ? <span>Siguiente mano automatica...</span> : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="poker-actions-panel">
        {state.phase === "discard" ? (
          <>
            <button type="button" onClick={playerDiscardSelected} disabled={!canDiscardSelected}>Descartar seleccion ({selectedDiscardCount})</button>
            <button type="button" onClick={playerStandPat} disabled={!canStand}>Servirse (0 descartes)</button>
            <button type="button" onClick={playerFold} disabled={!canSelectDiscard}>Retirarse</button>
          </>
        ) : (
          <>
            <button type="button" onClick={playerCheck} disabled={!canCheck}>Pasar</button>
            <button type="button" onClick={playerCall} disabled={!canCall}>Igualar ({toCall})</button>
            <button type="button" onClick={playerRaise} disabled={!canRaise}>Subir (+{state.bigBlind})</button>
            <button type="button" onClick={playerAllIn} disabled={!canAllIn}>All-in</button>
            <button type="button" onClick={playerFold} disabled={!canFold}>Retirarse</button>
          </>
        )}
      </div>

      <p className="poker-hand-insight">
        Lectura de mano: {insight}.{" "}
        {state.phase === "discard"
          ? (canSelectDiscard
            ? `Selecciona cartas (teclas 1-5) y descarta. Recomendacion IA: ${recommended.length ? recommended.join(", ") : "servirse"}.`
            : "Espera tu turno para descartar o servirte.")
          : (canBetAct
            ? `Situacion de apuesta: ${toCall > 0 ? `debes igualar ${toCall}` : "puedes pasar"} con stack ${human.chips}.`
            : "Espera tu turno para decidir apuesta.")}
        {" "}Acciones posibles: {actionsNow.length ? actionsNow.join(", ") : "ninguna"}.
      </p>

      {state.lastResult ? (
        <div className="poker-showdown">
          <h5>Ultimo cierre de mano</h5>
          <p>{state.lastResult.reason}</p>
          {state.lastResult.handLabel ? <p>Mano ganadora: {state.lastResult.handLabel}</p> : null}
          {state.lastResult.pot != null ? <p>Bote resuelto: {state.lastResult.pot}</p> : null}
          {state.lastResult.showdown?.length ? (
            <ul>
              {state.lastResult.showdown.map((entry) => (
                <li key={`show-${entry.seatIndex}`}>{entry.name}: {entry.handLabel} | Mano: {entry.hole.join(" ")} | Pago: +{entry.payout ?? 0}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <details className="poker-rules">
        <summary>Reglas activas de mesa</summary>
        <pre>{RULES_PROMPT}</pre>
      </details>

      <p className="game-message">{state.message}</p>
      <ul className="game-log">{state.logs.map((entry, index) => <li key={`log-${index}`}>{entry}</li>)}</ul>
    </div>
  );
}

export default PokerTexasHoldemGame;
