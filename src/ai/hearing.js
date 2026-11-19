// What a listener hears (0.5, part B: Dr. Venn hears only). Two kinds of
// sound reach him:
//   - you, all the time: your steps (player/controller.js: still 0, crouching
//     1.5 m, walking 4, running 10) and your breath (player/breath.js:
//     panting after a run 3 m, nothing while held); in a locker or under a bed
//     your steps make no sound, your breath still does;
//   - Nora following you (ai/noraFollow.js), all the time she walks: her
//     steps where she is, one pace louder than yours (4 m or 10 m);
//   - things, once: "noise" events (a door banged 10 m, a bottle 14 m, a
//     stone 10 m, a gasp 9 m, Sam's knock on a pipe).
// A sound carries its radius in the open, and half of it through a wall (a
// solid cell between). Difficulty scales his ears: Story 0.8, Hard 1.2.

const EARS = { story: 0.8, normal: 1, hard: 1.2 };
const FORGET = 0.5; // seconds a thing's noise stays to be heard (one frame is too short for a slow frame)
const STEP = 0.2; // metres between the points checked along a sound's way

// True when no wall stands between a sound and the listener. At a doorway
// its jambs do not count: a sound made in a doorway fills it (a door banged
// there is heard down the corridor), and one standing in a doorway hears
// round its jambs. Anywhere else a wall is a wall.
export function openWay(level, from, to) {
  const ends = [level.worldToCell(from.x, from.z), level.worldToCell(to.x, to.z)].filter((end) => level.doorAt(end.col, end.row));
  const beside = ({ col, row }) => ends.some((end) => Math.abs(end.col - col) <= 1 && Math.abs(end.row - row) <= 1);
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const length = Math.hypot(dx, dz);
  for (let d = STEP; d < length - STEP; d += STEP) {
    const cell = level.worldToCell(from.x + (dx * d) / length, from.z + (dz * d) / length);
    if (level.isSolid(cell.col, cell.row) && !beside(cell)) return false;
  }
  return true;
}

export function createHearing(game) {
  let things = []; // { x, z, radius, kind, age }

  game.events.on('noise', (noise) => things.push({ ...noise, age: 0 }));
  game.events.on('level.loaded', () => (things = []));

  // How loud you are now, in metres: your steps or your breath, whichever carries further.
  function yours() {
    const hidden = game.hiding.active();
    const steps = hidden ? 0 : game.player.state.noise;
    const breath = game.breath?.noise() ?? 0;
    if (!steps && !breath) return null;
    const p = game.player.state.position;
    const kind = breath > steps ? 'breath' : game.player.state.running ? 'run' : 'feet';
    return { x: p.x, z: p.z, radius: Math.max(steps, breath), kind, you: true };
  }

  // The loudest sound the listener at `at` hears now, or null: { x, z, kind, you, radius }.
  function heard(at, { deaf = false } = {}) {
    if (deaf) return null;
    const level = game.world.level;
    const ears = EARS[game.settings.get('difficulty')] ?? 1;
    let best = null;
    let bestMargin = 0;
    const hers = game.noraFollow?.audible();
    for (const sound of [yours(), hers && { ...hers, kind: 'nora' }, ...things]) {
      if (!sound) continue;
      const d = Math.hypot(sound.x - at.x, sound.z - at.z);
      const reach = sound.radius * ears * (openWay(level, sound, at) ? 1 : 0.5);
      const margin = reach - d;
      if (margin > bestMargin) {
        best = sound;
        bestMargin = margin;
      }
    }
    return best;
  }

  function update(dt) {
    for (const thing of things) thing.age += dt;
    things = things.filter((thing) => thing.age < FORGET);
  }

  return { heard, update, yours };
}
