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

const message = (page) => page.evaluate(() => window.__stAgnes.messages.current()?.key ?? null);

test('name plates: nothing moves until the dorm register is read', async ({ page }) => {
  await lookAtPlate(page, 'bed_2');
  await use(page);
  expect(await items(page)).toEqual([]);
  expect(await message(page)).toBe('msg.platesNeedClue');
});

test('name plates: put every plate back on its bed and the crank drops', async ({ page }) => {
  await page.evaluate(() => window.__stAgnes.progress.read('dorm_register'));
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
  await page.evaluate(() => window.__stAgnes.progress.read('dorm_register'));
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
  await page.evaluate(() => ['ivy', 'rose', 'peter'].forEach((name) => window.__stAgnes.progress.setFlag(`seen_drawing_${name}`)));

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

test('toys home: a toy only goes in a cubby once its owner\'s drawing was seen', async ({ page }) => {
  await page.evaluate(() => window.__stAgnes.inventory.add('toy_ball'));
  await lookAtCubby(page, 'IVY');
  await use(page);
  expect(await items(page)).toEqual(['toy_ball']);
  expect(await message(page)).toBe('msg.toyNeedsClue');

  // Look at Ivy's drawing on the playroom wall.
  const prompt = await page.evaluate(() => {
    const game = window.__stAgnes;
    const level = game.world.level;
    const target = { x: 13 * level.cellSize, y: 1.15, z: 4.9 * level.cellSize };
    const stand = { x: target.x + 1.2, z: target.z };
    Object.assign(game.player.state.position, stand);
    game.player.state.yaw = Math.PI / 2; // facing -x
    game.player.state.pitch = Math.atan2(target.y - game.player.state.eyeHeight, 1.2);
    game.advance(1 / 30);
    return game.interaction.target()?.prompt() ?? null;
  });
  expect(prompt?.key).toBe('prompt.look');
  await use(page);
  expect(await page.evaluate(() => window.__stAgnes.journal.clues())).toContain('saw_drawing_ivy');

  await lookAtCubby(page, 'IVY');
  await use(page);
  expect(await items(page)).toEqual([]);
});

// Stand in front of the music box on the west dorm table and aim at a key
// (0..4, left to right) or the crank slot ('slot').
const lookAtMusicBox = (page, part) => page.evaluate((part) => {
  const game = window.__stAgnes;
  let box = null;
  game.world.levelGroup.traverse((o) => {
    if (o.userData.prop?.id === 'music_box') box = o;
  });
  box.updateWorldMatrix(true, false);
  const local = part === 'slot' ? [0.23, 0.08, 0] : [-0.16 + part * 0.08, 0.15, 0.09];
  const target = box.localToWorld(box.position.clone().set(...local));
  const stand = box.localToWorld(box.position.clone().set(local[0], 0, 0.9));
  Object.assign(game.player.state.position, { x: stand.x, z: stand.z });
  game.player.state.yaw = Math.atan2(-(target.x - stand.x), -(target.z - stand.z));
  game.player.state.pitch = Math.atan2(target.y - game.player.state.eyeHeight, Math.hypot(target.x - stand.x, target.z - stand.z));
  game.advance(1 / 30);
  return game.interaction.target()?.prompt() ?? null;
}, part);
const KEY = { sun: 0, moon: 1, star: 2, bird: 3, heart: 4 };
const TUNE = ['star', 'star', 'moon', 'bird', 'moon', 'heart'];
async function playTune(page) {
  for (const symbol of TUNE) {
    expect((await lookAtMusicBox(page, KEY[symbol]))?.params.symbol).toBe(symbol);
    await use(page);
  }
}
const quietDoor = (page) => page.evaluate(() => window.__stAgnes.world.level.doors.find((d) => d.id === 'quiet_room').revealed ?? false);

test('lullaby: wind the box with the crank, play the chalked tune, the quiet room opens', async ({ page }) => {
  expect((await lookAtMusicBox(page, 'slot'))?.key).toBe('prompt.musicBox');
  await use(page);
  expect(await message(page)).toBe('msg.musicBoxNoCrank');
  await page.evaluate(() => window.__stAgnes.inventory.add('music_box_crank'));
  expect((await lookAtMusicBox(page, 'slot'))?.key).toBe('prompt.fitCrank');
  await use(page);
  expect(await items(page)).toEqual([]);

  // Without the slate read, the right tune does nothing.
  await playTune(page);
  expect(await quietDoor(page)).toBe(false);

  await page.evaluate(() => window.__stAgnes.progress.read('lullaby_chalk'));
  await lookAtMusicBox(page, KEY.sun);
  await use(page); // a wrong note first: only the last six count
  await playTune(page);
  expect(await quietDoor(page)).toBe(true);
  expect(await message(page)).toBe('msg.lullabySolved');

  // The door stays found after a reload.
  await page.evaluate(() => window.__stAgnes.loadLevel('orphanage_wing', 'landing'));
  expect(await quietDoor(page)).toBe(true);
});

test('quiet room: the horse, the statue piece and page one of the file', async ({ page }) => {
  const take = (id, at, height) => page.evaluate(({ at, height }) => {
    const game = window.__stAgnes;
    const level = game.world.level;
    const target = { x: at[0] * level.cellSize, z: at[1] * level.cellSize };
    Object.assign(game.player.state.position, { x: target.x - 0.9, z: target.z });
    game.player.state.yaw = -Math.PI / 2; // facing +x
    game.player.state.pitch = Math.atan2(height - game.player.state.eyeHeight, 0.9);
    game.advance(1 / 30);
    const prompt = game.interaction.target()?.prompt() ?? null;
    game.input.tap('use');
    game.advance(0.3);
    return prompt?.key ?? null;
  }, { at, height });
  expect(await take('horse', [29.8, 5.0], 0.1)).toBe('prompt.take');
  expect(await take('statue', [30.6, 6.4], 0.05)).toBe('prompt.take');
  expect(await take('file', [30.8, 3.8], 0.02)).toBe('prompt.read');
  expect(await items(page)).toEqual(['toy_horse', 'statue_piece']);
  expect(await page.evaluate(() => window.__stAgnes.journal.documents())).toContain('hale_file_1');
});
