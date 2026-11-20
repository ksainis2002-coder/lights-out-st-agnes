import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, lookAt, use, arrive, message } from './helpers.js';

// Wing 4, part B (0.5; the approved wing map; the wing 4 content sheet): the
// gate under the west wing stands open once St. Agnes is whole; the steps
// behind it go down to the basement, Nora's last call on the radio by them;
// the Founder's door down there stays locked (0.6).

const game = (page, fn, arg) => page.evaluate(fn, arg);
const heard = (page) => game(page, () => window.__stAgnes.heard);

// A game after the chapel: St. Agnes whole, the basement open.
async function afterChapel(page, level, spawn, flags = ['agnes_whole', 'basement_open']) {
  await game(page, ({ level, spawn, flags }) => {
    const g = window.__stAgnes;
    g.newGame();
    g.intro.finish();
    ['wing_school_done', 'wing_wards_done', 'tool_flashlight', ...flags].forEach((name) => g.progress.setFlag(name));
    g.heard = [];
    g.events.on('subtitle.shown', ({ key, speaker }) => g.heard.push(speaker ? `${speaker}: ${key}` : key));
    g.loadLevel(level, spawn);
  }, { level, spawn, flags });
}

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => (window.__stAgnes.realTime = false)); // time moves only by advance()
});

test('once she is whole the west wing gate stands open; the steps go down to the basement and back up', async ({ page }) => {
  const errors = trackErrors(page);
  await afterChapel(page, 'wards_ground', 'courtyard_door');
  expect(await message(page)).toBe('msg.basementGateOpen');
  expect(await game(page, () => window.__stAgnes.world.level.doorAt(7, 10).open)).toBe(true);

  expect(await lookAt(page, [7.5, 11.6], [7.5, 12.6, 0.8])).toBe('prompt.stairsDown');
  await use(page);
  expect(await arrive(page)).toBe('basement');
  expect(await game(page, () => window.__stAgnes.player.state.yaw)).toBeCloseTo(Math.PI, 2); // facing the corridor

  expect(await lookAt(page, [2.5, 4.4], [2.5, 3.4, 0.9])).toBe('prompt.stairsUp');
  await use(page);
  expect(await arrive(page)).toBe('wards_ground');
  const at = await game(page, () => {
    const g = window.__stAgnes;
    return [g.player.state.position.x / g.world.level.cellSize, g.player.state.position.z / g.world.level.cellSize];
  });
  expect(at[0]).toBeCloseTo(7.5, 1);
  expect(at[1]).toBeCloseTo(12.2, 1);
  expect(errors).toEqual([]);
});

test('before she is whole the gate stays shut, and a gate you shut stays shut', async ({ page }) => {
  await afterChapel(page, 'wards_ground', 'courtyard_door', []);
  expect(await game(page, () => window.__stAgnes.world.level.doorAt(7, 10).open)).toBe(false);

  await afterChapel(page, 'wards_ground', 'courtyard_door');
  await game(page, () => {
    const g = window.__stAgnes;
    g.progress.setOpen('ward_basement', false); // you closed it behind you
    g.loadLevel('wards_ground', 'courtyard_door');
  });
  expect(await game(page, () => window.__stAgnes.world.level.doorAt(7, 10).open)).toBe(false);
});

test("Nora's last call on the radio by the steps, then the hiss", async ({ page }) => {
  await afterChapel(page, 'wards_ground', 'basement');
  await game(page, () => window.__stAgnes.advance(9));
  expect(await heard(page)).toEqual(['nora: nora.basement', 'caption.radioDies']);
  await game(page, () => window.__stAgnes.advance(10));
  expect(await heard(page)).toHaveLength(2); // once only
});

test("the Founder's door: locked, no handle, someone humming behind it", async ({ page }) => {
  const errors = trackErrors(page);
  await afterChapel(page, 'basement', 'stairs');
  await lookAt(page, [20.5, 2.6], [20.5, 1.5, 1.2]);
  await use(page);
  expect(await message(page)).toBe('msg.foundersDoor');
  expect(await game(page, () => window.__stAgnes.world.level.doorAt(20, 1).open)).toBe(false);
  expect(errors).toEqual([]);
});

// Owner 2026-11-20: the boiler room's and the morgue's lamps steady you (light lifts sanity back
// to 60 there, as the lamps upstairs do); the corridor's dim bulbs do not.
test("the boiler room's and the morgue's lamps steady you; the corridor's dim bulbs do not", async ({ page }) => {
  const errors = trackErrors(page);
  await afterChapel(page, 'basement', 'stairs');
  const after5s = (spot) => game(page, (spot) => {
    const g = window.__stAgnes;
    const size = g.world.level.cellSize;
    Object.assign(g.player.state.position, { x: spot[0] * size, z: spot[1] * size });
    g.world.flashlight.setOn(true);
    g.sanity.set(40);
    g.advance(5);
    return g.sanity.value();
  }, spot);
  expect(await after5s([6.9, 13.0])).toBeGreaterThan(40); // in the boiler room, by its lamp
  expect(await after5s([13.4, 12.6])).toBeGreaterThan(40); // in the morgue, under its lamp
  expect(await after5s([10.5, 8.5])).toBeLessThan(40); // in the cold corridor
  expect(errors).toEqual([]);
});

