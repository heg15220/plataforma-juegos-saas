import { chromium } from 'playwright';
import fs from 'node:fs';

const outDir = 'output/arcade-pulse-prism-runner-ui-review';
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
await page.goto('http://127.0.0.1:4176/#game=arcade-pulse-prism-runner', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: `${outDir}/menu-full.png`, fullPage: true });
await page.keyboard.press('Enter');
await page.waitForTimeout(1400);
await page.screenshot({ path: `${outDir}/playing-full.png`, fullPage: true });
await page.keyboard.press('KeyP');
await page.waitForTimeout(700);
await page.screenshot({ path: `${outDir}/paused-full.png`, fullPage: true });
await browser.close();
