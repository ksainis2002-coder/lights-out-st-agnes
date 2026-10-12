// One-time tutorial lines for every control, each shown once per run at the
// moment it first matters, queued as notices so they never cut each other
// off. ENTER skips a line. The basics (walk, look, pause, run, crouch, lean)
// play right after the intro, and the patient room door waits for them.
// Keys are named from the player's settings, so rebinding stays right.
import { keyName } from './ui/settingsRows.js';
import { itemDef } from './items/catalog.js';

const LINE_SECONDS = 5;

// id → lines; params(keys) names the keys in each line.
const LESSONS = {
  move: [
    { key: 'tutorial.move', params: (k) => ({ keys: [k.forward, k.left, k.back, k.right].map(keyName).join(' ') }) },
    { key: 'tutorial.pause' },
  ],
  moveMore: [
    { key: 'tutorial.run', params: (k) => ({ key: keyName(k.run) }) },
    { key: 'tutorial.crouch', params: (k) => ({ key: keyName(k.crouch) }) },
    { key: 'tutorial.lean', params: (k) => ({ left: keyName(k.leanLeft), right: keyName(k.leanRight) }) },
  ],
  use: [{ key: 'tutorial.use', params: (k) => ({ key: keyName(k.use) }) }],
  save: [{ key: 'tutorial.save' }],
  inventory: [{ key: 'tutorial.inventory', params: (k) => ({ open: keyName(k.inventory), use: keyName(k.use) }) }],
  journal: [{ key: 'tutorial.journal', params: (k) => ({ journal: keyName(k.journal), hold: keyName(k.hold) }) }],
  map: [{ key: 'tutorial.map', params: (k) => ({ key: keyName(k.map) }) }],
};

export function setupTutorial(game) {
  const { events, progress } = game;

  // Teaches a lesson unless this run has already seen it.
  function teach(id, tag = 'tutorial') {
    if (progress.hasFlag(`tutorial_${id}`)) return;
    progress.setFlag(`tutorial_${id}`);
    const keys = game.settings.get('keys');
    for (const line of LESSONS[id]) game.messages.notice(line.key, line.params?.(keys), LINE_SECONDS, tag);
  }

  events.on('intro.finished', () => {
    teach('move', 'basics');
    teach('moveMore', 'basics');
  });
  events.on('document.read', () => teach('journal'));
  events.on('map.taken', () => teach('map'));
  // Usable items get a "new item" card the first time (ui/screens/itemCard.js),
  // which says how to use them; the first item in the pockets explains TAB.
  events.on('item.taken', (pickup) => {
    if (itemDef(pickup.item).card && !progress.hasFlag(`card_${pickup.item}`)) {
      progress.setFlag(`card_${pickup.item}`);
      game.openScreen('itemCard', { item: pickup.item });
    }
    if (game.inventory.has(pickup.item)) teach('inventory');
  });

  // Called every playing frame: ENTER skips a line; the first usable thing
  // in view explains "use".
  function update() {
    if (game.input.wasCodePressed('Enter')) game.messages.skip();
    const prompt = game.interaction.target()?.prompt();
    if (!prompt) return;
    teach('use');
    if (prompt.key === 'prompt.save') teach('save');
  }

  return { update, basicsPending: () => game.messages.pending('basics') };
}
