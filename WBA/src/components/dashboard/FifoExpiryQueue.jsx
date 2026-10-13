import useApiData from '../../services/useApiData';
import ApiStatus from '../ApiStatus';
import { SkeletonTable } from '../WorkspaceSkeletons';

export default function FifoExpiryQueue() {
  const { data, loading, error, reload } = useApiData('batches');
  if (loading || error) return <ApiStatus loading={loading} error={error} onRetry={reload} loadingLabel="Loading batch expiry tracker…"><SkeletonTable /></ApiStatus>;
  return <div className="wba-glow-card"><h3>Batch expiry tracker</h3>
    {!data.length && <p>No active batches.</p>}
    <div className="wba-table-container" tabIndex={0} role="region" aria-label="Batch expiry tracker"><table className="wba-table wba-detail-table"><thead><tr><th>Product / lot</th><th>Bin</th><th>Quantity</th><th>Received</th><th>Expires</th><th>Status</th></tr></thead><tbody>
      {data.map(batch => <tr key={batch.id}><td><strong>{batch.product}</strong><span className="wba-sku-code">{batch.lot}</span></td><td data-label="Bin">{batch.location}</td><td data-label="Quantity">{batch.quantity}</td><td data-label="Received">{batch.receivedAt}</td><td data-label="Expires">{batch.expiresAt}</td><td data-label="Status" style={{ color: batch.daysLeft < 0 ? 'var(--wba-inline-critical)' : batch.daysLeft <= 30 ? 'var(--wba-inline-warning)' : 'var(--wba-inline-good)' }}>{batch.daysLeft < 0 ? 'Expired — cannot dispatch' : batch.daysLeft + ' days left'}</td></tr>)}
    </tbody></table></div>
  </div>;
}
