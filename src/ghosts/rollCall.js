// The roll call (design 0.3, approved still "roll_call"): in Classroom 3 the
// lamps die (the tell), and in the dark every desk but one fills with a faint
// pupil, blurred face and black eyes, facing the board. Then they all turn
// to look at you. The lamps come back and the desks are empty. The desk left
// empty, the nearest the door, is Tommy's (owner: keep it). Ghost children:
// they never touch you, only cost a little sanity (scare rules §2, §4).
// Data: "seats": [[col, row, rotation], …] (every desk but his).
import { PROPS } from '../props/catalog.js';
import { roomDarkness, dyingAt, worldAt } from './setPieceKit.js';

const OPACITY = 0.42;
const FILL_AT = 0.2; // seconds after the lamps die
const TURN_AT = 1.6;
const TURN_FOR = 0.35;
const LIGHT_AT = 3.6;
const LINGER = 0.4;

export function rollCallPiece(game, event) {
  const tell = event.setup?.seconds ?? 1.0;
  const darkness = roomDarkness(game, event.room);
  let pupils = null; // [{ object, head, facing, to }]

  function fill() {
    const { level, levelGroup, textures } = game.world;
    pupils = event.seats.map(([col, row, rotation]) => {
      const object = PROPS.ghostPupil(textures, { opacity: OPACITY });
      object.position.copy(worldAt(level, [col, row]));
      object.rotation.y = (rotation * Math.PI) / 180;
      levelGroup.add(object);
      return { object, head: object.getObjectByName('head'), facing: object.rotation.y, to: 0 };
    });
  }

  // Where each head ends up: turned to you, the shorter way round.
  function aim() {
    const p = game.player.state.position;
    for (const pupil of pupils) {
      const at = pupil.object.position;
      const turn = Math.atan2(p.x - at.x, p.z - at.z) - pupil.facing;
      pupil.to = Math.atan2(Math.sin(turn), Math.cos(turn));
    }
    game.sanity.drain(event.drain ?? 6, 'children');
    game.events.emit('setPiece.turn', { position: pupils[0]?.object.position.clone().setY(1) ?? null });
  }

  function clear() {
    pupils?.forEach(({ object }) => object.parent?.remove(object));
    pupils = null;
  }

  function stop() {
    clear();
    darkness.restore();
  }

  function update(t) {
    const dark = t - tell; // seconds since the lamps died
    darkness.set(dark < LIGHT_AT ? dyingAt(game, t, tell) : 0);
    if (dark >= FILL_AT && dark < LIGHT_AT && !pupils) fill();
    if (pupils && dark >= TURN_AT && !pupils.turned) {
      aim();
      pupils.turned = true;
    }
    if (pupils?.turned) {
      const k = Math.min(1, (dark - TURN_AT) / TURN_FOR);
      for (const pupil of pupils) pupil.head.rotation.y = pupil.to * k;
    }
    if (dark >= LIGHT_AT) clear();
    return dark >= LIGHT_AT + LINGER;
  }

  const phase = (t) => (t < tell ? 'lamps dying' : t - tell < TURN_AT ? 'pupils' : t - tell < LIGHT_AT ? 'looking at you' : 'empty');
  return { update, stop, phase };
}
