import * as THREE from 'three';
import { i18n } from './i18n/index.js';
import { saves, settings } from './save/index.js';
import { createPipeline } from './render/pipeline.js';
import { createWorld } from './world.js';
import { createInput } from './player/input.js';
import { createController } from './player/controller.js';
import testCorridor from './levels/test_corridor.json';

// Boot and main loop.

function boot() {
  i18n.setLanguage(settings.get('language'));
  settings.onChange((name, all) => {
    if (name === 'language' || name === null) i18n.setLanguage(all.language);
  });

  const canvas = document.getElementById('game');
  const uiCanvas = document.createElement('canvas');
  uiCanvas.width = 480;
  uiCanvas.height = 270;
  const pipeline = createPipeline(canvas, uiCanvas);
  const world = createWorld(testCorridor);
  const timer = new THREE.Timer();

  const input = createInput(canvas, settings);
  const player = createController(world.level);
  input.setEnabled(true);
  canvas.addEventListener('click', () => input.lockPointer());

  const game = { pipeline, world, input, player, i18n, saves, settings, frame: 0, time: 0, booted: true };
  window.__stAgnes = game;

  pipeline.renderer.setAnimationLoop((timestamp) => {
    timer.update(timestamp);
    const dt = Math.min(timer.getDelta(), 0.1);
    game.frame += 1;
    game.time += dt;
    player.update(dt, input, settings);
    if (input.wasPressed('flashlight')) world.flashlight.toggle();
    player.applyToCamera(world.camera, settings);
    pipeline.render(world.scene, world.camera, { look: 'game', time: game.time });
    input.endFrame();
  });
}

boot();
