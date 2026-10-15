// A wing is done when its three things are found (the brief): the statue
// piece, the child's toy and the page of T. Hale's file. The flag
// wing_<id>_done opens the way on (wing 1's garden door to the courtyard).
// Checked whenever something is taken or read, and on every level load,
// so a save from before this flag existed gets it too.
const WINGS = {
  orphanage: { taken: ['quiet_statue', 'quiet_horse'], read: ['hale_file_1'] },
};

export function watchWings(game) {
  const { progress, events } = game;
  function check() {
    for (const [id, wing] of Object.entries(WINGS)) {
      const done = wing.taken.every((pickup) => progress.isTaken(pickup)) && wing.read.every((doc) => progress.isRead(doc));
      if (done && !progress.hasFlag(`wing_${id}_done`)) {
        progress.setFlag(`wing_${id}_done`);
        events.emit('wing.done', id);
      }
    }
  }
  events.on('item.taken', check);
  events.on('document.read', check);
  events.on('level.loaded', check);
}
