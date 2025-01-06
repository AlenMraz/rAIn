async function sendImage(image) {
    try {
        //console.log(image);
        const byteCharacters = atob(image.split(',')[1]); 
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
            const slice = byteCharacters.slice(offset, offset + 1024);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            byteArrays.push(new Uint8Array(byteNumbers));
        }

        const byteArray = new Uint8Array(byteArrays.reduce((acc, curr) => acc.concat(Array.from(curr)), []));
        const blob = new Blob([byteArray], { type: 'image/png' });

        
        const formData = new FormData();
        formData.append('image', blob, 'image.png');

        
        //console.log('Sending image...');
        //console.log('Form Data:', formData.get('image'));
        const response = await fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: formData
        });
        

        if (!response.ok) {
            const error = await response.json();
            console.error('Server error:', error.error);
            return null;
        }

        const data = await response.json();
        console.log('Classification:', data.classification);
        return data.classification; // Return the classification
    } catch (error) {
        console.error('Network error:', error);
        return null;
    }
}
export { sendImage };