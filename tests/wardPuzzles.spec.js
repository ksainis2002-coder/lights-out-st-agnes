import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, lookAt, use, load } from './helpers.js';

// Wing 3, part A3: the fuse board (approved still ui_fuseBoard) and the
// dispensary cabinet's medicine round (the content sheet: 3 8 1 5).

const game = (page, fn, arg) => page.evaluate(fn, arg);
const flag = (page, name) => game(page, (name) => window.__stAgnes.progress.hasFlag(name), name);
const screen = (page) => game(page, () => {
  const open = window.__stAgnes.ui.current();
  return open ? { name: open.name, states: open.states?.() ?? null, inHand: open.inHand?.() ?? null, note: open.note?.() ?? null, wheels: open.wheels?.() ?? null } : null;
});
const keys = async (page, codes) => {
  for (const code of codes) await page.keyboard.press(code);
};
const fuses = (page) => game(page, () => window.__stAgnes.inventory.items().filter((item) => item === 'fuse').length);

const BOARD = [[3, 15.7], [3, 17, 1.4]];
const CABINET = [[30.78, 2.3], [30.78, 1.1, 1.42]];
const DISPENSARY_DOOR = [[30.5, 8.6], [30.5, 7.5, 1.2]];

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => window.__stAgnes.play());
  await load(page, 'wards_ground', 'courtyard_door');
});

test('the fuse board: Ward A holds the only fuse; moving it to the dispensary opens its lock and darkens the ward', async ({ page }) => {
  const errors = trackErrors(page);
  expect(await game(page, () => window.__stAgnes.lamps.lit().map((lamp) => lamp.id))).toEqual(['ward_a_1', 'ward_a_2', 'ward_a_3']);
  expect(await lookAt(page, ...DISPENSARY_DOOR)).toBe('prompt.locked');
  expect(await lookAt(page, ...BOARD)).toBe('prompt.openFuseBox');
  await use(page);
  expect(await screen(page)).toMatchObject({ name: 'wardFuses', states: ['live', 'empty', 'empty', 'empty', 'empty', 'empty'], inHand: 0 });

  await keys(page, ['ArrowRight', 'Enter']); // the children's ward: nothing in hand
  expect(await screen(page)).toMatchObject({ note: 'msg.noSpareFuse', inHand: 0 });
  await keys(page, ['ArrowLeft', 'Enter']); // pull Ward A's
  expect(await screen(page)).toMatchObject({ inHand: 1, states: ['empty', 'empty', 'empty', 'empty', 'empty', 'empty'] });
  expect(await flag(page, 'power_ward_a')).toBe(false);
  await keys(page, ['ArrowRight', 'ArrowRight', 'Enter']); // into the dispensary
  expect(await screen(page)).toMatchObject({ inHand: 0, states: ['empty', 'empty', 'live', 'empty', 'empty', 'empty'] });
  expect(await flag(page, 'power_dispensary')).toBe(true);
  await keys(page, ['Escape']);
  expect(await game(page, () => window.__stAgnes.lamps.lit().map((lamp) => lamp.id))).toEqual(['dispensary_1']);
  expect(await lookAt(page, ...DISPENSARY_DOOR)).toBe('prompt.open');
  expect(errors).toEqual([]);
});

test('lamps she has put out show dark red on the board, and burn again when the fuse is pulled and pushed in', async ({ page }) => {
  await game(page, () => ['ward_a_1', 'ward_a_2', 'ward_a_3'].forEach((id) => window.__stAgnes.lamps.snuff(id)));
  await lookAt(page, ...BOARD);
  await use(page);
  expect((await screen(page)).states[0]).toBe('out');
  await keys(page, ['Enter', 'Enter']);
  expect((await screen(page)).states[0]).toBe('live');
  expect(await game(page, () => window.__stAgnes.lamps.lit().length)).toBe(3);
});

test('a lit room draws her: she walks to the lamps of a circuit you power and puts them out', async ({ page }) => {
  const result = await game(page, () => {
    const g = window.__stAgnes;
    ['nun_walking', 'lamp_out_ward_a_1', 'lamp_out_ward_a_2', 'lamp_out_ward_a_3'].forEach((name) => g.progress.setFlag(name));
    g.loadLevel('wards_ground', 'courtyard_door');
    g.world.flashlight.setOn(false);
    const size = g.world.level.cellSize;
    Object.assign(g.player.state.position, { x: 35.5 * size, z: 3 * size }); // in the nurses' station, out of her way
    g.progress.setFlag('power_childrens_ward');
    g.lamps.power('childrens_ward', true);
    const lit = g.lamps.lit().map((lamp) => lamp.id);
    let seconds = 0;
    while (g.lamps.lit().length && seconds < 240) {
      g.advance(0.5);
      seconds += 0.5;
    }
    return { lit, left: g.lamps.lit().length, seconds };
  });
  expect(result.lit).toEqual(['childrens_ward_1', 'childrens_ward_2']);
  expect(result.left).toBe(0);
});

test('the medicine round: the numbers mean nothing until the card is read; 3 8 1 5 opens the cabinet', async ({ page }) => {
  const errors = trackErrors(page);
  expect(await lookAt(page, ...CABINET)).toBe('prompt.tryLock');
  await use(page);
  expect(await screen(page)).toMatchObject({ name: 'codeLock', wheels: [0, 0, 0, 0] });
  await keys(page, ['Digit3', 'Digit8', 'Digit1', 'Digit5', 'Enter']);
  expect(await screen(page)).toMatchObject({ wheels: [3, 8, 1, 5], note: 'msg.cabinetWrong' });
  await keys(page, ['Escape']);
  await game(page, () => window.__stAgnes.progress.read('night_round'));
  await lookAt(page, ...CABINET);
  await use(page);
  await keys(page, ['Enter']);
  expect(await flag(page, 'puzzle_medicine')).toBe(true);
  expect(await screen(page)).toBe(null);

  // On the table under it now: a fuse, pills, the music box's cylinder.
  // (The pills last: the first bottle picked up opens its item card.)
  for (const [x, item] of [[30.15, 'fuse'], [30.9, 'music_box_cylinder'], [30.5, 'pills']]) {
    expect(await lookAt(page, [x, 2.3], [x, 1.62, 0.81])).toBe('prompt.take');
    await use(page);
    expect(await game(page, (item) => window.__stAgnes.inventory.has(item), item)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('three fuses: the one in the baths and the cabinet\'s power the stairs gate; upstairs is not built yet', async ({ page }) => {
  expect(await lookAt(page, [2.5, 2.9], [2.5, 1.93, 0.65])).toBe('prompt.take'); // on the rim of the first tub
  await use(page);
  expect(await fuses(page)).toBe(1);
  await lookAt(page, ...BOARD);
  await use(page);
  await keys(page, ['ArrowDown', 'ArrowRight', 'Enter', 'Escape']); // socket 5 of 6: the stairs
  expect(await flag(page, 'power_stairs')).toBe(true);
  expect(await flag(page, 'puzzle_ward_fuses')).toBe(true);
  expect(await lookAt(page, [38.5, 8.6], [38.5, 7.5, 1.2])).toBe('prompt.open');
  expect(await lookAt(page, [39, 6.2], [39, 5.6, 0.9])).toBe('prompt.notYet');
});

test('stuck on the fuse board for a few minutes, Edith gives her hint once', async ({ page }) => {
  const lines = await game(page, () => {
    const g = window.__stAgnes;
    ['edith_met', 'tried_wardFuses'].forEach((name) => g.progress.setFlag(name));
    const shown = [];
    g.events.on('subtitle.shown', (line) => shown.push(line.key));
    for (let t = 0; t < 400; t += 0.5) g.advance(0.5);
    return shown.filter((key) => key.startsWith('edith.hint'));
  });
  expect(lines).toEqual(['edith.hint.fuses']);
});
