// The player's journal: clues noted automatically, documents read, maps found.
// Stores ids only; text comes from i18n (clue.<id>, doc.<id>.title …).
// One read document can be held at the player's side (H) while playing.

export function createJournal(events) {
  let data = { clues: [], documents: [], maps: [], held: null };

  function add(list, id) {
    if (data[list].includes(id)) return false;
    data[list].push(id);
    events.emit('journal.updated', { list, id });
    return true;
  }

  return {
    addClue: (id) => add('clues', id),
    addDocument: (id) => add('documents', id),
    addMap: (id) => add('maps', id),
    clues: () => [...data.clues],
    documents: () => [...data.documents],
    maps: () => [...data.maps],
    held: () => data.held,
    hold(id) {
      data.held = data.documents.includes(id) ? id : null;
      events.emit('journal.held', data.held);
    },
    toJSON: () => structuredClone(data),
    load(saved) {
      data = { clues: [], documents: [], maps: [], held: null, ...structuredClone(saved ?? {}) };
    },
  };
}
