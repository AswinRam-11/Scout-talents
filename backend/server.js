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

app.post('/api/players/recommend', async (req, res) => {
  const { playerId, maxAge, maxMarketValue } = req.body;

  if (!playerId) {
    return res.status(400).json({ error: 'Target playerId is required.' });
  }

  try {
    // 1. Fetch the target player's stats vector
    const targetQuery = 'SELECT stats_vector, player FROM players WHERE id = $1';
    const targetResult = await db.query(targetQuery, [playerId]);

    if (targetResult.rows.length === 0) {
      return res.status(404).json({ error: 'Target player not found.' });
    }

    const targetVector = targetResult.rows[0].stats_vector;

    // 2. Build the live pgvector similarity query
    // $1 = targetVector, $2 = playerId (integer)
    let queryText = `
      SELECT *,
             (1 - (stats_vector <=> $1::vector)) * 100 AS match_percentage
      FROM players
      WHERE id != $2
    `;
    
    const queryParams = [targetVector, parseInt(playerId)];
    let paramCounter = 3;

    if (maxAge) {
      queryText += ` AND age <= $${paramCounter}`;
      queryParams.push(parseInt(maxAge));
      paramCounter++;
    }

    queryText += `
      ORDER BY stats_vector <=> $1::vector ASC
      LIMIT 10
    `;

    const { rows: recommendations } = await db.query(queryText, queryParams);
    res.json(recommendations);
  } catch (err) {
    console.error('Recommendation API Error:', err.message);
    res.status(500).json({ error: 'Vector processing compilation error.' });
  }
});

app.listen(PORT, () => {
  console.log(`ScoutAI terminal system online on engine port ${PORT}`);
});