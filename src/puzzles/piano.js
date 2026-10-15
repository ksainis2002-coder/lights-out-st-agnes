// Puzzle 2 (music room): Maggie's song page is six coloured shapes, and the
// stickers on the piano's keys match them (owner pick: every colour has its
// own shape). Up close, click or press 1–8; playing the six notes in order
// drops the headmaster's key out of the piano. Before the song page is read
// the piano is only looked at: little stickers on six keys.
// Level data: "piano": { "prop": "piano", "clue": "my_song", "tune": [5, 5, 3, 6, 5, 3] }
import * as THREE from 'three';
import { playNote, PIANO } from '../audio/notes.js';
import { findProp } from '../props/place.js';

export const SOLVED = 'puzzle_piano';
// White keys middle C to C, each a little out of tune (an old school piano).
const FREQUENCIES = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];
const DETUNE = [1.004, 0.997, 1.006, 0.995, 1.003, 0.996, 1.007, 0.998];

export function pianoPuzzle(game, level, data) {
  const { progress } = game;
  const piano = findProp(game.world.levelGroup, data.prop);
  piano.updateWorldMatrix(true, false);
  const keys = piano.localToWorld(new THREE.Vector3(0, 0.75, 0.5));
  let played = [];

  function solve() {
    if (game.mode === 'ui') game.resume(); // step back to hear it drop
    progress.setFlag(SOLVED);
    game.messages.show('msg.pianoSolved', null, 6);
    game.events.emit('puzzle.solved', 'piano');
    game.events.emit('checkpoint');
  }

  function press(key) {
    playNote(game.mixer, FREQUENCIES[key - 1] * DETUNE[key - 1], { position: keys, timbre: PIANO, volume: 0.45 });
    game.events.emit('piano.note', key);
    played = [...played, key].slice(-data.tune.length);
    if (played.join() === data.tune.join() && progress.isRead(data.clue) && !progress.hasFlag(SOLVED)) solve();
  }

  const target = {
    position: keys,
    radius: 0.5,
    prompt: () => (progress.hasFlag(SOLVED) ? null : { key: 'prompt.playPiano' }),
    use() {
      if (!progress.isRead(data.clue)) return game.messages.show('msg.pianoStickers', null, 5);
      played = [];
      game.openScreen('piano', { press, played: () => [...played] });
    },
  };
  return [target];
}
