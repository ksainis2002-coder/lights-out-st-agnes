// The watcher between floors (design 0.3: she "follows you between floors
// about 20 s later if she was close (her grind on the stairs first)"). Take
// the stairs while she hunts within 12 m of you and she comes after you: 16 s
// after you arrive her stone grinds on those stairs, and from 20 s she stands
// at their head (or their foot) as soon as nobody is looking there and you
// are not on the spot; she only moves unseen. Leave that floor before she
// gets there and she stays where she was. Not close: she keeps to her floor,
// and you find her there when you go back (her floor is saved, ai/watcher.js).
// Level data, "watcher": "arrivals": { "<spawn>": [c, r] }: where she comes
// off each stairs on this floor, by the spawn name of those stairs.
import * as THREE from 'three';
import { LEVELS } from '../levels/index.js';
import { gazeOn } from './gaze.js';

const FOLLOW_RANGE = 12; // metres
const GRIND_AT = 16; // seconds after you arrive
const ARRIVE_AT = 20;
const CLEAR = 2.5; // metres: she never arrives on top of you
const SAMPLE_HEIGHTS = [1.95, 1.2, 0.5]; // as her own gaze points (head, body, plinth)

export function createWatcherFloors(game, watcher) {
  let follow = null; // { level, at: [c, r], t, grinded }

  function leaving({ id, spawn }) {
    follow = null;
    const her = watcher.position();
    const at = LEVELS[id]?.watcher?.arrivals?.[spawn];
    if (!her || !at || watcher.state().mode !== 'hunting') return;
    const p = game.player.state.position;
    if (Math.hypot(her.x - p.x, her.z - p.z) <= FOLLOW_RANGE) follow = { level: id, at, t: 0, grinded: false };
  }

  function update(dt) {
    if (!follow || game.world.level.id !== follow.level) return;
    follow.t += dt;
    const size = game.world.level.cellSize;
    const spot = new THREE.Vector3(follow.at[0] * size, 0, follow.at[1] * size);
    if (!follow.grinded && follow.t >= GRIND_AT) {
      follow.grinded = true;
      game.events.emit('watcher.moved', { position: spot.clone() }); // on the stairs, out of sight
    }
    if (follow.t < ARRIVE_AT) return;
    const p = game.player.state.position;
    if (Math.hypot(spot.x - p.x, spot.z - p.z) < CLEAR) return;
    if (gazeOn(game, SAMPLE_HEIGHTS.map((y) => spot.clone().setY(y)), spot).seen) return;
    watcher.arrive(follow.at);
    follow = null;
    game.events.emit('watcher.followed');
  }

  game.events.on('level.leaving', leaving);
  game.events.on('level.loaded', (level) => {
    if (follow && follow.level !== level.id) follow = null;
  });
  game.events.on('game.stopped', () => (follow = null));

  return {
    update,
    following: () => (follow ? { level: follow.level, in: Math.max(0, ARRIVE_AT - follow.t) } : null),
    debugLine: () => `FLOORS  she hunts ${game.progress.getValue('watcher_floor', '-')}${follow ? `, following you: ${Math.max(0, ARRIVE_AT - follow.t).toFixed(0)}s` : ''}`,
  };
}
