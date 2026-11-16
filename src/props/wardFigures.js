// Figures of the asylum wards (0.4): Edith, the blind ghost girl (Sister
// M., the burned nun, is in burnedNun.js). Origin on the floor (Edith: on what she sits on),
// front facing +z.
import * as THREE from 'three';
import { box, strut, materialFor } from './parts.js';
import { burnedNun, candleSnuffer, nunCatch } from './burnedNun.js';

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

// Edith Carr, sitting on the edge of a bed with her music box in her lap,
// her head tilted to listen (she is blind). Faceless and unhurt, as every
// ghost child (scare rules). A seated child in a nightdress (owner
// 2026-11-17: the first one looked off close up): the gown narrow at the
// shoulders, over her lap, falling from the knees; bare shins and feet
// hanging over the edge, not reaching the floor; arms down and forward,
// hands on the box. Origin: where she sits; she faces +z.
// box: 'closed' (the box as she remembers it), 'open' (mended, still
// box_mended) or 'none' (the mended box is real now: a pickup in her lap,
// then yours: ghosts/edithBox.js).
function ghostEdith(t, { opacity = 0.6, box: musicBox = 'closed' } = {}) {
  // depthWrite on: seen close, her far side must not show through her.
  const ghost = { unlit: true, color: 0xd8e4ec, transparent: true, opacity, depthWrite: true, fog: false, flatShading: true };
  const part = (geometry, at, turn = [0, 0, 0], options = ghost) => {
    const piece = mesh(geometry, t.sheet, options);
    piece.position.set(...at);
    piece.rotation.set(...turn);
    return piece;
  };
  const torso = part(new THREE.CylinderGeometry(0.085, 0.13, 0.4, 8), [0, 0.2, 0], [0.08, 0, 0]);
  torso.scale.z = 0.72;
  const lap = part(new THREE.CylinderGeometry(0.075, 0.08, 0.3, 8), [0, 0.055, 0.15], [Math.PI / 2, 0, 0]);
  lap.scale.x = 1.8;
  const hem = part(new THREE.CylinderGeometry(0.13, 0.155, 0.2, 8), [0, -0.04, 0.31]);
  hem.scale.z = 0.55;
  const legs = [-0.055, 0.055].flatMap((x) => [
    part(new THREE.CylinderGeometry(0.026, 0.023, 0.2, 6), [x, -0.24, 0.32]),
    part(new THREE.BoxGeometry(0.05, 0.03, 0.09), [x, -0.35, 0.35]),
  ]);
  const arms = [-1, 1].flatMap((side) => [
    limb(t, [side * 0.112, 0.37, 0.03], [side * 0.135, 0.19, 0.07], 0.03, ghost),
    limb(t, [side * 0.135, 0.19, 0.07], [side * 0.095, 0.16, 0.2], 0.026, ghost),
    part(new THREE.SphereGeometry(0.027, 6, 4), [side * 0.093, 0.16, 0.21]),
  ]);
  const neck = part(new THREE.CylinderGeometry(0.034, 0.04, 0.08, 6), [0, 0.43, 0.02]);
  const collar = part(new THREE.CylinderGeometry(0.062, 0.075, 0.025, 8), [0, 0.4, 0.025]); // the nightdress's round collar
  const sleeves = [-1, 1].map((side) => part(new THREE.SphereGeometry(0.045, 6, 4), [side * 0.105, 0.36, 0.025])); // puffed
  const head = mesh(new THREE.SphereGeometry(0.1, 8, 6), t.sheet, ghost);
  head.scale.set(0.95, 1.05, 1);
  // Bobbed hair: a cap cut straight below the ears, open at the face, and a fringe.
  const bob = mesh(new THREE.SphereGeometry(0.118, 8, 5, Math.PI * 0.78, Math.PI * 1.44, 0, Math.PI * 0.68), t.sheet, { ...ghost, color: 0xa9b9cc, side: THREE.DoubleSide });
  bob.position.y = 0.014;
  const headGroup = group(head, bob, box(t.sheet, [0.17, 0.026, 0.03], [0, 0.045, 0.08], { ...ghost, color: 0xa9b9cc }));
  headGroup.position.set(0, 0.56, 0.035);
  headGroup.rotation.set(0.12, 0.4, 0.4); // one ear turned to the room
  const real = { color: 0xf0dcae, unlit: true, transparent: true, opacity: Math.min(1, opacity + 0.25), depthWrite: true, fog: false };
  return group(
    torso, lap, hem, ...legs, ...arms, ...sleeves, neck, collar, headGroup,
    ...(musicBox === 'none' ? [] : musicBox === 'open' ? openBox(t) : [
      box(t.sheet, [0.16, 0.09, 0.12], [0, 0.125, 0.21], real), // the music box
      box(t.sheet, [0.04, 0.012, 0.012], [0.1, 0.17, 0.21], real), // its crank
    ]),
  );
}

// Her music box mended (part C): real, not ghostly, its lid open, the brass
// cylinder on top, a soft warm light from it on her hands.
function openBox(t) {
  const tin = { color: '#b0b4ae' };
  const hinge = group( // hinged at the back, open towards her
    box(t.sheet, [0.16, 0.01, 0.12], [0, 0, 0.06], tin),
    box(t.sheet, [0.14, 0.004, 0.1], [0, -0.006, 0.06], { color: '#6a2c2a' }), // the faded red lining (inside, facing her once open)
  );
  hinge.position.set(0, 0.205, 0.15);
  hinge.rotation.x = -1.9;
  const glow = new THREE.PointLight('#ffb866', 0.7, 1.0, 1.6);
  glow.position.set(0, 0.26, 0.24);
  return [
    box(t.sheet, [0.16, 0.08, 0.12], [0, 0.125, 0.21], tin),
    box(t.sheet, [0.12, 0.028, 0.028], [0, 0.205, 0.19], { color: '#c8a050' }), // the cylinder
    box(t.sheet, [0.12, 0.008, 0.035], [0, 0.205, 0.235], { color: '#d8d0b0' }), // its comb
    box(t.sheet, [0.03, 0.012, 0.012], [0.095, 0.16, 0.21], { color: '#b8923a' }), // the key
    hinge,
    glow,
  ];
}

// The mended box on its own, origin under it: the pickup in Edith's lap that
// she tells you to take (ghosts/edithBox.js).
function musicBoxOpen(t) {
  const parts = group(...openBox(t));
  parts.position.set(0, -0.085, -0.21);
  return group(parts);
}

export const WARD_FIGURES = { burnedNun, candleSnuffer, nunCatch, ghostEdith, musicBoxOpen };
