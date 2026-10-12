import useApiData from '../../services/useApiData';
import ApiStatus from '../ApiStatus';
import { SkeletonChart } from '../WorkspaceSkeletons';

export default function SeasonalForecastChart() {
  const { data, loading, error, reload } = useApiData('dashboard/activity');
  if (loading || error) return <ApiStatus loading={loading} error={error} onRetry={reload} loadingLabel="Loading monthly stock activity…"><SkeletonChart /></ApiStatus>;
  const maximum = Math.max(1, ...data.flatMap(month => [month.received, month.dispatched]));
  const points = key => data.map((month, index) => (50 + index * 78) + ',' + (190 - month[key] / maximum * 150)).join(' ');
  const hasActivity = data.some(month => month.received || month.dispatched);
  return <div className="wba-glow-card wba-forecast-card">
    <h3>Monthly stock activity · {new Date().getFullYear()}</h3>
    <p className="wba-card-desc">Recorded receipts and dispatches, including initial stock. Blue: received · Purple: dispatched.</p>
    {!hasActivity ? <p>No stock movements recorded yet.</p> : <>
      <svg viewBox="0 0 960 235" role="img" aria-label="Monthly received and dispatched quantities" style={{ width: '100%', minWidth: 280 }}>
        {[0, 1, 2, 3].map(index => <line key={index} x1="40" x2="930" y1={40 + index * 50} y2={40 + index * 50} stroke="var(--wba-chart-grid)" />)}
        <polyline points={points('received')} fill="none" stroke="#38bdf8" strokeWidth="3" />
        <polyline points={points('dispatched')} fill="none" stroke="#c084fc" strokeWidth="3" />
        {data.map((month, index) => <text key={month.month} x={50 + index * 78} y="220" textAnchor="middle" fontSize="13" fill="var(--wba-inline-muted)">{month.month}</text>)}
      </svg>
      <details><summary>View monthly quantities</summary><div className="wba-table-container"><table className="wba-table"><thead><tr><th>Month</th><th>Received</th><th>Dispatched</th></tr></thead><tbody>{data.map(month => <tr key={month.month}><td>{month.month}</td><td>{month.received}</td><td>{month.dispatched}</td></tr>)}</tbody></table></div></details>
    </>}
  </div>;
}
