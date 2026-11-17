// Nora Kane's head (0.5 proposal; mockup stills only until the owner approves
// her). Owner 2026-11-17, after many passes: "a real, ordinary woman" and
// "simple natural hair" (two qualities of another game's heroine the owner
// pointed to, taken in spirit only). Sculpted for an ordinary young woman: a
// straight nose, full lips, soft round cheeks, a soft jaw, the lower face long
// enough; not quite the same on both sides. Her face is painted in
// noraFace.js, her hair built in noraHair.js. Origin at the head's centre,
// the face looking down +z.
import * as THREE from 'three';
import { materialFor } from './parts.js';
import { sculptedHead } from './sculpt.js';
import { FACE, noraFaceTexture } from './noraFace.js';
import { hairOnHead, hasHair } from './noraHair.js';

const both = (bumps) => bumps.flatMap((b) => (b.at[0] ? [b, { ...b, at: [-b.at[0], b.at[1], b.at[2]] }] : [b]));

const BUMPS = both([
  { at: [0, -0.06, 1], size: 0.12, stretch: [0.42, 1.9, 1], amount: 0.16 }, // the bridge of her nose
  { at: FACE.noseTip, size: 0.08, amount: 0.09 }, // its tip
  { at: [0.09, -0.36, 0.93], size: 0.05, amount: 0.04 }, // its wings
  { at: [0.36, 0.24, 0.9], size: 0.15, stretch: [1.5, 0.5, 1], amount: 0.05 }, // her brows, lifted
  { at: FACE.eye, size: 0.12, amount: -0.08 }, // her eyes
  { at: [0.56, -0.16, 0.8], size: 0.17, amount: 0.07 }, // her cheeks, soft and round
  { at: [0, -0.53, 0.85], size: 0.12, stretch: [1.7, 0.8, 1], amount: 0.055 }, // full lips
  { at: FACE.mouth, size: 0.06, stretch: [1.6, 0.9, 1], amount: -0.055 }, // parted, her breath caught
  { at: FACE.chin, size: 0.15, amount: 0.06 }, // her chin
  { at: [0.62, -0.7, 0.32], size: 0.2, amount: 0.02 }, // a soft jaw
  { at: [0.85, 0.32, 0.4], size: 0.2, amount: -0.03 }, // her temples
  { at: [1, 0, -0.05], size: 0.12, stretch: [0.5, 1.4, 0.7], amount: 0.08 }, // her ears
]).concat([ // no face is the same on both sides
  { at: [0.6, -0.1, 0.79], size: 0.1, amount: 0.015 }, // the bruised cheekbone, a little swollen
  { at: [0.03, -0.12, 1], size: 0.08, amount: 0.012 }, // her nose a little off true
]);

const SCALE = [0.7, 1.05, 0.92];
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
