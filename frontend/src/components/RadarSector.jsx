// RadarSector.jsx
import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function RadarSector({ title, titleColor, targetPlayerName, replacementPlayerName, chartData, isResizing }) {
  
  const options = {
    responsive: true,
    maintainAspectRatio: false, 
    interaction: {
      mode: 'index',      // Hovering anywhere near an axis point catches both players
      intersect: false    // Allows triggering without hovering perfectly over a dot
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(9, 13, 10, 0.95)',
        borderColor: '#141c16',
        borderWidth: 1,
        titleColor: '#8E9A8A',
        titleFont: { family: 'monospace', size: 11 },
        bodyFont: { family: 'monospace', size: 12 },
        padding: 10,
        callbacks: {
          title: (context) => {
            return context[0]?.label || title;
          },
          label: (context) => {
            const dataset = context.dataset;
            const absoluteValue = dataset.rawValues[context.dataIndex];
            // Only displays the raw stat value; percentage output removed
            return ` ${dataset.label}: ${absoluteValue}`;
          }
        }
      }
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20, display: false },
        grid: { color: '#141c16' },
        angleLines: { color: '#141c16' },
        pointLabels: { color: '#8E9A8A', font: { size: 9, family: 'monospace' } }
      }
    }
  };

  return (
    <div style={{ background: '#090d0a', borderRadius: '8px', border: '1px solid #141c16', padding: '16px', height: '280px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FFF', fontSize: '11px', fontWeight: 'bold', marginBottom: '12px' }}>
        <span style={{ color: titleColor }}>{title}</span>
        <div>
          <span style={{ marginRight: '10px', color: '#FF6384' }}>■ {targetPlayerName}</span>
          <span style={{ color: '#00FF66' }}>■ {replacementPlayerName}</span>
        </div>
      </div>
      <div style={{ width: '100%', height: 'calc(100% - 30px)' }}>
        {!isResizing && <Radar data={chartData} options={options} />}
      </div>
    </div>
  );
}