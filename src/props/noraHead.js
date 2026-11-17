// Nora Kane's head (0.5 proposal; mockup stills only until the owner approves
// her). Owner 2026-11-17, after many passes: "a real, ordinary woman" and
// "simple natural hair" (two qualities of another game's heroine the owner
// pointed to, taken in spirit only). Sculpted for an ordinary young woman: a
// small, short, soft nose, full lips, a round face with full cheeks, a soft
// jaw; not quite the same on both sides. Her face is painted in
// noraFace.js, her hair built in noraHair.js. Origin at the head's centre,
// the face looking down +z.
import * as THREE from 'three';
import { materialFor } from './parts.js';
import { sculptedHead } from './sculpt.js';
import { FACE, noraFaceTexture } from './noraFace.js';
import { hairOnHead, hasHair } from './noraHair.js';

const both = (bumps) => bumps.flatMap((b) => (b.at[0] ? [b, { ...b, at: [-b.at[0], b.at[1], b.at[2]] }] : [b]));

const BUMPS = both([
  { at: [0, -0.1, 1], size: 0.1, stretch: [0.42, 1.3, 1], amount: 0.11 }, // the bridge of her nose, short (owner: smaller, softer)
  { at: FACE.noseTip, size: 0.085, amount: 0.07 }, // its tip, round
  { at: [0.08, -0.31, 0.95], size: 0.05, amount: 0.035 }, // its wings
  { at: [0.36, 0.24, 0.9], size: 0.15, stretch: [1.5, 0.5, 1], amount: 0.05 }, // her brows, lifted
  { at: FACE.eye, size: 0.12, amount: -0.08 }, // her eyes
  { at: [0.54, -0.22, 0.8], size: 0.2, amount: 0.1 }, // her cheeks, full and round (owner: rounder)
  { at: [0, -0.49, 0.87], size: 0.12, stretch: [1.7, 0.8, 1], amount: 0.055 }, // full lips
  { at: FACE.mouth, size: 0.06, stretch: [1.7, 0.6, 1], amount: -0.03 }, // just parted
  { at: FACE.chin, size: 0.14, amount: 0.065 }, // her chin, soft but there (owner: the chin a little off)
  { at: [0, -0.96, 0.2], size: 0.16, amount: -0.03 }, // in under it, where her throat begins
  { at: [0.62, -0.7, 0.32], size: 0.22, amount: 0.045 }, // a soft, round jaw
  { at: [0.85, 0.32, 0.4], size: 0.2, amount: -0.02 }, // her temples
  { at: [1, 0, -0.05], size: 0.12, stretch: [0.5, 1.4, 0.7], amount: 0.08 }, // her ears
]).concat([ // no face is the same on both sides
  { at: [0.6, -0.1, 0.79], size: 0.1, amount: 0.015 }, // the bruised cheekbone, a little swollen
  { at: [0.03, -0.12, 1], size: 0.08, amount: 0.012 }, // her nose a little off true
]);

const SCALE = [0.74, 1.0, 0.93]; // a rounder face, less long
const RADIUS = 0.1;

// Her head; its userData.hair tells hairFall (noraHair.js) where her hair grows.
export function noraHead() {
  const head = sculptedHead(RADIUS, BUMPS, { scale: SCALE, width: 40, height: 28 });
  const skin = new THREE.Mesh(head.geometry, materialFor(noraFaceTexture(hasHair)));
  const hair = hairOnHead(head, { radius: RADIUS, bumps: BUMPS, scale: SCALE });
  const group = new THREE.Group().add(skin, ...hair.meshes);
  group.userData.hair = { at: hair.at };
  return group;
}
