// Final full-screen pass. Takes the 320×180 scene and the 480×270 UI layer
// and adds the approved look: 15-bit colour with ordered dither (scene only),
// menu dimming, chroma bleed, grain, scanlines, a tracking band, vignette.
// 0.2 effects (all 0 = off): uBlur (waking, sanity), uAberration (sanity,
// in scene pixels), uEyelid (0 open … 1 closed), uVignette (extra darkening),
// uRewind (VHS rewind tearing), uFade (0 … 1 = black, for level changes).
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
uniform float uBlur;
uniform float uAberration;
uniform float uEyelid;
uniform float uVignette;
uniform float uRewind;
uniform float uFade;
varying vec2 vUv;

float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

vec3 scenePixel(vec2 uv) {
  return texture2D(tScene, (floor(uv * uSceneRes) + 0.5) / uSceneRes).rgb;
}

vec3 sceneAt(vec2 uv) {
  vec2 px = floor(uv * uSceneRes);
  vec3 c = texture2D(tScene, (px + 0.5) / uSceneRes).rgb;
  if (uBlur > 0.0) {
    vec2 d = uBlur * 2.0 / uSceneRes;
    vec3 soft = (scenePixel(uv + vec2(d.x, 0.0)) + scenePixel(uv - vec2(d.x, 0.0))
      + scenePixel(uv + vec2(0.0, d.y)) + scenePixel(uv - vec2(0.0, d.y))) * 0.25;
    c = mix(c, soft, min(uBlur, 1.0));
  }
  if (uAberration > 0.0) {
    vec2 a = vec2(uAberration / uSceneRes.x, 0.0);
    c.r = scenePixel(uv + a).r;
    c.b = scenePixel(uv - a).b;
  }
  c *= 255.0;
  float threshold = (bayer4(px) - 0.5) * 8.0 * uDither;
  c = floor(clamp(c + threshold, 0.0, 255.0) / 8.0) * 8.0 / 255.0;
  float luma = dot(c, vec3(0.299, 0.587, 0.114));
  return mix(vec3(luma), c, uSaturation) * uBrightness;
}

// The UI layer is sampled at the untorn position: VCR text stays steady.
vec3 composite(vec2 uv, vec2 uiUv) {
  vec2 uiPx = floor(uiUv * uUiRes);
  vec4 ui = texture2D(tUi, (uiPx + 0.5) / uUiRes);
  return mix(sceneAt(uv), ui.rgb, ui.a);
}

void main() {
  vec2 uv = vUv;
  float row = floor(uv.y * uUiRes.y);
  float inBand = uBand * step(abs((1.0 - uv.y) - uBandPos), 0.018);
  float tear = uRewind * step(0.82, hash(vec2(floor(row / 6.0), floor(uTime * 30.0))));
  uv.x += tear * (hash(vec2(row, uTime)) - 0.3) * 0.08 + uRewind * 0.004 * sin(row * 0.7 + uTime * 40.0);
  uv.x += inBand * (floor(hash(vec2(row, floor(uTime * 24.0))) * 6.0) - 2.0) / uUiRes.x;
  vec2 bleed = vec2(uBleed / uUiRes.x, 0.0);
  vec3 color = vec3(composite(uv - bleed, vUv - bleed).r, composite(uv, vUv).g, composite(uv + bleed, vUv + bleed).b);
  vec2 cell = floor(uv * uUiRes);
  float noise = (hash(cell + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;
  noise += inBand * 30.0 * hash(cell.yx + uTime);
  noise += uRewind * (tear * 70.0 + 12.0) * hash(cell + uTime * 3.1);
  color += noise / 255.0;
  color *= mod(row, 2.0) > 0.5 ? 0.86 : 1.0;
  vec2 v = vUv - 0.5;
  color *= 1.0 - min(1.0, dot(v, v) * (1.6 + uVignette * 4.0));
  if (uEyelid > 0.0) {
    float open = 1.0 - uEyelid;
    float lid = smoothstep(open * 0.55, open * 0.55 + 0.12, abs(v.y) + v.x * v.x * 0.6);
    color *= 1.0 - lid;
  }
  gl_FragColor = vec4(color * (1.0 - uFade), 1.0);
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
      uBlur: { value: 0 },
      uAberration: { value: 0 },
      uEyelid: { value: 0 },
      uVignette: { value: 0 },
      uRewind: { value: 0 },
      uFade: { value: 0 },
    },
  });
}
