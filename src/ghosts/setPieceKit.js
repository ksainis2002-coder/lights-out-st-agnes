// Shared parts of the set pieces (ghosts/setPieces.js): a room's lamps that
// die and come back (two quick flickers first, or a plain fade when flicker
// is off: the tell stays either way, scare rules §5), the quiet before a
// hit, and cells to world points.
import * as THREE from 'three';

const AMBIENT_LEFT = 0.25; // how much of the level's ambient light stays in the dark
const FLICKERS = [[0, 0.08], [0.2, 0.3]]; // seconds dark, before the light dies for good

export const flickerAllowed = (game) => !game.settings.get('flickerOff') && !game.settings.get('reduceEffects');

export const worldAt = (level, [col, row], y = 0) => new THREE.Vector3(col * level.cellSize, y, row * level.cellSize);

// The lamps in a room and the level's ambient light, dimmed together:
// set(k) with k from 0 (as they were) to 1 (lamps out, ambient low). A lamp
// that is out counts as dark for sanity and the watcher's gaze too.
export function roomDarkness(game, roomId) {
  const { level, levelGroup } = game.world;
  const [c0, r0, c1, r1] = level.rooms.find((room) => room.id === roomId).cells;
  const inRoom = ([col, row]) => col >= c0 && col <= c1 + 1 && row >= r0 && row <= r1 + 1;
  const lamps = [];
  let ambient = null;
  levelGroup.traverse((object) => {
    const data = object.userData.light;
    if (object.isPointLight && data && inRoom(data.at)) lamps.push({ object, data, intensity: object.intensity, off: data.off });
    if (object.isAmbientLight) ambient = { object, intensity: object.intensity };
  });

  function set(k) {
    for (const lamp of lamps) {
      lamp.object.intensity = lamp.intensity * (1 - k);
      lamp.data.off = lamp.off || k > 0.99;
    }
    if (ambient) ambient.object.intensity = ambient.intensity * (1 - k * (1 - AMBIENT_LEFT));
  }

  return { set, restore: () => set(0) };
}

// How dark the dying lamps are, "time" seconds into a death lasting "seconds".
export function dyingAt(game, time, seconds) {
  if (time >= seconds) return 1;
  if (!flickerAllowed(game)) return time / seconds;
  if (FLICKERS.some(([from, to]) => time >= from && time < to)) return 1;
  const after = FLICKERS.at(-1)[1];
  return time < after ? 0 : (time - after) / (seconds - after);
}

// The tell before a hit: every other sound dips, coming back as it lands.
export function hush(game, seconds) {
  game.mixer.duck('effects', -14, { attack: 0.3, hold: Math.max(0, seconds - 0.8), release: 0.5 });
}

// A positional loop that can be stopped (null while audio is not running).
export function loopAt(game, name, position, options = {}) {
  return game.sfx.play(name, { position, loop: true, pitchJitter: 0, ...options });
}
