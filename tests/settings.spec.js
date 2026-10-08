import { test, expect } from '@playwright/test';
import { createStore, memoryStorage } from '../src/save/storage.js';
import { createSettings, DEFAULT_SETTINGS } from '../src/save/settings.js';

test('fresh settings use the defaults', () => {
  const settings = createSettings(createStore(memoryStorage()));
  expect(settings.all()).toEqual(DEFAULT_SETTINGS);
});

test('changed settings persist and invalid values are refused', () => {
  const store = createStore(memoryStorage());
  const settings = createSettings(store);
  settings.set('language', 'el');
  settings.set('flickerOff', true);
  expect(() => settings.set('fov', 500)).toThrow();
  expect(() => settings.set('difficulty', 'nightmare')).toThrow();
  const reloaded = createSettings(store);
  expect(reloaded.get('language')).toBe('el');
  expect(reloaded.get('flickerOff')).toBe(true);
  expect(reloaded.get('fov')).toBe(DEFAULT_SETTINGS.fov);
});

test('damaged stored values fall back to defaults one by one', () => {
  const storage = memoryStorage();
  const values = { language: 'el', fov: 'wide', volume: { music: 0.2, effects: 9 } };
  storage.setItem('st-agnes:settings', JSON.stringify({ version: 1, values }));
  const settings = createSettings(createStore(storage));
  expect(settings.get('language')).toBe('el');
  expect(settings.get('fov')).toBe(DEFAULT_SETTINGS.fov);
  expect(settings.get('volume')).toEqual({ music: 0.2, effects: 0.8, voices: 0.8 });
});

test('old settings versions migrate forward', () => {
  const storage = memoryStorage();
  storage.setItem('st-agnes:settings', JSON.stringify({ version: 1, values: { lang: 'el' } }));
  const migrations = { 1: (d) => ({ ...d, values: { language: d.values.lang } }) };
  const settings = createSettings(createStore(storage), { migrations, version: 2 });
  expect(settings.get('language')).toBe('el');
});

test('language setting drives the game language and survives reload', async ({ page }) => {
  await page.goto('./');
  await page.waitForFunction(() => window.__stAgnes?.booted);
  await page.evaluate(() => window.__stAgnes.settings.set('language', 'el'));
  expect(await page.evaluate(() => window.__stAgnes.i18n.getLanguage())).toBe('el');
  await page.reload();
  await page.waitForFunction(() => window.__stAgnes?.booted);
  expect(await page.evaluate(() => window.__stAgnes.i18n.t('warning.continue'))).toBe('ΣΥΝΕΧΕΙΑ');
});

test('comfort mode on also turns on reduce effects and flicker off, which stay editable', () => {
  const settings = createSettings(createStore(memoryStorage()));
  settings.set('comfortMode', true);
  expect(settings.get('reduceEffects')).toBe(true);
  expect(settings.get('flickerOff')).toBe(true);
  settings.set('flickerOff', false);
  expect(settings.get('flickerOff')).toBe(false);
  expect(settings.get('comfortMode')).toBe(true);
});
