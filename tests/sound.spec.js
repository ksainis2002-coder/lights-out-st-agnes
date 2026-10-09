import { test, expect } from '@playwright/test';
import { waitForBoot } from './helpers.js';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.keyboard.press('ArrowDown'); // first input starts audio
  await page.waitForFunction(() => window.__stAgnes.sfx.isReady(), null, { timeout: 30000 });
  await page.evaluate(() => {
    const game = window.__stAgnes;
    game.play();
    game.loadLevel('orphanage_wing', 'landing');
  });
});

test('every stride plays a footstep, by floor type', async ({ page }) => {
  const played = await page.evaluate(() => {
    const game = window.__stAgnes;
    game.input.setVirtual('forward', true);
    game.advance(4); // landing (wood) into the corridor (tiles)
    game.input.setVirtual('forward', false);
    return game.sfx.played();
  });
  const steps = (played.step_wood ?? 0) + (played.step_tile ?? 0);
  expect(steps).toBeGreaterThanOrEqual(6);
  expect(played.step_wood).toBeGreaterThan(0);
  expect(played.step_tile).toBeGreaterThan(0);
});

test('doors and the flashlight make sounds; rooms have ambience', async ({ page }) => {
  const result = await page.evaluate(() => {
    const game = window.__stAgnes;
    const c = game.world.level.cellCenter(8, 10);
    Object.assign(game.player.state.position, { x: c.x, z: c.z });
    game.player.state.yaw = 0;
    game.advance(0.1);
    game.input.tap('use');
    game.advance(0.5);
    game.input.tap('flashlight');
    game.advance(0.1);
    return { played: game.sfx.played(), beds: game.sfx.beds() };
  });
  expect(result.played.door_use).toBe(1);
  expect(result.played.flashlight_click).toBe(1);
  expect(result.beds).toContain('amb_rain_inside');
  expect(result.beds).toContain('amb_wind_corridor');
});

test('the office clock ticks from the clock on the wall, not everywhere', async ({ page }) => {
  const result = await page.evaluate(() => {
    const game = window.__stAgnes;
    game.loadLevel('orphanage_wing', 'landing');
    const c = game.world.level.cellCenter(17, 15);
    Object.assign(game.player.state.position, { x: c.x, z: c.z });
    game.advance(0.2);
    const hasClockProp = game.world.level.props.some((p) => p.type === 'wallClock');
    return { played: game.sfx.played(), beds: game.sfx.beds(), hasClockProp };
  });
  expect(result.hasClockProp).toBe(true);
  expect(result.played.amb_clock).toBeGreaterThanOrEqual(1);
  expect(result.beds).not.toContain('amb_clock');
});
