import { test, expect } from '@playwright/test';
import { waitForBoot, lookAt, use, load } from './helpers.js';

// Wing 2: Maggie, the ghost girl with the skipping rope (content sheet:
// her rhymes are subtitles over her humming, "(a girl, singing)" until her
// name is read; a rhyme that holds a clue counts once it has been sung).

const game = (page, fn, arg) => page.evaluate(fn, arg);
// Step into a cell (x/z in cells), letting the world notice the move.
const goTo = (page, cell, seconds = 0.1) => game(page, ({ cell, seconds }) => {
  const g = window.__stAgnes;
  const size = g.world.level.cellSize;
  Object.assign(g.player.state.position, { x: cell[0] * size, z: cell[1] * size });
  g.advance(seconds);
}, { cell, seconds });
const singing = (page) => game(page, () => {
  const g = window.__stAgnes;
  const active = g.ghosts.active();
  return {
    id: active?.event.id ?? null,
    line: g.subtitles.current()?.key ?? null,
    manner: g.subtitles.current()?.manner ?? null,
    speaker: g.subtitles.speaker(),
    visible: Boolean(active?.ghost),
  };
});
const flag = (page, name) => game(page, (name) => window.__stAgnes.progress.hasFlag(name), name);

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await game(page, () => {
    const g = window.__stAgnes;
    g.newGame();
    g.intro.finish();
  });
  await load(page, 'school_ground', 'front_door');
});

test('in the gym she sings the hopscotch rhyme line by line; then its close-up shows it', async ({ page }) => {
  await goTo(page, [18.5, 10.5]); // the corridor
  await goTo(page, [18.5, 7.5]); // into the gym
  expect(await singing(page)).toEqual({ id: 'maggie_gym', line: 'rhyme.gym.1', manner: 'singing', speaker: 'a girl', visible: true });
  await game(page, () => window.__stAgnes.advance(3.7));
  expect((await singing(page)).line).toBe('rhyme.gym.2');
  expect(await flag(page, 'heard_rhyme_gym')).toBe(false);
  await game(page, () => window.__stAgnes.advance(11));
  expect((await singing(page)).id).toBeNull();
  expect(await flag(page, 'heard_rhyme_gym')).toBe(true);

  expect(await lookAt(page, [17.2, 8.4], [17.2, 7.0, 0.05])).toBe('prompt.hopscotch');
  await use(page);
  const rhyme = await game(page, () => window.__stAgnes.ui.current().rhyme());
  expect(rhyme.startsWith('(a girl, singing) Two for the chalk and seven for the bell,')).toBe(true);
  expect(await game(page, () => window.__stAgnes.ui.current().note())).toBeNull();
});

test('walk up to her and she is gone, but the rhyme goes on to the end', async ({ page }) => {
  await goTo(page, [18.5, 10.5]);
  await goTo(page, [18.5, 7.5]);
  await goTo(page, [17.4, 5.0]);
  expect(await singing(page)).toMatchObject({ id: 'maggie_gym', visible: false });
  await game(page, () => window.__stAgnes.advance(15));
  expect(await flag(page, 'heard_rhyme_gym')).toBe(true);
});

test('leaving the gym mid-song means she sings it again next time', async ({ page }) => {
  await goTo(page, [18.5, 10.5]);
  await goTo(page, [18.5, 7.5]);
  await game(page, () => window.__stAgnes.advance(4));
  await game(page, () => window.__stAgnes.loadLevel('school_ground', 'front_door')); // a tape loaded, say
  expect(await flag(page, 'heard_rhyme_gym')).toBe(false);
  await goTo(page, [18.5, 10.5]);
  await goTo(page, [18.5, 7.5]);
  expect((await singing(page)).line).toBe('rhyme.gym.1');
});

test('the matches rhyme comes once the staff-room drawer is empty, unless the coat has been searched', async ({ page }) => {
  await goTo(page, [42.5, 15.5]);
  expect((await singing(page)).id).toBeNull();
  await game(page, () => window.__stAgnes.progress.setFlag('searched_cloak_pegs_east'));
  await game(page, () => window.__stAgnes.progress.setFlag('matches_missing'));
  await goTo(page, [42.5, 15.6]);
  expect((await singing(page)).id).toBeNull();
  await game(page, () => {
    const g = window.__stAgnes;
    g.newGame();
    g.intro.finish();
    g.loadLevel('school_ground', 'front_door');
    g.progress.setFlag('matches_missing');
    g.progress.setFlag('name_maggie');
  });
  await goTo(page, [42.5, 15.5]);
  expect(await singing(page)).toMatchObject({ id: 'maggie_staff', line: 'rhyme.staff.1', speaker: 'Maggie' });
});
