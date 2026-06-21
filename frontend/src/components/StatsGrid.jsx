// StatsGrid.jsx
import React from 'react';

export default function StatsGrid({ targetPlayer, activeComparison }) {
  const t90 = parseFloat(targetPlayer['90s'] || targetPlayer.ninetyS || 1);
  const c90 = parseFloat(activeComparison['90s'] || activeComparison.ninetyS || 1);

  const getMinutes = (player, ninetyS) => {
    if (player.min) return parseInt(player.min);
    if (player.minutes) return parseInt(player.minutes);
    return Math.round(ninetyS * 90);
  };

  const renderTotal = (val) => (parseInt(val) || 0);
  const renderPer90 = (val, total90s) => ((parseInt(val) || 0) / total90s).toFixed(2);

  const toTitleCase = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderTeamAndLeague = (squad, comp) => {
    if (!squad) return <div style={{ color: '#5e6e63' }}>N/A</div>;
    return (
      <div style={{ lineHeight: '1.4' }}>
        <div style={{ color: '#FFF', fontWeight: '500' }}>{squad}</div>
        {comp && (
          <div style={{ color: '#8E9A8A', fontSize: '11px', marginTop: '2px', fontStyle: 'italic' }}>
            {toTitleCase(comp)}
          </div>
        )}
      </div>
    );
  };

  const StatRow = ({ label, targetVal, compVal }) => (
    <tr 
      style={{ borderBottom: '1px solid #141c16' }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#131a15'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <td style={{ padding: '12px 16px', color: '#a0aab0', fontWeight: '500' }}>{label}</td>
      <td style={{ textAlign: 'center', padding: '12px', color: '#FFF' }}>{renderTotal(targetVal)}</td>
      <td style={{ textAlign: 'center', padding: '12px', color: '#8E9A8A', fontSize: '12px', borderRight: '1px solid #141c16' }}>{renderPer90(targetVal, t90)}</td>
      <td style={{ textAlign: 'center', padding: '12px', color: '#FFF' }}>{renderTotal(compVal)}</td>
      <td style={{ textAlign: 'center', padding: '12px', color: '#8E9A8A', fontSize: '12px' }}>{renderPer90(compVal, c90)}</td>
    </tr>
  );

  const SectionHeader = ({ title }) => (
    <tr style={{ background: '#0e1410' }}>
      <td colSpan="5" style={{ padding: '8px 16px', color: '#00FF66', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
        {title}
      </td>
    </tr>
  );

  // Common baseline style to guarantee headers act as an absolute solid mask
  const stickyHeaderStyle = {
    position: 'sticky',
    zIndex: 20,
    backgroundColor: '#070a08', // Solid flat background matches your panel core color exactly
    backgroundClip: 'padding-box', // Prevents sub-borders from leaking during hardware scrolling acceleration
    color: '#5e6e63',
    borderBottom: '1px solid #141c16'
  };

  return (
    <div style={{ background: '#070a08', borderRadius: '8px', border: '1px solid #141c16', overflow: 'visible' }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'separate', 
        borderSpacing: 0,
        textAlign: 'left', 
        fontSize: '13px', 
        fontFamily: 'monospace' 
      }}>
        <thead>
          {/* --- STICKY ROW 1: PLAYER NAMES --- */}
          <tr>
            <th style={{ ...stickyHeaderStyle, top: 0, padding: '16px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', width: '40%' }}>
              Core Performance Metrics
            </th>
            <th colSpan="2" style={{ ...stickyHeaderStyle, top: 0, padding: '16px', textAlign: 'center', color: '#FF6384', borderRight: '1px solid #141c16', fontSize: '14px', fontWeight: '600' }}>
              {targetPlayer.player}
              <span style={{ fontSize: '10px', color: '#5e6e63', display: 'block', marginTop: '2px', fontWeight: 'normal' }}>({t90.toFixed(1)} 90s Played)</span>
            </th>
            <th colSpan="2" style={{ ...stickyHeaderStyle, top: 0, padding: '16px', textAlign: 'center', color: '#00FF66', fontSize: '14px', fontWeight: '600' }}>
              {activeComparison.player}
              <span style={{ fontSize: '10px', color: '#5e6e63', display: 'block', marginTop: '2px', fontWeight: 'normal' }}>({c90.toFixed(1)} 90s Played)</span>
            </th>
          </tr>

          {/* --- STICKY ROW 2: SUBHEADERS (Locks tight flush beneath Row 1) --- */}
          <tr>
            <th style={{ ...stickyHeaderStyle, top: '53px', padding: '8px 16px', fontSize: '10px' }}>
              STAT NAME
            </th>
            <th style={{ ...stickyHeaderStyle, top: '53px', padding: '8px', textAlign: 'center', fontSize: '10px' }}>
              TOTAL
            </th>
            <th style={{ ...stickyHeaderStyle, top: '53px', padding: '8px', textAlign: 'center', borderRight: '1px solid #141c16', fontSize: '10px' }}>
              PER 90
            </th>
            <th style={{ ...stickyHeaderStyle, top: '53px', padding: '8px', textAlign: 'center', fontSize: '10px' }}>
              TOTAL
            </th>
            <th style={{ ...stickyHeaderStyle, top: '53px', padding: '8px', textAlign: 'center', fontSize: '10px' }}>
              PER 90
            </th>
          </tr>
        </thead>
        <tbody>
          
          {/* CONTEXT SECTION */}
          <SectionHeader title="📋 Context Registry" />
          <tr style={{ borderBottom: '1px solid #141c16' }}>
            <td style={{ padding: '12px 16px', color: '#a0aab0' }}>Squad & Competition Context</td>
            <td colSpan="2" style={{ textAlign: 'center', padding: '12px', borderRight: '1px solid #141c16' }}>
              {renderTeamAndLeague(targetPlayer.squad, targetPlayer.comp)}
            </td>
            <td colSpan="2" style={{ textAlign: 'center', padding: '12px' }}>
              {renderTeamAndLeague(activeComparison.squad, activeComparison.comp)}
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #141c16' }}>
            <td style={{ padding: '12px 16px', color: '#a0aab0' }}>Age Matrix</td>
            <td colSpan="2" style={{ textAlign: 'center', color: '#FFF', borderRight: '1px solid #141c16' }}>{targetPlayer.age} <span style={{ color: '#5e6e63' }}>yrs</span></td>
            <td colSpan="2" style={{ textAlign: 'center', color: '#FFF' }}>{activeComparison.age} <span style={{ color: '#5e6e63' }}>yrs</span></td>
          </tr>
          <tr style={{ borderBottom: '1px solid #141c16' }}>
            <td style={{ padding: '12px 16px', color: '#a0aab0' }}>Minutes Played</td>
            <td colSpan="2" style={{ textAlign: 'center', color: '#FFF', borderRight: '1px solid #141c16' }}>{getMinutes(targetPlayer, t90)} <span style={{ color: '#5e6e63' }}>mins</span></td>
            <td colSpan="2" style={{ textAlign: 'center', color: '#FFF' }}>{getMinutes(activeComparison, c90)} <span style={{ color: '#5e6e63' }}>mins</span></td>
          </tr>

          {/* SHOOTING */}
          <SectionHeader title={`⚡ Shooting Sector (Match: ${parseFloat(activeComparison.match_shooting || 0).toFixed(1)}%)`} />
          <StatRow label="Goals Scored" targetVal={targetPlayer.gls} compVal={activeComparison.gls} />
          <StatRow label="Total Shots Attempted" targetVal={targetPlayer.sh} compVal={activeComparison.sh} />
          <StatRow label="Shots on Target" targetVal={targetPlayer.sot} compVal={activeComparison.sot} />
          <StatRow label="Expected Goals Rate (Source)" targetVal={targetPlayer.sh_90} compVal={activeComparison.sh_90} />

          {/* PASSING */}
          <SectionHeader title={`🎯 Passing & Creation (Match: ${parseFloat(activeComparison.match_passing || 0).toFixed(1)}%)`} />
          <StatRow label="Assists" targetVal={targetPlayer.ast} compVal={activeComparison.ast} />
          <StatRow label="Crosses Delivered" targetVal={targetPlayer.crs} compVal={activeComparison.crs} />
          <StatRow label="Key Passes" targetVal={targetPlayer.kp || 0} compVal={activeComparison.kp || 0} />

          {/* POSSESSION */}
          <SectionHeader title={`🌀 Possession & Carries (Match: ${parseFloat(activeComparison.match_possession || 0).toFixed(1)}%)`} />
          <StatRow label="Fouls Drawn" targetVal={targetPlayer.fld} compVal={activeComparison.fld} />
          <StatRow label="Offsides Flags" targetVal={targetPlayer.off} compVal={activeComparison.off} />

          {/* DEFENDING */}
          <SectionHeader title={`🛡️ Defensive Coverage (Match: ${parseFloat(activeComparison.match_defending || 0).toFixed(1)}%)`} />
          <StatRow label="Interceptions" targetVal={targetPlayer.int} compVal={activeComparison.int} />
          <StatRow label="Tackles Won" targetVal={targetPlayer.tklw} compVal={activeComparison.tklw} />
          <StatRow label="Fouls Committed" targetVal={targetPlayer.fls} compVal={activeComparison.fls} />
          <StatRow label="Yellow / Red Cautions" targetVal={targetPlayer.crdy} compVal={activeComparison.crdy} />

        </tbody>
      </table>
    </div>
  );
}