async function sendImage(image){
    const formData = new FormData();
    formData.append('image', image);
    try {
        const response = await fetch("http://127.0.0.1:5000/upload", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            alert("Image successfully uploaded!");
        } else {
            alert("Failed to upload image.");
        }
    } catch (error) {
        console.error("Error sending image:", error);
        alert("Error sending image.");
    }
    return response;
} 
export { sendImage };