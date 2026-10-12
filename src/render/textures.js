// Generated 32×32 textures (no image files), one per recipe in recipes.js.
import * as THREE from 'three';
import * as recipes from './recipes.js';

const SIZE = 32;

function seededRandom(seed) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function makeTexture(pixel, seed = 3) {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(SIZE, SIZE);
  const random = seededRandom(seed);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const [r, g, b] = pixel(x, y, random);
      image.data.set([r, g, b, 255], (y * SIZE + x) * 4);
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

const RECIPES = recipes;

export function createTextures() {
  const textures = {};
  for (const [name, recipe] of Object.entries(RECIPES)) textures[name] = makeTexture(recipe);
  return textures;
}
