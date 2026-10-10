// Puzzle 1 (east dorm): the name plates are on the wrong beds. The dorm
// register (office) says who slept in which numbered bed. Take plates off and
// put them back where they belong; when every bed is right, Tommy's crank
// for the music box rolls out from under his bed (a pickup that appearsWith
// the puzzle_plates flag).
// Level data: "puzzles": { "namePlates": { "answer": { bedId: NAME }, "start": { bedId: NAME } } }
import * as THREE from 'three';
import { decal, cachedPlateTexture } from '../props/parts.js';

const STATE_KEY = 'plates';
const SOLVED = 'puzzle_plates';
const PLATE_POS = [0, 0.55, 0.97]; // on the footboard, bed-local

function platePosition(bed) {
  bed.updateWorldMatrix(true, false);
  return bed.localToWorld(new THREE.Vector3(...PLATE_POS));
}

export function namePlatesPuzzle(game, level, data) {
  const { progress, inventory } = game;
  const beds = new Map();
  game.world.levelGroup.traverse((object) => {
    const id = object.userData.prop?.id;
    if (id && id in data.answer) beds.set(id, object);
  });
  const plates = progress.getValue(STATE_KEY, data.start);
  const meshes = new Map();

  function showPlate(bedId) {
    const bed = beds.get(bedId);
    if (meshes.has(bedId)) bed.remove(meshes.get(bedId));
    meshes.delete(bedId);
    if (!plates[bedId]) return;
    const mesh = decal(cachedPlateTexture(plates[bedId]), [0.3, 0.075], PLATE_POS);
    bed.add(mesh);
    meshes.set(bedId, mesh);
  }
  [...beds.keys()].forEach(showPlate);

  const carried = () => inventory.items().filter((id) => id.startsWith('plate_'));
  const plateToPlace = () => {
    const selected = inventory.selectedItem();
    return selected?.startsWith('plate_') ? selected : carried()[0];
  };

  function save() {
    progress.setValue(STATE_KEY, plates);
  }

  function checkSolved() {
    if (Object.entries(data.answer).some(([bed, name]) => plates[bed] !== name)) return;
    progress.setFlag(SOLVED);
    game.messages.show('msg.platesSolved', null, 5);
    game.events.emit('puzzle.solved', 'plates');
    game.events.emit('checkpoint');
  }

  return [...beds.entries()].map(([bedId, bed]) => ({
    position: platePosition(bed),
    radius: 0.4,
    prompt() {
      if (progress.hasFlag(SOLVED)) return null;
      if (plates[bedId]) return { key: 'prompt.takePlate', params: { name: plates[bedId] } };
      const plate = plateToPlace();
      return plate ? { key: 'prompt.placePlate', params: { name: plate.slice(6) } } : null;
    },
    use() {
      if (plates[bedId]) {
        if (!inventory.add(`plate_${plates[bedId]}`)) return game.messages.show('msg.inventoryFull');
        plates[bedId] = null;
        game.events.emit('plate.taken', bedId);
      } else {
        const plate = plateToPlace();
        if (!plate) return;
        inventory.remove(plate);
        plates[bedId] = plate.slice(6);
        game.events.emit('plate.placed', bedId);
      }
      showPlate(bedId);
      save();
      checkSolved();
    },
  }));
}
