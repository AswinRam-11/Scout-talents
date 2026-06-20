// server.js
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/**
 * @route   GET /api/players/search
 * @desc    Autocomplete search for matching player names
 */
app.get('/api/players/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  try {
    // Case-insensitive sub-string match limiting to top 5 results
    const queryText = `
      SELECT *
      FROM players 
      WHERE player ILIKE $1 
      LIMIT 8
    `;
    const { rows } = await db.query(queryText, [`%${q}%`]);
    res.json(rows);
  } catch (err) {
    console.error('Search API Error:', err.message);
    res.status(500).json({ error: 'Server database error during search.' });
  }
});

/**
 * @route   POST /api/players/recommend
 * @desc    Find top 10 lookalikes using pgvector Cosine Distance (<=>)
 */

// backend/server.js
app.post('/api/players/recommend', async (req, res) => {
  // 1. Destructure both minAge and maxAge sent from your updated Dashboard component
  const { playerId, minAge, maxAge } = req.body;
  if (!playerId) return res.status(400).json({ error: 'playerId required' });

  try {
    // Fetch the baseline player model vectors
    const targetRes = await db.query(
      'SELECT player, vector_shooting, vector_passing, vector_possession, vector_defending FROM players WHERE id = $1', 
      [playerId]
    );
    if (targetRes.rows.length === 0) return res.status(404).json({ error: 'Player not found' });
    
    const t = targetRes.rows[0];

    // 2. Base query calculating the 4 similarity classifications independently via pgvector (<=>)
    let queryText = `
      SELECT *,
        (1 - (vector_shooting <=> $2::vector)) * 100 AS match_shooting,
        (1 - (vector_passing <=> $3::vector)) * 100 AS match_passing,
        (1 - (vector_possession <=> $4::vector)) * 100 AS match_possession,
        (1 - (vector_defending <=> $5::vector)) * 100 AS match_defending
      FROM players
      WHERE id != $1
    `;
    
    // Initialize our parameters matrix array matching $1 through $5
    const queryParams = [playerId, t.vector_shooting, t.vector_passing, t.vector_possession, t.vector_defending];
    let paramCounter = 6; // Dynamic variables will begin assigning at index $6

    // 3. Dynamic Threshold Constraints Append
    if (minAge) {
      queryText += ` AND age >= $${paramCounter}`;
      queryParams.push(parseInt(minAge));
      paramCounter++;
    }

    if (maxAge) {
      queryText += ` AND age <= $${paramCounter}`;
      queryParams.push(parseInt(maxAge));
      paramCounter++;
    }

    // 4. Stable Order By Sorting Clause mapped safely back to immutable indexes $2, $3, $4, $5
    queryText += `
      ORDER BY (
        (vector_shooting <=> $2::vector) + 
        (vector_passing <=> $3::vector) + 
        (vector_possession <=> $4::vector) + 
        (vector_defending <=> $5::vector)
      ) ASC LIMIT 10
    `;

    const { rows } = await db.query(queryText, queryParams);

    // 5. Build full net aggregation score arrays for your React mapping loops
    const calculatedRows = rows.map(row => {
      const s = parseFloat(row.match_shooting) || 0;
      const p = parseFloat(row.match_passing) || 0;
      const pos = parseFloat(row.match_possession) || 0;
      const d = parseFloat(row.match_defending) || 0;
      return {
        ...row,
        match_shooting: s, 
        match_passing: p, 
        match_possession: pos, 
        match_defending: d,
        match_percentage: (s + p + pos + d) / 4 // The net unified aggregate percentage match
      };
    });

    res.json(calculatedRows);
  } catch (err) {
    console.error('Recommendation Engine Error:', err.message);
    res.status(500).json({ error: 'Vector query mapping failure.' });
  }
});

app.listen(PORT, () => {
  console.log(`ScoutAI terminal system online on engine port ${PORT}`);
});