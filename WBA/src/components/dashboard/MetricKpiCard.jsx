import React from 'react';

export default function MetricKpiCard({
  title,
  value,
  subtext,
  meterPercent,
  status = 'good',
  badgeText,
  icon,
}) {
  const getBadgeClass = () => {
    switch (status) {
      case 'critical':
        return 'wba-badge-critical';
      case 'warning':
        return 'wba-badge-warning';
      default:
        return 'wba-badge-good';
    }
  };

  return (
    <div className="wba-glow-card">
      <div className="wba-kpi-header">
        <div className="wba-kpi-tag-wrap">
          <span className="wba-kpi-label">{title}</span>
          {badgeText && (
            <span className={`wba-kpi-badge ${getBadgeClass()}`}>
              {badgeText}
            </span>
          )}
        </div>
        {icon && <div className="wba-kpi-icon-pill">{icon}</div>}
      </div>

      <div className="wba-kpi-metric">{value}</div>

      {subtext && <div className="wba-kpi-subtext">
        <span>{subtext}</span>
      </div>}

      {typeof meterPercent === 'number' && (
        <span className={`wba-kpi-utilization wba-kpi-utilization-${status}`}>
          {Math.min(100, Math.max(0, meterPercent))}% utilized
        </span>
      )}
    </div>
  );
}
