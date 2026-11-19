// Nora Kane on Dr. Venn's table (0.5, part C; approved stills theatre_nora
// and nora_close; the wing 4 content sheet). Alive, strapped down at her
// chest, her hips and her shins, her head turned to your breathing. As you
// come into the theatre: "Who is that? I can hear you breathing. Please.";
// close over her: "Please. Before he comes back." Each strap's buckle eases
// open in turn ("Undo the straps", quietly: he does not hear it); with the
// third she is free: her three lines, the journal, and she gets down (and
// follows you out: ai/noraFollow.js). Walk out through the back door without her and
// it swings shut behind you (shut for good: its "shutBy"), her voice behind
// it, then silence: the building takes her, and the table is empty.
// Level data: "nora": { "at": [c, r], "y": 0.92, "rotation": 0, "room": "theatre",
//   "backDoor": "<door id>", "beyond": "<room past it>", "standAt": [c, r], "standRotation": 0 }
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { STRAPS, buckleAt } from '../props/nora.js';
import { roomAt } from '../levels/loader.js';

export const MET = 'nora_met';
export const FREED = 'nora_freed';
export const LEFT = 'nora_left';
const PLEADED = 'nora_pleaded';
const UNDONE = 'nora_straps'; // progress value: the straps undone, by number (0 chest, 1 hips, 2 shins)
const FACE = new THREE.Vector3(-0.04, 0.19, -0.67); // her head as she lies (props/nora.js)
const LEAN = 1.1; // metres from her face: leaning over her
const VOICE = { speaker: 'nora_here', whisper: false };
const CAPTION = { speaker: null, whisper: false };
// Her lines once free, each with how long it shows (seconds): she gets down after the first.
const FREED_LINES = [['nora.freed1', 3.5], ['nora.freed2', 6.5], ['nora.freed3', 4.5]];

export function createNoraTable(game) {
  const { progress, events } = game;
  let figure = null; // her model on the table, strapped (free, she is ai/noraFollow.js's)
  let queue = []; // lines to come: { key, options, at }
  let clock = 0;

  const data = () => game.world.level?.nora ?? null;
  const size = () => game.world.level.cellSize;
  const undone = () => progress.getValue(UNDONE, []);
  const player = () => game.player.state.position;
  const strapped = () => figure?.userData.strapped === true;

  function place(model, [c, r], y, degrees) {
    model.position.set(c * size(), y, r * size());
    model.rotation.y = ((degrees ?? 0) * Math.PI) / 180;
    game.world.levelGroup.add(model);
    model.updateWorldMatrix(true, true);
    return model;
  }

  function build() {
    figure = null;
    queue = [];
    const d = data();
    if (!d || progress.hasFlag(LEFT) || progress.hasFlag(FREED)) return; // left behind, the table is empty; free, she is up
    figure = place(PROPS.noraStrapped(game.world.textures), d.at, d.y ?? 0.92, d.rotation);
    figure.userData.strapped = true;
    figure.traverse((o) => undone().includes(o.userData.strap) && (o.visible = false));
  }

  // Free: off the table and on her feet beside it (ai/noraFollow.js takes her from here).
  function getDown() {
    figure?.parent?.remove(figure);
    figure = null;
    events.emit('nora.getsDown', { at: data().standAt, rotation: data().standRotation });
  }

  // Lines one after another: [key, options, seconds it shows, seconds before it].
  function say(lines) {
    let at = clock;
    queue = lines.map(([key, options, seconds, before = 0]) => {
      at += before;
      const line = { key, options: { ...options, seconds }, at };
      at += seconds;
      return line;
    });
  }

  function speak() {
    while (queue.length && queue[0].at <= clock) {
      const { key, options } = queue.shift();
      game.subtitles.show(key, options);
      events.emit('nora.line', key);
      if (key === 'nora.freed1') getDown(); // she gets down while she says it
      if (key === 'nora.freed3') events.emit('nora.ready'); // "Get us out": she follows you
    }
  }

  const worldPoint = (local) => figure.localToWorld(local.clone());
  const faceAt = () => worldPoint(FACE);

  function undo(i) {
    progress.setValue(UNDONE, [...undone(), i]);
    figure.traverse((o) => o.userData.strap === i && (o.visible = false));
    game.subtitles.show('caption.buckle', { ...CAPTION, seconds: 2.5 });
    events.emit('nora.buckle', { position: worldPoint(new THREE.Vector3(...buckleAt(STRAPS[i]))) });
    if (undone().length === STRAPS.length) free();
  }

  function free() {
    progress.setFlag(FREED);
    events.emit('clue', 'nora_freed');
    events.emit('nora.freed');
    say(FREED_LINES.map(([key, seconds], i) => [key, VOICE, seconds, i ? 0.4 : 0.6]));
  }

  // Walked out through the back door without her.
  function leave() {
    const d = data();
    const door = game.world.level.doors.find((candidate) => candidate.id === d.backDoor);
    progress.setFlag(LEFT); // the door's "shutBy": shut for good
    if (door) {
      door.open = false;
      door.easing = false;
      progress.setOpen(door.id, false);
      events.emit('nora.doorShut', door);
    }
    figure?.parent?.remove(figure); // when you look back through the glass, the table is empty
    figure = null;
    events.emit('clue', 'nora_left');
    say([['caption.theatreDoorShuts', CAPTION, 3], ['nora.dontLeave', VOICE, 3, 0.2], ['caption.silence', CAPTION, 3, 1.4]]);
  }

  function watch() {
    const d = data();
    const here = roomAt(game.world.level, player());
    if (strapped() && here === d.room && !progress.hasFlag(MET)) {
      progress.setFlag(MET);
      progress.setFlag('name_nora_here'); // her voice from the radios: Nora
      say([['nora.whoIsThat', VOICE, 4, 0.4]]);
    }
    if (strapped() && progress.hasFlag(MET) && !progress.hasFlag(PLEADED) && faceAt().distanceTo(game.world.camera.position) < LEAN) {
      progress.setFlag(PLEADED);
      say([['nora.please', VOICE, 3.5]]);
    }
    if (d.beyond && here === d.beyond && !progress.hasFlag(FREED) && !progress.hasFlag(LEFT)) leave();
  }

  function update(dt) {
    clock += dt;
    if (!data()) return;
    speak();
    watch();
  }

  // On the table: her face, to look at; each strap's buckle, to undo.
  game.interaction.addSource(() => {
    if (!strapped()) return [];
    const look = { position: faceAt(), radius: 0.16, prompt: () => ({ key: 'prompt.look' }), use: () => game.messages.show('msg.noraLook', null, 6) };
    const buckles = STRAPS.map((strap, i) => ({
      position: worldPoint(new THREE.Vector3(...buckleAt(strap))),
      radius: 0.13,
      prompt: () => (undone().includes(i) ? null : { key: 'prompt.undoStraps' }),
      use: () => !undone().includes(i) && undo(i),
    }));
    return [look, ...buckles];
  });

  events.on('level.loaded', build);

  function state() {
    if (progress.hasFlag(LEFT)) return 'left behind';
    if (progress.hasFlag(FREED)) return 'free';
    return `on the table, straps undone ${undone().length}/${STRAPS.length}${progress.hasFlag(MET) ? '' : ', not met'}`;
  }

  return { update, state, debugLine: () => (data() ? `NORA  ${state()}` : 'NORA  not here') };
}
