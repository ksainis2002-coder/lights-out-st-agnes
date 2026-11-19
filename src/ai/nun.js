// Sister M., the burned nun (wing 3; design 0.4 and the content sheet). She
// sees only light: your flashlight, if it is on and in her line of sight, and
// the ward lamps (levels/lamps.js), which she walks to and puts out. In the
// dark she cannot see you, but she keeps walking her round, and walking into
// her is a catch all the same (owner picks 2026-11-15).
// Every catch is announced (scare rules): her beads rattle as she walks; when
// she sees your light she stops, her embers flare and she hisses "Lights
// out." for 2 s (comfort mode: 3.5 s, and she walks slower) before she comes.
// Light off and she loses you ("Who has a light?"), looks where it was, and
// goes back to her round. One catch: the snuffer over your light, then the
// rewind with Edith's line about what happened. Under a bed you are safe.
// Level data, "nun":
//   "territory": [room ids]        where she walks (the nurses' station is safe)
//   "round": [[c, r], …]           her round, in order
//   "intro": { "room": "ward_a", "from": [c, r], "lamps": [ids] }
//       the first visit (set piece, cannot catch): she puts that room's lamps
//       out one by one, towards you; her round starts when the last is out.
//       "cells": [c0, r0, c1, r1] and "doors": [ids]: it also starts as you pass
//       outside the room, and then the nearest of those doors opens by itself,
//       so she cannot be missed by never going in. Lightning stops her for 1.5 s.
//   "hunt": { "flag", "from": [c, r], "round": [[c, r], …], "speed" }
//       the way out (levels/wayOut.js): once every lamp is dead she hunts your
//       light only, walks faster and keeps between you and the door.
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { clearLine } from './gaze.js';
import { createPathing } from './path.js';
import { roomAt } from '../levels/loader.js';
import { nunOpens, openDoorAhead, openNearest } from './nunDoors.js';
import { nunDebug } from './nunDebug.js';

export const WALKING = 'nun_walking';
const WAY_UP = 'way_up'; // up the theatre's back stairs (levels/wayUp.js)
export const FLOOR = 'nun_floor'; // progress value: the level she walks now (ai/nunFloors.js brings her after you)
const SPEED = 1.5; // m/s on Normal: a little under your walk (1.7), far under your run (3.3)
const DIFFICULTY = { story: 0.8, normal: 1, hard: 1.2 };
const SEES = 15; // metres: how far she sees a light
const WARNING = 2; // seconds between "Lights out." and her first step (comfort: 3.5)
const LOSES = 1.2; // seconds of dark before she has lost you
const CATCH = 1.0; // metres: she reaches your light
const TOUCH = 0.8; // metres: you walk into her in the dark
const SNUFF = 1.4; // seconds at a lamp before it goes out
const BEADS_EVERY = 0.85;
const AGAIN = 60; // seconds: a second sighting inside this gets "After eight."
const SPAN = 0.5; // her footprint: you cannot walk through her
const FLINCH = 1.5; // seconds a flash of lightning stops her
const LINE = { speaker: 'sister_m', manner: 'hissing', seconds: 3 };

export function createNun(game) {
  const position = new THREE.Vector3();
  let model = null;
  let glow = null; // her ember light
  let obstacle = null;
  let pathing = null;
  let mode = null; // null | 'intro' | 'round' | 'warning' | 'chasing' | 'searching' | 'snuffing'
  let route = [];
  let target = null; // { x, z, lamp? }
  let timer = 0;
  let dark = 0; // seconds since she last saw your light
  let lastSeen = null;
  let lastSighting = -Infinity;
  let clock = 0;
  let beadsIn = 0;
  let stop = 0; // index into her round
  let introLamps = [];
  let sees = false;
  let flinch = 0;
  let stunned = 0;

  const comfort = () => game.settings.get('comfortMode');
  const player = () => game.player.state.position;
  const distanceTo = (p) => Math.hypot(p.x - position.x, p.z - position.z);
  const data = () => game.world.level.nun;
  const toWorld = ([col, row]) => ({ x: col * game.world.level.cellSize, z: row * game.world.level.cellSize });
  const say = (key) => game.subtitles.show(key, LINE);
  const hunt = () => (data()?.hunt && game.progress.hasFlag(data().hunt.flag) ? data().hunt : null);
  const round = () => hunt()?.round ?? data().round;

  function remove() {
    model?.parent?.remove(model);
    const obstacles = game.world.level?.obstacles;
    if (obstacles?.includes(obstacle)) obstacles.splice(obstacles.indexOf(obstacle), 1);
    model = null;
    mode = null;
    route = [];
    target = null;
  }

  function moveTo(x, z) {
    position.set(x, 0, z);
    model.position.copy(position);
    Object.assign(obstacle, { minX: x - SPAN / 2, maxX: x + SPAN / 2, minZ: z - SPAN / 2, maxZ: z + SPAN / 2 });
  }

  function place(at) {
    const level = game.world.level;
    model = PROPS.burnedNun(game.world.textures, { glow: 0.6 });
    model.traverse((child) => {
      if (child.isPointLight && child.position.y < 1) glow = child;
    });
    game.world.levelGroup.add(model);
    obstacle = { mover: true };
    level.obstacles.push(obstacle);
    pathing = createPathing(level, data().territory, { opens: nunOpens(game) });
    const spot = toWorld(at);
    moveTo(spot.x, spot.z);
  }

  // The stop of her round furthest from you: she never starts on top of you.
  function farStop() {
    const p = player();
    const far = (at) => Math.hypot(toWorld(at).x - p.x, toWorld(at).z - p.z);
    return round().reduce((best, at, i) => (far(at) > far(round()[best]) ? i : best), 0);
  }

  function setup(level) {
    remove();
    if (!level.nun || !game.progress.hasFlag(WALKING)) return;
    if (game.progress.getValue(FLOOR, 'wards_ground') !== level.id) return; // she is on the other floor
    if (game.progress.hasFlag(WAY_UP)) return; // the way out of the basement: nothing hunts up here but him
    stop = hunt() ? 0 : farStop();
    place(hunt()?.from ?? round()[stop]); // on the way out she waits between you and the door
    mode = 'round';
  }

  // The set piece: the first time you stand in the intro room with its lamps on.
  function maybeIntro() {
    const level = game.world.level;
    const intro = level.nun?.intro;
    if (!intro || model || game.progress.hasFlag(WALKING)) return;
    const p = player();
    const cell = level.worldToCell(p.x, p.z);
    const [c0, r0, c1, r1] = intro.cells ?? [0, 0, -1, -1];
    const passing = cell.col >= c0 && cell.col <= c1 && cell.row >= r0 && cell.row <= r1; // by its doors, outside
    if (roomAt(level, p) !== intro.room && !passing) return;
    if (passing) openNearest(game, intro.doors ?? [], p);
    introLamps = intro.lamps.filter((id) => game.lamps.all().find((lamp) => lamp.id === id)?.lit);
    place(intro.from);
    mode = 'intro';
    game.events.emit('nun.intro', { position: position.clone() });
    nextIntroLamp();
  }

  function nextIntroLamp() {
    const id = introLamps.shift();
    const lamp = id && game.lamps.all().find((entry) => entry.id === id);
    if (lamp) return goTo({ x: lamp.position.x, z: lamp.position.z, lamp: id });
    game.progress.setFlag(WALKING);
    game.progress.setValue(FLOOR, game.world.level.id);
    game.events.emit('checkpoint');
    mode = 'round';
    target = null;
  }

  function goTo(next) {
    target = next;
    route = [];
  }

  // Your light, if she can see it: on, not under a bed, near enough, and
  // either in her room or with nothing solid between you.
  function seesYourLight() {
    if (game.hiding.active() || !game.world.flashlight.isOn() || !game.progress.hasFlag('tool_flashlight')) return false;
    const level = game.world.level;
    const p = player();
    if (distanceTo(p) > SEES) return false;
    return roomAt(level, p) === roomAt(level, position) || clearLine(level, position, p);
  }

  function nearestLitLamp() {
    const level = game.world.level;
    const lit = game.lamps.lit().filter((lamp) => data().territory.includes(lamp.room) && pathing.reachable(lamp.position));
    lit.sort((a, b) => distanceTo(a.position) - distanceTo(b.position));
    return lit[0] && level ? { x: lit[0].position.x, z: lit[0].position.z, lamp: lit[0].id } : null;
  }

  // One step along her route to the target; true once she stands at it.
  function walk(dt, reach = 0.25) {
    if (!route.length) {
      route = pathing.route(position, target, { anyStart: true });
      if (!route.length) return true; // nowhere she can walk from here: stand (never through a wall)
      const level = game.world.level;
      const end = level.worldToCell(route.at(-1).x, route.at(-1).z);
      const goal = level.worldToCell(target.x, target.z);
      // The last stretch goes to the spot itself only when it is in the last cell she can reach.
      route.reaches = end.col === goal.col && end.row === goal.row;
      if (route.length > 1) route.shift();
    }
    const speed = (hunt()?.speed ?? SPEED) * (DIFFICULTY[game.settings.get('difficulty')] ?? 1) * (comfort() ? 0.6 : 1);
    let step = speed * dt;
    while (step > 1e-6) {
      const last = route.length <= 1;
      const aim = last && route.reaches ? target : route[0];
      const dx = aim.x - position.x;
      const dz = aim.z - position.z;
      const length = Math.hypot(dx, dz);
      if (length <= (last ? reach : 0.05)) {
        if (last) return true;
        route.shift();
        continue;
      }
      const go = Math.min(step, length);
      openDoorAhead(game, { x: position.x + (dx / length) * 0.7, z: position.z + (dz / length) * 0.7 });
      moveTo(position.x + (dx / length) * go, position.z + (dz / length) * go);
      model.rotation.y = Math.atan2(dx, dz);
      step -= go;
    }
    beadsIn -= dt;
    if (beadsIn <= 0) {
      beadsIn = BEADS_EVERY;
      game.events.emit('nun.beads', { position: position.clone() });
    }
    return false;
  }

  function face(p) {
    model.rotation.y = Math.atan2(p.x - position.x, p.z - position.z);
  }

  function startWarning() {
    mode = 'warning';
    timer = 0;
    face(player());
    say(clock - lastSighting < AGAIN ? 'nun.afterEight' : 'nun.lightsOut');
    lastSighting = clock;
    game.events.emit('nun.warning', { position: position.clone() });
  }

  function caught(how) {
    const level = game.world.level;
    const lit = how === 'touch' && game.lamps.litIn(roomAt(level, player()));
    if (game.world.flashlight.isOn()) game.world.flashlight.setOn(false); // the snuffer comes down over it
    model.visible = false; // the collapse shows her catch pose in her place
    game.events.emit('nun.catch', { position: position.clone(), how });
    game.collapse.start('nun', { grab: 'nunCatch', whisper: `edith.catch.${lit ? 'lamp' : how}`, speaker: 'edith' });
  }

  function snuff(dt, then) {
    timer += dt;
    if (timer < SNUFF) return;
    game.lamps.snuff(target.lamp);
    game.events.emit('nun.snuff', { position: position.clone() });
    if (mode !== 'intro' && Math.random() < 0.35) say('nun.backToBed');
    then();
  }

  function updateIntro(dt) {
    if (timer > 0 || walk(dt, 0.5)) snuffIntro(dt);
  }

  function snuffIntro(dt) {
    if (timer === 0) timer = 1e-6;
    snuff(dt, () => {
      timer = 0;
      nextIntroLamp();
    });
  }

  function updateRound(dt) {
    if (!target) {
      target = nearestLitLamp() ?? { ...toWorld(round()[stop]) };
      route = [];
    }
    if (!walk(dt, target.lamp ? 0.5 : 0.3)) return;
    if (target.lamp) {
      mode = 'snuffing';
      timer = 0;
      return;
    }
    stop = (stop + 1) % round().length;
    target = null;
  }

  function updateChase(dt) {
    if (sees) {
      dark = 0;
      lastSeen = { x: player().x, z: player().z };
      goTo(lastSeen);
      route = pathing.route(position, lastSeen);
      if (route.length > 1) route.shift();
    } else {
      dark += dt;
      if (dark >= LOSES && mode === 'chasing') {
        mode = 'searching';
        say('nun.whoHasALight');
        game.events.emit('nun.lost', { position: position.clone() });
      }
    }
    if (walk(dt, 0.4) && mode === 'searching') {
      mode = 'round';
      target = null;
    }
  }

  function update(dt) {
    clock += dt;
    if (!data()) return;
    if (!model) return maybeIntro();
    sees = mode !== 'intro' && seesYourLight();
    if (glow) glow.intensity = mode === 'warning' || mode === 'chasing' ? 4 : 2.2;
    if (mode === 'intro') return updateIntro(dt);
    if (stunned > 0) {
      stunned -= dt; // the camcorder's flash: blind, she can neither walk nor catch
      if (glow) glow.intensity = 0.8;
      return;
    }
    const d = distanceTo(player());
    if (!game.hiding.active() && ((sees && d <= CATCH) || d <= TOUCH)) return caught(sees ? 'light' : 'touch');
    if (flinch > 0) {
      flinch -= dt; // lightning: she stops where she is, a hand up against it
      return;
    }
    if (mode === 'warning') {
      timer += dt;
      if (!sees) {
        mode = 'searching';
        dark = LOSES;
        goTo(lastSeen ?? { x: position.x, z: position.z });
        return;
      }
      lastSeen = { x: player().x, z: player().z };
      face(lastSeen);
      if (timer >= (comfort() ? 3.5 : WARNING)) mode = 'chasing';
      return;
    }
    if (mode === 'chasing' || mode === 'searching') {
      if (mode === 'searching' && sees) return startWarning();
      return updateChase(dt);
    }
    if (sees) {
      lastSeen = { x: player().x, z: player().z };
      return startWarning();
    }
    if (mode === 'snuffing') {
      return snuff(dt, () => {
        mode = 'round';
        target = null;
      });
    }
    updateRound(dt);
  }

  const debug = nunDebug(game, () => ({ model, mode, sees, position, route, hunting: Boolean(hunt()) }));

  game.events.on('level.loaded', setup);
  game.events.on('storm.lightning', () => {
    if (model && mode !== 'intro') flinch = FLINCH;
  });

  return {
    update,
    ...debug,
    state: () => ({ mode, x: position.x, z: position.z, sees, active: Boolean(model), stunned: stunned > 0 }),
    hide: (value) => model && (model.visible = !value), // out of Nora's footage (cutscenes/tape.js)
    // Something drew her (ai/nunFloors.js: the stone palm taken): she walks there, then on with her round.
    summon(point) {
      if (!model || mode === 'intro') return;
      mode = 'searching';
      dark = LOSES;
      goTo({ x: point.x, z: point.z });
    },
    // The camcorder's flash (player/camcorder.js): she stands blinded for that long.
    stun(seconds) {
      if (!model || mode === 'intro') return false;
      stunned = seconds;
      game.events.emit('nun.stunned', { position: position.clone() });
      return true;
    },
    position: () => (model ? position.clone() : null),
    // Up or down the stairs after you (ai/nunFloors.js): she walks this floor now.
    arrive(at) {
      if (model || !data()) return;
      game.progress.setValue(FLOOR, game.world.level.id);
      place(at);
      stop = 0;
      mode = 'round';
    },
    // Every lamp has died (levels/wayOut.js): she stands between you and the
    // door and hunts (data "hunt"); she walks this floor from now on.
    startHunt() {
      const from = data()?.hunt && toWorld(data().hunt.from);
      if (!from || !hunt()) return;
      game.progress.setFlag(WALKING);
      game.progress.setValue(FLOOR, game.world.level.id);
      if (model) moveTo(from.x, from.z);
      else place(data().hunt.from);
      mode = 'round';
      stop = 0;
      stunned = 0;
      goTo(null);
    },
    // For tests: stand her somewhere, facing her round again.
    moveTo(x, z) {
      if (!model) return;
      moveTo(x, z);
      route = [];
    },
  };
}
