import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const outputDir = path.resolve("output/knowledge-mapas-camino-corto-provinces");
fs.mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader"]
});
const page = await browser.newPage({ viewport: { width: 1360, height: 920 } });
const consoleErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => {
  consoleErrors.push(String(error));
});

const readState = async () => {
  const raw = await page.evaluate(() => {
    if (typeof window.render_game_to_text !== "function") return "{}";
    return window.render_game_to_text();
  });
  return JSON.parse(raw || "{}");
};

const save = async (name) => {
  await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: true });
  const snapshot = await readState();
  fs.writeFileSync(path.join(outputDir, `${name}.json`), JSON.stringify(snapshot, null, 2));
  return snapshot;
};

const submitGuess = async (text) => {
  await page.click(".maps-input-shell input", { clickCount: 3 });
  await page.keyboard.type(text);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(220);
};

const testIdealStep = async () => {
  let snapshot = await readState();
  const nextIdealId = snapshot.challenge?.idealPath?.[1];
  const entry = (snapshot.visibleCountries || []).find((item) => item.id === nextIdealId);
  if (!entry?.country) {
    return { accepted: false, reason: "ideal-not-found" };
  }
  await submitGuess(entry.country);
  snapshot = await readState();
  const lastStep = snapshot.route?.[snapshot.route.length - 1];
  return {
    accepted: Boolean(lastStep && lastStep.countryId === nextIdealId && lastStep.status === "ideal"),
    reason: "checked",
    snapshot
  };
};

await page.goto("http://127.0.0.1:4178/#game=knowledge-mapas-camino-corto", {
  waitUntil: "networkidle"
});
await page.waitForTimeout(500);

await save("initial");

await page.selectOption(".maps-toolbar select", "countries");
await page.waitForTimeout(220);
await page.locator(".maps-toolbar select").nth(1).selectOption("africa");
await page.waitForTimeout(220);
const countriesResult = await testIdealStep();
await save("countries-africa-after-ideal");

await page.locator(".maps-toolbar select").nth(0).selectOption("provinces");
await page.waitForTimeout(220);
await page.locator(".maps-toolbar select").nth(1).selectOption("germany");
await page.waitForTimeout(260);
const provincesResult = await testIdealStep();
await save("provinces-germany-after-ideal");

const finalState = await readState();
fs.writeFileSync(
  path.join(outputDir, "summary.json"),
  JSON.stringify(
    {
      countriesMode: {
        scopeMode: countriesResult.snapshot?.scopeMode,
        continentId: countriesResult.snapshot?.continent?.id,
        idealAccepted: countriesResult.accepted,
        reason: countriesResult.reason
      },
      provincesMode: {
        scopeMode: provincesResult.snapshot?.scopeMode,
        mapId: provincesResult.snapshot?.continent?.id,
        nodeCount: provincesResult.snapshot?.visibleCountries?.length,
        idealAccepted: provincesResult.accepted,
        reason: provincesResult.reason
      },
      finalStatus: finalState.progress?.status,
      consoleErrors
    },
    null,
    2
  )
);

await browser.close();
