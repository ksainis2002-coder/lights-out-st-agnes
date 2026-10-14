import { test, expect } from '@playwright/test';
import { waitForBoot } from './helpers.js';

// Wing 1 extension: lights out after the plates, the fuse puzzle in the sick
// bay (rota + hymn board), the cabinet on the lighting circuit, batteries.
const use = (page) => page.evaluate(() => {
  window.__stAgnes.input.tap('use');
  window.__stAgnes.advance(0.3);
});
const message = (page) => page.evaluate(() => window.__stAgnes.messages.current()?.key ?? null);
// Stand a metre in front of the fuse box and aim at it.
const lookAtFuseBox = (page) => page.evaluate(() => {
  const game = window.__stAgnes;
  let box = null;
  game.world.levelGroup.traverse((o) => {
    if (o.userData.prop?.id === 'fuse_box') box = o;
  });
  box.updateWorldMatrix(true, false);
  const target = box.localToWorld(box.position.clone().set(0, 1.3, 0.1));
  const stand = box.localToWorld(box.position.clone().set(0, 0, 1.0));
  Object.assign(game.player.state.position, { x: stand.x, z: stand.z });
  game.player.state.yaw = Math.atan2(-(target.x - stand.x), -(target.z - stand.z));
  game.player.state.pitch = Math.atan2(target.y - game.player.state.eyeHeight, 0.9);
  game.advance(1 / 30);
  return game.interaction.target()?.prompt() ?? null;
});
// The open close-up: its name, the levers pulled down and the line under the box.
const closeUp = (page) => page.evaluate(() => {
  const screen = window.__stAgnes.ui.current();
  return screen ? { name: screen.name, pulled: screen.pulled?.(), note: screen.note?.() } : null;
});
const pressLevers = async (page, numbers) => {
  for (const n of numbers) await page.keyboard.press(`Digit${n}`);
};
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
  // While the lights are on, the box stays shut.
  expect((await lookAtFuseBox(page))?.key).toBe('prompt.openFuseBox');
  await use(page);
  expect(await message(page)).toBe('msg.fusesPowerOn');
  expect(await closeUp(page)).toBeNull();
  await page.evaluate(() => {
    const game = window.__stAgnes;
    game.progress.setFlag('puzzle_plates');
    game.events.emit('puzzle.solved', 'plates');
    game.advance(0.1);
  });
  expect(await mainsOn(page)).toBe(false);

  // The box opens up close; without the rota and the hymn board, the levers are not touched.
  expect((await lookAtFuseBox(page))?.key).toBe('prompt.openFuseBox');
  await use(page);
  await pressLevers(page, [3]);
  expect(await closeUp(page)).toEqual({ name: 'fuseBox', pulled: [], note: 'msg.fusesNeedClue' });

  await page.evaluate(() => {
    window.__stAgnes.progress.read('night_rota');
    window.__stAgnes.progress.setFlag('seen_hymn_board');
  });
  // A wrong lever snaps them all back.
  await pressLevers(page, [3]);
  expect(await closeUp(page)).toEqual({ name: 'fuseBox', pulled: [3], note: null });
  await pressLevers(page, [2]);
  expect(await closeUp(page)).toEqual({ name: 'fuseBox', pulled: [], note: 'msg.fusesWrong' });
  // The right order puts the lights back on and steps back from the box.
  await pressLevers(page, [3, 1, 4]);
  expect(await mainsOn(page)).toBe(false);
  await pressLevers(page, [2]);
  expect(await closeUp(page)).toBeNull();
  expect(await message(page)).toBe('msg.fusesSolved');
  expect(await mainsOn(page)).toBe(true);
  expect(await lookAtFuseBox(page)).toBeNull();
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

test('an ink blot reads as [unreadable] in the transcript, never as raw markup', async ({ page }) => {
  const texts = await page.evaluate(() => {
    const game = window.__stAgnes;
    game.journal.addDocument('hale_file_1');
    game.openScreen('document', { id: 'hale_file_1' });
    const drawn = [];
    const real = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, ...rest) {
      drawn.push(String(text));
      return real.call(this, text, ...rest);
    };
    game.ui.current().draw(document.createElement('canvas').getContext('2d'));
    CanvasRenderingContext2D.prototype.fillText = real;
    return drawn;
  });
  expect(texts.join(' ')).toContain('[unreadable]');
  expect(texts.join(' ')).not.toContain('[[blot]]');
});

test('inventory: ◀▶ pick a slot while the strip is open', async ({ page }) => {
  const selected = await page.evaluate(() => {
    const game = window.__stAgnes;
    ['office_key', 'battery', 'pills'].forEach((id) => game.inventory.add(id));
    game.inventory.setOpen(true);
    const out = [];
    for (const code of ['ArrowRight', 'ArrowRight', 'ArrowLeft']) {
      window.dispatchEvent(new KeyboardEvent('keydown', { code }));
      game.advance(1 / 30);
      window.dispatchEvent(new KeyboardEvent('keyup', { code }));
      out.push(game.inventory.selectedItem());
    }
    return out;
  });
  expect(selected).toEqual(['battery', 'pills', 'battery']);
});

test('B swaps in a spare battery and a dead light comes back on', async ({ page }) => {
  const result = await page.evaluate(() => {
    const game = window.__stAgnes;
    game.progress.setFlag('tool_flashlight');
    game.battery.set(0);
    game.world.flashlight.setOn(false);
    game.inventory.add('battery');
    game.input.tap('battery');
    game.advance(0.1);
    return { on: game.world.flashlight.isOn(), charge: game.battery.charge(), items: game.inventory.items() };
  });
  expect(result.on).toBe(true);
  expect(result.charge).toBeGreaterThan(0.99);
  expect(result.items).toEqual([]);
});

test('new-item cards: once per usable item, never for keys or puzzle items', async ({ page }) => {
  const take = (item) => page.evaluate((item) => {
    const game = window.__stAgnes;
    if (game.mode === 'ui') game.resume();
    game.inventory.add(item);
    game.events.emit('item.taken', { id: `test_${item}_${Math.random()}`, item });
    return game.ui.current()?.name ?? null;
  }, item);
  expect(await take('battery')).toBe('itemCard');
  expect(await take('battery')).toBeNull(); // only the first time
  expect(await take('pills')).toBe('itemCard');
  expect(await take('office_key')).toBeNull();
  expect(await take('toy_ball')).toBeNull();
});
