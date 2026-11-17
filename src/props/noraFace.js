// Nora Kane's face, painted onto her sculpted head (0.5 proposal; mockup
// stills only until the owner approves her). Owner 2026-11-17: "face still
// odd"; then cartoon or doll-like, surprised rather than terrified, the hair
// like a helmet; three versions to pick from. In proportion for a woman of
// about thirty: her eyes an eye's width apart, her nose and mouth low on a
// longer lower face; no outlines, only shade and colour, at a size the game's
// resolution keeps. "look": terrified (brows up and drawn together, white
// showing over her irises, her lips stretched back off her teeth), crying
// (brows up in the middle, eyes wet and red-rimmed, tears, her mouth pulled
// down in a sob), or exhausted (heavy lids, dark under the eyes, a split lip,
// dirt and dried blood). The texture is 256 x 128: a texel is about 1.7 mm
// across and 2.5 mm down her face; the face looks down +z, at u = 0.5.
import { canvasTexture } from './parts.js';

const seeded = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// Where her features are, as directions from the head's centre (her left +x).
export const FACE = {
  eye: [0.4, 0.03, 0.92],
  brow: [0.4, 0.2, 0.9],
  noseTip: [0, -0.28, 0.96],
  mouth: [0, -0.62, 0.8],
  chin: [0, -0.88, 0.46],
};

export function onTexture(w, h, [x, y, z]) {
  const length = Math.hypot(x, y, z);
  return [w * (0.5 + Math.atan2(x, z) / (Math.PI * 2)), (h * Math.acos(y / length)) / Math.PI];
}

// The direction from the head's centre that a texel shows.
export function texelDirection(px, py, w, h) {
  const theta = (px / w - 0.5) * Math.PI * 2, phi = (py / h) * Math.PI;
  return { x: Math.sin(theta) * Math.sin(phi), y: Math.cos(phi), z: Math.cos(theta) * Math.sin(phi) };
}

export function blot(g, x, y, rx, ry, color, core = 0.3) {
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

function shape(g, color, points) {
  g.fillStyle = color;
  g.beginPath();
  points.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  g.fill();
}

const mirror = ([x, y, z], side) => [x * side, y, z];

// The bones of her face in light and shade, the same in every look.
function structure(g, at) {
  for (const side of [-1, 1]) {
    blot(g, ...at(mirror([0.4, 0.06, 0.91], side)), 14, 6, 'rgba(104,64,54,0.45)'); // the sockets, under the brow
    blot(g, ...at(mirror([0.38, 0.17, 0.9], side)), 12, 2.5, 'rgba(208,172,148,0.35)'); // the brow bone
    blot(g, ...at(mirror([0.58, -0.14, 0.8], side)), 9, 4, 'rgba(208,170,146,0.45)'); // the cheekbones, lit
    blot(g, ...at(mirror([0.56, -0.46, 0.69], side)), 10, 8, 'rgba(126,80,64,0.35)'); // under them
    blot(g, ...at(mirror([0.72, 0.3, 0.62], side)), 9, 10, 'rgba(120,78,62,0.4)'); // the temples
    blot(g, ...at(mirror([0.6, -0.74, 0.32], side)), 14, 5, 'rgba(92,56,46,0.5)'); // under the jaw
    blot(g, ...at(mirror([0.5, -0.3, 0.8], side)), 9, 6, 'rgba(190,104,92,0.22)'); // colour in her cheeks
    blot(g, ...at(mirror([0.2, -0.44, 0.92], side)), 2.5, 6, 'rgba(124,80,64,0.35)'); // from her nose to her mouth
  }
  blot(g, ...at([0, 0.42, 0.9]), 18, 7, 'rgba(204,168,144,0.35)'); // the forehead, catching the light
  blot(g, ...at([0, -0.86, 0.5]), 7, 3, 'rgba(204,166,142,0.4)'); // the chin
  nose(g, at);
}

// Light down the bridge, shade down the far side and under the tip, the nostrils.
function nose(g, at) {
  const [x, top] = at([0, 0.12, 1]);
  const [, tip] = at(FACE.noseTip);
  g.fillStyle = 'rgba(208,172,150,0.5)';
  g.fillRect(Math.round(x - 1), Math.round(top), 2, Math.round(tip - top));
  blot(g, x + 4, (top + tip) / 2 + 2, 2.5, (tip - top) / 2, 'rgba(126,82,66,0.45)');
  blot(g, x, tip, 4, 2.5, 'rgba(196,124,108,0.35)'); // the tip, a little red
  blot(g, x, tip + 4, 7, 2, 'rgba(98,60,50,0.6)'); // under it
  g.fillStyle = 'rgba(70,38,32,0.85)';
  g.fillRect(Math.round(x - 5), Math.round(tip + 3), 3, 1);
  g.fillRect(Math.round(x + 2), Math.round(tip + 3), 3, 1);
  blot(g, x, tip + 8, 2, 3, 'rgba(120,76,62,0.3)'); // the groove above the lip
}

// One eye, with no outline: the white, the brown iris and its pupil, the
// lids as skin over it. open: how far the lids part (texels); cover: how much
// of the iris the upper lid hides (0 none, -1 a line of white above it).
function eye(g, x, y, side, { open = 2.6, cover = 0.2, lower = 0, wet = false, red = 0 }) {
  const top = y - open, bottom = y + open * 0.75 - lower;
  const corner = (k) => [x + side * k * 8, y + (k > 0 ? -0.5 : 0.8)]; // outer corner a little higher
  const inner = corner(-1), outer = corner(1);
  g.save();
  g.beginPath();
  g.moveTo(...inner);
  g.quadraticCurveTo(x - side * 1, top - 1.5, ...outer);
  g.quadraticCurveTo(x + side * 1, bottom + 1, ...inner);
  g.closePath();
  g.fillStyle = red ? '#d8b8b0' : '#d6cdc2';
  g.fill();
  g.clip();
  const ix = x - side * 0.6 - 1, iy = y - cover * 2.2; // turned a little to you, on her right
  g.fillStyle = '#3c2416';
  g.beginPath();
  g.ellipse(ix, iy, 3.4, 2.4, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#5a3a24';
  g.beginPath();
  g.ellipse(ix, iy + 0.3, 2.2, 1.6, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#0c0606';
  g.fillRect(Math.round(ix - 1), Math.round(iy - 0.5), 2, 2);
  g.fillStyle = 'rgba(255,255,255,0.9)';
  g.fillRect(Math.round(ix + 1), Math.round(iy - 1.5), 1, 1); // the catchlight
  if (cover > 0) { // the upper lid lowered over the iris
    g.fillStyle = red ? '#b88070' : '#b48a74';
    g.fillRect(x - 10, top - 4, 20, 4 + cover * 2.6);
  }
  g.restore();
  g.strokeStyle = 'rgba(52,28,20,0.85)'; // lashes along the upper lid, heavier at the outer end
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(...inner);
  g.quadraticCurveTo(x - side * 1, top - 1.5 + Math.max(cover, 0) * 2.6, outer[0] + side, outer[1] - 0.5);
  g.stroke();
  blot(g, x + side * 1, top - 3, 8, 1.6, 'rgba(110,68,56,0.45)'); // the crease above
  blot(g, x, bottom + 1.5, 7, 1.3, red ? `rgba(176,72,64,${0.45 * red + 0.2})` : 'rgba(134,86,70,0.35)'); // the lower lid
  if (wet) {
    g.fillStyle = 'rgba(255,250,244,0.85)';
    g.fillRect(Math.round(x - side * 3), Math.round(bottom), 3, 1); // tears welling on the lower lid
  }
}

// A brow: a tapered stroke from the inner end (by her nose) to the outer.
function brow(g, x, y, side, [innerUp, middleUp, outerUp], pinch = 0) {
  const inner = [x - side * (6 - pinch), y - innerUp], middle = [x + side * 2, y - middleUp], outer = [x + side * 10, y - outerUp];
  g.fillStyle = 'rgba(64,36,22,0.8)';
  g.beginPath();
  g.moveTo(inner[0], inner[1] - 1.5);
  g.quadraticCurveTo(middle[0], middle[1] - 1.5, outer[0], outer[1]);
  g.quadraticCurveTo(middle[0], middle[1] + 0.6, inner[0], inner[1] + 1.2);
  g.closePath();
  g.fill();
}

// Fine lines across the middle of her forehead and between her brows.
function worry(g, at, { lines = 2, between = true }) {
  const [x, y] = at([0, 0.36, 0.93]);
  g.strokeStyle = 'rgba(122,78,62,0.5)';
  g.lineWidth = 1;
  for (let i = 0; i < lines; i++) {
    g.beginPath();
    g.moveTo(x - 9 + i, y + i * 3);
    g.quadraticCurveTo(x, y + i * 3 - 1.5, x + 9 - i, y + i * 3);
    g.stroke();
  }
  if (between) {
    g.beginPath();
    g.moveTo(x - 2, y + 7);
    g.lineTo(x - 1.5, y + 11);
    g.moveTo(x + 2, y + 7);
    g.lineTo(x + 1.5, y + 11);
    g.stroke();
  }
}

// The three looks: how her lids, brows and mouth sit, and what else shows.
const LOOKS = {
  terrified: {
    skin: [178, 138, 114],
    eyes: { open: 3.2, cover: -1, lower: 0.3 },
    brows: [[9, 9, 6], 1.5],
    worry: { lines: 2, between: true },
    mouth(g, x, y) { // stretched back off her teeth, the jaw dropped a little
      shape(g, '#985650', [[x - 17, y], [x - 8, y - 4], [x, y - 3.5], [x + 8, y - 4], [x + 17, y], [x + 9, y + 6], [x, y + 6.5], [x - 9, y + 6]]);
      shape(g, '#220808', [[x - 15, y], [x - 7, y - 2.5], [x + 7, y - 2.5], [x + 15, y], [x + 7, y + 3.5], [x - 7, y + 3.5]]);
      g.fillStyle = '#d6ccbe';
      g.fillRect(Math.round(x - 9), Math.round(y - 2.5), 18, 2); // her top teeth
      g.fillStyle = 'rgba(200,190,176,0.8)';
      g.fillRect(Math.round(x - 6), Math.round(y + 2), 12, 1.5); // and the bottom ones
    },
    extras(g, at) {
      g.fillStyle = 'rgba(255,246,236,0.55)'; // sweat on her forehead and lip
      for (const [x, y] of [[-6, 0.44], [5, 0.4], [10, 0.47]]) g.fillRect(Math.round(at([0, y, 0.9])[0] + x), Math.round(at([0, y, 0.9])[1]), 1, 1);
    },
  },
  crying: {
    skin: [182, 136, 114],
    eyes: { open: 2.3, cover: 0.35, lower: 0.6, wet: true, red: 1 },
    brows: [[9, 6, 3], 1],
    worry: { lines: 2, between: false },
    mouth(g, x, y) { // open in a sob: wide, the corners and the lower lip pulled down
      shape(g, '#a4584e', [[x - 16, y + 4], [x - 8, y - 3], [x, y - 2], [x + 8, y - 3], [x + 16, y + 4], [x + 12, y + 10], [x, y + 11], [x - 12, y + 10]]);
      shape(g, '#200606', [[x - 14, y + 4], [x - 7, y - 1], [x + 7, y - 1], [x + 14, y + 4], [x + 10, y + 7.5], [x - 10, y + 7.5]]);
      g.fillStyle = '#d8cec0';
      g.fillRect(Math.round(x - 8), Math.round(y - 1), 16, 2); // her top teeth
      blot(g, x, y + 6.5, 5, 1.5, 'rgba(150,60,60,0.7)'); // her tongue
      blot(g, x, y + 16, 5, 3, 'rgba(120,74,60,0.4)'); // her chin puckered
    },
    extras(g, at) {
      for (const side of [-1, 1]) {
        const [x, y] = at(mirror([0.5, -0.02, 0.87], side));
        for (const [colour, width, dx] of [['rgba(120,70,60,0.5)', 2.5, 0.8], ['rgba(255,248,240,0.85)', 1.2, 0]]) {
          g.strokeStyle = colour; // tears down her cheeks, wet and catching the light
          g.lineWidth = width;
          g.beginPath();
          g.moveTo(x + dx, y);
          g.quadraticCurveTo(x + side * 3 + dx, y + 12, x + side * 2 + dx, y + 26);
          g.stroke();
        }
        blot(g, ...at(mirror([0.42, 0.0, 0.9], side)), 11, 6, 'rgba(176,64,60,0.35)'); // red round her eyes
      }
      blot(g, ...at(FACE.noseTip), 4, 3, 'rgba(190,80,76,0.45)'); // her nose red from crying
    },
  },
  exhausted: {
    skin: [168, 134, 116],
    eyes: { open: 2.4, cover: 0.55, lower: 0.2 },
    brows: [[7, 6.5, 5], 0.5],
    worry: null,
    mouth(g, x, y) { // parted, dry, the lower lip split
      shape(g, '#94645c', [[x - 13, y], [x - 6, y - 3], [x, y - 2.5], [x + 6, y - 3], [x + 13, y], [x + 7, y + 4.5], [x, y + 5], [x - 7, y + 4.5]]);
      shape(g, '#2a0e0c', [[x - 10, y + 0.3], [x, y - 0.8], [x + 10, y + 0.3], [x, y + 1.6]]);
      g.fillStyle = '#5a1410';
      g.fillRect(Math.round(x + 4), Math.round(y + 1), 1, 4); // the split
      blot(g, x + 12, y + 2, 2, 1.5, 'rgba(96,24,18,0.8)'); // dried blood at the corner
    },
    extras(g, at, random) {
      for (const side of [-1, 1]) blot(g, ...at(mirror([0.42, -0.12, 0.88], side)), 9, 3, 'rgba(92,70,84,0.5)'); // dark under her eyes
      blot(g, ...at([0.58, -0.4, 0.7]), 7, 5, 'rgba(98,66,102,0.5)'); // a bruise on her jaw
      for (let i = 0; i < 6; i++) blot(g, 112 + random() * 34, 40 + random() * 46, 5 + random() * 4, 2 + random() * 2, 'rgba(70,52,42,0.28)'); // smears of dirt
      const [x, y] = at([-0.6, 0.38, 0.7]);
      g.strokeStyle = 'rgba(92,24,18,0.75)'; // the trickle from her temple, dried
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x - 1, y + 16, x + 2, y + 34);
      g.stroke();
    },
  },
};

export const NORA_LOOKS = Object.keys(LOOKS);

// The whole face for one look. hasHair(direction): where her hair grows;
// under it the skin is painted dark (any gap in the hair reads as hair) and
// shaded where the hair overhangs it.
export function noraFaceTexture(look, hasHair) {
  const style = LOOKS[look] ?? LOOKS.terrified;
  const random = seeded(23);
  return canvasTexture(256, 128, (g, w, h) => {
    const [r, gr, b] = style.skin;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const n = Math.floor(random() * 7);
        g.fillStyle = `rgb(${r + n},${gr + n},${b + n})`;
        g.fillRect(x, y, 1, 1);
      }
    }
    const at = (dir) => onTexture(w, h, dir);
    structure(g, at);
    for (const side of [-1, 1]) {
      const [ex, ey] = at(mirror(FACE.eye, side));
      eye(g, ex, ey, side, style.eyes);
      brow(g, ...at(mirror(FACE.brow, side)), side, ...style.brows);
    }
    if (style.worry) worry(g, at, style.worry);
    blot(g, ...at([0.6, -0.12, 0.79]), 6, 4, 'rgba(100,64,112,0.65)'); // the bruise on her left cheekbone
    blot(g, ...at([0.64, -0.08, 0.77]), 4, 2, 'rgba(150,140,72,0.35)');
    cut(g, ...at([-0.58, 0.44, 0.68]));
    style.mouth(g, ...at(FACE.mouth));
    style.extras(g, at, random);
    underHair(g, w, h, hasHair);
  });
}

// A cut at her right temple, by her hair, dried.
function cut(g, x, y) {
  g.strokeStyle = '#6a1c16';
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(x - 3, y);
  g.lineTo(x + 3, y - 1);
  g.stroke();
}

function underHair(g, w, h, hasHair) {
  const mask = document.createElement('canvas');
  mask.width = w;
  mask.height = h;
  const m = mask.getContext('2d');
  m.fillStyle = '#2a1410';
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) if (hasHair(texelDirection(px + 0.5, py + 0.5, w, h))) m.fillRect(px, py, 1, 1);
  }
  g.save();
  g.globalAlpha = 0.45;
  g.filter = 'blur(2px)'; // the shade the hair casts at its edge
  g.drawImage(mask, 0, 1);
  g.restore();
  g.drawImage(mask, 0, 0);
}
