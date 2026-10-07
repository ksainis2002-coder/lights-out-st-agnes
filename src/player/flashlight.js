// Flashlight: a spot light carried by the camera. F toggles it.
import * as THREE from 'three';

export function createFlashlight(camera) {
  const light = new THREE.SpotLight(0xfff1d6, 24, 18, 0.62, 0.65, 1.2);
  light.position.set(0.12, -0.12, 0);
  light.target.position.set(0, -0.3, -1);
  camera.add(light, light.target);
  let on = true;

  return {
    light,
    isOn: () => on,
    toggle() {
      on = !on;
      light.visible = on;
    },
  };
}
