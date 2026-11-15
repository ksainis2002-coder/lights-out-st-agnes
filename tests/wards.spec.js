import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { waitForBoot, trackErrors, lookAt, use, arrive, message, load } from './helpers.js';

// Wing 3, part A1: the west wing's door in the courtyard and its ground
// floor (approved stills and content sheet, owner 2026-11-15): the rooms,
// their papers, Nora's voice on the radios. No Sister M. and no puzzles yet.

const wards = JSON.parse(readFileSync(new URL('../src/levels/wards_ground.json', import.meta.url)));
const texts = Object.fromEntries(['en', 'el'].map((lang) => [lang, JSON.parse(readFileSync(new URL(`../src/i18n/${lang}.json`, import.meta.url)))]));

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => window.__stAgnes.play());
});

test('the west wing door is chained until the school is done, then opens on admissions, and leads back out', async ({ page }) => {
  const errors = trackErrors(page);
  const door = [[2.4, 18.5], [1, 18.5, 1.2]];
  await load(page, 'grounds', 'garden_door');
  expect(await lookAt(page, ...door)).toBe('prompt.open');
  await use(page);
  expect(await message(page)).toBe('msg.westWingChained');

  await page.evaluate(() => window.__stAgnes.progress.setFlag('wing_school_done'));
  await load(page, 'grounds', 'garden_door');
  expect(await lookAt(page, [2.2, 18.9], [1.55, 18.65, 0.1])).toBe('prompt.look');
  await use(page);
  expect(await message(page)).toBe('msg.chainCut');
  expect(await lookAt(page, ...door)).toBe('prompt.toWestWing');
  await use(page);
  expect(await arrive(page)).toBe('wards_ground');

  expect(await lookAt(page, [39.4, 13.5], [40.5, 13.5, 1.2])).toBe('prompt.toCourtyard');
  await use(page);
  expect(await arrive(page)).toBe('grounds');
  expect(errors).toEqual([]);
});

test('Nora speaks once on each radio as you come near, and her first words give her name', async ({ page }) => {
  await load(page, 'wards_ground', 'courtyard_door');
  const shown = await page.evaluate(() => {
    const game = window.__stAgnes;
    const keys = [];
    game.events.on('subtitle.shown', (line) => keys.push(line.key));
    const size = game.world.level.cellSize;
    game.advance(0.5);
    const before = keys.length;
    Object.assign(game.player.state.position, { x: 35.5 * size, z: 14 * size });
    for (let i = 0; i < 40; i++) game.advance(0.5);
    const first = [...keys];
    for (let i = 0; i < 20; i++) game.advance(0.5); // standing by it: it does not start again
    return { before, first, after: keys.length, named: game.progress.hasFlag('name_nora'), speaker: game.i18n.t('speaker.nora') };
  });
  expect(shown.before).toBe(0);
  expect(shown.first).toEqual(['nora.admissions.1', 'nora.admissions.2']);
  expect(shown.after).toBe(2);
  expect(shown.named).toBe(true);
});

test('the dispensary, the stairs and the basement stay shut, each with its line', async ({ page }) => {
  await load(page, 'wards_ground', 'courtyard_door');
  const doors = [
    [[30.5, 8.6], [30.5, 7.5, 1.2], 'msg.electricLockDead'],
    [[38.5, 8.6], [38.5, 7.5, 1.2], 'msg.stairsGateDead'],
    [[7.5, 9.4], [7.5, 10.5, 1.2], 'msg.basementGateLocked'],
  ];
  for (const [stand, target, line] of doors) {
    expect(await lookAt(page, stand, target)).toBe('prompt.locked');
    await use(page);
    expect(await message(page)).toBe(line);
  }
});

test('the nurses\' station has a tape recorder and a door home that brings you back', async ({ page }) => {
  await load(page, 'wards_ground', 'courtyard_door');
  expect(await lookAt(page, [35, 2.6], [34.8, 1.5, 0.85])).toBe('prompt.save');
  expect(await lookAt(page, [36.2, 5.5], [37, 5.5, 1.2])).toBe('prompt.goHome');
  await use(page);
  expect(await arrive(page)).toBe('patient_room');
});

test('every paper and radio line of the ground floor has its text in both languages', () => {
  for (const lang of ['en', 'el']) {
    for (const doc of wards.documents) {
      for (const part of ['title', 'byline', 'body']) expect(texts[lang][`doc.${doc.id}.${part}`], `${lang} doc.${doc.id}.${part}`).toBeTruthy();
      expect(texts[lang][`clue.read_${doc.id}`], `${lang} clue.read_${doc.id}`).toBeTruthy();
    }
    for (const radio of wards.radios) for (const line of radio.lines) expect(texts[lang][line], `${lang} ${line}`).toBeTruthy();
    for (const room of wards.rooms) expect(texts[lang][`room.${room.id}`], `${lang} room.${room.id}`).toBeTruthy();
    for (const room of wards.rooms) expect(texts[lang][`map.room.${room.id}`], `${lang} map.room.${room.id}`).toBeTruthy();
    expect(texts[lang]['map.title.wards_ground']).toBeTruthy();
  }
});

test('the ward\'s rule is painted in the game\'s language', async ({ page }) => {
  await load(page, 'wards_ground', 'courtyard_door');
  const written = await page.evaluate(() => {
    const game = window.__stAgnes;
    const lines = [];
    let found = null;
    game.world.scene.traverse((object) => { if (object.userData.prop?.id === 'lights_out_sign') found = object; });
    const write = found.userData.write;
    found.userData.write = (text) => { lines.push(text); write(text); };
    game.signs.write();
    game.settings.set('language', 'el');
    game.signs.write();
    return lines;
  });
  expect(written[0]).toEqual(['LIGHTS OUT', 'AT 8 P.M.']);
  expect(written[written.length - 1]).toEqual(['ΤΑ ΦΩΤΑ ΣΒΗΝΟΥΝ', 'ΣΤΙΣ 8 Μ.Μ.']);
});
