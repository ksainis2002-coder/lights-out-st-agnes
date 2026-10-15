// Pickups and documents placed in a level, as data:
//   "pickups":   [{ "id": "washroom_key", "item": "office_key", "at": [c, r], "y": 0, "color": "#b8a060" }]
//                 "model": "crank" uses that prop instead of a plain coloured box.
//                 "appearsWith": "puzzle_plates" keeps a pickup hidden until that flag is set.
//                 "lockedUntil": "puzzle_fuses" shows it (behind glass) but it can't be taken yet.
//   "documents": [{ "id": "night_duty", "at": [c, r], "y": 0.77, "rotation": 20 }]
//                 "model": "chalkSlate", "height": 1.3 for something read on a wall;
//                 "appearsWith" works as for pickups.
//   "maps":      [{ "id": "orphanage_wing", "at": [c, r], "y": 0.77, "hidden": {...} }] (see journalMap.js)
//                 "with": ["grounds"] adds more maps with it (one plan of two places);
//                 "upright": true pins it to a wall or board, facing the way "rotation" turns it.
// Using a pickup puts its item in the inventory; using a document opens it;
// taking a map adds it to the journal's MAPS page.
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { itemDef, itemText, itemShortKey } from './catalog.js';

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
      prompt() {
        if (progress.isTaken(pickup.id) || !mesh.visible) return null;
        if (pickup.lockedUntil && !progress.hasFlag(pickup.lockedUntil)) return { key: 'prompt.lockedAway' };
        return { key: 'prompt.take', params: { item: itemText(i18n, pickup.item) }, detail: itemShortKey(pickup.item) };
      },
      use() {
        if (pickup.lockedUntil && !progress.hasFlag(pickup.lockedUntil)) return game.messages.show('msg.lockedAway', null, 4);
        if (itemDef(pickup.item).tool) progress.setFlag(`tool_${pickup.item}`);
        else if (!inventory.add(pickup.item)) return game.messages.show('msg.inventoryFull');
        progress.take(pickup.id);
        group.remove(mesh);
        game.messages.show('msg.taken', { item: itemText(i18n, pickup.item) }, 2.8, itemDef(pickup.item).icon);
        game.events.emit('item.taken', pickup);
      },
    });
  }

  for (const doc of data.documents ?? []) {
    const mesh = place(level, PROPS[doc.model ?? 'paperSheet'](game.world.textures), doc);
    const shown = () => !doc.appearsWith || progress.hasFlag(doc.appearsWith);
    mesh.visible = shown();
    if (!mesh.visible) hidden.push({ mesh, shown });
    group.add(mesh);
    usable.push({
      position: mesh.position.clone().setY((doc.y ?? 0) + (doc.height ?? 0.02)),
      radius: 0.25,
      prompt: () => (mesh.visible ? { key: 'prompt.read' } : null),
      use() {
        progress.read(doc.id);
        (doc.flags ?? []).forEach((flag) => progress.setFlag(flag));
        if (journal.addDocument(doc.id)) game.messages.show('msg.journal');
        game.events.emit('document.read', doc);
        game.openScreen('document', { id: doc.id });
      },
    });
  }

  for (const map of data.maps ?? []) {
    if (journal.maps().includes(map.id)) continue;
    const sheet = PROPS.paperSheet(game.world.textures);
    if (map.upright) sheet.rotation.x = Math.PI / 2; // lying flat → facing +z
    const mesh = place(level, new THREE.Group().add(sheet), map);
    group.add(mesh);
    usable.push({
      position: mesh.position.clone().setY((map.y ?? 0) + 0.02),
      radius: 0.25,
      prompt: () => (journal.maps().includes(map.id) ? null : { key: 'prompt.takeMap', detail: 'item.map.short' }),
      use() {
        journal.addMap(map.id);
        (map.with ?? []).forEach((id) => journal.addMap(id));
        group.remove(mesh);
        game.messages.show('msg.mapTaken', null, 4);
        game.events.emit('map.taken', map);
      },
    });
  }

  // A solved puzzle (or a 'reveal' event) may show hidden pickups and documents.
  const refresh = () => hidden.forEach(({ mesh, shown }) => (mesh.visible = shown()));
  const stops = [game.events.on('puzzle.solved', refresh), game.events.on('reveal', refresh)];
  return { group, usable, dispose: () => stops.forEach((stop) => stop()) };
}
