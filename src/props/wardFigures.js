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
// scorched white wimple with no face in it, embers still alive in the
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
    robe, cracks, guimpe, drape, nunHead(t, { cream, black, ember: new THREE.Color('#ff6a1a').multiplyScalar(0.4 + glow * 0.6).getHex() }),
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

// Her face is not there (owner pick 2026-11-15, "hollow"): the wimple is a
// deep well of scorched linen, burnt away down her left side, and inside it
// only the dark, the hint of a brow and jaw, and an ember far back where
// each eye was. Built in depth so the embers shift as you move.
function hollowFace(t, ember) {
  const lit = { unlit: true, color: ember };
  const hint = { color: '#120d0a', flatShading: true };
  const char = { color: '#0f0b09', flatShading: true };
  const well = (side, texture, options) => {
    const tube = mesh(new THREE.CylinderGeometry(0.106, 0.09, 0.08, 10, 1, true), texture, { ...options, side });
    tube.rotation.x = Math.PI / 2; // its axis along z, the wider end forward
    tube.scale.set(0.7, 1, 1.08);
    tube.position.set(0, -0.042, 0.092);
    return tube;
  };
  const burnt = [[0.066, -0.075, 0.1, 0.034, 0.07, -0.2], [0.058, 0.02, 0.104, 0.04, 0.045, 0.5], [0.07, -0.13, 0.096, 0.03, 0.04, 0.3]].map(([x, y, z, w, h, turn]) => {
    const piece = box(t.sheet, [w, h, 0.05], [x, y, z], char);
    piece.rotation.z = turn;
    return piece;
  });
  return [
    well(THREE.FrontSide, scorchedLinenTexture(), { color: '#8f8676', flatShading: true }),
    well(THREE.BackSide, t.sheet, { color: '#060404' }),
    box(t.sheet, [0.12, 0.024, 0.024], [0, -0.004, 0.066], hint), // a brow, barely
    box(t.sheet, [0.052, 0.022, 0.02], [0.004, -0.128, 0.062], hint), // a jaw, hanging
    ...[-1, 1].flatMap((side) => [
      box(t.sheet, [0.014, 0.012, 0.004], [side * 0.03, -0.022, 0.07], lit),
      box(t.sheet, [0.005, 0.005, 0.003], [side * 0.03, -0.017, 0.073], { unlit: true, color: '#ffd890' }),
    ]),
    ...burnt,
    ...[[0.076, -0.03, 0.128], [0.062, 0.058, 0.13], [0.07, -0.1, 0.124], [0.05, -0.15, 0.12]].map(([x, y, z]) => box(t.sheet, [0.006, 0.01, 0.004], [x, y, z], lit)), // the edge still burning
  ];
}

// Her head: the well of the wimple, a wrap under the chin, the black veil
// over it and low on her brow.
function nunHead(t, { cream, black, ember }) {
  const head = mesh(new THREE.SphereGeometry(0.1, 8, 6), t.sheet, { color: '#070504', flatShading: true });
  head.scale.set(0.8, 1.22, 0.9);
  const coif = mesh(new THREE.SphereGeometry(0.118, 9, 6, Math.PI * 0.68, Math.PI * 1.64, 0, Math.PI * 0.8), t.sheet, cream);
  coif.scale.set(0.95, 1.2, 1);
  const veil = mesh(new THREE.SphereGeometry(0.15, 9, 6, Math.PI * 0.76, Math.PI * 1.48, 0, Math.PI * 0.6), t.sheet, black);
  veil.scale.set(1.05, 1.45, 1.1);
  veil.position.y = 0.03;
  const headGroup = group(
    head, coif, veil,
    box(t.sheet, [0.2, 0.05, 0.06], [0, 0.062, 0.075], black),
    box(t.sheet, [0.12, 0.04, 0.03], [0, -0.175, 0.045], cream),
    ...hollowFace(t, ember),
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
