// The endings (0.5, part C; the wing 4 content sheet; approved stills
// ending_road, ending_lamp, ending_morning, ending_walls, ending_coal,
// end_card; owner picks 2026-11-18). On the way out (levels/wayUp.js):
// Escape at the front gate ("Open the gate"; any sanity, Nora or not), and in
// your room after its last change, Acceptance (sanity 65 or more as you come
// in, and Nora with you) or Becomes the building (otherwise). Each is its
// steps in letterbox, a line under each scene (cutscenes/endingScenes.js),
// then its card and how many endings you have found, kept on this computer
// for every run (save/index.js "endings"), and back to the title.
// ENTER skips to the card. Nothing can catch you while it plays.
import { SCENES } from './endingScenes.js';
import { WAY_UP } from '../levels/wayUp.js';
import { store } from '../save/index.js';
import { subtitleTag } from '../ui/subtitles.js';

const HIGH = 65; // sanity for Acceptance (owner 2026-11-18)
const HOME_WAIT = 5.5; // seconds in your room, its last change before you, before it ends
const CARD_AFTER = 1.5; // seconds of black before the card
export const TOTAL = 4; // endings there are (the secret one comes in 0.6)
const NORA = { speaker: 'nora_here', whisper: false };

// [line key, scene, seconds, how: 'caption' | 'nora' | 'far' | line, with Nora only (true) or without (false), sound]
export const ENDINGS = {
  escape: {
    card: 'ending.escape.card',
    steps: [
      ['ending.escape.1', 'gate', 3, 'caption', null, 'gate'],
      ['ending.escape.2', 'road', 6],
      ['ending.escape.3', 'road', 4, 'caption', null, 'fireBell'],
      ['ending.escape.4', 'road', 6],
      ['ending.escape.5', 'road', 4.5, 'nora', true],
      ['ending.escape.6', 'black', 3.5, 'caption', null, 'lightsOut'],
      ['ending.escape.7', 'bed', 6, null, null, 'rain'],
    ],
  },
  acceptance: {
    card: 'ending.acceptance.card',
    steps: [
      ['ending.acceptance.1', 'room', 4.5, 'nora'],
      ['ending.acceptance.2', 'lamp', 6.5, null, null, 'lamp'],
      ['ending.acceptance.3', 'lamp', 4],
      ['ending.acceptance.4', 'room', 5, 'nora'],
      ['ending.acceptance.5', 'morning', 7],
    ],
  },
  building: {
    card: 'ending.building.card',
    steps: [
      ['ending.building.1', 'walls', 5.5, null, null, 'pulse'],
      ['ending.building.2', 'coal', 7, null, null, 'coalDoor'],
      ['ending.building.3', 'walls', 4, 'caption', null, 'wallBreath'],
      ['ending.building.4', 'walls', 6.5],
      ['ending.building.5nora', 'walls', 4, 'far', true],
      ['ending.building.5alone', 'walls', 4.5, 'caption', false, 'farDoor'],
    ],
  },
};

export function endingsFound() {
  return store.read('endings', Array.isArray) ?? [];
}

export function createEnding(game) {
  const { events, progress } = game;
  let run = null; // { kind, steps, i, t, built: {}, scene, done }
  let home = null; // seconds left in your room before it ends; sanity as you came in

  const withNora = () => Boolean(game.noraFollow?.with());

  function start(kind) {
    if (run) return;
    const nora = withNora();
    const steps = ENDINGS[kind].steps.filter(([, , , , only]) => only === undefined || only === null || only === nora);
    run = { kind, steps, i: -1, t: 0, built: {}, scene: null, done: false };
    home = null;
    game.world.flashlight.setOn(false);
    events.emit('ending.started', kind);
    next();
  }

  function next() {
    run.i += 1;
    run.t = 0;
    const step = run.steps[run.i];
    if (!step) return finish();
    const [key, scene, , how, , sound] = step;
    if (scene === 'bed' && game.world.level.id !== 'patient_room') game.loadLevel('patient_room', 'default');
    run.scene = run.built[scene] ?? (run.built[scene] = SCENES[scene](game));
    Object.assign(game.pipeline.fx, { fade: 0, eyelid: 0, blur: 0, vignette: 0 }, run.scene.fx ?? {});
    events.emit('ending.line', { key, how: how ?? 'line' });
    if (sound) events.emit('ending.sound', sound);
  }

  // The card, and how many endings you have found; then the title.
  function finish() {
    run.done = true;
    const found = new Set(endingsFound());
    found.add(run.kind);
    store.write('endings', [...found]);
    events.emit('ending.finished', run.kind);
    const card = ENDINGS[run.kind].card;
    run = null;
    Object.assign(game.pipeline.fx, { fade: 0, eyelid: 0, blur: 0, vignette: 0 }); // the card is drawn on black of its own
    game.openScreen('endCard', { card, found: found.size, total: TOTAL, done: () => game.stop() });
  }

  function update(dt, input) {
    if (!run) return;
    if (input.wasCodePressed('Enter')) {
      run.i = run.steps.length; // to the card
      return next();
    }
    run.t += dt;
    const step = run.steps[run.i];
    const last = run.i === run.steps.length - 1;
    if (run.scene?.pulse && !game.settings.get('reduceEffects')) game.pipeline.fx.vignette = 0.55 + 0.1 * Math.sin(run.t * 7.5);
    if (last && run.t > step[2]) game.pipeline.fx.fade = Math.min(1, (run.t - step[2]) / CARD_AFTER);
    if (run.t >= step[2] + (last ? CARD_AFTER : 0)) next();
  }

  // The scene's camera, or your own view.
  function applyCamera(camera) {
    const view = run?.scene?.camera;
    if (!view) return;
    const [x, y, z] = view.at;
    camera.position.set(x, y, z);
    if (view.look) {
      const [tx, ty, tz] = view.look;
      const yaw = Math.atan2(-(tx - x), -(tz - z));
      const pitch = Math.atan2(ty - y, Math.hypot(tx - x, tz - z));
      camera.rotation.set(pitch, yaw, 0, 'YXZ');
    } else {
      const d = Math.PI / 180;
      camera.rotation.set(view.pitch * d, view.yaw * d, (view.roll ?? 0) * d, 'YXZ');
    }
  }

  // The line under the scene: a sound in brackets as it is; Nora's with her name.
  function line() {
    const step = run?.steps[run.i];
    if (!step) return null;
    const [key, , , how] = step;
    const text = game.i18n.t(key);
    if (how === 'nora') return `${subtitleTag(game, NORA)} ${text}`;
    if (how === 'far') return `${subtitleTag(game, { ...NORA, manner: 'farOff' })} ${text}`;
    return text;
  }

  // Home on the way out: its last change, then the ending your mind and your company decide.
  events.on('level.loaded', (level) => {
    home = level.id === 'patient_room' && progress.hasFlag(WAY_UP) && !run ? { left: HOME_WAIT, sanity: game.sanity.value() } : null;
  });
  // Every frame of play (wing4.js): the wait in your room.
  function tick(dt) {
    if (!home || run) return;
    home.left -= dt;
    if (home.left > 0) return;
    start(home.sanity >= HIGH && withNora() ? 'acceptance' : 'building');
  }

  return { start, tick, update, applyCamera, line, active: () => Boolean(run), kind: () => run?.kind ?? null, waiting: () => home?.left ?? null };
}
