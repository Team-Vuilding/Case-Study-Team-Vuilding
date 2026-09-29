import React from 'react';

const activity = [
  { label: 'Portable Inverter AC', value: '340', state: 'In stock' },
  { label: 'Air Purifier HI3', value: '68', state: 'In stock' },
  { label: 'Smart Thermostat', value: '12', state: 'Review count' },
];

export default function CardsGraphic() {
  return (
    <div className="wba-preview" aria-label="Illustration of the inventory dashboard">
      <div className="wba-preview-heading">
        <div>
          <span className="wba-preview-eyebrow">WORKSPACE PREVIEW</span>
          <h2>Inventory at a glance</h2>
        </div>
        <span className="wba-preview-live"><span /> Overview</span>
      </div>

      <div className="wba-preview-stat-grid">
        <div className="wba-preview-stat">
          <span>Products tracked</span>
          <strong>04</strong>
          <small>Across your catalog</small>
        </div>
        <div className="wba-preview-stat">
          <span>Needs attention</span>
          <strong>01</strong>
          <small>Count mismatch</small>
        </div>
      </div>

      <div className="wba-preview-list-head">
        <span>Stock overview</span>
        <span>UNITS</span>
      </div>
      <div className="wba-preview-list">
        {activity.map((item) => (
          <div className="wba-preview-row" key={item.label}>
            <div>
              <strong>{item.label}</strong>
              <small className={item.state === 'Review count' ? 'attention' : ''}>{item.state}</small>
            </div>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
