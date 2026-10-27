// The hub's decay (brief: each time you come back the patient room has
// decayed a little more): damp stains and fallen tiles on its tiled walls,
// the broken tiles on the floor, and a small wired-glass panel in its door
// that cracks. Proposal props for the part C stills (0.3).
import * as THREE from 'three';
import { box, decal, canvasTexture } from './parts.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

function seeded(seed) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const TILE_PX = 8; // one wall tile in the decay texture (32 px a metre)

// Damp stains running down from the top, a few tiles gone (bare plaster
// with a dark edge) and cracks between them. Transparent elsewhere.
function decayTexture(seed) {
  return canvasTexture(64, 48, (g, w, h) => {
    const random = seeded(seed);
    g.clearRect(0, 0, w, h);
    for (let i = 0; i < 3; i++) {
      const x = 8 + random() * (w - 16);
      const stain = g.createLinearGradient(0, 0, 0, h * (0.5 + random() * 0.5));
      stain.addColorStop(0, 'rgba(78,60,30,0.7)');
      stain.addColorStop(1, 'rgba(84,66,34,0)');
      g.fillStyle = stain;
      g.fillRect(x - 6 - random() * 6, 0, 10 + random() * 10, h);
    }
    for (let i = 0; i < 8; i++) {
      const x = Math.floor(random() * (w / TILE_PX)) * TILE_PX;
      const y = Math.floor(random() * (h / TILE_PX)) * TILE_PX;
      g.fillStyle = '#5e5a4c';
      g.fillRect(x, y, TILE_PX, TILE_PX);
      g.fillStyle = '#2e2c24';
      g.fillRect(x, y, TILE_PX, 1);
      g.fillRect(x, y, 1, TILE_PX);
    }
    g.strokeStyle = 'rgba(30,30,26,0.8)';
    g.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      let x = random() * w;
      let y = random() * h * 0.5;
      g.beginPath();
      g.moveTo(x, y);
      for (let step = 0; step < 5; step++) g.lineTo((x += (random() - 0.5) * 10), (y += 3 + random() * 5));
      g.stroke();
    }
  });
}

// On a wall, facing +z (origin on the wall line, centre at height y).
function tileDecay(t, { width = 1.6, height = 1.2, y = 1.3, seed = 3 } = {}) {
  return group(decal(decayTexture(seed), [width, height], [0, y, 0.01], { transparent: true }));
}

// Broken tiles on the floor under a bare patch.
function fallenTiles(t, { seed = 5 } = {}) {
  const random = seeded(seed);
  const pieces = Array.from({ length: 5 }, (_, i) => {
    const size = i < 2 ? 0.15 : 0.06 + random() * 0.05;
    const piece = box(t.sheet, [size, 0.012, size * (0.6 + random() * 0.4)], [(random() - 0.5) * 0.6, 0, random() * 0.35], { color: i % 2 ? '#9cb4a4' : '#8aa294' });
    piece.rotation.y = random() * Math.PI;
    return piece;
  });
  return group(...pieces);
}

// A small vision panel of wired glass for a door, facing +z; cracked, a
// star of cracks spreads from one corner.
function paneTexture(cracked) {
  return canvasTexture(24, 32, (g, w, h) => {
    g.fillStyle = '#2a3238';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(160,176,184,0.35)';
    for (let x = 2; x < w; x += 5) g.fillRect(x, 0, 1, h);
    for (let y = 2; y < h; y += 5) g.fillRect(0, y, w, 1);
    if (!cracked) return;
    g.strokeStyle = 'rgba(220,230,236,0.85)';
    g.beginPath();
    [[24, 10], [10, 0], [2, 18], [16, 32], [24, 26]].forEach(([x, y]) => {
      g.moveTo(17, 9);
      g.lineTo(x, y);
    });
    g.stroke();
  });
}

function doorPane(t, { cracked = false } = {}) {
  return group(
    box(t.iron, [0.3, 0.4, 0.02], [0, 1.3, 0], { color: '#3a3a36' }),
    decal(paneTexture(cracked), [0.24, 0.32], [0, 1.5, 0.012]),
  );
}

export const HUB_PROPS = { tileDecay, fallenTiles, doorPane };
