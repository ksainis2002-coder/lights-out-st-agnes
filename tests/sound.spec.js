import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors } from './helpers.js';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.keyboard.press('ArrowDown'); // first input starts audio
  await page.waitForFunction(() => window.__stAgnes.sfx.isReady(), null, { timeout: 30000 });
  await page.evaluate(() => {
    const game = window.__stAgnes;
    game.play();
    game.loadLevel('orphanage_wing', 'landing');
  });
});

test('every stride plays a footstep, by floor type', async ({ page }) => {
  const played = await page.evaluate(() => {
    const game = window.__stAgnes;
    game.input.setVirtual('forward', true);
    game.advance(4); // landing (wood) into the corridor (tiles)
    game.input.setVirtual('forward', false);
    return game.sfx.played();
  });
  const steps = (played.step_wood ?? 0) + (played.step_tile ?? 0);
  expect(steps).toBeGreaterThanOrEqual(6);
  expect(played.step_wood).toBeGreaterThan(0);
  expect(played.step_tile).toBeGreaterThan(0);
});

test('doors and the flashlight make sounds; rooms have ambience', async ({ page }) => {
  const result = await page.evaluate(() => {
    const game = window.__stAgnes;
    const c = game.world.level.cellCenter(8, 10);
    Object.assign(game.player.state.position, { x: c.x, z: c.z });
    game.player.state.yaw = 0;
    game.advance(0.1);
    game.input.tap('use');
    game.advance(0.5);
    game.progress.setFlag('tool_flashlight');
    game.input.tap('flashlight');
    game.advance(0.1);
    return { played: game.sfx.played(), beds: game.sfx.beds() };
  });
  expect(result.played.door_use).toBe(1);
  expect(result.played.flashlight_click).toBe(1);
  expect(result.beds).toContain('amb_rain_inside');
  expect(result.beds).toContain('amb_wind_corridor');
});

test('the office clock ticks from the clock on the wall, not everywhere', async ({ page }) => {
  const result = await page.evaluate(() => {
    const game = window.__stAgnes;
    game.loadLevel('orphanage_wing', 'landing');
    const c = game.world.level.cellCenter(17, 15);
    Object.assign(game.player.state.position, { x: c.x, z: c.z });
    game.advance(0.2);
    const hasClockProp = game.world.level.props.some((p) => p.type === 'wallClock');
    return { played: game.sfx.played(), beds: game.sfx.beds(), hasClockProp };
  });
  expect(result.hasClockProp).toBe(true);
  expect(result.played.amb_clock).toBeGreaterThanOrEqual(1);
  expect(result.beds).not.toContain('amb_clock');
});

test('the main menu plays the lullaby until a game starts', async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.keyboard.press('ArrowDown');
  await page.waitForFunction(() => window.__stAgnes.sfx.isReady(), null, { timeout: 30000 });
  await page.waitForFunction(() => window.__stAgnes.sfx.beds().includes('mus_lullaby_hum'));
  await page.evaluate(() => window.__stAgnes.newGame());
  await page.waitForFunction(() => !window.__stAgnes.sfx.beds().includes('mus_lullaby_hum'));
  expect(await page.evaluate(() => window.__stAgnes.sfx.beds())).toContain('amb_building_hum');
});

// The school wing's own sounds (sound list 0.3, priority 1).
test('outdoors: rain and wind beds, footsteps on gravel and grass', async ({ page }) => {
  const result = await page.evaluate(() => {
    const game = window.__stAgnes;
    game.loadLevel('grounds', 'garden_door');
    const size = game.world.level.cellSize;
    const walk = (cells) => cells.forEach(([c, r]) => {
      Object.assign(game.player.state.position, { x: c * size, z: r * size });
      game.advance(0.05);
    });
    walk([[5.5, 15.5], [6.5, 15.5], [7.5, 15.5], [8.5, 15.5]]); // the courtyard's gravel
    walk([[8.5, 4.5], [9.5, 4.5], [10.5, 4.5], [11.5, 4.5]]); // the cemetery's grass
    return { beds: game.sfx.beds(), played: game.sfx.played() };
  });
  expect(result.beds).toEqual(expect.arrayContaining(['amb_rain_outside', 'amb_wind_outside']));
  expect(result.beds).not.toContain('amb_rain_inside');
  expect(result.played.step_gravel).toBeGreaterThanOrEqual(2);
  expect(result.played.step_grass).toBeGreaterThanOrEqual(2);
});

test('the classrooms have their own room tone', async ({ page }) => {
  const beds = await page.evaluate(() => {
    const game = window.__stAgnes;
    game.loadLevel('school_ground', 'front_door');
    const size = game.world.level.cellSize;
    Object.assign(game.player.state.position, { x: 12.5 * size, z: 15.5 * size }); // Classroom 1
    game.advance(0.1);
    return game.sfx.beds();
  });
  expect(beds).toContain('amb_classroom');
  expect(beds).not.toContain('amb_building_hum');
});

test('each school wing event plays its own sound, not a stand-in', async ({ page }) => {
  const errors = trackErrors(page);
  const played = await page.evaluate(() => {
    const game = window.__stAgnes;
    game.loadLevel('school_ground', 'front_door');
    const at = { x: 10, y: 1, z: 10 };
    const fire = (name, payload) => game.events.emit(name, payload);
    fire('watcher.moved', { position: at });
    fire('watcher.breath', { position: at });
    fire('records.wheel', 0);
    fire('setPiece.ring', { position: at });
    fire('setPiece.ringStop');
    fire('setPiece.doorBang', game.world.level.doors[0]);
    fire('setPiece.projector', { position: at });
    fire('setPiece.filmSnap');
    fire('storm.thunder', { outdoors: true });
    fire('chalk.scratch', { position: at });
    fire('trick.scrape', { position: at });
    fire('hopscotch.wrong');
    fire('prop.opened', { use: 'lid', at: [10, 10] });
    fire('prop.opened', { use: 'note', at: [10, 10] });
    fire('door.opened', { cell: [5, 5], look: 'gate' });
    // Files with no event yet (or played by other code) must exist too.
    ['girl_hum', 'mus_drone_school', 'step_stone', 'book_drop', 'match_strike'].forEach((name) => game.sfx.play(name, { volume: 0 }));
    return game.sfx.played();
  });
  const expected = ['stone_grind', 'stone_near_breath', 'lock_wheel_click', 'school_bell', 'door_bang', 'projector', 'projector_stop',
    'thunder_close', 'chalk_write', 'chair_scrape', 'rope_slap', 'giggle_close', 'desk_lid', 'drawer_metal', 'gate_creak'];
  for (const name of expected) expect(played[name], name).toBeGreaterThanOrEqual(1);
  for (const standIn of ['drawer', 'breath_hold', 'fluorescent_buzz', 'swing_chain', 'thunder_far', 'cloth_crouch', 'bed_creak']) {
    expect(played[standIn] ?? 0, standIn).toBe(0);
  }
  expect(errors).toEqual([]);
});
