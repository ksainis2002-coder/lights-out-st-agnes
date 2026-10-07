// Usage: serve this folder (python3 -m http.server 5190), then
// node shoot.cjs http://127.0.0.1:5190 ../stills
const { chromium } = require('playwright');
(async () => {
  const [base, out] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  p.on('pageerror', e => console.log('PAGEERROR', e.message));
  p.on('console', m => m.type() === 'error' && console.log('CONSOLE', m.text()));
  for (const s of ['warning_en', 'warning_el', 'menu', 'settings', 'game', 'debug']) {
    await p.goto(`${base}/index.html?s=${s}`);
    await p.waitForSelector('body[data-ready="1"]', { timeout: 15000 });
    await p.screenshot({ path: `${out}/${s}.png` });
    console.log('shot', s);
  }
  await b.close();
})();
