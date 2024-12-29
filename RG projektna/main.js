import * as THREE from "three";
import { OBJLoader } from "three/addons";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import Stats from "stats.js";

const stats = new Stats();
// the number will decide which information will be displayed
// 0 => FPS Frames rendered in the last second. The higher the number the better.
// 1 => MS Milliseconds needed to render a frame. The lower the number the better.
// 2 => MB MBytes of allocated memory. (Run Chrome with --enable-precise-memory-info)
// 3 => CUSTOM User-defined panel support.
stats.showPanel(0);

document.body.appendChild(stats.dom);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const cameraPosition = new THREE.Vector3(-1.25, 2.5, -1);
const target = new THREE.Vector3(3, 3, 0); //camera target must match controls target
camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
camera.lookAt(target);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.alpha = true;
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, -5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Rain Particles
const rainGeometry = new THREE.BufferGeometry();
const rainCount = 10;
const rainPositions = [];

for (let i = 0; i < rainCount; i++) {
  rainPositions.push(
    Math.random() * 10 - 5,
    Math.random() * 10 + 5,
    Math.random() * 10 - 5
  );
}

rainGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(rainPositions, 3)
);
const rainMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
const rain = new THREE.Points(rainGeometry, rainMaterial);
scene.add(rain);

const controls = new PointerLockControls(camera, document.body);

// Add event listeners for mouse buttons
document.body.addEventListener("mousedown", (event) => {
  if (event.button === 0) {
    // Left click
    controls.lock();
  } else if (event.button === 2) {
    // Right click
    controls.unlock();
  }
});

// Prevent the context menu from appearing on right-click
document.addEventListener("contextmenu", (event) => event.preventDefault());

controls.addEventListener("lock", () => {
  console.log("PointerLockControls: Mouse locked");
});
controls.addEventListener("unlock", () => {
  console.log("PointerLockControls: Mouse unlocked");
});

loadOBJ("/Straight.obj", scene, "Straight", {
  position: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
  rotation: { x: 0, y: 0, z: 0 },
});
// loadOBJ('/avtomobil.obj', scene,"avto", {
//     position: { x: 0, y: 1, z: 0 },
//     scale: { x: 0.5, y: 0.5, z: 0.5 },
//     rotation: { x: 0, y: 0, z: 0 },
// });
loadOBJWithMTL("/avtomobil.obj", "/avtomobil.mtl", scene, "avto", {
  position: { x: 0, y: 1, z: 0 },
  scale: { x: 0.5, y: 0.5, z: 0.5 },
  rotation: { x: 0, y: 0, z: 0 },
});
let model;
setTimeout(() => {
    model = scene.getObjectByName("avto");
    console.log(model);
}, 1000);
console.log(model);

function animate() {
  stats.begin();
  animateRain();
  renderer.render(scene, camera);
  controls.update();
  stats.end();
  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function loadOBJ(url, scene, name, options = {}) {
  const loader = new OBJLoader();

  // Default options
  const defaultOptions = {
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 0, z: 0 },
  };

  // Merge user options with defaults
  const settings = { ...defaultOptions, ...options };

  loader.load(
    url,
    (object) => {
      // Apply transformations
      object.position.set(
        settings.position.x,
        settings.position.y,
        settings.position.z
      );
      object.scale.set(settings.scale.x, settings.scale.y, settings.scale.z);
      object.rotation.set(
        settings.rotation.x,
        settings.rotation.y,
        settings.rotation.z
      );
      object.name = name;
      // Add the object to the scene
      scene.add(object);
      console.log(`Successfully loaded ${url}`);
    },
    (xhr) => {
      console.log(`${url}: ${(xhr.loaded / xhr.total) * 100}% loaded`);
    },
    (error) => {
      console.error(`Error loading ${url}`, error);
    }
  );
}
function loadOBJWithMTL(objUrl, mtlUrl, scene, name, options = {}) {
  const mtlLoader = new MTLLoader();

  mtlLoader.load(
    mtlUrl,
    (materials) => {
      materials.preload(); // Preload the materials
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials); // Apply the materials to OBJLoader

      objLoader.load(
        objUrl,
        (object) => {
          // Apply transformations
          const defaultOptions = {
            position: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            rotation: { x: 0, y: 0, z: 0 },
          };
          const settings = { ...defaultOptions, ...options };
          object.position.set(
            settings.position.x,
            settings.position.y,
            settings.position.z
          );
          object.scale.set(
            settings.scale.x,
            settings.scale.y,
            settings.scale.z
          );
          object.rotation.set(
            settings.rotation.x,
            settings.rotation.y,
            settings.rotation.z
          );
          object.name = name;

          // Add the object to the scene
          scene.add(object);
          console.log(
            `Successfully loaded ${objUrl} with materials from ${mtlUrl}`
          );
        },
        (xhr) => {
          console.log(`${objUrl}: ${(xhr.loaded / xhr.total) * 100}% loaded`);
        },
        (error) => {
          console.error(`Error loading ${objUrl}`, error);
        }
      );
    },
    (xhr) => {
      console.log(`${mtlUrl}: ${(xhr.loaded / xhr.total) * 100}% loaded`);
    },
    (error) => {
      console.error(`Error loading ${mtlUrl}`, error);
    }
  );
}
function animateRain() {
  const positions = rain.geometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    positions[i + 1] -= 0.1; // Move down

    if (positions[i + 1] < 0) {
      // Check for collision
      const raycaster = new THREE.Raycaster(
        new THREE.Vector3(positions[i], 5, positions[i + 2]), // Start above the model
        new THREE.Vector3(0, -1, 0) // Ray pointing downward
      );

      // Debug the ray
      debugRay(raycaster);

      const intersects = raycaster.intersectObject(model);
      if (intersects.length > 0) {
        console.log("Intersection detected:", intersects[0]);
        addDroplet(intersects[0].point, intersects[0].face.normal);
      }

      // Reset Rain Position
      positions[i + 1] = Math.random() * 10 + 5;
    }
  }

  rain.geometry.attributes.position.needsUpdate = true;
}
function addDroplet(position, normal) {
  // Offset to prevent z-fighting
  const offset = normal.clone().multiplyScalar(0.01);
  const dropletPosition = position.clone().add(offset);

  // Debugging Tools
  const helper = new THREE.ArrowHelper(normal, position, 0.5, 0xff0000); // Arrow showing normal
  scene.add(helper);

  const debugSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.05),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 }) // Green sphere at intersection point
  );
  debugSphere.position.copy(position);
  scene.add(debugSphere);

  // Create Droplet (Decal)
  const dropletGeometry = new DecalGeometry(
    model,
    dropletPosition,
    normal,
    new THREE.Vector3(0.2, 0.2, 0.2)
  );
  const dropletMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0x4444ff, // Add emissive for visibility
    transparent: true,
    opacity: 0.8,
    depthWrite: false, // Prevent depth buffer conflicts
    side: THREE.DoubleSide,
  });
  const droplet = new THREE.Mesh(dropletGeometry, dropletMaterial);
  scene.add(droplet);
  droplets.push(droplet);

  // Remove Droplets After 3 Seconds
  setTimeout(() => {
    scene.remove(droplet);
    droplets = droplets.filter((d) => d !== droplet);
  }, 3000);
}

function debugRay(raycaster) {
  const rayHelper = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      raycaster.ray.origin,
      raycaster.ray.origin.clone().add(raycaster.ray.direction),
    ]),
    new THREE.LineBasicMaterial({ color: 0xff0000 })
  );
  scene.add(rayHelper);
}
