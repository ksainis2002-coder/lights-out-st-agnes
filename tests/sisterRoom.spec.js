import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, lookAt, use, message, load } from './helpers.js';

// Wing 3, part C1 (approved stills sister_room, sister_shrine, sister_trunk;
// the content sheet): the night sister's key on Dr. Venn's desk, her door,
// her trunk (the confession and the music box's key), and the stone palm
// before her one candle, which goes out as you take it and draws her.

const game = (page, fn, arg) => page.evaluate(fn, arg);
const DOOR = [[3.5, 7.6], [3.5, 6.5, 1.2]];
const TRUNK = [[2.2, 4.4], [1.62, 3.85, 0.5]];
const PALM = [[5.6, 3.45], [6.66, 3.45, 0.64]];

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => {
    const g = window.__stAgnes;
    g.play();
    ['tool_flashlight', 'tool_camcorder', 'puzzle_venn_door', 'tutorial_use'].forEach((flag) => g.progress.setFlag(flag));
  });
  await load(page, 'wards_upper', 'stairs');
});

test('the night sister\'s key from Dr. Venn\'s desk opens her door', async ({ page }) => {
  const errors = trackErrors(page);
  expect(await lookAt(page, ...DOOR)).toBe('prompt.locked');
  await use(page);
  expect(await message(page)).toBe('msg.sisterDoorLocked');
  expect(await lookAt(page, [4.3, 12.6], [4.3, 11.2, 0.82])).toBe('prompt.take');
  await use(page);
  expect(await game(page, () => window.__stAgnes.inventory.has('sister_key'))).toBe(true);
  expect(await lookAt(page, ...DOOR)).toBe('prompt.unlock');
  await use(page);
  expect(await game(page, () => ({ key: window.__stAgnes.inventory.has('sister_key'), unlocked: window.__stAgnes.progress.isUnlocked('upper_sister') })))
    .toEqual({ key: false, unlocked: true });
  expect(await lookAt(page, ...DOOR)).toBe('prompt.close'); // the key turns and the door swings open
  expect(errors).toEqual([]);
});

test('her trunk opens once: the confession and the music box\'s key lie in it', async ({ page }) => {
  expect(await lookAt(page, ...TRUNK)).toBe('prompt.openTrunk');
  expect(await lookAt(page, [2.2, 4.4], [1.75, 3.9, 0.47])).not.toBe('prompt.take'); // nothing to see in a shut trunk
  await lookAt(page, ...TRUNK);
  await use(page);
  expect(await game(page, () => window.__stAgnes.progress.hasFlag('opened_sister_trunk'))).toBe(true);
  expect(await lookAt(page, ...TRUNK)).not.toBe('prompt.openTrunk');
  expect(await lookAt(page, [2.2, 4.4], [1.75, 3.9, 0.47])).toBe('prompt.take');
  await use(page);
  expect(await game(page, () => window.__stAgnes.inventory.has('music_box_key'))).toBe(true);
  expect(await lookAt(page, [2.2, 4.4], [1.5, 3.82, 0.49])).toBe('prompt.read');
  await use(page);
  await page.keyboard.press('Escape');
  expect(await game(page, () => window.__stAgnes.progress.isRead('sister_confession'))).toBe(true);
});

test('taking the stone palm puts the candle out and draws her to the room, even from the floor below', async ({ page }) => {
  const result = await game(page, () => {
    const g = window.__stAgnes;
    ['nun_walking', 'lamp_out_ward_a_1', 'lamp_out_ward_a_2', 'lamp_out_ward_a_3', 'edith_met'].forEach((flag) => g.progress.setFlag(flag));
    g.progress.setValue('nun_floor', 'wards_ground'); // she walks the floor below
    g.progress.unlock('upper_sister'); // you came in with her key: the door no longer keeps her out
    g.loadLevel('wards_upper', 'stairs');
    const lit = () => {
      let on = null;
      g.world.levelGroup.traverse((object) => { if (object.userData.prop?.id === 'sister_candle') object.traverse((part) => { if (part.isPointLight) on = part.visible; }); });
      return on;
    };
    const before = { lit: lit(), here: g.nun.state().active };
    const events = [];
    g.events.on('candle.out', () => events.push('candle'));
    g.events.on('nun.beads', () => events.push('beads'));
    return { before, events, lit };
  });
  expect(result.before).toEqual({ lit: true, here: false });
  expect(await lookAt(page, ...PALM)).toBe('prompt.take');
  await use(page);
  const after = await game(page, () => {
    const g = window.__stAgnes;
    const size = g.world.level.cellSize;
    let on = null;
    g.world.levelGroup.traverse((object) => { if (object.userData.prop?.id === 'sister_candle') object.traverse((part) => { if (part.isPointLight) on = part.visible; }); });
    const out = { palm: g.inventory.has('stone_palm'), lit: on, message: g.messages.current()?.key ?? null };
    g.world.flashlight.setOn(false);
    Object.assign(g.player.state.position, { x: 5 * size, z: 11.5 * size }); // in Dr. Venn's office, off her round
    const path = [];
    for (let t = 0; t < 40; t += 0.5) {
      g.advance(0.5);
      const s = g.nun.state();
      if (s.active) path.push([s.x / size, s.z / size]);
    }
    // She came up the stairs, along the corridor and in through her door to the candle,
    // never through a wall: every step stands on open floor.
    const solid = path.filter(([c, r]) => g.world.level.isSolid(Math.floor(c), Math.floor(r))).length;
    const inRoom = path.some(([c, r]) => c >= 1 && c < 7 && r >= 1 && r < 6);
    return { ...out, came: path.length > 0, solid, inRoom };
  });
  expect(after).toMatchObject({ palm: true, lit: false, message: 'msg.candleOut', came: true, solid: 0, inRoom: true });
});
