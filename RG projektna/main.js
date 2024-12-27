import * as THREE from 'three';
import { OBJLoader } from 'three/addons';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import Stats from 'stats.js'

const stats = new Stats()
// the number will decide which information will be displayed
// 0 => FPS Frames rendered in the last second. The higher the number the better.
// 1 => MS Milliseconds needed to render a frame. The lower the number the better.
// 2 => MB MBytes of allocated memory. (Run Chrome with --enable-precise-memory-info)
// 3 => CUSTOM User-defined panel support.
stats.showPanel(0)

document.body.appendChild(stats.dom)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const cameraPosition = new THREE.Vector3(-1.25, 2.5, -1);
const target = new THREE.Vector3(3, 3, 0); //camera target must match controls target
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


const controls = new PointerLockControls(camera, document.body);

// Add event listeners for mouse buttons
document.body.addEventListener('mousedown', (event) => {
    if (event.button === 0) { // Left click
        controls.lock();
    } else if (event.button === 2) { // Right click
        controls.unlock();
    }
});

// Prevent the context menu from appearing on right-click
document.addEventListener('contextmenu', (event) => event.preventDefault());

controls.addEventListener('lock', () => {
    console.log('PointerLockControls: Mouse locked');
});
controls.addEventListener('unlock', () => {
    console.log('PointerLockControls: Mouse unlocked');
});

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
loadOBJ('/avto2.obj', scene,"avto", {
    position: { x: 0, y: 1, z: 0 },
    scale: { x: 0.5, y: 0.5, z: 0.5 },
    rotation: { x: 0, y: 0, z: 0 },
});
const avto = scene.getObjectByName( "avto" );
console.log(avto);

function animate() {
    stats.begin();
    //animateRain(); // Call rain animation
    renderer.render(scene, camera);
    controls.update();
    stats.end();
    requestAnimationFrame(animate);
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
