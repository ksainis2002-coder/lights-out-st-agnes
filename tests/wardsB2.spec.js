import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, lookAt, use, arrive, message, load } from './helpers.js';

// Wing 3, part B2 (the content sheet): Maggie's writing in the isolation
// cells, seen only in the camcorder's night view; Dr. Venn's door (4 2 6 1)
// and his office (his notes, T. Hale's file page 3, Nora on the radio, a door
// home); the day room television, on once the camcorder is taken.

const game = (page, fn, arg) => page.evaluate(fn, arg);
const flag = (page, name) => game(page, (name) => window.__stAgnes.progress.hasFlag(name), name);
const screen = (page) => game(page, () => {
  const open = window.__stAgnes.ui.current();
  return open ? { name: open.name, wheels: open.wheels?.() ?? null, note: open.note?.() ?? null } : null;
});
const keys = async (page, codes) => {
  for (const code of codes) await page.keyboard.press(code);
};
const LOCK = [[5.3, 8.4], [5.3, 9.0, 1.3]];

// Into a cell, the camcorder up in its night view, facing the writing on the far wall.
const readCell = (page, [col, row]) => game(page, ([col, row]) => {
  const g = window.__stAgnes;
  const size = g.world.level.cellSize;
  g.world.level.doors.forEach((door) => { if (!door.requires) door.open = true; });
  Object.assign(g.player.state.position, { x: col * size, z: row * size });
  g.player.state.yaw = 0; // facing north
  g.player.state.pitch = 0;
  if (!g.camcorder.raised()) g.input.tap('camcorder');
  g.advance(0.1);
  if (!g.camcorder.nightOn()) g.input.tap('nightView');
  g.advance(0.3);
}, [col, row]);

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => {
    const g = window.__stAgnes;
    g.play();
    ['tool_flashlight', 'tool_camcorder'].forEach((name) => g.progress.setFlag(name));
  });
  await load(page, 'wards_upper', 'stairs');
});

test('the cells\' writing is hidden by flashlight, shows in the night view, and reading it notes it', async ({ page }) => {
  const errors = trackErrors(page);
  const before = await game(page, () => {
    let shown = null;
    window.__stAgnes.world.levelGroup.traverse((object) => { if (object.userData.prop?.id === 'cell_writing_1') shown = object.children[0].visible; });
    return shown;
  });
  expect(before).toBe(false);
  await readCell(page, [9.5, 2.6]);
  expect(await flag(page, 'seen_cell_writing_1')).toBe(true);
  expect(await flag(page, 'seen_cell_writing_2')).toBe(false);
  await readCell(page, [13.5, 2.6]);
  expect(await flag(page, 'seen_cell_writing_2')).toBe(true);
  expect(errors).toEqual([]);
});

test('Dr. Venn\'s door: the numbers mean nothing until both cells are read; then 4 2 6 1 opens it', async ({ page }) => {
  expect(await lookAt(page, ...LOCK)).toBe('prompt.tryLock');
  await use(page);
  expect(await screen(page)).toMatchObject({ name: 'codeLock', wheels: [0, 0, 0, 0] });
  await keys(page, ['Digit4', 'Digit2', 'Digit6', 'Digit1', 'Enter']);
  expect(await screen(page)).toMatchObject({ note: 'msg.vennWrong' });
  await keys(page, ['Escape']);
  await game(page, () => ['seen_cell_writing_1', 'seen_cell_writing_2'].forEach((name) => window.__stAgnes.progress.setFlag(name)));
  await lookAt(page, ...LOCK);
  await use(page);
  await keys(page, ['Enter']);
  expect(await flag(page, 'puzzle_venn_door')).toBe(true);
  expect(await lookAt(page, [4.5, 8.4], [4.5, 9.5, 1.2])).toBe('prompt.open');
});

test('Dr. Venn\'s office: his notes, T. Hale\'s file page 3, Nora on his radio, and a door home', async ({ page }) => {
  await game(page, () => window.__stAgnes.progress.setFlag('puzzle_venn_door'));
  await load(page, 'wards_upper', 'stairs');
  const lines = await game(page, () => {
    const g = window.__stAgnes;
    const size = g.world.level.cellSize;
    const shown = [];
    g.events.on('subtitle.shown', (line) => shown.push(line.key));
    Object.assign(g.player.state.position, { x: 5.5 * size, z: 13.0 * size });
    for (let i = 0; i < 40; i++) g.advance(0.5);
    return shown;
  });
  expect(lines).toEqual(['nora.venn.1', 'nora.venn.2']);
  for (const target of [[5.0, 11.35, 0.84], [5.55, 11.55, 0.81]]) {
    expect(await lookAt(page, [target[0], 12.6], target)).toBe('prompt.read');
    await use(page);
    await page.keyboard.press('Escape');
  }
  expect(await game(page, () => ['venn_notes', 'hale_file_3'].map((id) => window.__stAgnes.progress.isRead(id)))).toEqual([true, true]);
  expect(await lookAt(page, [8.4, 11], [9, 11, 1.2])).toBe('prompt.goHome');
  await use(page);
  expect(await arrive(page)).toBe('patient_room');
});

test('the day room television is dead until the camcorder is taken, then all static', async ({ page }) => {
  await game(page, () => window.__stAgnes.progress.load({ flags: ['tool_flashlight'] }));
  await load(page, 'wards_ground', 'courtyard_door');
  const dead = await lookAt(page, [21.4, 13.2], [21.4, 11.9, 1.05]);
  await game(page, () => window.__stAgnes.progress.setFlag('tool_camcorder'));
  await load(page, 'wards_ground', 'courtyard_door');
  expect(dead).toBe(null);
  expect(await lookAt(page, [21.4, 13.2], [21.4, 11.9, 1.05])).toBe('prompt.look');
  await use(page);
  expect(await message(page)).toBe('msg.tvStatic');
});
