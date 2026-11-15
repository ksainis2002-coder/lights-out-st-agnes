import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, lookAt, use, load } from './helpers.js';

// Wing 3, part A2: Sister M. (ai/nun.js), the ward lamps, hiding under a bed
// and Edith's warnings (design 0.4, the content sheet; owner picks 2026-11-15).

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => {
    const game = window.__stAgnes;
    game.play();
    game.progress.setFlag('tool_flashlight');
  });
});

// Her round has begun (the Ward A set piece is over): the level again, with her in it.
const walking = async (page) => {
  await page.evaluate(() => {
    const { progress } = window.__stAgnes;
    ['nun_walking', 'lamp_out_ward_a_1', 'lamp_out_ward_a_2', 'lamp_out_ward_a_3', 'edith_met'].forEach((flag) => progress.setFlag(flag));
  });
  await load(page, 'wards_ground', 'courtyard_door');
};

// Puts you and her in the corridor (cells), your light on or off; runs the game; reports.
const meet = (page, { you, her, light, seconds, comfort = false }) => page.evaluate(({ you, her, light, seconds, comfort }) => {
  const game = window.__stAgnes;
  const size = game.world.level.cellSize;
  game.settings.set('comfortMode', comfort);
  const lines = [];
  const events = [];
  game.events.on('subtitle.shown', (line) => lines.push(line.key));
  game.events.on('nun.catch', ({ how }) => events.push(how));
  Object.assign(game.player.state.position, { x: you[0] * size, z: you[1] * size });
  game.nun.moveTo(her[0] * size, her[1] * size);
  game.world.flashlight.setOn(light);
  const start = game.nun.state();
  const modes = [];
  let caughtAt = null;
  for (let t = 0; t < seconds; t += 0.1) {
    game.advance(0.1);
    modes.push(game.nun.state().mode);
    if (caughtAt === null && game.collapse.active()) caughtAt = t;
  }
  const end = game.nun.state();
  const gap = (s) => Math.hypot(s.x - you[0] * size, s.z - you[1] * size);
  return { lines, events, modes, caughtAt, closer: gap(start) - gap(end) };
}, { you, her, light, seconds, comfort });

test('her first round: Ward A\'s lamps go out one by one, she cannot catch you yet, then she walks', async ({ page }) => {
  const errors = trackErrors(page);
  await load(page, 'wards_ground', 'courtyard_door');
  const result = await page.evaluate(() => {
    const game = window.__stAgnes;
    const size = game.world.level.cellSize;
    const before = { active: game.nun.state().active, lit: game.lamps.lit().length };
    Object.assign(game.player.state.position, { x: 17.5 * size, z: 5.5 * size }); // just inside Ward A's east door
    game.world.flashlight.setOn(true);
    game.advance(0.1);
    const started = game.nun.state().mode;
    const out = [];
    game.events.on('lamp.out', ({ id }) => out.push(id));
    let collapsed = false;
    for (let t = 0; t < 60 && !game.progress.hasFlag('nun_walking'); t += 0.1) {
      game.advance(0.1);
      collapsed = collapsed || game.collapse.active();
    }
    return { before, started, out, collapsed, walking: game.progress.hasFlag('nun_walking'), mode: game.nun.state().mode };
  });
  expect(result.before).toEqual({ active: false, lit: 3 });
  expect(result.started).toBe('intro');
  expect(result.out).toEqual(['ward_a_1', 'ward_a_2', 'ward_a_3']);
  expect(result.collapsed).toBe(false);
  expect(result.walking).toBe(true);
  expect(errors).toEqual([]);
});

test('she sees your light, warns for 2 s before she comes, and loses you when it goes out', async ({ page }) => {
  await walking(page);
  const lit = await meet(page, { you: [30, 9], her: [22, 9], light: true, seconds: 4 });
  expect(lit.lines[0]).toBe('nun.lightsOut');
  expect(lit.modes.slice(0, 18).every((mode) => mode === 'warning')).toBe(true); // 1.8 s in: still only the warning
  expect(lit.modes.at(-1)).toBe('chasing');
  expect(lit.closer).toBeGreaterThan(1);
  expect(lit.caughtAt).toBe(null);

  const dark = await meet(page, { you: [30, 9], her: [24, 9], light: false, seconds: 3 });
  expect(dark.lines).toContain('nun.whoHasALight');
  expect(dark.modes).not.toContain('warning');
  expect(dark.caughtAt).toBe(null);
});

test('with your light on she catches you, never before her 2 s warning', async ({ page }) => {
  await walking(page);
  const normal = await meet(page, { you: [30, 9], her: [28, 9], light: true, seconds: 6 });
  expect(normal.events).toEqual(['light']);
  expect(normal.caughtAt).toBeGreaterThan(2);
  expect(normal.caughtAt).toBeLessThan(3.5);
});

test('comfort mode: a longer warning (3.5 s) and a slower walk before the same catch', async ({ page }) => {
  await walking(page);
  const comfort = await meet(page, { you: [30, 9], her: [28, 9], light: true, seconds: 9, comfort: true });
  expect(comfort.events).toEqual(['light']);
  expect(comfort.caughtAt).toBeGreaterThan(3.5);
});

test('in the dark she walks past, but walking into her is a catch', async ({ page }) => {
  await walking(page);
  const aside = await meet(page, { you: [30.5, 8.3], her: [28.5, 9.7], light: false, seconds: 4 });
  expect(aside.caughtAt).toBe(null);
  const bumped = await meet(page, { you: [30.5, 9], her: [30.9, 9], light: false, seconds: 1 });
  expect(bumped.events).toEqual(['touch']);
});

test('under a bed: your light goes off and she can neither see nor touch you', async ({ page }) => {
  await walking(page);
  expect(await lookAt(page, [9.9, 2.3], [8.95, 1.87, 0.45])).toBe('prompt.hideUnderBed');
  await page.evaluate(() => window.__stAgnes.world.flashlight.setOn(true));
  await use(page);
  const hidden = await page.evaluate(() => {
    const game = window.__stAgnes;
    const size = game.world.level.cellSize;
    const state = { hiding: game.hiding.active(), light: game.world.flashlight.isOn(), prompt: game.hiding.way.prompt().key };
    game.nun.moveTo(9.6 * size, 2.3 * size); // right beside the bed
    let collapsed = false;
    for (let t = 0; t < 5; t += 0.1) {
      game.advance(0.1);
      collapsed = collapsed || game.collapse.active();
    }
    game.nun.moveTo(30 * size, 9 * size);
    return { ...state, collapsed, eye: game.world.camera.position.y };
  });
  expect(hidden).toMatchObject({ hiding: true, light: false, prompt: 'prompt.comeOut', collapsed: false });
  expect(hidden.eye).toBeLessThan(0.4);
  await use(page);
  expect(await page.evaluate(() => window.__stAgnes.hiding.active())).toBe(false);
});

test('the nurses\' station is not on her way: she never routes into it', async ({ page }) => {
  await walking(page);
  const reach = await page.evaluate(() => {
    const game = window.__stAgnes;
    const level = game.world.level;
    return { round: level.nun.round.length, station: level.nun.territory.includes('nurses_station') };
  });
  expect(reach.station).toBe(false);
  expect(reach.round).toBeGreaterThan(8);
});

test('Edith: two lines when you first come near, then she says where Sister M. is; her chart gives her name', async ({ page }) => {
  await page.evaluate(() => ['nun_walking', 'lamp_out_ward_a_1', 'lamp_out_ward_a_2', 'lamp_out_ward_a_3'].forEach((flag) => window.__stAgnes.progress.setFlag(flag)));
  await load(page, 'wards_ground', 'courtyard_door');
  const result = await page.evaluate(() => {
    const game = window.__stAgnes;
    const size = game.world.level.cellSize;
    const lines = [];
    game.events.on('subtitle.shown', (line) => lines.push(line.key));
    game.world.flashlight.setOn(false);
    game.nun.moveTo(2.5 * size, 9 * size); // the far end of the corridor
    Object.assign(game.player.state.position, { x: 24 * size, z: 4.4 * size });
    for (let t = 0; t < 11; t += 0.1) game.advance(0.1);
    const met = [...lines];
    game.nun.moveTo(14 * size, 9 * size); // nearer: within earshot of her beads
    for (let t = 0; t < 3; t += 0.1) game.advance(0.1);
    const unnamed = game.progress.hasFlag('name_edith');
    game.events.emit('document.read', { id: 'chart_carr' });
    return { met, lines, unnamed, named: game.progress.hasFlag('name_edith') };
  });
  expect(result.met.slice(0, 2)).toEqual(['edith.meet.1', 'edith.meet.2']);
  expect(result.lines.some((key) => key.startsWith('edith.warn.far') || key.startsWith('edith.warn.next'))).toBe(true);
  expect(result.unnamed).toBe(false);
  expect(result.named).toBe(true);
});
