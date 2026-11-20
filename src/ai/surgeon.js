// Dr. Venn, the blind surgeon (wing 4, part B; approved stills surgeon,
// surgeon_face, surgeon_belt, surgeon_listens; the wing 4 content sheet). He
// hears only (ai/hearing.js). He walks his round through the basement, his
// instruments clinking on his belt (ai/surgeonVoice.js). A sound stops him
// dead: the clinking stops (his tell), he turns his head to it and listens
// for 2 s (comfort mode 3.5 s, and he walks slower), then comes, fast, to
// where it was, and listens there. He catches you only once he has come: if
// he reaches you while you make a sound he hears; or at any time if you walk
// into him. Silent, you can stand a step from him while he listens, and he
// moves on. In a locker or under a bed he cannot touch you, but he hears your
// breath. The camcorder's flash stuns him for 5 s: he hears nothing. The
// first time he crosses the corridor ahead of you (the set piece) he cannot
// catch you. Caught: his face in yours, the rewind, and Sam, through the
// water, says what he heard.
// Level data, "surgeon":
//   "territory": [room ids]   where he walks
//   "round": [[c, r], …]       his round, in order
//   "intro": { "from": [c, r], "to": [c, r] }  his first crossing, ahead of you
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { createPathing } from './path.js';
import { nunOpens, openDoorAhead } from './nunDoors.js';
import { createHearing } from './hearing.js';
import { createSurgeonVoice } from './surgeonVoice.js';
import { surgeonDebug } from './surgeonDebug.js';
import { isThrowable } from '../player/throwing.js';

export const MET = 'venn_met'; // his first crossing seen
const SPEED = { walk: 1.1, come: 2.5 }; // m/s on Normal (you walk 1.7 and run 3.3)
const DIFFICULTY = { story: 0.85, normal: 1, hard: 1.15 };
const WARNING = 2; // seconds he listens before he comes (comfort mode: 3.5)
const SEARCH = 3.5; // seconds he stands listening where the sound was
const ARRIVE = 1.0; // metres short of a sound, where he stops to listen
const CATCH = 1.0; // metres: he has come, and he hears you this close
const TOUCH = 0.55; // metres: you walk into him
const NEAR = 6; // metres: close enough that holding your breath is taught
const SPAN = 0.5; // his footprint: you cannot walk through him

export function createSurgeon(game) {
  const position = new THREE.Vector3();
  const hearing = createHearing(game);
  const voice = createSurgeonVoice(game);
  let model = null;
  let pose = null; // 'walk' | 'listen': which model stands there
  let obstacle = null;
  let pathing = null;
  let mode = null; // null | 'intro' | 'rising' | 'round' | 'listening' | 'coming' | 'searching' | 'stunned'
  let route = [];
  let target = null;
  let timer = 0;
  let stop = 0;
  let heardYou = false; // the sound he follows was you
  let drawnBy = null; // the kind of sound that set him on you: 'door', 'gasp', 'feet', …
  let introListening = false;
  let catches = 0;

  const level = () => game.world.level;
  const data = () => level().surgeon;
  const comfort = () => game.settings.get('comfortMode');
  const player = () => game.player.state.position;
  const distanceTo = (p) => Math.hypot(p.x - position.x, p.z - position.z);
  const toWorld = ([col, row]) => ({ x: col * level().cellSize, z: row * level().cellSize });
  const speed = (kind) => SPEED[kind] * (DIFFICULTY[game.settings.get('difficulty')] ?? 1) * (comfort() ? 0.6 : 1);

  function remove() {
    model?.parent?.remove(model);
    const obstacles = level()?.obstacles;
    if (obstacles?.includes(obstacle)) obstacles.splice(obstacles.indexOf(obstacle), 1);
    model = null;
    mode = null;
    route = [];
    target = null;
  }

  // His model, listening (head cocked to the sound) or walking.
  function dress(listening) {
    const wanted = listening ? 'listen' : 'walk';
    if (pose === wanted && model) return;
    const turn = model?.rotation.y ?? 0;
    model?.parent?.remove(model);
    model = PROPS.surgeon(game.world.textures, { listening });
    model.position.copy(position);
    model.rotation.y = turn;
    game.world.levelGroup.add(model);
    pose = wanted;
  }

  function moveTo(x, z) {
    position.set(x, 0, z);
    model.position.copy(position);
    Object.assign(obstacle, { minX: x - SPAN / 2, maxX: x + SPAN / 2, minZ: z - SPAN / 2, maxZ: z + SPAN / 2 });
  }

  function place(at) {
    pose = null;
    dress(false);
    obstacle = { mover: true };
    level().obstacles.push(obstacle);
    pathing = createPathing(level(), data().territory, { opens: nunOpens(game) });
    const spot = toWorld(at);
    moveTo(spot.x, spot.z);
  }

  // The stop of his round furthest from you: he never starts on top of you.
  function farStop() {
    const far = (at) => Math.hypot(toWorld(at).x - player().x, toWorld(at).z - player().z);
    return data().round.reduce((best, at, i) => (far(at) > far(data().round[best]) ? i : best), 0);
  }

  // A level's plan for him: "requires" a flag (the west wing: only on the way out), and
  // "rise": { "at", "seconds" }: he comes up the stairs after you, and is there that much later.
  function setup(next) {
    remove();
    const plan = next.surgeon;
    if (!plan || (plan.requires && !game.progress.hasFlag(plan.requires))) return;
    const intro = !game.progress.hasFlag(MET) && plan.intro;
    stop = intro ? 0 : farStop();
    place(intro ? intro.from : plan.rise?.at ?? plan.round[stop]);
    mode = intro ? 'intro' : plan.rise ? 'rising' : 'round';
    target = intro ? toWorld(intro.to) : null;
    introListening = false;
    if (!plan.rise) return;
    timer = plan.rise.seconds * (comfort() ? 1.6 : 1);
    model.visible = false; // still on the stairs below you
  }

  // Coming up the stairs after you: unseen and deaf, his tools clinking below; then there, listening.
  function rise(dt) {
    timer -= dt;
    voice.walking(dt, position, false, { quiet: true }); // his clinking says itself: "(…, on the stairs below you)"
    if (timer > 0) return;
    mode = 'searching';
    timer = 0;
    dress(true);
    model.visible = true;
    game.events.emit('surgeon.risen', { position: position.clone() });
  }

  function face(p) {
    model.rotation.y = Math.atan2(p.x - position.x, p.z - position.z);
  }

  // One step along his way to the target; true once he stands there.
  function walk(dt, kind, reach = 0.3) {
    if (!route.length) {
      route = pathing.route(position, target, { anyStart: true });
      if (!route.length) return true; // nowhere he can walk from here: he stands
      const end = level().worldToCell(route.at(-1).x, route.at(-1).z);
      const goal = level().worldToCell(target.x, target.z);
      route.reaches = end.col === goal.col && end.row === goal.row;
      if (route.length > 1) route.shift();
    }
    let step = speed(kind) * dt;
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
    voice.walking(dt, position, kind === 'come');
    return false;
  }

  function goTo(point) {
    target = { x: point.x, z: point.z };
    route = [];
  }

  // A sound stops him: the clinking stops, his head turns to it.
  function listenTo(sound) {
    mode = 'listening';
    timer = 0;
    heardYou = Boolean(sound.you);
    drawnBy = sound.kind;
    goTo(sound);
    dress(true);
    face(sound);
    voice.stopped(position);
  }

  // What Sam says over the rewind: what he heard (the wing 4 content sheet's five lines).
  function lineFor(cause) {
    if (drawnBy === 'door') return 'door';
    if (cause === 'breath' || drawnBy === 'gasp' || drawnBy === 'breath') return 'breath';
    if (cause === 'nora' || drawnBy === 'nora') return 'feet'; // her steps (ai/noraFollow.js)
    const lines = ['feet'];
    if (game.inventory.items().some(isThrowable)) lines.push('throw');
    if (game.progress.hasFlag('tool_camcorder')) lines.push('flash');
    return lines[catches % lines.length];
  }

  function caught(cause) {
    const line = lineFor(cause);
    catches += 1;
    model.visible = false; // the collapse shows his catch in his place
    if (game.world.flashlight.isOn()) game.world.flashlight.setOn(false); // his hand knocks it aside
    game.progress.setFlag('name_sam_water');
    game.events.emit('surgeon.catch', { position: position.clone(), cause });
    game.collapse.start('surgeon', { grab: 'surgeonCatch', whisper: `sam.rewind.${line}`, speaker: 'sam_water', spoken: true });
  }

  // Caught now? Walking into him, any time; once he has come, any sound he hears from you this close,
  // or from Nora following you (ai/noraFollow.js): then you are both caught.
  function catchNow() {
    const d = distanceTo(player());
    if (!game.hiding.active() && d <= TOUCH) return 'touch';
    const you = hearing.yours();
    const alert = mode === 'coming' || mode === 'searching';
    if (alert && you && d <= Math.min(CATCH, you.radius)) return you.kind;
    const her = game.noraFollow?.audible();
    return alert && her && distanceTo(her) <= Math.min(CATCH, her.radius) ? 'nora' : null;
  }

  function updateIntro(dt, heard) {
    if (introListening) {
      timer += dt;
      if (timer >= (comfort() ? 3.5 : WARNING)) {
        introListening = false;
        dress(false);
      }
      return;
    }
    if (heard) {
      introListening = true;
      timer = 0;
      dress(true);
      face(heard);
      voice.stopped(position);
      return;
    }
    if (!walk(dt, 'walk')) return;
    game.progress.setFlag(MET);
    game.events.emit('checkpoint');
    mode = 'round';
    target = null;
    stop = 1;
  }

  function updateRound(dt) {
    if (!target) goTo(toWorld(data().round[stop]));
    if (!walk(dt, 'walk')) return;
    stop = (stop + 1) % data().round.length;
    target = null;
  }

  function update(dt) {
    hearing.update(dt);
    if (model && mode === 'rising') return rise(dt);
    voice.update(dt, model ? position : null);
    if (!model || !data()) return;
    if (distanceTo(player()) < NEAR) game.events.emit('teach', 'breath');
    if (mode === 'stunned') {
      timer -= dt; // the flash: blind and deaf for a moment
      if (timer <= 0) {
        mode = 'searching';
        timer = 0;
      }
      return;
    }
    const heard = hearing.heard(position);
    if (mode === 'intro') return updateIntro(dt, heard);
    const cause = catchNow();
    if (cause) return caught(cause);
    if (mode === 'round') return heard ? listenTo(heard) : updateRound(dt);
    if (mode === 'listening') {
      timer += dt;
      if (heard) {
        heardYou = heardYou || Boolean(heard.you);
        goTo(heard);
        face(heard);
      }
      if (timer < (comfort() ? 3.5 : WARNING)) return;
      mode = 'coming';
      dress(false);
      voice.rushing(position);
      if (heardYou) voice.mutter('venn.thereYouAre', position);
      return;
    }
    if (mode === 'coming') {
      if (heard) goTo(heard);
      if (!walk(dt, 'come', ARRIVE)) return;
      mode = 'searching';
      timer = 0;
      dress(true);
      voice.mutter('venn.hush', position);
      return;
    }
    // Searching: standing where the sound was, listening.
    timer += dt;
    if (heard) {
      heardYou = Boolean(heard.you);
      goTo(heard);
      mode = 'coming';
      dress(false);
      return;
    }
    if (timer < SEARCH) return;
    mode = 'round';
    target = null;
    drawnBy = null;
    dress(false);
    voice.gaveUp(position);
  }

  const debug = surgeonDebug(game, () => ({ model, mode, position, route, target, heard: model ? hearing.heard(position) : null, you: hearing.yours() }));

  game.events.on('level.loaded', setup);

  return {
    update,
    ...debug,
    state: () => ({ mode, x: position.x, z: position.z, active: Boolean(model), seen: Boolean(model?.visible), heardYou }),
    position: () => (model ? position.clone() : null),
    // The camcorder's flash (player/camcorder.js): he stands blinded and deaf for that long.
    stun(seconds) {
      if (!model || mode === 'intro' || mode === 'rising') return false;
      mode = 'stunned';
      timer = seconds;
      dress(false);
      voice.cried(position);
      game.events.emit('surgeon.stunned', { position: position.clone() });
      return true;
    },
    // For tests: stand him somewhere, back on his round.
    moveTo(x, z) {
      if (!model) return;
      moveTo(x, z);
      route = [];
      target = null;
    },
  };
}
