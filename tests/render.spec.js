import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { parseLevel, roomAt } from '../src/levels/loader.js';
import { waitForBoot } from './helpers.js';

const corridor = JSON.parse(readFileSync(new URL('../src/levels/test_corridor.json', import.meta.url), 'utf8'));

test('level data parses into grid, rooms, triggers and spawn', () => {
  const level = parseLevel(corridor);
  expect(level.isSolid(0, 0)).toBe(true);
  expect(level.isSolid(1, 2)).toBe(false);
  expect(level.kindAt(3, 1)).toBe('door');
  expect(roomAt(level, { x: level.spawn.x, z: level.spawn.z })).toBe('corridor_A');
  expect(level.triggers.map((t) => t.id)).toContain('lullaby_start');
});

test('scene renders at 320×180 and is not black', async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  const result = await page.evaluate(() => {
    const { pipeline } = window.__stAgnes;
    return { brightness: pipeline.sceneBrightness(), draws: pipeline.stats.drawCalls };
  });
  expect(result.brightness).toBeGreaterThan(3);
  expect(result.draws).toBeGreaterThan(0);
});

test('output keeps a 16:9 frame', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.goto('./');
  await waitForBoot(page);
  const box = await page.locator('canvas#game').boundingBox();
  expect(Math.abs(box.width / box.height - 16 / 9)).toBeLessThan(0.01);
});
