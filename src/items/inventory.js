// What the player carries: up to 8 items in order, one selected.
// Plain data so saves can store it (toJSON / load).
import { ITEMS, INVENTORY_SLOTS } from './catalog.js';

export function createInventory(events) {
  let items = [];
  let selected = 0;
  let open = false;

  function add(id) {
    if (!ITEMS[id]) throw new Error(`Unknown item "${id}"`);
    if (items.length >= INVENTORY_SLOTS) return false;
    items.push(id);
    events.emit('item.added', id);
    return true;
  }

  function remove(id) {
    const index = items.indexOf(id);
    if (index < 0) return false;
    items.splice(index, 1);
    selected = Math.min(selected, Math.max(0, items.length - 1));
    events.emit('item.removed', id);
    return true;
  }

  return {
    add,
    remove,
    has: (id) => items.includes(id),
    items: () => [...items],
    selectedItem: () => items[selected] ?? null,
    selectedIndex: () => selected,
    select(index) {
      if (items.length) selected = (index + items.length) % items.length;
    },
    isOpen: () => open,
    setOpen(value) {
      open = value;
      events.emit(open ? 'inventory.opened' : 'inventory.closed');
    },
    toJSON: () => ({ items: [...items] }),
    load(data) {
      items = (data?.items ?? []).filter((id) => ITEMS[id]);
      selected = 0;
    },
  };
}
