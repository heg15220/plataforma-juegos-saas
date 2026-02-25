import fs from "node:fs";
import path from "node:path";

const DEFAULT_LIBREOFFICE_DIR = "C:\\Program Files\\LibreOffice\\share\\extensions";
const LIBREOFFICE_DIR = process.env.LIBREOFFICE_EXTENSIONS_DIR || DEFAULT_LIBREOFFICE_DIR;

const ES_THESAURUS_DAT = path.join(LIBREOFFICE_DIR, "dict-es", "th_es_ANY_v2.dat");
const EN_THESAURUS_DAT = path.join(LIBREOFFICE_DIR, "dict-en", "th_en_US_v2.dat");

const OUTPUT_FILE = path.join(
  process.cwd(),
  "src",
  "games",
  "knowledge",
  "crosswordTermBank.js"
);

const TARGET_COUNTS_BY_LENGTH = {
  es: { 5: 1700, 6: 2600, 7: 3400, 8: 3000 },
  en: { 5: 3000, 6: 3000, 7: 3000, 8: 3000 }
};

const ES_SUFFIX_HINTS = [
  { suffix: "CION", clue: "Sustantivo de accion o efecto terminado en -cion." },
  { suffix: "SION", clue: "Sustantivo de accion o efecto terminado en -sion." },
  { suffix: "MENTE", clue: "Adverbio de modo terminado en -mente." },
  { suffix: "ISTA", clue: "Termino que suele nombrar oficio, rol o tendencia." },
  { suffix: "ISMO", clue: "Termino asociado a doctrina, corriente o sistema." },
  { suffix: "ABLE", clue: "Adjetivo que expresa posibilidad o cualidad." },
  { suffix: "DOR", clue: "Sustantivo o adjetivo de agente en espaniol." },
  { suffix: "DORA", clue: "Sustantivo o adjetivo de agente en espaniol." },
  { suffix: "URA", clue: "Sustantivo abstracto de uso habitual en espaniol." },
  { suffix: "EZA", clue: "Sustantivo abstracto que nombra cualidad." }
];

const EN_SUFFIX_HINTS = [
  { suffix: "TION", clue: "Noun ending in -tion used for an action or process." },
  { suffix: "SION", clue: "Noun ending in -sion used for an action or process." },
  { suffix: "MENT", clue: "Noun ending in -ment." },
  { suffix: "NESS", clue: "Noun ending in -ness that marks a quality." },
  { suffix: "ABLE", clue: "Adjective ending in -able that expresses capability." },
  { suffix: "LESS", clue: "Adjective ending in -less indicating absence." },
  { suffix: "ING", clue: "Form ending in -ing used in English word building." },
  { suffix: "IST", clue: "Term often used for a specialist or adherent." },
  { suffix: "ER", clue: "Word form often used for an agent or performer." }
];

const normalizeWord = (value) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^A-Za-z]/g, "")
  .toUpperCase();

const cleanToken = (value) => value
  .replace(/\([^)]*\)/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const hashText = (text) => {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const classifyPos = (rawPos, locale) => {
  const normalized = String(rawPos || "").toLowerCase();
  if (!normalized) return "generic";

  if (locale === "es") {
    if (normalized.includes("adj")) return "adjective";
    if (normalized.includes("adv")) return "adverb";
    if (
      normalized.includes("tr.") ||
      normalized.includes("intr.") ||
      normalized.includes("prnl.") ||
      /(^|[^a-z])v\./.test(normalized)
    ) {
      return "verb";
    }
    if (
      normalized.includes("m.") ||
      normalized.includes("f.") ||
      normalized.includes("s.")
    ) {
      return "noun";
    }
    return "generic";
  }

  if (normalized.includes("adj")) return "adjective";
  if (normalized.includes("verb")) return "verb";
  if (normalized.includes("adv")) return "adverb";
  if (normalized.includes("noun")) return "noun";
  return "generic";
};

const pickTemplate = (templates, word) => templates[hashText(word) % templates.length];

const longestSharedPrefix = (left, right) => {
  const limit = Math.min(left.length, right.length);
  let size = 0;
  while (size < limit && left[size] === right[size]) {
    size += 1;
  }
  return size;
};

const longestSharedSuffix = (left, right) => {
  const limit = Math.min(left.length, right.length);
  let size = 0;
  while (size < limit && left[left.length - 1 - size] === right[right.length - 1 - size]) {
    size += 1;
  }
  return size;
};

const isTooSimilarForClue = (word, candidate) => {
  if (!candidate) return true;

  if (candidate === word) return true;
  if (candidate.includes(word) || word.includes(candidate)) return true;

  const minLen = Math.min(word.length, candidate.length);
  const commonEdge = Math.max(
    longestSharedPrefix(word, candidate),
    longestSharedSuffix(word, candidate)
  );
  return commonEdge >= Math.max(4, Math.floor(minLen * 0.7));
};

const buildSemanticClue = ({ locale, word, synonym, posType }) => {
  const safeSynonym = synonym || "";
  if (locale === "es") {
    const pools = {
      noun: [
        `Sustantivo relacionado con "${safeSynonym}".`,
        `Termino que funciona como sinonimo de "${safeSynonym}".`,
        `Palabra del campo semantico de "${safeSynonym}".`
      ],
      adjective: [
        `Adjetivo cercano en significado a "${safeSynonym}".`,
        `Adjetivo equivalente a "${safeSynonym}".`,
        `Adjetivo usado como variante de "${safeSynonym}".`
      ],
      verb: [
        `Verbo equivalente a "${safeSynonym}".`,
        `Accion expresada como sinonimo de "${safeSynonym}".`,
        `Verbo de sentido proximo a "${safeSynonym}".`
      ],
      adverb: [
        `Adverbio relacionado con "${safeSynonym}".`,
        `Adverbio usado como variante de "${safeSynonym}".`,
        `Adverbio de significado cercano a "${safeSynonym}".`
      ],
      generic: [
        `Entrada lexical vinculada a "${safeSynonym}".`,
        `Termino asociado a "${safeSynonym}".`,
        `Palabra emparentada semanticamente con "${safeSynonym}".`
      ]
    };

    return pickTemplate(pools[posType] || pools.generic, word);
  }

  const pools = {
    noun: [
      `Noun related to "${safeSynonym}".`,
      `Term used as a synonym of "${safeSynonym}".`,
      `Word in the same semantic field as "${safeSynonym}".`
    ],
    adjective: [
      `Adjective close in meaning to "${safeSynonym}".`,
      `Adjective equivalent to "${safeSynonym}".`,
      `Adjective variant of "${safeSynonym}".`
    ],
    verb: [
      `Verb equivalent to "${safeSynonym}".`,
      `Action term close to "${safeSynonym}".`,
      `Verb used as a synonym of "${safeSynonym}".`
    ],
    adverb: [
      `Adverb related to "${safeSynonym}".`,
      `Adverb variant of "${safeSynonym}".`,
      `Adverb with meaning close to "${safeSynonym}".`
    ],
    generic: [
      `Lexical entry associated with "${safeSynonym}".`,
      `Term linked to "${safeSynonym}".`,
      `Word semantically connected to "${safeSynonym}".`
    ]
  };

  return pickTemplate(pools[posType] || pools.generic, word);
};

const buildFallbackClue = (locale, word) => {
  const suffixHints = locale === "es" ? ES_SUFFIX_HINTS : EN_SUFFIX_HINTS;
  const suffixMatch = suffixHints.find((item) => word.endsWith(item.suffix));
  if (suffixMatch) {
    return suffixMatch.clue;
  }

  const first = word[0];
  const last = word[word.length - 1];
  if (locale === "es") {
    const templates = [
      `Termino de uso general en espanol, de ${word.length} letras.`,
      `Entrada lexical en espanol que empieza por "${first}" y termina por "${last}".`,
      `Palabra del lexico comun en espanol con ${word.length} letras.`
    ];
    return pickTemplate(templates, word);
  }

  const templates = [
    `Common English lexicon entry with ${word.length} letters.`,
    `English lexical entry starting with "${first}" and ending with "${last}".`,
    `General English word with ${word.length} letters.`
  ];
  return pickTemplate(templates, word);
};

const clueMentionsWord = (word, clue) => {
  const normalizedWord = normalizeWord(word);
  const normalizedClue = normalizeWord(clue);
  if (!normalizedWord || !normalizedClue) return false;
  return normalizedClue.includes(normalizedWord);
};

const enforceNonRevealingClue = (locale, word, clue) => {
  if (!clueMentionsWord(word, clue)) return clue;

  const first = word[0];
  const last = word[word.length - 1];
  if (locale === "es") {
    const neutral = [
      `Entrada del lexico comun en espanol de ${word.length} letras.`,
      `Vocablo en espanol que inicia con "${first}" y finaliza con "${last}".`,
      `Elemento del lexico general en espanol con ${word.length} letras.`
    ];
    return pickTemplate(neutral, `${word}-safe-es`);
  }

  const neutral = [
    `Common English lexicon entry with ${word.length} letters.`,
    `English word starting with "${first}" and ending with "${last}".`,
    `General English lexical entry with ${word.length} letters.`
  ];
  return pickTemplate(neutral, `${word}-safe-en`);
};

const parseThesaurusData = (filePath, locale, encoding) => {
  const raw = fs.readFileSync(filePath, encoding);
  const lines = raw.split(/\r?\n/);
  const entries = [];

  let cursor = 1;
  while (cursor < lines.length) {
    const header = lines[cursor]?.trim();
    cursor += 1;
    if (!header || !header.includes("|")) continue;

    const headerSplit = header.lastIndexOf("|");
    const headword = header.slice(0, headerSplit);
    const senseCount = Number.parseInt(header.slice(headerSplit + 1), 10);
    if (!Number.isFinite(senseCount) || senseCount <= 0) continue;

    const senses = [];
    for (let index = 0; index < senseCount && cursor < lines.length; index += 1) {
      const senseLine = lines[cursor];
      cursor += 1;
      if (!senseLine) continue;

      const rawParts = senseLine
        .split("|")
        .map((part) => part.trim())
        .filter(Boolean);

      if (!rawParts.length) continue;

      const maybePos = rawParts[0];
      const hasPos = maybePos === "-" || maybePos.startsWith("(");
      const pos = hasPos ? maybePos : "";
      const terms = rawParts
        .slice(hasPos ? 1 : 0)
        .map(cleanToken)
        .filter(Boolean);

      senses.push({ pos, terms });
    }

    entries.push({ locale, headword, senses });
  }

  return entries;
};

const pickBestSynonym = (normalizedWord, senses) => {
  for (const sense of senses) {
    for (const candidate of sense.terms) {
      const normalizedCandidate = normalizeWord(candidate);
      if (normalizedCandidate.length < 3) continue;
      if (isTooSimilarForClue(normalizedWord, normalizedCandidate)) continue;
      return { synonym: candidate, pos: sense.pos };
    }
  }
  return null;
};

const buildTermsFromThesaurus = (entries, locale) => {
  const terms = new Map();

  entries.forEach((entry) => {
    const normalizedWord = normalizeWord(entry.headword);
    if (normalizedWord.length < 5 || normalizedWord.length > 8) return;
    if (terms.has(normalizedWord)) return;

    const synonymPayload = pickBestSynonym(normalizedWord, entry.senses);
    if (!synonymPayload) {
      const fallback = buildFallbackClue(locale, normalizedWord);
      terms.set(normalizedWord, {
        word: normalizedWord,
        clue: enforceNonRevealingClue(locale, normalizedWord, fallback),
        source: "thesaurus-fallback"
      });
      return;
    }

    const posType = classifyPos(synonymPayload.pos, locale);
    const clue = buildSemanticClue({
      locale,
      word: normalizedWord,
      synonym: synonymPayload.synonym,
      posType
    });

    terms.set(normalizedWord, {
      word: normalizedWord,
      clue: enforceNonRevealingClue(locale, normalizedWord, clue),
      source: "thesaurus"
    });
  });

  return terms;
};

const selectByLength = (termMap, locale) => {
  const grouped = {};
  Object.keys(TARGET_COUNTS_BY_LENGTH[locale]).forEach((lengthKey) => {
    grouped[lengthKey] = [];
  });

  [...termMap.values()].forEach((entry) => {
    const len = entry.word.length;
    if (grouped[len]) {
      grouped[len].push(entry);
    }
  });

  const priorities = { thesaurus: 0, "thesaurus-fallback": 1 };
  Object.keys(grouped).forEach((len) => {
    grouped[len].sort((left, right) => {
      const p = (priorities[left.source] ?? 9) - (priorities[right.source] ?? 9);
      if (p !== 0) return p;
      return left.word.localeCompare(right.word);
    });
  });

  const targets = TARGET_COUNTS_BY_LENGTH[locale];
  const selected = {};
  Object.keys(targets).forEach((len) => {
    const target = targets[len];
    if (grouped[len].length < target) {
      throw new Error(
        `Not enough ${locale} terms of length ${len}. Required ${target}, got ${grouped[len].length}.`
      );
    }
    selected[len] = grouped[len].slice(0, target).map(({ word, clue }) => ({ word, clue }));
  });

  return selected;
};

const build = () => {
  const requiredFiles = [ES_THESAURUS_DAT, EN_THESAURUS_DAT];
  requiredFiles.forEach((filePath) => {
    if (!fs.existsSync(filePath)) {
      throw new Error(
        `Dictionary source not found: ${filePath}. Set LIBREOFFICE_EXTENSIONS_DIR if needed.`
      );
    }
  });

  const esThesaurusEntries = parseThesaurusData(ES_THESAURUS_DAT, "es", "latin1");
  const enThesaurusEntries = parseThesaurusData(EN_THESAURUS_DAT, "en", "utf8");

  const esTerms = buildTermsFromThesaurus(esThesaurusEntries, "es");
  const enTerms = buildTermsFromThesaurus(enThesaurusEntries, "en");

  const selectedEs = selectByLength(esTerms, "es");
  const selectedEn = selectByLength(enTerms, "en");

  const payload = {
    generatedAt: new Date().toISOString(),
    source: {
      libreOfficeExtensionsDir: LIBREOFFICE_DIR,
      files: {
        esThesaurus: ES_THESAURUS_DAT,
        enThesaurus: EN_THESAURUS_DAT
      }
    },
    counts: {
      es: {
        5: selectedEs[5].length,
        6: selectedEs[6].length,
        7: selectedEs[7].length,
        8: selectedEs[8].length,
        total:
          selectedEs[5].length +
          selectedEs[6].length +
          selectedEs[7].length +
          selectedEs[8].length
      },
      en: {
        5: selectedEn[5].length,
        6: selectedEn[6].length,
        7: selectedEn[7].length,
        8: selectedEn[8].length,
        total:
          selectedEn[5].length +
          selectedEn[6].length +
          selectedEn[7].length +
          selectedEn[8].length
      }
    },
    terms: {
      es: selectedEs,
      en: selectedEn
    }
  };

  const output = `/* eslint-disable */\n` +
    `// Auto-generated by scripts/build_crossword_term_bank.mjs\n` +
    `export const CROSSWORD_TERM_BANK = ${JSON.stringify(payload.terms, null, 2)};\n\n` +
    `export const CROSSWORD_TERM_BANK_META = ${JSON.stringify(
      {
        generatedAt: payload.generatedAt,
        source: payload.source,
        counts: payload.counts
      },
      null,
      2
    )};\n`;

  fs.writeFileSync(OUTPUT_FILE, output, "utf8");
  console.log(`Generated ${OUTPUT_FILE}`);
  console.log(payload.counts);
};

build();
