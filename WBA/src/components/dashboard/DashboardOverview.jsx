import MetricKpiCard from './MetricKpiCard';
import SeasonalForecastChart from './SeasonalForecastChart';
import useApiData from '../../services/useApiData';
import ApiStatus from '../ApiStatus';
import { SkeletonMetrics } from '../WorkspaceSkeletons';

export default function DashboardOverview({ currentUser }) {
  const { data, loading, error, reload } = useApiData('dashboard/metrics');
  const sales = currentUser.accessLevel === 'sales';
  const cards = !data ? [] : sales ? [
    ['Available to sell', data.available + ' Units', 'Stock after reservations and picking allocations'],
    ['Customer reservations', data.reserved + ' Units', 'Units currently reserved'],
    ['Catalog products', data.products + ' SKUs', data.stockouts + ' products have no available stock'],
  ] : [
    ['Monthly storage cost', '₱' + Number(data.monthlyStorageCost).toLocaleString(), 'Current stock × storage cost per unit'],
    ['Stock count mismatch', data.mismatchUnits + ' Units', 'Total difference between physical and ledger counts'],
    ['Expiry risk', '₱' + Number(data.expiryRisk).toLocaleString(), 'Value of expired stock and batches expiring within 30 days'],
  ];
  return <div className="wba-grid-container">
    <section aria-label="Inventory summary">
      {loading || error ? <ApiStatus loading={loading} error={error} onRetry={reload} loadingLabel="Loading inventory summary…"><SkeletonMetrics /></ApiStatus>
        : <div className="wba-top-metrics-row">{cards.map(([title, value, subtext]) => <MetricKpiCard key={title} title={title} value={value} subtext={subtext} badgeText="CURRENT" status="info" />)}</div>}
    </section>
    <section className="wba-middle-row"><SeasonalForecastChart /></section>
  </div>;
}
