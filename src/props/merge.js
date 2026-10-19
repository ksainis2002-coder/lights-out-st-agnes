// Merges the meshes of props that never change (furniture, rugs, shelves)
// into one mesh per material, so a furnished level costs a handful of draw
// calls instead of hundreds (integrated graphics, 60 fps target).
// Props stay as they are when something finds or moves them later: any prop
// with an id (puzzles, the bot and tests look them up), "live": true in level
// data, and props holding lights, lines, points or clock hands.
// Transparent parts (wall marks, glass, cloth) are not merged: each stays its
// own mesh at its own place, so it still sorts correctly against ghosts.
// Props built twice for a move (props/moves.js) merge into a group per pose,
// so the pose not in use can be hidden as one; the "before" pose shows first.
import * as THREE from 'three';

function staysLive(object) {
  const prop = object.userData.prop;
  if (!prop || prop.id || prop.live) return true;
  let live = false;
  object.traverse((child) => {
    if (child.isLight || child.isLine || child.isPoints || child.userData.clockHands) live = true;
  });
  return live;
}

function shown(mesh, root) {
  for (let node = mesh; node && node !== root.parent; node = node.parent) if (!node.visible) return false;
  return true;
}

// The mesh's triangles in group space, as flat arrays.
function baked(mesh) {
  const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
  geometry.applyMatrix4(mesh.matrixWorld);
  const count = geometry.attributes.position.count;
  return {
    count,
    position: geometry.attributes.position.array,
    normal: geometry.attributes.normal.array,
    uv: geometry.attributes.uv?.array ?? new Float32Array(count * 2),
  };
}

function mergedMesh(material, parts) {
  const total = parts.reduce((sum, part) => sum + part.count, 0);
  const position = new Float32Array(total * 3);
  const normal = new Float32Array(total * 3);
  const uv = new Float32Array(total * 2);
  let offset = 0;
  for (const part of parts) {
    position.set(part.position, offset * 3);
    normal.set(part.normal, offset * 3);
    uv.set(part.uv, offset * 2);
    offset += part.count;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normal, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'static-props';
  return mesh;
}

// A transparent part keeps its geometry, placed where it was in the world.
function standalone(mesh) {
  const copy = new THREE.Mesh(mesh.geometry, mesh.material);
  mesh.matrixWorld.decompose(copy.position, copy.quaternion, copy.scale);
  return copy;
}

// Where one pose of the moved props merges: a group of its own, shown or hidden as one.
function poseGroup(group, set) {
  if (!set) return group;
  const pose = new THREE.Group();
  pose.name = `props:${set.flag}:${set.moved ? 'moved' : 'before'}`;
  pose.userData.set = set;
  pose.visible = !set.moved;
  group.add(pose);
  return pose;
}

export function mergeStaticProps(group) {
  group.updateMatrixWorld(true);
  const sets = new Map(); // "" or flag:pose → { set, byMaterial, loose }
  const bucket = (set) => {
    const key = set ? `${set.flag}:${set.moved}` : '';
    if (!sets.has(key)) sets.set(key, { set, byMaterial: new Map(), loose: [] });
    return sets.get(key);
  };
  for (const object of [...group.children]) {
    if (staysLive(object)) {
      if (object.userData.set?.moved) object.visible = false;
      continue;
    }
    const { byMaterial, loose } = bucket(object.userData.set);
    object.traverse((child) => {
      if (!child.isMesh || !shown(child, object)) return;
      if (child.material.transparent) return loose.push(standalone(child));
      if (!byMaterial.has(child.material)) byMaterial.set(child.material, []);
      byMaterial.get(child.material).push(baked(child));
    });
    group.remove(object);
  }
  for (const { set, byMaterial, loose } of sets.values()) {
    const target = poseGroup(group, set);
    for (const [material, parts] of byMaterial) target.add(mergedMesh(material, parts));
    loose.forEach((mesh) => target.add(mesh));
  }
  return group;
}
