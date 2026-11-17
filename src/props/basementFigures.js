// Figures of the basement (0.5 proposal, docs/DESIGN_0.5.md; mockup stills
// only until the owner approves them): Dr. Venn, the surgeon (owner pick
// 2026-11-17: the blind hunter is Dr. Venn himself, bandaged over the eyes),
// Sam Pike's ghost (faceless and unhurt like every ghost child, dark with the
// water he drowned in), and Nora Kane, alive, strapped to the surgeon's table.
// Origin on the floor (Nora: on the table top), front facing +z.
import * as THREE from 'three';
import { box, materialFor, canvasTexture } from './parts.js';
import { BASEMENT_PROPS } from './basement.js';

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

// His gown: off-white gone grey, old brown stains down the front.
function gownTexture() {
  let seed = 3;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return canvasTexture(32, 32, (g, w, h) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const n = Math.floor(random() * 12);
        g.fillStyle = `rgb(${168 + n},${164 + n},${150 + n})`;
        g.fillRect(x, y, 1, 1);
      }
    }
    for (let i = 0; i < 7; i++) {
      g.fillStyle = i % 2 ? 'rgba(90,52,34,0.55)' : 'rgba(70,40,28,0.45)';
      const x = 6 + random() * 20;
      g.fillRect(x, 8 + random() * 10, 2 + random() * 4, 6 + random() * 16);
    }
  });
}

// The bandage over his eyes: wound strips, two dark seeps where the eyes are.
function bandageTexture() {
  return canvasTexture(32, 8, (g, w, h) => {
    g.fillStyle = '#d8d2c2';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#b8b2a2';
    for (let x = 0; x < w; x += 5) g.fillRect(x, 0, 1, h);
    g.fillStyle = 'rgba(70,40,30,0.7)';
    g.fillRect(12, 3, 3, 3);
    g.fillRect(18, 3, 3, 3);
  });
}

// Dr. Venn. Tall and thin, in his gown and a rubber apron, gloved, the tray
// of instruments held before him (it clinks as he walks). "listening": he has
// stopped, head turned and tilted towards a sound.
function surgeon(t, { listening = false, tray = true } = {}) {
  const gown = { color: '#a8a498', flatShading: true }; // greyed with use, not white
  const dark = { color: '#24221f' };
  const skin = { color: '#b8a898', flatShading: true };
  const glove = { color: '#4a3a2c' };
  const gownMat = gownTexture();
  const body = mesh(new THREE.CylinderGeometry(0.17, 0.27, 1.0, 9), gownMat, gown);
  body.position.y = 1.02;
  body.scale.z = 0.7;
  const chest = mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.42, 9), gownMat, gown);
  chest.position.y = 1.7;
  chest.scale.z = 0.62;
  const apron = box(t.sheet, [0.36, 0.86, 0.02], [0, 0.66, 0.17], { color: '#1e1814' }); // black rubber
  apron.rotation.x = -0.06;
  const legs = [-0.08, 0.08].flatMap((x) => [limb(t, [x, 0.55, 0], [x, 0.06, 0.02], 0.055, dark), box(t.sheet, [0.1, 0.06, 0.2], [x, 0, 0.05], dark)]);
  const hands = tray ? [[-0.2, 1.05, 0.34], [0.2, 1.05, 0.34]] : [[-0.24, 0.95, 0.12], [0.24, 0.95, 0.12]];
  const arms = [-1, 1].flatMap((side, i) => [
    limb(t, [side * 0.21, 1.84, 0], [side * 0.26, 1.42, 0.08], 0.05, gown),
    limb(t, [side * 0.26, 1.42, 0.08], hands[i], 0.042, glove),
  ]);
  const neck = limb(t, [0, 1.9, 0], [0, 2.0, 0.01], 0.05, skin);
  const head = mesh(new THREE.SphereGeometry(0.11, 8, 6), t.sheet, skin);
  head.scale.set(0.9, 1.18, 1);
  const band = mesh(new THREE.CylinderGeometry(0.106, 0.106, 0.06, 10, 1, true), bandageTexture(), { side: THREE.DoubleSide });
  band.position.set(0, 0.02, 0.006);
  band.rotation.y = Math.PI / 2;
  const mouth = box(t.sheet, [0.05, 0.008, 0.01], [0, -0.075, 0.098], { color: '#3a2622' });
  const nose = box(t.sheet, [0.022, 0.05, 0.03], [0, -0.05, 0.1], skin);
  const ears = [-1, 1].map((side) => box(t.sheet, [0.02, 0.05, 0.03], [side * 0.1, -0.005, 0], skin));
  // Grey hair, thin, combed back from a high forehead; hollow cheeks.
  const hair = mesh(new THREE.SphereGeometry(0.114, 8, 5, Math.PI * 0.6, Math.PI * 1.8, 0, Math.PI * 0.62), t.sheet, { color: '#5a5650', side: THREE.DoubleSide });
  hair.position.y = 0.012;
  const cheeks = [-1, 1].map((side) => box(t.sheet, [0.012, 0.05, 0.04], [side * 0.075, -0.05, 0.07], { color: '#8a7a6c' }));
  const headGroup = group(head, hair, band, nose, mouth, ...ears, ...cheeks);
  headGroup.position.set(0, 2.1, 0.02);
  if (listening) headGroup.rotation.set(0.05, 0.45, 0.32);
  else headGroup.rotation.x = 0.12; // a little bowed: he listens even as he walks
  const parts = [body, chest, apron, ...legs, ...arms, neck, headGroup];
  if (tray) {
    const held = BASEMENT_PROPS.instrumentTray(t, { held: true });
    held.position.set(0, 1.05, 0.36);
    parts.push(held);
  }
  return group(...parts);
}

// Sam: a boy of ten in the home's jersey and short trousers, faceless, his
// hair flat with water, darker than the others and dripping.
function ghostSam(t, { opacity = 0.6 } = {}) {
  const ghost = { unlit: true, color: 0xa8bccc, transparent: true, opacity, depthWrite: true, fog: false, flatShading: true };
  const wet = { ...ghost, color: 0x7e94a6 };
  const jersey = mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.42, 8), t.sheet, wet);
  jersey.position.y = 0.95;
  jersey.scale.z = 0.7;
  const shorts = mesh(new THREE.CylinderGeometry(0.14, 0.15, 0.18, 8), t.sheet, wet);
  shorts.position.y = 0.66;
  shorts.scale.z = 0.75;
  const legs = [-0.06, 0.06].map((x) => limb(t, [x, 0.6, 0], [x, 0.04, 0.01], 0.034, ghost));
  const arms = [-1, 1].map((side) => limb(t, [side * 0.13, 1.12, 0], [side * 0.16, 0.72, 0.03], 0.03, wet));
  const head = mesh(new THREE.SphereGeometry(0.1, 8, 6), t.sheet, ghost);
  head.position.y = 1.3;
  head.scale.set(0.95, 1.05, 1);
  const hair = mesh(new THREE.SphereGeometry(0.108, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.42), t.sheet, { ...wet, color: 0x5a6e80 });
  hair.position.y = 1.31;
  const drops = [[-0.16, 0.55], [0.17, 0.48], [-0.15, 0.3], [0.06, 0.2]].map(([x, y]) => box(t.sheet, [0.012, 0.03, 0.012], [x, y, 0.03], { ...ghost, opacity: 0.8 }));
  return group(jersey, shorts, ...legs, ...arms, head, hair, ...drops);
}

// Nora's face: alive, eyes wide, looking up at the lamp.
function noraFaceTexture() {
  return canvasTexture(32, 32, (g, w, h) => {
    g.fillStyle = '#c8a890';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#5a3a2a'; // brows, raised
    g.fillRect(7, 9, 7, 2);
    g.fillRect(18, 9, 7, 2);
    g.fillStyle = '#f0ece4';
    g.fillRect(8, 13, 6, 4);
    g.fillRect(18, 13, 6, 4);
    g.fillStyle = '#2a2622';
    g.fillRect(10, 13, 3, 3);
    g.fillRect(20, 13, 3, 3);
    g.fillStyle = '#a8806a'; // the nose's shadow
    g.fillRect(15, 17, 2, 5);
    g.fillStyle = '#6a3a34'; // the mouth, open a little
    g.fillRect(13, 24, 6, 2);
  });
}

// Nora Kane on her back on the table (head towards -z), strapped down at the
// chest, the hips and the knees: a woman of about thirty in a wax jacket and
// jeans, her hair dark and tied back. Sits on the table top.
function noraStrapped(t) {
  const jacket = { color: '#5a5a3c', flatShading: true };
  const jeans = { color: '#2a3446' };
  const skin = { color: '#c8a890', flatShading: true };
  const hair = { color: '#2a1e18' };
  const torso = mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.6, 8), t.sheet, jacket);
  torso.rotation.x = Math.PI / 2;
  torso.scale.x = 1.15;
  torso.position.set(0, 0.11, -0.25);
  const legs = [-0.08, 0.08].flatMap((x) => [limb(t, [x, 0.09, 0.05], [x, 0.08, 0.85], 0.065, jeans), box(t.sheet, [0.09, 0.14, 0.08], [x, 0.03, 0.9], { color: '#3a2a20' })]);
  const arms = [-1, 1].map((side) => limb(t, [side * 0.21, 0.1, -0.45], [side * 0.2, 0.07, 0.08], 0.045, jacket));
  const head = mesh(new THREE.SphereGeometry(0.1, 8, 6), t.sheet, skin);
  head.position.set(0, 0.12, -0.67);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.15), materialFor(noraFaceTexture(), { transparent: true }));
  face.rotation.x = -Math.PI / 2;
  face.position.set(0, 0.222, -0.68);
  const back = mesh(new THREE.SphereGeometry(0.106, 8, 5, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55), t.sheet, hair);
  back.position.set(0, 0.12, -0.67);
  const tail = box(t.sheet, [0.05, 0.04, 0.16], [0, 0.04, -0.82], hair);
  return group(torso, ...legs, ...arms, head, face, back, tail);
}

export const BASEMENT_FIGURES = { surgeon, ghostSam, noraStrapped };
