// Painted signs whose words follow the game's language: a prop with
// "sign": "<i18n key>" has its text (lines split at "\n") written on it when
// the level loads and when the language changes.
//   { "type": "wallSign", "id": "lights_out_sign", "sign": "sign.lightsOut" }
import { findProp } from '../props/place.js';

export function createSigns(game) {
  function write() {
    const level = game.world.level;
    for (const prop of level.props) {
      if (!prop.sign || !prop.id) continue;
      findProp(game.world.scene, prop.id)?.userData.write?.(game.i18n.t(prop.sign).split('\n'));
    }
  }
  game.events.on('level.loaded', write);
  game.events.on('language.changed', write);
  return { write };
}
