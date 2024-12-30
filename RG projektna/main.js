import { loadGLTF, loadOBJ } from "./src/loaders.js";
import { animateRain } from "./src/rainAnimation.js";
import { initScene } from "./src/scene.js";
import { initRain } from "./src/rain.js";

// Scene Initialization
const { scene, camera, renderer, stats, controls } = initScene();
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
