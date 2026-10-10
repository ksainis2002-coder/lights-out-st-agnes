// Every item the player can carry. Names and descriptions live in i18n as
// item.<id>.name / item.<id>.desc. "consumed" items are used up when used.
// Families of items share one definition: "plate_TOMMY" is a name plate
// (item.plate.name with {name}).

export const ITEMS = {
  office_key: { icon: 'key', consumed: true },
  linen_key: { icon: 'key', consumed: true },
  music_box_crank: { icon: 'crank' },
  pills: { icon: 'pills', consumed: true },
  battery: { icon: 'battery', consumed: true },
  toy_horse: { icon: 'horse' },
  toy_ball: { icon: 'ball' },
  toy_doll: { icon: 'doll' },
  toy_top: { icon: 'top' },
  statue_piece: { icon: 'statue' },
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
export function itemText(i18n, id, part = 'name') {
  if (ITEMS[id]) return i18n.t(`item.${id}.${part}`);
  const [family, ...rest] = id.split('_');
  return i18n.t(`item.${family}.${part}`, { name: rest.join('_') });
}
