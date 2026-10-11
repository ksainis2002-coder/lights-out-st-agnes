// Puzzle 3 (west dorm): Tommy's crank winds the music box; its five picture
// keys each play a note. Playing the tune chalked on the playroom slate
// opens the hidden door to the quiet room. Notes play any time, but the tune
// only counts once the slate (data.clue, a document id) has been read.
// Level data: "puzzles": { "musicBox": { "prop": "<music box prop id>",
//   "clue": "lullaby_chalk", "tune": [symbols...], "reveals": "<door id>" } }
import * as THREE from 'three';
import { MUSIC_BOX_KEYS } from '../props/catalog.js';
import { TUNE_SYMBOLS } from '../props/parts.js';
import { playNote } from '../audio/notes.js';

const WOUND = 'music_box_wound';
const SOLVED = 'puzzle_lullaby';
// Pentatonic notes, keys left to right: C5 D5 E5 G5 A5.
const FREQUENCIES = [523.25, 587.33, 659.25, 783.99, 880];

export function musicBoxPuzzle(game, level, data) {
  const { progress, inventory, i18n } = game;
  let box = null;
  game.world.levelGroup.traverse((object) => {
    if (object.userData.prop?.id === data.prop) box = object;
  });
  box.updateWorldMatrix(true, false);
  const at = (x, y, z) => box.localToWorld(new THREE.Vector3(x, y, z));
  let played = [];

  function solve() {
    progress.setFlag(SOLVED);
    progress.setFlag(`revealed_${data.reveals}`);
    level.doors.find((door) => door.id === data.reveals).revealed = true;
    game.sfx?.play('mus_music_box', { position: at(0, 0.1, 0), volume: 0.8 });
    game.messages.show('msg.lullabySolved', null, 6);
    game.events.emit('puzzle.solved', 'lullaby');
    game.events.emit('checkpoint');
  }

  function press(i) {
    playNote(game.mixer, FREQUENCIES[i], { position: at(MUSIC_BOX_KEYS[i], 0.15, 0.09) });
    game.events.emit('musicBox.note', TUNE_SYMBOLS[i]);
    played = [...played, TUNE_SYMBOLS[i]].slice(-data.tune.length);
    const right = played.join() === data.tune.join();
    if (right && progress.isRead(data.clue)) solve();
  }

  const crankSlot = {
    position: at(0.23, 0.08, 0),
    radius: 0.15,
    prompt() {
      if (progress.hasFlag(WOUND)) return null;
      return inventory.has('music_box_crank') ? { key: 'prompt.fitCrank' } : { key: 'prompt.musicBox' };
    },
    use() {
      if (!inventory.has('music_box_crank')) return game.messages.show('msg.musicBoxNoCrank', null, 4);
      inventory.remove('music_box_crank');
      progress.setFlag(WOUND);
      game.messages.show('msg.musicBoxWound', null, 4);
      game.events.emit('musicBox.wound');
    },
  };

  const keys = MUSIC_BOX_KEYS.map((x, i) => ({
    position: at(x, 0.15, 0.09),
    radius: 0.035,
    prompt() {
      if (!progress.hasFlag(WOUND) || progress.hasFlag(SOLVED)) return null;
      return { key: 'prompt.pressKey', params: { symbol: i18n.t(`symbol.${TUNE_SYMBOLS[i]}`) } };
    },
    use: () => press(i),
  }));

  return [crankSlot, ...keys];
}
