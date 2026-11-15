// Props for the rooms of the asylum wards' ground floor (0.4, part A): the
// fuse board, the day room's television, the admissions pigeonholes. Same
// conventions as catalog.js: origin on the floor, front facing +z; wall-hung
// things have their back at z = 0.
import * as THREE from 'three';
import { box, decal, strut, materialFor, canvasTexture } from './parts.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

function labelTexture(text) {
  return canvasTexture(48, 8, (g, w, h) => {
    g.fillStyle = '#d8d0b0';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#1c1814';
    g.font = 'bold 7px monospace';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, w / 2, h / 2 + 0.5);
  });
}

// The fuse board (puzzle 1): a slate panel with six porcelain sockets, each
// labelled with its circuit, a main lever, conduit to the ceiling. "fuses":
// which sockets (0–5) hold a fuse at first; "labels": the six circuit names
// (far too small to read from where you stand: the close-up carries them).
function fuseBoard(t, { fuses = [0], labels = ['A', 'B', 'C', 'D', 'E', 'F'] } = {}) {
  const porcelain = { color: '#d6d2c4' };
  const parts = [
    box(t.sheet, [1.1, 0.84, 0.05], [0, 1.02, 0.025], { color: '#33363a' }), // the slate
    box(t.paintedWood, [1.18, 0.05, 0.08], [0, 0.98, 0.04], { color: '#4a3524' }),
    box(t.paintedWood, [1.18, 0.05, 0.08], [0, 1.85, 0.04], { color: '#4a3524' }),
    box(t.iron, [0.04, 1.5, 0.04], [-0.38, 1.9, 0.03]), // conduit
    box(t.iron, [0.04, 1.5, 0.04], [0.1, 1.9, 0.03]),
    box(t.iron, [0.1, 0.16, 0.06], [0.47, 1.36, 0.06], { color: '#1e1e20' }), // main switch
    strut(t.iron, [0.47, 1.46, 0.09], [0.47, 1.62, 0.2], [0.025, 0.025], { color: '#8a2a22' }),
  ];
  const plugs = [];
  labels.forEach((text, i) => {
    const x = -0.36 + (i % 3) * 0.3;
    const y = i < 3 ? 1.5 : 1.14;
    parts.push(
      box(t.sheet, [0.16, 0.16, 0.04], [x, y, 0.06], porcelain),
      box(t.sheet, [0.07, 0.07, 0.02], [x, y + 0.045, 0.085], { color: '#141414' }), // the empty socket
      decal(labelTexture(text), [0.24, 0.045], [x, y - 0.04, 0.052]),
    );
    const fuse = group(
      box(t.sheet, [0.06, 0.06, 0.09], [x, y + 0.05, 0.1], porcelain),
      box(t.sheet, [0.035, 0.035, 0.02], [x, y + 0.0625, 0.15], { color: '#b8923a' }),
    );
    fuse.visible = fuses.includes(i);
    plugs.push(fuse);
    parts.push(fuse);
  });
  const board = group(...parts);
  // The puzzle shows which sockets hold a fuse now (puzzles/wardFuses.js).
  board.userData.setFuses = (held) => plugs.forEach((plug, i) => (plug.visible = Boolean(held[i])));
  return board;
}

function staticTexture() {
  let seed = 3;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return canvasTexture(32, 24, (g, w, h) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const v = Math.floor(70 + random() * 170);
        g.fillStyle = `rgb(${v},${v},${Math.min(255, v + 12)})`;
        g.fillRect(x, y, 1, 1);
      }
    }
  });
}

// The day room's television on a wheeled stand, a video recorder on the
// shelf under it (Nora's tape plays here). "on": the screen full of static,
// lighting the room in front of it.
function television(t, { on = false } = {}) {
  const wood = { color: '#4a3524' };
  const dark = { color: '#1c1c20' };
  const legs = [[-0.3, -0.2], [0.3, -0.2], [-0.3, 0.2], [0.3, 0.2]].map(([x, z]) => box(t.iron, [0.03, 0.74, 0.03], [x, 0.04, z]));
  const wheels = [[-0.3, -0.2], [0.3, -0.2], [-0.3, 0.2], [0.3, 0.2]].map(([x, z]) => box(t.iron, [0.04, 0.05, 0.06], [x, 0, z], dark));
  const screen = on
    ? decal(staticTexture(), [0.44, 0.34], [-0.06, 1.05, 0.262], { unlit: true })
    : decal(t.windowPane, [0.44, 0.34], [-0.06, 1.05, 0.262], { color: '#2a3030' });
  const parts = [
    ...legs, ...wheels,
    box(t.paintedWood, [0.7, 0.03, 0.5], [0, 0.78, 0], wood), // top shelf
    box(t.paintedWood, [0.7, 0.03, 0.5], [0, 0.4, 0], wood), // recorder shelf
    box(t.paintedWood, [0.66, 0.5, 0.5], [0, 0.81, 0], wood), // the set
    box(t.sheet, [0.5, 0.4, 0.02], [-0.06, 0.86, 0.25], dark), // the tube's surround
    screen,
    box(t.sheet, [0.03, 0.03, 0.02], [0.27, 1.16, 0.255], { color: '#b8b0a0' }), // knobs
    box(t.sheet, [0.03, 0.03, 0.02], [0.27, 1.08, 0.255], { color: '#b8b0a0' }),
    box(t.sheet, [0.46, 0.1, 0.34], [0, 0.43, 0.02], dark), // the video recorder
    box(t.sheet, [0.2, 0.02, 0.01], [-0.08, 0.485, 0.192], { color: '#060606' }), // its slot
    box(t.sheet, [0.07, 0.02, 0.01], [0.14, 0.47, 0.192], { unlit: true, color: '#3aff7a' }), // its clock
    strut(t.iron, [0, 1.31, -0.1], [-0.24, 1.72, -0.14], [0.008, 0.008]), // the aerial
    strut(t.iron, [0, 1.31, -0.1], [0.24, 1.72, -0.14], [0.008, 0.008]),
  ];
  if (on) {
    const glow = new THREE.PointLight('#aebcff', 7, 7, 1.3);
    glow.position.set(-0.06, 1.05, 0.7);
    parts.push(glow);
  }
  return group(...parts);
}

// Pigeonholes on the wall behind the admissions desk: a grid of small
// compartments, papers left in some.
function pigeonholes(t, { columns = 6, rows = 4 } = {}) {
  const wood = { color: '#5a4028' };
  const width = columns * 0.2;
  const height = rows * 0.2;
  const parts = [box(t.paintedWood, [width + 0.04, height + 0.04, 0.02], [0, 1.0, 0.01], { color: '#3a2a1c' })];
  for (let i = 0; i <= columns; i++) parts.push(box(t.paintedWood, [0.02, height + 0.04, 0.24], [-width / 2 + i * 0.2, 1.0, 0.12], wood));
  for (let j = 0; j <= rows; j++) parts.push(box(t.paintedWood, [width + 0.04, 0.02, 0.24], [0, 1.0 + j * 0.2, 0.12], wood));
  [[0, 0], [2, 0], [3, 1], [5, 1], [1, 2], [4, 2], [2, 3], [5, 3], [0, 3]].forEach(([i, j], n) => {
    parts.push(box(t.sheet, [0.14, 0.02 + (n % 3) * 0.015, 0.2], [-width / 2 + 0.1 + i * 0.2, 1.02 + j * 0.2, 0.13], { color: n % 2 ? '#cfc6a8' : '#b8ae90' }));
  });
  return group(...parts);
}

// The nurses' call board: numbered flags behind glass, one dropped, a bell.
function callBoard(t, { beds = 8, dropped = 7 } = {}) {
  const parts = [box(t.paintedWood, [0.9, 0.5, 0.06], [0, 1.5, 0.03], { color: '#3a2a1c' })];
  for (let i = 0; i < beds; i++) {
    const x = -0.33 + (i % 4) * 0.22;
    const y = i < 4 ? 1.78 : 1.56;
    parts.push(box(t.sheet, [0.14, 0.14, 0.01], [x, y, 0.065], { color: '#14110e' }));
    if (i + 1 === dropped) parts.push(box(t.sheet, [0.1, 0.1, 0.012], [x, y + 0.01, 0.07], { color: '#b02a22' }));
  }
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), materialFor(t.sheet, { color: '#b8923a' }));
  bell.rotation.x = Math.PI / 2;
  bell.position.set(0, 2.1, 0.03);
  return group(...parts, bell);
}

// A drip stand on a tripod foot, an empty glass bottle hung from its hook.
function dripStand(t) {
  const steel = { color: '#a8aca6' };
  return group(
    box(t.iron, [0.025, 1.85, 0.025], [0, 0.03, 0], steel),
    box(t.iron, [0.5, 0.03, 0.04], [0, 0, 0], steel),
    box(t.iron, [0.04, 0.03, 0.5], [0, 0, 0], steel),
    box(t.iron, [0.22, 0.02, 0.02], [0.1, 1.86, 0], steel),
    box(t.sheet, [0.08, 0.2, 0.08], [0.19, 1.62, 0], { color: '#8aa0a0', transparent: true, opacity: 0.6 }),
    strut(t.sheet, [0.19, 1.62, 0], [0.12, 1.0, 0.05], [0.008, 0.008], { color: '#b8a878' }),
  );
}

// A wheeled stretcher, 1.9 m long (along z): a thin mattress, a sheet thrown
// half off it, a strap hanging.
function stretcher(t) {
  const steel = { color: '#9a9e98' };
  const legs = [[-0.3, -0.8], [0.3, -0.8], [-0.3, 0.8], [0.3, 0.8]].map(([x, z]) => box(t.iron, [0.03, 0.72, 0.03], [x, 0.06, z], steel));
  const wheels = [[-0.3, -0.8], [0.3, -0.8], [-0.3, 0.8], [0.3, 0.8]].map(([x, z]) => box(t.iron, [0.04, 0.08, 0.08], [x, 0, z], { color: '#1e1e20' }));
  const sheet = box(t.sheet, [0.5, 0.5, 0.02], [0.36, 0.34, 0.2], { color: '#b8b4a4' });
  sheet.rotation.z = 0.12;
  return group(
    ...legs, ...wheels,
    box(t.iron, [0.66, 0.03, 1.9], [0, 0.78, 0], steel),
    box(t.mattress, [0.62, 0.07, 1.84], [0, 0.81, 0]),
    box(t.sheet, [0.66, 0.02, 0.9], [0.04, 0.88, 0.3], { color: '#b8b4a4' }),
    sheet,
    box(t.sheet, [0.05, 0.4, 0.012], [-0.34, 0.44, -0.3], { color: '#4a3020' }),
  );
}

// A rule painted on a board on the wall (back to the wall). Its words come
// from the game's language (levels/signs.js calls userData.write with the
// lines of the prop's "sign" text); blank until then.
function wallSign(t, { width = 3.0, height = 1.04, y = 1.82 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = 136;
  canvas.height = 48;
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  function write(lines = []) {
    const g = canvas.getContext('2d');
    g.fillStyle = '#d8d0b0';
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.fillStyle = '#1c1814';
    [[0, 0, canvas.width, 2], [0, canvas.height - 2, canvas.width, 2], [0, 0, 2, canvas.height], [canvas.width - 2, 0, 2, canvas.height]].forEach((r) => g.fillRect(...r));
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    lines.slice(0, 2).forEach((line, i) => {
      let size = i === 0 ? 20 : 16;
      g.font = `bold ${size}px monospace`;
      while (size > 8 && g.measureText(line).width > canvas.width - 10) g.font = `bold ${(size -= 1)}px monospace`;
      g.fillText(line, canvas.width / 2, lines.length === 1 ? canvas.height / 2 : 14 + i * 21);
    });
    texture.needsUpdate = true;
  }
  write();
  const board = decal(texture, [width, height], [0, y + height / 2, 0.012]);
  board.userData.write = write;
  const sign = group(board);
  sign.userData.write = write;
  return sign;
}

export const WARD_ROOM_PROPS = { fuseBoard, television, pigeonholes, callBoard, dripStand, stretcher, wallSign };
