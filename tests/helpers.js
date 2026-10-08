// Shared test helpers.

/** Collects console errors and uncaught page errors for a no-console-errors check. */
export function trackErrors(page) {
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

/** Waits until main.js has booted and drawn at least a few frames. */
export async function waitForBoot(page) {
  await page.waitForFunction(() => window.__stAgnes?.booted && window.__stAgnes.frame > 3);
}
