// Puzzles named in a level's data ("puzzles": { "namePlates": {...} }).
// Each returns interactables; its state lives in progress values.
// The first use of any of a puzzle's targets sets tried_<name>: from then
// until its solved flag is set, the paper map rings it (ui/mapMarks.js).
import { namePlatesPuzzle, SOLVED as PLATES_SOLVED } from './namePlates.js';
import { cubbiesPuzzle, SOLVED as TOYS_SOLVED } from './cubbies.js';
import { musicBoxPuzzle, SOLVED as LULLABY_SOLVED } from './musicBox.js';
import { fusesPuzzle, SOLVED as FUSES_SOLVED } from './fuses.js';

const PUZZLES = {
  namePlates: { create: namePlatesPuzzle, solved: PLATES_SOLVED, symbol: 'plates' },
  cubbies: { create: cubbiesPuzzle, solved: TOYS_SOLVED, symbol: 'toys' },
  musicBox: { create: musicBoxPuzzle, solved: LULLABY_SOLVED, symbol: 'music' },
  fuses: { create: fusesPuzzle, solved: FUSES_SOLVED, symbol: 'fuses' },
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
