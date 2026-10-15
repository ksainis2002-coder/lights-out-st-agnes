// Props that do something when used, named by a "use" field in level data:
//   { "type": "tapeRecorder", "at": [...], "use": "save" }
//   { "type": "drawing", "id": "drawing_ivy", "at": [...], "use": "look" }
// Looking at a prop sets the flag seen_<id> (puzzles check it) and notes the
// clue saw_<id> in the journal, if that text exists; a prop without its own
// clue shows a line about its kind (look.<type>.<kind>). Every drawing can be
// looked at, with or without a "use" in the data.
//   { "type": "blackboard", "id": "counting_board", "use": "view", "view": "board", "prompt": "prompt.readBoard" }
// The same, up close (screens/closeView.js: "board" shows its lineKeys,
// "painting" the class painting and its captionKey).
//   { "type": "wallClock", "at": [...], "use": "clock" }
// Using a clock reads out the real local time (a quiet hint for the 3:00 room).
//   { "type": "stairs", "use": "travel", "to": { "level": "...", "spawn": "..." },
//     "prompt": "prompt.stairsUp", "requires": "<flag>", "lockedMessage": "<key>" }
// Stairs and outside doors drawn as props take you to another level ("Not
// yet" while that level is not built).
//   { "type": "facadeDoor", "use": "message", "message": "<key>", "prompt": "<key>" }
// A door that never opens, or a look through a keyhole: just its line.
//   { "type": "schoolDesk", "id": "maggie_desk", "use": "lid", "message": "<key>", "flags": ["name_maggie"] }
// Lifting a desk lid, once: the lid stays up, its line shows, the flag
// opened_<id> and its flags are set (a document inside appears with one).
//   { "type": "cabinet", "use": "note", "message": "<key>", "flags": [...], "prompt": "prompt.open" }
// A drawer with nothing to take: its line, every time; its flags.
//   { "type": "cloakPegs", "id": "...", "use": "search", "gives": "matches", "document": "maggie_note" }
// Pockets searched once (flag searched_<id>): the item, then the note read.
// "useAt": [c, r], "useHeight" and "useRadius" place the spot you aim at.
import * as THREE from 'three';
import { clockFaceTime } from './clocks.js';
import { findProp } from './place.js';
import { liftLid } from './school.js';
import { itemText, itemDef } from '../items/catalog.js';
import { LEVELS } from '../levels/index.js';

function useClock(game) {
  game.messages.show('msg.clockTime', { time: clockFaceTime(game.world.now()) }, 3);
}

const waiting = (game, prop) => prop.requires && !game.progress.hasFlag(prop.requires);
const setFlags = (game, prop) => (prop.flags ?? []).forEach((flag) => game.progress.setFlag(flag));

// A door or gate that won't let you through: its line, and the locked rattle.
function refuse(game, prop, message) {
  if (message) game.messages.show(message, null, 5);
  game.events.emit('prop.refused', prop);
}

// Looking counts once: seen_<id>, and the journal notes saw_<id> (clues.js).
// Returns the line to show: the prop's own clue, or its kind's line.
function noteLook(game, prop) {
  const kindLine = `look.${prop.type}.${prop.options?.kind}`;
  if (!prop.id) return kindLine;
  const first = !game.progress.hasFlag(`seen_${prop.id}`);
  game.progress.setFlag(`seen_${prop.id}`);
  if (first) game.events.emit('prop.looked', prop);
  return game.i18n.has(`clue.saw_${prop.id}`) ? `clue.saw_${prop.id}` : kindLine;
}

function openLid(game, prop) {
  const lid = findProp(game.world.levelGroup, prop.id)?.getObjectByName('lid');
  if (lid && !lid.userData.lifted) {
    liftLid(lid);
    lid.userData.lifted = true;
  }
}

const USES = {
  save: { prompt: 'prompt.save', height: 0.1, run: (game) => game.openScreen('save') },
  travel: {
    prompt: 'prompt.leave',
    height: 1.2,
    promptFor(game, prop) {
      if (waiting(game, prop)) return 'prompt.locked';
      return LEVELS[prop.to.level] ? prop.prompt : 'prompt.notYet';
    },
    run(game, prop) {
      if (waiting(game, prop)) return refuse(game, prop, prop.lockedMessage);
      if (LEVELS[prop.to.level]) game.travel(prop.to.level, prop.to.spawn);
    },
  },
  message: { prompt: 'prompt.open', height: 1.2, run: (game, prop) => refuse(game, prop, prop.message) },
  clock: { prompt: 'prompt.clock', height: 1.45, run: useClock },
  look: {
    prompt: 'prompt.look',
    height: 1.15,
    run(game, prop) {
      const line = noteLook(game, prop);
      if (game.i18n.has(line)) game.messages.show(line, null, 5);
    },
  },
  view: {
    prompt: 'prompt.look',
    height: 1.4,
    run(game, prop) {
      noteLook(game, prop);
      game.openScreen('closeView', { view: prop.view, lines: prop.options?.lineKeys, caption: prop.options?.captionKey });
    },
  },
  lid: {
    prompt: 'prompt.liftLid',
    height: 0.78,
    done: (game, prop) => game.progress.hasFlag(`opened_${prop.id}`),
    setup: (game, prop) => game.progress.hasFlag(`opened_${prop.id}`) && openLid(game, prop),
    run(game, prop) {
      game.progress.setFlag(`opened_${prop.id}`);
      setFlags(game, prop);
      openLid(game, prop);
      if (prop.message) game.messages.show(prop.message, null, 5);
      game.events.emit('prop.opened', prop);
      game.events.emit('reveal');
    },
  },
  note: {
    prompt: 'prompt.open',
    height: 0.8,
    run(game, prop) {
      setFlags(game, prop);
      game.messages.show(prop.message, null, 5);
      game.events.emit('prop.opened', prop);
    },
  },
  search: {
    prompt: 'prompt.searchPockets',
    height: 1.1,
    done: (game, prop) => game.progress.hasFlag(`searched_${prop.id}`),
    run(game, prop) {
      if (prop.gives && !itemDef(prop.gives).tool && !game.inventory.add(prop.gives)) return game.messages.show('msg.inventoryFull');
      game.progress.setFlag(`searched_${prop.id}`);
      game.events.emit('prop.searched', prop);
      if (prop.gives) {
        game.messages.show('msg.taken', { item: itemText(game.i18n, prop.gives) }, 2.8, itemDef(prop.gives).icon);
        game.events.emit('item.taken', { id: prop.id, item: prop.gives });
      }
      if (prop.document) game.readDocument(prop.document);
    },
  },
};

const DEFAULT_USE = { drawing: 'look', hymnBoard: 'look' };
const useOf = (prop) => prop.use ?? DEFAULT_USE[prop.type];

export function propInteractables(game, level) {
  return level.props.filter((prop) => USES[useOf(prop)]).map((prop) => {
    const action = USES[useOf(prop)];
    action.setup?.(game, prop);
    const [col, row] = prop.useAt ?? prop.at;
    return {
      position: new THREE.Vector3(col * level.cellSize, (prop.y ?? 0) + (prop.useHeight ?? action.height), row * level.cellSize),
      radius: prop.useRadius ?? 0.3,
      prompt: () => (action.done?.(game, prop) ? null : { key: action.promptFor?.(game, prop) ?? prop.prompt ?? action.prompt }),
      use: () => action.run(game, prop),
    };
  });
}
