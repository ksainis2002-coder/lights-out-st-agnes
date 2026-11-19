// Proposal stills for part C (0.5): the theatre's door, locked till page four
// (owner 2026-11-18); Nora on her feet behind you; the cabinet's lock; the
// stairs up, Dr. Venn below; the three endings' key moments and their end
// card; your room's last change. Built on the game's own levels. Not in the
// game until approved; the words are the approved content sheet's.
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { box, decal, canvasTexture, drawSymbol, TUNE_SYMBOLS } from '../props/parts.js';
import { osdText, COLORS } from '../ui/osd.js';
import { look, message, subtitle, W, H } from './helpers.js';
import basement from '../levels/basement.json';
import grounds from '../levels/grounds.json';
import patientRoom from '../levels/patient_room.json';

// Metres from cells on the world's level.
const at = (world, c, r) => [c * world.level.cellSize, r * world.level.cellSize];

function put(world, type, [x, z], { turn = 0, y = 0, options } = {}) {
  const prop = PROPS[type](world.textures, options);
  prop.position.set(x, y, z);
  prop.rotation.y = (turn * Math.PI) / 180;
  world.scene.add(prop);
  return prop;
}

function light(world, color, intensity, distance, [x, z], y) {
  const l = new THREE.PointLight(color, intensity, distance, 1.3);
  l.position.set(x, y, z);
  world.scene.add(l);
  return l;
}

const dim = (world, k) => world.scene.traverse((o) => o.isLight && !o.isAmbientLight && (o.intensity *= k));

// The theatre furnished as in the approved still: his table under its lamp, Nora on it, his cabinet and tray.
function theatre(world, { nora = true, row = 12.6, glare = 1 } = {}) {
  const table = at(world, 21.5, row);
  put(world, 'operatingTable', table, { options: { straps: false } });
  if (nora) put(world, 'noraStrapped', table, { y: 0.92 });
  put(world, 'theatreLamp', table, { options: { height: 3.8 } }).traverse((o) => o.isLight && Object.assign(o, { intensity: o.intensity * glare, distance: o.distance * Math.sqrt(glare) }));
  put(world, 'instrumentCabinet', at(world, 24.6, 12.0), { turn: -90 });
  put(world, 'instrumentTray', at(world, 22.7, 13.4), { turn: -20 });
  return table;
}

// The theatre's corridor door with a pane of wired glass in it (in the game: a door "look").
function glassDoor(world, id) {
  const { hinge } = world.doors.panels.find((panel) => panel.door.id === id);
  const s = world.level.cellSize;
  const t = world.textures;
  hinge.clear();
  hinge.add(
    box(t.door, [s, 1.2, 0.06], [s / 2, 0, 0]), box(t.door, [s, 0.3, 0.06], [s / 2, 1.8, 0]),
    box(t.door, [0.3, 0.6, 0.06], [0.15, 1.2, 0]), box(t.door, [0.3, 0.6, 0.06], [s - 0.15, 1.2, 0]),
  );
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(s - 0.6, 0.6), new THREE.MeshBasicMaterial({ color: '#9fb0a8', transparent: true, opacity: 0.18, depthWrite: false }));
  glass.position.set(s / 2, 1.5, 0);
  hinge.add(glass);
}

// Black bars above and below, the ending's line in the lower one: how an ending's steps play.
function ending(ctx, text) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, 34);
  ctx.fillRect(0, H - 46, W, 46);
  osdText(ctx, text, W / 2, H - 32, 10, COLORS.text, 'center');
}

// Dark veins over warm walls (Becomes the building): a decal to lay on a wall.
function veinsTexture(seed) {
  let s = seed;
  const random = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return canvasTexture(128, 96, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const branch = (x, y, a, width, depth) => {
      const length = 10 + random() * 18;
      const x1 = x + Math.cos(a) * length;
      const y1 = y + Math.sin(a) * length;
      g.strokeStyle = `rgba(40,6,8,${0.35 + width * 0.12})`;
      g.lineWidth = width;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x1, y1);
      g.stroke();
      if (depth > 0) [-0.5, 0.45].forEach((turn) => random() < 0.8 && branch(x1, y1, a + turn + (random() - 0.5) * 0.4, width * 0.7, depth - 1));
    };
    for (let i = 0; i < 5; i++) branch(random() * w, h, -Math.PI / 2 + (random() - 0.5) * 0.8, 3, 5);
  });
}

// The cabinet's lock up close: a steel plate, five little brass keys with Edith's pictures.
function cabinetLock(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#4a4e52';
  ctx.fillRect(110, 70, 260, 140);
  ctx.fillStyle = '#6c7074';
  ctx.fillRect(116, 76, 248, 128);
  ctx.fillStyle = '#3a3c40';
  [[122, 82], [352, 82], [122, 192], [352, 192]].forEach(([x, y]) => ctx.fillRect(x, y, 6, 6)); // rivets
  ctx.fillStyle = '#2a2a2c';
  ctx.fillRect(234, 96, 12, 22); // the keyhole that takes no key
  TUNE_SYMBOLS.forEach((name, i) => {
    const x = 130 + i * 46;
    ctx.fillStyle = '#b0884a';
    ctx.fillRect(x, 140, 38, 46);
    ctx.fillStyle = '#c8a462';
    ctx.fillRect(x + 2, 142, 34, 6);
    ctx.strokeStyle = '#3a2614';
    ctx.lineWidth = 2;
    drawSymbol(ctx, name, x + 5, 147, 28);
    osdText(ctx, String(i + 1), x + 19, 190, 8, COLORS.dim, 'center');
  });
  osdText(ctx, 'CLICK a key  ·  ESC step back', W / 2, H - 22, 8, COLORS.dim, 'center');
}

export const FINALE_STILLS = {
  // From the cold corridor: the theatre's door, locked; through its glass the lamp over the table.
  theatre_door: {
    level: basement,
    setup({ world }) {
      theatre(world, { row: 11.7, glare: 2.5 });
      glassDoor(world, 'theatre_door');
      look(world, at(world, 21.6, 8.6), at(world, 21.5, 9.5), 1.6, 1.42);
    },
    ui(ctx) {
      message(ctx, 'Locked from the inside. Through the glass, a lamp over a table.');
    },
  },
  // Nora on her feet behind you in the cold corridor, in your light: two to keep quiet.
  nora_follow: {
    level: basement,
    setup({ world }) {
      put(world, 'noraStanding', at(world, 10.7, 7.95), { turn: 90, options: { pose: 'follow' } });
      look(world, at(world, 12.15, 8.0), at(world, 10.7, 7.95), 1.6, 1.2);
    },
    ui(ctx) {
      subtitle(ctx, '(Nora, whispering) Is he close?');
    },
  },
  // The cabinet in his theatre, its lock up close.
  cabinet_lock: {
    level: basement,
    setup({ world }) {
      theatre(world);
      look(world, at(world, 23.4, 12.0), at(world, 24.6, 12.0), 1.6, 1.3);
    },
    ui: cabinetLock,
  },
  // Up the stairs from his theatre, looking back: he is coming up below you.
  west_stairs: {
    level: basement,
    setup({ world }) {
      put(world, 'surgeon', [3.0, 5.9], { turn: 180, options: { facing: 0.1 } });
      light(world, '#c8b890', 2.2, 6, [3.0, 8.6], 2.4); // the corridor's bulb behind him
      look(world, [3.0, 2.68], [3.0, 5.8], 2.4, 1.0); // five steps up the basement stairs
    },
    ui(ctx) {
      subtitle(ctx, '(instruments clinking, on the stairs below you)', { whisper: false });
    },
  },
  // Escape: out of the gate on the road, looking back. Every dormitory window is orange.
  ending_road: {
    level: grounds,
    setup({ world }) {
      world.scene.traverse((o) => o.userData.prop?.type === 'rain' && (o.visible = false)); // the dead calm
      world.scene.background = new THREE.Color('#2a140a'); // the sky over a fire
      world.scene.fog = new THREE.FogExp2('#2a140a', 0.022);
      // The orphanage's courtyard side: every window lit from inside by the fire, two floors of them.
      for (const z of [16.2, 18.4, 20.6, 22.8]) {
        for (const y of [1.7, 3.9]) {
          const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.5), new THREE.MeshBasicMaterial({ color: y > 3 ? '#ffb050' : '#ff7a20', fog: false }));
          glow.position.set(1.53, y, z);
          glow.rotation.y = Math.PI / 2;
          world.scene.add(glow);
        }
        light(world, '#ff6a1a', 6, 12, [3.5, z], 2.6);
      }
      world.flashlight.toggle();
      look(world, [25.2, 34.0], [1.5, 19.8], 1.6, 2.6); // just out of the front gate, on the road
    },
    ui(ctx) {
      ending(ctx, 'The road. Behind me, every window of the dormitories is orange.');
    },
  },
  // Acceptance: on his table, looking up into the lamp.
  ending_lamp: {
    level: basement,
    setup({ world, fx }) {
      const [x, z] = theatre(world, { nora: false });
      world.flashlight.toggle();
      Object.assign(fx, { vignette: 0.55, blur: 0.6 });
      look(world, [x, z + 0.55], [x, z + 0.05], 1.05, 3.6);
    },
    ui(ctx) {
      ending(ctx, 'A lamp over a table. A man\'s voice, asking me to count backwards from ten.');
    },
  },
  // Acceptance: morning at a window your room never had; Nora by it.
  ending_morning: {
    level: patientRoom,
    setup({ world }) {
      dim(world, 0.7);
      world.flashlight.toggle();
      const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.25), new THREE.MeshBasicMaterial({ color: '#fff4dc', fog: false }));
      pane.position.set(4.97, 1.65, 2.4);
      pane.rotation.y = -Math.PI / 2;
      world.scene.add(pane);
      const t = world.textures;
      const wood = { color: '#4a3a2a' };
      const frame = new THREE.Group().add( // its frame and the bar across it
        box(t.wood, [0.08, 1.4, 0.06], [-0.54, 0.95, 0], wood), box(t.wood, [0.08, 1.4, 0.06], [0.54, 0.95, 0], wood),
        box(t.wood, [1.16, 0.08, 0.06], [0, 0.98, 0], wood), box(t.wood, [1.16, 0.08, 0.06], [0, 2.3, 0], wood),
        box(t.wood, [1.0, 0.04, 0.04], [0, 1.63, 0], wood), box(t.wood, [0.04, 1.25, 0.04], [0, 1.02, 0], wood),
      );
      frame.position.set(4.96, 0, 2.4);
      frame.rotation.y = -Math.PI / 2;
      world.scene.add(frame);
      const sun = new THREE.SpotLight('#ffe2b0', 80, 10, 0.8, 0.5, 1.0);
      sun.position.set(4.9, 2.0, 2.4);
      sun.target.position.set(2.0, 0, 3.6);
      world.scene.add(sun, sun.target);
      light(world, '#ffd8a0', 2.5, 4, [4.4, 2.6], 1.7);
      light(world, '#ffe0b8', 9, 3, [3.3, 4.3], 1.7); // the morning back off the walls, on her face
      put(world, 'noraStanding', [4.15, 3.55], { turn: -48, options: { pose: 'window' } });
      look(world, [2.75, 4.95], [4.25, 3.2], 1.6, 1.42);
    },
    ui(ctx) {
      ending(ctx, 'Morning comes in at the window. I have never seen it from here.');
    },
  },
  // Becomes the building: your room, the walls warm and veined; they have a pulse.
  ending_walls: {
    level: patientRoom,
    setup({ world, fx }) {
      world.flashlight.toggle();
      world.levelGroup.traverse((o) => o.isMesh && o.material?.color && !o.parent?.userData.prop && o.material.color.multiply(new THREE.Color('#a04434')));
      light(world, '#b0402a', 4, 6, [3.0, 3.2], 2.2);
      [[2.4, 1.02, 0], [3.9, 1.02, 0], [1.02, 3.0, 90], [4.98, 3.4, -90]].forEach(([x, z, turn], i) => {
        const veins = decal(veinsTexture(7 + i * 13), [1.6, 1.2], [0, 1.4, 0], { alphaTest: 0.2 });
        veins.position.set(x, 1.4, z);
        veins.rotation.y = (turn * Math.PI) / 180;
        world.scene.add(veins);
      });
      Object.assign(fx, { vignette: 0.6 });
      look(world, [2.2, 3.6], [3.2, 1.0], 0.95, 1.5);
    },
    ui(ctx) {
      ending(ctx, 'The walls are warm. They have a pulse.');
    },
  },
  // Becomes the building: in the coal store, a child's height, the door shutting on the corridor's light.
  ending_coal: {
    level: basement,
    setup({ world }) {
      world.flashlight.toggle();
      dim(world, 0.2);
      const { hinge } = world.doors.panels.find((panel) => panel.door.id === 'coal_door');
      hinge.rotation.y = -0.17; // a hand's breadth left
      light(world, '#e0c890', 14, 7, at(world, 7.9, 7.4), 1.6); // the corridor, out there
      put(world, 'coalHeap', at(world, 8.6, 5.1), { turn: 25 });
      look(world, at(world, 7.0, 4.3), at(world, 7.6, 6.5), 0.85, 0.95);
    },
    ui(ctx) {
      ending(ctx, 'The coal store. The door shutting. Coal dust in my mouth. Nobody came.');
    },
  },
  // An ending's last card, and how many endings you have found.
  end_card: {
    level: patientRoom,
    setup({ world }) {
      look(world, [2.5, 4], [2.5, 1], 1.6, 1.6);
    },
    ui(ctx) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      osdText(ctx, '■ STOP', 22, 20, 9, COLORS.text);
      osdText(ctx, 'Escape. The same night, again.', W / 2, 118, 14, COLORS.text, 'center');
      osdText(ctx, 'Endings found: 1 of 4', W / 2, 150, 9, COLORS.dim, 'center');
    },
  },
  // Your room's last change: the bed made, your wooden horse on the pillow.
  room_last: {
    level: patientRoom,
    setup({ world }) {
      world.flashlight.toggle();
      put(world, 'toyHorse', [1.62, 1.3], { turn: 20, y: 0.565 });
      light(world, '#e6fff0', 1.2, 2.5, [2.2, 2.2], 1.6); // your light on the pillow
      look(world, [2.55, 3.45], [1.62, 1.35], 1.5, 0.6);
    },
    ui(ctx) {
      message(ctx, 'My room. The bed is made, and my wooden horse is on the pillow.');
    },
  },
};
