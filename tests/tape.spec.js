import { test, expect } from '@playwright/test';
import { waitForBoot, trackErrors, lookAt, use, load } from './helpers.js';

// Nora's tape on the day room television (approved still ui_tape, the
// content sheet): about 25 s of her footage; the game stands still while it
// plays; it can be stopped and played again.

const TV = [[21.4, 13.2], [21.4, 11.9, 1.05]];
const game = (page, fn, arg) => page.evaluate(fn, arg);

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => {
    const g = window.__stAgnes;
    g.play();
    ['tool_flashlight', 'tool_camcorder', 'nun_walking', 'lamp_out_ward_a_1', 'lamp_out_ward_a_2', 'lamp_out_ward_a_3', 'edith_met']
      .forEach((flag) => g.progress.setFlag(flag));
    g.inventory.add('nora_tape');
  });
  await load(page, 'wards_ground', 'courtyard_door');
});

test('the tape goes in and plays her four lines; Ward A is shown as she filmed it, then everything is as it was', async ({ page }) => {
  const errors = trackErrors(page);
  expect(await lookAt(page, ...TV)).toBe('prompt.playTape');
  await game(page, () => window.__stAgnes.world.flashlight.setOn(true));
  await use(page);
  const result = await game(page, () => {
    const g = window.__stAgnes;
    const lines = [];
    g.events.on('subtitle.shown', (line) => lines.push(line.key));
    const playing = { active: g.tape.active(), tape: g.inventory.has('nora_tape'), light: g.world.flashlight.isOn() };
    const nunAt = g.nun.state().x;
    g.advance(2);
    const wardLit = g.lamps.all().filter((lamp) => lamp.light.visible).map((lamp) => lamp.id);
    let seconds = 2;
    while (g.tape.active() && seconds < 40) {
      g.advance(0.25);
      seconds += 0.25;
    }
    const stood = g.nun.state().x === nunAt; // nothing moved while it played
    return {
      playing, lines, wardLit,
      after: { active: g.tape.active(), light: g.world.flashlight.isOn(), lit: g.lamps.lit().map((lamp) => lamp.id), night: g.pipeline.fx.nightVision },
      stood, seconds,
      watched: g.progress.hasFlag('watched_nora_tape'),
      caught: g.collapse.active(),
    };
  });
  expect(result.playing).toEqual({ active: true, tape: false, light: false });
  expect(result.wardLit).toEqual(['ward_a_1', 'ward_a_2', 'ward_a_3']);
  expect(result.lines).toEqual(['tape.line.1', 'tape.line.2', 'tape.line.3', 'tape.end']);
  expect(result.after).toEqual({ active: false, light: true, lit: [], night: 0 });
  expect(result.stood).toBe(true);
  expect(result.seconds).toBeGreaterThan(24);
  expect(result.seconds).toBeLessThan(27);
  expect(result.watched).toBe(true);
  expect(result.caught).toBe(false);
  expect(errors).toEqual([]);
});

test('a click stops the tape, and it can be played again', async ({ page }) => {
  await lookAt(page, ...TV);
  await use(page);
  const stopped = await game(page, () => {
    const g = window.__stAgnes;
    g.advance(3);
    g.input.tap('use');
    g.advance(0.1);
    return { active: g.tape.active(), mode: g.mode, watched: g.progress.hasFlag('watched_nora_tape') };
  });
  expect(stopped).toEqual({ active: false, mode: 'playing', watched: true });
  expect(await lookAt(page, ...TV)).toBe('prompt.playTape');
  await use(page);
  expect(await game(page, () => window.__stAgnes.tape.active())).toBe(true);
});
