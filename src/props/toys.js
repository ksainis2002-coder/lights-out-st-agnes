// The children's things for the dorms and playroom (owner request
// 2026-10-14): shoes under beds, clothes left on chairs, toys that are not
// part of any puzzle (no balls, dolls, tops or small horses that could be
// mistaken for the toys to return), a big rocking horse, a washstand.
// Origin on the floor.
import * as THREE from 'three';
import { box, materialFor } from './parts.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

function mesh(geometry, texture, options) {
  return new THREE.Mesh(geometry, materialFor(texture, options));
}

// A pair of small scuffed shoes, toes out (from under a bed).
function shoes(t, { colour = '#2a2018' } = {}) {
  const shoe = (x, turn) => {
    const s = group(box(t.paintedWood, [0.08, 0.06, 0.18], [0, 0, 0], { color: colour }), box(t.paintedWood, [0.07, 0.03, 0.06], [0, 0.06, -0.05], { color: colour }));
    s.position.x = x;
    s.rotation.y = turn;
    return s;
  };
  return group(shoe(-0.06, 0.12), shoe(0.06, -0.2));
}

// Clothes: a folded jumper and shorts on a seat, or a cardigan hung over a chair back.
function clothes(t, { hung = false, colour = '#5a5a7a' } = {}) {
  if (hung) {
    const cardigan = box(t.sheet, [0.36, 0.3, 0.04], [0, 0.66, -0.17], { color: colour });
    return group(cardigan, box(t.sheet, [0.38, 0.05, 0.08], [0, 0.93, -0.19], { color: colour }));
  }
  return group(
    box(t.sheet, [0.3, 0.05, 0.24], [0, 0, 0], { color: colour }),
    box(t.sheet, [0.26, 0.04, 0.2], [0.01, 0.05, 0.01], { color: '#4a4a44' }),
    box(t.sheet, [0.22, 0.02, 0.06], [0, 0.09, 0.05], { color: '#d8d8d0' }), // a folded vest on top
  );
}

// Worn teddy bear sitting up (on a pillow, a chair or the floor).
function teddy(t, { colour = '#8a6a44' } = {}) {
  const fur = { color: colour };
  const ball = (r, [x, y, z]) => {
    const m = mesh(new THREE.SphereGeometry(r, 7, 5), t.mattress, fur);
    m.position.set(x, y, z);
    return m;
  };
  return group(
    ball(0.09, [0, 0.09, 0]), ball(0.065, [0, 0.22, 0.01]),
    ball(0.025, [-0.05, 0.28, 0]), ball(0.025, [0.05, 0.28, 0]),
    ball(0.03, [-0.08, 0.13, 0.03]), ball(0.03, [0.08, 0.13, 0.03]),
    ball(0.035, [-0.05, 0.02, 0.07]), ball(0.035, [0.05, 0.02, 0.07]),
    box(t.sheet, [0.02, 0.02, 0.01], [-0.022, 0.235, 0.07], { color: '#101010' }), // one button eye, one missing
  );
}

// Wooden toy train: engine and two trucks.
function toyTrain(t) {
  const car = (x, colour, tall) => group(
    box(t.paintedWood, [0.16, tall ? 0.12 : 0.07, 0.09], [x, 0.03, 0], { color: colour }),
    ...[-0.05, 0.05].map((dx) => {
      const wheel = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.1, 6), t.paintedWood, { color: '#2a2a2a' });
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x + dx, 0.025, 0);
      return wheel;
    }),
  );
  return group(car(0, '#8a2a22', true), car(0.19, '#2a4a7a', false), car(0.37, '#3a6a3a', false));
}

// Tin drum with its sticks.
function tinDrum(t) {
  const drum = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 10), t.iron, { color: '#9a3a2a' });
  drum.position.y = 0.05;
  const top = mesh(new THREE.CircleGeometry(0.095, 10), t.sheet, { color: '#d8d0b8' });
  top.rotation.x = -Math.PI / 2;
  top.position.y = 0.101;
  const stick = (x, turn) => {
    const s = box(t.paintedWood, [0.012, 0.012, 0.22], [x, 0, 0.16], { color: '#c8b080' });
    s.rotation.y = turn;
    return s;
  };
  return group(drum, top, stick(-0.03, 0.3), stick(0.04, -0.2));
}

// Rocking horse on curved rockers: dapple-grey body, red saddle, the neck
// rising at the front (+x) to a lowered head, paint worn off the saddle.
function rockingHorse(t) {
  const grey = { color: '#c8c4bc' };
  const dark = { color: '#3a2a1a' };
  // Each rocker is a shallow arc of a 0.9 m circle whose lowest point touches the floor.
  const rocker = (z) => {
    const r = mesh(new THREE.TorusGeometry(0.9, 0.035, 4, 12, 1.15), t.paintedWood, { color: '#7a2a1e' });
    r.rotation.z = -Math.PI / 2 - 0.575; // centre the arc on the bottom of the circle
    r.position.set(0, 0.935, z);
    return r;
  };
  const leg = (x, z, tilt) => {
    const l = box(t.paintedWood, [0.05, 0.42, 0.05], [x, 0.1, z], grey);
    l.rotation.z = tilt;
    return l;
  };
  const neck = box(t.paintedWood, [0.13, 0.36, 0.11], [0, 0, 0], grey);
  neck.geometry.translate(0, 0.18, 0);
  neck.position.set(0.3, 0.6, 0);
  neck.rotation.z = -0.55; // leaning forward
  const head = box(t.paintedWood, [0.26, 0.11, 0.1], [0, 0, 0], grey);
  head.position.set(0.53, 0.86, 0);
  head.rotation.z = -0.5; // nose down
  const mane = box(t.paintedWood, [0.05, 0.3, 0.12], [0, 0, 0], dark);
  mane.geometry.translate(0, 0.15, 0);
  mane.position.set(0.25, 0.64, 0);
  mane.rotation.z = -0.55;
  return group(
    rocker(-0.16), rocker(0.16),
    leg(-0.28, -0.12, 0.3), leg(-0.28, 0.12, 0.3), leg(0.28, -0.12, -0.3), leg(0.28, 0.12, -0.3),
    box(t.paintedWood, [0.72, 0.2, 0.18], [0, 0.48, 0], grey),
    box(t.paintedWood, [0.24, 0.04, 0.22], [-0.04, 0.68, 0], { color: '#8a2a20' }), // saddle
    box(t.paintedWood, [0.04, 0.22, 0.04], [-0.38, 0.42, 0], dark), // tail
    neck, head, mane,
  );
}

// Wooden toy box with its lid up and things spilling over the edge.
function toyBox(t) {
  const wood = { color: '#7a5030' };
  const lid = box(t.paintedWood, [0.7, 0.03, 0.42], [0, 0, 0.21], wood);
  lid.geometry.translate(0, 0, -0.21);
  lid.position.set(0, 0.45, -0.21);
  lid.rotation.x = -1.3;
  return group(
    box(t.paintedWood, [0.7, 0.45, 0.42], [0, 0, 0], wood),
    lid,
    box(t.sheet, [0.6, 0.05, 0.34], [0, 0.42, 0], { color: '#6a6a5a' }),
    box(t.paintedWood, [0.12, 0.12, 0.12], [0.18, 0.44, 0.05], { color: '#3a5a8a' }), // a block
    box(t.paintedWood, [0.08, 0.2, 0.06], [-0.2, 0.44, 0.02], { color: '#8a2a2a' }), // a skittle
  );
}

// Low children's table and chair.
function childTable(t) {
  const legs = [[-0.36, -0.22], [0.36, -0.22], [-0.36, 0.22], [0.36, 0.22]].map(([x, z]) => box(t.paintedWood, [0.04, 0.5, 0.04], [x, 0, z], { color: '#c8a870' }));
  return group(...legs, box(t.paintedWood, [0.8, 0.03, 0.5], [0, 0.5, 0], { color: '#d8b880' }));
}

function childChair(t) {
  const c = { color: '#a03a2a' };
  const legs = [[-0.12, -0.12], [0.12, -0.12], [-0.12, 0.12], [0.12, 0.12]].map(([x, z]) => box(t.paintedWood, [0.03, 0.28, 0.03], [x, 0, z], c));
  return group(...legs, box(t.paintedWood, [0.28, 0.03, 0.28], [0, 0.28, 0], c), box(t.paintedWood, [0.28, 0.28, 0.03], [0, 0.31, -0.125], c));
}

// Washstand: a little table with an enamel jug standing in its basin (back to the wall).
function washstand(t) {
  const legs = [[-0.27, 0.05], [0.27, 0.05], [-0.27, 0.35], [0.27, 0.35]].map(([x, z]) => box(t.paintedWood, [0.04, 0.75, 0.04], [x, 0, z]));
  const basin = mesh(new THREE.CylinderGeometry(0.17, 0.12, 0.09, 10), t.sheet, { color: '#e0e4dc' });
  basin.position.set(0, 0.8, 0.2);
  const jug = mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.22, 8), t.sheet, { color: '#d8dcd4' });
  jug.position.set(0, 0.93, 0.2);
  return group(...legs, box(t.paintedWood, [0.6, 0.04, 0.4], [0, 0.75, 0.2]), basin, jug, box(t.sheet, [0.3, 0.02, 0.2], [0, 0.18, 0.2], { color: '#9a9a90' }));
}

export const TOY_PROPS = { shoes, clothes, teddy, toyTrain, tinDrum, rockingHorse, toyBox, childTable, childChair, washstand };
