import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, lookAt, use, message, load } from './helpers.js';

// Wing 2, part A2: the ground floor's puzzles and close-ups (content sheet
// answers on Normal; approved stills ui_cardIndex, ui_shelf, ui_piano_shapes,
// ui_hopscotch, ui_countingBoard, ui_painting).

const game = (page, fn, arg) => page.evaluate(fn, arg);
const flag = (page, name) => game(page, (name) => window.__stAgnes.progress.hasFlag(name), name);
const screen = (page) => game(page, () => {
  const open = window.__stAgnes.ui.current();
  return open ? { name: open.name, id: open.id ?? null, note: open.note?.() ?? null, hopped: open.hopped?.() ?? null } : null;
});
const stepBack = (page) => game(page, () => window.__stAgnes.resume());
const has = (page, item) => game(page, (item) => window.__stAgnes.inventory.has(item), item);
// Clicks the n-th clickable spot of the open close-up (drawers, books, keys, in order).
const click = (page, n) => game(page, (n) => window.__stAgnes.ui.current().hits().filter((hit) => hit.click)[n].click(), n);
const press = async (page, keys) => {
  for (const key of keys) await page.keyboard.press(`Digit${key}`);
};

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => window.__stAgnes.play());
  await load(page, 'school_ground', 'front_door');
});

test("Maggie's desk: the lid lifts once to show her name, and her library ticket inside", async ({ page }) => {
  const stand = [14.6, 15.4];
  expect(await lookAt(page, stand, [13.8, 15.4, 0.78])).toBe('prompt.liftLid');
  await use(page);
  expect(await message(page)).toBe('msg.maggieDesk');
  expect(await flag(page, 'name_maggie')).toBe(true);
  expect(await lookAt(page, stand, [13.736, 15.331, 0.742])).toBe('prompt.read');
  await use(page);
  expect(await screen(page)).toMatchObject({ name: 'document' });
  expect(await game(page, () => window.__stAgnes.journal.clues())).toContain('read_library_ticket');
  await stepBack(page);
  expect(await lookAt(page, stand, [13.8, 15.4, 0.78])).not.toBe('prompt.liftLid');
});

test('the library: the ticket names the book, drawer S gives its shelf, book 784 holds her song', async ({ page }) => {
  const cardIndex = [[4.0, 7.6], [4.0, 8.582, 0.95]];
  expect(await lookAt(page, ...cardIndex)).toBe('prompt.cardIndex');
  await use(page);
  expect(await message(page)).toBe('msg.cardIndexNoTitle');
  expect(await screen(page)).toBeNull();

  await game(page, () => window.__stAgnes.progress.read('library_ticket'));
  await use(page);
  expect(await screen(page)).toMatchObject({ name: 'cardIndex', note: null });
  await click(page, 3);
  expect((await screen(page)).note).toBe('cardIndex.wrongDrawer');
  await click(page, 18); // S (English) and Τ (Greek): the title's first letter
  expect((await screen(page)).note).toBe('msg.cardFound');
  expect(await game(page, () => window.__stAgnes.ui.current().found())).toBe(18);
  expect(await game(page, () => window.__stAgnes.journal.clues())).toContain('found_library_card');
  await stepBack(page);

  expect(await lookAt(page, [6.6, 4.57], [7.792, 4.57, 1.2])).toBe('prompt.shelves');
  await use(page);
  expect(await screen(page)).toMatchObject({ name: 'shelf', note: null });
  await click(page, 10); // book 780
  expect((await screen(page)).note).toBe('shelf.wrongBook');
  await click(page, 14); // book 784: her song is inside
  expect(await screen(page)).toMatchObject({ name: 'document' });
  expect(await flag(page, 'puzzle_library')).toBe(true);
  expect(await game(page, () => window.__stAgnes.progress.isRead('my_song'))).toBe(true);
});

test("the piano: Maggie's six shapes drop the headmaster's key", async ({ page }) => {
  const keys = [[30.5, 4.6], [30.5, 3.417, 0.75]];
  expect(await lookAt(page, ...keys)).toBe('prompt.playPiano');
  await use(page);
  expect(await message(page)).toBe('msg.pianoStickers');
  expect(await screen(page)).toBeNull();

  await game(page, () => window.__stAgnes.progress.read('my_song'));
  await use(page);
  expect(await screen(page)).toMatchObject({ name: 'piano' });
  await press(page, [1, 2, 3, 5, 5, 3, 6, 5]);
  expect(await flag(page, 'puzzle_piano')).toBe(false);
  await press(page, [5, 5, 3, 6, 5, 3]); // blue star, blue star, yellow triangle, purple cross, blue star, yellow triangle
  expect(await flag(page, 'puzzle_piano')).toBe(true);
  expect(await screen(page)).toBeNull(); // stepped back to hear it drop
  expect(await message(page)).toBe('msg.pianoSolved');

  expect(await lookAt(page, [31.05, 4.8], [31.05, 3.95, 0.05])).toBe('prompt.take');
  await use(page);
  expect(await has(page, 'headmaster_key')).toBe(true);
});

test("the hopscotch: Maggie's rhyme gives the squares, and she gives you her rope", async ({ page }) => {
  const grid = [[17.2, 8.4], [17.2, 7.0, 0.05]];
  expect(await lookAt(page, ...grid)).toBe('prompt.hopscotch');
  await use(page);
  expect(await screen(page)).toMatchObject({ name: 'hopscotch', note: 'hopscotch.noRhyme', hopped: [] });
  await press(page, [2]);
  expect((await screen(page)).hopped).toEqual([]);
  await stepBack(page);

  await game(page, () => window.__stAgnes.progress.setFlag('heard_rhyme_gym')); // her rhyme in the gym (part A3)
  await use(page);
  await press(page, [2, 7, 4]);
  expect(await screen(page)).toMatchObject({ note: 'maggie.hopWrong', hopped: [] });
  await press(page, [2, 7, 5, 9]);
  expect((await screen(page)).hopped).toEqual([2, 7, 5, 9]);
  await press(page, [1]);
  expect(await flag(page, 'puzzle_hopscotch')).toBe(true);
  expect(await screen(page)).toBeNull();
  expect(await game(page, () => window.__stAgnes.subtitles.current()?.key)).toBe('maggie.ropeGiven');
  expect(await game(page, () => window.__stAgnes.subtitles.speaker())).toBe('a girl'); // until her name is read

  expect(await lookAt(page, [17.2, 7.0], [17.2, 6.2, 0.05])).toBe('prompt.take');
  await use(page);
  expect(await has(page, 'skipping_rope')).toBe(true);
});

test('the staff-room drawer is empty; the coat with the ribbon has the matches and her note', async ({ page }) => {
  expect(await lookAt(page, [41.6, 14.5], [40.527, 14.5, 0.9])).toBe('prompt.open');
  await use(page);
  expect(await message(page)).toBe('msg.staffDrawerEmpty');
  expect(await flag(page, 'matches_missing')).toBe(true);

  const coat = [[37.6, 15.875], [38.875, 15.875, 1.2]];
  expect(await lookAt(page, ...coat)).toBe('prompt.searchPockets');
  await use(page);
  expect(await has(page, 'matches')).toBe(true);
  expect(await screen(page)).toMatchObject({ name: 'document' });
  expect(await game(page, () => window.__stAgnes.progress.isRead('maggie_note'))).toBe(true);
  await stepBack(page);
  expect(await lookAt(page, ...coat)).not.toBe('prompt.searchPockets'); // searched once
});

test('the counting board and the class painting open up close, in both languages', async ({ page }) => {
  const errors = trackErrors(page);
  expect(await lookAt(page, [19.6, 16.0], [18, 16.0, 1.45])).toBe('prompt.readBoard');
  await use(page);
  expect(await game(page, () => window.__stAgnes.ui.current()?.view)).toBe('board');
  await stepBack(page);
  expect(await lookAt(page, [4.5, 17.6], [4.5, 19, 1.45])).toBe('prompt.lookPainting');
  await use(page);
  expect(await game(page, () => window.__stAgnes.ui.current()?.view)).toBe('painting');
  expect(await game(page, () => window.__stAgnes.journal.clues())).toContain('saw_class_painting');
  for (const language of ['en', 'el']) {
    await game(page, (language) => {
      const { i18n, ui } = window.__stAgnes;
      i18n.setLanguage(language);
      ui.update();
    }, language);
  }
  expect(errors).toEqual([]);
});

test("Maggie's subtitles say \"a girl\" until her name is read, then Maggie in either language", async ({ page }) => {
  const label = () => game(page, () => {
    const { subtitles } = window.__stAgnes;
    subtitles.show('maggie.hopWrong', { speaker: 'maggie' });
    return subtitles.speaker();
  });
  expect(await label()).toBe('a girl');
  await game(page, () => window.__stAgnes.progress.setFlag('name_maggie'));
  expect(await label()).toBe('Maggie');
  await game(page, () => window.__stAgnes.i18n.setLanguage('el'));
  expect(await label()).toBe('Μάγκι');
});

test('the new documents read and draw in both languages; tried puzzles ring the map', async ({ page }) => {
  const errors = trackErrors(page);
  const ids = ['library_ticket', 'my_song', 'maggie_note', 'detention_book', 'fire_drill_log', 'unsent_letter'];
  for (const language of ['en', 'el']) {
    await game(page, ({ ids, language }) => {
      const game = window.__stAgnes;
      game.i18n.setLanguage(language);
      for (const id of ids) {
        game.readDocument(id);
        game.ui.update();
        game.resume();
      }
    }, { ids, language });
  }
  expect(await game(page, () => window.__stAgnes.journal.clues())).toEqual(expect.arrayContaining(ids.map((id) => `read_${id}`)));
  await game(page, () => ['libraryIndex', 'piano', 'hopscotch'].forEach((name) => window.__stAgnes.progress.setFlag(`tried_${name}`)));
  const symbols = await game(page, () => window.__stAgnes.mapMarks('school_ground').filter((mark) => mark.kind === 'puzzle').map((mark) => mark.symbol));
  expect(symbols.sort()).toEqual(['book', 'hop', 'music']);
  await game(page, () => {
    const game = window.__stAgnes;
    game.openScreen('journal', { tab: 'maps' });
    game.ui.update();
  });
  expect(errors).toEqual([]);
});
