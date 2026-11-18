// Figures of the basement (0.5 proposal, docs/DESIGN_0.5.md; mockup stills
// only until the owner approves them): Sam Pike's ghost (faceless and unhurt
// like every ghost child). Dr. Venn, the surgeon, is in surgeon.js; Nora Kane,
// strapped to his table, in nora.js. Owner notes 2026-11-17: Sam greyer and
// dimmer, plainly wet, his own clothes. Origin on the floor, front facing +z.
import * as THREE from 'three';
import { box, materialFor, canvasTexture } from './parts.js';
import { SURGEON_FIGURES } from './surgeon.js';
import { NORA_FIGURES } from './nora.js';
import { NORA_STANDING } from './noraStanding.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

function mesh(geometry, texture, options) {
  return new THREE.Mesh(geometry, materialFor(texture, options));
}

// A limb: a six-sided tube from one point to another, radius r.
function limb(t, from, to, r, options) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const tube = mesh(new THREE.CylinderGeometry(r * 0.9, r, a.distanceTo(b), 6), t.sheet, options);
  tube.position.copy(a).lerp(b, 0.5);
  tube.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize());
  return tube;
}

// Sam: a boy of ten, drowned in the boiler-room flood. The home's jersey with
// a collar, braces over it, short trousers, bare feet; all of it dark and
// clinging, his hair flat to his head, water running off his hem and his
// fingers. Faceless. Greyer and dimmer than the other children. "waterline":
// the height of the water he stands in, for the rings round his legs.
function ghostSam(t, { opacity = 0.42, waterline = 0 } = {}) {
  const ghost = { unlit: true, color: 0x8e9aa4, transparent: true, opacity, depthWrite: true, fog: false, flatShading: true };
  const wet = { ...ghost, color: 0x66747e };
  const water = { unlit: true, color: 0xa8c0d0, transparent: true, opacity: 0.5, depthWrite: false, fog: false };
  const jersey = mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.42, 8), t.sheet, wet);
  jersey.position.y = 0.95;
  jersey.scale.z = 0.66; // clinging: narrower than a dry child's
  const collar = mesh(new THREE.TorusGeometry(0.052, 0.016, 4, 10), t.sheet, wet);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 1.17;
  const shorts = mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.17, 8), t.sheet, { ...wet, color: 0x56636c });
  shorts.position.y = 0.67;
  shorts.scale.z = 0.72;
  const braces = [-0.05, 0.05].map((x) => box(t.sheet, [0.016, 0.42, 0.01], [x, 0.74, 0.072], { ...wet, color: 0x4a565e }));
  const legs = [-0.055, 0.055].flatMap((x) => [limb(t, [x, 0.6, 0], [x, 0.05, 0.01], 0.03, ghost), box(t.sheet, [0.05, 0.03, 0.1], [x, 0, 0.03], ghost)]);
  const arms = [-1, 1].map((side) => limb(t, [side * 0.12, 1.12, 0], [side * 0.15, 0.73, 0.03], 0.028, wet));
  const head = mesh(new THREE.SphereGeometry(0.098, 8, 6), t.sheet, ghost);
  head.position.y = 1.29;
  head.scale.set(0.95, 1.05, 1);
  // Hair plastered flat, a few strands stuck down over the blank face.
  const hair = mesh(new THREE.SphereGeometry(0.102, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.46), t.sheet, { ...ghost, color: 0x404c56 });
  hair.position.y = 1.3;
  const strands = [-0.03, 0.0, 0.035].map((x, i) => box(t.sheet, [0.012, 0.07 - i * 0.012, 0.006], [x, 1.25, 0.094], { ...ghost, color: 0x404c56 }));
  // Water running off the jersey's hem and his fingers, and drops falling.
  const runs = [[-0.09, 0.72, 0.2], [0.07, 0.72, 0.16], [-0.15, 0.55, 0.14], [0.15, 0.55, 0.18]].map(([x, top, length]) => box(t.sheet, [0.006, length, 0.006], [x, top - length, 0.05], water));
  const drops = [[-0.15, 0.33], [0.15, 0.3], [-0.09, 0.4], [0.04, 0.24]].map(([x, y]) => box(t.sheet, [0.012, 0.024, 0.012], [x, y, 0.06], water));
  const parts = [jersey, collar, shorts, ...braces, ...legs, ...arms, head, hair, ...strands, ...runs, ...drops];
  if (waterline > 0) {
    for (const x of [-0.055, 0.055]) {
      for (const r of [0.07, 0.13, 0.2]) {
        const ring = mesh(new THREE.RingGeometry(r, r + 0.012, 16), t.sheet, { ...water, opacity: 0.55 - r });
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(x * 1.5, waterline + 0.004, 0.01);
        parts.push(ring);
      }
    }
  }
  return group(...parts);
}

export const BASEMENT_FIGURES = { ...SURGEON_FIGURES, ...NORA_FIGURES, ...NORA_STANDING, ghostSam };
