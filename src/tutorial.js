// One-time tutorial lines for every control, each shown once per run at the
// moment it first matters, queued as notices so they never cut each other
// off. Keys are named from the player's settings, so rebinding stays right.
import { keyName } from './ui/settingsRows.js';

const LINE_SECONDS = 5;
const WALK_BEFORE_MORE = 3; // metres walked before run/crouch/lean are explained

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
  flashlight: [
    { key: 'tutorial.flashlight.toggle', params: (k) => ({ key: keyName(k.flashlight) }) },
    { key: 'tutorial.flashlight.dark' },
  ],
  inventory: [{ key: 'tutorial.inventory', params: (k) => ({ open: keyName(k.inventory), use: keyName(k.use) }) }],
  journal: [{ key: 'tutorial.journal', params: (k) => ({ journal: keyName(k.journal), hold: keyName(k.hold) }) }],
  map: [{ key: 'tutorial.map', params: (k) => ({ key: keyName(k.map) }) }],
};

export function setupTutorial(game) {
  const { events, progress } = game;
  let walked = 0;
  let last = null;

  // Teaches a lesson unless this run has already seen it.
  function teach(id) {
    if (progress.hasFlag(`tutorial_${id}`)) return;
    progress.setFlag(`tutorial_${id}`);
    const keys = game.settings.get('keys');
    for (const line of LESSONS[id]) game.messages.notice(line.key, line.params?.(keys), LINE_SECONDS);
  }

  events.on('intro.finished', () => teach('move'));
  events.on('document.read', () => teach('journal'));
  events.on('map.taken', () => teach('map'));
  events.on('item.taken', (pickup) => {
    if (pickup.item === 'flashlight') teach('flashlight');
    if (game.inventory.has(pickup.item)) teach('inventory');
  });

  // Called every playing frame: walking and the first usable thing in view.
  function update() {
    const { position } = game.player.state;
    if (last) walked += Math.hypot(position.x - last.x, position.z - last.z);
    last = { x: position.x, z: position.z };
    if (walked > WALK_BEFORE_MORE) teach('moveMore');
    const prompt = game.interaction.target()?.prompt();
    if (!prompt) return;
    teach('use');
    if (prompt.key === 'prompt.save') teach('save');
  }

  events.on('level.loaded', () => (last = null));
  return { update };
}
