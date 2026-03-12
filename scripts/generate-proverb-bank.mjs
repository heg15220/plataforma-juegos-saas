import https from "node:https";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

const TARGET_COUNT = 500;
const GENERATED_AT = new Date().toISOString().slice(0, 10);

const SPANISH_PAGE_PREFIX = "Refranes en espa\u00f1ol";
const ENGLISH_CATEGORY = "Category:English_proverbs";
const ENGLISH_WIKIQUOTE_PAGE = "English_proverbs_(alphabetically_by_proverb)";

const OUTPUT_FILE = path.resolve("src/games/knowledge/proverbBank.generated.js");
const REPORT_FILE = path.resolve("docs/knowledge-refranes-sources.md");

const BANNED_PATTERNS = {
  es: /\b(?:puta(?:s)?|mierda|co(?:n|ñ)o|caga(?:r|s)?|cornud[oa]s?|joder|cabr[oó]n(?:es)?|maric[oó]n(?:es)?|jud[ií]o(?:s)?|moro(?:s)?|por la fuerza|matadero|apalead[oa]s?)\b/i,
  en: /\b(?:fuck(?:ing)?|shit|bitch(?:es)?|whore(?:s)?|slut(?:s)?|nigg(?:er|a)s?|fag(?:got)?s?|cunt(?:s)?)\b/i,
};

const CONNECTOR_SETS = {
  es: new Set(["y", "ni", "pero", "mas", "que", "si", "cuando", "donde", "quien", "porque"]),
  en: new Set(["and", "or", "but", "nor", "for", "yet", "so", "if", "when", "where", "who", "because", "than", "then"]),
};

function getJson(url) {
  return new Promise((resolve, reject) => {
    const request = https.request(url, {
      headers: {
        "User-Agent": "plataforma-juegos-saas proverb bank generator/1.0 (local build)",
        Accept: "application/json",
      },
    }, (response) => {
        if (response.statusCode && response.statusCode >= 400) {
          reject(new Error(`HTTP ${response.statusCode} for ${url}`));
          response.resume();
          return;
        }

        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          try {
            const text = Buffer.concat(chunks).toString("utf8");
            resolve(JSON.parse(text));
          } catch (error) {
            reject(error);
          }
        });
      });

    request.on("error", reject);
    request.end();
  });
}

function buildUrl(base, params) {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

function normalizeSpaces(value) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripWikiMarkup(value) {
  return normalizeSpaces(
    String(value ?? "")
      .replace(/<ref[\s\S]*?<\/ref>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\{\{[^{}]*\}\}/g, " ")
      .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2")
      .replace(/\[\[([^\]]+)\]\]/g, "$1")
      .replace(/''+/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, "\"")
      .replace(/&#39;/gi, "'")
  );
}

function cleanDisplayText(value) {
  let text = stripWikiMarkup(value)
    .replace(/[“”"]/g, "")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/^[,.;:!?-]+/, "")
    .replace(/[ \t]+$/g, "");

  if (text.startsWith("\u00ab") && text.endsWith("\u00bb")) {
    text = text.slice(1, -1);
  }

  text = text
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-")
    .replace(/\s+-\s+/g, " - ")
    .replace(/\s+/g, " ")
    .trim();

  return text;
}

function normalizeForMatch(value) {
  return normalizeSpaces(
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9'\- ]/g, " ")
  );
}

function normalizeForKey(value) {
  return normalizeForMatch(value).replace(/['-]/g, " ");
}

function getWordTokens(value) {
  return normalizeSpaces(value)
    .split(" ")
    .filter(Boolean);
}

function stripTerminalPunctuation(value) {
  return String(value ?? "").replace(/[.?!]+$/g, "").trim();
}

function chooseSplitIndex(words, locale) {
  if (words.length < 4) {
    return -1;
  }

  const targetIndex = Math.max(2, Math.min(words.length - 2, Math.round(words.length * 0.45)));
  const candidates = [];
  const connectors = CONNECTOR_SETS[locale] ?? CONNECTOR_SETS.en;

  for (let index = 2; index <= words.length - 2; index += 1) {
    const previous = words[index - 1];
    const current = words[index];
    const normalizedCurrent = normalizeForMatch(current);

    if (/[,:;]$/.test(previous)) {
      candidates.push({ index, weight: 0 });
    }

    if (connectors.has(normalizedCurrent)) {
      candidates.push({ index, weight: 1 });
    }
  }

  if (!candidates.length) {
    return targetIndex;
  }

  candidates.sort((left, right) => {
    const leftScore = left.weight * 100 + Math.abs(left.index - targetIndex);
    const rightScore = right.weight * 100 + Math.abs(right.index - targetIndex);
    return leftScore - rightScore;
  });

  return candidates[0].index;
}

function createPromptParts(text, locale) {
  const display = cleanDisplayText(text);
  const core = stripTerminalPunctuation(display);
  const words = getWordTokens(core);
  const splitIndex = chooseSplitIndex(words, locale);
  if (splitIndex < 2 || splitIndex >= words.length - 1) {
    return null;
  }

  const prompt = words.slice(0, splitIndex).join(" ").trim();
  const answer = words.slice(splitIndex).join(" ").trim();
  if (!prompt || !answer) {
    return null;
  }

  return {
    proverb: display,
    prompt,
    answer,
    normalizedProverb: normalizeForMatch(core),
    normalizedPrompt: normalizeForMatch(prompt),
    normalizedAnswer: normalizeForMatch(answer),
  };
}

function isUsableProverb(text, locale) {
  const display = cleanDisplayText(text);
  const normalizedKey = normalizeForKey(display);
  const words = getWordTokens(stripTerminalPunctuation(display));

  if (!normalizedKey || words.length < 4 || words.length > 18) {
    return false;
  }

  if (display.length < 16 || display.length > 140) {
    return false;
  }

  if (/\d/.test(display)) {
    return false;
  }

  if (BANNED_PATTERNS[locale]?.test(display)) {
    return false;
  }

  return Boolean(createPromptParts(display, locale));
}

function createSeededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function seededShuffle(items, seed) {
  const random = createSeededRandom(seed);
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

async function fetchAllSpanishPageTitles() {
  const titles = [];
  let apcontinue = null;

  do {
    const url = buildUrl("https://es.wikiquote.org/w/api.php", {
      action: "query",
      list: "allpages",
      apprefix: SPANISH_PAGE_PREFIX,
      aplimit: 500,
      format: "json",
      apcontinue,
    });
    const response = await getJson(url);
    const pages = response?.query?.allpages ?? [];
    pages.forEach((page) => titles.push(page.title));
    apcontinue = response?.continue?.apcontinue ?? null;
  } while (apcontinue);

  return titles
    .filter((title) => /^Refranes en espa\u00f1ol \([^)]+\)$/.test(title))
    .sort((left, right) => left.localeCompare(right, "es"));
}

function extractSpanishProverbs(wikitext) {
  return [...String(wikitext ?? "").matchAll(/^\* «([^»]+)»/gm)].map((match) => match[1]);
}

async function fetchSpanishCandidates() {
  const pageTitles = await fetchAllSpanishPageTitles();
  const candidates = [];

  for (const title of pageTitles) {
    const url = buildUrl("https://es.wikiquote.org/w/api.php", {
      action: "parse",
      page: title,
      prop: "wikitext",
      formatversion: 2,
      format: "json",
    });
    const response = await getJson(url);
    const wikitext = response?.parse?.wikitext ?? "";
    extractSpanishProverbs(wikitext).forEach((entry) => {
      candidates.push({
        text: entry,
        sourcePage: title,
      });
    });
  }

  return {
    pageTitles,
    candidates,
  };
}

async function fetchEnglishWiktionaryCandidates() {
  const candidates = [];
  let cmcontinue = null;

  do {
    const url = buildUrl("https://en.wiktionary.org/w/api.php", {
      action: "query",
      list: "categorymembers",
      cmtitle: ENGLISH_CATEGORY,
      cmlimit: 500,
      format: "json",
      cmcontinue,
    });
    const response = await getJson(url);
    const members = response?.query?.categorymembers ?? [];
    members.forEach((entry) => {
      if (entry.ns === 0) {
        candidates.push({
          text: entry.title,
          sourcePage: "Category:English proverbs",
        });
      }
    });
    cmcontinue = response?.continue?.cmcontinue ?? null;
  } while (cmcontinue);

  return candidates;
}

function extractEnglishWikiquoteProverbs(wikitext) {
  return String(wikitext ?? "")
    .split(/\r?\n/)
    .filter((line) => /^\* /.test(line) && !/^\*\*/.test(line))
    .map((line) => line.replace(/^\* /, ""))
    .filter((line) => !/^(?:\{\{|\[\[|__NOTOC__)/.test(line))
    .map((line) => line.split("**")[0].trim())
    .map((line) => cleanDisplayText(line))
    .filter(Boolean);
}

async function fetchEnglishWikiquoteCandidates() {
  const url = buildUrl("https://en.wikiquote.org/w/api.php", {
    action: "parse",
    page: ENGLISH_WIKIQUOTE_PAGE,
    prop: "wikitext",
    formatversion: 2,
    format: "json",
  });
  const response = await getJson(url);
  const wikitext = response?.parse?.wikitext ?? "";

  return extractEnglishWikiquoteProverbs(wikitext).map((text) => ({
    text,
    sourcePage: ENGLISH_WIKIQUOTE_PAGE,
  }));
}

function buildLocaleBank(locale, sourceCandidates, seed) {
  const deduped = [];
  const seen = new Set();

  sourceCandidates.forEach((candidate) => {
    const display = cleanDisplayText(candidate.text);
    if (!isUsableProverb(display, locale)) {
      return;
    }

    const key = normalizeForKey(display);
    if (!key || seen.has(key)) {
      return;
    }

    const promptParts = createPromptParts(display, locale);
    if (!promptParts) {
      return;
    }

    seen.add(key);
    deduped.push(promptParts);
  });

  const shuffled = seededShuffle(deduped, seed);
  const selected = shuffled.slice(0, TARGET_COUNT);

  if (selected.length < TARGET_COUNT) {
    throw new Error(
      `Only ${selected.length} usable ${locale} proverbs were collected after filtering.`
    );
  }

  return {
    allUsableCount: deduped.length,
    selected,
  };
}

function buildReport(meta) {
  return `# Banco de refranes\n\n` +
    `Generado el ${meta.generatedAt} con \`scripts/generate-proverb-bank.mjs\`.\n\n` +
    `## Conteo final\n\n` +
    `- Espanol: ${meta.counts.es} refranes\n` +
    `- Ingles: ${meta.counts.en} proverbs\n\n` +
    `## Fuentes\n\n` +
    `- Espanol: paginas alfabeticas de Wikiquote ES bajo \`Refranes en espanol (...)\`.\n` +
    `  - Base: https://es.wikiquote.org/wiki/Refranes_en_espa%C3%B1ol\n` +
    `- Ingles: categoria publica \`Category:English proverbs\` de Wiktionary.\n` +
    `  - Base: https://en.wiktionary.org/wiki/Category:English_proverbs\n` +
    `- Ingles (apoyo para cobertura): pagina alfabetica de Wikiquote EN.\n` +
    `  - Base: https://en.wikiquote.org/wiki/English_proverbs_(alphabetically_by_proverb)\n\n` +
    `## Criterios de filtrado\n\n` +
    `- Deduplicacion por normalizacion sin tildes, puntuacion ni mayusculas.\n` +
    `- Exclusiones basicas de entradas demasiado cortas/largas o con lenguaje explicitamente ofensivo.\n` +
    `- Particionado automatico en \`prompt\` + \`answer\` para la mecanica de completar refranes.\n`;
}

function buildGeneratedModule(bank, meta) {
  return `// Generated by scripts/generate-proverb-bank.mjs on ${meta.generatedAt}\n` +
    `// Do not edit this file manually.\n\n` +
    `export const PROVERB_BANK = ${JSON.stringify(bank, null, 2)};\n\n` +
    `export const PROVERB_BANK_META = ${JSON.stringify(meta, null, 2)};\n`;
}

async function main() {
  const spanishSource = await fetchSpanishCandidates();
  const englishPrimaryCandidates = await fetchEnglishWiktionaryCandidates();
  const englishSupplementCandidates = await fetchEnglishWikiquoteCandidates();

  const spanishBank = buildLocaleBank("es", spanishSource.candidates, 0x53455331);
  const englishBank = buildLocaleBank(
    "en",
    [...englishPrimaryCandidates, ...englishSupplementCandidates],
    0x454e4731
  );

  const bank = {
    es: spanishBank.selected,
    en: englishBank.selected,
  };

  const meta = {
    generatedAt: GENERATED_AT,
    counts: {
      es: bank.es.length,
      en: bank.en.length,
    },
    usableCounts: {
      es: spanishBank.allUsableCount,
      en: englishBank.allUsableCount,
    },
    sources: {
      es: {
        pageCount: spanishSource.pageTitles.length,
        pagePrefix: SPANISH_PAGE_PREFIX,
        baseUrl: "https://es.wikiquote.org/wiki/Refranes_en_espa%C3%B1ol",
      },
      en: {
        primary: "https://en.wiktionary.org/wiki/Category:English_proverbs",
        supplemental: "https://en.wikiquote.org/wiki/English_proverbs_(alphabetically_by_proverb)",
      },
    },
  };

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await mkdir(path.dirname(REPORT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, buildGeneratedModule(bank, meta), "utf8");
  await writeFile(REPORT_FILE, buildReport(meta), "utf8");

  console.log(
    JSON.stringify(
      {
        output: OUTPUT_FILE,
        report: REPORT_FILE,
        counts: meta.counts,
        usableCounts: meta.usableCounts,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
