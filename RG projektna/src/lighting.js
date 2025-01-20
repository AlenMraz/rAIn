import * as THREE from "three";
function initLighting(scene) {
  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight1.position.set(5, 5, -5);
  scene.add(directionalLight1);
  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight2.position.set(5, 5, 5);
  scene.add(directionalLight2);
  const directionalLight3 = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight3.position.set(-5, 5, 0);
  scene.add(directionalLight3);
  scene.add(new THREE.AmbientLight(0x404040));
}
export { initLighting };