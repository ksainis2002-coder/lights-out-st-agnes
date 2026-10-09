import { test, expect } from '@playwright/test';
import { waitForBoot } from './helpers.js';

// Puts the player in a cell, facing a direction (degrees; 0 = north / -z).
async function standAt(page, level, cell, yawDegrees) {
  await page.evaluate(({ level, cell, yawDegrees }) => {
    const game = window.__stAgnes;
    if (game.world.level.id !== level) game.loadLevel(level);
    const c = game.world.level.cellCenter(...cell);
    Object.assign(game.player.state.position, { x: c.x, z: c.z });
    game.player.state.yaw = (yawDegrees * Math.PI) / 180;
    game.advance(1 / 30);
  }, { level, cell, yawDegrees });
}
const promptKey = (page) => page.evaluate(() => window.__stAgnes.interaction.target()?.prompt().key ?? null);
const use = (page) => page.evaluate(() => {
  window.__stAgnes.input.tap('use');
  window.__stAgnes.advance(1.2);
});

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => window.__stAgnes.play());
});

test('the hub door leads to the orphanage landing and the stairs lead back', async ({ page }) => {
  expect(await page.evaluate(() => window.__stAgnes.world.level.id)).toBe('patient_room');
  await standAt(page, 'patient_room', [2, 5], 180);
  expect(await promptKey(page)).toBe('prompt.leave');
  await use(page);
  expect(await page.evaluate(() => window.__stAgnes.world.level.id)).toBe('orphanage_wing');
  await standAt(page, 'orphanage_wing', [1, 11], 90);
  expect(await promptKey(page)).toBe('prompt.stairsUp');
  await use(page);
  expect(await page.evaluate(() => window.__stAgnes.world.level.id)).toBe('patient_room');
});

test('a door opens with a click, lets the player through, and closes again', async ({ page }) => {
  await standAt(page, 'orphanage_wing', [8, 10], 0);
  expect(await promptKey(page)).toBe('prompt.open');
  expect(await page.evaluate(() => window.__stAgnes.world.level.isSolid(8, 9))).toBe(true);
  await use(page);
  expect(await page.evaluate(() => window.__stAgnes.world.level.isSolid(8, 9))).toBe(false);
  const z = await page.evaluate(() => {
    const game = window.__stAgnes;
    game.input.setVirtual('forward', true);
    game.advance(2.5);
    game.input.setVirtual('forward', false);
    return game.player.state.position.z;
  });
  expect(z).toBeLessThan(9 * 1.3); // inside the east dorm
  await standAt(page, 'orphanage_wing', [8, 10], 0);
  expect(await promptKey(page)).toBe('prompt.close');
  await use(page);
  expect(await page.evaluate(() => window.__stAgnes.world.level.isSolid(8, 9))).toBe(true);
});

test('locked doors stay shut and say so; hidden doors cannot be used', async ({ page }) => {
  await standAt(page, 'orphanage_wing', [17, 11], 180);
  expect(await promptKey(page)).toBe('prompt.locked');
  await use(page);
  expect(await page.evaluate(() => window.__stAgnes.world.level.isSolid(17, 12))).toBe(true);
  await standAt(page, 'orphanage_wing', [26, 5], -90);
  expect(await promptKey(page)).toBeNull();
});

test('the use prompt is drawn while looking at a door', async ({ page }) => {
  await standAt(page, 'orphanage_wing', [8, 10], 0);
  await page.waitForTimeout(100);
  const label = await page.evaluate(() => {
    const { i18n, interaction } = window.__stAgnes;
    return i18n.t(interaction.target().prompt().key);
  });
  expect(label).toBe('Open');
});
