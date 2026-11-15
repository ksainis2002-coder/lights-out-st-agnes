// Figures of the asylum wards (0.4): Sister M., the burned nun, and Edith,
// the blind ghost girl. Origin on the floor (Edith: on what she sits on),
// front facing +z.
import * as THREE from 'three';
import { box, decal, strut, materialFor, canvasTexture } from './parts.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

function mesh(geometry, texture, options) {
  return new THREE.Mesh(geometry, materialFor(texture, options));
}

// Her face inside the wimple: burnt black and cracked, deep sockets, the
// nose gone, the lips drawn back from the teeth.
function burntFaceTexture() {
  return canvasTexture(24, 26, (g) => {
    g.clearRect(0, 0, 24, 26);
    g.fillStyle = '#261d17';
    g.fillRect(1, 0, 22, 26);
    g.fillStyle = '#3d322a'; // ash, where the skin has flaked
    [[2, 1, 7, 2], [15, 2, 6, 2], [2, 13, 3, 4], [18, 14, 4, 3], [9, 22, 6, 2], [4, 20, 2, 2]].forEach((r) => g.fillRect(...r));
    g.fillStyle = '#140f0c'; // deeper char
    [[10, 3, 4, 3], [3, 17, 4, 2], [17, 19, 4, 3], [1, 8, 2, 4], [21, 8, 2, 4]].forEach((r) => g.fillRect(...r));
    g.fillStyle = '#050403'; // sockets, the nose, the mouth
    g.fillRect(4, 8, 6, 4);
    g.fillRect(14, 8, 6, 4);
    g.fillRect(5, 12, 4, 1);
    g.fillRect(15, 12, 4, 1);
    g.fillRect(11, 13, 1, 3);
    g.fillRect(13, 13, 1, 3);
    g.fillRect(6, 18, 12, 3);
    g.fillStyle = '#7a6c58'; // teeth
    [7, 9, 11, 13, 15].forEach((x) => g.fillRect(x, 18, 1, 1));
    [8, 10, 12, 14, 16].forEach((x) => g.fillRect(x, 20, 1, 1));
  });
}

// What still burns in it: a point deep in each socket and the cracks across
// her brow and cheek (drawn unlit over the face).
function emberFaceTexture() {
  return canvasTexture(24, 26, (g) => {
    g.clearRect(0, 0, 24, 26);
    g.fillStyle = '#ff6a1a';
    [[6, 9, 2, 2], [16, 9, 2, 2]].forEach((r) => g.fillRect(...r));
    [[4, 2], [5, 3], [6, 3], [7, 4], [8, 5], [8, 6], [19, 13], [18, 14], [18, 15], [17, 16], [16, 17], [2, 15], [3, 16], [12, 23], [13, 24]].forEach(([x, y]) => g.fillRect(x, y, 1, 1));
    g.fillStyle = '#ffe08a';
    g.fillRect(7, 10, 1, 1);
    g.fillRect(16, 10, 1, 1);
  });
}

// Scorched linen for her wimple and cape: cream, burnt brown-black from one
// edge (the canvas top), with a few holes.
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
    g.fillStyle = '#2a2018';
    for (let i = 0; i < 7; i++) g.fillRect(Math.floor(random() * w), 6 + Math.floor(random() * 9), 1 + (i % 2), 1);
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
function candleSnuffer(t) {
  const brass = { color: '#b8923a' };
  const bell = mesh(new THREE.ConeGeometry(0.055, 0.1, 6, 1, true), t.sheet, { ...brass, side: THREE.DoubleSide });
  bell.position.set(0.11, 2.02, 0);
  return group(
    box(t.paintedWood, [0.022, 2.1, 0.022], [0, 0, 0], { color: '#2a1c12' }),
    box(t.sheet, [0.12, 0.014, 0.014], [0.055, 2.08, 0], brass),
    bell,
  );
}

// Sister M., the burned nun: tall in a charred habit, black veil over a
// scorched white wimple, her face burnt black, embers still alive in the
// cracks of her and of the cloth. A brass candle snuffer in her right hand,
// a rosary hanging from her left. "glow" 0…1 is how bright she burns (1
// while she is coming for your light); "reach" is the catch: her left hand
// up at your light, the snuffer tipping over it.
const HABIT = [[0, 0], [0.37, 0], [0.33, 0.3], [0.25, 0.85], [0.2, 1.12], [0.25, 1.36], [0.24, 1.46], [0.13, 1.56], [0.07, 1.6], [0, 1.6]];

function burnedNun(t, { glow = 0.5, reach = false } = {}) {
  const habit = { color: '#1c1a20', flatShading: true };
  const cream = { color: '#8f8676', flatShading: true, side: THREE.DoubleSide };
  const black = { color: '#131217', flatShading: true, side: THREE.DoubleSide };
  const burning = new THREE.Color('#ffffff').multiplyScalar(0.35 + glow * 0.65).getHex(); // dims her embers' own colours
  const lathe = (points, texture, options) => mesh(new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), 10), texture, options);
  const robe = lathe(HABIT, t.sheet, habit);
  const cracks = lathe(HABIT.slice(1, 6).map(([r, y]) => [r + 0.006, y]), emberCracksTexture(), { unlit: true, transparent: true, depthWrite: false, color: burning });
  const guimpe = lathe([[0.085, 1.64], [0.16, 1.56], [0.27, 1.41], [0.285, 1.33]], scorchedLinenTexture(), { ...cream, color: '#a09684' }); // the cape on her shoulders, burnt from its hem
  const drape = box(t.sheet, [0.36, 0.56, 0.05], [0, 1.1, -0.17], black); // the veil down her back
  const light = new THREE.PointLight('#ff7a30', 1.0 + glow * 2.0, 4.2, 1.4);
  light.position.set(0, 0.22, 0.5);
  // Right arm: forward at the elbow, gripping the snuffer's pole (at the
  // catch the snuffer is over your light: whoever poses her places it).
  const parts = [
    robe, cracks, guimpe, drape, nunHead(t, { cream, black, burning }),
    box(t.sheet, [0.12, 0.38, 0.12], [0.27, 1.12, 0.02], habit),
    strut(t.sheet, [0.27, 1.16, 0.04], [0.31, 1.06, 0.3], [0.12, 0.12], habit),
    box(t.sheet, [0.06, 0.08, 0.06], [0.31, 1.02, 0.31], { color: '#1a1410' }),
    reach ? reachingArm(t, habit) : hangingArm(t, habit),
    light,
  ];
  if (!reach) {
    const pole = candleSnuffer(t);
    pole.position.set(0.31, 0, 0.33);
    parts.push(pole);
  }
  return group(...parts);
}

// Her head: the burnt face framed by the wimple (a band over the brow, a
// wrap under the chin), the black veil over it.
function nunHead(t, { cream, black, burning }) {
  const head = mesh(new THREE.SphereGeometry(0.1, 8, 6), t.sheet, { color: '#2b221c', flatShading: true });
  head.scale.set(0.88, 1.18, 0.95);
  const coif = mesh(new THREE.SphereGeometry(0.118, 9, 6, Math.PI * 0.68, Math.PI * 1.64, 0, Math.PI * 0.8), t.sheet, cream);
  coif.scale.set(0.95, 1.2, 1);
  const veil = mesh(new THREE.SphereGeometry(0.15, 9, 6, Math.PI * 0.76, Math.PI * 1.48, 0, Math.PI * 0.6), t.sheet, black);
  veil.scale.set(1.05, 1.45, 1.1);
  veil.position.y = 0.03;
  const headGroup = group(
    head, coif, veil,
    box(t.sheet, [0.15, 0.035, 0.03], [0, 0.062, 0.078], cream),
    box(t.sheet, [0.2, 0.03, 0.04], [0, 0.1, 0.07], black),
    box(t.sheet, [0.12, 0.05, 0.03], [0, -0.135, 0.06], cream),
    decal(burntFaceTexture(), [0.15, 0.165], [0, -0.022, 0.096], { transparent: true }),
    decal(emberFaceTexture(), [0.15, 0.165], [0, -0.022, 0.098], { transparent: true, unlit: true, color: burning, polygonOffsetFactor: -4 }),
  );
  headGroup.position.set(0, 1.74, 0.03);
  headGroup.rotation.x = 0.16; // looking down at you
  return headGroup;
}

function hangingArm(t, habit) {
  const beads = [0, 1, 2, 3, 4, 5].map((i) => box(t.sheet, [0.022, 0.022, 0.022], [-0.3, 0.56 - i * 0.05, 0.1], { color: '#3a2218' }));
  const hand = burntHand(t, 0.1);
  hand.position.set(-0.29, 0.7, 0.07);
  hand.rotation.x = Math.PI; // fingers down
  return group(
    box(t.sheet, [0.13, 0.66, 0.13], [-0.28, 0.82, 0.03], habit),
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
    strut(t.sheet, [-0.27, 1.46, 0.04], [-0.27, 1.34, 0.3], [0.12, 0.12], habit),
    strut(t.sheet, [-0.27, 1.34, 0.3], [-0.18, 1.62, 0.45], [0.1, 0.1], habit),
    hand,
  );
}

// Edith Carr, sitting on the edge of a bed with her music box in her lap,
// her head tilted to listen (she is blind). Faceless and unhurt, as every
// ghost child (scare rules). Origin: where she sits.
function ghostEdith(t, { opacity = 0.6 } = {}) {
  const ghost = { unlit: true, color: 0xd8e4ec, transparent: true, opacity, depthWrite: false, fog: false };
  const body = mesh(new THREE.CylinderGeometry(0.1, 0.17, 0.44, 7), t.sheet, ghost);
  body.position.y = 0.22;
  const head = mesh(new THREE.SphereGeometry(0.105, 7, 5), t.sheet, ghost);
  // Bobbed hair: a cap cut straight below the ears, open at the face.
  const bob = mesh(new THREE.SphereGeometry(0.128, 8, 5, Math.PI * 0.78, Math.PI * 1.44, 0, Math.PI * 0.7), t.sheet, { ...ghost, color: 0xa9b9cc, side: THREE.DoubleSide });
  bob.position.y = 0.012;
  const headGroup = group(head, bob, box(t.sheet, [0.2, 0.03, 0.03], [0, 0.05, 0.085], { ...ghost, color: 0xa9b9cc })); // and a fringe
  headGroup.position.set(0, 0.55, 0.01);
  headGroup.rotation.set(0.12, 0.4, 0.45); // one ear turned to the room
  const arm = (side) => strut(t.sheet, [side * 0.13, 0.36, 0.02], [side * 0.07, 0.13, 0.22], [0.045, 0.045], ghost);
  return group(
    body, headGroup, arm(-1), arm(1),
    box(t.sheet, [0.32, 0.1, 0.34], [0, -0.03, 0.12], ghost), // her lap
    box(t.sheet, [0.05, 0.3, 0.05], [-0.08, -0.33, 0.27], ghost),
    box(t.sheet, [0.05, 0.3, 0.05], [0.08, -0.33, 0.27], ghost),
    box(t.sheet, [0.16, 0.09, 0.12], [0, 0.07, 0.24], { ...ghost, color: 0xf0dcae, opacity: Math.min(1, opacity + 0.25) }), // the music box
    box(t.sheet, [0.05, 0.015, 0.015], [0.105, 0.11, 0.24], { ...ghost, color: 0xf0dcae, opacity: Math.min(1, opacity + 0.25) }), // its crank
  );
}

export const WARD_FIGURES = { burnedNun, candleSnuffer, ghostEdith };
