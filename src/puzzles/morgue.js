// The morgue's drawers (0.5, part B; approved still morgue; the wing 4
// content sheet). They are typed with dates, not names: the roll's and the
// charts' dates say which is whose. Pulled out (its door swings open on its
// hinge and its tray slides out), a drawer screeches on its
// runners (a noise Dr. Venn hears) and is empty: a child's has only a name
// tag on its handle, Sam's tag is still wet, some have not even a tag, and
// Tommy's (2 FEB) has a page of his file lying on the steel (the document
// appears with the flag). The 12 MAY drawer will not come for you: it rolls
// out on its own once you have pulled another (ghosts/drawerPiece.js, a set
// piece), and in it Sister M. lies under a sheet. Harm to children is never
// shown: their drawers are empty. Level data:
//   "morgue": { "drawers": "<prop id>", "contents": { "<index>": { "is": "empty" | "child" |
//     "sam" | "tommy" | "sister", "name": "<tag>" } } } (index: row by row from the bottom)
import * as THREE from 'three';
import { findProp } from '../props/place.js';
import { PROPS } from '../props/catalog.js';

export const FOUND = 'morgue_tommy'; // Tommy's drawer pulled: page four of his file
export const PULLED = 'morgue_pulled'; // a drawer pulled: the 12 MAY drawer may roll out
const OPEN = 'morgue_open'; // progress value: the drawers pulled out, by index
const OUT = 0.5; // metres a drawer's tray comes out
const SWING = -1.75; // radians a door swings open (outward, on its left hinge)
const DOOR_SECONDS = 0.3;
const TRAY_AFTER = 0.2; // seconds into the pull the tray starts to slide
const TRAY_SECONDS = 0.6;
const SCREECH = 8; // metres the noise carries
const CAPTION = { speaker: null, whisper: false, seconds: 3 };
const LINES = { empty: 'msg.drawerEmpty', child: 'msg.drawerChild', sam: 'msg.drawerSam', tommy: 'msg.drawerTommy' };

// A drawer of the wall (props/basement.js morgueDrawers names them drawer_<index>).
export const drawerOf = (world, wallId, index) => findProp(world.levelGroup, wallId)?.getObjectByName(`drawer_${index}`) ?? null;

// A drawer's door ("door" 0..1 open) and its tray ("out" metres out).
export function setDrawer(drawer, door, out) {
  drawer.getObjectByName('door').rotation.y = SWING * door;
  drawer.getObjectByName('tray').position.z = out;
}
const clamp01 = (value) => Math.min(1, Math.max(0, value));

// The 12 MAY drawer's long tray and what lies on it (the approved still's
// morgueTray), behind its front: out ("k" 0..1) of its length. It is longer
// than the wall is thick, so while it is all in, it is hidden (it would show
// through the corridor's wall). Returns { out, tray }.
const SISTER_OUT = 2.0; // metres
export function sisterOut(game, drawer, k = 1) {
  let tray = drawer.getObjectByName('sister');
  if (!tray) {
    tray = PROPS.morgueTray(game.world.textures);
    tray.name = 'sister';
    tray.position.set(0, -0.86, -SISTER_OUT); // its slab level with the drawer's floor, all of it in the wall
    drawer.getObjectByName('tray').add(tray);
    drawer.getObjectByName('pan').visible = false; // the long tray in its place
  }
  tray.visible = k > 0;
  setDrawer(drawer, k > 0 ? 1 : 0, SISTER_OUT * k);
  return { out: SISTER_OUT, tray };
}

export function morguePuzzle(game, level, data) {
  const { progress, world } = game;
  const wall = findProp(world.levelGroup, data.drawers);
  wall?.updateWorldMatrix(true, true);
  const entries = Object.entries(data.contents).map(([index, content]) => ({ index: Number(index), ...content }));
  const open = () => progress.getValue(OPEN, []);
  const isOpen = (index) => open().includes(index);

  for (const { index } of entries) if (isOpen(index)) setDrawer(drawerOf(world, data.drawers, index), 1, OUT);
  const sister = entries.find((entry) => entry.is === 'sister');
  if (sister && progress.hasFlag('set_morgue_drawer')) sisterOut(game, drawerOf(world, data.drawers, sister.index));

  function pull(entry) {
    if (entry.is === 'sister' || isOpen(entry.index)) return;
    progress.setValue(OPEN, [...open(), entry.index]);
    progress.setFlag(PULLED);
    if (entry.is === 'tommy') progress.setFlag(FOUND);
    const drawer = drawerOf(world, data.drawers, entry.index);
    const at = drawer.getWorldPosition(new THREE.Vector3());
    let t = 0; // seconds: the door swings open, then the tray slides out
    world.animate((dt) => {
      t += dt;
      const slid = clamp01((t - TRAY_AFTER) / TRAY_SECONDS);
      setDrawer(drawer, clamp01(t / DOOR_SECONDS), OUT * slid);
      if (slid < 1) return true;
      if (entry.is === 'tommy') game.events.emit('puzzle.solved', 'morgue'); // out: the page on the steel shows
      return false;
    });
    game.subtitles.show('caption.drawerScreech', CAPTION);
    game.events.emit('morgue.pulled', { position: at.clone() });
    game.events.emit('noise', { x: at.x, z: at.z, radius: SCREECH, kind: 'drawer' });
    game.messages.show(LINES[entry.is], entry.name ? { name: entry.name } : null, 5);
  }

  // The 12 MAY drawer, once it has rolled out: what is in it.
  const rolledOut = () => progress.hasFlag('set_morgue_drawer');

  return entries.map((entry) => {
    const drawer = drawerOf(world, data.drawers, entry.index);
    const position = drawer.localToWorld(new THREE.Vector3(0, 0.25, 0.1));
    return {
      position,
      radius: 0.22,
      prompt() {
        if (entry.is === 'sister') {
          if (!rolledOut()) return null; // it will not come for you
          drawer.getObjectByName('tray').localToWorld(position.set(0, 0.2, -0.6)); // out now: what lies on it
          return { key: 'prompt.look' };
        }
        return isOpen(entry.index) ? null : { key: 'prompt.pullDrawer' };
      },
      use() {
        if (entry.is === 'sister') return rolledOut() && game.messages.show('msg.drawerSister', null, 6);
        return pull(entry);
      },
    };
  });
}
