// One-time tutorial lines, queued as notices after the thing they explain.
// Keys are named from the player's settings, so rebinding stays correct.
import { keyName } from './ui/settingsRows.js';

const TOOLS = {
  flashlight: [
    { key: 'tutorial.flashlight.toggle', seconds: 6, params: (keys) => ({ key: keyName(keys.flashlight) }) },
    { key: 'tutorial.flashlight.dark', seconds: 6 },
  ],
};

// The first thing that goes in the pockets explains the inventory strip.
const FIRST_ITEM = { key: 'tutorial.inventory', seconds: 6, params: (keys) => ({ open: keyName(keys.inventory), use: keyName(keys.use) }) };

export function setupTutorial(game) {
  game.events.on('item.taken', (pickup) => {
    const keys = game.settings.get('keys');
    const lines = [...(TOOLS[pickup.item] ?? [])];
    if (game.inventory.has(pickup.item) && !game.progress.hasFlag('tutorial_inventory')) {
      game.progress.setFlag('tutorial_inventory');
      lines.push(FIRST_ITEM);
    }
    for (const line of lines) game.messages.notice(line.key, line.params?.(keys), line.seconds);
  });
}
