import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, lookAt, use, arrive, message } from './helpers.js';

// The way up (0.5, part C; the wing 4 content sheet): up the theatre's back
// stairs into the west wing. The wards are dark and empty: Sister M. no
// longer walks them; Dr. Venn comes up the stairs after you, unseen and
// unable to catch you until he is there, his tools clinking below; then he
// hunts the wards by ear. Out in the courtyard: "The front gate, or my room."

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
    // The west wing done (its lamps dead, Sister M. still walking it), the basement (her radio on its steps
    // heard on the way down), the theatre's key used.
    ['venn_met', 'nun_walking', 'lamps_dead', 'wards_way_out', 'wards_escaped', 'wing_wards_done', 'heard_radio_basement', 'morgue_tommy', 'puzzle_cabinet']
      .forEach((f) => g.progress.setFlag(f));
    g.progress.unlock('theatre_back');
    g.progress.setOpen('theatre_back', true);
    g.loadLevel('basement', 'stairs');
    const size = g.world.level.cellSize;
    g.surgeon.moveTo(12 * size, 3 * size);
    g.surgeon.stun(600);
    g.heard = [];
    g.events.on('subtitle.shown', ({ key }) => g.heard.push(key));
  });
});

const upTheBackStairs = async (page) => {
  expect(await lookAt(page, [26.9, 15.8], [27.0, 14.9, 0.9])).toBe('prompt.stairsUp');
  await use(page);
  expect(await arrive(page)).toBe('wards_ground');
};
const venn = (page) => game(page, () => window.__stAgnes.surgeon.state());

test('up the back stairs: the wards are dark and Sister M. is gone; he comes up after you, and cannot catch you on the stairs', async ({ page }) => {
  const errors = trackErrors(page);
  await upTheBackStairs(page);
  expect(await game(page, () => window.__stAgnes.heard)).toContain('caption.vennOnStairs');
  expect(await game(page, () => window.__stAgnes.journal.clues())).toContain('wards_dark');
  expect(await game(page, () => window.__stAgnes.progress.hasFlag('way_up'))).toBe(true);
  expect(await game(page, () => window.__stAgnes.nun.state().active)).toBe(false);
  expect(await game(page, () => window.__stAgnes.lamps.lit().length)).toBe(0);
  expect((await venn(page)).mode).toBe('rising');
  expect((await venn(page)).seen).toBe(false); // still on the stairs below you
  // Standing right at the stairs while he climbs: he cannot have you yet.
  await game(page, () => {
    const g = window.__stAgnes;
    const size = g.world.level.cellSize;
    Object.assign(g.player.state.position, { x: 7.5 * size, z: 13.2 * size });
  });
  await advance(page, 3);
  expect(await game(page, () => window.__stAgnes.collapse.active())).toBe(false);
  expect((await venn(page)).mode).toBe('rising');
  // His clinking below has its own line; nothing says over it while he climbs.
  expect(await game(page, () => window.__stAgnes.subtitles.current()?.key)).toBe('caption.vennOnStairs');
  await advance(page, 3.5);
  expect((await venn(page)).mode).not.toBe('rising');
  expect((await venn(page)).seen).toBe(true); // up, at the top of the stairs
  expect(errors).toEqual([]);
});

test('once up, he hunts the wards by ear: your steps set him on you', async ({ page }) => {
  const errors = trackErrors(page);
  await upTheBackStairs(page);
  await advance(page, 7); // he is up, listening at the stairs
  await game(page, () => window.__stAgnes.runBot({ id: 'walk', steps: [{ cell: [7, 9] }, { cell: [10, 9] }] }));
  expect(['listening', 'coming', 'searching']).toContain((await venn(page)).mode);
  expect(errors).toEqual([]);
});

test('before the way out he is not in the wards', async ({ page }) => {
  const errors = trackErrors(page);
  await game(page, () => window.__stAgnes.loadLevel('wards_ground', 'basement'));
  expect((await venn(page)).active).toBe(false);
  expect(errors).toEqual([]);
});

test('out in the courtyard on the way out: "The front gate, or my room."', async ({ page }) => {
  const errors = trackErrors(page);
  await game(page, () => {
    const g = window.__stAgnes;
    g.progress.setFlag('way_up');
    g.loadLevel('grounds', 'west_wing_door');
  });
  expect(await message(page)).toBe('msg.gateOrRoom');
  expect(errors).toEqual([]);
});
