// The ward lamps (0.4): bare bulbs that are lit when you arrive, because the
// power is still on, and that Sister M. puts out one by one (ai/nun.js).
// Level data: "lamps": [{ "id": "ward_a_1", "room": "ward_a", "circuit": "ward_a", "at": [c, r] }]
// A lamp burns while its circuit has a fuse (flag power_<circuit>; the fuse
// board, puzzles/wardFuses.js) and she has not put it out (flag
// lamp_out_<id>). A fuse pushed in again lights the circuit's lamps afresh.
import * as THREE from 'three';

const HEIGHT = 2.85; // the bulb, on its flex under a 3.4 m ceiling
const LIT = 0xffe2a8;
const DEAD = 0x6a6a62;

export function createLamps(game) {
  let lamps = [];

  const flag = (id) => `lamp_out_${id}`;
  const burns = (lamp) => game.progress.hasFlag(`power_${lamp.circuit}`) && !game.progress.hasFlag(flag(lamp.id));

  function show(lamp) {
    lamp.light.visible = lamp.lit;
    lamp.glow.off = !lamp.lit; // a lit lamp steadies the mind like any light (sanity/meter.js)
    lamp.bulb.material.color.setHex(lamp.lit ? LIT : DEAD);
  }

  function setup(level) {
    lamps = level.lamps.map((data) => {
      const position = new THREE.Vector3(data.at[0] * level.cellSize, HEIGHT, data.at[1] * level.cellSize);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), new THREE.MeshBasicMaterial({ color: LIT }));
      const flex = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.5, 0.01), new THREE.MeshBasicMaterial({ color: 0x1a1a1a }));
      flex.position.y = 0.3;
      bulb.add(flex);
      bulb.position.copy(position);
      const light = new THREE.PointLight('#ffd49a', 6, 9, 1.3);
      light.position.set(position.x, HEIGHT - 0.15, position.z);
      game.world.levelGroup.add(bulb, light);
      const glow = { type: 'point', at: data.at, distance: 9, intensity: 6, off: true };
      level.lights.push(glow);
      const lamp = { id: data.id, room: data.room, circuit: data.circuit, position, bulb, light, glow, lit: burns(data) };
      show(lamp);
      return lamp;
    });
  }

  function set(id, lit) {
    const lamp = lamps.find((entry) => entry.id === id);
    if (!lamp || lamp.lit === lit) return;
    lamp.lit = lit;
    game.progress.setFlag(flag(id));
    show(lamp);
    game.events.emit(lit ? 'lamp.lit' : 'lamp.out', { id, position: lamp.position.clone() });
  }

  game.events.on('level.loaded', setup);

  return {
    all: () => lamps,
    lit: () => lamps.filter((lamp) => lamp.lit),
    litIn: (room) => lamps.some((lamp) => lamp.lit && lamp.room === room),
    snuff: (id) => set(id, false),
    // For Nora's tape (cutscenes/tape.js): a lamp as it looked when she
    // filmed, story untouched; refresh() shows them all as they are now.
    film(id, lit) {
      const lamp = lamps.find((entry) => entry.id === id);
      if (!lamp) return;
      lamp.light.visible = lit;
      lamp.bulb.material.color.setHex(lit ? LIT : DEAD);
    },
    refresh: () => lamps.forEach(show),
    // The fuse board: a circuit gets its fuse (every lamp on it burns again) or loses it.
    power(circuit, on) {
      for (const lamp of lamps.filter((entry) => entry.circuit === circuit)) {
        if (on) game.progress.clearFlag(flag(lamp.id));
        lamp.lit = burns(lamp);
        show(lamp);
      }
      game.events.emit('lamps.power', { circuit, on });
    },
    // 'none' (no lamps on it), 'lit', or 'out' (she has put them all out).
    circuitState(circuit) {
      const on = lamps.filter((entry) => entry.circuit === circuit);
      return !on.length ? 'none' : on.some((lamp) => lamp.lit) ? 'lit' : 'out';
    },
  };
}
