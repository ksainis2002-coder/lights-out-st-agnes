// Short feedback lines at the bottom of the screen ("Taken: Office key",
// "Journal updated"). Each shows for a few seconds; newest replaces oldest.
// A notice (like "Journal updated") never cuts a line short: notices queue
// up behind the current line, with a short pause between one and the next.
// Tutorial lines are notices with a tag: ENTER skips them, and a quick line
// ("Taken: …") puts them back in the queue instead of losing them.

const PAUSE = 0.8; // seconds of quiet before the next queued line

export function createMessages() {
  let current = null;
  let pause = 0;
  const waiting = [];
  return {
    // icon: an inventory icon name shown beside the line ("Taken: Battery").
    show(key, params, seconds = 2.8, icon = null) {
      if (current?.tag) waiting.unshift(current);
      current = { key, params, left: seconds, icon };
    },
    // tag: marks a skippable tutorial line ("basics", "tutorial").
    notice(key, params, seconds = 2.8, tag = null) {
      const line = { key, params, left: seconds, tag };
      if (!current && !waiting.length) current = line;
      else if (current?.key !== key && !waiting.some((queued) => queued.key === key)) waiting.push(line);
    },
    update(dt) {
      if (current && (current.left -= dt) <= 0) {
        current = null;
        pause = PAUSE;
      }
      if (!current && waiting.length && (pause -= dt) <= 0) current = waiting.shift();
    },
    // ENTER: move on from a tutorial line already read.
    skip() {
      if (current?.tag) current = waiting.shift() ?? null;
    },
    // Whether lines with this tag are still showing or queued.
    pending: (tag) => current?.tag === tag || waiting.some((line) => line.tag === tag),
    clear() {
      current = null;
      pause = 0;
      waiting.length = 0;
    },
    current: () => current,
  };
}
