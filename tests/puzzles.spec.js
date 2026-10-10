import { test, expect } from '@playwright/test';
import { waitForBoot } from './helpers.js';

// Stand a metre from the foot of a numbered bed, look at its name plate and
// return the prompt shown.
const lookAtPlate = (page, bedId) => page.evaluate((bedId) => {
  const game = window.__stAgnes;
  let bed = null;
  game.world.levelGroup.traverse((o) => {
    if (o.userData.prop?.id === bedId) bed = o;
  });
  bed.updateWorldMatrix(true, false);
  const plate = bed.localToWorld(bed.position.clone().set(0, 0.55, 0.97));
  const stand = bed.localToWorld(bed.position.clone().set(0, 0.55, 1.97));
  Object.assign(game.player.state.position, { x: stand.x, z: stand.z });
  game.player.state.yaw = Math.atan2(-(plate.x - stand.x), -(plate.z - stand.z));
  game.player.state.pitch = Math.atan2(plate.y - game.player.state.eyeHeight, 1);
  game.advance(1 / 30);
  return game.interaction.target()?.prompt() ?? null;
}, bedId);
const use = (page) => page.evaluate(() => {
  window.__stAgnes.input.tap('use');
  window.__stAgnes.advance(0.3);
});
const items = (page) => page.evaluate(() => window.__stAgnes.inventory.items());

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => {
    const game = window.__stAgnes;
    game.play();
    ['tommy_corridor', 'tommy_washroom', 'tommy_east_dorm', 'tommy_playroom', 'scare_washroom', 'scare_east_dorm', 'scare_corridor_run']
      .forEach((id) => game.progress.setFlag(`ghost_${id}`));
    game.loadLevel('orphanage_wing', 'landing');
  });
});

const select = (page, id) => page.evaluate((id) => {
  const inventory = window.__stAgnes.inventory;
  inventory.select(inventory.items().indexOf(id));
}, id);

// Swap the plates on two beds: take both, put each on the other bed.
async function swap(page, bedA, bedB, nameA, nameB) {
  await lookAtPlate(page, bedA);
  await use(page);
  await lookAtPlate(page, bedB);
  await use(page);
  await select(page, `plate_${nameB}`);
  expect(await lookAtPlate(page, bedA)).toEqual({ key: 'prompt.placePlate', params: { name: nameB } });
  await use(page);
  expect(await lookAtPlate(page, bedB)).toEqual({ key: 'prompt.placePlate', params: { name: nameA } });
  await use(page);
}

test('name plates: put every plate back on its bed and the crank drops', async ({ page }) => {
  // Bed 2 is Tommy's but carries Sam's plate; bed 4 has Tommy's.
  expect(await lookAtPlate(page, 'bed_2')).toEqual({ key: 'prompt.takePlate', params: { name: 'SAM' } });
  await swap(page, 'bed_2', 'bed_4', 'SAM', 'TOMMY');
  expect(await items(page)).toEqual([]);
  expect(await lookAtPlate(page, 'bed_2')).toEqual({ key: 'prompt.takePlate', params: { name: 'TOMMY' } });

  await swap(page, 'bed_7', 'bed_9', 'HARRY', 'GEORGE');
  expect(await items(page)).toEqual(['music_box_crank']);
  expect(await page.evaluate(() => window.__stAgnes.progress.hasFlag('puzzle_plates'))).toBe(true);
  expect(await lookAtPlate(page, 'bed_2')).toBeNull(); // solved plates stay put
});

test('name plates: moved plates stay moved after the level reloads', async ({ page }) => {
  await lookAtPlate(page, 'bed_2');
  await use(page);
  await page.evaluate(() => window.__stAgnes.loadLevel('orphanage_wing', 'landing'));
  expect(await lookAtPlate(page, 'bed_2')).toEqual({ key: 'prompt.placePlate', params: { name: 'SAM' } });
});

test('the dorm register teaches Tommy\'s name', async ({ page }) => {
  const known = () => page.evaluate(() => window.__stAgnes.progress.hasFlag('name_tommy'));
  expect(await known()).toBe(false);
  const doc = await page.evaluate(() => {
    const game = window.__stAgnes;
    const level = game.world.level;
    const c = level.cellCenter(17, 15);
    Object.assign(game.player.state.position, { x: c.x, z: c.z });
    const target = { x: 17.25 * level.cellSize, y: 0.78, z: 14.2 * level.cellSize };
    game.player.state.yaw = Math.atan2(-(target.x - c.x), -(target.z - c.z));
    const flat = Math.hypot(target.x - c.x, target.z - c.z);
    game.player.state.pitch = Math.atan2(target.y - game.player.state.eyeHeight, flat);
    game.advance(1 / 30);
    game.input.tap('use');
    game.advance(0.3);
    return game.ui.current()?.name ?? null;
  });
  expect(doc).toBe('document');
  expect(await known()).toBe(true);
});
