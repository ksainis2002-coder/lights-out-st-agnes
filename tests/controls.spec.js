import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { parseLevel } from '../src/levels/loader.js';
import { collides, moveWithCollision } from '../src/player/collision.js';
import { waitForBoot } from './helpers.js';

const corridor = JSON.parse(readFileSync(new URL('../src/levels/test_corridor.json', import.meta.url), 'utf8'));
const playerState = (page) => page.evaluate(() => structuredClone(window.__stAgnes.player.state));
// Game time is stepped directly so results do not depend on frame rate.
const advance = (page, seconds) => page.evaluate((s) => window.__stAgnes.advance(s), seconds);
const holdKey = async (page, key, seconds) => {
  await page.keyboard.down(key);
  await advance(page, seconds);
  await page.keyboard.up(key);
};

test('collision keeps a circle out of solid cells and slides along walls', () => {
  const level = parseLevel(corridor);
  const position = { x: 2.25, z: 3.75 };
  expect(collides(level, position.x, position.z, 0.3)).toBe(false);
  moveWithCollision(level, position, 0.5, -2, 0.3);
  expect(position.z).toBe(3.75); // blocked by the north wall
  expect(position.x).toBe(2.75);
});

test.describe('in the browser', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await waitForBoot(page);
    await page.evaluate(() => {
      window.__stAgnes.play();
      window.__stAgnes.loadLevel('test_corridor');
    });
  });

  test('W walks forward along the facing direction', async ({ page }) => {
    const before = await playerState(page);
    await holdKey(page, 'KeyW', 0.7);
    const after = await playerState(page);
    expect(after.position.x - before.position.x).toBeGreaterThan(0.5);
    expect(Math.abs(after.position.z - before.position.z)).toBeLessThan(0.05);
    expect(after.noise).toBeGreaterThanOrEqual(0);
  });

  test('walls stop the player', async ({ page }) => {
    await holdKey(page, 'KeyA', 1.5);
    const state = await playerState(page);
    expect(state.position.z).toBeGreaterThanOrEqual(3 + 0.3 - 0.001);
  });

  test('running is faster than walking and uses stamina', async ({ page }) => {
    const speed = (state) => Math.hypot(state.velocity.x, state.velocity.z);
    await page.keyboard.down('KeyW');
    await advance(page, 0.8);
    const walking = await playerState(page);
    await page.keyboard.down('ShiftLeft');
    await advance(page, 0.8);
    const running = await playerState(page);
    await page.keyboard.up('ShiftLeft');
    await page.keyboard.up('KeyW');
    expect(speed(running)).toBeGreaterThan(speed(walking) * 1.5);
    expect(running.stamina).toBeLessThan(100);
  });

  test('crouch lowers the eye and lean moves the camera sideways', async ({ page }) => {
    await page.keyboard.down('ControlLeft');
    await advance(page, 0.6);
    expect((await playerState(page)).eyeHeight).toBeLessThan(1.2);
    await page.keyboard.up('ControlLeft');
    await page.keyboard.down('KeyE');
    await advance(page, 0.5);
    const lean = await page.evaluate(() => {
      const { camera } = window.__stAgnes.world;
      const { position } = window.__stAgnes.player.state;
      return camera.position.z - position.z;
    });
    await page.keyboard.up('KeyE');
    expect(lean).toBeGreaterThan(0.2); // facing +x, right is +z
  });

  test('mouse look turns the view and the flashlight toggles with F', async ({ page }) => {
    const before = await playerState(page);
    await page.evaluate(() => window.__stAgnes.input.addLook(200, 0));
    await advance(page, 1 / 60);
    expect((await playerState(page)).yaw).toBeLessThan(before.yaw);
    await page.keyboard.press('KeyF');
    await page.waitForFunction(() => !window.__stAgnes.world.flashlight.isOn());
  });

  test('rebound keys are used for movement', async ({ page }) => {
    await page.evaluate(() => {
      const { settings } = window.__stAgnes;
      settings.set('keys', { ...settings.get('keys'), forward: 'KeyI' });
    });
    const before = await playerState(page);
    await holdKey(page, 'KeyI', 0.5);
    expect((await playerState(page)).position.x).toBeGreaterThan(before.position.x + 0.3);
    await page.evaluate(() => window.__stAgnes.settings.reset());
  });
});

test('F3 toggles the debug overlay, off by default', async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  const overlay = page.locator('#debug-overlay');
  await expect(overlay).toBeHidden();
  await page.keyboard.press('F3');
  await expect(overlay).toBeVisible();
  await page.keyboard.press('F3');
  await expect(overlay).toBeHidden();
});

test('walking into a trigger volume activates it', async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => {
      window.__stAgnes.play();
      window.__stAgnes.loadLevel('test_corridor');
    });
  await page.keyboard.down('KeyW');
  const entered = await page.evaluate(() => {
    const game = window.__stAgnes;
    for (let i = 0; i < 20 && !game.triggers.active.has('lullaby_start'); i++) game.advance(0.5);
    return game.triggers.active.has('lullaby_start');
  });
  await page.keyboard.up('KeyW');
  expect(entered).toBe(true);
});
