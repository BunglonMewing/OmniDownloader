document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('download-form');
    const urlInput = document.getElementById('video-url');
    const downloadBtn = document.getElementById('download-btn');
    const statusMessage = document.getElementById('status-message');

    const API_ENDPOINT = 'https://social-media-video-downloader-test-production.up.railway.app/download';
    const CORS_PROXY = 'https://api.codetabs.com/v1/proxy?quest=';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const videoUrl = urlInput.value;
        const format = document.querySelector('input[name="format"]:checked').value;

        if (!videoUrl) {
            showStatus('URL tidak boleh kosong!', 'error');
            return;
        }

        setLoading(true);
        showStatus('', '');

        try {
            const apiFormat = format === 'audio' ? 'bestaudio' : 'best';
            const targetUrl = `${API_ENDPOINT}?url=${encodeURIComponent(videoUrl)}&format=${apiFormat}`;
            const apiUrl = `${CORS_PROXY}${targetUrl}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                let errorMsg = 'Gagal menghubungi API. Coba lagi nanti.';
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.detail) {
                       errorMsg = errorData.detail;
                    }
                } catch(e) {
                    // response was not json, use default error.
                }
                throw new Error(errorMsg);
            }

            let filename = 'download';
            const disposition = response.headers.get('content-disposition');
            if (disposition && disposition.includes('attachment')) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            const blob = await response.blob();

            downloadFile(blob, filename);

            showStatus('Download dimulai!', 'success');

        } catch (error) {
            console.error(error);
            showStatus(`Error: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        downloadBtn.disabled = isLoading;
        downloadBtn.classList.toggle('loading', isLoading);
    }

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = type; // 'error' or 'success'
    }

    function downloadFile(blob, filename) {
        const fileUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = fileUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(fileUrl);
        document.body.removeChild(a);
    }
});
