// Low-poly props built in code. Each builder returns a Group with its origin
// on the floor at the prop's centre, facing +z (its "front").
import * as THREE from 'three';
import { box, plane, materialFor, namePlateTexture, drawingTexture } from './parts.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

// Iron orphanage bed, 0.9 × 1.9 m, head at -z. Optional brass name plate.
function bed(t, { name, unmade = false } = {}) {
  const legs = [[-0.42, -0.92], [0.42, -0.92], [-0.42, 0.92], [0.42, 0.92]].map(([x, z]) => box(t.iron, [0.05, 0.45, 0.05], [x, 0, z]));
  const parts = [
    ...legs,
    box(t.iron, [0.9, 0.06, 1.9], [0, 0.3, 0]),
    box(t.iron, [0.9, 0.5, 0.05], [0, 0.35, -0.94]),
    box(t.iron, [0.9, 0.25, 0.05], [0, 0.35, 0.94]),
    box(t.mattress, [0.82, 0.12, 1.8], [0, 0.36, 0]),
    box(t.sheet, [0.84, unmade ? 0.1 : 0.05, unmade ? 1.1 : 1.4], [unmade ? 0.06 : 0, 0.48, unmade ? 0.3 : 0.2]),
    box(t.sheet, [0.5, 0.08, 0.3], [0, 0.48, -0.72]),
  ];
  if (name) parts.push(plane(namePlateTexture(name), [0.3, 0.075], [0, 0.55, 0.97]));
  return group(...parts);
}

function table(t) {
  const legs = [[-0.5, -0.3], [0.5, -0.3], [-0.5, 0.3], [0.5, 0.3]].map(([x, z]) => box(t.paintedWood, [0.05, 0.72, 0.05], [x, 0, z]));
  return group(...legs, box(t.paintedWood, [1.1, 0.04, 0.7], [0, 0.72, 0]));
}

// Reel-to-reel tape recorder (save point), meant to sit on a table (y = 0.76).
function tapeRecorder(t) {
  const reel = (x) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 8), materialFor(t.iron));
    mesh.position.set(x, 0.17, -0.02);
    return mesh;
  };
  const lamp = box(t.recorder, [0.02, 0.02, 0.01], [0.15, 0.06, 0.13], { unlit: true, color: 0xff3020 });
  return group(box(t.recorder, [0.4, 0.15, 0.28], [0, 0, 0]), reel(-0.1), reel(0.1), lamp);
}

// Wooden rocking horse toy, about 0.3 m long.
function toyHorse(t) {
  const legs = [-0.1, 0.1].map((x) => box(t.paintedWood, [0.03, 0.1, 0.12], [x, 0.03, 0]));
  return group(
    box(t.paintedWood, [0.32, 0.03, 0.06], [0, 0, 0]),
    ...legs,
    box(t.paintedWood, [0.26, 0.09, 0.08], [0, 0.12, 0]),
    box(t.paintedWood, [0.07, 0.12, 0.06], [0.13, 0.19, 0]),
  );
}

// Wall of cubby holes, 1.6 × 1.2 m, 4 × 3 compartments.
function cubbies(t) {
  const parts = [box(t.paintedWood, [1.6, 0.04, 0.35], [0, 0, 0])];
  for (let r = 1; r <= 3; r++) parts.push(box(t.paintedWood, [1.6, 0.03, 0.35], [0, r * 0.4, 0]));
  for (let c = 0; c <= 4; c++) parts.push(box(t.paintedWood, [0.03, 1.2, 0.35], [-0.8 + c * 0.4, 0, 0]));
  return group(...parts);
}

// Child's drawing pinned flat to a wall (place with its back to the wall).
function drawing(t, { kind = 'house' } = {}) {
  return group(plane(drawingTexture(kind), [0.4, 0.4], [0, 1.2, 0.01]));
}

function windowFrame(t) {
  return group(plane(t.windowPane, [1, 1.3], [0, 1.6, 0.01]));
}

// Ceiling fluorescent tube (glowing, unlit material) at the given height.
function fluorescent(t, { height = 2.4 } = {}) {
  return group(box(t.sheet, [0.12, 0.05, 1.2], [0, height - 0.06, 0], { unlit: true, color: 0xf2fff0 }));
}

// Ghost child: faceless, pale, half-transparent, in a long nightgown.
// No features and no injuries (scare rules: victims, not monsters).
function ghostChild(t, { opacity = 0.55 } = {}) {
  const ghost = { unlit: true, color: 0xd8e4ec, transparent: true, opacity, depthWrite: false };
  const gown = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.26, 0.95, 7), materialFor(t.sheet, ghost));
  gown.position.y = 0.48;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 7, 5), materialFor(t.sheet, ghost));
  head.position.y = 1.08;
  const arms = [-0.17, 0.17].map((x) => box(t.sheet, [0.05, 0.42, 0.05], [x, 0.5, 0], ghost));
  return group(gown, head, ...arms);
}

export const PROPS = { bed, table, tapeRecorder, toyHorse, cubbies, drawing, windowFrame, fluorescent, ghostChild };
