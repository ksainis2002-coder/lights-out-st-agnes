// Figures of the asylum wards (0.4): Edith, the blind ghost girl (Sister
// M., the burned nun, is in burnedNun.js). Origin on the floor (Edith: on what she sits on),
// front facing +z.
import * as THREE from 'three';
import { box, strut, materialFor } from './parts.js';
import { burnedNun, candleSnuffer, nunCatch } from './burnedNun.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

function mesh(geometry, texture, options) {
  return new THREE.Mesh(geometry, materialFor(texture, options));
}

// Edith Carr, sitting on the edge of a bed with her music box in her lap,
// her head tilted to listen (she is blind). Faceless and unhurt, as every
// ghost child (scare rules). Origin: where she sits.
function ghostEdith(t, { opacity = 0.6 } = {}) {
  const ghost = { unlit: true, color: 0xd8e4ec, transparent: true, opacity, depthWrite: false, fog: false };
  const body = mesh(new THREE.CylinderGeometry(0.1, 0.17, 0.44, 7), t.sheet, ghost);
  body.position.y = 0.22;
  const head = mesh(new THREE.SphereGeometry(0.105, 7, 5), t.sheet, ghost);
  // Bobbed hair: a cap cut straight below the ears, open at the face.
  const bob = mesh(new THREE.SphereGeometry(0.128, 8, 5, Math.PI * 0.78, Math.PI * 1.44, 0, Math.PI * 0.7), t.sheet, { ...ghost, color: 0xa9b9cc, side: THREE.DoubleSide });
  bob.position.y = 0.012;
  const headGroup = group(head, bob, box(t.sheet, [0.2, 0.03, 0.03], [0, 0.05, 0.085], { ...ghost, color: 0xa9b9cc })); // and a fringe
  headGroup.position.set(0, 0.55, 0.01);
  headGroup.rotation.set(0.12, 0.4, 0.45); // one ear turned to the room
  const arm = (side) => strut(t.sheet, [side * 0.13, 0.36, 0.02], [side * 0.07, 0.13, 0.22], [0.045, 0.045], ghost);
  return group(
    body, headGroup, arm(-1), arm(1),
    box(t.sheet, [0.32, 0.1, 0.34], [0, -0.03, 0.12], ghost), // her lap
    box(t.sheet, [0.05, 0.3, 0.05], [-0.08, -0.33, 0.27], ghost),
    box(t.sheet, [0.05, 0.3, 0.05], [0.08, -0.33, 0.27], ghost),
    box(t.sheet, [0.16, 0.09, 0.12], [0, 0.07, 0.24], { ...ghost, color: 0xf0dcae, opacity: Math.min(1, opacity + 0.25) }), // the music box
    box(t.sheet, [0.05, 0.015, 0.015], [0.105, 0.11, 0.24], { ...ghost, color: 0xf0dcae, opacity: Math.min(1, opacity + 0.25) }), // its crank
  );
}

export const WARD_FIGURES = { burnedNun, candleSnuffer, nunCatch, ghostEdith };
