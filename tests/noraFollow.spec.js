import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, lookAt, use, arrive } from './helpers.js';

// Nora follows you out (0.5, part C; approved still nora_follow; the wing 4
// content sheet; owner 2026-11-18: one pace louder than you). A couple of
// steps behind along your own way, stopping when you stop; her steps carry as
// a walk when you crouch, as a run when you walk; Dr. Venn hears her, and
// finding her he has you both ("I'm sorry. I'm so sorry."); she whispers when
// he is near or you are far; she comes with you up the stairs; a shut door
// on her way she eases open.

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
    ['venn_met', 'nora_met', 'nora_freed', 'nora_following'].forEach((f) => g.progress.setFlag(f));
    g.loadLevel('basement', 'stairs');
    g.heard = [];
    g.events.on('subtitle.shown', ({ key }) => g.heard.push(key));
    g.events.on('noise', (n) => g.heard.push(n));
    g.events.on('nora.step', (step) => g.heard.push({ kind: 'nora', radius: step.radius }));
  });
});

// Venn far off in the laundry and deaf, or where the test puts him.
const venn = (page, at, still = true) => game(page, ({ at, still }) => {
  const g = window.__stAgnes;
  const size = g.world.level.cellSize;
  g.surgeon.moveTo(at[0] * size, at[1] * size);
  if (still) g.surgeon.stun(600);
}, { at, still });
// You at a spot (cells) facing east, Nora behind you.
const startAt = (page, [c, r], yaw = -Math.PI / 2) => game(page, ({ c, r, yaw }) => {
  const g = window.__stAgnes;
  const size = g.world.level.cellSize;
  Object.assign(g.player.state.position, { x: c * size, z: r * size });
  g.player.state.yaw = yaw;
  g.noraFollow.regroup();
  g.advance(0.1);
  g.heard = [];
}, { c, r, yaw });
const her = (page) => game(page, () => {
  const g = window.__stAgnes;
  const p = g.noraFollow.position();
  const size = g.world.level.cellSize;
  return p && [p.x / size, p.z / size];
});
const walkTo = (page, cell, pace) => game(page, ({ cell, pace }) => window.__stAgnes.runBot({ id: 'walk', steps: [{ cell, pace }] }).finished, { cell, pace });
const noises = (page, kind) => game(page, (kind) => window.__stAgnes.heard.filter((h) => typeof h !== 'string' && h.kind === kind), kind);

test('she follows a couple of steps behind along your way, and stops when you stop', async ({ page }) => {
  const errors = trackErrors(page);
  await venn(page, [14, 3]);
  await startAt(page, [6.5, 8.0]);
  const start = await her(page);
  expect(start[0]).toBeLessThan(6.0); // behind you, to the west
  expect(await walkTo(page, [10, 7.5])).toBe(true);
  await advance(page, 1.5);
  const after = await her(page);
  const gap = (10.5 - after[0]) * 1.2;
  expect(gap).toBeGreaterThan(1.3);
  expect(gap).toBeLessThan(2.1);
  await advance(page, 2);
  const still = await her(page);
  expect(Math.hypot(still[0] - after[0], still[1] - after[1])).toBeLessThan(0.05);
  expect(await game(page, () => window.__stAgnes.noraFollow.audible())).toBeNull(); // still: silent
  expect(errors).toEqual([]);
});

test('one pace louder than you: you crouch, her steps carry 4 m; you walk, 10 m', async ({ page }) => {
  const errors = trackErrors(page);
  await venn(page, [14, 3]);
  await startAt(page, [3.5, 8.0]);
  await walkTo(page, [8, 7.5], 'crouch');
  const crouched = await noises(page, 'nora');
  expect(crouched.length).toBeGreaterThan(3);
  expect(new Set(crouched.map((n) => n.radius))).toEqual(new Set([4]));
  await game(page, () => (window.__stAgnes.heard = []));
  await walkTo(page, [16, 7.5]);
  const walked = await noises(page, 'nora');
  expect(walked.length).toBeGreaterThan(3);
  expect(walked.filter((n) => n.radius === 10).length).toBeGreaterThan(walked.length / 2);
  expect(errors).toEqual([]);
});

test('Dr. Venn hears her steps and comes; finding her he has you both: "I\'m sorry. I\'m so sorry."', async ({ page }) => {
  const errors = trackErrors(page);
  await startAt(page, [3.5, 8.0]);
  await venn(page, [1.2, 8.0], false); // just behind her
  const caught = await game(page, () => {
    const g = window.__stAgnes;
    let cause = null;
    g.events.on('surgeon.catch', (c) => (cause = c.cause));
    g.runBot({ id: 'walk', steps: [{ cell: [22, 7.5] }] });
    return { cause, collapsing: g.collapse.active() || g.heard.includes('nora.sorry') };
  });
  expect(caught.cause).not.toBeNull();
  expect(caught.collapsing).toBe(true);
  expect(await game(page, () => window.__stAgnes.heard)).toContain('nora.sorry');
  expect(errors).toEqual([]);
});

test('she whispers: "Is he close?" when he is near; "I can\'t see you" when you are far ahead', async ({ page }) => {
  const errors = trackErrors(page);
  await startAt(page, [10.5, 8.0]);
  await venn(page, [4.0, 8.0], false); // in his round, 6 m off; you both stand still
  await advance(page, 0.5);
  expect(await game(page, () => window.__stAgnes.heard)).toContain('nora.isHeClose');
  expect(await game(page, () => window.__stAgnes.heard.filter((h) => typeof h !== 'string' && h.kind === 'nora'))).toEqual([]); // a whisper he does not hear

  await venn(page, [14, 3]);
  await game(page, () => {
    const g = window.__stAgnes;
    g.heard = [];
    g.player.state.position.x = 21 * g.world.level.cellSize; // far ahead of her, down the corridor
    g.advance(0.3);
  });
  expect(await game(page, () => window.__stAgnes.heard)).toContain('nora.cantSee');
  expect(errors).toEqual([]);
});

test('she comes with you up the back stairs: in the west wing she is behind you', async ({ page }) => {
  const errors = trackErrors(page);
  await venn(page, [14, 3]);
  await game(page, () => {
    const g = window.__stAgnes;
    g.progress.unlock('theatre_back');
    g.progress.setOpen('theatre_back', true);
    g.loadLevel('basement', 'stairs');
  });
  expect(await lookAt(page, [26.9, 15.8], [27.0, 14.9, 0.9])).toBe('prompt.stairsUp');
  await use(page);
  expect(await arrive(page)).toBe('wards_ground');
  const near = await game(page, () => {
    const g = window.__stAgnes;
    const p = g.noraFollow.position();
    const level = g.world.level;
    const cell = level.worldToCell(p.x, p.z);
    return { d: Math.hypot(p.x - g.player.state.position.x, p.z - g.player.state.position.z), solid: level.isSolid(cell.col, cell.row) };
  });
  expect(near.d).toBeLessThan(2);
  expect(near.solid).toBe(false);
  expect(errors).toEqual([]);
});

test('a door shut on her way she eases open, with no bang', async ({ page }) => {
  const errors = trackErrors(page);
  await venn(page, [14, 3]);
  await game(page, () => {
    const g = window.__stAgnes;
    g.world.level.doors.find((d) => d.id === 'coal_door').open = true;
  });
  await startAt(page, [7.5, 3.0], Math.PI); // in the coal store, facing south; she is north of you
  await walkTo(page, [7, 7]);
  await game(page, () => {
    const g = window.__stAgnes;
    g.world.level.doors.find((d) => d.id === 'coal_door').open = false; // shut behind you
    g.heard = [];
  });
  await walkTo(page, [11, 7.5]);
  await advance(page, 3);
  expect(await game(page, () => window.__stAgnes.world.level.doors.find((d) => d.id === 'coal_door').open)).toBe(true);
  expect(await noises(page, 'door')).toEqual([]);
  const at = await her(page);
  expect(at[1]).toBeGreaterThan(6.9); // through it, out in the corridor
  expect(errors).toEqual([]);
});

// Owner 2026-11-20, "freeing Nora steadies you", then "Nora keeps the dark off": with her beside
// you the dark costs nothing.
test('with her beside you, the dark does not wear on you', async ({ page }) => {
  const errors = trackErrors(page);
  await venn(page, [14, 3]);
  await startAt(page, [10.5, 8.5]); // the cold corridor
  const darkFor = (seconds) => game(page, (seconds) => {
    const g = window.__stAgnes;
    g.world.flashlight.setOn(false);
    g.sanity.set(80);
    g.advance(seconds);
    return 80 - g.sanity.value();
  }, seconds);
  const withHer = await darkFor(2);
  await game(page, () => window.__stAgnes.progress.setFlag('nora_left')); // as if she were not with you
  const alone = await darkFor(2);
  expect(alone).toBeGreaterThan(0.05);
  expect(withHer).toBeCloseTo(0, 3);
  expect(errors).toEqual([]);
});
