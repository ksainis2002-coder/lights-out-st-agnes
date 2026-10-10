import { test, expect } from '@playwright/test';
import { waitForBoot } from './helpers.js';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => window.__stAgnes.newGame());
});

// Puts the player in a wing cell; returns sanity after `seconds` of game time.
const sanityAfter = (page, cell, seconds, { flashlight = true, start = 100 } = {}) => page.evaluate(({ cell, seconds, flashlight, start }) => {
  const g = window.__stAgnes;
  if (g.world.level.id !== 'orphanage_wing') g.loadLevel('orphanage_wing', 'landing');
  if (g.world.flashlight.isOn() !== flashlight) g.world.flashlight.toggle();
  const c = g.world.level.cellCenter(...cell);
  Object.assign(g.player.state.position, { x: c.x, z: c.z });
  g.sanity.set(start);
  g.advance(seconds);
  return g.sanity.value();
}, { cell, seconds, flashlight, start });

test('the dark drains sanity, much faster with the flashlight off', async ({ page }) => {
  const withLight = await sanityAfter(page, [7, 15], 10, { flashlight: true });
  const without = await sanityAfter(page, [7, 15], 10, { flashlight: false });
  expect(withLight).toBeLessThan(100);
  expect(100 - without).toBeGreaterThan((100 - withLight) * 3);
});

test('the patient room restores sanity; pills help too', async ({ page }) => {
  const restored = await page.evaluate(() => {
    const g = window.__stAgnes;
    g.loadLevel('patient_room');
    g.sanity.set(40);
    g.advance(5);
    return g.sanity.value();
  });
  expect(restored).toBeGreaterThan(50);
  const pills = await page.evaluate(() => {
    const g = window.__stAgnes;
    g.loadLevel('orphanage_wing', 'landing');
    g.sanity.set(30);
    g.inventory.add('pills');
    g.inventory.setOpen(true);
    g.input.tap('use');
    g.advance(1 / 60);
    return { sanity: g.sanity.value(), items: g.inventory.items() };
  });
  expect(pills.sanity).toBeGreaterThanOrEqual(59);
  expect(pills.items).toEqual([]);
});

test('at zero sanity the player blacks out, the tape rewinds to the checkpoint, and a child says why', async ({ page }) => {
  const result = await page.evaluate(() => {
    const g = window.__stAgnes;
    g.loadLevel('orphanage_wing', 'landing');
    g.autosave(); // checkpoint at the landing
    const c = g.world.level.cellCenter(7, 15);
    Object.assign(g.player.state.position, { x: c.x, z: c.z });
    if (g.world.flashlight.isOn()) g.world.flashlight.toggle();
    g.sanity.set(0.5);
    g.advance(3);
    const midway = { active: g.collapse.active(), rewinding: g.collapse.rewinding(), rewind: g.pipeline.fx.rewind };
    g.advance(3);
    return {
      midway,
      active: g.collapse.active(),
      rewinds: g.collapse.rewinds(),
      sanity: g.sanity.value(),
      subtitle: g.subtitles.current()?.key,
      landing: g.player.state.position.z < 13 * 1.3,
    };
  });
  expect(result.midway.active).toBe(true);
  expect(result.midway.rewinding).toBe(true);
  expect(result.midway.rewind).toBe(1);
  expect(result.active).toBe(false);
  expect(result.rewinds).toBe(1);
  expect(result.sanity).toBeGreaterThanOrEqual(60);
  expect(result.subtitle).toBe('whisper.rewind.dark');
  expect(result.landing).toBe(true);
});

test('fake children appear at low sanity but never drain it or touch the player (scare rules §3)', async ({ page }) => {
  const result = await page.evaluate(() => {
    const g = window.__stAgnes;
    g.loadLevel('orphanage_wing', 'landing');
    const c = g.world.level.cellCenter(12, 10.5);
    Object.assign(g.player.state.position, { x: c.x, z: c.z });
    g.player.state.yaw = -Math.PI / 2; // down the corridor
    g.sanity.set(25);
    // Every step, the change must be exactly what the light level explains.
    let unexplained = 0;
    for (let i = 0; i < 40 * 60; i++) {
      const before = g.sanity.value();
      g.advance(1 / 60);
      unexplained = Math.max(unexplained, Math.abs(g.sanity.value() - before - g.sanity.rate() / 60));
    }
    return { shown: g.hallucinations.shown(), unexplained, solid: g.world.level.isSolid(12, 10) };
  });
  expect(result.shown).toBeGreaterThan(0);
  expect(result.unexplained).toBeLessThan(1e-6); // fakes never take sanity
  expect(result.solid).toBe(false); // and never block the way
});

test('low sanity bends the picture', async ({ page }) => {
  const fx = await page.evaluate(() => {
    const g = window.__stAgnes;
    g.sanity.set(20);
    return new Promise((resolve) => setTimeout(() => resolve({ ...g.pipeline.fx }), 300));
  });
  expect(fx.aberration).toBeGreaterThan(1);
  expect(fx.vignette).toBeGreaterThan(0.3);
  expect(fx.blur).toBeGreaterThan(0);
});

test('the journal says how the player feels', async ({ page }) => {
  const lines = await page.evaluate(() => {
    const g = window.__stAgnes;
    const read = (value) => {
      g.sanity.set(value);
      g.openScreen('journal');
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 270;
      const texts = [];
      const ctx = canvas.getContext('2d');
      const original = ctx.fillText.bind(ctx);
      ctx.fillText = (text, ...rest) => {
        texts.push(text);
        original(text, ...rest);
      };
      g.ui.current().draw(ctx);
      g.resume();
      return texts.find((t) => t.startsWith('How I feel'));
    };
    return [read(90), read(30)];
  });
  expect(lines[0]).toBe('How I feel: calm.');
  expect(lines[1]).toBe('How I feel: shaking. I keep seeing things.');
});
