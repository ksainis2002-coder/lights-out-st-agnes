// Screenshots every mockup still at 1280×720 into docs/mockups/stills-0.2/.
// Usage: npx vite --port 5199 &  then  node tools/shoot-stills.mjs [names…]
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const ALL = ['intro_wake', 'hub', 'dorm', 'tommy', 'low_sanity', 'rewind'];
const names = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
const out = new URL('../docs/mockups/stills-0.2/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
page.on('console', (m) => m.type() === 'error' && console.log('CONSOLE', m.text()));
for (const name of names) {
  await page.goto(`http://localhost:5199/mockup.html?s=${name}`);
  await page.waitForSelector('body[data-ready="1"]', { state: 'attached', timeout: 30000 });
  await page.screenshot({ path: `${out}${name}.png` });
  console.log('shot', name);
}
await browser.close();
