import resolveBrowserLanguage from "../../utils/resolveBrowserLanguage";
import { PROVERB_BANK, PROVERB_BANK_META } from "./proverbBank.generated";

export function resolveProverbLocale() {
  return resolveBrowserLanguage() === "es" ? "es" : "en";
}

export function normalizeProverbGuess(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9'\- ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getProverbBank(locale = "en") {
  return PROVERB_BANK[locale] ?? PROVERB_BANK.en;
}

export function getRandomProverbSessionId() {
  return Math.floor(Math.random() * 1_000_000_000);
}

function createSeededRandom(seed) {
  let state = (Number(seed) >>> 0) || 1;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function shuffleWithRandom(items, random) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

export function createProverbRounds(locale, sessionId, roundCount = 5) {
  const bank = getProverbBank(locale);
  const random = createSeededRandom((Number(sessionId) || 0) + 1);
  return shuffleWithRandom(bank, random).slice(0, Math.min(roundCount, bank.length));
}

export function isCorrectProverbGuess(entry, guess) {
  if (!entry) return false;
  const normalizedGuess = normalizeProverbGuess(guess);
  if (!normalizedGuess) return false;

  if (
    normalizedGuess === entry.normalizedAnswer ||
    normalizedGuess === entry.normalizedProverb
  ) {
    return true;
  }

  if (normalizedGuess.startsWith(entry.normalizedPrompt)) {
    const remainder = normalizedGuess
      .slice(entry.normalizedPrompt.length)
      .replace(/\s+/g, " ")
      .trim();
    return remainder === entry.normalizedAnswer;
  }

  return false;
}

export { PROVERB_BANK_META };
