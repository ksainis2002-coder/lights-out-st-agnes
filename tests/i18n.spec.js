import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createI18n, findMissingKeys } from '../src/i18n/i18n.js';

const load = (lang) => JSON.parse(readFileSync(new URL(`../src/i18n/${lang}.json`, import.meta.url), 'utf8'));
const tables = { en: load('en'), el: load('el') };

test('every key exists in both languages', () => {
  expect(findMissingKeys(tables)).toEqual({});
});

// Every text key a level's data names, so no level can show a raw key.
function levelTextKeys(level, items) {
  const keys = new Set([`journal.wing.${level.wing}`]);
  const add = (key) => key && keys.add(key);
  const addDocument = (id) => id && ['title', 'byline', 'body'].forEach((part) => add(`doc.${id}.${part}`));
  const addItem = (id) => id && add(`item.${items.includes(id) ? id : id.split('_')[0]}.name`);
  for (const door of level.doors ?? []) [door.lockedMessage, door.exit?.prompt].forEach(add);
  for (const prop of level.props ?? []) {
    [prop.prompt, prop.message, prop.lockedMessage, prop.options?.captionKey, ...(prop.options?.lineKeys ?? [])].forEach(add);
    addDocument(prop.document);
    addItem(prop.gives);
  }
  (level.documents ?? []).forEach((doc) => addDocument(doc.id));
  (level.pickups ?? []).forEach((pickup) => addItem(pickup.item));
  (level.maps ?? []).forEach((map) => [map.id, ...(map.with ?? [])].forEach((id) => add(`map.title.${id}`)));
  (level.maps ?? []).forEach((map) => add(map.detail));
  (level.ghosts ?? []).forEach((ghost) => add(ghost.line));
  (level.chalk?.hints ?? []).forEach((hint) => add(hint.text));
  (level.chalk?.taunts?.lines ?? []).forEach(add);
  return [...keys];
}

test('every text key named in level data exists in both languages', async () => {
  const { ITEMS } = await import('../src/items/catalog.js');
  const levels = ['test_corridor', 'patient_room', 'orphanage_wing', 'grounds', 'school_ground', 'school_upper'];
  for (const id of levels) {
    const level = JSON.parse(readFileSync(new URL(`../src/levels/${id}.json`, import.meta.url), 'utf8'));
    for (const lang of ['en', 'el']) {
      const missing = levelTextKeys(level, Object.keys(ITEMS)).filter((key) => !(key in tables[lang]));
      expect(missing, `${id} (${lang})`).toEqual([]);
    }
  }
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
