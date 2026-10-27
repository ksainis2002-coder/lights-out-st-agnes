import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, lookAt, use, message } from './helpers.js';

// The hub a little worse after each part of the school (owner pick 2a,
// 2026-10-27; approved still hub_return): after the hopscotch, Maggie
// skipping beside the horse; once the storm starts, damp down the tiles and
// the door's pane cracked; after the cemetery, tiles gone, some on the
// floor, and the lamp weaker.

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => window.__stAgnes.play());
});

// Sets a story flag (if any), comes back into the room, and lists what has changed.
const backAfter = (page, flag) => page.evaluate((flag) => {
  const game = window.__stAgnes;
  if (flag) game.progress.setFlag(flag);
  game.loadLevel('patient_room', 'door');
  const ids = game.world.levelGroup.getObjectByName('props').children
    .map((prop) => prop.userData.prop?.id)
    .filter((id) => id?.startsWith('hub_'))
    .sort();
  let lamp = 0;
  game.world.levelGroup.traverse((object) => {
    if (object.isPointLight && object.userData.light) lamp = Math.max(lamp, object.intensity);
  });
  return { ids, lamp };
}, flag);

test('the hub changes after each part of the school', async ({ page }) => {
  const errors = trackErrors(page);
  expect(await backAfter(page, null)).toEqual({ ids: [], lamp: 3.2 });
  expect(await backAfter(page, 'puzzle_hopscotch')).toEqual({ ids: ['hub_skipping'], lamp: 3.2 });
  expect(await backAfter(page, 'puzzle_records')).toEqual({ ids: ['hub_damp', 'hub_damp_side', 'hub_pane', 'hub_skipping'], lamp: 3.2 });
  expect(await backAfter(page, 'puzzle_lanterns')).toEqual({
    ids: ['hub_fallen', 'hub_pane', 'hub_skipping', 'hub_tiles', 'hub_tiles_side'],
    lamp: 1.76,
  });
  expect(errors).toEqual([]);
});

test('the new drawing can be looked at', async ({ page }) => {
  await backAfter(page, 'puzzle_hopscotch');
  expect(await lookAt(page, [2.2, 2.1], [2.2, 1.0, 1.2])).toBe('prompt.look');
  await use(page);
  expect(await message(page)).toBe('look.drawing.skipping');
});
