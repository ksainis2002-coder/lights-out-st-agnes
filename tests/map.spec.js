import { test, expect } from '@playwright/test';
import { trackErrors, waitForBoot } from './helpers.js';

// Marks on the paper map (owner request 2026-10-14, approved still ui_mapMarks).
const marks = (page) => page.evaluate(() => window.__stAgnes.mapMarks('orphanage_wing'));
const kinds = (list) => list.map((mark) => (mark.symbol ? `${mark.kind}:${mark.symbol}` : mark.kind)).sort();

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

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => {
    const game = window.__stAgnes;
    game.play();
    ['tommy_corridor', 'tommy_washroom', 'tommy_east_dorm', 'tommy_playroom', 'scare_washroom', 'scare_east_dorm', 'scare_corridor_run']
      .forEach((id) => game.progress.setFlag(`ghost_${id}`));
  });
});

test('map marks: the stairs up to your room are safe; a tape recorder shows once you have been near it', async ({ page }) => {
  const seen = await page.evaluate(() => {
    const game = window.__stAgnes;
    game.loadLevel('orphanage_wing', 'landing');
    const far = game.world.level.cellCenter(16, 10);
    Object.assign(game.player.state.position, { x: far.x, z: far.z });
    game.advance(0.1);
    const before = game.mapMarks('orphanage_wing').map((mark) => mark.kind);
    const near = game.world.level.cellCenter(2, 10);
    Object.assign(game.player.state.position, { x: near.x, z: near.z });
    game.advance(0.1);
    return { before, after: game.mapMarks('orphanage_wing').map((mark) => mark.kind) };
  });
  expect(seen.before).toEqual(['safe']);
  expect(seen.after.sort()).toEqual(['recorder', 'safe']);
});

test('map marks: a puzzle is ringed after you first try it, and the ring goes once it is solved', async ({ page }) => {
  await page.evaluate(() => window.__stAgnes.loadLevel('orphanage_wing', 'landing'));
  expect(kinds(await marks(page))).not.toContain('puzzle:music');
  // Trying the music box without its crank only says it needs one, but it counts as found.
  expect((await lookAtMusicBox(page))?.key).toBe('prompt.musicBox');
  await page.evaluate(() => {
    window.__stAgnes.input.tap('use');
    window.__stAgnes.advance(0.3);
  });
  expect(kinds(await marks(page))).toContain('puzzle:music');
  await page.evaluate(() => window.__stAgnes.progress.setFlag('puzzle_lullaby'));
  expect(kinds(await marks(page))).not.toContain('puzzle:music');
});

test('the map with its marks and key draws in both languages without errors', async ({ page }) => {
  const errors = trackErrors(page);
  for (const language of ['en', 'el']) {
    await page.evaluate((language) => {
      const game = window.__stAgnes;
      game.settings.set('language', language);
      game.loadLevel('orphanage_wing', 'landing');
      ['seen_recorder_landing', 'tried_cubbies', 'tried_musicBox', 'tried_fuses', 'tried_namePlates'].forEach((flag) => game.progress.setFlag(flag));
      game.journal.addMap('orphanage_wing');
      game.openScreen('journal', { tab: 'maps' });
    }, language);
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => window.__stAgnes.ui.current()?.tab())).toBe('maps');
    expect(kinds(await marks(page))).toEqual(['puzzle:fuses', 'puzzle:music', 'puzzle:plates', 'puzzle:toys', 'recorder', 'safe']);
    await page.keyboard.press('Escape');
  }
  expect(errors).toEqual([]);
});
