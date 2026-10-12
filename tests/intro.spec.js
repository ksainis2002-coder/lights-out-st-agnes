import { test, expect } from '@playwright/test';
import { waitForBoot } from './helpers.js';

const state = (page) => page.evaluate(() => {
  const game = window.__stAgnes;
  return { active: game.intro.active(), fade: game.pipeline.fx.fade, eyelid: game.pipeline.fx.eyelid, subtitle: game.subtitles.current?.()?.key ?? null };
});

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => window.__stAgnes.newGame());
});

test('a new game opens with the intro: black, eyes open, whisper, then control', async ({ page }) => {
  let s = await state(page);
  expect(s.active).toBe(true);
  expect(s.fade).toBe(1);
  await page.evaluate(() => window.__stAgnes.advance(11));
  s = await state(page);
  expect(s.fade).toBe(0);
  expect(s.eyelid).toBeGreaterThan(0.2);
  // The player cannot walk during the intro.
  const before = await page.evaluate(() => ({ ...window.__stAgnes.player.state.position }));
  await page.evaluate(() => {
    window.__stAgnes.input.hold?.('forward', true);
    window.__stAgnes.advance(2);
    window.__stAgnes.input.hold?.('forward', false);
  });
  expect(await page.evaluate(() => ({ ...window.__stAgnes.player.state.position }))).toEqual(before);
  await page.evaluate(() => window.__stAgnes.advance(30));
  s = await state(page);
  expect(s.active).toBe(false);
  expect(s.eyelid).toBe(0);
  expect(await page.evaluate(() => window.__stAgnes.progress.hasFlag('intro_seen'))).toBe(true);
});

test('ENTER skips the intro', async ({ page }) => {
  await page.evaluate(() => window.__stAgnes.advance(2));
  await page.keyboard.press('Enter');
  await page.evaluate(() => window.__stAgnes.advance(0.1));
  const s = await state(page);
  expect(s.active).toBe(false);
  expect(s.fade).toBe(0);
});

test('the flashlight lies on the patient room table; F does nothing until it is taken', async ({ page }) => {
  await page.evaluate(() => window.__stAgnes.intro.finish());
  const on = () => page.evaluate(() => window.__stAgnes.world.flashlight.isOn());
  expect(await on()).toBe(false);
  await page.evaluate(() => {
    window.__stAgnes.input.tap('flashlight');
    window.__stAgnes.advance(0.1);
  });
  expect(await on()).toBe(false);
  const prompt = await page.evaluate(() => {
    const game = window.__stAgnes;
    Object.assign(game.player.state.position, { x: 3.6, z: 2.85 });
    game.player.state.yaw = -Math.PI / 2; // facing +x
    game.player.state.pitch = Math.atan2(0.8 - game.player.state.eyeHeight, 0.95);
    game.advance(1 / 30);
    return game.interaction.target()?.prompt() ?? null;
  });
  expect(prompt?.key).toBe('prompt.take');
  const seen = await page.evaluate(() => {
    const game = window.__stAgnes;
    game.input.tap('use');
    const keys = new Set();
    for (let i = 0; i < 600; i++) {
      game.advance(0.1);
      keys.add(game.messages.current()?.key);
    }
    return [...keys];
  });
  expect(seen).toEqual(expect.arrayContaining(['msg.taken', 'tutorial.flashlight.toggle', 'tutorial.flashlight.dark']));
  expect(await page.evaluate(() => window.__stAgnes.inventory.items())).toEqual([]); // a tool takes no slot
  await page.evaluate(() => {
    window.__stAgnes.input.tap('flashlight');
    window.__stAgnes.advance(0.1);
  });
  expect(await on()).toBe(true);
});

test('every drawing can be looked at', async ({ page }) => {
  await page.evaluate(() => window.__stAgnes.intro.finish());
  const result = await page.evaluate(() => {
    const game = window.__stAgnes;
    const target = { x: 3.4, y: 1.2, z: 1.0 }; // the horse drawing in the patient room
    Object.assign(game.player.state.position, { x: 3.4, z: 2.1 });
    game.player.state.yaw = 0; // facing -z
    game.player.state.pitch = Math.atan2(target.y - game.player.state.eyeHeight, 1.1);
    game.advance(1 / 30);
    const prompt = game.interaction.target()?.prompt()?.key ?? null;
    game.input.tap('use');
    game.advance(0.1);
    return { prompt, message: game.messages.current()?.key };
  });
  expect(result).toEqual({ prompt: 'prompt.look', message: 'look.drawing.horse' });
});

test('tutorial: every control is explained once, when it first matters', async ({ page }) => {
  const seen = await page.evaluate(() => {
    const game = window.__stAgnes;
    const keys = new Set();
    const watch = (seconds) => {
      for (let i = 0; i < seconds * 10; i++) {
        game.advance(0.1);
        keys.add(game.messages.current()?.key);
      }
    };
    game.intro.finish();
    watch(14);
    // Walk a few metres towards the table: run, crouch and lean come next,
    // and looking at the flashlight explains "use".
    game.input.setVirtual('forward', true);
    game.player.state.yaw = -Math.PI / 2;
    watch(1.2);
    game.player.state.yaw = Math.PI; // turn before the table, along the room
    watch(1.5);
    game.input.setVirtual('forward', false);
    Object.assign(game.player.state.position, { x: 3.6, z: 2.85 });
    game.player.state.yaw = -Math.PI / 2; // facing the flashlight on the table
    game.player.state.pitch = Math.atan2(0.8 - game.player.state.eyeHeight, 0.95);
    watch(40);
    return [...keys];
  });
  expect(seen).toEqual(expect.arrayContaining([
    'tutorial.move', 'tutorial.pause', 'tutorial.run', 'tutorial.crouch', 'tutorial.lean', 'tutorial.use',
  ]));
});
