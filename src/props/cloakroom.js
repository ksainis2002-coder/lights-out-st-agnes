// Props for the school cloakroom (0.3, part A): the peg rails of grey coats
// (one with a red ribbon bow, where Maggie hid the matches), boot racks and
// the lost-property crate. Same conventions as catalog.js: origin on the
// floor, front facing +z; wall things have their back on the wall.
import * as THREE from 'three';
import { box } from './parts.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

// A red ribbon tied in a big bow: two loops, a knot, two tails.
function bow(t) {
  const red = { color: '#d02a2a' };
  const loop = (side) => {
    const l = box(t.sheet, [0.1, 0.065, 0.02], [side * 0.055, -0.0325, 0], red);
    l.rotation.z = side * 0.35;
    return l;
  };
  const tail = (side) => {
    const l = box(t.sheet, [0.028, 0.13, 0.015], [side * 0.03, -0.14, 0], red);
    l.rotation.z = side * 0.25;
    return l;
  };
  return group(loop(-1), loop(1), tail(-1), tail(1), box(t.sheet, [0.04, 0.04, 0.03], [0, -0.02, 0.005], red));
}

// One grey school coat hanging from its hook by the loop (the hook is the
// origin): shoulders, the wider skirt of the coat, the hood folded down.
function coat(t, grey) {
  const cloth = { color: grey };
  const sleeve = (side) => {
    const arm = box(t.sheet, [0.07, 0.4, 0.065], [side * 0.165, -0.6, 0], cloth);
    arm.rotation.z = side * 0.08;
    return arm;
  };
  return group(
    box(t.sheet, [0.02, 0.12, 0.01], [0, -0.12, 0], { color: '#2a2a2a' }),
    box(t.sheet, [0.2, 0.12, 0.09], [0, -0.24, 0.005], cloth),
    box(t.sheet, [0.26, 0.32, 0.07], [0, -0.52, 0], cloth),
    box(t.sheet, [0.32, 0.4, 0.075], [0, -0.92, 0], cloth),
    sleeve(-1), sleeve(1),
    box(t.sheet, [0.014, 0.66, 0.006], [0, -0.9, 0.04], { color: '#2e2e30' }), // where it buttons
  );
}

// The cloakroom peg rail: grey coats on iron hooks under blank name cards,
// some pegs empty, a satchel here and there; ribbon: the peg whose coat has
// the red bow (owner Q&A 2026-10-14). Back to the wall.
function cloakPegs(t, { count = 8, ribbon = -1, empty = [], satchels = [] } = {}) {
  const greys = ['#5c5e62', '#66686a', '#525458', '#6e6e6a'];
  const spacing = 0.34;
  const parts = [box(t.paintedWood, [count * spacing + 0.1, 0.12, 0.025], [0, 1.4, 0.0125], { color: '#5a4430' })];
  for (let i = 0; i < count; i++) {
    const x = (i - (count - 1) / 2) * spacing;
    parts.push(box(t.iron, [0.02, 0.02, 0.08], [x, 1.47, 0.05], { color: '#2a2a2a' }));
    parts.push(box(t.sheet, [0.08, 0.04, 0.005], [x, 1.58, 0.003], { color: '#d8d0bc' }));
    if (empty.includes(i)) continue;
    const hanging = coat(t, greys[(i * 3) % greys.length]);
    hanging.position.set(x, 1.47, 0.09);
    hanging.rotation.z = (((i * 37) % 5) - 2) * 0.015; // a little crooked
    parts.push(hanging);
    if (i === ribbon) {
      const tied = bow(t);
      tied.position.set(x, 1.27, 0.15);
      parts.push(tied);
    }
    if (satchels.includes(i)) parts.push(box(t.paintedWood, [0.22, 0.18, 0.06], [x + 0.03, 0.85, 0.15], { color: '#6a4426' }));
  }
  return group(...parts);
}

// One black wellington boot, toe towards +z.
function boot(t) {
  const rubber = { color: '#1e1e20' };
  return group(box(t.sheet, [0.075, 0.24, 0.09], [0, 0.05, -0.055], rubber), box(t.sheet, [0.08, 0.06, 0.2], [0, 0, 0], rubber));
}

// Low slatted rack with wellington boots in pairs; one boot of the middle
// pair has fallen off onto the floor.
function bootRack(t, { length = 2.4, pairs = 5 } = {}) {
  const wood = { color: '#6a5038' };
  const parts = [
    box(t.paintedWood, [length, 0.02, 0.07], [0, 0.12, -0.08], wood),
    box(t.paintedWood, [length, 0.02, 0.07], [0, 0.12, 0.08], wood),
    ...[-1, 1].map((side) => box(t.paintedWood, [0.04, 0.12, 0.26], [side * (length / 2 - 0.03), 0, 0], wood)),
  ];
  for (let p = 0; p < pairs; p++) {
    const x = (p - (pairs - 1) / 2) * (length / pairs);
    [-0.05, 0.05].forEach((dx) => {
      const b = boot(t);
      const fallen = p === Math.floor(pairs / 2) && dx > 0;
      b.position.set(x + dx + (fallen ? 0.1 : 0), fallen ? 0.04 : 0.14, fallen ? 0.32 : 0);
      if (fallen) b.rotation.set(0, 0.6, Math.PI / 2);
      parts.push(b);
    });
  }
  return group(...parts);
}

// Lost-property crate: a striped scarf trailing over the edge, a lone mitten.
function lostProperty(t) {
  const wood = { color: '#7a5a3a' };
  const scarf = group(
    box(t.sheet, [0.1, 0.02, 0.3], [0, 0.34, -0.02], { color: '#7a2a2a' }),
    box(t.sheet, [0.1, 0.3, 0.015], [0, 0.06, 0.19], { color: '#7a2a2a' }),
    box(t.sheet, [0.1, 0.04, 0.017], [0, 0.18, 0.19], { color: '#2a3a5a' }),
  );
  scarf.position.x = 0.1;
  return group(
    box(t.paintedWood, [0.5, 0.34, 0.36], [0, 0, 0], wood),
    box(t.sheet, [0.44, 0.01, 0.3], [0, 0.335, 0], { color: '#3a342c' }),
    scarf,
    box(t.sheet, [0.08, 0.04, 0.11], [-0.12, 0.34, 0.04], { color: '#4a6a4a' }),
  );
}

export const CLOAKROOM_PROPS = { cloakPegs, bootRack, lostProperty };
