import * as THREE from "three";
import { DecalGeometry } from "three/addons/geometries/DecalGeometry.js";

function animateRain(rain, rainPositions, loadedModel, scene) {
    const positions = rain.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] -= 0.1; // Simulate rain falling
  
      const removed = handleRainCollision(i, positions, loadedModel, scene);
      if (removed) {
        positions[i] = positions[i + 1] = positions[i + 2] = 1000; // Remove raindrop
      } else if (positions[i + 1] < 0) {
        // Reset if raindrop falls below a threshold
        positions[i] = Math.random() * 10 - 5;
        positions[i + 1] = Math.random() * 10 + 5;
        positions[i + 2] = Math.random() * 10 - 5;
      }
    }
    rain.geometry.attributes.position.needsUpdate = true;
  }
  
  function handleRainCollision(index, rainPositions, loadedModel, scene) {
    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(rainPositions[index], rainPositions[index + 1], rainPositions[index + 2]),
      new THREE.Vector3(0, -1, 0)
    );
    const intersects = raycaster.intersectObject(loadedModel);
    if (intersects.length > 0) {
      addDroplet(intersects[0].point, intersects[0].face.normal, loadedModel, scene);
      return true; // Collision detected
    }
    return false; // No collision
  }
  

function addDroplet(position, normal, loadedModel, scene) {
  const offset = normal.clone().multiplyScalar(0.01);
  const dropletPosition = position.clone().add(offset);

  const dropletGeometry = new DecalGeometry(
    loadedModel,
    dropletPosition,
    normal,
    new THREE.Vector3(0.2, 0.2, 0.2)
  );
  const dropletMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0x4444ff,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    side:  THREE.FrontSide,
  });
  const droplet = new THREE.Mesh(dropletGeometry, dropletMaterial);
  scene.add(droplet);

  setTimeout(() => scene.remove(droplet), 3000);
}
export { animateRain };
