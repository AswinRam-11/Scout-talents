// AnalyticsPanel.jsx
import React from 'react';
import ComparisonChart from './ComparisonChart';
import StatsGrid from './StatsGrid';

const calculateGroupMaxes = (target, recommendations = []) => {
  if (!target) return null;

  // Combine target player and recommendations into a single group of 11 players
  const group = [target, ...recommendations].filter(Boolean);

  // Helper to find the maximum Per 90 rate within this specific group
  const getGroupMaxP90 = (fieldName) => {
    const rates = group.map(p => {
      const t90 = parseFloat(p['90s'] || p.ninetyS || p['90s_stats_standard'] || 1);
      // Fallback check to support capitalized FBref field keys (e.g., p.Gls or p.Sh)
      const rawVal = parseFloat(p[fieldName] || p[fieldName.charAt(0).toUpperCase() + fieldName.slice(1)] || 0);
      return rawVal / t90;
    });
    const peak = Math.max(...rates);
    return peak > 0 ? peak : 0.1;
  };

  // Helper for stats that are already stored as a direct rate in the dataset
  const getGroupMaxDirect = (fieldName) => {
    const rates = group.map(p => {
      return parseFloat(p[fieldName] || p[fieldName.toUpperCase()] || p['Sh/90'] || 0);
    });
    const peak = Math.max(...rates);
    return peak > 0 ? peak : 0.1;
  };

  return {
    gls: getGroupMaxP90('gls'),
    sh: getGroupMaxP90('sh'),
    sot: getGroupMaxP90('sot'),
    sh_90: getGroupMaxDirect('sh_90'),
    ast: getGroupMaxP90('ast'),
    crs: getGroupMaxP90('crs'),
    kp: getGroupMaxP90('kp'),
    fld: getGroupMaxP90('fld'),
    off: getGroupMaxP90('off'),
    int: getGroupMaxP90('int'),
    tklw: getGroupMaxP90('tklw'),
    fls: getGroupMaxP90('fls'),
    crdy: getGroupMaxP90('crdy')
  };
};

// Assuming 'recommendedList' is passed down or available in this panel's state scope
export default function AnalyticsPanel({ targetPlayer, activeComparison, recommendedList = [] }) {
  if (!activeComparison || !targetPlayer) {
    return (
      <div className="right-panel">
        <div className="empty-state">Select a player profile to view comparison metrics.</div>
      </div>
    );
  }

  // Pre-calculate benchmarks tied exclusively to these 11 profiles
  const groupMaxes = calculateGroupMaxes(targetPlayer, recommendedList);

  return (
    <div 
      className="right-panel" 
      style={{ 
        width: '100%',
        height: '100%', 
        overflowY: 'auto', 
        padding: '20px', 
        color: '#FFF', 
        fontFamily: 'monospace',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ minHeight: '75vh', width: '100%' }}>
        <ComparisonChart 
          target={targetPlayer} 
          replacement={activeComparison} 
          groupMaxes={groupMaxes} 
        />
      </div>

      <div style={{ 
        margin: '64px 0 40px 0', 
        borderTop: '1px solid #141c16', 
        width: '100%',
        opacity: 0.6
      }} />

      <div className="data-table-wrapper" style={{ width: '100%', paddingBottom: '60px' }}>
        <StatsGrid targetPlayer={targetPlayer} activeComparison={activeComparison} />
      </div>
    </div>
  );
}