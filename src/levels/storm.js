// The storm (design 0.3, weather and sound; approved still "storm"). It rains
// from the start; once the headmaster's records drawer is open (a level's
// "weather": { "storm": "<flag>" }) lightning strikes every 20–40 s and the
// thunder follows 1–3 s later. Outdoors the sky, fog and ground go pale
// blue-white for a blink, often twice, and the bolt shows over the trees;
// indoors the light through the windows washes the room. With reduce effects
// or flicker off it is a soft glow that rises and falls, never a strobe, and
// no bolt (scare rules §5: the tell stays, the flash goes).
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { flickerAllowed } from '../ghosts/setPieceKit.js';
import { strikeLight } from './lightning.js';

const FIRST_STRIKE = [6, 10]; // seconds after the storm starts
const BETWEEN = [20, 40];
const THUNDER_AFTER = [1, 3];
const SKY = 0x56627a; // the sky in a flash (a hex: Colors are made after the renderer sets colour management)
const OUTDOOR = { ambient: 2.6, sun: 2.2 };
const INDOOR = { ambient: 0.9 };
const BOLT_AWAY = 45; // metres from you, somewhere in front

const between = ([min, max]) => min + Math.random() * (max - min);

export function createStorm(game) {
  let rig = null; // this level's flash lights, sky and bolt
  let nextIn = null; // seconds to the next strike, once the storm is on
  let strike = null; // { t, glow, twice, thunderAt, rumbled }

  const flag = () => game.world.level.weather?.storm ?? null;
  const on = () => Boolean(flag()) && game.progress.hasFlag(flag());

  function build() {
    const { level, levelGroup, textures } = game.world;
    const outdoors = Boolean(level.fog);
    const ambient = new THREE.AmbientLight(outdoors ? 0xc8d4ff : 0xb8c4e0, 0);
    levelGroup.add(ambient);
    rig = { outdoors, ambient, sky: level.fog ? new THREE.Color(level.fog.color) : null, flashSky: new THREE.Color(SKY) };
    if (!outdoors) return;
    rig.sun = new THREE.DirectionalLight(0xe0e8ff, 0);
    rig.sun.position.set(-6, 20, 30);
    rig.bolt = PROPS.lightningBolt(textures, { height: 32, seed: 9 });
    rig.bolt.visible = false;
    levelGroup.add(rig.sun, rig.bolt);
  }

  function light(k) {
    if (!rig) return;
    rig.ambient.intensity = k * (rig.outdoors ? OUTDOOR.ambient : INDOOR.ambient);
    if (!rig.outdoors) return;
    rig.sun.intensity = k * OUTDOOR.sun;
    const color = rig.sky.clone().lerp(rig.flashSky, k);
    game.world.scene.background = color;
    game.world.scene.fog.color.copy(color);
  }

  // Somewhere ahead of you, far off, so the bolt is seen.
  function placeBolt() {
    const p = game.player.state.position;
    const bearing = game.player.state.yaw + (Math.random() - 0.5) * 1.2;
    rig.bolt.position.set(p.x - Math.sin(bearing) * BOLT_AWAY, 0, p.z - Math.cos(bearing) * BOLT_AWAY);
  }

  function start() {
    const glow = !flickerAllowed(game);
    strike = { t: 0, glow, twice: !glow && Math.random() < 0.5, thunderAt: between(THUNDER_AFTER), rumbled: false };
    if (rig.bolt && !glow) placeBolt();
    game.events.emit('storm.lightning', { outdoors: rig.outdoors, glow });
  }

  function update(dt) {
    if (!on()) return;
    if (nextIn === null) nextIn = between(FIRST_STRIKE);
    if (strike) {
      strike.t += dt;
      const k = strikeLight(strike.t, strike);
      light(k);
      if (rig.bolt) rig.bolt.visible = !strike.glow && k > 0.4;
      if (!strike.rumbled && strike.t >= strike.thunderAt) {
        strike.rumbled = true;
        game.events.emit('storm.thunder', { outdoors: rig.outdoors });
      }
      if (strike.rumbled && k === 0) strike = null;
      return;
    }
    nextIn -= dt;
    if (nextIn > 0) return;
    nextIn = between(BETWEEN);
    start();
  }

  game.events.on('level.loaded', () => {
    strike = null;
    build();
  });
  build();

  return {
    update,
    on,
    strike: () => on() && !strike && start(), // tests: lightning now
    flash: () => ({ light: rig?.ambient.intensity ?? 0, bolt: rig?.bolt?.visible ?? false }), // tests
    debugLine: () => (flag() ? `STORM  ${on() ? `on, next strike ${Math.round(nextIn ?? 0)}s${strike ? '  (striking)' : ''}` : `waits for ${flag()}`}` : 'STORM  none here'),
  };
}
