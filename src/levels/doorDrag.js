// Doors that shout (0.5, part B; the wing 4 content sheet: "The doors shout
// down here. Open them slowly."). In a level with "loudDoors": true (the
// basement) a door opened or shut with a click swings at once and bangs,
// "(the door bangs)", a noise Dr. Venn hears 10 m off. Hold the use button
// and drag the mouse instead: the door eases open (or shut) as you drag, no
// faster than a slow push however hard you pull, and makes no noise; let go
// and it settles the way it was going. While you drag, the mouse moves the
// door, not your view.
const OPEN = -Math.PI / 2;
const DRAG = 0.004; // radians of swing for each pixel the mouse moves
const MAX_SPEED = 1.1; // radians a second, however fast you drag
const CLICK = 0.05; // moved less than this when you let go: it was a click
const BANG_RADIUS = 10; // metres
const CAPTION = { speaker: null, whisper: false, seconds: 3 };

export function createDoorDrag(game) {
  let held = null; // { door, opening, moved }

  function setLook(held) {
    game.player.state.lookHeld = held;
  }

  function begin(door) {
    held = { door, opening: door.angle > OPEN / 2, moved: 0 };
    door.dragging = true;
    setLook(true);
  }

  function bang(door) {
    door.open = !door.open;
    game.progress.setOpen(door.id, door.open);
    const { x, z } = game.world.level.cellCenter(...door.cell);
    game.events.emit('door.banged', door);
    game.events.emit('noise', { x, z, radius: BANG_RADIUS, kind: 'door' });
    game.subtitles.show('caption.doorBangs', CAPTION);
  }

  function release() {
    const { door, moved } = held;
    held = null;
    door.dragging = false;
    setLook(false);
    if (moved < CLICK) return bang(door);
    door.open = door.angle < OPEN / 2; // it settles the way it was going, slowly (levels/doors.js)
    door.easing = true;
    game.progress.setOpen(door.id, door.open);
    game.events.emit('door.eased', door);
  }

  function update(dt, input) {
    if (!held) return;
    if (!input.isDown('use')) return release();
    const { x, y } = input.takeLook();
    const step = Math.min((Math.abs(x) + Math.abs(y)) * DRAG, MAX_SPEED * dt);
    const { door } = held;
    const before = door.angle;
    door.angle = Math.max(OPEN, Math.min(0, door.angle + (held.opening ? -step : step)));
    held.moved += Math.abs(door.angle - before);
    door.open = door.angle < OPEN * 0.6; // wide enough to go through
  }

  game.events.on('level.loaded', () => {
    held = null;
    setLook(false);
  });

  return { begin, update, dragging: () => held?.door.id ?? null };
}
