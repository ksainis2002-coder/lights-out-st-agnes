import * as THREE from 'three';
import { i18n } from './i18n/index.js';
import { saves, settings } from './save/index.js';
import { createPipeline } from './render/pipeline.js';
import { createWorld } from './world.js';
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

  const { camera, level } = world;
  camera.position.set(level.spawn.x, 1.6, level.spawn.z);
  camera.rotation.set(0, level.spawn.yaw, 0, 'YXZ');

  const game = { pipeline, world, i18n, saves, settings, frame: 0, time: 0, booted: true };
  window.__stAgnes = game;

  pipeline.renderer.setAnimationLoop((timestamp) => {
    timer.update(timestamp);
    const dt = Math.min(timer.getDelta(), 0.1);
    game.frame += 1;
    game.time += dt;
    pipeline.render(world.scene, camera, { look: 'game', time: game.time });
  });
}

boot();
