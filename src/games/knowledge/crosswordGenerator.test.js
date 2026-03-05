import { describe, expect, it } from "vitest";
import {
  CROSSWORD_LEXICON_META,
  CROSSWORD_MATCH_COUNT,
  CROSSWORD_MAX_WORD_OPTIONS,
  buildWordMaps,
  createCrosswordMatch,
  createEntries,
  evaluateWordFeedback,
  keyForCell
} from "./crosswordGenerator";

const makeCopy = () => ({
  acrossHint: ({ clue }) => clue,
  downHint: ({ clue }) => clue,
  acrossClue: (_id, text) => text,
  downClue: (_id, text) => text
});

const normalizeAscii = (value) => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/\s+/g, " ")
  .trim()
  .toLowerCase();

const getIncompletePhraseContinuation = (text) => {
  const clue = normalizeAscii(text).replace(/[.!?]+$/g, "");
  const prefixes = [
    "se dice de algo que ",
    "persona que ",
    "objeto usado para "
  ];

  for (let index = 0; index < prefixes.length; index += 1) {
    if (clue.startsWith(prefixes[index])) {
      return clue.slice(prefixes[index].length).trim();
    }
  }

  return "";
};

const getEnglishIncompletePhraseContinuation = (text) => {
  const clue = normalizeAscii(text).replace(/[.!?]+$/g, "");
  const prefixes = [
    "it is said of something that ",
    "person who ",
    "object used to "
  ];

  for (let index = 0; index < prefixes.length; index += 1) {
    if (clue.startsWith(prefixes[index])) {
      return clue.slice(prefixes[index].length).trim();
    }
  }

  return "";
};

describe("crosswordGenerator", () => {
  it("mantiene catalogo amplio y rango de partidas superior a 10k", () => {
    expect(CROSSWORD_MATCH_COUNT).toBeGreaterThan(10000);
    expect(CROSSWORD_LEXICON_META.counts.es.total).toBeGreaterThan(10000);
    expect(CROSSWORD_LEXICON_META.counts.en.total).toBeGreaterThan(10000);
    expect(CROSSWORD_LEXICON_META.counts.es[10]).toBeGreaterThan(15);
    expect(CROSSWORD_LEXICON_META.counts.en[10]).toBeGreaterThan(10);
  });

  it("genera tableros validos con longitud maxima configurable y pistas no reveladoras", () => {
    const locales = ["es", "en"];
    const sampleMatchIds = [0, 1, 2, 17, 91, 512, 2049, CROSSWORD_MATCH_COUNT - 1];

    locales.forEach((locale) => {
      CROSSWORD_MAX_WORD_OPTIONS.forEach((maxWordLength) => {
        const seenPuzzleKeys = new Set();

        sampleMatchIds.forEach((matchId) => {
          const match = createCrosswordMatch(matchId, locale, makeCopy(), { maxWordLength });
          seenPuzzleKeys.add(match.puzzleKey);

          expect(match.grid.rows).toBe(maxWordLength);
          expect(match.grid.cols).toBe(maxWordLength);
          expect(match.grid.maxWordLength).toBe(maxWordLength);
          expect(match.clues.down).toHaveLength(1);
          expect(match.clues.across.length).toBeGreaterThanOrEqual(3);
          expect(match.clues.down[0].word.length).toBe(maxWordLength);

          const { cellWordMap } = buildWordMaps(match.clues);
          for (let row = 0; row < match.solution.length; row += 1) {
            for (let col = 0; col < match.solution[row].length; col += 1) {
              if (match.solution[row][col] === "#") continue;
              const cellKey = keyForCell(row, col);
              expect((cellWordMap[cellKey] || []).length).toBeGreaterThan(0);
            }
          }

          [...match.clues.across, ...match.clues.down].forEach((entry) => {
            expect(entry.word).toMatch(/^[A-Z]{5,10}$/);
            expect(entry.word.length).toBeLessThanOrEqual(maxWordLength);
            expect(entry.text.length).toBeGreaterThan(12);
            expect(normalizeAscii(entry.text)).not.toContain(normalizeAscii(entry.word));
          });
        });

        expect(seenPuzzleKeys.size).toBe(sampleMatchIds.length);
      });
    });
  });

  it("clasifica una palabra como pendiente, incorrecta y correcta", () => {
    const match = createCrosswordMatch(42, "es", makeCopy(), { maxWordLength: 8 });
    const entries = createEntries(match.solution);
    const firstAcross = match.clues.across[0];
    const { wordByKey } = buildWordMaps(match.clues);

    const pendingFeedback = evaluateWordFeedback({
      entries,
      solution: match.solution,
      wordByKey,
      targetWordKeys: [firstAcross.key]
    });
    expect(pendingFeedback.summary.pending).toBe(1);
    expect(Object.keys(pendingFeedback.cellFeedback)).toHaveLength(0);

    firstAcross.cells.forEach((cell, index) => {
      entries[cell.row][cell.col] = match.solution[cell.row][cell.col];
      if (index === 0) {
        entries[cell.row][cell.col] = match.solution[cell.row][cell.col] === "A" ? "B" : "A";
      }
    });

    const wrongFeedback = evaluateWordFeedback({
      entries,
      solution: match.solution,
      wordByKey,
      targetWordKeys: [firstAcross.key]
    });
    expect(wrongFeedback.summary.wrong).toBe(1);
    expect(
      wrongFeedback.cellFeedback[keyForCell(firstAcross.cells[0].row, firstAcross.cells[0].col)]
    ).toBe("wrong");

    firstAcross.cells.forEach((cell) => {
      entries[cell.row][cell.col] = match.solution[cell.row][cell.col];
    });

    const correctFeedback = evaluateWordFeedback({
      entries,
      solution: match.solution,
      wordByKey,
      targetWordKeys: [firstAcross.key]
    });
    expect(correctFeedback.summary.correct).toBe(1);
    firstAcross.cells.forEach((cell) => {
      expect(correctFeedback.cellFeedback[keyForCell(cell.row, cell.col)]).toBe("correct");
    });
  });

  it("personaliza cada pista de estilo incomplete_phrase con plantillas fijas", () => {
    let checked = 0;
    const maxWordLength = 10;

    for (let matchId = 0; matchId < 320 && checked < 50; matchId += 1) {
      const match = createCrosswordMatch(matchId, "es", makeCopy(), { maxWordLength });
      const clues = [...match.clues.across, ...match.clues.down];
      const incomplete = clues.filter((entry) => entry.style === "incomplete_phrase");

      incomplete.forEach((entry) => {
        const normalized = normalizeAscii(entry.text);
        const matchesTemplate = normalized.startsWith("se dice de algo que ")
          || normalized.startsWith("persona que ")
          || normalized.startsWith("objeto usado para ");
        expect(matchesTemplate).toBe(true);

        const continuation = getIncompletePhraseContinuation(entry.text);
        expect(continuation).not.toBe("");
        expect(continuation.split(" ").length).toBeGreaterThanOrEqual(4);

        checked += 1;
      });
    }

    expect(checked).toBeGreaterThan(0);
  });

  it("personaliza cada pista de estilo incomplete_phrase en ingles con plantillas fijas", () => {
    let checked = 0;
    const maxWordLength = 10;

    for (let matchId = 0; matchId < 320 && checked < 50; matchId += 1) {
      const match = createCrosswordMatch(matchId, "en", makeCopy(), { maxWordLength });
      const clues = [...match.clues.across, ...match.clues.down];
      const incomplete = clues.filter((entry) => entry.style === "incomplete_phrase");

      incomplete.forEach((entry) => {
        const normalized = normalizeAscii(entry.text);
        const matchesTemplate = normalized.startsWith("it is said of something that ")
          || normalized.startsWith("person who ")
          || normalized.startsWith("object used to ");
        expect(matchesTemplate).toBe(true);

        const continuation = getEnglishIncompletePhraseContinuation(entry.text);
        expect(continuation).not.toBe("");
        expect(continuation.split(" ").length).toBeGreaterThanOrEqual(4);

        checked += 1;
      });
    }

    expect(checked).toBeGreaterThan(0);
  });
});
