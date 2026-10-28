import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, lookAt, use, arrive, load } from './helpers.js';

// The school wing's priority 2 sounds (sound list 0.3): where each one plays,
// and the stand-in kept where it worked better (the grab's big sting).

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.keyboard.press('ArrowDown'); // first input starts audio
  await page.waitForFunction(() => window.__stAgnes.sfx.isReady(), null, { timeout: 30000 });
  await page.evaluate(() => window.__stAgnes.play());
});

const played = (page) => page.evaluate(() => window.__stAgnes.sfx.played());

test('each priority 2 event plays its own sound, not the stand-in', async ({ page }) => {
  const errors = trackErrors(page);
  await load(page, 'school_ground', 'front_door');
  const result = await page.evaluate(() => {
    const game = window.__stAgnes;
    const at = { x: 10, y: 1, z: 10 };
    const fire = (name, payload) => game.events.emit(name, payload);
    fire('prop.searched', { at: [10, 10] }); // the coat pockets
    fire('library.book', true);
    fire('puzzle.solved', 'piano'); // its key drops
    fire('puzzle.solved', 'hopscotch'); // Maggie claps
    fire('setPiece.turn', { position: at }); // the roll call's heads
    fire('lanterns.out');
    fire('lanterns.solved', { position: at });
    fire('watcher.settled', { position: at });
    fire('watcher.chapel', { position: at });
    fire('chalk.written', { taunt: true, position: at });
    fire('door.locked', { cell: [5, 5], look: 'gate' });
    fire('prop.refused', { at: [1, 18.5], chained: true }); // the west wing's chained door
    fire('document.read', { id: 'maggie_note' });
    fire('collapse.grab');
    fire('chalk.tap', { position: at }); // a hint finished
    // Kept for later parts (priority 3): they must load too.
    ['mus_music_box_broken', 'shovel_dig'].forEach((name) => game.sfx.play(name, { volume: 0 }));
    return game.sfx.played();
  });
  const own = ['cloth_rustle', 'book_slide', 'key_drop_wood', 'child_clap', 'mus_stinger_low', 'candle_snuff', 'stone_crack',
    'stone_step', 'church_bell', 'chalk_screech', 'page_turn', 'chalk_tap', 'mus_music_box_broken', 'shovel_dig'];
  for (const name of own) expect(result[name] ?? 0, name).toBeGreaterThanOrEqual(1);
  expect(result.cloth_rustle).toBe(2); // the pockets, and the pupils turning
  expect(result.chain_rattle).toBe(2);
  expect(result.mus_stinger).toBe(1); // only the grab keeps the big sting
  for (const standIn of ['cloth_crouch', 'paper_pickup', 'key_pickup', 'door_locked', 'wooden_toy']) {
    expect(result[standIn] ?? 0, standIn).toBe(0);
  }
  expect(errors).toEqual([]);
});

test('a taunt screeches on the board; a hint does not, nor anything in comfort mode', async ({ page }) => {
  const result = await page.evaluate(() => {
    const game = window.__stAgnes;
    const at = { x: 10, y: 1.5, z: 10 };
    game.events.emit('chalk.written', { taunt: false, position: at });
    const hint = game.sfx.played().chalk_screech ?? 0;
    game.settings.set('comfortMode', true);
    game.events.emit('chalk.written', { taunt: true, position: at });
    const comfort = game.sfx.played().chalk_screech ?? 0;
    game.settings.set('comfortMode', false);
    return { hint, comfort };
  });
  expect(result).toEqual({ hint: 0, comfort: 0 });
});

test('the stairs sound like steps on the treads; a door out still sounds like a door', async ({ page }) => {
  await load(page, 'school_ground', 'front_door');
  expect(await lookAt(page, [28.6, 18.7], [27.67, 18.33, 1.0])).toBe('prompt.stairsUp');
  const before = await played(page);
  await use(page);
  expect(await arrive(page)).toBe('school_upper');
  const up = await played(page);
  expect((up.step_stairs ?? 0) - (before.step_stairs ?? 0)).toBe(3);
  expect(up.door_use ?? 0).toBe(before.door_use ?? 0);
  await page.evaluate(() => window.__stAgnes.travel('patient_room', 'door')); // the flat's door home: a door
  await arrive(page);
  expect(((await played(page)).door_use ?? 0) - (up.door_use ?? 0)).toBe(1);
});

test('the gym and the library have their own room tone; the ball and the whistle only while you are in the gym', async ({ page }) => {
  const result = await page.evaluate(() => {
    const game = window.__stAgnes;
    const random = Math.random;
    Math.random = () => 0; // every timed sound at its shortest gap: the ball every 30 s, the whistle after 90 s
    game.loadLevel('school_ground', 'front_door');
    const size = game.world.level.cellSize;
    const stand = (c, r, seconds = 0.1) => {
      Object.assign(game.player.state.position, { x: c * size, z: r * size });
      game.advance(seconds);
      return game.sfx.beds();
    };
    const library = stand(6, 4);
    const gym = stand(18.5, 6, 31); // the gym: the first bounce comes at 30 s
    const count = () => [game.sfx.played().ball_bounce_gym ?? 0, game.sfx.played().whistle_gym ?? 0];
    const inGym = count();
    stand(30, 16, 31); // the hall: the next bounce is due at 60 s, out of earshot
    const outside = count();
    stand(18.5, 6, 30); // back in the gym at 90 s: a bounce and the whistle
    Math.random = random;
    return { library, gym, inGym, outside, back: count() };
  });
  expect(result.library).toContain('amb_library');
  expect(result.library).not.toContain('amb_building_hum');
  expect(result.gym).toContain('amb_gym_hall');
  expect(result.gym).not.toContain('amb_building_hum');
  expect(result.inGym).toEqual([1, 0]);
  expect(result.outside).toEqual([1, 0]);
  expect(result.back).toEqual([2, 1]);
});

test('outside, crows call from the dead trees and crickets chirp until the storm starts', async ({ page }) => {
  const result = await page.evaluate(() => {
    const game = window.__stAgnes;
    const random = Math.random;
    Math.random = () => 0; // the two crows at their shortest gaps: 25 s and 35 s
    game.loadLevel('grounds', 'garden_door');
    game.advance(36);
    const before = game.sfx.played().crow ?? 0;
    const crickets = game.sfx.beds().includes('amb_night_insects');
    game.progress.setFlag('puzzle_records'); // the storm
    game.advance(90);
    Math.random = random;
    const storm = (game.sfx.played().crow ?? 0) - before;
    game.loadLevel('grounds', 'garden_door'); // out again, in the storm
    game.advance(0.2);
    return { before, crickets, storm, stormCrickets: game.sfx.beds().includes('amb_night_insects') };
  });
  expect(result).toEqual({ before: 2, crickets: true, storm: 0, stormCrickets: false });
});

test('upstairs an old board creaks now and then under a step; downstairs it does not', async ({ page }) => {
  const creaks = (level, spawn, cells) => page.evaluate(({ level, spawn, cells }) => {
    const game = window.__stAgnes;
    const random = Math.random;
    Math.random = () => 0; // every step a chance
    game.loadLevel(level, spawn);
    const size = game.world.level.cellSize;
    const before = game.sfx.played().floorboard_creak ?? 0;
    for (const [c, r] of cells) {
      Object.assign(game.player.state.position, { x: c * size, z: r * size });
      game.advance(0.05);
    }
    Math.random = random;
    return (game.sfx.played().floorboard_creak ?? 0) - before;
  }, { level, spawn, cells });
  // Classroom 3's parquet, along the aisle by the windows; the gym's wooden floor downstairs.
  expect(await creaks('school_upper', 'main_stairs', [[10.5, 13.5], [11.5, 13.5], [12.5, 13.5], [13.5, 13.5]])).toBe(1);
  expect(await creaks('school_ground', 'front_door', [[15.5, 6], [16.5, 6], [17.5, 6], [18.5, 6]])).toBe(0);
});

test('the roll call starts with a ruler slapped on the teacher\'s table', async ({ page }) => {
  const slaps = await page.evaluate(() => {
    const game = window.__stAgnes;
    game.loadLevel('school_upper', 'main_stairs');
    const size = game.world.level.cellSize;
    Object.assign(game.player.state.position, { x: 12.5 * size, z: 13.5 * size }); // in Classroom 3
    game.advance(0.2);
    return game.sfx.played().ruler_slap ?? 0;
  });
  expect(slaps).toBe(1);
});

test('Maggie\'s rope turns while she skips in sight, and stops when she vanishes; her humming goes on', async ({ page }) => {
  const result = await page.evaluate(() => {
    const game = window.__stAgnes;
    game.loadLevel('school_ground', 'front_door');
    const size = game.world.level.cellSize;
    Object.assign(game.player.state.position, { x: 12.5 * size, z: 15.5 * size }); // Classroom 1: her first rhyme
    game.advance(0.2);
    const active = game.ghosts.active();
    const singing = { rope: game.sfx.played().rope_loop ?? 0, turning: Boolean(active?.rope) };
    const her = active.ghost.position;
    Object.assign(game.player.state.position, { x: her.x + 1, z: her.z });
    game.advance(0.2);
    const now = game.ghosts.active();
    return { ...singing, vanished: !now.ghost, stillTurning: Boolean(now.rope), humming: Boolean(now.hum) };
  });
  expect(result).toEqual({ rope: 1, turning: true, vanished: true, stillTurning: false, humming: true });
});
