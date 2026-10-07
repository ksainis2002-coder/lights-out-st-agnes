import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createI18n, findMissingKeys } from '../src/i18n/i18n.js';

const load = (lang) => JSON.parse(readFileSync(new URL(`../src/i18n/${lang}.json`, import.meta.url), 'utf8'));
const tables = { en: load('en'), el: load('el') };

test('every key exists in both languages', () => {
  expect(findMissingKeys(tables)).toEqual({});
});

test('t() looks up, switches language and fills placeholders', () => {
  const i18n = createI18n({ en: { a: 'Slot {n}', b: 'only en' }, el: { a: 'Θέση {n}' } });
  expect(i18n.t('a', { n: 2 })).toBe('Slot 2');
  i18n.setLanguage('el');
  expect(i18n.t('a', { n: 2 })).toBe('Θέση 2');
  expect(i18n.t('b')).toBe('only en');
  expect(i18n.t('nope')).toBe('nope');
});

test('both languages render in the browser', async ({ page }) => {
  await page.goto('./');
  await page.waitForFunction(() => window.__stAgnes?.booted);
  for (const lang of ['en', 'el']) {
    const title = await page.evaluate((l) => {
      window.__stAgnes.i18n.setLanguage(l);
      return window.__stAgnes.i18n.t('warning.title');
    }, lang);
    expect(title).toBe(tables[lang]['warning.title']);
  }
});
