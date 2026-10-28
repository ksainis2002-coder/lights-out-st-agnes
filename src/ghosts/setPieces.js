// Part B's set pieces (design 0.3; approved stills "bell", "roll_call",
// "projector_film"), run from level data ("setPieces": [...]). Each plays
// once, the first time you are in its room once it may: a setup tell first
// (the room goes quiet, or its lamps die), then the hit. They keep a
// cooldown of their own (data "cooldown") so two never stack, start the
// ghost children's scare cooldown too, and comfort mode cuts them (scare
// rules §1, §5). They are silent: the content sheet gives them no text.
// Event fields: id, kind ("bell" | "rollCall" | "film"), room, requires (a
// flag), setup { tell, seconds, sound, at } (a sound with the tell, played
// at [c, r]: a ruler slapped on Class 3's teacher's table), cooldownGroup, cooldown
// (seconds), comfort ("skip" | "keep"), drain (sanity at the hit), and the
// kind's own data.
import { roomAt } from '../levels/loader.js';
import { bellPiece } from './bell.js';
import { rollCallPiece } from './rollCall.js';
import { filmPiece } from './film.js';
import { worldAt } from './setPieceKit.js';

const KINDS = { bell: bellPiece, rollCall: rollCallPiece, film: filmPiece };

export function createSetPieces(game) {
  let active = null; // { event, piece, t }

  const done = (event) => game.progress.hasFlag(`set_${event.id}`);

  function allowed(event) {
    if (done(event)) return false;
    if (event.requires && !game.progress.hasFlag(event.requires)) return false;
    if (game.settings.get('comfortMode') && event.comfort !== 'keep') return false;
    return game.ghosts.cooldownLeft(event.cooldownGroup) <= 0;
  }

  function start(event) {
    game.progress.setFlag(`set_${event.id}`); // once, even if cut short by leaving
    game.ghosts.startCooldown(event.cooldownGroup, event.cooldown);
    game.ghosts.startCooldown('scare');
    active = { event, piece: KINDS[event.kind](game, event), t: 0 };
    const { sound, at } = event.setup ?? {};
    if (sound) game.sfx.play(sound, { position: worldAt(game.world.level, at, 0.8), volume: 0.8, refDistance: 2, pitchJitter: 0 });
    game.events.emit('setPiece.started', event);
  }

  function stop() {
    active?.piece.stop();
    active = null;
  }

  function update(dt) {
    if (active) {
      active.t += dt;
      if (!active.piece.update(active.t, dt)) return;
      const { event } = active;
      stop();
      game.events.emit('setPiece.finished', event);
      return;
    }
    const room = roomAt(game.world.level, game.player.state.position);
    const event = game.world.level.setPieces.find((candidate) => candidate.room === room && allowed(candidate));
    if (event) start(event);
  }

  // A level left or a tape loaded mid-piece: its lamps come back, it is done.
  game.events.on('level.loaded', stop);
  game.events.on('game.stopped', stop);

  function debugLine() {
    const pieces = game.world.level.setPieces;
    if (!pieces.length) return 'SET PIECES  none here';
    if (active) return `SET PIECES  ${active.event.id} (${active.piece.phase(active.t)}, ${active.t.toFixed(1)}s)`;
    const waiting = pieces.filter((event) => !done(event)).map((event) => event.id);
    const wait = Math.round(game.ghosts.cooldownLeft(pieces[0].cooldownGroup));
    return `SET PIECES  to come: ${waiting.join(', ') || 'none'}   cooldown ${wait}s`;
  }

  return { update, debugLine, active: () => active?.event.id ?? null };
}
