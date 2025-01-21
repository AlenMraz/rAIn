import * as THREE from "three";
import { VRButton } from 'three/addons/webxr/VRButton.js';
import Stats from "stats.js";
import { initControls } from "./controls.js";
import { initLighting } from "./lighting.js";

// Nastavi fiksno resolucijo
const width = window.innerWidth;  // Nastavi želeno širino
const height = window.innerHeight;  // Nastavi želeno višino

function initScene() {
  // Initialize Stats Panel
  const stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);

  // Scene Setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x766676);
  // Camera Setup
  const camera = new THREE.PerspectiveCamera(
    75,
    width / height,
    0.1,
    1000
  );
  camera.position.set(-1.25, 2.5, -1);
  camera.lookAt(new THREE.Vector3(3, 2.5, 0));
  scene.add(camera);
  
  const cameraCamera = new THREE.PerspectiveCamera(
    100,
    width / height,
    0.1,
    1000
  );
  cameraCamera.position.set(-0.5, 2, -0.25);
  cameraCamera.lookAt(new THREE.Vector3(2.5, 5.4, -0.25));
  scene.add(cameraCamera);


  // Renderer Setup
  const renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
  renderer.setSize(width, height);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);
  
  // VR setup
  document.body.appendChild( VRButton.createButton( renderer ) );

  // Lighting Setup
  initLighting(scene);
  // Pointer Lock Controls
  const controls = initControls(camera);

  return { scene, camera, cameraCamera, renderer, stats, controls };
}
export { initScene };
