export default function DownloadButton({ media, onDownload }) {
  if (!media) return null;

  return (
    <button
      onClick={() => onDownload(media)}
      style={{ marginTop: '1rem', width: '100%', padding: '1rem' }}
    >
      Download Video
    </button>
  );
}