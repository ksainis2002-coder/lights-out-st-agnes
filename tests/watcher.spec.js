import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, load } from './helpers.js';

// Wing 2: the watcher (design 0.3 and scare rules §2, owner-confirmed): she
// moves only while unseen (on screen, not behind a wall, and lit), closed
// doors stop her, the other rooms are safe; at arm's reach a breath, then
// 1.5 s to look (comfort mode: 3 s and half speed) before the grab, the
// rewind and Maggie's line. No catch before her introduction in the library.

const game = (page, fn, arg) => page.evaluate(fn, arg);
// Put the player on a cell (x/z in cells) looking at a point, or along a yaw (degrees).
const stand = (page, cell, { at = null, yaw = 0 } = {}) => game(page, ({ cell, at, yaw }) => {
  const g = window.__stAgnes;
  const size = g.world.level.cellSize;
  const s = { x: cell[0] * size, z: cell[1] * size };
  Object.assign(g.player.state.position, s);
  g.player.state.yaw = at ? Math.atan2(-(at[0] * size - s.x), -(at[1] * size - s.z)) : (yaw * Math.PI) / 180;
  g.player.state.pitch = 0;
  g.advance(1 / 60);
}, { cell, at, yaw });
const placeHer = (page, cell) => game(page, (cell) => {
  const g = window.__stAgnes;
  const size = g.world.level.cellSize;
  g.watcher.moveTo(cell[0] * size, cell[1] * size);
}, cell);
const her = (page) => game(page, () => {
  const g = window.__stAgnes;
  const s = g.watcher.state();
  const size = g.world.level.cellSize;
  return { ...s, col: s.x / size, row: s.z / size };
});
const wait = (page, seconds) => game(page, (seconds) => window.__stAgnes.advance(seconds), seconds);
const collapse = (page) => game(page, () => ({ active: window.__stAgnes.collapse.active(), grabbing: window.__stAgnes.collapse.grabbing() }));
const moved = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// An awake watcher in the school, the flashlight on, nothing else going on.
async function awake(page, options = {}) {
  await game(page, (options) => {
    const g = window.__stAgnes;
    g.newGame();
    g.intro.finish();
    g.settings.set('comfortMode', options.comfort ?? false);
    g.progress.setFlag('watcher_awake');
    g.progress.setFlag('tool_flashlight');
    g.world.flashlight.setOn(true);
    g.loadLevel('school_ground', 'front_door');
    g.world.level.ghosts.forEach((event) => g.progress.setFlag(`ghost_${event.id}`)); // Maggie stays out of it
  }, options);
}

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  // The same moves inside the page, for timed checks: the game's own loop
  // runs between test steps, so a timed sequence runs in one step.
  await game(page, () => {
    const g = window.__stAgnes;
    const size = () => g.world.level.cellSize;
    window.__w = {
      stand(cell, { at = null, yaw = 0 } = {}) {
        const s = { x: cell[0] * size(), z: cell[1] * size() };
        Object.assign(g.player.state.position, s);
        g.player.state.yaw = at ? Math.atan2(-(at[0] * size() - s.x), -(at[1] * size() - s.z)) : (yaw * Math.PI) / 180;
        g.player.state.pitch = 0;
        g.advance(1 / 60);
      },
      place: (cell) => g.watcher.moveTo(cell[0] * size(), cell[1] * size()),
      her: () => g.watcher.state(),
      moved: (a, b) => Math.hypot(a.x - b.x, a.z - b.z),
    };
  });
});

test.afterEach(async ({ page }) => {
  await game(page, () => window.__stAgnes.settings.set('comfortMode', false));
});

test('she never moves while you keep her in the light, and slides at 2.6 m/s once you look away', async ({ page }) => {
  await awake(page);
  await stand(page, [20, 10.6], { yaw: 90 }); // the corridor, looking west
  await placeHer(page, [14, 10.6]);
  await game(page, () => {
    window.__grinds = 0;
    window.__stAgnes.events.on('watcher.moved', () => (window.__grinds += 1));
  });
  const start = await her(page);
  await wait(page, 2);
  const still = await her(page);
  expect(still).toMatchObject({ seen: true, why: 'torch' });
  expect(moved(start, still)).toBe(0);

  const slid = await game(page, () => {
    const { stand, her, moved } = window.__w;
    const before = her();
    stand([20, 10.6], { yaw: -90 }); // turn your back
    window.__stAgnes.advance(1);
    return moved(before, her());
  });
  expect(slid).toBeGreaterThan(2.55); // 2.6 m in the second, plus a step
  expect(slid).toBeLessThan(2.7);
  expect(await game(page, () => window.__grinds)).toBeGreaterThan(0); // her stone grinds as she goes
});

test('in the dark she moves even while you face her', async ({ page }) => {
  await awake(page);
  const run = await game(page, () => {
    const g = window.__stAgnes;
    const { stand, place, her, moved } = window.__w;
    g.world.flashlight.setOn(false);
    stand([20, 10.6], { yaw: 90 });
    place([14, 10.6]);
    const start = her();
    g.advance(0.5);
    return { why: her().why, slid: moved(start, her()) };
  });
  expect(run.why).toBe('dark');
  expect(run.slid).toBeGreaterThan(1.2);
});

test('a closed door stops her; she waits outside until it opens', async ({ page }) => {
  await awake(page);
  await stand(page, [6.5, 6.0], { yaw: 0 }); // in the library, the door behind you shut
  await placeHer(page, [12, 10.6]);
  await wait(page, 6);
  const outside = await her(page);
  expect(outside.row).toBeGreaterThan(10); // still in the corridor
  expect(outside.warning).toBeNull();
  await game(page, () => {
    const g = window.__stAgnes;
    const door = g.world.level.doorAt(6, 9);
    door.open = true;
    g.progress.setOpen(door.id, true);
  });
  await wait(page, 4);
  const inside = await her(page);
  expect(inside.row).toBeLessThan(9); // in the library
});

test('at arm\'s reach she breathes, and you have 1.5 s to turn and look', async ({ page }) => {
  await awake(page);
  const run = await game(page, () => {
    const g = window.__stAgnes;
    const { stand, place, her } = window.__w;
    const out = {};
    let breaths = 0;
    g.events.on('watcher.breath', () => (breaths += 1));
    stand([20, 10.6], { yaw: -90 }); // looking east; she is right behind you
    place([19.1, 10.6]);
    g.advance(0.1);
    out.breaths = breaths;
    g.advance(1.0);
    out.at1s = g.collapse.active();
    stand([20, 10.6], { at: [19.1, 10.6] }); // turn round: she freezes, the breath stops
    out.frozen = her();
    g.advance(3);
    out.lookedFor3s = g.collapse.active();
    stand([20, 10.6], { yaw: -90 }); // look away again
    g.advance(1.4);
    out.at1_4s = g.collapse.active();
    g.advance(0.2);
    out.at1_6s = { active: g.collapse.active(), grabbing: g.collapse.grabbing() };
    return out;
  });
  expect(run.breaths).toBe(1);
  expect(run.at1s).toBe(false);
  expect(run.frozen).toMatchObject({ seen: true, warning: null });
  expect(run.lookedFor3s).toBe(false);
  expect(run.at1_4s).toBe(false);
  expect(run.at1_6s).toEqual({ active: true, grabbing: true });
});

test('comfort mode gives 3 s to turn and halves her speed, and skips the grab', async ({ page }) => {
  await awake(page, { comfort: true });
  const run = await game(page, () => {
    const g = window.__stAgnes;
    const { stand, place, her, moved } = window.__w;
    stand([20, 10.6], { yaw: -90 });
    place([12, 10.6]);
    const start = her();
    g.advance(1);
    const slid = moved(start, her());
    place([19.1, 10.6]);
    g.advance(2.5);
    const at2_5s = g.collapse.active();
    g.advance(0.7);
    return { slid, at2_5s, at3_2s: { active: g.collapse.active(), grabbing: g.collapse.grabbing() } };
  });
  expect(run.slid).toBeGreaterThan(1.25); // 1.3 m: half speed
  expect(run.slid).toBeLessThan(1.35);
  expect(run.at2_5s).toBe(false);
  expect(run.at3_2s).toEqual({ active: true, grabbing: false });
});

test('a catch rewinds you with Maggie\'s line: the first one first, then the others in turn', async ({ page }) => {
  await awake(page);
  const lines = [];
  for (let i = 0; i < 2; i++) {
    await stand(page, [20, 10.6], { yaw: -90 });
    await placeHer(page, [19.1, 10.6]);
    await wait(page, 1.7);
    expect((await collapse(page)).active).toBe(true);
    await wait(page, 6); // the grab, the faint, the rewind
    lines.push(await game(page, () => {
      const g = window.__stAgnes;
      return { key: g.subtitles.current()?.key, speaker: g.subtitles.speaker(), level: g.world.level.id };
    }));
  }
  expect(lines).toEqual([
    { key: 'watcher.catch.1', speaker: 'a girl', level: 'school_ground' },
    { key: 'watcher.catch.2', speaker: 'a girl', level: 'school_ground' },
  ]);
  // Back from the rewind she is far off, not on top of you.
  const p = await game(page, () => window.__stAgnes.player.state.position);
  const s = await her(page);
  expect(moved(p, s)).toBeGreaterThan(9);
});

test('she keeps out of the other rooms even with their doors open, and loses you after a while', async ({ page }) => {
  await awake(page);
  await game(page, () => {
    const g = window.__stAgnes;
    const door = g.world.level.doorAt(12, 12);
    door.open = true;
    g.progress.setOpen(door.id, true);
  });
  await stand(page, [12.5, 15.5], { yaw: 180 }); // in Classroom 1, back to the door
  await placeHer(page, [16, 10.6]);
  await wait(page, 8);
  const waiting = await her(page);
  expect(waiting.row).toBeLessThan(12); // in the corridor
  expect((await collapse(page)).active).toBe(false);
  await wait(page, 10);
  expect((await her(page)).lost).toBe(true);
});

test('no catch before her introduction: asleep in the library, she never moves', async ({ page }) => {
  await game(page, () => {
    const g = window.__stAgnes;
    g.newGame();
    g.intro.finish();
    g.loadLevel('school_ground', 'front_door');
  });
  const asleep = await her(page);
  expect(asleep.mode).toBe('asleep');
  await stand(page, [asleep.col, asleep.row + 0.9], { yaw: 180 }); // right by her, back turned
  await wait(page, 4);
  const still = await her(page);
  expect(moved(asleep, still)).toBe(0);
  expect((await collapse(page)).active).toBe(false);
});

test('her introduction: the library light dies, she is closer, Maggie warns you, then she hunts', async ({ page }) => {
  await game(page, () => {
    const g = window.__stAgnes;
    g.newGame();
    g.intro.finish();
    g.loadLevel('school_ground', 'front_door');
    g.progress.setFlag('puzzle_library');
  });
  const run = await game(page, () => {
    const g = window.__stAgnes;
    const { stand, her, moved } = window.__w;
    const asleep = her();
    const size = g.world.level.cellSize;
    stand([6.5, 7.6], { at: [asleep.x / size, asleep.z / size] }); // in the library, facing her
    const p = g.player.state.position;
    const out = { before: moved(p, asleep) };
    g.advance(0.6);
    out.fadeAt0_6s = g.pipeline.fx.fade;
    g.advance(1.0);
    out.after = moved(p, her());
    g.advance(1.2);
    out.fadeAt2_8s = g.pipeline.fx.fade;
    out.line = g.subtitles.current()?.key;
    out.mode = her().mode;
    g.advance(4.7);
    out.rhyme = g.subtitles.current();
    return out;
  });
  expect(run.fadeAt0_6s).toBeGreaterThan(0.5);
  expect(run.after).toBeLessThan(run.before - 1);
  expect(run.fadeAt2_8s).toBe(0);
  expect(run.line).toBe('maggie.library.still');
  expect(run.mode).toBe('hunting');
  expect(run.rhyme).toMatchObject({ key: 'rhyme.library.1', manner: 'singing' });
  await game(page, () => window.__stAgnes.advance(15));
  await stand(page, [8, 10.6], { yaw: -90 }); // out into the corridor
  await wait(page, 0.1);
  expect(await game(page, () => window.__stAgnes.subtitles.current()?.key)).toBe('maggie.library.leaving');
});

test('low sanity: your eyes blink now and then, and she can move in a blink', async ({ page }) => {
  await awake(page);
  await stand(page, [20, 10.6], { yaw: 90 });
  await placeHer(page, [14, 10.6]);
  const run = await game(page, () => {
    const g = window.__stAgnes;
    const { her, moved } = window.__w;
    g.sanity.set(40);
    const start = her();
    g.blink.now();
    g.advance(0.2);
    const inBlink = moved(start, her());
    g.advance(0.2);
    return { inBlink, seenAfter: her().seen };
  });
  expect(run.inBlink).toBeGreaterThan(0.3);
  expect(run.seenAfter).toBe(true);
});

test('the courtyard statue stands on the path until you have been inside the school', async ({ page }) => {
  const errors = trackErrors(page);
  await game(page, () => {
    const g = window.__stAgnes;
    g.newGame();
    g.intro.finish();
  });
  await load(page, 'grounds', 'garden_door');
  expect((await her(page)).mode).toBe('still');
  await stand(page, [12.5, 13.5], { yaw: 180 }); // back turned, right by her: she never moves
  await wait(page, 3);
  expect((await her(page)).col).toBeCloseTo(12.5, 3);
  await game(page, () => window.__stAgnes.progress.setFlag('visited_entrance_hall'));
  await load(page, 'grounds', 'school_door');
  expect((await her(page)).mode).toBeNull();
  await game(page, () => {
    const g = window.__stAgnes;
    g.debug.setVisible(true);
    g.debug.update(1 / 60);
    g.debug.setVisible(false);
  });
  expect(errors).toEqual([]);
});
