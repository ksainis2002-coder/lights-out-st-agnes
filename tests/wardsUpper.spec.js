import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { waitForBoot, trackErrors, lookAt, use, arrive, message, load } from './helpers.js';

// Wing 3, part B1: the west wing's first floor (approved stills, owner
// 2026-11-16): the stairs between the floors, the observation room with
// Nora's camcorder and tape, the treatment room behind its glass, the
// isolation cells, and Sister M. coming up and down after you.

const upper = JSON.parse(readFileSync(new URL('../src/levels/wards_upper.json', import.meta.url)));
const texts = Object.fromEntries(['en', 'el'].map((lang) => [lang, JSON.parse(readFileSync(new URL(`../src/i18n/${lang}.json`, import.meta.url)))]));
const game = (page, fn, arg) => page.evaluate(fn, arg);

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => {
    window.__stAgnes.play();
    window.__stAgnes.progress.setFlag('tutorial_use'); // its first-use line would cover the lines checked here
  });
});

test('the stairs lead up to the first floor and back down to their foot', async ({ page }) => {
  const errors = trackErrors(page);
  await load(page, 'wards_ground', 'courtyard_door');
  expect(await lookAt(page, [39, 6.2], [39, 5.6, 0.9])).toBe('prompt.stairsUp');
  await use(page);
  expect(await arrive(page)).toBe('wards_upper');
  expect(await lookAt(page, [29, 3.6], [29, 2.6, 0.8])).toBe('prompt.stairsDown');
  await use(page);
  expect(await arrive(page)).toBe('wards_ground');
  const at = await game(page, () => {
    const g = window.__stAgnes;
    return [g.player.state.position.x / g.world.level.cellSize, g.player.state.position.z / g.world.level.cellSize];
  });
  expect(at[0]).toBeGreaterThan(38);
  expect(at[1]).toBeLessThan(7); // in the stairs room, at the foot of the flight
  expect(errors).toEqual([]);
});

test('observation: Nora\'s camcorder (with its card) and her tape; the glass cannot be walked through', async ({ page }) => {
  await load(page, 'wards_upper', 'stairs');
  expect(await lookAt(page, [24.6, 5.0], [23.7, 4.3, 0.06])).toBe('prompt.take');
  await use(page);
  expect(await game(page, () => ({ tool: window.__stAgnes.progress.hasFlag('tool_camcorder'), screen: window.__stAgnes.ui.current()?.name ?? null })))
    .toEqual({ tool: true, screen: 'itemCard' });
  await page.keyboard.press('Enter');
  expect(await lookAt(page, [24.9, 5.3], [24.2, 4.7, 0.06])).toBe('prompt.take');
  await use(page);
  expect(await game(page, () => window.__stAgnes.inventory.has('nora_tape'))).toBe(true);

  const through = await game(page, () => {
    const g = window.__stAgnes;
    const size = g.world.level.cellSize;
    Object.assign(g.player.state.position, { x: 23.5 * size, z: 3.5 * size });
    return g.runBot({ id: 'glass', points: [{ cell: [20, 3] }] }, { maxSecondsPerPoint: 3 }).finished;
  });
  expect(through).toBe(false);
});

test('Sister M.\'s room and Dr. Venn\'s office stay shut, each with its line', async ({ page }) => {
  await load(page, 'wards_upper', 'stairs');
  for (const [stand, target, line] of [[[3.5, 7.6], [3.5, 6.5, 1.2], 'msg.sisterDoorLocked'], [[4.5, 8.4], [4.5, 9.5, 1.2], 'msg.vennDoorLocked']]) {
    expect(await lookAt(page, stand, target)).toBe('prompt.locked');
    await use(page);
    expect(await message(page)).toBe(line);
  }
});

test('she follows you between floors: 30 s after you, her beads on the stairs first, and which floor she walks is kept', async ({ page }) => {
  const result = await game(page, () => {
    const g = window.__stAgnes;
    ['nun_walking', 'lamp_out_ward_a_1', 'lamp_out_ward_a_2', 'lamp_out_ward_a_3', 'edith_met', 'power_stairs'].forEach((flag) => g.progress.setFlag(flag));
    g.loadLevel('wards_ground', 'courtyard_door');
    g.world.flashlight.setOn(false);
    const below = g.nun.state().active;
    const beads = [];
    g.events.on('nun.onStairs', () => beads.push(g.nunFloors.following()));
    g.travel('wards_upper', 'stairs', null, 'stairs');
    for (let i = 0; i < 60 && g.isTravelling(); i++) g.advance(0.05);
    const size = g.world.level.cellSize;
    Object.assign(g.player.state.position, { x: 12 * size, z: 8 * size }); // down the corridor, away from the stairs
    const arrived = { level: g.world.level.id, here: g.nun.state().active };
    g.advance(24);
    const waiting = g.nun.state().active;
    g.advance(8);
    const came = { here: g.nun.state().active, floor: g.progress.getValue('nun_floor'), beads: beads.length };
    g.loadLevel('wards_ground', 'stairs'); // back down: she is still upstairs
    return { below, arrived, waiting, came, left: g.nun.state().active, following: g.nunFloors.following() !== null };
  });
  expect(result.below).toBe(true);
  expect(result.arrived).toEqual({ level: 'wards_upper', here: false });
  expect(result.waiting).toBe(false);
  expect(result.came).toEqual({ here: true, floor: 'wards_upper', beads: 1 });
  expect(result.left).toBe(false);
  expect(result.following).toBe(true);
});

test('every room of the first floor has its name in both languages', () => {
  for (const lang of ['en', 'el']) {
    for (const room of upper.rooms) expect(texts[lang][`room.${room.id}`], `${lang} room.${room.id}`).toBeTruthy();
    for (const door of upper.doors) if (door.lockedMessage) expect(texts[lang][door.lockedMessage], `${lang} ${door.lockedMessage}`).toBeTruthy();
  }
});
