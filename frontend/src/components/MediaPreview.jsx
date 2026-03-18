export default function MediaPreview({ media }) {
  if (!media) return null;

  return (
    <div style={{ width: '100%', maxWidth: '640px', marginTop: '2rem' }}>

      {/* Thumbnail */}
      {media.thumbnail && (
        <img
          src={media.thumbnail}
          alt="Preview"
          style={{ width: '100%', borderRadius: '12px', display: 'block' }}
        />
      )}

      {/* Info */}
      <div style={{ marginTop: '1rem' }}>
        <p style={{ fontWeight: 600 }}>{media.title}</p>
        {media.totalItems > 1 && (
          <p style={{ fontSize: '0.85rem', color: '#888' }}>
            {media.totalItems} videos found in this post
          </p>
        )}
      </div>

    </div>
  );
}