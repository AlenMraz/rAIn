import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

function initControls(camera) {
  const controls = new PointerLockControls(camera, document.body);

  document.addEventListener("keydown", (event) => {
    if (event.key === "I" || event.key === "i") {
      if (controls.isLocked) {
        controls.unlock();
      } else {
        controls.lock();
      }
    }
  });

  document.addEventListener("contextmenu", (event) => event.preventDefault());
  controls.addEventListener("lock", () => console.log("PointerLockControls: Mouse locked"));
  controls.addEventListener("unlock", () => console.log("PointerLockControls: Mouse unlocked"));

  return controls;
}

export { initControls };