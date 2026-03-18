export default function DownloadButton({ media, onDownload }) {
  if (!media) return null

  return (
    <div style={{ width: '100%', maxWidth: '680px', marginTop: '0' }}>
      <button className="btn-download" onClick={() => onDownload(media)} type="button">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download {media.mediaType === 'image' ? 'Photo' : 'Video'}
      </button>
    </div>
  )
}
