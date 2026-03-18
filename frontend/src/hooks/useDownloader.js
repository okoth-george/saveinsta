import { useState } from 'react';
import { API_URL } from '../config';

export function useDownloader() {
  const [status, setStatus] = useState('idle');
  const [media, setMedia] = useState(null);
  const [error, setError] = useState('');

  // ✅ Now accepts optional cookieFile as second argument
  async function fetchMedia(url, cookieFile = null) {
    if (!url?.trim()) return;
    setStatus('loading');
    setError('');
    setMedia(null);

    try {
      // ✅ Always use FormData so we can optionally attach the cookie file
      const formData = new FormData();
      formData.append('url', url.trim());
      if (cookieFile) {
        formData.append('cookies', cookieFile);
      }

      const res = await fetch(`${API_URL}/api/download`, {
        method: 'POST',
        // ✅ No Content-Type header — browser sets it automatically with boundary for FormData
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) throw new Error('Cookies expired. Please upload fresh cookies.');
        if (res.status === 403) throw new Error('This post is private or unavailable.');
        if (res.status === 422) throw new Error('No downloadable video found in this post.');
        if (res.status === 429) throw new Error('Too many requests. Wait a minute and try again.');
        throw new Error(data.error || 'Something went wrong');
      }

      setMedia(data);
      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  function downloadFile(media) {
    if (!media?.downloadUrl) return;
    const a = document.createElement('a');
    a.href = `${API_URL}${media.downloadUrl}`;
    a.download = media.filename || 'instagram_video.mp4';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function reset() {
    setStatus('idle');
    setMedia(null);
    setError('');
  }

  return { status, media, error, fetchMedia, downloadFile, reset };
}