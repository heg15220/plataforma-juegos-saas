import fs from "node:fs";
import { chromium } from "playwright";

const url = "http://127.0.0.1:4173/#game=strategy-baraja-ia-arena";
const outDir = "C:/Users/hugoe/Downloads/plataforma-juegos-saas/output/strategy-baraja-overlap-check";
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1366, height: 940 } });

for (const aiCount of [3, 4]) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(700);
  await page.selectOption("#brisca-ai", String(aiCount));
  await page.click(".brisca-apply");
  await page.waitForTimeout(950);
  await page.screenshot({ path: `${outDir}/shot-ai-${aiCount}.png`, clip: { x: 88, y: 58, width: 1190, height: 810 } });
  const text = await page.evaluate(() => (typeof window.render_game_to_text === "function" ? window.render_game_to_text() : null));
  if (text) fs.writeFileSync(`${outDir}/state-ai-${aiCount}.json`, text);
}

await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(800);
await page.click(".brisca-human-zone .brisca-player-hand .brisca-card.playable");
let found = false;
for (let i = 0; i < 30; i += 1) {
  await page.waitForTimeout(220);
  const raw = await page.evaluate(() => (typeof window.render_game_to_text === "function" ? window.render_game_to_text() : "{}"));
  let parsed = {};
  try { parsed = JSON.parse(raw || "{}"); } catch {}
  if (parsed.turnTransitioning) {
    found = true;
    fs.writeFileSync(`${outDir}/state-turn-transitioning.json`, JSON.stringify(parsed));
    await page.screenshot({ path: `${outDir}/shot-turn-transitioning.png`, clip: { x: 88, y: 58, width: 1190, height: 810 } });
    break;
  }
}
if (!found) {
  const raw = await page.evaluate(() => (typeof window.render_game_to_text === "function" ? window.render_game_to_text() : "{}"));
  fs.writeFileSync(`${outDir}/state-turn-transitioning.json`, raw || "{}");
}

await browser.close();
