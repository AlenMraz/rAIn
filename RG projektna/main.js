import GUI from "three/addons/libs/lil-gui.module.min.js";
import { loadGLTF, loadOBJ } from "./src/loaders.js";
import { animateRain } from "./src/rainAnimation.js";
import { initScene } from "./src/scene.js";
import { initRain } from "./src/rain.js";
import { takePictureFromCamera } from "./src/camera.js";
import { Controler } from "./src/controler.js";
// Scene Initialization
const { scene, camera, cameraCamera, renderer, stats, controls } = initScene();

// Rain Setup
let rainParticles = [];
let rainCount = 1000; // Default rain count
let rainSettings = { count: rainCount };
let droplets = [];


function updateRain(newCount) {
  scene.remove(rainParticles);

  const { rain } = initRain(scene, newCount);
  rainParticles = rain;

  console.log(`Rain count updated to: ${newCount}`);
}

const { rain } = initRain(scene, rainCount);
rainParticles = rain;

// GUI Setup
const gui = new GUI({ width: 500 });
gui.add(rainSettings, "count", 0, 5000, 100) // Slider for rain count
  .name("Rain Count")
  .onChange((value) => {
    updateRain(Math.round(value));
  });

// Loaders and Model Setup
let model_car;

// Track Loading Completion
const loadingTasks = [
  loadGLTF(scene, "/avto.glb", {
    position: { x: 0, y: 1, z: 0 },
    scale: { x: 0.5, y: 0.5, z: 0.5 },
    rotation: { x: 0, y: 0, z: 0 },
  }).then((model) => {
    model_car = model;
  }),
  loadOBJ(scene, "/Straight.obj", "Straight", {
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 0, z: 0 },
  }),
  // loadOBJ(scene, "/brisalec.obj", "Brisalec", {
  //   position: { x: 0.6, y: 2, z: -1.1 },
  //   scale: { x: 1, y: 1, z: 1 },
  //   rotation: { x: -0.2, y: -0.5, z: 5 },
  // }),
];

Promise.all(loadingTasks).then(() => {
  console.log("All objects loaded, starting animation loop");
  renderer.setAnimationLoop(animate);
  Controler(cameraCamera, renderer, scene, model_car);
});

// Animation Loop
function animate() {
  stats.begin();
  animateRain(rainParticles, model_car, scene, droplets);
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

// Capture Image Event
window.addEventListener("keydown", (event) => {
  if (event.key === "C" || event.key === "c") {
    const capturedImage = takePictureFromCamera(cameraCamera, renderer, scene);
    console.log("Picture taken from cameraPlayer");
  }
});

