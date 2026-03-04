import { chromium } from "playwright";
import path from "node:path";

const outDir = process.argv[2];
const port = process.argv[3];
const url = `http://127.0.0.1:${port}/#game=knowledge-domino-chain`;
const views = [
  { name: "portrait-v4-bottom", width: 390, height: 844 },
  { name: "landscape-v4-bottom", width: 844, height: 390 }
];

const browser = await chromium.launch({ headless: true, args:["--use-gl=angle","--use-angle=swiftshader"] });
for (const view of views) {
  const context = await browser.newContext({ viewport: { width: view.width, height: view.height } });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const body = document.querySelector('.launch-body');
    if (body) body.scrollTop = body.scrollHeight;
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, `domino-mobile-${view.name}.png`) });
  await context.close();
}
await browser.close();
