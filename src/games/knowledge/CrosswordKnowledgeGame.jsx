import React, { useCallback, useEffect, useMemo, useState } from "react";
import useGameRuntimeBridge from "../../utils/useGameRuntimeBridge";
import {
  KNOWLEDGE_ARCADE_MATCH_COUNT,
  getRandomKnowledgeMatchId,
  getRandomKnowledgeMatchIdExcept,
  resolveKnowledgeArcadeLocale
} from "./knowledgeArcadeUtils";

const COPY_BY_LOCALE = {
  es: {
    title: "Crucigrama Mini",
    subtitle: "Rellena la rejilla usando pistas horizontales y verticales.",
    restart: "Partida aleatoria",
    match: "Partida",
    moves: "Movimientos",
    status: "Estado",
    statusWon: "Resuelto",
    statusPlaying: "En curso",
    clearCell: "Borrar celda",
    check: "Comprobar",
    across: "Horizontales",
    down: "Verticales",
    startMessage: "Rellena la rejilla con las pistas.",
    pendingCells: "Aun quedan celdas por completar.",
    wrongLetters: "Hay letras incorrectas.",
    solved: "Crucigrama completado.",
    letterSaved: (letter) => `Letra ${letter} registrada.`,
    cleared: "Celda limpiada.",
    backspace: "Retroceso aplicado.",
    acrossClue: (id, text, start) => `${id}. (${start.row + 1},${start.col + 1}) ${text}`,
    downClue: (id, text, start) => `${id}. (${start.row + 1},${start.col + 1}) ${text}`
  },
  en: {
    title: "Mini Crossword",
    subtitle: "Fill the grid using across and down clues.",
    restart: "Random match",
    match: "Match",
    moves: "Moves",
    status: "Status",
    statusWon: "Solved",
    statusPlaying: "In progress",
    clearCell: "Clear cell",
    check: "Check",
    across: "Across",
    down: "Down",
    startMessage: "Fill the grid with the clues.",
    pendingCells: "There are still empty cells.",
    wrongLetters: "There are incorrect letters.",
    solved: "Crossword solved.",
    letterSaved: (letter) => `Letter ${letter} saved.`,
    cleared: "Cell cleared.",
    backspace: "Backspace applied.",
    acrossClue: (id, text, start) => `${id}. (${start.row + 1},${start.col + 1}) ${text}`,
    downClue: (id, text, start) => `${id}. (${start.row + 1},${start.col + 1}) ${text}`
  }
};

const normalizeLetter = (value) => value.trim().toUpperCase().slice(0, 1);
const keyForCell = (row, col) => `${row}-${col}`;

const CROSSWORD_BANK = {
  es: [
    {
      across: [
        { word: "HORAS", clue: "Unidad de tiempo de sesenta minutos." },
        { word: "SEDAL", clue: "Hilo fino usado para pescar." },
        { word: "CARAS", clue: "Rostros o partes frontales de algo." }
      ],
      down: [
        { word: "RADAR", clue: "Sistema que detecta objetos con ondas." },
        { word: "SALAS", clue: "Habitaciones amplias de una casa o edificio." }
      ]
    },
    {
      across: [
        { word: "MARCO", clue: "Estructura que rodea una foto o puerta." },
        { word: "NADIE", clue: "Ninguna persona." },
        { word: "TARTA", clue: "Postre horneado, normalmente dulce." }
      ],
      down: [
        { word: "RADAR", clue: "Sistema que detecta objetos con ondas." },
        { word: "OVEJA", clue: "Animal domestico conocido por su lana." }
      ]
    },
    {
      across: [
        { word: "PENAS", clue: "Tristezas o sufrimientos." },
        { word: "SEDAL", clue: "Hilo fino usado para pescar." },
        { word: "MIRAR", clue: "Dirigir la vista hacia algo." }
      ],
      down: [
        { word: "NADAR", clue: "Desplazarse por el agua." },
        { word: "SOLAR", clue: "Relativo al Sol." }
      ]
    }
  ],
  en: [
    {
      across: [
        { word: "TURNS", clue: "Changes direction or rotates." },
        { word: "MEDAL", clue: "Award given for achievement." },
        { word: "CURED", clue: "Healed or preserved." }
      ],
      down: [
        { word: "RADAR", clue: "System that detects objects with radio waves." },
        { word: "SALAD", clue: "Cold dish with mixed vegetables." }
      ]
    },
    {
      across: [
        { word: "TOOLS", clue: "Instruments used to do work." },
        { word: "OPERA", clue: "Stage work sung with orchestral music." },
        { word: "MINUS", clue: "Mathematical subtraction sign." }
      ],
      down: [
        { word: "OCEAN", clue: "Very large body of salt water." },
        { word: "STARS", clue: "Bright celestial objects seen at night." }
      ]
    },
    {
      across: [
        { word: "ATTIC", clue: "Room located just below a roof." },
        { word: "RHINO", clue: "Large mammal with a horn." },
        { word: "RIGID", clue: "Stiff and not flexible." }
      ],
      down: [
        { word: "THING", clue: "General name for an object." },
        { word: "CLOUD", clue: "Visible mass of condensed water in the sky." }
      ]
    }
  ]
};

const isValidCrosswordTemplate = (template) => {
  if (!template?.across || !template?.down) return false;
  if (template.across.length !== 3 || template.down.length !== 2) return false;
  const acrossWords = template.across.map((entry) => String(entry.word || "").toUpperCase());
  const downWords = template.down.map((entry) => String(entry.word || "").toUpperCase());
  if (!acrossWords.every((word) => /^[A-Z]{5}$/.test(word))) return false;
  if (!downWords.every((word) => /^[A-Z]{5}$/.test(word))) return false;
  return (
    acrossWords[0][2] === downWords[0][0]
    && acrossWords[1][2] === downWords[0][2]
    && acrossWords[2][2] === downWords[0][4]
    && acrossWords[0][4] === downWords[1][0]
    && acrossWords[1][4] === downWords[1][2]
    && acrossWords[2][4] === downWords[1][4]
  );
};

const pickCrosswordTemplate = (matchId, locale) => {
  const bank = CROSSWORD_BANK[locale] ?? CROSSWORD_BANK.en;
  const safeBank = bank.filter(isValidCrosswordTemplate);
  const fallback = CROSSWORD_BANK.en.find(isValidCrosswordTemplate);
  const source = safeBank.length ? safeBank : fallback ? [fallback] : [];
  if (!source.length) {
    throw new Error("No valid crossword templates available.");
  }
  const safeId = Math.abs(Number(matchId) || 0);
  return source[safeId % source.length];
};

const createCrosswordMatch = (matchId, locale, copy) => {
  const template = pickCrosswordTemplate(matchId, locale);
  const row1 = template.across[0].word.toUpperCase();
  const row3 = template.across[1].word.toUpperCase();
  const row5 = template.across[2].word.toUpperCase();
  const down1 = template.down[0].word.toUpperCase();
  const down2 = template.down[1].word.toUpperCase();

  const middleA = down1[1];
  const middleB = down1[3];
  const middleC = down2[1];
  const middleD = down2[3];

  const solution = [
    row1.split(""),
    ["#", "#", middleA, "#", middleC],
    row3.split(""),
    ["#", "#", middleB, "#", middleD],
    row5.split("")
  ];

  const acrossStarts = [
    { row: 0, col: 0 },
    { row: 2, col: 0 },
    { row: 4, col: 0 }
  ];
  const downStarts = [
    { row: 0, col: 2 },
    { row: 0, col: 4 }
  ];

  return {
    solution,
    clues: {
      across: template.across.map((entry, index) => ({
        id: index + 1,
        start: acrossStarts[index],
        text: copy.acrossClue(index + 1, entry.clue, acrossStarts[index])
      })),
      down: template.down.map((entry, index) => ({
        id: index + 1,
        start: downStarts[index],
        text: copy.downClue(index + 1, entry.clue, downStarts[index])
      }))
    }
  };
};

const createEntries = (solution) => solution.map((row) => row.map((cell) => (cell === "#" ? "#" : "")));

const findFirstCell = (solution) => {
  for (let row = 0; row < solution.length; row += 1) {
    for (let col = 0; col < solution[row].length; col += 1) {
      if (solution[row][col] !== "#") {
        return { row, col };
      }
    }
  }
  return { row: 0, col: 0 };
};

const inBounds = (solution, row, col) =>
  row >= 0 && row < solution.length && col >= 0 && col < solution[0].length;

const isBlocked = (solution, row, col) => solution[row][col] === "#";

const buildCellNumbers = (solution) => {
  let number = 1;
  const map = {};
  for (let row = 0; row < solution.length; row += 1) {
    for (let col = 0; col < solution[row].length; col += 1) {
      if (isBlocked(solution, row, col)) continue;
      const startsAcross = col === 0 || isBlocked(solution, row, col - 1);
      const startsDown = row === 0 || isBlocked(solution, row - 1, col);
      if (startsAcross || startsDown) {
        map[keyForCell(row, col)] = number;
        number += 1;
      }
    }
  }
  return map;
};

const isComplete = (entries) => {
  for (let row = 0; row < entries.length; row += 1) {
    for (let col = 0; col < entries[row].length; col += 1) {
      if (entries[row][col] === "#") continue;
      if (!entries[row][col]) return false;
    }
  }
  return true;
};

const isSolved = (entries, solution) => {
  for (let row = 0; row < entries.length; row += 1) {
    for (let col = 0; col < entries[row].length; col += 1) {
      if (entries[row][col] === "#") continue;
      if (entries[row][col] !== solution[row][col]) return false;
    }
  }
  return true;
};

const moveSelection = (solution, selected, deltaRow, deltaCol) => {
  let row = selected.row + deltaRow;
  let col = selected.col + deltaCol;

  while (inBounds(solution, row, col) && isBlocked(solution, row, col)) {
    row += deltaRow;
    col += deltaCol;
  }

  if (!inBounds(solution, row, col)) {
    return selected;
  }

  return { row, col };
};

const nextCellInRow = (solution, selected, direction) => {
  let col = selected.col + direction;
  while (inBounds(solution, selected.row, col)) {
    if (!isBlocked(solution, selected.row, col)) {
      return { row: selected.row, col };
    }
    col += direction;
  }
  return selected;
};

const createInitialState = (matchId, locale, copy) => {
  const crossword = createCrosswordMatch(matchId, locale, copy);
  return {
    matchId,
    solution: crossword.solution,
    clues: crossword.clues,
    cellNumbers: buildCellNumbers(crossword.solution),
    entries: createEntries(crossword.solution),
    selected: findFirstCell(crossword.solution),
    moves: 0,
    status: "playing",
    message: copy.startMessage
  };
};

function CrosswordKnowledgeGame() {
  const locale = useMemo(resolveKnowledgeArcadeLocale, []);
  const copy = useMemo(() => COPY_BY_LOCALE[locale] ?? COPY_BY_LOCALE.en, [locale]);
  const [state, setState] = useState(() =>
    createInitialState(getRandomKnowledgeMatchId(), locale, copy)
  );

  const restart = useCallback(() => {
    setState((previous) =>
      createInitialState(getRandomKnowledgeMatchIdExcept(previous.matchId), locale, copy)
    );
  }, [copy, locale]);

  const checkState = useCallback((entries, solution) => {
    const complete = isComplete(entries);
    if (!complete) {
      return {
        status: "playing",
        message: copy.pendingCells
      };
    }
    if (!isSolved(entries, solution)) {
      return {
        status: "playing",
        message: copy.wrongLetters
      };
    }
    return {
      status: "won",
      message: copy.solved
    };
  }, [copy]);

  const writeLetter = useCallback((letter) => {
    setState((previous) => {
      if (previous.status === "won") return previous;
      const safeLetter = normalizeLetter(letter);
      if (!/^[A-Z]$/.test(safeLetter)) return previous;

      const { row, col } = previous.selected;
      if (isBlocked(previous.solution, row, col)) return previous;

      const nextEntries = previous.entries.map((entryRow) => [...entryRow]);
      nextEntries[row][col] = safeLetter;
      const checked = checkState(nextEntries, previous.solution);

      return {
        ...previous,
        entries: nextEntries,
        selected: nextCellInRow(previous.solution, previous.selected, 1),
        moves: previous.moves + 1,
        status: checked.status,
        message: checked.status === "won" ? checked.message : copy.letterSaved(safeLetter)
      };
    });
  }, [checkState, copy]);

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
          message: copy.cleared
        };
      }

      const previousCell = nextCellInRow(previous.solution, previous.selected, -1);
      if (previousCell.row === row && previousCell.col === col) {
        return previous;
      }
      nextEntries[previousCell.row][previousCell.col] = "";
      return {
        ...previous,
        entries: nextEntries,
        selected: previousCell,
        moves: previous.moves + 1,
        message: copy.backspace
      };
    });
  }, [copy]);

  const checkNow = useCallback(() => {
    setState((previous) => {
      const checked = checkState(previous.entries, previous.solution);
      return {
        ...previous,
        status: checked.status,
        message: checked.message
      };
    });
  }, [checkState]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key;

      if (key === "ArrowUp") {
        event.preventDefault();
        setState((previous) => ({
          ...previous,
          selected: moveSelection(previous.solution, previous.selected, -1, 0)
        }));
        return;
      }
      if (key === "ArrowDown") {
        event.preventDefault();
        setState((previous) => ({
          ...previous,
          selected: moveSelection(previous.solution, previous.selected, 1, 0)
        }));
        return;
      }
      if (key === "ArrowLeft") {
        event.preventDefault();
        setState((previous) => ({
          ...previous,
          selected: moveSelection(previous.solution, previous.selected, 0, -1)
        }));
        return;
      }
      if (key === "ArrowRight") {
        event.preventDefault();
        setState((previous) => ({
          ...previous,
          selected: moveSelection(previous.solution, previous.selected, 0, 1)
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
        return;
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
      total: KNOWLEDGE_ARCADE_MATCH_COUNT
    },
    status: snapshot.status,
    selected: snapshot.selected,
    moves: snapshot.moves,
    entries: snapshot.entries,
    clues: snapshot.clues,
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
        <button type="button" onClick={restart}>{copy.restart}</button>
      </div>

      <section className="knowledge-mode-shell">
        <div className="knowledge-status-row">
          <span>{copy.match}: {state.matchId + 1}/{KNOWLEDGE_ARCADE_MATCH_COUNT}</span>
          <span>{copy.moves}: {state.moves}</span>
          <span>{copy.status}: {state.status === "won" ? copy.statusWon : copy.statusPlaying}</span>
        </div>

        <div className="crossword-grid">
          {state.entries.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const blocked = cell === "#";
              const selected = state.selected.row === rowIndex && state.selected.col === colIndex;
              const cellNumber = state.cellNumbers[keyForCell(rowIndex, colIndex)] ?? null;
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  type="button"
                  className={`crossword-cell ${blocked ? "blocked" : ""} ${selected ? "selected" : ""}`.trim()}
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

        <div className="crossword-clues">
          <article>
            <h5>{copy.across}</h5>
            <ul>
              {state.clues.across.map((clue) => (
                <li key={`across-${clue.id}`}>{clue.text}</li>
              ))}
            </ul>
          </article>
          <article>
            <h5>{copy.down}</h5>
            <ul>
              {state.clues.down.map((clue) => (
                <li key={`down-${clue.id}`}>{clue.text}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <p className="game-message">{state.message}</p>
    </div>
  );
}

export default CrosswordKnowledgeGame;
