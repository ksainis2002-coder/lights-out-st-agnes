// Props for the sick bay and the dining hall (wing 1, 0.2 extension).
// Same conventions as catalog.js: origin on the floor, front facing +z.
import * as THREE from 'three';
import { box, decal, numberTexture } from './parts.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

// Glass-fronted medicine cabinet on legs, 0.7 × 0.35 m, 1.7 m tall.
function cabinet(t) {
  const white = { color: '#c8ccc4' };
  const legs = [[-0.31, -0.13], [0.31, -0.13], [-0.31, 0.13], [0.31, 0.13]].map(([x, z]) => box(t.iron, [0.03, 0.2, 0.03], [x, 0, z], white));
  const shelves = [0.55, 0.95, 1.35].map((y) => box(t.sheet, [0.64, 0.02, 0.3], [0, y, -0.01], white));
  const bottles = [[-0.2, 0.57], [0.05, 0.57], [0.18, 0.97], [-0.12, 1.37]].map(([x, y]) => box(t.sheet, [0.05, 0.12, 0.05], [x, y, 0], { color: '#6a5a3a' }));
  return group(
    ...legs,
    box(t.sheet, [0.7, 1.5, 0.04], [0, 0.2, -0.155], white),
    box(t.sheet, [0.04, 1.5, 0.35], [-0.33, 0.2, 0], white),
    box(t.sheet, [0.04, 1.5, 0.35], [0.33, 0.2, 0], white),
    box(t.sheet, [0.7, 0.04, 0.35], [0, 0.2, 0], white),
    box(t.sheet, [0.7, 0.04, 0.35], [0, 1.66, 0], white),
    ...shelves,
    ...bottles,
    box(t.sheet, [0.62, 1.38, 0.01], [0, 0.25, 0.17], { color: '#9ab0b0', transparent: true, opacity: 0.35 }),
  );
}

// Grey fuse box on the wall with four numbered levers (puzzle 4). The levers
// sit at x = -0.15 … 0.15, 1.3 m up; lever i is userData.levers[i].
export const FUSE_LEVERS = [-0.15, -0.05, 0.05, 0.15];
function fuseBox(t) {
  const levers = FUSE_LEVERS.map((x) => {
    const lever = box(t.sheet, [0.03, 0.1, 0.03], [x, 1.18, 0.075], { color: '#a03028' });
    return lever;
  });
  const numbers = FUSE_LEVERS.map((x, i) => decal(numberTexture(i + 1), [0.06, 0.06], [x, 1.38, 0.066]));
  const g = group(box(t.sheet, [0.44, 0.44, 0.12], [0, 1.08, 0], { color: '#8a8e88' }), ...levers, ...numbers);
  g.userData.levers = levers;
  return g;
}

// Long refectory table, 3.0 × 0.8 m, and a bench to go with it.
function longTable(t) {
  const legs = [[-1.4, -0.32], [1.4, -0.32], [-1.4, 0.32], [1.4, 0.32]].map(([x, z]) => box(t.paintedWood, [0.07, 0.72, 0.07], [x, 0, z]));
  return group(...legs, box(t.wood, [3.0, 0.05, 0.8], [0, 0.72, 0]));
}

function bench(t) {
  const legs = [-1.35, 1.35].map((x) => box(t.paintedWood, [0.05, 0.42, 0.26], [x, 0, 0]));
  return group(...legs, box(t.wood, [3.0, 0.04, 0.3], [0, 0.42, 0]));
}

// Hymn board on the wall: dark board with the numbers of tonight's hymns.
function hymnBoard(t, { numbers = [3, 1, 4, 2] } = {}) {
  const slots = numbers.map((n, i) => decal(numberTexture(n), [0.16, 0.16], [0, 1.95 - i * 0.2, 0.035]));
  return group(box(t.paintedWood, [0.32, 0.9, 0.04], [0, 1.15, 0.01], { color: '#3a2618' }), ...slots);
}

// Enamel washbasin on the wall with a brass tap that never quite stops.
function sink(t) {
  const enamel = { color: '#d8dcd4' };
  return group(
    box(t.sheet, [0.56, 0.16, 0.4], [0, 0.76, 0.2], enamel),
    box(t.sheet, [0.46, 0.02, 0.3], [0, 0.9, 0.2], { color: '#9aa4a0' }),
    box(t.iron, [0.08, 0.76, 0.08], [0, 0, 0.2], enamel),
    box(t.sheet, [0.03, 0.03, 0.14], [0, 1.02, 0.07], { color: '#b8984a' }),
    box(t.sheet, [0.03, 0.06, 0.03], [0, 0.97, 0.13], { color: '#b8984a' }),
  );
}

export const HALL_PROPS = { cabinet, fuseBox, longTable, bench, hymnBoard, sink };
