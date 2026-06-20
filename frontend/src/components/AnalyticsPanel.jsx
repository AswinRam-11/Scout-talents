// AnalyticsPanel.jsx
import React from 'react';
import ComparisonChart from './ComparisonChart';

export default function AnalyticsPanel({ targetPlayer, activeComparison }) {
  if (!activeComparison || !targetPlayer) {
    return (
      <div className="right-panel">
        <div className="empty-state">
          Select a player profile to view comparison metrics.
        </div>
      </div>
    );
  }

  return (
    <div className="right-panel">
      <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8E9A8A' }}>
        Metric Cluster Comparison Matrix
      </h3>
      
      <ComparisonChart target={targetPlayer} replacement={activeComparison} />

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Metric Performance Breakdown</th>
              <th>{targetPlayer.player}</th>
              <th>{activeComparison.player}</th>
            </tr>
          </thead>
          <tbody>
            {/* --- GENERAL IDENTITY GROUP --- */}
            <tr className="table-section-header">
              <td colSpan="3" style={{ background: '#161d18', color: '#00FF66', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '6px 10px' }}>📋 Profile Registry</td>
            </tr>
            <tr>
              <td>Squad Alignment</td>
              <td>{targetPlayer.squad}</td>
              <td>{activeComparison.squad}</td>
            </tr>
            <tr>
              <td>Minutes Logged (90s)</td>
              <td>{parseFloat(targetPlayer['90s'] || 0).toFixed(1)}</td>
              <td>{parseFloat(activeComparison['90s'] || 0).toFixed(1)}</td>
            </tr>

            {/* --- SHOOTING TERMINAL GROUP --- */}
            <tr className="table-section-header">
              <td colSpan="3" style={{ background: '#161d18', color: '#00FF66', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '6px 10px' }}>⚡ Shooting Performance</td>
            </tr>
            <tr>
              <td>Goals Volume</td>
              <td>{targetPlayer.gls || 0}</td>
              <td className="highlight-metric">{activeComparison.gls || 0}</td>
            </tr>
            <tr>
              <td>Total Shots Attempted</td>
              <td>{targetPlayer.sh || 0}</td>
              <td>{activeComparison.sh || 0}</td>
            </tr>
            <tr>
              <td>Shots on Target (SoT)</td>
              <td>{targetPlayer.sot || 0}</td>
              <td>{activeComparison.sot || 0}</td>
            </tr>
            <tr>
              <td>Shooting Volume (Sh/90)</td>
              <td>{parseFloat(targetPlayer.sh_90 || 0).toFixed(2)}</td>
              <td>{parseFloat(activeComparison.sh_90 || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Accuracy Ratio (SoT%)</td>
              <td>{targetPlayer.sot_pct ? `${targetPlayer.sot_pct}%` : `${((targetPlayer.sot / (targetPlayer.sh || 1)) * 100).toFixed(1)}%`}</td>
              <td>{activeComparison.sot_pct ? `${activeComparison.sot_pct}%` : `${((activeComparison.sot / (activeComparison.sh || 1)) * 100).toFixed(1)}%`}</td>
            </tr>

            {/* --- PASSING EXECUTION GROUP --- */}
            <tr className="table-section-header">
              <td colSpan="3" style={{ background: '#161d18', color: '#00FF66', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '6px 10px' }}>🎯 Passing Execution</td>
            </tr>
            <tr>
              <td>Expected Assists (Ast)</td>
              <td>{targetPlayer.ast || 0}</td>
              <td className="highlight-metric">{activeComparison.ast || 0}</td>
            </tr>
            <tr>
              <td>Crosses Distributed</td>
              <td>{targetPlayer.crs || 0}</td>
              <td>{activeComparison.crs || 0}</td>
            </tr>
            <tr>
              <td>Estimated Key Passes</td>
              <td>{(targetPlayer.ast || 0) * 3}</td>
              <td>{(activeComparison.ast || 0) * 3}</td>
            </tr>

            {/* --- SPATIAL POSSESSION GROUP --- */}
            <tr className="table-section-header">
              <td colSpan="3" style={{ background: '#161d18', color: '#00FF66', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '6px 10px' }}>🌀 Spatial Possession</td>
            </tr>
            <tr>
              <td>Fouls Drawn (Fld)</td>
              <td>{targetPlayer.fld || 0}</td>
              <td>{activeComparison.fld || 0}</td>
            </tr>
            <tr>
              <td>Offsides Called</td>
              <td>{targetPlayer.off || 0}</td>
              <td>{activeComparison.off || 0}</td>
            </tr>
            <tr>
              <td>Est. Attacking Touches</td>
              <td>{Math.round((targetPlayer['90s'] || 1) * 50)}</td>
              <td>{Math.round((activeComparison['90s'] || 1) * 50)}</td>
            </tr>

            {/* --- DEFENDING & DISCIPLINE GROUP --- */}
            <tr className="table-section-header">
              <td colSpan="3" style={{ background: '#161d18', color: '#00FF66', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '6px 10px' }}>🛡️ Defending & Discipline</td>
            </tr>
            <tr>
              <td>Interceptions</td>
              <td>{targetPlayer.int || 0}</td>
              <td>{activeComparison.int || 0}</td>
            </tr>
            <tr>
              <td>Tackles Won (TklW)</td>
              <td>{targetPlayer.tklw || 0}</td>
              <td>{activeComparison.tklw || 0}</td>
            </tr>
            <tr>
              <td>Fouls Committed (Fls)</td>
              <td>{targetPlayer.fls || 0}</td>
              <td>{activeComparison.fls || 0}</td>
            </tr>
            <tr>
              <td>Disciplinary Cards (Y / R)</td>
              <td>{targetPlayer.crdy || 0} / {targetPlayer.crdr || 0}</td>
              <td>{activeComparison.crdy || 0} / {activeComparison.crdr || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}