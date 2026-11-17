// The basement under the west wing (0.5 proposal, docs/DESIGN_0.5.md; mockup
// stills only until the owner approves them): the boiler, pipes and valves,
// the flood, coal, the morgue's drawers and what lies under a sheet, the
// surgeon's table and lamp, his instruments, and Sam's tin soldier. Harm to
// children is never shown: the morgue holds adults; the children's drawers
// are empty (their name cards only). Origin on the floor, front facing +z.
import * as THREE from 'three';
import { box, decal, materialFor, canvasTexture } from './parts.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

const STEEL = { color: '#8c9094' };
const RUST = { color: '#6a4a36' };

function cylinder(t, radius, length, at, options, { axis = 'y', segments = 10 } = {}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, segments), materialFor(t.iron, options));
  if (axis === 'x') m.rotation.z = Math.PI / 2;
  if (axis === 'z') m.rotation.x = Math.PI / 2;
  m.position.set(...at);
  return m;
}

// The boiler: a riveted drum on its side, the firebox door, a flue up.
function boiler(t, { lit = false } = {}) {
  const parts = [
    cylinder(t, 0.85, 2.6, [0, 1.15, 0], RUST, { axis: 'x', segments: 14 }),
    box(t.iron, [2.4, 0.3, 1.4], [0, 0, 0], { color: '#3a3532' }), // the brick bed
    box(t.iron, [0.5, 0.42, 0.06], [-0.6, 0.55, 0.86], { color: '#2a2622' }), // firebox door
    cylinder(t, 0.16, 1.6, [0.8, 2.6, 0], RUST),
  ];
  for (let i = 0; i < 9; i++) parts.push(box(t.iron, [0.03, 0.03, 0.03], [-1.2 + i * 0.3, 1.94, 0.3], { color: '#3a2a20' }));
  if (lit) {
    parts.push(box(t.sheet, [0.4, 0.3, 0.01], [-0.6, 0.6, 0.895], { unlit: true, color: 0xff7a2a }));
    const glow = new THREE.PointLight('#ff8a3a', 2.2, 6, 1.4);
    glow.position.set(-0.6, 0.8, 1.3);
    parts.push(glow);
  }
  return group(...parts);
}

// A run of pipe along the ceiling ("height"), with a bracket every metre.
function pipeRun(t, { length = 4, height = 2.4, radius = 0.07 } = {}) {
  const parts = [cylinder(t, radius, length, [0, height, 0], RUST, { axis: 'x', segments: 8 })];
  for (let x = -length / 2 + 0.5; x < length / 2; x += 1) parts.push(box(t.iron, [0.04, 0.3, 0.04], [x, height, 0], { color: '#2a2622' }));
  return group(...parts);
}

// A wheel valve on a stub of pipe, at chest height, facing +z.
function valveWheel(t, { color = '#8a2a22' } = {}) {
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.022, 5, 12), materialFor(t.iron, { color }));
  wheel.position.set(0, 1.3, 0.2);
  return group(
    cylinder(t, 0.05, 0.2, [0, 1.3, 0.1], RUST, { axis: 'z', segments: 8 }),
    wheel,
    box(t.iron, [0.3, 0.02, 0.02], [0, 1.29, 0.2], { color }),
    box(t.iron, [0.02, 0.3, 0.02], [0, 1.15, 0.2], { color }),
  );
}

// Standing water: dark, a little see-through, "height" deep.
function floodWater(t, { width = 6, depth = 5, height = 0.45 } = {}) {
  const water = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), materialFor(t.sheet, { color: '#1c2e34', transparent: true, opacity: 0.82, depthWrite: false }));
  water.rotation.x = -Math.PI / 2;
  water.position.y = height;
  return group(water);
}

// Coal heaped against a wall, a shovel in it.
function coalHeap(t) {
  const coal = materialFor(t.stone, { color: '#1c1c1e', flatShading: true });
  const heap = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.7, 7), coal);
  heap.scale.z = 0.6;
  heap.position.y = 0.35;
  const shovel = box(t.wood, [0.04, 1.0, 0.04], [0.3, 0.3, 0.25], { color: '#5a3e28' });
  shovel.rotation.z = -0.5;
  return group(heap, shovel);
}

// A name card in a drawer's slot: typed, or blank.
function cardTexture(text) {
  return canvasTexture(48, 16, (g, w, h) => {
    g.fillStyle = '#d8d0b8';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a2622';
    g.font = '9px monospace';
    g.textAlign = 'center';
    if (text) g.fillText(text, w / 2, 12);
  });
}

// The morgue's wall of drawers: steel fronts, a handle and a card slot each.
// "cards": what is typed on them, row by row (dates, not names).
function morgueDrawers(t, { columns = 4, rows = 3, cards = [] } = {}) {
  const w = 0.62;
  const h = 0.56;
  const parts = [box(t.iron, [columns * w + 0.1, rows * h + 0.2, 0.06], [0, 0.2, 0], { color: '#5c6064' })];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const x = (c - (columns - 1) / 2) * w;
      const y = 0.3 + r * h;
      parts.push(box(t.iron, [w - 0.06, h - 0.06, 0.03], [x, y, 0.045], STEEL));
      parts.push(box(t.iron, [0.18, 0.03, 0.04], [x, y + 0.14, 0.075], { color: '#4a4e52' }));
      parts.push(decal(cardTexture(cards[r * columns + c] ?? ''), [0.15, 0.05], [x, y + 0.37, 0.062]));
    }
  }
  return group(...parts);
}

// One drawer pulled out on its rails, a sheet over an adult, the feet bare
// and a tag on a toe. Lies along +z from the wall.
function morgueTray(t) {
  const sheet = { color: '#c8c6be' };
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 1.3, 3, 8), materialFor(t.sheet, sheet));
  body.rotation.x = Math.PI / 2;
  body.scale.set(1.1, 1, 0.7);
  body.position.set(0, 1.0, 1.0);
  const skin = { color: '#9a8e84' };
  const feet = [-0.08, 0.08].map((x) => box(t.sheet, [0.08, 0.16, 0.06], [x, 0.92, 1.88], skin));
  const tag = box(t.sheet, [0.06, 0.04, 0.004], [0.1, 0.98, 1.93], { color: '#e8e0c8' });
  return group(
    box(t.iron, [0.6, 0.04, 2.0], [0, 0.86, 1.0], STEEL),
    box(t.iron, [0.04, 0.04, 2.0], [-0.32, 0.9, 1.0], { color: '#4a4e52' }),
    box(t.iron, [0.04, 0.04, 2.0], [0.32, 0.9, 1.0], { color: '#4a4e52' }),
    body, ...feet, tag,
  );
}

// The surgeon's table: steel on a pedestal, leather straps across it.
function operatingTable(t, { straps = true } = {}) {
  const parts = [
    box(t.iron, [0.7, 0.06, 1.9], [0, 0.86, 0], STEEL),
    box(t.iron, [0.18, 0.84, 0.18], [0, 0, 0], { color: '#5c6064' }),
    box(t.iron, [0.5, 0.06, 0.6], [0, 0, 0], { color: '#4a4e52' }),
  ];
  if (straps) for (const z of [-0.45, 0.1, 0.6]) parts.push(box(t.sheet, [0.74, 0.03, 0.08], [0, 0.92, z], { color: '#3a2a1c' }));
  return group(...parts);
}

// The theatre's lamp: a wide dish of bulbs on a stem from the ceiling.
function theatreLamp(t, { height = 3.6, lit = true } = {}) {
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.32, 0.18, 12), materialFor(t.iron, { color: '#9ca0a4' }));
  dish.position.y = height - 1.45;
  const parts = [box(t.iron, [0.05, 1.3, 0.05], [0, height - 1.3, 0], { color: '#5c6064' }), dish];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    parts.push(box(t.sheet, [0.08, 0.02, 0.08], [Math.cos(a) * 0.24, height - 1.47, Math.sin(a) * 0.24], { unlit: true, color: lit ? 0xfff6e0 : 0x5a5a56 }));
  }
  if (lit) {
    const light = new THREE.PointLight('#fff2dc', 5, 5, 1.2); // the room's one light, on the table
    light.position.set(0, height - 1.6, 0);
    parts.push(light);
  }
  return group(...parts);
}

// A steel tray of instruments: scalpels, forceps, a saw. "held": no legs.
// "bloody": the blades dark with it, a smear across the tray (his own, in his hands).
function instrumentTray(t, { held = false, bloody = false } = {}) {
  const y = held ? 0 : 0.9;
  const blade = { color: bloody ? '#5a1a14' : '#d0d4d8' };
  const parts = [box(t.iron, [0.42, 0.025, 0.28], [0, y, 0], STEEL)];
  [-0.14, -0.07, 0, 0.07].forEach((x, i) => parts.push(box(t.iron, [0.012, 0.01, 0.18 - i * 0.02], [x, y + 0.025, 0], i % 2 ? { color: '#d0d4d8' } : blade)));
  parts.push(box(t.iron, [0.1, 0.012, 0.16], [0.14, y + 0.025, 0], { color: '#b8bcc0' }));
  if (bloody) parts.push(box(t.sheet, [0.2, 0.004, 0.1], [-0.04, y + 0.025, 0.05], { color: '#4a100c' }));
  if (!held) parts.push(box(t.iron, [0.03, 0.9, 0.03], [0, 0, 0], { color: '#4a4e52' }));
  return group(...parts);
}

// A tall glass-fronted cabinet of instruments, a dial lock on it.
function instrumentCabinet(t) {
  const parts = [
    box(t.iron, [0.9, 1.9, 0.4], [0, 0, 0], { color: '#c8ccc8' }),
    box(t.sheet, [0.8, 1.5, 0.01], [0, 0.3, 0.205], { color: '#6a7a80', transparent: true, opacity: 0.55 }),
    box(t.iron, [0.06, 0.06, 0.04], [0.32, 1.0, 0.22], { color: '#3a3e42' }),
  ];
  for (let s = 0; s < 3; s++) {
    parts.push(box(t.iron, [0.78, 0.02, 0.34], [0, 0.55 + s * 0.42, 0], STEEL));
    for (let i = 0; i < 4; i++) parts.push(box(t.iron, [0.02, 0.012, 0.16], [-0.25 + i * 0.16, 0.57 + s * 0.42, 0.02], { color: '#d0d4d8' }));
  }
  return group(...parts);
}

// Sam's tin soldier: a red coat, a black shako, paint worn to the tin.
function tinSoldier(t) {
  return group(
    box(t.sheet, [0.035, 0.008, 0.035], [0, 0, 0], { color: '#3a5a2a' }),
    box(t.sheet, [0.026, 0.035, 0.016], [0, 0.008, 0], { color: '#20242a' }),
    box(t.sheet, [0.03, 0.03, 0.02], [0, 0.043, 0], { color: '#a82a22' }),
    box(t.sheet, [0.016, 0.014, 0.016], [0, 0.073, 0], { color: '#d8b898' }),
    box(t.sheet, [0.018, 0.024, 0.018], [0, 0.087, 0], { color: '#141414' }),
    box(t.iron, [0.004, 0.06, 0.004], [0.02, 0.03, 0.006], { color: '#9a9a90' }), // the rifle
  );
}

export const BASEMENT_PROPS = { boiler, pipeRun, valveWheel, floodWater, coalHeap, morgueDrawers, morgueTray, operatingTable, theatreLamp, instrumentTray, instrumentCabinet, tinSoldier };
