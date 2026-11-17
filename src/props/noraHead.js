// Nora Kane's head (0.5 proposal, mockup stills only until the owner approves
// her). Owner 2026-11-17: her face odd, and she looked bald with a black
// smudge; then "face still odd, almost there". Sculpted (a woman of about
// thirty: a straight nose, full lips, a soft jaw), her face painted at the
// scale it is drawn: almond eyes opened wide, looking at you; brows drawn up;
// her mouth open in fright; a bruise on her left cheekbone and a cut at her
// right temple. Her hair has volume and frames her face: dark auburn,
// loose, parted, over her ears and down her neck, loose strands at her
// temples. Origin at the head's centre, the face looking down +z.
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
  { at: [0, -0.52, 0.86], size: 0.12, stretch: [1.6, 0.8, 1], amount: 0.05 }, // full lips
  { at: [0, -0.55, 0.84], size: 0.07, stretch: [1.8, 1, 1], amount: -0.1 }, // the mouth open
  { at: [0, -0.86, 0.5], size: 0.16, amount: 0.08 }, // the chin
  { at: [0.62, -0.68, 0.32], size: 0.2, amount: 0.02 }, // the jaw
  { at: [0.85, 0.32, 0.4], size: 0.2, amount: -0.04 }, // the temples
  { at: [1, 0, -0.05], size: 0.12, stretch: [0.5, 1.4, 0.7], amount: 0.08 }, // the ears
]);
const SCALE = [0.72, 1.04, 0.92];
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

// Her face at 256 x 128 (a texel is 2 mm across, 2.5 mm down). Owner
// 2026-11-17 (fifth pass: "face still odd, almost there"): features bolder
// and in proportion, a nose that shows, a mouth open in fright rather than
// an O, the hair framing her face.
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
      blot(g, ...at([side * 0.3, 0.08, 0.95]), 14, 8, 'rgba(110,70,60,0.5)'); // the sockets, shadowed
      blot(g, ...at([side * 0.5, -0.42, 0.75]), 12, 9, 'rgba(116,76,62,0.45)'); // under the cheekbones
      blot(g, ...at([side * 0.6, -0.1, 0.79]), 9, 4, 'rgba(204,166,142,0.5)'); // the cheekbones, lit
      blot(g, ...at([side * 0.64, -0.7, 0.3]), 13, 5, 'rgba(92,58,48,0.55)'); // under the jaw
      blot(g, ...at([side * 0.52, -0.3, 0.78]), 9, 5, 'rgba(196,112,100,0.3)'); // flushed
      eye(g, ...at([side * 0.3, 0.06, 0.95]), side);
      brow(g, ...at([side * 0.3, 0.21, 0.93]), side);
    }
    blot(g, ...at([0, 0.38, 0.92]), 18, 7, 'rgba(196,160,136,0.4)'); // the forehead, catching the light
    for (const side of [-1, 1]) {
      blot(g, ...at([side * 0.62, 0.3, 0.72]), 8, 10, 'rgba(110,72,58,0.45)'); // the temples, by the hair
      blot(g, ...at([side * 0.22, -0.4, 0.9]), 3, 7, 'rgba(120,80,66,0.45)'); // from the nose to the mouth
    }
    nose(g, at);
    mouth(g, ...at([0, -0.54, 0.84]));
    blot(g, ...at([0, -0.84, 0.54]), 10, 3, 'rgba(110,72,58,0.45)'); // under the lower lip
    blot(g, ...at([0.58, -0.1, 0.8]), 6, 4, 'rgba(100,62,112,0.7)'); // the bruise on her left cheekbone
    blot(g, ...at([0.62, -0.06, 0.78]), 4, 2, 'rgba(150,140,70,0.4)');
    cut(g, ...at([-0.42, 0.46, 0.78]));
    g.fillStyle = 'rgba(70,50,40,0.22)'; // dirt from the basement floor
    for (let i = 0; i < 30; i++) g.fillRect(w * 0.42 + random() * w * 0.16, 50 + random() * 50, 2, 1);
    hairline(g, w, h, random);
  });
}

// An almond eye opened wide (a line of white above the iris), looking at
// you; side -1 is her right, the canvas left.
function eye(g, x, y, side) {
  g.fillStyle = '#d6cec4';
  g.beginPath();
  g.moveTo(x - 9, y + 0.5);
  g.quadraticCurveTo(x - 2, y - 5, x + 8, y - 0.5);
  g.quadraticCurveTo(x + 1, y + 4.5, x - 9, y + 0.5);
  g.fill();
  const ix = Math.round(x - 1 - side * 0.5); // the iris, turned a little to you
  g.fillStyle = '#3e2618';
  g.fillRect(ix - 3, Math.round(y - 2), 6, 6);
  g.fillStyle = '#5e3e26';
  g.fillRect(ix - 2, Math.round(y - 1), 4, 4);
  g.fillStyle = '#080404';
  g.fillRect(ix - 1, Math.round(y), 2, 2);
  g.fillStyle = 'rgba(255,255,255,0.85)'; // the catchlight
  g.fillRect(ix + 1, Math.round(y - 1), 1, 1);
  g.strokeStyle = '#3a2218'; // the upper lid and lashes, the lower lid
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(x - 10, y + 1);
  g.quadraticCurveTo(x - 2, y - 6, x + 9, y - 1);
  g.stroke();
  g.strokeStyle = 'rgba(80,46,38,0.7)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(x - 8, y + 2);
  g.quadraticCurveTo(x, y + 5, x + 7, y + 1);
  g.stroke();
}

// Brows drawn up at the inner ends: frightened.
function brow(g, x, y, side) {
  g.strokeStyle = '#4a2c1c';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(x + side * 10, y + 3);
  g.quadraticCurveTo(x + side * 3, y - 1, x - side * 6, y - 4);
  g.stroke();
}

// The nose: light down the bridge, shade down one side and under the tip,
// the nostrils.
function nose(g, at) {
  const [x, y] = at([0, -0.1, 1]);
  g.fillStyle = 'rgba(200,164,142,0.6)';
  g.fillRect(Math.round(x - 1), Math.round(y - 12), 2, 16);
  blot(g, x + 5, y - 2, 3, 9, 'rgba(120,78,64,0.55)');
  blot(g, x, y + 7, 7, 3, 'rgba(100,62,52,0.6)');
  g.fillStyle = '#4a2a22';
  g.fillRect(Math.round(x - 5), Math.round(y + 6), 3, 2);
  g.fillRect(Math.round(x + 2), Math.round(y + 6), 3, 2);
}

// Her mouth open in fright: wide, the jaw dropped, the top teeth showing.
function mouth(g, x, y) {
  g.fillStyle = '#8a4642'; // lips: a bow above, fuller below
  g.beginPath();
  g.moveTo(x - 15, y);
  g.quadraticCurveTo(x - 7, y - 7, x, y - 5);
  g.quadraticCurveTo(x + 7, y - 7, x + 15, y);
  g.quadraticCurveTo(x + 7, y + 11, x, y + 11);
  g.quadraticCurveTo(x - 7, y + 11, x - 15, y);
  g.fill();
  g.fillStyle = '#200808'; // open
  g.beginPath();
  g.moveTo(x - 12, y);
  g.quadraticCurveTo(x, y - 5, x + 12, y);
  g.quadraticCurveTo(x, y + 9, x - 12, y);
  g.fill();
  g.fillStyle = '#ddd4c6'; // the top teeth
  g.fillRect(Math.round(x - 7), Math.round(y - 3), 14, 2);
}

// A cut at her right temple by the hair, dried, a thin trickle down.
function cut(g, x, y) {
  g.strokeStyle = '#6a1c16';
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(x - 3, y);
  g.lineTo(x + 3, y - 1);
  g.stroke();
  g.strokeStyle = 'rgba(106,28,22,0.7)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(x - 2, y + 1);
  g.quadraticCurveTo(x - 4, y + 8, x - 3, y + 16);
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
  const front = d.z > 0.3 && d.y < 0.5 - 0.5 * d.x * d.x && Math.abs(d.x) < 0.66; // the face, framed
  const jaw = d.y < -0.25 && d.z > -0.15; // her jaw and chin bare: the hair falls back off them
  if (front || jaw) return -0.15;
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
