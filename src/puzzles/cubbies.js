// Puzzle 2 (playroom): the toys are scattered about the wing. Drawings on the
// playroom walls show which child owned which toy; put each toy in its
// owner's cubby. When all are home, the west dorm's bolt slides back.
// Level data: "puzzles": { "cubbies": { "prop": "<cubbies prop id>",
//   "labels": [12 names, left to right, top row first],
//   "answer": { toyItem: NAME }, "unlocks": "<door id>" } }
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { decal, cachedPlateTexture } from '../props/parts.js';
import { itemText } from '../items/catalog.js';

const STATE_KEY = 'cubbies';
const SOLVED = 'puzzle_toys';
const TOY_MODELS = { toy_ball: 'toyBall', toy_doll: 'toyDoll', toy_top: 'toyTop' };

// Compartment i (0..11): 4 across, 3 high, top row first; cubby-local metres.
function compartment(i) {
  const col = i % 4;
  const row = 2 - Math.floor(i / 4);
  return { x: -0.6 + col * 0.4, floor: row * 0.4 + 0.035, top: (row + 1) * 0.4 };
}

export function cubbiesPuzzle(game, level, data) {
  const { progress, inventory, i18n } = game;
  let cubbies = null;
  game.world.levelGroup.traverse((object) => {
    if (object.userData.prop?.id === data.prop) cubbies = object;
  });
  cubbies.updateWorldMatrix(true, false);
  const contents = progress.getValue(STATE_KEY, {});
  const toyMeshes = new Map();

  data.labels.forEach((name, i) => {
    const { x, top } = compartment(i);
    cubbies.add(decal(cachedPlateTexture(name), [0.37, 0.093], [x, top - 0.06, 0.18]));
  });

  function showToy(i) {
    if (toyMeshes.has(i)) cubbies.remove(toyMeshes.get(i));
    toyMeshes.delete(i);
    if (!contents[i]) return;
    const { x, floor } = compartment(i);
    const mesh = PROPS[TOY_MODELS[contents[i]]](game.world.textures);
    mesh.position.set(x, floor, -0.02);
    cubbies.add(mesh);
    toyMeshes.set(i, mesh);
  }
  data.labels.forEach((name, i) => showToy(i));

  const toyToPlace = () => {
    const selected = inventory.selectedItem();
    if (selected in data.answer) return selected;
    return inventory.items().find((id) => id in data.answer) ?? null;
  };

  function checkSolved() {
    const home = Object.entries(data.answer).every(([toy, name]) => contents[data.labels.indexOf(name)] === toy);
    if (!home || progress.hasFlag(SOLVED)) return;
    progress.setFlag(SOLVED);
    const door = level.doors.find((d) => d.id === data.unlocks);
    door.locked = null;
    progress.unlock(door.id);
    game.messages.show('msg.toysSolved', null, 5);
    game.events.emit('puzzle.solved', 'toys');
    game.events.emit('checkpoint');
  }

  return data.labels.map((name, i) => {
    const { x, floor } = compartment(i);
    return {
      position: cubbies.localToWorld(new THREE.Vector3(x, floor + 0.15, 0.05)),
      radius: 0.18,
      prompt() {
        if (progress.hasFlag(SOLVED)) return null;
        if (contents[i]) return { key: 'prompt.take', params: { item: itemText(i18n, contents[i]) } };
        const toy = toyToPlace();
        // The label is too small to read on screen: the prompt names the owner.
        return toy ? { key: 'prompt.placeToy', params: { item: itemText(i18n, toy), name } } : { key: 'prompt.cubby', params: { name } };
      },
      use() {
        if (contents[i]) {
          if (!inventory.add(contents[i])) return game.messages.show('msg.inventoryFull');
          contents[i] = null;
        } else {
          const toy = toyToPlace();
          if (!toy) return game.messages.show('msg.cubbyEmpty');
          inventory.remove(toy);
          contents[i] = toy;
        }
        game.events.emit('toy.moved', i);
        showToy(i);
        progress.setValue(STATE_KEY, contents);
        checkSolved();
      },
    };
  });
}
