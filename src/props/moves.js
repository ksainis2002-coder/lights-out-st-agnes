// Props, and a document lying in one, that stand another way once a flag is
// set: Maggie turns Classroom 1's desks to face the door (ghosts/tricks.js).
//   { "type": "schoolDesk", "at": [12.2, 14.2], "rotation": 88,
//     "moved": { "flag": "class1_turned", "rotation": -9, "at": [c, r] } }   ("at" is optional)
// Furniture that never changes otherwise is built both ways and merged into
// two sets, one shown at a time (props/merge.js); a prop with an id turns in
// place, and so does a document with "moved". Floor footprints swap with them
// (props/footprints.js: the box not in use is "off").

// Where the prop or document stands after its move.
export function movedPose(entry) {
  return { at: entry.moved.at ?? entry.at, rotation: entry.moved.rotation ?? entry.rotation ?? 0 };
}

// The prop as it stands after its move, as plain prop data (placed once).
export function asMoved(prop) {
  const { moved, ...rest } = prop;
  return { ...rest, ...movedPose(prop) };
}

// What a placed object needs to turn in place: userData.moves.
export function movesOf(entry) {
  return { flag: entry.moved.flag, from: { at: entry.at, rotation: entry.rotation ?? 0 }, to: movedPose(entry) };
}

// Keeps the level's moved props in step with their flags (checked each step,
// so a flag set by anything takes effect, and on every load).
export function createMoves(game) {
  let flags = [];
  const applied = new Map(); // flag → shown moved

  // "use" is the spot the player aims at to use it (a document), moved with it.
  function pose(object, { at, rotation }, cellSize, use) {
    object.position.x = at[0] * cellSize;
    object.position.z = at[1] * cellSize;
    object.rotation.y = (rotation * Math.PI) / 180;
    if (use) Object.assign(use, { x: object.position.x, z: object.position.z });
  }

  function apply(flag, moved) {
    const { level, levelGroup } = game.world;
    levelGroup.traverse((object) => {
      const { set, moves, usePosition } = object.userData;
      if (set?.flag === flag) object.visible = set.moved === moved;
      if (moves?.flag === flag) pose(object, moved ? moves.to : moves.from, level.cellSize, usePosition);
    });
    for (const box of level.obstacles) if (box.flag === flag) box.off = box.moved !== moved;
    applied.set(flag, moved);
  }

  function update() {
    for (const flag of flags) {
      const moved = game.progress.hasFlag(flag);
      if (applied.get(flag) !== moved) apply(flag, moved);
    }
  }

  function setUp() {
    applied.clear();
    const moving = game.world.level.props.filter((prop) => prop.moved);
    flags = [...new Set(moving.map((prop) => prop.moved.flag))];
    update();
  }

  game.events.on('level.loaded', setUp);
  setUp();
  return { update, moved: (flag) => applied.get(flag) === true };
}
