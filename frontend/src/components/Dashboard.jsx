// Dashboard.jsx
import React, { useState } from 'react';
import axios from 'axios';
import Header from './Header';
import SearchBar from './SearchBar';
import RecommendationsPanel from './RecommendationsPanel'; // Import Left Panel
import AnalyticsPanel from './AnalyticsPanel';             // Import Right Panel
import "../App.css";

export default function Dashboard() {
  const [targetPlayer, setTargetPlayer] = useState(null);
  const [maxAge, setMaxAge] = useState('28');
  const [minAge, setMinAge] = useState('15');
  const [recommendations, setRecommendations] = useState([]);
  const [activeComparison, setActiveComparison] = useState(null);

  const fetchRecommendations = async () => {
    if (!targetPlayer) return;
    try {
      const response = await axios.post('http://localhost:5000/api/players/recommend', {
        playerId: targetPlayer.id,
        maxAge: maxAge,
        minAge: minAge
      });
      setRecommendations(response.data);
      // Automatically focus structural views on the top candidate match
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
        minAge={minAge}
        setMinAge={setMinAge} 
      />

      <div className="workspace-grid">
        {/* LEFT COLUMN: Isolated Recommendation Engine Listing */}
        <RecommendationsPanel 
          targetPlayer={targetPlayer}
          recommendations={recommendations}
          activeComparison={activeComparison}
          setActiveComparison={setActiveComparison}
        />

        {/* RIGHT COLUMN: Isolated Comparative Analytics & Radar Plots */}
        <AnalyticsPanel 
          targetPlayer={targetPlayer} 
          activeComparison={activeComparison} 
        />
      </div>
    </div>
  );
}