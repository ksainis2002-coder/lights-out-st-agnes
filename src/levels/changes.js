// Rooms that change as the story goes on (owner pick 2a, 2026-10-27: the hub
// a little worse after each part of the school). In level data a prop or a
// light may carry "after" and "until", each a story flag as { "flag": "..." }:
// it is there from the first flag on, and gone once the second is set.
//   { "type": "drawing", "at": [2.2, 1.0], "options": { "kind": "skipping" },
//     "after": { "flag": "puzzle_hopscotch" } }
// Read on every load, so a room shows what has happened since you left it.

const holds = (condition, progress) => progress.hasFlag(condition.flag);

const present = (entry, progress) =>
  (!entry.after || holds(entry.after, progress)) && !(entry.until && holds(entry.until, progress));

// The level data as things stand now: the same object when nothing in it changes.
export function withChanges(data, progress) {
  const changing = (entries) => (entries ?? []).some((entry) => entry.after || entry.until);
  if (!changing(data.props) && !changing(data.lights)) return data;
  const now = (entries) => entries && entries.filter((entry) => present(entry, progress));
  return { ...data, props: now(data.props), lights: now(data.lights) };
}
