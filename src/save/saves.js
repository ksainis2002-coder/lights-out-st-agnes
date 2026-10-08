// Game save slots: three manual slots (tape recorders) and one autosave
// (checkpoints). Every save is a versioned envelope:
//   { version, savedAt, meta: { wing, playTime }, state: { ... } }
// Bump SAVE_VERSION and add MIGRATIONS[old] for every format change.

import { migrate, NewerVersionError } from './migrate.js';

export const SAVE_VERSION = 1;
export const MANUAL_SLOTS = ['slot1', 'slot2', 'slot3'];
export const AUTO_SLOT = 'auto';
export const ALL_SLOTS = [...MANUAL_SLOTS, AUTO_SLOT];

// MIGRATIONS[n]: version n -> n + 1. Version 1 is the first format.
export const MIGRATIONS = {};

const slotKey = (slot) => `save.${slot}`;

function assertSlot(slot) {
  if (!ALL_SLOTS.includes(slot)) throw new Error(`Unknown save slot "${slot}".`);
}

export function isValidSave(data) {
  return (
    data !== null &&
    typeof data === 'object' &&
    typeof data.savedAt === 'string' &&
    typeof data.meta === 'object' &&
    data.meta !== null &&
    typeof data.state === 'object' &&
    data.state !== null
  );
}

export function createSaves(store, { migrations = MIGRATIONS, version = SAVE_VERSION, now = () => new Date() } = {}) {
  function save(slot, state, meta = {}) {
    assertSlot(slot);
    const envelope = { version, savedAt: now().toISOString(), meta: { ...meta }, state };
    store.write(slotKey(slot), envelope);
    return envelope;
  }

  // Loads and migrates a slot. Falls back to the backup copy if the main copy
  // is broken. Returns null when the slot is empty or unreadable.
  function load(slot) {
    assertSlot(slot);
    let newer = null;
    const accept = (raw) => {
      try {
        return isValidSave(migrate(raw, migrations, version));
      } catch (err) {
        if (err instanceof NewerVersionError) newer = err;
        return false;
      }
    };
    const raw = store.read(slotKey(slot), accept);
    if (raw) return migrate(raw, migrations, version);
    if (newer) throw newer;
    return null;
  }

  function list() {
    return ALL_SLOTS.map((slot) => {
      const data = safeLoad(slot);
      return { slot, empty: !data, savedAt: data?.savedAt ?? null, meta: data?.meta ?? null };
    });
  }

  function safeLoad(slot) {
    try {
      return load(slot);
    } catch {
      return null;
    }
  }

  function remove(slot) {
    assertSlot(slot);
    store.remove(slotKey(slot));
  }

  const autosave = (state, meta) => save(AUTO_SLOT, state, meta);

  return { save, load, list, remove, autosave };
}
