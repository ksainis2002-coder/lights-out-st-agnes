// Smooth shapes for the figures (owner 2026-11-17: Dr. Venn and Nora read as
// boxes and tubes). A sweep is a tube along a curve whose oval section changes
// along it (bodies, limbs, fingers, a coat open down the front); a strap is a
// flat band with a little thickness along a path (belts, bandages, restraints);
// a sculpted head is a sphere pushed out and in by soft bumps; a hand is a
// palm and five jointed fingers.
import * as THREE from 'three';

const vector = (p) => (p.isVector3 ? p.clone() : new THREE.Vector3(...p));
const pairOf = (r) => (Array.isArray(r) ? r : [r, r]);
const seeded = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// Catmull-Rom through plain numbers, segment by segment (as the curve's getPoint).
function interpolate(values, u) {
  if (values.length === 1) return values[0];
  const f = u * (values.length - 1);
  const i = Math.min(Math.floor(f), values.length - 2);
  const t = f - i;
  const p0 = values[Math.max(i - 1, 0)], p1 = values[i], p2 = values[i + 1], p3 = values[Math.min(i + 2, values.length - 1)];
  return 0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (3 * p1 - p0 - 3 * p2 + p3) * t * t * t);
}

// One ring of the sweep: its centre, its side and front axes, its two radii.
function ringFrame(curve, u, hint) {
  const centre = curve.getPoint(u);
  const tangent = curve.getTangent(u);
  const front = hint.clone().addScaledVector(tangent, -hint.dot(tangent));
  if (front.lengthSq() < 1e-6) front.set(1, 0, 0).addScaledVector(tangent, -tangent.x);
  front.normalize();
  return { centre, tangent, front, side: new THREE.Vector3().crossVectors(front, tangent) };
}

// points: the centre line; sections: [side radius, front radius] (or one
// radius) at each point. Options: radial (sides round), steps (rings between
// two points), front (which way the section's front radius points), gap (the
// angle left open at the front, per point: a coat), shape(theta, u) (radius
// factor: folds), ragged (a torn last ring), closed (a loop), thetaStart, caps.
export function sweepGeometry(points, sections, options = {}) {
  const { radial = 8, steps = 4, front = [0, 0, 1], gap = null, shape = null, ragged = 0, closed = false, thetaStart = null, caps = true } = options;
  const curve = new THREE.CatmullRomCurve3(points.map(vector), closed, 'centripetal');
  const rings = (closed ? points.length : points.length - 1) * steps + (closed ? 0 : 1);
  const hint = vector(front).normalize();
  const radii = [0, 1].map((k) => sections.map((s) => pairOf(s)[k]));
  const random = seeded(11);
  const positions = [], uvs = [], index = [];
  for (let i = 0; i < rings; i++) {
    const u = closed ? i / rings : i / (rings - 1);
    const { centre, tangent, front: f, side } = ringFrame(curve, u, hint);
    const rx = Math.max(interpolate(radii[0], u), 0.0005), rz = Math.max(interpolate(radii[1], u), 0.0005);
    const g = gap ? Math.max(interpolate(gap, u), 0) : 0;
    const start = thetaStart ?? (gap ? Math.PI / 2 + g / 2 : -Math.PI / 2);
    const span = Math.PI * 2 - g;
    const last = !closed && i === rings - 1;
    for (let j = 0; j <= radial; j++) {
      const theta = start + (span * j) / radial;
      const k = shape ? shape(theta, u) : 1;
      const p = centre.clone().addScaledVector(side, Math.cos(theta) * rx * k).addScaledVector(f, Math.sin(theta) * rz * k);
      if (last && ragged) p.addScaledVector(tangent, (random() - 0.35) * ragged);
      positions.push(p.x, p.y, p.z);
      uvs.push(j / radial, 1 - u);
    }
  }
  const ring = radial + 1;
  for (let i = 0; i < rings - (closed ? 0 : 1); i++) {
    const next = (i + 1) % rings;
    for (let j = 0; j < radial; j++) {
      const a = i * ring + j, b = a + 1, c = next * ring + j + 1, d = next * ring + j;
      index.push(a, b, c, a, c, d);
    }
  }
  const closedRings = !gap;
  if (caps && closedRings && !closed) {
    addCap(positions, uvs, index, 0, ring, curve.getPoint(0), false);
    addCap(positions, uvs, index, (rings - 1) * ring, ring, curve.getPoint(1), true);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  if (closedRings) joinSeam(geometry, rings, ring);
  return geometry;
}

// A flat cap over an end ring (its own vertices, so the edge stays sharp).
function addCap(positions, uvs, index, first, ring, centre, atEnd) {
  const base = positions.length / 3;
  positions.push(centre.x, centre.y, centre.z);
  uvs.push(0.5, atEnd ? 0 : 1);
  for (let j = 0; j < ring; j++) {
    positions.push(...positions.slice((first + j) * 3, (first + j) * 3 + 3));
    uvs.push(j / (ring - 1), atEnd ? 0 : 1);
  }
  for (let j = 0; j < ring - 1; j++) {
    const a = base + 1 + j, b = a + 1;
    index.push(...(atEnd ? [base, a, b] : [base, b, a]));
  }
}

// The first and last vertex of a closed ring sit together: one normal for both.
function joinSeam(geometry, rings, ring) {
  const normal = geometry.attributes.normal;
  const n = new THREE.Vector3(), m = new THREE.Vector3();
  for (let i = 0; i < rings; i++) {
    const a = i * ring, b = a + ring - 1;
    n.fromBufferAttribute(normal, a).add(m.fromBufferAttribute(normal, b)).normalize();
    normal.setXYZ(a, n.x, n.y, n.z);
    normal.setXYZ(b, n.x, n.y, n.z);
  }
}

// A strap `width` wide (along `across`) and `thickness` thick along a path.
export function strapGeometry(points, width, thickness, { across = [0, 1, 0], closed = false, steps = 3 } = {}) {
  const corner = Math.SQRT1_2;
  return sweepGeometry(points, [[thickness / 2 / corner, width / 2 / corner]], {
    radial: 4, thetaStart: Math.PI / 4, front: across, closed, steps, caps: true,
  });
}

// A head from a sphere: each bump pushes the surface out (amount > 0) or in
// round a direction (`at`; `size` in radians; `stretch` makes it longer one
// way), then `scale` stretches the whole head. The face looks down +z; on its
// texture the face is in the middle (u = 0.5, up is up) and the seam at the back.
// `extra(direction)` adds to the radius factor too (a hairline, a parting).
export function sculptedHead(radius, bumps, { scale = [1, 1, 1], width = 24, height = 16, extra = null } = {}) {
  const centres = bumps.map(({ at, size, amount, stretch = [1, 1, 1] }) => ({ at: vector(at).normalize(), size, amount, stretch }));
  const surface = (d) => centres.reduce((k, { at, size, amount, stretch }) => {
    const dx = (d.x - at.x) / stretch[0], dy = (d.y - at.y) / stretch[1], dz = (d.z - at.z) / stretch[2];
    return k + amount * Math.exp(-(dx * dx + dy * dy + dz * dz) / (size * size));
  }, extra ? 1 + extra(d) : 1);
  const geometry = new THREE.SphereGeometry(1, width, height);
  geometry.rotateY(-Math.PI / 2);
  const position = geometry.attributes.position;
  const d = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    d.fromBufferAttribute(position, i).normalize();
    const r = radius * surface(d);
    position.setXYZ(i, d.x * r * scale[0], d.y * r * scale[1], d.z * r * scale[2]);
  }
  geometry.computeVertexNormals();
  joinSeam(geometry, height + 1, width + 1);
  // The point on the surface towards a direction, `out` metres off it.
  const at = (direction, out = 0) => {
    const dir = vector(direction).normalize();
    const r = radius * surface(dir);
    const normal = new THREE.Vector3(dir.x / scale[0], dir.y / scale[1], dir.z / scale[2]).normalize();
    return new THREE.Vector3(dir.x * r * scale[0], dir.y * r * scale[1], dir.z * r * scale[2]).addScaledVector(normal, out);
  };
  return { geometry, at };
}

// A patch lying over a sculpted head (a bandage, teeth): fn(s, t) gives the
// [around, up] angles (radians from the face's centre; around grows to the
// head's left, +x) for s and t from 0 to 1; it sits `out` metres off the
// surface. Its texture maps s left to right and t bottom to top.
export function headPatch(head, fn, { columns = 12, rows = 2, out = 0.004 } = {}) {
  const positions = [], uvs = [], index = [];
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= columns; c++) {
      const [around, up] = fn(c / columns, r / rows);
      const p = head.at([Math.sin(around) * Math.cos(up), Math.sin(up), Math.cos(around) * Math.cos(up)], out);
      positions.push(p.x, p.y, p.z);
      uvs.push(c / columns, r / rows);
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const a = r * (columns + 1) + c, d = a + columns + 1;
      index.push(a, a + 1, d + 1, a, d + 1, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

// A flat ribbon through control points (a lock of hair): `widths` and
// `normals` (which way its face looks) per point, or one for all. Its texture
// runs root (the canvas top) to tip (the canvas bottom), side to side across.
export function cardGeometry(points, widths, normals, { steps = 4 } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map(vector), false, 'centripetal');
  const widthList = Array.isArray(widths) ? widths : points.map(() => widths);
  const onePerPoint = Array.isArray(normals) && (Array.isArray(normals[0]) || normals[0]?.isVector3);
  const normalList = (onePerPoint ? normals : points.map(() => normals)).map(vector);
  const rings = (points.length - 1) * steps + 1;
  const positions = [], uvs = [], index = [];
  const side = new THREE.Vector3();
  for (let i = 0; i < rings; i++) {
    const u = i / (rings - 1);
    const f = u * (points.length - 1), k = Math.min(Math.floor(f), points.length - 2), t = f - k;
    const normal = normalList[k].clone().lerp(normalList[k + 1], t).normalize();
    const width = widthList[k] + (widthList[k + 1] - widthList[k]) * t;
    side.crossVectors(curve.getTangent(u), normal);
    if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
    side.normalize().multiplyScalar(width / 2);
    const centre = curve.getPoint(u);
    for (const s of [-1, 1]) {
      positions.push(centre.x + side.x * s, centre.y + side.y * s, centre.z + side.z * s);
      uvs.push((s + 1) / 2, 1 - u);
    }
  }
  for (let i = 0; i < rings - 1; i++) {
    const a = i * 2;
    index.push(a, a + 1, a + 3, a, a + 3, a + 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

// A hand at the origin: fingers along +z, palm down (-y), the thumb towards
// `thumb` (-1: -x, 1: +x). curl: how far each joint bends (0 flat, 1.3 a
// fist); spread: how far the fingers fan; length and width scale it.
export function handGroup(material, { thumb = -1, curl = 0.3, spread = 0.12, length = 1, width = 1 } = {}) {
  const palm = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), material);
  palm.scale.set(0.043 * width, 0.017, 0.052);
  palm.position.z = 0.05;
  const group = new THREE.Group();
  group.add(palm);
  [0.95, 1.05, 0.98, 0.8].forEach((size, i) => {
    const x = (i - 1.5) * 0.022 * width * -thumb; // index finger by the thumb
    const fan = (i - 1.5) * spread * -thumb;
    group.add(new THREE.Mesh(fingerGeometry([x, 0, 0.092], fan, curl, size * length), material));
  });
  const tuck = Math.min(curl, 1);
  const thumbPoints = [[thumb * 0.034, -0.006, 0.03], [thumb * 0.062, -0.014, 0.062], [thumb * (0.072 - tuck * 0.04), -0.02 - tuck * 0.02, 0.095]];
  group.add(new THREE.Mesh(sweepGeometry(thumbPoints, [0.012, 0.01, 0.008], { radial: 6, steps: 3, front: [0, 1, 0] }), material));
  return group;
}

// One finger from its knuckle: three joints, each bending down by `curl`.
function fingerGeometry(knuckle, fan, curl, length) {
  const points = [knuckle];
  [0.046, 0.03, 0.026].forEach((segment, i) => {
    const bend = curl * [0.5, 1.5, 2.5][i];
    const [x, y, z] = points[points.length - 1];
    const l = segment * length;
    points.push([x + Math.sin(fan) * Math.cos(bend) * l, y - Math.sin(bend) * l, z + Math.cos(fan) * Math.cos(bend) * l]);
  });
  return sweepGeometry(points, [0.0095, 0.0085, 0.0075, 0.006], { radial: 6, steps: 2, front: [1, 0, 0] });
}
