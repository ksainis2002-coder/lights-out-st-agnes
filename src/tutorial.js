// One-time tutorial lines, queued as notices after the thing they explain.
// Keys are named from the player's settings, so rebinding stays correct.
import { keyName } from './ui/settingsRows.js';

const TOOLS = {
  flashlight: [
    { key: 'tutorial.flashlight.toggle', seconds: 6, params: (keys) => ({ key: keyName(keys.flashlight) }) },
    { key: 'tutorial.flashlight.dark', seconds: 6 },
  ],
};

export function setupTutorial(game) {
  game.events.on('item.taken', (pickup) => {
    const keys = game.settings.get('keys');
    for (const line of TOOLS[pickup.item] ?? []) game.messages.notice(line.key, line.params?.(keys), line.seconds);
  });
}
