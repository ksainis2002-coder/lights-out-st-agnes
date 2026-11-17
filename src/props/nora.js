// Nora Kane on the surgeon's table (0.5 proposal, docs/DESIGN_0.5.md; mockup
// stills only until the owner approves her). Owner 2026-11-17, fifth pass:
// still doll-like (a tube body, stick limbs), the face odd, bald with a black
// smudge, the straps like planks. Now built smooth, in layers: a woman of
// about thirty and ordinary build in an open waxed jacket over a knitted
// jumper, jeans and boots, on her back with her head towards -z; her head
// lifted and turned to you (her right, -x); her back arched, her right knee
// drawn up, her fists clenched against the cuffs. Leather straps with steel
// buckles cross her chest, her hips and her shins and go under the table's
// edge. Her head and hair are in noraHead.js. Origin on the table top (the
// table is 0.7 m wide).
import * as THREE from 'three';
import { materialFor, canvasTexture } from './parts.js';
import { sweepGeometry, strapGeometry, handGroup } from './sculpt.js';
import { noraHead } from './noraHead.js';
import { hairFall } from './noraHair.js';

const seeded = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const v = (...p) => new THREE.Vector3(...p);

// Cloth: a base colour with fine noise and creases running one way.
function cloth(rgb, { seed = 3, ribs = 0, creases = 6 } = {}) {
  const random = seeded(seed);
  return canvasTexture(32, 32, (g, w, h) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const n = Math.floor(random() * 12) - (ribs && x % ribs === 0 ? 14 : 0);
        g.fillStyle = `rgb(${rgb[0] + n},${rgb[1] + n},${rgb[2] + n})`;
        g.fillRect(x, y, 1, 1);
      }
    }
    g.fillStyle = 'rgba(0,0,0,0.18)';
    for (let i = 0; i < creases; i++) g.fillRect(0, Math.floor(random() * h), w, 1);
  });
}

const TEXTURES = () => ({
  jumper: cloth([132, 120, 100], { seed: 5, ribs: 3 }),
  jacket: cloth([86, 84, 56], { seed: 7, creases: 9 }),
  jeans: cloth([58, 70, 96], { seed: 9, creases: 5 }),
  boots: cloth([70, 48, 32], { seed: 11, creases: 2 }),
  leather: cloth([92, 60, 36], { seed: 13, creases: 1 }),
  skin: cloth([176, 138, 116], { seed: 15, creases: 0 }),
});

function mesh(geometry, texture, options) {
  return new THREE.Mesh(geometry, materialFor(texture, options));
}

// Hips to shoulders, the chest lifted off the table.
const SPINE = [[0, 0.1, 0.0], [0, 0.1, -0.19], [0, 0.128, -0.32], [0, 0.128, -0.42], [0, 0.112, -0.52]];
const BODY = [[0.172, 0.1], [0.138, 0.088], [0.152, 0.108], [0.166, 0.104], [0.17, 0.072]];

function torso(tex) {
  const jumper = mesh(sweepGeometry(SPINE, BODY, { radial: 14, steps: 3, front: [0, 1, 0] }), tex.jumper);
  const open = [1.5, 1.3, 1.1, 0.95, 0.8]; // the jacket open over her front, its sides fallen to the table
  const sides = (theta) => 1 + 0.18 * Math.max(0, -Math.sin(theta)) ** 2;
  const jacket = mesh(sweepGeometry(SPINE, BODY.map(([x, y]) => [x * 1.1, y * 1.12]), { radial: 18, steps: 3, front: [0, 1, 0], gap: open, shape: sides }), tex.jacket, { side: THREE.DoubleSide });
  const collar = mesh(sweepGeometry([[-0.1, 0.13, -0.52], [0, 0.07, -0.56], [0.1, 0.13, -0.52]], [0.02, 0.022, 0.02], { radial: 6, steps: 3 }), tex.leather, { color: '#8a6a50' });
  return [jumper, jacket, collar];
}

// Her arms down her sides in the jacket's sleeves, fists clenched in the cuffs.
function arms(tex) {
  return [-1, 1].flatMap((side) => {
    const shoulder = v(side * 0.17, 0.1, -0.5), elbow = v(side * 0.245, 0.11, -0.27), wrist = v(side * 0.235, 0.065, -0.05);
    const sleeve = mesh(sweepGeometry([shoulder, elbow, wrist], [0.058, 0.05, 0.044], { radial: 10, steps: 4, front: [0, 1, 0] }), tex.jacket);
    const fist = handGroup(materialFor(tex.skin), { thumb: -side, curl: 1.2, spread: 0.02, length: 0.85, width: 0.85 });
    fist.position.copy(wrist).add(v(0, 0, 0.01));
    fist.quaternion.setFromUnitVectors(v(0, 0, 1), wrist.clone().sub(elbow).normalize());
    fist.rotateZ(side * Math.PI / 2); // knuckles out, fingers curled in
    const cuff = mesh(strapGeometry(ring(wrist.clone().add(v(0, 0, 0.03)), 0.046), 0.04, 0.008, { across: [0, 0, 1], closed: true }), tex.leather, { flatShading: true });
    const tether = mesh(strapGeometry([[side * 0.27, 0.06, -0.02], [side * 0.33, 0.03, -0.02], [side * 0.355, -0.03, -0.02]], 0.035, 0.006, { across: [0, 0, 1] }), tex.leather, { flatShading: true });
    return [sleeve, fist, cuff, tether];
  });
}

// A loop round a point, square to the body's length (a cuff).
function ring(centre, r) {
  return Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    return [centre.x + Math.cos(a) * r, centre.y + Math.sin(a) * r * 0.8, centre.z];
  });
}

// Jeans and boots: the left leg straight, the right knee drawn up, the foot flat.
function legs(tex) {
  const right = [[-0.09, 0.09, -0.01], [-0.1, 0.27, 0.3], [-0.105, 0.075, 0.6]];
  const left = [[0.09, 0.09, -0.01], [0.1, 0.095, 0.37], [0.1, 0.07, 0.74]];
  const jeans = [right, left].map((path) => mesh(sweepGeometry(path, [[0.09, 0.08], 0.062, 0.05], { radial: 10, steps: 4, front: [0, 1, 0] }), tex.jeans));
  const flat = [[-0.105, 0.08, 0.6], [-0.105, 0.045, 0.66], [-0.105, 0.04, 0.82]];
  const upright = [[0.1, 0.075, 0.74], [0.1, 0.06, 0.8], [0.1, 0.15, 0.83], [0.1, 0.23, 0.81]];
  const boots = [mesh(sweepGeometry(flat, [0.052, 0.05, 0.034], { radial: 8, steps: 3, front: [0, 1, 0] }), tex.boots),
    mesh(sweepGeometry(upright, [0.052, 0.05, 0.045, 0.03], { radial: 8, steps: 3, front: [0, 0, 1] }), tex.boots)];
  return [...jeans, ...boots];
}

// A strap over her at z: up from under the table's edge, over the profile
// [x, y] points, down under the other edge; a steel buckle on your side.
function strap(tex, t, z, profile) {
  const points = [[-0.37, -0.045], [-0.36, 0.02], ...profile, [0.36, 0.02], [0.37, -0.045]].map(([x, y]) => [x, y, z]);
  const band = mesh(strapGeometry(points, 0.055, 0.007, { across: [0, 0, 1] }), tex.leather, { flatShading: true });
  const [bx, by] = profile[1];
  const buckle = mesh(new THREE.BoxGeometry(0.03, 0.014, 0.066), t.iron, { color: '#b8bcc0' });
  buckle.position.set(bx, by + 0.008, z);
  buckle.rotation.z = -0.6;
  return [band, buckle];
}

function straps(tex, t) {
  return [
    ...strap(tex, t, -0.38, [[-0.31, 0.12], [-0.25, 0.17], [-0.14, 0.235], [0, 0.248], [0.14, 0.235], [0.25, 0.17], [0.31, 0.12]]), // over her chest and arms
    ...strap(tex, t, -0.08, [[-0.24, 0.12], [-0.18, 0.18], [-0.08, 0.205], [0, 0.208], [0.08, 0.205], [0.18, 0.18], [0.24, 0.12]]), // over her hips
    ...strap(tex, t, 0.6, [[-0.2, 0.06], [-0.16, 0.12], [-0.1, 0.14], [-0.02, 0.1], [0.04, 0.105], [0.1, 0.13], [0.16, 0.1]]), // over her shins
  ];
}

function noraStrapped(t, { turn = 0.6, lift = 0.65, look = 'terrified' } = {}) {
  const tex = TEXTURES();
  const neck = mesh(sweepGeometry([[0, 0.112, -0.53], [-0.015, 0.15, -0.59], [-0.03, 0.17, -0.625]], [0.048, 0.044, 0.044], { radial: 8, steps: 3 }), tex.skin);
  const head = noraHead(t, { look });
  head.position.set(-0.04, 0.19, -0.67); // straining up off the table
  const lifted = new THREE.Quaternion().setFromAxisAngle(v(1, 0, 0), -Math.PI / 2 + lift);
  head.quaternion.setFromAxisAngle(v(0, 0, 1), turn).multiply(lifted); // lifted off the table, turned to you
  return new THREE.Group().add(...torso(tex), ...arms(tex), ...legs(tex), ...straps(tex, t), neck, head, ...hairFall(head));
}

export const NORA_FIGURES = { noraStrapped };
