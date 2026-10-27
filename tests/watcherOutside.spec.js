import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, arrive } from './helpers.js';

// The watcher outside (part C; approved stills watcher_storm, watcher_chapel):
// once the storm is on she comes into the cemetery by its gate behind you,
// her stone grinding there; she hunts the courtyard and the cemetery and
// follows you through the doors; after the lamb she stands at the chapel
// door, facing it, and hunts nowhere.

const game = (page, fn, arg) => page.evaluate(fn, arg);

// Awake and hunting the school's ground floor; you out in the grounds.
async function outside(page, { storm = true, level = 'grounds', spawn = 'school_door' } = {}) {
  await game(page, ({ storm, level, spawn }) => {
    const g = window.__stAgnes;
    g.newGame();
    g.intro.finish();
    ['watcher_awake', 'tool_flashlight', 'visited_entrance_hall', 'set_bell', 'set_roll_call', 'set_film'].forEach((flag) => g.progress.setFlag(flag));
    if (storm) g.progress.setFlag('puzzle_records');
    g.progress.setValue('watcher_floor', 'school_ground');
    g.world.flashlight.setOn(true);
    g.loadLevel(level, spawn);
    g.world.level.ghosts.forEach((event) => g.progress.setFlag(`ghost_${event.id}`)); // Maggie stays out of it
    g.heard = [];
    ['watcher.moved', 'watcher.outside', 'watcher.chapel', 'watcher.followed'].forEach((name) => g.events.on(name, () => g.heard.push(name)));
  }, { storm, level, spawn });
}

// Stand on a cell (x/z in cells) facing a yaw (degrees, 0 = north).
const stand = (page, cell, yaw) => game(page, ({ cell, yaw }) => {
  const g = window.__stAgnes;
  const size = g.world.level.cellSize;
  Object.assign(g.player.state.position, { x: cell[0] * size, z: cell[1] * size });
  g.player.state.yaw = (yaw * Math.PI) / 180;
  g.player.state.pitch = 0;
  g.advance(1 / 60);
}, { cell, yaw });
const wait = (page, seconds) => game(page, (seconds) => window.__stAgnes.advance(seconds), seconds);
const heard = (page) => game(page, () => window.__stAgnes.heard);
const her = (page) => game(page, () => {
  const g = window.__stAgnes;
  const at = g.watcher.position();
  const size = g.world.level.cellSize;
  return at ? { col: at.x / size, row: at.z / size, mode: g.watcher.state().mode, floor: g.progress.getValue('watcher_floor') } : null;
});
const near = (a, [col, row]) => Math.hypot(a.col - col, a.row - row) < 0.3;
const GATEWAY = [10.5, 10.4];
const CHAPEL = [6.5, 20.27];

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => (window.__stAgnes.realTime = false)); // time moves only by advance()
});

test('before the storm the cemetery is quiet: she keeps to the school', async ({ page }) => {
  await outside(page, { storm: false });
  await stand(page, [10.5, 4.0], 0);
  await wait(page, 3);
  expect(await her(page)).toBe(null);
});

test('in the storm she comes in by the gate behind you, her stone grinding there', async ({ page }) => {
  const errors = trackErrors(page);
  await outside(page);
  await stand(page, [10.5, 6.5], 180); // in the courtyard's view, then into the cemetery facing the far wall
  await stand(page, [10.5, 4.0], 0);
  await wait(page, 0.5);
  const at = await her(page);
  expect(near(at, GATEWAY)).toBe(true);
  expect(at.mode).toBe('hunting');
  expect(at.floor).toBe('grounds');
  expect(await heard(page)).toEqual(expect.arrayContaining(['watcher.moved', 'watcher.outside']));
  expect(errors).toEqual([]);
});

test('not while you watch the gate; the moment you turn away', async ({ page }) => {
  await outside(page);
  await stand(page, [10.5, 7.5], 180); // the beam on the gateway
  await wait(page, 1);
  expect(await her(page)).toBe(null);
  await stand(page, [10.5, 7.5], 0);
  await wait(page, 0.2);
  expect(near(await her(page), GATEWAY)).toBe(true);
});

test('after the lamb she stands at the chapel door, facing it, and hunts nowhere', async ({ page }) => {
  await outside(page);
  await stand(page, [10.5, 4.0], 0);
  await wait(page, 0.5);
  await game(page, () => window.__stAgnes.progress.take('agnes_lamb'));
  await wait(page, 0.2);
  const at = await her(page);
  expect(near(at, CHAPEL)).toBe(true);
  expect(at.mode).toBe('still');
  expect(at.floor).toBe('chapel');
  expect(await heard(page)).toContain('watcher.chapel');

  await game(page, () => window.__stAgnes.loadLevel('grounds', 'school_door'));
  expect((await her(page)).mode).toBe('still');
  await game(page, () => window.__stAgnes.loadLevel('school_ground', 'front_door'));
  expect(await her(page)).toBe(null);
});

test('in the storm she follows you out of the school, and not before it', async ({ page }) => {
  for (const storm of [false, true]) {
    await outside(page, { storm, level: 'school_ground', spawn: 'front_door' });
    const close = await game(page, () => {
      const g = window.__stAgnes;
      const p = g.player.state.position;
      g.watcher.moveTo(p.x - 4, p.z);
      g.travel('grounds', 'school_door');
      return true;
    });
    expect(close).toBe(true);
    expect(await arrive(page)).toBe('grounds');
    await stand(page, [16.0, 15.5], 90); // facing away from the school door, into the courtyard
    await wait(page, 20.05); // she comes out 20 s after you, unseen
    const at = await her(page);
    if (storm) expect(near(at, [19.0, 15.5]) && (await heard(page)).includes('watcher.followed')).toBe(true);
    else expect(at).toBe(null);
  }
});

test('through the railings you see her: she does not move while you watch', async ({ page }) => {
  await outside(page);
  await stand(page, [10.5, 4.0], 0);
  await wait(page, 0.5); // she is out
  await game(page, () => {
    const g = window.__stAgnes;
    g.watcher.moveTo(14.5 * 1.5, 11.0 * 1.5); // in the courtyard, the railings between you
  });
  await stand(page, [14.5, 7.0], 180); // in the cemetery, the beam on her through the bars
  await wait(page, 1);
  const state = await game(page, () => window.__stAgnes.watcher.state());
  expect(state.seen).toBe(true);
  expect(state.why).toBe('torch');
  expect(near(await her(page), [14.5, 11.0])).toBe(true);
});

test('a lightning flash lights her where she stands', async ({ page }) => {
  await outside(page);
  await stand(page, [10.5, 4.0], 0);
  await wait(page, 0.5);
  const lit = await game(page, () => {
    const g = window.__stAgnes;
    g.world.flashlight.setOn(false);
    const size = g.world.level.cellSize;
    g.watcher.moveTo(10.5 * size, 1.8 * size); // ahead of you in the dark, by the far wall
    g.advance(0.05);
    const before = g.watcher.state();
    g.storm.strike();
    g.advance(0.05);
    const during = g.watcher.state();
    return { before: before.why, during: during.why, seen: during.seen };
  });
  expect(lit).toEqual({ before: 'dark', during: 'lightning', seen: true });
});
