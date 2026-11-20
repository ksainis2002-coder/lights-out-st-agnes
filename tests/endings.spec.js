import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, lookAt, use, message } from './helpers.js';

// The endings (0.5, part C; the wing 4 content sheet; approved stills
// ending_road, ending_lamp, ending_morning, ending_walls, ending_coal,
// end_card; owner picks 2026-11-18): on the way out, Escape at the front
// gate; in your room, after its last change, Acceptance (sanity 65 or more
// and Nora with you) or Becomes the building. Each plays its lines, then its
// card and the endings found (kept for every run), then the title.

const game = (page, fn, arg) => page.evaluate(fn, arg);
const advance = (page, seconds) => game(page, (s) => window.__stAgnes.advance(s), seconds);

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await game(page, () => {
    const g = window.__stAgnes;
    g.realTime = false; // time moves only by advance()
    g.newGame();
    g.intro.finish();
    ['venn_met', 'wing_wards_done', 'wards_escaped', 'lamps_dead', 'agnes_whole', 'way_up'].forEach((f) => g.progress.setFlag(f));
    g.lines = [];
    g.events.on('ending.line', ({ key }) => g.lines.push(key));
  });
});

const withNora = (page) => game(page, () => ['nora_met', 'nora_freed', 'nora_following'].forEach((f) => window.__stAgnes.progress.setFlag(f)));
const sanity = (page, value) => game(page, (value) => {
  const s = window.__stAgnes.sanity;
  s.restore(100);
  s.drain(100 - value, 'test');
}, value);
// Plays the ending out to its card.
const playOut = (page) => game(page, () => {
  const g = window.__stAgnes;
  for (let t = 0; t < 60 && g.ending.active(); t += 0.25) g.advance(0.25);
  const screen = g.ui.current();
  return { active: g.ending.active(), screen: screen?.name ?? null, lines: g.lines };
});
const found = (page) => game(page, () => JSON.parse(localStorage.getItem('st-agnes:endings') ?? 'null'));

test('Escape: on the way out the front gate opens; the road, the roll, your bed; its card; the title after', async ({ page }) => {
  const errors = trackErrors(page);
  await game(page, () => window.__stAgnes.loadLevel('grounds', 'west_wing_door'));
  expect(await message(page)).toBe('msg.gateOrRoom');
  expect(await lookAt(page, [16.5, 20.2], [16.5, 21.5, 1.2])).toBe('prompt.openGate');
  await use(page);
  expect(await game(page, () => window.__stAgnes.ending.kind())).toBe('escape');
  const end = await playOut(page);
  expect(end.lines).toEqual(['ending.escape.1', 'ending.escape.2', 'ending.escape.3', 'ending.escape.4', 'ending.escape.6', 'ending.escape.7']); // no Nora: not her line
  expect(end.screen).toBe('endCard');
  expect(await game(page, () => window.__stAgnes.world.level.id)).toBe('patient_room'); // back in your bed
  await page.waitForTimeout(900);
  await game(page, () => window.__stAgnes.ui.current().key('Enter'));
  expect(await game(page, () => window.__stAgnes.ui.current()?.name)).toBe('menu');
  expect(errors).toEqual([]);
});

test('Escape with Nora: she asks where you are going', async ({ page }) => {
  const errors = trackErrors(page);
  await withNora(page);
  await game(page, () => window.__stAgnes.loadLevel('grounds', 'west_wing_door'));
  await game(page, () => window.__stAgnes.ending.start('escape'));
  expect((await playOut(page)).lines).toContain('ending.escape.5');
  expect(errors).toEqual([]);
});

test('your room on the way out: its last change; with sanity high and Nora with you, Acceptance', async ({ page }) => {
  const errors = trackErrors(page);
  await withNora(page);
  await sanity(page, 80);
  await game(page, () => window.__stAgnes.loadLevel('patient_room', 'door'));
  expect(await message(page)).toBe('msg.roomLast');
  expect(await game(page, () => {
    let horse = false;
    window.__stAgnes.world.levelGroup.traverse((o) => o.userData.prop?.id === 'hub_horse' && (horse = true));
    return horse;
  })).toBe(true);
  await advance(page, 6);
  expect(await game(page, () => window.__stAgnes.ending.kind())).toBe('acceptance');
  const end = await playOut(page);
  expect(end.lines).toEqual(['ending.acceptance.1', 'ending.acceptance.2', 'ending.acceptance.3', 'ending.acceptance.4', 'ending.acceptance.5']);
  expect(end.screen).toBe('endCard');
  expect(errors).toEqual([]);
});

test('Becomes the building: sanity low with Nora (she calls from far off), or high without her (a door opens far off)', async ({ page }) => {
  const errors = trackErrors(page);
  await withNora(page);
  await sanity(page, 40);
  await game(page, () => window.__stAgnes.loadLevel('patient_room', 'door'));
  await advance(page, 6);
  expect(await game(page, () => window.__stAgnes.ending.kind())).toBe('building');
  let end = await playOut(page);
  expect(end.lines).toEqual(['ending.building.1', 'ending.building.2', 'ending.building.3', 'ending.building.4', 'ending.building.5nora']);

  // Again, high but alone: she was left on his table.
  await game(page, () => {
    const g = window.__stAgnes;
    g.stop();
    g.newGame();
    g.intro.finish();
    ['way_up', 'nora_met', 'nora_left'].forEach((f) => g.progress.setFlag(f));
    g.lines = [];
  });
  await sanity(page, 90);
  await game(page, () => window.__stAgnes.loadLevel('patient_room', 'door'));
  await advance(page, 6);
  expect(await game(page, () => window.__stAgnes.ending.kind())).toBe('building');
  end = await playOut(page);
  expect(end.lines.at(-1)).toBe('ending.building.5alone');
  expect(errors).toEqual([]);
});

test('the endings you have found are kept for every run: each counts once', async ({ page }) => {
  const errors = trackErrors(page);
  // A run from the title: a new game, on the way out, home, its ending, back to the title.
  const run = async (kind) => {
    await game(page, (kind) => {
      const g = window.__stAgnes;
      g.newGame();
      g.intro.finish();
      g.progress.setFlag('way_up');
      g.loadLevel('patient_room', 'door');
      g.ending.start(kind);
    }, kind);
    await playOut(page);
    await game(page, () => window.__stAgnes.stop());
  };
  await run('escape');
  expect(await found(page)).toEqual(['escape']);
  await run('building');
  await run('escape');
  expect(new Set(await found(page))).toEqual(new Set(['escape', 'building']));
  expect(errors).toEqual([]);
});

test('ENTER skips an ending to its card', async ({ page }) => {
  const errors = trackErrors(page);
  await game(page, () => {
    const g = window.__stAgnes;
    g.loadLevel('grounds', 'west_wing_door');
    g.ending.start('escape');
    g.advance(1);
    g.input.tap?.('use'); // nothing
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' }));
    g.advance(0.1);
  });
  expect(await game(page, () => [window.__stAgnes.ending.active(), window.__stAgnes.ui.current()?.name])).toEqual([false, 'endCard']);
  expect(errors).toEqual([]);
});
