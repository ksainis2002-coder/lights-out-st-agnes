import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { waitForBoot } from './helpers.js';

// One scripted route per level/wing. Each must be finishable.
const routesDir = new URL('./bot-routes/', import.meta.url);
const routes = readdirSync(routesDir).map((file) => JSON.parse(readFileSync(new URL(file, routesDir), 'utf8')));

for (const route of routes) {
  test(`bot finishes route: ${route.id}`, async ({ page }) => {
    await page.goto('./');
    await waitForBoot(page);
    const result = await page.evaluate((r) => {
      const game = window.__stAgnes;
      game.play();
      return game.runBot(r);
    }, route);
    mkdirSync('test-results/bot', { recursive: true });
    writeFileSync(`test-results/bot/${route.id}.json`, JSON.stringify(result, null, 2));
    expect(result.stuckAt).toBeNull();
    expect(result.finished).toBe(true);
  });
}

test('bot reports a route that cannot be finished', async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  const result = await page.evaluate(() => {
    const game = window.__stAgnes;
    game.play();
    return game.runBot({ id: 'blocked', points: [{ cell: [3, 0] }] }, { maxSecondsPerPoint: 2 });
  });
  expect(result.finished).toBe(false);
  expect(result.stuckAt).toEqual([3, 0]);
});
