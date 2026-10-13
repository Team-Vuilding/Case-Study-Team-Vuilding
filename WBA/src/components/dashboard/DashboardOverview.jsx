import MetricKpiCard from './MetricKpiCard';
import SeasonalForecastChart from './SeasonalForecastChart';
import useApiData from '../../services/useApiData';
import ApiStatus from '../ApiStatus';
import { SkeletonMetrics } from '../WorkspaceSkeletons';

export default function DashboardOverview({ currentUser }) {
  const { data, loading, error, reload } = useApiData('dashboard/metrics');
  const sales = currentUser.accessLevel === 'sales';
  const icons = sales ? ['M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8', 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8', 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z']
    : ['M4 6c0-4 16-4 16 0s-16 4-16 0v6c0 4 16 4 16 0V6M4 12v6c0 4 16 4 16 0v-6', 'M12 3l10 18H2zM12 9v4M12 17h.01', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v5l3 2'];
  const cards = !data ? [] : sales ? [
    ['Available to sell', data.available + ' units'],
    ['Customer reservations', data.reserved + ' units'],
    ['Catalog products', data.products + ' SKUs', data.stockouts + ' out of stock'],
  ] : [
    ['Monthly storage cost', '₱' + Number(data.monthlyStorageCost).toLocaleString()],
    ['Stock count mismatch', data.mismatchUnits + ' units'],
    ['Expiry risk', '₱' + Number(data.expiryRisk).toLocaleString()],
  ];
  return <div className="wba-grid-container">
    <section aria-label="Inventory summary">
      {loading || error ? <ApiStatus loading={loading} error={error} onRetry={reload} loadingLabel="Loading inventory summary…"><SkeletonMetrics /></ApiStatus>
        : <div className="wba-top-metrics-row">{cards.map(([title, value, subtext], index) => <MetricKpiCard key={title} title={title} value={value} subtext={subtext} status={!sales && index === 1 && data.mismatchUnits > 0 ? 'warning' : 'info'} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icons[index]} /></svg>} />)}</div>}
    </section>
    <section className="wba-middle-row"><SeasonalForecastChart /></section>
  </div>;
}
