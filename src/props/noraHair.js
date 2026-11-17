// Nora's hair (0.5 proposal; mockup stills only until the owner approves her).
// Owner 2026-11-17: first "like a helmet", then "simple natural hair". Plain
// light brown, lighter at the lengths, straight, parted in the middle (a touch
// to her right), loose to her shoulders, falling either side of her face. Built
// as a thin layer over her scalp whose edge breaks into strands where it meets
// her skin (its texture is cut away there), a lock down each side of her face,
// and locks (ribbons of strands, cut out the same way) that fall with their
// own weight off her lifted head and lie spread on the table.
import * as THREE from 'three';
import { materialFor, canvasTexture } from './parts.js';
import { sculptedHead, headPatch, cardGeometry } from './sculpt.js';
import { texelDirection } from './noraFace.js';

const seeded = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const v = (...p) => new THREE.Vector3(...p);
const towards = (around, up) => [Math.sin(around) * Math.cos(up), Math.sin(up), Math.cos(around) * Math.cos(up)];

const ROOT = [76, 57, 43]; // light brown at the roots
const ENDS = [128, 100, 76]; // lighter, nearly dark blonde, at the ends
const PARTING = -0.04;

// Whether her hair grows at a direction from the head's centre: not on her
// face and forehead, nor on her cheeks, ears and jaw; down to her nape.
export function hasHair(d) {
  if (d.z > 0.1 && d.y < 0.6 - 0.32 * d.x * d.x) return false;
  if (d.y < 0.16 && d.z > -0.22) return false;
  return d.y > -0.6;
}

// Straight hair lies close over the top of her head, fuller at the back.
function thickness(d) {
  const front = Math.max(0, d.z);
  return 0.01 + 0.03 * (1 - front * 0.85) + 0.02 * Math.max(0, -d.z) + 0.003 * Math.sin(Math.atan2(d.x, d.z) * 11);
}

const mix = (k) => ROOT.map((c, i) => c + (ENDS[i] - c) * k);

// The layer over her scalp: fine strands running down from the parting, some
// catching the lamp, the edge ragged where the strands end; the parting itself.
function scalpTexture() {
  const random = seeded(31);
  return canvasTexture(256, 128, (g, w, h) => {
    const image = g.createImageData(w, h);
    const streak = Array.from({ length: w }, () => random());
    const tips = Array.from({ length: w }, () => (random() - 0.4) * 0.1);
    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const d = texelDirection(px + 0.5, py + 0.5, w, h);
        if (!hasHair({ x: d.x, y: d.y + tips[px], z: d.z })) continue;
        const [r, gr, b] = mix(Math.min(1, (py / h) * 1.6)); // lighter further down
        const k = 0.8 + streak[px] * 0.35 + (streak[px] > 0.85 ? 0.3 : 0) - (px % 3 === 0 ? 0.07 : 0) + (random() - 0.5) * 0.08;
        image.data.set([Math.min(255, r * k), Math.min(255, gr * k), Math.min(255, b * k), 255], (py * w + px) * 4);
      }
    }
    g.putImageData(image, 0, 0);
    g.fillStyle = 'rgba(176,136,114,0.85)'; // the parting
    for (let py = 6; py < h * 0.3; py++) {
      const theta = Math.asin(Math.max(-1, Math.min(1, PARTING / Math.sin((py / h) * Math.PI))));
      g.fillRect(Math.round(w * (0.5 + theta / (Math.PI * 2))), py, 1, 1);
    }
  });
}

// A lock's strands on a clear ground, straight, from the root (the canvas
// top, or its left edge when `along` is set) to uneven ends, lighter at the ends.
function lockTexture(seed, { along = false } = {}) {
  const random = seeded(seed);
  const [w, h] = along ? [64, 32] : [32, 64];
  return canvasTexture(w, h, (g) => {
    g.clearRect(0, 0, w, h);
    if (along) {
      g.translate(0, h);
      g.rotate(-Math.PI / 2);
    }
    const [across, length] = along ? [h, w] : [w, h];
    for (let i = 0; i < 40; i++) {
      const x0 = random() * across;
      const end = length * (0.62 + random() * 0.38);
      const sway = (random() - 0.5) * 2;
      const [r, gr, b] = mix(0.3 + random() * 0.7);
      const k = 0.82 + random() * 0.3 + (random() < 0.2 ? 0.25 : 0);
      g.strokeStyle = `rgb(${Math.min(255, r * k)},${Math.min(255, gr * k)},${Math.min(255, b * k)})`;
      g.lineWidth = random() < 0.35 ? 2 : 1.3;
      g.beginPath();
      g.moveTo(x0, 0);
      g.quadraticCurveTo(x0 + sway, end * 0.5, x0 + sway * 0.3, end);
      g.stroke();
    }
    g.fillStyle = `rgb(${ROOT.join(',')})`;
    g.fillRect(across * 0.08, 0, across * 0.84, length * 0.08); // the root, thick
  });
}

const cut = (texture) => materialFor(texture, { alphaTest: 0.5, side: THREE.DoubleSide });

// The hair on her head: the layer over her scalp, and a lock down each side
// of her face from the parting over her temple and ear. `head` is her
// sculpted skin; `shape` how it was sculpted.
export function hairOnHead(head, { radius, bumps, scale }) {
  const shell = sculptedHead(radius, bumps, { scale, width: 32, height: 22, extra: thickness });
  const meshes = [new THREE.Mesh(shell.geometry, cut(scalpTexture()))];
  [[-1, 41], [1, 42]].forEach(([side, seed]) => {
    const geometry = headPatch(head, (s, u) => [side * (0.58 + s * 0.16) + (u - 0.5) * 0.26, 0.68 - s * 1.15], { columns: 10, rows: 2, out: 0.006 });
    meshes.push(new THREE.Mesh(geometry, cut(lockTexture(seed, { along: true }))));
  });
  return { meshes, at: shell.at };
}

// Locks falling off her head: [around, up] of the root on her scalp; how far
// each runs along the table (to her shoulders); how wide. Wide and close
// together, so they lie as one fall of hair round her head, not as strands.
const FALLING = Array.from({ length: 15 }, (_, i) => {
  const around = 1.25 + (i / 14) * (Math.PI * 2 - 2.5);
  return [around, i % 2 ? 0.25 : -0.05, 0.07 + (i % 3) * 0.02, 0.085];
});
const TABLE = { x: 0.35, z: 0.95 }; // the table top's half-width and half-length; its surface is y = 0

// A point kept on the table, or hanging over its edge.
function onTable(p) {
  const over = Math.max(Math.abs(p.x) - TABLE.x, Math.abs(p.z) - TABLE.z, 0);
  if (!over) return p;
  const x = Math.sign(p.x) * Math.min(Math.abs(p.x), TABLE.x + 0.01);
  const z = Math.sign(p.z) * Math.min(Math.abs(p.z), TABLE.z + 0.01);
  return v(x, 0.004 - over * 1.2, z);
}

// The locks that fall from her head (placed and turned, its userData.hair
// set by noraHead) onto the table, in the frame her head sits in.
export function hairFall(head) {
  const { at } = head.userData.hair;
  head.updateMatrix();
  const centre = head.position;
  const up = v(0, 1, 0);
  return FALLING.map(([around, rise, run, width], i) => {
    const root = at(towards(around, rise), 0.002).applyMatrix4(head.matrix);
    const out = root.clone().sub(centre).normalize();
    const flat = v(out.x, 0, out.z).normalize();
    const springs = root.clone().addScaledVector(out, 0.012).add(v(0, -0.025, 0));
    const lands = onTable(v(springs.x + flat.x * 0.02, Math.max(0.008, springs.y * 0.3), springs.z + flat.z * 0.02));
    const lies = onTable(lands.clone().add(v(flat.x * run * 0.6, 0, flat.z * run * 0.6)).setY(0.005));
    const ends = onTable(lands.clone().add(v(flat.x * run, 0, flat.z * run)).setY(0.004));
    const geometry = cardGeometry([root, springs, lands, lies, ends], [width * 0.7, width, width * 1.1, width, width * 0.8], [out, out, up, up, up]);
    return new THREE.Mesh(geometry, cut(lockTexture(51 + i)));
  });
}
