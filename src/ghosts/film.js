// The projector film (design 0.3, approved stills "class4", "projector_film"):
// in Classroom 4 the lamp goes out (the tell) and the projector clatters into
// life by itself. On the pulled-down screen, a silent, scratched film of five
// children in a line in their smocks, walking, all in profile. The middle one
// turns to the camera. The film snaps off; the lamp comes back. No words
// (content sheet). The screen light's flicker and the white flash of the
// snap keep to the flicker and reduce-effects settings (scare rules §5).
// Data: "screen": "<screen prop id>", "projector": "<projector prop id>".
import * as THREE from 'three';
import { findProp } from '../props/place.js';
import { plane } from '../props/parts.js';
import { filmFrameTexture, projectorBeam } from '../props/upstairs.js';
import { roomDarkness, dyingAt, flickerAllowed } from './setPieceKit.js';

const TURN_AT = 4.2; // seconds of film before the face turns
const SNAP_AT = 5.8;
const FLASH_FOR = 0.12; // the white of the snap, when flashes are allowed
const LIGHT_AT = 6.8;
const LINGER = 0.4;
const GLOW = 2.6; // the screen's light on the desks
const SCREEN = { size: [2.0, 1.5], at: [0, 1.75, 0.075] }; // just in front of the cloth

export function filmPiece(game, event) {
  const tell = event.setup?.seconds ?? 0.8;
  const darkness = roomDarkness(game, event.room);
  const screen = findProp(game.world.levelGroup, event.screen);
  const projector = findProp(game.world.levelGroup, event.projector);
  const cloth = screen.getObjectByName('cloth'); // the film shows instead (the cloth is a decal: it would win)
  let film = null; // { walking, turned, flash, beam, glow }
  let snapped = false;

  function roll() {
    screen.updateWorldMatrix(true, false);
    projector.updateWorldMatrix(true, false);
    const frame = (texture) => plane(texture, SCREEN.size, SCREEN.at, { unlit: true });
    film = {
      walking: frame(filmFrameTexture({ turned: false })),
      turned: frame(filmFrameTexture({ turned: true })),
      flash: plane(game.world.textures.sheet, SCREEN.size, SCREEN.at, { unlit: true, color: '#f4f4ee' }),
      glow: new THREE.PointLight(0xc8ccd0, GLOW, 9, 1.0),
    };
    film.turned.visible = false;
    film.flash.visible = false;
    film.flash.name = 'filmFlash';
    screen.add(film.walking, film.turned, film.flash);
    cloth.visible = false;
    const lens = projector.localToWorld(new THREE.Vector3(-0.02, 1.02, 0.3));
    film.beam = projectorBeam(lens, screen.localToWorld(new THREE.Vector3(0, 1.75, 0.08)));
    film.glow.position.copy(screen.localToWorld(new THREE.Vector3(0, 1.7, 1.2)));
    game.world.levelGroup.add(film.beam, film.glow);
    game.events.emit('setPiece.projector', { position: lens });
  }

  function turn() {
    film.walking.visible = false;
    film.turned.visible = true;
    game.sanity.drain(event.drain ?? 4, 'children');
    game.events.emit('setPiece.filmTurn');
  }

  // The film tears: the projector stops, the screen goes white for a blink
  // (dark at once when flashes are off) and the beam dies.
  function snap(running) {
    snapped = true;
    film.turned.visible = false;
    film.flash.visible = flickerAllowed(game) && running < SNAP_AT + FLASH_FOR;
    film.beam.visible = false;
    film.glow.intensity = 0;
    game.events.emit('setPiece.filmSnap');
  }

  function clear() {
    if (!film) return;
    [film.walking, film.turned, film.flash, film.beam, film.glow].forEach((object) => object.parent?.remove(object));
    cloth.visible = true;
    if (!snapped) game.events.emit('setPiece.filmSnap');
    film = null;
  }

  function stop() {
    clear();
    darkness.restore();
  }

  // The projector's lamp is never quite steady (unless flicker is off), and
  // the frame weaves a little in the gate.
  function run(running) {
    film.glow.intensity = flickerAllowed(game) ? GLOW * (0.85 + Math.random() * 0.15) : GLOW;
    const weave = Math.random() < 0.2 ? (Math.random() - 0.5) * 0.008 : 0;
    film.walking.position.x = weave;
    film.turned.position.x = weave;
    if (running >= TURN_AT && !film.turned.visible) turn();
  }

  function update(t) {
    const running = t - tell; // seconds since the lamp went out
    darkness.set(running < LIGHT_AT ? dyingAt(game, t, tell) : 0);
    if (running >= 0 && !film && !snapped) roll();
    if (film && !snapped && running < SNAP_AT) run(running);
    if (film && !snapped && running >= SNAP_AT) snap(running);
    if (film && snapped && running >= SNAP_AT + FLASH_FOR) film.flash.visible = false;
    if (running >= LIGHT_AT) clear();
    return running >= LIGHT_AT + LINGER;
  }

  const phase = (t) => (t < tell ? 'lamp out' : t - tell < TURN_AT ? 'film' : t - tell < SNAP_AT ? 'turned' : 'snapped');
  return { update, stop, phase };
}
