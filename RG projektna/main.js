import GUI from "three/addons/libs/lil-gui.module.min.js";
import { loadGLTF, loadOBJ, loadOBJWithMTL } from "./src/loaders.js";
import { animateRain } from "./src/rainAnimation.js";
// import { animateWiper } from "./src/wiperAnimation.js";
import { initScene } from "./src/scene.js";
import { initRain } from "./src/rain.js";
import { takePictureFromCamera } from "./src/camera.js";
import { Controler } from "./src/controler.js";
// import { classification } from "./src/classification.js";
import { startMQTTClient } from "./src/mqtt.js";
import { Text } from "troika-three-text";
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
let classification = "not";


function updateRain(newCount) {
  scene.remove(rainParticles);

  const { rain } = initRain(scene, newCount);
  rainParticles = rain;

  console.log(`Rain count updated to: ${newCount}`);
}


const { rain } = initRain(scene, rainCount);
rainParticles = rain;
let rainValue;

// GUI Setup
const gui = new GUI({ width: 500 });
gui.add(rainSettings, "count", 0, 5000, 100) // Slider for rain count
  .name("Rain Count")
  .onChange((rainValue) => {
    updateRain(Math.round(rainValue));
  });

// Loaders and Model Setup
let model_car;
let phone;
let phoneScreen;

// Track Loading Completion
const loadingTasks = [
  loadGLTF(scene, "/avto3.glb", {
    position: { x: 0, y: 1, z: 0 },
    scale: { x: 0.5, y: 0.5, z: 0.5 },
    rotation: { x: 0, y: 0, z: 0 },
  }).then((model) => {
    model_car = model;
  }),
  loadOBJWithMTL(scene, "/straight1.obj","/straight1.mtl", "Straight", {
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 2.75, y: 1.75, z: 1.75 },
    rotation: { x: 0, y: 0, z: 0 },
  }),
  
  loadOBJWithMTL(scene, "/armaturna_plosca1.obj","/armaturna_plosca1.mtl", "armaturna_plosca", {
    position: { x: 0, y: 1.75, z: -0.9 },
    scale: { x: 1.25, y: 1.25, z: 1.25 },
    rotation: { x: 0, y: 3.9, z: 0 },
  }),
  loadOBJWithMTL(scene, "/volan3.obj","volan3.mtl", "volan", {
    position: { x: -0.3, y: 1.9, z: -0.9 },
    scale: { x: 1.25, y: 1.25, z: 1.25 },
    rotation: { x: 0, y: 3.1, z: 0 },
  }),
  
  loadOBJWithMTL(scene, "/50.obj","50.mtl", "tree", {
    position: { x: 3, y: 1, z: 4 },
    scale: { x: 0.001, y: 0.001, z: 0.001 },
    rotation: { x: 0, y: 4.0, z: 0 },
  }),

  loadOBJWithMTL(scene, "/tree.obj","tree.mtl", "tree", {
    position: { x: 12, y: 1, z: 18 },
    scale: { x: 0.3, y: 0.3, z: 0.3 },
    rotation: { x: 0, y: 4.0, z: 0 },
  }),

  loadOBJWithMTL(scene, "/house1.obj","house1.mtl", "house", {
    position: { x: 5, y: -1, z: 18 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: -3.0, z: 0 },
  }),

  loadOBJWithMTL(scene, "/house2.obj","house2.mtl", "house", {
    position: { x: 5, y: 3.5, z: -18 },
    scale: { x: 0.7, y: 1, z: 1 },
    rotation: { x: 0, y: 4.7, z: 0 },
  }),
  loadOBJWithMTL(scene, "/house2.obj","house2.mtl", "house", {
    position: { x: -25, y: 0.5, z: -18 },
    scale: { x: 0.7, y: 1, z: 1 },
    rotation: { x: 0, y: 4.7, z: 0 },
  }),

  loadOBJWithMTL(scene, "/house2.obj","house3.mtl", "house", {
    position: { x: -5, y: 3, z: -18 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 4.7, z: 0 },
  }),

  loadOBJWithMTL(scene, "/house2.obj","house3.mtl", "house", {
    position: { x: -5, y: 3, z: 18 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: -4.7, z: 0 },
  }),
  loadOBJWithMTL(scene, "/house2.obj","house3.mtl", "house", {
    position: { x: 50, y: 0, z: 18 },
    scale: { x: 0.3, y: 0.3, z: 0.3 },
    rotation: { x: 0, y: -4.7, z: 0 },
  }),


  loadOBJWithMTL(scene, "/tree.obj","tree.mtl", "tree", {
    position: { x: 12, y: 1, z: 18 },
    scale: { x: 0.3, y: 0.3, z: 0.3 },
    rotation: { x: 0, y: 4.0, z: 0 },
  }),

  loadOBJWithMTL(scene, "/kanta.obj","kanta.mtl", "tree", {
    position: { x: 12, y: 1, z: -10 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 4.0, z: 0 },
  }),
  

  loadOBJWithMTL(scene, "/tree.obj","tree.mtl", "znak", {
    position: { x: 0, y: 1, z: -20 },
    scale: { x: 0.5, y: 0.5, z: 0.5 },
    rotation: { x: 0, y: 4.0, z: 0 },
  }),
  loadOBJWithMTL(scene, "/tree.obj","tree.mtl", "znak", {
    position: { x: -10, y: 1, z: -16 },
    scale: { x: 0.5, y: 0.5, z: 0.5 },
    rotation: { x: 0, y: 4.0, z: 0 },
  }),


  loadOBJWithMTL(scene, "/brush.obj","/brush.mtl", "brush", {
    position: { x: 1, y: 1, z: 9 },
    scale: { x: 2, y: 1.5, z: 2 },
    rotation: { x: 0, y: 3.1, z: 0 },
  }),


  loadOBJWithMTL(scene, "/grass_flat.obj","/grass_flat.mtl", "grass", {
    position: { x: 1, y: -0.2, z: 9 },
    scale: { x: 5, y: 1.0, z: 5 },
    rotation: { x: 0, y: 3.1, z: 0 },
  }),

  loadOBJWithMTL(scene, "/avtomobil2.obj","avtomobil1.mtl", "avtomobil", {
    position: { x: 30, y: 0.5, z: -1.5},
    scale: { x: 0.5, y: 0.5, z: 0.5 },
    rotation: { x: 0, y: 3.1, z: 0 },
  }),
  loadOBJWithMTL(scene, "/avtomobil2.obj","/avtomobil2.mtl", "avtomobil", {
    position: { x: 60, y: 0.5, z: -0},
    scale: { x: 0.5, y: 0.5, z: 0.5 },
    rotation: { x: 0, y: 3.1, z: 0 },
  }),
  loadOBJWithMTL(scene, "/avtomobil2.obj","/avtomobil2.mtl", "avtomobil", {
    position: { x: 40, y: 0.2, z: 17},
    scale: { x: 0.24, y: 0.3, z: 0.3 },
    rotation: { x: 0, y: 1.1, z: 0 },
  }),
  loadOBJWithMTL(scene, "/menjalnik2.obj","/menjalnik2.mtl", "Menjalnik", {
    position: { x: -0.6, y: 1.8, z: -0.55 },
    scale: { x: 0.03, y: 0.03, z: 0.03 },
    rotation: { x: 0, y: 0, z: 0 },
  }),
  loadOBJWithMTL(scene, "/brisalec1.obj","/brisalec1.mtl", "Brisalec", {
    position: { x: 0.9, y: 2, z: -1.1 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: -0.3, y: -0.5, z: 5 },
  }).then((wiper) => {
    wipers.push(wiper);
  }),
  loadOBJWithMTL(scene, "/brisalec1.obj","/brisalec1.mtl", "Brisalec", {
    position: { x: 0.9, y: 2, z: -0.2 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: -0.3, y: -0.5, z: 5 },
  }).then((wiper) => {
    wipers.push(wiper);
  }),
  loadOBJWithMTL(scene, "/telefon1.obj","/telefon1.mtl", "Telefon", {
    position: { x: 0.2, y: 1.8, z: -0.4 },
    scale: { x: 0.7, y: 0.7, z: 0.7 },
    rotation: { x: 0, y: 0, z: 1.2 },
  }).then((obj) => {
    phone = obj;
    // Find the screen of the phone by traversing its children
    phone.children.forEach(child => {
      if (child.name.toLowerCase().includes("screen")) {  // Adjust according to your model structure
        phoneScreen = child;

        // Create the text mesh for the screen
        const textMesh = new Text();
        textMesh.isTextMesh = true; // Custom property to identify it later
        textMesh.fontSize = 0.1; // Adjust the font size
        textMesh.color = "white"; // Text color
        textMesh.anchorX = "center"; // Center horizontally
        textMesh.anchorY = "middle"; // Center vertically
        textMesh.position.set(0, 0.1, -0.03); // Slight offset to avoid overlapping the screen

        // Apply rotation and mirroring
        textMesh.rotation.x = Math.PI/2;  // Rotate text 90 degrees around the X-axis
        textMesh.rotation.y = 0;      // Rotate text 180 degrees around the Y-axis (for flipping)
        textMesh.rotation.z = Math.PI/2;
        textMesh.scale.set(1, -1, 1);       // Mirror the text along the X-axis (flip horizontally)
        phoneScreen.add(textMesh); // Add text to the screen
  
        // Store the textMesh reference to update it later
        phoneScreen.textMesh = textMesh;
      }
    });
  }),
];

// Track App Load Time
const appStartTime = performance.now(); // Start timer for app loading

Promise.all(loadingTasks).then(() => {
  
  const appEndTime = performance.now(); // End timer for app loading
  console.log(`App loaded in ${(appEndTime - appStartTime)}ms`);

  console.log("All objects loaded, starting animation loop");
  renderer.setAnimationLoop(animate);
  Controler(cameraCamera, renderer, scene, wipers, phoneScreen);
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
    const { capturedImage, newClassification } = takePictureFromCamera(cameraCamera, renderer, scene);
    console.log("Picture taken from cameraPlayer");
    classification = newClassification;
    console.log("Rain intensity classification:", classification);
  }
});