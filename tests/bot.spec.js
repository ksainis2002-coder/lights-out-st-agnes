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
      if (r.start === 'newGame') {
        game.newGame();
        game.intro.finish();
      } else {
        game.play();
        // A route can start further on: what is already done or carried.
        (r.given?.flags ?? []).forEach((flag) => game.progress.setFlag(flag));
        (r.given?.items ?? []).forEach((item) => game.inventory.add(item));
        (r.given?.taken ?? []).forEach((id) => game.progress.take(id));
        (r.given?.read ?? []).forEach((id) => game.progress.read(id));
        Object.entries(r.given?.values ?? {}).forEach(([key, value]) => game.progress.setValue(key, value));
        game.loadLevel(r.level, r.spawn);
      }
      const result = game.runBot(r);
      const { flags, read } = game.progress.toJSON();
      return { ...result, level: game.world.level.id, items: game.inventory.items(), flags, read };
    }, route);
    mkdirSync('test-results/bot', { recursive: true });
    writeFileSync(`test-results/bot/${route.id}.json`, JSON.stringify(result, null, 2));
    expect(result.failedStep).toBeNull();
    expect(result.finished).toBe(true);
    expect(result.flags).toEqual(expect.arrayContaining(route.expectFlags ?? [])); // what the route must leave done
    expect(result.read).toEqual(expect.arrayContaining(route.expectRead ?? [])); // the documents it must have read
    if (route.maxCollapses !== undefined) expect(result.collapses).toBeLessThanOrEqual(route.maxCollapses); // never caught
  });
}

test('bot reports a route that cannot be finished', async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  const result = await page.evaluate(() => {
    const game = window.__stAgnes;
    game.play();
    game.loadLevel('test_corridor');
    return game.runBot({ id: 'blocked', points: [{ cell: [3, 0] }] }, { maxSecondsPerPoint: 2 });
  });
  expect(result.finished).toBe(false);
  expect(result.stuckAt).toEqual([3, 0]);
});
