import { test, expect } from '@playwright/test';
import { trackErrors, waitForBoot } from './helpers.js';

test('boots and runs the main loop without console errors', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('./');
  await waitForBoot(page);
  await expect(page.locator('canvas#game')).toBeVisible();
  expect(errors).toEqual([]);
});

test('built page uses only relative asset paths', async ({ request }) => {
  const html = await (await request.get('./')).text();
  expect(html).not.toMatch(/(src|href)="\/(?!\/)/);
});
