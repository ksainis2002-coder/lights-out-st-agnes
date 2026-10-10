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

  const crankPrompt = () => page.evaluate(() => {
    const game = window.__stAgnes;
    const level = game.world.level;
    const c = { x: 9.5 * level.cellSize, z: 2.2 * level.cellSize };
    Object.assign(game.player.state.position, { x: c.x, z: c.z });
    const target = { x: 10.3 * level.cellSize, z: 2.2 * level.cellSize };
    game.player.state.yaw = Math.atan2(-(target.x - c.x), -(target.z - c.z));
    game.player.state.pitch = Math.atan2(0.05 - game.player.state.eyeHeight, Math.hypot(target.x - c.x, target.z - c.z));
    game.advance(1 / 30);
    return game.interaction.target()?.prompt() ?? null;
  });
  expect(await crankPrompt()).toBeNull(); // hidden until solved

  await swap(page, 'bed_7', 'bed_9', 'HARRY', 'GEORGE');
  expect(await page.evaluate(() => window.__stAgnes.progress.hasFlag('puzzle_plates'))).toBe(true);
  expect((await crankPrompt())?.key).toBe('prompt.take'); // rolled out from under bed 2
  await use(page);
  expect(await items(page)).toEqual(['music_box_crank']);
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

test('journal: tabs and document rows answer the mouse', async ({ page }) => {
  await page.evaluate(() => {
    const game = window.__stAgnes;
    game.journal.addDocument('night_duty');
    game.journal.addDocument('dorm_register');
    game.openScreen('journal');
  });
  const box = await page.locator('canvas#game').boundingBox();
  const at = (x, y) => [box.x + (x / 480) * box.width, box.y + (y / 270) * box.height];
  await page.mouse.click(...at(186, 15)); // DOCUMENTS tab
  expect(await page.evaluate(() => window.__stAgnes.ui.current().tab())).toBe('documents');
  await page.mouse.click(...at(120, 53)); // second row
  expect(await page.evaluate(() => window.__stAgnes.ui.current().selectedDocument())).toBe('dorm_register');
});

const LABELS = ['MAGGIE', 'PETER', 'EDITH', 'SAM', 'ROSE', 'ALFIE', 'TOMMY', 'NELL', 'GEORGE', 'MARY', 'IVY', 'WALTER'];
// Stand in front of the playroom cubbies and look into one compartment.
const lookAtCubby = (page, name) => page.evaluate((i) => {
  const game = window.__stAgnes;
  let cubbies = null;
  game.world.levelGroup.traverse((o) => {
    if (o.userData.prop?.id === 'playroom_cubbies') cubbies = o;
  });
  cubbies.updateWorldMatrix(true, false);
  const x = -0.6 + (i % 4) * 0.4, y = (2 - Math.floor(i / 4)) * 0.4 + 0.18;
  const target = cubbies.localToWorld(cubbies.position.clone().set(x, y, 0.05));
  const stand = cubbies.localToWorld(cubbies.position.clone().set(x, 0, 1.1));
  Object.assign(game.player.state.position, { x: stand.x, z: stand.z });
  game.player.state.yaw = Math.atan2(-(target.x - stand.x), -(target.z - stand.z));
  game.player.state.pitch = Math.atan2(target.y - game.player.state.eyeHeight, Math.hypot(target.x - stand.x, target.z - stand.z));
  game.advance(1 / 30);
  return game.interaction.target()?.prompt() ?? null;
}, LABELS.indexOf(name));

test('toys home: each toy in its owner\'s cubby unbolts the west dorm', async ({ page }) => {
  const westDorm = () => page.evaluate(() => window.__stAgnes.world.level.doors.find((d) => d.id === 'west_dorm').locked);
  expect(await westDorm()).toBe('puzzle_toys');
  expect(await lookAtCubby(page, 'IVY')).toEqual({ key: 'prompt.cubby', params: { name: 'IVY' } }); // nothing to put in yet
  await page.evaluate(() => ['toy_ball', 'toy_doll', 'toy_top'].forEach((id) => window.__stAgnes.inventory.add(id)));

  // A wrong cubby takes the toy, and gives it back.
  expect((await lookAtCubby(page, 'MAGGIE'))?.key).toBe('prompt.placeToy');
  await use(page);
  expect(await items(page)).toEqual(['toy_doll', 'toy_top']);
  expect((await lookAtCubby(page, 'MAGGIE'))?.key).toBe('prompt.take');
  await use(page);
  expect(await items(page)).toEqual(['toy_doll', 'toy_top', 'toy_ball']);

  for (const [toy, owner] of [['toy_ball', 'IVY'], ['toy_doll', 'ROSE'], ['toy_top', 'PETER']]) {
    await select(page, toy);
    expect((await lookAtCubby(page, owner))?.key).toBe('prompt.placeToy');
    await use(page);
  }
  expect(await items(page)).toEqual([]);
  expect(await westDorm()).toBeNull();
  expect(await page.evaluate(() => window.__stAgnes.progress.isUnlocked('west_dorm'))).toBe(true);
  expect(await page.evaluate(() => window.__stAgnes.messages.current()?.key)).toBe('msg.toysSolved');
});

test('toys home: the three toys can be picked up where they lie', async ({ page }) => {
  for (const id of ['linen_ball', 'washroom_doll', 'dorm_top']) {
    const prompt = await page.evaluate((id) => {
      const game = window.__stAgnes;
      const level = game.world.level;
      const pickup = { linen_ball: [12.6, 15.5], washroom_doll: [5.8, 16.2], dorm_top: [9.6, 5.3] }[id];
      const target = { x: pickup[0] * level.cellSize, z: pickup[1] * level.cellSize };
      const stand = { x: target.x, z: target.z - 0.9 };
      Object.assign(game.player.state.position, stand);
      game.player.state.yaw = Math.PI; // facing +z
      game.player.state.pitch = Math.atan2(0.05 - game.player.state.eyeHeight, 0.9);
      game.advance(1 / 30);
      return game.interaction.target()?.prompt() ?? null;
    }, id);
    expect(prompt?.key, id).toBe('prompt.take');
    await use(page);
  }
  expect(await items(page)).toEqual(['toy_ball', 'toy_doll', 'toy_top']);
});
