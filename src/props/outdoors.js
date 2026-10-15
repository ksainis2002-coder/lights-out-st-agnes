// Outdoor props for the courtyard and cemetery (0.3): graves, railings,
// trees, the school facade, rain. Same conventions as catalog.js.
import * as THREE from 'three';
import { box, decal, plane, materialFor, canvasTexture } from './parts.js';
import { i18n } from '../i18n/index.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

function mesh(geometry, texture, options) {
  return new THREE.Mesh(geometry, materialFor(texture, options));
}

// Grave stone with a rounded top; the name is a carved decal texture.
const GRAVE = { color: '#8c8a82' };
// "age" carves the age line from i18n ("AGED 8" / "8 ΕΤΩΝ"); mockups pass "years".
function gravestone(t, { lean = 0.05, name = '', years = '', age, worn = false } = {}) {
  if (age) years = i18n.t('grave.aged', { n: age });
  const top = mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 10, 1, false, 0, Math.PI), t.stone, GRAVE);
  top.rotation.set(Math.PI / 2, 0, Math.PI / 2, 'ZYX'); // half disc standing up, thickness along z
  top.position.y = 0.7;
  const parts = [box(t.stone, [0.5, 0.7, 0.1], [0, 0, 0], GRAVE), top];
  // Carved letters are shadow, so they stay dark even in the full beam.
  if (name) parts.push(decal(carvedTexture(name, years, worn), [0.42, 0.32], [0, 0.48, 0.052], { transparent: true, unlit: true }));
  const stone = group(...parts);
  stone.rotation.x = lean;
  return group(stone, box(t.grass, [0.6, 0.06, 1.1], [0, 0, 0.55], { color: '#5a4a3a' }));
}

// worn: rain has eaten the letters; only scattered strokes are left (Tommy's
// stone, owner decision 2026-10-13: the hint stays a hint).
function carvedTexture(name, years, worn) {
  return canvasTexture(64, 48, (g, w) => {
    g.clearRect(0, 0, 64, 48);
    g.fillStyle = worn ? 'rgba(40,40,36,0.55)' : 'rgba(40,40,36,0.9)';
    g.textAlign = 'center';
    g.font = 'bold 10px serif';
    name.split(' ').slice(0, 2).forEach((part, i) => g.fillText(part, w / 2, 13 + i * 12));
    g.font = '8px serif';
    g.fillText(years, w / 2, 41);
    if (worn) erode(g, 64, 48);
  });
}

function erode(g, w, h) {
  let seed = 11;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 260; i++) g.fillRect(random() * w, random() * h, 1 + random() * 3, 1 + random() * 2);
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = 'rgba(40,40,36,0.25)'; // pits and lichen where the letters were
  for (let i = 0; i < 40; i++) g.fillRect(random() * w, 8 + random() * 30, 1, 1);
}

// Iron railing along +x: bars every 0.15 m with spear tips, two rails.
function ironFence(t, { length = 3 } = {}) {
  const parts = [box(t.iron, [length, 0.04, 0.04], [0, 0.12, 0]), box(t.iron, [length, 0.04, 0.04], [0, 1.1, 0])];
  for (let x = -length / 2; x <= length / 2 + 1e-6; x += 0.15) {
    parts.push(box(t.iron, [0.025, 1.3, 0.025], [x, 0, 0]));
    const tip = mesh(new THREE.ConeGeometry(0.03, 0.1, 4), t.iron);
    tip.position.set(x, 1.35, 0);
    parts.push(tip);
  }
  return group(...parts);
}

// Bare dead tree: trunk and crooked branches.
function deadTree(t, { height = 4.5 } = {}) {
  const bark = { color: '#3a3028' };
  const trunk = mesh(new THREE.CylinderGeometry(0.1, 0.2, height * 0.65, 6), t.wood, bark);
  trunk.position.y = height * 0.325;
  const branch = ([x, y, z], length, tiltZ, tiltX = 0) => {
    const b = mesh(new THREE.CylinderGeometry(0.02, 0.06, length, 5), t.wood, bark);
    b.geometry.translate(0, length / 2, 0);
    b.position.set(x, y, z);
    b.rotation.set(tiltX, 0, tiltZ);
    return b;
  };
  return group(
    trunk,
    branch([0, height * 0.5, 0], 1.6, -0.9),
    branch([0, height * 0.58, 0], 1.4, 1.0, 0.3),
    branch([0, height * 0.64, 0], 1.2, 0.2, -0.8),
    branch([0.5, height * 0.62, 0], 0.7, -0.4),
    branch([-0.6, height * 0.7, 0.1], 0.6, 0.6),
  );
}
// Lit window seen from outside (decal on a facade).
function litWindow(t, { lit = true } = {}) {
  const glow = lit ? { unlit: true, color: '#9a7438', fog: false } : { color: '#1a1e22' };
  return group(
    box(t.paintedWood, [1.0, 1.5, 0.04], [0, 1.0, 0], { color: '#3a3230' }),
    plane(lit ? t.sheet : t.windowPane, [0.84, 1.34], [0, 1.75, 0.03], { ...glow, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }),
  );
}

// Square stone gate pillar with a cap.
function gatePillar(t) {
  return group(
    box(t.wallStone, [0.42, 1.9, 0.42], [0, 0, 0]),
    box(t.wallStone, [0.52, 0.12, 0.52], [0, 1.9, 0]),
    box(t.stone, [0.2, 0.18, 0.2], [0, 2.02, 0], { color: '#7a7870' }),
  );
}

// Outside door into the school, with a lantern over it.
function facadeDoor(t) {
  return group(
    box(t.stone, [1.5, 2.7, 0.06], [0, 0, 0], { color: '#6a6a64' }),
    box(t.door, [1.1, 2.3, 0.06], [0, 0, 0.03]),
    box(t.iron, [0.16, 0.24, 0.16], [0, 2.85, 0.14]),
    box(t.sheet, [0.1, 0.16, 0.1], [0, 2.89, 0.14], { unlit: true, color: '#f0c070' }),
  );
}

// Rain: thin pale streaks filling a box (width × depth), animated later.
function rain(t, { width = 10, depth = 10, height = 6, count = 500 } = {}) {
  const positions = [];
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < count; i++) {
    const x = (random() - 0.5) * width, z = (random() - 0.5) * depth, y = random() * height;
    positions.push(x, y, z, x + 0.02, y - 0.3, z);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({ color: 0x9aa8b8, transparent: true, opacity: 0.22, fog: true });
  return group(new THREE.LineSegments(geometry, material));
}

// Grave lantern: a small iron lamp with glass sides on the grave's foot;
// lit, its candle glows (the cemetery puzzle lights them in order).
function graveLantern(t, { lit = false } = {}) {
  const iron = { color: '#2c2c2e' };
  const parts = [
    box(t.iron, [0.16, 0.02, 0.16], [0, 0, 0], iron),
    box(t.iron, [0.16, 0.02, 0.16], [0, 0.24, 0], iron),
    mesh(new THREE.ConeGeometry(0.12, 0.08, 4), t.iron, iron),
    box(t.sheet, [0.12, 0.2, 0.12], [0, 0.03, 0], { color: lit ? '#f0c070' : '#3a4048', unlit: lit, transparent: true, opacity: lit ? 0.9 : 0.5 }),
  ];
  parts[2].position.y = 0.3;
  parts[2].rotation.y = Math.PI / 4;
  [[-0.07, -0.07], [0.07, -0.07], [-0.07, 0.07], [0.07, 0.07]].forEach(([x, z]) => parts.push(box(t.iron, [0.02, 0.24, 0.02], [x, 0, z], iron)));
  if (lit) {
    const glow = new THREE.PointLight('#f0b060', 1.2, 3, 1.4);
    glow.position.y = 0.14;
    parts.push(glow);
  }
  return group(...parts);
}

// A lightning bolt in the sky: a jagged pale line with one fork (storm flashes).
function lightningBolt(t, { height = 30, seed = 5 } = {}) {
  let s = seed;
  const random = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const points = [];
  let x = 0, y = height, z = 0;
  while (y > height * 0.25) {
    points.push(x, y, z);
    x += (random() - 0.5) * 3;
    z += (random() - 0.5) * 1.5;
    y -= 1.5 + random() * 2;
    points.push(x, y, z);
  }
  const fork = points.slice(6, 9);
  for (let i = 0; i < 3; i++) {
    points.push(...fork);
    fork[0] += 1.5 + random() * 2;
    fork[1] -= 2 + random() * 2;
    points.push(...fork);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  return group(new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0xe8f0ff, fog: false })));
}

export const OUTDOOR_PROPS = { gravestone, ironFence, deadTree, litWindow, facadeDoor, gatePillar, rain, graveLantern, lightningBolt };
