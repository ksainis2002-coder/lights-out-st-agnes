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
// A "use" that opens a screen (a document) is closed again; one that starts
// travel waits for the new level. Old routes (a "points" list) still work.
import * as THREE from 'three';

const STEP = 1 / 60;
const REACH_DISTANCE = 0.35;
const target = new THREE.Vector3();

function angleTo(from, to) {
  return Math.atan2(-(to.x - from.x), -(to.z - from.z));
}

function walk(game, step, maxSeconds) {
  const { player, input, world } = game;
  const goal = world.level.cellCenter(step.cell[0], step.cell[1]);
  input.setVirtual('run', step.pace === 'run');
  input.setVirtual('crouch', step.pace === 'crouch');
  input.setVirtual('forward', true);
  let elapsed = 0;
  while (Math.hypot(goal.x - player.state.position.x, goal.z - player.state.position.z) > REACH_DISTANCE) {
    player.state.yaw = angleTo(player.state.position, goal);
    game.advance(STEP);
    elapsed += STEP;
    if (elapsed > maxSeconds) break;
  }
  for (const action of ['forward', 'run', 'crouch']) input.setVirtual(action, false);
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

function aimAndUse(game, step) {
  const { player, interaction } = game;
  const point = pointFor(game, step.use, step.y);
  if (!point) return { seconds: 0, ok: false };
  const { position } = player.state;
  player.state.yaw = angleTo(position, point);
  player.state.pitch = Math.atan2(point.y - player.state.eyeHeight, Math.hypot(point.x - position.x, point.z - position.z));
  game.advance(1 / 30);
  const prompt = interaction.target()?.prompt();
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

function runStep(game, step, maxSeconds) {
  if (step.cell) return walk(game, step, maxSeconds);
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
