
import React from 'react';
import PlayerCard from './PlayerCard';

export default function RecommendationsPanel({ targetPlayer, recommendations, activeComparison, setActiveComparison }) {
  return (
    <div className="left-panel">
      {/* Target Badge Header */}
      {targetPlayer && (
        <div className="target-badge">
          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#8E9A8A' }}>
            TARGET LOOKALIKE MODEL
          </span>
          <h2 style={{ margin: '4px 0 0 0', fontSize: '18px' }}>{targetPlayer.player}</h2>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
            {targetPlayer.squad} • {targetPlayer.pos}
          </p>
        </div>
      )}

      {/* Recommendation Listing Cards Loop */}
      {recommendations.map((player) => {
        // Prepare the combined text layout string for the inner template references if needed
        const advancedPlayerData = {
          ...player,
          subScoresText: `SH: ${parseFloat(player.match_shooting).toFixed(0)}% | PAS: ${parseFloat(player.match_passing).toFixed(0)}% | POS: ${parseFloat(player.match_possession).toFixed(0)}% | DEF: ${parseFloat(player.match_defending).toFixed(0)}%`
        };

        return (
          <div 
            key={player.id}
            className={`player-card-wrapper ${activeComparison?.id === player.id ? 'active-highlight' : ''}`}
            style={{ position: 'relative', marginBottom: '10px' }}
          >
            {/* The individual PlayerCard row block */}
            <PlayerCard 
              player={advancedPlayerData} 
              isActive={activeComparison && activeComparison.id === player.id}
              onClick={() => setActiveComparison(player)}
            />
            
            {/* Horizontal sub-classification performance status footer */}
            <div style={{
              padding: '4px 12px 10px 12px',
              fontSize: '10px',
              fontFamily: 'monospace',
              color: '#8E9A8A',
              background: '#111612',
              marginTop: '-4px',
              borderBottomLeftRadius: '6px',
              borderBottomRightRadius: '6px',
              border: '1px solid #1c241e',
              borderTop: 'none',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>SH: {parseFloat(player.match_shooting).toFixed(0)}%</span>
              <span>PAS: {parseFloat(player.match_passing).toFixed(0)}%</span>
              <span>POS: {parseFloat(player.match_possession).toFixed(0)}%</span>
              <span>DEF: {parseFloat(player.match_defending).toFixed(0)}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}