// Nora follows you out (0.5, part C; approved still nora_follow; the wing 4
// content sheet; owner 2026-11-18: one pace louder than you). Free, once she
// has said her piece, she comes after you along your own way, a couple of
// steps behind, and stops when you stop. Her steps are one pace louder than
// yours: you crouch, hers carry as a walk (4 m); you walk, as a run (10 m);
// left behind, she hurries, and runs. Dr. Venn hears her where she is, and if
// he finds her he has you both: "I'm sorry. I'm so sorry." She whispers
// (nothing he hears): "Is he close?" when he is near; "I can't see you. Don't
// go too far ahead." when you are. She comes with you up stairs and through
// doors (a shut one she eases open); wherever you arrive, she is behind you.
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { pose } from '../props/noraStanding.js';
import { walking } from '../props/noraPoses.js';
import { FREED, LEFT } from './noraTable.js';

export const FOLLOWING = 'nora_following';
const GAP = 1.6; // metres behind you along your way
const HURRY = 3.2; // further behind than this she hurries
const FAR = 7; // so far behind she cannot see you
const TRAIL_STEP = 0.25; // metres between the points of your way she keeps
const SPEED = { crouch: 0.9, walk: 1.7, run: 3.3 }; // as yours (player/controller.js)
const LOUDER = { still: 'walk', crouch: 'walk', walk: 'run', run: 'run' }; // her steps, one pace louder than yours
const NOISE = { walk: 4, run: 10 }; // metres her steps carry (as yours)
const STEP_EVERY = 0.35; // seconds between her footfalls (what you hear; he hears her as she walks: ai/hearing.js)
const STRIDE = 4.4; // radians of her walk cycle a metre
const TURN = 6; // how fast she turns (per second)
const WHISPER = { speaker: 'nora_here', whisper: true, seconds: 3.5 };
const NEAR = 8; // metres from him: "Is he close?"
const COOLDOWN = { close: 30, far: 25 }; // seconds between her whispers

export function createNoraFollow(game) {
  const { progress, events } = game;
  let figure = null;
  let trail = []; // your way, from where she is to you
  let moving = null; // { pace, radius } while she walks
  let stepIn = 0;
  let phase = 0;
  let amount = 0; // how far into a stride (0 standing … 1 walking)
  const waits = { close: 0, far: 0 };

  const level = () => game.world.level;
  const you = () => game.player.state;
  const here = () => new THREE.Vector3(you().position.x, 0, you().position.z);
  const free = () => progress.hasFlag(FREED) && !progress.hasFlag(LEFT);
  const following = () => free() && progress.hasFlag(FOLLOWING);

  function yourPace() {
    const { noise, running } = you();
    if (!noise) return 'still';
    if (running) return 'run';
    return noise < 3 ? 'crouch' : 'walk';
  }

  function place(x, z, yaw) {
    figure?.parent?.remove(figure);
    figure = PROPS.noraStanding(game.world.textures, { pose: 'follow' });
    figure.position.set(x, 0, z);
    figure.rotation.y = yaw;
    game.world.levelGroup.add(figure);
    trail = [];
    moving = null;
  }

  const walkable = (x, z) => {
    const { col, row } = level().worldToCell(x, z);
    return !level().isSolid(col, row);
  };

  // Behind you as you arrive, facing the way you face.
  function behindYou() {
    const { position, yaw } = you();
    const back = { x: Math.sin(yaw), z: Math.cos(yaw) };
    const d = [1.3, 0.9, 0.5].find((step) => walkable(position.x + back.x * step, position.z + back.z * step)) ?? 0.3;
    place(position.x + back.x * d, position.z + back.z * d, yaw + Math.PI);
  }

  function build() {
    figure = null;
    if (!free()) return;
    if (!progress.hasFlag(FOLLOWING)) progress.setFlag(FOLLOWING); // a reload before her last line: she comes now
    behindYou();
  }

  // Off the table, by it (ai/noraTable.js), while she says her piece.
  events.on('nora.getsDown', ({ at, rotation }) => {
    const size = level().cellSize;
    place(at[0] * size, at[1] * size, ((rotation ?? 0) * Math.PI) / 180);
  });
  events.on('nora.ready', () => {
    progress.setFlag(FOLLOWING);
    trail = [];
  });
  events.on('level.loaded', build);
  events.on('surgeon.catch', () => following() && figure && game.subtitles.show('nora.sorry', { speaker: 'nora_here', whisper: false, seconds: 3 }));

  // How far she is behind you along your way.
  function behind() {
    let length = 0;
    let from = figure.position;
    for (const point of [...trail, here()]) {
      length += from.distanceTo(point);
      from = point;
    }
    return length;
  }

  // A shut door on her way: she eases it open (no bang).
  function easeDoor(point) {
    const { col, row } = level().worldToCell(point.x, point.z);
    const door = level().doorAt?.(col, row);
    if (!door || door.open || door.locked || door.requires) return;
    door.open = true;
    door.easing = true;
    progress.setOpen(door.id, true);
  }

  function walk(dt) {
    const pace = yourPace();
    const gap = behind();
    if (gap <= GAP + 0.05) return null;
    const hurry = gap > HURRY;
    const speed = hurry ? SPEED.walk * 1.4 : SPEED[pace === 'still' ? 'walk' : pace];
    let budget = Math.min(speed * dt, gap - GAP);
    const start = figure.position.clone();
    while (budget > 1e-4) {
      const target = trail[0] ?? here();
      easeDoor(target);
      const d = figure.position.distanceTo(target);
      if (d <= budget) {
        figure.position.copy(target);
        budget -= d;
        if (!trail.length) break;
        trail.shift();
      } else {
        figure.position.addScaledVector(target.clone().sub(figure.position).normalize(), budget);
        budget = 0;
      }
    }
    const moved = figure.position.distanceTo(start);
    if (moved < 1e-4) return null;
    phase += moved * STRIDE;
    turnTo(Math.atan2(figure.position.x - start.x, figure.position.z - start.z), dt);
    const herPace = hurry ? 'run' : LOUDER[pace];
    return { pace: herPace, radius: NOISE[herPace] };
  }

  function turnTo(yaw, dt) {
    let delta = yaw - figure.rotation.y;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    figure.rotation.y += delta * Math.min(1, TURN * dt);
  }

  function steps(dt) {
    if (!moving) return;
    stepIn -= dt;
    if (stepIn > 0) return;
    stepIn = STEP_EVERY;
    events.emit('nora.step', { position: figure.position.clone(), pace: moving.pace, radius: moving.radius });
  }

  function whispers(dt) {
    waits.close -= dt;
    waits.far -= dt;
    const venn = game.surgeon?.position();
    const state = game.surgeon?.state();
    if (venn && state?.mode !== 'stunned' && waits.close <= 0 && venn.distanceTo(figure.position) < NEAR) {
      waits.close = COOLDOWN.close;
      return game.subtitles.show('nora.isHeClose', WHISPER);
    }
    const dark = !game.world.flashlight.isOn();
    if (waits.far <= 0 && (behind() > FAR || (dark && behind() > FAR / 2))) {
      waits.far = COOLDOWN.far;
      game.subtitles.show('nora.cantSee', WHISPER);
    }
  }

  function update(dt) {
    if (!figure) return;
    if (!following()) {
      turnTo(Math.atan2(you().position.x - figure.position.x, you().position.z - figure.position.z), dt);
      return;
    }
    const at = here();
    if (!trail.length || trail[trail.length - 1].distanceTo(at) >= TRAIL_STEP) trail.push(at);
    if (trail.length > 600) trail.splice(0, trail.length - 600);
    moving = walk(dt);
    if (!moving) turnTo(Math.atan2(you().position.x - figure.position.x, you().position.z - figure.position.z), dt);
    amount += ((moving ? 1 : 0) - amount) * Math.min(1, dt * 8);
    pose(figure, walking(phase, amount));
    steps(dt);
    whispers(dt);
  }

  function debugLine() {
    if (!figure) return 'NORA  not with you';
    if (!following()) return 'NORA  free, by the table';
    const loud = moving ? `${moving.pace} (${moving.radius} m)` : 'still (silent)';
    return `NORA  following, ${behind().toFixed(1)} m behind, ${loud}`;
  }

  return {
    update,
    debugLine,
    with: () => following() && Boolean(figure),
    regroup: () => following() && behindYou(), // behind you, where you stand now
    position: () => figure?.position.clone() ?? null,
    // Her steps as he hears them, while she walks: { x, z, radius }.
    audible: () => (figure && moving ? { x: figure.position.x, z: figure.position.z, radius: moving.radius } : null),
  };
}
