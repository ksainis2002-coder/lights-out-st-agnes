import * as THREE from 'three';
import { i18n } from './i18n/index.js';

// Boot and main loop. Screens and effects are added once their mockup
// stills are approved; for now the loop only clears to black.

function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 1);
  return renderer;
}

function resize(renderer, camera) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function boot() {
  const canvas = document.getElementById('game');
  const renderer = createRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, 1, 0.05, 100);
  const clock = new THREE.Clock();

  resize(renderer, camera);
  window.addEventListener('resize', () => resize(renderer, camera));

  const game = { renderer, scene, camera, i18n, frame: 0, booted: true };
  window.__stAgnes = game;

  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.1);
    update(game, dt);
    renderer.render(scene, camera);
  });
}

function update(game, dt) {
  game.frame += 1;
  game.lastDt = dt;
}

boot();
