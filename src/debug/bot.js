// Bot playthrough: follows a scripted route by steering the real controller
// (same speed, collision and stamina as a player) and using things the way a
// player does: aim the view at them, check a prompt shows, press use.
// Proves a route can be finished and reports how long it took.
//
// Route steps (cells as in level data):
//   { "cell": [col, row], "pace": "run" | "crouch" }   walk to a cell's centre
//   { "use": [col, row], "y": 0.76, "expect": "prompt.take" }   aim at a point, press use
//   { "use": { "prop": "bed_2", "local": [x, y, z] } }   aim at a point on a prop
//   { "select": "plate_TOMMY" }   pick an inventory item
//   { "tap": "flashlight" }   press an action once
//   { "skipTutorial": true }   skip every tutorial line showing or queued (ENTER)
//   { "use": ..., "keepOpen": true }   leave the screen the use opened (music box)
//   { "screenKey": "Digit3" }   press a key on the open screen
//   { "screenClick": 18 }   click the n-th clickable spot of the open screen (a drawer, a book)
//   { "resume": true }   put back whatever screen is open (a page found in a book)
//   { "wait": 15 }   stand still that long (a rhyme to hear out)
//   { "waitUntil": { "nunIn": [c0, r0, c1, r1] }, "max": 150 }   stand still until Sister M. is in those cells
//   { "waitUntil": { "vennIn": [c0, r0, c1, r1] }, "max": 150 }   the same for Dr. Venn
//   { "openDoor": [col, row] }   open that door if it is shut
//   { "easeDoor": [col, row] }   ease a loud door open (hold use and drag: no bang) if it is shut
//   { "light": false }   switch the flashlight off (or on)
//   { "faceNun": true }   turn to face Sister M. (to flash her with the camcorder)
//   { "cell": [col, row], "watching": true }   walk there with your eyes on St. Agnes (she moves only unseen)
//   { "useWatcher": true, "expect": "prompt.agnesHand" }   look her in the face where she stands, press use
// A "use" that opens a screen (a document) is closed again; one that starts
// travel waits for the new level. Old routes (a "points" list) still work.
import * as THREE from 'three';

const STEP = 1 / 60;
const REACH_DISTANCE = 0.35;
const target = new THREE.Vector3();

function angleTo(from, to) {
  return Math.atan2(-(to.x - from.x), -(to.z - from.z));
}

const MOVES = ['forward', 'back', 'left', 'right', 'run', 'crouch'];

// Facing St. Agnes, the keys that move you towards the goal (as a player
// steps sideways and back without taking their eyes off her).
function sidestep(game, goal) {
  const { player, input } = game;
  const her = game.watcher.position();
  if (her) player.state.yaw = angleTo(player.state.position, her);
  const dx = goal.x - player.state.position.x;
  const dz = goal.z - player.state.position.z;
  const length = Math.hypot(dx, dz) || 1;
  const sin = Math.sin(player.state.yaw), cos = Math.cos(player.state.yaw);
  const ahead = (-sin * dx - cos * dz) / length;
  const across = (cos * dx - sin * dz) / length;
  input.setVirtual('forward', ahead > 0.38);
  input.setVirtual('back', ahead < -0.38);
  input.setVirtual('right', across > 0.38);
  input.setVirtual('left', across < -0.38);
}

function walk(game, step, maxSeconds) {
  const { player, input, world } = game;
  const goal = world.level.cellCenter(step.cell[0], step.cell[1]);
  input.setVirtual('run', step.pace === 'run');
  input.setVirtual('crouch', step.pace === 'crouch');
  input.setVirtual('forward', true);
  let elapsed = 0;
  while (Math.hypot(goal.x - player.state.position.x, goal.z - player.state.position.z) > REACH_DISTANCE) {
    if (step.watching) sidestep(game, goal);
    else player.state.yaw = angleTo(player.state.position, goal);
    game.advance(STEP);
    elapsed += STEP;
    if (elapsed > maxSeconds) break;
  }
  // Come to a stop before standing up: a crouched step that ends standing is a
  // walking step (Dr. Venn hears it).
  for (const action of ['forward', 'back', 'left', 'right']) input.setVirtual(action, false);
  const sliding = () => step.pace === 'crouch' && Math.hypot(player.state.velocity.x, player.state.velocity.z) > 0.2;
  for (let t = 0; t < 0.5 && sliding(); t += STEP) {
    game.advance(STEP);
    elapsed += STEP;
  }
  for (const action of MOVES) input.setVirtual(action, false);
  return { seconds: elapsed, ok: elapsed <= maxSeconds };
}

function pointFor(game, use, y) {
  if (Array.isArray(use)) {
    const size = game.world.level.cellSize;
    return target.set(use[0] * size, y ?? 0.05, use[1] * size);
  }
  let prop = null;
  game.world.levelGroup.traverse((object) => {
    if (object.userData.prop?.id === use.prop) prop = object;
  });
  if (!prop) return null;
  prop.updateWorldMatrix(true, false);
  return prop.localToWorld(target.set(...use.local));
}

// Turns to look at a point; returns the use prompt showing then, or null.
function aim(game, point) {
  const { player } = game;
  const { position } = player.state;
  player.state.yaw = angleTo(position, point);
  player.state.pitch = Math.atan2(point.y - player.state.eyeHeight, Math.hypot(point.x - position.x, point.z - position.z));
  game.advance(1 / 30);
  return game.interaction.target()?.prompt() ?? null;
}

function aimAndUse(game, step, point = pointFor(game, step.use, step.y)) {
  if (!point) return { seconds: 0, ok: false };
  const prompt = aim(game, point);
  if (!prompt || (step.expect && prompt.key !== step.expect)) return { seconds: 1 / 30, ok: false, prompt: prompt?.key ?? null };
  game.input.tap('use');
  let seconds = 1 / 30 + 0.3;
  game.advance(0.3);
  if (game.mode === 'ui' && !step.keepOpen) game.resume(); // a document opened: put it back
  while (game.isTravelling()) {
    game.advance(STEP);
    seconds += STEP;
  }
  return { seconds, ok: true };
}

function linger(game, seconds) {
  const start = game.player.state.yaw;
  for (let t = 0; t < seconds; t += STEP) {
    game.player.state.yaw = start + Math.sin(t * 0.7) * 1.2;
    game.advance(STEP);
  }
  game.player.state.yaw = start;
}

// Stand still until Sister M. (nunIn) or Dr. Venn (vennIn) walks into a box
// of cells (or "max" seconds pass: then the step fails).
function waitUntilIn(game, { nunIn, vennIn }, max = 150) {
  const who = nunIn ? game.nun : game.surgeon;
  const [c0, r0, c1, r1] = nunIn ?? vennIn;
  const size = game.world.level.cellSize;
  for (let t = 0; t < max; t += 0.1) {
    const them = who.state();
    const col = them.x / size;
    const row = them.z / size;
    if (them.active && col >= c0 && col <= c1 + 1 && row >= r0 && row <= r1 + 1) return { seconds: t, ok: true };
    if (game.collapse.active()) return { seconds: t, ok: false };
    game.advance(0.1);
  }
  return { seconds: max, ok: false };
}

// Open the door in a cell if it is shut (she may have opened it already).
function openDoor(game, [col, row]) {
  const door = game.world.level.doorAt(col, row);
  if (!door) return { seconds: 0, ok: false };
  if (door.open) return { seconds: 0, ok: true };
  return aimAndUse(game, { use: [col + 0.5, row + 0.5], y: 1.2, expect: 'prompt.open' });
}

// Ease a loud door open (the basement's): hold use on it and drag the mouse,
// as a player does, so it swings slowly and makes no noise.
function easeDoor(game, [col, row]) {
  const door = game.world.level.doorAt(col, row);
  if (!door) return { seconds: 0, ok: false };
  if (door.open) return { seconds: 0, ok: true };
  const prompt = aim(game, target.set((col + 0.5) * game.world.level.cellSize, 1.2, (row + 0.5) * game.world.level.cellSize));
  if (prompt?.key !== 'prompt.openSlowly') return { seconds: 1 / 30, ok: false, prompt: prompt?.key ?? null };
  game.input.setVirtual('use', true);
  game.input.tap('use');
  let seconds = 0;
  while (door.angle > -Math.PI / 2 + 0.05 && seconds < 4) {
    game.input.addLook(0, 200);
    game.advance(STEP);
    seconds += STEP;
  }
  game.input.setVirtual('use', false);
  game.advance(0.5);
  return { seconds: seconds + 0.5, ok: door.open };
}

// Look straight at Sister M., chest high, as a player lines up the flash.
function faceNun(game) {
  const her = game.nun.state();
  if (!her.active) return { seconds: 0, ok: false };
  const { position } = game.player.state;
  game.player.state.yaw = angleTo(position, her);
  game.player.state.pitch = Math.atan2(1.3 - game.player.state.eyeHeight, Math.hypot(her.x - position.x, her.z - position.z));
  game.advance(1 / 30);
  return { seconds: 1 / 30, ok: true };
}

function runStep(game, step, maxSeconds) {
  if (step.cell) return walk(game, step, maxSeconds);
  if (step.light !== undefined) {
    game.world.flashlight.setOn(step.light);
    return { seconds: 0, ok: true };
  }
  if (step.faceNun) return faceNun(game);
  if (step.useWatcher) return aimAndUse(game, step, game.watcher.position()?.setY(1.5) ?? null);
  if (step.waitUntil) return waitUntilIn(game, step.waitUntil, step.max);
  if (step.openDoor) return openDoor(game, step.openDoor);
  if (step.easeDoor) return easeDoor(game, step.easeDoor);
  if (step.use) return aimAndUse(game, step);
  if (step.select) {
    const items = game.inventory.items();
    game.inventory.select(items.indexOf(step.select));
    return { seconds: 0, ok: items.includes(step.select) };
  }
  if (step.screenKey) {
    const handled = game.ui.current()?.key(step.screenKey) ?? false;
    game.advance(0.25);
    return { seconds: 0.25, ok: handled };
  }
  if (step.screenClick !== undefined) {
    const spot = game.ui.current()?.hits().filter((hit) => hit.click)[step.screenClick];
    spot?.click();
    game.advance(0.25);
    return { seconds: 0.25, ok: Boolean(spot) };
  }
  if (step.resume) {
    if (game.mode === 'ui') game.resume();
    return { seconds: 0, ok: true };
  }
  if (step.wait) {
    game.advance(step.wait);
    return { seconds: step.wait, ok: true };
  }
  if (step.skipTutorial) {
    while (game.messages.current()?.tag) game.messages.skip();
    return { seconds: 0, ok: true };
  }
  if (step.tap) {
    game.input.tap(step.tap);
    game.advance(0.1);
    return { seconds: 0.1, ok: true };
  }
  return { seconds: 0, ok: false };
}

// lingerSeconds: after each step, stand and look around that long, like a
// player reading the room (used to measure balance at human pace).
export function runBot(game, route, { maxSecondsPerPoint = 30, lingerSeconds = 0 } = {}) {
  const steps = route.steps ?? route.points;
  const result = { route: route.id, finished: false, gameSeconds: 0, reached: [], stuckAt: null, failedStep: null, collapses: 0, lowestSanity: 100 };
  const stopCounting = game.events.on('collapse.started', () => (result.collapses += 1));
  for (const [index, step] of steps.entries()) {
    const outcome = runStep(game, step, maxSecondsPerPoint);
    result.gameSeconds += outcome.seconds;
    result.lowestSanity = Math.min(result.lowestSanity, game.sanity?.value() ?? 100);
    if (!outcome.ok) {
      result.stuckAt = step.cell ?? null;
      result.failedStep = { index, step, prompt: outcome.prompt ?? null, level: game.world.level.id };
      break;
    }
    result.reached.push(step.cell ?? index);
    if (lingerSeconds) linger(game, lingerSeconds);
    result.gameSeconds += lingerSeconds;
  }
  stopCounting();
  result.finished = result.failedStep === null;
  return result;
}
