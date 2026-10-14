// Everyday furniture for the orphanage corridor, landing, office and sick bay
// (owner request 2026-10-14: rooms that feel lived in). Same conventions as
// catalog.js: origin on the floor, front facing +z; wall things have their
// back on the wall at z = 0.
import * as THREE from 'three';
import { box, decal, materialFor, canvasTexture } from './parts.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

function flat(texture, [w, d], y = 0.004, options = {}) {
  const plane = decal(texture, [w, d], [0, y, 0], options);
  plane.rotation.x = -Math.PI / 2;
  return plane;
}

// Worn runner rug down a corridor: faded red with a dark border, repeated along its length.
function runnerTexture(length) {
  const texture = canvasTexture(16, 32, (g, w, h) => {
    g.fillStyle = '#5a2a22';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#2e1a14';
    g.fillRect(0, 0, 2, h);
    g.fillRect(w - 2, 0, 2, h);
    g.fillStyle = '#7a4a30';
    g.fillRect(5, 6, 6, 2);
    g.fillRect(7, 4, 2, 6);
    g.fillStyle = 'rgba(0,0,0,0.25)'; // worn path down the middle
    g.fillRect(4, 0, 8, h);
  });
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, Math.max(1, Math.round(length / 1.0)));
  return texture;
}

function runner(t, { length = 6, width = 0.9 } = {}) {
  return group(flat(runnerTexture(length), [width, length], 0.004, { color: '#b0a090' }));
}

// Square rug with a faded pattern.
function rug(t, { width = 2, depth = 1.6 } = {}) {
  const texture = canvasTexture(32, 32, (g) => {
    g.fillStyle = '#4a3a5a';
    g.fillRect(0, 0, 32, 32);
    g.strokeStyle = '#8a7a5a';
    g.lineWidth = 2;
    g.strokeRect(3, 3, 26, 26);
    g.fillStyle = '#6a4a3a';
    g.fillRect(12, 12, 8, 8);
  });
  return group(flat(texture, [width, depth], 0.004, { color: '#a09888' }));
}

// Cast-iron column radiator under the window line (back to the wall).
function radiator(t, { width = 1.0 } = {}) {
  const iron = { color: '#7a7a70' };
  const parts = [box(t.iron, [width, 0.04, 0.1], [0, 0.12, 0.06], iron)];
  for (let x = -width / 2 + 0.04; x < width / 2; x += 0.08) parts.push(box(t.iron, [0.05, 0.62, 0.1], [x, 0.14, 0.06], iron));
  parts.push(box(t.iron, [0.03, 0.12, 0.03], [-width / 2 - 0.02, 0.0, 0.06], iron));
  return group(...parts);
}

// Peg rail with children's coats and a cap (back to the wall).
function coatPegs(t, { count = 4, coats = 3 } = {}) {
  const wood = { color: '#5a4430' };
  const parts = [box(t.paintedWood, [count * 0.3, 0.07, 0.03], [0, 1.4, 0.015], wood)];
  const colours = ['#3a4458', '#5a3a2a', '#4a4a3a', '#6a2e2a'];
  for (let i = 0; i < count; i++) {
    const x = (i - (count - 1) / 2) * 0.3;
    parts.push(box(t.paintedWood, [0.025, 0.025, 0.07], [x, 1.42, 0.05], wood));
    if (i < coats) {
      const coat = box(t.sheet, [0.28, 0.55, 0.06], [x, 0.9, 0.07], { color: colours[i % colours.length] });
      coat.rotation.z = (i % 2 ? 1 : -1) * 0.05;
      parts.push(coat, box(t.sheet, [0.22, 0.1, 0.07], [x, 1.38, 0.08], { color: colours[(i + 1) % colours.length] }));
    }
  }
  return group(...parts);
}

// Cork notice board with pinned sheets; their lines are too small to read.
function noticeBoard(t) {
  const cork = canvasTexture(32, 24, (g) => {
    g.fillStyle = '#8a6a44';
    g.fillRect(0, 0, 32, 24);
    [[2, 2, 9, 12], [13, 3, 8, 10], [23, 2, 7, 9], [6, 15, 10, 7], [19, 13, 9, 9]].forEach(([x, y, w, h], i) => {
      g.fillStyle = i === 3 ? '#e8d8a0' : '#d8d0bc';
      g.fillRect(x, y, w, h);
      g.fillStyle = '#7a7060';
      for (let ly = y + 2; ly < y + h - 1; ly += 2) g.fillRect(x + 1, ly, w - 2 - ((ly * 3) % 3), 1);
      g.fillStyle = '#a02020'; // drawing pin
      g.fillRect(x + Math.floor(w / 2), y, 1, 1);
    });
  });
  return group(box(t.paintedWood, [1.0, 0.75, 0.03], [0, 1.15, 0.015], { color: '#4a3424' }), decal(cork, [0.94, 0.69], [0, 1.525, 0.032]));
}

// Small framed print of St. Agnes with her lamb (the wing 2 statue piece).
function saintPicture(t) {
  const print = canvasTexture(16, 20, (g) => {
    g.fillStyle = '#c8b890';
    g.fillRect(0, 0, 16, 20);
    g.fillStyle = '#d8c060'; // halo
    g.fillRect(6, 2, 4, 1);
    g.fillStyle = '#3a4a6a'; // veil and robe
    g.fillRect(6, 3, 4, 3);
    g.fillRect(5, 6, 6, 11);
    g.fillStyle = '#e0dcd0'; // the lamb in her arms
    g.fillRect(6, 9, 4, 3);
    g.fillStyle = '#5a4a3a';
    g.fillRect(4, 17, 8, 1);
  });
  return group(box(t.paintedWood, [0.46, 0.58, 0.025], [0, 1.3, 0.012], { color: '#6a5020' }), decal(print, [0.38, 0.5], [0, 1.59, 0.026]));
}

// Plain wooden crucifix on the wall.
function crucifix(t, { height = 1.85 } = {}) {
  const wood = { color: '#3a2618' };
  return group(box(t.paintedWood, [0.04, 0.42, 0.025], [0, height - 0.21, 0.012], wood), box(t.paintedWood, [0.24, 0.04, 0.025], [0, height - 0.06, 0.012], wood));
}

// Black office typewriter with a sheet in it (sits on a table, y = 0.74).
function typewriter(t) {
  const black = { color: '#1e1e20' };
  return group(
    box(t.iron, [0.34, 0.08, 0.28], [0, 0, 0], black),
    box(t.iron, [0.3, 0.06, 0.12], [0, 0.05, -0.06], black),
    box(t.sheet, [0.36, 0.035, 0.035], [0, 0.11, -0.1], { color: '#2a2a2a' }), // the platen
    box(t.sheet, [0.2, 0.16, 0.005], [0, 0.12, -0.12], { color: '#d8d0bc' }),
    box(t.sheet, [0.28, 0.01, 0.1], [0, 0.081, 0.08], { color: '#c8c8c0' }), // the keys
  );
}

// Hospital folding screen: three cloth panels in steel frames, opened at angles.
function foldingScreen(t, { panels = 3 } = {}) {
  const steel = { color: '#9a9e98' };
  const cloth = { color: '#d8d4c0', transparent: true, opacity: 0.9 };
  const parts = [];
  for (let i = 0; i < panels; i++) {
    const panel = group(
      box(t.iron, [0.02, 1.7, 0.02], [-0.3, 0, 0], steel),
      box(t.iron, [0.02, 1.7, 0.02], [0.3, 0, 0], steel),
      box(t.sheet, [0.58, 1.3, 0.01], [0, 0.3, 0], cloth),
    );
    panel.position.x = (i - (panels - 1) / 2) * 0.6;
    panel.rotation.y = i % 2 ? 0.25 : -0.25;
    parts.push(panel);
  }
  return group(...parts);
}

// Two-tier steel trolley with bottles, a kidney dish and folded gauze.
function trolley(t) {
  const steel = { color: '#a8aca6' };
  const legs = [[-0.27, -0.17], [0.27, -0.17], [-0.27, 0.17], [0.27, 0.17]].map(([x, z]) => box(t.iron, [0.025, 0.85, 0.025], [x, 0.04, z], steel));
  const wheels = [[-0.27, -0.17], [0.27, -0.17], [-0.27, 0.17], [0.27, 0.17]].map(([x, z]) => box(t.iron, [0.04, 0.05, 0.04], [x, 0, z], { color: '#2a2a2a' }));
  return group(
    ...legs, ...wheels,
    box(t.iron, [0.6, 0.02, 0.4], [0, 0.35, 0], steel),
    box(t.iron, [0.6, 0.02, 0.4], [0, 0.88, 0], steel),
    box(t.sheet, [0.05, 0.13, 0.05], [-0.18, 0.9, -0.08], { color: '#5a3a1a' }),
    box(t.sheet, [0.05, 0.1, 0.05], [-0.1, 0.9, -0.1], { color: '#2a4a3a' }),
    box(t.sheet, [0.2, 0.03, 0.1], [0.12, 0.9, 0.05], { color: '#c8ccc8' }),
    box(t.sheet, [0.2, 0.05, 0.16], [0, 0.37, 0.02], { color: '#e0e0d8' }),
  );
}

export const FURNISH_PROPS = { runner, rug, radiator, coatPegs, noticeBoard, saintPicture, crucifix, typewriter, foldingScreen, trolley };
