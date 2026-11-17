// Nora's hair (0.5 proposal; mockup stills only until the owner approves her).
// Owner 2026-11-17: "like a helmet". Now a thin layer over her scalp, fuller
// at the crown and the back, its edge breaking into strands where it meets
// her skin (its texture is cut away there), and locks of hair (ribbons of
// strands, cut out the same way) that fall with their own weight off her
// lifted head and lie on the table, or cling to her face. Three styles, one
// with each version of her face: "loose" (long, parted on her right, spread
// round her head on the table, a lock over her temple), "tied" (pulled back
// into a ponytail come loose, wisps at her temples), "damp" (to her
// shoulders, dark with sweat, clumped, stuck to her forehead and cheek).
import * as THREE from 'three';
import { materialFor, canvasTexture } from './parts.js';
import { sculptedHead, headPatch, cardGeometry } from './sculpt.js';
import { texelDirection } from './noraFace.js';

const seeded = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const v = (...p) => new THREE.Vector3(...p);
const towards = (around, up) => [Math.sin(around) * Math.cos(up), Math.sin(up), Math.cos(around) * Math.cos(up)];

const STYLES = {
  loose: { hairline: 0.6, colour: [80, 40, 26], body: 0.05, parting: -0.16 },
  tied: { hairline: 0.64, colour: [80, 40, 26], body: 0.022, parting: null },
  damp: { hairline: 0.55, colour: [58, 31, 22], body: 0.03, parting: 0.12, wet: true },
};

// Whether her hair grows at a direction from the head's centre: not on her
// face and forehead, nor on her cheeks, ears and jaw; down to her nape.
export function hasHair(style, d) {
  const { hairline } = STYLES[style];
  if (d.z > 0.1 && d.y < hairline - 0.32 * d.x * d.x) return false;
  if (d.y < 0.16 && d.z > -0.22) return false;
  return d.y > -0.6;
}

// How far the hair stands off her scalp: thin at her hairline, fuller over
// the crown and the back, in loose clumps.
function thickness(style) {
  const { body } = STYLES[style];
  return (d) => {
    const front = Math.max(0, d.z);
    const clumps = 0.008 * Math.sin(Math.atan2(d.x, d.z) * 9 + d.y * 7);
    return 0.012 + body * (1 - front * 0.85) + body * 0.5 * Math.max(0, -d.z) + clumps;
  };
}

// The layer over her scalp: strands running down from the crown, lighter
// ones catching the lamp, the edge ragged where the strands end.
function scalpTexture(style) {
  const { colour: [r, gr, b], parting, wet } = STYLES[style];
  const random = seeded(31);
  return canvasTexture(256, 128, (g, w, h) => {
    const image = g.createImageData(w, h);
    const streak = Array.from({ length: w }, () => random());
    const tips = Array.from({ length: w }, () => (random() - 0.4) * 0.12);
    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const d = texelDirection(px + 0.5, py + 0.5, w, h);
        if (!hasHair(style, { x: d.x, y: d.y + tips[px], z: d.z })) continue;
        const shine = streak[px] > 0.86 ? (wet ? 0.6 : 0.35) : 0;
        const k = 0.72 + streak[px] * 0.45 + shine + (random() - 0.5) * 0.12;
        const i = (py * w + px) * 4;
        image.data.set([Math.min(255, r * k), Math.min(255, gr * k), Math.min(255, b * k), 255], i);
      }
    }
    g.putImageData(image, 0, 0);
    if (parting !== null) partingLine(g, w, h, parting);
  });
}

// A parting: a fine line of scalp from her hairline back towards the crown.
function partingLine(g, w, h, x) {
  g.fillStyle = 'rgba(150,104,84,0.8)';
  for (let py = 6; py < h * 0.3; py++) {
    const phi = (py / h) * Math.PI;
    const theta = Math.asin(Math.max(-1, Math.min(1, x / Math.sin(phi))));
    g.fillRect(Math.round(w * (0.5 + theta / (Math.PI * 2))), py, 1, 1);
  }
}

// A lock's strands on a clear ground, from the root (the canvas top, or the
// left edge when `along` is set) to the uneven ends.
function lockTexture(style, seed, { along = false, clumped = false } = {}) {
  const { colour: [r, gr, b], wet } = STYLES[style];
  const random = seeded(seed);
  const [w, h] = along ? [64, 32] : [32, 64];
  return canvasTexture(w, h, (g) => {
    g.clearRect(0, 0, w, h);
    if (along) {
      g.translate(0, h);
      g.rotate(-Math.PI / 2);
    }
    const [across, length] = along ? [h, w] : [w, h];
    const centres = [0.2, 0.45, 0.7, 0.9].map((c) => c * across);
    for (let i = 0; i < 34; i++) {
      const x0 = clumped ? centres[i % 4] + (random() - 0.5) * 5 : random() * across;
      const end = length * (0.5 + random() * 0.5);
      const sway = (random() - 0.5) * 5;
      const k = 0.7 + random() * 0.4 + (random() < 0.2 ? (wet ? 0.6 : 0.35) : 0);
      g.strokeStyle = `rgb(${Math.min(255, r * k)},${Math.min(255, gr * k)},${Math.min(255, b * k)})`;
      g.lineWidth = random() < 0.4 ? 2 : 1.3;
      g.beginPath();
      g.moveTo(x0, 0);
      g.quadraticCurveTo(x0 + sway, end * 0.5, x0 + sway * 0.4, end);
      g.stroke();
    }
    g.fillStyle = `rgb(${r * 0.85},${gr * 0.85},${b * 0.85})`;
    g.fillRect(across * 0.1, 0, across * 0.8, length * 0.08); // the root, thick
  });
}

const cut = (texture) => materialFor(texture, { alphaTest: 0.5, side: THREE.DoubleSide });

// Locks lying on her face: [around, up] where each starts at her hairline,
// how far it falls (radians), how wide, how far it drifts sideways.
const FACE_LOCKS = {
  loose: [[-0.6, 0.55, 0.7, 0.16, -0.12]],
  tied: [[-0.64, 0.5, 0.42, 0.06, -0.04], [0.68, 0.5, 0.36, 0.05, 0.05]],
  damp: [[-0.2, 0.62, 0.36, 0.16, -0.2], [0.62, 0.48, 0.7, 0.14, 0.06]],
};

// The hair on her head: the layer over her scalp and the locks on her face.
// `head` is her sculpted skin; `shape` how the skin was sculpted.
export function hairOnHead(style, head, { radius, bumps, scale }) {
  const shell = sculptedHead(radius, bumps, { scale, width: 32, height: 22, extra: thickness(style) });
  const meshes = [new THREE.Mesh(shell.geometry, cut(scalpTexture(style)))];
  FACE_LOCKS[style].forEach(([around, from, length, width, drift], i) => {
    const geometry = headPatch(head, (s, u) => [around + (u - 0.5) * width + s * drift, from - s * length], { columns: 8, rows: 2, out: 0.004 });
    meshes.push(new THREE.Mesh(geometry, cut(lockTexture(style, 41 + i, { along: true, clumped: style === 'damp' }))));
  });
  return { meshes, at: shell.at };
}

// Locks falling off her head: [around, up] of the root on her scalp, how far
// each runs along the table, how wide.
const FALLING = {
  loose: [[1.45, 0.25], [1.8, 0.0], [2.15, 0.3], [2.5, -0.1], [2.85, 0.2], [Math.PI, -0.15], [-2.85, 0.2], [-2.5, -0.1], [-2.15, 0.3], [-1.8, 0.0], [-1.45, 0.25]]
    .map(([a, u], i) => [a, u, 0.2 + (i % 3) * 0.04, 0.05]),
  tied: [[1.6, -0.1, 0.05, 0.022], [-1.6, -0.1, 0.06, 0.022]],
  damp: [[1.5, 0.1], [1.95, -0.1], [2.45, 0.15], [Math.PI, -0.1], [-2.45, 0.15], [-1.95, -0.1], [-1.5, 0.1]]
    .map(([a, u], i) => [a, u, 0.08 + (i % 2) * 0.04, 0.032]),
};
const TABLE = { x: 0.35, z: 0.95 }; // the table top's half-width and half-length, its surface y = 0

// A point kept on the table, or hanging over its edge.
function onTable(p) {
  const over = Math.max(Math.abs(p.x) - TABLE.x, Math.abs(p.z) - TABLE.z, 0);
  if (!over) return p;
  const x = Math.sign(p.x) * Math.min(Math.abs(p.x), TABLE.x + 0.01);
  const z = Math.sign(p.z) * Math.min(Math.abs(p.z), TABLE.z + 0.01);
  return v(x, 0.004 - over * 1.2, z);
}

// The locks that fall from her head (placed and turned) onto the table, in
// the frame her head sits in.
export function hairFall(head) {
  const { style, at } = head.userData.hair;
  head.updateMatrix();
  const centre = head.position;
  const lock = ([around, up, run, width], i) => {
    const root = at(towards(around, up), 0.002).applyMatrix4(head.matrix);
    const out = root.clone().sub(centre).normalize();
    const flat = v(out.x, 0, out.z).normalize();
    const springs = root.clone().addScaledVector(out, 0.025).add(v(0, -0.02, 0));
    const lands = onTable(v(springs.x + flat.x * 0.03, Math.max(0.008, springs.y * 0.3), springs.z + flat.z * 0.03));
    const lies = onTable(lands.clone().add(v(flat.x * run * 0.6, 0, flat.z * run * 0.6)).setY(0.005));
    const ends = onTable(lands.clone().add(v(flat.x * run, 0, flat.z * run)).setY(0.004));
    const up3 = v(0, 1, 0);
    const geometry = cardGeometry([root, springs, lands, lies, ends], [width * 0.7, width, width * 1.1, width, width * 0.8], [out, out, up3, up3, up3]);
    return new THREE.Mesh(geometry, cut(lockTexture(style, 51 + i, { clumped: style === 'damp' })));
  };
  const meshes = FALLING[style].map(lock);
  if (style === 'tied') meshes.push(...ponytail(head, at, centre));
  return meshes;
}

// Her ponytail, the tie slipping: from the back of her head down to the
// table and along it towards its end, three locks and the tie.
function ponytail(head, at, centre) {
  const root = at(towards(Math.PI, 0.05), 0.004).applyMatrix4(head.matrix);
  const out = root.clone().sub(centre).normalize();
  const flat = v(out.x, 0, out.z).normalize();
  const tie = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.006, 6, 10), materialFor(cardTie(), {}));
  tie.position.copy(root.clone().addScaledVector(out, 0.012));
  tie.lookAt(root.clone().addScaledVector(out, 1));
  const strands = [-0.5, 0, 0.5].map((spread, i) => {
    const side = v(-flat.z, 0, flat.x).multiplyScalar(spread * 0.03);
    const down = root.clone().addScaledVector(out, 0.03).add(v(0, -0.03, 0)).add(side);
    const lands = onTable(v(down.x + flat.x * 0.04, Math.max(0.008, down.y * 0.3), down.z + flat.z * 0.04).add(side));
    const ends = onTable(lands.clone().add(v(flat.x * 0.24 + side.x * 2, 0.004 - lands.y, flat.z * 0.24 + side.z * 2)));
    const up3 = v(0, 1, 0);
    return new THREE.Mesh(cardGeometry([root, down, lands, ends], [0.03, 0.04, 0.045, 0.03], [out, out, up3, up3]), cut(lockTexture('tied', 61 + i)));
  });
  return [tie, ...strands];
}

let tieTexture = null;
function cardTie() {
  tieTexture ??= canvasTexture(4, 4, (g) => {
    g.fillStyle = '#1a1a20';
    g.fillRect(0, 0, 4, 4);
  });
  return tieTexture;
}
