// Player controls for items while playing: TAB opens the inventory strip
// (the game keeps running), mouse wheel or 1–8 pick a slot, the use key
// applies the selected item to what you look at, R combines, J opens the
// journal.

export function setupInventoryControls(game) {
  const { inventory, input, messages } = game;
  let wheel = 0;

  document.addEventListener('wheel', (event) => {
    if (game.mode === 'playing' && inventory.isOpen()) wheel += Math.sign(event.deltaY);
  }, { passive: true });

  // Item used on the thing in view; a target accepts it with useItem(id).
  function applySelected() {
    const item = inventory.selectedItem();
    if (!item) return;
    const target = game.interaction.target();
    if (target?.useItem?.(item)) return;
    game.events.emit('item.used', item);
    if (!game.itemEffects?.[item]?.()) messages.show('msg.nothing');
  }

  game.updateItems = () => {
    if (input.wasPressed('journal')) return game.openScreen('journal');
    if (input.wasPressed('inventory')) inventory.setOpen(!inventory.isOpen());
    if (!inventory.isOpen()) return;
    for (let n = 1; n <= 8; n++) if (input.wasCodePressed(`Digit${n}`)) inventory.select(n - 1);
    if (wheel) {
      inventory.select(inventory.selectedIndex() + wheel);
      wheel = 0;
    }
    if (input.wasPressed('combine')) messages.show('msg.cannotCombine');
    if (input.wasPressed('use')) {
      input.consume(game.settings.get('keys').use); // the click is for the item, not the world
      applySelected();
    }
  };
}
