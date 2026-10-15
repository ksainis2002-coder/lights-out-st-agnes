// Props for the school library, gym and headmaster's office (0.3).
// Same conventions as catalog.js: origin on the floor, front facing +z.
import * as THREE from 'three';
import { box, decal, materialFor, canvasTexture } from './parts.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

function seeded(seed) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

// A row of book spines: faded cloth colours, a few gaps and leaning books.
// Six rows are drawn and shared, so a library of shelves merges into a few
// draw calls (integrated graphics).
const SPINE_ROWS = 6;
const spineCache = new Map();
function spinesTexture(seed) {
  const row = seed % SPINE_ROWS;
  if (!spineCache.has(row)) spineCache.set(row, drawSpines(row + 1));
  return spineCache.get(row);
}

function drawSpines(seed) {
  return canvasTexture(64, 16, (g, w, h) => {
    const random = seeded(seed);
    const colours = ['#5a2a22', '#2e3a4a', '#3a4a2e', '#6a5a3a', '#4a2e3a', '#2a2a28', '#7a6a50'];
    g.fillStyle = '#120e0a';
    g.fillRect(0, 0, w, h);
    for (let x = 0; x < w;) {
      const width = 2 + Math.floor(random() * 3);
      if (random() < 0.08) { x += width + 2; continue; } // a gap where a book was taken
      g.fillStyle = colours[Math.floor(random() * colours.length)];
      const top = Math.floor(random() * 4);
      g.fillRect(x, top, width, h - top);
      g.fillStyle = 'rgba(220,200,150,0.35)'; // gilt band
      g.fillRect(x, top + 3, width, 1);
      x += width;
    }
  });
}

// Library bookcase, 2 m long, five shelves, a shelf-mark plate on top.
function bookshelf(t, { length = 2, height = 2.3, mark = '', seed = 3 } = {}) {
  const wood = { color: '#4a3424' };
  const parts = [
    box(t.paintedWood, [length, height, 0.04], [0, 0, -0.17], wood),
    box(t.paintedWood, [0.05, height, 0.36], [-length / 2, 0, 0], wood),
    box(t.paintedWood, [0.05, height, 0.36], [length / 2, 0, 0], wood),
  ];
  const shelves = 5;
  for (let i = 0; i <= shelves; i++) {
    const y = 0.08 + i * ((height - 0.12) / shelves);
    parts.push(box(t.paintedWood, [length, 0.03, 0.36], [0, y, 0], wood));
    if (i < shelves) parts.push(decal(spinesTexture(seed * 7 + i), [length - 0.08, 0.3], [0, y + 0.18, 0.12]));
  }
  if (mark) parts.push(decal(markTexture(mark), [0.34, 0.12], [0, height - 0.1, 0.19]));
  return group(...parts);
}

// Brass plate with a stamped shelf mark ("390–399"): numbers, not words.
function markTexture(mark) {
  return canvasTexture(48, 16, (g, w, h) => {
    g.fillStyle = '#9a8040';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a2010';
    g.font = 'bold 10px monospace';
    g.textAlign = 'center';
    g.fillText(mark, w / 2, 12);
  });
}

// Card-index cabinet: a block of small drawers with brass pulls, on legs.
function indexCabinet(t) {
  const drawers = canvasTexture(32, 32, (g) => {
    g.fillStyle = '#5a3e28';
    g.fillRect(0, 0, 32, 32);
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        g.fillStyle = '#6e4e32';
        g.fillRect(x * 8 + 1, y * 8 + 1, 6, 6);
        g.fillStyle = '#c8a860';
        g.fillRect(x * 8 + 3, y * 8 + 3, 2, 1);
        g.fillStyle = '#e8e0c8'; // the card label in its brass frame
        g.fillRect(x * 8 + 2, y * 8 + 5, 4, 1);
      }
    }
  });
  const legs = [[-0.3, -0.18], [0.3, -0.18], [-0.3, 0.18], [0.3, 0.18]].map(([x, z]) => box(t.paintedWood, [0.05, 0.6, 0.05], [x, 0, z], { color: '#3a2818' }));
  return group(...legs, box(t.paintedWood, [0.7, 0.62, 0.42], [0, 0.6, 0], { color: '#4a3424' }), decal(drawers, [0.64, 0.56], [0, 0.91, 0.212]));
}

// Steel filing cabinet for pupil records, a three-wheel combination lock on
// the top drawer (lock: false for a plain office filing cabinet).
function recordsCabinet(t, { lock = true } = {}) {
  const grey = { color: '#8a8e88' }; // painted steel (the sheet texture keeps it grey, not black)
  const parts = [box(t.sheet, [0.5, 1.32, 0.6], [0, 0, 0], grey)];
  for (let i = 0; i < 4; i++) {
    const y = 0.06 + i * 0.32;
    parts.push(box(t.sheet, [0.44, 0.28, 0.02], [0, y, 0.3], { color: '#9a9e98' }));
    parts.push(box(t.sheet, [0.12, 0.02, 0.03], [0, y + 0.2, 0.32], { color: '#b0b0a8' }));
  }
  if (!lock) return group(...parts);
  parts.push(box(t.sheet, [0.16, 0.07, 0.04], [0, 1.15, 0.32], { color: '#a88a40' })); // the lock
  [-0.04, 0, 0.04].forEach((x) => parts.push(box(t.sheet, [0.025, 0.05, 0.02], [x, 1.16, 0.345], { color: '#d8c890' })));
  return group(...parts);
}

// Hopscotch chalked on the floor: 1 2 3 singles, 4|5, 6, 7|8, 9, 10 home.
function hopscotchTexture() {
  return canvasTexture(64, 192, (g) => {
    g.clearRect(0, 0, 64, 192);
    g.strokeStyle = 'rgba(236,236,226,0.9)';
    g.fillStyle = 'rgba(236,236,226,0.9)';
    g.lineWidth = 2.5;
    g.font = 'bold 13px sans-serif';
    g.textAlign = 'center';
    const square = (x, y, n) => {
      g.strokeRect(x + 0.5, y + 0.5, 22, 22);
      g.fillText(String(n), x + 11, y + 15);
    };
    const rows = [[1], [2], [3], [4, 5], [6], [7, 8], [9]];
    rows.forEach((row, i) => {
      const y = 166 - i * 22;
      row.forEach((n, j) => square(row.length === 1 ? 21 : 10 + j * 22, y, n));
    });
    g.beginPath();
    g.arc(32, 22 + 10, 16, Math.PI, 0);
    g.stroke();
    g.fillText('10', 32, 28);
  });
}

function hopscotch() {
  const chalk = decal(hopscotchTexture(), [0.9, 2.7], [0, 0.004, 0], { transparent: true });
  chalk.rotation.x = -Math.PI / 2;
  return group(chalk);
}

// Wall bars: a wooden ladder fixed to the gym wall (back to the wall).
function wallBars(t, { height = 2.6 } = {}) {
  const wood = { color: '#9a7a4a' };
  const parts = [box(t.paintedWood, [0.06, height, 0.06], [-0.45, 0, 0.08], wood), box(t.paintedWood, [0.06, height, 0.06], [0.45, 0, 0.08], wood)];
  for (let y = 0.2; y < height; y += 0.18) parts.push(box(t.paintedWood, [0.9, 0.035, 0.035], [0, y, 0.08], wood));
  return group(...parts);
}

// Climbing rope hanging from the ceiling, its end a little off the floor.
function climbingRope(t, { top = 5, length = 4.2 } = {}) {
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, length, 5), materialFor(t.sheet, { color: '#a89878' }));
  rope.position.y = top - length / 2;
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 4), materialFor(t.sheet, { color: '#a89878' }));
  knot.position.y = top - length;
  return group(rope, knot);
}

// Vaulting horse: a padded leather body on four splayed legs.
function vaultingHorse(t) {
  const legs = [[-0.42, -0.14, -0.12], [0.42, -0.14, 0.12], [-0.42, 0.14, -0.12], [0.42, 0.14, 0.12]].map(([x, z, tilt]) => {
    const leg = box(t.paintedWood, [0.06, 1.0, 0.06], [x, 0, z], { color: '#6a4a2a' });
    leg.rotation.z = tilt;
    return leg;
  });
  return group(...legs, box(t.mattress, [1.3, 0.3, 0.38], [0, 0.98, 0], { color: '#5a3a24' }));
}

export const SCHOOL_ROOM_PROPS = { bookshelf, indexCabinet, recordsCabinet, hopscotch, wallBars, climbingRope, vaultingHorse };
