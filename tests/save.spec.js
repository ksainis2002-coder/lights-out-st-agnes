import { test, expect } from '@playwright/test';
import { createStore, memoryStorage } from '../src/save/storage.js';
import { createSaves, SAVE_VERSION } from '../src/save/saves.js';
import { migrate, NewerVersionError } from '../src/save/migrate.js';

const sampleState = { wing: 'dorms', player: { pos: [1, 0, 2], health: 3 }, flags: { metTommy: true } };

test('save and load round trip in every slot', () => {
  const saves = createSaves(createStore(memoryStorage()));
  for (const slot of ['slot1', 'slot2', 'slot3', 'auto']) {
    saves.save(slot, sampleState, { wing: 'dorms', playTime: 60 });
    const loaded = saves.load(slot);
    expect(loaded.version).toBe(SAVE_VERSION);
    expect(loaded.state).toEqual(sampleState);
    expect(loaded.meta).toEqual({ wing: 'dorms', playTime: 60 });
  }
});

test('empty slots load as null and are listed as empty', () => {
  const saves = createSaves(createStore(memoryStorage()));
  expect(saves.load('slot2')).toBeNull();
  saves.autosave(sampleState, { wing: 'dorms' });
  const list = saves.list();
  expect(list.map((s) => s.empty)).toEqual([true, true, true, false]);
});

test('unknown slots are refused', () => {
  const saves = createSaves(createStore(memoryStorage()));
  expect(() => saves.save('slot9', sampleState)).toThrow();
});

test('a corrupted save falls back to the previous good copy', () => {
  const storage = memoryStorage();
  const saves = createSaves(createStore(storage));
  saves.save('slot1', { ...sampleState, step: 1 });
  saves.save('slot1', { ...sampleState, step: 2 });
  storage.setItem('st-agnes:save.slot1', '{"version":1,"savedAt":"x","sta'); // half-written
  expect(saves.load('slot1').state.step).toBe(1);
});

test('migration chain upgrades an old save step by step', () => {
  // A pretend history: v1 stored hp, v2 renamed it to health, v3 added a sanity value.
  const migrations = {
    1: (d) => ({ ...d, state: { health: d.state.hp } }),
    2: (d) => ({ ...d, state: { ...d.state, sanity: 100 } }),
  };
  const storage = memoryStorage();
  const oldSave = { version: 1, savedAt: '2026-10-01T00:00:00.000Z', meta: {}, state: { hp: 2 } };
  storage.setItem('st-agnes:save.slot1', JSON.stringify(oldSave));
  const saves = createSaves(createStore(storage), { migrations, version: 3 });
  const loaded = saves.load('slot1');
  expect(loaded.version).toBe(3);
  expect(loaded.state).toEqual({ health: 2, sanity: 100 });
});

test('a save from a newer build is refused', () => {
  expect(() => migrate({ version: 99 }, {}, 1)).toThrow(NewerVersionError);
  const storage = memoryStorage();
  storage.setItem('st-agnes:save.slot1', JSON.stringify({ version: 99, savedAt: 'x', meta: {}, state: {} }));
  const saves = createSaves(createStore(storage));
  expect(() => saves.load('slot1')).toThrow(NewerVersionError);
});

test('every real migration has a step from each older version', async () => {
  const { MIGRATIONS } = await import('../src/save/saves.js');
  for (let v = 1; v < SAVE_VERSION; v++) expect(typeof MIGRATIONS[v]).toBe('function');
});

test('saves persist across a page reload in the browser', async ({ page }) => {
  await page.goto('./');
  await page.waitForFunction(() => window.__stAgnes?.booted);
  await page.evaluate(() => window.__stAgnes.saves.save('slot2', { wing: 'dorms', n: 7 }, { wing: 'dorms' }));
  await page.reload();
  await page.waitForFunction(() => window.__stAgnes?.booted);
  const state = await page.evaluate(() => window.__stAgnes.saves.load('slot2').state);
  expect(state).toEqual({ wing: 'dorms', n: 7 });
});
