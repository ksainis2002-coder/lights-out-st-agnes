// Edith Carr (0.4, approved still edith; the content sheet): the blind ghost
// girl on bed 7 of the children's ward. Faceless and unhurt, as every ghost
// child. She hears Sister M.'s beads before you can and says where she is: a
// whisper heard anywhere in the wing, never more often than every 20 s, and
// only when what she has to say changes. She is "a child" until you read her
// chart. Level data: "edith": { "at": [c, r], "y": 0.48, "rotation": -90, "room": "childrens_ward" }
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { roomAt } from '../levels/loader.js';

const MEET_WITHIN = 3.2; // metres
const GAP = 20; // seconds between her warnings
const NEAR = 9; // metres: "the next room"
const FAR = 20; // metres: "two rooms away"
const SECONDS = 4.5;

export function createEdith(game) {
  let ghost = null;
  let at = null;
  let wait = 0;
  let said = null; // the last thing she warned of
  let turn = 0; // which of two wordings comes next
  let queue = []; // lines still to say, one after another

  const say = (key) => game.subtitles.show(key, { speaker: 'edith', seconds: SECONDS });

  function setup(level) {
    ghost = null;
    said = null;
    queue = [];
    wait = 0;
    const data = level.edith;
    if (!data) return;
    ghost = PROPS.ghostEdith(game.world.textures, { opacity: 0.55 });
    at = new THREE.Vector3(data.at[0] * level.cellSize, data.y ?? 0.48, data.at[1] * level.cellSize);
    ghost.position.copy(at);
    ghost.rotation.y = ((data.rotation ?? 0) * Math.PI) / 180;
    const pale = new THREE.PointLight('#9fb4dc', 1.4, 3.5, 1.3);
    pale.position.set(0, 0.8, 0.5);
    ghost.add(pale);
    game.world.levelGroup.add(ghost);
  }

  function meet(level) {
    if (game.progress.hasFlag('edith_met')) return;
    const p = game.player.state.position;
    if (roomAt(level, p) !== level.edith.room || Math.hypot(p.x - at.x, p.z - at.z) > MEET_WITHIN) return;
    game.progress.setFlag('edith_met');
    queue = ['edith.meet.1', 'edith.meet.2'];
    wait = 0;
    game.events.emit('edith.met');
  }

  // What she would say about Sister M. now, or null.
  function warning(level) {
    const nun = game.nun.state();
    if (!nun.active || nun.mode === 'intro') return null;
    const p = game.player.state.position;
    const d = Math.hypot(nun.x - p.x, nun.z - p.z);
    const lit = game.world.flashlight.isOn();
    if (roomAt(level, p) === roomAt(level, nun)) {
      if (nun.sees) return 'seen';
      if (!lit && d < 3.5) return 'aside';
      return lit ? 'next' : 'dark';
    }
    if (d < NEAR) return 'next';
    if (d < FAR) return 'far';
    return said && said !== 'gone' ? 'gone' : null;
  }

  function update(dt) {
    const level = game.world.level;
    if (!level.edith || !ghost) return;
    wait -= dt;
    meet(level);
    if (queue.length) {
      if (wait <= 0) {
        say(queue.shift());
        wait = SECONDS + 0.4;
      }
      return;
    }
    if (!game.progress.hasFlag('edith_met') || game.hiding.active()) return;
    const now = warning(level);
    const urgent = now === 'seen' || now === 'aside';
    if (!now || now === said || (wait > 0 && !urgent)) return;
    said = now;
    wait = urgent ? 8 : GAP;
    turn = 1 - turn;
    const twoWordings = now === 'far' || now === 'next';
    const key = `edith.warn.${now}${twoWordings ? `.${turn + 1}` : ''}`;
    say(key);
    game.events.emit('edith.warned', { about: now, key });
  }

  game.events.on('level.loaded', setup);
  game.events.on('document.read', (doc) => {
    if (doc?.id === 'chart_carr') game.progress.setFlag('name_edith');
  });

  return { update, state: () => ({ said, present: Boolean(ghost) }) };
}
