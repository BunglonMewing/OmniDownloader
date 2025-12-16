document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('download-form');
    const urlInput = document.getElementById('video-url');
    const downloadBtn = document.getElementById('download-btn');
    const statusMessage = document.getElementById('status-message');

    const API_ENDPOINT = 'https://api.vevioz.com/api/v1/download';
    const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

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
            const apiUrl = `${CORS_PROXY}${encodeURIComponent(API_ENDPOINT)}?url=${encodeURIComponent(videoUrl)}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error('Gagal menghubungi API. Coba lagi nanti.');
            }

            const data = await response.json();

            if (data.status !== 'ok') {
                throw new data.msg || 'Link tidak valid atau tidak didukung.';
            }

            const downloadLink = format === 'audio' ? data.mp3 : data.mp4;

            if (!downloadLink) {
                throw new Error(`Tidak ada link download untuk format ${format}.`);
            }

            // Trigger download
            downloadFile(downloadLink, data.title || 'download');
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

    function downloadFile(url, filename) {
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const fileUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = fileUrl;
                a.download = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${url.endsWith('.mp3') ? 'mp3' : 'mp4'}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(fileUrl);
                document.body.removeChild(a);
            })
            .catch(error => {
                console.error('Error fetching file:', error);
                showStatus('Gagal mengunduh file.', 'error');
            });
    }
});
