// Notes clues in the journal when things happen. A clue is written only if
// its text exists in i18n (clue.<id>), so data can name clues freely.

export function setupClues(game) {
  const { events, journal, i18n, messages } = game;
  const note = (id) => {
    if (!i18n.has(`clue.${id}`)) return;
    if (journal.addClue(id)) messages.show('msg.journal');
  };
  events.on('door.locked', (door) => note(`locked_${door.id}`));
  events.on('item.taken', (pickup) => note(`took_${pickup.item}`));
  events.on('document.read', (doc) => note(`read_${doc.id}`));
}
