import React from 'react';

export default function MetricKpiCard({
  title,
  tag,
  value,
  subtext,
  meterPercent,
  status = 'good',
  badgeText,
  icon,
}) {
  const getMeterColor = () => {
    switch (status) {
      case 'critical':
        return 'linear-gradient(90deg, #ef4444, #f87171)';
      case 'warning':
        return 'linear-gradient(90deg, #d97706, #fbbf24)';
      case 'info':
        return 'linear-gradient(90deg, #0284c7, #38bdf8)';
      case 'good':
      default:
        return 'linear-gradient(90deg, #059669, #34d399)';
    }
  };

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

      <div className="wba-kpi-subtext">
        <span>{subtext}</span>
      </div>

      {typeof meterPercent === 'number' && (
        <div className="wba-kpi-meter" title={`${meterPercent}% utilized`}>
          <div
            className="wba-kpi-meter-fill"
            style={{
              width: `${Math.min(100, Math.max(0, meterPercent))}%`,
              background: getMeterColor(),
            }}
          />
        </div>
      )}
    </div>
  );
}
