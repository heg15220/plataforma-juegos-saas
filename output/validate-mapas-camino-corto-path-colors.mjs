import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const outputDir = path.resolve("output/knowledge-mapas-camino-corto-path-colors");
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
  await page.waitForTimeout(260);
};

const startNewRoute = async () => {
  await page.click(".maps-head-actions .knowledge-ui-btn-secondary");
  await page.waitForTimeout(260);
};

const getCurrentNeighborNames = async () => {
  return page
    .locator(".maps-target-panel")
    .nth(1)
    .locator("li .target-name")
    .allTextContents();
};

const tryAlternativeStep = async ({ maxResets = 16 } = {}) => {
  for (let attempt = 0; attempt < maxResets; attempt += 1) {
    const before = await readState();
    const nextIdealId = before.challenge?.idealPath?.[1];
    const idealName = before.visibleCountries?.find((entry) => entry.id === nextIdealId)?.country;
    const neighborNames = (await getCurrentNeighborNames()).map((name) => String(name || "").trim());
    const candidates = neighborNames.filter((name) => name && name !== idealName);

    for (const candidate of candidates) {
      await submitGuess(candidate);
      const after = await readState();
      const lastStep = after.route?.[after.route.length - 1];
      if (lastStep?.status === "alternative") {
        return {
          success: true,
          candidate,
          status: lastStep.status,
          scopeMode: after.scopeMode,
          mapId: after.continent?.id,
          attempts: attempt + 1,
          routeLength: after.route?.length ?? 0
        };
      }
      // Reset to keep the same route while trying another candidate.
      await page.click(".maps-head-actions .knowledge-ui-btn-primary");
      await page.waitForTimeout(220);
    }

    await startNewRoute();
  }

  return { success: false };
};

await page.goto("http://127.0.0.1:4178/#game=knowledge-mapas-camino-corto", {
  waitUntil: "networkidle"
});
await page.waitForTimeout(600);

await save("initial");

// Countries mode: africa
await page.locator(".maps-toolbar select").nth(0).selectOption("countries");
await page.waitForTimeout(220);
await page.locator(".maps-toolbar select").nth(1).selectOption("africa");
await page.waitForTimeout(260);
const countriesAlternative = await tryAlternativeStep();
await save("countries-africa-after-alternative");

// Provinces mode: germany
await page.locator(".maps-toolbar select").nth(0).selectOption("provinces");
await page.waitForTimeout(220);
await page.locator(".maps-toolbar select").nth(1).selectOption("germany");
await page.waitForTimeout(260);
const provincesAlternative = await tryAlternativeStep();
await save("provinces-germany-after-alternative");

const finalState = await readState();
fs.writeFileSync(
  path.join(outputDir, "summary.json"),
  JSON.stringify(
    {
      countriesAlternative,
      provincesAlternative,
      finalStatus: finalState.progress?.status,
      consoleErrors
    },
    null,
    2
  )
);

await browser.close();
