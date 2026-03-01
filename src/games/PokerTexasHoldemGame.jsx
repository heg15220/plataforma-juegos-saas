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
const PHASE_LABELS = {
  es: { "pre-bet": "Apuesta inicial", discard: "Descarte", "post-bet": "Apuesta final" },
  en: { "pre-bet": "Opening bet", discard: "Discard", "post-bet": "Final bet" }
};
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
const AI_LEVEL_LABELS = {
  es: { rookie: "Basica", tactical: "Tactica", expert: "Experta" },
  en: { rookie: "Basic", tactical: "Tactical", expert: "Expert" }
};
const RULES_PROMPT = {
  es: `POKER CLASICO 5 CARTAS (CON APUESTAS)
- Ciegas pequena/grande al inicio de cada mano.
- Ronda de apuesta inicial, descarte, ronda final y showdown.
- Acciones: pasar, igualar, subir, all-in, retirarse.
- Gana el bote la mejor mano o el ultimo jugador que no se retire.
- Meta: alcanzar la meta de fichas o dejar al resto sin stack.`,
  en: `CLASSIC 5-CARD POKER (WITH BETTING)
- Small/big blinds at the beginning of each hand.
- Opening betting round, discard, final betting round, and showdown.
- Actions: check, call, raise, all-in, fold.
- The pot is won by the best hand or the last player who doesn't fold.
- Goal: reach the chip target or leave all opponents without a stack.`
};
const UI_COPY = {
  es: {
    headerTitle: "Poker Clasico 5 Cartas - Con Apuestas",
    headerSubtitle: "Mesa de casino con ciegas, bote real y apuestas de fichas en cada mano.",
    newGame: "Nueva partida",
    opponents: "Rivales IA",
    aiProfile: "Perfil IA",
    startingStack: "Stack inicial",
    blindLevel: "Nivel de ciegas",
    chipTarget: "Meta de fichas",
    applyReset: "Aplicar y reiniciar",
    inGame: "en juego",
    matchClosed: "partida cerrada",
    handClosed: "mano cerrada",
    hand: "Mano",
    phase: "Fase",
    dealer: "Dealer",
    turn: "Turno",
    active: "Activos",
    pot: "Bote",
    bet: "Apuesta",
    blinds: "Ciegas",
    target: "Meta",
    ai: "IA",
    aiThinking: "IA pensando...",
    hands: "manos",
    inRound: "En ronda",
    noChips: "Sin fichas",
    folded: "Retirado",
    activeSeat: "Activa",
    inHand: "En mano",
    chipsAriaPrefix: "Fichas de",
    chipsLabel: "fichas",
    committed: "Acumulado",
    discardLabel: "Descarte",
    discardPending: "Descarte pendiente",
    potTotal: "Bote total",
    currentBet: "Apuesta actual",
    noActiveChips: "Sin fichas activas en esta fase.",
    showdownCards: "Cartas de cierre",
    matchEnd: "Fin de partida",
    handEnd: "Fin de mano",
    nextHandAuto: "Siguiente mano automatica...",
    actionDiscard: "Descartar seleccion",
    actionStand: "Servirse (0 descartes)",
    actionFold: "Retirarse",
    actionCheck: "Pasar",
    actionCall: "Igualar",
    actionRaise: "Subir",
    minRaise: "Subida minima",
    mustCall: "Debes igualar",
    noBetPending: "Sin apuesta pendiente: puedes pasar o subir.",
    handRead: "Lectura de mano",
    selectCardsHint: "Selecciona cartas (teclas 1-5) y descarta. Recomendacion IA",
    standPatHint: "servirse",
    waitDiscard: "Espera tu turno para descartar o servirte.",
    betSituation: "Situacion de apuesta",
    waitBet: "Espera tu turno para decidir apuesta.",
    possibleActions: "Acciones posibles",
    noActions: "ninguna",
    lastShowdown: "Ultimo cierre de mano",
    winningHand: "Mano ganadora",
    resolvedPot: "Bote resuelto",
    handLabelInResult: "Mano",
    payoutLabel: "Pago",
    activeRules: "Reglas activas de mesa",
    showdownFallback: "Showdown"
  },
  en: {
    headerTitle: "Classic 5-Card Poker - With Betting",
    headerSubtitle: "Casino table with blinds, real pot, and chip betting each hand.",
    newGame: "New game",
    opponents: "AI opponents",
    aiProfile: "AI profile",
    startingStack: "Starting stack",
    blindLevel: "Blind level",
    chipTarget: "Chip target",
    applyReset: "Apply and reset",
    inGame: "in play",
    matchClosed: "match over",
    handClosed: "hand over",
    hand: "Hand",
    phase: "Phase",
    dealer: "Dealer",
    turn: "Turn",
    active: "Active",
    pot: "Pot",
    bet: "Bet",
    blinds: "Blinds",
    target: "Target",
    ai: "AI",
    aiThinking: "AI thinking...",
    hands: "hands",
    inRound: "In round",
    noChips: "Out of chips",
    folded: "Folded",
    activeSeat: "Active",
    inHand: "In hand",
    chipsAriaPrefix: "Chips for",
    chipsLabel: "chips",
    committed: "Committed",
    discardLabel: "Discard",
    discardPending: "Discard pending",
    potTotal: "Total pot",
    currentBet: "Current bet",
    noActiveChips: "No active chips in this phase.",
    showdownCards: "Showdown cards",
    matchEnd: "Match over",
    handEnd: "Hand over",
    nextHandAuto: "Next hand automatically...",
    actionDiscard: "Discard selected",
    actionStand: "Stand pat (0 discards)",
    actionFold: "Fold",
    actionCheck: "Check",
    actionCall: "Call",
    actionRaise: "Raise",
    minRaise: "Minimum raise",
    mustCall: "You must call",
    noBetPending: "No pending bet: you can check or raise.",
    handRead: "Hand read",
    selectCardsHint: "Select cards (keys 1-5) and discard. AI recommendation",
    standPatHint: "stand pat",
    waitDiscard: "Wait for your turn to discard or stand pat.",
    betSituation: "Betting situation",
    waitBet: "Wait for your turn to decide your bet.",
    possibleActions: "Possible actions",
    noActions: "none",
    lastShowdown: "Latest showdown",
    winningHand: "Winning hand",
    resolvedPot: "Resolved pot",
    handLabelInResult: "Hand",
    payoutLabel: "Payout",
    activeRules: "Active table rules",
    showdownFallback: "Showdown"
  }
};
const ACTION_LABELS = {
  es: { discard: "descartar", stand: "servirse", fold: "retirarse", call: "igualar", raise: "subir", check: "pasar", "all-in": "all-in" },
  en: { discard: "discard", stand: "stand pat", fold: "fold", call: "call", raise: "raise", check: "check", "all-in": "all-in" }
};
const resolveLocale = () => {
  if (typeof navigator === "undefined" || typeof navigator.language !== "string") return "en";
  return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
};
const localizePlayerName = (name, locale) => {
  if (locale === "es") return name;
  if (name === "Tu") return "You";
  return String(name).replace(/^IA\s+(\d+)$/i, "AI $1");
};
const localizeHandLabel = (label, locale) => {
  if (locale === "es" || !label) return label;
  let out = String(label);
  out = out.replace(/Escalera real/g, "Royal flush");
  out = out.replace(/Escalera de color al ([0-9AJQK]+)/g, "Straight flush to $1");
  out = out.replace(/Poker de ([0-9AJQK]+)/g, "Four of a kind $1");
  out = out.replace(/Full ([0-9AJQK]+)\/([0-9AJQK]+)/g, "Full house $1/$2");
  out = out.replace(/Color al ([0-9AJQK]+)/g, "Flush to $1");
  out = out.replace(/Escalera al ([0-9AJQK]+)/g, "Straight to $1");
  out = out.replace(/Trio de ([0-9AJQK]+)/g, "Three of a kind $1");
  out = out.replace(/Dobles parejas ([0-9AJQK]+)\/([0-9AJQK]+)/g, "Two pair $1/$2");
  out = out.replace(/Pareja de ([0-9AJQK]+)/g, "Pair of $1");
  out = out.replace(/Carta mayor ([0-9AJQK]+)/g, "High card $1");
  return out;
};
const localizeRuntimeText = (text, locale) => {
  if (locale === "es" || text == null) return text;
  let out = String(text);
  out = localizeHandLabel(out, "en");
  const replacements = [
    [/Partida cerrada:/g, "Match over:"],
    [/Siguiente mano automatica\.\.\./g, "Next hand automatically..."],
    [/gana la mano/g, "wins the hand"],
    [/Mano empatada:/g, "Tied hand:"],
    [/gana por retirada general y recoge/g, "wins by full-table fold and collects"],
    [/Sin ganador/g, "No winner"],
    [/Sin showdown\./g, "No showdown."],
    [/gana showdown con/g, "wins showdown with"],
    [/Showdown empatado con/g, "Showdown tie with"],
    [/Bote (\d+)\. Reparto:/g, "Pot $1. Split:"],
    [/sin cambios/g, "no changes"],
    [/Ronda de descarte \(0 a 5 cartas\)\./g, "Discard round (0 to 5 cards)."],
    [/Ronda final de apuestas tras el descarte\./g, "Final betting round after the discard."],
    [/Fin de partida/g, "Match over"],
    [/gana por eliminacion\./g, "wins by elimination."],
    [/Stack final:/g, "Final stack:"],
    [/gana la mesa por eliminacion\./g, "wins the table by elimination."],
    [/Ciegas/g, "Blinds"],
    [/Mano (\d+): reparte/g, "Hand $1: dealt by"],
    [/Turno para/g, "Turn for"],
    [/Ya esta servido\./g, "Already stood pat."],
    [/Mantiene su mano\./g, "Keeps the hand."],
    [/Busca mejorar\./g, "Looks to improve."],
    [/Sube por valor\./g, "Raises for value."],
    [/Sube controlando riesgo\./g, "Raises while controlling risk."],
    [/Pasa\./g, "Checks."],
    [/All-in forzado\./g, "Forced all-in."],
    [/Resube fuerte\./g, "Strong re-raise."],
    [/Iguala con mano fuerte\./g, "Calls with a strong hand."],
    [/Iguala por precio\./g, "Calls for the price."],
    [/Retirada tactica\./g, "Tactical fold."],
    [/Defensa minima\./g, "Minimum defense."],
    [/No compensa pagar\./g, "Not worth calling."],
    [/Espera a que llegue tu turno\./g, "Wait for your turn."],
    [/No hay apuesta pendiente para igualar\./g, "There is no bet to call."],
    [/No tienes margen para subir\./g, "You don't have enough room to raise."],
    [/No tienes fichas para all-in\./g, "You don't have chips for an all-in."],
    [/Accion no valida\./g, "Invalid action."],
    [/Ya realizaste el descarte en esta mano\./g, "You already discarded in this hand."],
    [/Selecciona al menos una carta o pulsa Servirse\./g, "Select at least one card or press Stand pat."],
    [/Se retira\./g, "Folds."],
    [/se retira\./g, "folds."],
    [/iguala (\d+) ficha\(s\)\./g, "calls $1 chip(s)."],
    [/sube a (\d+)\./g, "raises to $1."],
    [/va all-in \((\d+)\)\./g, "goes all-in ($1)."],
    [/se retira en descarte\./g, "folds during discard."],
    [/descarta (\d+) carta\(s\)\./g, "discards $1 card(s)."],
    [/se sirve\./g, "stands pat."],
    [/se sirve sin descartar\./g, "stands pat without discarding."],
    [/actua\. Turno para/g, "acts. Turn for"],
    [/cierra su accion\./g, "closes the action."],
    [/Debes igualar (\d+) fichas o retirarte\./g, "You must call $1 chips or fold."],
    [/Debes igualar (\d+) ficha\(s\) para seguir\./g, "You must call $1 chip(s) to continue."],
    [/Sin apuesta pendiente: puedes pasar o subir\./g, "No pending bet: you can check or raise."],
    [/Situacion de apuesta:/g, "Betting situation:"],
    [/Espera tu turno para decidir apuesta\./g, "Wait for your turn to decide your bet."],
    [/Espera tu turno para descartar o servirte\./g, "Wait for your turn to discard or stand pat."],
    [/Acciones posibles:/g, "Possible actions:"],
    [/ninguna\./g, "none."],
    [/Ultimo cierre de mano/g, "Latest showdown"],
    [/Mano ganadora:/g, "Winning hand:"],
    [/Bote resuelto:/g, "Resolved pot:"],
    [/Pago:/g, "Payout:"],
    [/Mano:/g, "Hand:"],
    [/sin resolver/g, "unresolved"]
  ];
  for (const [pattern, value] of replacements) out = out.replace(pattern, value);
  out = out.replace(/\bTu\b/g, "You");
  out = out.replace(/\bIA\s+(\d+)\b/g, "AI $1");
  out = out.replace(/\bfichas\b/g, "chips");
  out = out.replace(/ficha\(s\)/g, "chip(s)");
  out = out.replace(/\bcarta\(s\)\b/g, "card(s)");
  return out;
};

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
const AI_SEAT_LAYOUTS = {
  1: [{ x: 50, y: 18 }],
  2: [{ x: 32, y: 20 }, { x: 68, y: 20 }],
  3: [{ x: 20, y: 24 }, { x: 50, y: 16 }, { x: 80, y: 24 }],
  4: [{ x: 14, y: 26 }, { x: 36, y: 16 }, { x: 64, y: 16 }, { x: 86, y: 26 }],
  5: [{ x: 10, y: 32 }, { x: 28, y: 20 }, { x: 50, y: 14 }, { x: 72, y: 20 }, { x: 90, y: 32 }],
  6: [{ x: 9, y: 36 }, { x: 24, y: 24 }, { x: 40, y: 16 }, { x: 60, y: 16 }, { x: 76, y: 24 }, { x: 91, y: 36 }],
  7: [{ x: 8, y: 39 }, { x: 20, y: 28 }, { x: 34, y: 19 }, { x: 50, y: 14 }, { x: 66, y: 19 }, { x: 80, y: 28 }, { x: 92, y: 39 }],
  8: [{ x: 8, y: 41 }, { x: 18, y: 31 }, { x: 30, y: 22 }, { x: 44, y: 15 }, { x: 56, y: 15 }, { x: 70, y: 22 }, { x: 82, y: 31 }, { x: 92, y: 41 }]
};
const seatPosition = (seat, total) => {
  if (seat === 0) return { x: 50, y: 87 };
  const aiCount = Math.max(1, total - 1);
  const index = Math.max(0, seat - 1);
  const layout = AI_SEAT_LAYOUTS[aiCount];
  if (layout?.[index]) return layout[index];
  if (aiCount === 1) return { x: 50, y: 18 };
  const ratio = index / (aiCount - 1);
  const arcLift = Math.sin(ratio * Math.PI);
  return {
    x: clampPercent(14 + ratio * 72, 10, 90),
    y: clampPercent(24 - arcLift * 7, 14, 30)
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
function PokerCard({ card, hidden = false, slot = false, selectable = false, selected = false, onClick, hiddenMark = "IA" }) {
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
        <span className="back-mark">{hiddenMark}</span>
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
  const locale = useMemo(resolveLocale, []);
  const ui = UI_COPY[locale] || UI_COPY.en;
  const aiLevelLabels = AI_LEVEL_LABELS[locale] || AI_LEVEL_LABELS.en;
  const phaseLabels = PHASE_LABELS[locale] || PHASE_LABELS.en;
  const rulesPrompt = RULES_PROMPT[locale] || RULES_PROMPT.en;
  const localizeText = useCallback((value) => localizeRuntimeText(value, locale), [locale]);
  const localizeName = useCallback((value) => localizePlayerName(value, locale), [locale]);
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
  const insight = useMemo(() => localizeHandLabel(evalFive(human.hand).label, locale), [human.hand, locale]);
  const recommended = useMemo(() => recommendedDiscardIndices(human.hand).map((index) => index + 1), [human.hand]);
  const actionsNow = useMemo(() => availableActions(state, 0), [state]);
  const localizedActionsNow = useMemo(() => actionsNow.map((action) => (ACTION_LABELS[locale] || ACTION_LABELS.en)[action] || action), [actionsNow, locale]);
  const roundCenterCards = useMemo(() => {
    if (state.mode === "hand-active") return [];
    const winnerSeat = state.lastResult?.winners?.[0];
    if (winnerSeat == null) return [];
    return (state.players[winnerSeat]?.hand || []).slice(0, HAND_CARDS);
  }, [state.mode, state.lastResult, state.players]);
  const contributionEntries = useMemo(() => {
    const useCurrentRound = state.mode === "hand-active";
    return state.players
      .filter((player) => !player.busted)
      .map((player) => ({
        seatIndex: player.seatIndex,
        name: player.name,
        amount: useCurrentRound ? player.currentBet : player.totalCommitted,
        isTurn: state.turnIndex === player.seatIndex && state.mode === "hand-active"
      }))
      .filter((entry) => entry.amount > 0);
  }, [state.mode, state.players, state.turnIndex]);

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
    rulesPrompt,
    scores: snapshot.players.map((player) => ({
      seatIndex: player.seatIndex,
      name: localizePlayerName(player.name, locale),
      chips: player.chips,
      handsWon: player.handsWon,
      currentBet: player.currentBet,
      totalCommitted: player.totalCommitted,
      busted: player.busted
    })),
    seats: snapshot.players.map((player) => ({
      seatIndex: player.seatIndex,
      name: localizePlayerName(player.name, locale),
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
    message: localizeRuntimeText(snapshot.message, locale)
  }), [aiThinking, locale, rulesPrompt]);
  useGameRuntimeBridge(state, bridgePayload, advanceTime);

  return (
    <div className="mini-game poker-holdem-game">
      <div className="mini-head">
        <div>
          <h4>{ui.headerTitle}</h4>
          <p>{ui.headerSubtitle}</p>
        </div>
        <div className="poker-head-actions">
          <button type="button" onClick={restartMatch}>{ui.newGame}</button>
        </div>
      </div>

      <div className="poker-config">
        <label htmlFor="poker-opponents">{ui.opponents}
          <select id="poker-opponents" value={pendingOpp} onChange={(event) => setPendingOpp(Number(event.target.value) || 1)}>
            {OPPONENT_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label htmlFor="poker-profile">{ui.aiProfile}
          <select id="poker-profile" value={pendingLevel} onChange={(event) => setPendingLevel(event.target.value)}>
            {Object.values(AI_LEVELS).map((entry) => <option key={entry.id} value={entry.id}>{aiLevelLabels[entry.id] || entry.label}</option>)}
          </select>
        </label>
        <label htmlFor="poker-stack">{ui.startingStack}
          <select id="poker-stack" value={pendingStack} onChange={(event) => handleStackChange(Number(event.target.value) || DEFAULT_STARTING_STACK)}>
            {STARTING_STACK_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label htmlFor="poker-blinds">{ui.blindLevel}
          <select id="poker-blinds" value={pendingBlindLevel} onChange={(event) => setPendingBlindLevel(event.target.value)}>
            {Object.values(BLIND_LEVELS).map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
          </select>
        </label>
        <label htmlFor="poker-target">{ui.chipTarget}
          <select id="poker-target" value={pendingTarget} onChange={(event) => setPendingTarget(Number(event.target.value) || DEFAULT_TARGET_CHIPS)}>
            {targetOptions.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <button type="button" className="poker-apply" onClick={applyConfiguration}>{ui.applyReset}</button>
      </div>

      <div className="status-row poker-status-row">
        <span className={`status-pill ${state.mode === "hand-active" ? "playing" : "finished"}`}>
          {state.mode === "hand-active" ? ui.inGame : state.mode === "match-over" ? ui.matchClosed : ui.handClosed}
        </span>
        <span>{ui.hand}: {state.handNumber}</span>
        <span>{ui.phase}: {phaseLabels[state.phase] || ui.showdownFallback}</span>
        <span>{ui.dealer}: {state.players[state.dealerIndex] ? localizeName(state.players[state.dealerIndex].name) : "--"}</span>
        <span>{ui.turn}: {state.turnIndex != null ? localizeName(state.players[state.turnIndex]?.name) : "--"}</span>
        <span>{ui.active}: {aliveSeats(state.players).length}</span>
        <span>{ui.pot}: {state.pot}</span>
        <span>{ui.bet}: {state.currentBet}</span>
        <span>{ui.blinds}: {activeBlind.label}</span>
        <span>{ui.target}: {state.targetChips}</span>
        <span>{ui.ai}: {aiLevelLabels[level.id] || level.label}</span>
        {aiThinking ? <span>{ui.aiThinking}</span> : null}
      </div>

      <div className="poker-scoreboard">
        {state.players.map((player) => (
          <article key={player.id} className="poker-score-card">
            <p>{localizeName(player.name)}</p>
            <strong>{player.chips}</strong>
            <span>{player.handsWon} {ui.hands}</span>
            <span>{ui.inRound}: {player.currentBet}</span>
          </article>
        ))}
      </div>

      <div className="poker-table">
        <div className="poker-round-table">
          <div className="poker-felt-ring" />
          {state.players.map((player) => {
            const humanSeat = player.type === "human";
            const compactAiSeat = !humanSeat && state.players.length > 5;
            const hidden = !humanSeat && state.mode === "hand-active";
            const isTurn = state.mode === "hand-active" && state.turnIndex === player.seatIndex;
            const isDealer = state.dealerIndex === player.seatIndex;
            const seat = seatPosition(player.seatIndex, state.players.length);
            const stackChips = Math.max(2, Math.min(10, Math.ceil(player.chips / Math.max(8, state.bigBlind * 2))));
            const statusLabel = player.busted ? ui.noChips : player.folded ? ui.folded : player.allIn ? "All-in" : isTurn ? ui.activeSeat : ui.inHand;
            return (
              <div key={player.id} className={["poker-table-seat", humanSeat ? "poker-player-seat" : "poker-ai-seat", compactAiSeat ? "compact-seat" : ""].filter(Boolean).join(" ")} style={{ "--seat-x": `${seat.x}%`, "--seat-y": `${seat.y}%` }}>
                <article className={["poker-seat", player.folded ? "folded" : "", isTurn ? "active-turn" : "", isDealer ? "dealer" : ""].filter(Boolean).join(" ")}>
                  <header><h5>{localizeName(player.name)}</h5><p>{statusLabel}</p></header>
                  <div className="seat-hand-shell">
                    <div className={`poker-hole-cards ${hidden ? "hidden-hand" : "shown-hand"}`}>
                      {Array.from({ length: HAND_CARDS }, (_, index) => (
                        <PokerCard
                          key={`${player.id}-${index}`}
                          card={player.hand[index]}
                          hidden={hidden}
                          selectable={humanSeat && canSelectDiscard}
                          selected={humanSeat && state.selectedDiscards[index]}
                          onClick={() => toggleDiscardSelection(index)}
                          hiddenMark={locale === "es" ? "IA" : "AI"}
                        />
                      ))}
                    </div>
                    <aside className="seat-stack-rail" aria-label={`${ui.chipsAriaPrefix} ${localizeName(player.name)}`}>
                      <div className="seat-stack-visual">
                        {Array.from({ length: stackChips }, (_, chipIndex) => (
                          <span key={`${player.id}-chip-${chipIndex}`} className="seat-stack-chip" style={{ "--chip-index": `${chipIndex}` }} />
                        ))}
                      </div>
                      <strong>{player.chips}</strong>
                      <small>{ui.chipsLabel}</small>
                    </aside>
                  </div>
                  <div className="seat-chip-row"><span>{ui.bet}: {player.currentBet}</span><span>{ui.committed}: {player.totalCommitted}</span></div>
                  <span className="swap-chip">{player.discarded ? `${ui.discardLabel}: ${player.discardCount}` : ui.discardPending}</span>
                  {player.intent ? <span className="swap-chip">{localizeText(player.intent)}</span> : null}
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
                return <span key={phase} className={["poker-phase-chip", active ? "active" : "", completed ? "completed" : ""].filter(Boolean).join(" ")}>{phaseLabels[phase]}</span>;
              })}
            </div>
            <div className="poker-pot-panel">
              <span>{ui.potTotal}</span>
              <strong>{state.pot}</strong>
              <span>{ui.currentBet}: {state.currentBet}</span>
              <span>{ui.blinds}: {state.smallBlind}/{state.bigBlind}</span>
            </div>
            <div className="poker-center-chip-flow">
              {contributionEntries.length ? (
                contributionEntries.map((entry, index) => (
                  <article
                    key={`contrib-${entry.seatIndex}-${state.handNumber}-${state.phase}`}
                    className={["poker-center-contribution", entry.isTurn ? "is-turn" : ""].filter(Boolean).join(" ")}
                    style={{ "--chip-delay": `${index * 120}ms` }}
                  >
                    <span className="chip-mini-stack" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                    <span className="chip-player">{localizeName(entry.name)}</span>
                    <strong>{entry.amount}</strong>
                  </article>
                ))
              ) : (
                <p className="poker-chip-flow-empty">{ui.noActiveChips}</p>
              )}
            </div>
            <p className="poker-round-cards-title">{ui.showdownCards}</p>
            <div className="poker-board-cards">
              {roundCenterCards.length
                ? roundCenterCards.map((card, index) => <PokerCard key={`round-${index}`} card={card} />)
                : Array.from({ length: HAND_CARDS }, (_, index) => <PokerCard key={`round-slot-${index}`} slot />)}
            </div>
          </div>

          {state.overlay ? (
            <div className={`poker-winner-overlay ${state.overlay.kind === "match" ? "match-end" : "hand-end"}`}>
              <div className="poker-winner-card">
                <p className="poker-winner-tag">{state.overlay.kind === "match" ? ui.matchEnd : ui.handEnd}</p>
                <h5>{localizeText(state.overlay.title)}</h5>
                <p>{localizeText(state.overlay.subtitle)}</p>
                {state.overlay.detail ? <strong>{localizeText(state.overlay.detail)}</strong> : null}
                {state.mode === "hand-over" ? <span>{ui.nextHandAuto}</span> : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="poker-actions-panel">
        {state.phase === "discard" ? (
          <>
            <button type="button" onClick={playerDiscardSelected} disabled={!canDiscardSelected}>{ui.actionDiscard} ({selectedDiscardCount})</button>
            <button type="button" onClick={playerStandPat} disabled={!canStand}>{ui.actionStand}</button>
            <button type="button" onClick={playerFold} disabled={!canSelectDiscard}>{ui.actionFold}</button>
          </>
        ) : (
          <>
            <button type="button" onClick={playerCheck} disabled={!canCheck}>{ui.actionCheck}</button>
            <button type="button" onClick={playerCall} disabled={!canCall}>{ui.actionCall} ({toCall})</button>
            <button type="button" onClick={playerRaise} disabled={!canRaise}>{ui.actionRaise} (+{state.bigBlind})</button>
            <button type="button" onClick={playerAllIn} disabled={!canAllIn}>All-in</button>
            <button type="button" onClick={playerFold} disabled={!canFold}>{ui.actionFold}</button>
          </>
        )}
      </div>
      <div className="poker-table-meta">
        <ul className="poker-discard-status">
          {state.players.map((player) => <li key={`discard-${player.id}`}>{localizeName(player.name)}: {player.discarded ? `${player.discardCount} ${locale === "es" ? "carta(s)" : "card(s)"}` : localizeText("sin resolver")}</li>)}
        </ul>
        <p className="poker-bet-note">{ui.minRaise}: +{state.bigBlind} {ui.chipsLabel}.</p>
        <p className="poker-bet-note">{toCall > 0 ? `${ui.mustCall} ${toCall} ${locale === "es" ? "ficha(s)" : "chip(s)"} ${locale === "es" ? "para seguir." : "to continue."}` : ui.noBetPending}</p>
      </div>

      <p className="poker-hand-insight">
        {ui.handRead}: {insight}.{" "}
        {state.phase === "discard"
          ? (canSelectDiscard
            ? `${ui.selectCardsHint}: ${recommended.length ? recommended.join(", ") : ui.standPatHint}.`
            : ui.waitDiscard)
          : (canBetAct
            ? `${ui.betSituation}: ${toCall > 0 ? `${ui.mustCall.toLowerCase()} ${toCall}` : locale === "es" ? "puedes pasar" : "you can check"} ${locale === "es" ? "con stack" : "with stack"} ${human.chips}.`
            : ui.waitBet)}
        {" "}{ui.possibleActions}: {localizedActionsNow.length ? localizedActionsNow.join(", ") : ui.noActions}.
      </p>

      {state.lastResult ? (
        <div className="poker-showdown">
          <h5>{ui.lastShowdown}</h5>
          <p>{localizeText(state.lastResult.reason)}</p>
          {state.lastResult.handLabel ? <p>{ui.winningHand}: {localizeHandLabel(state.lastResult.handLabel, locale)}</p> : null}
          {state.lastResult.pot != null ? <p>{ui.resolvedPot}: {state.lastResult.pot}</p> : null}
          {state.lastResult.showdown?.length ? (
            <ul>
              {state.lastResult.showdown.map((entry) => (
                <li key={`show-${entry.seatIndex}`}>{localizeName(entry.name)}: {localizeHandLabel(entry.handLabel, locale)} | {ui.handLabelInResult}: {entry.hole.join(" ")} | {ui.payoutLabel}: +{entry.payout ?? 0}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <details className="poker-rules">
        <summary>{ui.activeRules}</summary>
        <pre>{rulesPrompt}</pre>
      </details>

      <p className="game-message">{localizeText(state.message)}</p>
      <ul className="game-log">{state.logs.map((entry, index) => <li key={`log-${index}`}>{localizeText(entry)}</li>)}</ul>
    </div>
  );
}

export default PokerTexasHoldemGame;
