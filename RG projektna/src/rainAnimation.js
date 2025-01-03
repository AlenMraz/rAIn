import * as THREE from "three";
import { DecalGeometry } from "three/addons/geometries/DecalGeometry.js";

function animateRain(rain,loadedModel, scene) {
  const positions = rain.geometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    positions[i + 1] -= 0.1; // Simulate rain falling

    const repositioned= handleRainCollision(
      i,
      positions,
      loadedModel,
      scene
    );
    if ((positions[i + 1] < 0) || repositioned ) {
      positions[i] = Math.random() * 10 - 5;
      positions[i + 1] = Math.random() * 10 + 5;
      positions[i + 2] = Math.random() * 10 - 5;
    }
  }
  rain.geometry.attributes.position.needsUpdate = true;
}

function handleRainCollision(index, rainPositions, loadedModel, scene) {
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
        scene
      );
    }

    return true; 
  }
  return false; 
}

function addDroplet(position, normal, loadedModel, scene) {
  const offset = normal.clone().multiplyScalar(0.01);
  const dropletPosition = position.clone().add(offset);

  const dropletGeometry = new DecalGeometry(
    loadedModel.children[28],
    dropletPosition,
    normal,
    new THREE.Vector3(0.1, 0.1, 0.1) 
  );

  //TODO: ne loada slike + ne vem ce je to najbolsi approach
  const alphaTexture = new THREE.TextureLoader().load('/assets/circle.png'); 

  alphaTexture.onLoad = () => {
    console.log('Alpha map loaded successfully!');
  };
  
  alphaTexture.onError = (err) => {
    console.error('Error loading texture:', err);
  };
  
  const dropletMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000, 
    emissive: 0x4444ff, 
    transparent: true,
    opacity: 0.8,
    alphaMap: alphaTexture, 
    depthWrite: false, 
    side: THREE.FrontSide, 
  });

  const droplet = new THREE.Mesh(dropletGeometry, dropletMaterial);
  scene.add(droplet);

  setTimeout(() => scene.remove(droplet), 3000);
}
export { animateRain };
