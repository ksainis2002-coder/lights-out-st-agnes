import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { waitForBoot, trackErrors, lookAt, use, message, load } from './helpers.js';

// Puzzle 5 (cemetery, part C; approved stills lanterns, lanterns_lit,
// lanterns_out, agnes_slab, lamb_take): the five grave lanterns, lit with the
// matches in the order the children were struck off the roll.

const ROLL = ['agnes', 'thomas', 'margaret', 'samuel', 'edith'];
const grounds = JSON.parse(readFileSync(new URL('../src/levels/grounds.json', import.meta.url), 'utf8'));
const LAMB = grounds.pickups.find((pickup) => pickup.id === 'agnes_lamb').at;
const PAGE = grounds.documents.find((doc) => doc.id === 'hale_file_2').at;

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => {
    const game = window.__stAgnes;
    game.realTime = false; // time moves only by advance()
    game.play();
  });
  await load(page, 'grounds', 'school_door');
});

const giveMatches = (page) => page.evaluate(() => window.__stAgnes.inventory.add('matches'));

// Where a prop stands (cells).
const at = (page, id) => page.evaluate((id) => window.__stAgnes.world.level.props.find((prop) => prop.id === id).at, id);

// Steps up to a lantern from beyond its grave, looks down at it, and uses it.
async function lightLantern(page, name) {
  const [x, z] = await at(page, `lantern_${name}`);
  const prompt = await lookAt(page, [x, z - 0.6], [x, z, 0.15]);
  await use(page);
  return prompt;
}

// How many lanterns burn now (their lights are on).
const burning = (page) => page.evaluate((roll) => {
  const props = window.__stAgnes.world.levelGroup.getObjectByName('props');
  return roll.filter((name) => props.children.find((p) => p.userData.prop?.id === `lantern_${name}`).getObjectByName('glow').intensity > 0).length;
}, ROLL);

const advance = (page, seconds) => page.evaluate((s) => window.__stAgnes.advance(s), seconds);

test('lit in the order of the roll, the slab slides aside on the stone lamb and file page 2', async ({ page }) => {
  const errors = trackErrors(page);
  await giveMatches(page);
  for (const [i, name] of ROLL.entries()) {
    expect(await lightLantern(page, name)).toBe('prompt.lightLantern');
    expect(await burning(page)).toBe(i + 1);
  }
  expect(await message(page)).toBe('msg.lanternsSolved');
  expect(await page.evaluate(() => window.__stAgnes.progress.hasFlag('puzzle_lanterns'))).toBe(true);
  await advance(page, 2); // the slab slides aside

  expect(await lookAt(page, [LAMB[0] + 0.6, LAMB[1]], [...LAMB, 0.12])).toBe('prompt.take');
  await use(page);
  expect(await page.evaluate(() => window.__stAgnes.inventory.has('stone_lamb'))).toBe(true);

  // Page two of his file; with Maggie's rope already given, the school wing is done.
  await page.evaluate(() => window.__stAgnes.progress.setFlag('puzzle_hopscotch'));
  expect(await lookAt(page, [PAGE[0] + 0.6, PAGE[1]], [...PAGE, 0.07])).toBe('prompt.read');
  await use(page);
  expect(await page.evaluate(() => window.__stAgnes.progress.hasFlag('wing_school_done'))).toBe(true);
  expect(errors).toEqual([]);
});

test('one out of turn catches, then the flames shrink and go out, all of them', async ({ page }) => {
  await giveMatches(page);
  await lightLantern(page, 'agnes');
  await lightLantern(page, 'margaret'); // Tommy comes second
  expect(await burning(page)).toBe(2);
  await advance(page, 1);
  expect(await burning(page)).toBe(0);
  expect(await message(page)).toBe('msg.lanternsOut');
  for (const name of ROLL) await lightLantern(page, name);
  expect(await page.evaluate(() => window.__stAgnes.progress.hasFlag('puzzle_lanterns'))).toBe(true);
});

test('without the matches a lantern will not light', async ({ page }) => {
  expect(await lightLantern(page, 'agnes')).toBe('prompt.lightLantern');
  expect(await message(page)).toBe('msg.lanternNoMatches');
  expect(await burning(page)).toBe(0);
});

test('solved, they stay lit and the slab stays open after you leave and come back', async ({ page }) => {
  await giveMatches(page);
  for (const name of ROLL.slice(0, 2)) await lightLantern(page, name);
  await load(page, 'school_ground', 'front_door');
  await load(page, 'grounds', 'school_door');
  expect(await burning(page)).toBe(2); // half done stays half done
  for (const name of ROLL.slice(2)) await lightLantern(page, name);
  await load(page, 'grounds', 'school_door');
  expect(await burning(page)).toBe(5);
  const lid = await page.evaluate(() => {
    const props = window.__stAgnes.world.levelGroup.getObjectByName('props');
    return props.children.find((p) => p.userData.prop?.id === 'agnes_slab').getObjectByName('lid').position.x;
  });
  expect(lid).toBeGreaterThan(0.4);
});
