// The 12 MAY drawer rolls out on its own (0.5, part B; the wing 4 content
// sheet; a set piece run by ghosts/setPieces.js, with its tell and its
// cooldown in the level data). It waits a moment first ("wait": the screech
// of the drawer you pulled dies away), then the tell: the morgue goes quiet.
// Then its door swings open and it rolls all the way out on a long steel tray,
// a sheet over a grown woman on it, a tag on her toe (Sister M.: puzzles/morgue.js
// has her line).
// Data: "drawers": "<prop id>", "index": the drawer's index on the wall, "wait": seconds.
import * as THREE from 'three';
import { drawerOf, sisterOut, setDrawer } from '../puzzles/morgue.js';
import { roomAt } from '../levels/loader.js';

const DOOR = 0.35; // seconds its door takes to swing open
const ROLL_AFTER = 0.3; // seconds after the door starts that the tray starts to roll
const ROLL = 2.6; // seconds it takes to come out
const CAPTION = { speaker: null, whisper: false, seconds: 3.5 };

export function drawerPiece(game, event) {
  const wait = event.wait ?? 0;
  const tell = event.setup?.seconds ?? 3;
  const drawer = drawerOf(game.world, event.drawers, event.index);
  const sister = sisterOut(game, drawer, 0); // still inside the wall, hidden
  let quiet = false;
  let rolling = false;

  // The quiet before it.
  function hush() {
    quiet = true;
    game.mixer.duck('effects', -14, { attack: 0.3, hold: Math.max(0, tell - 0.8), release: 0.5 });
  }

  function roll() {
    rolling = true;
    sister.tray.visible = true;
    game.subtitles.show('caption.drawerRolls', CAPTION);
    game.sanity.drain(event.drain ?? 4, 'children');
    game.events.emit('morgue.rolls', { position: drawer.getWorldPosition(new THREE.Vector3()) });
  }

  return {
    update(t) {
      if (t < wait) return false;
      if (!quiet) hush();
      if (t < wait + tell) return false;
      if (!rolling) roll();
      const since = t - wait - tell;
      const k = Math.min(1, Math.max(0, (since - ROLL_AFTER) / ROLL));
      // Out of the morgue you hear it, and it is out when you come back (no tray through the corridor's wall).
      const watching = roomAt(game.world.level, game.player.state.position) === event.room;
      if (!watching) return true; // stop() puts it out
      setDrawer(drawer, Math.min(1, since / DOOR), sister.out * (1 - (1 - k) * (1 - k))); // it slows to a stop
      return k >= 1;
    },
    stop() {
      sister.tray.visible = true;
      setDrawer(drawer, 1, sister.out); // cut short: it is out all the same
    },
    phase: (t) => (t < wait ? 'waiting' : t < wait + tell ? 'the quiet' : 'rolling out'),
  };
}
