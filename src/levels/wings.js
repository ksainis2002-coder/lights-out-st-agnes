// A wing is done when its three things are found (the brief): the statue
// piece, the child's toy and the page of T. Hale's file. The flag
// wing_<id>_done opens the way on (wing 1's garden door to the courtyard).
// The school's toy is Maggie's rope, given rather than found: a flag. The
// west wing is done once you are out of it with Edith's box (flag
// wards_escaped: levels/wayOut.js, which asks for a check: "wings.check").
// Checked whenever something is taken or read, and on every level load,
// so a save from before this flag existed gets it too.
const WINGS = {
  orphanage: { taken: ['quiet_statue', 'quiet_horse'], read: ['hale_file_1'] },
  school: { taken: ['agnes_lamb'], read: ['hale_file_2'], flags: ['puzzle_hopscotch'] },
  wards: { taken: ['stone_palm', 'edith_music_box'], read: ['hale_file_3'], flags: ['wards_escaped'] },
};

export function watchWings(game) {
  const { progress, events } = game;
  function check() {
    for (const [id, wing] of Object.entries(WINGS)) {
      const done = wing.taken.every((pickup) => progress.isTaken(pickup)) && wing.read.every((doc) => progress.isRead(doc))
        && (wing.flags ?? []).every((flag) => progress.hasFlag(flag));
      if (done && !progress.hasFlag(`wing_${id}_done`)) {
        progress.setFlag(`wing_${id}_done`);
        events.emit('wing.done', id);
      }
    }
  }
  events.on('item.taken', check);
  events.on('document.read', check);
  events.on('level.loaded', check);
  events.on('wings.check', check);
}
