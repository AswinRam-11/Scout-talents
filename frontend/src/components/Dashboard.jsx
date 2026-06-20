// Dashboard.jsx
import React, { useState } from 'react';
import axios from 'axios';
import Header from './Header';
import SearchBar from './SearchBar';
import PlayerCard from './PlayerCard';
import ComparisonChart from './ComparisonChart';
import "../App.css";

export default function Dashboard() {
  const [targetPlayer, setTargetPlayer] = useState(null);
  const [maxAge, setMaxAge] = useState('28');
  const [recommendations, setRecommendations] = useState([]);
  const [activeComparison, setActiveComparison] = useState(null);

  const fetchRecommendations = async () => {
    if (!targetPlayer) return;
    try {
      const response = await axios.post('http://localhost:5000/api/players/recommend', {
        playerId: targetPlayer.id,
        maxAge: maxAge
      });
      setRecommendations(response.data);
      // Automatically focus comparison on the closest statistical match
      if (response.data.length > 0) {
        setActiveComparison(response.data[0]);
      }
    } catch (err) {
      console.error('Error executing vector recommendation matching', err);
    }
  };

  return (
    <div className="scout-dashboard">

      <Header />

      <SearchBar 
        onSelectTarget={setTargetPlayer} 
        maxAge={maxAge} 
        setMaxAge={setMaxAge}
        onSearchTrigger={fetchRecommendations}
        clearRecomondation={setRecommendations}
      />

      <div className="workspace-grid">
        {/* LEFT COLUMN: Recommendation Engine List Output */}
        <div className="left-panel">
          {targetPlayer && (
            <div className="target-badge">
              <span style={{ fontSize: '10px', uppercase: true, color: '#8E9A8A' }}>TARGET LOOKALIKE MODEL</span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '18px' }}>{targetPlayer.player}</h2>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{targetPlayer.squad} • {targetPlayer.pos}</p>
            </div>
          )}

          {recommendations.map((player) => (
            <PlayerCard 
              key={player.id} 
              player={player} 
              isActive={activeComparison && activeComparison.id === player.id}
              onClick={() => setActiveComparison(player)}
            />
          ))}
        </div>

        {/* RIGHT COLUMN: Comparative Deep Analytics Panel */}
        <div className="right-panel">
          {activeComparison && targetPlayer ? (
            <>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8E9A8A'}}>
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
                    <tr>
                      <td>Squad Alignment</td>
                      <td>{targetPlayer.squad}</td>
                      <td>{activeComparison.squad}</td>
                    </tr>
                    <tr>
                      <td>Minutes Logged (90s)</td>
                      <td>{targetPlayer.mins || targetPlayer.starts || 'N/A'}</td>
                      <td>{activeComparison.mins || activeComparison.starts || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td>Goals Volume</td>
                      <td>{targetPlayer.gls || 0}</td>
                      <td className="highlight-metric">{activeComparison.gls || 0}</td>
                    </tr>
                    <tr>
                      <td>Expected Assists (Ast)</td>
                      <td>{targetPlayer.ast || 0}</td>
                      <td className="highlight-metric">{activeComparison.ast || 0}</td>
                    </tr>
                    <tr>
                      <td>Shooting Volume (Sh/90)</td>
                      <td>{targetPlayer.sh_90 || targetPlayer.sh || 0}</td>
                      <td>{activeComparison.sh_90 || activeComparison.sh || 0}</td>
                    </tr>
                    <tr>
                      <td>Shot On Target % Accuracy</td>
                      <td>{targetPlayer.sot_pct || '0%'}</td>
                      <td>{activeComparison.sot_pct || '0%'}</td>
                    </tr>
                    <tr>
                      <td>Yellow / Red Cards issued</td>
                      <td>{targetPlayer.crdy || 0} / {targetPlayer.crdr || 0}</td>
                      <td>{activeComparison.crdy || 0} / {activeComparison.crdr || 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty-state">
              Select a player profile to view comparison metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}