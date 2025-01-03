async function sendImage(image) {
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: image
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Server error:', error.error);
            return null;
        }

        const data = await response.json();
        return data.classification; // Return the classification
    } catch (error) {
        console.error('Network error:', error);
        return null;
    }
}
export { sendImage };