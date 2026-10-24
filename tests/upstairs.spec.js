import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, lookAt, use, arrive, message, load } from './helpers.js';

// Wing 2, part B: the school's first floor (approved stills, owner 2026-10-24).

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => window.__stAgnes.play());
});

// Where the player stands now, in cells.
const standing = (page) => page.evaluate(() => {
  const { player, world } = window.__stAgnes;
  const size = world.level.cellSize;
  return [player.state.position.x / size, player.state.position.z / size];
});

const near = ([x, z], [ex, ez]) => Math.hypot(x - ex, z - ez) < 0.3;

// Arriving, you face away from the stairs: no prompt to go straight back.
const promptNow = (page) => page.evaluate(() => {
  window.__stAgnes.advance(0.1);
  return window.__stAgnes.interaction.target()?.prompt()?.key ?? null;
});

test('the main stairs go up from the hall, and their head brings you back down to the foot', async ({ page }) => {
  const errors = trackErrors(page);
  await load(page, 'school_ground', 'front_door');
  expect(await lookAt(page, [28.6, 18.7], [27.67, 18.33, 1.0])).toBe('prompt.stairsUp');
  await use(page);
  expect(await arrive(page)).toBe('school_upper');
  expect(near(await standing(page), [28.0, 12.5])).toBe(true);
  expect(await promptNow(page)).toBe(null);

  expect(await lookAt(page, [28.0, 12.5], [28.0, 13.4, 0.8])).toBe('prompt.stairsDown');
  await use(page);
  expect(await arrive(page)).toBe('school_ground');
  expect(near(await standing(page), [28.7, 18.6])).toBe(true);
  expect(await promptNow(page)).toBe(null);
  expect(errors).toEqual([]);
});

test('the back stairs go up from beside the gym and down again', async ({ page }) => {
  await load(page, 'school_ground', 'front_door');
  expect(await lookAt(page, [27.0, 10.4], [27.0, 9.0, 1.0])).toBe('prompt.stairsUp');
  await use(page);
  expect(await arrive(page)).toBe('school_upper');
  expect(near(await standing(page), [27.0, 8.6])).toBe(true);
  expect(await promptNow(page)).toBe(null);

  expect(await lookAt(page, [27.0, 8.6], [27.0, 7.6, 0.8])).toBe('prompt.stairsDown');
  await use(page);
  expect(await arrive(page)).toBe('school_ground');
  expect(near(await standing(page), [27.0, 9.6])).toBe(true);
  expect(await promptNow(page)).toBe(null);
});

test("the headmaster's office opens only with his key; his flat is through the office", async ({ page }) => {
  await load(page, 'school_upper', 'main_stairs');
  const door = [[32.5, 10.6], [32.5, 9.5, 1.2]];
  expect(await lookAt(page, ...door)).toBe('prompt.locked');
  await page.evaluate(() => window.__stAgnes.inventory.add('headmaster_key'));
  expect(await lookAt(page, ...door)).toBe('prompt.unlock');
  await use(page);
  expect(await message(page)).toBe('msg.unlocked');
  const state = await page.evaluate(() => {
    const { world, inventory } = window.__stAgnes;
    return { open: world.level.doors.find((d) => d.id === 'head_office').open, key: inventory.has('headmaster_key') };
  });
  expect(state).toEqual({ open: true, key: false });
  expect(await lookAt(page, [35.4, 6.5], [36.5, 6.5, 1.2])).toBe('prompt.open');
});

test('the first-floor plan is pinned in the staff room, and the journal draws it in both languages', async ({ page }) => {
  const errors = trackErrors(page);
  await load(page, 'school_ground', 'front_door');
  expect(await lookAt(page, [44.0, 14.2], [44.0, 13.04, 1.5])).toBe('prompt.takeMap');
  await use(page);
  expect(await page.evaluate(() => window.__stAgnes.journal.maps())).toContain('school_upper');
  await load(page, 'school_upper', 'main_stairs');
  for (const language of ['en', 'el']) {
    await page.evaluate((language) => {
      const game = window.__stAgnes;
      game.settings.set('language', language);
      game.openScreen('journal', { tab: 'maps' });
    }, language);
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => window.__stAgnes.ui.current()?.tab())).toBe('maps');
    await page.keyboard.press('Escape');
  }
  expect(errors).toEqual([]);
});
