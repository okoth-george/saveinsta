export default function ErrorMessage({ error }) {
  if (!error) return null;
  return (
    <div style={{ color: 'red', marginTop: '1rem', padding: '1rem', border: '1px solid red', borderRadius: '8px' }}>
      {error}
    </div>
  );
}