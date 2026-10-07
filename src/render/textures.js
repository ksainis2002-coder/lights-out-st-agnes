// Generated 32×32 textures (no image files). Same recipes as the approved
// mockup stills: plaster with wood wainscot, door, checker floor, ceiling tiles.
import * as THREE from 'three';

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

function plaster(x, y, random) {
  const n = random() * 18;
  if (y > 20) return y === 21 ? [40, 30, 22] : [78 + n, 58 + n, 40 + n * 0.5];
  const stain = (x * 7 + y * 3) % 23 < 2 ? -25 : 0;
  return [150 + n + stain, 146 + n + stain, 120 + n + stain];
}

function door(x, y, random) {
  const n = random() * 14;
  if (x < 2 || x > 29 || y < 2) return [35, 28, 22];
  if (y > 9 && y < 14 && x > 10 && x < 21) return [20, 22, 18];
  if (x === 25 && y === 17) return [180, 170, 120];
  return [92 + n, 80 + n, 64 + n];
}

function floor(x, y, random) {
  const n = random() * 12;
  const check = ((x >> 4) + (y >> 4)) & 1;
  return check ? [120 + n, 116 + n, 100 + n] : [58 + n, 70 + n, 62 + n];
}

function ceiling(x, y, random) {
  const n = random() * 10;
  return x % 16 === 0 || y % 16 === 0 ? [60, 60, 56] : [104 + n, 104 + n, 96 + n];
}

const RECIPES = { plaster, door, floor, ceiling };

export function createTextures() {
  const textures = {};
  for (const [name, recipe] of Object.entries(RECIPES)) textures[name] = makeTexture(recipe);
  return textures;
}
