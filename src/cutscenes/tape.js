// Nora's tape on the day room television (approved still ui_tape; the
// content sheet). About 25 s of her own camcorder footage in its night view:
// her walk into Ward A with every lamp on, the far lamps going out one by one
// towards her, the padded cell with the writing only the night view shows,
// then the camera turning to the doorway, two points of fire, and the fall.
// It teaches that Sister M. cannot see the night view and where the writing
// is. The footage is the real Ward A as it was (its lamps lit, Sister M. not
// in it) and a cell built for the shot out past the level's edge. CLICK,
// ENTER or SPACE stops it. Comfort mode: a slow turn and no fall. Nothing in
// it can catch you, and the game stands still while it plays.
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { box } from '../props/parts.js';

const LENGTH = 25.5;
const CUT = 13; // seconds: from Ward A to the cell
const SET = { x: -60, z: -60 }; // the cell, out past the edge of the level
const WARD_LAMPS = ['ward_a_1', 'ward_a_2', 'ward_a_3'];
const DEG = Math.PI / 180;
// Her walk into Ward A: [t, col, row, yaw°]; then in the cell: [t, x, z, yaw°] in metres from its middle.
const WARD = [[0, 18.4, 4.7, 92], [5, 16.6, 4.3, 86], [8.5, 15.4, 4.0, 90], [13, 15.0, 3.9, 92]];
const CELL = [[13, 0.2, 1.0, 6], [17, -0.1, 0.9, -5], [21, 0, 0.8, 2], [21.8, 0, 0.6, 180], [25.5, 0, 0.6, 182]];
const SLOW_TURN = [[13, 0.2, 1.0, 6], [17, -0.1, 0.9, -5], [21, 0, 0.8, 2], [23, 0, 0.6, 180], [25.5, 0, 0.6, 182]];
const FALL = [22.6, 23.3];
const LINES = [
  { at: 0.6, key: 'tape.line.1', seconds: 6 },
  { at: 10.2, key: 'tape.line.2', seconds: 2.8 },
  { at: 13.8, key: 'tape.line.3', seconds: 6.8 },
  { at: 22.4, key: 'tape.end', seconds: 3, plain: true },
];
const LAMPS_OUT = [[8.6, 'ward_a_1'], [10.0, 'ward_a_2']];

function ease(t) {
  return t * t * (3 - 2 * t);
}

function sample(keys, t) {
  if (t <= keys[0][0]) return keys[0].slice(1);
  for (let i = 1; i < keys.length; i++) {
    if (t > keys[i][0]) continue;
    const [t0, ...a] = keys[i - 1];
    const [t1, ...b] = keys[i];
    const k = ease((t - t0) / (t1 - t0));
    return a.map((v, j) => v + (b[j] - v) * k);
  }
  return keys[keys.length - 1].slice(1);
}

// The cell she filmed: padding on three walls, a doorway in the fourth, the
// writing on the far wall, and Sister M. in the dark beyond the doorway.
function buildSet(game) {
  const t = game.world.textures;
  const padded = t.padded.clone();
  padded.repeat.set(3, 2);
  padded.needsUpdate = true;
  const lines = game.i18n.t('cell.writing.1').split('\n');
  const writing = PROPS.nightWriting(t, { lines, shown: true, width: 2.2 });
  writing.position.set(0, 0, -1.59);
  const her = PROPS.burnedNun(t, { glow: 1 });
  her.position.set(0, 0, 2.5);
  her.rotation.y = Math.PI; // facing into the cell
  const set = new THREE.Group();
  set.add(
    box(t.floor, [3.6, 0.02, 5.4], [0, -0.02, 0.6]),
    box(t.ceiling, [3.6, 0.05, 5.4], [0, 3.4, 0.6]),
    box(padded, [3.6, 3.4, 0.1], [0, 0, -1.65]),
    box(padded, [0.1, 3.4, 2.9], [-1.85, 0, -0.2]),
    box(padded, [0.1, 3.4, 2.9], [1.85, 0, -0.2]),
    box(padded, [1.3, 3.4, 0.1], [-1.15, 0, 1.25]),
    box(padded, [1.3, 3.4, 0.1], [1.15, 0, 1.25]),
    box(padded, [1.0, 1.3, 0.1], [0, 2.1, 1.25]),
    box(t.wardWall, [0.1, 3.4, 2.4], [-0.6, 0, 2.45]),
    box(t.wardWall, [0.1, 3.4, 2.4], [0.6, 0, 2.45]),
    box(t.wardWall, [1.2, 3.4, 0.1], [0, 0, 3.65]),
    writing,
    her,
  );
  set.position.set(SET.x, 0, SET.z);
  return set;
}

export function createTape(game) {
  let active = false;
  let t = 0;
  let line = 0;
  let out = 0;
  let set = null;
  let hiss = null;
  let lightWasOn = false;
  const lamp = new THREE.PointLight(0xffffff, 2.2, 10, 1.1); // her camcorder's own lamp

  const comfort = () => game.settings.get('comfortMode');

  function start() {
    if (active) return;
    active = true;
    t = 0;
    line = 0;
    out = 0;
    set = buildSet(game);
    game.world.scene.add(set, lamp);
    WARD_LAMPS.forEach((id) => game.lamps.film(id, true)); // as they were when she filmed
    game.nun.hide(true);
    lightWasOn = game.world.flashlight.isOn();
    game.world.flashlight.setOn(false);
    game.progress.setFlag('name_nora_tape'); // N. KANE is on the camcorder and her note: the subtitles name her
    hiss = game.sfx.play('tape_hiss', { loop: true, volume: 0.25 });
    game.events.emit('tape.started');
  }

  function finish() {
    if (!active) return;
    active = false;
    set?.parent?.remove(set);
    lamp.parent?.remove(lamp);
    set = null;
    hiss?.stop();
    hiss = null;
    game.lamps.refresh();
    game.nun.hide(false);
    game.world.flashlight.setOn(lightWasOn);
    Object.assign(game.pipeline.fx, { nightVision: 0, rewind: 0, fade: 0, vignette: 0 });
    if (!game.progress.hasFlag('watched_nora_tape')) {
      game.progress.setFlag('watched_nora_tape');
      game.events.emit('clue', 'watched_nora_tape');
    }
    game.events.emit('tape.ended');
  }

  function cues() {
    while (line < LINES.length && t >= LINES[line].at) {
      const { key, seconds, plain } = LINES[line++];
      game.subtitles.show(key, { speaker: plain ? null : 'nora_tape', whisper: false, seconds });
    }
    while (out < LAMPS_OUT.length && t >= LAMPS_OUT[out][0]) {
      game.lamps.film(LAMPS_OUT[out++][1], false);
      game.sfx.play('candle_snuff', { volume: 0.45 }); // stand-in for lamp_off
    }
  }

  function update(dt, input) {
    if (!active) return;
    if (input.wasPressed('use') || input.wasCodePressed('Enter') || input.wasCodePressed('Space')) return finish();
    const before = t;
    t += dt;
    cues();
    if (before < CUT && t >= CUT) game.sfx.play('radio_static', { volume: 0.4 });
    if (before < FALL[0] && t >= FALL[0] && !comfort()) game.sfx.play('book_drop', { volume: 0.6 });
    const tear = (t >= CUT && t < CUT + 0.4) || t > LENGTH - 0.9;
    Object.assign(game.pipeline.fx, { nightVision: 1, vignette: 0.25, rewind: tear ? 1 : 0, fade: t > LENGTH - 0.6 ? (t - (LENGTH - 0.6)) / 0.6 : 0 });
    if (t >= LENGTH) finish();
  }

  // Overrides the player camera while the tape plays.
  function applyCamera(camera) {
    if (!active) return;
    const size = game.world.level.cellSize;
    const sway = Math.sin(t * 1.7) * 0.02; // a hand-held camera
    if (t < CUT) {
      const [col, row, yaw] = sample(WARD, t);
      camera.position.set(col * size, 1.5 + sway, row * size);
      camera.rotation.set(-0.04, yaw * DEG, sway, 'YXZ');
    } else {
      const [x, z, yaw] = sample(comfort() ? SLOW_TURN : CELL, t);
      const k = comfort() ? 0 : ease(Math.min(1, Math.max(0, (t - FALL[0]) / (FALL[1] - FALL[0]))));
      camera.position.set(SET.x + x, 1.5 - k * 1.15 + sway, SET.z + z);
      camera.rotation.set(-0.02 + k * 0.25, yaw * DEG, sway + k * 75 * DEG, 'YXZ');
    }
    lamp.position.copy(camera.position);
  }

  return { start, update, applyCamera, finish, active: () => active, time: () => t };
}
