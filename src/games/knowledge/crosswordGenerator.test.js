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

const hasRoboticPattern = (text) => {
  const normalized = normalizeAscii(text);
  return [
    "termino relacionado con",
    "palabra relacionada con",
    "entrada lexical vinculada a",
    "word related to",
    "term related to",
    "entry associated with"
  ].some((pattern) => normalized.includes(pattern));
};

describe("crosswordGenerator", () => {
  it("mantiene catalogo amplio y rango de partidas superior a 10k", () => {
    expect(CROSSWORD_MATCH_COUNT).toBeGreaterThan(10000);
    expect(CROSSWORD_LEXICON_META.counts.es.total).toBeGreaterThan(10000);
    expect(CROSSWORD_LEXICON_META.counts.en.total).toBeGreaterThan(10000);
    expect(CROSSWORD_LEXICON_META.counts.es[10]).toBeGreaterThan(15);
    expect(CROSSWORD_LEXICON_META.counts.en[10]).toBeGreaterThan(10);
  });

  it("genera tableros validos con pistas jugables, no spoiler y no roboticas", () => {
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

          const clues = [...match.clues.across, ...match.clues.down];
          const clueTextSet = new Set(clues.map((entry) => normalizeAscii(entry.text)));
          expect(clueTextSet.size).toBe(clues.length);

          const { cellWordMap } = buildWordMaps(match.clues);
          for (let row = 0; row < match.solution.length; row += 1) {
            for (let col = 0; col < match.solution[row].length; col += 1) {
              if (match.solution[row][col] === "#") continue;
              const cellKey = keyForCell(row, col);
              expect((cellWordMap[cellKey] || []).length).toBeGreaterThan(0);
            }
          }

          clues.forEach((entry) => {
            expect(entry.word).toMatch(/^[A-Z]{5,10}$/);
            expect(entry.word.length).toBeLessThanOrEqual(maxWordLength);
            expect(entry.text.length).toBeGreaterThan(12);
            expect(normalizeAscii(entry.text)).not.toContain(normalizeAscii(entry.word));
            expect(hasRoboticPattern(entry.text)).toBe(false);
            expect(Number.isFinite(entry.qualityScore)).toBe(true);
            expect(entry.qualityScore).toBeGreaterThanOrEqual(40);
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

  it("aplica diversidad real de estrategias y niveles de dificultad", () => {
    const styles = new Set();
    const difficulties = new Set();
    const styleFrequency = {};
    const locales = ["es", "en"];

    locales.forEach((locale) => {
      for (let matchId = 0; matchId < 60; matchId += 1) {
        const match = createCrosswordMatch(matchId, locale, makeCopy(), { maxWordLength: 10 });
        const clues = [...match.clues.across, ...match.clues.down];
        const puzzleStyles = new Set(clues.map((entry) => entry.style));
        expect(puzzleStyles.size).toBeGreaterThanOrEqual(2);

        clues.forEach((entry) => {
          styles.add(entry.style);
          difficulties.add(entry.difficulty);
          styleFrequency[entry.style] = (styleFrequency[entry.style] || 0) + 1;
        });
      }
    });

    expect(styles.size).toBeGreaterThanOrEqual(8);
    expect(difficulties.has("easy")).toBe(true);
    expect(difficulties.has("medium")).toBe(true);
    expect(difficulties.has("hard")).toBe(true);

    const frequencies = Object.values(styleFrequency);
    const total = frequencies.reduce((sum, value) => sum + value, 0);
    const dominant = Math.max(...frequencies);
    expect(dominant / total).toBeLessThan(0.55);
  });
});
