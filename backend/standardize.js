// backend/standardize.js
const db = require('./db');
const fs = require('fs');

async function calculateZScoreParameters() {
  console.log('Calculating global metric distributions for Z-Score Standardization...');
  
  // The metrics we are using across our 4 specialized classification blocks
  const metrics = [
    'gls', 'sh', 'sot', 'sh_90', 'sot_90',             // Shooting
    'ast', 'crs',                                     // Passing 
    'fld', 'off',                                     // Possession
    'int', 'tklw', 'fls', 'crdy', 'crdr'              // Defending & Discipline
  ];

  const presets = {};

  try {
    for (const metric of metrics) {
      // Safe column handling (handling numeric column names like 90s or underscores)
      const columnName = (metric === '90s') ? `"90s"` : metric;
      
      const query = `
        SELECT 
          AVG(${columnName})::float as mean, 
          STDDEV(${columnName})::float as stddev 
        FROM players 
        WHERE "90s" >= 1.0; -- Only baseline players with stable minutes to avoid skewing averages
      `;
      
      const { rows } = await db.query(query);
      const mean = rows[0].mean || 0;
      // Safeguard against dividing by zero if stddev is non-existent
      const stddev = rows[0].stddev || 1; 

      presets[metric] = { mean, stddev };
      console.log(`📊 ${metric.toUpperCase()} -> Mean: ${mean.toFixed(2)}, StdDev: ${stddev.toFixed(2)}`);
    }

    // Save distribution statistics safely into a local JSON config file
    fs.writeFileSync('./metric_presets.json', JSON.stringify(presets, null, 2));
    console.log('\n✅ Distribution presets written successfully to metric_presets.json!');
    process.exit(0);
  } catch (err) {
    console.error('Failed calculating Z-Score distribution mappings:', err);
    process.exit(1);
  }
}

calculateZScoreParameters();