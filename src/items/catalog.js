// Every item the player can carry. Names and descriptions live in i18n as
// item.<id>.name / item.<id>.desc. "consumed" items are used up when used.
// Families of items share one definition: "plate_TOMMY" is a name plate
// (item.plate.name with {name}).

// Tools ("tool": true) are carried without taking a slot: picking one up
// sets the progress flag tool_<id>.
export const ITEMS = {
  // card: a "new item" card the first time it is picked up (usable items only).
  flashlight: { icon: 'torch', tool: true, card: true },
  camcorder: { icon: 'camcorder', tool: true, card: true }, // Nora's, found upstairs in the west wing
  office_key: { icon: 'key', consumed: true },
  linen_key: { icon: 'key', consumed: true },
  music_box_crank: { icon: 'crank' },
  pills: { icon: 'pills', consumed: true, card: true },
  battery: { icon: 'battery', consumed: true, card: true },
  toy_horse: { icon: 'horse' },
  toy_ball: { icon: 'ball' },
  toy_doll: { icon: 'doll' },
  toy_top: { icon: 'top' },
  statue_piece: { icon: 'statue' },
  stone_lamb: { icon: 'lamb' }, // statue piece 2 (wing 2)
  headmaster_key: { icon: 'key', consumed: true },
  gate_key: { icon: 'key', consumed: true },
  matches: { icon: 'matches' },
  skipping_rope: { icon: 'rope' },
  nora_tape: { icon: 'tape' }, // her tape 2: plays on the day room television (part B2)
  fuse: { icon: 'fuse' }, // the west wing's fuse board takes them, one a socket (puzzles/wardFuses.js)
  fuse_large: { icon: 'fuseLarge' }, // the heavy one, for the stairs' socket
  music_box_cylinder: { icon: 'cylinder' }, // a part of Edith's music box
  music_box_case: { icon: 'boxCase' }, // another
  music_box_key: { icon: 'key' }, // the third, from Sister M.'s trunk
  sister_key: { icon: 'key', consumed: true }, // the night sister's door (Dr. Venn kept it)
  stone_palm: { icon: 'palm' }, // statue piece 3 (wing 3)
  stone_heart: { icon: 'heart' }, // statue piece 4 (wing 4: the crypt, puzzles/plaques.js)
  music_box: { icon: 'musicBox' }, // Edith's, mended: wing 3's toy (ghosts/edithBox.js)
};

const FAMILIES = { plate: { icon: 'plate' } };

export const INVENTORY_SLOTS = 8;

// Definition of an item id, including family items like "plate_TOMMY".
export function itemDef(id) {
  if (ITEMS[id]) return ITEMS[id];
  const [family] = id.split('_');
  return FAMILIES[family] && id.length > family.length + 1 ? FAMILIES[family] : null;
}

// Player-facing name and description of an item, through i18n.
// The i18n key of an item's short line (shown while looking at it).
export function itemShortKey(id) {
  const family = Object.keys(FAMILIES).find((name) => id.startsWith(`${name}_`));
  return family ? `item.${family}.short` : `item.${id}.short`;
}

export function itemText(i18n, id, part = 'name') {
  if (ITEMS[id]) return i18n.t(`item.${id}.${part}`);
  const [family, ...rest] = id.split('_');
  return i18n.t(`item.${family}.${part}`, { name: rest.join('_') });
}
