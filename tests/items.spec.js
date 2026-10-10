import { test, expect } from '@playwright/test';
import { waitForBoot } from './helpers.js';

// Stand in a wing cell, look in a direction (yaw, pitch in degrees), take one step of time.
const look = (page, cell, yaw, pitch = 0) => page.evaluate(({ cell, yaw, pitch }) => {
  const game = window.__stAgnes;
  const c = game.world.level.cellCenter(...cell);
  Object.assign(game.player.state.position, { x: c.x, z: c.z });
  game.player.state.yaw = (yaw * Math.PI) / 180;
  game.player.state.pitch = (pitch * Math.PI) / 180;
  game.advance(1 / 30);
  return game.interaction.target()?.prompt() ?? null;
}, { cell, yaw, pitch });
const tap = (page, action, seconds = 0.6) => page.evaluate(({ action, seconds }) => {
  window.__stAgnes.input.tap(action);
  window.__stAgnes.advance(seconds);
}, { action, seconds });
const state = (page) => page.evaluate(() => {
  const g = window.__stAgnes;
  return { items: g.inventory.items(), clues: g.journal.clues(), docs: g.journal.documents(), screen: g.ui.current()?.name ?? null, mode: g.mode, message: g.messages.current()?.key ?? null };
});

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => {
    window.__stAgnes.play();
    window.__stAgnes.loadLevel('orphanage_wing', 'landing');
  });
});

test('take the office key from the washroom drain, then unlock the office', async ({ page }) => {
  expect((await look(page, [17, 11], 180))?.key).toBe('prompt.locked');
  await tap(page, 'use');
  expect((await state(page)).clues).toContain('locked_office');

  expect((await look(page, [7.9, 15.4], 180, -60))?.key).toBe('prompt.take');
  await tap(page, 'use');
  let s = await state(page);
  expect(s.items).toEqual(['office_key']);
  expect(s.clues).toContain('took_office_key');

  expect((await look(page, [17, 11], 180))?.key).toBe('prompt.unlock');
  await tap(page, 'use', 1.2);
  s = await state(page);
  expect(s.items).toEqual([]); // the key is used up
  expect(await page.evaluate(() => window.__stAgnes.world.level.isSolid(17, 12))).toBe(false);
});

test('reading a document opens it, files it in the journal, and ESC returns to the game', async ({ page }) => {
  await page.evaluate(() => window.__stAgnes.progress.unlock('office'));
  await page.evaluate(() => window.__stAgnes.loadLevel('orphanage_wing', 'landing'));
  expect((await look(page, [17.45, 13.3], 180, -52))?.key).toBe('prompt.read');
  await tap(page, 'use', 0.1);
  let s = await state(page);
  expect(s.screen).toBe('document');
  expect(s.docs).toEqual(['night_duty']);
  await page.keyboard.press('Escape');
  s = await state(page);
  expect(s.screen).toBeNull();
  expect(s.mode).toBe('playing');
});

test('J opens the journal with clues; TAB changes section', async ({ page }) => {
  await page.evaluate(() => window.__stAgnes.journal.addClue('locked_office'));
  await tap(page, 'journal', 0.1);
  expect((await state(page)).screen).toBe('journal');
  expect(await page.evaluate(() => window.__stAgnes.ui.current().tab())).toBe('clues');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => window.__stAgnes.ui.current().tab())).toBe('documents');
  await page.keyboard.press('KeyJ');
  expect((await state(page)).mode).toBe('playing');
});

test('TAB opens the inventory; using an item on nothing says so', async ({ page }) => {
  await page.evaluate(() => window.__stAgnes.inventory.add('battery'));
  await tap(page, 'inventory', 0.05);
  expect(await page.evaluate(() => window.__stAgnes.inventory.isOpen())).toBe(true);
  await look(page, [15, 10], 90, 0);
  await tap(page, 'use', 0.05);
  expect((await state(page)).message).toBe('msg.nothing');
  await tap(page, 'inventory', 0.05);
  expect(await page.evaluate(() => window.__stAgnes.inventory.isOpen())).toBe(false);
});
