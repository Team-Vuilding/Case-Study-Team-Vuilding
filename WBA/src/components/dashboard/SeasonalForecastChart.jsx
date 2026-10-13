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
    <div className="wba-chart-heading"><h3>Monthly stock activity · {new Date().getFullYear()}</h3>
    <ul className="wba-stock-legend" aria-label="Stock activity legend">
      <li className="received"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /></svg><span>Received</span></li>
      <li className="dispatched"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3m-5 5 5-5 5 5M4 16v5h16v-5" /></svg><span>Dispatched</span></li>
    </ul>
    </div>
    {!hasActivity ? <p>No stock movements yet.</p> : <>
      <div className="wba-desktop-activity">
      <svg viewBox="0 0 960 235" role="img" aria-label="Monthly received and dispatched quantities" style={{ width: '100%', minWidth: 0 }}>
        {[0, 1, 2, 3].map(index => <line key={index} x1="40" x2="930" y1={40 + index * 50} y2={40 + index * 50} stroke="var(--wba-chart-grid)" />)}
        {[0, 1, 2, 3].map(index => <text key={index} x="30" y={45 + index * 50} textAnchor="end" fontSize="12" fill="var(--wba-inline-muted)">{Math.round(maximum * (1 - index / 3))}</text>)}
        <polyline points={points('received')} fill="none" stroke="var(--wba-stock-received)" strokeWidth="3" />
        <polyline points={points('dispatched')} fill="none" stroke="var(--wba-stock-dispatched)" strokeWidth="3" strokeDasharray="8 5" />
        {data.map((month, index) => <text key={month.month} x={50 + index * 78} y="220" textAnchor="middle" fontSize="13" fill="var(--wba-inline-muted)">{month.month}</text>)}
      </svg>
      <details><summary>View monthly quantities</summary><div className="wba-table-container"><table className="wba-table"><thead><tr><th>Month</th><th>Received</th><th>Dispatched</th></tr></thead><tbody>{data.map(month => <tr key={month.month}><td>{month.month}</td><td>{month.received}</td><td>{month.dispatched}</td></tr>)}</tbody></table></div></details>
      </div>
      <ol className="wba-mobile-activity" aria-label="Monthly stock quantities">{data.map(month => <li key={month.month}>
        <span className="wba-activity-month">{month.month}</span>
        <div className="wba-activity-value received" aria-label={month.received + ' received'}><span className="wba-activity-track" aria-hidden="true"><span style={{ width: month.received / maximum * 100 + '%' }} /></span><span>{month.received}</span></div>
        <div className="wba-activity-value dispatched" aria-label={month.dispatched + ' dispatched'}><span className="wba-activity-track" aria-hidden="true"><span style={{ width: month.dispatched / maximum * 100 + '%' }} /></span><span>{month.dispatched}</span></div>
      </li>)}</ol>
    </>}
  </div>;
}
