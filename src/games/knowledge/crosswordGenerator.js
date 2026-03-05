import {
  createSeededRandom,
  encodeMatchWord,
  shuffleWithRandom
} from "./knowledgeArcadeUtils";
import { CROSSWORD_TERM_BANK } from "./crosswordTermBank";

export const CROSSWORD_MATCH_COUNT = 12048;
export const CROSSWORD_MAX_WORD_OPTIONS = [6, 7, 8, 9, 10];

const DEFAULT_MAX_WORD_LENGTH = 8;
const MIN_WORD_LENGTH = 5;
const MAX_LAYOUT_ATTEMPTS = 384;
const WORD_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const FEEDBACK_PRIORITY = {
  correct: 1,
  wrong: 2
};

const EXTRA_LONG_WORDS = {
  es: [
    "ASTRONOMIA",
    "MATEMATICA",
    "GEOGRAFIA",
    "LITERATURA",
    "FILOSOFIA",
    "TECTONICA",
    "HIDROGENO",
    "ALGORITMO",
    "PROCESADOR",
    "DEMOGRAFIA",
    "GEOMETRIA",
    "TOPOLOGIA",
    "SILOGISMO",
    "GRAMATICA",
    "SUSTANTIVO",
    "PRONOMBRE",
    "CRONOLOGIA",
    "DEMOCRACIA",
    "REPUBLICA",
    "PARLAMENTO",
    "ESCULTURA",
    "OLIMPIADA",
    "ATLETISMO",
    "FISIOLOGIA",
    "NUTRICION",
    "PSICOLOGIA",
    "SOCIOLOGIA",
    "ARITMETICA",
    "NUMERADOR",
    "PORCENTAJE",
    "CALENDARIO",
    "MERIDIANO",
    "HEMISFERIO",
    "CONTINENTE"
  ],
  en: [
    "ASTRONOMY",
    "CHEMISTRY",
    "GEOGRAPHY",
    "LITERATURE",
    "PHILOSOPHY",
    "ECONOMICS",
    "SATELLITE",
    "TECTONICS",
    "ALGORITHM",
    "PROCESSOR",
    "MECHANICS",
    "DEMOGRAPHY",
    "STATISTICS",
    "SYLLOGISM",
    "ADJECTIVE",
    "DICTIONARY",
    "CHRONOLOGY",
    "DEMOCRACY",
    "PARLIAMENT",
    "SCULPTURE",
    "ORCHESTRA",
    "ATHLETICS",
    "PHYSIOLOGY",
    "NUTRITION",
    "PSYCHOLOGY",
    "SOCIOLOGY",
    "ARITHMETIC",
    "NUMERATOR",
    "PERCENTAGE",
    "HEMISPHERE",
    "CONTINENT"
  ]
};

const EXTRA_DEFINITIONS = {
  es: {
    ASTRONOMIA: "disciplina que estudia el universo y los astros",
    MATEMATICA: "ciencia de numeros, formas y relaciones",
    GEOGRAFIA: "estudio de la superficie terrestre y sus regiones",
    LITERATURA: "arte de escribir y analizar obras narrativas o poeticas",
    FILOSOFIA: "reflexion sobre conocimiento, etica y realidad",
    TECTONICA: "dinamica de placas y estructura de la corteza terrestre",
    HIDROGENO: "elemento quimico ligero de la tabla periodica",
    ALGORITMO: "secuencia ordenada de pasos para resolver un problema",
    PROCESADOR: "componente que ejecuta instrucciones en un sistema digital",
    DEMOGRAFIA: "analisis estadistico de poblacion y sus cambios",
    GEOMETRIA: "rama matematica de figuras, angulos y espacio",
    TOPOLOGIA: "estudio de propiedades espaciales que se conservan al deformar",
    SILOGISMO: "razonamiento deductivo con premisas y conclusion",
    GRAMATICA: "conjunto de reglas que organizan una lengua",
    SUSTANTIVO: "categoria gramatical que nombra entidades o ideas",
    PRONOMBRE: "palabra que reemplaza a un sustantivo en una oracion",
    CRONOLOGIA: "orden temporal de hechos o acontecimientos",
    DEMOCRACIA: "sistema politico basado en representacion y voto",
    REPUBLICA: "forma de estado sin monarquia hereditaria",
    PARLAMENTO: "camara legislativa de representacion politica",
    ESCULTURA: "arte de crear volumen en materiales fisicos",
    OLIMPIADA: "competicion deportiva internacional por disciplinas",
    ATLETISMO: "conjunto de pruebas de carrera, salto y lanzamiento",
    FISIOLOGIA: "estudio del funcionamiento de seres vivos",
    NUTRICION: "proceso biologico de obtencion y uso de nutrientes",
    PSICOLOGIA: "disciplina que estudia conducta y procesos mentales",
    SOCIOLOGIA: "analisis de estructuras y dinamicas sociales",
    ARITMETICA: "rama basica de operaciones con numeros",
    NUMERADOR: "parte superior en una fraccion",
    PORCENTAJE: "proporcion expresada sobre cien unidades",
    CALENDARIO: "sistema para organizar dias, meses y anos",
    MERIDIANO: "linea imaginaria que une polos y mide longitud",
    HEMISFERIO: "mitad de una esfera o region terrestre",
    CONTINENTE: "gran masa de tierra emergida"
  },
  en: {
    ASTRONOMY: "science that studies stars, planets and space",
    CHEMISTRY: "science focused on matter, reactions and composition",
    GEOGRAPHY: "study of regions, landscapes and spatial distribution",
    LITERATURE: "artistic and critical study of written works",
    PHILOSOPHY: "discipline about knowledge, ethics and existence",
    ECONOMICS: "study of production, distribution and resources",
    SATELLITE: "object orbiting a planet or other larger body",
    TECTONICS: "study of crust movement and plate dynamics",
    ALGORITHM: "ordered sequence of steps to solve a task",
    PROCESSOR: "hardware unit that executes digital instructions",
    MECHANICS: "branch of physics focused on motion and forces",
    DEMOGRAPHY: "statistical study of human populations",
    STATISTICS: "discipline of data analysis and inference",
    SYLLOGISM: "deductive argument built from premises",
    ADJECTIVE: "word class used to describe a noun",
    DICTIONARY: "reference work that defines words",
    CHRONOLOGY: "arrangement of events by time order",
    DEMOCRACY: "political system based on representation and voting",
    PARLIAMENT: "legislative assembly in a representative system",
    SCULPTURE: "art of shaping forms in physical materials",
    ORCHESTRA: "large instrumental ensemble performing together",
    ATHLETICS: "sports discipline of track and field events",
    PHYSIOLOGY: "study of how living organisms function",
    NUTRITION: "process of obtaining and using nutrients",
    PSYCHOLOGY: "study of mind, behavior and cognition",
    SOCIOLOGY: "study of social systems and collective behavior",
    ARITHMETIC: "basic branch of math with numeric operations",
    NUMERATOR: "top number in a fraction",
    PERCENTAGE: "ratio expressed per hundred",
    HEMISPHERE: "half of a sphere or planetary body",
    CONTINENT: "large continuous landmass"
  }
};

const EXTRA_SYNONYMS = {
  es: {
    ASTRONOMIA: ["ciencia espacial"],
    MATEMATICA: ["calculo"],
    GEOGRAFIA: ["cartografia"],
    LITERATURA: ["letras"],
    FILOSOFIA: ["pensamiento"],
    DEMOCRACIA: ["representacion"],
    REPUBLICA: ["estado"],
    PARLAMENTO: ["camara"],
    PSICOLOGIA: ["mente"],
    SOCIOLOGIA: ["sociedad"],
    CALENDARIO: ["agenda"],
    CONTINENTE: ["masa terrestre"]
  },
  en: {
    ASTRONOMY: ["space science"],
    CHEMISTRY: ["matter science"],
    GEOGRAPHY: ["earth study"],
    LITERATURE: ["letters"],
    PHILOSOPHY: ["thought"],
    DEMOCRACY: ["popular rule"],
    PARLIAMENT: ["assembly"],
    PSYCHOLOGY: ["mind science"],
    SOCIOLOGY: ["social science"],
    DICTIONARY: ["lexicon"],
    CONTINENT: ["landmass"]
  }
};

const STYLE_POOL_BY_DIFFICULTY = {
  easy: [
    "indirect_definition",
    "contextual_scene",
    "incomplete_phrase",
    "question_prompt",
    "indirect_synonym"
  ],
  medium: [
    "indirect_definition",
    "contextual_scene",
    "metaphorical_definition",
    "incomplete_phrase",
    "question_prompt",
    "culture_reference",
    "indirect_synonym",
    "conceptual_play"
  ],
  hard: [
    "metaphorical_definition",
    "culture_reference",
    "conceptual_play",
    "question_prompt",
    "indirect_synonym",
    "incomplete_phrase"
  ]
};

const POS_FALLBACK_BY_LOCALE = {
  es: {
    noun: "concepto",
    verb: "accion",
    adjective: "cualidad",
    adverb: "modo",
    generic: "termino"
  },
  en: {
    noun: "concept",
    verb: "action",
    adjective: "quality",
    adverb: "manner",
    generic: "term"
  }
};

const resolveLocaleKey = (locale) =>
  String(locale || "es").toLowerCase().startsWith("es") ? "es" : "en";

const normalizeMatchId = (value, total) => {
  const safe = Math.abs(Number(value) || 0);
  return safe % total;
};

const normalizeMaxWordLength = (value) => {
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isInteger(parsed) && CROSSWORD_MAX_WORD_OPTIONS.includes(parsed)) {
    return parsed;
  }
  return DEFAULT_MAX_WORD_LENGTH;
};

const stripMojibake = (value) => String(value || "")
  .replace(/Â/g, "")
  .replace(/Ã¡/g, "a")
  .replace(/Ã©/g, "e")
  .replace(/Ã­/g, "i")
  .replace(/Ã³/g, "o")
  .replace(/Ãº/g, "u")
  .replace(/Ã±/g, "n")
  .replace(/Ã¼/g, "u")
  .replace(/Ã/g, "");

const normalizeAscii = (value) => stripMojibake(value)
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/\s+/g, " ")
  .trim();

const hashText = (text) => {
  const source = String(text || "");
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const pickBySeed = (options, seedKey) => {
  if (!Array.isArray(options) || !options.length) return "";
  return options[hashText(seedKey) % options.length];
};

const ensureSentence = (value, fallback) => {
  const safe = String(value || "").replace(/\s+/g, " ").trim() || fallback;
  if (!safe) return "";
  const sentence = `${safe.charAt(0).toUpperCase()}${safe.slice(1)}`;
  return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
};

const resolveDifficulty = (wordLength) => {
  if (wordLength <= 6) return "easy";
  if (wordLength <= 8) return "medium";
  return "hard";
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

const inferPosFromLegacyClue = (legacyClue, locale, word) => {
  const clue = normalizeAscii(legacyClue).toLowerCase();
  if (!clue) {
    return inferPosFromWordShape(word, locale);
  }

  if (locale === "es") {
    if (clue.startsWith("adjetivo")) return "adjective";
    if (clue.startsWith("verbo") || clue.startsWith("accion")) return "verb";
    if (clue.startsWith("adverbio")) return "adverb";
    if (clue.startsWith("sustantivo")) return "noun";
  } else {
    if (clue.startsWith("adjective")) return "adjective";
    if (clue.startsWith("verb") || clue.startsWith("action")) return "verb";
    if (clue.startsWith("adverb")) return "adverb";
    if (clue.startsWith("noun")) return "noun";
  }

  return inferPosFromWordShape(word, locale);
};

const extractQuotedAnchor = (rawText) => {
  const normalized = normalizeAscii(rawText);
  if (!normalized) return "";
  const quoted = normalized.match(/"([^"]+)"/);
  if (quoted?.[1]) return quoted[1].trim().toLowerCase();
  return "";
};

const extractDefinitionFromLegacyClue = (legacyClue, locale, anchor, word) => {
  if (anchor) {
    if (locale === "es") {
      return `concepto relacionado con ${anchor}`;
    }
    return `concept related to ${anchor}`;
  }

  const cleaned = normalizeAscii(legacyClue)
    .replace(/^(termino|palabra|entrada|adjetivo|verbo|adverbio|sustantivo|noun|verb|adjective|adverb)\s+/i, "")
    .replace(/^que\s+/i, "")
    .replace(/[.!?]+$/g, "")
    .trim()
    .toLowerCase();

  if (cleaned) {
    return cleaned;
  }

  if (locale === "es") {
    return `termino de ${word.length} letras de uso general`;
  }
  return `${word.length} letter general vocabulary term`;
};

const fallbackDefinitionFromWord = (word, locale) => {
  const safeWord = String(word || "");
  const lower = safeWord.toLowerCase();

  if (locale === "es") {
    if (/(ar|er|ir)$/.test(lower)) return "accion habitual en contexto cotidiano";
    if (/mente$/.test(lower)) return "modo en que se realiza una accion";
    if (/ia$/.test(lower)) return "disciplina o campo de estudio";
    if (/cion$/.test(lower)) return "proceso o efecto dentro de un contexto";
    return "termino de conocimiento general";
  }

  if (/(ate|ify|ise|ize|ing)$/.test(lower)) return "action performed in context";
  if (/ly$/.test(lower)) return "manner in which an action happens";
  if (/ology$/.test(lower)) return "discipline of study";
  if (/tion$/.test(lower)) return "process or resulting concept";
  return "general knowledge term";
};

const buildLegacyLexiconEntry = (entry, locale) => {
  const word = normalizeAscii(entry?.word || "").toUpperCase();
  if (!/^[A-Z]{5,10}$/.test(word)) return null;

  const legacyClue = String(entry?.clue || "");
  const anchor = extractQuotedAnchor(legacyClue);
  const definition = extractDefinitionFromLegacyClue(legacyClue, locale, anchor, word);
  const pos = inferPosFromLegacyClue(legacyClue, locale, word);

  return {
    word,
    pos,
    definition,
    synonyms: anchor ? [anchor] : [],
    example: "",
    difficulty: resolveDifficulty(word.length),
    language: locale
  };
};

const buildExtraLexiconEntry = (word, locale) => {
  const safeWord = normalizeAscii(word).toUpperCase();
  if (!/^[A-Z]{9,10}$/.test(safeWord)) return null;

  const definition = EXTRA_DEFINITIONS[locale]?.[safeWord] || fallbackDefinitionFromWord(safeWord, locale);
  const synonyms = EXTRA_SYNONYMS[locale]?.[safeWord] || [];

  return {
    word: safeWord,
    pos: "noun",
    definition,
    synonyms,
    example: "",
    difficulty: resolveDifficulty(safeWord.length),
    language: locale
  };
};

const createIndexKey = (length, letter, position) => `${length}:${letter}:${position}`;

const buildLocaleLexicon = (locale) => {
  const uniqueByWord = new Map();

  const buckets = CROSSWORD_TERM_BANK[locale] || {};
  Object.values(buckets).forEach((entries) => {
    if (!Array.isArray(entries)) return;
    entries.forEach((entry) => {
      const payload = buildLegacyLexiconEntry(entry, locale);
      if (!payload) return;
      if (!uniqueByWord.has(payload.word)) {
        uniqueByWord.set(payload.word, payload);
      }
    });
  });

  (EXTRA_LONG_WORDS[locale] || []).forEach((word) => {
    const payload = buildExtraLexiconEntry(word, locale);
    if (!payload) return;
    if (!uniqueByWord.has(payload.word)) {
      uniqueByWord.set(payload.word, payload);
    }
  });

  const byLength = {};
  uniqueByWord.forEach((item) => {
    const len = item.word.length;
    if (len < MIN_WORD_LENGTH || len > 10) return;
    if (!byLength[len]) {
      byLength[len] = [];
    }
    byLength[len].push(item);
  });

  Object.keys(byLength).forEach((length) => {
    byLength[length].sort((left, right) => left.word.localeCompare(right.word));
  });

  const positionIndex = new Map();
  Object.keys(byLength).forEach((lengthKey) => {
    const terms = byLength[lengthKey] || [];
    terms.forEach((term) => {
      for (let position = 0; position < term.word.length; position += 1) {
        const key = createIndexKey(term.word.length, term.word[position], position);
        if (!positionIndex.has(key)) {
          positionIndex.set(key, []);
        }
        positionIndex.get(key).push(term);
      }
    });
  });

  return {
    byLength,
    positionIndex,
    total: uniqueByWord.size
  };
};

const LEXICON_BY_LOCALE = {
  es: buildLocaleLexicon("es"),
  en: buildLocaleLexicon("en")
};

const buildLengthCountMeta = (locale) => {
  const info = LEXICON_BY_LOCALE[locale];
  const counts = { total: info.total };
  Object.keys(info.byLength).forEach((lengthKey) => {
    counts[lengthKey] = info.byLength[lengthKey].length;
  });
  return counts;
};

export const CROSSWORD_LEXICON_META = {
  counts: {
    es: buildLengthCountMeta("es"),
    en: buildLengthCountMeta("en")
  }
};
const normalizeConcept = (value, word) => {
  const safeWord = normalizeAscii(word).toLowerCase();
  const safe = normalizeAscii(value)
    .replace(/[.!?]+$/g, "")
    .trim()
    .toLowerCase();

  if (!safe) return "";
  if (safeWord && safe.includes(safeWord)) return "";
  return safe;
};

const resolveConcept = (payload) => {
  const synonym = (payload.synonyms || []).find((candidate) => normalizeConcept(candidate, payload.word));
  if (synonym) {
    return normalizeConcept(synonym, payload.word);
  }

  const definitionConcept = normalizeConcept(payload.definition, payload.word);
  if (definitionConcept) {
    return definitionConcept;
  }

  if (payload.language === "es") {
    return "uso comun";
  }
  return "common usage";
};

const trimTrailingPunctuation = (value) => String(value || "")
  .replace(/\s+/g, " ")
  .replace(/[.!?]+$/g, "")
  .trim();

const cleanSpanishConceptFragment = (value) => trimTrailingPunctuation(
  normalizeAscii(value)
    .toLowerCase()
    .replace(/^(concepto|termino|palabra|entrada)\s+(relacionad[oa]|asociad[oa]|vinculad[oa]|conectad[oa])\s+con\s+/i, "")
    .replace(/^(concepto|termino|palabra|entrada)\s+del?\s+/i, "")
    .replace(/^campo\s+semantico\s+de\s+/i, "")
    .replace(/^que\s+/i, "")
    .replace(/^de\s+/i, "")
);

const isWeakSpanishConcept = (value) => {
  const safe = String(value || "").trim().toLowerCase();
  if (!safe) return true;
  if (safe.length < 3) return true;
  if (/^uso comun$/.test(safe)) return true;
  if (/^tema indicado$/.test(safe)) return true;
  if (/^conocimiento general$/.test(safe)) return true;
  if (/^vocabulario general$/.test(safe)) return true;
  if (/^termino de \d+ letras/.test(safe)) return true;
  return false;
};

const resolveSpanishTemplateAnchor = (payload, concept) => {
  const word = normalizeAscii(payload?.word || "").toLowerCase();
  const candidates = [];

  if (concept) {
    candidates.push(cleanSpanishConceptFragment(concept));
  }

  (payload?.synonyms || []).forEach((item) => {
    candidates.push(cleanSpanishConceptFragment(item));
  });

  if (payload?.definition) {
    candidates.push(cleanSpanishConceptFragment(payload.definition));
  }

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    if (!candidate || isWeakSpanishConcept(candidate)) continue;
    if (word && candidate.includes(word)) continue;
    return candidate;
  }

  if (payload?.pos === "verb") return "una accion concreta";
  if (payload?.pos === "adjective") return "un rasgo definido";
  if (payload?.pos === "adverb") return "una manera precisa";
  return "un concepto concreto";
};

const pickSpanishTemplateContinuation = (payload, branch, options) =>
  pickBySeed(options, `${payload.word}-${payload.pos}-${payload.difficulty}-${branch}`);

const buildSpanishIncompletePhraseTemplates = (payload, concept) => {
  const anchor = resolveSpanishTemplateAnchor(payload, concept);
  const safePayload = payload || { word: "", pos: "generic", difficulty: "medium" };

  if (safePayload.pos === "verb") {
    const thing = pickSpanishTemplateContinuation(safePayload, "se-dice", [
      `expresa la accion de ${anchor}`,
      `nombra el acto de ${anchor}`,
      `describe de forma directa la accion de ${anchor}`
    ]);
    const person = pickSpanishTemplateContinuation(safePayload, "persona", [
      `necesita nombrar la accion de ${anchor} y usa este verbo`,
      `quiere expresar ${anchor} con precision y termina usando este verbo`,
      `esta relatando ${anchor} y recurre a esta palabra`
    ]);
    const object = pickSpanishTemplateContinuation(safePayload, "objeto", [
      `recordar la accion de ${anchor} durante una clase`,
      `explicar la accion de ${anchor} con un ejemplo sencillo`,
      `practicar la accion de ${anchor} en una actividad guiada`
    ]);
    return [
      `Se dice de algo que ${thing}`,
      `Persona que ${person}`,
      `Objeto usado para ${object}`
    ];
  }

  if (safePayload.pos === "adjective") {
    const thing = pickSpanishTemplateContinuation(safePayload, "se-dice", [
      `muestra una cualidad ligada a ${anchor}`,
      `describe un rasgo asociado con ${anchor}`,
      `senala una caracteristica conectada con ${anchor}`
    ]);
    const person = pickSpanishTemplateContinuation(safePayload, "persona", [
      `quiere describir algo en torno a ${anchor} y elige este adjetivo`,
      `busca matizar un rasgo de ${anchor} y usa esta palabra`,
      `compara cualidades cerca de ${anchor} y termina usando este adjetivo`
    ]);
    const object = pickSpanishTemplateContinuation(safePayload, "objeto", [
      `mostrar una cualidad cercana a ${anchor} en una ficha`,
      `clasificar un rasgo ligado a ${anchor} en una actividad`,
      `resaltar una caracteristica de ${anchor} en clase`
    ]);
    return [
      `Se dice de algo que ${thing}`,
      `Persona que ${person}`,
      `Objeto usado para ${object}`
    ];
  }

  if (safePayload.pos === "adverb") {
    const thing = pickSpanishTemplateContinuation(safePayload, "se-dice", [
      `marca la manera en que sucede ${anchor}`,
      `indica como ocurre ${anchor}`,
      `precisa el modo relacionado con ${anchor}`
    ]);
    const person = pickSpanishTemplateContinuation(safePayload, "persona", [
      `busca aclarar como sucede ${anchor} y usa este adverbio`,
      `quiere ajustar el modo de ${anchor} y recurre a esta forma`,
      `necesita matizar como pasa ${anchor} y elige este adverbio`
    ]);
    const object = pickSpanishTemplateContinuation(safePayload, "objeto", [
      `explicar de que modo sucede ${anchor} en clase`,
      `senalar como ocurre ${anchor} en una instruccion`,
      `describir la manera de ${anchor} en un ejemplo guiado`
    ]);
    return [
      `Se dice de algo que ${thing}`,
      `Persona que ${person}`,
      `Objeto usado para ${object}`
    ];
  }

  const thing = pickSpanishTemplateContinuation(safePayload, "se-dice", [
    `guarda relacion directa con ${anchor}`,
    `se asocia de forma natural con ${anchor}`,
    `apunta al mismo campo de ${anchor}`
  ]);
  const person = pickSpanishTemplateContinuation(safePayload, "persona", [
    `trabaja con ideas de ${anchor} reconoce enseguida este termino`,
    `necesita nombrar ${anchor} y termina usando esta palabra`,
    `investiga ${anchor} con frecuencia y recurre a este termino`
  ]);
  const object = pickSpanishTemplateContinuation(safePayload, "objeto", [
    `explicar ${anchor} en clase de forma clara`,
    `ordenar informacion sobre ${anchor} en una actividad`,
    `representar ${anchor} en un esquema didactico`
  ]);

  return [
    `Se dice de algo que ${thing}`,
    `Persona que ${person}`,
    `Objeto usado para ${object}`
  ];
};

const cleanEnglishConceptFragment = (value) => trimTrailingPunctuation(
  normalizeAscii(value)
    .toLowerCase()
    .replace(/^(concept|term|word|entry)\s+(related|associated|linked|connected)\s+to\s+/i, "")
    .replace(/^(concept|term|word|entry)\s+of\s+/i, "")
    .replace(/^semantic\s+field\s+of\s+/i, "")
    .replace(/^that\s+/i, "")
    .replace(/^to\s+/i, "")
);

const isWeakEnglishConcept = (value) => {
  const safe = String(value || "").trim().toLowerCase();
  if (!safe) return true;
  if (safe.length < 3) return true;
  if (/^common usage$/.test(safe)) return true;
  if (/^the given topic$/.test(safe)) return true;
  if (/^general knowledge$/.test(safe)) return true;
  if (/^general vocabulary$/.test(safe)) return true;
  if (/^general knowledge term$/.test(safe)) return true;
  if (/^\d+\s+letter/.test(safe)) return true;
  return false;
};

const resolveEnglishTemplateAnchor = (payload, concept) => {
  const word = normalizeAscii(payload?.word || "").toLowerCase();
  const candidates = [];

  if (concept) {
    candidates.push(cleanEnglishConceptFragment(concept));
  }

  (payload?.synonyms || []).forEach((item) => {
    candidates.push(cleanEnglishConceptFragment(item));
  });

  if (payload?.definition) {
    candidates.push(cleanEnglishConceptFragment(payload.definition));
  }

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    if (!candidate || isWeakEnglishConcept(candidate)) continue;
    if (word && candidate.includes(word)) continue;
    return candidate;
  }

  if (payload?.pos === "verb") return "a concrete action";
  if (payload?.pos === "adjective") return "a clear trait";
  if (payload?.pos === "adverb") return "a specific manner";
  return "a concrete concept";
};

const pickEnglishTemplateContinuation = (payload, branch, options) =>
  pickBySeed(options, `${payload.word}-${payload.pos}-${payload.difficulty}-${branch}`);

const buildEnglishIncompletePhraseTemplates = (payload, concept) => {
  const anchor = resolveEnglishTemplateAnchor(payload, concept);
  const safePayload = payload || { word: "", pos: "generic", difficulty: "medium" };

  if (safePayload.pos === "verb") {
    const thing = pickEnglishTemplateContinuation(safePayload, "it-is-said", [
      `expresses the action of ${anchor}`,
      `names the act of ${anchor}`,
      `directly describes the action of ${anchor}`
    ]);
    const person = pickEnglishTemplateContinuation(safePayload, "person", [
      `needs to describe the action of ${anchor} and reaches for this verb`,
      `wants to express ${anchor} precisely and ends up using this verb`,
      `is narrating ${anchor} and naturally uses this word`
    ]);
    const object = pickEnglishTemplateContinuation(safePayload, "object", [
      `review the action of ${anchor} in class`,
      `explain the action of ${anchor} with a simple example`,
      `practice the action of ${anchor} in a guided activity`
    ]);
    return [
      `It is said of something that ${thing}`,
      `Person who ${person}`,
      `Object used to ${object}`
    ];
  }

  if (safePayload.pos === "adjective") {
    const thing = pickEnglishTemplateContinuation(safePayload, "it-is-said", [
      `shows a quality linked to ${anchor}`,
      `describes a trait associated with ${anchor}`,
      `points to a characteristic connected with ${anchor}`
    ]);
    const person = pickEnglishTemplateContinuation(safePayload, "person", [
      `wants to describe something around ${anchor} and picks this adjective`,
      `tries to nuance a trait of ${anchor} and uses this word`,
      `compares qualities near ${anchor} and ends up using this adjective`
    ]);
    const object = pickEnglishTemplateContinuation(safePayload, "object", [
      `show a quality close to ${anchor} on a worksheet`,
      `classify a trait linked to ${anchor} in an activity`,
      `highlight a characteristic of ${anchor} during class`
    ]);
    return [
      `It is said of something that ${thing}`,
      `Person who ${person}`,
      `Object used to ${object}`
    ];
  }

  if (safePayload.pos === "adverb") {
    const thing = pickEnglishTemplateContinuation(safePayload, "it-is-said", [
      `marks the way in which ${anchor} happens`,
      `indicates how ${anchor} takes place`,
      `clarifies the manner related to ${anchor}`
    ]);
    const person = pickEnglishTemplateContinuation(safePayload, "person", [
      `needs to clarify how ${anchor} happens and uses this adverb`,
      `wants to adjust the manner of ${anchor} and chooses this form`,
      `has to nuance how ${anchor} unfolds and picks this adverb`
    ]);
    const object = pickEnglishTemplateContinuation(safePayload, "object", [
      `explain how ${anchor} happens in class`,
      `point out the manner of ${anchor} in an instruction`,
      `describe the way ${anchor} occurs in a guided example`
    ]);
    return [
      `It is said of something that ${thing}`,
      `Person who ${person}`,
      `Object used to ${object}`
    ];
  }

  const thing = pickEnglishTemplateContinuation(safePayload, "it-is-said", [
    `has a direct relation to ${anchor}`,
    `is naturally associated with ${anchor}`,
    `points to the same field as ${anchor}`
  ]);
  const person = pickEnglishTemplateContinuation(safePayload, "person", [
    `works with ideas about ${anchor} and recognizes this term quickly`,
    `needs to name ${anchor} and ends up using this word`,
    `studies ${anchor} often and relies on this term`
  ]);
  const object = pickEnglishTemplateContinuation(safePayload, "object", [
    `explain ${anchor} clearly in class`,
    `organize information about ${anchor} in an activity`,
    `represent ${anchor} on a learning chart`
  ]);

  return [
    `It is said of something that ${thing}`,
    `Person who ${person}`,
    `Object used to ${object}`
  ];
};

const clueContainsWord = (word, clue) => {
  const normalizedWord = normalizeAscii(word).toLowerCase();
  const normalizedClue = normalizeAscii(clue).toLowerCase();
  if (!normalizedWord || !normalizedClue) return false;
  return normalizedClue.includes(normalizedWord);
};

const resolvePromptPayload = (entry, locale) => ({
  word: entry.word,
  pos: entry.pos || inferPosFromWordShape(entry.word, locale),
  definition: entry.definition || fallbackDefinitionFromWord(entry.word, locale),
  synonyms: Array.isArray(entry.synonyms) ? entry.synonyms : [],
  example: entry.example || "",
  difficulty: entry.difficulty || resolveDifficulty(entry.word.length),
  language: locale
});

const resolveStyle = (payload, seedKey) => {
  const pool = STYLE_POOL_BY_DIFFICULTY[payload.difficulty] || STYLE_POOL_BY_DIFFICULTY.medium;
  return pickBySeed(pool, `${payload.word}-${seedKey}-style`);
};

const buildSpanishClueCandidates = ({ style, concept, pos, difficulty, payload }) => {
  const role = POS_FALLBACK_BY_LOCALE.es[pos] || POS_FALLBACK_BY_LOCALE.es.generic;

  if (style === "indirect_definition") {
    return [
      `Idea habitual cuando el tema gira en torno a ${concept}`,
      `En lenguaje cotidiano, suele aparecer ligada a ${concept}`,
      `${role.charAt(0).toUpperCase()}${role.slice(1)} conectado con ${concept}`
    ];
  }

  if (style === "contextual_scene") {
    return [
      `En una charla diaria sobre ${concept}, esta palabra encaja al instante`,
      `Situacion tipica: alguien menciona ${concept} y esta entrada completa la frase`,
      `Cuando el contexto apunta a ${concept}, esta opcion suele salir natural`
    ];
  }

  if (style === "metaphorical_definition") {
    return [
      `Como una brujula en medio de ${concept}: orienta sin decirlo de frente`,
      `Suena a pista sutil dentro del universo de ${concept}`,
      `Pieza clave en el mapa conceptual de ${concept}`
    ];
  }

  if (style === "incomplete_phrase") {
    return buildSpanishIncompletePhraseTemplates(payload, concept);
  }

  if (style === "question_prompt") {
    return [
      `Si el foco esta en ${concept}, que termino escogerias?`,
      `Cual es la palabra que mejor representa ${concept} en este contexto?`,
      `Que entrada pondrias para una pista asociada a ${concept}?`
    ];
  }

  if (style === "culture_reference") {
    return [
      `En textos de cultura general, ${concept} suele nombrarse con esta forma`,
      `Aparece con frecuencia en manuales cuando se aborda ${concept}`,
      `Es una voz recurrente en contenidos academicos sobre ${concept}`
    ];
  }

  if (style === "indirect_synonym") {
    return [
      `Muy cercana a ${concept}, pero sin repetirlo de manera literal`,
      `Comparte terreno semantico con ${concept}`,
      `Se mueve en la misma zona de significado que ${concept}`
    ];
  }

  if (style === "conceptual_play") {
    return [
      `No va por lo absoluto; apunta mas bien al terreno de ${concept}`,
      `Pista conceptual: imagina el opuesto y regresa hacia ${concept}`,
      `Juego de ideas: si sigues el hilo de ${concept}, llegas aqui`
    ];
  }

  if (difficulty === "hard") {
    return [
      `Pista abstracta con anclaje en ${concept}`,
      `Lectura conceptual relacionada con ${concept}`
    ];
  }

  return [
    `Termino vinculado a ${concept}`,
    `Entrada asociada a ${concept}`
  ];
};

const buildEnglishClueCandidates = ({ style, concept, pos, difficulty, payload }) => {
  const role = POS_FALLBACK_BY_LOCALE.en[pos] || POS_FALLBACK_BY_LOCALE.en.generic;

  if (style === "indirect_definition") {
    return [
      `Common idea whenever the topic points to ${concept}`,
      `In everyday language, this appears around ${concept}`,
      `${role.charAt(0).toUpperCase()}${role.slice(1)} tied to ${concept}`
    ];
  }

  if (style === "contextual_scene") {
    return [
      `Typical scene: someone mentions ${concept}, and this entry fits naturally`,
      `In daily conversation about ${concept}, this is a likely answer`,
      `Context clue: discuss ${concept} and this word often completes the thought`
    ];
  }

  if (style === "metaphorical_definition") {
    return [
      `Like a compass inside ${concept}: it guides without naming the obvious`,
      `A subtle marker in the conceptual field of ${concept}`,
      `Picture a map of ${concept}; this term is one of its anchors`
    ];
  }

  if (style === "incomplete_phrase") {
    return buildEnglishIncompletePhraseTemplates(payload, concept);
  }

  if (style === "question_prompt") {
    return [
      `If the focus is ${concept}, which term would you choose?`,
      `What word best captures ${concept} in this clue?`,
      `Which entry fits a clue connected with ${concept}?`
    ];
  }

  if (style === "culture_reference") {
    return [
      `In general knowledge texts, ${concept} is often named through this term`,
      `Frequent in educational references when ${concept} is discussed`,
      `A recurring word in content about ${concept}`
    ];
  }

  if (style === "indirect_synonym") {
    return [
      `Close to ${concept}, but not a literal copy`,
      `Shares semantic ground with ${concept}`,
      `Moves in the same meaning area as ${concept}`
    ];
  }

  if (style === "conceptual_play") {
    return [
      `Not an absolute notion; it leans toward the field of ${concept}`,
      `Conceptual play: think of the contrast and return to ${concept}`,
      `Follow the idea trail of ${concept} and you land here`
    ];
  }

  if (difficulty === "hard") {
    return [
      `Abstract clue anchored in ${concept}`,
      `Conceptual reading related to ${concept}`
    ];
  }

  return [
    `Term linked to ${concept}`,
    `Entry associated with ${concept}`
  ];
};

const buildSafeFallbackClue = (payload, concept) => {
  if (payload.language === "es") {
    return ensureSentence(
      `Entrada de ${payload.word.length} letras relacionada con ${concept || "el tema indicado"}`,
      "Entrada de vocabulario general."
    );
  }

  return ensureSentence(
    `${payload.word.length} letter entry connected with ${concept || "the given topic"}`,
    "General vocabulary entry."
  );
};

const createPromptGuidedClue = (entry, locale, seedKey) => {
  const payload = resolvePromptPayload(entry, locale);
  const concept = resolveConcept(payload);
  const style = resolveStyle(payload, seedKey);

  const candidates = payload.language === "es"
    ? buildSpanishClueCandidates({
      style,
      concept,
      pos: payload.pos,
      difficulty: payload.difficulty,
      payload
    })
    : buildEnglishClueCandidates({
      style,
      concept,
      pos: payload.pos,
      difficulty: payload.difficulty,
      payload
    });

  const raw = pickBySeed(candidates, `${seedKey}-${payload.word}-${style}`);
  const fallback = buildSafeFallbackClue(payload, concept);
  let clue = ensureSentence(raw, fallback);

  if (clueContainsWord(payload.word, clue)) {
    clue = fallback;
  }

  return {
    word: payload.word,
    clue,
    style,
    difficulty: payload.difficulty
  };
};

const resolveLayoutPlan = (maxWordLength) => {
  const size = maxWordLength;
  const anchorCol = Math.floor(size / 2);
  const acrossRows = [];
  for (let row = 0; row < size; row += 2) {
    acrossRows.push(row);
  }
  return { size, anchorCol, acrossRows };
};

const buildLengthPriority = (preferred, maxWordLength) => {
  const normalizedPreferred = Math.min(maxWordLength, Math.max(MIN_WORD_LENGTH, preferred));
  const lengths = [];

  for (let length = normalizedPreferred; length >= MIN_WORD_LENGTH; length -= 1) {
    lengths.push(length);
  }
  for (let length = normalizedPreferred + 1; length <= maxWordLength; length += 1) {
    lengths.push(length);
  }

  return [...new Set(lengths)];
};

const resolveIntersectionPositions = (length, size, anchorCol) => {
  const minIndex = Math.max(0, anchorCol - (size - length));
  const maxIndex = Math.min(length - 1, anchorCol);
  const positions = [];
  for (let index = minIndex; index <= maxIndex; index += 1) {
    positions.push(index);
  }
  return positions;
};

const resolvePreferredLengthForRow = (row, size, random) => {
  if (row === 0) return size;

  let maxForRow = size;
  if (size >= 9 && random() < 0.65) {
    maxForRow = 8;
  }

  const minForRow = Math.min(MIN_WORD_LENGTH, maxForRow);
  if (maxForRow <= minForRow) return minForRow;
  return minForRow + Math.floor(random() * (maxForRow - minForRow + 1));
};

const pickAcrossEntry = ({
  lexicon,
  size,
  maxWordLength,
  anchorCol,
  row,
  intersectionLetter,
  usedWords,
  random
}) => {
  const preferredLength = resolvePreferredLengthForRow(row, maxWordLength, random);
  const candidateLengths = buildLengthPriority(preferredLength, maxWordLength);

  for (let lengthIndex = 0; lengthIndex < candidateLengths.length; lengthIndex += 1) {
    const length = candidateLengths[lengthIndex];
    if (!Array.isArray(lexicon.byLength[length]) || !lexicon.byLength[length].length) {
      continue;
    }

    const positions = shuffleWithRandom(
      resolveIntersectionPositions(length, size, anchorCol),
      random
    );

    for (let posIndex = 0; posIndex < positions.length; posIndex += 1) {
      const intersectionIndex = positions[posIndex];
      const key = createIndexKey(length, intersectionLetter, intersectionIndex);
      const candidates = lexicon.positionIndex.get(key) || [];
      if (!candidates.length) continue;

      const startOffset = Math.floor(random() * candidates.length);
      for (let offset = 0; offset < candidates.length; offset += 1) {
        const candidate = candidates[(startOffset + offset) % candidates.length];
        if (usedWords.has(candidate.word)) continue;

        const startCol = anchorCol - intersectionIndex;
        const endCol = startCol + length - 1;
        if (startCol < 0 || endCol >= size) continue;

        return {
          entry: candidate,
          row,
          col: startCol,
          length,
          intersectionIndex
        };
      }
    }
  }

  return null;
};

const buildLayoutWithSeed = ({ matchId, localeKey, maxWordLength }) => {
  const lexicon = LEXICON_BY_LOCALE[localeKey] || LEXICON_BY_LOCALE.en;
  const downCandidates = lexicon.byLength[maxWordLength] || [];
  if (!downCandidates.length) {
    throw new Error(`Crossword lexicon missing words of length ${maxWordLength} for ${localeKey}.`);
  }

  const layout = resolveLayoutPlan(maxWordLength);
  const localeShift = localeKey === "es" ? 17 : 79;
  const random = createSeededRandom((matchId + 1) * 4099 + maxWordLength * 131 + localeShift);
  const downStart = Math.floor(random() * downCandidates.length);

  const maxDownAttempts = Math.min(MAX_LAYOUT_ATTEMPTS, downCandidates.length);
  for (let downAttempt = 0; downAttempt < maxDownAttempts; downAttempt += 1) {
    const downEntry = downCandidates[(downStart + downAttempt) % downCandidates.length];
    const usedWords = new Set([downEntry.word]);
    const acrossSlots = [];

    let valid = true;
    for (let rowIndex = 0; rowIndex < layout.acrossRows.length; rowIndex += 1) {
      const row = layout.acrossRows[rowIndex];
      const intersectionLetter = downEntry.word[row];

      const slot = pickAcrossEntry({
        lexicon,
        size: layout.size,
        maxWordLength,
        anchorCol: layout.anchorCol,
        row,
        intersectionLetter,
        usedWords,
        random
      });

      if (!slot) {
        valid = false;
        break;
      }

      acrossSlots.push(slot);
      usedWords.add(slot.entry.word);
    }

    if (valid) {
      return {
        layout,
        downEntry,
        acrossSlots
      };
    }
  }

  throw new Error(`Unable to build crossword layout for locale=${localeKey}, size=${maxWordLength}.`);
};
const buildSolutionGrid = ({ layout, downEntry, acrossSlots }) => {
  const solution = Array.from({ length: layout.size }, () =>
    Array.from({ length: layout.size }, () => "#")
  );

  for (let row = 0; row < layout.size; row += 1) {
    solution[row][layout.anchorCol] = downEntry.word[row];
  }

  acrossSlots.forEach((slot) => {
    for (let index = 0; index < slot.length; index += 1) {
      const col = slot.col + index;
      const letter = slot.entry.word[index];
      const current = solution[slot.row][col];

      if (current !== "#" && current !== letter) {
        throw new Error("Crossword generation mismatch.");
      }

      solution[slot.row][col] = letter;
    }
  });

  return solution;
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

const hasLetterCell = (solution, row, col) => inBounds(solution, row, col) && !isBlocked(solution, row, col);

export const buildCellNumbers = (solution) => {
  let number = 1;
  const map = {};

  for (let row = 0; row < solution.length; row += 1) {
    for (let col = 0; col < solution[row].length; col += 1) {
      if (isBlocked(solution, row, col)) continue;

      const startsAcross =
        !hasLetterCell(solution, row, col - 1) && hasLetterCell(solution, row, col + 1);
      const startsDown =
        !hasLetterCell(solution, row - 1, col) && hasLetterCell(solution, row + 1, col);

      if (startsAcross || startsDown) {
        map[keyForCell(row, col)] = number;
        number += 1;
      }
    }
  }

  return map;
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

const buildWordEntries = ({
  cellNumbers,
  layout,
  downEntry,
  acrossSlots,
  copy,
  locale,
  matchId,
  maxWordLength
}) => {
  const acrossEntries = acrossSlots.map((slot, index) => {
    const start = { row: slot.row, col: slot.col };
    const id = cellNumbers[keyForCell(start.row, start.col)] ?? index + 1;
    const generated = createPromptGuidedClue(
      slot.entry,
      locale,
      `${locale}-${matchId}-${maxWordLength}-across-${slot.row}-${slot.entry.word}`
    );

    const body = clueBody(copy, "across", {
      direction: "across",
      word: slot.entry.word,
      pos: slot.entry.pos,
      definition: slot.entry.definition,
      synonyms: slot.entry.synonyms,
      example: slot.entry.example,
      difficulty: slot.entry.difficulty,
      language: locale,
      clue: generated.clue,
      style: generated.style
    });

    return {
      key: `across-${id}-${index}`,
      id,
      start,
      cells: Array.from({ length: slot.length }, (_, offset) => ({
        row: slot.row,
        col: slot.col + offset
      })),
      word: slot.entry.word,
      style: generated.style,
      difficulty: generated.difficulty,
      text: copy.acrossClue(id, body, start)
    };
  });

  const downStart = { row: 0, col: layout.anchorCol };
  const downId = cellNumbers[keyForCell(downStart.row, downStart.col)] ?? 1;
  const generatedDown = createPromptGuidedClue(
    downEntry,
    locale,
    `${locale}-${matchId}-${maxWordLength}-down-${downEntry.word}`
  );

  const downBody = clueBody(copy, "down", {
    direction: "down",
    word: downEntry.word,
    pos: downEntry.pos,
    definition: downEntry.definition,
    synonyms: downEntry.synonyms,
    example: downEntry.example,
    difficulty: downEntry.difficulty,
    language: locale,
    clue: generatedDown.clue,
    style: generatedDown.style
  });

  const downEntries = [
    {
      key: `down-${downId}-0`,
      id: downId,
      start: downStart,
      cells: Array.from({ length: layout.size }, (_, row) => ({ row, col: layout.anchorCol })),
      word: downEntry.word,
      style: generatedDown.style,
      difficulty: generatedDown.difficulty,
      text: copy.downClue(downId, downBody, downStart)
    }
  ];

  return { across: acrossEntries, down: downEntries };
};

export const createCrosswordMatch = (matchId, locale, copy, settings = {}) => {
  const localeKey = resolveLocaleKey(locale);
  const safeCopy = resolveCopy(copy);
  const safeMatchId = normalizeMatchId(matchId, CROSSWORD_MATCH_COUNT);
  const maxWordLength = normalizeMaxWordLength(settings.maxWordLength);

  const structure = buildLayoutWithSeed({
    matchId: safeMatchId,
    localeKey,
    maxWordLength
  });

  const solution = buildSolutionGrid(structure);
  const cellNumbers = buildCellNumbers(solution);
  const clues = buildWordEntries({
    cellNumbers,
    layout: structure.layout,
    downEntry: structure.downEntry,
    acrossSlots: structure.acrossSlots,
    copy: safeCopy,
    locale: localeKey,
    matchId: safeMatchId,
    maxWordLength
  });

  return {
    solution,
    cellNumbers,
    clues,
    grid: {
      rows: solution.length,
      cols: solution[0]?.length ?? 0,
      openCells: countPlayableCells(solution),
      maxWordLength
    },
    puzzleKey: `${localeKey}-${maxWordLength}-${encodeMatchWord(
      safeMatchId,
      WORD_ID_ALPHABET,
      5
    )}`
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
