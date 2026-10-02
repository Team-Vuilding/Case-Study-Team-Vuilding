export default function ApiStatus({ loading, error, onRetry }) {
  if (error) return <div className="wba-glow-card" role="alert"><p>{error}</p><button type="button" className="wba-pill-btn" onClick={onRetry}>Try again</button></div>;
  if (loading) return <div className="wba-glow-card" role="status">Loading workspace data…</div>;
  return null;
}
