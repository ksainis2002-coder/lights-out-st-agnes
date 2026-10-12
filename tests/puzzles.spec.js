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
  expect(await lookAtPlate(page, 'bed_2')).toMatchObject({ key: 'prompt.takePlate', params: { name: 'SAM' } });
  await swap(page, 'bed_2', 'bed_4', 'SAM', 'TOMMY');
  expect(await items(page)).toEqual([]);
  expect(await lookAtPlate(page, 'bed_2')).toMatchObject({ key: 'prompt.takePlate', params: { name: 'TOMMY' } });

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
    const target = { x: 17.35 * level.cellSize, y: 0.78, z: 14.1 * level.cellSize };
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
  for (const id of ['linen_ball', 'washroom_doll', 'dining_top']) {
    const prompt = await page.evaluate((id) => {
      const game = window.__stAgnes;
      const level = game.world.level;
      const pickup = { linen_ball: [12.6, 15.5], washroom_doll: [5.8, 16.2], dining_top: [28.6, 16.5] }[id];
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

// Stand in front of the music box on the west dorm table and aim at it.
const lookAtMusicBox = (page) => page.evaluate(() => {
  const game = window.__stAgnes;
  let box = null;
  game.world.levelGroup.traverse((o) => {
    if (o.userData.prop?.id === 'music_box') box = o;
  });
  box.updateWorldMatrix(true, false);
  const target = box.localToWorld(box.position.clone().set(0, 0.12, 0.02));
  const stand = box.localToWorld(box.position.clone().set(0, 0, 0.9));
  Object.assign(game.player.state.position, { x: stand.x, z: stand.z });
  game.player.state.yaw = Math.atan2(-(target.x - stand.x), -(target.z - stand.z));
  game.player.state.pitch = Math.atan2(target.y - game.player.state.eyeHeight, Math.hypot(target.x - stand.x, target.z - stand.z));
  game.advance(1 / 30);
  return game.interaction.target()?.prompt() ?? null;
});
const KEY = { sun: 1, moon: 2, star: 3, bird: 4, heart: 5 };
const TUNE = ['star', 'star', 'moon', 'bird', 'moon', 'heart'];
// Open the box up close and play the tune on its keys (1–5).
async function playTune(page) {
  expect((await lookAtMusicBox(page))?.key).toBe('prompt.playMusicBox');
  await use(page);
  expect(await page.evaluate(() => window.__stAgnes.ui.current()?.name)).toBe('musicBox');
  for (const symbol of TUNE) await page.keyboard.press(`Digit${KEY[symbol]}`);
}
const quietDoor = (page) => page.evaluate(() => window.__stAgnes.world.level.doors.find((d) => d.id === 'quiet_room').revealed ?? false);

test('lullaby: wind the box with the crank, play the chalked tune up close, the quiet room opens', async ({ page }) => {
  test.setTimeout(60_000); // many aimed steps: slow when every test runs at once
  expect((await lookAtMusicBox(page))?.key).toBe('prompt.musicBox');
  await use(page);
  expect(await message(page)).toBe('msg.musicBoxNoCrank');
  await page.evaluate(() => window.__stAgnes.inventory.add('music_box_crank'));
  expect((await lookAtMusicBox(page))?.key).toBe('prompt.fitCrank');
  await use(page);
  expect(await items(page)).toEqual([]);

  // Without the slate read, the right tune does nothing.
  await playTune(page);
  expect(await quietDoor(page)).toBe(false);
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => window.__stAgnes.mode)).toBe('playing');

  await page.evaluate(() => window.__stAgnes.progress.read('lullaby_chalk'));
  await playTune(page);
  expect(await quietDoor(page)).toBe(true);
  expect(await page.evaluate(() => window.__stAgnes.mode)).toBe('playing'); // stepped back to see it
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

test('paper map: taken at the landing, quiet room blank until it is entered, then pencilled in', async ({ page }) => {
  const prompt = await page.evaluate(() => {
    const game = window.__stAgnes;
    const level = game.world.level;
    const target = { x: 2.3 * level.cellSize, z: 9.65 * level.cellSize };
    Object.assign(game.player.state.position, { x: target.x + 0.9, z: target.z });
    game.player.state.yaw = Math.PI / 2; // facing -x
    game.player.state.pitch = Math.atan2(0.78 - game.player.state.eyeHeight, 0.9);
    game.advance(1 / 30);
    return game.interaction.target()?.prompt() ?? null;
  });
  expect(prompt?.key).toBe('prompt.takeMap');
  await use(page);
  expect(await page.evaluate(() => window.__stAgnes.journal.maps())).toEqual(['orphanage_wing']);

  // Walking into the quiet room pencils it in and says so.
  await page.evaluate(() => {
    const game = window.__stAgnes;
    const c = game.world.level.cellCenter(29, 5);
    Object.assign(game.player.state.position, { x: c.x, z: c.z });
    game.advance(0.1);
    const seen = new Set();
    for (let i = 0; i < 300; i++) {
      game.advance(0.1);
      seen.add(game.messages.current()?.key);
    }
    window.__seenMessages = [...seen];
  });
  expect(await page.evaluate(() => window.__seenMessages)).toEqual(expect.arrayContaining(['msg.journal', 'msg.mapPencilled']));
  const state = await page.evaluate(() => ({
    visited: window.__stAgnes.progress.hasFlag('visited_quiet_room'),
    message: window.__stAgnes.messages.current()?.key,
  }));
  expect(state.visited).toBe(true);

  // The MAPS page draws without errors in every state.
  await page.evaluate(() => {
    window.__stAgnes.openScreen('journal');
  });
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => window.__stAgnes.ui.current().tab())).toBe('maps');
});

test('office clock: tells the real time every time, and nothing more', async ({ page }) => {
  const useClock = () => page.evaluate(() => {
    const game = window.__stAgnes;
    const level = game.world.level;
    game.world.now = () => new Date(2026, 9, 11, 15, 7);
    const target = { x: 15.0 * level.cellSize, y: 1.45, z: 15.6 * level.cellSize };
    Object.assign(game.player.state.position, { x: target.x + 1.1, z: target.z });
    game.player.state.yaw = Math.PI / 2; // facing -x
    game.player.state.pitch = Math.atan2(target.y - game.player.state.eyeHeight, 1.1);
    game.advance(1 / 30);
    const prompt = game.interaction.target()?.prompt()?.key ?? null;
    game.input.tap('use');
    game.advance(0.2);
    return { prompt, message: game.messages.current() };
  });
  for (let i = 0; i < 4; i++) {
    const { prompt, message } = await useClock();
    expect(prompt).toBe('prompt.clock');
    expect(message).toMatchObject({ key: 'msg.clockTime', params: { time: '3:07' } });
  }
});

test('Rose\'s note: Tommy leads to Rose\'s bed once the toys are home, and the note lies there', async ({ page }) => {
  const notesShown = () => page.evaluate(() => {
    const game = window.__stAgnes;
    const size = game.world.level.cellSize;
    return game.world.levelGroup.getObjectByName('pickups').children.filter((mesh) =>
      mesh.visible && Math.abs(mesh.position.x / size - 20.8) < 0.4 && Math.abs(mesh.position.z / size - 2.85) < 0.3).length;
  });
  await page.evaluate(() => {
    const game = window.__stAgnes;
    game.progress.setFlag('ghost_tommy_corridor'); // only the new event can fire
  });
  expect(await notesShown()).toBe(0);
  const whisper = await page.evaluate(() => {
    const game = window.__stAgnes;
    game.progress.setFlag('puzzle_toys');
    game.events.emit('puzzle.solved', 'toys');
    const c = game.world.level.cellCenter(22, 10.5);
    Object.assign(game.player.state.position, { x: c.x, z: c.z });
    let line = null;
    const stop = game.events.on('subtitle.shown', (s) => (line = s.key));
    game.advance(2);
    stop();
    return line;
  });
  expect(whisper).toBe('whisper.tommy.wall');
  expect(await notesShown()).toBe(1);
});

test('M opens the journal on the MAPS page, and M closes it', async ({ page }) => {
  await page.evaluate(() => {
    window.__stAgnes.input.tap('map');
    window.__stAgnes.advance(0.1);
  });
  expect(await page.evaluate(() => window.__stAgnes.ui.current()?.tab())).toBe('maps');
  await page.keyboard.press('KeyM');
  expect(await page.evaluate(() => window.__stAgnes.mode)).toBe('playing');
});

test('journal: ▲▼ only change the document on the DOCUMENTS tab', async ({ page }) => {
  await page.evaluate(() => {
    const game = window.__stAgnes;
    ['night_duty', 'dorm_register'].forEach((id) => game.journal.addDocument(id));
    game.openScreen('journal');
  });
  const selected = () => page.evaluate(() => window.__stAgnes.ui.current().selectedDocument());
  await page.keyboard.press('ArrowDown'); // on CLUES: nothing
  await page.keyboard.press('Tab');
  expect(await selected()).toBe('night_duty');
  await page.keyboard.press('ArrowDown');
  expect(await selected()).toBe('dorm_register');
});

test('held note: H in DOCUMENTS holds the chosen note at your side, H in game puts it away', async ({ page }) => {
  await page.evaluate(() => {
    const game = window.__stAgnes;
    ['night_duty', 'dorm_register'].forEach((id) => game.journal.addDocument(id));
    game.openScreen('journal', { tab: 'documents' });
  });
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('KeyH');
  const state = () => page.evaluate(() => ({ held: window.__stAgnes.journal.held(), mode: window.__stAgnes.mode }));
  expect(await state()).toEqual({ held: 'dorm_register', mode: 'playing' });
  await page.evaluate(() => {
    window.__stAgnes.input.tap('hold');
    window.__stAgnes.advance(0.1);
  });
  expect((await state()).held).toBeNull();
});

test('journal: many clues spread over pages turned with ◀▶', async ({ page }) => {
  await page.evaluate(() => {
    const game = window.__stAgnes;
    ['read_dorm_register', 'read_night_duty', 'read_night_rota', 'saw_hymn_board', 'read_letter_peter', 'read_letter_rose', 'read_nurse_log',
      'read_punishment_book', 'took_toy_top', 'took_battery', 'solved_plates', 'solved_fuses', 'read_rose_bed_note', 'read_lullaby_chalk']
      .forEach((id) => game.journal.addClue(id));
    game.openScreen('journal');
  });
  await page.waitForTimeout(200); // let it draw once
  const pages = () => page.evaluate(() => ({ page: window.__stAgnes.ui.current().page(), count: window.__stAgnes.ui.current().pageCount() }));
  expect((await pages()).count).toBeGreaterThan(1);
  await page.keyboard.press('ArrowRight');
  expect((await pages()).page).toBe(1);
  await page.keyboard.press('ArrowLeft');
  expect((await pages()).page).toBe(0);
});
