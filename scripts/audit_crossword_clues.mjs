import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CROSSWORD_TERM_BANK } from "../src/games/knowledge/crosswordTermBank.js";
import { evaluateClueQuality } from "../src/games/knowledge/crossword/crosswordClueQualityValidator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parseOutArg = () => {
  const hit = process.argv.find((arg) => arg.startsWith("--out="));
  if (!hit) return "";
  return hit.slice("--out=".length).trim();
};

const initLocaleAudit = () => ({
  total: 0,
  averageScore: 0,
  hardFailReasons: {},
  lowScoreCount: 0,
  byLength: {}
});

const accumulate = (target, reason) => {
  target[reason] = (target[reason] || 0) + 1;
};

const runAudit = () => {
  const locales = ["es", "en"];
  const report = {
    generatedAt: new Date().toISOString(),
    source: "CROSSWORD_TERM_BANK",
    locales: {}
  };

  locales.forEach((locale) => {
    const localeAudit = initLocaleAudit();
    const buckets = CROSSWORD_TERM_BANK[locale] || {};
    let scoreSum = 0;

    Object.entries(buckets).forEach(([lengthKey, entries]) => {
      const lengthAudit = localeAudit.byLength[lengthKey] || {
        total: 0,
        averageScore: 0,
        lowScoreCount: 0,
        hardFailReasons: {}
      };
      let lengthScoreSum = 0;

      (entries || []).forEach((entry) => {
        const evaluation = evaluateClueQuality({
          clue: entry?.clue || "",
          answer: entry?.word || "",
          locale,
          difficulty: "medium"
        });

        localeAudit.total += 1;
        lengthAudit.total += 1;
        scoreSum += evaluation.score;
        lengthScoreSum += evaluation.score;

        if (evaluation.score < 70 || evaluation.hardFailReasons.length) {
          localeAudit.lowScoreCount += 1;
          lengthAudit.lowScoreCount += 1;
        }

        evaluation.hardFailReasons.forEach((reason) => {
          accumulate(localeAudit.hardFailReasons, reason);
          accumulate(lengthAudit.hardFailReasons, reason);
        });
      });

      lengthAudit.averageScore = lengthAudit.total
        ? Number((lengthScoreSum / lengthAudit.total).toFixed(2))
        : 0;
      localeAudit.byLength[lengthKey] = lengthAudit;
    });

    localeAudit.averageScore = localeAudit.total
      ? Number((scoreSum / localeAudit.total).toFixed(2))
      : 0;
    report.locales[locale] = localeAudit;
  });

  return report;
};

const report = runAudit();
const json = `${JSON.stringify(report, null, 2)}\n`;
const outArg = parseOutArg();

if (outArg) {
  const absoluteOut = path.isAbsolute(outArg) ? outArg : path.resolve(__dirname, "..", outArg);
  fs.writeFileSync(absoluteOut, json, "utf8");
  console.log(`Crossword audit saved at ${absoluteOut}`);
} else {
  console.log(json);
}
