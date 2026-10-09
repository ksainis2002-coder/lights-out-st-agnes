// Short feedback lines at the bottom of the screen ("Taken: Office key",
// "Journal updated"). Each shows for a few seconds; newest replaces oldest.

export function createMessages() {
  let current = null;
  return {
    show(key, params, seconds = 2.8) {
      current = { key, params, left: seconds };
    },
    update(dt) {
      if (current && (current.left -= dt) <= 0) current = null;
    },
    current: () => current,
  };
}
