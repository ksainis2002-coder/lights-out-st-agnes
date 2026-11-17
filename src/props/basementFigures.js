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

// Nora's face, built on her head rather than painted on a flat card (owner
// 2026-11-15, on a face that looked stuck on): eyes wide, brows drawn up,
// mouth open on a breath, a bruise on her left cheekbone, a cut through her
// right brow with a line of blood from it (she is an adult). Head-local: the
// face is towards +z, her left is +x.
function noraFace(t) {
  const feature = (color, size, at, tilt = 0) => {
    const piece = box(t.sheet, size, at, { color });
    piece.rotation.z = tilt;
    return piece;
  };
  return [
    ...[-1, 1].flatMap((side) => [
      feature('#ece6dc', [0.03, 0.02, 0.01], [side * 0.033, 0.004, 0.09]), // the whites, all round
      feature('#1e1814', [0.012, 0.012, 0.006], [side * 0.033, 0.008, 0.096]),
      feature('#3a2418', [0.034, 0.008, 0.01], [side * 0.033, 0.04, 0.088], side * -0.3), // brows up at the middle
    ]),
    feature('#b8967e', [0.018, 0.034, 0.02], [0, -0.03, 0.094]), // the nose
    feature('#2a1210', [0.036, 0.022, 0.01], [0, -0.068, 0.084]), // the mouth, open
    feature('#5e4668', [0.03, 0.024, 0.006], [0.052, -0.022, 0.084]), // the bruise
    feature('#7a1410', [0.022, 0.005, 0.006], [-0.035, 0.05, 0.088]), // the cut
    feature('#7a1410', [0.004, 0.024, 0.004], [-0.028, 0.026, 0.094]), // and the blood from it
  ];
}

// Nora Kane on her back on the table (head towards -z), strapped at the
// chest, the hips and the knees, straining: her chest lifting against the
// strap, her fists clenched at her sides under it, her head turned to you
// ("turn": -1 her right, 1 her left), her hair loose and hanging off the end
// of the table. A woman of about thirty in a wax jacket and jeans.
function noraStrapped(t, { turn = -1 } = {}) {
  const jacket = { color: '#55553a', flatShading: true };
  const jeans = { color: '#2a3446', flatShading: true };
  const skin = { color: '#c4a48c', flatShading: true };
  const hair = { color: '#241a14' };
  // Shoulders wider than the waist; the chest raised a little off the table.
  const chest = mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.4, 9), t.sheet, jacket);
  chest.rotation.x = Math.PI / 2 - 0.12;
  chest.scale.x = 1.05;
  chest.scale.z = 0.62;
  chest.position.set(0, 0.13, -0.38);
  const waist = mesh(new THREE.CylinderGeometry(0.15, 0.16, 0.34, 9), t.sheet, jacket);
  waist.rotation.x = Math.PI / 2;
  waist.scale.z = 0.6;
  waist.position.set(0, 0.1, -0.02);
  const shoulders = [-1, 1].map((side) => {
    const s = mesh(new THREE.SphereGeometry(0.075, 7, 5), t.sheet, jacket);
    s.position.set(side * 0.19, 0.12, -0.53);
    return s;
  });
  const legs = [-0.08, 0.08].flatMap((x) => [
    limb(t, [x, 0.09, 0.14], [x, 0.08, 0.86], 0.068, jeans),
    box(t.sheet, [0.1, 0.14, 0.09], [x, 0.03, 0.9], { color: '#3a2a20' }),
  ]);
  // Arms down her sides, elbows pulling up against the strap, fists clenched.
  const arms = [-1, 1].flatMap((side) => [
    limb(t, [side * 0.22, 0.12, -0.52], [side * 0.25, 0.15, -0.22], 0.045, jacket),
    limb(t, [side * 0.25, 0.15, -0.22], [side * 0.22, 0.08, 0.08], 0.04, jacket),
    box(t.sheet, [0.06, 0.05, 0.07], [side * 0.22, 0.05, 0.12], skin),
  ]);
  const neck = limb(t, [0, 0.12, -0.58], [0, 0.14, -0.66], 0.045, skin);
  const skull = mesh(new THREE.SphereGeometry(0.1, 12, 9), t.sheet, skin); // rounder: she is seen close
  skull.scale.set(0.92, 1.08, 0.96);
  const back = mesh(new THREE.SphereGeometry(0.108, 12, 7, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.58), t.sheet, hair);
  back.rotation.x = Math.PI / 2;
  const fringe = box(t.sheet, [0.16, 0.03, 0.05], [0, 0.07, 0.05], hair);
  const headParts = [skull, back, fringe, ...noraFace(t)];
  const faceUp = group(...headParts);
  faceUp.rotation.x = -Math.PI / 2 + 0.25; // face up, the chin lifted off the table
  const headGroup = group(faceUp);
  headGroup.rotation.z = -turn * 0.75; // then turned towards you (her right is -x)
  headGroup.position.set(0, 0.16, -0.73);
  // Her hair loose over the end of the table, hanging.
  const hanging = [-0.05, 0, 0.05].map((x, i) => box(t.sheet, [0.04, 0.22 + i * 0.03, 0.02], [x, -0.18 - i * 0.03, -0.92], hair));
  return group(chest, waist, ...shoulders, ...legs, ...arms, neck, headGroup, ...hanging);
}

export const BASEMENT_FIGURES = { ...SURGEON_FIGURES, ghostSam, noraStrapped };
