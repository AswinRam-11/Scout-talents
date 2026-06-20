// SearchBar.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function SearchBar({ onSelectTarget, maxAge, setMaxAge, onSearchTrigger, clearRecomondation }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    
    const delayDebounce = setTimeout(async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/players/search?q=${query}`);
        setSuggestions(response.data);
      } catch (err) {
        console.error('Failed to fetch autocomplete strings', err);
      }
    }, 250); // Debounce lookup calls

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="control-bar">
      <div className="search-container">
        <label className="filter-group"><span style={{fontSize: '11px', color: '#8E9A8A', marginBottom: '6px', textTransform:'uppercase'}}>Target Player Profile</span></label>
        <input
          type="text"
          className="input-field"
          placeholder="Search target player (e.g., Erling Haaland)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {suggestions.length > 0 && (
          <ul className="dropdown-menu">
            {suggestions.map((p) => (
              <li
                key={p.id}
                className="dropdown-item"
                onClick={() => {
                  onSelectTarget(p);
                  setQuery(p.player);
                  setSuggestions([]);
                  clearRecomondation([]);
                }}
              >
                {p.player} ({p.squad} - {p.pos})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="filter-group">
        <label>Maximum Age</label>
        <input
          type="number"
          className="input-field"
          min="15"
          max="45"
          value={maxAge}
          onChange={(e) => setMaxAge(e.target.value)}
        />
      </div>

      <button className="action-btn" onClick={onSearchTrigger}>
        Find Alternatives
      </button>
    </div>
  );
}