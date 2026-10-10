// Short feedback lines at the bottom of the screen ("Taken: Office key",
// "Journal updated"). Each shows for a few seconds; newest replaces oldest.
// A notice (like "Journal updated") never cuts a line short: it waits until
// the current one is done.

export function createMessages() {
  let current = null;
  let waiting = null;
  return {
    show(key, params, seconds = 2.8) {
      current = { key, params, left: seconds };
    },
    notice(key, params, seconds = 2.8) {
      if (current) waiting = { key, params, left: seconds };
      else current = { key, params, left: seconds };
    },
    update(dt) {
      if (current && (current.left -= dt) <= 0) {
        current = waiting;
        waiting = null;
      }
    },
    current: () => current,
  };
}
