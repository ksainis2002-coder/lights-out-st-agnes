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
import { createGameAudio } from './audio/gameAudio.js';
import { createInventory } from './items/inventory.js';
import { createProgress } from './progress.js';
import { createJournal } from './journal.js';
import { createMessages } from './ui/messages.js';
import { setupVisits } from './levels/visits.js';
import { mapMarks } from './ui/mapMarks.js';
import { setupTutorial } from './tutorial.js';
import { setupPower } from './levels/power.js';
import { createBattery } from './player/battery.js';
import { setupClues } from './clues.js';
import { setupInventoryControls } from './items/controls.js';
import { setupSaving } from './save/saving.js';
import { resetState } from './save/gameState.js';
import { createSanity } from './sanity/meter.js';
import { applySanityEffects } from './sanity/effects.js';
import { createHallucinations } from './sanity/hallucinations.js';
import { createCollapse } from './sanity/collapse.js';
import { createSubtitles } from './ui/subtitles.js';
import { createGhostDirector } from './ghosts/director.js';
import { createIntro } from './cutscenes/intro.js';

// Boot and main loop. Two modes: 'ui' (a screen is open, the world is
// frozen behind it) and 'playing' (input drives the player).

function createGame() {
  const canvas = document.getElementById('game');
  const uiCanvas = document.createElement('canvas');
  uiCanvas.width = UI_WIDTH;
  uiCanvas.height = UI_HEIGHT;

  const pipeline = createPipeline(canvas, uiCanvas);
  const world = createWorld(LEVELS[START_LEVEL]);
  const events = createEvents();
  const game = {
    events,
    inventory: createInventory(events),
    journal: createJournal(events),
    canvas, pipeline, world, i18n, store, saves, settings,
    input: createInput(canvas, settings),
    player: createController(world.level),
    triggers: createTriggers(world.level),
    mixer: createMixer(settings),
    interaction: createInteraction(),
    progress: createProgress(),
    messages: createMessages(),
    session: { active: false, playTime: 0 },
    mode: 'ui', frame: 0, time: 0, booted: false,
  };
  game.ui = createUi(game, canvas, uiCanvas);
  game.ui.setHud((ctx) => game.mode === 'playing' && drawHud(ctx, game));
  setupLevelFlow(game);
  setupClues(game);
  setupVisits(game);
  game.showSanityCards = true; // tests turn this off
  game.tutorial = setupTutorial(game);
  setupPower(game);
  setupInventoryControls(game);
  setupSaving(game);
  game.sanity = createSanity(game);
  game.subtitles = createSubtitles(game);
  game.hallucinations = createHallucinations(game);
  // Things that make a collapse a jump scare when near (enemies add theirs).
  game.presences = [() => game.hallucinations.active()?.position ?? null];
  game.collapse = createCollapse(game);
  game.intro = createIntro(game);
  game.ghosts = createGhostDirector(game);
  game.events.on('sanity.empty', (cause) => game.collapse.start(cause));
  game.events.on('collapse.scare', () => game.hallucinations.remove());
  game.events.on('level.loaded', () => {
    game.hallucinations.remove();
    game.ghosts.reset();
  });
  game.battery = createBattery(game);
  game.itemEffects = {
    battery: () => {
      if (game.battery.replace()) game.inventory.remove('battery');
      return true;
    },
    pills: () => {
      game.sanity.restore(30);
      game.inventory.remove('pills');
      game.messages.show('msg.pills');
      return true;
    },
  };
  game.sfx = createGameAudio(game);
  game.debug = createDebugOverlay(game);
  game.mapMarks = (mapId) => mapMarks(game, mapId); // what the paper map marks now (tests)
  return game;
}

function setupModes(game) {
  const { input, ui, canvas } = game;

  // Recapturing the mouse right after a menu closes can make the browser drop
  // the capture once; that must not count as the player pausing.
  let resumedAt = -Infinity;
  // The browser reports our own captures and releases later, sometimes after
  // a slow frame when the player is already back in the game. A release that
  // arrives while one of our captures is still pending is ours, not a pause.
  let capturesPending = 0;
  const captureMouse = () => {
    const request = input.lockPointer();
    if (!request) return;
    capturesPending += 1;
    request.finally(() => (capturesPending -= 1));
  };

  game.play = () => {
    resumedAt = performance.now();
    game.mode = 'playing';
    game.session.active = true;
    game.events.emit('game.play');
    ui.close();
    input.setEnabled(true);
    captureMouse();
  };

  // STOP on the pause menu: end the run and go back to the title screen.
  // Nothing is saved here; tapes and the checkpoint autosave stay as they are.
  game.stop = () => {
    game.intro.cancel();
    game.messages.clear();
    resetState(game);
    Object.assign(game.pipeline.fx, { eyelid: 0, blur: 0, aberration: 0, vignette: 0, fade: 0 });
    game.session.active = false;
    game.mode = 'ui';
    input.setEnabled(false);
    ui.open('menu');
    if (document.pointerLockElement) document.exitPointerLock();
    game.events.emit('game.stopped');
  };

  game.newGame = () => {
    resetState(game);
    game.play();
    game.intro.start();
  };

  // Modal screens during play (journal, documents): the world waits.
  // While playing without the mouse captured (after a menu), the game waits
  // for a click. Tests turn this off: headless browsers cannot capture.
  game.requireMouseCapture = true;
  game.needsClick = () =>
    game.requireMouseCapture && game.mode === 'playing' && 'pointerLockElement' in document && !document.pointerLockElement;

  game.openScreen = (name, options) => {
    game.mode = 'ui';
    input.setEnabled(false);
    ui.open(name, options);
    if (document.pointerLockElement) document.exitPointerLock();
  };

  game.resume = () => {
    resumedAt = performance.now();
    game.mode = 'playing';
    ui.close();
    input.setEnabled(true);
    captureMouse();
  };

  game.pause = () => {
    if (game.mode !== 'playing') return;
    game.mode = 'ui';
    input.setEnabled(false);
    ui.open('menu');
    if (document.pointerLockElement) document.exitPointerLock();
  };

  const startAudio = () => game.sfx.start();
  window.addEventListener('pointerdown', startAudio, { once: true });
  window.addEventListener('keydown', startAudio, { once: true });

  canvas.addEventListener('click', () => {
    if (game.mode === 'playing' && !document.pointerLockElement) {
      input.consume('Mouse0'); // the click that captures the mouse is not a "use"
      captureMouse();
    }
  });
  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement || capturesPending > 0) return;
    if (performance.now() - resumedAt > 1000) game.pause();
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
  game.subtitles.update(dt);
  if (game.collapse.active()) {
    game.collapse.update(dt);
    world.update(dt);
    return;
  }
  if (game.isTravelling()) {
    world.update(dt);
    return;
  }
  if (game.intro.active()) {
    game.intro.update(dt, input);
    world.update(dt);
    game.sfx.update(dt);
    return;
  }
  game.updateItems();
  if (game.mode !== 'playing') return;
  player.update(dt, input, settings);
  const canSwitch = game.progress.hasFlag('tool_flashlight') && (world.flashlight.isOn() || game.battery.canLight());
  if (input.wasPressed('flashlight') && canSwitch) {
    world.flashlight.toggle();
    game.events.emit('flashlight.toggled', world.flashlight.isOn());
  }
  triggers.update({ ...player.state.position, y: 0.5 });
  game.updateVisits();
  player.applyToCamera(world.camera, settings);
  world.camera.updateMatrixWorld();
  game.interaction.update(world.camera, input);
  game.tutorial.update();
  game.battery.update(dt);
  game.sanity.update(dt);
  game.ghosts.update(dt);
  game.hallucinations.update(dt, game.sanity.value(), world.camera);
  world.update(dt);
  game.sfx.update(dt);
  game.messages.update(dt);
}

function tick(game, dt) {
  const { player, input, world, settings } = game;
  game.frame += 1;
  game.time += dt;
  if (!game.needsClick()) simulate(game, dt);
  player.applyToCamera(world.camera, settings);
  if (game.collapse.active()) game.collapse.applyCamera(world.camera);
  else if (game.intro.active()) game.intro.applyCamera(world.camera);
  else if (game.session.active) applySanityEffects(game, game.sanity.value(), game.time);
  world.camera.updateMatrixWorld();
  updateListener(game.mixer, world.camera);
  if (game.mode !== 'playing') game.sfx.update(dt); // ambience keeps fading in menus
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
