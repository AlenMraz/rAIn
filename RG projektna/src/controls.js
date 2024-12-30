import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

function initControls(camera) {
  const controls = new PointerLockControls(camera, document.body);
  document.body.addEventListener("mousedown", (event) => {
    event.button === 0 ? controls.lock() : controls.unlock();
  });
  document.addEventListener("contextmenu", (event) => event.preventDefault());
  controls.addEventListener("lock", () => console.log("PointerLockControls: Mouse locked"));
  controls.addEventListener("unlock", () => console.log("PointerLockControls: Mouse unlocked"));
  return controls;
}
export { initControls };