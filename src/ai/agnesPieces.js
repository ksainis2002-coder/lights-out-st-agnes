// St. Agnes in the chapel (0.5 part A; approved stills chapel, statue_whole;
// the wing 4 content sheet). She hunts the nave from her plinth, moving only
// while nobody looks (ai/watcher.js), so you give her back her four pieces
// with your eyes on her: her hand (wing 1), the palm on it (wing 3), the lamb
// in her arm (wing 2), her heart in her breast (the crypt). Each sets
// agnes_<piece>, leaves your inventory, and her stone is rebuilt with it.
// With all four she is whole (flag agnes_whole): the bell tolls once, the
// rain stops for good (levels/calm.js), a gate comes unlocked under the west
// wing (flag basement_open) and she stands still from then on, turned to the
// door (the chapel's "watcher": "whole").

export const WHOLE = 'agnes_whole';
export const PIECES = [
  { id: 'hand', item: 'statue_piece', prompt: 'prompt.agnesHand' },
  { id: 'palm', item: 'stone_palm', prompt: 'prompt.agnesPalm', after: 'hand' }, // it fits the hand
  { id: 'lamb', item: 'stone_lamb', prompt: 'prompt.agnesLamb' },
  { id: 'heart', item: 'stone_heart', prompt: 'prompt.agnesHeart' },
];
const flag = (id) => `agnes_${id}`;
const CAPTION = { speaker: null, whisper: false, seconds: 3.5 };
const EYES = 'said_msg.agnesEyes';

// Once she is whole, in turn (seconds after the last piece).
const WHOLE_STEPS = [
  [0, (game) => game.subtitles.show('caption.chapelBell', CAPTION)],
  [2.6, (game) => {
    game.subtitles.show('caption.rainStops', CAPTION);
    game.events.emit('weather.calm'); // the rain fades out (audio/gameAudio.js)
  }],
  [5.4, (game) => game.messages.show('msg.basementUnlocked', null, 6)],
];

// Which pieces she has back, for her model (ai/watcher.js).
export const piecesNow = (progress) => Object.fromEntries(PIECES.map(({ id }) => [id, progress.hasFlag(flag(id))]));

export function createAgnesPieces(game, watcher) {
  const { progress } = game;
  let step = null; // the next of WHOLE_STEPS once she is whole, while that plays out
  let since = 0; // seconds since she was made whole

  const here = () => Boolean(game.world.level?.watcher?.pieces);
  const back = (id) => progress.hasFlag(flag(id));
  // The next piece you can give her: one you carry, whose place is ready for it.
  const next = () => PIECES.find((p) => !back(p.id) && game.hasItem(p.item) && (!p.after || back(p.after)));

  function prompt() {
    const piece = !progress.hasFlag(WHOLE) && next();
    return { key: piece ? piece.prompt : 'prompt.look' };
  }

  function whole() {
    const level = game.world.level;
    const at = watcher.position();
    progress.setFlag(WHOLE);
    progress.setFlag('basement_open');
    watcher.standStill([at.x / level.cellSize, at.z / level.cellSize], level.watcher.whole ?? 0);
    game.events.emit('agnes.whole', { position: at });
    game.events.emit('clue', 'agnes_whole');
    since = 0;
    step = 0;
  }

  function use() {
    if (progress.hasFlag(WHOLE)) return game.messages.show('msg.agnesWholeLook', null, 4);
    const piece = next();
    if (!piece) return game.messages.show('msg.agnesFirstLook', null, 6);
    progress.setFlag(flag(piece.id));
    game.inventory.remove(piece.item);
    watcher.refresh();
    game.events.emit('agnes.piece', { id: piece.id, position: watcher.position() });
    game.subtitles.show('caption.stoneSettles', CAPTION);
    if (!progress.hasFlag(EYES)) {
      progress.setFlag(EYES);
      game.messages.show('msg.agnesEyes', null, 6);
    }
    if (PIECES.every(({ id }) => back(id))) whole();
  }

  function update(dt) {
    if (step === null) return;
    since += dt;
    while (step < WHOLE_STEPS.length && since >= WHOLE_STEPS[step][0]) WHOLE_STEPS[step++][1](game);
    if (step === WHOLE_STEPS.length) step = null;
  }

  // She is used where she stands (she is only still while you look at her).
  game.interaction.addSource(() => {
    if (!here()) return [];
    const at = watcher.position();
    return at ? [{ position: at.clone().setY(1.5), radius: 0.55, prompt, use }] : [];
  });

  return { update, next: () => next()?.id ?? null, debugLine: () => `AGNES  ${PIECES.map((p) => `${p.id} ${back(p.id) ? 'back' : '-'}`).join('  ')}` };
}
