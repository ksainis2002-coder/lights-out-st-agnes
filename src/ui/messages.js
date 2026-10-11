// Short feedback lines at the bottom of the screen ("Taken: Office key",
// "Journal updated"). Each shows for a few seconds; newest replaces oldest.
// A notice (like "Journal updated") never cuts a line short: notices queue
// up behind the current line.

export function createMessages() {
  let current = null;
  const waiting = [];
  return {
    // icon: an inventory icon name shown beside the line ("Taken: Battery").
    show(key, params, seconds = 2.8, icon = null) {
      current = { key, params, left: seconds, icon };
    },
    notice(key, params, seconds = 2.8) {
      const line = { key, params, left: seconds };
      if (!current) current = line;
      else if (current.key !== key && !waiting.some((queued) => queued.key === key)) waiting.push(line);
    },
    update(dt) {
      if (current && (current.left -= dt) <= 0) {
        current = waiting.shift() ?? null;
      }
    },
    current: () => current,
  };
}
