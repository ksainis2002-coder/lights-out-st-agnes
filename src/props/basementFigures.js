// Figures of the basement (0.5 proposal, docs/DESIGN_0.5.md; mockup stills
// only until the owner approves them): Sam Pike's ghost (faceless and unhurt
// like every ghost child) and Nora Kane, alive, strapped to the surgeon's
// table. Dr. Venn, the surgeon, is in surgeon.js. Owner notes 2026-11-17:
// Sam greyer and dimmer, plainly wet, his own clothes; Nora less blocky and
// frightened. Origin on the floor (Nora: on the table top), front facing +z.
import * as THREE from 'three';
import { box, materialFor } from './parts.js';
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

// Nora's face, kept simple (owner 2026-11-17: the drawn-on features looked
// stuck on): shadowed eye sockets and a dark open mouth, her hair fallen
// across one side of it. Head-local: the face is towards +z, her left is +x.
function noraHead(t, skin, hair) {
  const skull = mesh(new THREE.SphereGeometry(0.095, 12, 9), t.sheet, skin);
  skull.scale.set(0.9, 1.1, 0.95);
  const socket = (x) => {
    const s = mesh(new THREE.SphereGeometry(0.022, 8, 6), t.sheet, { color: '#3a2a24' });
    s.scale.set(1.2, 0.8, 0.5);
    s.position.set(x, 0.012, 0.082);
    return s;
  };
  const mouth = mesh(new THREE.SphereGeometry(0.018, 8, 6), t.sheet, { color: '#1a0c0a' });
  mouth.scale.set(1, 1.3, 0.5);
  mouth.position.set(0, -0.052, 0.082);
  const back = mesh(new THREE.SphereGeometry(0.104, 12, 7, 0, Math.PI * 2, Math.PI * 0.4, Math.PI * 0.6), t.sheet, hair);
  back.rotation.x = Math.PI / 2;
  const fringe = box(t.sheet, [0.15, 0.028, 0.05], [0, 0.068, 0.05], hair);
  const across = box(t.sheet, [0.03, 0.12, 0.012], [0.035, -0.01, 0.092], hair); // fallen across her left eye
  across.rotation.z = -0.35;
  return group(skull, socket(-0.034), socket(0.034), mouth, back, fringe, across);
}

// Nora Kane on the surgeon's table (head towards -z), fighting the straps
// (owner 2026-11-17): her back arched off the table, her head lifted and
// turned to you ("turn": -1 her right, 1 her left), her right hand pulled
// free and reaching, her left still under the strap, the fist clenched; her
// hair loose and hanging off the end of the table. A slim woman of about
// thirty in a wax jacket and jeans. Sits on the table top.
function noraStrapped(t, { turn = -1 } = {}) {
  const jacket = { color: '#55553a', flatShading: true };
  const jeans = { color: '#2a3446', flatShading: true };
  const skin = { color: '#c4a48c', flatShading: true };
  const hair = { color: '#241a14' };
  const along = (radius, length, at, scale, tilt = 0) => { // a body part lying along z
    const part = mesh(new THREE.CylinderGeometry(radius[0], radius[1], length, 10), t.sheet, scale.options);
    part.rotation.x = Math.PI / 2 - tilt;
    part.scale.set(scale.x, 1, scale.y);
    part.position.set(...at);
    return part;
  };
  const hips = along([0.12, 0.13], 0.22, [0, 0.085, 0.05], { x: 1, y: 0.68, options: jeans });
  const waist = along([0.1, 0.11], 0.2, [0, 0.1, -0.15], { x: 1, y: 0.7, options: jacket }, 0.15);
  const chest = along([0.14, 0.11], 0.32, [0, 0.17, -0.37], { x: 1, y: 0.62, options: jacket }, 0.4); // arched up off the table
  const shoulders = [-1, 1].map((side) => {
    const s = mesh(new THREE.SphereGeometry(0.055, 8, 6), t.sheet, jacket);
    s.position.set(side * 0.14, 0.23, -0.5);
    return s;
  });
  const legs = [-0.065, 0.065].flatMap((x) => [
    limb(t, [x, 0.08, 0.12], [x, 0.1, 0.5], 0.055, jeans),
    limb(t, [x, 0.1, 0.5], [x, 0.07, 0.86], 0.045, jeans),
    box(t.sheet, [0.08, 0.12, 0.08], [x, 0.03, 0.9], { color: '#3a2a20' }),
  ]);
  const left = [ // under the strap, the fist clenched
    limb(t, [0.15, 0.22, -0.5], [0.19, 0.15, -0.25], 0.038, jacket),
    limb(t, [0.19, 0.15, -0.25], [0.17, 0.09, -0.02], 0.034, jacket),
    box(t.sheet, [0.05, 0.045, 0.06], [0.17, 0.06, 0.03], skin),
  ];
  const right = [ // pulled free, reaching to you
    limb(t, [-0.15, 0.24, -0.5], [-0.3, 0.4, -0.44], 0.038, jacket),
    limb(t, [-0.3, 0.4, -0.44], [-0.42, 0.56, -0.34], 0.034, jacket),
    box(t.sheet, [0.04, 0.09, 0.07], [-0.45, 0.58, -0.32], skin),
  ];
  const neck = limb(t, [0, 0.24, -0.54], [-0.01, 0.31, -0.62], 0.038, skin);
  const faceUp = noraHead(t, skin, hair);
  faceUp.rotation.x = -Math.PI / 2 + 0.7; // lifted off the table
  const head = group(faceUp);
  head.rotation.z = -turn * 0.7; // turned towards you (her right is -x)
  head.position.set(-0.02, 0.36, -0.68);
  const hanging = [-0.05, 0, 0.05].map((x, i) => limb(t, [x, 0.3, -0.76], [x * 1.4, -0.22 - i * 0.04, -0.98], 0.018, hair));
  const straps = [[-0.4, 0.27, 0.36], [0.06, 0.19, 0.3], [0.55, 0.17, 0.2]].map(([z, y, w]) => box(t.sheet, [w, 0.02, 0.07], [0, y, z], { color: '#3a2a1c' }));
  return group(hips, waist, chest, ...shoulders, ...legs, ...left, ...right, neck, head, ...hanging, ...straps);
}

export const BASEMENT_FIGURES = { ...SURGEON_FIGURES, ghostSam, noraStrapped };
