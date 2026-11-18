// Dr. Venn, the surgeon: the blind hunter of the basement (0.5 proposal,
// docs/DESIGN_0.5.md; mockup stills only until the owner approves him).
// Owner 2026-11-17: Dr. Venn himself, bandaged over the eyes; a ruined white
// coat, a man who has done things to himself and moves wrong, who drives you
// mad. Fifth pass (owner: too blocky, the face not scary, the pose not
// threatening, the collar crooked, no tray): every part smooth and sculpted;
// he looms, hunched forward over you, a long knife raised in his right hand,
// his left reaching for you, long gloved fingers spread; the coat even on
// both sides, its lapels open at the throat, buttoned to a belt of
// instruments that clink as he walks, open below it and torn at the hem. The
// head is in surgeonHead.js. Origin on the floor, front facing +z.
// "listening": stopped, head turned and cocked towards a sound; "facing":
// how far his head turns to his right (to you, when you stand off to his side).
import * as THREE from 'three';
import { materialFor, canvasTexture } from './parts.js';
import { sweepGeometry, strapGeometry, handGroup } from './sculpt.js';
import { venn } from './surgeonHead.js';
import { beltTools, steelTexture } from './surgeonTools.js';

const seeded = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const v = (...p) => new THREE.Vector3(...p);

function mesh(geometry, texture, options) {
  return new THREE.Mesh(geometry, materialFor(texture, options));
}

// White gone to grime, grey and brown, darker towards the hem where it
// drags; old stains. Canvas top is the collar; the left and right edges are
// the front edges of the coat.
function grime(g, w, h, random, { from = 36, folds = 14, stains = 14 } = {}) {
  for (let y = 0; y < h; y++) {
    const dirt = Math.max(0, (y - from) * 2.4);
    for (let x = 0; x < w; x++) {
      const n = Math.floor(random() * 14) + Math.sin((x / w) * Math.PI * folds) * 9;
      g.fillStyle = `rgb(${160 + n - dirt},${156 + n - dirt},${142 + n - dirt * 1.1})`;
      g.fillRect(x, y, 1, 1);
    }
  }
  for (let i = 0; i < stains; i++) {
    g.fillStyle = i % 3 ? 'rgba(96,74,52,0.35)' : 'rgba(62,62,62,0.3)';
    g.fillRect(random() * w, 14 + random() * (h - 18), 2 + random() * 5, 3 + random() * 9);
  }
}

function coatTexture() {
  const random = seeded(5);
  return canvasTexture(64, 64, (g, w, h) => {
    grime(g, w, h, random);
    g.fillStyle = 'rgba(40,36,30,0.5)';
    g.fillRect(0, 0, 1, h); // the front edges, worn
    g.fillRect(w - 1, 0, 1, h);
    g.fillRect(0, 8, w, 1); // where the collar turns down
    g.fillStyle = 'rgba(30,26,22,0.8)';
    [29, 34].forEach((y) => g.fillRect(w - 4, y, 2, 2)); // two buttons above the belt
  });
}

// The sleeves: creased at the elbow, grey with dirt at the cuff.
function sleeveTexture() {
  const random = seeded(9);
  return canvasTexture(32, 32, (g, w, h) => {
    grime(g, w, h, random, { from: 22, folds: 4, stains: 3 });
    g.fillStyle = 'rgba(70,66,58,0.25)';
    g.fillRect(0, 14, w, 2); // a crease at the elbow
  });
}

// Down his spine from the collar to the hem: hunched over at the top.
const SPINE = [[0, 1.66, 0.42], [0, 1.625, 0.375], [0, 1.56, 0.29], [0, 1.4, 0.14], [0, 1.17, 0.03], [0, 0.95, 0], [0, 0.66, 0], [0, 0.32, 0]];
const COAT = [[0.07, 0.066], [0.088, 0.082], [0.235, 0.155], [0.212, 0.158], [0.172, 0.13], [0.205, 0.15], [0.25, 0.19], [0.3, 0.235]];
const OPEN = [0.55, 0.5, 0.62, 0.25, 0.04, 0.22, 0.6, 1.0]; // a V at the throat, buttoned to the belt, parting below
const WAIST = 4 / 7;

function coat(t) {
  const folds = (theta, u) => 1 + (u > WAIST ? (u - WAIST) * 0.2 : 0.01) * Math.sin(theta * 7 + 1.1) + 0.012 * Math.sin(theta * 13);
  const shell = mesh(sweepGeometry(SPINE, COAT, { radial: 30, steps: 3, gap: OPEN, shape: folds, ragged: 0.06 }), coatTexture(), { side: THREE.DoubleSide });
  const gown = mesh(sweepGeometry(SPINE.slice(1, 7), COAT.slice(1, 7).map(([x, z]) => [x * 0.9, z * 0.9]), { radial: 12, steps: 3 }), t.sheet, { color: '#2e2c28' });
  return [shell, gown];
}

// A sleeve from the shoulder past the wrist, the cuff wide and open, the
// glove's long cuff inside it.
function sleeve(t, shoulder, elbow, wrist) {
  const cuff = wrist.clone().add(wrist.clone().sub(elbow).setLength(0.035));
  const geometry = sweepGeometry([shoulder, elbow, wrist, cuff], [[0.072, 0.066], 0.058, 0.058, 0.066], { radial: 10, steps: 4, caps: false });
  const inside = elbow.clone().lerp(wrist, 0.85);
  const gauntlet = sweepGeometry([inside, wrist, cuff.clone().add(wrist.clone().sub(elbow).setLength(0.02))], [0.04, 0.042, 0.04], { radial: 8, steps: 2 });
  return [mesh(geometry, sleeveTexture(), { side: THREE.DoubleSide }), mesh(gauntlet, t.sheet, GLOVE)];
}

// Turn a hand so its fingers point one way, its palm facing another.
function aim(hand, fingers, palm) {
  const z = fingers.clone().normalize();
  const y = palm.clone().negate().addScaledVector(z, palm.dot(z)).normalize();
  hand.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3().crossVectors(y, z), y, z));
}

const GLOVE = { color: '#2c2a28' };
const STEEL = { color: '#ffffff', unlit: true }; // clean steel that catches your light

// His right arm raised, a long amputation knife in his fist, the blade across over his head.
function knifeArm(t) {
  const shoulder = v(-0.21, 1.57, 0.29), elbow = v(-0.47, 1.76, 0.26), wrist = v(-0.4, 1.99, 0.4);
  const fist = handGroup(materialFor(t.sheet, GLOVE), { thumb: 1, curl: 1.25, spread: 0.02, length: 1.15 });
  const handle = mesh(sweepGeometry([[-0.07, -0.02, 0.055], [0.05, -0.02, 0.055]], [0.012, 0.011], { radial: 6, front: [0, 1, 0] }), t.sheet, { color: '#241a14' });
  const blade = sweepGeometry([[0.05, -0.02, 0.055], [0.24, -0.02, 0.055], [0.4, -0.02, 0.055]], [[0.003, 0.021], [0.003, 0.018], [0.001, 0.002]], { radial: 4, front: [0, 0, 1] });
  fist.add(handle, mesh(blade, steelTexture(), STEEL));
  fist.position.copy(wrist.clone().add(wrist.clone().sub(elbow).setLength(0.03)));
  const fingers = wrist.clone().sub(elbow);
  aim(fist, fingers, v(1, 0.1, 0.3).cross(fingers)); // the blade, on the thumb side, across over his head
  return [...sleeve(t, shoulder, elbow, wrist), fist];
}

// His left arm reaching for you, the long fingers spread and crooked.
function reachingArm(t) {
  const shoulder = v(0.21, 1.57, 0.3), elbow = v(0.34, 1.42, 0.5), wrist = v(0.22, 1.42, 0.76);
  const hand = handGroup(materialFor(t.sheet, GLOVE), { thumb: -1, curl: 0.42, spread: 0.26, length: 1.4, width: 1.1 });
  hand.position.copy(wrist.clone().add(wrist.clone().sub(elbow).setLength(0.03)));
  aim(hand, v(-0.15, 0.45, 1), v(0, -0.9, 0.42));
  return [...sleeve(t, shoulder, elbow, wrist), hand];
}

// Long legs in black trousers, the left one forward, in old black shoes.
function legs(t) {
  return [[0.1, 0.16, 0], [-0.1, -0.15, 0.03]].flatMap(([x, stride, heel]) => {
    const hip = [x, 0.98, 0], knee = [x * 1.08, 0.54, stride * 0.7 + 0.03], ankle = [x * 1.12, 0.1 + heel, stride];
    const leg = mesh(sweepGeometry([hip, knee, ankle], [0.078, 0.056, 0.046], { radial: 8, steps: 4 }), t.sheet, { color: '#22201e' });
    const foot = [[ankle[0], 0.05 + heel, ankle[2] - 0.05], [ankle[0], 0.06 + heel / 2, ankle[2] + 0.04], [ankle[0], 0.035, ankle[2] + 0.17]];
    const shoe = mesh(sweepGeometry(foot, [[0.042, 0.04], [0.046, 0.036], [0.036, 0.022]], { radial: 8, steps: 3, front: [0, 1, 0] }), t.sheet, { color: '#141210' });
    return [leg, shoe];
  });
}

// The belt round his waist: worn leather, a steel buckle, his instruments.
function belt(t) {
  const [rx, rz] = [COAT[4][0] + 0.014, COAT[4][1] + 0.014];
  const around = (a, out = 0, y = 1.17) => v(Math.cos(a) * (rx + out), y - 0.012 * Math.sin(a), 0.03 + Math.sin(a) * (rz + out));
  const loop = Array.from({ length: 16 }, (_, i) => around((i / 16) * Math.PI * 2));
  const strap = mesh(strapGeometry(loop, 0.06, 0.012, { across: [0, 1, 0], closed: true }), t.sheet, { color: '#3e2c1e', flatShading: true });
  const buckle = mesh(new THREE.BoxGeometry(0.052, 0.05, 0.01), t.iron, { color: '#8e8a80' });
  buckle.position.copy(around(Math.PI / 2, 0.006));
  return [strap, buckle, ...beltTools(t, around, STEEL)];
}

function surgeon(t, { listening = false, facing = 0 } = {}) {
  const neck = mesh(sweepGeometry([[0, 1.56, 0.36], [0, 1.62, 0.44], [0, 1.67, 0.5]], [[0.05, 0.046], 0.043, 0.041], { radial: 8, steps: 3 }), t.sheet, { color: '#7a7c74' });
  const head = venn(t);
  head.position.set(0.0, 1.75, 0.56); // jutting forward, low between his shoulders
  head.rotation.set(0.22, listening ? 0.6 : -0.08 - facing, listening ? 0.62 : 0.3, 'YXZ'); // cocked too far, always
  return new THREE.Group().add(...coat(t), ...legs(t), ...belt(t), ...knifeArm(t), ...reachingArm(t), neck, head);
}

// His catch (ai/surgeon.js): over you, his face in yours, framed and lit as
// the approved close-up (surgeon_face: 0.9 m off, looking up into the
// bandage, lit from above and aside), for the moment before the dark.
function surgeonCatch(t) {
  const him = surgeon(t);
  const above = new THREE.PointLight('#d8c8a0', 2.2, 4, 1.3);
  above.position.set(-0.24, 2.5, -0.5);
  const aside = new THREE.PointLight('#8a9ac8', 1.2, 4, 1.3);
  aside.position.set(0.7, 1.4, 0.95);
  const onBandage = new THREE.PointLight('#9aa8c8', 0.9, 2.4, 1.3);
  onBandage.position.set(0, 2.0, 1.0);
  const pose = new THREE.Group().add(him, above, aside, onBandage);
  pose.userData.grab = { from: 0.9, pitch: 0.28, roll: -0.04 }; // how the collapse frames him (sanity/collapse.js)
  return pose;
}

export const SURGEON_FIGURES = { surgeon, surgeonCatch };
