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
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const texture = canvasTexture(160, 96, (g) => {
    g.clearRect(0, 0, 160, 96);
    g.strokeStyle = '#f0fff0';
    g.fillStyle = '#f0fff0';
    g.lineCap = 'round';
    // A child's hand, scratched with a fingernail: each letter its own size
    // and lean, the lines wandering, every stroke gone over twice.
    lines.slice(0, 4).forEach((line, i) => {
      const size = Math.min(17, 150 / (line.length * 0.62));
      let x = 4 + random() * 6;
      const base = 20 + i * 22;
      for (const letter of line) {
        const tall = size * (0.85 + random() * 0.3) * (/[0-9]/.test(letter) ? 1.4 : 1); // the numbers pressed harder
        g.font = `bold ${tall}px sans-serif`;
        g.save();
        g.translate(x, base + (random() - 0.5) * 4 + (x / 160) * (i % 2 ? 5 : -4));
        g.rotate((random() - 0.5) * 0.22);
        g.fillText(letter, 0, 0);
        g.fillText(letter, 0.6, 0.4); // gone over twice
        g.restore();
        x += g.measureText(letter).width + 0.6;
      }
    });
    for (let i = 0; i < 9; i++) { // stray scratches beside the words
      const x = random() * 150;
      const y = random() * 90;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + 3 + random() * 5, y + (random() - 0.5) * 5);
      g.stroke();
    }
  });
  const writing = decal(texture, [width, (width * 96) / 160], [0, 1.15, 0.015], { transparent: true, unlit: true, opacity: 0.95, depthWrite: false });
  writing.visible = shown;
  const prop = group(writing);
  prop.userData.setShown = (value) => (writing.visible = value);
  return prop;
}

// The lamp over the treatment chair: a wide enamel shade on an arm from the
// ceiling, its bulb lit (the level puts the light under it).
function surgeryLamp(t, { ceiling = 3.4, drop = 1.2 } = {}) {
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.2, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0x8a9088, side: THREE.DoubleSide }));
  shade.position.y = ceiling - drop;
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), new THREE.MeshBasicMaterial({ color: 0xf2f6ff }));
  bulb.position.y = ceiling - drop - 0.06;
  return group(box(t.iron, [0.03, drop - 0.1, 0.03], [0, ceiling - drop + 0.1, 0], { color: '#3a3c3a' }), shade, bulb);
}

// A steel tray of instruments on a stand: a row of thin tools, a kidney
// dish, a folded cloth.
function instrumentTray(t) {
  const steel = { color: '#b0b4ae' };
  const tools = [-0.16, -0.1, -0.04, 0.02, 0.08].map((x, i) => box(t.iron, [0.012, 0.01, 0.16 + (i % 2) * 0.05], [x, 0.905, 0.02], steel));
  return group(
    box(t.iron, [0.03, 0.86, 0.03], [0, 0, 0], steel),
    box(t.iron, [0.4, 0.03, 0.04], [0, 0, 0], steel),
    box(t.iron, [0.04, 0.03, 0.4], [0, 0, 0], steel),
    box(t.iron, [0.5, 0.02, 0.34], [0, 0.88, 0], steel),
    ...tools,
    box(t.sheet, [0.12, 0.03, 0.08], [0.17, 0.9, -0.08], { color: '#8a9a9a' }),
    box(t.sheet, [0.14, 0.02, 0.1], [0.16, 0.9, 0.08], { color: '#c8c4b4' }),
  );
}

// A dark old stain on the floor (walkable), soaked in around a drain or a chair.
function floorStain(t, { width = 1.4, depth = 1.1 } = {}) {
  let seed = 4;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const texture = canvasTexture(24, 24, (g) => {
    g.clearRect(0, 0, 24, 24);
    for (let y = 0; y < 24; y++) {
      for (let x = 0; x < 24; x++) {
        const d = Math.hypot(x - 11.5, y - 11.5) / 12 + (random() - 0.5) * 0.35;
        if (d < 1) {
          g.fillStyle = `rgba(${34 + random() * 14},${14 + random() * 8},${10 + random() * 6},${Math.min(0.85, (1 - d) * 1.6)})`;
          g.fillRect(x, y, 1, 1);
        }
      }
    }
  });
  const stain = decal(texture, [width, depth], [0, 0.012, 0], { transparent: true, depthWrite: false });
  stain.rotation.x = -Math.PI / 2;
  return group(stain);
}

export const WARD_UPPER_PROPS = { treatmentChair, tripod, camcorder, videoTape, observationGlass, nightWriting, surgeryLamp, instrumentTray, floorStain };
