// The key on a use prompt (owner 2026-11-18: "no need for every text to say
// click"). While you learn it, the first few prompts read "CLICK  Look";
// after that only the action shows. A prompt with an input of its own
// ("input": the settings action it takes, as G for throwing) always names it,
// because that one is not the plain use click.
import { keyName } from './settingsRows.js';

const USED = 'prompts_used'; // progress value: things used so far (it stops counting at LEARN)
export const LEARN = 3;

// One more thing used (player/interact.js calls it on every use).
export function countUse(progress) {
  const used = progress.getValue(USED, 0);
  if (used < LEARN) progress.setValue(USED, used + 1);
}

// The key to put before the prompt's words, or null for the words alone.
export function promptKey(game, prompt) {
  const keys = game.settings.get('keys');
  if (prompt.input) return keyName(keys[prompt.input]);
  return game.progress.getValue(USED, 0) < LEARN ? keyName(keys.use) : null;
}
