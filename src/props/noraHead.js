// Nora Kane's head (0.5 proposal, mockup stills only until the owner approves
// her). Owner 2026-11-17, fifth pass: her face still odd, and she looked bald
// with a black smudge. Now sculpted (a woman of about thirty: a small nose,
// full lips, a soft jaw), her face painted at the scale it is drawn: eyes
// wide with the whites showing all round, looking at you; brows drawn up;
// mouth open; a bruise on her left cheekbone and a cut through her right
// brow. Her hair has volume: dark auburn, loose, parted, over her ears and
// down her neck; a strand fallen across her face. Origin at the head's
// centre, the face looking down +z.
import * as THREE from 'three';
import { materialFor, canvasTexture } from './parts.js';
import { sculptedHead, headPatch } from './sculpt.js';

const seeded = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const both = (bumps) => bumps.flatMap((b) => (b.at[0] ? [b, { ...b, at: [-b.at[0], b.at[1], b.at[2]] }] : [b]));

const BUMPS = both([
  { at: [0, -0.08, 1], size: 0.12, stretch: [0.45, 1.7, 1], amount: 0.18 }, // a straight nose
  { at: [0, -0.26, 0.97], size: 0.08, amount: 0.07 },
  { at: [0.3, 0.24, 0.93], size: 0.16, stretch: [1.5, 0.5, 1], amount: 0.05 }, // the brows
  { at: [0.3, 0.06, 0.95], size: 0.13, amount: -0.09 }, // the eyes
  { at: [0.58, -0.1, 0.8], size: 0.16, amount: 0.07 }, // the cheekbones
  { at: [0.5, -0.42, 0.74], size: 0.16, amount: -0.05 }, // the cheeks under them
  { at: [0, -0.5, 0.87], size: 0.12, stretch: [1.6, 0.8, 1], amount: 0.06 }, // full lips
  { at: [0, -0.52, 0.86], size: 0.06, stretch: [1.8, 1, 1], amount: -0.1 }, // the mouth open
  { at: [0, -0.86, 0.5], size: 0.16, amount: 0.08 }, // the chin
  { at: [0.62, -0.68, 0.32], size: 0.2, amount: 0.02 }, // the jaw
  { at: [0.85, 0.32, 0.4], size: 0.2, amount: -0.04 }, // the temples
  { at: [1, 0, -0.05], size: 0.12, stretch: [0.5, 1.4, 0.7], amount: 0.08 }, // the ears
]);
const SCALE = [0.74, 1.02, 0.94];
const RADIUS = 0.1;

function onTexture(w, h, [x, y, z]) {
  const length = Math.hypot(x, y, z);
  return [w * (0.5 + Math.atan2(x, z) / (Math.PI * 2)), (h * Math.acos(y / length)) / Math.PI];
}

function blot(g, x, y, rx, ry, color, core = 0.4) {
  g.save();
  g.translate(x, y);
  g.scale(1, ry / rx);
  const gradient = g.createRadialGradient(0, 0, 0, 0, 0, rx);
  gradient.addColorStop(0, color);
  gradient.addColorStop(core, color);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gradient;
  g.fillRect(-rx, -rx, rx * 2, rx * 2);
  g.restore();
}

// Her face at 256 x 128 (a texel is 2 mm across, 2.5 mm down).
function faceTexture() {
  const random = seeded(23);
  return canvasTexture(256, 128, (g, w, h) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const n = Math.floor(random() * 8);
        g.fillStyle = `rgb(${172 + n},${134 + n},${112 + n})`;
        g.fillRect(x, y, 1, 1);
      }
    }
    const at = (dir) => onTexture(w, h, dir);
    for (const side of [-1, 1]) {
      blot(g, ...at([side * 0.3, 0.05, 0.95]), 13, 7, 'rgba(96,60,52,0.55)'); // shadowed, tired round the eyes
      blot(g, ...at([side * 0.52, -0.4, 0.75]), 12, 9, 'rgba(110,72,60,0.4)'); // under the cheekbones
      blot(g, ...at([side * 0.6, -0.12, 0.79]), 9, 4, 'rgba(206,170,148,0.45)'); // the cheekbones, lit
      blot(g, ...at([side * 0.14, -0.15, 0.98]), 3, 8, 'rgba(110,70,58,0.45)'); // the sides of the nose
      blot(g, ...at([side * 0.66, -0.72, 0.25]), 12, 5, 'rgba(90,58,48,0.5)'); // under the jaw
      blot(g, ...at([side * 0.55, -0.3, 0.78]), 10, 6, 'rgba(200,120,110,0.3)'); // flushed
      eye(g, ...at([side * 0.3, 0.06, 0.95]), side);
      brow(g, ...at([side * 0.3, 0.2, 0.93]), side);
    }
    const [nx, ny] = at([0, -0.26, 0.97]);
    g.fillStyle = 'rgba(150,100,86,0.8)'; // under the nose
    g.fillRect(nx - 5, ny + 2, 10, 2);
    mouth(g, ...at([0, -0.52, 0.86]));
    blot(g, ...at([0.56, -0.08, 0.8]), 9, 6, 'rgba(96,60,110,0.7)'); // the bruise on her left cheekbone
    blot(g, ...at([0.6, -0.04, 0.78]), 5, 3, 'rgba(150,140,70,0.4)');
    cut(g, ...at([-0.36, 0.24, 0.9]));
    g.fillStyle = 'rgba(70,50,40,0.25)'; // dirt from the basement floor
    for (let i = 0; i < 40; i++) g.fillRect(w * 0.4 + random() * w * 0.2, 40 + random() * 70, 2, 1);
    hairline(g, w, h, random);
  });
}

// An eye wide open, the white showing round the iris; she looks to her
// right, at you (side -1 is her right, the canvas left).
function eye(g, x, y, side) {
  g.fillStyle = '#d4cabe';
  g.beginPath();
  g.ellipse(x, y, 7, 3, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#4a3020'; // brown iris, turned to you
  g.fillRect(Math.round(x - 5), Math.round(y - 2), 4, 4);
  g.fillStyle = '#0c0806';
  g.fillRect(Math.round(x - 4), Math.round(y - 1), 2, 2);
  g.fillStyle = '#2a1a14'; // lashes, the upper lid
  g.fillRect(Math.round(x - 8), Math.round(y - 3), 16, 1);
  g.fillStyle = 'rgba(120,80,64,0.6)'; // the crease above
  g.fillRect(Math.round(x - 7), Math.round(y - 5), 14, 1);
  g.fillStyle = 'rgba(60,36,30,0.7)';
  g.fillRect(Math.round(x - 7), Math.round(y + 4), 14, 1);
  if (side < 0) { // a catchlight
    g.fillStyle = 'rgba(255,255,255,0.9)';
    g.fillRect(Math.round(x - 4), Math.round(y - 1), 1, 1);
  }
}

// Brows drawn up in the middle: frightened.
function brow(g, x, y, side) {
  g.strokeStyle = '#3a2216';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(x + side * 9, y + 2);
  g.quadraticCurveTo(x + side * 2, y - 1, x - side * 5, y - 4);
  g.stroke();
}

function mouth(g, x, y) {
  g.fillStyle = '#a8605c'; // lips
  g.beginPath();
  g.ellipse(x, y, 11, 6, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#2a0c0c'; // open
  g.beginPath();
  g.ellipse(x, y + 0.5, 8, 4, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#e0d8cc'; // her top teeth
  g.fillRect(Math.round(x - 5), Math.round(y - 3), 10, 2);
}

// A cut through her right brow, dried, a trickle down to her temple.
function cut(g, x, y) {
  g.strokeStyle = '#6a1c16';
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(x - 4, y - 3);
  g.lineTo(x + 3, y + 3);
  g.moveTo(x - 2, y);
  g.quadraticCurveTo(x - 8, y + 6, x - 10, y + 14);
  g.stroke();
}

// Where her hair meets her skin, painted darker so the edge reads.
function hairline(g, w, h) {
  g.fillStyle = '#3a1e12';
  g.fillRect(0, 0, w, 22);
}

// Her hair: dark auburn, lighter where strands catch the light, falling down.
function hairTexture() {
  const random = seeded(29);
  return canvasTexture(64, 64, (g, w, h) => {
    for (let x = 0; x < w; x++) {
      const base = 40 + Math.floor(random() * 18) + (x % 7 === 0 ? 26 : 0);
      for (let y = 0; y < h; y++) {
        const n = Math.floor(random() * 8);
        g.fillStyle = `rgb(${base + n + 16},${Math.round((base + n) * 0.62)},${Math.round((base + n) * 0.42)})`;
        g.fillRect(x, y, 1, 1);
      }
    }
  });
}

// The hair round her head: a shell over the crown, the back and over the
// ears; under the skin (hidden) across her face.
function hairVolume(d) {
  const front = d.z > 0.35 && d.y < 0.62 && Math.abs(d.x) < 0.84; // the face
  if (front) return -0.15;
  const parting = Math.exp(-((d.x + 0.12) ** 2) / 0.004) * 0.03; // a parting, a little to her right
  return 0.12 - parting + (d.y < -0.3 ? 0.04 : 0);
}

export function noraHead(t) {
  const head = sculptedHead(RADIUS, BUMPS, { scale: SCALE, width: 32, height: 22 });
  const hair = sculptedHead(RADIUS, [], { scale: SCALE, width: 28, height: 18, extra: hairVolume });
  const material = materialFor(hairTexture());
  const strand = (around, from, length, width) => new THREE.Mesh(headPatch(head, (s, u) => [around + (u - 0.5) * width + s * 0.12, from - s * length], { columns: 6, rows: 1, out: 0.006 }), materialFor(hairTexture(), { side: THREE.DoubleSide }));
  return new THREE.Group().add(
    new THREE.Mesh(head.geometry, materialFor(faceTexture())),
    new THREE.Mesh(hair.geometry, material),
    strand(-0.62, 0.7, 0.55, 0.12), // fallen loose over her right temple
    strand(0.6, 0.72, 0.45, 0.1),
  );
}

export { hairTexture as noraHairTexture };
