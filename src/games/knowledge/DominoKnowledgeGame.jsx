import React, { useCallback, useEffect, useMemo, useState } from "react";
import useGameRuntimeBridge from "../../utils/useGameRuntimeBridge";
import {
  KNOWLEDGE_ARCADE_MATCH_COUNT,
  createSeededRandom,
  getRandomKnowledgeMatchId,
  getRandomKnowledgeMatchIdExcept,
  resolveKnowledgeArcadeLocale,
  shuffleWithRandom
} from "./knowledgeArcadeUtils";

const COPY_BY_LOCALE = {
  es: {
    title: "Domino Chain",
    subtitle: "Conecta todas las fichas manteniendo la cadena valida.",
    restart: "Partida aleatoria",
    inHand: "Fichas en mano",
    moves: "Movimientos",
    errors: "Errores",
    leftEdge: "Extremo izq",
    rightEdge: "Extremo der",
    activeEdge: "Extremo activo",
    leftSide: "Izquierda",
    rightSide: "Derecha",
    toggleSide: "Cambiar extremo",
    place: "Colocar ficha",
    selected: "Seleccion",
    match: "Partida",
    status: "Estado",
    statusWon: "Completado",
    statusPlaying: "En curso",
    startMessage: "Conecta todas las fichas en una sola cadena.",
    invalidPlacement: "La ficha no encaja en ese extremo.",
    placed: "Ficha colocada.",
    solved: "Domino completado."
  },
  en: {
    title: "Domino Chain",
    subtitle: "Connect all tiles while keeping a valid chain.",
    restart: "Random match",
    inHand: "Tiles in hand",
    moves: "Moves",
    errors: "Errors",
    leftEdge: "Left edge",
    rightEdge: "Right edge",
    activeEdge: "Active edge",
    leftSide: "Left",
    rightSide: "Right",
    toggleSide: "Toggle edge",
    place: "Place tile",
    selected: "Selected",
    match: "Match",
    status: "Status",
    statusWon: "Completed",
    statusPlaying: "In progress",
    startMessage: "Connect all tiles into a single chain.",
    invalidPlacement: "This tile does not fit on that edge.",
    placed: "Tile placed.",
    solved: "Domino solved."
  }
};

const cloneTiles = (tiles) => tiles.map((tile) => ({ ...tile }));

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
        <span key={`${value}-${index}`} className="domino-pip" style={{ "--x": `${x}%`, "--y": `${y}%` }} />
      ))}
    </span>
  );
}

const createDominoMatch = (matchId) => {
  let code = Number(matchId) || 0;
  const values = [];
  for (let index = 0; index < 8; index += 1) {
    values.push(code % 7);
    code = Math.floor(code / 7);
  }

  const chain = [{ id: `seed-${matchId}`, left: values[0], right: values[1] }];
  const hand = [];

  for (let index = 1; index <= 6; index += 1) {
    const shouldFlip = ((matchId >> index) & 1) === 1;
    const left = values[index];
    const right = values[index + 1];
    hand.push({
      id: `d${index}-${matchId}`,
      left: shouldFlip ? right : left,
      right: shouldFlip ? left : right
    });
  }

  const random = createSeededRandom((matchId + 1) * 4099 + 97);
  return { chain, hand: shuffleWithRandom(hand, random) };
};

const orientTile = (tile, side, chain) => {
  if (!tile || !chain.length) return null;

  if (side === "left") {
    const edge = chain[0].left;
    if (tile.right === edge) {
      return { ...tile, left: tile.left, right: tile.right };
    }
    if (tile.left === edge) {
      return { ...tile, left: tile.right, right: tile.left };
    }
    return null;
  }

  const edge = chain[chain.length - 1].right;
  if (tile.left === edge) {
    return { ...tile, left: tile.left, right: tile.right };
  }
  if (tile.right === edge) {
    return { ...tile, left: tile.right, right: tile.left };
  }
  return null;
};

const createInitialState = (matchId, copy) => {
  const match = createDominoMatch(matchId);
  return {
    matchId,
    chain: cloneTiles(match.chain),
    hand: cloneTiles(match.hand),
    selectedIndex: 0,
    side: "right",
    moves: 0,
    invalidMoves: 0,
    status: "playing",
    message: copy.startMessage
  };
};

function DominoKnowledgeGame() {
  const locale = useMemo(resolveKnowledgeArcadeLocale, []);
  const copy = useMemo(() => COPY_BY_LOCALE[locale] ?? COPY_BY_LOCALE.en, [locale]);
  const [state, setState] = useState(() =>
    createInitialState(getRandomKnowledgeMatchId(), copy)
  );

  const restart = useCallback(() => {
    setState((previous) => createInitialState(getRandomKnowledgeMatchIdExcept(previous.matchId), copy));
  }, [copy]);

  const selectIndex = useCallback((index) => {
    setState((previous) => ({
      ...previous,
      selectedIndex: Math.max(0, Math.min(index, Math.max(previous.hand.length - 1, 0)))
    }));
  }, []);

  const shiftIndex = useCallback((delta) => {
    setState((previous) => {
      if (!previous.hand.length) return previous;
      return {
        ...previous,
        selectedIndex:
          (previous.selectedIndex + delta + previous.hand.length) % previous.hand.length
      };
    });
  }, []);

  const placeSelected = useCallback(() => {
    setState((previous) => {
      if (!previous.hand.length || previous.status !== "playing") return previous;
      const tile = previous.hand[previous.selectedIndex];
      const oriented = orientTile(tile, previous.side, previous.chain);
      if (!oriented) {
        return {
          ...previous,
          invalidMoves: previous.invalidMoves + 1,
          message: copy.invalidPlacement
        };
      }

      const nextChain =
        previous.side === "left"
          ? [{ ...oriented }, ...previous.chain]
          : [...previous.chain, { ...oriented }];
      const nextHand = previous.hand.filter((_, index) => index !== previous.selectedIndex);
      const won = nextHand.length === 0;

      return {
        ...previous,
        chain: nextChain,
        hand: nextHand,
        selectedIndex: nextHand.length
          ? Math.min(previous.selectedIndex, nextHand.length - 1)
          : 0,
        moves: previous.moves + 1,
        status: won ? "won" : "playing",
        message: won ? copy.solved : copy.placed
      };
    });
  }, [copy]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key;
      const normalized = key.toLowerCase();

      if (key === "ArrowLeft") {
        event.preventDefault();
        shiftIndex(-1);
        return;
      }
      if (key === "ArrowRight") {
        event.preventDefault();
        shiftIndex(1);
        return;
      }
      if (key === "ArrowUp") {
        event.preventDefault();
        setState((previous) => ({ ...previous, side: "left" }));
        return;
      }
      if (key === "ArrowDown") {
        event.preventDefault();
        setState((previous) => ({ ...previous, side: "right" }));
        return;
      }
      if (key === "Enter" || key === " ") {
        event.preventDefault();
        placeSelected();
        return;
      }
      if (normalized === "r") {
        restart();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [placeSelected, restart, shiftIndex]);

  const payloadBuilder = useCallback((snapshot) => ({
    mode: "knowledge-arcade",
    variant: "domino",
    coordinates: "chain_order_left_to_right",
    locale,
    match: {
      current: snapshot.matchId + 1,
      total: KNOWLEDGE_ARCADE_MATCH_COUNT
    },
    status: snapshot.status,
    side: snapshot.side,
    selectedIndex: snapshot.selectedIndex,
    moves: snapshot.moves,
    invalidMoves: snapshot.invalidMoves,
    chain: snapshot.chain.map((tile) => [tile.left, tile.right]),
    hand: snapshot.hand.map((tile) => [tile.left, tile.right]),
    message: snapshot.message
  }), [locale]);

  const advanceTime = useCallback(() => undefined, []);
  useGameRuntimeBridge(state, payloadBuilder, advanceTime);

  const handSelected = useMemo(() => state.hand[state.selectedIndex] ?? null, [state.hand, state.selectedIndex]);

  return (
    <div className="mini-game knowledge-game knowledge-arcade-game knowledge-domino">
      <div className="mini-head">
        <div>
          <h4>{copy.title}</h4>
          <p>{copy.subtitle}</p>
        </div>
        <button type="button" onClick={restart}>{copy.restart}</button>
      </div>

      <section className="knowledge-mode-shell">
        <div className="knowledge-status-row">
          <span>{copy.match}: {state.matchId + 1}/{KNOWLEDGE_ARCADE_MATCH_COUNT}</span>
          <span>{copy.inHand}: {state.hand.length}</span>
          <span>{copy.moves}: {state.moves}</span>
          <span>{copy.errors}: {state.invalidMoves}</span>
          <span>{copy.status}: {state.status === "won" ? copy.statusWon : copy.statusPlaying}</span>
        </div>

        <div className="domino-edge-readout">
          <span>{copy.leftEdge}: {state.chain[0].left}</span>
          <span>{copy.rightEdge}: {state.chain[state.chain.length - 1].right}</span>
        </div>

        <div className="domino-chain" role="list">
          {state.chain.map((tile, index) => (
            <span
              key={`${tile.id}-${index}`}
              role="listitem"
              className={`domino-tile ${index === 0 && state.side === "left" ? "active-edge" : ""} ${index === state.chain.length - 1 && state.side === "right" ? "active-edge" : ""}`.trim()}
            >
              <span className="domino-half">
                <DominoPips value={tile.left} />
                <strong>{tile.left}</strong>
              </span>
              <span className="domino-divider" />
              <span className="domino-half">
                <DominoPips value={tile.right} />
                <strong>{tile.right}</strong>
              </span>
            </span>
          ))}
        </div>

        <div className="domino-toolbar">
          <span>{copy.activeEdge}: {state.side === "left" ? copy.leftSide : copy.rightSide}</span>
          <button
            type="button"
            onClick={() => setState((previous) => ({
              ...previous,
              side: previous.side === "left" ? "right" : "left"
            }))}
          >
            {copy.toggleSide}
          </button>
          <button type="button" onClick={placeSelected}>{copy.place}</button>
        </div>

        <div className="domino-hand">
          {state.hand.map((tile, index) => (
            <button
              key={tile.id}
              type="button"
              className={`domino-hand-tile ${index === state.selectedIndex ? "selected" : ""}`.trim()}
              onClick={() => selectIndex(index)}
            >
              <span className="domino-half">
                <DominoPips value={tile.left} />
                <strong>{tile.left}</strong>
              </span>
              <span className="domino-divider" />
              <span className="domino-half">
                <DominoPips value={tile.right} />
                <strong>{tile.right}</strong>
              </span>
            </button>
          ))}
        </div>

        <p className="domino-selected">{copy.selected}: {handSelected ? `${handSelected.left}|${handSelected.right}` : "--"}</p>
      </section>

      <p className="game-message">{state.message}</p>
    </div>
  );
}

export default DominoKnowledgeGame;
