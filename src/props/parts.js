// Building blocks for props: textured boxes and planes with the PS1 material,
// plus small canvas textures for name plates and children's drawings.
import * as THREE from 'three';
import { createPs1Material } from '../render/ps1Material.js';

const materialCache = new Map();

export function materialFor(texture, options = {}) {
  const key = `${texture.uuid}:${JSON.stringify(options)}`;
  if (!materialCache.has(key)) materialCache.set(key, createPs1Material(texture, options));
  return materialCache.get(key);
}

// A box whose bottom sits at y; dims in metres.
export function box(texture, [w, h, d], [x, y, z] = [0, 0, 0], options) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), materialFor(texture, options));
  mesh.position.set(x, y + h / 2, z);
  return mesh;
}

export function plane(texture, [w, h], [x, y, z] = [0, 0, 0], options) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), materialFor(texture, options));
  mesh.position.set(x, y, z);
  return mesh;
}

function canvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

// Brass name plate with stamped capitals (names are data, not UI text).
export function namePlateTexture(name) {
  return canvasTexture(64, 16, (g, w, h) => {
    g.fillStyle = '#8a7444';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#3a2c14';
    g.font = 'bold 10px monospace';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(name.toUpperCase(), w / 2, h / 2 + 1);
  });
}

// Crayon lines on paper. Each drawing is a list of strokes in a 0..1 space.
const DRAWINGS = {
  house: [['#a33', [[0.2, 0.8], [0.2, 0.45], [0.5, 0.2], [0.8, 0.45], [0.8, 0.8], [0.2, 0.8]]], ['#335', [[0.42, 0.8], [0.42, 0.6], [0.56, 0.6], [0.56, 0.8]]]],
  horse: [['#642', [[0.2, 0.5], [0.7, 0.5], [0.8, 0.3], [0.88, 0.35], [0.75, 0.55], [0.7, 0.75]]], ['#642', [[0.25, 0.5], [0.25, 0.75]]], ['#642', [[0.6, 0.55], [0.6, 0.78]]]],
  children: [['#222', [[0.2, 0.3], [0.2, 0.7], [0.12, 0.85]]], ['#222', [[0.2, 0.7], [0.28, 0.85]]], ['#222', [[0.2, 0.45], [0.5, 0.45], [0.8, 0.45]]], ['#222', [[0.5, 0.3], [0.5, 0.7]]], ['#222', [[0.8, 0.3], [0.8, 0.7]]], ['#c33', [[0.45, 0.2], [0.55, 0.2]]]],
  sun: [['#c90', [[0.5, 0.3], [0.6, 0.4], [0.5, 0.5], [0.4, 0.4], [0.5, 0.3]]], ['#353', [[0.05, 0.85], [0.95, 0.85]]]],
};

export function drawingTexture(kind) {
  return canvasTexture(32, 32, (g, w, h) => {
    g.fillStyle = '#d8d0b8';
    g.fillRect(0, 0, w, h);
    g.lineWidth = 2;
    for (const [color, points] of DRAWINGS[kind] ?? DRAWINGS.house) {
      g.strokeStyle = color;
      g.beginPath();
      points.forEach(([px, py], i) => (i ? g.lineTo(px * w, py * h) : g.moveTo(px * w, py * h)));
      g.stroke();
    }
  });
}
