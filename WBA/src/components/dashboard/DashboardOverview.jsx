import MetricKpiCard from './MetricKpiCard';
import SeasonalForecastChart from './SeasonalForecastChart';
import useApiData from '../../services/useApiData';
import ApiStatus from '../ApiStatus';
import { SkeletonMetrics } from '../WorkspaceSkeletons';

export default function DashboardOverview({ currentUser }) {
  const { data, loading, error, reload } = useApiData('dashboard/metrics');
  const sales = currentUser.accessLevel === 'sales';
  const cards = !data ? [] : sales ? [
    ['Available to sell', data.available + ' Units'],
    ['Customer reservations', data.reserved + ' Units'],
    ['Catalog products', data.products + ' SKUs', data.stockouts + ' out of stock'],
  ] : [
    ['Monthly storage cost', '₱' + Number(data.monthlyStorageCost).toLocaleString()],
    ['Stock count mismatch', data.mismatchUnits + ' Units'],
    ['Expiry risk', '₱' + Number(data.expiryRisk).toLocaleString()],
  ];
  return <div className="wba-grid-container">
    <section aria-label="Inventory summary">
      {loading || error ? <ApiStatus loading={loading} error={error} onRetry={reload} loadingLabel="Loading inventory summary…"><SkeletonMetrics /></ApiStatus>
        : <div className="wba-top-metrics-row">{cards.map(([title, value, subtext]) => <MetricKpiCard key={title} title={title} value={value} subtext={subtext} badgeText="CURRENT" status="info" />)}</div>}
    </section>
    <section className="wba-middle-row"><SeasonalForecastChart /></section>
  </div>;
}
