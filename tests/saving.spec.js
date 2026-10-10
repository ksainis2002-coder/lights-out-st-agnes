import { test, expect } from '@playwright/test';
import { waitForBoot } from './helpers.js';

const screen = (page) => page.evaluate(() => window.__stAgnes.ui.current()?.name ?? null);

async function toMenu(page) {
  await page.goto('./');
  await waitForBoot(page);
  if ((await screen(page)) === 'warning') await page.keyboard.press('Enter');
}

test('PLAY starts a new game in the patient room with empty pockets', async ({ page }) => {
  await toMenu(page);
  await page.keyboard.press('Enter');
  const s = await page.evaluate(() => {
    const g = window.__stAgnes;
    return { level: g.world.level.id, items: g.inventory.items(), mode: g.mode };
  });
  expect(s).toEqual({ level: 'patient_room', items: [], mode: 'playing' });
});

test('record at the landing tape recorder, reload, and REWIND back to the same moment', async ({ page }) => {
  // Two page loads, each decoding every sound after the first key press: slow
  // in the software-rendered test browser, so this test gets more time.
  test.setTimeout(90_000);
  await toMenu(page);
  expect(await page.evaluate(() => window.__stAgnes.hasAnySave())).toBe(false);
  await page.keyboard.press('Enter'); // PLAY
  await page.evaluate(() => {
    const g = window.__stAgnes;
    g.loadLevel('orphanage_wing', 'landing');
    g.inventory.add('office_key');
    g.progress.unlock('office');
    const c = g.world.level.cellCenter(1.5, 10.2);
    Object.assign(g.player.state.position, { x: c.x, z: c.z });
    g.player.state.yaw = 0;
    g.player.state.pitch = (-27 * Math.PI) / 180;
    g.advance(1 / 30);
  });
  expect(await page.evaluate(() => window.__stAgnes.interaction.target()?.prompt().key)).toBe('prompt.save');
  await page.evaluate(() => {
    window.__stAgnes.input.tap('use');
    window.__stAgnes.advance(0.1);
  });
  expect(await screen(page)).toBe('save');
  await page.keyboard.press('Enter'); // TAPE 1 is empty: records straight away
  expect(await screen(page)).toBeNull();
  const saved = await page.evaluate(() => window.__stAgnes.saves.load('slot1'));
  expect(saved.state.level).toBe('orphanage_wing');
  expect(saved.meta.room).toBe('landing');

  await toMenu(page);
  await page.keyboard.press('ArrowDown'); // REWIND
  await page.keyboard.press('Enter');
  expect(await screen(page)).toBe('load');
  await page.keyboard.press('ArrowDown'); // past CHECKPOINT to TAPE 1
  await page.keyboard.press('Enter');
  const s = await page.evaluate(() => {
    const g = window.__stAgnes;
    return { level: g.world.level.id, items: g.inventory.items(), office: g.progress.isUnlocked('office'), mode: g.mode, z: g.player.state.position.z };
  });
  expect(s.level).toBe('orphanage_wing');
  expect(s.items).toEqual(['office_key']);
  expect(s.office).toBe(true);
  expect(s.mode).toBe('playing');
  expect(s.z).toBeCloseTo(10.7 * 1.3, 1);
});

test('recording over a used tape asks first', async ({ page }) => {
  await toMenu(page);
  await page.keyboard.press('Enter');
  await page.evaluate(() => {
    window.__stAgnes.saveToTape('slot1');
    window.__stAgnes.openScreen('save');
  });
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => window.__stAgnes.ui.current().confirming())).toBe(true);
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => window.__stAgnes.ui.current().confirming())).toBe(false);
});

test('travelling to another level autosaves a checkpoint', async ({ page }) => {
  await toMenu(page);
  await page.keyboard.press('Enter');
  await page.evaluate(() => {
    const g = window.__stAgnes;
    g.travel('orphanage_wing', 'landing');
    g.advance(1.2);
  });
  const auto = await page.evaluate(() => window.__stAgnes.saves.load('auto'));
  expect(auto.state.level).toBe('orphanage_wing');
});
