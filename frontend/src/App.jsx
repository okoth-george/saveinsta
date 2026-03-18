import { useState } from 'react'
import UrlInput from './components/UrlInput'
import MediaPreview from './components/MediaPreview'
import DownloadButton from './components/DownloadButton'
import ErrorMessage from './components/ErrorMessage'
import { useDownloader } from './hooks/useDownloader'

export default function App() {
  const { status, media, error, fetchMedia, downloadFile, reset } = useDownloader()
  const [cookieFile, setCookieFile] = useState(null)
  const [cookieOpen, setCookieOpen] = useState(false)

  const handleSubmit = (url) => fetchMedia(url, cookieFile)

  const handleReset = () => {
    reset()
    setCookieFile(null)
  }

  return (
    <div className="app">

      {/* Nav */}
      <nav className="nav">
        <a href="/" className="nav-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="url(#navGrad)"/>
            <defs>
              <linearGradient id="navGrad" x1="0" y1="0" x2="28" y2="28">
                <stop stopColor="#833ab4"/>
                <stop offset="0.5" stopColor="#fd1d1d"/>
                <stop offset="1" stopColor="#fcb045"/>
              </linearGradient>
            </defs>
            <path d="M8 14l4 4 8-8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="nav-logo-text">SaveInsta</span>
        </a>
        <div className="nav-links">
          <a href="#">Features</a>
          <a href="#">How it works</a>
          <a href="#">FAQ</a>
        </div>
      </nav>

      {/* Hero */}
      <main className="hero">

        {/* Badge */}
        <div className="hero-badge">
          <span className="badge-dot"></span>
          Free · No login · No watermarks
        </div>

        <h1 className="hero-title">
          Download Instagram{' '}
          <span className="hero-title-grad">Videos & Reels</span>
          {' '}Instantly
        </h1>

        <p className="hero-sub">
          Paste any public Instagram link and save videos, reels, photos and carousels directly to your device.
        </p>

        {/* Main Glass Card */}
        <div className="glass-card">

          {/* URL Input from your component */}
          <UrlInput
            onSubmit={handleSubmit}
            loading={status === 'loading'}
          />

          {/* Supported type pills */}
          <div className="type-pills">
            {['Videos', 'Reels', 'Photos', 'Carousels', 'IGTV', 'Stories'].map(t => (
              <span key={t} className="type-pill">{t}</span>
            ))}
          </div>

          {/* ✅ Cookie upload — glassmorphism styled */}
          <div className="cookie-section">
            <button
              className="cookie-toggle"
              onClick={() => setCookieOpen(o => !o)}
              aria-expanded={cookieOpen}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Having trouble? Upload your Instagram cookies
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ marginLeft: 'auto', transform: cookieOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {cookieOpen && (
              <div className="cookie-body">
                <ol className="cookie-steps">
                  <li>
                    Install{' '}
                    <a href="https://chrome.google.com/webstore/detail/get-cookiestxt-locally" target="_blank" rel="noreferrer" className="cookie-link">
                      Get cookies.txt LOCALLY
                    </a>{' '}
                    extension in Chrome or Firefox
                  </li>
                  <li>
                    Go to{' '}
                    <a href="https://instagram.com" target="_blank" rel="noreferrer" className="cookie-link">
                      instagram.com
                    </a>{' '}
                    while logged in
                  </li>
                  <li>Click the extension icon and export <strong>cookies.txt</strong></li>
                  <li>Upload it below — used only for this download</li>
                </ol>

                <label className="cookie-upload-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  {cookieFile ? cookieFile.name : 'Choose cookies.txt file'}
                  <input
                    type="file"
                    accept=".txt"
                    style={{ display: 'none' }}
                    onChange={e => setCookieFile(e.target.files[0] || null)}
                  />
                </label>

                {cookieFile && (
                  <div className="cookie-success">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {cookieFile.name} ready
                    <button
                      className="cookie-clear"
                      onClick={() => setCookieFile(null)}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Error */}
        <ErrorMessage error={error} />

        {/* Result */}
        <MediaPreview media={media} />

        <DownloadButton media={media} onDownload={downloadFile} />

        {status === 'success' && (
          <button className="reset-btn" onClick={handleReset}>
            ← Download another
          </button>
        )}

        {/* How it works */}
        <div className="how-section">
          <h2 className="how-title">How it works</h2>
          <div className="how-grid">
            {[
              { n: '01', title: 'Copy the link', desc: 'Open Instagram and copy the link of any public post, reel, or story.' },
              { n: '02', title: 'Paste & fetch', desc: 'Paste the URL into the box above and hit Download.' },
              { n: '03', title: 'Save to device', desc: 'Preview the media and tap the download button to save it.' },
            ].map(s => (
              <div key={s.n} className="how-card">
                <div className="how-num">{s.n}</div>
                <p className="how-card-title">{s.title}</p>
                <p className="how-card-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="footer">
        <p className="footer-copy">© 2025 SaveInsta. For personal use only.</p>
        <div className="footer-links">
          <a href="#">About</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Contact</a>
        </div>
      </footer>

    </div>
  )
}
