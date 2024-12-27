import * as THREE from 'three';
import { OBJLoader } from 'three/addons';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const cameraPosition = new THREE.Vector3(0, 5, 0);
const target = new THREE.Vector3(0, 0, 0); //camera target must match controls target
camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
camera.lookAt(target);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, -5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set( 0, 0, 0 );
controls.update();
controls.enablePan = false;
controls.enableDamping = true;

// Create raindrop geometry and material
// const rainGeometry = new THREE.BufferGeometry();
// const rainCount = 10;
// const positions = new Float32Array(rainCount * 3); // x, y, z for each raindrop
//
// for (let i = 0; i < rainCount; i++) {
//     positions[i * 3] = Math.random() * 10 - 5; // x position
//     positions[i * 3 + 1] = Math.random() * 10 + 1; // y position (start above the car)
//     positions[i * 3 + 2] = Math.random() * 10 - 5; // z position
// }
//
// rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
//
// const rainMaterial = new THREE.PointsMaterial({
//     color: 0xaaaaaa,
//     size: 0.1, // Adjust for visual appearance
//     transparent: true,
//     opacity: 0.6,
// });
//
// const rain = new THREE.Points(rainGeometry, rainMaterial);
// scene.add(rain);
//
// // Animate raindrops
// function animateRain() {
//     const positions = rainGeometry.attributes.position.array;
//     for (let i = 0; i < rainCount; i++) {
//         positions[i * 3 + 1] -= 0.1; // Move down along y-axis
//         if (positions[i * 3 + 1] < -1) { // Reset raindrop if it goes below the car
//             positions[i * 3 + 1] = Math.random() * 10 + 1; // New height
//         }
//     }
//     rainGeometry.attributes.position.needsUpdate = true; // Update geometry
// }

loadOBJ('/Straight.obj', scene,"Straight", {
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 0, z: 0 },
});
loadOBJ('/avto.obj', scene,"avto", {
    position: { x: 0, y: 1, z: 0 },
    scale: { x: 0.5, y: 0.5, z: 0.5 },
    rotation: { x: 0, y: 0, z: 0 },
});
const avto = scene.getObjectByName( "avto" );
console.log(avto);
function animate() {
    requestAnimationFrame(animate);
    //animateRain(); // Call rain animation
    renderer.render(scene, camera);
    controls.update();
}

window.addEventListener('resize', () => {
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
            object.position.set(settings.position.x, settings.position.y, settings.position.z);
            object.scale.set(settings.scale.x, settings.scale.y, settings.scale.z);
            object.rotation.set(settings.rotation.x, settings.rotation.y, settings.rotation.z);
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
