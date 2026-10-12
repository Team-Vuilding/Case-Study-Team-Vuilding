import { SkeletonCard } from './SkeletonLoader';

export default function ApiStatus({ loading, error, onRetry, loadingLabel = 'Loading workspace data…', children }) {
  if (error) return <div className="wba-glow-card" role="alert"><p>{error}</p><button type="button" className="wba-pill-btn" onClick={onRetry}>Try again</button></div>;
  if (loading) return (
    <div className="wba-loading-state">
      <span className="wba-loading-label" role="status">{loadingLabel}</span>
      <div aria-busy="true" aria-hidden="true">{children || <SkeletonCard />}</div>
    </div>
  );
  return null;
}
