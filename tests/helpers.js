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
  // Headless browsers cannot capture the mouse, so do not wait for a click.
  await page.evaluate(() => {
    window.__stAgnes.requireMouseCapture = false;
    window.__stAgnes.showSanityCards = false; // its own test turns it on
  });
}

/** Stands on a spot (cells) and looks at a point (cells for x/z, metres for y); returns the use prompt's key. */
export const lookAt = (page, stand, target) => page.evaluate(({ stand, target }) => {
  const game = window.__stAgnes;
  const size = game.world.level.cellSize;
  const s = { x: stand[0] * size, z: stand[1] * size };
  const t = { x: target[0] * size, y: target[2], z: target[1] * size };
  Object.assign(game.player.state.position, s);
  game.player.state.yaw = Math.atan2(-(t.x - s.x), -(t.z - s.z));
  game.player.state.pitch = Math.atan2(t.y - game.player.state.eyeHeight, Math.hypot(t.x - s.x, t.z - s.z));
  game.advance(1 / 30);
  return game.interaction.target()?.prompt()?.key ?? null;
}, { stand, target });

/** Presses the use key once. */
export const use = (page) => page.evaluate(() => {
  window.__stAgnes.input.tap('use');
  window.__stAgnes.advance(0.3);
});

/** Lets a level change finish; returns the level now loaded. */
export const arrive = (page) => page.evaluate(() => {
  const game = window.__stAgnes;
  for (let i = 0; i < 60 && game.isTravelling(); i++) game.advance(0.05);
  return game.world.level.id;
});

/** The message line showing now (its i18n key). */
export const message = (page) => page.evaluate(() => window.__stAgnes.messages.current()?.key ?? null);

/** Loads a level at a spawn point. */
export const load = (page, level, spawn) => page.evaluate(({ level, spawn }) => window.__stAgnes.loadLevel(level, spawn) && null, { level, spawn });
