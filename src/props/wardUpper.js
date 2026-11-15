// Props for the first floor of the asylum wards (0.4, part B): the treatment
// chair, the observation room's tripod and glass, Nora's camcorder and tape,
// and the writing in the isolation cells that only the night view shows.
// Same conventions as catalog.js: origin on the floor, front facing +z.
import * as THREE from 'three';
import { box, decal, strut, canvasTexture } from './parts.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

// The treatment chair: heavy oak, bolted down, leather straps at the wrists,
// the ankles and the brow; a steel cap on an arm over the headrest.
function treatmentChair(t) {
  const oak = { color: '#3e2a1a' };
  const strap = { color: '#5a3a22' };
  const steel = { color: '#9a9e98' };
  return group(
    box(t.iron, [0.9, 0.04, 0.9], [0, 0, 0], { color: '#2a2a2c' }), // the plate it is bolted to
    box(t.paintedWood, [0.6, 0.08, 0.6], [0, 0.46, 0], oak),
    box(t.paintedWood, [0.6, 1.0, 0.08], [0, 0.5, -0.28], oak), // the back
    box(t.paintedWood, [0.08, 0.46, 0.08], [-0.26, 0, 0.24], oak),
    box(t.paintedWood, [0.08, 0.46, 0.08], [0.26, 0, 0.24], oak),
    box(t.paintedWood, [0.08, 0.46, 0.08], [-0.26, 0, -0.26], oak),
    box(t.paintedWood, [0.08, 0.46, 0.08], [0.26, 0, -0.26], oak),
    box(t.paintedWood, [0.1, 0.06, 0.56], [-0.33, 0.72, 0], oak), // the arms
    box(t.paintedWood, [0.1, 0.06, 0.56], [0.33, 0.72, 0], oak),
    box(t.paintedWood, [0.08, 0.2, 0.08], [-0.33, 0.54, 0.22], oak),
    box(t.paintedWood, [0.08, 0.2, 0.08], [0.33, 0.54, 0.22], oak),
    box(t.sheet, [0.13, 0.03, 0.07], [-0.33, 0.78, 0.12], strap), // wrists
    box(t.sheet, [0.13, 0.03, 0.07], [0.33, 0.78, 0.12], strap),
    box(t.sheet, [0.1, 0.07, 0.03], [-0.26, 0.14, 0.29], strap), // ankles
    box(t.sheet, [0.1, 0.07, 0.03], [0.26, 0.14, 0.29], strap),
    box(t.sheet, [0.62, 0.05, 0.03], [0, 1.36, -0.23], strap), // the brow
    box(t.iron, [0.04, 0.5, 0.04], [0, 1.5, -0.3], steel),
    strut(t.iron, [0, 2.0, -0.3], [0, 1.82, -0.05], [0.03, 0.03], steel),
    box(t.iron, [0.26, 0.1, 0.26], [0, 1.72, -0.05], steel), // the cap
    strut(t.sheet, [0.1, 1.76, -0.05], [0.5, 0.2, -0.5], [0.012, 0.012], { color: '#141414' }), // its cable
  );
}

// A camera tripod, legs spread, its head empty.
function tripod(t) {
  const black = { color: '#1a1a1c' };
  const top = [0, 1.25, 0];
  return group(
    ...[[0.38, 0.22], [-0.38, 0.22], [0, -0.44]].map(([x, z]) => strut(t.iron, top, [x, 0, z], [0.025, 0.025], black)),
    box(t.iron, [0.1, 0.06, 0.1], [0, 1.25, 0], black),
    strut(t.iron, [0, 1.28, 0], [-0.22, 1.2, -0.12], [0.015, 0.015], black), // the pan handle
  );
}

// Nora's camcorder, lying where she dropped it: grey body, lens, a strap,
// its red light still on.
function camcorder(t) {
  const grey = { color: '#3a3c40' };
  const body = group(
    box(t.sheet, [0.1, 0.12, 0.26], [0, 0, 0], grey),
    box(t.sheet, [0.07, 0.07, 0.08], [0, 0.025, 0.16], { color: '#141416' }), // the lens
    box(t.sheet, [0.05, 0.05, 0.09], [0.02, 0.12, -0.06], grey), // the viewfinder
    box(t.sheet, [0.012, 0.012, 0.012], [0.03, 0.09, 0.132], { unlit: true, color: '#ff3020' }),
    box(t.sheet, [0.012, 0.09, 0.2], [0.058, 0.015, 0.0], { color: '#5a3a22' }), // the hand strap
  );
  body.rotation.z = Math.PI / 2 - 0.1; // on its side
  body.position.y = 0.06;
  return group(body);
}

// A video cassette, a paper label on its spine.
function videoTape(t) {
  return group(
    box(t.sheet, [0.19, 0.025, 0.105], [0, 0, 0], { color: '#18181a' }),
    box(t.sheet, [0.12, 0.003, 0.04], [0, 0.025, 0.02], { color: '#d8d0b0' }),
  );
}

// The observation window: a steel frame in the wall line, wired glass.
function observationGlass(t, { width = 2.4, height = 1.2, sill = 1.0 } = {}) {
  const steel = { color: '#6a6e6a' };
  const wires = canvasTexture(16, 16, (g) => {
    g.clearRect(0, 0, 16, 16);
    g.fillStyle = 'rgba(190,210,205,0.16)';
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = 'rgba(30,34,32,0.5)';
    for (let i = 0; i < 16; i += 4) {
      g.fillRect(i, 0, 1, 16);
      g.fillRect(0, i, 16, 1);
    }
  });
  const pane = decal(wires, [width, height], [0, sill + height / 2, 0], { transparent: true, side: THREE.DoubleSide });
  pane.material.map.repeat?.set(width * 4, height * 4);
  return group(
    pane,
    box(t.iron, [width + 0.1, 0.06, 0.1], [0, sill - 0.06, 0], steel),
    box(t.iron, [width + 0.1, 0.06, 0.1], [0, sill + height, 0], steel),
    box(t.iron, [0.06, height, 0.1], [-width / 2, sill, 0], steel),
    box(t.iron, [0.06, height, 0.1], [width / 2, sill, 0], steel),
    box(t.iron, [0.04, height, 0.06], [0, sill, 0], steel),
  );
}

// Writing on the padding that only the camcorder's night view shows (back to
// the wall). "lines": what it says; "shown": false hides it (the game shows
// it while the night view is on).
function nightWriting(t, { lines = [], shown = true, width = 3.0 } = {}) {
  const texture = canvasTexture(128, 72, (g) => {
    g.clearRect(0, 0, 128, 72);
    g.fillStyle = '#f0fff0';
    g.textBaseline = 'top';
    lines.slice(0, 4).forEach((line, i) => {
      let size = 15;
      g.font = `bold ${size}px sans-serif`;
      while (size > 7 && g.measureText(line).width > 122) g.font = `bold ${(size -= 1)}px sans-serif`;
      g.save();
      g.translate(3 + (i % 2) * 4, 3 + i * 17);
      g.rotate(((i % 2) * 2 - 1) * 0.025); // a child's hand: no line quite level
      g.fillText(line, 0, 0);
      g.restore();
    });
  });
  const writing = decal(texture, [width, (width * 72) / 128], [0, 0.75, 0.015], { transparent: true, unlit: true, opacity: 0.95, depthWrite: false });
  writing.visible = shown;
  const prop = group(writing);
  prop.userData.setShown = (value) => (writing.visible = value);
  return prop;
}

export const WARD_UPPER_PROPS = { treatmentChair, tripod, camcorder, videoTape, observationGlass, nightWriting };
