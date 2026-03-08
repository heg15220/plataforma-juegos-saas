import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const outputDir = path.resolve("output/knowledge-mapas-camino-corto-continents");
fs.mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader"]
});
const page = await browser.newPage({ viewport: { width: 1360, height: 920 } });
const consoleErrors = [];

page.on("console", (message) => {
  if (message.type() === "error") {
    consoleErrors.push(message.text());
  }
});
page.on("pageerror", (error) => {
  consoleErrors.push(String(error));
});

const state = async () => {
  const raw = await page.evaluate(() => {
    if (typeof window.render_game_to_text !== "function") return "{}";
    return window.render_game_to_text();
  });
  return JSON.parse(raw || "{}");
};

const save = async (name) => {
  await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: true });
  fs.writeFileSync(path.join(outputDir, `${name}.json`), JSON.stringify(await state(), null, 2));
};

const fillGuess = async (value) => {
  await page.click(".maps-input-shell input", { clickCount: 3 });
  await page.keyboard.type(value);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(180);
};

await page.goto("http://127.0.0.1:4173/#game=knowledge-mapas-camino-corto", {
  waitUntil: "networkidle"
});
await page.waitForTimeout(450);

const continents = ["europe", "africa", "america", "asia", "oceania"];
const report = [];

for (const continentId of continents) {
  await page.selectOption(".maps-toolbar select", continentId);
  await page.waitForTimeout(250);

  let snapshot = await state();
  const idealNextId = snapshot.challenge?.idealPath?.[1];
  const idealEntry = (snapshot.visibleCountries || []).find((entry) => entry.id === idealNextId);

  let idealAccepted = false;
  if (idealEntry?.country) {
    await fillGuess(idealEntry.country);
    snapshot = await state();
    const last = snapshot.route?.[snapshot.route.length - 1];
    idealAccepted = Boolean(last && last.countryId === idealNextId && last.status === "ideal");
  }

  await save(`continent-${continentId}`);

  report.push({
    continentId,
    activeContinent: snapshot.continent?.id,
    startId: snapshot.challenge?.startId,
    destinationId: snapshot.challenge?.destinationId,
    optimalSteps: snapshot.challenge?.optimalSteps,
    idealPathLength: snapshot.challenge?.idealPath?.length || 0,
    idealAccepted
  });

  await page.keyboard.press("KeyR");
  await page.waitForTimeout(140);
}

fs.writeFileSync(
  path.join(outputDir, "summary.json"),
  JSON.stringify({ report, consoleErrors }, null, 2)
);

await browser.close();
