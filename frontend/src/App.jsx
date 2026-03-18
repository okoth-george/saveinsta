import { useState } from 'react';
import UrlInput from './components/UrlInput';
import MediaPreview from './components/MediaPreview';
import DownloadButton from './components/DownloadButton';
import ErrorMessage from './components/ErrorMessage';
import { useDownloader } from './hooks/useDownloader';

export default function App() {
  const { status, media, error, fetchMedia, downloadFile, reset } = useDownloader();
  const [cookieFile, setCookieFile] = useState(null);

  // ✅ Wrap fetchMedia to pass cookieFile along
  const handleSubmit = (url) => {
    fetchMedia(url, cookieFile);
  };

  const handleReset = () => {
    reset();
    setCookieFile(null);
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1>Instagram Downloader</h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        Paste any public Instagram reel, video, or post URL
      </p>

      <UrlInput
        onSubmit={handleSubmit}
        loading={status === 'loading'}
      />

      {/* ✅ Cookies upload section */}
      <details style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#888' }}>
        <summary style={{ cursor: 'pointer', userSelect: 'none' }}>
          Having trouble downloading? Upload your Instagram cookies
        </summary>
        <div style={{
          marginTop: '0.75rem', padding: '1rem',
          background: '#f9f9f9', borderRadius: '8px',
          lineHeight: 1.8
        }}>
          <p>1. Install <a href="https://chrome.google.com/webstore/detail/get-cookiestxt-locally" target="_blank" rel="noreferrer">Get cookies.txt LOCALLY</a> extension</p>
          <p>2. Go to <a href="https://instagram.com" target="_blank" rel="noreferrer">instagram.com</a> while logged in</p>
          <p>3. Click the extension icon and export <strong>cookies.txt</strong></p>
          <p>4. Upload it below — it is used only for this download and deleted immediately</p>
          <input
            type="file"
            accept=".txt"
            onChange={e => setCookieFile(e.target.files[0] || null)}
            style={{ marginTop: '0.5rem', display: 'block' }}
          />
          {cookieFile && (
            <p style={{ color: 'green', marginTop: '4px' }}>
              ✓ {cookieFile.name} ready
            </p>
          )}
        </div>
      </details>

      <ErrorMessage error={error} />
      <MediaPreview media={media} />
      <DownloadButton media={media} onDownload={downloadFile} />

      {status === 'success' && (
        <button
          onClick={handleReset}
          style={{
            marginTop: '1rem', background: 'transparent',
            border: 'none', cursor: 'pointer', color: '#888'
          }}
        >
          Download another
        </button>
      )}
    </div>
  );
}