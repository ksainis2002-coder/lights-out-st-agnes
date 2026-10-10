// Puzzles named in a level's data ("puzzles": { "namePlates": {...} }).
// Each returns interactables; its state lives in progress values.
import { namePlatesPuzzle } from './namePlates.js';

const PUZZLES = { namePlates: namePlatesPuzzle };

export function puzzleInteractables(game, level, data) {
  return Object.entries(data.puzzles ?? {}).flatMap(([name, config]) => {
    if (!PUZZLES[name]) throw new Error(`Level ${level.id}: unknown puzzle "${name}"`);
    return PUZZLES[name](game, level, config);
  });
}
