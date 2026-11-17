import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { waitForBoot, trackErrors, lookAt, use, arrive, message } from './helpers.js';

// Wing 4, part A (0.5; approved stills chapel, statue_whole, crypt; the wing 4
// content sheet): the chapel opens once the west wing is done; St. Agnes is
// given back her four pieces with your eyes on her, and is whole; the crypt's
// plaques, pushed in the roll's order, give up her stone heart.

const crypt = JSON.parse(readFileSync(new URL('../src/levels/chapel_crypt.json', import.meta.url), 'utf8'));
const chapel = JSON.parse(readFileSync(new URL('../src/levels/chapel.json', import.meta.url), 'utf8'));
const ROLL = ['agnes', 'tommy', 'maggie', 'sam', 'edith'];
const plaqueAt = (name) => crypt.props.find((prop) => prop.id === `plaque_${name}`).at;
const HEART = crypt.pickups.find((pickup) => pickup.id === 'crypt_heart').at;
const HER = chapel.watcher.spawns[0];
const PIECES = ['statue_piece', 'stone_palm', 'stone_lamb', 'stone_heart'];

const game = (page, fn, arg) => page.evaluate(fn, arg);
const advance = (page, seconds) => game(page, (s) => window.__stAgnes.advance(s), seconds);
const flag = (page, name) => game(page, (name) => window.__stAgnes.progress.hasFlag(name), name);
const subtitles = (page) => game(page, () => window.__stAgnes.heard);

// A game in wing 4: the west wing done, St. Agnes awake and in the chapel.
async function wingFour(page, { level = 'chapel', spawn = 'door', items = [], flags = ['wing_wards_done'] } = {}) {
  await game(page, ({ level, spawn, items, flags }) => {
    const g = window.__stAgnes;
    g.newGame();
    g.intro.finish();
    ['watcher_awake', 'tool_flashlight', 'puzzle_records', ...flags].forEach((name) => g.progress.setFlag(name));
    g.progress.setValue('watcher_floor', 'chapel');
    items.forEach((item) => g.inventory.add(item));
    g.heard = [];
    g.events.on('subtitle.shown', ({ key, speaker }) => g.heard.push(speaker ? `${speaker}: ${key}` : key));
    g.loadLevel(level, spawn);
  }, { level, spawn, items, flags });
}

// Stands a step in front of her and looks her in the face.
const faceHer = (page) => lookAt(page, [HER[0], HER[1] + 1.2], [HER[0], HER[1], 1.5]);

// Steps up to a plaque in the crypt's north wall and pushes it.
async function push(page, name) {
  const [x, z] = plaqueAt(name);
  const prompt = await lookAt(page, [x, z + 0.9], [x, z + 0.05, 1.3]);
  await use(page);
  return prompt;
}
// How far each plaque sits from where it was placed, cm along z (below 0: pushed into the wall).
const pushedIn = (page) => game(page, (roll) => roll.map((name) => {
  const g = window.__stAgnes;
  let plaque = null;
  g.world.levelGroup.traverse((object) => {
    if (object.userData.prop?.id === `plaque_${name}`) plaque = object;
  });
  return Math.round((plaque.position.z - plaque.userData.prop.at[1] * g.world.level.cellSize) * 100);
}), ROLL);
// How far the niche's slab stands from where it was placed, cm to the west.
const slabAside = (page) => game(page, () => {
  const g = window.__stAgnes;
  let slab = null;
  g.world.levelGroup.traverse((object) => {
    if (object.userData.prop?.id === 'niche_slab') slab = object;
  });
  return Math.round((slab.userData.prop.at[0] * g.world.level.cellSize - slab.position.x) * 100);
});

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => (window.__stAgnes.realTime = false)); // time moves only by advance()
});

test('the chapel door: the keyhole until the west wing is done, then a way in; she is inside', async ({ page }) => {
  const errors = trackErrors(page);
  await wingFour(page, { level: 'grounds', spawn: 'chapel_door', flags: [] });
  expect(await lookAt(page, [6.5, 20.0], [6.5, 21, 1.2])).toBe('prompt.keyhole');

  await wingFour(page, { level: 'grounds', spawn: 'chapel_door' });
  expect(await lookAt(page, [6.5, 20.0], [6.5, 21, 1.2])).toBe('prompt.toChapel');
  await use(page);
  expect(await arrive(page)).toBe('chapel');
  expect(await message(page)).toBe('msg.agnesFirstLook');
  const her = await game(page, () => {
    const g = window.__stAgnes;
    const at = g.watcher.position();
    return { col: at.x / g.world.level.cellSize, row: at.z / g.world.level.cellSize, mode: g.watcher.state().mode };
  });
  expect(her).toEqual({ col: HER[0], row: HER[1], mode: 'hunting' });
  expect(errors).toEqual([]);
});

test('with your eyes on her you give back her hand, palm, lamb and heart: whole, the bell, the rain stops, a gate unlocks', async ({ page }) => {
  const errors = trackErrors(page);
  await wingFour(page, { items: PIECES });
  const prompts = [];
  for (let i = 0; i < 4; i++) {
    prompts.push(await faceHer(page));
    await use(page);
    if (i === 0) expect(await message(page)).toBe('msg.agnesEyes');
  }
  expect(prompts).toEqual(['prompt.agnesHand', 'prompt.agnesPalm', 'prompt.agnesLamb', 'prompt.agnesHeart']);
  expect(await game(page, (items) => items.filter((item) => window.__stAgnes.inventory.has(item)), PIECES)).toEqual([]);
  expect(await flag(page, 'agnes_whole')).toBe(true);
  expect(await flag(page, 'basement_open')).toBe(true);
  expect(await game(page, () => window.__stAgnes.storm.on())).toBe(false); // dead calm

  await advance(page, 6);
  expect(await subtitles(page)).toEqual(['caption.stoneSettles', 'caption.stoneSettles', 'caption.stoneSettles', 'caption.stoneSettles',
    'caption.chapelBell', 'caption.rainStops']);
  expect(await message(page)).toBe('msg.basementUnlocked');
  expect(await game(page, () => window.__stAgnes.journal.clues().includes('agnes_whole'))).toBe(true);

  // She stands still from now on, turned to the door; looked at again, her line.
  const still = await game(page, () => {
    const g = window.__stAgnes;
    g.player.state.yaw += Math.PI; // your back to her
    g.advance(5);
    const at = g.watcher.position();
    return { mode: g.watcher.state().mode, moved: Math.hypot(at.x / g.world.level.cellSize - 4.5, at.z / g.world.level.cellSize - 4.0) > 0.01 };
  });
  expect(still).toEqual({ mode: 'still', moved: false });
  expect(await faceHer(page)).toBe('prompt.look');
  await use(page);
  expect(await message(page)).toBe('msg.agnesWholeLook');

  // After a reload she is still whole and still.
  await game(page, () => window.__stAgnes.loadLevel('chapel', 'door'));
  expect(await game(page, () => window.__stAgnes.watcher.state().mode)).toBe('still');
  expect(errors).toEqual([]);
});

test('the palm waits for her hand; with nothing to give, her first-look line', async ({ page }) => {
  await wingFour(page, { items: ['stone_palm'] });
  expect(await faceHer(page)).toBe('prompt.look');
  await use(page);
  expect(await message(page)).toBe('msg.agnesFirstLook');
  expect(await flag(page, 'agnes_palm')).toBe(false);
});

test('the steps behind the altar: down to the crypt with his line on the cold air, and back up', async ({ page }) => {
  const errors = trackErrors(page);
  await wingFour(page);
  expect(await lookAt(page, [6.6, 4.4], [7.0, 3.4, 0.6])).toBe('prompt.stairsDown');
  await use(page);
  expect(await arrive(page)).toBe('chapel_crypt');
  expect(await message(page)).toBe('msg.cryptSteps');
  expect(await lookAt(page, [2.0, 4.2], [2.0, 5.0, 0.9])).toBe('prompt.stairsUp');
  await use(page);
  expect(await arrive(page)).toBe('chapel');
  expect(errors).toEqual([]);
});

test('the crypt plaques pushed in the roll\'s order open the niche on her stone heart', async ({ page }) => {
  const errors = trackErrors(page);
  await wingFour(page, { level: 'chapel_crypt', spawn: 'stairs' });
  for (const [i, name] of ROLL.entries()) {
    expect(await push(page, name)).toBe('prompt.pushPlaque');
    if (name === 'tommy') expect(await message(page)).toBe('msg.plaqueTommy');
    expect((await pushedIn(page)).filter((z) => z < 0).length).toBe(i + 1);
  }
  expect(await flag(page, 'puzzle_plaques')).toBe(true);
  expect(await subtitles(page)).toEqual(['caption.nicheOpens']);
  await advance(page, 2); // the slab grinds aside
  expect(await message(page)).toBe('msg.cryptNiche');
  expect(await slabAside(page)).toBe(70);

  expect(await lookAt(page, [HEART[0], HEART[1] + 0.8], [HEART[0], HEART[1], 1.1])).toBe('prompt.take');
  await use(page);
  expect(await game(page, () => window.__stAgnes.inventory.has('stone_heart'))).toBe(true);
  const clues = await game(page, () => ['solved_plaques', 'took_stone_heart'].filter((id) => window.__stAgnes.journal.clues().includes(id)));
  expect(clues).toEqual(['solved_plaques', 'took_stone_heart']);

  // Back later: all five stay in and the niche stays open.
  await game(page, () => window.__stAgnes.loadLevel('chapel_crypt', 'stairs'));
  expect((await pushedIn(page)).every((z) => z < 0)).toBe(true);
  expect(await slabAside(page)).toBe(70); // it stands beside the niche, as it was left
  expect(errors).toEqual([]);
});

test('one out of turn goes in, then they all grind back out; after two wrong tries Tommy whispers the rule', async ({ page }) => {
  await wingFour(page, { level: 'chapel_crypt', spawn: 'stairs' });
  await push(page, 'agnes');
  await push(page, 'maggie'); // Tommy comes second
  expect((await pushedIn(page)).filter((z) => z < 0).length).toBe(2);
  await advance(page, 1);
  expect((await pushedIn(page)).filter((z) => z < 0).length).toBe(0);
  expect(await subtitles(page)).toEqual(['caption.plaquesBack']);

  await push(page, 'sam'); // out of turn from the start
  await advance(page, 1);
  expect(await subtitles(page)).toEqual(['caption.plaquesBack', 'caption.plaquesBack', 'tommy: whisper.tommy.plaques']);
  expect(await flag(page, 'puzzle_plaques')).toBe(false);

  // Half done and back later: the ones home stay home.
  await push(page, 'agnes');
  await push(page, 'tommy');
  await game(page, () => window.__stAgnes.loadLevel('chapel_crypt', 'stairs'));
  expect((await pushedIn(page)).map((z) => z < 0)).toEqual([true, true, false, false, false]);
});

test('once she is whole the bell tolls and the rain stops, in the chapel and out on the grounds', async ({ page }) => {
  await page.keyboard.press('ArrowDown'); // first input starts audio
  await page.waitForFunction(() => window.__stAgnes.sfx.isReady(), null, { timeout: 30000 });
  await wingFour(page, { items: PIECES });
  await advance(page, 0.5);
  expect(await game(page, () => window.__stAgnes.sfx.beds())).toContain('amb_rain_inside');
  for (let i = 0; i < 4; i++) {
    await faceHer(page);
    await use(page);
  }
  await advance(page, 6);
  const chapelNow = await game(page, () => ({ beds: window.__stAgnes.sfx.beds(), played: window.__stAgnes.sfx.played() }));
  expect(chapelNow.beds).not.toContain('amb_rain_inside');
  expect(chapelNow.played.church_bell).toBe(1);
  expect(chapelNow.played.stone_step).toBeGreaterThanOrEqual(4);

  await game(page, () => window.__stAgnes.loadLevel('grounds', 'chapel_door'));
  await advance(page, 0.5);
  const grounds = await game(page, () => ({
    beds: window.__stAgnes.sfx.beds(),
    rain: window.__stAgnes.world.level.props.some((prop) => prop.type === 'rain'),
    storm: window.__stAgnes.storm.on(),
  }));
  expect(grounds).toEqual({ beds: expect.not.arrayContaining(['amb_rain_outside']), rain: false, storm: false });
});
