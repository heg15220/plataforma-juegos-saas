import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const outputDir = path.resolve("output/knowledge-mapas-camino-corto-spain");
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

await page.goto("http://127.0.0.1:4178/#game=knowledge-mapas-camino-corto", {
  waitUntil: "networkidle"
});
await page.waitForTimeout(500);

await page.locator(".maps-toolbar select").nth(0).selectOption("provinces");
await page.waitForTimeout(220);

const optionValues = await page.locator(".maps-toolbar select").nth(1).locator("option").evaluateAll((options) =>
  options.map((option) => ({ value: option.value, label: option.textContent?.trim() ?? "" }))
);

const hasSpainOption = optionValues.some((option) => option.value === "spain");
if (hasSpainOption) {
  await page.locator(".maps-toolbar select").nth(1).selectOption("spain");
  await page.waitForTimeout(280);
}

const state = await readState();
await page.screenshot({ path: path.join(outputDir, "spain-provinces.png"), fullPage: true });
fs.writeFileSync(path.join(outputDir, "state.json"), JSON.stringify(state, null, 2));
fs.writeFileSync(
  path.join(outputDir, "summary.json"),
  JSON.stringify(
    {
      hasSpainOption,
      selectedMapId: state.continent?.id,
      selectedMapName: state.continent?.name,
      nodeCount: state.visibleCountries?.length ?? 0,
      consoleErrors,
      firstOptions: optionValues.slice(0, 8)
    },
    null,
    2
  )
);

await browser.close();
