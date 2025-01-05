import * as THREE from "three";
import Stats from "stats.js";
import { initControls } from "./controls.js";
import { initLighting } from "./lighting.js";

function initScene() {
  // Initialize Stats Panel
  const stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);

  // Scene Setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  // Camera Setup
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(-1.25, 2.5, -1);
  camera.lookAt(new THREE.Vector3(3, 3, 0));
  scene.add(camera);
  
  const cameraCamera = new THREE.PerspectiveCamera(
    100,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  cameraCamera.position.set(-0.5, 2, -0.25);
  cameraCamera.lookAt(new THREE.Vector3(2.5, 4.4, -0.25));
  scene.add(cameraCamera);

  // Renderer Setup
  const renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  // Lighting Setup
  initLighting(scene);
  // Pointer Lock Controls
  const controls = initControls(camera);

  return { scene, camera, cameraCamera, renderer, stats, controls };
}
export { initScene };