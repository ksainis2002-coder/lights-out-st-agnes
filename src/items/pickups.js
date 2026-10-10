// Pickups and documents placed in a level, as data:
//   "pickups":   [{ "id": "washroom_key", "item": "office_key", "at": [c, r], "y": 0, "color": "#b8a060" }]
//                 "model": "crank" uses that prop instead of a plain coloured box.
//                 "appearsWith": "puzzle_plates" keeps a pickup hidden until that flag is set.
//   "documents": [{ "id": "night_duty", "at": [c, r], "y": 0.77, "rotation": 20 }]
// Using a pickup puts its item in the inventory; using a document opens it.
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { itemText } from './catalog.js';

function place(level, object, { at, y = 0, rotation = 0 }) {
  object.position.set(at[0] * level.cellSize, y, at[1] * level.cellSize);
  object.rotation.y = (rotation * Math.PI) / 180;
  return object;
}

export function createPickups(game, level, data) {
  const group = new THREE.Group();
  group.name = 'pickups';
  const usable = [];
  const { inventory, progress, journal, i18n } = game;

  const hidden = [];
  for (const pickup of data.pickups ?? []) {
    if (progress.isTaken(pickup.id)) continue;
    const mesh = place(level, PROPS[pickup.model ?? 'smallItem'](game.world.textures, { color: pickup.color }), pickup);
    const shown = () => !pickup.appearsWith || progress.hasFlag(pickup.appearsWith);
    mesh.visible = shown();
    if (!mesh.visible) hidden.push({ mesh, shown });
    group.add(mesh);
    usable.push({
      position: mesh.position.clone().setY((pickup.y ?? 0) + 0.05),
      radius: 0.25,
      prompt: () => (progress.isTaken(pickup.id) || !mesh.visible ? null : { key: 'prompt.take', params: { item: itemText(i18n, pickup.item) } }),
      use() {
        if (!inventory.add(pickup.item)) return game.messages.show('msg.inventoryFull');
        progress.take(pickup.id);
        group.remove(mesh);
        game.messages.show('msg.taken', { item: itemText(i18n, pickup.item) });
        game.events.emit('item.taken', pickup);
      },
    });
  }

  for (const doc of data.documents ?? []) {
    const mesh = place(level, PROPS.paperSheet(game.world.textures), doc);
    group.add(mesh);
    usable.push({
      position: mesh.position.clone().setY((doc.y ?? 0) + 0.02),
      radius: 0.25,
      prompt: () => ({ key: 'prompt.read' }),
      use() {
        progress.read(doc.id);
        (doc.flags ?? []).forEach((flag) => progress.setFlag(flag));
        if (journal.addDocument(doc.id)) game.messages.show('msg.journal');
        game.events.emit('document.read', doc);
        game.openScreen('document', { id: doc.id });
      },
    });
  }

  // A solved puzzle may reveal hidden pickups.
  const stopListening = game.events.on('puzzle.solved', () => hidden.forEach(({ mesh, shown }) => (mesh.visible = shown())));
  return { group, usable, dispose: stopListening };
}
