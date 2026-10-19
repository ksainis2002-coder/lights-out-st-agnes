import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors } from './helpers.js';

// Maggie's chalk (design 0.3, approved stills chalk_hint and chalk_taunt):
// fresh words on a corridor board you are near but not looking at. A hint
// once a tried puzzle has seen no progress for three minutes (the watcher's
// after her second catch); about one board in four a taunt once she is
// awake, never while she is near. Boards keep their words through a reload.

const game = (page, fn, arg) => page.evaluate(fn, arg);

// The school with Maggie's events out of the way and the flashlight on.
test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await game(page, () => {
    const g = window.__stAgnes;
    g.newGame();
    g.intro.finish();
    g.progress.setFlag('tool_flashlight');
    g.world.flashlight.setOn(true);
    g.loadLevel('school_ground', 'front_door');
    g.world.level.ghosts.forEach((event) => g.progress.setFlag(`ghost_${event.id}`));
    const size = () => g.world.level.cellSize;
    // In-page moves, so a timed sequence runs in one step (the game's own loop runs between steps).
    window.__c = {
      stand(cell, { at = null, yaw = 0 } = {}) {
        const s = { x: cell[0] * size(), z: cell[1] * size() };
        Object.assign(g.player.state.position, s);
        g.player.state.yaw = at ? Math.atan2(-(at[0] * size() - s.x), -(at[1] * size() - s.z)) : (yaw * Math.PI) / 180;
        g.player.state.pitch = 0;
        g.advance(1 / 60);
      },
      // Waits, keeping the mind steady (a long wait in a dark corridor would end in a blackout).
      wait(seconds) {
        for (let t = 0; t < seconds; t += 5) {
          g.sanity.restore(100);
          g.advance(Math.min(5, seconds - t));
        }
      },
    };
  });
});

test('a puzzle tried and then left for three minutes gets its hint, on a board near you and out of sight', async ({ page }) => {
  const errors = trackErrors(page);
  const run = await game(page, () => {
    const g = window.__stAgnes;
    const { stand, wait } = window.__c;
    let scratches = 0;
    g.events.on('chalk.scratch', () => (scratches += 1));
    g.progress.setFlag('tried_libraryIndex');
    stand([12.0, 11.2], { yaw: 180 }); // the corridor, your back to the west board
    wait(170);
    const early = g.chalk.written();
    wait(15);
    return { early, later: g.chalk.written(), text: g.chalk.text('chalk_west'), scratches };
  });
  expect(run.early).toEqual({});
  expect(run.later).toEqual({ chalk_west: 'chalk.hint.library' });
  expect(run.text).toBe('THE NUMBER IS ON THE CARD');
  expect(run.scratches).toBeGreaterThan(2); // you hear it written
  expect(errors).toEqual([]);
});

test('a board you can see is never written; she waits until you look away', async ({ page }) => {
  const run = await game(page, () => {
    const g = window.__stAgnes;
    const { stand, wait } = window.__c;
    g.progress.setFlag('tried_piano');
    stand([30.0, 11.2], { at: [30.0, 10.0] }); // facing the board across from the hall
    wait(200);
    const watched = g.chalk.written();
    stand([30.0, 11.2], { yaw: 180 }); // turn round
    wait(0.5);
    return { watched, after: g.chalk.written() };
  });
  expect(run.watched).toEqual({});
  expect(run.after).toEqual({ chalk_hall: 'chalk.hint.piano' });
});

test('any step forward restarts the clock, and a solved puzzle gets no hint', async ({ page }) => {
  const run = await game(page, () => {
    const g = window.__stAgnes;
    const { stand, wait } = window.__c;
    g.progress.setFlag('tried_hopscotch');
    g.progress.setFlag('tried_piano');
    g.progress.setFlag('puzzle_piano');
    stand([12.0, 11.2], { yaw: 180 });
    wait(120);
    g.progress.read('detention_book'); // something new read
    wait(100);
    const early = g.chalk.written();
    wait(90);
    return { early, later: g.chalk.written() };
  });
  expect(run.early).toEqual({});
  expect(run.later).toEqual({ chalk_west: 'chalk.hint.hopscotch' });
});

test('only a board in the room you are in, and near you', async ({ page }) => {
  const run = await game(page, () => {
    const g = window.__stAgnes;
    const { stand, wait } = window.__c;
    stand([22.0, 10.6], { yaw: 90 }); // along the corridor first
    g.progress.setFlag('matches_missing');
    stand([12.5, 15.5], { yaw: 180 }); // Classroom 1: the middle board is 6 m off, through the wall
    wait(200);
    const inClass = g.chalk.written();
    stand([22.0, 10.6], { yaw: 90 }); // back in the corridor, 7 m from it
    wait(1);
    const far = g.chalk.written();
    stand([18.0, 10.6], { yaw: -90 }); // 3 m from it, your back to it
    wait(1);
    return { inClass, far, near: g.chalk.written() };
  });
  expect(run.inClass).toEqual({});
  expect(run.far).toEqual({});
  expect(run.near).toEqual({ chalk_middle: 'chalk.hint.matches' });
});

test('once she is awake, about one board in four is a taunt, and none while she is near', async ({ page }) => {
  const run = await game(page, () => {
    const g = window.__stAgnes;
    const { stand, wait } = window.__c;
    g.world.level.chalk.taunts.after = 'test_taunts'; // the watcher herself stays asleep in the library
    g.progress.setFlag('test_taunts');
    stand([30.0, 11.2], { yaw: 180 });
    const size = g.world.level.cellSize;
    g.watcher.moveTo(30.0 * size, 15.5 * size); // 5 m off, in the hall
    wait(250);
    const near = g.chalk.written();
    g.watcher.moveTo(6.5 * size, 1.8 * size); // back at the end of her aisle
    wait(0.5);
    const first = g.chalk.written();
    g.progress.setValue('chalk', { boards: {}, order: [], hints: ['a', 'b'], taunts: 1 }); // two hints since
    g.loadLevel('school_ground', 'front_door');
    stand([30.0, 11.2], { yaw: 180 });
    wait(250);
    return { near, first, tooSoon: g.chalk.written() };
  });
  expect(run.near).toEqual({});
  expect(run.first).toEqual({ chalk_hall: 'chalk.taunt.behind' });
  expect(run.tooSoon).toEqual({}); // the next taunt waits for a third hint
});

test('after her second catch: "she can\'t open doors"', async ({ page }) => {
  await game(page, () => {
    const g = window.__stAgnes;
    g.progress.setFlag('watcher_awake');
    g.loadLevel('school_ground', 'front_door');
    g.world.level.ghosts.forEach((event) => g.progress.setFlag(`ghost_${event.id}`));
  });
  const run = await game(page, () => {
    const g = window.__stAgnes;
    const { stand, wait } = window.__c;
    const size = g.world.level.cellSize;
    const catches = [];
    for (let i = 0; i < 2; i++) {
      stand([20, 10.6], { yaw: -90 }); // your back to her
      g.watcher.moveTo(19.1 * size, 10.6 * size);
      wait(8); // the breath, the grab, the rewind
      catches.push(g.watcher.state().catches);
    }
    stand([12.0, 11.2], { yaw: 180 });
    g.watcher.moveTo(43.0 * size, 10.6 * size);
    wait(0.5);
    return { catches, written: g.chalk.written() };
  });
  expect(run.catches).toEqual([1, 2]);
  expect(run.written).toEqual({ chalk_west: 'chalk.hint.watcher' });
});

test('the words stay on the board through a reload, in the language you play in', async ({ page }) => {
  const run = await game(page, () => {
    const g = window.__stAgnes;
    const { stand, wait } = window.__c;
    g.progress.setFlag('tried_libraryIndex');
    stand([12.0, 11.2], { yaw: 180 });
    wait(185);
    g.loadLevel('school_ground', 'front_door');
    const english = g.chalk.text('chalk_west');
    g.i18n.setLanguage('el');
    const greek = g.chalk.text('chalk_west');
    g.i18n.setLanguage('en');
    return { english, greek, others: ['chalk_middle', 'chalk_hall', 'chalk_east'].map((id) => g.chalk.text(id)) };
  });
  expect(run.english).toBe('THE NUMBER IS ON THE CARD');
  expect(run.greek).toBe('Ο ΑΡΙΘΜΟΣ ΕΙΝΑΙ ΣΤΗΝ ΚΑΡΤΕΛΑ');
  expect(run.others).toEqual(['', '', '']);
});
