import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useGameRuntimeBridge from "../../utils/useGameRuntimeBridge";
import {
  KNOWLEDGE_ARCADE_MATCH_COUNT,
  getRandomKnowledgeMatchId,
  getRandomKnowledgeMatchIdExcept,
  resolveKnowledgeArcadeLocale
} from "./knowledgeArcadeUtils";
import {
  buildWordSearchPath,
  buildWordSearchPathKey,
  createWordSearchMatch
} from "./wordSearchGenerator";

const COPY_BY_LOCALE = {
  es: {
    title: "Sopa de Letras Mega",
    subtitle:
      "Tablero grande con 10.000 combinaciones ES/EN. Selecciona palabras en horizontal, vertical o diagonal, normal o al reves.",
    restart: "Partida aleatoria",
    match: "Partida",
    board: "Tablero",
    progress: "Encontradas",
    status: "Estado",
    statusPlaying: "En curso",
    statusWon: "Completada",
    words: "Palabras objetivo",
    controls:
      "Arrastra (o marca inicio-fin) para trazar una linea recta. Tambien puedes seleccionar una palabra al reves.",
    startMessage: "Encuentra las palabras ocultas en el tablero.",
    anchorSelected: "Origen seleccionado. Marca la letra final para validar.",
    invalidSelection: "Traza una linea recta horizontal, vertical o diagonal.",
    miss: "Esa seleccion no coincide con ninguna palabra objetivo.",
    foundWord: (word) => `Palabra encontrada: ${word}.`,
    alreadyFound: (word) => `${word} ya estaba encontrada.`,
    solved: "Sopa completada. Has encontrado todas las palabras."
  },
  en: {
    title: "Mega Word Search",
    subtitle:
      "Large board with 10,000 ES/EN combinations. Select words horizontally, vertically, or diagonally, forward or reverse.",
    restart: "Random match",
    match: "Match",
    board: "Board",
    progress: "Found",
    status: "Status",
    statusPlaying: "In progress",
    statusWon: "Solved",
    words: "Target words",
    controls:
      "Drag (or click start-end) to trace a straight line. Reverse selection is also supported.",
    startMessage: "Find the hidden words in the board.",
    anchorSelected: "Start cell selected. Pick an end cell to validate.",
    invalidSelection: "Trace a straight horizontal, vertical, or diagonal line.",
    miss: "That selection does not match a target word.",
    foundWord: (word) => `Word found: ${word}.`,
    alreadyFound: (word) => `${word} was already found.`,
    solved: "Word search solved. All target words were found."
  }
};

const cellKey = (row, col) => `${row},${col}`;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const parseMatchParam = (raw) => {
  if (raw == null) return null;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) return null;
  if (parsed >= 0 && parsed < KNOWLEDGE_ARCADE_MATCH_COUNT) {
    return parsed;
  }
  if (parsed >= 1 && parsed <= KNOWLEDGE_ARCADE_MATCH_COUNT) {
    return parsed - 1;
  }
  return null;
};

const resolveMatchIdFromHash = () => {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  const hashMatch = parseMatchParam(new URLSearchParams(hash).get("match"));
  if (hashMatch != null) return hashMatch;

  const searchMatch = parseMatchParam(new URLSearchParams(window.location.search).get("match"));
  if (searchMatch != null) return searchMatch;

  return null;
};

const createInitialState = (matchId, locale, copy) => {
  const match = createWordSearchMatch(matchId, locale);
  const wordIdByPathKey = match.words.reduce((accumulator, word) => ({
    ...accumulator,
    [word.pathKey]: word.id
  }), {});

  return {
    ...match,
    matchId,
    wordIdByPathKey,
    foundWordIds: [],
    selectionStart: null,
    selectionEnd: null,
    previewPath: [],
    cursor: { row: 0, col: 0 },
    status: "playing",
    message: copy.startMessage
  };
};

function WordSearchKnowledgeGame() {
  const locale = useMemo(resolveKnowledgeArcadeLocale, []);
  const copy = useMemo(() => COPY_BY_LOCALE[locale] ?? COPY_BY_LOCALE.en, [locale]);
  const initialMatchId = useMemo(
    () => resolveMatchIdFromHash() ?? getRandomKnowledgeMatchId(),
    []
  );
  const selectingRef = useRef(false);
  const [state, setState] = useState(() =>
    createInitialState(initialMatchId, locale, copy)
  );

  const restart = useCallback(() => {
    selectingRef.current = false;
    setState((previous) =>
      createInitialState(getRandomKnowledgeMatchIdExcept(previous.matchId), locale, copy)
    );
  }, [copy, locale]);

  const startSelection = useCallback((row, col, announceAnchor = false) => {
    setState((previous) => {
      if (previous.status === "won") {
        return previous;
      }
      return {
        ...previous,
        selectionStart: { row, col },
        selectionEnd: { row, col },
        previewPath: [{ row, col }],
        cursor: { row, col },
        message: announceAnchor ? copy.anchorSelected : previous.message
      };
    });
  }, [copy.anchorSelected]);

  const updateSelection = useCallback((row, col) => {
    setState((previous) => {
      if (!previous.selectionStart || previous.status === "won") {
        return previous;
      }

      const end = { row, col };
      const path = buildWordSearchPath(previous.selectionStart, end);
      return {
        ...previous,
        selectionEnd: end,
        cursor: end,
        previewPath: path.length ? path : [previous.selectionStart]
      };
    });
  }, []);

  const clearSelection = useCallback((snapshot) => ({
    ...snapshot,
    selectionStart: null,
    selectionEnd: null,
    previewPath: []
  }), []);

  const finishSelection = useCallback((explicitEnd = null) => {
    setState((previous) => {
      if (!previous.selectionStart || previous.status === "won") {
        return clearSelection(previous);
      }

      const end = explicitEnd || previous.selectionEnd || previous.selectionStart;
      const path = buildWordSearchPath(previous.selectionStart, end);
      if (path.length < 2) {
        const sameCell = (
          previous.selectionStart.row === end.row &&
          previous.selectionStart.col === end.col
        );
        if (!sameCell) {
          return clearSelection({
            ...previous,
            message: copy.invalidSelection
          });
        }

        return {
          ...previous,
          selectionStart: end,
          selectionEnd: end,
          previewPath: [end],
          status: "playing",
          message: copy.anchorSelected
        };
      }

      const pathKey = buildWordSearchPathKey(path);
      const matchedWordId = previous.wordIdByPathKey[pathKey];
      if (!matchedWordId) {
        return clearSelection({
          ...previous,
          message: copy.miss
        });
      }

      if (previous.foundWordIds.includes(matchedWordId)) {
        const knownWord = previous.words.find((word) => word.id === matchedWordId);
        return clearSelection({
          ...previous,
          message: copy.alreadyFound(knownWord?.word ?? matchedWordId)
        });
      }

      const matchedWord = previous.words.find((word) => word.id === matchedWordId);
      const nextFoundWordIds = [...previous.foundWordIds, matchedWordId];
      const solved = nextFoundWordIds.length >= previous.words.length;

      return clearSelection({
        ...previous,
        foundWordIds: nextFoundWordIds,
        status: solved ? "won" : "playing",
        message: solved ? copy.solved : copy.foundWord(matchedWord?.word ?? matchedWordId)
      });
    });
  }, [clearSelection, copy]);

  useEffect(() => {
    const onPointerUp = () => {
      if (!selectingRef.current) return;
      selectingRef.current = false;
      finishSelection();
    };

    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [finishSelection]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (key === "arrowup") {
        event.preventDefault();
        setState((previous) => ({
          ...previous,
          cursor: {
            row: clamp(previous.cursor.row - 1, 0, previous.boardSize - 1),
            col: previous.cursor.col
          }
        }));
        return;
      }
      if (key === "arrowdown") {
        event.preventDefault();
        setState((previous) => ({
          ...previous,
          cursor: {
            row: clamp(previous.cursor.row + 1, 0, previous.boardSize - 1),
            col: previous.cursor.col
          }
        }));
        return;
      }
      if (key === "arrowleft") {
        event.preventDefault();
        setState((previous) => ({
          ...previous,
          cursor: {
            row: previous.cursor.row,
            col: clamp(previous.cursor.col - 1, 0, previous.boardSize - 1)
          }
        }));
        return;
      }
      if (key === "arrowright") {
        event.preventDefault();
        setState((previous) => ({
          ...previous,
          cursor: {
            row: previous.cursor.row,
            col: clamp(previous.cursor.col + 1, 0, previous.boardSize - 1)
          }
        }));
        return;
      }
      if (key === "r") {
        event.preventDefault();
        restart();
        return;
      }
      if (key === "escape") {
        event.preventDefault();
        setState((previous) => clearSelection({
          ...previous,
          status: "playing",
          message: copy.startMessage
        }));
        return;
      }
      if (event.key === "Enter" && state.status === "won") {
        event.preventDefault();
        restart();
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const cursor = state.cursor;
        if (!state.selectionStart) {
          startSelection(cursor.row, cursor.col, true);
          return;
        }
        updateSelection(cursor.row, cursor.col);
        finishSelection({ row: cursor.row, col: cursor.col });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    clearSelection,
    copy.startMessage,
    finishSelection,
    restart,
    startSelection,
    state.cursor,
    state.selectionStart,
    state.status,
    updateSelection
  ]);

  const wordsById = useMemo(() => (
    state.words.reduce((accumulator, word) => ({
      ...accumulator,
      [word.id]: word
    }), {})
  ), [state.words]);

  const foundWordIdsSet = useMemo(() => new Set(state.foundWordIds), [state.foundWordIds]);

  const foundCellSet = useMemo(() => {
    const cells = new Set();
    state.foundWordIds.forEach((wordId) => {
      const word = wordsById[wordId];
      if (!word) return;
      word.cells.forEach((cell) => cells.add(cellKey(cell.row, cell.col)));
    });
    return cells;
  }, [state.foundWordIds, wordsById]);

  const previewCellSet = useMemo(() => {
    const cells = new Set();
    state.previewPath.forEach((cell) => cells.add(cellKey(cell.row, cell.col)));
    return cells;
  }, [state.previewPath]);

  const anchorCellKey = state.selectionStart
    ? cellKey(state.selectionStart.row, state.selectionStart.col)
    : null;

  const payloadBuilder = useCallback((snapshot) => {
    const foundSet = new Set(snapshot.foundWordIds);
    return {
      mode: "knowledge-arcade",
      variant: "sopa-letras",
      coordinates: "grid_row_col_origin_top_left",
      locale,
      match: {
        current: snapshot.matchId + 1,
        total: KNOWLEDGE_ARCADE_MATCH_COUNT
      },
      status: snapshot.status,
      boardSize: snapshot.boardSize,
      wordsTotal: snapshot.words.length,
      wordsFound: snapshot.foundWordIds.length,
      foundWords: snapshot.words
        .filter((word) => foundSet.has(word.id))
        .map((word) => word.word),
      pendingWords: snapshot.words
        .filter((word) => !foundSet.has(word.id))
        .map((word) => word.word),
      targets: snapshot.words.map((word) => ({
        word: word.word,
        start: word.start,
        end: word.end,
        direction: word.direction,
        found: foundSet.has(word.id)
      })),
      cursor: snapshot.cursor,
      previewPath: snapshot.previewPath,
      message: snapshot.message
    };
  }, [locale]);

  const advanceTime = useCallback(() => undefined, []);
  useGameRuntimeBridge(state, payloadBuilder, advanceTime);

  return (
    <div className="mini-game knowledge-game knowledge-arcade-game knowledge-sopa-letras">
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
          <span>{copy.board}: {state.boardSize}x{state.boardSize}</span>
          <span>{copy.progress}: {state.foundWordIds.length}/{state.words.length}</span>
          <span>{copy.status}: {state.status === "won" ? copy.statusWon : copy.statusPlaying}</span>
        </div>

        <p className="wordsearch-note">{copy.controls}</p>

        <div className="wordsearch-shell">
          <div className="wordsearch-board-shell">
            <div
              className="wordsearch-board"
              role="grid"
              style={{ "--wordsearch-size": state.boardSize }}
            >
              {state.board.map((row, rowIndex) =>
                row.map((letter, colIndex) => {
                  const id = cellKey(rowIndex, colIndex);
                  const isFound = foundCellSet.has(id);
                  const isPreview = previewCellSet.has(id);
                  const isAnchor = anchorCellKey === id;
                  const isCursor = state.cursor.row === rowIndex && state.cursor.col === colIndex;
                  const className = [
                    "wordsearch-cell",
                    isFound ? "found" : "",
                    isPreview ? "preview" : "",
                    isAnchor ? "anchor" : "",
                    isCursor ? "cursor" : ""
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <button
                      key={id}
                      type="button"
                      className={className}
                      draggable={false}
                      onContextMenu={(event) => event.preventDefault()}
                      onPointerDown={(event) => {
                        if (event.button !== 0) return;
                        event.preventDefault();
                        selectingRef.current = true;
                        if (state.selectionStart && state.previewPath.length === 1) {
                          updateSelection(rowIndex, colIndex);
                          return;
                        }
                        startSelection(rowIndex, colIndex, false);
                      }}
                      onPointerEnter={(event) => {
                        if (!selectingRef.current && event.buttons === 0) return;
                        updateSelection(rowIndex, colIndex);
                      }}
                      onPointerUp={(event) => {
                        if (event.button !== 0) return;
                        event.preventDefault();
                        selectingRef.current = false;
                        finishSelection({ row: rowIndex, col: colIndex });
                      }}
                    >
                      {letter}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="wordsearch-words-shell">
            <h5>{copy.words}</h5>
            <ul className="wordsearch-words">
              {state.words.map((word) => (
                <li
                  key={word.id}
                  className={`wordsearch-word ${foundWordIdsSet.has(word.id) ? "found" : ""}`.trim()}
                >
                  {word.word}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <p className="game-message">{state.message}</p>
    </div>
  );
}

export default WordSearchKnowledgeGame;
