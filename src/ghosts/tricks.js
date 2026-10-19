// Maggie's tricks on a room (design 0.3, approved still class1_turned): a
// while after the trick's "after" flag, while you are out of the room, near
// enough to hear it and not looking in, she sets the trick's flag, and the
// props "moved" for it stand their other way from then on (props/moves.js):
// Classroom 1's desks all turn to face the door, so they face you when you
// come back. The scrape of the furniture is the tell. Nothing moves at you
// and nothing stings, so comfort mode keeps it.
// Level data: "tricks": [{ "flag": "class1_turned", "after": "puzzle_library", "delay": 90,
//   "room": "class_1", "at": [12.5, 15.5], "hear": 14 }]   ("at": where the scrape is heard)
import * as THREE from 'three';
import { roomAt } from '../levels/loader.js';
import { inView } from '../ai/gaze.js';

const SCRAPES = [0, 0.45, 0.8, 1.4, 1.9]; // seconds: desk after desk dragged round

export function createTricks(game) {
  let clock = 0;
  const waiting = new Map(); // flag → the clock when its "after" flag was first seen
  const sight = new Map(); // flag → the points you would see it happen at (its props)
  let scrape = null; // { position, t, next }

  const tricks = () => game.world.level.tricks;
  const toWorld = (level, [col, row], y) => new THREE.Vector3(col * level.cellSize, y, row * level.cellSize);

  function setUp() {
    const level = game.world.level;
    waiting.clear();
    sight.clear();
    scrape = null;
    for (const trick of level.tricks) {
      const props = level.props.filter((prop) => prop.moved?.flag === trick.flag);
      sight.set(trick.flag, props.map((prop) => toWorld(level, prop.at, 0.8)));
    }
  }

  function ready(level, trick) {
    const { progress } = game;
    if (progress.hasFlag(trick.flag) || !progress.hasFlag(trick.after)) return false;
    if (!waiting.has(trick.flag)) waiting.set(trick.flag, clock);
    if (clock - waiting.get(trick.flag) < (trick.delay ?? 0)) return false;
    const p = game.player.state.position;
    if (roomAt(level, p) === trick.room) return false;
    const heard = toWorld(level, trick.at, 0);
    if (trick.hear && Math.hypot(heard.x - p.x, heard.z - p.z) > trick.hear) return false;
    return !inView(game, sight.get(trick.flag));
  }

  function play(level, trick) {
    game.progress.setFlag(trick.flag);
    scrape = { position: toWorld(level, trick.at, 0.4), t: 0, next: 0 };
    game.events.emit('trick.played', { flag: trick.flag });
  }

  function updateScrape(dt) {
    if (!scrape) return;
    while (scrape.next < SCRAPES.length && scrape.t >= SCRAPES[scrape.next]) {
      game.events.emit('trick.scrape', { position: scrape.position });
      scrape.next += 1;
    }
    scrape.t += dt;
    if (scrape.next === SCRAPES.length) scrape = null;
  }

  function update(dt) {
    clock += dt;
    updateScrape(dt);
    if (game.collapse.active()) return; // not mid-grab or blackout
    const level = game.world.level;
    for (const trick of tricks()) if (ready(level, trick)) play(level, trick);
  }

  // For the debug overlay: what each trick still waits for.
  function debugLine() {
    const waits = tricks().filter((trick) => !game.progress.hasFlag(trick.flag)).map((trick) => {
      if (!game.progress.hasFlag(trick.after)) return `${trick.flag} after ${trick.after}`;
      const left = (trick.delay ?? 0) - (clock - (waiting.get(trick.flag) ?? clock));
      return left > 0 ? `${trick.flag} in ${Math.ceil(left)} s` : `${trick.flag} once you are out of sight`;
    });
    return waits.length ? `TRICKS  ${waits.join('   ')}` : null;
  }

  game.events.on('level.loaded', setUp);
  setUp();
  return { update, debugLine };
}
