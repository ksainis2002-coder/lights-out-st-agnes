// Dr. Venn's instruments, on his belt (owner 2026-11-17: no tray, he carries
// his tools on a belt; approving him: "make his tools more recognizable on
// the belt"). Big enough to name at a glance, with dark handles against his
// white coat and bright steel: an amputation saw on his right hip, a mallet,
// bone forceps, a leather roll of scalpels at the front, shears and hooks on
// his left, a ring of clamps behind (what clinks as he walks, and the silence
// when he hears you). Mockup stills only until the build. Each tool hangs
// from the belt at its origin, down -y, its face towards +z.
import * as THREE from 'three';
import { materialFor, canvasTexture } from './parts.js';

const WOOD = { color: '#2e2016' }; // dark handles
const LEATHER = { color: '#2a1e16' };
const DARK_STEEL = { color: '#5a5e64' };

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

// The saw's blade: steel, one long edge cut into teeth (clear between them).
let sawBlade = null;
function sawTexture() {
  sawBlade ??= canvasTexture(16, 64, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (let y = 0; y < h; y++) {
      const shine = 188 + Math.round(60 * Math.exp(-((y - 22) ** 2) / 80));
      g.fillStyle = `rgb(${shine - 12},${shine - 5},${shine})`;
      g.fillRect(0, y, w - 5, 1);
      g.fillRect(w - 5, y, 5 - (y % 5), 1); // a tooth every five rows
    }
  });
  return sawBlade;
}

function mesh(geometry, texture, options) {
  return new THREE.Mesh(geometry, materialFor(texture, options));
}

// A bar from one point to another in the tool's plane (z = 0).
function bar(texture, options, [x0, y0], [x1, y1], width, depth = 0.004) {
  const length = Math.hypot(x1 - x0, y1 - y0);
  const piece = mesh(new THREE.BoxGeometry(width * 1.6, length, depth), texture, options); // chunky: thin steel vanishes at the game's resolution
  piece.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0);
  piece.rotation.z = Math.atan2(x0 - x1, y1 - y0);
  return piece;
}

// A leather loop over the belt that the tool hangs from.
function loop(t) {
  return mesh(new THREE.BoxGeometry(0.03, 0.08, 0.012), t.sheet, LEATHER);
}

// A dark leather holster behind a tool, from the belt down: the steel reads
// against it, not against his white coat.
function holster(t, width, length) {
  const back = mesh(new THREE.BoxGeometry(width, length, 0.006), t.sheet, LEATHER);
  back.position.set(0, -length / 2 + 0.02, -0.009);
  return back;
}

// An amputation saw at a slant down his thigh: a pistol grip, a toothed blade.
function boneSaw(t) {
  const grip = mesh(new THREE.BoxGeometry(0.04, 0.11, 0.028), t.sheet, WOOD);
  grip.position.y = -0.02;
  const blade = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.28), materialFor(sawTexture(), { unlit: true, alphaTest: 0.5, side: THREE.DoubleSide }));
  blade.position.set(0.01, -0.21, 0.006);
  const saw = new THREE.Group().add(holster(t, 0.08, 0.38), grip, blade);
  saw.rotation.z = -0.35;
  return [loop(t), saw];
}

// A surgical mallet, head down: a dark handle, a steel head across it.
function mallet(t, shine) {
  const handle = mesh(new THREE.CylinderGeometry(0.011, 0.012, 0.17, 6), t.sheet, WOOD);
  handle.position.y = -0.06;
  const head = mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.09, 10), steelTexture(), shine);
  head.rotation.z = Math.PI / 2;
  head.position.y = -0.155;
  return [holster(t, 0.04, 0.16), loop(t), handle, head];
}

// Bone forceps: long handles spread at the top, crossing at a pivot, the jaws shut below.
function forceps(t, shine) {
  return [
    holster(t, 0.07, 0.17), loop(t),
    bar(steelTexture(), shine, [-0.03, 0.0], [0.006, -0.11], 0.008),
    bar(steelTexture(), shine, [0.03, 0.0], [-0.006, -0.11], 0.008),
    bar(t.iron, DARK_STEEL, [-0.006, -0.11], [0.0, -0.15], 0.012),
    bar(t.iron, DARK_STEEL, [0.006, -0.11], [0.0, -0.15], 0.012),
  ];
}

// A leather roll of scalpels, the blades up and bright.
function scalpelRoll(t, shine) {
  const roll = mesh(new THREE.BoxGeometry(0.1, 0.085, 0.024), t.sheet, LEATHER);
  roll.position.y = -0.075;
  const knives = [-0.036, -0.012, 0.012, 0.036].flatMap((x, i) => {
    const top = -0.02 + (i % 2) * 0.012;
    const handle = mesh(new THREE.BoxGeometry(0.009, 0.05, 0.005), t.iron, DARK_STEEL);
    handle.position.set(x, top - 0.02, 0.013);
    const blade = mesh(new THREE.ConeGeometry(0.011, 0.04, 4), steelTexture(), shine);
    blade.scale.z = 0.3;
    blade.position.set(x, top + 0.02, 0.013);
    return [handle, blade];
  });
  return [roll, ...knives];
}

// Shears hanging blades down: two finger rings, the blades crossed below them.
function shears(t, shine) {
  const rings = [-1, 1].map((side) => {
    const ring = mesh(new THREE.TorusGeometry(0.018, 0.007, 6, 12), steelTexture(), shine);
    ring.position.set(side * 0.02, -0.02, 0);
    return ring;
  });
  return [
    holster(t, 0.07, 0.21), loop(t), ...rings,
    bar(steelTexture(), shine, [-0.018, -0.035], [0.014, -0.19], 0.011),
    bar(steelTexture(), shine, [0.018, -0.035], [-0.014, -0.19], 0.011),
  ];
}

// Two hooks on a ring.
function hooks(t, shine) {
  const ring = mesh(new THREE.TorusGeometry(0.02, 0.004, 4, 12), t.iron, DARK_STEEL);
  ring.position.y = -0.04;
  const hanging = [-1, 1].flatMap((side) => {
    const shank = bar(steelTexture(), shine, [side * 0.01, -0.055], [side * 0.012, -0.17], 0.006);
    const curl = mesh(new THREE.TorusGeometry(0.018, 0.006, 4, 10, Math.PI), steelTexture(), shine);
    curl.position.set(side * 0.012 + side * 0.016, -0.17, 0);
    curl.rotation.z = Math.PI;
    return [shank, curl];
  });
  return [holster(t, 0.07, 0.2), ring, ...hanging];
}

// A ring of clamps behind, under the belt.
function clamps(t, shine) {
  const ring = mesh(new THREE.TorusGeometry(0.022, 0.004, 4, 12), t.iron, DARK_STEEL);
  ring.position.y = -0.05;
  const hanging = [-1, 0, 1].map((k) => bar(steelTexture(), shine, [k * 0.012, -0.065], [k * 0.03, -0.15], 0.007));
  return [ring, ...hanging];
}

// Where each sits round the belt: an angle (his front is pi / 2, his left 0);
// the four that say what he is face front: shears, scalpels, mallet, saw.
const LAYOUT = [
  [0.85, shears], [1.38, scalpelRoll], [1.92, mallet], [2.38, boneSaw], [0.2, forceps], [2.98, hooks], [-1.6, clamps],
];
const SIZE = 1.5; // larger than life, so each reads from across a room

// around(angle, out): a point on the belt; each tool faces out from it.
export function beltTools(t, around, shine) {
  return LAYOUT.map(([angle, make]) => {
    const tool = new THREE.Group().add(...make(t, shine));
    tool.scale.setScalar(SIZE);
    tool.position.copy(around(angle, 0.016));
    tool.rotation.y = Math.atan2(Math.cos(angle), Math.sin(angle));
    return tool;
  });
}
