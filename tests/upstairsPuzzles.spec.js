import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, lookAt, use, message, load } from './helpers.js';

// Wing 2, part B2: the records lock in the headmaster's office (approved
// still ui_codeLock; content sheet answer 354 on Normal) and the part B
// documents.

const game = (page, fn, arg) => page.evaluate(fn, arg);
const flag = (page, name) => game(page, (name) => window.__stAgnes.progress.hasFlag(name), name);
const screen = (page) => game(page, () => {
  const open = window.__stAgnes.ui.current();
  return open ? { name: open.name, wheels: open.wheels?.() ?? null, note: open.note?.() ?? null, chosen: open.chosen?.() ?? null } : null;
});
const keys = async (page, codes) => {
  for (const code of codes) await page.keyboard.press(code);
};

// Stand in front of the records cabinet (west wall of the office) and aim at its lock.
const LOCK = [[30.4, 5.2], [29.58, 5.2, 1.15]];

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => window.__stAgnes.play());
  await load(page, 'school_upper', 'main_stairs');
});

test('records lock: up close, arrows, the wheel and clicks turn the wheels; 0-9 set them in turn', async ({ page }) => {
  const errors = trackErrors(page);
  expect(await lookAt(page, ...LOCK)).toBe('prompt.tryLock');
  await use(page);
  expect(await screen(page)).toMatchObject({ name: 'codeLock', wheels: [0, 0, 0], chosen: 0 });
  await keys(page, ['ArrowUp', 'ArrowUp', 'ArrowRight', 'ArrowDown']);
  expect(await screen(page)).toMatchObject({ wheels: [2, 9, 0], chosen: 1 });
  await game(page, () => window.__stAgnes.ui.current().wheel(-1)); // scrolling up turns it up
  expect((await screen(page)).wheels).toEqual([2, 0, 0]);
  // Click the top half of the third wheel: it is chosen and turns up.
  await game(page, () => window.__stAgnes.ui.current().hits().filter((hit) => hit.click)[4].click());
  expect(await screen(page)).toMatchObject({ wheels: [2, 0, 1], chosen: 2 });
  await keys(page, ['ArrowRight', 'Digit7', 'Digit8', 'Digit9']);
  expect(await screen(page)).toMatchObject({ wheels: [7, 8, 9], chosen: 2 });
  await keys(page, ['Escape']);
  expect(await screen(page)).toBe(null);
  // The wheels stay where they were left.
  await use(page);
  expect((await screen(page)).wheels).toEqual([7, 8, 9]);
  expect(errors).toEqual([]);
});

test('records lock: the board count opens the drawer, once the board has been read', async ({ page }) => {
  expect(await lookAt(page, ...LOCK)).toBe('prompt.tryLock');
  await use(page);
  await keys(page, ['Digit3', 'Digit5', 'Digit4', 'Enter']);
  expect(await screen(page)).toMatchObject({ name: 'codeLock', note: 'msg.recordsWrong' }); // the numbers mean nothing yet
  expect(await flag(page, 'puzzle_records')).toBe(false);
  expect(await flag(page, 'tried_recordsLock')).toBe(true);

  await game(page, () => window.__stAgnes.progress.setFlag('seen_counting_board')); // Classroom 2's lesson
  await keys(page, ['Digit1', 'Enter']);
  expect((await screen(page)).note).toBe('msg.recordsWrong');
  await keys(page, ['Digit4']); // the last wheel back to 4: 3 5 4
  expect((await screen(page)).wheels).toEqual([3, 5, 4]);
  await game(page, () => {
    const lock = window.__stAgnes.ui.current();
    lock.hits().find((hit) => hit.w === 260).click(); // CLICK the drawer
  });
  expect(await screen(page)).toBe(null);
  expect(await message(page)).toBe('msg.recordsOpen');
  expect(await flag(page, 'puzzle_records')).toBe(true);
  expect(await lookAt(page, ...LOCK)).not.toBe('prompt.tryLock');
  const drawerOut = await game(page, () => {
    let open = false;
    window.__stAgnes.world.levelGroup.traverse((o) => {
      if (o.name === 'drawer' && o.userData.open) open = true;
    });
    return open;
  });
  expect(drawerOut).toBe(true);
});

test('the open drawer holds the roll, the medical card and the gate key; the key opens the cemetery gate', async ({ page }) => {
  await game(page, () => {
    const g = window.__stAgnes;
    g.progress.setFlag('puzzle_records');
    g.loadLevel('school_upper', 'main_stairs');
  });
  const stand = [30.5, 5.2];
  expect(await lookAt(page, stand, [29.717, 5.312, 1.265])).toBe('prompt.read');
  await use(page);
  expect(await screen(page)).toMatchObject({ name: 'document' });
  await game(page, () => window.__stAgnes.resume());
  expect(await lookAt(page, stand, [29.717, 5.088, 1.27])).toBe('prompt.read');
  await use(page);
  await game(page, () => window.__stAgnes.resume());
  expect(await lookAt(page, stand, [29.692, 5.2, 1.31])).toBe('prompt.take');
  await use(page);
  const found = await game(page, () => {
    const { journal, inventory } = window.__stAgnes;
    return { clues: journal.clues(), key: inventory.has('gate_key') };
  });
  expect(found.key).toBe(true);
  expect(found.clues).toEqual(expect.arrayContaining(['read_struck_off', 'read_medical_card']));

  await load(page, 'grounds', 'school_door');
  expect(await lookAt(page, [10.5, 10.8], [10.5, 9.5, 1.2])).toBe('prompt.unlock');
  await use(page);
  expect(await message(page)).toBe('msg.unlocked');
});

test("the inspector's report on his desk and the doctor's letter in his flat read in both languages", async ({ page }) => {
  const errors = trackErrors(page);
  for (const language of ['en', 'el']) {
    await game(page, (language) => window.__stAgnes.settings.set('language', language), language);
    expect(await lookAt(page, [32.75, 6.6], [32.75, 5.75, 0.81])).toBe('prompt.read');
    await use(page);
    expect(await screen(page)).toMatchObject({ name: 'document' });
    await page.waitForTimeout(100);
    await game(page, () => window.__stAgnes.resume());
    expect(await lookAt(page, [40.3, 5.2], [40.28, 4.32, 0.62])).toBe('prompt.read');
    await use(page);
    expect(await screen(page)).toMatchObject({ name: 'document' });
    await page.waitForTimeout(100);
    await game(page, () => window.__stAgnes.resume());
  }
  expect(await game(page, () => window.__stAgnes.journal.clues())).toEqual(expect.arrayContaining(['read_inspector_report', 'read_venn_letter']));
  expect(errors).toEqual([]);
});
