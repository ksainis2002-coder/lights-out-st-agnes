import { test, expect } from '@playwright/test';
import { waitForBoot, lookAt, trackErrors } from './helpers.js';

// Maggie's trick in Classroom 1 (approved still class1_turned): a while after
// the library puzzle, while you are out of the room, within earshot and not
// looking in, every desk turns to face the door; a scrape is the tell. The
// desks stay turned through a reload; her library ticket turns with her desk.

const game = (page, fn, arg) => page.evaluate(fn, arg);

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await game(page, () => {
    const g = window.__stAgnes;
    g.newGame();
    g.intro.finish();
    g.progress.setFlag('tool_flashlight');
    g.world.flashlight.setOn(true);
    g.progress.setFlag('opened_maggie_desk');
    g.loadLevel('school_ground', 'front_door');
    g.world.level.ghosts.forEach((event) => g.progress.setFlag(`ghost_${event.id}`));
    const size = () => g.world.level.cellSize;
    const degrees = (radians) => Math.round((radians * 180) / Math.PI);
    window.__t = {
      stand(cell, { at = null, yaw = 0 } = {}) {
        const s = { x: cell[0] * size(), z: cell[1] * size() };
        Object.assign(g.player.state.position, s);
        g.player.state.yaw = at ? Math.atan2(-(at[0] * size() - s.x), -(at[1] * size() - s.z)) : (yaw * Math.PI) / 180;
        g.player.state.pitch = 0;
        g.advance(1 / 60);
      },
      wait(seconds) {
        for (let t = 0; t < seconds; t += 5) {
          g.sanity.restore(100);
          g.advance(Math.min(5, seconds - t));
        }
      },
      // The room as it stands: which set of desks shows, how Maggie's desk
      // and the ticket in it are turned, and which footprints block you.
      room() {
        const sets = {};
        let maggie = null;
        let ticket = null;
        g.world.levelGroup.traverse((object) => {
          if (object.name.startsWith('props:class1_turned:')) sets[object.name.split(':')[2]] = object.visible;
          if (object.userData.prop?.id === 'maggie_desk') maggie = degrees(object.rotation.y);
          if (object.userData.moves && !object.userData.prop) ticket = degrees(object.rotation.y);
        });
        const boxes = g.world.level.obstacles.filter((box) => box.flag === 'class1_turned' && !box.off);
        const footprints = { before: boxes.filter((box) => !box.moved).length, moved: boxes.filter((box) => box.moved).length };
        return { turned: g.progress.hasFlag('class1_turned'), sets, maggie, ticket, footprints };
      },
    };
  });
});

const BEFORE = { turned: false, sets: { before: true, moved: false }, maggie: 88, ticket: 268, footprints: { before: 12, moved: 0 } };
const TURNED = { turned: true, sets: { before: false, moved: true }, maggie: 23, ticket: 203, footprints: { before: 0, moved: 12 } };

test('a while after the library, out of your sight, every desk turns to face the door', async ({ page }) => {
  const errors = trackErrors(page);
  const run = await game(page, () => {
    const g = window.__stAgnes;
    const { stand, wait, room } = window.__t;
    let scrapes = 0;
    g.events.on('trick.scrape', () => (scrapes += 1));
    g.progress.setFlag('puzzle_library');
    stand([20.0, 10.6], { yaw: -90 }); // the corridor, looking east, away from Classroom 1
    wait(80);
    const early = room();
    wait(15);
    return { early, later: room(), scrapes };
  });
  expect(run.early).toEqual(BEFORE);
  expect(run.later).toEqual(TURNED);
  expect(run.scrapes).toBeGreaterThan(2); // the desks heard dragged round
  expect(errors).toEqual([]);
});

test('not while you look in or stand in the room, and not out of earshot', async ({ page }) => {
  const run = await game(page, () => {
    const g = window.__stAgnes;
    const { stand, wait, room } = window.__t;
    const door = g.world.level.doorAt(12, 12);
    door.open = true;
    g.progress.setOpen(door.id, true);
    g.progress.setFlag('puzzle_library');
    stand([12.5, 11.0], { at: [13.5, 16.0] }); // in the corridor, looking in through the open door
    wait(120);
    const lookingIn = room().turned;
    stand([13.0, 17.6], { yaw: 0 }); // inside, at the back
    wait(30);
    const inside = room().turned;
    stand([32.5, 6.0], { yaw: 0 }); // the music room, 26 m off
    wait(30);
    const away = room().turned;
    stand([20.0, 10.6], { yaw: -90 });
    wait(0.5);
    return { lookingIn, inside, away, back: room().turned };
  });
  expect(run).toEqual({ lookingIn: false, inside: false, away: false, back: true });
});

test('the desks stay turned through a reload, and her ticket can still be read in her desk', async ({ page }) => {
  const run = await game(page, () => {
    const g = window.__stAgnes;
    const { stand, wait, room } = window.__t;
    g.progress.setFlag('puzzle_library');
    stand([20.0, 10.6], { yaw: -90 });
    wait(95);
    g.loadLevel('school_ground', 'front_door');
    return room();
  });
  expect(run).toEqual(TURNED);
  expect(await lookAt(page, [13.8, 14.4], [13.835, 15.313, 0.74])).toBe('prompt.read');
});
