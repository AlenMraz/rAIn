import * as THREE from "three";
import { DecalGeometry } from "three/addons/geometries/DecalGeometry.js";

function animateRain(rain, loadedModel, scene, droplets) {
  const positions = rain.geometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    positions[i + 1] -= 0.1; // Simulate rain falling

    const repositioned = handleRainCollision(
      i,
      positions,
      loadedModel,
      scene,
      droplets
    );
    if (positions[i + 1] < 0 || repositioned) {
      positions[i] = Math.random() * 10 - 5;
      positions[i + 1] = Math.random() * 10 + 5;
      positions[i + 2] = Math.random() * 10 - 5;
    }
  }
  rain.geometry.attributes.position.needsUpdate = true;
}

function handleRainCollision(
  index,
  rainPositions,
  loadedModel,
  scene,
  droplets
) {
  const raycaster = new THREE.Raycaster(
    new THREE.Vector3(
      rainPositions[index],
      rainPositions[index + 1],
      rainPositions[index + 2]
    ),
    new THREE.Vector3(0, -1, 0)
  );
  const intersects = raycaster.intersectObject(loadedModel);
  if (intersects.length > 0) {
    if (intersects[0].object.id === loadedModel.children[28].id) {
      addDroplet(
        intersects[0].point,
        intersects[0].face.normal,
        loadedModel,
        scene,
        droplets
      );
    }

    return true;
  }
  return false;
}

function addDroplet(position, normal, loadedModel, scene, droplets) {
  const offset = normal.clone().multiplyScalar(0.01);
  const dropletPosition = position.clone().add(offset);

  const dropletGeometry = new THREE.CircleGeometry(
    Math.min(0.2, Math.random()) * 0.1,
    32
  );

  const dropletMaterial = new THREE.MeshStandardMaterial({
    color: 0x4444ff,
    emissive: 0xccccff,
    emissiveIntensity: 1,
    transparent: true,
    opacity: 1,
    depthWrite: true,
    side: THREE.DoubleSide,
  });

  const droplet = new THREE.Mesh(dropletGeometry, dropletMaterial);
  droplet.name = "Droplet";

  droplet.position.copy(dropletPosition);

  droplet.scale.set(1.0, 0.6, 1.0);
  droplet.lookAt(dropletPosition.clone().add(normal));
  droplet.rotateX(THREE.MathUtils.degToRad(45));

  scene.add(droplet);
  droplets.push(droplet);

  const fadeDuration = 1200;
  const fadeInterval = 10;
  let currentOpacity = dropletMaterial.opacity;

  const fadeOut = () => {
    if (currentOpacity > 0) {
      currentOpacity -= fadeInterval / fadeDuration;
      dropletMaterial.opacity = currentOpacity;
      setTimeout(fadeOut, fadeInterval);
    } else {
      scene.remove(droplet);
      droplets.splice(droplets.indexOf(droplet), 1);
    }
  };
  fadeOut();
}

export { animateRain };
