// PS1 render pipeline: the 3D scene renders into a 320×180 target with no
// filtering, then one post pass scales it up (hard pixels), lays the UI
// canvas on top and adds the VHS look. Output keeps a 16:9 frame.
import * as THREE from 'three';
import { createPostMaterial } from './postShader.js';

export const SCENE_WIDTH = 320;
export const SCENE_HEIGHT = 180;
export const UI_WIDTH = 480;
export const UI_HEIGHT = 270;

// Grain and band strength per look, as in the approved stills.
const LOOKS = {
  game: { grain: 14, band: 0, dither: 1, brightness: 1, saturation: 1 },
  menu: { grain: 26, band: 1, dither: 0.6, brightness: 0.45 * 0.65, saturation: 0.6 },
  screen: { grain: 12, band: 0, dither: 1, brightness: 1, saturation: 1 },
};

function lowResTarget() {
  const target = new THREE.WebGLRenderTarget(SCENE_WIDTH, SCENE_HEIGHT, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    generateMipmaps: false,
  });
  target.texture.colorSpace = THREE.NoColorSpace;
  return target;
}

export function createPipeline(canvas, uiCanvas) {
  THREE.ColorManagement.enabled = false;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.autoClear = true;

  const target = lowResTarget();
  const uiTexture = new THREE.CanvasTexture(uiCanvas);
  uiTexture.magFilter = THREE.NearestFilter;
  uiTexture.minFilter = THREE.NearestFilter;
  uiTexture.generateMipmaps = false;

  const post = createPostMaterial(target.texture, uiTexture);
  const postScene = new THREE.Scene();
  postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post));
  const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const effects = { reduceEffects: false, flickerOff: false };
  const stats = { drawCalls: 0, triangles: 0 };
  const frame = { x: 0, y: 0, width: 1, height: 1 };

  function resize() {
    const scale = Math.min(window.innerWidth / 16, window.innerHeight / 9);
    frame.width = Math.max(1, Math.floor(scale * 16));
    frame.height = Math.max(1, Math.floor(scale * 9));
    frame.x = Math.floor((window.innerWidth - frame.width) / 2);
    frame.y = Math.floor((window.innerHeight - frame.height) / 2);
    renderer.setSize(frame.width, frame.height, false);
    Object.assign(canvas.style, {
      width: `${frame.width}px`,
      height: `${frame.height}px`,
      left: `${frame.x}px`,
      top: `${frame.y}px`,
    });
  }

  function applyLook(lookName, time) {
    const look = LOOKS[lookName] ?? LOOKS.game;
    const u = post.uniforms;
    u.uTime.value = effects.reduceEffects ? 0 : time;
    u.uGrain.value = effects.reduceEffects ? look.grain * 0.4 : look.grain;
    u.uBand.value = effects.reduceEffects || effects.flickerOff ? 0 : look.band;
    u.uBandPos.value = 0.955;
    u.uDither.value = look.dither;
    u.uBrightness.value = look.brightness;
    u.uSaturation.value = look.saturation;
  }

  // Screen effects for the current frame (sanity, waking, rewind).
  const fx = { blur: 0, aberration: 0, eyelid: 0, vignette: 0, rewind: 0 };

  function applyEffects() {
    const u = post.uniforms;
    const calm = effects.reduceEffects;
    u.uBlur.value = fx.blur;
    u.uAberration.value = calm ? fx.aberration * 0.3 : fx.aberration;
    u.uEyelid.value = fx.eyelid;
    u.uVignette.value = fx.vignette;
    u.uRewind.value = calm || effects.flickerOff ? fx.rewind * 0.25 : fx.rewind;
  }

  function render(scene, camera, { look = 'game', time = 0, uiDirty = false } = {}) {
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    stats.drawCalls = renderer.info.render.calls;
    stats.triangles = renderer.info.render.triangles;
    if (uiDirty) uiTexture.needsUpdate = true;
    applyLook(look, time);
    applyEffects();
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCamera);
  }

  // Average brightness (0–255) of the last low-res frame. Used by tests.
  function sceneBrightness() {
    const pixels = new Uint8Array(SCENE_WIDTH * SCENE_HEIGHT * 4);
    renderer.readRenderTargetPixels(target, 0, 0, SCENE_WIDTH, SCENE_HEIGHT, pixels);
    let sum = 0;
    for (let i = 0; i < pixels.length; i += 4) sum += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
    return sum / (SCENE_WIDTH * SCENE_HEIGHT);
  }

  resize();
  window.addEventListener('resize', resize);

  return { renderer, render, resize, effects, fx, stats, frame, sceneBrightness, aspect: SCENE_WIDTH / SCENE_HEIGHT };
}
