import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { waitForBoot, trackErrors } from './helpers.js';
import { parseLevel } from '../src/levels/loader.js';
import { buildLevelMeshes } from '../src/levels/build.js';

// Wing 2, part A: the garden door out of wing 1, the courtyard and the
// school's ground floor (approved stills and plan, owner 2026-10-14).

// Stand on a spot (cells) and look at a point (cells for x/z, metres for y).
const lookAt = (page, stand, target) => page.evaluate(({ stand, target }) => {
  const game = window.__stAgnes;
  const size = game.world.level.cellSize;
  const s = { x: stand[0] * size, z: stand[1] * size };
  const t = { x: target[0] * size, y: target[2], z: target[1] * size };
  Object.assign(game.player.state.position, s);
  game.player.state.yaw = Math.atan2(-(t.x - s.x), -(t.z - s.z));
  game.player.state.pitch = Math.atan2(t.y - game.player.state.eyeHeight, Math.hypot(t.x - s.x, t.z - s.z));
  game.advance(1 / 30);
  return game.interaction.target()?.prompt()?.key ?? null;
}, { stand, target });
const use = (page) => page.evaluate(() => {
  window.__stAgnes.input.tap('use');
  window.__stAgnes.advance(0.3);
});
const arrive = (page) => page.evaluate(() => {
  const game = window.__stAgnes;
  for (let i = 0; i < 60 && game.isTravelling(); i++) game.advance(0.05);
  return game.world.level.id;
});
const message = (page) => page.evaluate(() => window.__stAgnes.messages.current()?.key ?? null);
const load = (page, level, spawn) => page.evaluate(({ level, spawn }) => window.__stAgnes.loadLevel(level, spawn) && null, { level, spawn });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => window.__stAgnes.play());
});

test('the garden door stays locked until wing 1 is done, then leads out to the courtyard', async ({ page }) => {
  await load(page, 'orphanage_wing', 'landing');
  await page.evaluate(() => window.__stAgnes.world.level.ghosts.forEach((g) => window.__stAgnes.progress.setFlag(`ghost_${g.id}`)));
  const door = [[1.5, 12.3], [1.5, 13.5, 1.2]];
  expect(await lookAt(page, ...door)).toBe('prompt.locked');
  await use(page);
  expect(await message(page)).toBe('msg.gardenDoorLocked');

  // The statue piece, Tommy's horse and his file page: wing 1 is done.
  await page.evaluate(() => {
    const { progress, events } = window.__stAgnes;
    progress.take('quiet_statue');
    progress.take('quiet_horse');
    progress.read('hale_file_1');
    events.emit('document.read', { id: 'hale_file_1' });
  });
  expect(await page.evaluate(() => window.__stAgnes.progress.hasFlag('wing_orphanage_done'))).toBe(true);
  expect(await lookAt(page, ...door)).toBe('prompt.toCourtyard');
  await use(page);
  expect(await arrive(page)).toBe('grounds');

  // And back in through the same door.
  expect(await lookAt(page, [2.4, 12.5], [1, 12.5, 1.2])).toBe('prompt.goInside');
  await use(page);
  expect(await arrive(page)).toBe('orphanage_wing');
});

test('courtyard: into the school and out again; the chapel, the chains and the cemetery gate stay shut', async ({ page }) => {
  await load(page, 'grounds', 'garden_door');
  expect(await lookAt(page, [19.6, 15.5], [21, 15.5, 1.2])).toBe('prompt.toSchool');
  await use(page);
  expect(await arrive(page)).toBe('school_ground');
  expect(await lookAt(page, [30.5, 17.6], [30.5, 19, 1.2])).toBe('prompt.toCourtyard');
  await use(page);
  expect(await arrive(page)).toBe('grounds');

  const lines = [
    [[6.5, 19.7], [6.5, 21, 1.2], 'prompt.keyhole', 'msg.chapelKeyhole'],
    [[2.4, 18.5], [1, 18.5, 1.2], 'prompt.open', 'msg.westWingChained'],
    [[16.5, 20.2], [16.5, 21.5, 1.2], 'prompt.locked', 'msg.frontGateChained'],
  ];
  for (const [stand, target, prompt, line] of lines) {
    expect(await lookAt(page, stand, target)).toBe(prompt);
    await use(page);
    expect(await message(page)).toBe(line);
    expect(await page.evaluate(() => window.__stAgnes.world.level.id)).toBe('grounds');
  }
  expect(await lookAt(page, [10.5, 10.8], [10.5, 9.5, 1.2])).toBe('prompt.locked');
});

test('the stairs up say "Not yet" until the first floor is built', async ({ page }) => {
  await load(page, 'school_ground', 'front_door');
  expect(await lookAt(page, [28.6, 18.7], [27.67, 18.33, 1.0])).toBe('prompt.notYet');
  await use(page);
  expect(await arrive(page)).toBe('school_ground');
  expect(await lookAt(page, [27.0, 10.4], [27.0, 9.0, 1.0])).toBe('prompt.notYet');
});

test('the plan on the hall notice board adds the ground floor and the grounds to the journal', async ({ page }) => {
  const errors = trackErrors(page);
  await load(page, 'school_ground', 'front_door');
  expect(await lookAt(page, [32.8, 17.7], [32.8, 18.94, 1.52])).toBe('prompt.takeMap');
  await use(page);
  expect(await page.evaluate(() => window.__stAgnes.journal.maps())).toEqual(['school_ground', 'grounds']);
  for (const language of ['en', 'el']) {
    await page.evaluate((language) => {
      const game = window.__stAgnes;
      game.settings.set('language', language);
      game.openScreen('journal', { tab: 'maps' });
    }, language);
    await page.waitForTimeout(150);
    await page.keyboard.press('Escape');
  }
  expect(errors).toEqual([]);
});

test('the entrance hall is twice as tall, with a strip of wall above its arches', () => {
  const data = JSON.parse(readFileSync(new URL('../src/levels/school_ground.json', import.meta.url), 'utf8'));
  const level = parseLevel(data);
  expect(level.heightAt(30, 15)).toBe(6);
  expect(level.heightAt(20, 11)).toBe(3.4);
  expect(level.heightAt(18, 4)).toBe(5.2);
  const textures = new Proxy({}, { get: () => new THREE.Texture() });
  const meshes = buildLevelMeshes(level, textures);
  // Above the arches (row 12, cols 29–31): a face from 3.4 m up to 6 m on the corridor side.
  const size = level.cellSize;
  let found = false;
  meshes.traverse((mesh) => {
    if (!mesh.isMesh) return;
    const p = mesh.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const [x, y, z] = [p.getX(i), p.getY(i), p.getZ(i)];
      if (Math.abs(z - 12 * size) < 1e-6 && x > 29 * size && x < 32 * size && Math.abs(y - 6) < 1e-6) found = true;
    }
  });
  expect(found).toBe(true);
});
