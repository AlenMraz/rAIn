// Define speed levels
const rainIntensity = {
  slow: "yellow",   // Slow speed (quarter of a full rotation per second)
  normal: "orange", // Normal speed (half of a full rotation per second)
  fast: "red",     // Faster speed (full rotation per second)
  stopped: "green",          // No movement
};

function screenColor(screen, intensity) {
  // Check if the screen object has a valid material
  if (rainIntensity[intensity]) {
    screen.material.color.set(rainIntensity[intensity]);
  } else {
    console.warn("Invalid intensity level:", intensity);
  }
}

export { screenColor };
