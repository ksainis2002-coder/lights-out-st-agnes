// Nora Kane on her feet (0.5, part C; proposal still nora_follow, not in the
// game until the owner approves it): freed from the table, she follows you
// out. The same woman as on the table (nora.js: her waxed jacket, knitted
// jumper, jeans and boots; noraHead.js, noraHair.js), stood up: her body is
// built as it lies on the table and turned upright, her hair hangs to her
// shoulders. Owner 2026-11-19, first pass: redo her. Not a mannequin
// standing to attention: her shoulders slope and are rounded, she stoops a
// little at the waist, afraid, her head a little down, her elbows in at her
// sides and her hands held in front of her, and her colours darker so your
// flashlight does not burn her jacket yellow. Her legs and arms swing from
// her hips and shoulders (userData.limbs) so she can walk; `stride` (-1..1)
// poses one step, `turn` turns her head, `hunch` (radians) stoops her.
// Origin on the floor between her feet; she faces +z.
import * as THREE from 'three';
import { materialFor } from './parts.js';
import { sweepGeometry, handGroup } from './sculpt.js';
import { noraHead } from './noraHead.js';
import { hairHanging } from './noraHair.js';
import { noraTextures, torso, mesh } from './nora.js';

const v = (...p) => new THREE.Vector3(...p);
const HIPS = 0.86; // metres from the floor to her hips: about 1.65 m to the top of her head
const LEG_SWING = 0.35; // radians at a full stride
const ARM_SWING = 0.12; // her arms held in: they hardly swing
// In your flashlight, not under his lamp: her colours darker so they hold
// (her waxed jacket most, or it burns yellow; her face and hair, or they
// burn white in the middle of your beam; her pale jumper next).
const SHADE = 0.58;
const FACE_SHADE = 0.4;
const SHADE_OF = (tex) => new Map([[tex.jacket, 0.4], [tex.jumper, 0.36]]);
const BEND = 1.0; // radians her forearms come up from hanging: her hands in front of her

// Built as on the table (her front +y, her head -z, her feet +z), then stood
// up by the group that holds it. A limb swings from `pivot` about the body's x.
function limb(pivot, ...parts) {
  const group = new THREE.Group();
  group.position.copy(pivot);
  group.add(...parts);
  return group;
}

// A leg from the hip down, straight, the boot square to it (toes forward).
function leg(tex, side) {
  const x = side * 0.09;
  const jeans = mesh(sweepGeometry([[0, 0, 0], [side * 0.005, 0.004, 0.41], [side * 0.01, -0.02, 0.76]], [[0.09, 0.08], 0.062, 0.05], { radial: 10, steps: 4, front: [0, 1, 0] }), tex.jeans);
  const boot = mesh(sweepGeometry([[side * 0.01, -0.015, 0.74], [side * 0.01, -0.03, 0.81], [side * 0.01, 0.06, 0.84], [side * 0.01, 0.14, 0.82]], [0.052, 0.05, 0.045, 0.03], { radial: 8, steps: 3, front: [0, 0, 1] }), tex.boots);
  return limb(v(x, 0.09, -0.01), jeans, boot);
}

// An arm from the shoulder in its sleeve, the elbow in at her side, the
// forearm come up and in so her hand is held in front of her stomach.
function arm(tex, side) {
  const shoulder = v(side * 0.165, 0.1, -0.49);
  const elbow = v(side * 0.035, -0.01, 0.245);
  const across = v(-side * 0.35, Math.sin(BEND) * 0.9, Math.cos(BEND)).normalize();
  const wrist = elbow.clone().addScaledVector(across, 0.22);
  const sleeve = mesh(sweepGeometry([v(0, 0, 0), elbow, wrist], [0.06, 0.052, 0.045], { radial: 10, steps: 5, front: [0, 1, 0] }), tex.jacket);
  const hand = handGroup(materialFor(tex.hands), { thumb: -side, curl: 0.7, spread: 0.03, length: 0.85, width: 0.85 });
  hand.position.copy(wrist).addScaledVector(across, 0.01);
  hand.quaternion.setFromUnitVectors(v(0, 0, 1), across);
  hand.rotateZ(side * Math.PI / 2); // the palm in, towards the other hand
  return limb(shoulder, sleeve, hand);
}

// Her shoulders: the jacket rounded over the top of her body and over each
// shoulder, so her body does not end square at the neck.
function shoulders(tex) {
  const yoke = mesh(new THREE.SphereGeometry(1, 16, 8), tex.jacket);
  yoke.scale.set(0.19, 0.085, 0.075);
  yoke.position.set(0, 0.085, -0.47); // tucked in behind her jumper's front, so it rounds only her top and back
  const caps = [-1, 1].map((side) => {
    const cap = mesh(new THREE.SphereGeometry(0.066, 10, 8), tex.jacket);
    cap.position.set(side * 0.162, 0.1, -0.485);
    return cap;
  });
  return [yoke, ...caps];
}

// Her neck straight up out of her jumper into her head. (The table's ring
// collar is left off: stood up, it showed edge-on as a black bar.)
function neck(tex) {
  const path = [v(0, 0.1, -0.52), v(0, 0.104, -0.585), v(0, 0.108, -0.64)];
  return [mesh(sweepGeometry(path, [[0.05, 0.045], 0.044, 0.042], { radial: 16, steps: 4, front: [0, 1, 0] }), tex.neck)];
}

function noraStanding(t, { stride = 0, turn = 0, hunch = 0.14, nod = 0.08 } = {}) {
  const tex = noraTextures();
  const legs = [leg(tex, -1), leg(tex, 1)];
  const arms = [arm(tex, -1), arm(tex, 1)];
  const head = noraHead();
  head.position.set(0, 0.11, -0.7);
  const down = new THREE.Quaternion().setFromAxisAngle(v(1, 0, 0), -Math.PI / 2 + nod); // her chin a little down
  head.quaternion.setFromAxisAngle(v(0, 0, 1), turn).multiply(down);
  // All of her above the hips stoops forward from them; her hair still hangs straight down.
  const hair = hairHanging(head, v(0, Math.sin(hunch), Math.cos(hunch)));
  const upper = new THREE.Group().add(...torso(tex, { standing: true }), ...shoulders(tex), ...neck(tex), ...arms, head, ...hair);
  upper.position.set(0, 0.1, 0);
  upper.children.forEach((child) => child.position.y -= 0.1); // pivot at her hips
  upper.rotation.x = hunch;
  const body = new THREE.Group().add(upper, ...legs);
  body.rotation.x = Math.PI / 2; // stood up: her head up, her front to +z
  body.position.set(0, HIPS, -0.1);
  const nora = new THREE.Group().add(body);
  const shades = SHADE_OF(tex);
  const face = new Set(hair); // and her skin: her head, her throat, her hands
  head.traverse((o) => o.isMesh && face.add(o));
  nora.traverse((o) => o.isMesh && (o.material.map === tex.neck || o.material.map === tex.hands) && face.add(o));
  nora.traverse((o) => {
    if (!o.isMesh) return;
    const shade = face.has(o) ? FACE_SHADE : shades.get(o.material.map) ?? SHADE;
    o.material = o.material.clone();
    o.material.color.multiplyScalar(shade);
  });
  nora.userData.limbs = { legs, arms };
  pose(nora, stride);
  return nora;
}

// One step of her walk: her right leg forward and her left arm (stride > 0), or the other way.
export function pose(nora, stride) {
  const { legs, arms } = nora.userData.limbs;
  legs[0].rotation.x = -stride * LEG_SWING;
  legs[1].rotation.x = stride * LEG_SWING;
  arms[0].rotation.x = stride * ARM_SWING;
  arms[1].rotation.x = -stride * ARM_SWING;
}

export const NORA_STANDING = { noraStanding };
