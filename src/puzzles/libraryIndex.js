// Puzzle 1 (library): Maggie's library ticket names her book; the card index
// (up close, one drawer per letter) gives its shelf; the 700–799 bookcase
// (up close) gives the book, and inside it her song. The card only comes
// out once the ticket has been read; any book can be taken from the shelf.
// Level data: "libraryIndex": { "prop": "card_index", "shelf": "shelf_700",
//   "ticket": "library_ticket", "drawer": 18, "book": 784, "song": "my_song" }
// (drawer 18 is S in English and Τ in Greek: the title's first letter.)
import * as THREE from 'three';
import { findProp } from '../props/place.js';

export const SOLVED = 'puzzle_library';
const CARD = 'found_library_card';

export function libraryIndexPuzzle(game, level, data) {
  const { progress } = game;
  const find = (id) => {
    const found = findProp(game.world.levelGroup, id);
    found.updateWorldMatrix(true, false);
    return found;
  };
  const cabinet = find(data.prop);
  const shelf = find(data.shelf);
  let drawerNote = null;
  let shelfNote = null;

  function pick(drawer) {
    if (drawer !== data.drawer) {
      drawerNote = 'cardIndex.wrongDrawer';
      game.events.emit('library.drawer', false);
      return;
    }
    drawerNote = 'msg.cardFound';
    game.events.emit('library.drawer', true);
    if (progress.hasFlag(CARD)) return;
    progress.setFlag(CARD);
    game.events.emit('clue', 'found_library_card');
  }

  function take(number) {
    if (number !== data.book) {
      shelfNote = 'shelf.wrongBook';
      game.events.emit('library.book', false);
      return;
    }
    if (progress.hasFlag(SOLVED)) return;
    shelfNote = null;
    progress.setFlag(SOLVED);
    game.events.emit('library.book', true);
    game.events.emit('puzzle.solved', 'library');
    game.events.emit('checkpoint');
    game.readDocument(data.song); // her song, between the pages
  }

  const cardTarget = {
    position: cabinet.localToWorld(new THREE.Vector3(0, 0.95, 0.25)),
    radius: 0.35,
    prompt: () => ({ key: 'prompt.cardIndex' }),
    use() {
      if (!progress.isRead(data.ticket)) return game.messages.show('msg.cardIndexNoTitle', null, 4);
      drawerNote = progress.hasFlag(CARD) ? 'msg.cardFound' : null;
      game.openScreen('cardIndex', { pick, found: () => (progress.hasFlag(CARD) ? data.drawer : null), note: () => drawerNote });
    },
  };
  const shelfTarget = {
    position: shelf.localToWorld(new THREE.Vector3(0, 1.2, 0.25)),
    radius: 0.6,
    prompt: () => ({ key: 'prompt.shelves' }),
    use() {
      shelfNote = null;
      game.openScreen('shelf', { take, taken: () => (progress.hasFlag(SOLVED) ? [data.book] : []), note: () => shelfNote });
    },
  };
  return [cardTarget, shelfTarget];
}
