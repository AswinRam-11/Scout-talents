// PlayerCard.jsx
import React from 'react';

export default function PlayerCard({ player, isActive, onClick }) {
  return (
    <div 
      className={`player-card ${isActive ? 'active' : ''}`} 
      onClick={onClick}
    >
      <div>
        <div style={{ fontWeight: '600', fontSize: '15px' }}>{player.player}</div>
        <div style={{ fontSize: '12px', color: '#8E9A8A', marginTop: '2px' }}>
          {player.squad} • {player.comp} • {player.age} y/o
        </div>
      </div>
      <div className="match-pct">
        {parseFloat(player.match_percentage).toFixed(1)}%
      </div>
    </div>
  );
}