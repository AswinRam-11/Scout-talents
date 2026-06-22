// backend/standardize.js
const db = require('./db');
const fs = require('fs');

async function calculateZScoreParameters() {
  console.log('Calculating global metric distributions based on Per 90 rates...');
  
  // The metrics we are using across our specialized classification blocks
  const metrics = [
    'gls', 'sh', 'sot', 'sh_90', 'sot_90',             // Shooting
    'ast', 'crs',                                     // Passing 
    'fld', 'off',                                     // Possession
    'int', 'tklw', 'fls', 'crdy', 'crdr'              // Defending & Discipline
  ];

  const presets = {};

  try {
    for (const metric of metrics) {
      let query;

      // 'sh_90' and 'sot_90' are already per-90 rates in the CSV data layout
      if (metric === 'sh_90' || metric === 'sot_90') {
        query = `
          SELECT 
            AVG(${metric})::float as mean, 
            STDDEV(${metric})::float as stddev 
          FROM players 
          WHERE "90s" >= 1.0;
        `;
      } else {
        // For all other cumulative totals, calculate their true Per 90 rate on the fly.
        // NULLIF("90s", 0) protects against any division-by-zero database crashes.
        query = `
          SELECT 
            AVG(${metric} / NULLIF("90s", 0))::float as mean, 
            STDDEV(${metric} / NULLIF("90s", 0))::float as stddev 
          FROM players 
          WHERE "90s" >= 1.0;
        `;
      }
      
      const { rows } = await db.query(query);
      const mean = rows[0].mean || 0;
      const stddev = rows[0].stddev || 1; // Safeguard against dividing by zero if variance is non-existent

      presets[metric] = { mean, stddev };
      console.log(`📊 ${metric.toUpperCase()} (/90) -> Mean: ${mean.toFixed(4)}, StdDev: ${stddev.toFixed(4)}`);
    }

    // Save accurate Per 90 distribution statistics safely into your local JSON config file
    fs.writeFileSync('./metric_presets.json', JSON.stringify(presets, null, 2));
    console.log('\n✅ Per 90 distribution presets written successfully to metric_presets.json!');
    process.exit(0);
  } catch (err) {
    console.error('Failed calculating Z-Score distribution mappings:', err);
    process.exit(1);
  }
}

calculateZScoreParameters();