import { test, expect } from '@playwright/test';
import { waitForBoot } from './helpers.js';

// Wing 1 extension: lights out after the plates, the fuse puzzle in the sick
// bay (rota + hymn board), the cabinet on the lighting circuit, batteries.
const use = (page) => page.evaluate(() => {
  window.__stAgnes.input.tap('use');
  window.__stAgnes.advance(0.3);
});
const message = (page) => page.evaluate(() => window.__stAgnes.messages.current()?.key ?? null);
// Stand a metre in front of the fuse box and aim at lever n (1..4).
const lookAtLever = (page, n) => page.evaluate((n) => {
  const game = window.__stAgnes;
  let box = null;
  game.world.levelGroup.traverse((o) => {
    if (o.userData.prop?.id === 'fuse_box') box = o;
  });
  box.updateWorldMatrix(true, false);
  const x = [-0.15, -0.05, 0.05, 0.15][n - 1];
  const target = box.localToWorld(box.position.clone().set(x, 1.24, 0.08));
  const stand = box.localToWorld(box.position.clone().set(x, 0, 1.0));
  Object.assign(game.player.state.position, { x: stand.x, z: stand.z });
  game.player.state.yaw = Math.atan2(-(target.x - stand.x), -(target.z - stand.z));
  game.player.state.pitch = Math.atan2(target.y - game.player.state.eyeHeight, 1.0);
  game.advance(1 / 30);
  return game.interaction.target()?.prompt() ?? null;
}, n);
const mainsOn = (page) => page.evaluate(() => !window.__stAgnes.powerIsCut());

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await waitForBoot(page);
  await page.evaluate(() => {
    const game = window.__stAgnes;
    game.play();
    game.loadLevel('orphanage_wing', 'landing');
    game.world.level.ghosts.forEach((event) => game.progress.setFlag(`ghost_${event.id}`));
  });
});

test('the lights die when the plates are solved, and the fuses bring them back', async ({ page }) => {
  expect(await mainsOn(page)).toBe(true);
  await page.evaluate(() => {
    const game = window.__stAgnes;
    game.progress.setFlag('puzzle_plates');
    game.events.emit('puzzle.solved', 'plates');
    game.advance(0.1);
  });
  expect(await mainsOn(page)).toBe(false);

  // Without the rota and the hymn board, the levers are not touched.
  expect((await lookAtLever(page, 3))?.key).toBe('prompt.pullLever');
  await use(page);
  expect(await message(page)).toBe('msg.fusesNeedClue');

  await page.evaluate(() => {
    window.__stAgnes.progress.read('night_rota');
    window.__stAgnes.progress.setFlag('seen_hymn_board');
  });
  // A wrong lever snaps them all back.
  await lookAtLever(page, 3);
  await use(page);
  await lookAtLever(page, 2);
  await use(page);
  expect(await message(page)).toBe('msg.fusesWrong');
  for (const n of [3, 1, 4, 2]) {
    expect((await lookAtLever(page, n))?.params.number).toBe(n);
    await use(page);
  }
  expect(await mainsOn(page)).toBe(true);
  expect(await page.evaluate(() => window.__stAgnes.progress.hasFlag('puzzle_fuses'))).toBe(true);

  // The power state survives a reload.
  await page.evaluate(() => window.__stAgnes.loadLevel('orphanage_wing', 'landing'));
  expect(await mainsOn(page)).toBe(true);
});

test('the medicine cabinet stays shut until the fuses are fixed', async ({ page }) => {
  const takeKey = () => page.evaluate(() => {
    const game = window.__stAgnes;
    const size = game.world.level.cellSize;
    const target = { x: 22.2 * size, y: 0.97, z: 16.3 * size };
    Object.assign(game.player.state.position, { x: target.x + 1.0, z: target.z });
    game.player.state.yaw = Math.PI / 2; // facing -x
    game.player.state.pitch = Math.atan2(target.y - game.player.state.eyeHeight, 1.0);
    game.advance(1 / 30);
    const prompt = game.interaction.target()?.prompt()?.key ?? null;
    game.input.tap('use');
    game.advance(0.3);
    return { prompt, items: game.inventory.items() };
  });
  expect(await takeKey()).toEqual({ prompt: 'prompt.lockedAway', items: [] });
  await page.evaluate(() => window.__stAgnes.progress.setFlag('puzzle_fuses'));
  expect(await takeKey()).toEqual({ prompt: 'prompt.take', items: ['linen_key'] });
});

test('the flashlight battery runs down, the light dies, and a new battery brings it back', async ({ page }) => {
  const state = () => page.evaluate(() => ({
    on: window.__stAgnes.world.flashlight.isOn(),
    charge: window.__stAgnes.battery.charge(),
    shown: window.__stAgnes.battery.visible(),
  }));
  await page.evaluate(() => {
    const game = window.__stAgnes;
    game.progress.setFlag('tool_flashlight');
    game.world.flashlight.setOn(true);
    game.battery.set(0.01);
    game.advance(10);
  });
  let s = await state();
  expect(s.on).toBe(false);
  expect(s.charge).toBe(0);
  expect(s.shown).toBe(false); // the cell goes away with the light
  await page.evaluate(() => {
    window.__stAgnes.input.tap('flashlight');
    window.__stAgnes.advance(0.1);
  });
  expect((await state()).on).toBe(false); // F does nothing on a dead battery
  await page.evaluate(() => {
    const game = window.__stAgnes;
    game.inventory.add('battery');
    game.itemEffects.battery();
    game.input.tap('flashlight');
    game.advance(0.1);
  });
  s = await state();
  expect(s.on).toBe(true);
  expect(s.charge).toBeGreaterThan(0.99);
  expect(await page.evaluate(() => window.__stAgnes.inventory.items())).toEqual([]);
});

test('the camcorder is not listed in Controls until it is found', async ({ page }) => {
  await page.evaluate(() => window.__stAgnes.openScreen('settings'));
  const labels = await page.evaluate(() => {
    const texts = [];
    const ctx = document.createElement('canvas').getContext('2d');
    const real = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, ...rest) {
      texts.push(String(text));
      return real.call(this, text, ...rest);
    };
    window.__stAgnes.ui.current().key?.('Tab');
    for (let i = 0; i < 20; i++) {
      window.__stAgnes.ui.current().key?.('ArrowDown');
      window.__stAgnes.ui.current().draw?.(ctx);
    }
    CanvasRenderingContext2D.prototype.fillText = real;
    return texts;
  });
  expect(labels).toContain('Journal');
  expect(labels).not.toContain('Camcorder');
});
