import { test, expect } from '@playwright/test';
import { waitForBoot } from './helpers.js';

const state = (page) => page.evaluate(() => {
  const game = window.__stAgnes;
  return { active: game.intro.active(), fade: game.pipeline.fx.fade, eyelid: game.pipeline.fx.eyelid, subtitle: game.subtitles.current?.()?.key ?? null };
});

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => window.__stAgnes.newGame());
});

test('a new game opens with the intro: black, eyes open, whisper, then control', async ({ page }) => {
  let s = await state(page);
  expect(s.active).toBe(true);
  expect(s.fade).toBe(1);
  await page.evaluate(() => window.__stAgnes.advance(11));
  s = await state(page);
  expect(s.fade).toBe(0);
  expect(s.eyelid).toBeGreaterThan(0.2);
  // The player cannot walk during the intro.
  const before = await page.evaluate(() => ({ ...window.__stAgnes.player.state.position }));
  await page.evaluate(() => {
    window.__stAgnes.input.hold?.('forward', true);
    window.__stAgnes.advance(2);
    window.__stAgnes.input.hold?.('forward', false);
  });
  expect(await page.evaluate(() => ({ ...window.__stAgnes.player.state.position }))).toEqual(before);
  await page.evaluate(() => window.__stAgnes.advance(30));
  s = await state(page);
  expect(s.active).toBe(false);
  expect(s.eyelid).toBe(0);
  expect(await page.evaluate(() => window.__stAgnes.progress.hasFlag('intro_seen'))).toBe(true);
});

test('ENTER skips the intro', async ({ page }) => {
  await page.evaluate(() => window.__stAgnes.advance(2));
  await page.keyboard.press('Enter');
  await page.evaluate(() => window.__stAgnes.advance(0.1));
  const s = await state(page);
  expect(s.active).toBe(false);
  expect(s.fade).toBe(0);
});
