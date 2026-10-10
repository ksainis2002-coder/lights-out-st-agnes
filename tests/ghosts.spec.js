import { test, expect } from '@playwright/test';
import { waitForBoot } from './helpers.js';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => {
    const g = window.__stAgnes;
    g.newGame();
    g.loadLevel('orphanage_wing', 'landing');
  });
});

// Walk the player to a cell facing yaw (degrees), stepping game time.
const goTo = (page, cell, yaw, seconds = 0.2) => page.evaluate(({ cell, yaw, seconds }) => {
  const g = window.__stAgnes;
  const c = g.world.level.cellCenter(...cell);
  Object.assign(g.player.state.position, { x: c.x, z: c.z });
  g.player.state.yaw = (yaw * Math.PI) / 180;
  g.player.state.pitch = 0;
  g.advance(seconds);
}, { cell, yaw, seconds });

test('Tommy waits at the end of the corridor, then runs off with a whispered hint', async ({ page }) => {
  await goTo(page, [5, 10.5], -90, 0.1); // step into the corridor, looking east
  expect(await page.evaluate(() => window.__stAgnes.ghosts.active()?.event.id)).toBe('tommy_corridor');
  const result = await page.evaluate(() => {
    const g = window.__stAgnes;
    const before = g.sanity.value();
    g.advance(1.5); // keep looking at him
    return {
      active: g.ghosts.active(),
      done: g.progress.hasFlag('ghost_tommy_corridor'),
      subtitle: g.subtitles.current(),
      drained: before - g.sanity.value(),
    };
  });
  expect(result.active).toBeNull();
  expect(result.done).toBe(true);
  expect(result.subtitle.key).toBe('whisper.tommy.follow');
  expect(result.subtitle.speaker).toBe('tommy');
  expect(result.drained).toBeGreaterThan(0); // seeing a ghost costs a little
  // Name not learned yet: subtitled as "a child".
  expect(await page.evaluate(() => window.__stAgnes.i18n.t(window.__stAgnes.progress.hasFlag('name_tommy') ? 'speaker.tommy' : 'speaker.child'))).toBe('a child');
});

test('the washroom scare has a tell first, then a giggle behind you and a sanity hit', async ({ page }) => {
  await page.evaluate(() => window.__stAgnes.progress.setFlag('ghost_tommy_corridor'));
  await goTo(page, [7, 13], 180, 0.1);
  const r = await page.evaluate(() => {
    const g = window.__stAgnes;
    const phaseAtStart = g.ghosts.active()?.phase;
    const before = g.sanity.value();
    const playedBefore = g.sanity.value();
    g.advance(1.0);
    const stillSetup = g.ghosts.active()?.phase;
    g.advance(1.6);
    return { phaseAtStart, stillSetup, lost: before - g.sanity.value(), done: g.progress.hasFlag('ghost_scare_washroom'), playedBefore };
  });
  expect(r.phaseAtStart).toBe('setup');
  expect(r.stillSetup).toBe('setup'); // the tell comes before the hit
  expect(r.lost).toBeGreaterThanOrEqual(6);
  expect(r.done).toBe(true);
});

test('comfort mode skips the scares but keeps Tommy', async ({ page }) => {
  await page.evaluate(() => {
    const g = window.__stAgnes;
    g.settings.set('comfortMode', true);
    g.progress.setFlag('ghost_tommy_corridor');
  });
  await goTo(page, [7, 13], 180, 3);
  expect(await page.evaluate(() => window.__stAgnes.progress.hasFlag('ghost_scare_washroom'))).toBe(false);
  await page.evaluate(() => window.__stAgnes.progress.load({}));
  await goTo(page, [5, 10.5], -90, 0.1);
  expect(await page.evaluate(() => window.__stAgnes.ghosts.active()?.event.id)).toBe('tommy_corridor');
});

test('ghost children never block the way', async ({ page }) => {
  await goTo(page, [5, 10.5], -90, 0.1);
  const solid = await page.evaluate(() => {
    const g = window.__stAgnes;
    const ghost = g.ghosts.active().ghost.position;
    const cell = g.world.level.worldToCell(ghost.x, ghost.z);
    return g.world.level.isSolid(cell.col, cell.row);
  });
  expect(solid).toBe(false);
});
