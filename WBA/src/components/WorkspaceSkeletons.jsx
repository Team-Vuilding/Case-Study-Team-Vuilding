import { Skeleton, SkeletonMetric, SkeletonText } from './SkeletonLoader';

export function SkeletonHeading() {
  return <div className="wba-skeleton-heading">
    <Skeleton width="55%" height={22} />
    <Skeleton width="80%" height={14} />
  </div>;
}

export function SkeletonSummary({ count = 3 }) {
  return <div className="wba-skeleton-summary" style={{ '--skeleton-columns': count }}>
    {Array.from({ length: count }, (_, index) => <div className="wba-glow-card wba-skeleton-summary-card" key={index}>
      <Skeleton width="65%" height={12} />
      <Skeleton width={48} height={26} />
    </div>)}
  </div>;
}

export function SkeletonMetrics() {
  return <div className="wba-top-metrics-row">
    {Array.from({ length: 3 }, (_, index) => <SkeletonMetric key={index} />)}
  </div>;
}

export function SkeletonTable({ columns = 6, rows = 4 }) {
  return <div className="wba-glow-card wba-skeleton-table">
    <SkeletonHeading />
    <div className="wba-table-container" tabIndex={-1}>
      <table className="wba-table">
        <thead><tr>{Array.from({ length: columns }, (_, index) => <th key={index}><Skeleton width="70%" height={12} /></th>)}</tr></thead>
        <tbody>{Array.from({ length: rows }, (_, row) => <tr key={row}>
          {Array.from({ length: columns }, (_, column) => <td key={column}>
            {column === 0 ? <SkeletonText lines={2} lineHeight="13px" lastLineWidth="65%" /> : <Skeleton width="75%" height={16} />}
          </td>)}
        </tr>)}</tbody>
      </table>
    </div>
  </div>;
}

export function SkeletonList({ rows = 3, avatar = false }) {
  return <div className="wba-glow-card">
    <SkeletonHeading />
    <div className="wba-skeleton-list">{Array.from({ length: rows }, (_, index) => <div className="wba-skeleton-list-row" key={index}>
      {avatar && <Skeleton width={38} height={38} circle />}
      <div className="wba-skeleton-list-copy"><SkeletonText lines={2} lastLineWidth="75%" /></div>
      <Skeleton width={64} height={24} />
    </div>)}</div>
  </div>;
}

export function SkeletonChart() {
  return <div className="wba-glow-card wba-forecast-card">
    <SkeletonHeading />
    <Skeleton width="100%" className="wba-skeleton-chart-plot" />
  </div>;
}

export function SkeletonForm() {
  return <div className="wba-skeleton-form">
    {Array.from({ length: 5 }, (_, index) => <div className="wba-skeleton-field" key={index}>
      <Skeleton width="35%" height={14} />
      <Skeleton width="100%" height={44} />
    </div>)}
    <Skeleton width={180} height={44} />
  </div>;
}
