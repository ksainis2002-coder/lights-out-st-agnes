// Props for the school art room (0.3, part A): easels, the class painting of
// the five children (the lantern puzzle's order), a tray of paint pots and a
// line of paintings pegged up to dry. Same conventions as catalog.js: origin
// on the floor, front facing +z; wall things have their back on the wall.
import * as THREE from 'three';
import { box, decal, plane, materialFor, canvasTexture, strut } from './parts.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

function disc(g, x, y, r) {
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
}

function polygon(g, points) {
  g.beginPath();
  points.forEach(([x, y]) => g.lineTo(x, y));
  g.closePath();
  g.fill();
}

// Children's paintings in thick poster paint, 32 × 28.
const PAINTINGS = {
  house(g) {
    g.fillStyle = '#8aa8d0';
    g.fillRect(0, 0, 32, 18);
    g.fillStyle = '#5a8a44';
    g.fillRect(0, 21, 32, 7);
    g.fillStyle = '#b03a2a';
    g.fillRect(9, 13, 12, 9);
    g.fillStyle = '#4a2a1a';
    polygon(g, [[7, 13], [15, 6], [23, 13]]);
    g.fillRect(14, 17, 3, 5);
    g.fillStyle = '#e8c030';
    disc(g, 26, 5, 3);
  },
  flowers(g) {
    g.fillStyle = '#5a8a44';
    g.fillRect(0, 22, 32, 6);
    [[6, '#c83a3a'], [13, '#e8c030'], [20, '#8a3ab0'], [27, '#c83a3a']].forEach(([x, colour], i) => {
      g.fillStyle = '#3a6a2a';
      g.fillRect(x, 10 + (i % 2) * 3, 1, 13);
      g.fillStyle = colour;
      disc(g, x + 0.5, 9 + (i % 2) * 3, 3);
    });
  },
  // A child's painting of the grey lady at night: hooded, black eyes.
  lady(g) {
    g.fillStyle = '#2a3048';
    g.fillRect(0, 0, 32, 28);
    g.fillStyle = '#3a3a36';
    g.fillRect(0, 23, 32, 5);
    g.fillStyle = '#e0e0d0';
    disc(g, 26, 5, 2.5);
    g.fillStyle = '#6e6e6a';
    polygon(g, [[16, 5], [22, 24], [10, 24]]);
    disc(g, 16, 8, 3.5);
    g.fillStyle = '#101010';
    g.fillRect(14, 8, 1, 2);
    g.fillRect(17, 8, 1, 2);
  },
};

const paintingCache = new Map();
function paintingTexture(kind) {
  if (!paintingCache.has(kind)) {
    paintingCache.set(kind, canvasTexture(32, 28, (g) => {
      g.fillStyle = '#e0d8c0';
      g.fillRect(0, 0, 32, 28);
      (PAINTINGS[kind] ?? PAINTINGS.house)(g);
    }));
  }
  return paintingCache.get(kind);
}

// Wooden easel: two front legs and a back leg, a ledge, a board leaning on
// it with a child's painting.
function easel(t, { painting = 'house' } = {}) {
  const wood = { color: '#9a7a50' };
  const board = group(
    box(t.paintedWood, [0.6, 0.48, 0.02], [0, 0, 0], { color: '#6a5a44' }),
    decal(paintingTexture(painting), [0.56, 0.44], [0, 0.24, 0.011]),
  );
  board.position.set(0, 0.84, 0.05);
  board.rotation.x = -0.145; // leaning back like the legs
  return group(
    strut(t.paintedWood, [-0.3, 0, 0.12], [-0.06, 1.65, -0.12], [0.035, 0.035], wood),
    strut(t.paintedWood, [0.3, 0, 0.12], [0.06, 1.65, -0.12], [0.035, 0.035], wood),
    strut(t.paintedWood, [0, 0, -0.55], [0, 1.6, -0.14], [0.03, 0.03], wood),
    box(t.paintedWood, [0.66, 0.03, 0.08], [0, 0.81, 0.04], wood),
    board,
  );
}

// The class painting (content sheet): five children in a row holding hands,
// named underneath, left to right in the order they left. Names stay in
// Latin capitals in both languages, as on the graves. Agnes is painted paler,
// as if older than the rest, with a lamb at her feet.
const CHILDREN = [
  { name: 'AGNES', height: 30, dress: '#9a9a96', hair: '#6a5a48', faded: true },
  { name: 'TOMMY', height: 28, jumper: '#3a5a9a', hair: '#5a3a1a' },
  { name: 'MAGGIE', height: 28, dress: '#b83a30', hair: '#d8b040' },
  { name: 'SAM', height: 33, jumper: '#4a7a3a', hair: '#2a2018' },
  { name: 'EDITH', height: 23, dress: '#d8b030', hair: '#8a5a2a' },
];
const FEET = 64;
const shoulderOf = (child) => FEET - child.height + 11;

// Hands meet halfway between two children's shoulders; the end children's
// outer arms hang down.
function handHeights(i) {
  const own = shoulderOf(CHILDREN[i]);
  const meet = (other) => (other ? (own + shoulderOf(other)) / 2 + 5 : own + 9);
  return [meet(CHILDREN[i - 1]), meet(CHILDREN[i + 1])];
}

function paintChild(g, x, child, [leftHand, rightHand]) {
  const headY = FEET - child.height + 5;
  const shoulder = shoulderOf(child);
  g.globalAlpha = child.faded ? 0.55 : 1;
  g.fillStyle = '#3a2a20'; // legs
  g.fillRect(x - 3, FEET - 7, 2, 7);
  g.fillRect(x + 1, FEET - 7, 2, 7);
  if (child.dress) {
    g.fillStyle = child.dress;
    polygon(g, [[x - 3, shoulder], [x + 3, shoulder], [x + 6, FEET - 6], [x - 6, FEET - 6]]);
  } else {
    g.fillStyle = child.name === 'SAM' ? '#5a4030' : '#7a7a74'; // trousers or shorts
    g.fillRect(x - 4, FEET - 13, 8, child.name === 'SAM' ? 13 : 6);
    g.fillStyle = child.jumper;
    g.fillRect(x - 5, shoulder, 10, FEET - 13 - shoulder);
  }
  g.strokeStyle = child.dress ?? child.jumper; // arms out to the next child's hand
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(x - 15, leftHand);
  g.lineTo(x, shoulder + 1);
  g.lineTo(x + 15, rightHand);
  g.stroke();
  g.fillStyle = '#e8c8a0';
  disc(g, x, headY, 4.5);
  g.fillStyle = child.hair;
  g.beginPath();
  g.arc(x, headY, 4.6, Math.PI, Math.PI * 2);
  g.fill();
  g.fillStyle = '#1a1410';
  g.fillRect(x - 2, headY + 0.5, 1, 1);
  g.fillRect(x + 1, headY + 0.5, 1, 1);
  paintDetails(g, x, headY, child);
  g.globalAlpha = 1;
  g.fillStyle = '#2a1e14';
  g.font = 'bold 7px sans-serif';
  g.textAlign = 'center';
  g.fillText(child.name, x, 77);
}

// What tells them apart: Agnes's cap and lamb, Maggie's plaits and rope,
// Sam's cap, Edith's bow.
function paintDetails(g, x, headY, child) {
  if (child.name === 'AGNES') {
    g.fillStyle = '#e8e4d8';
    g.fillRect(x - 4, headY - 5, 8, 2);
    disc(g, x - 12, FEET - 3, 3);
    g.fillRect(x - 15, FEET - 2, 1, 2);
    g.fillRect(x - 10, FEET - 2, 1, 2);
    g.fillStyle = '#2a2420';
    g.fillRect(x - 16, FEET - 5, 2, 2);
  } else if (child.name === 'MAGGIE') {
    g.fillStyle = child.hair;
    g.fillRect(x - 6, headY, 2, 7);
    g.fillRect(x + 4, headY, 2, 7);
    g.strokeStyle = '#c8a060';
    g.lineWidth = 1;
    g.beginPath();
    g.ellipse(x, FEET + 1, 8, 2, 0, 0, Math.PI * 2);
    g.stroke();
  } else if (child.name === 'SAM') {
    g.fillStyle = '#2a3a5a';
    g.fillRect(x - 5, headY - 5, 10, 3);
    g.fillRect(x, headY - 3, 7, 1);
  } else if (child.name === 'EDITH') {
    g.fillStyle = '#d86a8a';
    polygon(g, [[x + 2, headY - 4], [x + 7, headY - 7], [x + 7, headY - 2]]);
    polygon(g, [[x + 2, headY - 4], [x - 3, headY - 7], [x - 3, headY - 2]]);
  }
}

// Drawn at twice the size (320 × 168) so the names stay readable close up.
export function classPaintingTexture() {
  return canvasTexture(320, 168, (g) => {
    const w = 160;
    const h = 84;
    g.scale(2, 2);
    g.fillStyle = '#ddd2b0';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#9ab4d4'; // sky, brushed on unevenly
    for (let x = 0; x < w; x += 4) g.fillRect(x, 0, 4, 30 + ((x * 7) % 6));
    g.fillStyle = '#f0f0ec';
    [[30, 10], [96, 7]].forEach(([x, y]) => disc(g, x, y, 5));
    g.fillStyle = '#e8c030';
    disc(g, 144, 11, 6);
    g.fillStyle = '#5a8a44';
    g.fillRect(0, 58, w, 12);
    CHILDREN.forEach((child, i) => paintChild(g, 20 + i * 30, child, handHeights(i)));
  });
}

function captionTexture(text) {
  return canvasTexture(256, 24, (g, w, h) => {
    g.fillStyle = '#e4dcc4';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a2018';
    g.font = 'italic 17px serif';
    g.textAlign = 'center';
    g.fillText(text, w / 2, 17);
  });
}

// The class painting in its frame, a card under it with the caption (in the
// game the caption comes from i18n).
function classPainting(t, { caption = '' } = {}) {
  const parts = [
    box(t.paintedWood, [1.72, 0.96, 0.04], [0, 1.0, 0.02], { color: '#5a3a20' }),
    decal(classPaintingTexture(), [1.6, 0.84], [0, 1.48, 0.042]),
  ];
  if (caption) parts.push(decal(captionTexture(caption), [0.8, 0.075], [0, 0.9, 0.01]));
  return group(...parts);
}

// A tray of paint pots and a jar of brushes (sits on a table top).
function paintPots(t) {
  const colours = ['#b83a30', '#d8b030', '#3a5a9a', '#4a8a3a', '#e8e4d8', '#2a2622'];
  const pots = colours.map((colour, i) => {
    const x = -0.2 + (i % 3) * 0.09;
    const z = -0.05 + Math.floor(i / 3) * 0.09;
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.06, 7), materialFor(t.sheet, { color: '#c8c8c0' }));
    pot.position.set(x, 0.042, z);
    return group(pot, box(t.sheet, [0.05, 0.005, 0.05], [x, 0.072, z], { color: colour }));
  });
  const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.12, 7), materialFor(t.sheet, { color: '#9ab0a8' }));
  jar.position.set(0.18, 0.072, 0);
  const brushes = [-1, 0, 1].map((i) => {
    const brush = box(t.paintedWood, [0.008, 0.2, 0.008], [0.18 + i * 0.015, 0.06, 0], { color: '#c8a060' });
    brush.rotation.z = i * 0.2;
    return brush;
  });
  return group(box(t.paintedWood, [0.55, 0.012, 0.3], [0, 0, 0], { color: '#5a4a3a' }), ...pots, jar, ...brushes);
}

// A string across the room with paintings pegged up to dry.
function paintingLine(t, { length = 3, height = 2.3, paintings = ['house', 'flowers', 'house', 'flowers'] } = {}) {
  const parts = [box(t.iron, [length, 0.01, 0.01], [0, height, 0], { color: '#b0a890' })];
  paintings.forEach((kind, i) => {
    const x = (i - (paintings.length - 1) / 2) * (length / paintings.length);
    parts.push(plane(paintingTexture(kind), [0.3, 0.26], [x, height - 0.14, 0], { side: THREE.DoubleSide }));
    parts.push(box(t.paintedWood, [0.02, 0.05, 0.03], [x, height - 0.03, 0], { color: '#8a7050' }));
  });
  return group(...parts);
}

export const ART_PROPS = { easel, classPainting, paintPots, paintingLine };
