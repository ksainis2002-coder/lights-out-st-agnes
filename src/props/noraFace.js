// Nora Kane's face, painted onto her sculpted head (0.5 proposal; mockup
// stills only until the owner approves her). Owner 2026-11-17, after many
// passes: take inspiration from the young woman of another horror game the
// owner likes (in spirit only: our own face, hair and clothes), the owner
// picking two of her qualities: "a real, ordinary woman" and "simple
// natural hair". So: a believable, plain face lit the way a photograph is
// (soft light from above, soft shade under the brow, the nose, the lip and
// the jaw; nothing drawn as a line); clear, even skin with a light dusting of
// freckles; fear shown quietly, but plainly (owner: "more afraid"): her eyes
// wide and on you, the white above her irises, her brows lifted high and
// drawn in, lines across her forehead, her lips parted, her breath caught. The texture is
// 256 x 128: a texel is about 1.7 mm across and 2.5 mm down her face; the
// face looks down +z, at u = 0.5.
import { canvasTexture } from './parts.js';

const seeded = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// Where her features are, as directions from the head's centre (her left +x).
export const FACE = {
  eye: [0.4, 0.03, 0.92],
  brow: [0.4, 0.2, 0.9],
  noseTip: [0, -0.24, 0.97], // owner: smaller, shorter, softer
  mouth: [0, -0.5, 0.86], // owner: the mouth sat a little far down (now a lip's height under her nose)
  chin: [0, -0.84, 0.54],
};

const SKIN = [180, 144, 124];

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

const mirror = ([x, y, z], side) => [x * side, y, z];

// Clear skin, never quite one colour: a fine grain and faint warmer and
// cooler patches.
function paintSkin(g, w, h, [r, gr, b], random) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const n = Math.floor(random() * 7) - 3;
      g.fillStyle = `rgb(${r + n},${gr + n},${b + n})`;
      g.fillRect(x, y, 1, 1);
    }
  }
  const tones = ['rgba(196,112,98,0.08)', 'rgba(120,112,136,0.07)', 'rgba(200,176,126,0.08)'];
  for (let i = 0; i < 60; i++) blot(g, random() * w, random() * h, 5 + random() * 9, 4 + random() * 6, tones[i % 3], 0.2);
}

// The shape of her face in soft light from above, as a photograph shows it.
function lightAndShade(g, at) {
  for (const side of [-1, 1]) {
    blot(g, ...at(mirror([0.4, 0.07, 0.91], side)), 13, 6, 'rgba(120,84,72,0.38)'); // the sockets, under the brow
    blot(g, ...at(mirror([0.4, -0.08, 0.9], side)), 9, 3, 'rgba(132,112,124,0.18)'); // the thin skin under the eyes
    blot(g, ...at(mirror([0.38, 0.18, 0.9], side)), 12, 3, 'rgba(214,186,164,0.3)'); // the brow bone
    blot(g, ...at(mirror([0.54, -0.2, 0.8], side)), 12, 6, 'rgba(214,184,162,0.35)'); // the cheeks, full, round and lit
    blot(g, ...at(mirror([0.6, -0.52, 0.6], side)), 10, 7, 'rgba(132,96,82,0.18)'); // softly under them
    blot(g, ...at(mirror([0.72, 0.3, 0.62], side)), 9, 10, 'rgba(132,98,84,0.3)'); // the temples
    blot(g, ...at(mirror([0.6, -0.74, 0.32], side)), 15, 6, 'rgba(96,66,56,0.5)'); // under the jaw
    blot(g, ...at(mirror([0.5, -0.3, 0.8], side)), 8, 5, 'rgba(198,120,108,0.16)'); // a little colour in her cheeks
    blot(g, ...at(mirror([0.97, 0.0, -0.05], side)), 5, 6, 'rgba(190,110,98,0.3)'); // her ears
  }
  blot(g, ...at([0, 0.44, 0.9]), 20, 8, 'rgba(216,190,168,0.3)'); // the forehead, catching the light
  blot(g, ...at([0, -0.86, 0.5]), 7, 3, 'rgba(212,184,162,0.35)'); // the chin
  blot(g, ...at([0, -0.66, 0.75]), 9, 2.5, 'rgba(120,82,70,0.4)'); // under her lower lip
  nose(g, at);
}

// A small, soft nose: a faint light down the short bridge, soft shade down
// one side and under the round tip, the nostrils.
function nose(g, at) {
  const [x, top] = at([0, 0.04, 1]);
  const [, tip] = at(FACE.noseTip);
  blot(g, x, (top + tip) / 2 + 1, 1.5, (tip - top) / 2, 'rgba(216,190,168,0.25)', 0.5);
  blot(g, x + 3.5, (top + tip) / 2 + 3, 2, (tip - top) / 2.4, 'rgba(128,90,76,0.25)');
  blot(g, x, tip, 4.5, 3, 'rgba(206,146,128,0.22)'); // the round tip, a little warm
  blot(g, x, tip + 3.5, 6, 1.8, 'rgba(110,72,62,0.45)'); // under it
  g.fillStyle = 'rgba(92,56,48,0.6)';
  g.fillRect(Math.round(x - 4), Math.round(tip + 2.5), 3, 1);
  g.fillRect(Math.round(x + 1), Math.round(tip + 2.5), 3, 1);
  blot(g, x, tip + 6.5, 2, 2.5, 'rgba(130,90,76,0.22)'); // the groove above her lip
}

// An eye opened wide with fear, on you: the white showing above the iris, a
// hazel iris with its darker rim and the pupil, the lamp caught in it, soft
// lashes, the lid's crease, the pink inner corner, a wet rim.
function eye(g, x, y, side) {
  const open = 3.4, top = y - open, bottom = y + open * 0.7;
  const inner = [x - side * 8, y + 0.8], outer = [x + side * 8, y - 0.5];
  g.save();
  g.beginPath();
  g.moveTo(...inner);
  g.quadraticCurveTo(x - side, top - 1.5, ...outer);
  g.quadraticCurveTo(x + side, bottom + 1, ...inner);
  g.closePath();
  g.fillStyle = '#d2c8bc';
  g.fill();
  g.clip();
  blot(g, inner[0] + side * 1.6, inner[1] - 0.4, 1.8, 1.3, 'rgba(204,128,118,0.9)');
  const ix = x - side * 0.6, iy = y + 0.9; // both on you, close; white above them
  g.fillStyle = '#3e2a1c'; // the iris's rim
  g.beginPath();
  g.ellipse(ix, iy, 3.5, 2.5, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#6e5232'; // hazel
  g.beginPath();
  g.ellipse(ix, iy, 2.6, 1.8, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#0c0806';
  g.fillRect(Math.round(ix - 1), Math.round(iy - 0.5), 2, 2);
  g.fillStyle = 'rgba(255,255,255,0.9)';
  g.fillRect(Math.round(ix + 0.5), Math.round(iy - 1.5), 2, 1);
  blot(g, x, top, 9, 1.2, 'rgba(90,60,50,0.25)'); // the lid's shadow on the white
  g.restore();
  g.strokeStyle = 'rgba(58,36,26,0.65)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(...inner);
  g.quadraticCurveTo(x - side, top - 1.5, outer[0] + side, outer[1] - 0.4);
  g.stroke();
  blot(g, x + side, top - 3, 8, 1.5, 'rgba(122,84,70,0.35)'); // the crease
  blot(g, x, bottom + 1.5, 7, 1.2, 'rgba(146,98,84,0.3)'); // the lower lid
  g.fillStyle = 'rgba(255,248,242,0.3)';
  g.fillRect(Math.round(x - side * 4), Math.round(bottom + 0.4), 7, 1);
}

// A natural brow, the colour of her hair but darker, lifted high and drawn
// in at the inner end with fear.
function brow(g, x, y, side) {
  const inner = [x - side * 4.5, y - 10.5], middle = [x + side * 2, y - 9.5], outer = [x + side * 10, y - 6.5];
  g.fillStyle = 'rgba(92,64,44,0.6)';
  g.beginPath();
  g.moveTo(inner[0], inner[1] - 1.3);
  g.quadraticCurveTo(middle[0], middle[1] - 1.6, outer[0], outer[1]);
  g.quadraticCurveTo(middle[0], middle[1] + 0.5, inner[0], inner[1] + 1.1);
  g.closePath();
  g.fill();
}

// Faint lines across the middle of her forehead, from the lifted brows.
function worry(g, at) {
  const [x, y] = at([0, 0.34, 0.94]);
  g.strokeStyle = 'rgba(132,92,78,0.35)';
  g.lineWidth = 1;
  for (const k of [0, 3]) {
    g.beginPath();
    g.moveTo(x - 8 + k / 3, y + k);
    g.quadraticCurveTo(x, y + k - 1.2, x + 8 - k / 3, y + k);
    g.stroke();
  }
}

// Her lips, parted in fear, her breath caught: a fuller lower lip, the dark
// between them, her top teeth showing, the shine on her lower lip.
function lips(g, x, y) {
  g.save();
  g.filter = 'blur(0.5px)';
  g.fillStyle = '#a66e66'; // the upper lip, its bow
  g.beginPath();
  g.moveTo(x - 13, y);
  g.quadraticCurveTo(x - 6, y - 5, x, y - 3);
  g.quadraticCurveTo(x + 6, y - 5, x + 13, y);
  g.closePath();
  g.fill();
  g.fillStyle = '#b07670'; // the lower lip, dropped
  g.beginPath();
  g.moveTo(x - 12, y + 0.5);
  g.quadraticCurveTo(x, y + 11, x + 12, y + 0.5);
  g.closePath();
  g.fill();
  g.restore();
  g.fillStyle = '#240e0e'; // parted
  g.beginPath();
  g.moveTo(x - 10, y + 0.2);
  g.quadraticCurveTo(x, y - 1.4, x + 10, y + 0.2);
  g.quadraticCurveTo(x, y + 4.6, x - 10, y + 0.2);
  g.fill();
  g.fillStyle = 'rgba(214,204,192,0.8)';
  g.fillRect(Math.round(x - 5), Math.round(y - 0.6), 10, 1.5); // her top teeth
  blot(g, x - 2, y + 6, 3.5, 0.9, 'rgba(255,236,228,0.45)', 0.2);
}

// A light dusting of freckles over her nose and cheeks.
function freckles(g, at, random) {
  for (let i = 0; i < 45; i++) {
    const [x, y] = at([(random() * 2 - 1) * 0.6, -0.05 - random() * 0.28, 0.9]);
    g.fillStyle = `rgba(138,96,74,${0.12 + random() * 0.18})`;
    g.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
}

// The faint shine of sweat on her forehead and the bridge of her nose.
function sweat(g, at) {
  for (const [x, y, z, rx, ry] of [[0, 0.45, 0.89, 6, 2], [0, -0.06, 1, 1.5, 4], [0.58, -0.14, 0.8, 3, 1.5], [-0.58, -0.14, 0.8, 3, 1.5]]) {
    blot(g, ...at([x, y, z]), rx, ry, 'rgba(255,244,230,0.14)', 0.2);
  }
}

// Her face. hasHair(direction): where her hair grows; under it the skin is
// painted dark (any gap in the hair reads as hair) and shaded at its edge.
export function noraFaceTexture(hasHair) {
  const random = seeded(23);
  return canvasTexture(256, 128, (g, w, h) => {
    paintSkin(g, w, h, SKIN, random);
    const at = (dir) => onTexture(w, h, dir);
    lightAndShade(g, at);
    freckles(g, at, random);
    for (const side of [-1, 1]) {
      const lift = side > 0 ? 0.8 : 0; // no face is the same on both sides
      const [ex, ey] = at(mirror(FACE.eye, side));
      eye(g, ex, ey - lift * 0.5, side);
      const [bx, by] = at(mirror(FACE.brow, side));
      brow(g, bx, by + 8 - lift, side);
    }
    worry(g, at);
    blot(g, ...at([0.6, -0.12, 0.79]), 6, 4, 'rgba(110,80,120,0.3)'); // a bruise coming up on her left cheekbone
    const [mx, my] = at(FACE.mouth);
    g.save();
    g.translate(mx, my);
    g.transform(1, -0.04, 0, 1, 0, 0); // her mouth a little higher on her left
    g.translate(-mx, -my);
    lips(g, mx, my);
    g.restore();
    sweat(g, at);
    underHair(g, w, h, hasHair);
  });
}

// Her skin elsewhere (her neck, her hands): `flush` adds the red patches
// fear brings up on the throat; `shade` darkens the canvas bottom (under her jaw).
export function noraSkinTexture({ flush = 0, shade = 0 } = {}) {
  const random = seeded(37);
  return canvasTexture(64, 64, (g, w, h) => {
    paintSkin(g, w, h, [SKIN[0] - 6, SKIN[1] - 6, SKIN[2] - 4], random);
    for (let i = 0; i < 10 * flush; i++) blot(g, random() * w, random() * h, 5 + random() * 6, 3 + random() * 4, 'rgba(196,102,92,0.18)', 0.2);
    if (shade) {
      const gradient = g.createLinearGradient(0, h * 0.5, 0, h);
      gradient.addColorStop(0, 'rgba(80,54,46,0)');
      gradient.addColorStop(1, `rgba(80,54,46,${shade})`);
      g.fillStyle = gradient;
      g.fillRect(0, 0, w, h);
    }
  });
}

function underHair(g, w, h, hasHair) {
  const mask = document.createElement('canvas');
  mask.width = w;
  mask.height = h;
  const m = mask.getContext('2d');
  m.fillStyle = '#3a2618';
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) if (hasHair(texelDirection(px + 0.5, py + 0.5, w, h))) m.fillRect(px, py, 1, 1);
  }
  g.save();
  g.globalAlpha = 0.4;
  g.filter = 'blur(2px)'; // the shade the hair casts at its edge
  g.drawImage(mask, 0, 1);
  g.restore();
  g.drawImage(mask, 0, 0);
}
