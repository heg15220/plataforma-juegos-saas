import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const outDir = process.argv[2];
const port = process.argv[3];
const url = `http://127.0.0.1:${port}/?game=knowledge-domino-chain`;
const views = [
  { name: "portrait-v2", width: 390, height: 844 },
  { name: "landscape-v2", width: 844, height: 390 }
];

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=angle", "--use-angle=swiftshader"]
});

for (const view of views) {
  const context = await browser.newContext({ viewport: { width: view.width, height: view.height } });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1400);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(outDir, `domino-mobile-${view.name}.png`), fullPage: true });

  const renderState = await page.evaluate(() => {
    if (!window.render_game_to_text) return null;
    try {
      return window.render_game_to_text();
    } catch (error) {
      return JSON.stringify({ error: String(error?.message || error) });
    }
  });
  fs.writeFileSync(path.join(outDir, `domino-mobile-${view.name}-state.json`), String(renderState ?? "null"));

  if (errors.length) {
    fs.writeFileSync(path.join(outDir, `domino-mobile-${view.name}-errors.json`), JSON.stringify(errors, null, 2));
  }

  await context.close();
}

await browser.close();
