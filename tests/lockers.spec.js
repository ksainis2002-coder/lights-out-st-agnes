import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, lookAt, use, message } from './helpers.js';

// Hiding in a staff locker (0.5, part B; approved stills locker,
// locker_inside): in the morgue and the laundry; inside you stand looking out
// of the door through its slits, your light off; the first time, "He walks
// past what he cannot hear."; the use key brings you out where you stood.

const game = (page, fn, arg) => page.evaluate(fn, arg);

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await game(page, () => {
    const g = window.__stAgnes;
    g.realTime = false; // time moves only by advance()
    g.newGame();
    g.intro.finish();
    g.progress.setFlag('tool_flashlight');
    g.loadLevel('basement', 'stairs');
    g.world.flashlight.setOn(true);
  });
});

// Before the middle locker on the morgue's east wall (cell 16.75, 12.62).
const faceLocker = (page) => lookAt(page, [15.6, 12.62], [16.75, 12.62, 1.3]);

test('in the morgue: hide in a locker, look out through its door, your light off, then come out', async ({ page }) => {
  const errors = trackErrors(page);
  expect(await faceLocker(page)).toBe('prompt.hideLocker');
  const stood = await game(page, () => ({ ...window.__stAgnes.player.state.position }));
  await use(page);
  expect(await message(page)).toBe('msg.lockerFirst');
  const inside = await game(page, () => {
    const g = window.__stAgnes;
    g.advance(0.5);
    const size = g.world.level.cellSize;
    const camera = g.world.camera;
    const forward = new camera.position.constructor();
    camera.getWorldDirection(forward);
    return {
      kind: g.hiding.kind(),
      light: g.world.flashlight.isOn(),
      at: [camera.position.x / size, camera.position.y, camera.position.z / size],
      lookingWest: forward.x < -0.9,
      prompt: g.hiding.way.prompt().key,
    };
  });
  expect(inside.kind).toBe('locker');
  expect(inside.light).toBe(false);
  expect(inside.at[0]).toBeCloseTo(16.75, 1);
  expect(inside.at[1]).toBeCloseTo(1.62, 1);
  expect(inside.at[2]).toBeCloseTo(12.62, 1);
  expect(inside.lookingWest).toBe(true); // out of its door, into the morgue
  expect(inside.prompt).toBe('prompt.comeOut');

  const out = await game(page, () => {
    const g = window.__stAgnes;
    g.input.tap('use');
    g.advance(0.3);
    return { hiding: g.hiding.active(), at: { ...g.player.state.position } };
  });
  expect(out.hiding).toBe(false);
  expect(out.at).toEqual(stood);
  expect(errors).toEqual([]);
});

test('the first time only: his line; and the lockers are solid', async ({ page }) => {
  await faceLocker(page);
  await use(page);
  await game(page, () => {
    const g = window.__stAgnes;
    g.advance(6);
    g.input.tap('use');
    g.advance(0.3);
  });
  await faceLocker(page);
  await use(page);
  expect(await message(page)).not.toBe('msg.lockerFirst');

  const blocked = await game(page, () => {
    const g = window.__stAgnes;
    g.input.tap('use');
    g.advance(0.3);
    const size = g.world.level.cellSize;
    Object.assign(g.player.state.position, { x: 15.6 * size, z: 12.62 * size });
    g.player.state.yaw = -Math.PI / 2; // east, into the lockers
    g.input.setVirtual('forward', true);
    g.advance(2);
    g.input.setVirtual('forward', false);
    return g.player.state.position.x / size;
  });
  expect(blocked).toBeLessThan(16.5); // stopped at the doors
});

test('in the laundry too', async ({ page }) => {
  expect(await lookAt(page, [16.6, 3.4], [17.75, 3.4, 1.3])).toBe('prompt.hideLocker');
});
