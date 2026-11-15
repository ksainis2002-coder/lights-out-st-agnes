// Sister M., the burned nun (0.4, the asylum wards). Origin on the floor,
// front facing +z. Owner picks 2026-11-15: no face (a hollow wimple), large
// glowing eyes, a proper veil, a body with shoulders and sleeves.
import * as THREE from 'three';
import { box, materialFor, canvasTexture } from './parts.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

function mesh(geometry, texture, options) {
  return new THREE.Mesh(geometry, materialFor(texture, options));
}

// Scorched linen for her wimple and cape: cream, burnt brown-black from one
// edge (the canvas top).
function scorchedLinenTexture() {
  let seed = 5;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return canvasTexture(32, 16, (g, w, h) => {
    for (let x = 0; x < w; x++) {
      const burn = 3 + Math.floor(random() * 5);
      for (let y = 0; y < h; y++) {
        const n = Math.floor(random() * 14);
        const c = y < burn - 2 ? [26 + n, 20 + n, 16 + n] : y < burn ? [78 + n, 58 + n, 40 + n] : [150 + n, 140 + n, 116 + n];
        g.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
        g.fillRect(x, y, 1, 1);
      }
    }
  });
}

// Cracks over the habit that still glow: thick at the hem, thinning as they
// climb (drawn unlit over the robe; v = 0 is the hem).
function emberCracksTexture() {
  let seed = 11;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return canvasTexture(64, 64, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (let i = 0; i < 16; i++) {
      let x = Math.floor(random() * w);
      let y = h - 1;
      const top = h - 8 - random() * (i % 4 === 0 ? 50 : 26);
      while (y > top) {
        g.fillStyle = y > h - 10 ? '#ffb040' : '#ff6a1a';
        g.fillRect(x, y, y > h - 6 ? 2 : 1, 1);
        y -= 1;
        if (random() < 0.45) x = (x + (random() < 0.5 ? -1 : 1) + w) % w;
      }
    }
    g.fillStyle = '#ff8a2a'; // sparks loose in the cloth
    for (let i = 0; i < 26; i++) g.fillRect(Math.floor(random() * w), Math.floor(h - 1 - random() * random() * h * 0.8), 1, 1);
  });
}

// Cloth turned on a lathe, then shaped: "depth" squeezes it front to back at
// each height (shoulders are wider than deep) and "folds" ripples the hem.
function cloth(points, texture, options, { depth = () => 1, folds = 0, segments = 12, start = 0, sweep = Math.PI * 2 } = {}) {
  const geometry = new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segments, start, sweep);
  const at = geometry.attributes.position;
  const top = Math.max(...points.map(([, y]) => y));
  for (let i = 0; i < at.count; i++) {
    const [x, y, z] = [at.getX(i), at.getY(i), at.getZ(i)];
    const ripple = 1 + folds * (1 - y / top) * Math.sin(Math.atan2(z, x) * 5);
    at.setXYZ(i, x * ripple, y, z * ripple * depth(y));
  }
  geometry.computeVertexNormals();
  return mesh(geometry, texture, options);
}

// A sleeve or limb: a six-sided tube from one point to another, r0 to r1.
function limb(texture, from, to, r0, r1, options) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const tube = mesh(new THREE.CylinderGeometry(r1, r0, a.distanceTo(b), 6), texture, options);
  tube.position.copy(a).lerp(b, 0.5);
  tube.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize());
  return tube;
}

// A burnt hand: the palm and four long fingers, built palm towards +z.
function burntHand(t, spread = 0.3) {
  const char = { color: '#1a1410' };
  const hand = group(box(t.sheet, [0.075, 0.085, 0.022], [0, 0, 0], char));
  [-0.028, -0.009, 0.01, 0.029].forEach((x, i) => {
    const finger = box(t.sheet, [0.015, 0.095 - Math.abs(i - 1.5) * 0.012, 0.015], [0, 0, 0], char);
    const knuckle = group(finger);
    knuckle.position.set(x, 0.08, 0);
    knuckle.rotation.set(spread, 0, (i - 1.5) * -0.13);
    hand.add(knuckle);
  });
  return hand;
}

// The candle snuffer she carries: a tall dark pole, a brass arm and bell
// (the bell hangs 0.11 m out along +x, mouth down).
export function candleSnuffer(t) {
  const brass = { color: '#b8923a' };
  const bell = mesh(new THREE.ConeGeometry(0.055, 0.1, 6, 1, true), t.sheet, { ...brass, side: THREE.DoubleSide });
  bell.position.set(0.11, 2.02, 0);
  return group(
    box(t.paintedWood, [0.022, 2.1, 0.022], [0, 0, 0], { color: '#2a1c12' }),
    box(t.sheet, [0.12, 0.014, 0.014], [0.055, 2.08, 0], brass),
    bell,
  );
}

const HABIT = [[0, 0], [0.4, 0], [0.36, 0.25], [0.29, 0.7], [0.235, 1.05], [0.225, 1.2], [0.25, 1.36], [0.245, 1.44], [0.16, 1.52], [0.075, 1.57], [0, 1.57]];
const VEIL = [[0, 1.925], [0.09, 1.9], [0.145, 1.83], [0.158, 1.72], [0.165, 1.6], [0.25, 1.48], [0.275, 1.3], [0.26, 1.02]];
const SHOULDER = [-0.22, 1.43, 0];
const narrow = (y) => 1 - 0.34 * Math.min(1, Math.max(0, (y - 0.6) / 0.7)); // round at the hem, flat at the chest

// Tall in a charred habit, a black veil to her shoulders over a scorched
// wimple with nothing in it but two burning eyes. A brass candle snuffer in
// her right hand, a rosary hanging from her left. "glow" 0…1 is how bright
// she burns (1 while she is coming for your light); "reach" is the catch:
// her left hand up at your light, the snuffer tipping over it.
export function burnedNun(t, { glow = 0.5, reach = false } = {}) {
  const habit = { color: '#1c1a20', flatShading: true };
  const black = { color: '#131217', flatShading: true, side: THREE.DoubleSide };
  const fire = (hex) => new THREE.Color(hex).multiplyScalar(0.35 + glow * 0.65).getHex();
  const cracks = cloth(HABIT.slice(1, 6).map(([r, y]) => [r + 0.006, y]), emberCracksTexture(),
    { unlit: true, transparent: true, depthWrite: false, color: fire('#ffffff') }, { depth: narrow, folds: 0.07 });
  const cape = cloth([[0.08, 1.62], [0.14, 1.57], [0.255, 1.47], [0.278, 1.37], [0.272, 1.3]], scorchedLinenTexture(),
    { color: '#a09684', flatShading: true, side: THREE.DoubleSide }, { depth: () => 0.68 });
  // The veil: open in front (55° each side of the face), falling past her shoulders.
  const veil = cloth(VEIL, t.sheet, black, { depth: () => 0.86, start: Math.PI * 0.3, sweep: Math.PI * 1.4 });
  const light = new THREE.PointLight('#ff7a30', 1.0 + glow * 2.0, 4.2, 1.4);
  light.position.set(0, 0.22, 0.5);
  const right = [0.22, 1.43, 0];
  const parts = [
    cloth(HABIT, t.sheet, habit, { depth: narrow, folds: 0.07 }), cracks, cape, veil,
    nunHead(t, fire),
    limb(t.sheet, right, [0.29, 1.14, 0.04], 0.07, 0.075, habit), // right arm, bent at the elbow
    limb(t.sheet, [0.29, 1.14, 0.04], [0.31, 1.06, 0.3], 0.075, 0.095, habit),
    box(t.sheet, [0.06, 0.08, 0.06], [0.31, 1.02, 0.34], { color: '#1a1410' }), // gripping the pole
    reach ? reachingArm(t, habit) : hangingArm(t, habit),
    light,
  ];
  if (!reach) {
    const pole = candleSnuffer(t);
    pole.position.set(0.31, 0, 0.34);
    parts.push(pole);
  }
  return group(...parts);
}

// Her head: a scorched wimple whose oval opening is a well of dark, and far
// back in it two burning eyes. No face (owner pick).
function nunHead(t, fire) {
  const linen = { color: '#8f8676', flatShading: true };
  const oval = (object, z) => {
    object.scale.set(0.66, 0.9, 1);
    object.position.set(0, -0.025, z);
    return object;
  };
  const coif = mesh(new THREE.SphereGeometry(0.115, 10, 7), t.sheet, linen);
  coif.scale.set(0.92, 1.2, 0.95);
  const well = (side, texture, options) => {
    const tube = mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.05, 12, 1, true), texture, { ...options, side });
    tube.rotation.x = Math.PI / 2; // its axis along z, the wider end forward
    tube.scale.set(0.66, 1, 0.9);
    tube.position.set(0, -0.025, 0.115);
    return tube;
  };
  const neck = mesh(new THREE.CylinderGeometry(0.07, 0.085, 0.16, 8), t.sheet, linen);
  neck.scale.z = 0.8;
  neck.position.set(0, -0.2, 0.01);
  // Each eye: a burning almond tilted a little inwards, a hot core.
  const eyes = [-1, 1].flatMap((side) => [[0.016, '#ff6a18', 0.116], [0.0075, '#ffe6a8', 0.119]].map(([radius, colour, z]) => {
    const eye = mesh(new THREE.CircleGeometry(radius, 6), t.sheet, { unlit: true, color: fire(colour) });
    eye.scale.set(1.2, 0.65, 1);
    eye.rotation.z = side * -0.15;
    eye.position.set(side * 0.029, -0.01, z); // where eyes sit in a face: a little above its middle
    return eye;
  }));
  const stare = new THREE.PointLight('#ff6a20', 0.5, 0.45, 1.5); // their light on the inside of the wimple
  stare.position.set(0, -0.01, 0.14);
  const head = group(
    coif, neck,
    well(THREE.FrontSide, scorchedLinenTexture(), linen),
    well(THREE.BackSide, t.sheet, { color: '#050403' }),
    oval(mesh(new THREE.CircleGeometry(0.091, 12), t.sheet, { color: '#030202' }), 0.112),
    ...eyes, stare,
  );
  head.position.set(0, 1.74, 0.02);
  return head;
}

function hangingArm(t, habit) {
  const beads = [0, 1, 2, 3, 4, 5].map((i) => box(t.sheet, [0.022, 0.022, 0.022], [-0.3, 0.56 - i * 0.05, 0.1], { color: '#3a2218' }));
  const hand = burntHand(t, 0.1);
  hand.position.set(-0.29, 0.72, 0.06);
  hand.rotation.x = Math.PI; // fingers down
  return group(
    limb(t.sheet, SHOULDER, [-0.29, 0.8, 0.05], 0.07, 0.1, habit),
    hand,
    ...beads,
    box(t.sheet, [0.02, 0.09, 0.012], [-0.3, 0.2, 0.1], { color: '#8a6a3a' }), // the cross
    box(t.sheet, [0.06, 0.02, 0.012], [-0.3, 0.25, 0.1], { color: '#8a6a3a' }),
  );
}

function reachingArm(t, habit) {
  const hand = burntHand(t, 0.4);
  hand.position.set(-0.17, 1.66, 0.46);
  hand.rotation.set(-0.35, 0.3, 0.12);
  return group(
    limb(t.sheet, SHOULDER, [-0.27, 1.34, 0.3], 0.07, 0.075, habit),
    limb(t.sheet, [-0.27, 1.34, 0.3], [-0.18, 1.62, 0.45], 0.075, 0.09, habit),
    hand,
  );
}

// Her catch (approved still nun_catch): she leans in, her burnt left hand up
// at your light, the snuffer tipping over it. The collapse sets it 1.25 m in
// front of the eyes, facing them (its +z towards you).
export function nunCatch(t) {
  const her = burnedNun(t, { glow: 1, reach: true });
  her.rotation.x = 0.24;
  const snuffer = candleSnuffer(t);
  const hand = new THREE.Vector3(0.36, 1.2, 0.45);
  const top = new THREE.Vector3(0.22, 1.9, 0.8); // the bell, over your light
  const axis = top.clone().sub(hand).normalize();
  snuffer.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis);
  snuffer.rotateY(Math.PI);
  snuffer.position.copy(top).addScaledVector(axis, -2.08);
  const embers = new THREE.PointLight('#ff8a40', 2.1, 2.4, 1.2); // her own glow on her, from below
  embers.position.set(0, 1.2, 0.75);
  const pose = group(her, snuffer, embers);
  pose.userData.grab = { from: 1.15, pitch: 0.1, roll: -0.05 }; // how the collapse frames her (sanity/collapse.js)
  return pose;
}
