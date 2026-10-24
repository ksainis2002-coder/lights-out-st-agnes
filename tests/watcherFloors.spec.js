import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, arrive } from './helpers.js';

// Wing 2, part B4: the watcher between floors (design 0.3): close behind you
// on the stairs, she follows about 20 s later, her grind on the stairs
// first; she only comes off them unseen; not close, she keeps to her floor.

const game = (page, fn, arg) => page.evaluate(fn, arg);

// An awake watcher downstairs, the flashlight on, nothing else going on.
async function awake(page) {
  await game(page, () => {
    const g = window.__stAgnes;
    g.newGame();
    g.intro.finish();
    ['watcher_awake', 'tool_flashlight', 'set_bell', 'set_roll_call', 'set_film'].forEach((flag) => g.progress.setFlag(flag));
    g.world.flashlight.setOn(true);
    g.loadLevel('school_ground', 'front_door');
    g.world.level.ghosts.forEach((event) => g.progress.setFlag(`ghost_${event.id}`)); // Maggie stays out of it
    g.heard = [];
    ['watcher.moved', 'watcher.followed'].forEach((name) => g.events.on(name, () => g.heard.push(name)));
  });
}

// Stand on a cell (x/z in cells) facing a yaw (degrees); put her on a cell.
const stand = (page, cell, yaw) => game(page, ({ cell, yaw }) => {
  const g = window.__stAgnes;
  const size = g.world.level.cellSize;
  Object.assign(g.player.state.position, { x: cell[0] * size, z: cell[1] * size });
  g.player.state.yaw = (yaw * Math.PI) / 180;
  g.player.state.pitch = 0;
  g.advance(1 / 60);
}, { cell, yaw });
const placeHer = (page, cell) => game(page, (cell) => {
  const g = window.__stAgnes;
  g.watcher.moveTo(cell[0] * g.world.level.cellSize, cell[1] * g.world.level.cellSize);
}, cell);
// Takes the stairs; what she did on the floor you left is forgotten.
const travel = async (page, level, spawn) => {
  await game(page, ({ level, spawn }) => window.__stAgnes.travel(level, spawn), { level, spawn });
  const there = await arrive(page);
  await game(page, () => (window.__stAgnes.heard = []));
  return there;
};
const wait = (page, seconds) => game(page, (seconds) => window.__stAgnes.advance(seconds), seconds);
const heard = (page) => game(page, () => window.__stAgnes.heard);
const her = (page) => game(page, () => {
  const g = window.__stAgnes;
  const at = g.watcher.position();
  const size = g.world.level.cellSize;
  return at ? { col: at.x / size, row: at.z / size, floor: g.progress.getValue('watcher_floor') } : null;
});

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => (window.__stAgnes.realTime = false)); // time moves only by advance()
});

test('close behind you, she follows you up: her grind on the stairs at 16 s, at their head from 20 s', async ({ page }) => {
  const errors = trackErrors(page);
  await awake(page);
  await stand(page, [28.6, 18.7], 90);
  await placeHer(page, [30.5, 16.0]); // a few metres off, in the hall
  expect(await travel(page, 'school_upper', 'main_stairs')).toBe('school_upper');
  expect(await her(page)).toBe(null);
  // Timed in one step: the game's own loop runs between test steps.
  const timeline = await game(page, () => {
    const g = window.__stAgnes;
    const size = g.world.level.cellSize;
    Object.assign(g.player.state.position, { x: 20.0 * size, z: 10.8 * size }); // down the corridor, facing away
    g.player.state.yaw = Math.PI / 2;
    g.heard = [];
    g.advance(15.5);
    const before = [...g.heard];
    g.advance(1);
    const grind = [...g.heard];
    g.advance(3.6);
    return { before, grind, after: [...g.heard] };
  });
  expect(timeline.before).toEqual([]);
  expect(timeline.grind).toEqual(['watcher.moved']); // the stone on the stairs
  expect(timeline.after).toContain('watcher.followed');
  const there = await her(page);
  expect(Math.hypot(there.col - 28.0, there.row - 12.5)).toBeLessThan(1.5);
  expect(there.floor).toBe('school_upper');
  expect(errors).toEqual([]);
});

test('far away when you take the stairs, she keeps to her floor; you find her there when you go back', async ({ page }) => {
  await awake(page);
  await stand(page, [28.6, 18.7], 90);
  await placeHer(page, [6.5, 2.0]); // in the library, far off
  expect(await travel(page, 'school_upper', 'main_stairs')).toBe('school_upper');
  await stand(page, [20.0, 10.8], 90);
  await wait(page, 25);
  expect(await heard(page)).toEqual([]);
  expect(await her(page)).toBe(null);
  expect(await travel(page, 'school_ground', 'main_stairs')).toBe('school_ground');
  expect(await her(page)).not.toBe(null); // her home floor, where she woke
});

test('she does not come off the stairs while you watch them, nor on top of you', async ({ page }) => {
  await awake(page);
  await stand(page, [28.6, 18.7], 90);
  await placeHer(page, [30.5, 16.0]);
  expect(await travel(page, 'school_upper', 'main_stairs')).toBe('school_upper');
  await stand(page, [28.0, 10.2], 180); // the stair head in the torchlight, 2.8 m off
  await wait(page, 22);
  expect(await heard(page)).not.toContain('watcher.followed');
  expect(await her(page)).toBe(null);
  await stand(page, [28.0, 10.2], 0); // look away
  await wait(page, 0.1);
  expect(await heard(page)).toContain('watcher.followed');
});
