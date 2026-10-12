// Flashlight battery (brief: batteries are scarce). The charge runs down
// while the light is on; at zero the light dies and will not come back on
// until a new battery is swapped in from the inventory.
const LIFE = 480; // seconds of light per battery (owner: 10 minutes never ran out)
const SHOW_AFTER_TOGGLE = 3; // seconds the HUD cell shows after F
export const LOW = 0.25;

export function createBattery(game) {
  let charge = 1;
  let shownFor = 0;
  game.events.on('flashlight.toggled', () => (shownFor = SHOW_AFTER_TOGGLE));

  return {
    charge: () => charge,
    canLight: () => charge > 0,
    // On screen the whole time the flashlight is on, briefly after it goes off,
    // and while it is dead with a spare battery in the pockets.
    visible: () => game.world.flashlight.isOn() || shownFor > 0 || (charge <= 0 && game.inventory.has('battery')),
    update(dt) {
      shownFor = Math.max(0, shownFor - dt);
      if (!game.world.flashlight.isOn() || charge <= 0) return;
      charge = Math.max(0, charge - dt / LIFE);
      if (charge > 0) return;
      game.world.flashlight.setOn(false);
      shownFor = SHOW_AFTER_TOGGLE; // the empty cell, briefly
      game.messages.show('msg.batteryDead', null, 4);
      game.events.emit('battery.dead');
    },
    // Swaps in a fresh battery; refuses while the old one is still good.
    replace() {
      if (charge > 0.9) {
        game.messages.show('msg.batteryFull');
        return false;
      }
      charge = 1;
      shownFor = SHOW_AFTER_TOGGLE;
      game.messages.show('msg.batteryIn');
      game.events.emit('battery.replaced');
      return true;
    },
    set(value) {
      charge = Math.min(1, Math.max(0, value));
    },
  };
}
