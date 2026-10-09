// PS1-style material: Lambert lighting plus two vertex-stage tricks.
// 1. Vertex snap: screen positions round to the low-res pixel grid (wobble).
// 2. Affine texture mapping: UVs are interpolated without perspective
//    correction (warp). Done by passing uv*w and w, then dividing per pixel.
import * as THREE from 'three';

export const ps1Uniforms = {
  uSnapResolution: { value: new THREE.Vector2(320, 180) },
  uSnapEnabled: { value: 1 },
  uAffineEnabled: { value: 1 },
};

const VERTEX_HEADER = /* glsl */ `
uniform vec2 uSnapResolution;
uniform float uSnapEnabled;
uniform float uAffineEnabled;
varying float vAffineW;
`;

const VERTEX_SNAP = /* glsl */ `
if (uSnapEnabled > 0.5 && gl_Position.w > 0.0) {
  vec4 snapped = gl_Position;
  snapped.xy /= snapped.w;
  vec2 halfRes = uSnapResolution * 0.5;
  snapped.xy = floor(snapped.xy * halfRes + 0.5) / halfRes;
  snapped.xy *= snapped.w;
  gl_Position = snapped;
}
vAffineW = uAffineEnabled > 0.5 ? max(gl_Position.w, 0.0001) : 1.0;
#ifdef USE_MAP
  vMapUv *= vAffineW;
#endif
`;

const FRAGMENT_HEADER = /* glsl */ `
varying float vAffineW;
`;

const FRAGMENT_MAP = /* glsl */ `
#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv / vAffineW);
  diffuseColor *= sampledDiffuseColor;
#endif
`;

// options.unlit: no lighting (glowing lamps, ghosts); other options pass
// straight to the Three.js material (color, transparent, opacity…).
export function createPs1Material(map, { unlit = false, ...options } = {}) {
  const Material = unlit ? THREE.MeshBasicMaterial : THREE.MeshLambertMaterial;
  const material = new Material({ map, ...options });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, ps1Uniforms);
    shader.vertexShader = VERTEX_HEADER + shader.vertexShader.replace(
      '#include <project_vertex>',
      `#include <project_vertex>\n${VERTEX_SNAP}`,
    );
    shader.fragmentShader = FRAGMENT_HEADER + shader.fragmentShader.replace('#include <map_fragment>', FRAGMENT_MAP);
  };
  material.customProgramCacheKey = () => (unlit ? 'ps1-unlit' : 'ps1');
  return material;
}
