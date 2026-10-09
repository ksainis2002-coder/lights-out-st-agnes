// Every item the player can carry. Names and descriptions live in i18n as
// item.<id>.name / item.<id>.desc. "consumed" items are used up when used.

export const ITEMS = {
  office_key: { icon: 'key', consumed: true },
  linen_key: { icon: 'key', consumed: true },
  music_box_crank: { icon: 'crank' },
  pills: { icon: 'pills', consumed: true },
  battery: { icon: 'battery', consumed: true },
  toy_horse: { icon: 'horse' },
};

export const INVENTORY_SLOTS = 8;
