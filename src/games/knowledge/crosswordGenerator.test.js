import { describe, expect, it } from "vitest";
import { KNOWLEDGE_ARCADE_MATCH_COUNT } from "./knowledgeArcadeUtils";
import {
  buildWordMaps,
  createCrosswordMatch,
  createEntries,
  evaluateWordFeedback,
  keyForCell
} from "./crosswordGenerator";
import { CROSSWORD_TERM_BANK, CROSSWORD_TERM_BANK_META } from "./crosswordTermBank";

const makeCopy = () => ({
  acrossHint: ({ clue }) => clue,
  downHint: ({ clue }) => clue,
  acrossClue: (_id, text) => text,
  downClue: (_id, text) => text
});

const makeClueMap = (locale) => {
  const byLocale = CROSSWORD_TERM_BANK[locale];
  const clueMap = new Map();
  ["5", "6", "7", "8"].forEach((sizeKey) => {
    (byLocale[sizeKey] || []).forEach((entry) => {
      clueMap.set(entry.word, entry.clue);
    });
  });
  return clueMap;
};

describe("crosswordGenerator", () => {
  it("usa bancos de terminos >10k en espanol e ingles", () => {
    expect(CROSSWORD_TERM_BANK_META.counts.es.total).toBeGreaterThan(10000);
    expect(CROSSWORD_TERM_BANK_META.counts.en.total).toBeGreaterThan(10000);
    expect(CROSSWORD_TERM_BANK_META.counts.es[5]).toBeGreaterThan(1500);
    expect(CROSSWORD_TERM_BANK_META.counts.es[8]).toBeGreaterThan(2500);
    expect(CROSSWORD_TERM_BANK_META.counts.en[7]).toBeGreaterThan(2500);
  });

  it("genera palabras reales con pistas asociadas en las 10.000 partidas por locale", () => {
    const locales = ["es", "en"];

    locales.forEach((locale) => {
      const clueMap = makeClueMap(locale);
      const seenBoards = new Set();

      for (let matchId = 0; matchId < KNOWLEDGE_ARCADE_MATCH_COUNT; matchId += 1) {
        const match = createCrosswordMatch(matchId, locale, makeCopy());
        seenBoards.add(`${match.grid.rows}x${match.grid.cols}`);

        [...match.clues.across, ...match.clues.down].forEach((entry) => {
          expect(entry.word).toMatch(/^[A-Z]{5,8}$/);
          expect(entry.text.toLowerCase()).not.toContain("codigo ");
          expect(entry.text.toLowerCase()).not.toContain("termino horizontal");
          expect(entry.text.toLowerCase()).not.toContain("termino vertical");
          expect(entry.text.length).toBeGreaterThan(10);

          const expectedClue = clueMap.get(entry.word);
          expect(expectedClue, `missing clue locale=${locale} word=${entry.word}`).toBeTruthy();
          expect(entry.text).toBe(expectedClue);
        });
      }

      expect(seenBoards).toEqual(new Set(["5x5", "6x6", "7x7", "8x8"]));
    });
  });

  it("clasifica una palabra concreta como correcta, pendiente o incorrecta", () => {
    const match = createCrosswordMatch(42, "es", makeCopy());
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
});
