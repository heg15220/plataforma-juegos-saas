import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useGameRuntimeBridge from "../utils/useGameRuntimeBridge";

const MAX_PIP = 6;
const PLAYER_HAND_SIZE = 14;
const DEFAULT_TARGET_SCORE = 100;
const MAX_LOG_LINES = 12;
const TARGET_SCORE_OPTIONS = [50, 100, 150, 200];

const AI_LEVELS = {
  easy: { id: "easy", label: "Facil", thinkMs: 520 },
  medium: { id: "medium", label: "Media", thinkMs: 860 },
  hard: { id: "hard", label: "Dificil", thinkMs: 1180 }
};

const RULES_PROMPT = `MODALIDAD ACTIVA: DOMINO 7+7 (contra robots)
- Set doble-seis (28 fichas, del 0 al 6).
- Cada lado juega 14 fichas (7+7), sin robo del monton.
- Ronda 1: abre el doble mas alto (si no hay dobles, la ficha mas alta).
- Rondas siguientes: la salida alterna entre jugadores.
- En cada turno solo se juega en extremos que coincidan.
- Si no hay jugada legal, se pasa.
- Los dobles se representan perpendiculares en la mesa.

CIERRE Y PUNTUACION
- Dominio: quien se queda sin fichas suma los puntos de la mano rival.
- Tranca: tras dos pases seguidos, gana quien tenga menos puntos en mano.
- En tranca, el ganador suma la puntuacion total bloqueada (suma de ambas manos).
- La partida termina al alcanzar la meta de puntos.`;

const PIP_LAYOUTS = {
  0: [],
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]]
};

function DominoPips({ value }) {
  const layout = PIP_LAYOUTS[value] ?? [];
  return (
    <span className="domino-pips" aria-hidden="true">
      {layout.map(([x, y], index) => (
        <span
          key={`${value}-${index}`}
          className="domino-pip"
          style={{ "--x": `${x}%`, "--y": `${y}%` }}
        />
      ))}
    </span>
  );
}

const cloneTiles = (tiles) => tiles.map((tile) => ({ ...tile }));

const safeNumber = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return numeric;
};

const formatTile = (tile) => `${tile.a}|${tile.b}`;
const appendLog = (logs, text) => [text, ...logs].slice(0, MAX_LOG_LINES);
const sumHand = (hand) => hand.reduce((total, tile) => total + tile.a + tile.b, 0);
const getEdges = (chain) => ({ left: chain[0]?.left ?? null, right: chain[chain.length - 1]?.right ?? null });

const createDeck = () => {
  const deck = [];
  let sequence = 0;
  for (let left = 0; left <= MAX_PIP; left += 1) {
    for (let right = left; right <= MAX_PIP; right += 1) {
      deck.push({ id: `d-${sequence}`, a: left, b: right });
      sequence += 1;
    }
  }
  return deck;
};

const shuffleDeck = (source) => {
  const deck = cloneTiles(source);
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }
  return deck;
};

const openingPriority = (tile) => {
  const isDouble = tile.a === tile.b ? 100 : 0;
  return isDouble + tile.a + tile.b + Math.max(tile.a, tile.b) * 0.01;
};

const pickOpeningMove = (playerHand, aiHand) => {
  const candidates = [];
  playerHand.forEach((tile, index) => {
    candidates.push({ owner: "player", tile, index, priority: openingPriority(tile) });
  });
  aiHand.forEach((tile, index) => {
    candidates.push({ owner: "ai", tile, index, priority: openingPriority(tile) });
  });
  candidates.sort((first, second) => second.priority - first.priority);
  return candidates[0] ?? null;
};

const pickOpeningMoveForStarter = (owner, playerHand, aiHand) => {
  const hand = owner === "player" ? playerHand : aiHand;
  if (!hand.length) return null;
  let bestIndex = 0;
  let bestPriority = openingPriority(hand[0]);
  for (let index = 1; index < hand.length; index += 1) {
    const currentPriority = openingPriority(hand[index]);
    if (currentPriority > bestPriority) {
      bestPriority = currentPriority;
      bestIndex = index;
    }
  }
  return { owner, tile: hand[bestIndex], index: bestIndex, priority: bestPriority };
};

const pickOpeningByRound = ({ roundNumber, starter, playerHand, aiHand }) => {
  if (roundNumber <= 1 || !starter) {
    return pickOpeningMove(playerHand, aiHand);
  }
  return pickOpeningMoveForStarter(starter, playerHand, aiHand);
};

const getPlacementsForTile = (tile, chain) => {
  if (!tile || !chain.length) return [];
  const edges = getEdges(chain);
  const placements = [];

  if (tile.a === edges.left) {
    placements.push({ index: -1, side: "left", tile, oriented: { id: tile.id, left: tile.b, right: tile.a } });
  }
  if (tile.b === edges.left && tile.b !== tile.a) {
    placements.push({ index: -1, side: "left", tile, oriented: { id: tile.id, left: tile.a, right: tile.b } });
  }
  if (tile.a === edges.right) {
    placements.push({ index: -1, side: "right", tile, oriented: { id: tile.id, left: tile.a, right: tile.b } });
  }
  if (tile.b === edges.right && tile.b !== tile.a) {
    placements.push({ index: -1, side: "right", tile, oriented: { id: tile.id, left: tile.b, right: tile.a } });
  }

  return placements;
};

const collectLegalMoves = (hand, chain) => {
  const moves = [];
  hand.forEach((tile, index) => {
    const placements = getPlacementsForTile(tile, chain);
    placements.forEach((placement) => {
      moves.push({ ...placement, index });
    });
  });
  return moves;
};

const applyMoveToChain = (chain, move) => (
  move.side === "left"
    ? [{ ...move.oriented }, ...chain]
    : [...chain, { ...move.oriented }]
);

const removeHandIndex = (hand, index) => hand.filter((_, handIndex) => handIndex !== index);

const clampSelectedIndex = (index, handLength) => {
  if (!handLength) return 0;
  if (index < 0) return 0;
  if (index >= handLength) return handLength - 1;
  return index;
};

const resolveBlockedWinner = (playerHand, aiHand) => {
  const playerPoints = sumHand(playerHand);
  const aiPoints = sumHand(aiHand);
  if (playerPoints < aiPoints) return { winner: "player", reason: "block", playerPoints, aiPoints };
  if (aiPoints < playerPoints) return { winner: "ai", reason: "block", playerPoints, aiPoints };
  return { winner: "draw", reason: "block", playerPoints, aiPoints };
};

const describeRoundOutcome = (outcome, pointsAwarded) => {
  if (outcome.winner === "draw") {
    return `Tranca con empate (${outcome.playerPoints}-${outcome.aiPoints}). Sin puntos.`;
  }
  const winnerLabel = outcome.winner === "player" ? "Tu" : "La IA";
  if (outcome.reason === "domino") {
    return `${winnerLabel} domino la ronda y suma ${pointsAwarded} puntos.`;
  }
  return `${winnerLabel} gana por tranca (${outcome.playerPoints}-${outcome.aiPoints}) y suma ${pointsAwarded} puntos (total bloqueado).`;
};
const createNodeFromState = (state) => ({
  turn: state.turn,
  chain: cloneTiles(state.chain),
  playerHand: cloneTiles(state.playerHand),
  aiHand: cloneTiles(state.aiHand),
  consecutivePasses: state.consecutivePasses
});

const detectNodeTerminal = (node) => {
  if (node.aiHand.length === 0) return { winner: "ai", reason: "domino" };
  if (node.playerHand.length === 0) return { winner: "player", reason: "domino" };
  if (node.consecutivePasses >= 2) return resolveBlockedWinner(node.playerHand, node.aiHand);
  return null;
};

const evaluateNode = (node, terminal) => {
  if (terminal) {
    if (terminal.winner === "ai") return 20000 - sumHand(node.aiHand) * 4;
    if (terminal.winner === "player") return -20000 + sumHand(node.playerHand) * 4;
    return -Math.abs(sumHand(node.aiHand) - sumHand(node.playerHand));
  }

  const aiPips = sumHand(node.aiHand);
  const playerPips = sumHand(node.playerHand);
  const aiMobility = collectLegalMoves(node.aiHand, node.chain).length;
  const playerMobility = collectLegalMoves(node.playerHand, node.chain).length;
  const edges = getEdges(node.chain);
  const aiEdgeControl = node.aiHand.reduce((count, tile) => (
    count + Number(tile.a === edges.left || tile.b === edges.left || tile.a === edges.right || tile.b === edges.right)
  ), 0);
  const playerEdgeControl = node.playerHand.reduce((count, tile) => (
    count + Number(tile.a === edges.left || tile.b === edges.left || tile.a === edges.right || tile.b === edges.right)
  ), 0);

  return (
    (playerPips - aiPips) * 4 +
    (aiMobility - playerMobility) * 2.4 +
    (aiEdgeControl - playerEdgeControl) * 0.9 -
    node.consecutivePasses * 0.45
  );
};

const applyNodePass = (node) => ({
  ...node,
  turn: node.turn === "ai" ? "player" : "ai",
  consecutivePasses: node.consecutivePasses + 1
});

const applyNodeMove = (node, move) => {
  const handKey = node.turn === "ai" ? "aiHand" : "playerHand";
  const nextHand = removeHandIndex(node[handKey], move.index);
  return {
    ...node,
    chain: applyMoveToChain(node.chain, move),
    [handKey]: nextHand,
    turn: node.turn === "ai" ? "player" : "ai",
    consecutivePasses: 0
  };
};

const minimax = (node, depth, alpha, beta) => {
  const terminal = detectNodeTerminal(node);
  if (terminal || depth <= 0) {
    return evaluateNode(node, terminal);
  }

  const hand = node.turn === "ai" ? node.aiHand : node.playerHand;
  const legalMoves = collectLegalMoves(hand, node.chain);
  const nextNodes = legalMoves.length ? legalMoves.map((move) => applyNodeMove(node, move)) : [applyNodePass(node)];

  if (node.turn === "ai") {
    let best = -Infinity;
    for (const nextNode of nextNodes) {
      const score = minimax(nextNode, depth - 1, alpha, beta);
      best = Math.max(best, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return best;
  }

  let best = Infinity;
  for (const nextNode of nextNodes) {
    const score = minimax(nextNode, depth - 1, alpha, beta);
    best = Math.min(best, score);
    beta = Math.min(beta, score);
    if (beta <= alpha) break;
  }
  return best;
};

const pickAiMove = (state, legalMoves) => {
  if (!legalMoves.length) return null;
  const difficulty = AI_LEVELS[state.difficultyId] ?? AI_LEVELS.medium;

  if (difficulty.id === "easy") {
    const index = (state.turnCount + state.roundNumber + state.chain.length) % legalMoves.length;
    return legalMoves[index];
  }

  if (difficulty.id === "medium") {
    let bestMove = legalMoves[0];
    let bestScore = -Infinity;
    legalMoves.forEach((move) => {
      const nextNode = applyNodeMove(createNodeFromState(state), move);
      const terminal = detectNodeTerminal(nextNode);
      let score = evaluateNode(nextNode, terminal);
      const replyCount = collectLegalMoves(nextNode.playerHand, nextNode.chain).length;
      if (replyCount === 0) score += 10;
      if (move.tile.a === move.tile.b) score += 0.5;
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    });
    return bestMove;
  }

  let bestMove = legalMoves[0];
  let bestScore = -Infinity;
  legalMoves.forEach((move) => {
    const nextNode = applyNodeMove(createNodeFromState(state), move);
    const score = minimax(nextNode, 2, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  });
  return bestMove;
};

const createRoundState = ({ scores, targetScore, difficultyId, roundNumber, starter = null }) => {
  const shuffled = shuffleDeck(createDeck());
  let playerHand = shuffled.slice(0, PLAYER_HAND_SIZE);
  let aiHand = shuffled.slice(PLAYER_HAND_SIZE);
  const opening = pickOpeningByRound({ roundNumber, starter, playerHand, aiHand });

  if (!opening) {
    return {
      phase: "round-over",
      roundNumber,
      scores: { ...scores },
      targetScore,
      difficultyId,
      turn: null,
      chain: [],
      playerHand: [],
      aiHand: [],
      selectedIndex: 0,
      selectedSide: "left",
      consecutivePasses: 0,
      roundResult: null,
      nextStarter: starter,
      turnCount: 0,
      message: "No se pudo iniciar la ronda.",
      logs: ["No se pudo iniciar la ronda."]
    };
  }

  const openingTile = { ...opening.tile };
  const openingChain = [{ id: openingTile.id, left: openingTile.a, right: openingTile.b }];
  if (opening.owner === "player") playerHand = removeHandIndex(playerHand, opening.index);
  else aiHand = removeHandIndex(aiHand, opening.index);

  const openerLabel = opening.owner === "player" ? "Tu" : "IA";
  const firstMessage =
    roundNumber <= 1
      ? `Ronda ${roundNumber}: abre ${openerLabel} con ${formatTile(openingTile)}.`
      : `Ronda ${roundNumber}: salida para ${openerLabel} con ${formatTile(openingTile)}.`;
  return {
    phase: "playing",
    roundNumber,
    scores: { ...scores },
    targetScore,
    difficultyId,
    turn: opening.owner === "player" ? "ai" : "player",
    chain: openingChain,
    playerHand,
    aiHand,
    selectedIndex: 0,
    selectedSide: "left",
    consecutivePasses: 0,
    roundResult: null,
    nextStarter: opening.owner === "player" ? "ai" : "player",
    turnCount: 1,
    message: firstMessage,
    logs: [firstMessage]
  };
};

const finishRound = (state, outcome) => {
  const nextScores = { ...state.scores };
  let pointsAwarded = 0;
  const blockedTotal = sumHand(state.playerHand) + sumHand(state.aiHand);
  if (outcome.winner === "player") {
    pointsAwarded = outcome.reason === "block" ? blockedTotal : sumHand(state.aiHand);
    nextScores.player += pointsAwarded;
  } else if (outcome.winner === "ai") {
    pointsAwarded = outcome.reason === "block" ? blockedTotal : sumHand(state.playerHand);
    nextScores.ai += pointsAwarded;
  }

  let matchWinner = null;
  if (nextScores.player >= state.targetScore || nextScores.ai >= state.targetScore) {
    if (nextScores.player > nextScores.ai) matchWinner = "player";
    else if (nextScores.ai > nextScores.player) matchWinner = "ai";
    else matchWinner = "draw";
  }

  const summary = describeRoundOutcome(outcome, pointsAwarded);
  const message =
    matchWinner == null
      ? `${summary} Pulsa \"Siguiente ronda\".`
      : matchWinner === "draw"
        ? `${summary} La partida global termina en empate.`
        : `${summary} ${matchWinner === "player" ? "Tu" : "La IA"} gana la partida global.`;

  return {
    ...state,
    phase: matchWinner == null ? "round-over" : "match-over",
    turn: null,
    scores: nextScores,
    roundResult: { ...outcome, pointsAwarded, matchWinner },
    message,
    logs: appendLog(state.logs, summary)
  };
};
function DominoStrategyGame() {
  const [state, setState] = useState(() => createRoundState({
    scores: { player: 0, ai: 0 },
    targetScore: DEFAULT_TARGET_SCORE,
    difficultyId: "medium",
    roundNumber: 1,
    starter: null
  }));
  const [aiThinking, setAiThinking] = useState(false);

  const aiPendingRef = useRef(false);
  const aiDelayRef = useRef(0);
  const frameRef = useRef(0);
  const lastFrameRef = useRef(0);

  const stopAiThinking = useCallback(() => {
    aiPendingRef.current = false;
    aiDelayRef.current = 0;
    setAiThinking(false);
  }, []);

  const restartMatch = useCallback(() => {
    setState((previous) => createRoundState({
      scores: { player: 0, ai: 0 },
      targetScore: previous.targetScore,
      difficultyId: previous.difficultyId,
      roundNumber: 1,
      starter: null
    }));
  }, []);

  const startNextRound = useCallback(() => {
    setState((previous) => {
      if (previous.phase !== "round-over") return previous;
      return createRoundState({
        scores: previous.scores,
        targetScore: previous.targetScore,
        difficultyId: previous.difficultyId,
        roundNumber: previous.roundNumber + 1,
        starter: previous.nextStarter
      });
    });
  }, []);

  const playSelectedTile = useCallback(() => {
    setState((previous) => {
      if (previous.phase !== "playing" || previous.turn !== "player") return previous;
      const selected = previous.playerHand[previous.selectedIndex];
      if (!selected) return { ...previous, message: "Selecciona una ficha para jugar." };

      const legalPlacements = getPlacementsForTile(selected, previous.chain);
      if (!legalPlacements.length) {
        return { ...previous, message: `La ficha ${formatTile(selected)} no encaja. Pulsa Pasar.` };
      }

      const placement =
        legalPlacements.find((candidate) => candidate.side === previous.selectedSide) ??
        (legalPlacements.length === 1 ? legalPlacements[0] : null);
      if (!placement) {
        return { ...previous, message: "Esa ficha encaja solo en el otro extremo." };
      }

      const move = { ...placement, index: previous.selectedIndex };
      const nextHand = removeHandIndex(previous.playerHand, previous.selectedIndex);
      const nextState = {
        ...previous,
        chain: applyMoveToChain(previous.chain, move),
        playerHand: nextHand,
        selectedIndex: clampSelectedIndex(previous.selectedIndex, nextHand.length),
        turn: "ai",
        consecutivePasses: 0,
        turnCount: previous.turnCount + 1,
        message: `Juegas ${formatTile(selected)} por ${move.side === "left" ? "izquierda" : "derecha"}.`,
        logs: appendLog(previous.logs, `Tu: ${formatTile(selected)} -> ${move.side === "left" ? "izquierda" : "derecha"}`)
      };
      return nextHand.length ? nextState : finishRound(nextState, { winner: "player", reason: "domino" });
    });
  }, []);

  const passTurn = useCallback(() => {
    setState((previous) => {
      if (previous.phase !== "playing" || previous.turn !== "player") return previous;
      if (collectLegalMoves(previous.playerHand, previous.chain).length) {
        return { ...previous, message: "Tienes jugadas legales. No puedes pasar." };
      }

      const consecutivePasses = previous.consecutivePasses + 1;
      if (consecutivePasses >= 2) {
        return finishRound(
          { ...previous, consecutivePasses, logs: appendLog(previous.logs, "Tu pasas. Se activa tranca.") },
          resolveBlockedWinner(previous.playerHand, previous.aiHand)
        );
      }

      return {
        ...previous,
        turn: "ai",
        consecutivePasses,
        turnCount: previous.turnCount + 1,
        message: "Pasas turno. Juega la IA.",
        logs: appendLog(previous.logs, "Tu pasas turno.")
      };
    });
  }, []);

  const runAiTurn = useCallback(() => {
    setState((previous) => {
      if (previous.phase !== "playing" || previous.turn !== "ai") return previous;
      const legalMoves = collectLegalMoves(previous.aiHand, previous.chain);

      if (!legalMoves.length) {
        const consecutivePasses = previous.consecutivePasses + 1;
        if (consecutivePasses >= 2) {
          return finishRound(
            { ...previous, consecutivePasses, logs: appendLog(previous.logs, "IA pasa. Se activa tranca.") },
            resolveBlockedWinner(previous.playerHand, previous.aiHand)
          );
        }
        return {
          ...previous,
          turn: "player",
          consecutivePasses,
          turnCount: previous.turnCount + 1,
          message: "La IA pasa. Te toca.",
          logs: appendLog(previous.logs, "IA pasa turno.")
        };
      }

      const move = pickAiMove(previous, legalMoves);
      if (!move) return previous;
      const tile = previous.aiHand[move.index];
      const nextAiHand = removeHandIndex(previous.aiHand, move.index);
      const nextState = {
        ...previous,
        aiHand: nextAiHand,
        chain: applyMoveToChain(previous.chain, move),
        turn: "player",
        consecutivePasses: 0,
        turnCount: previous.turnCount + 1,
        message: `IA juega ${formatTile(tile)} por ${move.side === "left" ? "izquierda" : "derecha"}.`,
        logs: appendLog(previous.logs, `IA: ${formatTile(tile)} -> ${move.side === "left" ? "izquierda" : "derecha"}`)
      };
      return nextAiHand.length ? nextState : finishRound(nextState, { winner: "ai", reason: "domino" });
    });
  }, []);

  const shiftSelection = useCallback((delta) => {
    setState((previous) => {
      if (!previous.playerHand.length) return previous;
      const nextIndex = (previous.selectedIndex + delta + previous.playerHand.length) % previous.playerHand.length;
      return { ...previous, selectedIndex: nextIndex };
    });
  }, []);

  const tickAi = useCallback((ms) => {
    if (!aiPendingRef.current) return;
    aiDelayRef.current -= ms;
    if (aiDelayRef.current <= 0) {
      aiPendingRef.current = false;
      aiDelayRef.current = 0;
      setAiThinking(false);
      runAiTurn();
    }
  }, [runAiTurn]);

  const advanceTime = useCallback((ms) => {
    let remaining = safeNumber(ms);
    while (remaining > 0 && aiPendingRef.current) {
      const step = Math.min(80, remaining);
      tickAi(step);
      remaining -= step;
    }
  }, [tickAi]);

  useEffect(() => {
    if (state.phase !== "playing" || state.turn !== "ai") {
      stopAiThinking();
      return;
    }
    aiPendingRef.current = true;
    aiDelayRef.current = (AI_LEVELS[state.difficultyId] ?? AI_LEVELS.medium).thinkMs;
    setAiThinking(true);
  }, [state.phase, state.turn, state.difficultyId, state.roundNumber, stopAiThinking]);

  useEffect(() => {
    const animate = (timestamp) => {
      if (!lastFrameRef.current) lastFrameRef.current = timestamp;
      const delta = Math.min(120, timestamp - lastFrameRef.current);
      lastFrameRef.current = timestamp;
      tickAi(delta);
      frameRef.current = window.requestAnimationFrame(animate);
    };
    frameRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [tickAi]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const tag = event.target?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;

      const key = event.key;
      const normalized = key.toLowerCase();
      if (key === "ArrowLeft") {
        event.preventDefault();
        shiftSelection(-1);
        return;
      }
      if (key === "ArrowRight") {
        event.preventDefault();
        shiftSelection(1);
        return;
      }
      if (key === "ArrowUp") {
        event.preventDefault();
        setState((previous) => ({ ...previous, selectedSide: "left" }));
        return;
      }
      if (key === "ArrowDown") {
        event.preventDefault();
        setState((previous) => ({ ...previous, selectedSide: "right" }));
        return;
      }
      if (key === "Enter" || key === " ") {
        event.preventDefault();
        playSelectedTile();
        return;
      }
      if (normalized === "p") {
        event.preventDefault();
        passTurn();
        return;
      }
      if (normalized === "n") {
        event.preventDefault();
        if (state.phase === "round-over") startNextRound();
        else if (state.phase === "match-over") restartMatch();
        return;
      }
      if (normalized === "r") {
        event.preventDefault();
        restartMatch();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [passTurn, playSelectedTile, restartMatch, shiftSelection, startNextRound, state.phase]);
  const selectedTile = useMemo(() => state.playerHand[state.selectedIndex] ?? null, [state.playerHand, state.selectedIndex]);
  const selectedPlacements = useMemo(
    () => (selectedTile ? getPlacementsForTile(selectedTile, state.chain) : []),
    [selectedTile, state.chain]
  );
  const playerLegalMoves = useMemo(() => collectLegalMoves(state.playerHand, state.chain), [state.playerHand, state.chain]);
  const playableSidesByTileId = useMemo(() => {
    const sideMap = new Map();
    state.playerHand.forEach((tile) => {
      const sides = [...new Set(getPlacementsForTile(tile, state.chain).map((placement) => placement.side))];
      sideMap.set(tile.id, sides);
    });
    return sideMap;
  }, [state.playerHand, state.chain]);

  const canPlayerPlay = state.phase === "playing" && state.turn === "player";
  const canPlayerPass = canPlayerPlay && playerLegalMoves.length === 0;
  const canAdjustTarget = state.scores.player === 0 && state.scores.ai === 0 && state.roundNumber === 1;

  const bridgeState = useMemo(() => ({ ...state, aiThinking }), [state, aiThinking]);
  const payloadBuilder = useCallback((snapshot) => ({
    mode: "strategy-domino-classic",
    variant: "domino-7-plus-7",
    coordinates: "chain_order_left_to_right",
    phase: snapshot.phase,
    round: snapshot.roundNumber,
    targetScore: snapshot.targetScore,
    difficulty: snapshot.difficultyId,
    turn: snapshot.turn,
    aiThinking: snapshot.aiThinking,
    consecutivePasses: snapshot.consecutivePasses,
    nextStarter: snapshot.nextStarter,
    scores: snapshot.scores,
    edges: getEdges(snapshot.chain),
    chain: snapshot.chain.map((tile) => [tile.left, tile.right]),
    playerHand: snapshot.playerHand.map((tile) => [tile.a, tile.b]),
    playerHandCount: snapshot.playerHand.length,
    aiHandCount: snapshot.aiHand.length,
    selectedIndex: snapshot.selectedIndex,
    selectedSide: snapshot.selectedSide,
    legalMovesPlayer: collectLegalMoves(snapshot.playerHand, snapshot.chain).map((move) => ({
      index: move.index,
      side: move.side,
      tile: [move.tile.a, move.tile.b]
    })),
    roundResult: snapshot.roundResult,
    message: snapshot.message,
    logs: snapshot.logs.slice(0, 6)
  }), []);
  useGameRuntimeBridge(bridgeState, payloadBuilder, advanceTime);

  const phaseLabel =
    state.phase === "playing"
      ? "En juego"
      : state.phase === "round-over"
        ? "Ronda cerrada"
        : "Partida cerrada";

  return (
    <div className="mini-game domino-strategy-game">
      <div className="mini-head">
        <div>
          <h4>Domino Clasico Arena</h4>
          <p>Partida completa por rondas contra IA con niveles de dificultad y cierre por tranca.</p>
        </div>
        <div className="domino-strategy-actions">
          <button type="button" onClick={restartMatch}>Nueva partida</button>
          {state.phase === "round-over" ? <button type="button" onClick={startNextRound}>Siguiente ronda</button> : null}
          {state.phase === "match-over" ? <button type="button" onClick={restartMatch}>Revancha</button> : null}
        </div>
      </div>

      <div className="domino-strategy-config">
        <label htmlFor="domino-ai-level">
          Dificultad IA
          <select
            id="domino-ai-level"
            value={state.difficultyId}
            onChange={(event) => {
              const value = event.target.value;
              if (!AI_LEVELS[value]) return;
              setState((previous) => ({ ...previous, difficultyId: value }));
            }}
          >
            {Object.values(AI_LEVELS).map((level) => (
              <option key={level.id} value={level.id}>{level.label}</option>
            ))}
          </select>
        </label>

        <label htmlFor="domino-target-score">
          Puntuacion objetivo
          <select
            id="domino-target-score"
            value={state.targetScore}
            disabled={!canAdjustTarget}
            onChange={(event) => {
              const nextTarget = Number(event.target.value) || DEFAULT_TARGET_SCORE;
              setState((previous) => ({ ...previous, targetScore: nextTarget }));
            }}
          >
            {TARGET_SCORE_OPTIONS.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>

        <p className="domino-config-note">
          Controles: flechas para seleccionar ficha y lado, Enter para jugar, P para pasar, N para avanzar ronda y R para reiniciar.
        </p>
      </div>

      <div className="status-row">
        <span className={`status-pill ${state.phase === "playing" ? "playing" : "finished"}`}>{phaseLabel}</span>
        <span>Ronda: {state.roundNumber}</span>
        <span>Turno: {state.turn === "player" ? "Tu" : state.turn === "ai" ? "IA" : "cerrado"}</span>
        <span>Dificultad: {AI_LEVELS[state.difficultyId]?.label || AI_LEVELS.medium.label}</span>
        <span>Pases seguidos: {state.consecutivePasses}</span>
        <span>Salida sig.: {state.nextStarter === "player" ? "Tu" : "IA"}</span>
        {aiThinking ? <span>IA pensando...</span> : null}
      </div>

      <div className="domino-scoreboard">
        <article className="domino-scorecard"><p>Tu marcador</p><strong>{state.scores.player}</strong></article>
        <article className="domino-scorecard"><p>Marcador IA</p><strong>{state.scores.ai}</strong></article>
        <article className="domino-scorecard"><p>Meta</p><strong>{state.targetScore}</strong></article>
      </div>

      <div className="domino-table">
        <div className="domino-table-head">
          <span className="domino-variant-chip">Modalidad 7+7</span>
          <span className="domino-table-note">Dobles perpendiculares | Tranca puntua total bloqueado</span>
        </div>
        <div className="domino-edge-readout">
          <span>Extremo izq: {state.chain[0]?.left ?? "--"}</span>
          <span>Extremo der: {state.chain[state.chain.length - 1]?.right ?? "--"}</span>
        </div>
        <div className="domino-chain" role="list" aria-label="Cadena de domino en mesa">
          {state.chain.map((tile, index) => (
            <span
              key={`${tile.id}-${index}`}
              role="listitem"
              className={[
                "domino-tile",
                tile.left === tile.right ? "is-double" : "",
                index === 0 && state.selectedSide === "left" ? "active-edge" : "",
                index === state.chain.length - 1 && state.selectedSide === "right" ? "active-edge" : ""
              ].filter(Boolean).join(" ")}
            >
              <span className="domino-half"><DominoPips value={tile.left} /><strong>{tile.left}</strong></span>
              <span className="domino-divider" />
              <span className="domino-half"><DominoPips value={tile.right} /><strong>{tile.right}</strong></span>
            </span>
          ))}
        </div>
      </div>

      <div className="domino-player-zones">
        <section className="domino-zone">
          <h5>Mano IA ({state.aiHand.length})</h5>
          <div className="domino-hand domino-ai-hand">
            {state.aiHand.map((tile, index) => (
              <span key={`${tile.id}-${index}`} className="domino-hand-tile domino-back" aria-label="Ficha IA oculta">
                <span className="domino-half" />
                <span className="domino-divider" />
                <span className="domino-half" />
              </span>
            ))}
          </div>
        </section>

        <section className="domino-zone">
          <h5>Tu mano ({state.playerHand.length})</h5>
          <div className="domino-hand" aria-label="Fichas del jugador">
            {state.playerHand.map((tile, index) => {
              const playableSides = playableSidesByTileId.get(tile.id) || [];
              const sideHint =
                playableSides.length >= 2
                  ? "L/R"
                  : playableSides[0] === "left"
                    ? "L"
                    : playableSides[0] === "right"
                      ? "R"
                      : "";

              return (
                <button
                  key={tile.id}
                  type="button"
                  disabled={!canPlayerPlay}
                  className={[
                    "domino-hand-tile",
                    tile.a === tile.b ? "is-double" : "",
                    playableSides.length ? "playable" : "",
                    index === state.selectedIndex ? "selected" : ""
                  ].filter(Boolean).join(" ")}
                  onClick={() => setState((previous) => ({
                    ...previous,
                    selectedIndex: clampSelectedIndex(index, previous.playerHand.length)
                  }))}
                >
                  {canPlayerPlay && sideHint ? <span className="domino-legal-hint">{sideHint}</span> : null}
                  <span className="domino-half"><DominoPips value={tile.a} /><strong>{tile.a}</strong></span>
                  <span className="domino-divider" />
                  <span className="domino-half"><DominoPips value={tile.b} /><strong>{tile.b}</strong></span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="domino-toolbar">
        <span>Lado activo: {state.selectedSide === "left" ? "izquierda" : "derecha"}</span>
        <button type="button" onClick={() => setState((previous) => ({ ...previous, selectedSide: "left" }))}>Izquierda</button>
        <button type="button" onClick={() => setState((previous) => ({ ...previous, selectedSide: "right" }))}>Derecha</button>
        <button type="button" onClick={playSelectedTile} disabled={!canPlayerPlay}>Jugar ficha</button>
        <button type="button" onClick={passTurn} disabled={!canPlayerPass}>Pasar turno</button>
      </div>

      <p className="domino-selected">
        Seleccion: {selectedTile ? formatTile(selectedTile) : "--"}.
        {" "}
        Encaja en:
        {" "}
        {selectedPlacements.length
          ? selectedPlacements.map((placement) => (placement.side === "left" ? "izquierda" : "derecha")).join(" / ")
          : "ningun extremo"}
      </p>

      {state.roundResult ? (
        <div className="domino-round-summary">
          <strong>Resumen de ronda</strong>
          <p>
            Ganador: {state.roundResult.winner === "player" ? "Tu" : state.roundResult.winner === "ai" ? "IA" : "Empate"}
            {" "}
            | Motivo: {state.roundResult.reason === "domino" ? "domino" : "tranca"}
            {" "}
            | Puntos: {state.roundResult.pointsAwarded}
            {state.roundResult.reason === "block"
              ? ` | Mano Tu/IA: ${state.roundResult.playerPoints}/${state.roundResult.aiPoints}`
              : ""}
          </p>
        </div>
      ) : null}

      <details className="domino-rules">
        <summary>Reglas del domino (prompt completo)</summary>
        <pre>{RULES_PROMPT}</pre>
      </details>

      <p className="game-message">{state.message}</p>

      <ul className="game-log">
        {state.logs.map((entry, index) => (
          <li key={`${entry}-${index}`}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

export default DominoStrategyGame;
