import { useState, useRef } from 'react';

export default function UrlInput({ onSubmit, loading }) {
  const [url, setUrl] = useState('');
  const inputRef = useRef();

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {
      inputRef.current?.focus();
    }
  }

  function handleSubmit() {
    if (url.trim()) onSubmit(url.trim());
  }

  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%' }}>
      <input
        ref={inputRef}
        type="url"
        value={url}
        onChange={e => setUrl(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        placeholder="Paste Instagram URL here..."
        style={{ flex: 1, minWidth: '200px' }}
      />
      <button onClick={handlePaste} disabled={loading}>
        Paste
      </button>
      <button onClick={handleSubmit} disabled={loading || !url.trim()}>
        {loading ? 'Fetching...' : 'Download'}
      </button>
    </div>
  );
}