// Puzzles named in a level's data ("puzzles": { "namePlates": {...} }).
// Each returns interactables; its state lives in progress values.
// The first use of any of a puzzle's targets sets tried_<name>: from then
// until its solved flag is set, the paper map rings it (ui/mapMarks.js).
import { namePlatesPuzzle, SOLVED as PLATES_SOLVED } from './namePlates.js';
import { cubbiesPuzzle, SOLVED as TOYS_SOLVED } from './cubbies.js';
import { musicBoxPuzzle, SOLVED as LULLABY_SOLVED } from './musicBox.js';
import { fusesPuzzle, SOLVED as FUSES_SOLVED } from './fuses.js';
import { libraryIndexPuzzle, SOLVED as LIBRARY_SOLVED } from './libraryIndex.js';
import { pianoPuzzle, SOLVED as PIANO_SOLVED } from './piano.js';
import { hopscotchPuzzle, SOLVED as HOPSCOTCH_SOLVED } from './hopscotch.js';
import { recordsLockPuzzle, SOLVED as RECORDS_SOLVED } from './recordsLock.js';
import { lanternsPuzzle, SOLVED as LANTERNS_SOLVED } from './lanterns.js';

const PUZZLES = {
  namePlates: { create: namePlatesPuzzle, solved: PLATES_SOLVED, symbol: 'plates' },
  cubbies: { create: cubbiesPuzzle, solved: TOYS_SOLVED, symbol: 'toys' },
  musicBox: { create: musicBoxPuzzle, solved: LULLABY_SOLVED, symbol: 'music' },
  fuses: { create: fusesPuzzle, solved: FUSES_SOLVED, symbol: 'fuses' },
  libraryIndex: { create: libraryIndexPuzzle, solved: LIBRARY_SOLVED, symbol: 'book' },
  piano: { create: pianoPuzzle, solved: PIANO_SOLVED, symbol: 'music' },
  hopscotch: { create: hopscotchPuzzle, solved: HOPSCOTCH_SOLVED, symbol: 'hop' },
  recordsLock: { create: recordsLockPuzzle, solved: RECORDS_SOLVED, symbol: 'lock' },
  lanterns: { create: lanternsPuzzle, solved: LANTERNS_SOLVED, symbol: 'flame' },
};

// For the paper map: each puzzle's solved flag and the symbol in its ring.
export const PUZZLE_MARKS = Object.fromEntries(Object.entries(PUZZLES).map(([name, { solved, symbol }]) => [name, { solved, symbol }]));

export function puzzleInteractables(game, level, data) {
  return Object.entries(data.puzzles ?? {}).flatMap(([name, config]) => {
    if (!PUZZLES[name]) throw new Error(`Level ${level.id}: unknown puzzle "${name}"`);
    return PUZZLES[name].create(game, level, config).map((target) => ({
      ...target,
      use(...args) {
        game.progress.setFlag(`tried_${name}`);
        return target.use(...args);
      },
    }));
  });
}
