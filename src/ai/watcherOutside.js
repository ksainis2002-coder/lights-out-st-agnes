// The watcher outside (design 0.3: she hunts "outside once the storm starts";
// approved stills watcher_storm and watcher_chapel). Before the storm the
// grounds are hers only as the still statue in the courtyard. Once it is on,
// with her awake and the lamb still in its grave: go into the cemetery and
// she comes in by its gate behind you, unseen, her stone grinding there (a
// lightning flash shows her in the gateway); from then she hunts the
// courtyard and the cemetery, and follows you in and out as on the stairs.
// Take the lamb and, the moment nobody is looking, she is at the chapel
// door, facing it, still; she hunts nowhere after that (her floor: "chapel").
// Level data, "watcher": "from": "<flag>" (the storm), "outside": { "room": "cemetery",
//   "gateway": [c, r], "lamb": "<pickup>", "chapel": { "at": [c, r], "rotation": 0 } };
// the chapel statue is also a "still" with "afterTaken", so it is there on every load.
import * as THREE from 'three';
import { AWAKE, FLOOR } from './watcher.js';
import { gazeOn } from './gaze.js';
import { roomAt } from '../levels/loader.js';

const CLEAR = 4; // metres: she never comes in on top of you
const SAMPLE_HEIGHTS = [1.95, 1.2, 0.5]; // as her own gaze points (head, body, plinth)
export const AT_CHAPEL = 'chapel';

export function createWatcherOutside(game, watcher) {
  const outside = () => game.world.level.watcher?.outside ?? null;
  const spot = ([col, row]) => new THREE.Vector3(col * game.world.level.cellSize, 0, row * game.world.level.cellSize);
  const unseen = (point) => !gazeOn(game, SAMPLE_HEIGHTS.map((y) => point.clone().setY(y)), point).seen;

  // She comes in through the gate while you are among the graves.
  function comeIn(data) {
    const { progress } = game;
    const level = game.world.level;
    if (!progress.hasFlag(AWAKE) || !progress.hasFlag(level.watcher.from) || progress.isTaken(data.lamb)) return;
    if (progress.getValue(FLOOR) === level.id || watcher.state().mode) return;
    const p = game.player.state.position;
    if (roomAt(level, p) !== data.room) return;
    const gate = spot(data.gateway);
    if (Math.hypot(gate.x - p.x, gate.z - p.z) < CLEAR || !unseen(gate)) return;
    watcher.arrive(data.gateway);
    game.events.emit('watcher.moved', { position: gate }); // her stone grinds in the gateway
    game.events.emit('watcher.outside');
  }

  // With the lamb gone from the grave, she goes to the chapel door, unseen.
  function goToChapel(data) {
    const { progress } = game;
    if (!progress.isTaken(data.lamb) || progress.getValue(FLOOR) === AT_CHAPEL) return;
    const her = watcher.position();
    if (her && !unseen(her)) return;
    progress.setValue(FLOOR, AT_CHAPEL);
    watcher.standStill(data.chapel.at, data.chapel.rotation);
    game.events.emit('watcher.chapel', { position: spot(data.chapel.at) }); // the chapel bell tolls
  }

  function update() {
    const data = outside();
    if (!data || game.isTravelling?.()) return;
    comeIn(data);
    goToChapel(data);
  }

  function debugLine() {
    const data = outside();
    if (!data) return 'OUTSIDE  -';
    const { progress } = game;
    if (progress.getValue(FLOOR) === AT_CHAPEL) return 'OUTSIDE  she stands at the chapel door';
    if (!progress.hasFlag(game.world.level.watcher.from)) return `OUTSIDE  waits for ${game.world.level.watcher.from}`;
    return progress.getValue(FLOOR) === game.world.level.id ? 'OUTSIDE  she hunts out here' : `OUTSIDE  she comes in by the gate once you are in the ${data.room}`;
  }

  return { update, debugLine };
}
