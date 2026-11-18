import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { waitForBoot, trackErrors, lookAt, use, message } from './helpers.js';

// The morgue (0.5, part B; approved still morgue; the wing 4 content sheet):
// steel drawers typed with dates, not names. Pulled out, a drawer screeches
// (a noise Dr. Venn hears) and is empty: a child's has a name tag, Sam's tag
// is still wet, Tommy's (2 FEB) has page four of his file on the steel. The
// 12 MAY drawer will not come for you: once you have pulled another it rolls
// out on its own (a set piece: a wait, the quiet, then the roll), and on it
// lies Sister M. under a sheet. Dr. Venn's theatre notes lie on a side table.

const basement = JSON.parse(readFileSync(new URL('../src/levels/basement.json', import.meta.url), 'utf8'));
const SIZE = basement.cellSize;
const WALL = basement.props.find((p) => p.id === 'morgue_drawers').at;
const game = (page, fn, arg) => page.evaluate(fn, arg);
const advance = (page, seconds) => game(page, (s) => window.__stAgnes.advance(s), seconds);

// A drawer's front, by index (row by row from the bottom, four to a row): [c, r, y].
const front = (index) => {
  const row = Math.floor(index / 4);
  const column = index % 4;
  return [WALL[0] + ((column - 1.5) * 0.62) / SIZE, WALL[1] + 0.1 / SIZE, 0.3 + row * 0.56 + 0.25];
};
const facing = (index) => lookAt(page_, [front(index)[0], WALL[1] + 1.0], front(index));
let page_ = null;

test.beforeEach(async ({ page }) => {
  page_ = page;
  await page.goto('./');
  await waitForBoot(page);
  await game(page, () => {
    const g = window.__stAgnes;
    g.realTime = false; // time moves only by advance()
    g.newGame();
    g.intro.finish();
    g.progress.setFlag('venn_met');
    g.loadLevel('basement', 'stairs');
    const size = g.world.level.cellSize;
    g.surgeon.moveTo(2 * size, 8 * size); // far down the corridor, deaf for the test
    g.surgeon.stun(600);
    g.heard = [];
    g.events.on('subtitle.shown', ({ key }) => g.heard.push(key));
    g.events.on('noise', (n) => g.heard.push(n));
  });
});

// How far a drawer's tray is out (metres), and how far its door has swung (radians, outward is negative).
const drawerState = (page, index) => game(page, (index) => {
  let wall = null;
  window.__stAgnes.world.levelGroup.traverse((o) => {
    if (o.userData.prop?.id === 'morgue_drawers') wall = o;
  });
  const drawer = wall.getObjectByName(`drawer_${index}`);
  return { out: drawer.getObjectByName('tray').position.z, swung: drawer.getObjectByName('door').rotation.y };
}, index);
const drawerZ = async (page, index) => (await drawerState(page, index)).out;
const doorOpen = async (page, index) => (await drawerState(page, index)).swung < -1.5;
const line = (page) => game(page, () => {
  const current = window.__stAgnes.messages.current();
  return current && { key: current.key, params: current.params ?? null };
});

test('pulled out, a drawer screeches (Dr. Venn hears it) and says what is in it: empty, a child\'s tag, Sam\'s wet tag', async ({ page }) => {
  const errors = trackErrors(page);
  expect(await facing(0)).toBe('prompt.pullDrawer'); // 30 OCT
  await use(page);
  expect(await message(page)).toBe('msg.drawerEmpty');
  const heard = await game(page, () => window.__stAgnes.heard);
  expect(heard).toContain('caption.drawerScreech');
  expect(heard.find((h) => h.kind === 'drawer')).toMatchObject({ radius: 8 });
  await advance(page, 1);
  expect(await drawerZ(page, 0)).toBeCloseTo(0.5, 2);
  expect(await doorOpen(page, 0)).toBe(true);
  expect(await doorOpen(page, 1)).toBe(false);
  expect(await facing(0)).toBeNull(); // out: nothing more to pull

  await advance(page, 5);
  expect(await facing(10)).toBe('prompt.pullDrawer'); // 2 APR
  await use(page);
  expect(await line(page)).toEqual({ key: 'msg.drawerChild', params: { name: 'ROWE, M.' } });
  await advance(page, 6);
  expect(await facing(7)).toBe('prompt.pullDrawer'); // 9 JUN
  await use(page);
  expect(await message(page)).toBe('msg.drawerSam');
  expect(errors).toEqual([]);
});

test('Tommy\'s drawer (2 FEB) holds page four of his file: it shows once the drawer is out, reads, goes in the journal', async ({ page }) => {
  const errors = trackErrors(page);
  const [x, z] = basement.documents.find((d) => d.id === 'hale_file_4').at;
  expect(await lookAt(page, [x, z + 1.0], [x, z, 0.92])).not.toBe('prompt.read'); // not there yet
  expect(await facing(4)).toBe('prompt.pullDrawer');
  await use(page);
  expect(await message(page)).toBe('msg.drawerTommy');
  expect(await game(page, () => window.__stAgnes.progress.hasFlag('morgue_tommy'))).toBe(true);
  await advance(page, 1);
  expect(await lookAt(page, [x, z + 1.0], [x, z, 0.92])).toBe('prompt.read');
  await use(page);
  await game(page, () => window.__stAgnes.resume());
  expect(await game(page, () => window.__stAgnes.journal.clues())).toContain('read_hale_file_4');
  expect(errors).toEqual([]);
});

test('the 12 MAY drawer will not come for you; once you have pulled another, it rolls out on its own after the quiet', async ({ page }) => {
  const errors = trackErrors(page);
  expect(await facing(5)).toBeNull(); // 12 MAY: nothing to pull
  expect(await facing(0)).toBe('prompt.pullDrawer');
  await use(page);
  await advance(page, 0.2);
  expect(await game(page, () => window.__stAgnes.setPieces.active())).toBe('morgue_drawer');
  await advance(page, 5); // the wait, then the quiet: still in
  expect(await drawerZ(page, 5)).toBe(0);
  expect(await game(page, () => window.__stAgnes.heard)).not.toContain('caption.drawerRolls');
  const noises = await game(page, () => window.__stAgnes.heard.filter((h) => typeof h !== 'string').length);
  await advance(page, 5);
  expect(await game(page, () => window.__stAgnes.heard)).toContain('caption.drawerRolls');
  expect(await game(page, () => window.__stAgnes.heard.filter((h) => typeof h !== 'string').length)).toBe(noises); // Dr. Venn does not hear it
  expect(await drawerZ(page, 5)).toBeCloseTo(2.0, 2);
  expect(await doorOpen(page, 5)).toBe(true);
  expect(await game(page, () => window.__stAgnes.setPieces.active())).toBeNull();

  // What lies on it.
  const [c, , y] = front(5);
  const tray = [c, WALL[1] + 1.4 / SIZE, y - 0.05];
  expect(await lookAt(page, [c + 1.0, tray[1]], tray)).toBe('prompt.look');
  await use(page);
  expect(await message(page)).toBe('msg.drawerSister');

  // Back again: the drawers stay as you left them.
  await game(page, () => window.__stAgnes.loadLevel('basement', 'stairs'));
  expect(await drawerZ(page, 0)).toBeCloseTo(0.5, 2);
  expect(await drawerZ(page, 5)).toBeCloseTo(2.0, 2);
  expect(await lookAt(page, [c + 1.0, tray[1]], tray)).toBe('prompt.look');
  expect(errors).toEqual([]);
});

test('comfort mode keeps the 12 MAY drawer (a story beat); out of the morgue you hear it, and it is out when you come back', async ({ page }) => {
  const errors = trackErrors(page);
  await game(page, () => window.__stAgnes.settings.set('comfortMode', true));
  expect(await facing(2)).toBe('prompt.pullDrawer');
  await use(page);
  await advance(page, 0.2);
  expect(await game(page, () => window.__stAgnes.setPieces.active())).toBe('morgue_drawer');
  await game(page, () => {
    const g = window.__stAgnes;
    const size = g.world.level.cellSize;
    Object.assign(g.player.state.position, { x: 12 * size, z: 8 * size }); // out in the corridor
    g.advance(8);
  });
  expect(await game(page, () => window.__stAgnes.heard)).toContain('caption.drawerRolls');
  expect(await game(page, () => window.__stAgnes.setPieces.active())).toBeNull();
  expect(await drawerZ(page, 5)).toBeCloseTo(2.0, 2);
  expect(errors).toEqual([]);
});

test('Dr. Venn\'s theatre notes lie on a side table in the morgue: read, they go in the journal', async ({ page }) => {
  const errors = trackErrors(page);
  const [x, z] = basement.documents.find((d) => d.id === 'venn_theatre_notes').at;
  expect(await lookAt(page, [x - 0.9, z], [x, z, 0.62])).toBe('prompt.read');
  await use(page);
  await game(page, () => window.__stAgnes.resume());
  expect(await game(page, () => window.__stAgnes.journal.clues())).toContain('read_venn_theatre_notes');
  expect(errors).toEqual([]);
});
