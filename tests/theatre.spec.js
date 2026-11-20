import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { waitForBoot, trackErrors, lookAt, use, message, arrive } from './helpers.js';

// The theatre (0.5, part C; approved stills theatre_door, theatre_nora,
// nora_close, cabinet_lock; the wing 4 content sheet; owner's picks
// 2026-11-18/19): its door locked until page four; Nora on Dr. Venn's table,
// three buckles to free her; the cabinet's lock opened by ear (the note
// missing from Edith's tune: the sun), the key to the back door inside; walk
// out through the back door without her and it shuts behind you for good.

const basement = JSON.parse(readFileSync(new URL('../src/levels/basement.json', import.meta.url), 'utf8'));
const SIZE = basement.cellSize;
const NORA = basement.nora;
const KEY = basement.pickups.find((p) => p.id === 'theatre_key');
const game = (page, fn, arg) => page.evaluate(fn, arg);
const advance = (page, seconds) => game(page, (s) => window.__stAgnes.advance(s), seconds);
// A point on the table (its frame, metres) in cells, and its height: [c, r, y].
const onTable = ([x, y, z]) => [NORA.at[0] + x / SIZE, NORA.at[1] + z / SIZE, NORA.y + y];
const FACE = onTable([-0.04, 0.19, -0.67]);
const BUCKLES = [[-0.25, 0.178, -0.38], [-0.18, 0.188, -0.08], [-0.16, 0.128, 0.6]].map(onTable);
// The cabinet's lock: the cabinet turned 90° on the west wall, the lock at its local (0.32, 0.97, 0.24).
const cabinet = basement.props.find((p) => p.id === 'theatre_cabinet');
const LOCK = [cabinet.at[0] + 0.24 / SIZE, cabinet.at[1] - 0.32 / SIZE, 0.97];

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await game(page, () => {
    const g = window.__stAgnes;
    g.realTime = false; // time moves only by advance()
    g.newGame();
    g.intro.finish();
    g.progress.setFlag('venn_met');
    g.inventory.add('music_box'); // Edith's, from wing 3
    g.loadLevel('basement', 'stairs');
    const size = g.world.level.cellSize;
    g.surgeon.moveTo(12 * size, 3 * size); // in the laundry, deaf for the test
    g.surgeon.stun(600);
    g.heard = [];
    g.events.on('subtitle.shown', ({ key }) => g.heard.push(key));
    g.events.on('noise', (n) => g.heard.push(n));
  });
});

const flags = (page, names) => game(page, (names) => names.filter((n) => window.__stAgnes.progress.hasFlag(n)), names);
const heard = (page) => game(page, () => window.__stAgnes.heard);
const door = (page, id) => game(page, (id) => {
  const d = window.__stAgnes.world.level.doors.find((candidate) => candidate.id === id);
  return { open: d.open, locked: d.locked ?? null };
}, id);
// In with the theatre door open (its lock needs page four).
const intoTheatre = (page) => game(page, () => {
  const g = window.__stAgnes;
  g.progress.setFlag('morgue_tommy');
  g.world.level.doors.find((d) => d.id === 'theatre_door').open = true;
});
const standAt = (page, [c, r], seconds = 0.5) => game(page, ({ c, r, seconds }) => {
  const g = window.__stAgnes;
  Object.assign(g.player.state.position, { x: c * g.world.level.cellSize, z: r * g.world.level.cellSize });
  g.advance(seconds);
}, { c, r, seconds });

test('the theatre door is locked until page four; through its glass, a lamp over a table', async ({ page }) => {
  const errors = trackErrors(page);
  expect(await lookAt(page, [21.5, 8.0], [21.5, 9.5, 1.2])).toBe('prompt.locked');
  await use(page);
  expect(await message(page)).toBe('msg.theatreLocked');
  await game(page, () => window.__stAgnes.progress.setFlag('morgue_tommy'));
  expect(await lookAt(page, [21.5, 8.0], [21.5, 9.5, 1.2])).toBe('prompt.openSlowly');
  expect(errors).toEqual([]);
});

test('Nora hears you come in and pleads when you lean over her; three buckles, eased open, free her', async ({ page }) => {
  const errors = trackErrors(page);
  await intoTheatre(page);
  await standAt(page, [21.5, 10.8], 1.5);
  expect(await heard(page)).toContain('nora.whoIsThat');
  expect(await game(page, () => window.__stAgnes.subtitles.speaker())).toBe('Nora');
  expect(await flags(page, ['nora_met'])).toEqual(['nora_met']);

  // Close over her face: she pleads; the look line.
  expect(await lookAt(page, [FACE[0], FACE[1] - 0.62], FACE)).toBe('prompt.look');
  await advance(page, 0.5);
  expect(await heard(page)).toContain('nora.please');
  await use(page);
  expect(await message(page)).toBe('msg.noraLook');

  // The three buckles, from her side: each one quietly. Freeing her steadies you (+30).
  await game(page, () => window.__stAgnes.sanity.set(40));
  for (const [i, buckle] of BUCKLES.entries()) {
    expect(await lookAt(page, [20.6, buckle[1]], buckle)).toBe('prompt.undoStraps');
    await use(page);
    expect(await game(page, () => window.__stAgnes.progress.getValue('nora_straps'))).toHaveLength(i + 1);
    if (i < 2) expect(await lookAt(page, [20.6, buckle[1]], buckle)).not.toBe('prompt.undoStraps');
  }
  const said = await heard(page);
  expect(said.filter((h) => h === 'caption.buckle')).toHaveLength(3);
  expect(said.filter((h) => typeof h !== 'string')).toEqual([]); // no noise: he does not hear a buckle eased open
  expect(await flags(page, ['nora_freed'])).toEqual(['nora_freed']);
  expect(await game(page, () => window.__stAgnes.sanity.value())).toBeGreaterThanOrEqual(69); // 40 + 30, less a moment of dark
  expect(await game(page, () => window.__stAgnes.journal.clues())).toContain('nora_freed');
  await advance(page, 16);
  expect(await heard(page)).toEqual(expect.arrayContaining(['nora.freed1', 'nora.freed2', 'nora.freed3']));
  expect(await game(page, () => window.__stAgnes.nora.state())).toBe('free');

  // Back again: she is still free, on her feet by the table.
  await game(page, () => window.__stAgnes.loadLevel('basement', 'stairs'));
  expect(await game(page, () => {
    let standing = false;
    window.__stAgnes.world.levelGroup.traverse((o) => o.userData.joints && (standing = true));
    return standing;
  })).toBe(true);
  expect(errors).toEqual([]);
});

test('the cabinet: up close a wrong key does not give; the sun, the gap in Edith\'s tune, clicks it open; its key opens the back door', async ({ page }) => {
  const errors = trackErrors(page);
  await intoTheatre(page);
  expect(await lookAt(page, [LOCK[0] + 0.9, LOCK[1]], LOCK)).toBe('prompt.look');
  await use(page);
  expect(await game(page, () => [window.__stAgnes.mode, window.__stAgnes.ui.current()?.name])).toEqual(['ui', 'cabinetLock']);
  expect(await message(page)).toBe('msg.cabinet');
  expect(await game(page, () => window.__stAgnes.journal.clues())).toContain('cabinet_lock');

  await game(page, () => window.__stAgnes.ui.current().key('Digit3')); // the star
  expect(await heard(page)).toContain('caption.lockNoGive');
  // Its answer shows up close, over the plate.
  expect(await game(page, () => {
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 270;
    const ctx = canvas.getContext('2d');
    window.__stAgnes.ui.current().draw(ctx);
    const px = ctx.getImageData(150, 44, 180, 14).data;
    let lit = 0;
    for (let i = 0; i < px.length; i += 4) if (px[i] + px[i + 1] + px[i + 2] > 300) lit += 1;
    return lit;
  })).toBeGreaterThan(50);
  expect(await flags(page, ['puzzle_cabinet'])).toEqual([]);
  await game(page, () => window.__stAgnes.ui.current().key('Digit1')); // the sun
  expect(await heard(page)).toContain('caption.lockClicks');
  expect(await flags(page, ['puzzle_cabinet'])).toEqual(['puzzle_cabinet']);
  expect(await game(page, () => window.__stAgnes.mode)).toBe('playing');
  await advance(page, 2);

  // The key on the shelf inside.
  expect(await lookAt(page, [KEY.at[0] + 0.85, KEY.at[1]], [KEY.at[0], KEY.at[1], KEY.y + 0.02])).toBe('prompt.take');
  await use(page);
  expect(await game(page, () => window.__stAgnes.inventory.has('theatre_key'))).toBe(true);

  // The back door: locked with its line before, unlocked with the key now.
  expect(await lookAt(page, [24.3, 15.5], [25.5, 15.5, 1.2])).toBe('prompt.unlock');
  await use(page);
  expect((await door(page, 'theatre_back')).locked).toBeNull();
  expect(errors).toEqual([]);
});

test('without the key the back door says where it goes', async ({ page }) => {
  const errors = trackErrors(page);
  await intoTheatre(page);
  expect(await lookAt(page, [24.3, 15.5], [25.5, 15.5, 1.2])).toBe('prompt.locked');
  await use(page);
  expect(await message(page)).toBe('msg.theatreBackDoor');
  expect(errors).toEqual([]);
});

test('walk out through the back door without her: it swings shut behind you, her voice, then silence; the table is empty', async ({ page }) => {
  const errors = trackErrors(page);
  await intoTheatre(page);
  await standAt(page, [21.5, 10.8], 1);
  await game(page, () => {
    const g = window.__stAgnes;
    g.progress.unlock('theatre_back');
    const back = g.world.level.doors.find((d) => d.id === 'theatre_back');
    back.locked = null;
    back.open = true;
  });
  await standAt(page, [26.6, 15.5], 0.2);
  expect(await flags(page, ['nora_left'])).toEqual(['nora_left']);
  expect((await door(page, 'theatre_back')).open).toBe(false);
  await advance(page, 8);
  const said = await heard(page);
  expect(said.indexOf('caption.theatreDoorShuts')).toBeLessThan(said.indexOf('nora.dontLeave'));
  expect(said.indexOf('nora.dontLeave')).toBeLessThan(said.indexOf('caption.silence'));
  expect(await game(page, () => window.__stAgnes.journal.clues())).toContain('nora_left');
  expect(await game(page, () => window.__stAgnes.nora.state())).toBe('left behind');
  // Shut for good, and the table empty, after a reload too.
  expect(await lookAt(page, [26.6, 15.5], [25.5, 15.5, 1.2])).toBe('prompt.locked');
  await game(page, () => window.__stAgnes.loadLevel('basement', 'stairs'));
  expect((await door(page, 'theatre_back')).open).toBe(false);
  expect(await game(page, () => {
    let figure = false;
    window.__stAgnes.world.levelGroup.traverse((o) => (o.userData.joints || o.userData.strapped) && (figure = true));
    return figure;
  })).toBe(false);
  expect(errors).toEqual([]);
});

test('freed, she is not left behind; the back stairs go up to the west wing', async ({ page }) => {
  const errors = trackErrors(page);
  await game(page, () => {
    const g = window.__stAgnes;
    g.progress.setFlag('nora_freed');
    g.progress.unlock('theatre_back');
    g.progress.setOpen('theatre_back', true);
    g.loadLevel('basement', 'stairs');
  });
  await standAt(page, [26.6, 15.6], 1);
  expect(await flags(page, ['nora_left'])).toEqual([]);
  expect(await heard(page)).not.toContain('caption.theatreDoorShuts');
  expect(await lookAt(page, [26.9, 15.8], [27.0, 14.9, 0.9])).toBe('prompt.stairsUp');
  await use(page);
  expect(await arrive(page)).toBe('wards_ground');
  expect(errors).toEqual([]);
});
