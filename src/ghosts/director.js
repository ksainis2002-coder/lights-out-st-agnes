// Ghost children, run from level data ("ghosts": [...]). Two kinds:
//
//   appear — a child (Tommy) stands far off, announced by a distant laugh.
//            Walk close or keep looking and they are gone: running footsteps
//            further on, and a whispered hint (subtitled). Story beats, so
//            comfort mode keeps them.
//   scare  — the children close in: the room sound dips (setup tell), then a
//            sound right behind you and a glimpse of a child; costs sanity.
//            One global cooldown; comfort mode skips them (scare rules §1, §5).
//
// Ghost children never kill or block (scare rules §2, §4); seeing a real
// one costs a little sanity per second (the brief's sanity drains).
//
// Event fields: id, kind, room | cells, requires (flag/clue/item), at,
// rotation, sitting, line, speaker, drain, setup {sound, delay},
// sound {name, at}, leadTo, cooldownGroup, comfort ("keep" | "skip").
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { roomAt } from '../levels/loader.js';

const SCARE_COOLDOWN = 90; // seconds between scares (owner to confirm; scare rules §1)
const VANISH_DISTANCE = 4;
const STARE_SECONDS = 1.2;
const SEEN_DRAIN = 0.5; // sanity per second while a ghost child is in view

export function createGhostDirector(game) {
  const cooldowns = {};
  let clock = 0; // own clock, so cooldowns follow game time (also in tests)
  let active = null; // { event, ghost, phase, t, seenFor }
  let lastRoom = null;

  const done = (event) => game.progress.hasFlag(`ghost_${event.id}`);
  const markDone = (event) => game.progress.setFlag(`ghost_${event.id}`);
  const world = (level, [c, r], y = 0) => new THREE.Vector3(c * level.cellSize, y, r * level.cellSize);

  function requirementsMet(event) {
    const need = event.requires;
    if (!need) return true;
    if (need.flag && !game.progress.hasFlag(need.flag)) return false;
    if (need.clue && !game.journal.clues().includes(need.clue)) return false;
    if (need.item && !game.inventory.has(need.item)) return false;
    return true;
  }

  function allowed(event) {
    if (done(event) || !requirementsMet(event)) return false;
    if (event.kind === 'scare') {
      if (game.settings.get('comfortMode') && event.comfort !== 'keep') return false;
      if ((cooldowns[event.cooldownGroup ?? 'scare'] ?? 0) > clock) return false;
    }
    return true;
  }

  function spawnGhost(event, level) {
    const ghost = PROPS.ghostChild(game.world.textures, { opacity: 0.5 });
    ghost.position.copy(world(level, event.at));
    if (event.sitting) ghost.position.y = 0.35;
    ghost.rotation.y = ((event.rotation ?? 0) * Math.PI) / 180;
    game.world.levelGroup.add(ghost);
    return ghost;
  }

  function start(event) {
    const level = game.world.level;
    active = { event, phase: 'setup', t: 0, seenFor: 0, ghost: null };
    if (event.kind === 'appear') {
      active.ghost = spawnGhost(event, level);
      active.phase = 'watch';
      game.sfx.play(event.setup?.sound ?? 'child_laugh_far', { position: active.ghost.position, volume: 0.8 });
    } else {
      game.mixer.duck('effects', -14, { attack: 0.3, hold: 2.5, release: 1.5 }); // the tell: the room goes quiet
      if (event.setup?.sound) game.sfx.play(event.setup.sound, { position: world(level, event.setup.at ?? event.at, 1.2), volume: 0.6 });
      cooldowns[event.cooldownGroup ?? 'scare'] = clock + SCARE_COOLDOWN;
    }
    game.events.emit('ghost.started', event);
  }

  function finish(event) {
    if (active?.ghost) active.ghost.parent?.remove(active.ghost);
    if (event.line) game.subtitles.show(event.line, { speaker: event.speaker ?? null, seconds: 5 });
    markDone(event);
    game.events.emit('ghost.finished', event);
    active = null;
  }

  function behindPlayer(distance) {
    const p = game.player.state.position;
    const yaw = game.player.state.yaw;
    return new THREE.Vector3(p.x + Math.sin(yaw) * distance, 0, p.z + Math.cos(yaw) * distance);
  }

  function inView(position) {
    const camera = game.world.camera;
    const to = position.clone().setY(1).sub(camera.position);
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    return to.angleTo(forward) < 0.6 ? to.length() : null;
  }

  function updateAppear(dt) {
    const { event, ghost } = active;
    // Never noticed: slip away quietly and try again next time.
    if (active.t > 25 && active.seenFor === 0) {
      ghost.parent?.remove(ghost);
      active = null;
      return;
    }
    const distance = inView(ghost.position);
    if (distance !== null) {
      active.seenFor += dt;
      game.sanity.drain(SEEN_DRAIN * dt, 'ghost');
    }
    const p = game.player.state.position;
    const near = Math.hypot(ghost.position.x - p.x, ghost.position.z - p.z) < VANISH_DISTANCE;
    if (!near && active.seenFor < STARE_SECONDS) return;
    const lead = event.leadTo ? world(game.world.level, event.leadTo, 0.3) : ghost.position;
    game.sfx.play('child_footsteps_run', { position: lead, volume: 0.8 });
    finish(event);
  }

  function updateScare() {
    const { event } = active;
    if (active.phase === 'setup' && active.t >= (event.setup?.delay ?? 1.5)) {
      active.phase = 'hit';
      active.t = 0;
      const where = behindPlayer(1.4);
      game.sfx.play(event.sound?.name ?? 'giggle_close', { position: where.clone().setY(1.1), volume: 1 });
      if (event.glimpse !== false) {
        active.ghost = spawnGhost({ ...event, at: [where.x / game.world.level.cellSize, where.z / game.world.level.cellSize] }, game.world.level);
        active.ghost.rotation.y = game.player.state.yaw;
      }
      game.sanity.drain(event.drain ?? 6, 'children');
      game.events.emit('ghost.scared', event);
    } else if (active.phase === 'hit' && active.t >= 0.7) {
      finish(event);
    }
  }

  function update(dt) {
    clock += dt;
    const level = game.world.level;
    if (active) {
      active.t += dt;
      return active.event.kind === 'appear' ? updateAppear(dt) : updateScare();
    }
    const room = roomAt(level, game.player.state.position);
    const entered = room !== lastRoom;
    lastRoom = room;
    for (const event of level.ghosts) {
      if (!allowed(event)) continue;
      const inRoom = event.room ? entered && room === event.room : false;
      const inCells = event.cells ? game.triggers.active.has(`ghost_${event.id}`) : false;
      if (inRoom || inCells) return start(event);
    }
  }

  function reset() {
    if (active?.ghost) active.ghost.parent?.remove(active.ghost);
    active = null;
    lastRoom = null;
  }

  return {
    update,
    reset,
    active: () => active,
    debugLine: () => `GHOSTS  ${active ? `${active.event.id} (${active.event.kind}, ${active.phase})` : 'none'}   scare cooldown ${Math.max(0, Math.round((cooldowns.scare ?? 0) - clock))}s`,
  };
}
