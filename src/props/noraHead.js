// Nora Kane's head (0.5 proposal; mockup stills only until the owner approves
// her). Owner 2026-11-17: her face odd; then cartoon or doll-like, surprised
// rather than terrified, the hair like a helmet: three versions to pick
// from. Sculpted for a woman of about thirty (a straight nose, full lips, a
// soft jaw, the lower face long enough); her face is painted in noraFace.js,
// her hair built in noraHair.js. The versions: terrified, her hair loose;
// crying, her hair tied back and coming loose; exhausted, her hair damp.
// Origin at the head's centre, the face looking down +z.
import * as THREE from 'three';
import { materialFor } from './parts.js';
import { sculptedHead } from './sculpt.js';
import { FACE, noraFaceTexture } from './noraFace.js';
import { hairOnHead, hasHair } from './noraHair.js';

const both = (bumps) => bumps.flatMap((b) => (b.at[0] ? [b, { ...b, at: [-b.at[0], b.at[1], b.at[2]] }] : [b]));

export const HAIR_FOR = { terrified: 'loose', crying: 'tied', exhausted: 'damp' };

// How far her mouth opens and which way it pulls, for each look.
const MOUTHS = {
  terrified: { stretch: [2.4, 0.7, 1], amount: -0.08 }, // stretched wide
  crying: { stretch: [1.8, 1.1, 1], amount: -0.1 }, // dropped in a sob
  exhausted: { stretch: [1.6, 0.6, 1], amount: -0.04 }, // barely parted
};

function bumps(look) {
  const mouth = MOUTHS[look] ?? MOUTHS.terrified;
  return both([
    { at: [0, -0.06, 1], size: 0.12, stretch: [0.42, 1.9, 1], amount: 0.17 }, // the bridge of her nose
    { at: FACE.noseTip, size: 0.08, amount: 0.09 }, // its tip
    { at: [0.09, -0.36, 0.93], size: 0.05, amount: 0.04 }, // its wings
    { at: FACE.brow, size: 0.15, stretch: [1.5, 0.5, 1], amount: 0.07 }, // her brows
    { at: FACE.eye, size: 0.12, amount: -0.1 }, // her eyes, set deep
    { at: [0.6, -0.12, 0.79], size: 0.15, amount: 0.08 }, // her cheekbones
    { at: [0.56, -0.46, 0.69], size: 0.16, amount: -0.04 }, // under them
    { at: [0, -0.6, 0.8], size: 0.12, stretch: [1.7, 0.8, 1], amount: 0.05 }, // her lips
    { at: FACE.mouth, size: 0.06, stretch: mouth.stretch, amount: mouth.amount }, // her mouth open
    { at: FACE.chin, size: 0.15, amount: 0.07 }, // her chin
    { at: [0.62, -0.7, 0.32], size: 0.2, amount: 0.02 }, // her jaw
    { at: [0.85, 0.32, 0.4], size: 0.2, amount: -0.04 }, // her temples
    { at: [1, 0, -0.05], size: 0.12, stretch: [0.5, 1.4, 0.7], amount: 0.08 }, // her ears
  ]).concat([ // no face is the same on both sides
    { at: [0.6, -0.1, 0.79], size: 0.1, amount: 0.025 }, // the bruised cheekbone, swollen
    { at: [-0.58, 0.44, 0.68], size: 0.07, amount: 0.02 }, // and by the cut
    { at: [0.03, -0.12, 1], size: 0.08, amount: 0.015 }, // her nose a little off true
  ]);
}

const SCALE = [0.7, 1.06, 0.92];
const RADIUS = 0.1;

// Her head for one look ("terrified", "crying" or "exhausted"). Its
// userData.hair tells hairFall (noraHair.js) where her hair grows.
export function noraHead(t, { look = 'terrified' } = {}) {
  const style = HAIR_FOR[look] ?? 'loose';
  const shape = bumps(look);
  const head = sculptedHead(RADIUS, shape, { scale: SCALE, width: 40, height: 28 });
  const skin = new THREE.Mesh(head.geometry, materialFor(noraFaceTexture(look, (d) => hasHair(style, d))));
  const hair = hairOnHead(style, head, { radius: RADIUS, bumps: shape, scale: SCALE });
  const group = new THREE.Group().add(skin, ...hair.meshes);
  group.userData.hair = { style, at: hair.at };
  return group;
}
