// Nora Kane on the surgeon's table (0.5 proposal, docs/DESIGN_0.5.md; mockup
// stills only until the owner approves her). Owner 2026-11-17, fifth pass:
// still doll-like (a tube body, stick limbs), the face odd, bald with a black
// smudge, the straps like planks. Now built smooth, in layers: a woman of
// about thirty and ordinary build in an open waxed jacket over a knitted
// jumper, jeans and boots, on her back with her head towards -z; her head
// lifted to look down the table at you; her back arched, her right knee
// drawn up, her fists clenched against the cuffs. Leather straps with steel
// buckles cross her chest, her hips and her shins and go under the table's
// edge. Owner, eighth pass: "still fake, like a mannequin": her skin is
// living skin (noraFace.js), her neck strains, her clothes have weave,
// wear and creases. Her head and hair are in noraHead.js and noraHair.js.
// Origin on the table top (the table is 0.7 m wide).
import * as THREE from 'three';
import { materialFor, canvasTexture } from './parts.js';
import { sweepGeometry, strapGeometry, handGroup } from './sculpt.js';
import { noraHead } from './noraHead.js';
import { hairFall } from './noraHair.js';
import { noraSkinTexture } from './noraFace.js';

const seeded = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const v = (...p) => new THREE.Vector3(...p);

// Cloth, so it reads as cloth and not as a painted doll: every texture has
// a weave, wear and creases. `pattern(x, y)` darkens the weave.
function cloth(rgb, { seed = 3, size = 64, pattern = () => 0, creases = 6, shine = 0 } = {}) {
  const random = seeded(seed);
  return canvasTexture(size, size, (g, w, h) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const n = Math.floor(random() * 12) - pattern(x, y);
        g.fillStyle = `rgb(${rgb[0] + n},${rgb[1] + n},${rgb[2] + n})`;
        g.fillRect(x, y, 1, 1);
      }
    }
    for (let i = 0; i < creases; i++) { // a crease: a dark line, a little light along one side of it
      const x0 = random() * w, y0 = random() * h, a = random() * Math.PI, length = 8 + random() * 22;
      const x1 = x0 + Math.cos(a) * length, y1 = y0 + Math.sin(a) * length;
      g.strokeStyle = 'rgba(20,18,12,0.32)';
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1, y1);
      g.stroke();
      g.strokeStyle = `rgba(230,226,200,${0.08 + shine})`;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x0 + 1.5, y0 + 1.5);
      g.lineTo(x1 + 1.5, y1 + 1.5);
      g.stroke();
    }
  });
}

const KNIT = (x, y) => ((y + Math.abs((x % 4) - 1.5)) % 3 < 1 ? 16 : 0) + (x % 8 === 0 ? 10 : 0); // rows of small Vs, ribbed
const TWILL = (x, y) => ((x + y) % 4 < 1 ? 12 : 0); // denim's diagonal

export const noraTextures = () => ({
  jumper: cloth([136, 122, 100], { seed: 5, pattern: KNIT, creases: 4 }),
  jacket: cloth([80, 80, 52], { seed: 7, creases: 16, shine: 0.12 }),
  jeans: cloth([60, 72, 98], { seed: 9, pattern: TWILL, creases: 8 }),
  boots: cloth([70, 48, 32], { seed: 11, creases: 6, shine: 0.1 }),
  leather: cloth([92, 60, 36], { seed: 13, size: 32, creases: 2 }),
  hands: noraSkinTexture(),
  neck: noraSkinTexture({ flush: 1, shade: 0.55 }),
});

export function mesh(geometry, texture, options) {
  return new THREE.Mesh(geometry, materialFor(texture, options));
}

// Hips to shoulders, the chest lifted off the table.
const SPINE = [[0, 0.1, 0.0], [0, 0.1, -0.19], [0, 0.128, -0.32], [0, 0.128, -0.42], [0, 0.112, -0.52]];
const BODY = [[0.172, 0.1], [0.138, 0.088], [0.152, 0.108], [0.166, 0.104], [0.17, 0.072]];

// On her feet (noraStanding.js) the jacket hangs; on the table its sides fall to the table.
export function torso(tex, { standing = false } = {}) {
  const rucked = (theta, u) => 1 + 0.025 * Math.sin(theta * 8 + u * 9) + 0.015 * Math.sin(theta * 13 - u * 17); // the wool pulled about
  // Standing, the jumper goes on up and in round her neck, its shoulders sloping (ended flat, it showed as a dark bar).
  const [spine, body] = standing ? [[...SPINE, [0, 0.106, -0.565]], [...BODY, [0.07, 0.052]]] : [SPINE, BODY];
  const jumper = mesh(sweepGeometry(spine, body, { radial: 20, steps: 4, front: [0, 1, 0], shape: rucked }), tex.jumper);
  const open = standing ? [0.9, 0.85, 0.8, 0.75, 0.7] : [1.5, 1.3, 1.1, 0.95, 0.8]; // the jacket open over her front
  const fallen = standing ? 0 : 0.18;
  const sides = (theta, u) => (1 + fallen * Math.max(0, -Math.sin(theta)) ** 2) * (1 + 0.035 * Math.sin(theta * 6 + u * 7));
  const jacket = mesh(sweepGeometry(SPINE, BODY.map(([x, y]) => [x * 1.1, y * 1.12]), { radial: 22, steps: 4, front: [0, 1, 0], gap: open, shape: sides }), tex.jacket, { side: THREE.DoubleSide });
  const collar = mesh(sweepGeometry([[-0.1, 0.13, -0.52], [0, 0.07, -0.56], [0.1, 0.13, -0.52]], [0.02, 0.022, 0.02], { radial: 6, steps: 3 }), tex.leather, { color: '#8a6a50' });
  return standing ? [jumper, jacket] : [jumper, jacket, collar]; // standing, her shoulders cover the collar (noraStanding.js)
}

// Her arms down her sides in the jacket's sleeves, fists clenched in the cuffs.
function arms(tex) {
  return [-1, 1].flatMap((side) => {
    const shoulder = v(side * 0.17, 0.1, -0.5), elbow = v(side * 0.245, 0.11, -0.27), wrist = v(side * 0.235, 0.065, -0.05);
    const sleeve = mesh(sweepGeometry([shoulder, elbow, wrist], [0.058, 0.05, 0.044], { radial: 10, steps: 4, front: [0, 1, 0] }), tex.jacket);
    const fist = handGroup(materialFor(tex.hands), { thumb: -side, curl: 1.2, spread: 0.02, length: 0.85, width: 0.85 });
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

// Her neck as she lifts her head: the long muscles down each side of her
// throat stand out with the strain, the skin flushed with fear; it goes down
// into the jumper's knitted collar.
function neck(tex) {
  const path = [v(0, 0.1, -0.52), v(-0.015, 0.124, -0.585), v(-0.028, 0.138, -0.64)]; // into the underside of her head, so her jaw overhangs her throat (owner: the neck a little off)
  const cords = (theta) => 1 + 0.14 * (Math.exp(-((theta - 0.95) ** 2) / 0.05) + Math.exp(-((theta - 2.19) ** 2) / 0.05)) + 0.04 * Math.exp(-((theta - Math.PI / 2) ** 2) / 0.04);
  const throat = mesh(sweepGeometry(path, [[0.05, 0.045], 0.044, 0.042], { radial: 20, steps: 4, front: [0, 1, 0.3], shape: cords }), tex.neck);
  const collar = mesh(new THREE.TorusGeometry(0.054, 0.017, 6, 18), tex.jumper); // the jumper's collar, high on her throat
  collar.position.copy(path[0].clone().lerp(path[1], 0.55));
  collar.quaternion.setFromUnitVectors(v(0, 0, 1), path[1].clone().sub(path[0]).normalize());
  return [throat, collar];
}

function noraStrapped(t, { turn = 0.18, lift = 0.7 } = {}) {
  const tex = noraTextures();
  const head = noraHead();
  head.position.set(-0.04, 0.19, -0.67); // straining up off the table
  const lifted = new THREE.Quaternion().setFromAxisAngle(v(1, 0, 0), -Math.PI / 2 + lift);
  head.quaternion.setFromAxisAngle(v(0, 0, 1), turn).multiply(lifted); // lifted off the table, turned to you
  return new THREE.Group().add(...torso(tex), ...arms(tex), ...legs(tex), ...straps(tex, t), ...neck(tex), head, ...hairFall(head));
}

export const NORA_FIGURES = { noraStrapped };
