// Nora Kane on her feet (0.5, part C; proposal stills nora_follow and
// ending_morning, not in the game until the owner approves them). The same
// woman as on the table (nora.js: her waxed jacket, knitted jumper, jeans and
// boots; noraHead.js, noraHair.js), stood up. Owner 2026-11-19, second pass:
// still boxy, her arms and hands wrong, stiff as a statue, her legs short.
// So she is built standing, as a jointed body: an ordinary woman of 1.66 m,
// long in the leg, a waist, soft sloping shoulders, the jacket fitted and
// hanging open; her arms placed by where her hands go (hugging herself, one
// hand on the other elbow, or loose at her side); her weight on one leg, or
// mid-step, her head turned. The joints (userData.joints) let the game walk her.
// Origin on the floor; she faces +z.
import * as THREE from 'three';
import { materialFor } from './parts.js';
import { sweepGeometry, handGroup } from './sculpt.js';
import { noraHead } from './noraHead.js';
import { hairHanging } from './noraHair.js';
import { noraTextures, mesh } from './nora.js';
import { POSES } from './noraPoses.js';

const v = (...p) => new THREE.Vector3(...p);
const THIGH = 0.41;
const SHIN = 0.4;
const ANKLE = 0.07; // ankle to sole: hip joints 0.88 m up when she stands straight
const UPPER_ARM = 0.28;
const FOREARM = 0.24;
const SHOULDER = v(0.152, 0.435, -0.012); // in her torso (x: her left)
// In your flashlight, not under his lamp: her colours darker so they hold
// (her waxed jacket and pale jumper most; her skin and hair, or they burn white).
const SHADE = 0.58;
const SKIN_SHADE = 0.4;
const SHADE_OF = (tex) => new Map([[tex.jacket, 0.4], [tex.jumper, 0.36], [tex.neck, SKIN_SHADE], [tex.hands, SKIN_SHADE]]);

const joint = (x, y, z, ...parts) => {
  const group = new THREE.Group().add(...parts);
  group.position.set(x, y, z);
  return group;
};
const ball = (r, texture) => mesh(new THREE.SphereGeometry(r, 10, 8), texture);

// Down a limb from its joint: a sweep along -y; `sections` [side, front] at even steps.
function segment(length, sections, texture, bulge = []) {
  const points = sections.map((_, i) => v(0, (-length * i) / (sections.length - 1), bulge[i] ?? 0));
  return mesh(sweepGeometry(points, sections, { radial: 10, steps: 3, front: [0, 0, 1] }), texture);
}

// Her body from the hips up, in the torso's frame (its origin 4 cm above the hip joints).
function torsoMeshes(tex) {
  const spine = [[-0.07, -0.015], [0.02, -0.01], [0.12, -0.005], [0.22, 0.005], [0.3, 0.01], [0.38, -0.002], [0.45, -0.015], [0.5, -0.012]].map(([y, z]) => v(0, y, z));
  const jumper = [[0.165, 0.112], [0.152, 0.102], [0.124, 0.086], [0.132, 0.095], [0.138, 0.106], [0.141, 0.09], [0.13, 0.068], [0.058, 0.05]];
  const jacket = [[0.18, 0.126], [0.166, 0.116], [0.143, 0.104], [0.148, 0.11], [0.154, 0.12], [0.156, 0.1], [0.142, 0.078], [0.07, 0.06]];
  const open = [1.9, 1.75, 1.5, 1.25, 1.05, 0.95, 1.0, 1.2]; // the jacket hangs open, wider towards its hem
  const wool = (theta, u) => 1 + 0.02 * Math.sin(theta * 8 + u * 9) + 0.012 * Math.sin(theta * 13 - u * 17);
  const hang = (theta, u) => 1 + 0.03 * Math.sin(theta * 6 + u * 7);
  const hem = v(0, -0.1, -0.02); // the jacket comes down over her hips
  return [
    mesh(sweepGeometry(spine, jumper, { radial: 20, steps: 4, front: [0, 0, 1], shape: wool }), tex.jumper),
    mesh(sweepGeometry([hem, ...spine.slice(1)], [[0.182, 0.13], ...jacket.slice(1)], { radial: 22, steps: 4, front: [0, 0, 1], gap: open, shape: hang }), tex.jacket, { side: THREE.DoubleSide }),
    mesh(sweepGeometry([[-0.088, 0.455, 0.03], [-0.078, 0.488, -0.035], [0, 0.505, -0.068], [0.078, 0.488, -0.035], [0.088, 0.455, 0.03]], [0.016, 0.02, 0.02, 0.02, 0.016], { radial: 6, steps: 3, front: [0, 1, 0] }), tex.leather, { color: '#8a6a50' }), // the corduroy collar
  ];
}

// From the hip joint down: a straight-leg jean over an ankle boot.
function leg(tex, side) {
  const thigh = segment(THIGH, [[0.088, 0.091], [0.072, 0.075], [0.059, 0.061]], tex.jeans, [0, 0.008, 0]);
  const shin = segment(SHIN, [[0.059, 0.061], [0.058, 0.061], [0.053, 0.055], [0.055, 0.057]], tex.jeans, [0, -0.006, 0, 0]);
  const shaft = mesh(sweepGeometry([v(0, 0.06, -0.008), v(0, -0.045, -0.014)], [[0.043, 0.048], [0.042, 0.05]], { radial: 10, steps: 2, front: [0, 0, 1] }), tex.boots);
  const foot = mesh(sweepGeometry([v(0, -0.044, -0.06), v(0, -0.048, 0.03), v(0, -0.048, 0.11), v(0, -0.046, 0.155)], [[0.04, 0.026], [0.044, 0.024], [0.04, 0.022], [0.028, 0.018]], { radial: 10, steps: 3, front: [0, 1, 0] }), tex.boots);
  const ankle = joint(0, -SHIN, 0, shaft, foot);
  const knee = joint(0, -THIGH, 0, ball(0.059, tex.jeans), shin, ankle);
  const hip = joint(side * 0.085, 0, 0, thigh, knee);
  return { hip, knee, ankle };
}

// From the shoulder: a jacket sleeve to the elbow and on to the cuff, a hand.
function arm(tex, side) {
  const upper = segment(UPPER_ARM, [[0.05, 0.048], [0.046, 0.045], [0.044, 0.042]], tex.jacket);
  const fore = segment(FOREARM, [[0.043, 0.041], [0.04, 0.038], [0.041, 0.037]], tex.jacket);
  const hand = new THREE.Group();
  const fingers = handGroup(materialFor(tex.hands), { thumb: -side, curl: 0.45, spread: 0.05, length: 0.85, width: 0.85 });
  fingers.rotation.set(Math.PI / 2, 0, Math.PI); // fingers down the forearm (-y), the palm to +z
  fingers.position.y = 0.012;
  hand.add(fingers);
  const wrist = joint(0, -FOREARM, 0, hand);
  const elbow = joint(0, -UPPER_ARM, 0, ball(0.044, tex.jacket), fore, wrist);
  const cap = ball(0.052, tex.jacket); // the round of her shoulder, a little in from the joint
  cap.position.set(-side * 0.008, -0.006, 0);
  const shoulder = joint(side * SHOULDER.x, SHOULDER.y, SHOULDER.z, cap, upper, elbow);
  return { shoulder, elbow, hand };
}

// Turns a joint (in its parent's frame) so its -y runs along `along`, its +z towards `front`.
const basis = new THREE.Matrix4();
function aim(group, along, front) {
  const y = along.clone().normalize().negate();
  const z = front.clone().addScaledVector(y, -front.dot(y));
  if (z.lengthSq() < 1e-8) z.set(0, 0, 1).addScaledVector(y, -y.z);
  z.normalize();
  group.quaternion.setFromRotationMatrix(basis.makeBasis(new THREE.Vector3().crossVectors(y, z), y, z));
}
const into = (group, direction) => direction.clone().applyQuaternion(group.quaternion.clone().invert());

// An arm reaching its wrist to `wrist` (torso frame), the elbow out towards
// `elbow`, the palm facing `palm`: a two-bone reach.
function reach(arm, { wrist, elbow, palm }) {
  const from = arm.shoulder.position;
  const to = v(...wrist).sub(from);
  const d = Math.min(to.length(), UPPER_ARM + FOREARM - 0.002);
  const u = to.normalize();
  const bend = Math.acos(Math.min(1, Math.max(-1, (UPPER_ARM ** 2 + d ** 2 - FOREARM ** 2) / (2 * UPPER_ARM * d))));
  const pole = v(...elbow);
  const out = pole.addScaledVector(u, -pole.dot(u)).normalize();
  const upper = u.clone().multiplyScalar(Math.cos(bend)).addScaledVector(out, Math.sin(bend));
  const fore = u.clone().multiplyScalar(d).sub(upper.clone().multiplyScalar(UPPER_ARM));
  aim(arm.shoulder, upper, v(0, 0, 1));
  aim(arm.elbow, into(arm.shoulder, fore), into(arm.shoulder, v(0, 0, 1)));
  const both = arm.shoulder.quaternion.clone().multiply(arm.elbow.quaternion);
  aim(arm.hand, v(0, -1, 0), v(...palm).applyQuaternion(both.invert()));
}

function bendLeg({ hip, knee, ankle }, side, { lift = 0, out = 0.03, bend = 0.02, toe = 0 }) {
  hip.rotation.set(-lift, 0, side * out);
  knee.rotation.x = bend;
  ankle.rotation.x = lift - bend + toe; // the foot level with the floor
}

// Puts her in a pose (noraPoses.js): her legs, then her hips at the height
// the longer leg holds them, her body above them, her arms, her head.
export function pose(nora, name) {
  const p = POSES[name];
  const { pelvis, torso, legs, arms, neck, head } = nora.userData.joints;
  bendLeg(legs.right, -1, p.right);
  bendLeg(legs.left, 1, p.left);
  const height = (l) => THIGH * Math.cos(l.lift ?? 0) + SHIN * Math.cos((l.lift ?? 0) - (l.bend ?? 0));
  pelvis.position.y = Math.max(height(p.right), height(p.left)) + ANKLE;
  pelvis.rotation.set(0, p.turn ?? 0, p.hips ?? 0);
  torso.rotation.set(p.lean ?? 0.06, p.twist ?? 0, p.sway ?? 0);
  reach(arms.right, p.rightArm);
  reach(arms.left, p.leftArm);
  neck.rotation.x = 0.06;
  head.rotation.set(p.nod ?? 0.1, p.look ?? 0, p.tilt ?? 0, 'YXZ');
}

function noraStanding(t, { pose: name = 'stand' } = {}) {
  const tex = noraTextures();
  const legs = { right: leg(tex, -1), left: leg(tex, 1) };
  const arms = { right: arm(tex, -1), left: arm(tex, 1) };
  const head = noraHead();
  const neckMesh = segment(0.1, [[0.046, 0.044], [0.043, 0.041], [0.041, 0.039]], tex.neck, [0, 0.006, 0.012]);
  neckMesh.rotation.x = Math.PI; // up from the jumper
  head.position.set(0, 0.155, 0.02);
  const neck = joint(0, 0.48, -0.012, neckMesh, head);
  const torso = joint(0, 0.04, 0, ...torsoMeshes(tex), arms.right.shoulder, arms.left.shoulder, neck);
  const hips = mesh(sweepGeometry([v(0, 0.02, -0.01), v(0, -0.04, -0.016), v(0, -0.09, -0.008), v(0, -0.125, 0)], [[0.158, 0.108], [0.166, 0.114], [0.148, 0.102], [0.1, 0.075]], { radial: 16, steps: 3, front: [0, 0, 1] }), tex.jeans);
  const pelvis = joint(0, 0.88, 0, hips, legs.right.hip, legs.left.hip, torso);
  const nora = new THREE.Group().add(pelvis);
  nora.userData.joints = { pelvis, torso, legs, arms, neck, head };
  pose(nora, name);
  // Her hair hangs from her head as she holds it: built in her head's frame, gravity's way.
  nora.updateMatrixWorld(true);
  const down = v(0, -1, 0).applyQuaternion(head.getWorldQuaternion(new THREE.Quaternion()).invert());
  const still = { userData: head.userData, position: v(0, 0, 0), matrix: new THREE.Matrix4(), updateMatrix() {} };
  const hair = hairHanging(still, down);
  head.add(...hair);
  const shades = SHADE_OF(tex);
  const skin = new Set(hair);
  head.traverse((o) => o.isMesh && skin.add(o));
  nora.traverse((o) => {
    if (!o.isMesh) return;
    const shade = skin.has(o) ? SKIN_SHADE : shades.get(o.material.map) ?? SHADE;
    o.material = o.material.clone();
    o.material.color.multiplyScalar(shade);
  });
  return nora;
}

export const NORA_STANDING = { noraStanding };
