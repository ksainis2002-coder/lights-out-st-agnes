// Nora Kane on her feet (0.5, part C; proposal still nora_follow, not in the
// game until the owner approves it): freed from the table, she follows you
// out. The same woman as on the table (nora.js: her waxed jacket, knitted
// jumper, jeans and boots; noraHead.js, noraHair.js), stood up: her body is
// built as it lies on the table and turned upright, her arms hang at her
// sides with her hands loose, her hair hangs to her shoulders. Her legs and
// arms swing from her hips and shoulders (userData.limbs) so she can walk;
// `stride` (-1..1) poses one step, `turn` turns her head.
// Origin on the floor between her feet; she faces +z.
import * as THREE from 'three';
import { materialFor } from './parts.js';
import { sweepGeometry, handGroup } from './sculpt.js';
import { noraHead } from './noraHead.js';
import { hairHanging } from './noraHair.js';
import { noraTextures, torso, mesh } from './nora.js';

const v = (...p) => new THREE.Vector3(...p);
const HIPS = 0.86; // metres from the floor to her hips: 1.67 m to the top of her head
const LEG_SWING = 0.35; // radians at a full stride
const ARM_SWING = 0.22;
const SHADE = 0.62; // on her feet she is in your flashlight, not under his lamp: her colours darker so they hold

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

// An arm hanging from the shoulder in its sleeve, the hand loose.
function arm(tex, side) {
  const shoulder = v(side * 0.17, 0.1, -0.5);
  const elbow = v(side * 0.2, 0.1, -0.25).sub(shoulder);
  const wrist = v(side * 0.205, 0.105, -0.02).sub(shoulder);
  const sleeve = mesh(sweepGeometry([v(0, 0, 0), elbow, wrist], [0.058, 0.05, 0.044], { radial: 10, steps: 4, front: [0, 1, 0] }), tex.jacket);
  const hand = handGroup(materialFor(tex.hands), { thumb: -side, curl: 0.55, spread: 0.04, length: 0.85, width: 0.85 });
  hand.position.copy(wrist).add(v(0, 0, 0.01));
  hand.quaternion.setFromUnitVectors(v(0, 0, 1), wrist.clone().sub(elbow).normalize());
  hand.rotateZ(side * Math.PI / 2); // the palm to her thigh
  return limb(shoulder, sleeve, hand);
}

// Her neck straight up into her head, the jumper's collar round it.
function neck(tex) {
  const path = [v(0, 0.1, -0.52), v(0, 0.104, -0.585), v(0, 0.108, -0.64)];
  const throat = mesh(sweepGeometry(path, [[0.05, 0.045], 0.044, 0.042], { radial: 16, steps: 4, front: [0, 1, 0] }), tex.neck);
  const collar = mesh(new THREE.TorusGeometry(0.054, 0.017, 6, 18), tex.jumper);
  collar.position.copy(path[0].clone().lerp(path[1], 0.5));
  return [throat, collar];
}

function noraStanding(t, { stride = 0, turn = 0 } = {}) {
  const tex = noraTextures();
  const legs = [leg(tex, -1), leg(tex, 1)];
  const arms = [arm(tex, -1), arm(tex, 1)];
  const head = noraHead();
  head.position.set(0, 0.11, -0.7);
  const flat = new THREE.Quaternion().setFromAxisAngle(v(1, 0, 0), -Math.PI / 2);
  head.quaternion.setFromAxisAngle(v(0, 0, 1), turn).multiply(flat);
  const body = new THREE.Group().add(...torso(tex, { standing: true }), ...neck(tex), ...legs, ...arms, head, ...hairHanging(head, v(0, 0, 1)));
  body.rotation.x = Math.PI / 2; // stood up: her head up, her front to +z
  body.position.set(0, HIPS, -0.1);
  const nora = new THREE.Group().add(body);
  nora.traverse((o) => {
    if (!o.isMesh) return;
    o.material = o.material.clone();
    o.material.color.multiplyScalar(SHADE);
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
