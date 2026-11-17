// Figures of the basement (0.5 proposal, docs/DESIGN_0.5.md; mockup stills
// only until the owner approves them): Sam Pike's ghost (faceless and unhurt
// like every ghost child) and Nora Kane, alive, strapped to the surgeon's
// table. Dr. Venn, the surgeon, is in surgeon.js. Owner notes 2026-11-17:
// Sam greyer and dimmer, plainly wet, his own clothes; Nora less blocky and
// frightened. Origin on the floor (Nora: on the table top), front facing +z.
import * as THREE from 'three';
import { box, materialFor, canvasTexture } from './parts.js';
import { SURGEON_FIGURES } from './surgeon.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

function mesh(geometry, texture, options) {
  return new THREE.Mesh(geometry, materialFor(texture, options));
}

// A limb: a six-sided tube from one point to another, radius r.
function limb(t, from, to, r, options) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const tube = mesh(new THREE.CylinderGeometry(r * 0.9, r, a.distanceTo(b), 6), t.sheet, options);
  tube.position.copy(a).lerp(b, 0.5);
  tube.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize());
  return tube;
}

// Sam: a boy of ten, drowned in the boiler-room flood. The home's jersey with
// a collar, braces over it, short trousers, bare feet; all of it dark and
// clinging, his hair flat to his head, water running off his hem and his
// fingers. Faceless. Greyer and dimmer than the other children. "waterline":
// the height of the water he stands in, for the rings round his legs.
function ghostSam(t, { opacity = 0.42, waterline = 0 } = {}) {
  const ghost = { unlit: true, color: 0x8e9aa4, transparent: true, opacity, depthWrite: true, fog: false, flatShading: true };
  const wet = { ...ghost, color: 0x66747e };
  const water = { unlit: true, color: 0xa8c0d0, transparent: true, opacity: 0.5, depthWrite: false, fog: false };
  const jersey = mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.42, 8), t.sheet, wet);
  jersey.position.y = 0.95;
  jersey.scale.z = 0.66; // clinging: narrower than a dry child's
  const collar = mesh(new THREE.TorusGeometry(0.052, 0.016, 4, 10), t.sheet, wet);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 1.17;
  const shorts = mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.17, 8), t.sheet, { ...wet, color: 0x56636c });
  shorts.position.y = 0.67;
  shorts.scale.z = 0.72;
  const braces = [-0.05, 0.05].map((x) => box(t.sheet, [0.016, 0.42, 0.01], [x, 0.74, 0.072], { ...wet, color: 0x4a565e }));
  const legs = [-0.055, 0.055].flatMap((x) => [limb(t, [x, 0.6, 0], [x, 0.05, 0.01], 0.03, ghost), box(t.sheet, [0.05, 0.03, 0.1], [x, 0, 0.03], ghost)]);
  const arms = [-1, 1].map((side) => limb(t, [side * 0.12, 1.12, 0], [side * 0.15, 0.73, 0.03], 0.028, wet));
  const head = mesh(new THREE.SphereGeometry(0.098, 8, 6), t.sheet, ghost);
  head.position.y = 1.29;
  head.scale.set(0.95, 1.05, 1);
  // Hair plastered flat, a few strands stuck down over the blank face.
  const hair = mesh(new THREE.SphereGeometry(0.102, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.46), t.sheet, { ...ghost, color: 0x404c56 });
  hair.position.y = 1.3;
  const strands = [-0.03, 0.0, 0.035].map((x, i) => box(t.sheet, [0.012, 0.07 - i * 0.012, 0.006], [x, 1.25, 0.094], { ...ghost, color: 0x404c56 }));
  // Water running off the jersey's hem and his fingers, and drops falling.
  const runs = [[-0.09, 0.72, 0.2], [0.07, 0.72, 0.16], [-0.15, 0.55, 0.14], [0.15, 0.55, 0.18]].map(([x, top, length]) => box(t.sheet, [0.006, length, 0.006], [x, top - length, 0.05], water));
  const drops = [[-0.15, 0.33], [0.15, 0.3], [-0.09, 0.4], [0.04, 0.24]].map(([x, y]) => box(t.sheet, [0.012, 0.024, 0.012], [x, y, 0.06], water));
  const parts = [jersey, collar, shorts, ...braces, ...legs, ...arms, head, hair, ...strands, ...runs, ...drops];
  if (waterline > 0) {
    for (const x of [-0.055, 0.055]) {
      for (const r of [0.07, 0.13, 0.2]) {
        const ring = mesh(new THREE.RingGeometry(r, r + 0.012, 16), t.sheet, { ...water, opacity: 0.55 - r });
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(x * 1.5, waterline + 0.004, 0.01);
        parts.push(ring);
      }
    }
  }
  return group(...parts);
}

// Nora's head (owner 2026-11-17: the pieces looked stuck on, the hair
// weird): a face painted round the front of the head itself, eyes wide,
// brows drawn up, mouth open, a bruise on her left cheekbone; her hair dark
// over the top and the back, tied back. The sphere's front (+z) is u = 0.25.
function noraHeadTexture() {
  return canvasTexture(128, 64, (g, w, h) => {
    g.fillStyle = '#c4a48c';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a1e16'; // hair: the crown, and the back from ear to ear
    g.fillRect(0, 0, w, 19);
    g.fillRect(w * 0.43, 0, w * 0.57, h * 0.78);
    g.fillRect(0, 0, w * 0.07, h * 0.78);
    const cx = w * 0.25;
    g.fillStyle = '#e8e0d6'; // eyes wide open
    [-8, 8].forEach((dx) => g.fillRect(cx + dx - 4, 28, 8, 5));
    g.fillStyle = '#2a1e18';
    [-8, 8].forEach((dx) => g.fillRect(cx + dx - 1, 29, 3, 3));
    g.fillStyle = '#3a2618'; // brows, drawn up in the middle
    g.fillRect(cx - 13, 24, 8, 2);
    g.fillRect(cx + 5, 24, 8, 2);
    g.fillRect(cx - 6, 23, 2, 1);
    g.fillRect(cx + 4, 23, 2, 1);
    g.fillStyle = '#a8866e'; // the nose's shadow
    g.fillRect(cx - 1, 33, 3, 7);
    g.fillStyle = '#2a1210'; // the mouth open
    g.fillRect(cx - 4, 44, 9, 5);
    g.fillStyle = 'rgba(94,70,104,0.7)'; // the bruise
    g.fillRect(cx + 9, 34, 7, 5);
  });
}

// Nora Kane on the surgeon's table (head towards -z), fighting the straps
// (owner 2026-11-17: not doll-thin, no hands in the air, a body that bends):
// a woman of ordinary build, about thirty, in a wax jacket and jeans, built
// standing and laid down; her back lifting, her arms pulling at her sides
// under the strap, fists clenched, one knee drawn up, her head lifted and
// turned to you ("turn": -1 her right, 1 her left). Sits on the table top.
function noraStrapped(t, { turn = -1 } = {}) {
  const jacket = { color: '#55553a', flatShading: true };
  const jeans = { color: '#2a3446', flatShading: true };
  const skin = { color: '#c4a48c', flatShading: true };
  const part = (radius, height, y, options, z = 0) => {
    const m = mesh(new THREE.CylinderGeometry(radius[0], radius[1], height, 10), t.sheet, options);
    m.scale.z = 0.6;
    m.position.set(0, y, z);
    return m;
  };
  const hips = part([0.16, 0.17], 0.2, 0.91, jeans);
  const waist = part([0.14, 0.15], 0.16, 1.07, jacket, 0.01);
  const chest = part([0.19, 0.15], 0.3, 1.3, jacket, 0.03);
  const shoulders = [-1, 1].map((side) => {
    const sphere = mesh(new THREE.SphereGeometry(0.065, 8, 6), t.sheet, jacket);
    sphere.position.set(side * 0.18, 1.42, 0.02);
    return sphere;
  });
  const legs = [
    limb(t, [-0.09, 0.86, 0], [-0.09, 0.5, 0.18], 0.07, jeans), // her right knee drawn up
    limb(t, [-0.09, 0.5, 0.18], [-0.09, 0.12, 0.08], 0.055, jeans),
    box(t.sheet, [0.1, 0.13, 0.16], [-0.09, 0.0, 0.1], { color: '#3a2a20' }),
    limb(t, [0.09, 0.86, 0], [0.09, 0.47, 0.02], 0.07, jeans),
    limb(t, [0.09, 0.47, 0.02], [0.09, 0.1, 0], 0.055, jeans),
    box(t.sheet, [0.1, 0.13, 0.16], [0.09, -0.02, 0.03], { color: '#3a2a20' }),
  ];
  const arms = [-1, 1].flatMap((side) => [ // down her sides, pulling against the strap
    limb(t, [side * 0.2, 1.42, 0.02], [side * 0.26, 1.17, -0.02], 0.05, jacket),
    limb(t, [side * 0.26, 1.17, -0.02], [side * 0.24, 0.95, 0.04], 0.045, jacket),
    box(t.sheet, [0.06, 0.08, 0.07], [side * 0.24, 0.87, 0.04], skin),
  ]);
  const neck = limb(t, [0, 1.45, 0.01], [0, 1.54, 0.03], 0.045, skin);
  const skull = mesh(new THREE.SphereGeometry(0.105, 14, 10), noraHeadTexture(), { flatShading: false });
  skull.scale.set(0.9, 1.1, 0.95);
  const ponytail = limb(t, [0, 1.6, -0.08], [0, 1.4, -0.13], 0.03, { color: '#2a1e16' });
  const head = group(skull);
  head.position.set(0, 1.64, 0.04);
  head.rotation.set(0.35, turn * 0.8, 0); // lifted towards her chest, turned to you
  const body = group(hips, waist, chest, ...shoulders, ...legs, ...arms, neck, head, ponytail);
  body.rotation.x = -Math.PI / 2; // laid on her back, head towards -z
  body.position.set(0, 0.11, 0.82);
  const straps = [[-0.48, 0.23, 0.44], [-0.09, 0.22, 0.4], [0.33, 0.19, 0.34]].map(([z, y, w]) => box(t.sheet, [w, 0.02, 0.07], [0, y, z], { color: '#3a2a1c' }));
  return group(body, ...straps);
}

export const BASEMENT_FIGURES = { ...SURGEON_FIGURES, ghostSam, noraStrapped };
