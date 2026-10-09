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
import { createMixer } from './audio/mixer.js';
import { updateListener } from './audio/sounds.js';
import { runBot } from './debug/bot.js';
import { LEVELS, START_LEVEL } from './levels/index.js';
import { createEvents } from './events.js';
import { createInteraction } from './player/interact.js';
import { setupLevelFlow } from './levelFlow.js';
import { drawHud } from './ui/hud.js';

// Boot and main loop. Two modes: 'ui' (a screen is open, the world is
// frozen behind it) and 'playing' (input drives the player).

function createGame() {
  const canvas = document.getElementById('game');
  const uiCanvas = document.createElement('canvas');
  uiCanvas.width = UI_WIDTH;
  uiCanvas.height = UI_HEIGHT;

  const pipeline = createPipeline(canvas, uiCanvas);
  const world = createWorld(LEVELS[START_LEVEL]);
  const game = {
    canvas, pipeline, world, i18n, store, saves, settings,
    input: createInput(canvas, settings),
    player: createController(world.level),
    triggers: createTriggers(world.level),
    mixer: createMixer(settings),
    events: createEvents(),
    interaction: createInteraction(),
    session: { active: false, playTime: 0 },
    mode: 'ui', frame: 0, time: 0, booted: false,
  };
  game.ui = createUi(game, canvas, uiCanvas);
  game.ui.setHud((ctx) => game.mode === 'playing' && drawHud(ctx, game));
  setupLevelFlow(game);
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

  const startAudio = () => game.mixer.start();
  window.addEventListener('pointerdown', startAudio, { once: true });
  window.addEventListener('keydown', startAudio, { once: true });

  canvas.addEventListener('click', () => {
    if (game.mode === 'playing' && !document.pointerLockElement) {
      input.consume('Mouse0'); // the click that captures the mouse is not a "use"
      input.lockPointer();
    }
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

// Game logic for one step (no rendering).
function simulate(game, dt) {
  const { player, input, world, settings, triggers } = game;
  if (game.mode !== 'playing') return;
  game.session.playTime += dt;
  game.updateTravel(dt);
  if (game.isTravelling()) {
    world.update(dt);
    return;
  }
  player.update(dt, input, settings);
  if (input.wasPressed('flashlight')) world.flashlight.toggle();
  triggers.update({ ...player.state.position, y: 0.5 });
  player.applyToCamera(world.camera, settings);
  world.camera.updateMatrixWorld();
  game.interaction.update(world.camera, input);
  world.update(dt);
}

function tick(game, dt) {
  const { player, input, world, settings } = game;
  game.frame += 1;
  game.time += dt;
  simulate(game, dt);
  player.applyToCamera(world.camera, settings);
  world.camera.updateMatrixWorld();
  updateListener(game.mixer, world.camera);
  const uiDirty = game.ui.update();
  game.pipeline.render(world.scene, world.camera, { look: game.ui.look(), time: game.time, uiDirty });
  game.debug.update(dt);
  input.endFrame();
}

// Runs the simulation for a fixed span of game time at 60 steps per second,
// independent of frame rate. Used by tests and bot playthroughs.
function advance(game, seconds) {
  const step = 1 / 60;
  for (let t = 0; t < seconds - 1e-9; t += step) {
    simulate(game, step);
    game.input.endFrame(); // a key press counts for one step, like one frame
  }
  game.player.applyToCamera(game.world.camera, game.settings);
}

function boot() {
  const game = createGame();
  applySettings(game);
  setupModes(game);
  const warningSeen = store.read('flags')?.warningSeen === true;
  game.ui.open(warningSeen ? 'menu' : 'warning');
  game.advance = (seconds) => advance(game, seconds);
  game.runBot = (route, options) => runBot(game, route, options);
  window.__stAgnes = game;

  const timer = new THREE.Timer();
  game.pipeline.renderer.setAnimationLoop((timestamp) => {
    timer.update(timestamp);
    tick(game, Math.min(timer.getDelta(), 0.1));
  });
  game.booted = true;
}

boot();
