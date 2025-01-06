import GUI from "three/addons/libs/lil-gui.module.min.js";
import { loadGLTF, loadOBJ } from "./src/loaders.js";
import { animateRain } from "./src/rainAnimation.js";
import { animateWiper } from "./src/wiperAnimation.js";
import { initScene } from "./src/scene.js";
import { initRain } from "./src/rain.js";
import { takePictureFromCamera } from "./src/camera.js";
import { Controler } from "./src/controler.js";
import { screenColor } from "./src/screen.js";
import { startMQTTClient } from "./src/mqtt.js";
// Scene Initialization
const { scene, camera, cameraCamera, renderer, stats, controls } = initScene();

//MQTT
const broker = "127.0.0.1";
const port = 8083;
const topic = "/data";

startMQTTClient(broker, port, topic);
// Rain Setup
let rainParticles = [];
let rainCount = 1000; // Default rain count
let rainSettings = { count: rainCount };
let droplets = [];
let wipers = [];


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
let phone;
let phoneScreen;

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
    loadOBJ(scene, "/armaturna_plosca.obj", "armaturna_plosca", {
    position: { x: 0, y: 1.75, z: -0.9 },
    scale: { x: 1.25, y: 1.25, z: 1.25 },
    rotation: { x: 0, y: 3.9, z: 0 },
  }),
  loadOBJ(scene, "/RG-volan.obj", "volan", {
    position: { x: -0.3, y: 1.9, z: -0.9 },
    scale: { x: 1.25, y: 1.25, z: 1.25 },
    rotation: { x: 0, y: 3.1, z: 0 },
  }),
  loadOBJ(scene, "/brisalec.obj", "Brisalec", {
    position: { x: 0.6, y: 2, z: -1.1 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: -0.3, y: -0.5, z: 5 },
  }).then((wiper) => {
    wipers.push(wiper);
  }),
  loadOBJ(scene, "/brisalec.obj", "Brisalec", {
    position: { x: 0.6, y: 2, z: -0.2 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: -0.3, y: -0.5, z: 5 },
  }).then((wiper) => {
    wipers.push(wiper);
  }),
  loadOBJ(scene, "/telefon.obj", "Telefon", {
    position: { x: 0.0, y: 1.98, z: -0.5 },
    scale: { x: 0.7, y: 0.7, z: 0.7 },
    rotation: { x: 6, y: 5.5, z: 7.2 },
  }).then((obj) => {
    phone = obj;
    // Find the screen of the phone by traversing its children
    phone.children.forEach(child => {
      if (child.name.toLowerCase().includes("screen")) {  // Adjust according to your model structure
        phoneScreen = child;
      }
    });
  }),
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
  // animate wipers
  animateWiper(wipers, "slow");
  // change screen color
  screenColor(phoneScreen, "slow");
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