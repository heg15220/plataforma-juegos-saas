import { KNOWLEDGE_ARCADE_MATCH_COUNT } from "./knowledgeArcadeUtils";
import { CROSSWORD_TERM_BANK } from "./crosswordTermBank";

const LAYOUT_SEQUENCE = ["compact5", "expanded6", "extended7", "plus8"];
const WORDS_PER_MATCH_SPACE = 8;
const MAX_LAYOUT_ATTEMPTS = 2048;

export const CROSSWORD_LAYOUTS = {
  compact5: {
    key: "compact5",
    size: 5,
    acrossRows: [0, 2, 4],
    downCols: [2, 4]
  },
  expanded6: {
    key: "expanded6",
    size: 6,
    acrossRows: [0, 2, 4],
    downCols: [2, 5]
  },
  extended7: {
    key: "extended7",
    size: 7,
    acrossRows: [0, 2, 4, 6],
    downCols: [2, 6]
  },
  plus8: {
    key: "plus8",
    size: 8,
    acrossRows: [0, 2, 4, 6],
    downCols: [3, 7]
  }
};

const FEEDBACK_PRIORITY = {
  correct: 1,
  wrong: 2
};

const PAIR_INDEX_CACHE = new Map();

const resolveLocaleKey = (locale) => (String(locale || "es").toLowerCase().startsWith("es")
  ? "es"
  : "en");

const normalizeMatchId = (value) => {
  const safe = Math.abs(Number(value) || 0);
  return safe % KNOWLEDGE_ARCADE_MATCH_COUNT;
};

const resolveLayoutPlan = (matchId, locale) => {
  const safeId = normalizeMatchId(matchId);
  const localeShift = resolveLocaleKey(locale) === "es" ? 0 : 4099;
  const shiftedId = (safeId + localeShift) % KNOWLEDGE_ARCADE_MATCH_COUNT;
  const layoutIndex = shiftedId % LAYOUT_SEQUENCE.length;
  const layoutRank = Math.floor(shiftedId / LAYOUT_SEQUENCE.length);
  const layoutKey = LAYOUT_SEQUENCE[layoutIndex];

  return {
    layout: CROSSWORD_LAYOUTS[layoutKey],
    layoutRank,
    shiftedId
  };
};

const getTermsForLayout = (locale, size) => {
  const localeKey = resolveLocaleKey(locale);
  const localeBucket = CROSSWORD_TERM_BANK[localeKey] || CROSSWORD_TERM_BANK.en;
  const bySize = localeBucket[String(size)] || localeBucket[size];
  if (!Array.isArray(bySize) || bySize.length === 0) {
    throw new Error(`Crossword term bank missing locale=${localeKey} size=${size}`);
  }
  return bySize;
};

const buildPairIndex = (terms, firstCol, secondCol) => {
  const map = Object.create(null);
  terms.forEach((term, index) => {
    const pair = `${term.word[firstCol]}${term.word[secondCol]}`;
    if (!map[pair]) {
      map[pair] = [];
    }
    map[pair].push(index);
  });
  return map;
};

const getPairIndex = (locale, layout) => {
  const localeKey = resolveLocaleKey(locale);
  const cacheKey = `${localeKey}-${layout.key}`;
  if (PAIR_INDEX_CACHE.has(cacheKey)) {
    return PAIR_INDEX_CACHE.get(cacheKey);
  }

  const terms = getTermsForLayout(localeKey, layout.size);
  const [firstCol, secondCol] = layout.downCols;
  const pairIndex = buildPairIndex(terms, firstCol, secondCol);

  const cached = {
    terms,
    pairIndex,
    firstCol,
    secondCol
  };
  PAIR_INDEX_CACHE.set(cacheKey, cached);
  return cached;
};

const selectIndexFromCandidates = (candidates, used, seed) => {
  if (!candidates || !candidates.length) return null;
  const start = Math.abs(seed) % candidates.length;

  for (let offset = 0; offset < candidates.length; offset += 1) {
    const candidate = candidates[(start + offset) % candidates.length];
    if (!used.has(candidate)) {
      return candidate;
    }
  }

  return null;
};

const pickUniqueIndices = (total, count, seedBase, step) => {
  const selected = [];
  let seed = seedBase;
  for (let slot = 0; slot < count; slot += 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223 + slot * 97) >>> 0;
    let index = seed % total;
    let guard = 0;

    while (selected.includes(index) && guard < total) {
      index = (index + step + slot + 1) % total;
      guard += 1;
    }

    selected.push(index);
  }

  return selected;
};

const pickWordSetForLayout = ({ layout, layoutRank, shiftedId, locale }) => {
  const { terms, pairIndex } = getPairIndex(locale, layout);
  const total = terms.length;
  const downCount = layout.downCols.length;

  for (let attempt = 0; attempt < MAX_LAYOUT_ATTEMPTS; attempt += 1) {
    const downSeed = (
      shiftedId * 131 +
      layoutRank * 17 +
      attempt * 977 +
      (resolveLocaleKey(locale) === "es" ? 7 : 19)
    ) >>> 0;
    const downIndices = pickUniqueIndices(total, downCount, downSeed, 53 + (attempt % 19));
    const downTerms = downIndices.map((index) => terms[index]);

    const used = new Set(downIndices);
    const acrossIndices = [];
    let valid = true;

    for (let slot = 0; slot < layout.acrossRows.length; slot += 1) {
      const row = layout.acrossRows[slot];
      const pairKey = `${downTerms[0].word[row]}${downTerms[1].word[row]}`;
      const candidates = pairIndex[pairKey];
      if (!candidates?.length) {
        valid = false;
        break;
      }

      const acrossIndex = selectIndexFromCandidates(
        candidates,
        used,
        downSeed + slot * 37 + attempt * 11
      );

      if (acrossIndex == null) {
        valid = false;
        break;
      }

      acrossIndices.push(acrossIndex);
      used.add(acrossIndex);
    }

    if (valid) {
      return {
        acrossTerms: acrossIndices.map((index) => terms[index]),
        downTerms
      };
    }
  }

  for (let attempt = 0; attempt < MAX_LAYOUT_ATTEMPTS; attempt += 1) {
    const downSeed = (
      shiftedId * 271 +
      layoutRank * 23 +
      attempt * 617 +
      (resolveLocaleKey(locale) === "es" ? 29 : 41)
    ) >>> 0;
    const downIndices = pickUniqueIndices(total, downCount, downSeed, 71 + (attempt % 13));
    const downTerms = downIndices.map((index) => terms[index]);

    const acrossIndices = [];
    let valid = true;

    for (let slot = 0; slot < layout.acrossRows.length; slot += 1) {
      const row = layout.acrossRows[slot];
      const pairKey = `${downTerms[0].word[row]}${downTerms[1].word[row]}`;
      const candidates = pairIndex[pairKey];
      if (!candidates?.length) {
        valid = false;
        break;
      }

      const pick = candidates[(downSeed + slot * 19 + attempt * 3) % candidates.length];
      acrossIndices.push(pick);
    }

    if (valid) {
      return {
        acrossTerms: acrossIndices.map((index) => terms[index]),
        downTerms
      };
    }
  }

  throw new Error(`Unable to build crossword word set for locale=${locale} layout=${layout.key}`);
};

const buildSolution = (layout, acrossTerms, downTerms) => {
  const grid = Array.from({ length: layout.size }, () =>
    Array.from({ length: layout.size }, () => "#")
  );

  layout.acrossRows.forEach((row, index) => {
    const word = acrossTerms[index].word;
    for (let col = 0; col < layout.size; col += 1) {
      grid[row][col] = word[col];
    }
  });

  layout.downCols.forEach((col, index) => {
    const word = downTerms[index].word;
    for (let row = 0; row < layout.size; row += 1) {
      const current = grid[row][col];
      if (current !== "#" && current !== word[row]) {
        throw new Error("Crossword generation mismatch.");
      }
      grid[row][col] = word[row];
    }
  });

  return grid;
};

const countPlayableCells = (solution) => {
  let total = 0;
  for (let row = 0; row < solution.length; row += 1) {
    for (let col = 0; col < solution[row].length; col += 1) {
      if (solution[row][col] !== "#") {
        total += 1;
      }
    }
  }
  return total;
};

export const keyForCell = (row, col) => `${row}-${col}`;

export const inBounds = (solution, row, col) =>
  row >= 0 && row < solution.length && col >= 0 && col < solution[0].length;

export const isBlocked = (solution, row, col) => solution[row][col] === "#";

export const buildCellNumbers = (solution) => {
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

const collectWordCells = (solution, start, direction) => {
  const cells = [];
  const stepRow = direction === "down" ? 1 : 0;
  const stepCol = direction === "across" ? 1 : 0;
  let row = start.row;
  let col = start.col;

  while (inBounds(solution, row, col) && !isBlocked(solution, row, col)) {
    cells.push({ row, col });
    row += stepRow;
    col += stepCol;
  }

  return cells;
};

const clueBody = (copy, direction, meta) => {
  const hintFactory = direction === "across" ? copy?.acrossHint : copy?.downHint;
  if (typeof hintFactory === "function") {
    const custom = hintFactory(meta);
    if (typeof custom === "string" && custom.trim()) {
      return custom;
    }
  }
  return meta.clue;
};

const buildWordEntries = ({
  solution,
  cellNumbers,
  layout,
  acrossTerms,
  downTerms,
  copy,
  shiftedId,
  locale
}) => {
  const acrossEntries = layout.acrossRows.map((row, index) => {
    const start = { row, col: 0 };
    const id = cellNumbers[keyForCell(start.row, start.col)] ?? index + 1;
    const globalWordId = shiftedId * WORDS_PER_MATCH_SPACE + index;
    const term = acrossTerms[index];
    const body = clueBody(copy, "across", {
      wordId: globalWordId,
      locale,
      direction: "across",
      word: term.word,
      clue: term.clue
    });

    return {
      key: `across-${id}-${index}`,
      id,
      start,
      cells: collectWordCells(solution, start, "across"),
      word: term.word,
      text: copy.acrossClue(id, body, start)
    };
  });

  const downEntries = layout.downCols.map((col, index) => {
    const start = { row: 0, col };
    const id = cellNumbers[keyForCell(start.row, start.col)] ?? index + 1;
    const globalWordId = shiftedId * WORDS_PER_MATCH_SPACE + 4 + index;
    const term = downTerms[index];
    const body = clueBody(copy, "down", {
      wordId: globalWordId,
      locale,
      direction: "down",
      word: term.word,
      clue: term.clue
    });

    return {
      key: `down-${id}-${index}`,
      id,
      start,
      cells: collectWordCells(solution, start, "down"),
      word: term.word,
      text: copy.downClue(id, body, start)
    };
  });

  return { across: acrossEntries, down: downEntries };
};

const resolveCopy = (copy = {}) => ({
  acrossClue: typeof copy.acrossClue === "function"
    ? copy.acrossClue
    : (id, text) => `${id}. ${text}`,
  downClue: typeof copy.downClue === "function"
    ? copy.downClue
    : (id, text) => `${id}. ${text}`,
  acrossHint: copy.acrossHint,
  downHint: copy.downHint
});

export const createCrosswordMatch = (matchId, locale, copy) => {
  const safeCopy = resolveCopy(copy);
  const { layout, layoutRank, shiftedId } = resolveLayoutPlan(matchId, locale);
  const { acrossTerms, downTerms } = pickWordSetForLayout({
    layout,
    layoutRank,
    shiftedId,
    locale
  });

  const solution = buildSolution(layout, acrossTerms, downTerms);
  const cellNumbers = buildCellNumbers(solution);
  const clues = buildWordEntries({
    solution,
    cellNumbers,
    layout,
    acrossTerms,
    downTerms,
    copy: safeCopy,
    shiftedId,
    locale: resolveLocaleKey(locale)
  });

  return {
    solution,
    cellNumbers,
    clues,
    grid: {
      rows: solution.length,
      cols: solution[0]?.length ?? 0,
      openCells: countPlayableCells(solution)
    },
    puzzleKey: `${layout.key}-${shiftedId}`
  };
};

export const createEntries = (solution) =>
  solution.map((row) => row.map((cell) => (cell === "#" ? "#" : "")));

export const findFirstCell = (solution) => {
  for (let row = 0; row < solution.length; row += 1) {
    for (let col = 0; col < solution[row].length; col += 1) {
      if (solution[row][col] !== "#") {
        return { row, col };
      }
    }
  }
  return { row: 0, col: 0 };
};

export const moveSelection = (solution, selected, deltaRow, deltaCol) => {
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

export const nextCellInRow = (solution, selected, direction) => {
  let col = selected.col + direction;
  while (inBounds(solution, selected.row, col)) {
    if (!isBlocked(solution, selected.row, col)) {
      return { row: selected.row, col };
    }
    col += direction;
  }
  return selected;
};

export const isComplete = (entries) => {
  for (let row = 0; row < entries.length; row += 1) {
    for (let col = 0; col < entries[row].length; col += 1) {
      if (entries[row][col] === "#") continue;
      if (!entries[row][col]) return false;
    }
  }
  return true;
};

export const isSolved = (entries, solution) => {
  for (let row = 0; row < entries.length; row += 1) {
    for (let col = 0; col < entries[row].length; col += 1) {
      if (entries[row][col] === "#") continue;
      if (entries[row][col] !== solution[row][col]) return false;
    }
  }
  return true;
};

export const buildWordMaps = (clues) => {
  const wordByKey = {};
  const cellWordMap = {};
  ["across", "down"].forEach((direction) => {
    (clues[direction] || []).forEach((word) => {
      wordByKey[word.key] = word;
      word.cells.forEach((cell) => {
        const key = keyForCell(cell.row, cell.col);
        if (!cellWordMap[key]) {
          cellWordMap[key] = [];
        }
        cellWordMap[key].push(word.key);
      });
    });
  });
  return { wordByKey, cellWordMap };
};

export const getWordKeysForCell = (cellWordMap, row, col) =>
  cellWordMap[keyForCell(row, col)] || [];

const evaluateWordStatus = (entries, solution, cells) => {
  let hasEmpty = false;
  let hasWrong = false;

  cells.forEach((cell) => {
    const value = entries[cell.row][cell.col];
    if (!value) {
      hasEmpty = true;
      return;
    }
    if (value !== solution[cell.row][cell.col]) {
      hasWrong = true;
    }
  });

  if (hasEmpty) return "pending";
  return hasWrong ? "wrong" : "correct";
};

export const evaluateWordFeedback = ({ entries, solution, wordByKey, targetWordKeys }) => {
  const uniqueKeys = Array.from(new Set(targetWordKeys || []));
  const wordFeedback = {};
  const cellFeedback = {};
  const summary = { correct: 0, wrong: 0, pending: 0 };

  uniqueKeys.forEach((wordKey) => {
    const word = wordByKey[wordKey];
    if (!word) return;

    const status = evaluateWordStatus(entries, solution, word.cells);
    wordFeedback[wordKey] = status;
    summary[status] += 1;

    if (status === "pending") return;
    word.cells.forEach((cell) => {
      const key = keyForCell(cell.row, cell.col);
      const current = cellFeedback[key];
      if (!current || FEEDBACK_PRIORITY[status] > FEEDBACK_PRIORITY[current]) {
        cellFeedback[key] = status;
      }
    });
  });

  return { wordFeedback, cellFeedback, summary };
};
