// Edith's music box (wing 3's toy): "a slow tune with one note missing" (the
// content sheet), made with Web Audio like wing 1's box (audio/notes.js). It
// plays in her lap once mended, then from your pocket the whole way out, and
// winds down as you come out into the courtyard. The owner's recording
// (mus_music_box_edith, docs/SOUNDS_0.4.md) may take its place later.
import { playNote } from './notes.js';
import { MENDED } from '../ghosts/edithBox.js';
import { ESCAPED } from '../levels/wayOut.js';

const BEAT = 0.62; // seconds: slow, a lullaby in three
const NOTE = { E4: 329.63, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46 };
// [note, beats]; null is the missing note: the comb's tooth that broke.
const TUNE = [
  ['E5', 2], ['C5', 1], ['D5', 2], ['B4', 1], ['C5', 1], ['A4', 1], ['E4', 1], ['A4', 3],
  ['F5', 2], ['D5', 1], ['E5', 2], ['C5', 1], ['B4', 1], [null, 1], ['B4', 1], ['A4', 3],
];
const REST = 2; // beats of quiet before it starts again
const WIND_DOWN = 4; // notes it still plays, slower and slower, once you are out
const GAP = TUNE.findIndex(([note]) => note === null);
const POCKET = { position: null, volume: 0.3, bus: 'music' };

// Her tune's second line up to the gap, from your pocket (the cabinet in the
// theatre, puzzles/cabinet.js): F5 D5 E5 C5 B4, and then nothing. Returns its seconds.
export function playToGap(mixer) {
  let at = 0;
  for (const [note, beats] of TUNE.slice(8, GAP)) {
    playNote(mixer, NOTE[note], { ...POCKET, delay: at });
    at += beats * BEAT;
  }
  return at;
}

// A note in the gap, then the tune's end after it (B4, A4).
export function playGapWith(mixer, frequency, options = {}) {
  playNote(mixer, frequency, { ...POCKET, ...options });
  let at = TUNE[GAP][1] * BEAT;
  for (const [note, beats] of TUNE.slice(GAP + 1)) {
    playNote(mixer, NOTE[note], { ...POCKET, delay: at });
    at += beats * BEAT;
  }
}

export function createEdithTune(game) {
  let index = 0;
  let wait = 0;
  let winding = null; // notes left as it runs down

  const playing = () => game.progress.hasFlag(MENDED) && !game.progress.hasFlag(ESCAPED);

  // In her lap (the pickup not taken yet) it plays from there; then from your pocket.
  function source() {
    const at = !game.inventory.has('music_box') && game.edith.at();
    return at ? { position: at.setY(at.y + 0.2), volume: 0.5 } : { position: null, volume: 0.22 };
  }

  function play(slow = 1) {
    const [note, beats] = TUNE[index];
    if (note) playNote(game.mixer, NOTE[note], { ...source(), bus: 'music' });
    game.events.emit('edithTune.note', note);
    index = (index + 1) % TUNE.length;
    wait = beats * BEAT * slow + (index === 0 ? REST * BEAT : 0);
  }

  function update(dt) {
    if (!playing() && winding === null) {
      if (game.progress.hasFlag(ESCAPED) && game.progress.hasFlag(MENDED) && index !== 0) winding = WIND_DOWN;
      else return;
    }
    wait -= dt;
    if (wait > 0) return;
    if (winding !== null) {
      if (winding === 0) {
        winding = null;
        index = 0; // wound down: silent from here on
        return;
      }
      play(1 + (WIND_DOWN - winding + 1) * 0.5);
      winding -= 1;
      return;
    }
    play();
  }

  return { update, state: () => ({ playing: playing(), index, winding }) };
}
