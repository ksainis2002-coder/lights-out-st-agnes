// Everything the player has changed in the world, as plain data for saves:
// picked-up items, read documents, unlocked and open doors, story flags.

export function createProgress() {
  let data = { taken: [], read: [], unlocked: [], open: [], flags: [], values: {} };
  const has = (list, id) => data[list].includes(id);
  const add = (list, id) => {
    if (!has(list, id)) data[list].push(id);
  };
  const drop = (list, id) => {
    data[list] = data[list].filter((x) => x !== id);
  };

  return {
    isTaken: (id) => has('taken', id),
    take: (id) => add('taken', id),
    isRead: (id) => has('read', id),
    read: (id) => add('read', id),
    isUnlocked: (id) => has('unlocked', id),
    unlock: (id) => add('unlocked', id),
    isOpen: (id) => has('open', id),
    setOpen: (id, open) => (open ? add('open', id) : drop('open', id)),
    hasFlag: (id) => has('flags', id),
    setFlag: (id) => add('flags', id),
    // Puzzle state and other small values (plates on beds, toys in cubbies).
    getValue: (key, fallback = null) => (key in data.values ? structuredClone(data.values[key]) : fallback),
    setValue: (key, value) => {
      data.values[key] = structuredClone(value);
    },
    toJSON: () => structuredClone(data),
    load(saved) {
      data = { taken: [], read: [], unlocked: [], open: [], flags: [], values: {}, ...structuredClone(saved ?? {}) };
    },
  };
}
