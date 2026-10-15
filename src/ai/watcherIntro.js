// The watcher's introduction (design 0.3, route step 3). She stands asleep at
// the end of a library aisle; once the library puzzle is solved and you are
// back in the room, the light dies for a moment — a fade, after two quick
// flickers unless flicker is off — and when it comes back she is closer.
// Maggie whispers "She only moves when nobody's looking." and sings her
// rhyme (Grandmother's footsteps); from then on the watcher hunts. Leaving the
// library after: "The dark counts as not looking. Keep a light on her."
// A scripted story beat (the dying light is its setup), so comfort mode keeps it.
// Level data: "watcher": { "intro": { "room": "library", "after": "puzzle_library", "closer": 3,
//   "setup": "the light dies", "comfort": "keep" } } (scare rules §1: its tell, kept in comfort mode)
import { roomAt } from '../levels/loader.js';
import { AWAKE } from './watcher.js';

const LEFT_LIBRARY = 'heard_library_leaving';
const RHYME = ['rhyme.library.1', 'rhyme.library.2', 'rhyme.library.3', 'rhyme.library.4'];
const LINE_SECONDS = 3.6;
const DARK = 0.95; // how dark the dying light gets (fade 0–1)
// Seconds into the beat: flickers, dark, she moves, light back, Maggie.
const FLICKERS = [[0, 0.08], [0.18, 0.26]];
const DARK_FROM = 0.4;
const MOVE_AT = 0.9;
const LIGHT_AT = 1.7;
const LIGHT_BACK = 0.6;
const SPEAK_AT = 2.5;
const RHYME_AT = 7;

export function createWatcherIntro(game, watcher) {
  let t = null;

  const intro = () => game.world.level.watcher?.intro ?? null;
  const here = (data) => roomAt(game.world.level, game.player.state.position) === data.room;
  const flickerOff = () => game.settings.get('flickerOff') || game.settings.get('reduceEffects');

  // A spot on her way to you, about "closer" metres short of you.
  function closerSpot(data) {
    const p = game.player.state.position;
    const way = watcher.route(p);
    const far = (point) => Math.hypot(point.x - p.x, point.z - p.z);
    return [...way].reverse().find((point) => far(point) >= data.closer) ?? way[0] ?? null;
  }

  function fadeAt(time) {
    if (time < DARK_FROM) {
      if (flickerOff()) return (time / DARK_FROM) * DARK;
      return FLICKERS.some(([from, to]) => time >= from && time < to) ? DARK : 0;
    }
    if (time < LIGHT_AT) return DARK;
    return Math.max(0, DARK * (1 - (time - LIGHT_AT) / LIGHT_BACK));
  }

  function step(dt, data) {
    const before = t;
    t += dt;
    const crossed = (mark) => before < mark && t >= mark;
    game.pipeline.fx.fade = fadeAt(t);
    if (crossed(MOVE_AT)) {
      const spot = closerSpot(data);
      if (spot) watcher.moveTo(spot.x, spot.z);
      const where = watcher.position();
      if (where) game.events.emit('watcher.moved', { position: where });
    }
    if (crossed(SPEAK_AT)) {
      watcher.wake();
      game.subtitles.show('maggie.library.still', { speaker: 'maggie', seconds: 4.2 });
    }
    RHYME.forEach((line, i) => {
      if (crossed(RHYME_AT + i * LINE_SECONDS)) game.subtitles.show(line, { speaker: 'maggie', manner: 'singing', seconds: LINE_SECONDS + 0.3 });
    });
    if (t >= RHYME_AT + RHYME.length * LINE_SECONDS) {
      t = null;
      game.events.emit('watcher.introduced');
    }
  }

  function update(dt) {
    const data = intro();
    if (!data) return;
    if (t !== null) return step(dt, data);
    const { progress } = game;
    if (progress.hasFlag(AWAKE)) {
      if (!progress.hasFlag(LEFT_LIBRARY) && !here(data)) {
        progress.setFlag(LEFT_LIBRARY);
        game.subtitles.show('maggie.library.leaving', { speaker: 'maggie', seconds: 5 });
      }
      return;
    }
    if (!progress.hasFlag(data.after) || !here(data) || !watcher.position()) return;
    t = 0;
    game.events.emit('watcher.introStarted');
  }

  // A tape loaded or a level left mid-beat: the light comes back, the beat waits.
  game.events.on('level.loaded', () => {
    if (t !== null && t < SPEAK_AT) game.pipeline.fx.fade = 0;
    t = null;
  });

  return { update, active: () => t !== null };
}
