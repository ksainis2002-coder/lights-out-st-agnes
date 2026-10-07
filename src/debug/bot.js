// Bot playthrough: walks a scripted route of waypoints through a level by
// steering the real controller (same speed, collision and stamina as a
// player). Proves a route can be finished and reports how long it took.
// Waypoints are cells [col, row]; optional "run" or "crouch" per point.

const STEP = 1 / 60;
const REACH_DISTANCE = 0.35;

function angleTo(from, to) {
  return Math.atan2(-(to.x - from.x), -(to.z - from.z));
}

export function runBot(game, route, { maxSecondsPerPoint = 30 } = {}) {
  const { player, input, world } = game;
  const result = { route: route.id, finished: false, gameSeconds: 0, reached: [], stuckAt: null };

  for (const point of route.points) {
    const target = world.level.cellCenter(point.cell[0], point.cell[1]);
    input.setVirtual('run', point.pace === 'run');
    input.setVirtual('crouch', point.pace === 'crouch');
    input.setVirtual('forward', true);
    let elapsed = 0;
    while (Math.hypot(target.x - player.state.position.x, target.z - player.state.position.z) > REACH_DISTANCE) {
      player.state.yaw = angleTo(player.state.position, target);
      game.advance(STEP);
      elapsed += STEP;
      if (elapsed > maxSecondsPerPoint) {
        result.stuckAt = point.cell;
        break;
      }
    }
    result.gameSeconds += elapsed;
    if (result.stuckAt) break;
    result.reached.push(point.cell);
  }

  for (const action of ['forward', 'run', 'crouch']) input.setVirtual(action, false);
  result.finished = result.stuckAt === null;
  return result;
}
