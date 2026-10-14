// Props for the school music room (0.3, part A): the upright piano with
// Maggie's coloured stickers, its stool, music stands, a stave chart and a
// cupboard of percussion. Same conventions as catalog.js: origin on the
// floor, front facing +z; wall things have their back on the wall at z = 0.
import * as THREE from 'three';
import { box, decal, materialFor, canvasTexture } from './parts.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

function mesh(geometry, texture, options) {
  return new THREE.Mesh(geometry, materialFor(texture, options));
}

// Maggie's stickers on keys 1–6, left to right (content sheet). Each colour
// also has a shape, for players who can't tell the colours apart (proposal).
export const PIANO_STICKERS = [
  { colour: '#c83228', shape: 'circle' }, // red
  { colour: '#e07820', shape: 'square' }, // orange
  { colour: '#e8c828', shape: 'triangle' }, // yellow
  { colour: '#3a9a3a', shape: 'diamond' }, // green
  { colour: '#2c5ad0', shape: 'star' }, // blue
  { colour: '#8a3ab0', shape: 'cross' }, // purple
];

const SHAPE_POINTS = {
  triangle: [[0, -1], [1, 0.8], [-1, 0.8]],
  diamond: [[0, -1], [1, 0], [0, 1], [-1, 0]],
  star: Array.from({ length: 10 }, (_, i) => {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const reach = i % 2 ? 0.45 : 1;
    return [Math.cos(angle) * reach, Math.sin(angle) * reach];
  }),
  cross: [[-0.36, -1], [0.36, -1], [0.36, -0.36], [1, -0.36], [1, 0.36], [0.36, 0.36],
    [0.36, 1], [-0.36, 1], [-0.36, 0.36], [-1, 0.36], [-1, -0.36], [-0.36, -0.36]],
};

// One sticker centred on (x, y) with radius r: a round dot, or its shape.
export function drawSticker(g, sticker, x, y, r, withShape) {
  const shape = withShape ? sticker.shape : 'circle';
  g.fillStyle = sticker.colour;
  g.beginPath();
  if (shape === 'circle') g.arc(x, y, r, 0, Math.PI * 2);
  else if (shape === 'square') g.rect(x - r * 0.85, y - r * 0.85, r * 1.7, r * 1.7);
  else SHAPE_POINTS[shape].forEach(([px, py]) => g.lineTo(x + px * r, y + py * r));
  g.closePath();
  g.fill();
}

// The keys from above: 52 ivory keys, black keys in twos and threes, the
// stickers near the front of the middle octave (white keys 23–28 are the
// puzzle's keys 1–6; keys 7 and 8 are bare).
const FIRST_KEY = 23;
function keysTexture(stickers) {
  return canvasTexture(208, 24, (g, w, h) => {
    g.fillStyle = '#ddd4b8';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#5a5040';
    for (let i = 0; i < 52; i++) g.fillRect(i * 4, 0, 1, h);
    g.fillStyle = '#16120e';
    for (let i = 0; i < 51; i++) if ('ACDFG'.includes('ABCDEFG'[i % 7])) g.fillRect(i * 4 + 3, 0, 3, 14);
    if (!stickers) return;
    PIANO_STICKERS.forEach((sticker, k) => {
      g.fillStyle = sticker.colour;
      g.fillRect((FIRST_KEY + k) * 4 + 1, 17, 3, 4);
    });
  });
}

// Upright piano, back on the wall, 1.5 m wide: keys open, a hymn book on
// the music desk, brass candle sconces. stickers: Maggie's colours.
function piano(t, { stickers = true } = {}) {
  const wood = { color: '#8a5036' };
  const dark = { color: '#5a3022' };
  const brass = { color: '#c8a050' };
  const keys = decal(keysTexture(stickers), [1.22, 0.15], [0, 0.705, 0.5]);
  keys.rotation.x = -Math.PI / 2;
  const desk = group(
    box(t.sheet, [0.9, 0.28, 0.025], [0, -0.14, 0], dark),
    box(t.sheet, [0.4, 0.22, 0.01], [0, -0.12, 0.016], { color: '#e0d8c0' }),
  );
  desk.position.set(0, 0.92, 0.32);
  desk.rotation.x = -0.18; // leaning back against the case
  return group(
    box(t.sheet, [1.5, 1.3, 0.3], [0, 0, 0.15], wood), // the case
    box(t.sheet, [1.54, 0.03, 0.34], [0, 1.3, 0.16], dark), // the lid
    box(t.sheet, [1.32, 0.06, 0.28], [0, 0.64, 0.44], dark), // the key bed
    box(t.sheet, [1.24, 0.05, 0.08], [0, 0.7, 0.34], dark), // the fallboard, folded back
    ...[-1, 1].map((side) => box(t.sheet, [0.08, 0.13, 0.28], [side * 0.66, 0.64, 0.44], wood)),
    ...[-1, 1].map((side) => box(t.sheet, [0.07, 0.64, 0.07], [side * 0.62, 0, 0.54], wood)),
    ...[-0.07, 0.07].map((x) => box(t.sheet, [0.04, 0.025, 0.12], [x, 0.05, 0.34], brass)), // pedals
    ...[-1, 1].map((side) => box(t.sheet, [0.02, 0.02, 0.08], [side * 0.6, 0.98, 0.32], brass)),
    ...[-1, 1].map((side) => box(t.sheet, [0.03, 0.08, 0.03], [side * 0.6, 1.0, 0.36], { color: '#e8e0c8' })),
    keys,
    desk,
  );
}

// Round piano stool on four legs.
function pianoStool(t) {
  const seat = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.06, 10), t.paintedWood, { color: '#4a2a2a' });
  seat.position.y = 0.5;
  const legs = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z]) => box(t.paintedWood, [0.04, 0.47, 0.04], [x * 0.1, 0, z * 0.1], { color: '#3a2016' }));
  return group(seat, ...legs);
}

// Sheet music: staves of five lines with a scatter of notes (no words).
function staveTexture(width, height, staves) {
  return canvasTexture(width, height, (g, w, h) => {
    g.fillStyle = '#ddd4bc';
    g.fillRect(0, 0, w, h);
    const gap = Math.floor((h - 4) / staves);
    for (let s = 0; s < staves; s++) {
      const top = 3 + s * gap;
      g.fillStyle = '#6a6256';
      for (let line = 0; line < 5; line++) g.fillRect(2, top + line * 2, w - 4, 1);
      g.fillStyle = '#1e1a16';
      for (let x = 8; x < w - 3; x += 5) {
        const y = top + ((x * 7 + s * 5) % 8);
        g.fillRect(x, y, 2, 2);
        g.fillRect(x + 1, y - 4, 1, 4); // the stem
      }
    }
  });
}

// Iron music stand: three feet, a rod, a tilted desk with a sheet of music.
function musicStand(t, { height = 1.1 } = {}) {
  const iron = { color: '#2a2a2c' };
  const feet = [0, 2.1, 4.2].map((angle) => {
    const foot = group(box(t.iron, [0.26, 0.02, 0.02], [0.13, 0, 0], iron));
    foot.rotation.y = angle;
    return foot;
  });
  const desk = group(
    box(t.iron, [0.48, 0.3, 0.012], [0, -0.15, 0], iron),
    decal(staveTexture(24, 24, 2), [0.36, 0.26], [0, 0, 0.008]),
  );
  desk.position.set(0, height, 0.02);
  desk.rotation.x = -0.45;
  return group(...feet, box(t.iron, [0.02, height, 0.02], [0, 0, 0], iron), desk);
}

// A teaching chart: one big stave with a clef and a scale climbing it.
function scaleChartTexture() {
  return canvasTexture(64, 32, (g, w, h) => {
    g.fillStyle = '#ddd4bc';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#4a4238';
    for (let line = 0; line < 5; line++) g.fillRect(3, 8 + line * 4, w - 6, 1);
    g.strokeStyle = '#1e1a16';
    g.lineWidth = 1.5;
    g.beginPath(); // the clef: a tall stroke with a curl round the second line
    g.moveTo(8, 4);
    g.lineTo(8, 29);
    g.arc(8, 21, 3.5, -Math.PI / 2, Math.PI * 1.4);
    g.stroke();
    g.fillStyle = '#1e1a16';
    for (let n = 0; n < 8; n++) {
      const x = 17 + n * 5.5;
      const y = 26 - n * 2;
      g.beginPath();
      g.ellipse(x, y, 2.2, 1.6, -0.4, 0, Math.PI * 2);
      g.fill();
      g.fillRect(x + 1.6, y - 9, 1, 9);
    }
  });
}

// The scale chart on the wall, on a dark board.
function staveChart(t) {
  return group(
    box(t.paintedWood, [1.02, 0.56, 0.02], [0, 1.4, 0.01], { color: '#3a2a1a' }),
    decal(scaleChartTexture(), [0.96, 0.5], [0, 1.68, 0.022]),
  );
}

// Low cupboard against the wall with the percussion on top: a drum and its
// sticks, a tambourine, a triangle.
function percussion(t) {
  const drum = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.16, 10), t.sheet, { color: '#8a2a22' });
  drum.position.set(-0.3, 0.88, 0.02);
  const skin = mesh(new THREE.CylinderGeometry(0.125, 0.125, 0.01, 10), t.sheet, { color: '#d8ccb0' });
  skin.position.set(-0.3, 0.965, 0.02);
  const tambourine = mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.04, 10), t.sheet, { color: '#c8a870' });
  tambourine.position.set(0.12, 0.82, 0.06);
  const triangle = mesh(new THREE.TorusGeometry(0.09, 0.006, 3, 3), t.sheet, { color: '#b8b8b0' });
  triangle.rotation.x = -Math.PI / 2;
  triangle.position.set(0.38, 0.81, 0.02);
  const sticks = [-0.05, 0.05].map((dx) => {
    const stick = box(t.paintedWood, [0.012, 0.012, 0.3], [-0.3 + dx, 0.97, 0.06], { color: '#c8b080' });
    stick.rotation.y = dx * 6;
    return stick;
  });
  return group(
    box(t.paintedWood, [1.1, 0.8, 0.45], [0, 0, 0], { color: '#6a4a30' }),
    box(t.paintedWood, [0.01, 0.68, 0.005], [0, 0.06, 0.226], { color: '#2a1e14' }),
    ...[-0.06, 0.06].map((x) => box(t.sheet, [0.025, 0.025, 0.02], [x, 0.45, 0.235], { color: '#b8944a' })),
    drum, skin, tambourine, triangle, ...sticks,
  );
}

export const MUSIC_PROPS = { piano, pianoStool, musicStand, staveChart, percussion };
