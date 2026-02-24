import React, { useCallback, useEffect, useMemo, useState } from "react";
import useGameRuntimeBridge from "../../utils/useGameRuntimeBridge";
import {
  KNOWLEDGE_ARCADE_MATCH_COUNT,
  getRandomKnowledgeMatchId,
  getRandomKnowledgeMatchIdExcept,
  resolveKnowledgeArcadeLocale
} from "./knowledgeArcadeUtils";

const TARGET_RANK = 7;

const COPY_BY_LOCALE = {
  es: {
    title: "Paciencia Clasica Lite",
    subtitle: "Ordena cartas por palo de A a 7 usando stock, descarte y columnas.",
    restart: "Partida aleatoria",
    match: "Partida",
    moves: "Movimientos",
    errors: "Errores",
    stock: "Stock",
    status: "Estado",
    statusWon: "Resuelto",
    statusPlaying: "En curso",
    draw: "Robar",
    waste: "Descarte",
    toFoundation: "A fundacion",
    autoFoundation: "Auto fundacion",
    foundationHearts: "Fundacion",
    foundationSpades: "Fundacion",
    targetLabel: (column) => `Destino activo: columna ${column}`,
    column: (index) => `Columna ${index}`,
    select: "Seleccionar",
    markTarget: "Marcar destino",
    targetMinus: "Destino -",
    targetPlus: "Destino +",
    moveToTarget: "Mover a destino",
    emptyColumn: "Vacia",
    startMessage: "Lleva cartas a las fundaciones de A a 7.",
    drawnCard: (label) => `Carta robada: ${label}.`,
    recycledWaste: "Descarte reciclado al mazo.",
    noCards: "No quedan cartas para robar.",
    selectedWaste: (label) => `Seleccionado descarte: ${label}.`,
    noWaste: "No hay descarte disponible.",
    selectedColumn: (column) => `Seleccionada columna ${column}.`,
    emptyColumnMessage: (column) => `Columna ${column} vacia.`,
    selectForFoundation: "Selecciona una carta para fundacion.",
    cannotFoundation: (label) => `No se puede mover ${label} a fundacion.`,
    movedToFoundation: (label) => `${label} movida a fundacion.`,
    solved: "Paciencia resuelta.",
    selectForMove: "Selecciona una carta para mover.",
    invalidTarget: (column) => `Movimiento invalido a columna ${column}.`,
    movedToColumn: (label, column) => `${label} movida a columna ${column}.`,
    noFoundationCandidate: "No hay cartas listas para fundacion."
  },
  en: {
    title: "Classic Solitaire Lite",
    subtitle: "Sort cards by suit from A to 7 using stock, waste and columns.",
    restart: "Random match",
    match: "Match",
    moves: "Moves",
    errors: "Errors",
    stock: "Stock",
    status: "Status",
    statusWon: "Solved",
    statusPlaying: "In progress",
    draw: "Draw",
    waste: "Waste",
    toFoundation: "To foundation",
    autoFoundation: "Auto foundation",
    foundationHearts: "Foundation",
    foundationSpades: "Foundation",
    targetLabel: (column) => `Active target: column ${column}`,
    column: (index) => `Column ${index}`,
    select: "Select",
    markTarget: "Set target",
    targetMinus: "Target -",
    targetPlus: "Target +",
    moveToTarget: "Move to target",
    emptyColumn: "Empty",
    startMessage: "Move cards to foundations from A to 7.",
    drawnCard: (label) => `Drawn card: ${label}.`,
    recycledWaste: "Waste recycled into stock.",
    noCards: "No cards left to draw.",
    selectedWaste: (label) => `Selected waste: ${label}.`,
    noWaste: "No waste card available.",
    selectedColumn: (column) => `Selected column ${column}.`,
    emptyColumnMessage: (column) => `Column ${column} is empty.`,
    selectForFoundation: "Select a card for foundation.",
    cannotFoundation: (label) => `Cannot move ${label} to foundation.`,
    movedToFoundation: (label) => `${label} moved to foundation.`,
    solved: "Solitaire solved.",
    selectForMove: "Select a card to move.",
    invalidTarget: (column) => `Invalid move to column ${column}.`,
    movedToColumn: (label, column) => `${label} moved to column ${column}.`,
    noFoundationCandidate: "No cards ready for foundation."
  }
};

const cardColor = (suit) => (suit === "hearts" ? "red" : "black");

const createCard = (suit, rank) => ({
  id: `${suit}-${rank}`,
  suit,
  rank,
  color: cardColor(suit)
});

const cardRankLabel = (rank) => (rank === 1 ? "A" : String(rank));
const cardSuitSymbol = (suit) => (suit === "hearts" ? "H" : "S");
const cardVisualSymbol = (suit) => (suit === "hearts" ? "\u2665" : "\u2660");
const cardLabel = (card) => `${cardRankLabel(card.rank)}${cardSuitSymbol(card.suit)}`;

const canMoveToFoundation = (card, foundations) => foundations[card.suit] + 1 === card.rank;

const canMoveToColumn = (card, column) => {
  if (!column.length) {
    return card.rank === TARGET_RANK;
  }
  const top = column[column.length - 1];
  return top.color !== card.color && card.rank === top.rank - 1;
};

const FACTORIALS = [1];
for (let index = 1; index <= 14; index += 1) {
  FACTORIALS[index] = FACTORIALS[index - 1] * index;
}

const buildBaseDeck = () => {
  const cards = [];
  for (let rank = 1; rank <= TARGET_RANK; rank += 1) {
    cards.push(createCard("hearts", rank));
    cards.push(createCard("spades", rank));
  }
  return cards;
};

const unrankDeck = (deck, rank) => {
  const available = [...deck];
  const ordered = [];
  let value = rank;
  for (let size = available.length; size > 0; size -= 1) {
    const factorial = FACTORIALS[size - 1];
    const index = Math.floor(value / factorial);
    value %= factorial;
    ordered.push(available.splice(index, 1)[0]);
  }
  return ordered;
};

const dealForMatch = (matchId) => {
  const baseDeck = buildBaseDeck();
  const rank = ((Number(matchId) || 0) * 9973) % FACTORIALS[baseDeck.length];
  const deck = unrankDeck(baseDeck, rank);
  return {
    columns: [
      [deck[0], deck[1]],
      [deck[2], deck[3]],
      [deck[4], deck[5]],
      [deck[6], deck[7]]
    ],
    stock: deck.slice(8)
  };
};

const getSelectedCard = (state) => {
  if (!state.selected) return null;

  if (state.selected.zone === "waste") {
    const card = state.waste[state.waste.length - 1];
    if (!card) return null;
    return { ...state.selected, card };
  }

  if (state.selected.zone === "tableau") {
    const column = state.columns[state.selected.column] ?? [];
    const card = column[column.length - 1];
    if (!card) return null;
    return { ...state.selected, card };
  }

  return null;
};

const removeSelectedCard = (state, selectedCard) => {
  if (selectedCard.zone === "waste") {
    return {
      columns: state.columns.map((column) => [...column]),
      waste: state.waste.slice(0, -1)
    };
  }

  return {
    columns: state.columns.map((column, index) =>
      index === selectedCard.column ? column.slice(0, -1) : [...column]
    ),
    waste: [...state.waste]
  };
};

const hasWon = (foundations) =>
  foundations.hearts === TARGET_RANK && foundations.spades === TARGET_RANK;

const applyFoundationMove = (snapshot, selectedCard, copy) => {
  const removed = removeSelectedCard(snapshot, selectedCard);
  const nextFoundations = {
    ...snapshot.foundations,
    [selectedCard.card.suit]: selectedCard.card.rank
  };
  const won = hasWon(nextFoundations);
  return {
    ...snapshot,
    columns: removed.columns,
    waste: removed.waste,
    foundations: nextFoundations,
    selected: null,
    moves: snapshot.moves + 1,
    status: won ? "won" : "playing",
    message: won ? copy.solved : copy.movedToFoundation(cardLabel(selectedCard.card))
  };
};

const findFoundationCandidate = (snapshot) => {
  const selectedCard = getSelectedCard(snapshot);
  if (selectedCard && canMoveToFoundation(selectedCard.card, snapshot.foundations)) {
    return selectedCard;
  }

  const wasteTop = snapshot.waste[snapshot.waste.length - 1];
  if (wasteTop && canMoveToFoundation(wasteTop, snapshot.foundations)) {
    return { zone: "waste", card: wasteTop };
  }

  for (let column = 0; column < snapshot.columns.length; column += 1) {
    const top = snapshot.columns[column][snapshot.columns[column].length - 1];
    if (top && canMoveToFoundation(top, snapshot.foundations)) {
      return { zone: "tableau", column, card: top };
    }
  }

  return null;
};

const createInitialState = (matchId, copy) => {
  const deal = dealForMatch(matchId);
  return {
    matchId,
    columns: deal.columns,
    stock: deal.stock,
    waste: [],
    foundations: {
      hearts: 0,
      spades: 0
    },
    selected: null,
    targetColumn: 0,
    moves: 0,
    invalidMoves: 0,
    status: "playing",
    message: copy.startMessage
  };
};

function SolitaireKnowledgeGame() {
  const locale = useMemo(resolveKnowledgeArcadeLocale, []);
  const copy = useMemo(() => COPY_BY_LOCALE[locale] ?? COPY_BY_LOCALE.en, [locale]);
  const [state, setState] = useState(() =>
    createInitialState(getRandomKnowledgeMatchId(), copy)
  );

  const restart = useCallback(() => {
    setState((previous) => createInitialState(getRandomKnowledgeMatchIdExcept(previous.matchId), copy));
  }, [copy]);

  const drawCard = useCallback(() => {
    setState((previous) => {
      if (previous.status !== "playing") return previous;
      if (previous.stock.length) {
        const nextStock = [...previous.stock];
        const card = nextStock.pop();
        return {
          ...previous,
          stock: nextStock,
          waste: [...previous.waste, card],
          moves: previous.moves + 1,
          message: copy.drawnCard(cardLabel(card))
        };
      }
      if (previous.waste.length) {
        return {
          ...previous,
          stock: [...previous.waste].reverse(),
          waste: [],
          moves: previous.moves + 1,
          message: copy.recycledWaste
        };
      }
      return {
        ...previous,
        message: copy.noCards
      };
    });
  }, [copy]);

  const selectWaste = useCallback(() => {
    setState((previous) => ({
      ...previous,
      selected: previous.waste.length ? { zone: "waste" } : null,
      message: previous.waste.length
        ? copy.selectedWaste(cardLabel(previous.waste[previous.waste.length - 1]))
        : copy.noWaste
    }));
  }, [copy]);

  const selectColumn = useCallback((column) => {
    setState((previous) => {
      const cards = previous.columns[column] ?? [];
      return {
        ...previous,
        selected: cards.length ? { zone: "tableau", column } : null,
        message: cards.length ? copy.selectedColumn(column + 1) : copy.emptyColumnMessage(column + 1)
      };
    });
  }, [copy]);

  const moveToFoundation = useCallback(() => {
    setState((previous) => {
      if (previous.status !== "playing") return previous;
      const selectedCard = getSelectedCard(previous);
      if (!selectedCard) {
        return {
          ...previous,
          invalidMoves: previous.invalidMoves + 1,
          message: copy.selectForFoundation
        };
      }

      if (!canMoveToFoundation(selectedCard.card, previous.foundations)) {
        return {
          ...previous,
          invalidMoves: previous.invalidMoves + 1,
          message: copy.cannotFoundation(cardLabel(selectedCard.card))
        };
      }

      return applyFoundationMove(previous, selectedCard, copy);
    });
  }, [copy]);

  const moveToTarget = useCallback(() => {
    setState((previous) => {
      if (previous.status !== "playing") return previous;
      const selectedCard = getSelectedCard(previous);
      if (!selectedCard) {
        return {
          ...previous,
          invalidMoves: previous.invalidMoves + 1,
          message: copy.selectForMove
        };
      }

      const target = previous.targetColumn;
      if (selectedCard.zone === "tableau" && selectedCard.column === target) {
        return previous;
      }

      if (!canMoveToColumn(selectedCard.card, previous.columns[target])) {
        return {
          ...previous,
          invalidMoves: previous.invalidMoves + 1,
          message: copy.invalidTarget(target + 1)
        };
      }

      const removed = removeSelectedCard(previous, selectedCard);
      const nextColumns = removed.columns.map((column, index) =>
        index === target ? [...column, selectedCard.card] : column
      );

      return {
        ...previous,
        columns: nextColumns,
        waste: removed.waste,
        selected: { zone: "tableau", column: target },
        moves: previous.moves + 1,
        message: copy.movedToColumn(cardLabel(selectedCard.card), target + 1)
      };
    });
  }, [copy]);

  const autoFoundation = useCallback(() => {
    setState((previous) => {
      if (previous.status !== "playing") return previous;
      const candidate = findFoundationCandidate(previous);
      if (!candidate) {
        return {
          ...previous,
          invalidMoves: previous.invalidMoves + 1,
          message: copy.noFoundationCandidate
        };
      }
      return applyFoundationMove(previous, candidate, copy);
    });
  }, [copy]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key;
      const normalized = key.toLowerCase();

      if (normalized === "d") {
        drawCard();
        return;
      }
      if (normalized === "a") {
        selectWaste();
        return;
      }
      if (normalized === "q") {
        selectColumn(0);
        return;
      }
      if (normalized === "w") {
        selectColumn(1);
        return;
      }
      if (normalized === "e") {
        selectColumn(2);
        return;
      }
      if (normalized === "r") {
        selectColumn(3);
        return;
      }
      if (key === "ArrowLeft") {
        event.preventDefault();
        setState((previous) => ({
          ...previous,
          targetColumn: (previous.targetColumn + previous.columns.length - 1) % previous.columns.length
        }));
        return;
      }
      if (key === "ArrowRight") {
        event.preventDefault();
        setState((previous) => ({
          ...previous,
          targetColumn: (previous.targetColumn + 1) % previous.columns.length
        }));
        return;
      }
      if (key === "Enter") {
        event.preventDefault();
        moveToTarget();
        return;
      }
      if (key === " ") {
        event.preventDefault();
        moveToFoundation();
        return;
      }
      if (normalized === "f") {
        autoFoundation();
        return;
      }
      if (normalized === "p") {
        restart();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [autoFoundation, drawCard, moveToFoundation, moveToTarget, restart, selectColumn, selectWaste]);

  const statusLabel = state.status === "won" ? copy.statusWon : copy.statusPlaying;

  const payloadBuilder = useCallback((snapshot) => ({
    mode: "knowledge-arcade",
    variant: "paciencia",
    coordinates: "tableau_columns_top_is_last",
    locale,
    match: {
      current: snapshot.matchId + 1,
      total: KNOWLEDGE_ARCADE_MATCH_COUNT
    },
    status: snapshot.status,
    selected: snapshot.selected,
    targetColumn: snapshot.targetColumn,
    stockSize: snapshot.stock.length,
    wasteTop: snapshot.waste[snapshot.waste.length - 1]
      ? cardLabel(snapshot.waste[snapshot.waste.length - 1])
      : null,
    foundations: snapshot.foundations,
    tableauTop: snapshot.columns.map((column) =>
      column.length ? cardLabel(column[column.length - 1]) : null
    ),
    moves: snapshot.moves,
    invalidMoves: snapshot.invalidMoves,
    message: snapshot.message
  }), [locale]);

  const advanceTime = useCallback(() => undefined, []);
  useGameRuntimeBridge(state, payloadBuilder, advanceTime);

  return (
    <div className="mini-game knowledge-game knowledge-arcade-game knowledge-paciencia">
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
          <span>{copy.moves}: {state.moves}</span>
          <span>{copy.errors}: {state.invalidMoves}</span>
          <span>{copy.stock}: {state.stock.length}</span>
          <span>{copy.status}: {statusLabel}</span>
        </div>

        <div className="solitaire-topbar">
          <button type="button" onClick={drawCard}>{copy.draw}</button>
          <button
            type="button"
            className={state.selected?.zone === "waste" ? "selected" : ""}
            onClick={selectWaste}
          >
            {copy.waste}: {state.waste[state.waste.length - 1] ? cardLabel(state.waste[state.waste.length - 1]) : "--"}
          </button>
          <button type="button" onClick={moveToFoundation}>{copy.toFoundation}</button>
          <button type="button" onClick={autoFoundation}>{copy.autoFoundation}</button>
        </div>

        <div className="solitaire-foundations">
          <span>{copy.foundationHearts} {cardVisualSymbol("hearts")}: {state.foundations.hearts}/7</span>
          <span>{copy.foundationSpades} {cardVisualSymbol("spades")}: {state.foundations.spades}/7</span>
        </div>

        <p className="solitaire-target-label">{copy.targetLabel(state.targetColumn + 1)}</p>

        <div className="solitaire-tableau">
          {state.columns.map((column, index) => {
            const isSelected = state.selected?.zone === "tableau" && state.selected.column === index;
            const isTarget = state.targetColumn === index;
            return (
              <article
                key={index}
                className={`solitaire-column ${isSelected ? "selected" : ""} ${isTarget ? "target" : ""}`.trim()}
              >
                <header>
                  <strong>{copy.column(index + 1)}</strong>
                </header>
                <div className="solitaire-stack">
                  {column.map((card) => (
                    <span key={card.id} className={`solitaire-card ${card.color}`}>
                      <span className="solitaire-card-corner top">
                        {cardRankLabel(card.rank)}
                        {cardVisualSymbol(card.suit)}
                      </span>
                      <span className="solitaire-card-center">{cardVisualSymbol(card.suit)}</span>
                      <span className="solitaire-card-corner bottom">
                        {cardRankLabel(card.rank)}
                        {cardVisualSymbol(card.suit)}
                      </span>
                    </span>
                  ))}
                  {!column.length ? <span className="solitaire-empty">{copy.emptyColumn}</span> : null}
                </div>
                <div className="solitaire-column-actions">
                  <button type="button" onClick={() => selectColumn(index)}>{copy.select}</button>
                  <button type="button" onClick={() => setState((previous) => ({ ...previous, targetColumn: index }))}>
                    {copy.markTarget}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="quick-actions compact-grid">
          <button
            type="button"
            onClick={() => setState((previous) => ({
              ...previous,
              targetColumn: (previous.targetColumn + previous.columns.length - 1) % previous.columns.length
            }))}
          >
            {copy.targetMinus}
          </button>
          <button
            type="button"
            onClick={() => setState((previous) => ({
              ...previous,
              targetColumn: (previous.targetColumn + 1) % previous.columns.length
            }))}
          >
            {copy.targetPlus}
          </button>
          <button type="button" onClick={moveToTarget}>{copy.moveToTarget}</button>
        </div>
      </section>

      <p className="game-message">{state.message}</p>
    </div>
  );
}

export default SolitaireKnowledgeGame;
