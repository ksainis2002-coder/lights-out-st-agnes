// Fittings for the orphanage washroom and linen cupboard: baths, cubicles,
// mirrors, towels, shelves of linen, a mangle. Same conventions as
// catalog.js: origin on the floor, front facing +z, wall-hung things have
// their back on the wall at z = 0.
import * as THREE from 'three';
import { box, decal, materialFor, canvasTexture } from './parts.js';

const ENAMEL = { color: '#d4d8d0' };
const DIRTY_ENAMEL = { color: '#b8b4a4' };

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

function mesh(geometry, texture, options) {
  return new THREE.Mesh(geometry, materialFor(texture, options));
}

// Roll-top bath on four feet, 1.65 m long (along x), stained inside, a
// little grey water left in it.
function bathtub(t) {
  const feet = [[-0.68, -0.22], [0.68, -0.22], [-0.68, 0.22], [0.68, 0.22]].map(([x, z]) => box(t.iron, [0.08, 0.12, 0.08], [x, 0, z], { color: '#3a3a36' }));
  const walls = [
    box(t.sheet, [1.65, 0.48, 0.05], [0, 0.12, -0.335], DIRTY_ENAMEL),
    box(t.sheet, [1.65, 0.48, 0.05], [0, 0.12, 0.335], DIRTY_ENAMEL),
    box(t.sheet, [0.05, 0.48, 0.72], [-0.8, 0.12, 0], DIRTY_ENAMEL),
    box(t.sheet, [0.05, 0.48, 0.72], [0.8, 0.12, 0], DIRTY_ENAMEL),
    box(t.sheet, [1.55, 0.05, 0.62], [0, 0.12, 0], DIRTY_ENAMEL),
  ];
  const water = box(t.sheet, [1.55, 0.01, 0.62], [0, 0.24, 0], { color: '#3c443e', transparent: true, opacity: 0.85 });
  const tap = box(t.sheet, [0.12, 0.03, 0.03], [-0.76, 0.66, 0], { color: '#b8984a' });
  return group(...feet, ...walls, water, tap);
}

// A row of toilet cubicles against a wall: partitions, a high cistern with a
// pull chain in each, doors open, ajar and shut. Length = count × 0.9 m.
function toiletStalls(t, { count = 3 } = {}) {
  const wood = { color: '#8a7a5e' };
  const width = 0.9;
  const parts = [];
  const left = -(count * width) / 2;
  for (let i = 0; i <= count; i++) parts.push(box(t.paintedWood, [0.04, 1.75, 1.25], [left + i * width, 0.15, 0.625], wood));
  for (let i = 0; i < count; i++) {
    const x = left + (i + 0.5) * width;
    parts.push(box(t.sheet, [0.36, 0.38, 0.5], [x, 0, 0.3], ENAMEL)); // pan
    parts.push(box(t.sheet, [0.4, 0.03, 0.46], [x, 0.38, 0.3], { color: '#2a2622' })); // seat
    parts.push(box(t.iron, [0.42, 0.24, 0.2], [x, 1.9, 0.1], { color: '#3a3e3a' })); // cistern
    parts.push(box(t.iron, [0.02, 0.6, 0.02], [x + 0.18, 1.3, 0.2], { color: '#8a8a80' })); // chain
    parts.push(cubicleDoor(t, x, width, [1.45, 0.4, 0][i % 3], wood));
  }
  return group(...parts);
}

function cubicleDoor(t, x, width, swing, wood) {
  const hinge = new THREE.Group();
  hinge.position.set(x - width / 2 + 0.03, 0.15, 1.25);
  hinge.add(box(t.paintedWood, [width - 0.08, 1.6, 0.03], [(width - 0.08) / 2, 0, 0], wood));
  hinge.rotation.y = swing;
  return hinge;
}

// Mirror over a sink (back to the wall): spotted glass, a crack across it.
function mirrorTexture() {
  return canvasTexture(16, 24, (g, w, h) => {
    g.fillStyle = '#2a3238';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(140,150,150,0.25)'; // foxing where the silver has gone
    for (let i = 0; i < 9; i++) g.fillRect((i * 7) % w, (i * 11) % h, 2, 1);
    g.strokeStyle = 'rgba(200,210,210,0.6)';
    g.beginPath();
    g.moveTo(2, 4);
    g.lineTo(8, 11);
    g.lineTo(6, 16);
    g.lineTo(14, 21);
    g.stroke();
  });
}

function mirror(t, { height = 1.45 } = {}) {
  return group(
    box(t.paintedWood, [0.42, 0.56, 0.03], [0, height - 0.28, 0.015], { color: '#3a2c20' }),
    decal(mirrorTexture(), [0.36, 0.5], [0, height, 0.032], { unlit: true, color: '#8a9498' }),
  );
}

// Wooden peg rail with grey towels hanging from it (back to the wall).
function towelRail(t, { count = 3 } = {}) {
  const parts = [box(t.paintedWood, [count * 0.35, 0.06, 0.03], [0, 1.45, 0.015], { color: '#5a4430' })];
  for (let i = 0; i < count; i++) {
    const x = (i - (count - 1) / 2) * 0.35;
    const shade = ['#a8a8a0', '#8c8c86', '#b4b0a4'][i % 3];
    parts.push(box(t.paintedWood, [0.03, 0.03, 0.06], [x, 1.46, 0.05], { color: '#5a4430' }));
    parts.push(box(t.sheet, [0.26, 0.55 - (i % 2) * 0.12, 0.03], [x, 0.94 + (i % 2) * 0.12, 0.08], { color: shade }));
  }
  return group(...parts);
}

// Galvanised bucket with a mop leaning out of it.
function bucketMop(t) {
  const bucket = mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.3, 8, 1, true), t.iron, { color: '#8a8e8a', side: THREE.DoubleSide });
  bucket.position.y = 0.15;
  const water = mesh(new THREE.CircleGeometry(0.14, 8), t.sheet, { color: '#3c443e' });
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.22;
  const handle = box(t.paintedWood, [0.03, 1.3, 0.03], [0, 0.05, 0], { color: '#7a6040' });
  handle.rotation.z = -0.28;
  const head = box(t.sheet, [0.18, 0.14, 0.18], [0.03, 0.12, 0], { color: '#7a786c' });
  return group(bucket, water, handle, head);
}

// Iron floor drain grate (flat on the floor).
function floorDrain() {
  const grate = canvasTexture(16, 16, (g) => {
    g.fillStyle = '#1a1a18';
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#4a4a44';
    for (let i = 1; i < 16; i += 3) g.fillRect(i, 1, 1, 14);
    g.strokeStyle = '#4a4a44';
    g.strokeRect(0.5, 0.5, 15, 15);
  });
  const plate = decal(grate, [0.3, 0.3], [0, 0.003, 0]);
  plate.rotation.x = -Math.PI / 2;
  return group(plate);
}

// Wooden duckboard: a slatted mat in front of the sinks (walkable).
function duckboard(t, { length = 2.4 } = {}) {
  const parts = [];
  for (let z = -0.25; z <= 0.25; z += 0.1) parts.push(box(t.paintedWood, [length, 0.025, 0.07], [0, 0, z], { color: '#6a5034' }));
  return group(...parts);
}

// Tall slatted shelves (back to the wall) with folded sheets and blankets.
function linenShelves(t, { length = 1.6, height = 2.0, seed = 1 } = {}) {
  const wood = { color: '#7a6040' };
  const parts = [box(t.paintedWood, [0.05, height, 0.5], [-length / 2, 0, 0.25], wood), box(t.paintedWood, [0.05, height, 0.5], [length / 2, 0, 0.25], wood)];
  let s = seed;
  const random = () => (s = (s * 16807) % 2147483647) / 2147483647;
  [0.12, 0.6, 1.08, 1.56].forEach((y) => {
    for (let z = 0.05; z < 0.5; z += 0.11) parts.push(box(t.paintedWood, [length, 0.025, 0.07], [0, y, z], wood));
    for (let x = -length / 2 + 0.25; x < length / 2 - 0.15; x += 0.42) {
      const stack = 2 + Math.floor(random() * 4);
      const tint = random() < 0.3 ? '#8a7e6c' : random() < 0.5 ? '#c8c8c0' : '#b0b4ac';
      parts.push(box(t.sheet, [0.36, stack * 0.05, 0.34], [x + random() * 0.04, y + 0.025, 0.26], { color: tint }));
    }
  });
  return group(...parts);
}

// Wicker laundry basket with a grey sheet hanging over the rim.
function laundryBasket(t) {
  return group(
    box(t.paintedWood, [0.6, 0.45, 0.42], [0, 0, 0], { color: '#8a6e44' }),
    box(t.sheet, [0.56, 0.06, 0.38], [0, 0.42, 0], { color: '#b0b0a8' }),
    box(t.sheet, [0.3, 0.32, 0.02], [0.1, 0.18, 0.22], { color: '#a4a49c' }),
  );
}

// Cast-iron mangle: two A-frame sides, a pair of pale wooden rollers, a big
// spoked wheel on one side with a handle, a wooden tray under the rollers.
function mangle(t) {
  const iron = { color: '#2e2e2c' };
  const leg = (x, z, tilt) => {
    const l = box(t.iron, [0.06, 1.15, 0.06], [x, 0, z], iron);
    l.rotation.x = tilt;
    return l;
  };
  const roller = (y) => {
    const r = mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.62, 8), t.paintedWood, { color: '#d8c8a0' });
    r.rotation.z = Math.PI / 2;
    r.position.y = y;
    return r;
  };
  const wheel = mesh(new THREE.TorusGeometry(0.3, 0.025, 4, 14), t.iron, iron);
  wheel.rotation.y = Math.PI / 2;
  wheel.position.set(0.4, 1.05, 0);
  const spokes = [0, 1, 2].map((i) => {
    const hub = group(box(t.iron, [0.02, 0.6, 0.02], [0, -0.3, 0], iron));
    hub.position.set(0.4, 1.05, 0);
    hub.rotation.x = (i * Math.PI) / 3;
    return hub;
  });
  return group(
    leg(-0.32, -0.16, 0.2), leg(-0.32, 0.16, -0.2), leg(0.32, -0.16, 0.2), leg(0.32, 0.16, -0.2),
    box(t.iron, [0.7, 0.06, 0.08], [0, 1.15, 0], iron),
    roller(0.98), roller(1.13), wheel, ...spokes,
    box(t.paintedWood, [0.1, 0.035, 0.035], [0.43, 1.32, 0.08], { color: '#5a4430' }),
    box(t.paintedWood, [0.62, 0.03, 0.34], [0, 0.82, 0.16], { color: '#6a5034' }),
    box(t.sheet, [0.5, 0.02, 0.3], [0, 0.85, 0.16], { color: '#c0c0b8' }), // a sheet half through
  );
}

// Ironing board folded flat and leaning against the wall (back to the wall).
function ironingBoard(t) {
  const board = box(t.paintedWood, [0.32, 1.25, 0.03], [0, 0, 0.12], { color: '#9a8a6a' });
  board.rotation.x = -0.1;
  const cover = box(t.sheet, [0.28, 1.0, 0.01], [0, 0.18, 0.15], { color: '#b8b0a0' });
  cover.rotation.x = -0.1;
  return group(board, cover);
}

// Bare bulb on a flex hanging from the ceiling (switched off).
function hangingBulb(t, { ceiling = 2.8 } = {}) {
  const flex = box(t.iron, [0.01, 0.5, 0.01], [0, ceiling - 0.5, 0], { color: '#1a1a1a' });
  const bulb = mesh(new THREE.SphereGeometry(0.045, 6, 4), t.sheet, { color: '#9a9a90' });
  bulb.position.y = ceiling - 0.55;
  return group(flex, bulb);
}

export const UTILITY_PROPS = { bathtub, toiletStalls, mirror, towelRail, bucketMop, floorDrain, duckboard, linenShelves, laundryBasket, mangle, ironingBoard, hangingBulb };
