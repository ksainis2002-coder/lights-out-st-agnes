// The sanity meter (0–100, hidden: shown only through effects and the debug
// overlay). Darkness drains it, faster with the flashlight off; light slowly
// restores it up to LIGHT_CAP; safe rooms (the patient room) restore it fully.
// Other systems call drain(amount, cause) for one-off hits (ghost children).

export const MAX = 100;
const LIGHT_CAP = 60;
const RATES = {
  dark: 1.2, // per second in full darkness, flashlight off
  darkWithFlashlight: 0.3,
  lightRecovery: 0.3,
  safeRecovery: 3,
};
const DIFFICULTY = { story: 0.5, normal: 1, hard: 1.3 };

// How lit the player's spot is, 0 (pitch black) … 1+ (well lit), from the level's lights.
export function lightAt(level, position) {
  let light = 0;
  for (const l of level.lights) {
    const dx = l.at[0] * level.cellSize - position.x;
    const dz = l.at[1] * level.cellSize - position.z;
    const distance = l.distance ?? 8;
    light += Math.max(0, 1 - Math.hypot(dx, dz) / distance) * ((l.intensity ?? 3) / 3);
  }
  return light;
}

// How the player feels, for the journal (owner decision: effects + journal line).
export function feeling(value) {
  if (value >= 75) return 'calm';
  if (value >= 50) return 'uneasy';
  if (value >= 25) return 'shaking';
  return 'fallingApart';
}

export function createSanity(game) {
  let value = MAX;
  let rate = 0;
  let lastCause = 'dark';

  function update(dt) {
    const { world, player, settings } = game;
    const level = world.level;
    const scale = DIFFICULTY[settings.get('difficulty')] ?? 1;
    if (level.safe) {
      rate = RATES.safeRecovery;
    } else {
      const light = lightAt(level, player.state.position);
      const darkness = Math.max(0, 1 - light);
      const flashlightOn = world.flashlight.isOn();
      rate = -darkness * (flashlightOn ? RATES.darkWithFlashlight : RATES.dark) * scale;
      if (light > 0.8 && value < LIGHT_CAP) rate = RATES.lightRecovery;
      if (rate < 0) lastCause = 'dark';
    }
    const cap = level.safe ? MAX : Math.max(value, LIGHT_CAP);
    value = Math.max(0, Math.min(cap, value + rate * dt));
    if (value <= 0) game.events.emit('sanity.empty', lastCause);
  }

  return {
    update,
    value: () => value,
    rate: () => rate,
    lastCause: () => lastCause,
    drain(amount, cause) {
      const scale = DIFFICULTY[game.settings.get('difficulty')] ?? 1;
      value = Math.max(0, value - amount * scale);
      lastCause = cause;
    },
    restore(amount) {
      value = Math.min(MAX, value + amount);
    },
    set(v) {
      value = Math.max(0, Math.min(MAX, v));
    },
  };
}
