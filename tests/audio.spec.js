import { test, expect } from '@playwright/test';
import { sliderToGain, dbToGain } from '../src/audio/mixer.js';
import { waitForBoot } from './helpers.js';

test('volume sliders map to decibels', () => {
  expect(sliderToGain(0)).toBe(0);
  expect(sliderToGain(1)).toBe(1);
  expect(sliderToGain(0.5)).toBeCloseTo(dbToGain(-20), 6);
});

test('mixer starts on first input and follows the volume settings', async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  expect(await page.evaluate(() => window.__stAgnes.mixer.context())).toBeNull();
  await page.keyboard.press('ArrowDown');
  await page.waitForFunction(() => window.__stAgnes.mixer.context() !== null);
  await page.evaluate(() => {
    const { settings } = window.__stAgnes;
    settings.set('volume', { ...settings.get('volume'), music: 0 });
  });
  await page.waitForFunction(() => window.__stAgnes.mixer.busGain('music') < 0.001);
  expect(await page.evaluate(() => window.__stAgnes.mixer.busGain('voices'))).toBeGreaterThan(0.1);
});
