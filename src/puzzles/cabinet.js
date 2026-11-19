// The cabinet in Dr. Venn's theatre (0.5, part C; approved still
// cabinet_lock; the wing 4 content sheet; owner 2026-11-19: "hear the gap").
// Its lock has five little brass keys with the dorm music box's pictures (sun,
// moon, star, bird, heart), each playing that box's note. Up close, Edith's
// music box plays her tune from your pocket and stops at the gap, the note her
// box lost; each key plays its note in the gap and the tune's end after it.
// The one that fits (the sun) opens it, "(the lock clicks open)", and the
// theatre's key lies inside; any other, "(the lock does not give)".
// Level data: "cabinet": { "prop": "<cabinet prop id>", "gap": "sun" }
import * as THREE from 'three';
import { findProp } from '../props/place.js';
import { TUNE_SYMBOLS } from '../props/parts.js';
import { playNote } from '../audio/notes.js';
import { playToGap, playGapWith } from '../audio/edithTune.js';

export const SOLVED = 'puzzle_cabinet';
const FREQUENCIES = [523.25, 587.33, 659.25, 783.99, 880]; // the dorm box's keys: C5 D5 E5 G5 A5
const OPEN = -1.9; // radians the door swings out
const SWING_SECONDS = 1.2;
const SAID_FOR = 2200; // ms the lock's answer shows up close (a screen runs on the clock on the wall)
const CAPTION = { speaker: null, whisper: false, seconds: 3 };

export function cabinetPuzzle(game, level, data) {
  const { progress, world } = game;
  const cabinet = findProp(world.levelGroup, data.prop);
  cabinet.updateWorldMatrix(true, true);
  const door = cabinet.getObjectByName('door');
  const lockAt = cabinet.localToWorld(new THREE.Vector3(0.32, 0.97, 0.24));
  let said = null; // { key, until } the lock's answer, up close

  if (progress.hasFlag(SOLVED)) door.rotation.y = OPEN;

  function answer(key) {
    said = { key, until: performance.now() + SAID_FOR };
    game.subtitles.show(key, CAPTION);
  }

  function solve() {
    progress.setFlag(SOLVED);
    answer('caption.lockClicks');
    game.events.emit('cabinet.open', { position: lockAt.clone() });
    game.events.emit('puzzle.solved', 'cabinet'); // the key shows inside (items/pickups.js)
    game.events.emit('checkpoint');
    if (game.mode === 'ui') game.resume(); // step back to see it swing open
    let t = 0;
    world.animate((dt) => {
      t = Math.min(1, t + dt / SWING_SECONDS);
      door.rotation.y = OPEN * (1 - (1 - t) * (1 - t));
      return t < 1;
    });
  }

  function press(i) {
    if (progress.hasFlag(SOLVED)) return;
    const fits = TUNE_SYMBOLS[i] === data.gap;
    if (game.inventory.has('music_box')) playGapWith(game.mixer, FREQUENCIES[i], { volume: 0.4 });
    else playNote(game.mixer, FREQUENCIES[i], { volume: 0.4 });
    game.events.emit('cabinet.key', TUNE_SYMBOLS[i]);
    if (fits) return solve();
    answer('caption.lockNoGive');
    game.events.emit('cabinet.wrong', { position: lockAt.clone() });
  }

  function look() {
    game.messages.show('msg.cabinet', null, 6);
    game.events.emit('clue', 'cabinet_lock');
    if (game.inventory.has('music_box')) playToGap(game.mixer); // her tune from your pocket, up to the gap
    game.openScreen('cabinetLock', { press, line: () => (said && performance.now() < said.until ? said.key : null) });
  }

  return [{
    position: lockAt,
    radius: 0.2,
    prompt: () => (progress.hasFlag(SOLVED) ? null : { key: 'prompt.look' }),
    use: look,
  }];
}
