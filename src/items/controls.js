// Player controls for items while playing: TAB opens the inventory strip
// (the game keeps running), ◀▶, the mouse wheel or 1–8 pick a slot, the use
// key applies the selected item to what you look at, R combines, J opens the
// journal, B swaps in a fresh flashlight battery at any time.

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

  // B: a fresh battery from the pockets; a dead light comes back on with it.
  function swapBattery() {
    if (!game.progress.hasFlag('tool_flashlight')) return;
    if (!inventory.has('battery')) return messages.show('msg.noBattery');
    const wasDead = !game.battery.canLight();
    game.itemEffects.battery();
    if (wasDead && game.battery.canLight()) game.world.flashlight.setOn(true);
  }

  game.updateItems = () => {
    if (input.wasPressed('journal')) return game.openScreen('journal');
    if (input.wasPressed('map')) return game.openScreen('journal', { tab: 'maps' });
    if (input.wasPressed('hold') && game.journal.held()) game.journal.hold(null);
    if (input.wasPressed('battery')) swapBattery();
    if (input.wasPressed('inventory')) inventory.setOpen(!inventory.isOpen());
    if (!inventory.isOpen()) return;
    for (let n = 1; n <= 8; n++) if (input.wasCodePressed(`Digit${n}`)) inventory.select(n - 1);
    if (input.wasCodePressed('ArrowRight')) inventory.select(inventory.selectedIndex() + 1);
    if (input.wasCodePressed('ArrowLeft')) inventory.select(inventory.selectedIndex() - 1);
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
