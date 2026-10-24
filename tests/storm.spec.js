import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, load } from './helpers.js';
import { strikeLight } from '../src/levels/lightning.js';

// Wing 2, part B4: the storm (approved still "storm"): it starts once the
// records drawer is open; lightning every 20–40 s, thunder 1–3 s later; a
// soft glow instead of a flash with reduce effects or flicker off.

const game = (page, fn, arg) => page.evaluate(fn, arg);

const listen = (page) => game(page, () => {
  const g = window.__stAgnes;
  g.heard = [];
  ['storm.lightning', 'storm.thunder'].forEach((name) => g.events.on(name, () => g.heard.push({ name, at: g.session.playTime })));
});
const heard = (page) => game(page, () => window.__stAgnes.heard);

// Strikes now and reads the flash some seconds in.
const strikeAndLook = (page, seconds) => game(page, (seconds) => {
  const g = window.__stAgnes;
  g.storm.strike();
  g.advance(seconds);
  return g.storm.flash();
}, seconds);

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => (window.__stAgnes.realTime = false)); // time moves only by advance()
  await page.evaluate(() => window.__stAgnes.play());
});

test('the storm waits for the records drawer; then lightning every 20 to 40 s, the thunder 1 to 3 s after', async ({ page }) => {
  const errors = trackErrors(page);
  await load(page, 'grounds', 'school_door');
  await listen(page);
  await game(page, () => window.__stAgnes.advance(45));
  expect(await heard(page)).toEqual([]);
  await game(page, () => {
    window.__stAgnes.progress.setFlag('puzzle_records');
    window.__stAgnes.advance(14);
  });
  const first = await heard(page);
  expect(first.map((e) => e.name)).toEqual(['storm.lightning', 'storm.thunder']);
  expect(first[1].at - first[0].at).toBeGreaterThanOrEqual(0.98);
  expect(first[1].at - first[0].at).toBeLessThanOrEqual(3.05);
  await game(page, () => window.__stAgnes.advance(42));
  const strikes = (await heard(page)).filter((e) => e.name === 'storm.lightning');
  expect(strikes.length).toBe(2);
  expect(strikes[1].at - strikes[0].at).toBeGreaterThanOrEqual(19.95);
  expect(strikes[1].at - strikes[0].at).toBeLessThanOrEqual(40.05);
  expect(errors).toEqual([]);
});

test('outdoors a strike lights the sky and shows the bolt; with reduce effects only a soft glow, no bolt', async ({ page }) => {
  await game(page, () => window.__stAgnes.progress.setFlag('puzzle_records'));
  await load(page, 'grounds', 'school_door');
  const blink = await strikeAndLook(page, 0.02);
  expect(blink.light).toBeGreaterThan(2);
  expect(blink.bolt).toBe(true);
  expect(await game(page, () => window.__stAgnes.world.scene.background.getHexString())).toBe('56627a'); // the pale sky of the still
  await game(page, () => window.__stAgnes.advance(4));
  expect(await game(page, () => window.__stAgnes.storm.flash())).toEqual({ light: 0, bolt: false });

  await game(page, () => window.__stAgnes.settings.set('reduceEffects', true));
  const start = await strikeAndLook(page, 0.02);
  expect(start.light).toBeLessThan(0.2);
  expect(start.bolt).toBe(false);
  const peak = await game(page, () => {
    window.__stAgnes.advance(0.33);
    return window.__stAgnes.storm.flash();
  });
  expect(peak.light).toBeGreaterThan(1);
  expect(peak.light).toBeLessThan(1.3);
  expect(peak.bolt).toBe(false);
});

test('indoors a strike washes the room through the windows', async ({ page }) => {
  await game(page, () => window.__stAgnes.progress.setFlag('puzzle_records'));
  await load(page, 'school_upper', 'main_stairs');
  const blink = await strikeAndLook(page, 0.02);
  expect(blink.light).toBeGreaterThan(0.8);
  expect(blink.bolt).toBe(false);
});

test('a strike: a blink, sometimes twice, then it dies away; the glow rises and falls slowly', () => {
  expect([0.02, 0.08, 0.15, 0.3, 0.6].map((t) => strikeLight(t, { twice: true }))).toEqual([1, 0.15, 0.9, expect.closeTo(0.714, 2), 0]);
  expect([0.02, 0.2, 0.5].map((t) => strikeLight(t))).toEqual([1, expect.closeTo(0.571, 2), 0]);
  expect([0, 0.35, 0.95, 2].map((t) => strikeLight(t, { glow: true }))).toEqual([0, 0.45, expect.closeTo(0.225, 2), 0]);
});
