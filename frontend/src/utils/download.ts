/**
 * Utility to download an image from a URL.
 * Handles cross-origin issues by fetching as blob if necessary.
 */
export async function downloadImage(url: string, filename?: string) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;

        // Extract filename from URL if not provided
        const finalFilename = filename || url.split('/').pop() || 'downloaded-image.jpg';
        link.download = finalFilename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the URL object after some time
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
        console.error('Download failed:', error);
        // Fallback: Just open in a new tab if blob download fails (CORS etc)
        window.open(url, '_blank');
    }
}

/**
 * Downloads multiple images
 */
export async function downloadAllImages(urls: string[], prefix = 'quote-image') {
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const filename = `${prefix}-${i + 1}.${url.split('.').pop() || 'jpg'}`;

        // Add a small delay between downloads to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, i * 500));
        await downloadImage(url, filename);
    }
}
