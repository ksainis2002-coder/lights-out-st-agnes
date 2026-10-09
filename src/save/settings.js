// Player settings, stored as versioned JSON separate from game saves.
// DEFAULTS are proposals until the owner locks them at 0.2. After that,
// changing a default needs a SETTINGS_VERSION bump and a migration.

import { migrate } from './migrate.js';

export const SETTINGS_VERSION = 1;
export const SETTINGS_MIGRATIONS = {};

export const DEFAULT_KEYS = {
  forward: 'KeyW',
  back: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  run: 'ShiftLeft',
  crouch: 'ControlLeft',
  leanLeft: 'KeyQ',
  leanRight: 'KeyE',
  holdBreath: 'Space',
  flashlight: 'KeyF',
  camcorder: 'KeyC',
  journal: 'KeyJ',
  use: 'Mouse0',
  inventory: 'Tab',
  combine: 'KeyR',
};

export const DEFAULT_SETTINGS = {
  language: 'en',
  difficulty: 'normal',
  comfortMode: false,
  fov: 70,
  mouseSensitivity: 1,
  invertY: false,
  keys: DEFAULT_KEYS,
  volume: { music: 0.8, effects: 0.8, voices: 0.8 },
  subtitles: true,
  reduceEffects: false,
  flickerOff: false,
};

const RULES = {
  language: (v) => ['en', 'el'].includes(v),
  difficulty: (v) => ['story', 'normal', 'hard'].includes(v),
  comfortMode: (v) => typeof v === 'boolean',
  fov: (v) => Number.isFinite(v) && v >= 50 && v <= 110,
  mouseSensitivity: (v) => Number.isFinite(v) && v >= 0.1 && v <= 5,
  invertY: (v) => typeof v === 'boolean',
  subtitles: (v) => typeof v === 'boolean',
  reduceEffects: (v) => typeof v === 'boolean',
  flickerOff: (v) => typeof v === 'boolean',
};

const isVolume = (v) => Number.isFinite(v) && v >= 0 && v <= 1;

// Keeps every valid stored value and replaces anything missing or invalid
// with its default, so a damaged settings file never blocks the game.
export function sanitize(stored) {
  const clean = structuredClone(DEFAULT_SETTINGS);
  for (const [name, isValid] of Object.entries(RULES)) {
    if (isValid(stored?.[name])) clean[name] = stored[name];
  }
  for (const channel of Object.keys(clean.volume)) {
    if (isVolume(stored?.volume?.[channel])) clean.volume[channel] = stored.volume[channel];
  }
  for (const action of Object.keys(clean.keys)) {
    const code = stored?.keys?.[action];
    if (typeof code === 'string' && code) clean.keys[action] = code;
  }
  return clean;
}

export function createSettings(store, { migrations = SETTINGS_MIGRATIONS, version = SETTINGS_VERSION } = {}) {
  const listeners = new Set();
  let current = loadFrom(store, migrations, version);

  function set(name, value) {
    const next = sanitize({ ...current, [name]: value });
    if (JSON.stringify(next[name]) !== JSON.stringify(value)) throw new Error(`Invalid value for setting "${name}".`);
    current = next;
    applyLinked(name, value);
    persist();
    listeners.forEach((fn) => fn(name, current));
  }

  // Owner decision: turning comfort mode on also turns on reduce effects and
  // flicker off. Both can be turned back off by hand afterwards.
  function applyLinked(name, value) {
    if (name === 'comfortMode' && value === true) {
      current.reduceEffects = true;
      current.flickerOff = true;
    }
  }

  function reset() {
    current = structuredClone(DEFAULT_SETTINGS);
    persist();
    listeners.forEach((fn) => fn(null, current));
  }

  function persist() {
    store.write('settings', { version, values: current });
  }

  return {
    get: (name) => structuredClone(current[name]),
    all: () => structuredClone(current),
    set,
    reset,
    onChange: (fn) => listeners.add(fn),
  };
}

function loadFrom(store, migrations, version) {
  const raw = store.read('settings', (data) => typeof data?.values === 'object');
  if (!raw) return structuredClone(DEFAULT_SETTINGS);
  try {
    return sanitize(migrate(raw, migrations, version).values);
  } catch {
    return structuredClone(DEFAULT_SETTINGS);
  }
}
