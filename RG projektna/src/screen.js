function screenColor(screen, intensity, camera) {
  // Define colors and text for the classification
  const rainIntensity = {
    not: { color: "green", text: "N" },
    drizzle: { color: "yellow", text: "L" },
    mid: { color: "orange", text: "M" },
    high: { color: "red", text: "H" },
  };

  const intensityData = rainIntensity[intensity];
  if (intensityData) {
    // Update screen color
    screen.material.color.set(intensityData.color);

    // Update the text on the screen
    if (screen.textMesh) {
      screen.textMesh.text = intensityData.text; // Update text mesh
      screen.textMesh.sync();  // Sync the text mesh to render the updated text
    }
  } else {
    console.warn("Invalid intensity level:", intensity);
  }
}


// Export the function
export { screenColor };
