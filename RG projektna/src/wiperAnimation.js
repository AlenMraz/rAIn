// Define speed levels
const speedLevels = {
  low: Math.PI / 4,   // Slow speed (quarter of a full rotation per second)
  medium: Math.PI / 2, // Normal speed (half of a full rotation per second)
  high: Math.PI,     // Faster speed (full rotation per second)
  not: 0,          // No movement
};

function animateWiper(wipers, speedSetting) {
  console.log('Speed setting:', speedSetting);
  // Get the speed based on the selected setting
  const speed = speedLevels[speedSetting] || speedLevels.not; // Default to stopped
  
  // Loop through all wipers in the scene
  wipers.forEach((wiper) => {
    // Maximum rotation angle (90 degrees or π/2 radians)
    const maxAngle = Math.PI / 2;
    const time = Date.now() * 0.001; // Time in seconds for smooth oscillation

    // If speed is set to 0 (stopped), don't apply any movement
    if (speed === 0) {
      wiper.rotation.x = 0; // Keep wiper at horizontal position
    } else {
      // Oscillate the wiper using sine function
      const rotationAngle = -Math.abs(maxAngle * Math.sin(speed * time));

      // Apply rotation to the wiper
      wiper.rotation.x = rotationAngle;
    }
  });
}

export { animateWiper };
