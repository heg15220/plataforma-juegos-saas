import React, { useCallback, useEffect, useMemo, useState } from "react";
import useGameRuntimeBridge from "../../utils/useGameRuntimeBridge";
import { resolveKnowledgeArcadeLocale } from "./knowledgeArcadeUtils";
import {
  CROSSWORD_MATCH_COUNT,
  CROSSWORD_MAX_WORD_OPTIONS,
  buildWordMaps,
  createCrosswordMatch,
  createEntries,
  evaluateWordFeedback,
  findFirstCell,
  getWordKeysForCell,
  isBlocked,
  isComplete,
  isSolved,
  keyForCell,
  moveSelection,
  nextCellInRow
} from "./crosswordGenerator";

const DEFAULT_MAX_WORD_LENGTH = 8;

const getRandomCrosswordMatchId = () =>
  Math.floor(Math.random() * CROSSWORD_MATCH_COUNT);

const getRandomCrosswordMatchIdExcept = (matchId) => {
  if (CROSSWORD_MATCH_COUNT <= 1) return 0;

  const current = ((Number(matchId) || 0) + CROSSWORD_MATCH_COUNT) % CROSSWORD_MATCH_COUNT;
  const candidate = getRandomCrosswordMatchId();
  if (candidate !== current) {
    return candidate;
  }

  return (candidate + 1 + Math.floor(Math.random() * (CROSSWORD_MATCH_COUNT - 1)))
    % CROSSWORD_MATCH_COUNT;
};

const formatClueStart = (start, locale) => {
  const row = Number.isFinite(start?.row) ? start.row + 1 : 1;
  const col = Number.isFinite(start?.col) ? start.col + 1 : 1;
  if (locale === "es") {
    return `(fila ${row}, columna ${col})`;
  }
  return `(row ${row}, column ${col})`;
};

const COPY_BY_LOCALE = {
  es: {
    title: "Crucigrama Pro",
    subtitle: "Generador dinamico con mas de 10.000 partidas y pistas variadas.",
    restart: "Partida aleatoria",
    match: "Partida",
    board: "Tablero",
    moves: "Movimientos",
    status: "Estado",
    statusWon: "Resuelto",
    statusPlaying: "En curso",
    clearCell: "Borrar celda",
    check: "Comprobar",
    clues: "Pistas",
    maxWordLength: "Longitud maxima",
    maxWordLengthShort: "Max",
    startMessage: (maxWordLength) =>
      `Rellena la rejilla. Longitud maxima seleccionada: ${maxWordLength}.`,
    pendingCells: "Aun quedan celdas por completar.",
    wrongLetters: "Hay letras incorrectas.",
    solved: "Crucigrama completado.",
    letterSaved: (letter) => `Letra ${letter} registrada.`,
    cleared: "Celda limpiada.",
    backspace: "Retroceso aplicado.",
    wordCorrect: (count) =>
      count === 1
        ? "La palabra seleccionada es correcta."
        : "Las palabras seleccionadas son correctas.",
    wordWrong: (count) =>
      count === 1
        ? "La palabra seleccionada tiene letras incorrectas."
        : "Hay palabras seleccionadas con letras incorrectas.",
    wordPending: (count) =>
      count === 1
        ? "Completa la palabra seleccionada antes de comprobar."
        : "Completa todas las palabras seleccionadas antes de comprobar.",
    optionLabel: (value) => `Hasta ${value} letras`,
    acrossHint: ({ clue }) => clue,
    downHint: ({ clue }) => clue,
    acrossClue: (_id, text, start) => `Pista ${formatClueStart(start, "es")}: ${text}`,
    downClue: (_id, text, start) => `Pista ${formatClueStart(start, "es")}: ${text}`
  },
  en: {
    title: "Crossword Pro",
    subtitle: "Dynamic generator with 10k+ matches and varied clues.",
    restart: "Random match",
    match: "Match",
    board: "Board",
    moves: "Moves",
    status: "Status",
    statusWon: "Solved",
    statusPlaying: "In progress",
    clearCell: "Clear cell",
    check: "Check",
    clues: "Clues",
    maxWordLength: "Max length",
    maxWordLengthShort: "Max",
    startMessage: (maxWordLength) =>
      `Fill the grid. Selected max length: ${maxWordLength}.`,
    pendingCells: "There are still empty cells.",
    wrongLetters: "There are incorrect letters.",
    solved: "Crossword solved.",
    letterSaved: (letter) => `Letter ${letter} saved.`,
    cleared: "Cell cleared.",
    backspace: "Backspace applied.",
    wordCorrect: (count) =>
      count === 1
        ? "The selected word is correct."
        : "The selected words are correct.",
    wordWrong: (count) =>
      count === 1
        ? "The selected word has incorrect letters."
        : "Some selected words have incorrect letters.",
    wordPending: (count) =>
      count === 1
        ? "Complete the selected word before checking."
        : "Complete all selected words before checking.",
    optionLabel: (value) => `Up to ${value} letters`,
    acrossHint: ({ clue }) => clue,
    downHint: ({ clue }) => clue,
    acrossClue: (_id, text, start) => `Clue ${formatClueStart(start, "en")}: ${text}`,
    downClue: (_id, text, start) => `Clue ${formatClueStart(start, "en")}: ${text}`
  }
};

const normalizeLetter = (value) => value.trim().toUpperCase().slice(0, 1);

const filterWordKeysByDirection = (wordKeys, direction) =>
  (wordKeys || []).filter((wordKey) => wordKey.startsWith(`${direction}-`));

const resolveDirectionalWordKeys = (cellWordMap, row, col, direction) => {
  const wordKeys = getWordKeysForCell(cellWordMap, row, col);
  const directional = filterWordKeysByDirection(wordKeys, direction);
  if (directional.length) return directional;
  if (wordKeys.length) return [wordKeys[0]];
  return [];
};

const resolveNextSelection = (solution, selected, direction, step) => {
  if (direction === "down") {
    return moveSelection(solution, selected, step, 0);
  }
  return nextCellInRow(solution, selected, step);
};

const createInitialState = (matchId, locale, copy, maxWordLength) => {
  const crossword = createCrosswordMatch(matchId, locale, copy, { maxWordLength });
  const { wordByKey, cellWordMap } = buildWordMaps(crossword.clues);

  return {
    matchId,
    puzzleKey: crossword.puzzleKey,
    solution: crossword.solution,
    clues: crossword.clues,
    cellNumbers: crossword.cellNumbers,
    grid: crossword.grid,
    entries: createEntries(crossword.solution),
    selected: findFirstCell(crossword.solution),
    moves: 0,
    status: "playing",
    message: copy.startMessage(maxWordLength),
    activeDirection: "across",
    wordByKey,
    cellWordMap,
    wordFeedback: {},
    cellFeedback: {},
    feedbackToken: 0,
    maxWordLength
  };
};

const allWordKeys = (snapshot) => Object.keys(snapshot.wordByKey);

function CrosswordKnowledgeGame() {
  const locale = useMemo(resolveKnowledgeArcadeLocale, []);
  const copy = useMemo(() => COPY_BY_LOCALE[locale] ?? COPY_BY_LOCALE.en, [locale]);
  const [state, setState] = useState(() =>
    createInitialState(
      getRandomCrosswordMatchId(),
      locale,
      copy,
      DEFAULT_MAX_WORD_LENGTH
    )
  );

  const selectedWordKeys = useMemo(() => (
    new Set(
      resolveDirectionalWordKeys(
        state.cellWordMap,
        state.selected.row,
        state.selected.col,
        state.activeDirection
      )
    )
  ), [state.activeDirection, state.cellWordMap, state.selected.col, state.selected.row]);

  const visibleClues = useMemo(() => (
    [...(state.clues.across || []), ...(state.clues.down || [])]
      .slice()
      .sort((left, right) => {
        if (left.id !== right.id) return left.id - right.id;
        return left.key.localeCompare(right.key);
      })
  ), [state.clues.across, state.clues.down]);

  const cellSize = useMemo(() => {
    const maxSide = Math.max(state.grid.rows, state.grid.cols);
    if (maxSide <= 6) return 36;
    if (maxSide <= 8) return 32;
    if (maxSide <= 10) return 28;
    return 26;
  }, [state.grid.cols, state.grid.rows]);

  const restart = useCallback(() => {
    setState((previous) =>
      createInitialState(
        getRandomCrosswordMatchIdExcept(previous.matchId),
        locale,
        copy,
        previous.maxWordLength
      )
    );
  }, [copy, locale]);

  const changeMaxWordLength = useCallback((event) => {
    const parsed = Number.parseInt(event.target.value, 10);
    const maxWordLength = CROSSWORD_MAX_WORD_OPTIONS.includes(parsed)
      ? parsed
      : DEFAULT_MAX_WORD_LENGTH;

    setState(() =>
      createInitialState(
        getRandomCrosswordMatchId(),
        locale,
        copy,
        maxWordLength
      )
    );
  }, [copy, locale]);

  const writeLetter = useCallback((letter) => {
    setState((previous) => {
      if (previous.status === "won") return previous;
      const safeLetter = normalizeLetter(letter);
      if (!/^[A-Z]$/.test(safeLetter)) return previous;

      const { row, col } = previous.selected;
      if (isBlocked(previous.solution, row, col)) return previous;

      const nextEntries = previous.entries.map((entryRow) => [...entryRow]);
      nextEntries[row][col] = safeLetter;
      const complete = isComplete(nextEntries);
      const solved = complete && isSolved(nextEntries, previous.solution);

      let message = copy.letterSaved(safeLetter);
      let wordFeedback = {};
      let cellFeedback = {};
      let feedbackToken = previous.feedbackToken;

      const scopedWordKeys = resolveDirectionalWordKeys(
        previous.cellWordMap,
        row,
        col,
        previous.activeDirection
      );
      if (!solved && scopedWordKeys.length) {
        const feedback = evaluateWordFeedback({
          entries: nextEntries,
          solution: previous.solution,
          wordByKey: previous.wordByKey,
          targetWordKeys: scopedWordKeys
        });
        if (feedback.summary.wrong > 0 || feedback.summary.correct > 0) {
          wordFeedback = feedback.wordFeedback;
          cellFeedback = feedback.cellFeedback;
          feedbackToken = 1 - previous.feedbackToken;
          message = feedback.summary.wrong > 0
            ? copy.wordWrong(feedback.summary.wrong)
            : copy.wordCorrect(feedback.summary.correct);
        }
      }

      if (solved) {
        const solvedFeedback = evaluateWordFeedback({
          entries: nextEntries,
          solution: previous.solution,
          wordByKey: previous.wordByKey,
          targetWordKeys: allWordKeys(previous)
        });
        wordFeedback = solvedFeedback.wordFeedback;
        cellFeedback = solvedFeedback.cellFeedback;
        feedbackToken = 1 - previous.feedbackToken;
        message = copy.solved;
      }

      return {
        ...previous,
        entries: nextEntries,
        selected: resolveNextSelection(
          previous.solution,
          previous.selected,
          previous.activeDirection,
          1
        ),
        moves: previous.moves + 1,
        status: solved ? "won" : "playing",
        message,
        wordFeedback,
        cellFeedback,
        feedbackToken
      };
    });
  }, [copy]);

  const clearCell = useCallback(() => {
    setState((previous) => {
      if (previous.status === "won") return previous;
      const { row, col } = previous.selected;
      if (isBlocked(previous.solution, row, col)) return previous;

      const nextEntries = previous.entries.map((entryRow) => [...entryRow]);
      if (nextEntries[row][col]) {
        nextEntries[row][col] = "";
        return {
          ...previous,
          entries: nextEntries,
          moves: previous.moves + 1,
          status: "playing",
          message: copy.cleared,
          wordFeedback: {},
          cellFeedback: {}
        };
      }

      const previousCell = resolveNextSelection(
        previous.solution,
        previous.selected,
        previous.activeDirection,
        -1
      );
      if (previousCell.row === row && previousCell.col === col) {
        return previous;
      }

      nextEntries[previousCell.row][previousCell.col] = "";
      return {
        ...previous,
        entries: nextEntries,
        selected: previousCell,
        moves: previous.moves + 1,
        status: "playing",
        message: copy.backspace,
        wordFeedback: {},
        cellFeedback: {}
      };
    });
  }, [copy]);

  const checkNow = useCallback(() => {
    setState((previous) => {
      const complete = isComplete(previous.entries);
      const selectedKeys = resolveDirectionalWordKeys(
        previous.cellWordMap,
        previous.selected.row,
        previous.selected.col,
        previous.activeDirection
      );
      const targetWordKeys = complete
        ? allWordKeys(previous)
        : selectedKeys.length ? selectedKeys : allWordKeys(previous);

      const feedback = evaluateWordFeedback({
        entries: previous.entries,
        solution: previous.solution,
        wordByKey: previous.wordByKey,
        targetWordKeys
      });

      const solved = complete && isSolved(previous.entries, previous.solution);
      let message;
      if (solved) {
        message = copy.solved;
      } else if (complete) {
        message = copy.wrongLetters;
      } else if (feedback.summary.wrong > 0) {
        message = copy.wordWrong(feedback.summary.wrong);
      } else if (feedback.summary.pending > 0) {
        message = copy.wordPending(feedback.summary.pending);
      } else if (feedback.summary.correct > 0) {
        message = copy.wordCorrect(feedback.summary.correct);
      } else {
        message = copy.pendingCells;
      }

      return {
        ...previous,
        status: solved ? "won" : "playing",
        message,
        wordFeedback: feedback.wordFeedback,
        cellFeedback: feedback.cellFeedback,
        feedbackToken: 1 - previous.feedbackToken
      };
    });
  }, [copy]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key;

      if (key === "ArrowUp") {
        event.preventDefault();
        setState((previous) => ({
          ...previous,
          selected: moveSelection(previous.solution, previous.selected, -1, 0),
          activeDirection: "down"
        }));
        return;
      }
      if (key === "ArrowDown") {
        event.preventDefault();
        setState((previous) => ({
          ...previous,
          selected: moveSelection(previous.solution, previous.selected, 1, 0),
          activeDirection: "down"
        }));
        return;
      }
      if (key === "ArrowLeft") {
        event.preventDefault();
        setState((previous) => ({
          ...previous,
          selected: moveSelection(previous.solution, previous.selected, 0, -1),
          activeDirection: "across"
        }));
        return;
      }
      if (key === "ArrowRight") {
        event.preventDefault();
        setState((previous) => ({
          ...previous,
          selected: moveSelection(previous.solution, previous.selected, 0, 1),
          activeDirection: "across"
        }));
        return;
      }
      if (key === "Backspace" || key === "Delete") {
        event.preventDefault();
        clearCell();
        return;
      }
      if (/^[a-z]$/i.test(key)) {
        writeLetter(key);
        return;
      }
      if (key === "Enter") {
        checkNow();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [checkNow, clearCell, writeLetter]);

  const payloadBuilder = useCallback((snapshot) => ({
    mode: "knowledge-arcade",
    variant: "crucigrama",
    coordinates: "crossword_grid_origin_top_left_hash_blocked",
    locale,
    match: {
      current: snapshot.matchId + 1,
      total: CROSSWORD_MATCH_COUNT
    },
    status: snapshot.status,
    activeDirection: snapshot.activeDirection,
    selected: snapshot.selected,
    moves: snapshot.moves,
    maxWordLength: snapshot.maxWordLength,
    entries: snapshot.entries,
    clues: snapshot.clues,
    grid: snapshot.grid,
    feedback: {
      words: snapshot.wordFeedback,
      cells: snapshot.cellFeedback
    },
    message: snapshot.message
  }), [locale]);

  const advanceTime = useCallback(() => undefined, []);
  useGameRuntimeBridge(state, payloadBuilder, advanceTime);

  return (
    <div className="mini-game knowledge-game knowledge-arcade-game knowledge-crucigrama">
      <div className="mini-head">
        <div>
          <h4>{copy.title}</h4>
          <p>{copy.subtitle}</p>
        </div>

        <div className="crossword-head-actions">
          <label className="crossword-length-select">
            <span>{copy.maxWordLength}</span>
            <select value={state.maxWordLength} onChange={changeMaxWordLength}>
              {CROSSWORD_MAX_WORD_OPTIONS.map((option) => (
                <option key={option} value={option}>{copy.optionLabel(option)}</option>
              ))}
            </select>
          </label>

          <button type="button" onClick={restart}>{copy.restart}</button>
        </div>
      </div>

      <section className="knowledge-mode-shell">
        <div className="knowledge-status-row">
          <span>{copy.match}: {state.matchId + 1}/{CROSSWORD_MATCH_COUNT}</span>
          <span>{copy.board}: {state.grid.rows}x{state.grid.cols} ({state.grid.openCells})</span>
          <span>{copy.maxWordLengthShort}: {state.maxWordLength}</span>
          <span>{copy.moves}: {state.moves}</span>
          <span>{copy.status}: {state.status === "won" ? copy.statusWon : copy.statusPlaying}</span>
        </div>

        <div className="crossword-layout">
          <div className="crossword-board-panel">
            <div
              className="crossword-grid"
              style={{
                "--crossword-cols": state.grid.cols,
                "--crossword-cell-size": `${cellSize}px`
              }}
            >
              {state.entries.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const blocked = cell === "#";
                  const selected = state.selected.row === rowIndex && state.selected.col === colIndex;
                  const cellId = keyForCell(rowIndex, colIndex);
                  const cellNumber = state.cellNumbers[cellId] ?? null;
                  const feedback = state.cellFeedback[cellId] ?? null;
                  const feedbackClass = feedback ? `feedback-${feedback}` : "";
                  const tokenClass = feedback ? `feedback-token-${state.feedbackToken}` : "";

                  return (
                    <button
                      key={`${state.puzzleKey}-${rowIndex}-${colIndex}`}
                      type="button"
                      className={[
                        "crossword-cell",
                        blocked ? "blocked" : "",
                        selected ? "selected" : "",
                        feedbackClass,
                        tokenClass
                      ].filter(Boolean).join(" ")}
                      disabled={blocked}
                      onClick={() => {
                        if (blocked) return;
                        setState((previous) => ({
                          ...previous,
                          selected: { row: rowIndex, col: colIndex }
                        }));
                      }}
                    >
                      {!blocked ? <span className="crossword-number">{cellNumber ?? ""}</span> : null}
                      {!blocked ? <span className="crossword-letter">{cell}</span> : null}
                    </button>
                  );
                })
              )}
            </div>

            <div className="crossword-toolbar">
              <button type="button" onClick={clearCell}>{copy.clearCell}</button>
              <button type="button" onClick={checkNow}>{copy.check}</button>
            </div>
          </div>

          <div className="crossword-clues">
            <article>
              <h5>{copy.clues}</h5>
              <ul>
                {visibleClues.map((clue) => {
                  const feedback = state.wordFeedback[clue.key] ?? null;
                  const isActive = selectedWordKeys.has(clue.key);
                  return (
                    <li
                      key={clue.key}
                      className={[
                        isActive ? "active-word" : "",
                        feedback ? `feedback-${feedback}` : "",
                        feedback ? `feedback-token-${state.feedbackToken}` : ""
                      ].filter(Boolean).join(" ")}
                    >
                      {clue.text}
                    </li>
                  );
                })}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <p className="game-message">{state.message}</p>
    </div>
  );
}

export default CrosswordKnowledgeGame;
