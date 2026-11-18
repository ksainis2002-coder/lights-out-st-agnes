import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors } from './helpers.js';

// Dr. Venn, the blind surgeon (0.5, part B; the wing 4 content sheet; scare
// rules §2, §3, §5): he hears only. A sound stops him (the clinking stops),
// he listens 2 s, then comes; he catches you only if he hears you once he has
// come, or if you walk into him; silent, you can stand a step from him. Walls
// halve a sound. The flash stuns him. A thrown thing or a banged door draws
// him. Sam says over the rewind what he heard. His first crossing cannot
// catch you; the clinking behind you at low sanity is not him and never can.

const game = (page, fn, arg) => page.evaluate(fn, arg);

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await game(page, () => {
    const g = window.__stAgnes;
    g.realTime = false; // time moves only by advance()
    g.newGame();
    g.intro.finish();
    g.heard = [];
    g.events.on('subtitle.shown', ({ key, speaker, whisper }) => g.heard.push(speaker ? `${speaker}${whisper ? '' : ' (spoken)'}: ${key}` : key));
  });
});

// Met already: he walks his round. Him and you placed (cells), you facing west.
async function meet(page, { him, you, flags = [] } = {}) {
  await game(page, ({ him, you, flags }) => {
    const g = window.__stAgnes;
    ['venn_met', ...flags].forEach((f) => g.progress.setFlag(f));
    g.loadLevel('basement', 'stairs');
    const size = g.world.level.cellSize;
    if (him) g.surgeon.moveTo(him[0] * size, him[1] * size);
    if (you) Object.assign(g.player.state.position, { x: you[0] * size, z: you[1] * size });
    g.player.state.yaw = Math.PI / 2; // west
    g.heard = [];
  }, { him, you, flags });
}
const state = (page) => game(page, () => {
  const g = window.__stAgnes;
  const s = g.surgeon.state();
  const size = g.world.level.cellSize;
  return { mode: s.mode, x: s.x / size, z: s.z / size, collapse: g.collapse.active() };
});
const advance = (page, seconds) => game(page, (s) => window.__stAgnes.advance(s), seconds);
const walk = (page, seconds) => game(page, (s) => {
  const g = window.__stAgnes;
  g.input.setVirtual('forward', true);
  g.advance(s);
  g.input.setVirtual('forward', false);
}, seconds);

test('his first crossing passes the stairs foot, clinking; he cannot catch you then; after it, a checkpoint', async ({ page }) => {
  const errors = trackErrors(page);
  const result = await game(page, () => {
    const g = window.__stAgnes;
    let checkpoints = 0;
    g.events.on('checkpoint', () => (checkpoints += 1));
    g.loadLevel('basement', 'stairs');
    const size = g.world.level.cellSize;
    const start = g.surgeon.state();
    g.advance(4);
    const s = g.surgeon.state();
    Object.assign(g.player.state.position, { x: s.x + 0.3, z: s.z }); // right into him
    g.advance(1);
    const bumped = g.collapse.active();
    Object.assign(g.player.state.position, { x: 2.5 * size, z: 4.8 * size });
    g.advance(12);
    return { start: start.mode, bumped, met: g.progress.hasFlag('venn_met'), after: g.surgeon.state().mode, checkpoints };
  });
  expect(result).toEqual({ start: 'intro', bumped: false, met: true, after: 'round', checkpoints: 1 });
  const heard = await game(page, () => window.__stAgnes.heard);
  expect(heard.some((key) => key.startsWith('caption.clink'))).toBe(true); // his tools, through the wall or close
  expect(errors).toEqual([]);
});

test('your steps stop him; he listens two seconds, comes, and walks away from you standing silent', async ({ page }) => {
  const errors = trackErrors(page);
  await meet(page, { him: [12, 8], you: [9, 8] });
  await walk(page, 0.3);
  expect((await state(page)).mode).toBe('listening');
  await advance(page, 1.6);
  expect((await state(page)).mode).toBe('listening'); // still the warning
  await advance(page, 0.6);
  expect((await state(page)).mode).toBe('coming');
  await advance(page, 2);
  expect((await state(page)).mode).toBe('searching');
  await advance(page, 4);
  const after = await state(page);
  expect(after.mode).toBe('round');
  expect(after.collapse).toBe(false);
  const heard = await game(page, () => window.__stAgnes.heard);
  expect(heard).toEqual(expect.arrayContaining(['caption.clinkStops', 'caption.quickSteps', 'caption.clinkAway']));
  expect(heard).toContain('venn: venn.thereYouAre');
  expect(errors).toEqual([]);
});

test('a wall halves a sound: walking behind it he does not hear you, running he does', async ({ page }) => {
  // He in the corridor, you in the coal store, a wall between, 3.6 m apart.
  await meet(page, { him: [8, 7.6], you: [8.5, 4.6] });
  await game(page, () => (window.__stAgnes.player.state.yaw = Math.PI)); // south, at the wall
  await game(page, () => {
    const g = window.__stAgnes;
    g.player.state.yaw = 0; // north, away from him, into the coal store
    g.input.setVirtual('forward', true);
    g.advance(0.4);
    g.input.setVirtual('forward', false);
  });
  expect((await state(page)).mode).not.toBe('listening');
  await game(page, () => {
    const g = window.__stAgnes;
    const size = g.world.level.cellSize;
    g.surgeon.moveTo(8 * size, 7.6 * size);
    Object.assign(g.player.state.position, { x: 8.5 * size, z: 4.6 * size });
    g.player.state.yaw = Math.PI / 2;
    g.input.setVirtual('run', true);
    g.input.setVirtual('forward', true);
    g.advance(0.4);
    g.input.setVirtual('forward', false);
    g.input.setVirtual('run', false);
  });
  expect((await state(page)).mode).toBe('listening');
});

test('walk into him and he has you: his face, the rewind, Sam through the water says what he heard', async ({ page }) => {
  await meet(page, { him: [12, 8], you: [11.6, 8] });
  await advance(page, 0.1);
  expect(await game(page, () => window.__stAgnes.collapse.grabbing())).toBe(true);
  await advance(page, 7);
  const heard = await game(page, () => window.__stAgnes.heard);
  expect(heard).toContain('sam_water (spoken): sam.rewind.feet');
});

test('a banged door sets him on you: caught after, Sam speaks of the doors', async ({ page }) => {
  await meet(page, { him: [12, 8], you: [7.5, 7.9] });
  await game(page, () => {
    const g = window.__stAgnes;
    const size = g.world.level.cellSize;
    g.surgeon.moveTo(12 * size, 8 * size);
    g.player.state.yaw = 0; // north, at the coal store's door
    g.player.state.pitch = -0.2;
    g.advance(1 / 30);
    g.input.tap('use'); // a click: the door bangs open
    g.advance(2.3); // he listens, then comes
  });
  expect((await state(page)).mode).toBe('coming');
  await game(page, () => {
    const g = window.__stAgnes;
    for (let i = 0; i < 80 && !g.collapse.active(); i++) {
      g.input.setVirtual('forward', i % 20 < 2); // a step now and then: he hears it
      g.advance(0.1);
    }
    g.input.setVirtual('forward', false);
  });
  expect((await state(page)).collapse).toBe(true);
  await advance(page, 7);
  expect(await game(page, () => window.__stAgnes.heard)).toContain('sam_water (spoken): sam.rewind.door');
});

test('a thrown bottle draws him to where it lands, not to you', async ({ page }) => {
  await meet(page, { him: [14, 8], you: [3, 8] });
  const target = await game(page, () => {
    const g = window.__stAgnes;
    const size = g.world.level.cellSize;
    g.inventory.add('bottle');
    g.player.state.yaw = -Math.PI / 2; // east, along the corridor
    g.player.state.pitch = 0.1;
    g.advance(1 / 30);
    g.input.tap('throw');
    g.advance(2.6);
    const landed = g.heard;
    const s = g.surgeon.state();
    g.advance(4);
    const s2 = g.surgeon.state();
    return { landed, mode: s.mode, to: s2.x / size };
  });
  expect(target.landed).toContain('caption.bottleLands');
  expect(['listening', 'coming']).toContain(target.mode);
  expect(target.to).toBeLessThan(13); // he went towards the landing, west of where he stood
  expect(target.to).toBeGreaterThan(5); // not to you
});

test('the flash stuns him five seconds: he hears nothing, then searches', async ({ page }) => {
  await meet(page, { him: [12, 8], you: [9, 8] });
  await game(page, () => window.__stAgnes.surgeon.stun(5));
  expect((await state(page)).mode).toBe('stunned');
  await walk(page, 2);
  expect((await state(page)).mode).toBe('stunned');
  await advance(page, 3.2);
  expect((await state(page)).mode).toBe('searching');
  expect(await game(page, () => window.__stAgnes.heard)).toContain('caption.vennCry');
});

test('in a locker he cannot touch you, but he hears you panting', async ({ page }) => {
  await meet(page, { him: [15.6, 12.62], you: [15.6, 12.62] });
  const result = await game(page, () => {
    const g = window.__stAgnes;
    const size = g.world.level.cellSize;
    const locker = g.world.level.props.find((p) => p.id === 'locker_morgue_1');
    g.hiding.enter(locker);
    g.advance(1);
    const silent = g.collapse.active();
    g.events.emit('noise', { x: 15.6 * size, z: 12.62 * size, radius: 6, kind: 'stone' });
    g.advance(2.2); // listening, then he comes
    g.player.state.stamina = 30; // just ran: panting
    g.advance(1.5);
    return { silent, caught: g.collapse.active() };
  });
  expect(result).toEqual({ silent: false, caught: true });
  await advance(page, 7);
  expect(await game(page, () => window.__stAgnes.heard)).toContain('sam_water (spoken): sam.rewind.breath');
});

test('comfort mode: he listens three and a half seconds before he comes, and walks slower', async ({ page }) => {
  await game(page, () => window.__stAgnes.settings.set('comfortMode', true));
  await meet(page, { him: [12, 8], you: [9, 8] });
  await walk(page, 0.3);
  await advance(page, 3);
  expect((await state(page)).mode).toBe('listening');
  await advance(page, 0.6);
  expect((await state(page)).mode).toBe('coming');
});

test('at low sanity, clinking behind you that is not him; it never catches you', async ({ page }) => {
  await meet(page, { you: [2.5, 2.5] }); // at the stairs foot: never on his round
  const result = await game(page, () => {
    const g = window.__stAgnes;
    g.sanity.set(20);
    let fakes = 0;
    g.events.on('surgeon.fakeClink', () => (fakes += 1));
    for (let i = 0; i < 120; i++) {
      g.sanity.set(20);
      g.advance(1);
    }
    return { fakes, caught: g.collapse.active() || g.collapse.rewinds() > 0 };
  });
  expect(result.fakes).toBeGreaterThan(0);
  expect(result.caught).toBe(false);
  expect(await game(page, () => window.__stAgnes.heard)).toContain('caption.clinkBehind');
});

test('the debug overlay shows him: state, distance, what he hears, how loud you are', async ({ page }) => {
  await meet(page, { him: [12, 8], you: [9, 8] });
  const line = await game(page, () => window.__stAgnes.surgeon.debugLine());
  expect(line).toMatch(/^SURGEON {2}round {2}3\.6 m {2}hears nothing {2}you: silent/);
});
