// Props for the school's first floor (0.3 part B): the electric school bell,
// the projector and its pull-down screen, the headmaster's office and flat,
// the stair heads, and the faint pupils of the roll call. Same conventions as
// catalog.js: origin on the floor, front facing +z.
import * as THREE from 'three';
import { box, decal, plane, materialFor, canvasTexture } from './parts.js';
import { FURNISH_PROPS } from './furnish.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

function mesh(geometry, texture, options) {
  return new THREE.Mesh(geometry, materialFor(texture, options));
}

// A small seeded random, so a texture comes out the same every time.
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// The electric school bell high on a wall: a brass dome on a black box, its
// wire running up to the ceiling. Ringing, the dome blurs and the hammer is off.
function schoolBell(t, { height = 2.5, ringing = false } = {}) {
  const black = { color: '#1e1e1e' };
  const brass = { color: '#c8a050' };
  const dome = () => {
    const shell = mesh(new THREE.SphereGeometry(0.13, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), t.sheet, { ...brass, side: THREE.DoubleSide });
    shell.rotation.x = Math.PI / 2; // facing out of the wall
    shell.position.set(0, height + 0.08, 0.06);
    return shell;
  };
  const parts = [
    box(t.iron, [0.12, 0.1, 0.06], [0, height - 0.1, 0.03], black),
    box(t.iron, [0.02, 3.4 - height, 0.02], [0.04, height, 0.01], black), // the wire to the ceiling
    dome(),
    box(t.iron, [0.016, 0.1, 0.016], [ringing ? 0.05 : 0, height - 0.02, 0.1], black), // the hammer
  ];
  if (ringing) {
    [-0.012, 0.012].forEach((dx) => {
      const ghost = dome();
      ghost.material = materialFor(t.sheet, { ...brass, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
      ghost.position.x += dx;
      parts.push(ghost);
    });
  }
  return group(...parts);
}

// A 16 mm film projector on a steel trolley: two reels on their arms, the
// lens at the front (+z), a loop of film between the reels.
function projector(t) {
  const grey = { color: '#3a3c3e' };
  const reel = (z, y) => {
    const disc = mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.025, 12), t.iron, { color: '#5a5c5e' });
    disc.rotation.z = Math.PI / 2; // standing on edge, along z
    disc.position.set(0.06, y, z);
    return disc;
  };
  const lens = mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.12, 8), t.iron, { color: '#1a1a1c' });
  lens.rotation.x = Math.PI / 2;
  lens.position.set(-0.02, 1.02, 0.24);
  return group(
    FURNISH_PROPS.trolley(t),
    box(t.iron, [0.2, 0.22, 0.36], [0, 0.9, 0], grey),
    box(t.iron, [0.02, 0.24, 0.02], [0.06, 1.1, 0.12], grey),
    box(t.iron, [0.02, 0.18, 0.02], [0.06, 1.1, -0.14], grey),
    reel(0.14, 1.4),
    reel(-0.16, 1.32),
    box(t.sheet, [0.01, 0.42, 0.01], [0.07, 0.96, 0.02], { color: '#2a2018' }), // the film
    lens,
  );
}

// A frame of the old film: five children in a line in their school smocks,
// walking left to right, all in profile but the middle one, who has turned to
// the camera. Grain, scratches, a dark frame line.
export function filmFrameTexture() {
  return canvasTexture(96, 72, (g, w, h) => {
    const random = seeded(7);
    const light = g.createRadialGradient(w / 2, h / 2, 8, w / 2, h / 2, 60);
    light.addColorStop(0, '#a4a49e');
    light.addColorStop(1, '#3c3c3a');
    g.fillStyle = light;
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#727270'; // the floor
    g.fillRect(0, 54, w, 18);
    for (let i = 0; i < 5; i++) {
      const x = 6 + i * 18;
      const head = 22 + (i % 2) * 2;
      g.fillStyle = '#262628';
      g.fillRect(x, head + 6, 11, 20); // smock
      g.fillRect(x + 2, head + 26, 3, 8); // legs
      g.fillRect(x + 7, head + 26, 3, 8);
      g.beginPath();
      g.arc(x + 5.5, head, 5.5, 0, Math.PI * 2);
      g.fillStyle = i === 2 ? '#e4e4dc' : '#2e2e32';
      g.fill();
      if (i === 2) {
        g.fillStyle = '#060606'; // looking at you
        g.fillRect(x + 2, head - 2, 2, 3);
        g.fillRect(x + 7, head - 2, 2, 3);
      }
    }
    g.fillStyle = 'rgba(240,240,232,0.35)'; // scratches
    for (let i = 0; i < 4; i++) g.fillRect(Math.floor(random() * w), 0, 1, h);
    for (let i = 0; i < 180; i++) {
      g.fillStyle = random() < 0.5 ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.18)';
      g.fillRect(Math.floor(random() * w), Math.floor(random() * h), 1, 1);
    }
    g.fillStyle = '#121212'; // the frame line at the top
    g.fillRect(0, 0, w, 3);
  });
}

// A pull-down screen over a blackboard: the roller case, the cloth, the bar.
// film: the old film showing on it (unlit, as projected light).
function projectorScreen(t, { film = false } = {}) {
  const black = { color: '#1c1c1c' };
  const size = [2.0, 1.5];
  const at = [0, 1.75, 0.07];
  const cloth = film ? plane(filmFrameTexture(), size, at, { unlit: true }) : decal(t.sheet, size, at, { color: '#cfcfc6' });
  return group(
    box(t.iron, [2.2, 0.1, 0.1], [0, 2.5, 0.06], black),
    cloth,
    box(t.iron, [2.04, 0.03, 0.03], [0, 0.98, 0.07], black),
    box(t.sheet, [0.01, 0.3, 0.01], [0.3, 0.68, 0.07], { color: '#d8d0b8' }), // the pull cord
  );
}

// The headmaster's pedestal desk: drawers on his side (-z), a green leather top.
function pedestalDesk(t) {
  const wood = { color: '#4a2e1c' };
  const leather = canvasTexture(8, 8, (g) => {
    g.fillStyle = '#2a4a32';
    g.fillRect(0, 0, 8, 8);
  });
  const top = decal(leather, [1.3, 0.62], [0, 0.785, 0], { color: '#a0b0a0' });
  top.rotation.x = -Math.PI / 2;
  const parts = [box(t.paintedWood, [1.5, 0.05, 0.8], [0, 0.73, 0], wood), top, box(t.paintedWood, [0.62, 0.5, 0.04], [0, 0.23, 0.36], wood)];
  for (const x of [-0.52, 0.52]) {
    parts.push(box(t.paintedWood, [0.44, 0.73, 0.76], [x, 0, 0], wood));
    for (let i = 0; i < 3; i++) parts.push(box(t.sheet, [0.08, 0.02, 0.02], [x, 0.18 + i * 0.22, -0.39], { color: '#c8a050' }));
  }
  return group(...parts);
}

// An upholstered armchair, worn dark red.
function armchair(t) {
  const fabric = { color: '#5a2424' };
  const legs = [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]].map(([x, z]) => box(t.paintedWood, [0.05, 0.12, 0.05], [x, 0, z], { color: '#2a1a10' }));
  return group(
    ...legs,
    box(t.sheet, [0.74, 0.3, 0.7], [0, 0.12, 0], fabric),
    box(t.sheet, [0.74, 0.62, 0.16], [0, 0.42, -0.29], fabric),
    box(t.sheet, [0.13, 0.26, 0.62], [-0.32, 0.42, 0.02], fabric),
    box(t.sheet, [0.13, 0.26, 0.62], [0.32, 0.42, 0.02], fabric),
  );
}

// A small bedside cupboard with a drawer (its top at 0.6 m).
function bedsideCupboard(t) {
  const wood = { color: '#4a3020' };
  return group(
    box(t.paintedWood, [0.46, 0.6, 0.4], [0, 0, 0], wood),
    box(t.sheet, [0.4, 0.01, 0.01], [0, 0.44, 0.2], { color: '#1a100a' }),
    box(t.sheet, [0.06, 0.02, 0.02], [0, 0.5, 0.21], { color: '#c8a050' }),
  );
}

// A tall wardrobe, two doors and a cornice.
function wardrobe(t) {
  const wood = { color: '#4a3020' };
  return group(
    box(t.paintedWood, [1.1, 1.95, 0.56], [0, 0.06, 0], wood),
    box(t.paintedWood, [1.18, 0.08, 0.62], [0, 2.01, 0], wood),
    box(t.sheet, [0.01, 1.8, 0.01], [0, 0.14, 0.285], { color: '#1a100a' }),
    box(t.sheet, [0.02, 0.1, 0.02], [-0.05, 1.05, 0.29], { color: '#c8a050' }),
    box(t.sheet, [0.02, 0.1, 0.02], [0.05, 1.05, 0.29], { color: '#c8a050' }),
  );
}

// A wind-up gramophone with a brass horn (sits on a table: y in level data).
function gramophone(t) {
  const horn = mesh(new THREE.CylinderGeometry(0.17, 0.02, 0.36, 10, 1, true), t.sheet, { color: '#b8904a', side: THREE.DoubleSide });
  horn.rotation.x = -0.9; // up and out to the front
  horn.position.set(0.05, 0.36, 0.08);
  const record = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.008, 14), t.iron, { color: '#141414' });
  record.position.set(0, 0.145, 0);
  return group(box(t.paintedWood, [0.34, 0.14, 0.34], [0, 0, 0], { color: '#5a3420' }), record, horn);
}

// A coat stand by the door: his black coat and a hat on the hooks.
function hatStand(t) {
  const wood = { color: '#3a2618' };
  const hat = mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.1, 8), t.sheet, { color: '#1e1e22' });
  hat.position.set(0.1, 1.78, 0);
  const brim = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.012, 10), t.sheet, { color: '#1e1e22' });
  brim.position.set(0.1, 1.73, 0);
  return group(
    box(t.paintedWood, [0.5, 0.04, 0.06], [0, 0, 0], wood),
    box(t.paintedWood, [0.06, 0.04, 0.5], [0, 0, 0], wood),
    box(t.paintedWood, [0.05, 1.8, 0.05], [0, 0.04, 0], wood),
    box(t.sheet, [0.3, 0.95, 0.16], [-0.1, 0.62, 0.02], { color: '#202024' }), // the coat
    hat, brim,
  );
}

// The head of a stair going down into the dark, through a room's "well"
// (no floor there): the flight falls away along -z from the top step, the
// rails with it. carpet: the red runner of the main stairs.
function stairHead(t, { width = 1.6, steps = 8, rise = 0.2, run = 0.28, carpet = false } = {}) {
  const rail = { color: '#3a2618' };
  const wood = { color: '#7a5a3a' };
  const parts = [];
  for (let i = 1; i <= steps; i++) {
    const z = -(i - 0.5) * run;
    parts.push(box(t.wood, [width, 0.05, run], [0, -i * rise - 0.05, z], wood));
    parts.push(box(t.wood, [width, rise, 0.03], [0, -i * rise, -(i - 1) * run], wood));
    if (carpet) parts.push(box(t.sheet, [0.8, 0.012, run], [0, -i * rise, z], { color: '#8a3028' }));
  }
  const length = Math.hypot(steps * run, steps * rise);
  const side = width / 2 - 0.04;
  const fall = (x) => {
    const bar = box(t.paintedWood, [0.06, 0.05, length], [0, 0, 0], rail);
    bar.position.set(x, 0.95 - (steps * rise) / 2, -(steps * run) / 2);
    bar.rotation.x = -Math.atan2(rise, run); // down the flight
    return bar;
  };
  parts.push(
    box(t.paintedWood, [0.1, 1.05, 0.1], [-side, 0, 0.02], rail),
    box(t.paintedWood, [0.1, 1.05, 0.1], [side, 0, 0.02], rail),
    fall(-side),
    fall(side),
  );
  return group(...parts);
}

// A small side table (the gramophone stands on it; its top at 0.6 m).
function sideTable(t) {
  const wood = { color: '#4a3020' };
  const legs = [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map(([x, z]) => box(t.paintedWood, [0.04, 0.57, 0.04], [x, 0, z], wood));
  return group(...legs, box(t.paintedWood, [0.5, 0.03, 0.5], [0, 0.57, 0], wood));
}

// A blurred face with two black eyes (the pupils at the roll call).
function blurredFaceTexture() {
  return canvasTexture(24, 24, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const glow = g.createRadialGradient(12, 12, 2, 12, 12, 12);
    glow.addColorStop(0, 'rgba(232,236,240,0.95)');
    glow.addColorStop(1, 'rgba(232,236,240,0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(6,6,8,0.95)';
    for (const x of [8, 16]) {
      g.beginPath();
      g.ellipse(x, 11, 2.2, 2.6, 0, 0, Math.PI * 2);
      g.fill();
    }
  });
}

// A faint pupil sitting at a desk (seat height), hands on the lid, the head
// turned by "turn" radians (to look at you).
function ghostPupil(t, { opacity = 0.45, turn = 0 } = {}) {
  const ghost = { unlit: true, color: 0xd8e4ec, transparent: true, opacity, depthWrite: false, fog: false };
  const head = mesh(new THREE.SphereGeometry(0.1, 7, 5), t.sheet, ghost);
  const face = plane(blurredFaceTexture(), [0.18, 0.18], [0, 0, 0.095], { ...ghost, opacity: Math.min(1, opacity + 0.35) });
  const headGroup = group(head, face);
  headGroup.position.set(0, 0.98, 0.32);
  headGroup.rotation.y = turn;
  const arms = [-0.13, 0.13].map((x) => {
    const arm = box(t.sheet, [0.05, 0.05, 0.3], [x, 0.7, 0.12], ghost);
    return arm;
  });
  return group(
    box(t.sheet, [0.28, 0.42, 0.17], [0, 0.44, 0.34], ghost),
    box(t.sheet, [0.24, 0.06, 0.3], [0, 0.42, 0.2], ghost),
    ...arms,
    headGroup,
  );
}

export const UPSTAIRS_PROPS = {
  schoolBell, projector, projectorScreen, pedestalDesk, armchair, bedsideCupboard, wardrobe, gramophone, hatStand, stairHead, sideTable,
  ghostPupil,
};
