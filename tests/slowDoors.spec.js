import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, lookAt } from './helpers.js';

// Doors that shout (0.5, part B; the wing 4 content sheet): in the basement a
// clicked door swings at once and bangs, a noise of 10 m; held and dragged, it
// eases open slowly and quietly, and while you drag your view stays put.

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

// In the corridor before the coal store's door (cell 7, 6), looking at it.
const faceCoalDoor = (page) => lookAt(page, [7.5, 7.9], [7.5, 6.5, 1.2]);
const door = (page) => game(page, () => {
  const d = window.__stAgnes.world.level.doorAt(7, 6);
  return { open: d.open, angle: d.angle };
});

test('the prompt names the hold and drag; a click opens the door at once and it bangs', async ({ page }) => {
  const errors = trackErrors(page);
  expect(await faceCoalDoor(page)).toBe('prompt.openSlowly');
  const prompt = await game(page, () => window.__stAgnes.interaction.target().prompt());
  expect(prompt.inputLabel).toBe('input.holdDrag');
  expect(await game(page, () => window.__stAgnes.progress.hasFlag('tutorial_slowDoor'))).toBe(true);

  await game(page, () => {
    const g = window.__stAgnes;
    g.input.tap('use');
    g.advance(1);
  });
  expect((await door(page)).open).toBe(true);
  const heard = await game(page, () => window.__stAgnes.heard);
  expect(heard.find((n) => n.kind === 'door')).toMatchObject({ radius: 10 });
  expect(heard).toContain('caption.doorBangs');
  expect(errors).toEqual([]);
});

test('held and dragged, the door eases open slowly with no noise, and the view stays put', async ({ page }) => {
  await faceCoalDoor(page);
  const result = await game(page, () => {
    const g = window.__stAgnes;
    const yaw = g.player.state.yaw;
    g.input.setVirtual('use', true);
    g.input.tap('use');
    g.advance(1 / 60);
    const angles = [];
    for (let i = 0; i < 30; i++) {
      g.input.addLook(0, 400); // a hard pull, every frame
      g.advance(1 / 60);
      angles.push(g.world.level.doorAt(7, 6).angle);
    }
    const halfway = { open: g.world.level.doorAt(7, 6).open, yawKept: g.player.state.yaw === yaw };
    for (let i = 0; i < 90; i++) {
      g.input.addLook(0, 400);
      g.advance(1 / 60);
    }
    g.input.setVirtual('use', false);
    g.advance(2);
    const d = g.world.level.doorAt(7, 6);
    return { half: angles[29], halfway, open: d.open, angle: d.angle, heard: g.heard, opened: g.progress.isOpen('coal_door') };
  });
  // Half a second of pulling as hard as you like turns it no more than about half a radian.
  expect(result.half).toBeGreaterThan(-0.6);
  expect(result.half).toBeLessThan(-0.3);
  expect(result.halfway.yawKept).toBe(true);
  expect(result.open).toBe(true);
  expect(result.angle).toBeCloseTo(-Math.PI / 2, 2);
  expect(result.opened).toBe(true);
  expect(result.heard).toEqual([]); // no bang, no noise
});

test('doors upstairs still work with a plain click and no bang', async ({ page }) => {
  const result = await game(page, () => {
    const g = window.__stAgnes;
    g.loadLevel('wards_ground', 'courtyard_door');
    g.heard = [];
    const d = g.world.level.doors.find((x) => x.id === 'ward_a_east');
    const size = g.world.level.cellSize;
    const c = g.world.level.cellCenter(...d.cell);
    Object.assign(g.player.state.position, { x: c.x, z: c.z + size });
    g.player.state.yaw = 0;
    g.player.state.pitch = 0;
    g.advance(1 / 30);
    const was = d.open;
    const prompt = g.interaction.target()?.prompt();
    g.input.tap('use');
    g.advance(1);
    return { prompt, toggled: d.open !== was, heard: g.heard };
  });
  expect(['prompt.open', 'prompt.close']).toContain(result.prompt.key);
  expect(result.prompt.inputLabel).toBeUndefined();
  expect(result.toggled).toBe(true);
  expect(result.heard).toEqual([]);
});
