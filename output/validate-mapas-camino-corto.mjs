import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const outputDir = path.resolve("output/knowledge-mapas-camino-corto-manual");
fs.mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader"],
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

const readState = async () => {
  const raw = await page.evaluate(() => {
    if (typeof window.render_game_to_text !== "function") {
      return "{}";
    }
    return window.render_game_to_text();
  });
  return JSON.parse(raw || "{}");
};

const writeArtifact = async (name) => {
  const shotPath = path.join(outputDir, `${name}.png`);
  const statePath = path.join(outputDir, `${name}.json`);
  await page.screenshot({ path: shotPath, fullPage: true });
  const state = await readState();
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  return state;
};

const resolveCountryName = (state, countryId) => {
  const country = (state.visibleCountries || []).find((entry) => entry.id === countryId);
  return country?.country || countryId;
};

const submitGuess = async (guessText) => {
  await page.click(".maps-input-shell input", { clickCount: 3 });
  await page.keyboard.type(guessText);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(220);
};

const tryAlternativeStep = async () => {
  let state = await readState();
  const baseRouteLength = state.route?.length || 0;
  const idealNextId = state.challenge?.idealPath?.[baseRouteLength];
  const routeIds = new Set((state.route || []).map((entry) => entry.countryId));

  for (const candidate of state.visibleCountries || []) {
    if (!candidate?.id) continue;
    if (candidate.id === idealNextId) continue;
    if (routeIds.has(candidate.id)) continue;

    const candidateName = resolveCountryName(state, candidate.id);
    await submitGuess(candidateName);
    state = await readState();

    if ((state.route?.length || 0) > baseRouteLength) {
      const lastStep = state.route[state.route.length - 1];
      if (lastStep?.status === "alternative") {
        return { found: true, state };
      }
      await page.keyboard.press("KeyR");
      await page.waitForTimeout(220);
      state = await readState();
      return { found: false, state };
    }
  }

  return { found: false, state };
};

await page.goto("http://127.0.0.1:4173/#game=knowledge-mapas-camino-corto", {
  waitUntil: "networkidle",
});
await page.waitForTimeout(500);

let state = await writeArtifact("initial");

const firstIdealId = state.challenge?.idealPath?.[1];
if (firstIdealId) {
  const firstIdealName = resolveCountryName(state, firstIdealId);
  await submitGuess(firstIdealName);
  state = await writeArtifact("after-ideal-step");
}

await page.keyboard.press("KeyR");
await page.waitForTimeout(220);
state = await readState();

let alternativeFound = false;
for (let challengeTry = 0; challengeTry < 12; challengeTry += 1) {
  const result = await tryAlternativeStep();
  state = result.state;
  if (result.found) {
    alternativeFound = true;
    break;
  }
  await page.keyboard.press("KeyN");
  await page.waitForTimeout(240);
  state = await readState();
}

await writeArtifact(alternativeFound ? "after-alternative-step" : "after-alternative-step-not-found");
fs.writeFileSync(
  path.join(outputDir, "summary.json"),
  JSON.stringify(
    {
      alternativeFound,
      consoleErrors,
      finalStatus: state.progress?.status,
      finalRoute: state.route,
    },
    null,
    2
  )
);

await browser.close();
