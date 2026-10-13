import useApiData from '../../services/useApiData';
import ApiStatus from '../ApiStatus';
import { SkeletonTable } from '../WorkspaceSkeletons';

export default function ArchivedProducts({ onRestore, onDelete, onReports }) {
  const { data, loading, error, reload } = useApiData('items/archived');
  if (loading || error) return <ApiStatus loading={loading} error={error} onRetry={reload} loadingLabel="Loading archived products…"><SkeletonTable columns={5} /></ApiStatus>;

  return <section className="wba-glow-card">
    <div className="wba-card-title-group"><h3>Archived products</h3></div>
    {!data.length ? <p className="wba-product-empty">No archived products.</p> : <div className="wba-table-container"><table className="wba-table">
      <thead><tr><th>Product</th><th>Archived on</th><th>Archived by</th><th>Reason</th><th>Actions</th></tr></thead>
      <tbody>{data.map(item => <tr key={item.id}>
        <td><strong className="wba-sku-name">{item.name}</strong><span className="wba-sku-code">{item.sku}</span></td>
        <td><time dateTime={item.archivedAt}>{new Date(item.archivedAt).toLocaleDateString()}</time></td>
        <td>{item.archivedBy}</td>
        <td className="wba-product-archive-reason">{item.archiveReason}</td>
        <td><div className="wba-product-row-actions">
          {item.reportCount > 0 && <button type="button" className="wba-pill-btn" onClick={() => onReports(item)} aria-label={'View reports for ' + item.name}>Reports ({item.reportCount})</button>}
          <button type="button" className="wba-pill-btn" onClick={() => onRestore(item)} aria-label={'Restore ' + item.name}>Restore</button>
          {item.canDelete && <button type="button" className="wba-pill-btn wba-product-delete-link" onClick={() => onDelete(item)} aria-label={'Delete ' + item.name + ' permanently'}>Delete permanently</button>}
        </div></td>
      </tr>)}</tbody>
    </table></div>}
  </section>;
}
