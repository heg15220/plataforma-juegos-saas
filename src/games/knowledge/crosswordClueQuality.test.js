import { describe, expect, it } from "vitest";
import { evaluateClueQuality, pickBestScoredClue } from "./crosswordClueQuality";

describe("crosswordClueQuality", () => {
  it("rechaza pistas que contienen la respuesta exacta", () => {
    const evaluation = evaluateClueQuality({
      clue: "Secuencia de ALGORITMO en informatica.",
      answer: "ALGORITMO",
      locale: "es",
      difficulty: "medium"
    });

    expect(evaluation.hardFailReasons).toContain("contains_answer");
  });

  it("rechaza pistas con derivaciones demasiado transparentes", () => {
    const evaluation = evaluateClueQuality({
      clue: "Proceso nutricional basico del cuerpo.",
      answer: "NUTRICION",
      locale: "es",
      difficulty: "medium"
    });

    expect(
      evaluation.hardFailReasons.some((reason) => reason.startsWith("contains_derivative_fragment:"))
    ).toBe(true);
  });

  it("rechaza patrones roboticos genericos", () => {
    const evaluation = evaluateClueQuality({
      clue: "Termino relacionado con energia.",
      answer: "ATOMO",
      locale: "es",
      difficulty: "easy"
    });

    expect(evaluation.hardFailReasons).toContain("generic_pattern");
  });

  it("prioriza una pista natural frente a una plantilla debil", () => {
    const selected = pickBestScoredClue({
      candidates: [
        "Termino relacionado con justicia.",
        "Principio de trato justo ante la ley."
      ],
      answer: "JUSTICIA",
      locale: "es",
      difficulty: "easy"
    });

    expect(selected.selected?.clue).toBe("Principio de trato justo ante la ley.");
    expect(selected.selected?.quality?.hardFailReasons || []).toHaveLength(0);
    expect(selected.selected?.quality?.score || 0).toBeGreaterThanOrEqual(75);
  });
});

