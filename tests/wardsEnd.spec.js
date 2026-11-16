import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, lookAt, use, arrive, message, load } from './helpers.js';

// Wing 3, part C2 (the content sheet; approved stills box_mended, way_out,
// hub_after_wards): Edith's music box mended from its three parts, the way out
// with every lamp dead and Sister M. hunting faster, Edith's last line at the
// courtyard door, the wing done, and your room after it.

const game = (page, fn, arg) => page.evaluate(fn, arg);
const EDITH = [25.75, 4.1, 0.68]; // where you give her the parts (cells, metres)
const BESIDE = [24.6, 4.1]; // standing at the foot of her bed
const BOX = [25.575, 4.1, 0.72]; // the mended box in her lap (its open lid)
const PARTS = ['music_box_case', 'music_box_cylinder', 'music_box_key'];

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => {
    const g = window.__stAgnes;
    g.play();
    ['tool_flashlight', 'tool_camcorder', 'tutorial_use', 'nun_walking', 'edith_met', 'lamp_out_ward_a_1', 'lamp_out_ward_a_2', 'lamp_out_ward_a_3']
      .forEach((flag) => g.progress.setFlag(flag));
  });
});

// Edith's lines as they are said, from now on.
const listen = (page) => game(page, () => {
  window.__lines = [];
  window.__stAgnes.events.on('subtitle.shown', (line) => window.__lines.push(line.key));
});
const heard = (page) => game(page, () => window.__lines);
const run = (page, seconds) => game(page, (s) => {
  for (let t = 0; t < s; t += 0.1) window.__stAgnes.advance(0.1);
}, seconds);

test('Edith names each part you bring, once; all three mend the box in her lap, and it plays a tune with a note missing', async ({ page }) => {
  const errors = trackErrors(page);
  await game(page, () => window.__stAgnes.progress.setValue('nun_floor', 'wards_upper')); // Sister M. is upstairs
  await load(page, 'wards_ground', 'courtyard_door');
  await listen(page);
  await game(page, () => window.__stAgnes.inventory.add('music_box_case'));
  expect(await lookAt(page, BESIDE, EDITH)).not.toBe('prompt.giveEdith'); // one part is not the box
  await run(page, 6);
  await game(page, () => ['music_box_cylinder', 'music_box_key'].forEach((item) => window.__stAgnes.inventory.add(item)));
  await run(page, 12);
  expect(await heard(page)).toEqual(['edith.box.case', 'edith.box.cylinder', 'edith.box.key']);
  expect(await game(page, () => window.__stAgnes.progress.hasFlag('tried_musicBox'))).toBe(true);
  expect(await lookAt(page, BESIDE, BOX)).not.toBe('prompt.take'); // nothing in her lap yet

  expect(await lookAt(page, BESIDE, EDITH)).toBe('prompt.giveEdith');
  await use(page);
  const notes = await game(page, (parts) => {
    const g = window.__stAgnes;
    const played = [];
    g.events.on('edithTune.note', (note) => played.push(note));
    for (let t = 0; t < 40; t += 0.1) g.advance(0.1);
    return { played, mended: g.progress.hasFlag('music_box_mended'), parts: parts.filter((item) => g.inventory.has(item)), playing: g.wardsEnd.tune.state().playing };
  }, PARTS);
  expect(notes).toMatchObject({ mended: true, parts: [], playing: true });
  expect(notes.played.length).toBeGreaterThan(16);
  expect(notes.played.slice(0, 16).filter((note) => note === null)).toHaveLength(1); // one note missing in each turn
  expect((await heard(page)).slice(3, 5)).toEqual(['edith.box.whole', 'edith.box.take']);
  expect(await game(page, () => window.__stAgnes.journal.toJSON().clues ?? [])).toContain('solved_music_box');
  expect(await lookAt(page, BESIDE, BOX)).toBe('prompt.take'); // "Take it with you."
  expect(await lookAt(page, BESIDE, EDITH)).not.toBe('prompt.giveEdith');
  expect(errors).toEqual([]);
});

// The box mended and in her lap: the moment before the way out.
const mended = async (page) => {
  await game(page, () => {
    const g = window.__stAgnes;
    g.progress.setFlag('music_box_mended');
    g.progress.setValue('nun_floor', 'wards_upper'); // she is upstairs: the way out brings her down
    ['power_ward_a', 'power_childrens_ward', 'power_corridor'].forEach((flag) => g.progress.setFlag(flag));
    ['lamp_out_ward_a_1', 'lamp_out_ward_a_2', 'lamp_out_ward_a_3'].forEach((flag) => g.progress.clearFlag(flag));
  });
  await load(page, 'wards_ground', 'courtyard_door');
};

test('taking the box: the bulbs hum, then every lamp dies for good, and Sister M. waits between you and the door, faster', async ({ page }) => {
  await mended(page);
  await listen(page);
  const before = await game(page, () => ({ lit: window.__stAgnes.lamps.lit().length, here: window.__stAgnes.nun.state().active }));
  expect(before.lit).toBeGreaterThan(2); // Ward A's, on the fuse it starts with
  expect(before.here).toBe(false);
  expect(await lookAt(page, BESIDE, BOX)).toBe('prompt.take');
  await use(page);
  const after = await game(page, () => {
    const g = window.__stAgnes;
    const size = g.world.level.cellSize;
    const events = [];
    ['lamps.dying', 'lamps.died', 'wayOut.started', 'game.autosaved'].forEach((name) => g.events.on(name, () => events.push(name)));
    let at = null; // where she stands as the lamps die
    g.events.on('wayOut.started', () => {
      const s = g.nun.state();
      at = { x: s.x / size, z: s.z / size };
    });
    const humming = g.lamps.lit().length;
    for (let t = 0; t < 1.6; t += 0.1) g.advance(0.1);
    const her = g.nun.state();
    g.lamps.power('ward_a', true); // a fuse pushed in again lights nothing now
    return {
      events, humming, at, mode: her.mode,
      lit: g.lamps.lit().length,
      flags: ['lamps_dead', 'wards_way_out'].every((flag) => g.progress.hasFlag(flag)),
      toy: g.inventory.has('music_box'),
      floor: g.progress.getValue('nun_floor'),
    };
  });
  expect(after.humming).toBeGreaterThan(2); // the hum first: the lamps are still lit as it starts
  expect(after.events.slice(0, 3)).toEqual(['lamps.died', 'wayOut.started', 'game.autosaved']);
  expect(after).toMatchObject({ lit: 0, flags: true, toy: true, floor: 'wards_ground', mode: 'round' });
  expect(Math.hypot(after.at.x - 30.5, after.at.z - 9.2)).toBeLessThan(0.5); // by the admissions door
  await run(page, 5);
  expect(await heard(page)).toContain('edith.box.lampsDie');

  // She walks her hunt at 2.0 m/s (her round was 1.5), and slower in comfort mode.
  const pace = (comfort) => game(page, (c) => {
    const g = window.__stAgnes;
    const size = g.world.level.cellSize;
    g.settings.set('comfortMode', c);
    g.world.flashlight.setOn(false);
    Object.assign(g.player.state.position, { x: 22 * size, z: 3 * size }); // in the ward, out of her way
    g.nun.moveTo(30.5 * size, 8.6 * size);
    const from = g.nun.state();
    for (let t = 0; t < 2; t += 0.1) g.advance(0.1);
    const to = g.nun.state();
    return Math.hypot(to.x - from.x, to.z - from.z) / 2;
  }, comfort);
  expect(await pace(false)).toBeGreaterThan(1.85);
  expect(await pace(false)).toBeLessThan(2.1);
  expect(await pace(true)).toBeLessThan(1.3);
});

test('on the way out she hunts your light: "Lights out." first, and a catch rewinds you to where the lamps died', async ({ page }) => {
  await mended(page);
  await lookAt(page, BESIDE, BOX);
  await use(page);
  await game(page, () => window.__stAgnes.world.flashlight.setOn(false)); // in the dark while the lamps die
  await run(page, 2);
  const result = await game(page, () => {
    const g = window.__stAgnes;
    const size = g.world.level.cellSize;
    const lines = [];
    g.events.on('subtitle.shown', (line) => lines.push(line.key));
    Object.assign(g.player.state.position, { x: 26 * size, z: 8.6 * size }); // out in the corridor
    g.player.state.yaw = Math.PI / 2;
    g.nun.moveTo(31 * size, 8.6 * size);
    g.world.flashlight.setOn(true);
    let warnedAt = null;
    let caughtAt = null;
    for (let t = 0; t < 30 && !g.collapse.active(); t += 0.1) {
      g.advance(0.1);
      if (warnedAt === null && lines.some((key) => key === 'nun.lightsOut' || key === 'nun.afterEight')) warnedAt = t;
    }
    caughtAt = g.collapse.active() ? true : null;
    for (let t = 0; t < 20 && g.collapse.active(); t += 0.1) g.advance(0.1);
    const p = g.player.state.position;
    const her = g.nun.state();
    return {
      warnedAt, caughtAt, back: { x: p.x / size, z: p.z / size }, her: { x: her.x / size, z: her.z / size },
      flags: ['lamps_dead', 'wards_way_out'].every((flag) => g.progress.hasFlag(flag)), toy: g.inventory.has('music_box'),
    };
  });
  expect(result.warnedAt).not.toBeNull();
  expect(result.caughtAt).toBe(true);
  expect(result).toMatchObject({ flags: true, toy: true });
  expect(result.back.x).toBeGreaterThan(20); // back in the children's ward, where the lamps died
  expect(result.back.z).toBeLessThan(7);
  expect(Math.hypot(result.her.x - 30.5, result.her.z - 9.2)).toBeLessThan(1.5); // and she by the admissions door again
});

test('out through the courtyard door: Edith calls you Tommy, the tune winds down, the wing is done; your room is darker after it', async ({ page }) => {
  const errors = trackErrors(page);
  await game(page, () => {
    const g = window.__stAgnes;
    ['music_box_mended', 'lamps_dead', 'wards_way_out', 'wing_school_done', 'puzzle_lanterns', 'puzzle_hopscotch', 'puzzle_records'].forEach((flag) => g.progress.setFlag(flag));
    ['stone_palm', 'edith_music_box'].forEach((id) => g.progress.take(id));
    g.progress.read('hale_file_3');
    g.inventory.add('music_box');
    g.progress.setValue('nun_floor', 'wards_upper');
  });
  await load(page, 'wards_ground', 'courtyard_door');
  await listen(page);
  expect(await game(page, () => window.__stAgnes.wardsEnd.tune.state().playing)).toBe(true);
  expect(await lookAt(page, [38.7, 13.5], [40, 13.5, 1.2])).toBe('prompt.toCourtyard');
  await use(page);
  expect(await arrive(page)).toBe('grounds');
  await run(page, 8);
  const out = await game(page, () => {
    const g = window.__stAgnes;
    return {
      escaped: g.progress.hasFlag('wards_escaped'), done: g.progress.hasFlag('wing_wards_done'),
      clue: (g.journal.toJSON().clues ?? []).includes('edith_tommy'), tune: g.wardsEnd.tune.state(),
    };
  });
  expect(await heard(page)).toContain('edith.box.last');
  expect(out).toMatchObject({ escaped: true, done: true, clue: true, tune: { playing: false, winding: null } });

  await load(page, 'patient_room', 'door');
  const room = await game(page, () => {
    const g = window.__stAgnes;
    const ids = [];
    g.world.levelGroup.traverse((object) => { if (object.userData.prop?.id) ids.push(object.userData.prop.id); });
    return { ids, light: g.world.level.lights.filter((light) => light.type === 'point').map((light) => light.intensity) };
  });
  expect(room.ids).toEqual(expect.arrayContaining(['hub_soot_ceiling', 'hub_soot_door', 'hub_soot_west', 'hub_candle']));
  expect(room.light).toEqual([1.06]);
  expect(await message(page)).toBe('msg.homeAfterWards');
  await game(page, () => window.__stAgnes.messages.clear?.());
  await load(page, 'patient_room', 'door');
  expect(await message(page)).not.toBe('msg.homeAfterWards'); // said once
  expect(errors).toEqual([]);
});
