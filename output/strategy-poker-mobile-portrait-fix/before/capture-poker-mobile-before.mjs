import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const port = Number(process.argv[2] || 4173);
const outDir = process.argv[3];
const url = `http://127.0.0.1:${port}/#game=strategy-poker-holdem-no-bet`;
const views = [
  { name: "portrait", width: 390, height: 844 },
  { name: "landscape", width: 844, height: 390 }
];

const browser = await chromium.launch({ headless: true, args: ["--use-gl=angle", "--use-angle=swiftshader"] });
for (const view of views) {
  const context = await browser.newContext({ viewport: { width: view.width, height: view.height } });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1700);

  await page.screenshot({ path: path.join(outDir, `poker-${view.name}-top.png`) });

  await page.evaluate(() => {
    const body = document.querySelector('.launch-body');
    if (body) body.scrollTop = body.scrollHeight;
  });
  await page.waitForTimeout(550);

  await page.screenshot({ path: path.join(outDir, `poker-${view.name}-bottom.png`) });

  const probe = await page.evaluate(() => {
    const gameRoot = document.querySelector('.poker-holdem-game');
    return {
      overlay: !!document.querySelector('.launch-overlay'),
      runtime: typeof window.render_game_to_text === 'function',
      hash: window.location.hash,
      isMobileClass: !!gameRoot?.classList.contains('poker-mobile'),
      isPortraitClass: !!gameRoot?.classList.contains('poker-mobile-portrait'),
      playerCards: gameRoot ? gameRoot.querySelectorAll('.poker-player-seat .poker-card').length : 0,
      actionButtons: gameRoot ? gameRoot.querySelectorAll('.poker-actions-panel button').length : 0,
      configSelects: gameRoot ? gameRoot.querySelectorAll('.poker-config select').length : 0
    };
  });
  fs.writeFileSync(path.join(outDir, `poker-${view.name}-probe.json`), JSON.stringify(probe, null, 2));

  const stateRaw = await page.evaluate(() => {
    if (!window.render_game_to_text) return null;
    try { return window.render_game_to_text(); } catch (error) { return JSON.stringify({ error: String(error?.message || error) }); }
  });
  fs.writeFileSync(path.join(outDir, `poker-${view.name}-state.json`), String(stateRaw ?? "null"));

  if (errors.length) {
    fs.writeFileSync(path.join(outDir, `poker-${view.name}-errors.json`), JSON.stringify(errors, null, 2));
  }

  await context.close();
}
await browser.close();
