// Sam Pike (0.5, part B; approved still sam; the wing 4 content sheet): the
// boy who drowned in the boiler room's flood, standing in it, faceless and
// soaked like every ghost child. He cannot speak (the water): he knocks on
// the pipes where Dr. Venn is, one knock far off, two close, as Edith told
// you where Sister M. was. Meet him (in the boiler room, his figure in view)
// and he knocks twice and looks to the corridor. Give him his tin soldier
// (it lies under the flood until the valves drain it) and three times, at a
// pipe, you can tap for him: he knocks far from you, and Dr. Venn goes to
// listen there (a noise he hears anywhere). He is never a threat.
// Level data, "sam": { "at": [c, r], "rotation": 90, "room": "boiler_room",
//   "lookTo": [c, r] (where he looks once met: the corridor),
//   "pipes": [[c, r, y], …] (where you tap, and where his far knocks sound) }
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { roomAt } from '../levels/loader.js';
import { SOLVED as DRAINED } from '../puzzles/valves.js';

export const MET = 'sam_met';
export const GIVEN = 'sam_soldier';
const TAPS = 'sam_taps'; // progress value: taps left once he has his soldier
const MEET_WITHIN = 4; // metres
const MEET_ANGLE = 0.82; // cos of the angle from the middle of your view he must be within
const KNOCK_GAP = [14, 20]; // seconds between his knocks
const CLOSE = 10; // metres from you: Dr. Venn is close (two knocks)
const FAR_AWAY = 8; // metres: a tap's knock sounds at least this far from you
const LURE = 40; // metres his far knock carries for Dr. Venn: anywhere down here
const CAPTION = { speaker: null, whisper: false, seconds: 3 };
const WATERLINE = 0.45;

export function createSam(game) {
  let ghost = null;
  let knockIn = KNOCK_GAP[0];

  const data = () => game.world.level.sam;
  const size = () => game.world.level.cellSize;
  const player = () => game.player.state.position;
  const pipes = () => (data()?.pipes ?? []).map(([c, r, y]) => new THREE.Vector3(c * size(), y, r * size()));
  const show = (key) => game.subtitles.show(key, CAPTION);

  function build() {
    ghost?.parent?.remove(ghost);
    ghost = null;
    if (!data()) return;
    const drained = game.progress.hasFlag(DRAINED);
    ghost = PROPS.ghostSam(game.world.textures, { opacity: 0.45, waterline: drained ? 0 : WATERLINE });
    ghost.position.set(data().at[0] * size(), 0, data().at[1] * size());
    const toward = game.progress.hasFlag(MET) && data().lookTo;
    ghost.rotation.y = toward
      ? Math.atan2(toward[0] * size() - ghost.position.x, toward[1] * size() - ghost.position.z)
      : ((data().rotation ?? 0) * Math.PI) / 180;
    const pale = new THREE.PointLight('#9fb4dc', 1.1, 3.2, 1.3);
    pale.position.set(0, 1.0, 0.4);
    ghost.add(pale);
    game.world.levelGroup.add(ghost);
  }

  // Knocks on the pipes: twice where Dr. Venn is when he is close to you, once far off when he is not.
  function knock(at, close) {
    game.events.emit('sam.knock', { position: at.clone(), times: close ? 2 : 1 });
    show(close ? 'caption.knockClose' : 'caption.knockFar');
    game.events.emit('clue', 'sam_knocks');
  }

  function meet() {
    game.progress.setFlag(MET);
    game.progress.setFlag('name_sam');
    game.events.emit('clue', 'sam_met');
    knock(ghost.position.clone().setY(1.2), true);
    build(); // he looks to the corridor now
  }

  function inView(at) {
    const camera = game.world.camera;
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    const to = new THREE.Vector3(at.x - camera.position.x, 0, at.z - camera.position.z).normalize();
    return to.dot(forward.setY(0).normalize()) > MEET_ANGLE;
  }

  function maybeMeet() {
    if (game.progress.hasFlag(MET) || roomAt(game.world.level, player()) !== data().room) return;
    const d = Math.hypot(ghost.position.x - player().x, ghost.position.z - player().z);
    if (d <= MEET_WITHIN && inView(ghost.position)) meet();
  }

  // Where Dr. Venn is, now and then.
  function updateKnocks(dt) {
    const venn = game.surgeon?.position();
    if (!venn || !game.progress.hasFlag(MET)) return;
    knockIn -= dt;
    if (knockIn > 0) return;
    knockIn = KNOCK_GAP[0] + Math.random() * (KNOCK_GAP[1] - KNOCK_GAP[0]);
    knock(venn.clone().setY(2.2), Math.hypot(venn.x - player().x, venn.z - player().z) <= CLOSE);
  }

  // A tap at a pipe: he knocks at the pipe furthest from you, and Dr. Venn goes there.
  function tap() {
    const left = game.progress.getValue(TAPS, 0);
    if (left <= 0) return;
    game.progress.setValue(TAPS, left - 1);
    game.events.emit('sam.tapped');
    const away = (at) => Math.hypot(at.x - player().x, at.z - player().z);
    const far = pipes().sort((a, b) => away(b) - away(a))[0];
    if (!far || away(far) < FAR_AWAY) return;
    game.events.emit('noise', { x: far.x, z: far.z, radius: LURE, kind: 'knock' });
    knock(far, false);
  }

  function give() {
    game.inventory.remove('tin_soldier');
    game.progress.setFlag(GIVEN);
    game.progress.setValue(TAPS, 3);
    game.events.emit('clue', 'sam_soldier');
    game.events.emit('sam.given', { position: ghost.position.clone() });
  }

  function update(dt) {
    if (!ghost || !data()) return;
    maybeMeet();
    updateKnocks(dt);
  }

  // Sam, to give him his soldier; the pipes, to tap for him.
  game.interaction.addSource(() => {
    if (!ghost || !data()) return [];
    const him = {
      position: ghost.position.clone().setY(1.0),
      radius: 0.4,
      prompt: () => (game.hasItem('tin_soldier') && !game.progress.hasFlag(GIVEN) ? { key: 'prompt.giveSoldier' } : null),
      use: give,
    };
    const left = game.progress.getValue(TAPS, 0);
    const taps = pipes().map((at) => ({
      position: at,
      radius: 0.35,
      prompt: () => (game.progress.hasFlag(GIVEN) && left > 0 ? { key: 'prompt.tapPipe', params: { n: left } } : null),
      use: tap,
    }));
    return [him, ...taps];
  });

  game.events.on('level.loaded', build);
  game.events.on('puzzle.solved', (name) => name === 'valves' && build()); // the water gone from round his legs

  return { update, state: () => ({ met: game.progress.hasFlag(MET), given: game.progress.hasFlag(GIVEN), taps: game.progress.getValue(TAPS, 0) }) };
}
