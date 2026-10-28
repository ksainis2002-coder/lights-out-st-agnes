import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, lookAt, use, arrive, load } from './helpers.js';

// Doors home (owner pick 1a, 2026-10-27): the patient room's own door set
// into the staff room's wall (part A) and the headmaster's flat (part B).
// Through it to your room; your room's door takes you back the way you came.

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => window.__stAgnes.play());
});

// Where the player stands now, in cells.
const standing = (page) => page.evaluate(() => {
  const { player, world } = window.__stAgnes;
  const size = world.level.cellSize;
  return [player.state.position.x / size, player.state.position.z / size];
});
const near = ([x, z], [ex, ez]) => Math.hypot(x - ex, z - ez) < 0.3;

// Out through your room's own door.
async function leaveRoom(page) {
  expect(await lookAt(page, [2.5, 5.5], [2.5, 6.5, 1.2])).toBe('prompt.leave');
  await use(page);
  return arrive(page);
}

for (const { name, level, spawnName, spawn, door } of [
  { name: 'the staff room', level: 'school_ground', spawnName: 'home_staff', spawn: [45.5, 17.5], door: [46.0, 17.5] },
  { name: "the headmaster's flat", level: 'school_upper', spawnName: 'home_flat', spawn: [42.5, 6.5], door: [43.0, 6.5] },
]) {
  test(`the door home in ${name} takes you to your room, and your room's door brings you back`, async ({ page }) => {
    const errors = trackErrors(page);
    await load(page, level, spawnName);
    expect(near(await standing(page), spawn)).toBe(true);
    expect(await lookAt(page, spawn, [...door, 1.2])).toBe('prompt.goHome');
    await use(page);
    expect(await arrive(page)).toBe('patient_room');
    expect(await leaveRoom(page)).toBe(level);
    expect(near(await standing(page), spawn)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("in from the landing, your room's door goes back to the landing", async ({ page }) => {
  await load(page, 'school_ground', 'home_staff');
  await lookAt(page, [45.5, 17.5], [46.0, 17.5, 1.2]);
  await use(page);
  expect(await arrive(page)).toBe('patient_room');
  expect(await leaveRoom(page)).toBe('school_ground');

  await load(page, 'orphanage_wing', 'landing');
  expect(await lookAt(page, [1.5, 11.5], [0.5, 11.5, 1.2])).toBe('prompt.stairsUp');
  await use(page);
  expect(await arrive(page)).toBe('patient_room');
  expect(await leaveRoom(page)).toBe('orphanage_wing');
});

test('a new game: your room\'s door leads to the landing', async ({ page }) => {
  expect(await page.evaluate(() => window.__stAgnes.world.level.id)).toBe('patient_room');
  expect(await leaveRoom(page)).toBe('orphanage_wing');
});
