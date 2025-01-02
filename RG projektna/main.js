import { loadGLTF, loadOBJ } from "./src/loaders.js";
import { animateRain } from "./src/rainAnimation.js";
import { initScene } from "./src/scene.js";
import { initRain } from "./src/rain.js";
import { takePictureFromCamera } from "./src/camera.js";

// Scene Initialization
const { scene, camera, cameraCamera, renderer, stats, controls } = initScene();
// Rain Setup
const { rain } = initRain(scene, 1000);

// Loaders and Model Setup
let loadedModel;

// Track Loading Completion
const loadingTasks = [
  loadGLTF(scene, "/avto.glb", {
    position: { x: 0, y: 1, z: 0 },
    scale: { x: 0.5, y: 0.5, z: 0.5 },
    rotation: { x: 0, y: 0, z: 0 },
  }).then((model) => {
    loadedModel = model;
  }),
  loadOBJ(scene, "/Straight.obj", "Straight", {
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 0, z: 0 },
  }),
  
];

Promise.all(loadingTasks).then(() => {
  console.log("All objects loaded, starting animation loop");
  renderer.setAnimationLoop(animate);
});

// Animation Loop
function animate() {
  stats.begin();
  animateRain(rain, loadedModel, scene);
  renderer.render(scene, camera);
  controls.update();
  stats.end();
}
// Window Resize Handling
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "C" || event.key === "c") { // Press 'C' to take picture
    const capturedImage = takePictureFromCamera(cameraCamera, renderer, scene);
    // Example: Save the captured image to a file or send it to a server
    console.log("Picture taken from cameraPlayer");
  }
});
