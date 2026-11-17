// Dr. Venn's instruments, on his belt (owner 2026-11-17: no tray, he carries
// his tools on a belt): scalpels, forceps and scissors in its loops, a bone
// saw at his hip, two rings of clamps hanging that clink as he walks (the
// sound you hear through a wall, and the silence when he hears you), a
// leather pouch on each hip. Mockup stills only until the owner approves him.
import * as THREE from 'three';
import { materialFor, canvasTexture } from './parts.js';

const HANDLE = { color: '#9aa0a6' };

// Clean steel: pale, with a bright band where it catches the light.
let steel = null;
export function steelTexture() {
  steel ??= canvasTexture(8, 32, (g, w, h) => {
    for (let y = 0; y < h; y++) {
      const shine = 196 + Math.round(59 * Math.exp(-((y - 10) ** 2) / 18));
      g.fillStyle = `rgb(${shine - 12},${shine - 5},${shine})`;
      g.fillRect(0, y, w, 1);
    }
  });
  return steel;
}

function mesh(geometry, texture, options) {
  return new THREE.Mesh(geometry, materialFor(texture, options));
}

// A flat piece of steel `size` [width, length], its middle at height y.
function steelPiece(t, steel, [width, length], y) {
  const piece = mesh(new THREE.BoxGeometry(width, length, 0.003), steelTexture(), steel);
  piece.position.y = y;
  return piece;
}

function scalpel(t, steel) {
  const handle = mesh(new THREE.BoxGeometry(0.008, 0.08, 0.004), t.iron, HANDLE);
  handle.position.y = 0.012;
  return [handle, steelPiece(t, steel, [0.007, 0.035], -0.045)];
}

function forceps(t, steel) {
  return [-1, 1].map((side) => {
    const arm = steelPiece(t, steel, [0.005, 0.12], -0.025);
    arm.position.x = side * 0.006;
    arm.rotation.z = side * 0.06;
    return arm;
  });
}

function scissors(t, steel) {
  const rings = [-1, 1].map((side) => {
    const ring = mesh(new THREE.TorusGeometry(0.012, 0.003, 4, 10), t.iron, HANDLE);
    ring.position.set(side * 0.012, 0.035, 0);
    return ring;
  });
  return [...rings, steelPiece(t, steel, [0.008, 0.09], -0.025)];
}

// A ring hanging under the belt with three clamps on it.
function clamps(t, steel) {
  const ring = mesh(new THREE.TorusGeometry(0.02, 0.003, 4, 12), t.iron, HANDLE);
  ring.position.y = -0.055;
  const hanging = [-1, 0, 1].map((k) => {
    const clamp = steelPiece(t, steel, [0.005, 0.07], -0.11);
    clamp.position.x = k * 0.012;
    clamp.rotation.z = k * 0.25;
    return clamp;
  });
  return [ring, ...hanging];
}

function boneSaw(t, steel) {
  const handle = mesh(new THREE.BoxGeometry(0.03, 0.08, 0.02), t.sheet, { color: '#3a2a1e' });
  return [handle, steelPiece(t, steel, [0.03, 0.16], -0.12)];
}

function pouch(t) {
  return [mesh(new THREE.BoxGeometry(0.1, 0.12, 0.05), t.sheet, { color: '#4a3424' })];
}

// Where each sits round the belt: an angle (front = pi / 2), and what.
const LAYOUT = [
  [0.95, scalpel], [1.15, forceps], [1.35, scalpel], [2.0, scissors], [2.25, scalpel],
  [0.55, clamps], [2.6, clamps], [-1.6, boneSaw], [0.2, pouch, 0.025, -0.05], [2.95, pouch, 0.025, -0.05],
];

// around(angle, out, y): a point on the belt; each tool faces out from it.
export function beltTools(t, around, steel) {
  return LAYOUT.map(([angle, make, out = 0.012, drop = 0]) => {
    const tool = new THREE.Group().add(...make(t, steel));
    tool.position.copy(around(angle, out)).add(new THREE.Vector3(0, drop - 0.02, 0));
    tool.rotation.y = Math.atan2(Math.cos(angle), Math.sin(angle));
    return tool;
  });
}
