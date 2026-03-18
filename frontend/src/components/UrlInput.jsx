import { useState, useRef } from 'react'

export default function UrlInput({ onSubmit, loading }) {
  const [url, setUrl] = useState('')
  const inputRef = useRef()

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText()
      setUrl(text)
      inputRef.current?.focus()
    } catch {
      inputRef.current?.focus()
    }
  }

  function handleSubmit() {
    if (url.trim()) onSubmit(url.trim())
  }

  return (
    <div className="input-row">

      {/* URL input with Instagram icon */}
      <div className="url-input-wrap">
        <svg className="url-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
          <rect x="2" y="2" width="20" height="20" rx="5"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none"/>
        </svg>
        <input
          ref={inputRef}
          className="url-input"
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Paste Instagram URL here..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="false"
        />
      </div>

      {/* Paste button */}
      <button className="btn btn-ghost" onClick={handlePaste} disabled={loading} type="button">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        Paste
      </button>

      {/* Download button */}
      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={loading || !url.trim()}
        type="button"
      >
        {loading ? (
          <><div className="spinner"></div> Fetching…</>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </>
        )}
      </button>
    </div>
  )
}
