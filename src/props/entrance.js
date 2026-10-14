// Props for the school entrance hall (0.3, part A): the main stairs, the
// front doors, a dark doorway, the notice board with the school plan, an
// umbrella stand and the portrait. Same conventions as catalog.js: origin on
// the floor, front facing +z; wall things have their back on the wall.
import * as THREE from 'three';
import { box, decal, materialFor, canvasTexture, strut } from './parts.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

// A straight flight of stairs rising away from you (towards -z) to a landing
// that runs on to the wall behind: a carpet runner up the middle, banister
// and balusters on the open (+x) side. Solid underneath.
function stairs(t, { steps = 14, width = 1.6, rise = 0.2, run = 0.28, landing = 1.4 } = {}) {
  const wood = { color: '#9a7652' };
  const carpet = { color: '#8a3028' };
  const rail = { color: '#3a2618' };
  const top = steps * rise;
  const length = steps * run;
  const side = width / 2 - 0.05;
  const railY = (z) => 0.9 + rise * (-z / run + 0.5); // over the baluster tops
  const parts = [];
  for (let i = 0; i < steps; i++) {
    const z = -(i + 0.5) * run;
    parts.push(box(t.wood, [width, (i + 1) * rise, run], [0, 0, z], wood));
    parts.push(box(t.sheet, [0.8, 0.012, run], [0, (i + 1) * rise, z], carpet));
    parts.push(decal(t.sheet, [0.8, rise], [0, i * rise + rise / 2, -i * run + 0.003], carpet));
    parts.push(box(t.paintedWood, [0.025, 0.9, 0.025], [side, (i + 1) * rise, z], rail));
  }
  parts.push(box(t.wood, [width, top, landing], [0, 0, -length - landing / 2], wood));
  for (let z = -length - 0.2; z > -length - landing; z -= 0.3) parts.push(box(t.paintedWood, [0.025, 0.9, 0.025], [side, top, z], rail));
  parts.push(
    box(t.paintedWood, [0.12, 1.15, 0.12], [side, 0, -0.08], rail), // newel posts
    box(t.paintedWood, [0.1, 1.05, 0.1], [side, top, -length], rail),
    strut(t.paintedWood, [side, railY(-0.08), -0.08], [side, railY(-length), -length], [0.07, 0.05], rail),
    box(t.paintedWood, [0.07, 0.05, landing], [side, top + 0.9, -length - landing / 2], rail),
  );
  return group(...parts);
}

// The school's front doors from inside: two tall leaves under a night
// fanlight, iron bolts and a ring handle, a coir mat (back on the wall).
function frontDoors(t) {
  const frame = { color: '#3a2618' };
  const iron = { color: '#1e1e20' };
  return group(
    box(t.paintedWood, [2.0, 3.4, 0.05], [0, 0, 0.025], frame),
    box(t.door, [0.8, 2.6, 0.04], [-0.41, 0, 0.065]),
    box(t.door, [0.8, 2.6, 0.04], [0.41, 0, 0.065]),
    box(t.paintedWood, [1.7, 0.1, 0.07], [0, 2.6, 0.06], frame),
    decal(t.windowPane, [1.6, 0.6], [0, 3.0, 0.06]),
    box(t.iron, [0.025, 0.36, 0.02], [-0.06, 2.1, 0.095], iron),
    box(t.iron, [0.025, 0.36, 0.02], [-0.06, 0.12, 0.095], iron),
    box(t.iron, [0.07, 0.07, 0.03], [0.07, 1.12, 0.1], iron),
    box(t.sheet, [1.2, 0.015, 0.6], [0, 0, 0.5], { color: '#7a6040' }),
  );
}

// An open doorway into the dark: a frame round a black opening (the way on
// at the top of the stairs; back on the wall).
function doorway(t, { width = 1.1, height = 2.2 } = {}) {
  return group(
    box(t.paintedWood, [width + 0.2, height + 0.1, 0.04], [0, 0, 0.02], { color: '#4a3424' }),
    box(t.sheet, [width, height, 0.01], [0, 0, 0.045], { unlit: true, color: '#050505' }),
  );
}

// Plan of the ground floor as drawn on the hall map: rooms along the top
// (library, gym, back stairs, music, nurse), the corridor, rooms along the
// bottom (art, classes 1 and 2, the hall, cloakroom, staff room).
const PLAN_ROOMS = [[10, 5, 6, 8], [16, 5, 6, 8], [22, 5, 3, 8], [25, 5, 6, 8], [31, 5, 7, 8],
  [10, 16, 5, 11], [15, 16, 5, 11], [20, 16, 5, 11], [25, 16, 6, 11], [31, 16, 3, 11], [34, 16, 4, 11]];
const SMALL_NOTICES = [[2, 4, 6, 9], [40, 6, 6, 8], [3, 20, 5, 7], [41, 22, 5, 9]];

// The hall notice board: the school plan pinned in the middle with a red
// "you are here" dot (the ground-floor map pickup), small notices round it.
function mapBoard(t) {
  const cork = canvasTexture(48, 36, (g) => {
    g.fillStyle = '#8a6a44';
    g.fillRect(0, 0, 48, 36);
    g.fillStyle = '#e0d8c0';
    g.fillRect(9, 4, 30, 24);
    g.strokeStyle = '#3a4a6a';
    g.lineWidth = 1;
    PLAN_ROOMS.forEach(([x, y, w, h]) => g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1));
    g.fillStyle = '#c02020';
    g.fillRect(27, 24, 2, 2);
    SMALL_NOTICES.forEach(([x, y, w, h]) => {
      g.fillStyle = '#d8d0bc';
      g.fillRect(x, y, w, h);
      g.fillStyle = '#7a7060';
      for (let ly = y + 2; ly < y + h - 1; ly += 2) g.fillRect(x + 1, ly, w - 2, 1);
    });
  });
  return group(box(t.paintedWood, [1.3, 0.95, 0.03], [0, 1.1, 0.015], { color: '#4a3424' }), decal(cork, [1.24, 0.89], [0, 1.575, 0.032]));
}

// Umbrella stand by the door with two black umbrellas leaning in it.
function umbrellaStand(t) {
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.11, 0.5, 8, 1, true), materialFor(t.iron, { color: '#6a6a50', side: THREE.DoubleSide }));
  stand.position.y = 0.27;
  const umbrella = (x, tilt) => {
    const u = group(
      box(t.sheet, [0.06, 0.7, 0.06], [0, 0.05, 0], { color: '#1a1a1c' }),
      box(t.paintedWood, [0.015, 0.2, 0.015], [0, 0.75, 0], { color: '#6a4a2a' }),
      box(t.paintedWood, [0.07, 0.015, 0.015], [0.035, 0.94, 0], { color: '#6a4a2a' }),
    );
    u.position.x = x;
    u.rotation.z = tilt;
    return u;
  };
  return group(stand, box(t.iron, [0.26, 0.02, 0.26], [0, 0, 0], { color: '#3a3a30' }), umbrella(-0.03, 0.12), umbrella(0.04, -0.16));
}

// A dark oil portrait of a stern man in black in a heavy frame (the hall).
function portrait(t) {
  const paint = canvasTexture(24, 32, (g) => {
    g.fillStyle = '#2a2018';
    g.fillRect(0, 0, 24, 32);
    g.fillStyle = '#121010'; // black coat
    g.fillRect(3, 22, 18, 10);
    g.fillRect(6, 20, 12, 2);
    g.fillStyle = '#d8d0c0'; // collar
    g.fillRect(10, 19, 4, 3);
    g.fillStyle = '#b89878';
    g.fillRect(8, 8, 8, 11);
    g.fillStyle = '#4a3a30'; // hair, receding
    g.fillRect(8, 6, 8, 2);
    g.fillRect(7, 8, 1, 4);
    g.fillRect(16, 8, 1, 4);
    g.fillStyle = '#1a1410';
    g.fillRect(9, 12, 2, 1);
    g.fillRect(13, 12, 2, 1);
    g.fillRect(10, 16, 4, 1);
  });
  return group(box(t.paintedWood, [0.66, 0.84, 0.05], [0, 1.4, 0.025], { color: '#6a5020' }), decal(paint, [0.54, 0.72], [0, 1.82, 0.052]));
}

export const ENTRANCE_PROPS = { stairs, frontDoors, doorway, mapBoard, umbrellaStand, portrait };
