// The watcher (wing 2): St. Agnes in stone on her plinth. She moves only
// while nobody is looking (ai/gaze.js), sliding on the plinth with a stone
// grind, and keeps to her rooms; closed doors stop her (ai/path.js). At arm's
// reach a dusty breath is her warning: 1.5 s (comfort mode: 3 s, and half
// speed) to turn and look at her before she grabs (scare rules §2, confirmed
// by the owner). The grab hands over to the collapse: her face fills the
// view, then the rewind and Maggie's line about what happened. Staring at her
// drains sanity slowly. Shut in a safe room for a while, she loses you.
// Level data, "watcher":
//   "still":  { "at": [c, r], "rotation": 90, "until": "<flag>" }  the courtyard: never moves
//   "asleep": { "at": [c, r], "rotation": 0 }                       before her introduction (ai/watcherIntro.js)
//   "territory": [room ids], "spawns": [[c, r], …]                  where she hunts once awake (flag watcher_awake)
// She hunts one floor at a time (progress value watcher_floor; ai/watcherFloors.js
// brings her up or down the stairs after you): at first the floor she woke on.
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { gazeOn, clearLine } from './gaze.js';
import { createPathing } from './path.js';

export const AWAKE = 'watcher_awake';
export const FLOOR = 'watcher_floor';
const SPEED = 2.6; // m/s while unseen, on Normal (walk 1.7, run 3.3)
const DIFFICULTY = { story: 0.75, normal: 1, hard: 1.2 };
const REACH = 1.2; // metres: arm's reach, where the warning starts
const STOP = 1.0; // she comes no closer than this
const WARNING = 1.5; // seconds to turn and look (comfort mode: 3)
const STARE_DRAIN = 25 / 40; // sanity per second: one pip of the pulse per 40 s
const GRIND_EVERY = 0.9; // seconds between grinds while she moves
const REPATH = 0.4; // seconds between route updates
const LOSE_AFTER = 15; // seconds out of her reach before she wanders off
const SPAN = 0.8; // her plinth, metres (the player cannot walk through her)
const CATCH_LINES = 5;

export function createWatcher(game) {
  const position = new THREE.Vector3();
  let statue = null;
  let mode = null; // null | 'still' | 'asleep' | 'hunting'
  let pathing = null;
  let route = [];
  let repath = 0;
  let warning = null; // seconds since her breath, while at arm's reach
  let grindIn = 0;
  let lostFor = 0;
  let wandering = null; // a far spot she drifts to once she has lost you
  let gaze = { seen: false, why: '-' };
  let obstacle = null;
  let catches = 0;

  const settings = () => game.settings;
  const comfort = () => settings().get('comfortMode');
  const player = () => game.player.state.position;
  const distanceTo = (p) => Math.hypot(p.x - position.x, p.z - position.z);

  function remove() {
    statue?.parent?.remove(statue);
    statue = null;
    mode = null;
    warning = null;
    game.sfx.setLayer('mus_drone_low', 0);
  }

  function moveTo(x, z) {
    position.set(x, 0, z);
    statue.position.copy(position);
    Object.assign(obstacle, { minX: x - SPAN / 2, maxX: x + SPAN / 2, minZ: z - SPAN / 2, maxZ: z + SPAN / 2 });
  }

  function place(level, [col, row], rotation = 0) {
    statue = PROPS.statue(game.world.textures);
    statue.rotation.y = (rotation * Math.PI) / 180;
    game.world.levelGroup.add(statue);
    obstacle = { mover: true };
    level.obstacles.push(obstacle);
    moveTo(col * level.cellSize, row * level.cellSize);
  }

  // The spawn spot furthest from the player (she is never placed on top of you).
  function farSpot(level, spots) {
    const p = player();
    const far = (spot) => Math.hypot(spot[0] * level.cellSize - p.x, spot[1] * level.cellSize - p.z);
    return [...spots].sort((a, b) => far(b) - far(a))[0];
  }

  // On every level load: the courtyard statue, the sleeping one, or the hunter.
  function setup(level) {
    remove();
    const data = level.watcher;
    if (!data) return;
    const { progress } = game;
    if (data.still) {
      if (!progress.hasFlag(data.still.until)) place(level, data.still.at, data.still.rotation);
      mode = statue ? 'still' : null;
      return;
    }
    pathing = createPathing(level, data.territory ?? []);
    route = [];
    lostFor = 0;
    wandering = null;
    if (progress.hasFlag(AWAKE)) {
      const floor = progress.getValue(FLOOR, null) ?? (data.asleep ? level.id : null);
      if (floor !== level.id) return; // she hunts another floor
      place(level, farSpot(level, data.spawns));
      mode = 'hunting';
    } else if (data.asleep) {
      place(level, data.asleep.at, data.asleep.rotation);
      mode = 'asleep';
    }
  }

  function samplePoints() {
    return [1.95, 1.2, 0.5].map((y) => new THREE.Vector3(position.x, y, position.z));
  }

  function faceThePlayer() {
    const p = player();
    statue.rotation.y = Math.atan2(p.x - position.x, p.z - position.z);
  }

  function stopWarning() {
    if (warning !== null) game.events.emit('watcher.breathStopped');
    warning = null;
  }

  function grab() {
    catches += 1;
    const line = catches === 1 ? 1 : 2 + ((catches - 2) % (CATCH_LINES - 1));
    warning = null;
    game.events.emit('watcher.grab', { position: position.clone() });
    game.collapse.start('watcher', { grab: true, whisper: `watcher.catch.${line}`, speaker: 'maggie' });
  }

  function updateWarning(dt) {
    if (warning === null) {
      warning = 0;
      game.events.emit('watcher.breath', { position: position.clone() });
    }
    warning += dt;
    if (warning >= (comfort() ? WARNING * 2 : WARNING)) grab();
  }

  // Where she heads: you, or once she has lost you for a while, somewhere far off.
  function goal(dt) {
    const p = player();
    if (pathing.reachable(p) || distanceTo(p) < 3) {
      lostFor = 0;
      wandering = null;
      return p;
    }
    lostFor += dt;
    if (lostFor < LOSE_AFTER) return p;
    if (!wandering) {
      const level = game.world.level;
      const [col, row] = farSpot(level, level.watcher.spawns);
      wandering = { x: col * level.cellSize, z: row * level.cellSize };
      route = [];
    }
    return wandering;
  }

  // Cell centres to slide through, starting with the next cell (a straight line
  // from anywhere in her cell to a neighbour's centre stays inside the two).
  function newRoute(target) {
    route = pathing.route(position, target);
    if (route.length > 1) route.shift();
    const level = game.world.level;
    const end = route.at(-1);
    const there = end && level.worldToCell(end.x, end.z);
    const goalCell = level.worldToCell(target.x, target.z);
    // The last stretch goes to the target itself only when it is in that last cell.
    route.endsAtTarget = Boolean(there) && there.col === goalCell.col && there.row === goalCell.row;
    repath = REPATH;
  }

  // Slide along the route; at the end, up to arm's length from the player.
  function move(dt) {
    const target = goal(dt);
    repath -= dt;
    if (repath <= 0 || !route.length) newRoute(target);
    let step = SPEED * (DIFFICULTY[settings().get('difficulty')] ?? 1) * (comfort() ? 0.5 : 1) * dt;
    let moved = 0;
    while (step > 1e-6 && route.length) {
      const last = route.length === 1;
      const aim = last && route.endsAtTarget ? target : route[0];
      const dx = aim.x - position.x;
      const dz = aim.z - position.z;
      const length = Math.hypot(dx, dz);
      const room = last && route.endsAtTarget && target !== wandering ? length - STOP : length;
      if (room <= 0.02) {
        if (last) break;
        route.shift();
        continue;
      }
      const go = Math.min(step, room);
      moveTo(position.x + (dx / length) * go, position.z + (dz / length) * go);
      step -= go;
      moved += go;
      if (go === room && !last) route.shift();
    }
    faceThePlayer();
    if (moved < 1e-4) return;
    grindIn -= dt;
    if (grindIn > 0) return;
    grindIn = GRIND_EVERY;
    game.events.emit('watcher.moved', { position: position.clone() });
  }

  // The drone swells while she is close and unseen (design 0.3: weather and sound).
  function updateDrone(seen) {
    const close = Math.max(0, 1 - distanceTo(player()) / 14);
    const level = mode !== 'hunting' ? 0 : seen ? 0.15 : 0.55;
    game.sfx.setLayer('mus_drone_low', level * close);
  }

  function update(dt) {
    if (!statue) return;
    gaze = gazeOn(game, samplePoints(), position);
    updateDrone(gaze.seen);
    if (mode !== 'hunting') return;
    if (gaze.seen) {
      game.sanity.drain(STARE_DRAIN * dt, 'watcher');
      stopWarning();
      return;
    }
    const p = player();
    if (distanceTo(p) <= REACH && clearLine(game.world.level, position, p)) return updateWarning(dt);
    stopWarning();
    move(dt);
  }

  // The debug overlay (F3): her state and what the player's gaze makes of her.
  function debugLine() {
    if (!statue) return 'WATCHER  none';
    const warn = warning === null ? '-' : `${warning.toFixed(1)}s`;
    return `WATCHER  ${mode}  seen ${gaze.seen ? 'yes' : 'no'} (${gaze.why})  ${distanceTo(player()).toFixed(1)} m  breath ${warn}  route ${route.length}${wandering ? '  lost you' : ''}`;
  }

  function drawDebug(ctx, project) {
    if (!statue || game.mode !== 'playing') return;
    ctx.strokeStyle = gaze.seen ? '#7dff8a' : '#ff5a4a';
    ctx.lineWidth = 2;
    ctx.beginPath(); // arm's reach, on the floor
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const point = project(position.x + Math.cos(a) * REACH, 0.03, position.z + Math.sin(a) * REACH);
      if (!point) return;
      if (i) ctx.lineTo(point.x, point.y);
      else ctx.moveTo(point.x, point.y);
    }
    ctx.stroke();
    const head = project(position.x, 2.3, position.z);
    if (head) {
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fillText(`watcher: ${mode} (${gaze.why})`, head.x - 70, head.y - 18);
    }
  }

  game.events.on('level.loaded', setup);
  game.events.on('game.stopped', () => (catches = 0));

  return {
    update,
    debugLine,
    drawDebug,
    // For the introduction (ai/watcherIntro.js) and tests.
    moveTo(x, z) {
      if (!statue) return;
      moveTo(x, z);
      route = []; // a route from where she was would lead her back first
    },
    wake() {
      if (!statue || mode !== 'asleep') return;
      game.progress.setFlag(AWAKE);
      game.progress.setValue(FLOOR, game.world.level.id);
      mode = 'hunting';
    },
    // Up or down the stairs after you (ai/watcherFloors.js): she hunts this floor now.
    arrive(at) {
      const level = game.world.level;
      if (statue || !level.watcher?.territory) return;
      place(level, at);
      mode = 'hunting';
      game.progress.setValue(FLOOR, level.id);
    },
    route: (to) => (pathing ? pathing.route(position, to) : []),
    state: () => ({ mode, x: position.x, z: position.z, seen: gaze.seen, why: gaze.why, warning, catches, lost: Boolean(wandering) }),
    position: () => (statue ? position.clone() : null),
  };
}
