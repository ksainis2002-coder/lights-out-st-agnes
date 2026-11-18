import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { waitForBoot, trackErrors, lookAt, use } from './helpers.js';

// Throwing (0.5, part B; the wing 4 content sheet): G throws what you are
// holding, a bottle or a stone; where it lands, a noise carries (bottle 14 m,
// stone 10 m) with its sound line. The first one you pick up teaches the key.

const basement = JSON.parse(readFileSync(new URL('../src/levels/basement.json', import.meta.url), 'utf8'));
const pickupAt = (id) => basement.pickups.find((p) => p.id === id).at;
const game = (page, fn, arg) => page.evaluate(fn, arg);

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await game(page, () => {
    const g = window.__stAgnes;
    g.realTime = false; // time moves only by advance()
    g.newGame();
    g.intro.finish();
    g.loadLevel('basement', 'stairs');
    g.heard = [];
    g.events.on('noise', (noise) => g.heard.push(noise));
    g.events.on('subtitle.shown', ({ key }) => g.heard.push(key));
  });
});

// Stand in the corridor looking east along it, and throw.
const throwDownTheCorridor = (page) => game(page, () => {
  const g = window.__stAgnes;
  const size = g.world.level.cellSize;
  Object.assign(g.player.state.position, { x: 3.0 * size, z: 8.0 * size });
  g.player.state.yaw = -Math.PI / 2; // east
  g.player.state.pitch = 0.1;
  g.advance(1 / 30);
  g.input.tap('throw');
  g.advance(2);
  return { heard: g.heard, items: g.inventory.items(), flying: g.throwing.flying() };
});

test('a bottle taken teaches the key; thrown, it breaks over there, a noise of 14 m where it lands', async ({ page }) => {
  const errors = trackErrors(page);
  const [x, z] = pickupAt('coal_bottle_0');
  expect(await lookAt(page, [x, z + 0.8], [x, z, 0.1])).toBe('prompt.take');
  await use(page);
  expect(await game(page, () => window.__stAgnes.inventory.items())).toEqual(['bottle']);
  // The lesson is taught once, queued behind any line already showing.
  expect(await game(page, () => window.__stAgnes.progress.hasFlag('tutorial_throw'))).toBe(true);

  const result = await throwDownTheCorridor(page);
  expect(result.items).toEqual([]);
  expect(result.flying).toBe(0);
  const noise = result.heard.find((n) => n.kind === 'bottle');
  expect(noise).toMatchObject({ radius: 14, thrown: true });
  const size = await game(page, () => window.__stAgnes.world.level.cellSize);
  expect(noise.x / size).toBeGreaterThan(6); // it flew down the corridor
  expect(Math.abs(noise.z / size - 8)).toBeLessThan(1);
  expect(result.heard).toContain('caption.bottleLands');
  expect(errors).toEqual([]);
});

test('with a stone selected the stone goes first; with nothing to throw, G does nothing', async ({ page }) => {
  const thrown = await game(page, () => {
    const g = window.__stAgnes;
    ['stone_heart', 'bottle', 'stone'].forEach((item) => g.inventory.add(item));
    g.inventory.select(2); // the stone
    return g.throwing.choice();
  });
  expect(thrown).toBe('stone');
  const result = await throwDownTheCorridor(page);
  expect(result.items).toEqual(['stone_heart', 'bottle']);
  expect(result.heard.find((n) => n.kind === 'stone')).toMatchObject({ radius: 10 });
  expect(result.heard).toContain('caption.stoneLands');

  const none = await game(page, () => {
    const g = window.__stAgnes;
    g.inventory.remove('bottle');
    g.heard = [];
    g.input.tap('throw');
    g.advance(2);
    return { items: g.inventory.items(), heard: g.heard };
  });
  expect(none).toEqual({ items: ['stone_heart'], heard: [] });
});

test('thrown at a wall close by, it drops where it struck', async ({ page }) => {
  const noise = await game(page, () => {
    const g = window.__stAgnes;
    g.inventory.add('stone');
    const size = g.world.level.cellSize;
    Object.assign(g.player.state.position, { x: 3.0 * size, z: 8.0 * size });
    g.player.state.yaw = Math.PI; // south: the corridor's wall is a step away
    g.player.state.pitch = 0;
    g.advance(1 / 30);
    g.input.tap('throw');
    g.advance(1);
    const n = g.heard.find((h) => h.kind === 'stone');
    return n && { x: n.x / size, z: n.z / size };
  });
  expect(noise.z).toBeGreaterThan(8);
  expect(noise.z).toBeLessThan(9); // before the wall line
});
