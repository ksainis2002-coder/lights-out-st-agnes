// Props that change as the story goes on, at once (not only on the next
// load, as "after" / "until" do, levels/changes.js):
//   { "type": "candle", "id": "sister_candle", "litUntil": { "taken": "stone_palm" } }
// burns until that pickup is taken (or { "flag": "..." } is set), then goes
// out by itself: the candle in Sister M.'s room as you lift the stone palm.
// Going out while you watch: its line ("outMessage") and the snuff
// (event candle.out). Checked each step, and on every load.
import * as THREE from 'three';
import { findProp } from '../props/place.js';

const holds = (game, when) => (when.taken ? game.progress.isTaken(when.taken) : game.progress.hasFlag(when.flag));

export function createFlagProps(game) {
  let watched = []; // { prop, object, lit }

  function setUp(level) {
    watched = level.props.filter((prop) => prop.litUntil && prop.id).map((prop) => {
      const object = findProp(game.world.levelGroup, prop.id);
      const lit = !holds(game, prop.litUntil);
      object?.userData.setLit?.(lit);
      return { prop, object, lit };
    });
  }

  function update() {
    for (const entry of watched) {
      if (!entry.lit || !holds(game, entry.prop.litUntil)) continue;
      entry.lit = false;
      entry.object?.userData.setLit?.(false);
      const position = new THREE.Vector3();
      entry.object?.getWorldPosition(position);
      if (entry.prop.outMessage) game.messages.show(entry.prop.outMessage, null, 4);
      game.events.emit('candle.out', { id: entry.prop.id, position: position.setY(position.y + 0.7) });
    }
  }

  game.events.on('level.loaded', setUp);
  return { update };
}
