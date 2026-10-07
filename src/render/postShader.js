// Final full-screen pass. Takes the 320×180 scene and the 480×270 UI layer
// and adds the approved look: 15-bit colour with ordered dither (scene only),
// menu dimming, chroma bleed, grain, scanlines, a tracking band, vignette.
import * as THREE from 'three';

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform sampler2D tScene;
uniform sampler2D tUi;
uniform vec2 uSceneRes;
uniform vec2 uUiRes;
uniform float uTime;
uniform float uDither;
uniform float uBrightness;
uniform float uSaturation;
uniform float uGrain;
uniform float uBleed;
uniform float uBand;
uniform float uBandPos;
varying vec2 vUv;

float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

vec3 sceneAt(vec2 uv) {
  vec2 px = floor(uv * uSceneRes);
  vec3 c = texture2D(tScene, (px + 0.5) / uSceneRes).rgb * 255.0;
  float threshold = (bayer4(px) - 0.5) * 8.0 * uDither;
  c = floor(clamp(c + threshold, 0.0, 255.0) / 8.0) * 8.0 / 255.0;
  float luma = dot(c, vec3(0.299, 0.587, 0.114));
  return mix(vec3(luma), c, uSaturation) * uBrightness;
}

vec3 composite(vec2 uv) {
  vec2 uiPx = floor(uv * uUiRes);
  vec4 ui = texture2D(tUi, (uiPx + 0.5) / uUiRes);
  return mix(sceneAt(uv), ui.rgb, ui.a);
}

void main() {
  vec2 uv = vUv;
  float row = floor(uv.y * uUiRes.y);
  float inBand = uBand * step(abs((1.0 - uv.y) - uBandPos), 0.018);
  uv.x += inBand * (floor(hash(vec2(row, floor(uTime * 24.0))) * 6.0) - 2.0) / uUiRes.x;
  vec2 bleed = vec2(uBleed / uUiRes.x, 0.0);
  vec3 color = vec3(composite(uv - bleed).r, composite(uv).g, composite(uv + bleed).b);
  vec2 cell = floor(uv * uUiRes);
  float noise = (hash(cell + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;
  noise += inBand * 30.0 * hash(cell.yx + uTime);
  color += noise / 255.0;
  color *= mod(row, 2.0) > 0.5 ? 0.86 : 1.0;
  vec2 v = vUv - 0.5;
  color *= 1.0 - min(1.0, dot(v, v) * 1.6);
  gl_FragColor = vec4(color, 1.0);
}
`;

export function createPostMaterial(sceneTexture, uiTexture) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      tScene: { value: sceneTexture },
      tUi: { value: uiTexture },
      uSceneRes: { value: new THREE.Vector2(320, 180) },
      uUiRes: { value: new THREE.Vector2(480, 270) },
      uTime: { value: 0 },
      uDither: { value: 1 },
      uBrightness: { value: 1 },
      uSaturation: { value: 1 },
      uGrain: { value: 14 },
      uBleed: { value: 1 },
      uBand: { value: 0 },
      uBandPos: { value: 0.82 },
    },
  });
}
