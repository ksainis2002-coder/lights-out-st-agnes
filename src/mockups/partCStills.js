// Proposal stills for 0.3 part C, the cemetery (owner 2026-10-27: "start part
// C stills"), on the game's own grounds level: through the cemetery gate in
// the storm; the five children's graves with their lanterns, unlit, three
// lit in the order of the roll, and snuffed after a wrong order; Agnes's slab
// open on the stone lamb and file page 2; taking the lamb; the file page; the
// watcher in the gateway in a lightning flash and, afterwards, at the chapel
// door; the hub when you come back. Text is mockup copy from the content sheet
// (the game's own text goes through i18n when it is built).
import { PROPS } from '../props/catalog.js';
import { osdText, COLORS, UI_FONT } from '../ui/osd.js';
import { aim, message, W, H } from './helpers.js';
import { flash } from './schoolStills.js';
import { createDocumentScreen } from '../ui/screens/document.js';
import { i18n } from '../i18n/index.js';
import grounds from '../levels/grounds.json';
import patientRoom from '../levels/patient_room.json';

const CELL = grounds.cellSize;
// The children's graves in the order they were struck off the roll: the
// lantern puzzle's answer on Normal (content sheet).
const ROLL = ['grave_agnes', 'grave_thomas', 'grave_margaret', 'grave_samuel', 'grave_edith'].map((id) => grounds.props.find((prop) => prop.id === id));
const AGNES = ROLL[0];
const CHAPEL_DOOR = [6.5 * CELL, 21 * CELL];
const GATE = [10.5 * CELL, 9.5 * CELL];

const turnOf = (prop) => ((prop.rotation ?? 0) * Math.PI) / 180;
const metres = ([col, row]) => [col * CELL, row * CELL];

// A point on a grave's plot, `along` metres out from its stone.
function onPlot(grave, along) {
  const [x, z] = metres(grave.at);
  return [x + Math.sin(turnOf(grave)) * along, z + Math.cos(turnOf(grave)) * along];
}

function add(world, type, [x, z], turn = 0, options = {}) {
  const object = PROPS[type](world.textures, options);
  object.position.set(x, 0, z);
  object.rotation.y = turn;
  world.scene.add(object);
  return object;
}

// The camera at a point (metres, eye height y) looking at another.
function look(world, [x, z], [tx, tz], y = 1.6, toY = 1.2) {
  const yaw = Math.atan2(-(tx - x), -(tz - z));
  const pitch = Math.atan2(toY - y, Math.hypot(tx - x, tz - z));
  aim(world.camera, [x, y, z], (yaw * 180) / Math.PI, (pitch * 180) / Math.PI);
}

// A lantern at the foot of each child's grave; the first `lit` of the roll burn.
function lanterns(world, lit, { smoke = false } = {}) {
  ROLL.forEach((grave, i) => {
    const at = onPlot(grave, 1.0);
    add(world, 'graveLantern', at, 0, { lit: i < lit });
    if (smoke) add(world, 'lanternSmoke', at);
  });
}

function agnesSlab(world, open) {
  add(world, 'graveSlab', metres(AGNES.at), turnOf(AGNES), { open });
}

function gateOpen(world) {
  world.doors.panels.filter(({ door }) => door.id === 'cemetery_gate').forEach(({ door, hinge }) => {
    door.open = true;
    door.angle = -Math.PI * 0.55;
    hinge.rotation.y = door.angle;
  });
}

// The flashlight off: only the lanterns light the graves.
function byLanternLight(world) {
  if (world.flashlight.isOn()) world.flashlight.toggle();
}

function watcherAt(world, at, facing) {
  return add(world, 'statue', at, facing);
}

// The use prompt as the HUD draws it, with its short line under it.
function usePrompt(ctx, text, detail) {
  ctx.fillStyle = 'rgba(232,240,255,0.8)';
  ctx.fillRect(W / 2 - 1, H / 2 - 1, 2, 2);
  ctx.font = `bold 10px ${UI_FONT}`;
  const width = ctx.measureText(text).width + 16;
  ctx.fillStyle = 'rgba(5,7,10,0.55)';
  ctx.fillRect(W / 2 - width / 2, H / 2 + 22, width, 16);
  ctx.strokeStyle = 'rgba(232,240,255,0.35)';
  ctx.strokeRect(W / 2 - width / 2 + 0.5, H / 2 + 22.5, width - 1, 15);
  osdText(ctx, text, W / 2, H / 2 + 25, 10, COLORS.text, 'center');
  if (detail) osdText(ctx, detail, W / 2, H / 2 + 42, 9, COLORS.soft, 'center');
}

// T. Hale's file, page 2, on the document screen (content sheet text).
const FILE_PAGE_2 = {
  'doc.hale_file_2.title': 'St. Agnes Home for Children',
  'doc.hale_file_2.byline': 'Admission record — page 2',
  'doc.hale_file_2.body': 'Schooling: Form II, Miss Pruett. Reads well. Will not do sums.\nConduct: talks in the dark; says a girl called Aggie stays with him.\nStruck off the roll: 2nd February.\nRe-admitted: 2nd February, the same night. No one remembers bringing him back.\nAge on re-admission: [[blot]]',
};
function filePage(ctx) {
  const t = (key, params) => FILE_PAGE_2[key] ?? i18n.t(key, params);
  createDocumentScreen({ t, game: {}, resume() {} }, { id: 'hale_file_2' }).draw(ctx);
}

// Standing behind the five graves (their names face away from the gate).
const READ_GRAVES = { from: [15.3, 5.4], to: [15.3, 9.4] };

// The hub after the school: Maggie's drawing beside the horse, damp and
// fallen tiles, the lamp weaker.
function hubDecay(world) {
  add(world, 'drawing', [2.2, 1.0], 0, { kind: 'skipping' });
  add(world, 'tileDecay', [1.7, 1.0], 0, { width: 1.8, height: 1.6, y: 1.2, seed: 3 });
  add(world, 'fallenTiles', [1.6, 1.2], 0, { seed: 5 });
  add(world, 'tileDecay', [1.0, 3.6], Math.PI / 2, { width: 1.2, height: 1.0, y: 0.9, seed: 8 });
  world.levelGroup.traverse((object) => {
    if (object.isPointLight) object.intensity *= 0.55;
  });
}

export const PART_C_STILLS = {
  // Through the open cemetery gate in the rain: the children's graves ahead.
  cemetery_gate: {
    level: grounds,
    setup({ world }) {
      gateOpen(world);
      lanterns(world, 0);
      look(world, [GATE[0] + 0.3, 15.6], [15.6, 9.2], 1.6, 0.7);
    },
  },
  // The five graves and their lanterns; the matches in hand.
  lanterns: {
    level: grounds,
    setup({ world }) {
      lanterns(world, 0);
      const [x, z] = onPlot(AGNES, 1.0);
      look(world, [x + 1.3, z - 1.7], [x, z], 1.5, 0.2);
    },
    ui: (ctx) => usePrompt(ctx, 'CLICK  Light the lantern'),
  },
  // Three lit in the order of the roll: Agnes, Tommy, Maggie.
  lanterns_lit: {
    level: grounds,
    setup({ world }) {
      lanterns(world, 3);
      look(world, [16.6, 6.4], [15.6, 9.3], 1.55, 0.35);
    },
  },
  // A wrong order: the flames shrink and go out, all of them.
  lanterns_out: {
    level: grounds,
    setup({ world }) {
      lanterns(world, 0, { smoke: true });
      look(world, READ_GRAVES.from, READ_GRAVES.to, 1.55, 0.4);
    },
    ui: (ctx) => message(ctx, 'The flames shrink and go out, all of them.'),
  },
  // All five burn; stone grinds: Agnes's slab slides aside.
  agnes_slab: {
    level: grounds,
    setup({ world }) {
      lanterns(world, 5);
      agnesSlab(world, true);
      byLanternLight(world);
      const [x, z] = onPlot(AGNES, 0.6);
      look(world, [x + 1.0, z - 1.4], [x, z], 1.5, 0.05);
    },
    ui: (ctx) => message(ctx, 'All five burn steady. Stone grinds under the small grave with no surname.'),
  },
  // In the hollow: the stone lamb and a folded page.
  lamb_take: {
    level: grounds,
    setup({ world }) {
      lanterns(world, 5);
      agnesSlab(world, true);
      byLanternLight(world);
      const [x, z] = onPlot(AGNES, 0.7);
      const [fx, fz] = onPlot(AGNES, 1.3);
      const side = [Math.cos(turnOf(AGNES)), -Math.sin(turnOf(AGNES))]; // across the plot
      look(world, [fx + side[0] * 0.2, fz + side[1] * 0.2], [x, z], 0.72, 0.12);
      world.flashlight.toggle(); // the beam on it, kept soft this close
      world.flashlight.light.intensity *= 0.45;
    },
    ui: (ctx) => usePrompt(ctx, 'CLICK  Take Stone lamb', 'A small stone lamb from a statue.'),
  },
  // Page two of T. Hale's file.
  ui_filePage2: {
    level: grounds,
    look: 'paper',
    setup({ world }) {
      lanterns(world, 5);
      agnesSlab(world, true);
      look(world, READ_GRAVES.from, READ_GRAVES.to, 1.55, 0.4);
    },
    ui: filePage,
  },
  // Outside in the storm: a flash, and she stands in the gateway behind you.
  watcher_storm: {
    level: grounds,
    setup({ world, fx }) {
      gateOpen(world);
      lanterns(world, 3);
      flash(world);
      watcherAt(world, [GATE[0], 14.2], Math.PI);
      add(world, 'lightningBolt', [GATE[0] + 14, 62], 0, { height: 32, seed: 9 });
      look(world, [15.9, 8.0], [GATE[0], 14.2], 1.6, 1.5);
      Object.assign(fx, { vignette: 0.35 });
    },
  },
  // Afterwards she waits at the chapel door, facing it, and stays there.
  watcher_chapel: {
    level: grounds,
    setup({ world }) {
      watcherAt(world, [CHAPEL_DOOR[0], CHAPEL_DOOR[1] - 1.1], 0);
      look(world, [CHAPEL_DOOR[0] + 2.6, CHAPEL_DOOR[1] - 6.2], [CHAPEL_DOOR[0], CHAPEL_DOOR[1] - 0.4], 1.6, 1.4);
    },
  },
  // The hub on your return: a new drawing, and the room has decayed.
  hub_return: {
    level: patientRoom,
    setup({ world }) {
      hubDecay(world);
      world.flashlight.toggle();
      aim(world.camera, [3.0, 1.6, 5.6], 8, -6);
    },
  },
  // Proposal: the hub door's small glass panel, cracked.
  hub_door: {
    level: patientRoom,
    setup({ world }) {
      hubDecay(world);
      add(world, 'doorPane', [2.5, 6.0], Math.PI, { cracked: true });
      aim(world.camera, [2.55, 1.6, 4.4], 180, -2);
    },
  },
};

