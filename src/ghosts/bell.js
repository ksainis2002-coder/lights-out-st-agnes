// The bell (design 0.3, approved still "bell"): the first time upstairs the
// corridor goes quiet (the tell), then the electric school bell rings with
// nobody there and the classroom doors bang open, one after another. While
// it rings, a ringing bell (its dome a blur) stands in for the still one.
// Data: "bell": "<the bell prop's id>", "doors": [door ids, in order].
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { findProp } from '../props/place.js';
import { hush } from './setPieceKit.js';

const RING_FOR = 3.2; // seconds
const FIRST_BANG = 0.6; // seconds into the ringing
const BANG_EVERY = 0.6;
const LINGER = 0.8; // after the ringing stops

export function bellPiece(game, event) {
  const tell = event.setup?.seconds ?? 1.2;
  const still = findProp(game.world.levelGroup, event.bell);
  still.updateWorldMatrix(true, false);
  const position = still.getWorldPosition(new THREE.Vector3()).setY(2.5);
  const doors = event.doors ?? [];
  let ringing = null;
  let banged = 0;
  hush(game, tell);

  function ring() {
    ringing = PROPS.schoolBell(game.world.textures, { ringing: true });
    ringing.position.copy(still.position);
    ringing.rotation.copy(still.rotation);
    still.parent.add(ringing);
    still.visible = false;
    game.sanity.drain(event.drain ?? 3, 'children');
    game.events.emit('setPiece.ring', { position });
  }

  function silence() {
    if (!ringing) return;
    ringing.parent?.remove(ringing);
    still.visible = true;
    ringing = null;
    game.events.emit('setPiece.ringStop');
  }

  // Flung open hard: open at once, no swing, with a bang. A locked door holds.
  function bang(id) {
    const door = game.world.level.doors.find((candidate) => candidate.id === id);
    if (!door || door.open || door.locked) return;
    door.open = true;
    door.angle = -Math.PI / 2;
    game.progress.setOpen(door.id, true);
    game.events.emit('setPiece.doorBang', door);
  }

  function update(t) {
    const rang = t - tell;
    if (rang >= 0 && rang < RING_FOR && !ringing) ring();
    while (banged < doors.length && rang >= FIRST_BANG + banged * BANG_EVERY) bang(doors[banged++]);
    if (rang >= RING_FOR) silence();
    return rang >= RING_FOR + LINGER;
  }

  return { update, stop: silence, phase: (t) => (t < tell ? 'quiet' : t < tell + RING_FOR ? 'ringing' : 'after') };
}
