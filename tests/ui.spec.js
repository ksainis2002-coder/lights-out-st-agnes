import { test, expect } from '@playwright/test';
import { trackErrors, waitForBoot } from './helpers.js';

const screenName = (page) => page.evaluate(() => window.__stAgnes.ui.current()?.name ?? null);

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
});

test('content warning shows on first launch only', async ({ page }) => {
  expect(await screenName(page)).toBe('warning');
  await page.keyboard.press('Enter');
  expect(await screenName(page)).toBe('menu');
  await page.reload();
  await waitForBoot(page);
  expect(await screenName(page)).toBe('menu');
});

test('warning language switch changes the game language', async ({ page }) => {
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowRight');
  expect(await page.evaluate(() => window.__stAgnes.settings.get('language'))).toBe('el');
  expect(await page.evaluate(() => window.__stAgnes.i18n.t('warning.continue'))).toBe('ΣΥΝΕΧΕΙΑ');
});

test('warning SETTINGS opens settings and ESC returns to the menu', async ({ page }) => {
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  expect(await screenName(page)).toBe('settings');
  await page.keyboard.press('Escape');
  expect(await screenName(page)).toBe('menu');
});

test('menu: PLAY starts the game, ESC pauses back to the menu, ESC resumes', async ({ page }) => {
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => window.__stAgnes.mode)).toBe('playing');
  expect(await screenName(page)).toBeNull();
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => window.__stAgnes.mode)).toBe('ui');
  expect(await screenName(page)).toBe('menu');
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => window.__stAgnes.mode)).toBe('playing');
});

test('menu: items not built yet do nothing', async ({ page }) => {
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  expect(await screenName(page)).toBe('menu');
});

test('settings: change values with the keyboard and the mouse', async ({ page }) => {
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  expect(await screenName(page)).toBe('settings');
  await page.keyboard.press('ArrowRight'); // language
  expect(await page.evaluate(() => window.__stAgnes.settings.get('language'))).toBe('el');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter'); // comfort mode on
  const effects = await page.evaluate(() => window.__stAgnes.settings.all());
  expect(effects.comfortMode && effects.reduceEffects && effects.flickerOff).toBe(true);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab'); // video tab
  const box = await page.locator('canvas#game').boundingBox();
  const at = (x, y) => [box.x + (x / 480) * box.width, box.y + (y / 270) * box.height];
  await page.mouse.click(...at(462, 70)); // FOV ▶
  expect(await page.evaluate(() => window.__stAgnes.settings.get('fov'))).toBe(75);
});

test('settings: rebind a key, then reset keys', async ({ page }) => {
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.keyboard.press('KeyI');
  let keys = await page.evaluate(() => window.__stAgnes.settings.get('keys'));
  expect(keys.forward).toBe('KeyI');
  for (let i = 0; i < 15; i++) await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  keys = await page.evaluate(() => window.__stAgnes.settings.get('keys'));
  expect(keys.forward).toBe('KeyW');
});

test('every screen draws in both languages without errors', async ({ page }) => {
  const errors = trackErrors(page);
  for (const lang of ['en', 'el']) {
    await page.evaluate(async (l) => {
      const game = window.__stAgnes;
      game.settings.set('language', l);
      for (const name of ['warning', 'menu', 'settings']) {
        game.ui.open(name);
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
    }, lang);
  }
  expect(errors).toEqual([]);
});
