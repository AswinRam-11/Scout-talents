// backend/ingest.js
const fs = require('fs');
const readline = require('readline');
const db = require('./db');

// Helper function to correctly split a CSV row while respecting double quotes
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes; // Toggle quote state
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function importDataset() {
  // Use the exact filename matching your uploaded file
  const fileStream = fs.createReadStream('players_data-2025_2026.csv');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let isHeader = true;
  let successCount = 0;

  console.log('Starting ScoutAI data parsing pipeline...');

  for await (const line of rl) {
    if (isHeader || !line.trim()) {
      isHeader = false; 
      continue;
    }

    const row = parseCsvLine(line);
    if (row.length < 10) continue;

    // Map metrics precisely using your CSV column sequence structure
    const player = row[1];
    const nation = row[2];
    const pos = row[3];
    const squad = row[4];
    const comp = row[5];
    const age = parseInt(parseFloat(row[6])) || 0;
    const born = parseInt(parseFloat(row[7])) || 0;
    const mp = parseInt(row[8]) || 0;
    const starts = parseInt(row[9]) || 0;
    const min = parseInt(row[10]) || 0;
    const ninetyS = parseFloat(row[11]) || 0.0;
    
    const gls = parseInt(row[12]) || 0;
    const ast = parseInt(row[13]) || 0;
    const sh90 = parseFloat(row[56]) || 0.0;
    const sot90 = parseFloat(row[57]) || 0.0;
    const crs = parseInt(row[98]) || 0;
    const inter = parseInt(row[99]) || 0;

    // Vector Normalization Metrics Scaled 0.0 to 1.0 based on dataset profiles
    const v_gls = Math.min(gls / 40, 1.0);
    const v_ast = Math.min(ast / 20, 1.0);
    const v_sh90 = Math.min(sh90 / 5.0, 1.0);
    const v_sot90 = Math.min(sot90 / 2.5, 1.0);
    const v_crs = Math.min(crs / 250, 1.0);
    const v_int = Math.min(inter / 75, 1.0);

    // Formulate string array syntax required by pgvector ('[v1,v2,v3...]')
    const stats_vector = `[${v_gls.toFixed(3)},${v_ast.toFixed(3)},${v_sh90.toFixed(3)},${v_sot90.toFixed(3)},${v_crs.toFixed(3)},${v_int.toFixed(3)}]`;

    const queryText = `
      INSERT INTO players (
        player, nation, pos, squad, comp, age, born, mp, starts, min, "90s", 
        gls, ast, sh_90, sot_90, crs, int, stats_vector
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    `;
    
    try {
      await db.query(queryText, [
        player, nation, pos, squad, comp, age, born, mp, starts, min, ninetyS,
        gls, ast, sh90, sot90, crs, inter, stats_vector
      ]);
      successCount++;
    } catch (err) {
      console.error(`Skipped row entry [${player}]:`, err.message);
    }
  }

  console.log(`\nSuccess! Successfully mapped and loaded ${successCount} players into ScoutAI.`);
  process.exit();
}

importDataset();