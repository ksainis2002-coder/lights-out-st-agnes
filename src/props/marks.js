// Marks a child left in the quiet room: scratches by the door, days counted
// on the wall, small grimy handprints, picked-off wallpaper, a worn patch
// where he sat, charcoal drawings on the wallpaper, the tin plate and cup
// pushed in under the door. Aftermath only (scare rules: no harm shown, no
// blood). Wall marks are decals with their back on the wall at z = 0, at a
// child's height; none of them are solid.
import * as THREE from 'three';
import { box, decal, materialFor, canvasTexture } from './parts.js';

const SCRATCH = 'rgba(226,214,188,0.85)'; // pale gouges in the dark wood panelling
const CHARCOAL = 'rgba(40,32,26,0.85)'; // drawn on the wallpaper with a burnt match

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

function seeded(seed) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function wallDecal(texture, [w, h], y) {
  return group(decal(texture, [w, h], [0, y, 0.004], { transparent: true }));
}

// Fingernail gouges: sets of three or four thin lines dragged downwards.
function scratchesTexture(seed) {
  return canvasTexture(32, 48, (g) => {
    const random = seeded(seed);
    g.clearRect(0, 0, 32, 48);
    g.strokeStyle = SCRATCH;
    g.lineWidth = 0.8;
    for (let set = 0; set < 6; set++) {
      const x = 3 + random() * 22, y = 4 + random() * 22, length = 8 + random() * 18, slant = (random() - 0.5) * 6;
      for (let f = 0; f < 3 + (set % 2); f++) {
        g.beginPath();
        g.moveTo(x + f * 2, y + random() * 2);
        g.lineTo(x + f * 2 + slant, y + length - random() * 4);
        g.stroke();
      }
    }
  });
}

function wallScratches(t, { seed = 3 } = {}) {
  return wallDecal(scratchesTexture(seed), [0.42, 0.63], 0.72);
}

// Days counted in fives, scratched in rows; the last group unfinished.
function tallyTexture(count) {
  return canvasTexture(128, 48, (g) => {
    const random = seeded(count);
    g.clearRect(0, 0, 128, 48);
    g.strokeStyle = SCRATCH;
    g.lineWidth = 1.4;
    for (let i = 0; i < count; i++) {
      const group5 = Math.floor(i / 5), inGroup = i % 5;
      const gx = 4 + (group5 % 5) * 24, gy = 4 + Math.floor(group5 / 5) * 22;
      g.beginPath();
      if (inGroup < 4) {
        const x = gx + inGroup * 4 + random();
        g.moveTo(x, gy + random() * 2);
        g.lineTo(x + 1, gy + 16);
      } else {
        g.moveTo(gx - 2, gy + 13);
        g.lineTo(gx + 15, gy + 3);
      }
      g.stroke();
    }
  });
}

function tallyMarks(t, { count = 38 } = {}) {
  return wallDecal(tallyTexture(count), [0.9, 0.45], 0.55); // low: counted sitting on the floor
}

// Small grimy handprints low on the wall, one dragged down.
function handprintsTexture() {
  return canvasTexture(32, 32, (g) => {
    g.clearRect(0, 0, 32, 32);
    g.fillStyle = 'rgba(40,32,26,0.75)';
    const hand = (x, y, smear) => {
      g.fillRect(x, y + 3, 5, 5);
      [0, 1.4, 2.8, 4.2].forEach((fx) => g.fillRect(x + fx, y, 1, 3));
      g.fillRect(x - 1.5, y + 4, 1.5, 1);
      if (smear) g.fillRect(x + 0.5, y + 8, 4, smear);
    };
    hand(4, 5, 0);
    hand(15, 9, 9);
    hand(24, 3, 0);
  });
}

function handprints() {
  return wallDecal(handprintsTexture(), [0.5, 0.5], 1.12);
}

// Wallpaper picked off in ragged patches, the plaster showing through.
function peeledTexture(seed) {
  return canvasTexture(32, 32, (g) => {
    const random = seeded(seed);
    g.clearRect(0, 0, 32, 32);
    for (let i = 0; i < 5; i++) {
      const cx = 6 + random() * 20, cy = 6 + random() * 20, r = 3 + random() * 5;
      g.fillStyle = 'rgba(104,98,86,0.95)'; // grey plaster under the paper
      g.strokeStyle = 'rgba(214,200,170,0.9)'; // the torn white edge of the paper
      g.lineWidth = 1;
      g.beginPath();
      for (let a = 0; a < Math.PI * 2; a += 0.6) {
        const rr = r * (0.6 + random() * 0.5);
        g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      }
      g.closePath();
      g.fill();
      g.stroke();
    }
  });
}

function peeledPaper(t, { seed = 5 } = {}) {
  return wallDecal(peeledTexture(seed), [0.5, 0.4], 1.2); // above the panelling, as high as a child reaches
}

// Drawings in charcoal on the wallpaper: a door with a sun beyond it, or a
// tall veiled figure scribbled over again and again.
function scratchedDrawingTexture(kind) {
  return canvasTexture(32, 32, (g) => {
    g.clearRect(0, 0, 32, 32);
    g.strokeStyle = CHARCOAL;
    g.lineWidth = 0.9;
    g.beginPath();
    if (kind === 'figure') {
      g.moveTo(16, 3); g.lineTo(9, 29); g.lineTo(23, 29); g.closePath(); // the veil and habit
      g.moveTo(14, 8); g.lineTo(18, 8);
      g.stroke();
      const random = seeded(9);
      g.lineWidth = 1.4;
      for (let i = 0; i < 14; i++) { // scribbled out, hard
        g.beginPath();
        g.moveTo(7 + random() * 18, 4 + random() * 24);
        g.lineTo(7 + random() * 18, 4 + random() * 24);
        g.stroke();
      }
      return;
    }
    g.strokeRect(4.5, 8.5, 10, 20); // the door
    g.moveTo(12, 18); g.arc(12, 18, 1, 0, Math.PI * 2);
    g.moveTo(27, 8); g.arc(24, 8, 3, 0, Math.PI * 2); // the sun outside
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      g.moveTo(24 + Math.cos(a) * 4, 8 + Math.sin(a) * 4);
      g.lineTo(24 + Math.cos(a) * 6, 8 + Math.sin(a) * 6);
    }
    g.stroke();
  });
}

function scratchedDrawing(t, { kind = 'door' } = {}) {
  return wallDecal(scratchedDrawingTexture(kind), [0.4, 0.4], 1.2);
}

// The floor worn dark and smooth where someone sat for a long time.
function wornPatch() {
  const texture = canvasTexture(32, 32, (g) => {
    const shade = g.createRadialGradient(16, 16, 2, 16, 16, 15);
    shade.addColorStop(0, 'rgba(20,14,10,0.55)');
    shade.addColorStop(1, 'rgba(20,14,10,0)');
    g.fillStyle = shade;
    g.fillRect(0, 0, 32, 32);
  });
  const patch = decal(texture, [1.0, 0.8], [0, 0.003, 0], { transparent: true });
  patch.rotation.x = -Math.PI / 2;
  return group(patch);
}

// Enamel tin plate (a dry crust left on it) and a tin cup, by the door.
function tinPlate(t) {
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.02, 10), materialFor(t.sheet, { color: '#d8dcd4' }));
  plate.position.y = 0.01;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.006, 3, 10), materialFor(t.sheet, { color: '#2a3a6a' }));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.02;
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8), materialFor(t.sheet, { color: '#d8dcd4' }));
  cup.position.set(0.18, 0.04, 0.04);
  return group(plate, rim, cup, box(t.paintedWood, [0.05, 0.012, 0.03], [0.02, 0.02, 0.01], { color: '#a89068' }));
}

export const MARK_PROPS = { wallScratches, tallyMarks, handprints, peeledPaper, scratchedDrawing, wornPatch, tinPlate };
