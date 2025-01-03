import * as THREE from "three";
function initLighting(scene) {
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, -5);
  scene.add(directionalLight);
  scene.add(new THREE.AmbientLight(0x404040));
}
export { initLighting };