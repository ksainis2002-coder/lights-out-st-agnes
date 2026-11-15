// Props for the asylum wards (0.4, the west wing): ward furniture, the
// radio, the cut chain at the door. Same conventions as catalog.js: origin on
// the floor, front facing +z.
import * as THREE from 'three';
import { box, decal, strut, materialFor, canvasTexture, numberTexture } from './parts.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

function mesh(geometry, texture, options) {
  return new THREE.Mesh(geometry, materialFor(texture, options));
}

const ENAMEL = { color: '#cfccbc' }; // chipped white enamel over iron
const RUST = { color: '#6e4a36' };

// One end rail of a ward bed: two posts, a top bar and thin uprights.
function bedRail(t, width, height, z) {
  const parts = [
    box(t.sheet, [0.04, height, 0.04], [-width / 2, 0, z], ENAMEL),
    box(t.sheet, [0.04, height, 0.04], [width / 2, 0, z], ENAMEL),
    box(t.sheet, [width, 0.04, 0.04], [0, height - 0.04, z], ENAMEL),
    box(t.sheet, [width, 0.03, 0.03], [0, 0.42, z], RUST),
  ];
  for (let i = 1; i <= 3; i++) parts.push(box(t.sheet, [0.02, height - 0.46, 0.02], [-width / 2 + (width * i) / 4, 0.44, z], ENAMEL));
  return parts;
}

// A temperature chart on a clipboard, hooked over the foot rail.
function chartTexture() {
  return canvasTexture(16, 22, (g) => {
    g.fillStyle = '#d8d0b4';
    g.fillRect(0, 0, 16, 22);
    g.fillStyle = '#5a4a3a';
    g.fillRect(4, 0, 8, 2); // the clip
    g.fillStyle = 'rgba(60,60,80,0.55)';
    for (let y = 5; y < 20; y += 3) g.fillRect(2, y, 12, 1);
    g.fillStyle = '#a03028'; // the fever line
    [[2, 15], [4, 13], [6, 14], [8, 9], [10, 7], [12, 6]].forEach(([x, y]) => g.fillRect(x, y, 2, 1));
  });
}

// Asylum ward bed, head at -z: enamelled iron rails chipped to rust, a thin
// striped mattress, a grey blanket, a chart at the foot. "straps": leather
// restraints across the mattress; "unmade": the blanket thrown back.
function wardBed(t, { number, chart = true, straps = false, unmade = false } = {}) {
  const blanket = { color: '#6c7668' };
  const parts = [
    ...bedRail(t, 0.9, 1.05, -0.98),
    ...bedRail(t, 0.9, 0.8, 0.98),
    box(t.iron, [0.86, 0.04, 1.96], [0, 0.42, 0], { color: '#8a8a80' }),
    box(t.mattress, [0.82, 0.1, 1.86], [0, 0.46, 0]),
    box(t.sheet, [0.46, 0.07, 0.3], [0, 0.56, -0.72]), // the pillow
    box(t.sheet, [0.84, unmade ? 0.09 : 0.04, unmade ? 0.9 : 1.3], [unmade ? 0.08 : 0, 0.56, unmade ? 0.45 : 0.24], blanket),
  ];
  if (!unmade) parts.push(box(t.sheet, [0.84, 0.02, 0.22], [0, 0.6, -0.42])); // the sheet turned down
  if (straps) [-0.2, 0.5].forEach((z) => parts.push(box(t.sheet, [0.9, 0.012, 0.07], [0, 0.605, z], { color: '#4a3020' })));
  if (chart) {
    const board = decal(chartTexture(), [0.18, 0.25], [0.2, 0.62, 1.005]);
    parts.push(board);
  }
  if (number) parts.push(decal(numberTexture(number), [0.2, 0.2], [0, 0.82, -0.955]));
  return group(...parts);
}

// A tall ward window: dark glass behind iron bars, a blind half down.
function barredWindow(t, { blind = 0.5, width = 1.1, height = 1.9 } = {}) {
  const parts = [decal(t.windowPane, [width, height], [0, 1.0 + height / 2, 0.02])];
  if (blind > 0) parts.push(decal(t.sheet, [width, height * blind], [0, 1.0 + height - (height * blind) / 2, 0.03], { color: '#5a5444' }));
  for (let i = 0; i < 5; i++) parts.push(box(t.iron, [0.025, height, 0.025], [-width / 2 + (width * (i + 0.5)) / 5, 1.0, 0.07]));
  parts.push(box(t.iron, [width + 0.06, 0.03, 0.03], [0, 1.0 + height * 0.5, 0.07]));
  parts.push(box(t.paintedWood, [width + 0.14, 0.05, 0.1], [0, 0.96, 0.05], { color: '#9a9684' })); // the sill
  return group(...parts);
}

// A tabletop valve radio (Nora's voice comes through these): a wooden case,
// a cloth speaker grille, a lit amber dial and two knobs. Sits on a desk.
function radioSet(t, { lit = true } = {}) {
  const dial = canvasTexture(24, 6, (g) => {
    g.fillStyle = lit ? '#ffc060' : '#3a3020';
    g.fillRect(0, 0, 24, 6);
    g.fillStyle = lit ? '#5a3000' : '#1a1408';
    for (let x = 2; x < 23; x += 3) g.fillRect(x, 1, 1, x % 6 === 2 ? 4 : 2);
    g.fillStyle = '#c02010';
    g.fillRect(15, 0, 1, 6); // the needle
  });
  return group(
    box(t.paintedWood, [0.42, 0.26, 0.2], [0, 0, 0], { color: '#5a3a24' }),
    decal(t.sheet, [0.2, 0.17], [-0.085, 0.14, 0.101], { color: '#8a7a54' }), // the grille cloth
    decal(dial, [0.15, 0.04], [0.11, 0.18, 0.101], lit ? { unlit: true } : {}),
    box(t.sheet, [0.035, 0.035, 0.02], [0.07, 0.06, 0.1], { color: '#d8cca8' }),
    box(t.sheet, [0.035, 0.035, 0.02], [0.15, 0.06, 0.1], { color: '#d8cca8' }),
    strut(t.iron, [0.18, 0.26, -0.06], [0.3, 0.72, -0.1], [0.008, 0.008]), // the aerial
  );
}

// A wooden wheelchair with cane-coloured seat and big spoked wheels.
function wheelchair(t) {
  const wood = { color: '#6a4a2e' };
  const wheel = (x) => {
    const rim = mesh(new THREE.TorusGeometry(0.3, 0.018, 4, 12), t.iron, { color: '#8a8a82' });
    rim.rotation.y = Math.PI / 2;
    rim.position.set(x, 0.32, -0.05);
    const spokes = [0, 1, 2].map((i) => {
      const spoke = box(t.iron, [0.008, 0.58, 0.012], [0, -0.29, 0], { color: '#8a8a82' });
      const pivot = group(spoke);
      pivot.position.set(x, 0.32, -0.05);
      pivot.rotation.x = (i * Math.PI) / 3;
      return pivot;
    });
    return group(rim, ...spokes);
  };
  return group(
    wheel(-0.3), wheel(0.3),
    box(t.paintedWood, [0.48, 0.04, 0.46], [0, 0.48, 0], wood),
    box(t.paintedWood, [0.48, 0.55, 0.04], [0, 0.5, -0.24], wood),
    box(t.sheet, [0.4, 0.4, 0.012], [0, 0.6, -0.215], { color: '#b89a64' }), // cane back
    box(t.paintedWood, [0.04, 0.2, 0.42], [-0.25, 0.52, 0], wood),
    box(t.paintedWood, [0.04, 0.2, 0.42], [0.25, 0.52, 0], wood),
    box(t.paintedWood, [0.4, 0.03, 0.16], [0, 0.14, 0.34], wood), // the footboard
    strut(t.iron, [-0.2, 0.48, 0.2], [-0.2, 0.16, 0.3], [0.02, 0.02]),
    strut(t.iron, [0.2, 0.48, 0.2], [0.2, 0.16, 0.3], [0.02, 0.02]),
    box(t.iron, [0.04, 0.1, 0.04], [0, 0, 0.3], { color: '#2a2a2a' }),
  );
}

// The west wing door's chain, cut and left in a heap on the step, with the
// bolt cutters that did it (red grips).
function cutChain(t) {
  const iron = { color: '#6a6a66' };
  const links = [[-0.16, 0.02, 0.2], [-0.07, 0.05, 0.9], [0.02, -0.02, 1.7], [0.1, 0.05, 0.3], [0.17, -0.03, 1.2], [0.08, 0.13, 2.2], [-0.04, 0.12, 0.6]].map(([x, z, turn]) => {
    const link = mesh(new THREE.TorusGeometry(0.035, 0.011, 4, 8), t.iron, iron);
    link.rotation.set(Math.PI / 2, 0, turn);
    link.scale.set(1.5, 1, 1);
    link.position.set(x, 0.012, z);
    return link;
  });
  const cutters = group(
    strut(t.sheet, [0, 0.02, 0], [0.42, 0.02, 0.06], [0.03, 0.03], { color: '#b02a22' }),
    strut(t.sheet, [0, 0.02, 0], [0.42, 0.02, -0.06], [0.03, 0.03], { color: '#b02a22' }),
    strut(t.iron, [0, 0.02, 0], [-0.14, 0.02, 0.025], [0.035, 0.02], iron),
    strut(t.iron, [0, 0.02, 0], [-0.14, 0.02, -0.025], [0.035, 0.02], iron),
  );
  cutters.position.set(0.32, 0, 0.3);
  cutters.rotation.y = 0.5;
  return group(...links, cutters);
}

// A glass-fronted medicine cabinet on the wall (the dispensary), rows of
// brown bottles behind the pane, a small brass number lock on the door.
function medicineCabinet(t) {
  const bottles = [];
  [1.02, 1.3, 1.58].forEach((y, row) => {
    for (let i = 0; i < 6; i++) {
      const tall = (i + row) % 3 === 0 ? 0.17 : 0.12;
      bottles.push(box(t.sheet, [0.06, tall, 0.06], [-0.3 + i * 0.12, y, 0.08], { color: i % 2 ? '#5a3418' : '#2c4a3a' }));
    }
  });
  return group(
    box(t.sheet, [0.86, 0.9, 0.2], [0, 0.98, 0], { color: '#bfc2b6' }),
    ...[1.0, 1.28, 1.56].map((y) => box(t.sheet, [0.8, 0.02, 0.16], [0, y, 0.04], { color: '#9a9e94' })),
    ...bottles,
    decal(t.windowPane, [0.8, 0.84], [0, 1.43, 0.105], { transparent: true, opacity: 0.28, color: '#a8c8d8' }),
    box(t.sheet, [0.07, 0.05, 0.03], [0.34, 1.4, 0.1], { color: '#c8a850' }), // the lock
  );
}

export const WARD_PROPS = { wardBed, barredWindow, radioSet, wheelchair, cutChain, medicineCabinet };
