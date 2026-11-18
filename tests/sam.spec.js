import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { waitForBoot, trackErrors, lookAt, use, message } from './helpers.js';

// Sam and the boiler room (0.5, part B; approved still sam; the wing 4
// content sheet): met in the flood, he knocks twice; then he knocks where Dr.
// Venn is, once far off, twice close. The valves, in the stoker's order (red,
// blue, brass), drain the flood and light the boiler, and his tin soldier can
// be taken; given to him, three taps at a pipe send Dr. Venn to listen far
// from you. The stoker's log says the order.

const basement = JSON.parse(readFileSync(new URL('../src/levels/basement.json', import.meta.url), 'utf8'));
const SAM = basement.sam.at;
const wheelAt = (id) => basement.props.find((p) => p.id === id).at;
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
    g.progress.setFlag('venn_met');
    g.loadLevel('basement', 'stairs');
    g.heard = [];
    g.events.on('subtitle.shown', ({ key }) => g.heard.push(key));
    g.events.on('noise', (n) => g.heard.push(n));
  });
});

// Keep Dr. Venn out of the way: far down the corridor, deaf for the test.
const venn = (page, at, still = true) => game(page, ({ at, still }) => {
  const g = window.__stAgnes;
  const size = g.world.level.cellSize;
  g.surgeon.moveTo(at[0] * size, at[1] * size);
  if (still) g.surgeon.stun(600);
}, { at, still });

// At a valve on the boiler room's west wall: stand east of it, look at the wheel.
async function turn(page, id) {
  const [x, z] = wheelAt(id);
  const prompt = await lookAt(page, [x + 0.9, z], [x + 0.17, z, 1.3]);
  await use(page);
  return prompt;
}
const flags = (page, names) => game(page, (names) => names.filter((n) => window.__stAgnes.progress.hasFlag(n)), names);

test('met in the flood, he knocks twice; then he knocks where Dr. Venn is, twice close, once far off', async ({ page }) => {
  const errors = trackErrors(page);
  await venn(page, [12, 8]);
  await lookAt(page, [SAM[0] + 2.5, SAM[1]], [SAM[0], SAM[1], 1.2]);
  await advance(page, 0.2);
  expect(await flags(page, ['sam_met'])).toEqual(['sam_met']);
  expect(await game(page, () => window.__stAgnes.heard)).toContain('caption.knockClose');
  expect(await game(page, () => window.__stAgnes.journal.clues())).toEqual(expect.arrayContaining(['sam_met', 'sam_knocks']));

  const knocks = await game(page, () => {
    const g = window.__stAgnes;
    const size = g.world.level.cellSize;
    g.heard = [];
    g.surgeon.moveTo(20 * size, 3.5 * size); // far: the Founder's passage
    g.advance(21);
    const far = g.heard.filter((k) => typeof k === 'string' && k.startsWith('caption.knock'));
    g.heard = [];
    g.surgeon.moveTo(5.5 * size, 13 * size); // close: in the boiler room with you
    g.advance(21);
    const close = g.heard.filter((k) => typeof k === 'string' && k.startsWith('caption.knock'));
    return { far, close };
  });
  expect(knocks.far).toContain('caption.knockFar');
  expect(knocks.close).toContain('caption.knockClose');
  expect(errors).toEqual([]);
});

test('the stoker\'s log gives the order; out of it the water bubbles back and the wheels go back', async ({ page }) => {
  const errors = trackErrors(page);
  await venn(page, [20, 8]);
  const [x, z] = basement.documents.find((d) => d.id === 'boiler_log').at;
  expect(await lookAt(page, [x - 0.9, z], [x, z, 0.62])).toBe('prompt.read');
  await use(page);
  await game(page, () => window.__stAgnes.resume());
  expect(await game(page, () => window.__stAgnes.journal.clues())).toContain('read_boiler_log');

  expect(await turn(page, 'valve_red')).toBe('prompt.turnRed');
  expect(await message(page)).toBe('msg.valves');
  await advance(page, 1);
  expect(await turn(page, 'valve_brass')).toBe('prompt.turnBrass'); // out of order
  await advance(page, 2);
  expect(await game(page, () => window.__stAgnes.heard)).toContain('caption.valvesWrong');
  expect(await game(page, () => window.__stAgnes.progress.getValue('valves_turned', 0))).toBe(0);
  expect(await flags(page, ['puzzle_valves'])).toEqual([]);
  expect(errors).toEqual([]);
});

test('red, blue, brass: the flood drains, the boiler roars, the soldier lies there; given to Sam, three taps send Dr. Venn away', async ({ page }) => {
  const errors = trackErrors(page);
  await venn(page, [20, 8]);
  for (const [i, id] of ['valve_red', 'valve_blue', 'valve_brass'].entries()) {
    expect(await turn(page, id)).toBe(['prompt.turnRed', 'prompt.turnBlue', 'prompt.turnBrass'][i]);
    await advance(page, 1.2);
  }
  expect(await flags(page, ['puzzle_valves'])).toEqual(['puzzle_valves']);
  await advance(page, 7);
  const heard = await game(page, () => window.__stAgnes.heard);
  expect(heard).toEqual(expect.arrayContaining(['caption.floodDrains', 'caption.boilerRoars']));
  expect(await game(page, () => {
    let flood = null;
    window.__stAgnes.world.levelGroup.traverse((o) => {
      if (o.userData.prop?.id === 'boiler_flood') flood = o;
    });
    return flood.visible;
  })).toBe(false);

  // The soldier, where the water was.
  const [sx, sz] = basement.pickups.find((p) => p.id === 'sam_soldier').at;
  expect(await lookAt(page, [sx + 0.8, sz], [sx, sz, 0.05])).toBe('prompt.take');
  await use(page);
  expect(await game(page, () => window.__stAgnes.inventory.has('tin_soldier'))).toBe(true);

  // To Sam.
  expect(await lookAt(page, [SAM[0] + 1.2, SAM[1]], [SAM[0], SAM[1], 1.0])).toBe('prompt.giveSoldier');
  await use(page);
  expect(await flags(page, ['sam_soldier'])).toEqual(['sam_soldier']);
  expect(await game(page, () => window.__stAgnes.journal.clues())).toContain('sam_soldier');

  // A tap at the corridor's west pipe: he knocks far off, and Dr. Venn goes to listen there.
  await game(page, () => {
    const g = window.__stAgnes;
    g.loadLevel('basement', 'stairs'); // he wakes from the stun the test gave him
    const size = g.world.level.cellSize;
    g.surgeon.moveTo(12 * size, 8 * size); // in the middle of the corridor
    g.heard = [];
  });
  const prompt = await lookAt(page, [3.0, 8.2], [3.0, 7.35, 2.25]);
  expect(prompt).toBe('prompt.tapPipe');
  expect(await game(page, () => window.__stAgnes.interaction.target().prompt().params)).toEqual({ n: 3 });
  await use(page);
  const lure = await game(page, () => {
    const g = window.__stAgnes;
    const size = g.world.level.cellSize;
    const knock = g.heard.find((h) => h.kind === 'knock');
    g.advance(2.4);
    const s = g.surgeon.state();
    return { knock: knock && [knock.x / size, knock.z / size], mode: s.mode, left: g.progress.getValue('sam_taps') };
  });
  expect(lure.knock[0]).toBeGreaterThan(14); // far from you, at the west end
  expect(lure.left).toBe(2);
  expect(['listening', 'coming']).toContain(lure.mode);
  expect(errors).toEqual([]);
});
