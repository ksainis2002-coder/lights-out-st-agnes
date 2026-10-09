// Tiny event bus so systems (audio, puzzles, journal) can react to each other
// without importing one another: events.on('door.opened', fn); events.emit(...).

export function createEvents() {
  const handlers = new Map();
  return {
    on(name, fn) {
      if (!handlers.has(name)) handlers.set(name, new Set());
      handlers.get(name).add(fn);
      return () => handlers.get(name).delete(fn);
    },
    emit(name, payload) {
      handlers.get(name)?.forEach((fn) => fn(payload));
    },
  };
}
