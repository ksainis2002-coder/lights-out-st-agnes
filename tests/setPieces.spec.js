import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, load } from './helpers.js';
import { dyingAt } from '../src/ghosts/setPieceKit.js';

// Wing 2, part B3: the upstairs set pieces (approved stills bell, roll_call,
// projector_film): each with its tell, a cooldown so two never stack, cut in
// comfort mode, and the flicker and flash settings kept (scare rules).

const game = (page, fn, arg) => page.evaluate(fn, arg);

// Stands the player at a spot (cells) and runs the game for some seconds.
const runAt = (page, at, seconds) => game(page, ({ at, seconds }) => {
  const g = window.__stAgnes;
  const size = g.world.level.cellSize;
  Object.assign(g.player.state.position, { x: at[0] * size, z: at[1] * size });
  g.advance(seconds);
}, { at, seconds });

const EVENTS = ['setPiece.started', 'setPiece.ring', 'setPiece.ringStop', 'setPiece.doorBang', 'setPiece.turn',
  'setPiece.projector', 'setPiece.filmTurn', 'setPiece.filmSnap', 'setPiece.finished'];
const listen = (page) => game(page, (names) => {
  const g = window.__stAgnes;
  g.heard = [];
  names.forEach((name) => g.events.on(name, (data) => g.heard.push(data?.id ? `${name}:${data.id}` : name)));
}, EVENTS);
const heard = (page) => game(page, () => window.__stAgnes.heard);
const doorOpen = (page, id) => game(page, (id) => window.__stAgnes.world.level.doors.find((d) => d.id === id).open, id);
const count = (page, name) => game(page, (name) => {
  let n = 0;
  window.__stAgnes.world.levelGroup.traverse((o) => (n += o.name === name && o.visible ? 1 : 0));
  return n;
}, name);
const lamp = (page, at) => game(page, (at) => {
  let found = null;
  window.__stAgnes.world.levelGroup.traverse((o) => {
    const data = o.userData.light;
    if (o.isPointLight && data && data.at[0] === at[0] && data.at[1] === at[1]) found = { intensity: o.intensity, off: Boolean(data.off) };
  });
  return found;
}, at);

const CORRIDOR = [20.5, 10.8];
const CLASS_3 = [13.0, 13.6];
const CLASS_4 = [22.0, 13.6];

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => window.__stAgnes.play());
  await load(page, 'school_upper', 'main_stairs');
  await listen(page);
});

test('the bell: the corridor goes quiet, the bell rings, the classroom doors bang open one after the other, once', async ({ page }) => {
  const errors = trackErrors(page);
  await runAt(page, CORRIDOR, 0.5);
  expect(await heard(page)).toEqual(['setPiece.started:bell']); // the quiet first
  await runAt(page, CORRIDOR, 1.0);
  expect(await heard(page)).toContain('setPiece.ring');
  await runAt(page, CORRIDOR, 2.0);
  expect((await heard(page)).filter((name) => name.startsWith('setPiece.doorBang'))).toEqual(['setPiece.doorBang:upper_class_4', 'setPiece.doorBang:upper_class_3']);
  expect(await doorOpen(page, 'upper_class_3')).toBe(true);
  await runAt(page, CORRIDOR, 2.5);
  expect((await heard(page)).slice(-2)).toEqual(['setPiece.ringStop', 'setPiece.finished:bell']);
  await runAt(page, [28.0, 12.5], 0.5);
  await runAt(page, CORRIDOR, 2.0);
  expect((await heard(page)).filter((name) => name === 'setPiece.started:bell')).toHaveLength(1);
  expect(errors).toEqual([]);
});

test('comfort mode cuts the set pieces: no bell, the doors stay shut', async ({ page }) => {
  await game(page, () => window.__stAgnes.settings.set('comfortMode', true));
  await runAt(page, CORRIDOR, 6);
  await runAt(page, CLASS_3, 6);
  expect(await heard(page)).toEqual([]);
  expect(await doorOpen(page, 'upper_class_4')).toBe(false);
});

test("the roll call: Classroom 3's lamp dies, faint pupils fill every desk but Tommy's, they turn to you, then the desks are empty", async ({ page }) => {
  const before = await lamp(page, [13.5, 18.4]);
  await runAt(page, CLASS_3, 0.5);
  expect(await heard(page)).toEqual(['setPiece.started:roll_call']);
  await runAt(page, CLASS_3, 0.8); // the lamp has died; the desks fill
  expect(await lamp(page, [13.5, 18.4])).toEqual({ intensity: 0, off: true });
  expect(await count(page, 'head')).toBe(11);
  await runAt(page, CLASS_3, 1.6); // they turn to look at you
  expect(await heard(page)).toContain('setPiece.turn');
  const turned = await game(page, () => {
    const heads = [];
    window.__stAgnes.world.levelGroup.traverse((o) => o.name === 'head' && heads.push(Math.abs(o.rotation.y)));
    return heads.every((turn) => turn > 0.3);
  });
  expect(turned).toBe(true);
  await runAt(page, CLASS_3, 2.0); // the lamp comes back: the desks are empty
  expect(await count(page, 'head')).toBe(0);
  expect(await lamp(page, [13.5, 18.4])).toEqual(before);
});

test('the film: the lamp goes out, the projector runs, the middle child turns, the film snaps off (no white flash with reduce effects)', async ({ page }) => {
  await game(page, () => window.__stAgnes.settings.set('reduceEffects', true));
  await runAt(page, CLASS_4, 1.0);
  expect(await heard(page)).toEqual(['setPiece.started:film', 'setPiece.projector']);
  await runAt(page, CLASS_4, 4.2);
  expect(await heard(page)).toContain('setPiece.filmTurn');
  await runAt(page, CLASS_4, 1.55);
  expect(await heard(page)).toContain('setPiece.filmSnap');
  expect(await count(page, 'filmFlash')).toBe(0);
  await runAt(page, CLASS_4, 1.5);
  expect((await heard(page)).at(-1)).toBe('setPiece.finished:film');
});

test('set pieces never stack: after the bell, the roll call waits out the cooldown', async ({ page }) => {
  await runAt(page, CORRIDOR, 0.2);
  await runAt(page, CLASS_3, 20);
  expect(await heard(page)).not.toContain('setPiece.started:roll_call');
  await runAt(page, CLASS_3, 11);
  expect(await heard(page)).toContain('setPiece.started:roll_call');
});

test('dying lamps flicker twice, or just fade when flicker is off', () => {
  const settings = (off) => ({ settings: { get: (key) => key === 'flickerOff' && off } });
  const flickering = [0.04, 0.12, 0.25, 0.35, 0.7, 1.2].map((t) => dyingAt(settings(false), t, 1.0));
  expect(flickering).toEqual([1, 0, 1, expect.closeTo(0.071, 2), expect.closeTo(0.571, 2), 1]);
  const fading = [0, 0.25, 0.5, 1.0].map((t) => dyingAt(settings(true), t, 1.0));
  expect(fading).toEqual([0, 0.25, 0.5, 1]);
});
