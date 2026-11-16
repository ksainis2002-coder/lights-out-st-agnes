// Props for Sister M.'s room and the end of the west wing (0.4, part C): her
// kneeler, her trunk, the candle she allows herself, the stone palm, the
// boarded window, her spare habit on its peg; and what the wing leaves in
// your own room (soot, a burnt-down candle). Same conventions as catalog.js:
// origin on the floor, front facing +z; wall-hung things have their back at z = 0.
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

// A wooden kneeler: the step to kneel on, the upright, a sloped rest for the book.
function prieDieu(t) {
  const wood = { color: '#3a2618' };
  const rest = box(t.paintedWood, [0.5, 0.03, 0.26], [0, 0.8, -0.12], wood);
  rest.rotation.x = -0.35;
  return group(
    box(t.paintedWood, [0.52, 0.1, 0.34], [0, 0, 0.14], wood),
    box(t.sheet, [0.46, 0.04, 0.28], [0, 0.1, 0.14], { color: '#4a2a28' }), // the worn pad
    box(t.paintedWood, [0.5, 0.82, 0.05], [0, 0, -0.2], wood),
    rest,
  );
}

// A candle stub on a saucer; "lit": its small flame and a warm light.
function candle(t, { lit = true, height = 0.12 } = {}) {
  const wax = mesh(new THREE.CylinderGeometry(0.022, 0.024, height, 7), t.sheet, { color: '#e8dcc0' });
  wax.position.y = 0.012 + height / 2;
  const saucer = mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.012, 9), t.sheet, { color: '#8a8a82' });
  saucer.position.y = 0.006;
  const parts = [saucer, wax, box(t.sheet, [0.04, 0.01, 0.02], [0.03, 0.012, 0.01], { color: '#e8dcc0' })]; // wax run down
  if (lit) {
    const flame = mesh(new THREE.ConeGeometry(0.012, 0.045, 5), t.sheet, { unlit: true, color: '#ffe2a0' });
    flame.position.y = 0.012 + height + 0.02;
    const glow = new THREE.PointLight('#ffb866', 2.6, 4.0, 1.3);
    glow.position.y = 0.012 + height + 0.06;
    parts.push(flame, glow);
  }
  return group(...parts);
}

// The stone palm: the open palm and fingers of a statue's hand, broken at
// the wrist (statue piece 3). Lies palm up, fingers towards +z.
function stonePalm(t) {
  const stone = { color: '#a8a49a', flatShading: true };
  const fingers = [-0.033, -0.011, 0.011, 0.033].map((x, i) => {
    const finger = box(t.sheet, [0.018, 0.018, 0.075 - Math.abs(i - 1.5) * 0.01], [x, 0.008, 0.07], stone);
    finger.rotation.x = -0.18; // curled a little, as if to hold something
    return finger;
  });
  const thumb = box(t.sheet, [0.02, 0.02, 0.055], [-0.06, 0.012, 0.03], stone);
  thumb.rotation.y = 0.6;
  const palm = group(
    box(t.sheet, [0.095, 0.03, 0.09], [0, 0, 0.01], stone),
    box(t.sheet, [0.07, 0.04, 0.05], [0, 0, -0.055], { color: '#8e8a80', flatShading: true }), // the broken wrist
    ...fingers,
    thumb,
  );
  palm.scale.setScalar(1.4); // a statue's hand, bigger than life
  return palm;
}

// Her trunk at the foot of the bed: dark wood, iron bands. "open": the lid
// thrown back, folded grey cloth inside, a folded paper, a little key on a
// black ribbon.
function trunk(t, { open = false } = {}) {
  const wood = { color: '#3a2a1c' };
  const iron = { color: '#2a2a2c' };
  const lid = group( // hinged at the back
    box(t.paintedWood, [0.82, 0.05, 0.46], [0, 0, 0.23], wood),
    box(t.iron, [0.04, 0.052, 0.48], [-0.25, 0, 0.23], iron),
    box(t.iron, [0.04, 0.052, 0.48], [0.25, 0, 0.23], iron),
  );
  lid.position.set(0, 0.46, -0.23);
  lid.rotation.x = open ? -1.85 : 0;
  const parts = [
    box(t.paintedWood, [0.82, 0.44, 0.46], [0, 0.02, 0], wood),
    box(t.iron, [0.04, 0.46, 0.48], [-0.25, 0, 0], iron),
    box(t.iron, [0.04, 0.46, 0.48], [0.25, 0, 0], iron),
    box(t.sheet, [0.06, 0.06, 0.02], [0, 0.32, 0.235], { color: '#8a7a3a' }), // the lock plate
    lid,
  ];
  if (open) {
    parts.push(
      box(t.sheet, [0.76, 0.012, 0.4], [0, 0.458, 0], { color: '#55555a' }), // folded habits, filled to the brim
      box(t.sheet, [0.22, 0.006, 0.15], [-0.12, 0.47, 0.04], { color: '#d8d0b4' }), // the folded paper
      box(t.sheet, [0.02, 0.005, 0.2], [0.15, 0.471, 0.0], { color: '#141414' }), // the ribbon
      box(t.sheet, [0.04, 0.012, 0.06], [0.15, 0.472, 0.11], { color: '#d8b04a' }), // the key
    );
  }
  return group(...parts);
}

// A window with its blind pulled down and nailed shut with three boards.
function boardedWindow(t, { width = 1.1, height = 1.6 } = {}) {
  const board = { color: '#4a3a28' };
  const parts = [
    decal(t.sheet, [width, height], [0, 1.0 + height / 2, 0.02], { color: '#4e4838' }), // the blind
    box(t.paintedWood, [width + 0.14, 0.05, 0.1], [0, 0.96, 0.05], { color: '#9a9684' }),
  ];
  [0.25, 0.55, 0.85].forEach((k, i) => {
    const plank = box(t.paintedWood, [width + 0.24, 0.12, 0.03], [0, 1.0 + height * k, 0.05], board);
    plank.rotation.z = (i - 1) * 0.06;
    parts.push(plank);
    [-1, 1].forEach((side) => parts.push(box(t.iron, [0.015, 0.015, 0.02], [side * (width / 2 + 0.05), 1.06 + height * k, 0.07], { color: '#141414' })));
  });
  return group(...parts);
}

// A peg on the wall with a spare black habit hanging from it, a white collar.
function habitPeg(t) {
  const black = { color: '#18171c' };
  const habit = mesh(new THREE.CylinderGeometry(0.12, 0.3, 1.25, 7, 1, true), t.sheet, { ...black, side: THREE.DoubleSide });
  habit.position.set(0, 1.05, 0.14);
  habit.scale.z = 0.5;
  return group(
    box(t.paintedWood, [0.06, 0.06, 0.1], [0, 1.72, 0.05], { color: '#3a2618' }),
    habit,
    box(t.sheet, [0.26, 0.05, 0.12], [0, 1.64, 0.14], { color: '#c8c2b0' }),
  );
}

// Soot, spreading from where a flame has been: a ragged dark stain on a wall
// (back to the wall) or, with "ceiling", on the ceiling above.
function sootStain(t, { width = 1.6, depth = 1.2, ceiling = false, height = 3.4, y = 2.6, seed = 3 } = {}) {
  let s = seed;
  const random = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const texture = canvasTexture(32, 24, (g) => {
    g.clearRect(0, 0, 32, 24);
    for (let row = 0; row < 24; row++) {
      for (let col = 0; col < 32; col++) {
        const d = Math.hypot((col - 15.5) / 16, (row - (ceiling ? 11.5 : 4)) / (ceiling ? 12 : 20)) + (random() - 0.5) * 0.3;
        if (d < 1) {
          g.fillStyle = `rgba(${14 + random() * 10},${12 + random() * 8},${10 + random() * 6},${Math.min(0.9, (1 - d) * 1.5)})`;
          g.fillRect(col, row, 1, 1);
        }
      }
    }
  });
  if (!ceiling) return group(decal(texture, [width, depth], [0, y, 0.014], { transparent: true, depthWrite: false }));
  const stain = decal(texture, [width, depth], [0, height - 0.01, 0], { transparent: true, depthWrite: false });
  stain.rotation.x = Math.PI / 2;
  return group(stain);
}

export const SISTER_ROOM_PROPS = { prieDieu, candle, stonePalm, trunk, boardedWindow, habitPeg, sootStain };
