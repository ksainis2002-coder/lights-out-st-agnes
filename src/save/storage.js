// Crash-safe JSON storage on top of localStorage (or any Storage-like object).
// Each write first copies the last good value to "<key>.bak", so a bad or
// half-written value can always fall back to the previous one.

const PREFIX = 'st-agnes:';

export function memoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  };
}

function defaultStorage() {
  try {
    const probe = `${PREFIX}probe`;
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return memoryStorage(); // private mode or blocked storage: play on, nothing persists
  }
}

export function createStore(storage = defaultStorage()) {
  const full = (key) => PREFIX + key;

  function write(key, value) {
    const current = storage.getItem(full(key));
    if (current !== null) storage.setItem(`${full(key)}.bak`, current);
    storage.setItem(full(key), JSON.stringify(value));
  }

  // Returns the first copy (main, then backup) that parses and passes `accept`.
  function read(key, accept = () => true) {
    for (const name of [full(key), `${full(key)}.bak`]) {
      const parsed = tryParse(storage.getItem(name));
      if (parsed !== undefined && accept(parsed)) return parsed;
    }
    return null;
  }

  function remove(key) {
    storage.removeItem(full(key));
    storage.removeItem(`${full(key)}.bak`);
  }

  return { write, read, remove, storage };
}

function tryParse(text) {
  if (text === null) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
