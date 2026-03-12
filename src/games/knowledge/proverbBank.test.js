import { describe, expect, it } from "vitest";
import {
  PROVERB_BANK_META,
  createProverbRounds,
  getProverbBank,
  isCorrectProverbGuess,
  normalizeProverbGuess,
} from "./proverbBank";

describe("proverbBank", () => {
  it("expone 500 refranes por idioma sin duplicados normalizados", () => {
    expect(PROVERB_BANK_META.counts.es).toBe(500);
    expect(PROVERB_BANK_META.counts.en).toBe(500);

    ["es", "en"].forEach((locale) => {
      const bank = getProverbBank(locale);
      expect(bank).toHaveLength(500);

      const normalized = new Set();
      bank.forEach((entry) => {
        expect(typeof entry.proverb).toBe("string");
        expect(typeof entry.prompt).toBe("string");
        expect(typeof entry.answer).toBe("string");
        expect(entry.prompt.length).toBeGreaterThan(1);
        expect(entry.answer.length).toBeGreaterThan(1);
        expect(entry.proverb.includes(entry.prompt)).toBe(true);
        expect(entry.normalizedPrompt.length).toBeGreaterThan(1);
        expect(entry.normalizedAnswer.length).toBeGreaterThan(1);
        expect(entry.normalizedProverb.length).toBeGreaterThan(3);

        expect(normalized.has(entry.normalizedProverb)).toBe(false);
        normalized.add(entry.normalizedProverb);
      });
    });
  });

  it("construye sesiones deterministas de 5 rondas por semilla", () => {
    const roundsA = createProverbRounds("es", 42, 5);
    const roundsB = createProverbRounds("es", 42, 5);
    const roundsC = createProverbRounds("es", 43, 5);

    expect(roundsA).toHaveLength(5);
    expect(roundsA.map((entry) => entry.proverb)).toEqual(
      roundsB.map((entry) => entry.proverb)
    );
    expect(roundsA.map((entry) => entry.proverb)).not.toEqual(
      roundsC.map((entry) => entry.proverb)
    );
  });

  it("normaliza y acepta tanto la continuacion como el refran completo", () => {
    const entry = {
      proverb: "Aunque la mona se vista de seda, mona se queda",
      prompt: "Aunque la mona se vista de seda,",
      answer: "mona se queda",
      normalizedProverb: "aunque la mona se vista de seda mona se queda",
      normalizedPrompt: "aunque la mona se vista de seda",
      normalizedAnswer: "mona se queda",
    };

    expect(normalizeProverbGuess("Mona se queda")).toBe("mona se queda");
    expect(isCorrectProverbGuess(entry, "mona se queda")).toBe(true);
    expect(
      isCorrectProverbGuess(entry, "Aunque la mona se vista de seda, mona se queda")
    ).toBe(true);
    expect(isCorrectProverbGuess(entry, "mona era y mona sera")).toBe(false);
  });
});
