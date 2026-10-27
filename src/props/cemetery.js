// Props for the cemetery puzzle (0.3, part C): Agnes's grave slab, which
// slides open once the five lanterns burn in the order of the roll, the
// stone lamb inside it (statue piece 2), and the smoke of snuffed lanterns.
// Same conventions as catalog.js; a grave's plot runs along +z from its
// stone (props/outdoors.js), so the slab lies on +z too.
import * as THREE from 'three';
import { box, plane, materialFor, paperTexture } from './parts.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

const STONE = { color: '#8c8a82', flatShading: true }; // as the grave stones
const LAMB = { color: '#9a978e', flatShading: true };
const BREAK = { color: '#d6d2c6' }; // a fresh break, like the one on her wrist

function lump(t, radius, scale, position, options) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 7, 5), materialFor(t.stone, options));
  mesh.scale.set(...scale);
  mesh.position.set(...position);
  return mesh;
}

// The stone lamb (statue piece 2): lying with its legs folded and its head
// up, facing +x; a pale break on its back where it came away from her arm.
function stoneLamb(t) {
  const legs = [[-0.06, 1], [-0.06, -1], [0.05, 1], [0.05, -1]].map(([x, side]) => box(t.stone, [0.07, 0.024, 0.024], [x, 0, side * 0.045], LAMB));
  const lamb = group(
    lump(t, 0.1, [1, 0.62, 0.62], [0, 0.064, 0], LAMB),
    lump(t, 0.045, [1.25, 0.95, 0.9], [0.105, 0.118, 0], LAMB),
    box(t.stone, [0.035, 0.012, 0.022], [0.098, 0.136, 0.042], LAMB),
    box(t.stone, [0.035, 0.012, 0.022], [0.098, 0.136, -0.042], LAMB),
    box(t.sheet, [0.04, 0.008, 0.03], [-0.03, 0.118, 0], BREAK),
    ...legs,
  );
  lamb.scale.setScalar(1.35); // about 0.3 m long: it fills the crook of her arm
  return lamb;
}

// Agnes's grave slab: a low stone lid on her plot. Open, it lies pushed
// aside and tipped onto the grass; the hollow beneath is dark, with the lamb
// and a folded page of T. Hale's file in it.
function graveSlab(t, { open = false } = {}) {
  const lid = box(t.stone, [0.48, 0.07, 0.86], [0, 0.06, 0.58], STONE);
  if (!open) return group(lid);
  lid.position.x = 0.44;
  lid.rotation.set(0, 0.2, -0.08);
  const hollow = plane(t.sheet, [0.38, 0.7], [0, 0.064, 0.58], { color: '#0a0a0c' });
  hollow.rotation.x = -Math.PI / 2;
  const rim = [
    box(t.stone, [0.48, 0.05, 0.05], [0, 0.06, 0.205], STONE),
    box(t.stone, [0.48, 0.05, 0.05], [0, 0.06, 0.955], STONE),
    box(t.stone, [0.05, 0.05, 0.7], [-0.215, 0.06, 0.58], STONE),
    box(t.stone, [0.05, 0.05, 0.7], [0.215, 0.06, 0.58], STONE),
  ];
  const lamb = stoneLamb(t);
  lamb.position.set(0.02, 0.064, 0.7);
  lamb.rotation.y = -Math.PI / 2 + 0.4; // looking out over the foot of the grave
  const page = plane(paperTexture(), [0.15, 0.2], [-0.05, 0.07, 0.38]);
  page.rotation.set(-Math.PI / 2, 0, 0.35);
  return group(lid, hollow, ...rim, lamb, page);
}

// Smoke rising from a snuffed lantern: thin grey wisps leaning in the
// wind, crossed so they read from any side.
function lanternSmoke(t) {
  const wisps = [[0.44, 0, 0.1, 0.5], [0.62, 0.03, 0.14, 0.36], [0.84, 0.08, 0.18, 0.22]].flatMap(([y, x, size, opacity]) => [0, Math.PI / 2].map((turn) => {
    const wisp = plane(t.sheet, [size, size * 1.6], [x, y, 0], { color: '#9aa0a8', transparent: true, opacity, side: THREE.DoubleSide });
    wisp.rotation.y = turn;
    return wisp;
  }));
  return group(...wisps);
}

export const CEMETERY_PROPS = { stoneLamb, graveSlab, lanternSmoke };
