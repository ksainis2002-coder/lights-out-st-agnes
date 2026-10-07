import * as THREE from 'three';
import { i18n } from './i18n/index.js';
import { store, saves, settings } from './save/index.js';
import { createPipeline } from './render/pipeline.js';
import { createWorld } from './world.js';
import { createInput } from './player/input.js';
import { createController } from './player/controller.js';
import { createTriggers } from './levels/triggers.js';
import { createDebugOverlay } from './debug/overlay.js';
import { createUi, UI_WIDTH, UI_HEIGHT } from './ui/manager.js';
import testCorridor from './levels/test_corridor.json';

// Boot and main loop. Two modes: 'ui' (a screen is open, the world is
// frozen behind it) and 'playing' (input drives the player).

function createGame() {
  const canvas = document.getElementById('game');
  const uiCanvas = document.createElement('canvas');
  uiCanvas.width = UI_WIDTH;
  uiCanvas.height = UI_HEIGHT;

  const pipeline = createPipeline(canvas, uiCanvas);
  const world = createWorld(testCorridor);
  const game = {
    canvas, pipeline, world, i18n, store, saves, settings,
    input: createInput(canvas, settings),
    player: createController(world.level),
    triggers: createTriggers(world.level),
    session: { active: false, playTime: 0 },
    mode: 'ui', frame: 0, time: 0, booted: false,
  };
  game.ui = createUi(game, canvas, uiCanvas);
  game.debug = createDebugOverlay(game);
  return game;
}

function setupModes(game) {
  const { input, ui, canvas } = game;

  game.play = () => {
    game.mode = 'playing';
    game.session.active = true;
    ui.close();
    input.setEnabled(true);
    input.lockPointer();
  };

  game.pause = () => {
    if (game.mode !== 'playing') return;
    game.mode = 'ui';
    input.setEnabled(false);
    ui.open('menu');
    if (document.pointerLockElement) document.exitPointerLock();
  };

  canvas.addEventListener('click', () => {
    if (game.mode === 'playing' && !document.pointerLockElement) input.lockPointer();
  });
  document.addEventListener('pointerlockchange', () => {
    if (!document.pointerLockElement) game.pause();
  });
  window.addEventListener('keydown', (event) => {
    if (event.code === 'Escape' && game.mode === 'playing' && !event.defaultPrevented) game.pause();
  });
}

function applySettings(game) {
  const { settings, i18n, pipeline } = game;
  const sync = () => {
    i18n.setLanguage(settings.get('language'));
    pipeline.effects.reduceEffects = settings.get('reduceEffects');
    pipeline.effects.flickerOff = settings.get('flickerOff');
  };
  sync();
  settings.onChange(sync);
}

function tick(game, dt) {
  const { player, input, world, settings, triggers } = game;
  game.frame += 1;
  game.time += dt;
  if (game.mode === 'playing') {
    game.session.playTime += dt;
    player.update(dt, input, settings);
    if (input.wasPressed('flashlight')) world.flashlight.toggle();
    triggers.update({ ...player.state.position, y: 0.5 });
  }
  player.applyToCamera(world.camera, settings);
  const uiDirty = game.ui.update();
  game.pipeline.render(world.scene, world.camera, { look: game.ui.look(), time: game.time, uiDirty });
  game.debug.update(dt);
  input.endFrame();
}

function boot() {
  const game = createGame();
  applySettings(game);
  setupModes(game);
  const warningSeen = store.read('flags')?.warningSeen === true;
  game.ui.open(warningSeen ? 'menu' : 'warning');
  window.__stAgnes = game;

  const timer = new THREE.Timer();
  game.pipeline.renderer.setAnimationLoop((timestamp) => {
    timer.update(timestamp);
    tick(game, Math.min(timer.getDelta(), 0.1));
  });
  game.booted = true;
}

boot();
