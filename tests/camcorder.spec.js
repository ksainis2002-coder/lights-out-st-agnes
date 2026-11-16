import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, load } from './helpers.js';
import { createSettings, DEFAULT_KEYS, SETTINGS_VERSION } from '../src/save/settings.js';
import { createStore, memoryStorage } from '../src/save/storage.js';

// Nora's camcorder (player/camcorder.js; approved still camcorder_night,
// owner picks 2026-11-15): C raises it, N is the night view, the right mouse
// button is the flash. Found upstairs in the west wing (part B); here it is
// given by its flag.

const game = (page, fn, arg) => page.evaluate(fn, arg);
const press = (page, action, seconds = 0.1) => game(page, ({ action, seconds }) => {
  const g = window.__stAgnes;
  g.input.tap(action);
  g.advance(seconds);
  const c = g.camcorder;
  return { raised: c.raised(), night: c.nightOn(), battery: c.battery(), ready: c.flashReady(), light: g.world.flashlight.isOn(), fx: g.pipeline.fx.nightVision };
}, { action, seconds });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => {
    const g = window.__stAgnes;
    g.play();
    ['tool_flashlight', 'nun_walking', 'lamp_out_ward_a_1', 'lamp_out_ward_a_2', 'lamp_out_ward_a_3', 'edith_met'].forEach((flag) => g.progress.setFlag(flag));
  });
  await load(page, 'wards_ground', 'courtyard_door');
});

test('without the camcorder its keys do nothing', async ({ page }) => {
  expect(await press(page, 'camcorder')).toMatchObject({ raised: false, fx: 0 });
  expect(await press(page, 'nightView')).toMatchObject({ night: false });
});

test('C raises it, N turns the night view on and your flashlight off; it runs its battery down', async ({ page }) => {
  const errors = trackErrors(page);
  await game(page, () => {
    window.__stAgnes.progress.setFlag('tool_camcorder');
    window.__stAgnes.world.flashlight.setOn(true);
  });
  expect(await press(page, 'camcorder')).toMatchObject({ raised: true, night: false, light: true, fx: 0 });
  const night = await press(page, 'nightView');
  expect(night).toMatchObject({ night: true, light: false, fx: 1 });
  expect(night.battery).toBeLessThanOrEqual(50); // half gone when found
  const later = await press(page, 'holdBreath', 30); // any key: half a minute of night view
  expect(later.battery).toBeLessThan(night.battery - 4);
  expect(await press(page, 'camcorder')).toMatchObject({ raised: false, night: false, fx: 0 });

  // Flat: it will not come up, and says why.
  await game(page, () => window.__stAgnes.progress.setValue('camcorder_battery', 0));
  expect(await press(page, 'camcorder')).toMatchObject({ raised: false });
  expect(await game(page, () => window.__stAgnes.messages.current()?.key)).toBe('msg.camcorderDead');
  expect(errors).toEqual([]);
});

test('she cannot see the night view; the flash stuns her for 5 s and then needs 20 s to charge', async ({ page }) => {
  const result = await game(page, () => {
    const g = window.__stAgnes;
    const size = g.world.level.cellSize;
    g.progress.setFlag('tool_camcorder');
    g.world.flashlight.setOn(false);
    Object.assign(g.player.state.position, { x: 30 * size, z: 9 * size });
    g.player.state.yaw = Math.PI / 2; // facing west, down the corridor
    g.player.state.pitch = 0;
    g.nun.moveTo(26 * size, 9 * size);
    g.input.tap('camcorder');
    g.advance(0.1);
    g.input.tap('nightView');
    g.advance(1);
    const unseen = { sees: g.nun.state().sees, mode: g.nun.state().mode };
    g.input.tap('flash');
    g.advance(0.1);
    const flashed = { stunned: g.nun.state().stunned, ready: g.camcorder.flashReady(), at: g.nun.state().x };
    g.advance(4);
    const held = { stunned: g.nun.state().stunned, moved: Math.abs(g.nun.state().x - flashed.at) };
    Object.assign(g.player.state.position, { x: 35.5 * size, z: 3 * size }); // out of her way, in the station
    g.advance(2);
    const after = g.nun.state().stunned;
    g.input.tap('flash');
    g.advance(0.1);
    const second = g.nun.state().stunned; // still charging: nothing
    g.advance(15);
    return { unseen, flashed, held, after, second, ready: g.camcorder.flashReady(), collapsed: g.collapse.active() };
  });
  expect(result.unseen.sees).toBe(false);
  expect(result.flashed).toMatchObject({ stunned: true, ready: false });
  expect(result.held.stunned).toBe(true);
  expect(result.held.moved).toBeLessThan(0.01);
  expect(result.after).toBe(false);
  expect(result.second).toBe(false);
  expect(result.ready).toBe(true);
  expect(result.collapsed).toBe(false);
});

test('a spare battery feeds the camcorder while it is raised, the flashlight otherwise', async ({ page }) => {
  const result = await game(page, () => {
    const g = window.__stAgnes;
    g.progress.setFlag('tool_camcorder');
    g.inventory.add('battery');
    g.inventory.add('battery');
    g.input.tap('camcorder');
    g.advance(0.1);
    const before = g.camcorder.battery();
    g.input.tap('battery');
    g.advance(0.1);
    const fed = { camcorder: g.camcorder.battery(), left: g.inventory.items().length };
    g.input.tap('battery'); // already full: the second one stays in the pocket
    g.advance(0.1);
    return { before, fed, kept: g.inventory.items().length };
  });
  expect(result.before).toBeLessThanOrEqual(50);
  expect(result.fed.camcorder).toBeGreaterThan(99);
  expect(result.fed.left).toBe(1);
  expect(result.kept).toBe(1);
});

test('writing in the isolation cells shows only in the night view', async ({ page }) => {
  const shown = await game(page, () => {
    const g = window.__stAgnes;
    g.progress.setFlag('tool_camcorder');
    const states = [];
    const mark = { userData: { setShown: (value) => states.push(value) }, traverse(fn) { fn(this); }, children: [] };
    const real = g.world.levelGroup.traverse.bind(g.world.levelGroup);
    g.world.levelGroup.traverse = (fn) => { real(fn); fn(mark); };
    g.advance(0.1);
    g.input.tap('camcorder');
    g.advance(0.1);
    g.input.tap('nightView');
    g.advance(0.1);
    g.input.tap('nightView');
    g.advance(0.1);
    return states;
  });
  expect(shown).toEqual([true, false]); // shown with the night view, hidden again without it
});

test('settings saved before the camcorder get its two new keys', () => {
  const storage = memoryStorage();
  const keys = { ...DEFAULT_KEYS, flashlight: 'KeyG' };
  delete keys.nightView;
  delete keys.flash;
  storage.setItem('st-agnes:settings', JSON.stringify({ version: 3, values: { keys } }));
  const settings = createSettings(createStore(storage));
  expect(SETTINGS_VERSION).toBe(4);
  expect(settings.get('keys')).toMatchObject({ nightView: 'KeyN', flash: 'Mouse2', flashlight: 'KeyG', camcorder: 'KeyC' });
});
