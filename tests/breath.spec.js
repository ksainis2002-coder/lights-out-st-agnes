import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors } from './helpers.js';

// Holding your breath (0.5; approved still ui_breath; the wing 4 content
// sheet): Space, about 6 s on Normal, then a gasp that carries; the ring in
// the middle of the view while you hold it; panting after a run unless held.

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

// The words the HUD draws this frame.
const hudWords = (page) => game(page, () => {
  const ctx = document.createElement('canvas').getContext('2d');
  const words = [];
  const fillText = ctx.fillText.bind(ctx);
  ctx.fillText = (text, ...rest) => {
    words.push(String(text));
    fillText(text, ...rest);
  };
  window.__stAgnes.ui.drawHud(ctx);
  return words;
});

test('held for six seconds, then a gasp he can hear; let go first and it fills again', async ({ page }) => {
  const errors = trackErrors(page);
  const held = await game(page, () => {
    const g = window.__stAgnes;
    g.input.setVirtual('holdBreath', true);
    g.advance(3);
    return { holding: g.breath.holding(), left: g.breath.left() };
  });
  expect(held.holding).toBe(true);
  expect(held.left).toBeCloseTo(0.5, 1);
  expect(await hudWords(page)).toContain('HOLDING BREATH');

  const gasped = await game(page, () => {
    const g = window.__stAgnes;
    g.advance(3.2);
    const after = { holding: g.breath.holding(), heard: g.heard.slice() };
    g.advance(2); // still pressing: no holding it again until you let go
    after.stillOut = !g.breath.holding();
    return after;
  });
  expect(gasped.holding).toBe(false);
  expect(gasped.stillOut).toBe(true);
  expect(gasped.heard.find((n) => n.kind === 'gasp')).toMatchObject({ radius: 9 });
  expect(gasped.heard).toContain('caption.gasp');
  expect(await hudWords(page)).not.toContain('HOLDING BREATH');

  const refilled = await game(page, () => {
    const g = window.__stAgnes;
    g.input.setVirtual('holdBreath', false);
    const before = g.breath.left(); // you breathe again after the gasp, key down or not
    g.advance(6); // half as fast as it ran out: half of it back in six seconds
    const gained = g.breath.left() - before;
    g.advance(7);
    return { gained, full: g.breath.left() };
  });
  expect(refilled.gained).toBeCloseTo(0.5, 1);
  expect(refilled.full).toBe(1);
  expect(errors).toEqual([]);
});

test('after a run you pant, close by, unless you hold your breath', async ({ page }) => {
  const noise = await game(page, () => {
    const g = window.__stAgnes;
    const calm = g.breath.noise();
    g.player.state.stamina = 30; // just ran
    const panting = g.breath.noise();
    g.input.setVirtual('holdBreath', true);
    g.advance(0.1);
    return { calm, panting, held: g.breath.noise() };
  });
  expect(noise).toEqual({ calm: 0, panting: 3, held: 0 });
});

test('on Story you can hold it for eight seconds', async ({ page }) => {
  const left = await game(page, () => {
    const g = window.__stAgnes;
    g.settings.set('difficulty', 'story');
    g.input.setVirtual('holdBreath', true);
    g.advance(7);
    return g.breath.holding() ? g.breath.left() : 0;
  });
  expect(left).toBeCloseTo(1 / 8, 1);
});
