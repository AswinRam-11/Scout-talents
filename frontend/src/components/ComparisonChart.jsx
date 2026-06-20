// frontend/src/components/ComparisonChart.jsx
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from 'recharts';

function RenderRadar({ title, score, data, keys, targetName, replacementName }) {
  return (
    <div className="radar-card" style={{ background: '#111612', padding: '15px', borderRadius: '8px', border: '1px solid #1c241e' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h4 style={{ color: '#FFF', margin: 0 }}>{title}</h4>
        <span style={{ color: '#00FF66', fontWeight: 'bold', fontSize: '13px' }}>{parseFloat(score).toFixed(1)}% Match</span>
      </div>
      <div style={{ width: '100%', height: '180px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
            <PolarGrid stroke="#222" />
            <PolarAngleAxis dataKey="metric" stroke="#8E9A8A" fontSize={10} />
            <Radar name={targetName} dataKey="Target" stroke="#8E9A8A" fill="#8E9A8A" fillOpacity={0.15} />
            <Radar name={replacementName} dataKey="Replacement" stroke="#00FF66" fill="#00FF66" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function ComparisonChart({ target, replacement }) {
  const targetName = target.player || 'Target';
  const replacementName = replacement.player || 'Prospect';

  // 1. Shooting Structure Map
  const shootingData = [
    { metric: 'Goals', Target: target.gls || 0, Replacement: replacement.gls || 0 },
    { metric: 'Shots Total', Target: target.sh || 0, Replacement: replacement.sh || 0 },
    { metric: 'On Target', Target: target.sot || 0, Replacement: replacement.sot || 0 },
    { metric: 'Shots/90', Target: target.sh_90 || 0, Replacement: replacement.sh_90 || 0 },
    { metric: 'SoT/90', Target: target.sot_90 || 0, Replacement: replacement.sot_90 || 0 },
  ];

  // 2. Passing Structure Map (Simulated tracking keys computed in database data parameters)
  const passingData = [
    { metric: 'Assists', Target: target.ast || 0, Replacement: replacement.ast || 0 },
    { metric: 'Crosses', Target: target.crs || 0, Replacement: replacement.crs || 0 },
    { metric: 'Est Keys', Target: (target.ast || 0)*3, Replacement: (replacement.ast || 0)*3 },
    { metric: 'Volume', Target: Math.round((target['90s'] || 1)*35), Replacement: Math.round((replacement['90s'] || 1)*35) },
    { metric: 'Prog Dist', Target: Math.round((target['90s'] || 1)*5), Replacement: Math.round((replacement['90s'] || 1)*5) },
  ];

  // 3. Possession Structure Map
  const possessionData = [
    { metric: 'Fouls Drawn', Target: target.fld || 0, Replacement: replacement.fld || 0 },
    { metric: 'Touches', Target: Math.round((target['90s'] || 1)*50), Replacement: Math.round((replacement['90s'] || 1)*50) },
    { metric: 'Carries', Target: Math.round((target['90s'] || 1)*30), Replacement: Math.round((replacement['90s'] || 1)*30) },
    { metric: 'Take-Ons', Target: Math.round((target.fld || 0)*0.7), Replacement: Math.round((replacement.fld || 0)*0.7) },
    { metric: 'Retention', Target: Math.max(40 - (target.off || 0), 10), Replacement: Math.max(40 - (replacement.off || 0), 10) },
  ];

  // 4. Defending & Discipline Map (Low values translate to better performance outputs)
  const defendingData = [
    { metric: 'Intercepts', Target: target.int || 0, Replacement: replacement.int || 0 },
    { metric: 'Tackles Won', Target: target.tklw || 0, Replacement: replacement.tklw || 0 },
    { metric: 'Fouls Comm', Target: target.fls || 0, Replacement: replacement.fls || 0 },
    { metric: 'Yellows', Target: target.crdy || 0, Replacement: replacement.crdy || 0 },
    { metric: 'Reds', Target: target.crdr || 0, Replacement: replacement.crdr || 0 },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '20px' }}>
      <RenderRadar title="⚡ Shooting Terminal" score={replacement.match_shooting} data={shootingData} targetName={targetName} replacementName={replacementName} />
      <RenderRadar title="🎯 Passing Execution" score={replacement.match_passing} data={passingData} targetName={targetName} replacementName={replacementName} />
      <RenderRadar title="🌀 Spatial Possession" score={replacement.match_possession} data={possessionData} targetName={targetName} replacementName={replacementName} />
      <RenderRadar title="🛡️ Defending & Discipline" score={replacement.match_defending} data={defendingData} targetName={targetName} replacementName={replacementName} />
    </div>
  );
}