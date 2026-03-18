function formatDuration(s) {
  if (!s) return ''
  const m = Math.floor(s / 60), sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

function formatBytes(b) {
  if (!b) return ''
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)}KB`
  return `${(b / 1024 / 1024).toFixed(1)}MB`
}

export default function MediaPreview({ media, selectedFormat, onFormatChange }) {
  if (!media) return null

  return (
    <div className="result-card">

      {/* Thumbnail */}
      {media.thumbnail && (
        <div className="result-thumb-wrap">
          <img className="result-thumb" src={media.thumbnail} alt="Preview" />
          <div className="result-thumb-overlay"/>
          {media.duration && (
            <span className="result-duration">{formatDuration(media.duration)}</span>
          )}
        </div>
      )}

      <div className="result-body">
        <div className="result-header">
          <div>
            <p className="result-title">
              {media.title?.slice(0, 65)}{media.title?.length > 65 ? '…' : ''}
            </p>
            {media.uploader && (
              <p className="result-uploader">@{media.uploader}</p>
            )}
            {media.totalItems > 1 && (
              <p className="result-multi">{media.totalItems} videos in this post</p>
            )}
          </div>
          <span className={`result-badge ${media.mediaType === 'image' ? 'result-badge-image' : 'result-badge-video'}`}>
            {media.mediaType || 'video'}
          </span>
        </div>

        {/* Quality selector */}
        {media.formats?.length > 0 && onFormatChange && (
          <>
            <p className="quality-label">Quality</p>
            <div className="quality-pills">
              {media.formats.map(f => (
                <button
                  key={f.format_id}
                  className={`quality-pill${selectedFormat === f.format_id ? ' active' : ''}`}
                  onClick={() => onFormatChange(f.format_id)}
                  type="button"
                >
                  {f.resolution || f.ext?.toUpperCase()}
                  {f.filesize ? ` · ${formatBytes(f.filesize)}` : ''}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
