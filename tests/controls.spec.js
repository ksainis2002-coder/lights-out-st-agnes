import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { parseLevel } from '../src/levels/loader.js';
import { collides, moveWithCollision } from '../src/player/collision.js';
import { waitForBoot } from './helpers.js';

const corridor = JSON.parse(readFileSync(new URL('../src/levels/test_corridor.json', import.meta.url), 'utf8'));
const playerState = (page) => page.evaluate(() => structuredClone(window.__stAgnes.player.state));
const holdKey = async (page, key, ms) => {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
};

test('collision keeps a circle out of solid cells and slides along walls', () => {
  const level = parseLevel(corridor);
  const position = { x: 2.25, z: 3.75 };
  expect(collides(level, position.x, position.z, 0.3)).toBe(false);
  moveWithCollision(level, position, 0.5, -2, 0.3);
  expect(position.z).toBe(3.75);
  expect(position.x).toBe(2.75);
});

test.describe('in the browser', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await waitForBoot(page);
    await page.evaluate(() => window.__stAgnes.startTestPlay?.());
  });

  test('W walks forward along the facing direction', async ({ page }) => {
    const before = await playerState(page);
    await holdKey(page, 'KeyW', 700);
    const after = await playerState(page);
    expect(after.position.x - before.position.x).toBeGreaterThan(0.5);
    expect(Math.abs(after.position.z - before.position.z)).toBeLessThan(0.05);
    expect(after.noise).toBeGreaterThanOrEqual(0);
  });

  test('walls stop the player', async ({ page }) => {
    await holdKey(page, 'KeyA', 1500);
    const state = await playerState(page);
    expect(state.position.z).toBeGreaterThanOrEqual(3 + 0.3 - 0.001);
  });

  test('running is faster than walking and uses stamina', async ({ page }) => {
    const start = await playerState(page);
    await holdKey(page, 'KeyW', 600);
    const walked = (await playerState(page)).position.x - start.position.x;
    await page.waitForTimeout(400);
    const mid = await playerState(page);
    await page.keyboard.down('ShiftLeft');
    await holdKey(page, 'KeyW', 600);
    await page.keyboard.up('ShiftLeft');
    const end = await playerState(page);
    expect(end.position.x - mid.position.x).toBeGreaterThan(walked * 1.3);
    expect(end.stamina).toBeLessThan(100);
  });

  test('crouch lowers the eye and lean moves the camera sideways', async ({ page }) => {
    await page.keyboard.down('ControlLeft');
    await page.waitForTimeout(600);
    expect((await playerState(page)).eyeHeight).toBeLessThan(1.2);
    await page.keyboard.up('ControlLeft');
    await page.keyboard.down('KeyE');
    await page.waitForTimeout(500);
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
    await page.waitForTimeout(100);
    expect((await playerState(page)).yaw).toBeLessThan(before.yaw);
    await page.keyboard.press('KeyF');
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => window.__stAgnes.world.flashlight.isOn())).toBe(false);
  });

  test('rebound keys are used for movement', async ({ page }) => {
    await page.evaluate(() => {
      const { settings } = window.__stAgnes;
      settings.set('keys', { ...settings.get('keys'), forward: 'KeyI' });
    });
    const before = await playerState(page);
    await holdKey(page, 'KeyI', 500);
    expect((await playerState(page)).position.x).toBeGreaterThan(before.position.x + 0.3);
    await page.evaluate(() => window.__stAgnes.settings.reset());
  });
});
