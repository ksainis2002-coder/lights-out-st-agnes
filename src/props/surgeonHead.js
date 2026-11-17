// Dr. Venn's head (0.5 proposal, mockup stills only until the owner approves
// him). Owner 2026-11-17, fifth pass: the face read as blocks and did not
// frighten; grey sunken skin, the lips pulled back off the teeth, the stitched
// eye plain to see. Sculpted, long and gaunt: the cheeks fallen in under the
// cheekbones, the eyes deep; the lips drawn back off long yellowed teeth; the
// bandage slipped down on his left off the eye he stitched shut himself, an
// old stitched scar up his forehead; thin hair combed back; the head mirror on
// its band. Origin at the head's centre, the face looking down +z.
import * as THREE from 'three';
import { materialFor, canvasTexture } from './parts.js';
import { sculptedHead, headPatch, strapGeometry } from './sculpt.js';

const seeded = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const both = (bumps) => bumps.flatMap((b) => (b.at[0] ? [b, { ...b, at: [-b.at[0], b.at[1], b.at[2]] }] : [b]));
const towards = (around, up) => [Math.sin(around) * Math.cos(up), Math.sin(up), Math.cos(around) * Math.cos(up)];

const BUMPS = [
  ...both([
    { at: [0, -0.1, 1], size: 0.13, stretch: [0.5, 1.8, 1], amount: 0.24 }, // a long thin nose
    { at: [0, -0.3, 0.95], size: 0.09, amount: 0.08 },
    { at: [0.3, 0.26, 0.92], size: 0.17, stretch: [1.5, 0.5, 1], amount: 0.1 }, // the brow ridge
    { at: [0.32, 0.07, 0.95], size: 0.16, stretch: [1.2, 0.85, 1], amount: -0.22 }, // the eyes sunk deep
    { at: [0.62, -0.12, 0.78], size: 0.14, amount: 0.13 }, // the cheekbones
    { at: [0.48, -0.47, 0.74], size: 0.2, amount: -0.26 }, // the cheeks fallen in under them
    { at: [0.85, 0.3, 0.45], size: 0.22, amount: -0.12 }, // the temples
    { at: [0, -0.58, 0.82], size: 0.15, stretch: [1.8, 0.75, 1], amount: -0.04 }, // the mouth, drawn back
    { at: [0, -0.9, 0.42], size: 0.18, amount: 0.1 }, // the chin
    { at: [0.62, -0.74, 0.28], size: 0.18, amount: 0.09 }, // the angle of the jaw
    { at: [1, 0.02, -0.05], size: 0.13, stretch: [0.5, 1.5, 0.7], amount: 0.11 }, // the ears
  ]),
  { at: [0, 0.35, -0.94], size: 0.5, amount: 0.07 }, // a long skull behind
  { at: [0.32, 0.05, 0.95], size: 0.08, stretch: [1.4, 0.7, 1], amount: 0.07 }, // his left eyelid, swollen shut
];

// Where a direction falls on the head's texture (the face in the middle).
function onTexture(w, h, [x, y, z]) {
  const length = Math.hypot(x, y, z);
  return [w * (0.5 + Math.atan2(x, z) / (Math.PI * 2)), (h * Math.acos(y / length)) / Math.PI];
}

function blot(g, x, y, rx, ry, color) {
  g.save();
  g.translate(x, y);
  g.scale(1, ry / rx);
  const gradient = g.createRadialGradient(0, 0, 0, 0, 0, rx);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.45, color); // a hard core: soft shading vanishes at the game's resolution
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gradient;
  g.fillRect(-rx, -rx, rx * 2, rx * 2);
  g.restore();
}

// Grey skin, dark in every hollow; the stitched eye; the scar; the hair.
// 256 x 128: the face is about 56 texels wide (a texel is 2 mm across and
// 3 mm down the face), so features are painted small.
function faceTexture() {
  const random = seeded(13);
  return canvasTexture(256, 128, (g, w, h) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const n = Math.floor(random() * 12);
        g.fillStyle = `rgb(${100 + n},${103 + n},${95 + n})`; // grey, with a little green in it
        g.fillRect(x, y, 1, 1);
      }
    }
    const at = (dir) => onTexture(w, h, dir);
    for (const side of [-1, 1]) {
      const [ex, ey] = at([side * 0.32, 0.07, 0.95]);
      blot(g, ex, ey, 15, 9, 'rgba(8,6,8,1)'); // the sockets, deep and black
      blot(g, ex, ey, 9, 5, 'rgba(8,6,8,1)');
      blot(g, ex, ey - 8, 9, 3, 'rgba(160,160,150,0.35)'); // the brow over them
      blot(g, ...at([side * 0.6, -0.12, 0.8]), 10, 4, 'rgba(176,176,166,0.6)'); // the cheekbones, catching the light
      blot(g, ...at([side * 0.48, -0.47, 0.74]), 15, 11, 'rgba(10,9,13,1)'); // the cheeks fallen in under them
      blot(g, ...at([side * 0.5, -0.45, 0.72]), 8, 6, 'rgba(10,9,13,1)');
      blot(g, ...at([side * 0.85, 0.3, 0.45]), 13, 10, 'rgba(30,30,40,0.7)'); // the temples
      blot(g, ...at([side * 0.66, -0.7, 0.3]), 12, 4, 'rgba(30,30,36,0.6)'); // under the jaw
      blot(g, ...at([side * 0.98, 0.02, -0.05]), 6, 6, 'rgba(126,94,94,0.6)'); // the ears
      fold(g, at([side * 0.12, -0.3, 0.95]), at([side * 0.36, -0.62, 0.72])); // the lines down to the mouth
      vein(g, at([side * 0.82, 0.45, 0.45]), side);
    }
    const [nx, ny] = at([0, -0.08, 1]);
    g.fillStyle = 'rgba(170,170,160,0.6)'; // the ridge of the nose
    g.fillRect(nx - 1, ny - 12, 2, 18);
    g.fillStyle = '#241c1c'; // nostrils
    g.fillRect(nx - 5, ny + 9, 3, 1);
    g.fillRect(nx + 2, ny + 9, 3, 1);
    stubble(g, at, random);
    blot(g, ...at([0, -0.6, 0.8]), 30, 13, 'rgba(36,18,24,0.95)'); // the lips drawn back, dark and thin
    stitchedEye(g, ...at([0.32, 0.06, 0.95]));
    scar(g, ...at([-0.1, 0.3, 0.95]));
    hair(g, w, h, random);
  });
}

function fold(g, [x0, y0], [x1, y1]) {
  g.strokeStyle = 'rgba(30,26,30,0.7)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(x0, y0);
  g.quadraticCurveTo(x1, y0 + (y1 - y0) * 0.3, x1, y1);
  g.stroke();
}

function vein(g, [x, y], side) {
  g.strokeStyle = 'rgba(70,82,110,0.7)';
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x + side * 3, y + 5);
  g.lineTo(x + side * 1, y + 10);
  g.lineTo(x + side * 4, y + 14);
  g.stroke();
}

// Grey stubble over the jaw, the chin and the upper lip.
function stubble(g, at, random) {
  const [cx, cy] = at([0, -0.62, 0.78]);
  for (let i = 0; i < 260; i++) {
    const x = cx + (random() - 0.5) * 50, y = cy + random() * 22 - 4;
    if (Math.abs(x - cx) < 14 && y < cy + 10) continue; // not over the mouth
    g.fillStyle = 'rgba(60,64,72,0.5)';
    g.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
}

// His left eye, sewn shut: the lid swollen and sore, the seam, thick black
// stitches across it (bold enough to read at the game's resolution).
function stitchedEye(g, x, y) {
  blot(g, x, y, 11, 6, 'rgba(160,70,70,0.5)');
  g.fillStyle = '#c8a49c';
  g.beginPath();
  g.ellipse(x, y, 9, 3.5, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#100606';
  g.fillRect(Math.round(x - 9), Math.round(y), 18, 2);
  [-7, -3, 1, 5].forEach((dx) => {
    g.fillRect(Math.round(x + dx), Math.round(y - 3), 2, 3);
    g.fillRect(Math.round(x + dx + 1), Math.round(y + 1), 2, 3);
  });
}

// An old surgical scar from his right brow up into the hair, stitched.
function scar(g, x, y) {
  g.fillStyle = 'rgba(160,128,124,0.9)';
  g.fillRect(Math.round(x), Math.round(y - 30), 2, 30);
  g.fillStyle = '#2a1a18';
  for (let k = -28; k < 0; k += 4) g.fillRect(Math.round(x - 1), Math.round(y + k), 4, 1);
}

// Thin greasy hair combed straight back from a high forehead, grey-black,
// the scalp showing through at the front.
function hair(g, w, h, random) {
  for (let x = 0; x < w; x++) {
    const fromFront = Math.abs(x - w / 2) / (w / 2); // 0 at the face, 1 at the back
    const line = fromFront < 0.3 ? 38 + fromFront * 20 : 44 + (fromFront - 0.3) * 56; // down to the nape
    if (fromFront < 0.3 && random() < 0.2) continue; // the scalp between the strands
    const n = Math.floor(random() * 14);
    const grey = x % 5 === 0 ? 30 : 0; // a grey strand
    g.fillStyle = `rgb(${34 + n + grey},${33 + n + grey},${30 + n + grey})`;
    g.fillRect(x, 0, 1, Math.round(line - random() * 4));
  }
  g.strokeStyle = '#26241f'; // a few long strands fallen over the forehead
  [[-9, 22], [-3, 30], [6, 18], [11, 26]].forEach(([dx, length]) => {
    g.beginPath();
    g.moveTo(w / 2 + dx, 34);
    g.quadraticCurveTo(w / 2 + dx * 1.3, 34 + length * 0.5, w / 2 + dx * 1.1 + 2, 34 + length);
    g.stroke();
  });
}

// The teeth: long, yellowed, the gums drawn back off them, the mouth dark
// at the corners and between the rows.
function teethTexture() {
  const random = seeded(17);
  return canvasTexture(48, 16, (g, w, h) => {
    g.fillStyle = '#0e0606';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#5e3236'; // the gums
    g.fillRect(4, 1, w - 8, 2);
    g.fillRect(6, h - 3, w - 12, 2);
    for (let x = 5; x < w - 5; x += 4) {
      const shade = 176 + Math.floor(random() * 30) - Math.abs(x - w / 2);
      g.fillStyle = `rgb(${shade},${shade - 10},${shade - 46})`;
      g.fillRect(x, 3, 3, Math.abs(x - w / 2) < 8 ? 6 : 5);
      if (x > 6 && x < w - 8) g.fillRect(x + 1, 9, 3, 4);
    }
  });
}

// Old dressing, yellowed, wound twice; a faint brown seep over the right eye.
function bandageTexture() {
  const random = seeded(7);
  return canvasTexture(64, 16, (g, w, h) => {
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const n = Math.floor(random() * 16);
        g.fillStyle = `rgb(${196 + n},${188 + n},${160 + n})`;
        g.fillRect(x, y, 1, 1);
      }
    }
    g.fillStyle = 'rgba(110,100,80,0.5)';
    for (let x = 0; x < w; x += 5) g.fillRect(x, 0, 1, h);
    g.fillRect(0, 7, w, 1); // the edge of the second turn
    g.fillStyle = 'rgba(60,50,40,0.8)';
    g.fillRect(0, 0, w, 1); // its edges, grimy
    g.fillRect(0, h - 1, w, 1);
    blot(g, w * 0.447, h * 0.5, 5, 4, 'rgba(110,70,40,0.55)');
  });
}

const LOOSE = 0.5; // how far the bandage has slipped (down on his left)
const bandageUp = (around) => -0.06 - LOOSE * Math.sin(around);

export function venn(t) {
  const head = sculptedHead(0.112, BUMPS, { scale: [0.72, 1.12, 0.98], width: 32, height: 22 });
  const skull = new THREE.Mesh(head.geometry, materialFor(faceTexture()));
  const patch = (fn, options, texture, material = {}) => new THREE.Mesh(headPatch(head, fn, options), materialFor(texture, { side: THREE.DoubleSide, ...material }));
  const teeth = patch((s, u) => [-0.45 + 0.9 * s, -0.74 + 0.28 * u], { columns: 12, rows: 1, out: 0.003 }, teethTexture());
  const bandage = patch((s, u) => {
    const around = -Math.PI + s * Math.PI * 2;
    return [around, bandageUp(around) + (u - 0.5) * 0.42];
  }, { columns: 36, rows: 2, out: 0.008 }, bandageTexture());
  const end = head.at(towards(1.45, bandageUp(1.45)), 0.01);
  const loose = new THREE.Mesh(strapGeometry([[end.x, end.y, end.z], [end.x + 0.012, end.y - 0.07, end.z + 0.02], [end.x + 0.006, end.y - 0.15, end.z + 0.035]], 0.03, 0.003, { across: [0, 0, 1] }), materialFor(bandageTexture(), { side: THREE.DoubleSide }));
  return new THREE.Group().add(skull, teeth, bandage, loose);
}
