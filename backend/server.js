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
  if (!q || !q.trim()) return res.json([]);

  try {
    // FIX: Explicitly pull the profile elements AND performance columns 
    // so the Dashboard can populate the target comparison breakdown correctly.
    const queryText = `
      SELECT 
        id, player, nation, pos, squad, comp, age, born, mp, starts, min, "90s",
        gls, sh, sot, sh_90, sot_90, ast, crs, fld, off, crdy, crdr, fls, int, tklw
      FROM players 
      WHERE player ILIKE $1 
        AND "90s" >= 0.5
      LIMIT 8
    `;
    const { rows } = await db.query(queryText, [`%${q.trim()}%`]);
    res.json(rows);
  } catch (err) {
    console.error('Search API Error:', err.message);
    res.status(500).json([]);
  }
});

/**
 * @route   POST /api/players/recommend
 * @desc    Find top 10 lookalikes using pgvector Cosine Distance (<=>)
 */
app.post('/api/players/recommend', async (req, res) => {
  const { playerId, minAge, maxAge } = req.body;
  if (!playerId) return res.status(400).json({ error: 'playerId required' });

  try {
    const targetRes = await db.query(
      'SELECT player, vector_shooting, vector_passing, vector_possession, vector_defending FROM players WHERE id = $1', 
      [playerId]
    );
    if (targetRes.rows.length === 0) return res.status(404).json({ error: 'Player not found' });
    
    const t = targetRes.rows[0];

    let queryText = `
      SELECT *,
        (1 - ((vector_shooting <=> $2::vector) / 2.0)) * 100 AS match_shooting,
        (1 - ((vector_passing <=> $3::vector) / 2.0)) * 100 AS match_passing,
        (1 - ((vector_possession <=> $4::vector) / 2.0)) * 100 AS match_possession,
        (1 - ((vector_defending <=> $5::vector) / 2.0)) * 100 AS match_defending
      FROM players
      WHERE id != $1 AND "90s" >= 1.0
    `;
    
    const queryParams = [playerId, t.vector_shooting, t.vector_passing, t.vector_possession, t.vector_defending];
    let paramCounter = 6;

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

    queryText += `
      ORDER BY (
        (vector_shooting <=> $2::vector) + 
        (vector_passing <=> $3::vector) + 
        (vector_possession <=> $4::vector) + 
        (vector_defending <=> $5::vector)
      ) ASC LIMIT 10
    `;

    const { rows } = await db.query(queryText, queryParams);

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
        match_percentage: (s + p + pos + d) / 4
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