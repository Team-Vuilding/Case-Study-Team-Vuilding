import React from 'react';

/**
 * Skeleton - Base primitive skeleton component with glowing dark-theme shimmer
 *
 * Props:
 * @param {string|number} width
 * @param {string|number} height
 * @param {string|number} borderRadius
 * @param {boolean} circle
 * @param {string} className
 * @param {object} style
 */
export function Skeleton({
  width,
  height,
  borderRadius,
  circle = false,
  className = '',
  style = {},
  ...props
}) {
  const inlineStyles = {
    ...(width != null ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height != null ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
    ...(borderRadius != null ? { borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius } : {}),
    ...style,
  };

  return (
    <div
      {...props}
      className={`wba-skeleton ${circle ? 'wba-skeleton-circle' : ''} ${className}`}
      style={inlineStyles}
      aria-hidden="true"
    />
  );
}

/**
 * SkeletonText - Multi-line skeleton text placeholder
 */
export function SkeletonText({
  lines = 3,
  lineHeight = '14px',
  gap = '10px',
  lastLineWidth = '60%',
  className = '',
}) {
  return (
    <div
      className={`wba-skeleton-text-group ${className}`}
      style={{ display: 'flex', flexDirection: 'column', gap }}
    >
      {Array.from({ length: lines }).map((_, idx) => {
        const isLast = idx === lines - 1;
        return (
          <Skeleton
            key={idx}
            height={lineHeight}
            width={isLast ? lastLineWidth : '100%'}
            borderRadius="4px"
          />
        );
      })}
    </div>
  );
}

/**
 * SkeletonCard - Placeholder for feature/about card
 */
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`wba-glow-card wba-skeleton-card ${className}`}>
      {/* Icon placeholder */}
      <Skeleton width="48px" height="48px" borderRadius="12px" style={{ marginBottom: '20px' }} />
      {/* Title */}
      <Skeleton width="65%" height="22px" borderRadius="6px" style={{ marginBottom: '14px' }} />
      {/* Description lines */}
      <SkeletonText lines={3} gap="8px" lastLineWidth="75%" />
    </div>
  );
}

/**
 * SkeletonHero - Full Hero Section placeholder mirroring WBA layout
 */
export function SkeletonHero({ className = '' }) {
  return (
    <div className={`wba-skeleton-hero ${className}`}>
      <div className="wba-skeleton-hero-left">
        {/* Title skeleton */}
        <Skeleton width="90%" height="52px" borderRadius="8px" style={{ marginBottom: '12px' }} />
        <Skeleton width="75%" height="52px" borderRadius="8px" style={{ marginBottom: '24px' }} />

        {/* Subtitle skeleton */}
        <Skeleton width="85%" height="18px" borderRadius="4px" style={{ marginBottom: '10px' }} />
        <Skeleton width="70%" height="18px" borderRadius="4px" style={{ marginBottom: '10px' }} />
        <Skeleton width="50%" height="18px" borderRadius="4px" style={{ marginBottom: '36px' }} />

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Skeleton width="130px" height="44px" borderRadius="9999px" />
          <Skeleton width="150px" height="24px" borderRadius="4px" />
        </div>
      </div>

      <div className="wba-skeleton-hero-right">
        {/* Layered Cards placeholder */}
        <div className="wba-skeleton-cards-mock">
          <div className="wba-skeleton-card-layer layer-1">
            <Skeleton width="100%" height="100%" borderRadius="12px" />
          </div>
          <div className="wba-skeleton-card-layer layer-2">
            <Skeleton width="100%" height="100%" borderRadius="12px" />
          </div>
          <div className="wba-skeleton-card-layer layer-3">
            <Skeleton width="100%" height="100%" borderRadius="12px" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonAboutGrid - 3-Card Grid Skeleton matching the About section
 */
export function SkeletonAboutGrid({ className = '' }) {
  return (
    <div className={`wba-skeleton-about-section ${className}`}>
      <div className="wba-skeleton-header-center">
        <Skeleton width="100px" height="24px" borderRadius="9999px" style={{ margin: '0 auto 16px' }} />
        <Skeleton width="420px" height="34px" borderRadius="8px" style={{ margin: '0 auto 12px' }} />
        <Skeleton width="560px" height="16px" borderRadius="4px" style={{ margin: '0 auto' }} />
      </div>

      <div className="wba-skeleton-grid-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

/**
 * SkeletonFeatures - Tabbed Feature Section Skeleton
 */
export function SkeletonFeatures({ className = '' }) {
  return (
    <div className={`wba-skeleton-features-section ${className}`}>
      <div className="wba-skeleton-header-center">
        <Skeleton width="90px" height="24px" borderRadius="9999px" style={{ margin: '0 auto 16px' }} />
        <Skeleton width="480px" height="34px" borderRadius="8px" style={{ margin: '0 auto 12px' }} />
        <Skeleton width="520px" height="16px" borderRadius="4px" style={{ margin: '0 auto' }} />
      </div>

      <div className="wba-skeleton-features-box">
        {/* Tabs Column */}
        <div className="wba-skeleton-tabs-col">
          <Skeleton width="100%" height="70px" borderRadius="12px" />
          <Skeleton width="100%" height="70px" borderRadius="12px" />
          <Skeleton width="100%" height="70px" borderRadius="12px" />
        </div>

        {/* Tab Content Display */}
        <div className="wba-skeleton-tab-content">
          <Skeleton width="110px" height="22px" borderRadius="9999px" style={{ marginBottom: '16px' }} />
          <Skeleton width="70%" height="30px" borderRadius="6px" style={{ marginBottom: '16px' }} />
          <SkeletonText lines={2} gap="8px" lastLineWidth="80%" />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '28px' }}>
            <Skeleton width="200px" height="36px" borderRadius="9999px" />
            <Skeleton width="180px" height="36px" borderRadius="9999px" />
            <Skeleton width="220px" height="36px" borderRadius="9999px" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonMetric - Single metric stat widget skeleton
 */
export function SkeletonMetric({ className = '' }) {
  return (
    <div className={`wba-glow-card wba-skeleton-metric-card ${className}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <Skeleton width="80px" height="14px" borderRadius="4px" />
        <Skeleton width="20px" height="20px" circle />
      </div>
      <Skeleton width="110px" height="22px" borderRadius="9999px" style={{ marginBottom: '12px' }} />
      <Skeleton width="120px" height="32px" borderRadius="6px" style={{ marginBottom: '8px' }} />
      <Skeleton width="60%" height="12px" borderRadius="4px" />
    </div>
  );
}

/**
 * Default export for the base placeholder
 */
export default Skeleton;
