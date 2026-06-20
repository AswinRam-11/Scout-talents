// frontend/src/components/ComparisonChart.jsx
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

export default function ComparisonChart({ target, replacement }) {
  // Ensure we safely map property keys returning from the PostgreSQL client layer
  const data = [
    { 
      metric: 'Goals', 
      Target: parseFloat(target.gls) || 0, 
      Replacement: parseFloat(replacement.gls) || 0 
    },
    { 
      metric: 'Assists', 
      Target: parseFloat(target.ast) || 0, 
      Replacement: parseFloat(replacement.ast) || 0 
    },
    { 
      metric: 'Shots / 90', 
      Target: parseFloat(target.sh_90) || 0, 
      Replacement: parseFloat(replacement.sh_90) || 0 
    },
    { 
      metric: 'SoT / 90', 
      Target: parseFloat(target.sot_90) || 0, 
      Replacement: parseFloat(replacement.sot_90) || 0 
    },
    { 
      metric: 'Crosses', 
      Target: parseFloat(target.crs) || 0, 
      Replacement: parseFloat(replacement.crs) || 0 
    },
    { 
      metric: 'Def Intercepts', 
      Target: parseFloat(target.int) || 0, 
      Replacement: parseFloat(replacement.int) || 0 
    },
  ];

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#263238" />
          <PolarAngleAxis dataKey="metric" stroke="#8E9A8A" fontSize={11} />
          <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
          <Radar
            name={target.player || 'Target'}
            dataKey="Target"
            stroke="#8E9A8A"
            fill="#8E9A8A"
            fillOpacity={0.2}
          />
          <Radar
            name={replacement.player || 'Replacement'}
            dataKey="Replacement"
            stroke="#00FF66"
            fill="#00FF66"
            fillOpacity={0.35}
          />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}