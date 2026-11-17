// Dr. Venn, the surgeon: the blind hunter of the basement (0.5 proposal,
// docs/DESIGN_0.5.md; mockup stills only until the owner approves him).
// Owner 2026-11-17: Dr. Venn himself, bandaged over the eyes; not scary
// enough, then too much gore; then, in the spirit of a doctor from another
// game the owner likes (our own, not a copy): a man who has done things to
// himself and moves wrong, a tall ruined white coat, and he drives you mad.
// So: a long filthy coat, sleeves past his wrists; a head mirror strapped
// over the bandage; the bandage slipped on one side, the eye under it stitched
// shut; his jaw hanging open and askew; his head cocked too far, one shoulder
// high, long fingers splayed; his tray of clean, glinting instruments. Origin
// on the floor, front facing +z. "listening": stopped, head turned and
// cocked further towards a sound.
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

// The coat: white gone to grime, grey and brown, darker at the hem and the
// cuffs where it drags and where his hands go (v = 1 is the collar).
function coatTexture() {
  const random = seeded(5);
  return canvasTexture(32, 64, (g, w, h) => {
    for (let y = 0; y < h; y++) {
      const grime = Math.max(0, (y - 40) * 2.2); // dirtier towards the hem (the canvas bottom)
      for (let x = 0; x < w; x++) {
        const n = Math.floor(random() * 16);
        g.fillStyle = `rgb(${150 + n - grime},${146 + n - grime},${132 + n - grime * 1.1})`;
        g.fillRect(x, y, 1, 1);
      }
    }
    for (let i = 0; i < 9; i++) { // old brown stains, a grey water mark
      g.fillStyle = i % 3 ? 'rgba(90,70,50,0.35)' : 'rgba(60,60,60,0.3)';
      g.fillRect(random() * w, 14 + random() * 40, 2 + random() * 5, 3 + random() * 8);
    }
  });
}

// The bandage, slipped down on his left: a band of old dressing.
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
    for (let x = 0; x < w; x += 6) g.fillRect(x, 0, 1, h);
  });
}

function surgeon(t, { listening = false, tray = true } = {}) {
  const dark = { color: '#1c1a18' };
  const coat = coatTexture();
  const legs = [-0.07, 0.07].flatMap((x) => [limb(t, [x, 0.74, 0], [x, 0.06, 0.03], 0.045, dark), box(t.sheet, [0.09, 0.06, 0.24], [x, 0, 0.07], dark)]);
  // The coat hangs open at the front from the shoulders to his calves.
  const coatGeometry = new THREE.CylinderGeometry(0.19, 0.29, 1.34, 12, 1, true, 0.42, Math.PI * 2 - 0.84); // the gap faces +z
  const longCoat = mesh(coatGeometry, coat, { side: THREE.DoubleSide, flatShading: true });
  longCoat.scale.z = 0.64;
  longCoat.position.y = 0.67;
  const under = mesh(new THREE.CylinderGeometry(0.15, 0.17, 1.1, 8), t.sheet, { color: '#3a3832' }); // the gown and black apron inside it
  under.scale.z = 0.55;
  under.position.y = 0.55;
  const lower = group(longCoat, under);
  lower.position.y = 0.6;
  // Above the waist he leans forward, one shoulder higher than the other.
  const sleeve = { color: '#8e8a7c' };
  const glove = { color: '#1a1816' };
  const tilt = 0.09;
  const left = [ // the tray in his left hand, low and to the side
    limb(t, [0.19, 0.78, 0], [0.24, 0.36, 0.08], 0.05, sleeve),
    limb(t, [0.24, 0.36, 0.08], [0.2, 0.06, 0.26], 0.047, sleeve), // the sleeve, past his wrist
    ...fingers(t, [0.2, 0.03, 0.29], glove, 0.3),
  ];
  const right = [ // the right arm bent out at the elbow, fingers splayed and reaching
    limb(t, [-0.2, 0.82, 0], [-0.34, 0.5, 0.02], 0.05, sleeve),
    limb(t, [-0.34, 0.5, 0.02], [-0.3, 0.16, 0.16], 0.047, sleeve),
    ...fingers(t, [-0.3, 0.12, 0.18], glove, -0.4),
  ];
  const chest = mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.82, 10, 1, true, 0.3, Math.PI * 2 - 0.6), coat, { side: THREE.DoubleSide, flatShading: true });
  chest.scale.z = 0.6;
  chest.position.y = 0.42;
  const gown = mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.8, 8), t.sheet, { color: '#3a3832' }); // seen down the open front
  gown.scale.z = 0.52;
  gown.position.y = 0.42;
  const neck = limb(t, [0, 0.82, 0], [0.02, 0.98, 0.04], 0.04, { color: '#8a7c70' });
  const upper = group(chest, gown, ...left, ...right, neck, head(t, listening));
  upper.position.y = 1.0;
  upper.rotation.set(0.18, 0, tilt);
  if (tray) {
    const held = BASEMENT_PROPS.instrumentTray(t, { held: true, glint: true });
    held.scale.setScalar(0.85);
    held.position.set(0.24, 0.03, 0.32);
    held.rotation.set(0.25, 0.3, -0.2); // tipped: it rattles as he walks
    upper.add(held);
  }
  return group(...legs, lower, upper);
}

// Long gloved fingers, splayed, from the end of a sleeve.
function fingers(t, at, options, turn) {
  return [-0.024, -0.008, 0.008, 0.024].map((x, i) => {
    const finger = box(t.sheet, [0.012, 0.1 + (i % 2) * 0.02, 0.012], [at[0] + x, at[1] - 0.1, at[2]], options);
    finger.rotation.z = turn * 0.3 + (i - 1.5) * 0.12;
    return finger;
  });
}

// His head: long and grey, hair thin; a head mirror strapped over the
// bandage; the bandage slipped on his left, the eye under it stitched shut;
// the jaw hanging open and to one side; cocked too far.
function head(t, listening) {
  const skin = { color: '#8a7c70', flatShading: true };
  const skull = mesh(new THREE.SphereGeometry(0.1, 10, 8), t.sheet, skin);
  skull.scale.set(0.86, 1.3, 0.98);
  const hair = mesh(new THREE.SphereGeometry(0.104, 10, 5, Math.PI * 0.55, Math.PI * 1.9, 0, Math.PI * 0.5), t.sheet, { color: '#6a665e', side: THREE.DoubleSide });
  hair.position.y = 0.03;
  const band = mesh(new THREE.CylinderGeometry(0.094, 0.096, 0.07, 12, 1, true), bandageTexture(), { side: THREE.DoubleSide });
  band.position.set(0, 0.03, 0.004);
  band.rotation.set(0, Math.PI / 2, -0.22); // slipped down on his left
  const loose = box(t.sheet, [0.03, 0.17, 0.006], [-0.085, -0.15, 0.02], { color: '#7a7058' });
  loose.rotation.z = -0.15;
  // Where it slipped: the eye stitched shut, a dark seam and three stitches.
  const seam = box(t.sheet, [0.036, 0.005, 0.006], [0.036, -0.005, 0.092], { color: '#2a1a16' });
  const stitches = [0.024, 0.036, 0.048].map((x) => box(t.sheet, [0.004, 0.016, 0.004], [x, -0.012, 0.094], { color: '#1a1210' }));
  // The head mirror on its strap, over the bandage: a disc that catches your light.
  const strap = mesh(new THREE.CylinderGeometry(0.104, 0.104, 0.018, 12, 1, true), t.sheet, { color: '#2a2622', side: THREE.DoubleSide });
  strap.position.y = 0.085;
  const mirror = mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.008, 12), t.iron, { color: '#e8ecf0', unlit: true });
  mirror.rotation.x = Math.PI / 2 - 0.35;
  mirror.position.set(-0.02, 0.1, 0.11);
  const nose = box(t.sheet, [0.02, 0.05, 0.03], [0, -0.05, 0.095], skin);
  const mouth = box(t.sheet, [0.046, 0.04, 0.012], [0.008, -0.12, 0.086], { color: '#140a08' }); // the jaw hangs open
  const jaw = box(t.sheet, [0.07, 0.024, 0.06], [0.014, -0.16, 0.055], skin);
  jaw.rotation.z = 0.12; // and off to one side
  const cheeks = [-1, 1].map((side) => box(t.sheet, [0.012, 0.07, 0.05], [side * 0.07, -0.08, 0.06], { color: '#6e6054' }));
  const ears = [-1, 1].map((side) => box(t.sheet, [0.018, 0.05, 0.03], [side * 0.088, -0.01, 0], skin));
  const g = group(skull, hair, band, loose, seam, ...stitches, strap, mirror, nose, mouth, jaw, ...cheeks, ...ears);
  g.position.set(0.02, 1.1, 0.06);
  g.rotation.set(0.12, listening ? 0.55 : 0.1, listening ? 0.62 : 0.42); // cocked too far, always
  return g;
}

export const SURGEON_FIGURES = { surgeon };
