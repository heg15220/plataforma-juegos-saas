import fs from "node:fs";
import path from "node:path";
import { enrichNormalizedLexiconEntry } from "../src/games/knowledge/crossword/crosswordLexiconEnricher.js";
import {
  createSyntheticNormalizedEntry,
  normalizeCrosswordAscii
} from "../src/games/knowledge/crossword/crosswordLexiconNormalizer.js";
import {
  createClueDiversityContext,
  generateClueForEntry
} from "../src/games/knowledge/crossword/crosswordClueRegenerator.js";
import { evaluateClueQuality } from "../src/games/knowledge/crossword/crosswordClueQualityValidator.js";

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
  es: { 5: 1700, 6: 2600, 7: 3400, 8: 2300 },
  en: { 5: 2500, 6: 2500, 7: 2500, 8: 2500 }
};

const QUALITY_ACCEPTANCE_SCORE = 72;
const MAX_WORD_LENGTH = 8;
const MIN_WORD_LENGTH = 5;
const DEFAULT_FIELD_ROTATION = ["science", "language", "culture", "society", "technology", "education"];
const FIELD_KEYWORDS = {
  science: ["atom", "bio", "quim", "fis", "astro", "lab", "science", "cell", "math"],
  language: ["palabra", "verbo", "letra", "idioma", "gramat", "word", "verb", "syntax", "lexic"],
  culture: ["arte", "teatro", "liter", "poesia", "muse", "art", "novel", "stage", "music"],
  society: ["ley", "polit", "estado", "voto", "social", "law", "policy", "public", "civic"],
  technology: ["algor", "digital", "sistema", "motor", "code", "device", "network", "system", "tech"],
  education: ["escuela", "aula", "profesor", "estudio", "class", "lesson", "textbook", "learning", "exam"]
};

const cleanToken = (value) => String(value || "")
  .replace(/\([^)]*\)/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const normalizeWord = (value) => normalizeCrosswordAscii(value)
  .replace(/[^A-Za-z]/g, "")
  .toUpperCase();

const normalizeSynonym = (value) =>
  normalizeCrosswordAscii(cleanToken(value)).toLowerCase();

const hashText = (text) => {
  const source = String(text || "");
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const pickTemplate = (templates, seedKey) =>
  templates[hashText(seedKey) % templates.length];

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

const isTooSimilarForAnchor = (word, candidate) => {
  if (!candidate) return true;
  if (candidate === word) return true;
  if (candidate.includes(word) || word.includes(candidate)) return true;

  const minLength = Math.min(word.length, candidate.length);
  const edgeOverlap = Math.max(
    longestSharedPrefix(word, candidate),
    longestSharedSuffix(word, candidate)
  );
  return edgeOverlap >= Math.max(4, Math.floor(minLength * 0.7));
};

const inferPosFromWordShape = (word, locale) => {
  const safeWord = String(word || "").toLowerCase();
  if (!safeWord) return "generic";

  if (locale === "es") {
    if (/(ar|er|ir)$/.test(safeWord)) return "verb";
    if (/mente$/.test(safeWord)) return "adverb";
    if (/(oso|osa|able|ible|ivo|iva|ico|ica|al)$/.test(safeWord)) return "adjective";
    return "noun";
  }

  if (/(ate|ify|ise|ize|ing|ed)$/.test(safeWord)) return "verb";
  if (/ly$/.test(safeWord)) return "adverb";
  if (/(ous|ive|able|ible|al|ic|ary|ful|less)$/.test(safeWord)) return "adjective";
  return "noun";
};

const inferSemanticField = ({ locale, word, anchor, definition }) => {
  const joined = normalizeCrosswordAscii(
    `${anchor || ""} ${definition || ""}`
  ).toLowerCase();

  for (let index = 0; index < DEFAULT_FIELD_ROTATION.length; index += 1) {
    const field = DEFAULT_FIELD_ROTATION[index];
    const keywords = FIELD_KEYWORDS[field] || [];
    if (keywords.some((keyword) => joined.includes(keyword))) {
      return field;
    }
  }

  const seed = `${locale}:${word}:${anchor || ""}:${definition || ""}`;
  const fallbackIndex = hashText(seed) % DEFAULT_FIELD_ROTATION.length;
  return DEFAULT_FIELD_ROTATION[fallbackIndex];
};

const buildCustomCollocations = ({ locale, word, anchor, field }) => {
  const safeAnchor = normalizeCrosswordAscii(anchor || "").toLowerCase();
  const first = word[0];
  const last = word[word.length - 1];

  if (safeAnchor) {
    if (locale === "es") {
      return [
        `uso de ${safeAnchor}`,
        `${safeAnchor} en contexto`,
        `clave de ${safeAnchor}`
      ];
    }
    return [
      `${safeAnchor} usage`,
      `${safeAnchor} in context`,
      `key ${safeAnchor} clue`
    ];
  }

  if (locale === "es") {
    return [
      `${field} con inicial ${first}`,
      `${field} con final ${last}`,
      `contexto ${field}`
    ];
  }

  return [
    `${field} with initial ${first}`,
    `${field} with final ${last}`,
    `${field} context`
  ];
};

const buildSeedDefinition = ({ locale, posType, anchor, word }) => {
  const safeAnchor = normalizeCrosswordAscii(anchor || "").toLowerCase();
  if (safeAnchor) {
    if (locale === "es") {
      if (posType === "verb") return `accion ligada a ${safeAnchor}`;
      if (posType === "adjective") return `cualidad asociada a ${safeAnchor}`;
      if (posType === "adverb") return `modo relacionado con ${safeAnchor}`;
      if (posType === "noun") return `idea conectada con ${safeAnchor}`;
      return `nocion vinculada a ${safeAnchor}`;
    }

    if (posType === "verb") return `action linked to ${safeAnchor}`;
    if (posType === "adjective") return `quality associated with ${safeAnchor}`;
    if (posType === "adverb") return `manner connected to ${safeAnchor}`;
    if (posType === "noun") return `idea related to ${safeAnchor}`;
    return `notion tied to ${safeAnchor}`;
  }

  const first = String(word || "")[0] || "A";
  const last = String(word || "").slice(-1) || "A";

  if (locale === "es") {
    if (posType === "verb") return `accion de ${word.length} letras que inicia con ${first} y acaba en ${last}`;
    if (posType === "adjective") return `cualidad de ${word.length} letras con inicio ${first} y cierre ${last}`;
    if (posType === "adverb") return `modo de ${word.length} letras que empieza en ${first} y termina en ${last}`;
    return `termino de ${word.length} letras que inicia con ${first} y finaliza con ${last}`;
  }

  if (posType === "verb") return `${word.length}-letter action term starting with ${first} and ending with ${last}`;
  if (posType === "adjective") return `${word.length}-letter quality term starting with ${first} and ending with ${last}`;
  if (posType === "adverb") return `${word.length}-letter manner term starting with ${first} and ending with ${last}`;
  return `${word.length}-letter term starting with ${first} and ending with ${last}`;
};

const buildFallbackClue = ({ locale, word, anchor, posType }) => {
  const safeAnchor = normalizeCrosswordAscii(anchor || "").toLowerCase();
  if (locale === "es") {
    const verbTemplates = [
      `Verbo de ${word.length} letras para una accion ligada a ${safeAnchor || "un contexto cotidiano"}.`,
      `Accion expresada con ${word.length} letras en torno a ${safeAnchor || "una situacion habitual"}.`
    ];
    const adjectiveTemplates = [
      `Cualidad de ${word.length} letras asociada a ${safeAnchor || "un rasgo concreto"}.`,
      `Adjetivo de ${word.length} letras que describe ${safeAnchor || "una propiedad definida"}.`
    ];
    const adverbTemplates = [
      `Adverbio de ${word.length} letras para matizar ${safeAnchor || "una accion concreta"}.`,
      `Modo de ${word.length} letras que acompana ${safeAnchor || "una accion conocida"}.`
    ];
    const nounTemplates = [
      `Termino de ${word.length} letras ligado a ${safeAnchor || `una idea que empieza por ${word[0]} y acaba en ${word[word.length - 1]}`}.`,
      `Nombre de ${word.length} letras usado al hablar de ${safeAnchor || `un concepto con inicial ${word[0]} y final ${word[word.length - 1]}`}.`
    ];
    const genericTemplates = [
      `Entrada de ${word.length} letras conectada con ${safeAnchor || "un contexto estable"}.`,
      `Pista de ${word.length} letras centrada en ${safeAnchor || "una nocion concreta"}.`
    ];

    if (posType === "verb") return pickTemplate(verbTemplates, `${word}:verb:fallback`);
    if (posType === "adjective") return pickTemplate(adjectiveTemplates, `${word}:adjective:fallback`);
    if (posType === "adverb") return pickTemplate(adverbTemplates, `${word}:adverb:fallback`);
    if (posType === "noun") return pickTemplate(nounTemplates, `${word}:noun:fallback`);
    return pickTemplate(genericTemplates, `${word}:generic:fallback`);
  }

  const verbTemplates = [
    `${word.length}-letter verb used for an action linked to ${safeAnchor || "an everyday context"}.`,
    `Action clue in ${word.length} letters around ${safeAnchor || "a familiar situation"}.`
  ];
  const adjectiveTemplates = [
    `${word.length}-letter adjective tied to ${safeAnchor || "a specific trait"}.`,
    `Descriptive clue in ${word.length} letters for ${safeAnchor || "a clear property"}.`
  ];
  const adverbTemplates = [
    `${word.length}-letter adverb that qualifies ${safeAnchor || "a known action"}.`,
    `Manner clue in ${word.length} letters around ${safeAnchor || "an action context"}.`
  ];
  const nounTemplates = [
    `${word.length}-letter term connected to ${safeAnchor || `an idea that starts with ${word[0]} and ends with ${word[word.length - 1]}`}.`,
    `Noun clue in ${word.length} letters when discussing ${safeAnchor || `a notion with initial ${word[0]} and final ${word[word.length - 1]}`}.`
  ];
  const genericTemplates = [
    `${word.length}-letter entry centered on ${safeAnchor || "a stable concept"}.`,
    `Crossword clue with ${word.length} letters tied to ${safeAnchor || "a familiar notion"}.`
  ];

  if (posType === "verb") return pickTemplate(verbTemplates, `${word}:verb:fallback`);
  if (posType === "adjective") return pickTemplate(adjectiveTemplates, `${word}:adjective:fallback`);
  if (posType === "adverb") return pickTemplate(adverbTemplates, `${word}:adverb:fallback`);
  if (posType === "noun") return pickTemplate(nounTemplates, `${word}:noun:fallback`);
  return pickTemplate(genericTemplates, `${word}:generic:fallback`);
};

const parseThesaurusData = (filePath, encoding) => {
  const raw = fs.readFileSync(filePath, encoding);
  const lines = raw.split(/\r?\n/);
  const entries = [];

  let cursor = 1;
  while (cursor < lines.length) {
    const header = lines[cursor]?.trim();
    cursor += 1;
    if (!header || !header.includes("|")) continue;

    const split = header.lastIndexOf("|");
    const headword = header.slice(0, split);
    const senseCount = Number.parseInt(header.slice(split + 1), 10);
    if (!Number.isFinite(senseCount) || senseCount <= 0) continue;

    const senses = [];
    for (let index = 0; index < senseCount && cursor < lines.length; index += 1) {
      const senseLine = lines[cursor];
      cursor += 1;
      if (!senseLine) continue;

      const parts = senseLine
        .split("|")
        .map((part) => part.trim())
        .filter(Boolean);

      if (!parts.length) continue;

      const maybePos = parts[0];
      const hasPos = maybePos === "-" || maybePos.startsWith("(");
      const pos = hasPos ? maybePos : "";
      const terms = parts
        .slice(hasPos ? 1 : 0)
        .map(cleanToken)
        .filter(Boolean);

      senses.push({ pos, terms });
    }

    entries.push({ headword, senses });
  }

  return entries;
};

const buildLocaleWordMap = (entries, locale) => {
  const byWord = new Map();

  entries.forEach((entry) => {
    const normalizedWord = normalizeWord(entry.headword);
    if (normalizedWord.length < MIN_WORD_LENGTH || normalizedWord.length > MAX_WORD_LENGTH) {
      return;
    }

    const existing = byWord.get(normalizedWord);
    if (!existing) {
      byWord.set(normalizedWord, {
        locale,
        word: normalizedWord,
        senses: entry.senses || []
      });
      return;
    }

    if ((entry.senses || []).length > existing.senses.length) {
      byWord.set(normalizedWord, {
        locale,
        word: normalizedWord,
        senses: entry.senses || []
      });
    }
  });

  return byWord;
};

const selectSeedForWord = ({ word, senses, locale }) => {
  for (let senseIndex = 0; senseIndex < senses.length; senseIndex += 1) {
    const sense = senses[senseIndex];
    const posType = classifyPos(sense.pos, locale);
    const synonyms = [];
    const seen = new Set();

    (sense.terms || []).forEach((rawTerm) => {
      const candidate = normalizeSynonym(rawTerm);
      if (!candidate) return;
      const normalizedCandidate = normalizeWord(candidate);
      if (normalizedCandidate.length < 3) return;
      if (isTooSimilarForAnchor(word, normalizedCandidate)) return;
      if (seen.has(normalizedCandidate)) return;
      seen.add(normalizedCandidate);
      synonyms.push(candidate);
    });

    if (synonyms.length) {
      return {
        posType,
        anchor: synonyms[0],
        synonyms: synonyms.slice(0, 6)
      };
    }
  }

  return {
    posType: inferPosFromWordShape(word, locale),
    anchor: "",
    synonyms: []
  };
};

const createSeedLexiconEntry = ({ word, senses, locale, seedPreview }) => {
  const seed = seedPreview || selectSeedForWord({ word, senses, locale });
  const definition = buildSeedDefinition({
    locale,
    posType: seed.posType,
    anchor: seed.anchor,
    word
  });
  const semanticField = inferSemanticField({
    locale,
    word,
    anchor: seed.anchor,
    definition
  });

  const normalized = createSyntheticNormalizedEntry({
    word,
    locale,
    definition,
    synonyms: seed.synonyms,
    source: "libreoffice_thesaurus_seed"
  });

  if (!normalized) return null;

  normalized.pos = seed.posType;
  normalized.anchor = normalizeCrosswordAscii(seed.anchor || normalized.anchor || "");
  normalized.baseDefinition = normalizeCrosswordAscii(definition);
  normalized.synonyms = (seed.synonyms || []).map((item) => normalizeCrosswordAscii(item)).filter(Boolean);
  normalized.rawClue = normalized.baseDefinition;

  const enriched = enrichNormalizedLexiconEntry(normalized, {
    synonyms: seed.synonyms,
    semanticField
  });
  if (!enriched) return null;

  enriched.semantic = {
    ...enriched.semantic,
    field: semanticField
  };
  enriched.lexicalRelations = {
    ...enriched.lexicalRelations,
    collocations: buildCustomCollocations({
      locale,
      word,
      anchor: seed.anchor,
      field: semanticField
    })
  };

  return { seed, enriched };
};

const pickBestCandidate = (left, right) => {
  if (!left) return right;
  if (!right) return left;

  const leftPenalty = left.quality.hardFailReasons.length * 120;
  const rightPenalty = right.quality.hardFailReasons.length * 120;
  const leftRank = left.quality.score - leftPenalty;
  const rightRank = right.quality.score - rightPenalty;

  if (rightRank > leftRank) return right;
  if (rightRank < leftRank) return left;
  return right.quality.score > left.quality.score ? right : left;
};

const buildFallbackCandidate = ({
  locale,
  word,
  seed,
  difficulty,
  extraForbiddenFragments
}) => {
  const clue = buildFallbackClue({
    locale,
    word,
    anchor: seed.anchor,
    posType: seed.posType
  });
  const quality = evaluateClueQuality({
    clue,
    answer: word,
    locale,
    difficulty,
    extraForbiddenFragments
  });
  return {
    clue: quality.clue,
    strategy: "fallback_seeded",
    quality
  };
};

const generatePersonalizedClue = ({
  locale,
  lexiconEntry,
  seed,
  seedKey,
  context
}) => {
  const generated = generateClueForEntry({
    entry: lexiconEntry,
    locale,
    seedKey,
    targetDifficulty: lexiconEntry.difficulty,
    context
  });

  const generatedQuality = generated.quality || evaluateClueQuality({
    clue: generated.clue,
    answer: lexiconEntry.word,
    locale,
    difficulty: generated.difficulty || lexiconEntry.difficulty,
    extraForbiddenFragments: lexiconEntry.traps?.invalidFragments || [],
    strategyId: generated.strategy
  });

  const generatedCandidate = {
    clue: generatedQuality.clue || generated.clue,
    strategy: generated.strategy,
    quality: generatedQuality
  };

  const fallbackCandidate = buildFallbackCandidate({
    locale,
    word: lexiconEntry.word,
    seed,
    difficulty: generated.difficulty || lexiconEntry.difficulty || "medium",
    extraForbiddenFragments: lexiconEntry.traps?.invalidFragments || []
  });

  const best = pickBestCandidate(generatedCandidate, fallbackCandidate);
  if (
    !best.quality.hardFailReasons.length &&
    best.quality.score >= QUALITY_ACCEPTANCE_SCORE
  ) {
    return best;
  }

  return best;
};

const groupAndSelectByLength = (wordMap, locale) => {
  const grouped = {};
  const targets = TARGET_COUNTS_BY_LENGTH[locale];
  Object.keys(targets).forEach((lengthKey) => {
    grouped[lengthKey] = [];
  });

  [...wordMap.values()].forEach((entry) => {
    const len = String(entry.word.length);
    if (grouped[len]) {
      grouped[len].push(entry);
    }
  });

  const scoreSeedPreview = (entry, preview) => {
    let score = 0;
    if (preview.anchor) score += 100;
    score += Math.min(30, (preview.synonyms?.length || 0) * 6);
    if (preview.posType && preview.posType !== "generic") score += 10;
    score += Math.min(18, (entry.senses?.length || 0) * 2);
    return score;
  };

  Object.keys(grouped).forEach((lengthKey) => {
    const decorated = grouped[lengthKey].map((entry) => {
      const seedPreview = selectSeedForWord({
        word: entry.word,
        senses: entry.senses || [],
        locale
      });
      return {
        entry,
        seedPreview,
        rank: scoreSeedPreview(entry, seedPreview)
      };
    });

    decorated.sort((left, right) => {
      if (right.rank !== left.rank) return right.rank - left.rank;
      return left.entry.word.localeCompare(right.entry.word);
    });

    grouped[lengthKey] = decorated.map(({ entry, seedPreview }) => ({
      ...entry,
      seedPreview
    }));
  });

  const selected = {};
  Object.keys(targets).forEach((lengthKey) => {
    const targetCount = targets[lengthKey];
    const options = grouped[lengthKey] || [];
    if (options.length < targetCount) {
      throw new Error(
        `Not enough ${locale} words of length ${lengthKey}. Required ${targetCount}, got ${options.length}.`
      );
    }
    selected[lengthKey] = options.slice(0, targetCount);
  });

  return selected;
};

const generateLocaleTermBank = ({ locale, selectedByLength }) => {
  const lengths = Object.keys(selectedByLength).sort((a, b) => Number(a) - Number(b));
  const context = createClueDiversityContext();
  const total = lengths.reduce((sum, lengthKey) => sum + selectedByLength[lengthKey].length, 0);
  let processed = 0;

  const terms = {};
  const stats = {
    total,
    lowQuality: 0,
    hardFails: 0,
    averageScore: 0
  };
  let scoreSum = 0;

  lengths.forEach((lengthKey) => {
    terms[lengthKey] = [];
    selectedByLength[lengthKey].forEach((sourceEntry) => {
      const built = createSeedLexiconEntry(sourceEntry);
      if (!built?.enriched) {
        const fallbackPos = inferPosFromWordShape(sourceEntry.word, locale);
        const fallback = buildFallbackCandidate({
          locale,
          word: sourceEntry.word,
          seed: {
            anchor: "",
            posType: fallbackPos
          },
          difficulty: "medium",
          extraForbiddenFragments: []
        });
        terms[lengthKey].push({
          word: sourceEntry.word,
          clue: fallback.clue
        });
        processed += 1;
        scoreSum += fallback.quality.score;
        if (fallback.quality.score < QUALITY_ACCEPTANCE_SCORE) {
          stats.lowQuality += 1;
        }
        if (fallback.quality.hardFailReasons.length) {
          stats.hardFails += 1;
        }
        return;
      }

      const generated = generatePersonalizedClue({
        locale,
        lexiconEntry: built.enriched,
        seed: built.seed,
        seedKey: `${locale}:${sourceEntry.word}:seed`,
        context
      });

      terms[lengthKey].push({
        word: sourceEntry.word,
        clue: generated.clue
      });

      processed += 1;
      scoreSum += generated.quality.score;
      if (generated.quality.score < QUALITY_ACCEPTANCE_SCORE) {
        stats.lowQuality += 1;
      }
      if (generated.quality.hardFailReasons.length) {
        stats.hardFails += 1;
      }

      if (processed % 500 === 0 || processed === total) {
        console.log(`[${locale}] generated clues ${processed}/${total}`);
      }
    });
  });

  stats.averageScore = total ? Number((scoreSum / total).toFixed(2)) : 0;
  return { terms, stats };
};

const buildCounts = (termsByLocale) => {
  const counts = {};
  Object.entries(termsByLocale).forEach(([locale, buckets]) => {
    const localeCounts = {};
    let total = 0;
    Object.keys(buckets)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((lengthKey) => {
        const count = (buckets[lengthKey] || []).length;
        localeCounts[lengthKey] = count;
        total += count;
      });
    localeCounts.total = total;
    counts[locale] = localeCounts;
  });
  return counts;
};

const build = () => {
  [ES_THESAURUS_DAT, EN_THESAURUS_DAT].forEach((filePath) => {
    if (!fs.existsSync(filePath)) {
      throw new Error(
        `Dictionary source not found: ${filePath}. Set LIBREOFFICE_EXTENSIONS_DIR if needed.`
      );
    }
  });

  const esEntries = parseThesaurusData(ES_THESAURUS_DAT, "latin1");
  const enEntries = parseThesaurusData(EN_THESAURUS_DAT, "utf8");

  const esWordMap = buildLocaleWordMap(esEntries, "es");
  const enWordMap = buildLocaleWordMap(enEntries, "en");

  const selectedEs = groupAndSelectByLength(esWordMap, "es");
  const selectedEn = groupAndSelectByLength(enWordMap, "en");

  const generatedEs = generateLocaleTermBank({
    locale: "es",
    selectedByLength: selectedEs
  });
  const generatedEn = generateLocaleTermBank({
    locale: "en",
    selectedByLength: selectedEn
  });

  const terms = {
    es: generatedEs.terms,
    en: generatedEn.terms
  };
  const counts = buildCounts(terms);
  const generatedAt = new Date().toISOString();

  const output = `/* eslint-disable */\n` +
    `// Auto-generated by scripts/build_crossword_term_bank.mjs\n` +
    `export const CROSSWORD_TERM_BANK = ${JSON.stringify(terms, null, 2)};\n\n` +
    `export const CROSSWORD_TERM_BANK_META = ${JSON.stringify(
      {
        generatedAt,
        source: {
          script: "scripts/build_crossword_term_bank.mjs",
          model: "crossword-clue-rebuild-v3",
          libreOfficeExtensionsDir: LIBREOFFICE_DIR,
          files: {
            esThesaurus: ES_THESAURUS_DAT,
            enThesaurus: EN_THESAURUS_DAT
          }
        },
        counts,
        quality: {
          acceptanceScore: QUALITY_ACCEPTANCE_SCORE,
          es: generatedEs.stats,
          en: generatedEn.stats
        }
      },
      null,
      2
    )};\n`;

  fs.writeFileSync(OUTPUT_FILE, output, "utf8");

  console.log(`Generated ${OUTPUT_FILE}`);
  console.log("counts", counts);
  console.log("quality", {
    es: generatedEs.stats,
    en: generatedEn.stats
  });
};

build();
