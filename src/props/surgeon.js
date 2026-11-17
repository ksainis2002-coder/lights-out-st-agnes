// Dr. Venn, the surgeon: the blind hunter of the basement (0.5 proposal,
// docs/DESIGN_0.5.md; mockup stills only until the owner approves him).
// Owner 2026-11-17: Dr. Venn himself, bandaged over the eyes; the first
// drawing was "not scary enough", so he is longer and thinner, stooped, the
// bandage soaked through where his eyes were and a loose end hanging, blood
// on his gloves, his apron and his gown (gore is allowed on adults). Origin
// on the floor, front facing +z. "listening": he has stopped, head turned
// and tilted towards a sound.
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

function limb(t, from, to, r, options) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const tube = mesh(new THREE.CylinderGeometry(r * 0.85, r, a.distanceTo(b), 6), t.sheet, options);
  tube.position.copy(a).lerp(b, 0.5);
  tube.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize());
  return tube;
}

const seeded = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const BLOOD = (alpha) => `rgba(46,9,7,${alpha})`; // dried dark: bright red would read as paint under a lamp

// His gown, gone grey with washing that never got the old blood out: rust
// spatters and long smears down the front (v = 1 is the shoulders).
function gownTexture() {
  const random = seeded(3);
  return canvasTexture(32, 64, (g, w, h) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const n = Math.floor(random() * 14);
        g.fillStyle = `rgb(${96 + n},${93 + n},${84 + n})`;
        g.fillRect(x, y, 1, 1);
      }
    }
    for (let i = 0; i < 10; i++) { // smears running down
      g.fillStyle = BLOOD(0.35 + random() * 0.35);
      g.fillRect(6 + random() * 20, 20 + random() * 30, 1 + random() * 3, 8 + random() * 26);
    }
    for (let i = 0; i < 60; i++) { // spatter, heaviest low on the front
      g.fillStyle = BLOOD(0.5 + random() * 0.4);
      g.fillRect(random() * w, h * 0.35 + random() * random() * h * 0.65, 1, 1);
    }
  });
}

// Black rubber, slick, smeared dark red where he wipes his hands.
function apronTexture() {
  const random = seeded(19);
  return canvasTexture(16, 32, (g, w, h) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const n = Math.floor(random() * 8);
        g.fillStyle = `rgb(${10 + n},${9 + n},${9 + n})`;
        g.fillRect(x, y, 1, 1);
      }
    }
    for (let i = 0; i < 9; i++) {
      g.fillStyle = BLOOD(0.8);
      g.fillRect(random() * w, 4 + random() * 22, 1 + random() * 2, 2 + random() * 5);
    }
    g.fillStyle = 'rgba(70,70,70,0.4)'; // the shine on wet rubber
    for (let y = 2; y < h; y += 7) g.fillRect(3, y, 1, 4);
  });
}

// The bandage: wound twice, grey with old dressings, soaked through dark
// where his eyes were, two runs down from them.
function bandageTexture() {
  const random = seeded(7);
  return canvasTexture(64, 16, (g, w, h) => {
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const n = Math.floor(random() * 16);
        g.fillStyle = `rgb(${124 + n},${118 + n},${102 + n})`;
        g.fillRect(x, y, 1, 1);
      }
    }
    g.fillStyle = 'rgba(110,100,84,0.6)';
    for (let x = 0; x < w; x += 6) g.fillRect(x, 0, 1, h); // the turns of the wrap
    for (const cx of [26, 38]) { // the eyes: soaked, then a run down each
      g.fillStyle = BLOOD(0.85);
      g.fillRect(cx - 3, 5, 7, 6);
      g.fillStyle = BLOOD(0.6);
      g.fillRect(cx - 1, 10, 2, 6);
    }
  });
}

function surgeon(t, { listening = false, tray = true } = {}) {
  const dark = { color: '#1c1a18' };
  const skin = { color: '#8a7c70', flatShading: true }; // grey under the lamp, a man who never sees daylight
  const glove = { color: '#3c1210' }; // rubber gauntlets, wet with it
  const gown = gownTexture();
  const legs = [-0.07, 0.07].flatMap((x) => [limb(t, [x, 0.74, 0], [x, 0.06, 0.03], 0.045, dark), box(t.sheet, [0.09, 0.06, 0.24], [x, 0, 0.07], dark)]);
  const skirt = mesh(new THREE.CylinderGeometry(0.16, 0.23, 0.62, 9), gown, { flatShading: true });
  skirt.position.y = 0.74;
  skirt.scale.z = 0.62;
  // Everything above the waist leans forward from it: he stoops to listen.
  const torso = mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.78, 9), gown, { flatShading: true });
  torso.position.y = 0.43;
  torso.scale.z = 0.58;
  const apron = mesh(new THREE.PlaneGeometry(0.26, 0.98), apronTexture(), { side: THREE.DoubleSide });
  apron.position.set(0, 0.0, 0.1);
  const hands = tray ? [[-0.17, -0.02, 0.34], [0.17, -0.02, 0.34]] : [[-0.22, -0.18, 0.08], [0.22, -0.18, 0.08]];
  const arms = [-1, 1].flatMap((side, i) => [
    limb(t, [side * 0.19, 0.78, 0], [side * 0.23, 0.34, 0.06], 0.04, { color: '#5e5a52' }),
    limb(t, [side * 0.23, 0.34, 0.06], hands[i], 0.036, glove),
    box(t.sheet, [0.05, 0.03, 0.09], [hands[i][0], hands[i][1] - 0.02, hands[i][2]], glove), // long fingers round the tray
  ]);
  const neck = limb(t, [0, 0.8, 0], [0, 0.96, 0.03], 0.04, skin);
  const upper = group(torso, apron, ...arms, neck, head(t, skin, listening));
  upper.position.y = 1.04;
  upper.rotation.x = 0.16;
  if (tray) {
    const held = BASEMENT_PROPS.instrumentTray(t, { held: true, bloody: true });
    held.position.set(0, -0.04, 0.38);
    upper.add(held);
  }
  return group(...legs, skirt, upper);
}

// His head: long and gaunt, grey hair thin and combed back, the bandage
// wound twice over his eyes, a loose end of it hanging at his jaw.
function head(t, skin, listening) {
  const skull = mesh(new THREE.SphereGeometry(0.1, 8, 7), t.sheet, skin);
  skull.scale.set(0.86, 1.3, 0.98);
  const hair = mesh(new THREE.SphereGeometry(0.104, 8, 5, Math.PI * 0.55, Math.PI * 1.9, 0, Math.PI * 0.5), t.sheet, { color: '#6a665e', side: THREE.DoubleSide });
  hair.position.y = 0.03;
  const wrap = bandageTexture();
  const band = mesh(new THREE.CylinderGeometry(0.094, 0.096, 0.07, 10, 1, true), wrap, { side: THREE.DoubleSide });
  band.position.set(0, 0.025, 0.004);
  band.rotation.y = Math.PI / 2;
  const band2 = band.clone();
  band2.position.y = 0.06;
  band2.rotation.z = 0.18;
  const loose = box(t.sheet, [0.03, 0.17, 0.006], [0.085, -0.15, 0.02], { color: '#7a7058' });
  loose.rotation.z = 0.15;
  const cheeks = [-1, 1].map((side) => box(t.sheet, [0.012, 0.07, 0.05], [side * 0.07, -0.08, 0.06], { color: '#6e6054' }));
  const nose = box(t.sheet, [0.02, 0.05, 0.03], [0, -0.05, 0.095], skin);
  const mouth = box(t.sheet, [0.05, 0.008, 0.01], [0, -0.1, 0.088], { color: '#1e100c' }); // a thin slit
  const ears = [-1, 1].map((side) => box(t.sheet, [0.018, 0.05, 0.03], [side * 0.088, -0.01, 0], skin));
  const g = group(skull, hair, band, band2, loose, ...cheeks, nose, mouth, ...ears);
  g.position.set(0, 1.08, 0.06);
  if (listening) g.rotation.set(0.1, 0.5, 0.36);
  else g.rotation.x = 0.1;
  return g;
}

export const SURGEON_FIGURES = { surgeon };
