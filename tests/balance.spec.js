import { test, expect } from '@playwright/test';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { waitForBoot } from './helpers.js';

// Balance at human pace (run with BALANCE=1): the wing route with the bot
// lingering after every step (15 s), so the run lasts about as long as a player's.
// A collapse is counted and sanity set back to 60 on the spot (instead of
// rewinding), so the route can carry on. Writes test-results/bot/balance.json.
const route = JSON.parse(readFileSync(new URL('./bot-routes/orphanage_wing.json', import.meta.url), 'utf8'));
const LINGER = Number(process.env.LINGER ?? 15);

test.skip(!process.env.BALANCE, 'balance run: BALANCE=1 npx playwright test tests/balance.spec.js');

test('orphanage wing at human pace: time and collapses per hour', async ({ page }) => {
  test.setTimeout(900_000);
  await page.goto('./');
  await waitForBoot(page);
  const result = await page.evaluate(({ r, linger }) => {
    const game = window.__stAgnes;
    game.newGame();
    game.intro.finish();
    const samples = [];
    const collapseMinutes = [];
    let t = 0;
    // Like a player: when the light dies, swap in a battery if there is one.
    let batteriesUsed = 0;
    let darkSeconds = 0;
    let pillsTaken = 0;
    const swap = () => {
      if (game.battery.canLight() || !game.inventory.has('battery')) return;
      game.itemEffects.battery();
      game.world.flashlight.setOn(true);
      batteriesUsed += 1;
    };
    game.events.on('battery.dead', swap);
    game.events.on('item.taken', swap); // a battery found in the dark goes straight in
    game.collapse.start = () => {
      collapseMinutes.push(t / 60);
      game.sanity.set(60);
    };
    const advance = game.advance;
    game.advance = (seconds) => {
      advance(seconds);
      t += seconds;
      if (!game.world.flashlight.isOn()) darkSeconds += seconds;
      // Like a player: take pills when falling apart.
      if (game.sanity.value() < 15 && game.inventory.has('pills')) {
        game.itemEffects.pills();
        pillsTaken += 1;
      }
      if (samples.length === 0 || t - samples[samples.length - 1].t >= 10) samples.push({ t, sanity: game.sanity.value(), room: game.world.level.id });
    };
    const bot = game.runBot(r, { lingerSeconds: linger });
    game.advance = advance;
    const collapses = collapseMinutes.length;
    return { batteriesUsed, pillsTaken, flashlightOffMinutes: darkSeconds / 60, batteryLeft: game.battery.charge(), finished: bot.finished, failedStep: bot.failedStep, minutes: t / 60, collapses, perHour: collapses / (t / 3600), collapseMinutes, samples };
  }, { r: route, linger: LINGER });
  mkdirSync('test-results/bot', { recursive: true });
  writeFileSync('test-results/bot/balance.json', JSON.stringify(result, null, 2));
  expect(result.finished).toBe(true);
});
