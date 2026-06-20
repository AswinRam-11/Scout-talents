// backend/ingest.js
const fs = require('fs');
const readline = require('readline');
const db = require('./db');

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else current += char;
  }
  result.push(current.trim());
  return result;
}

async function importDataset() {
  const fileStream = fs.createReadStream('players_data-2025_2026.csv');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  let isHeader = true, successCount = 0;

  console.log('Ingesting Multi-Vector Layer Structure...');

  for await (const line of rl) {
    if (isHeader || !line.trim()) { isHeader = false; continue; }
    const row = parseCsvLine(line);
    if (row.length < 100) continue;

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

    // --- 1. SHOOTING METRICS ---
    const gls = parseInt(row[12]) || 0;
    const sh = parseInt(row[53]) || 0;
    const sot = parseInt(row[54]) || 0;
    const sh90 = parseFloat(row[56]) || 0.0;
    const sot90 = parseFloat(row[57]) || 0.0;
    
    // --- 2. PASSING METRICS ---
    const ast = parseInt(row[13]) || 0;
    const crs = parseInt(row[98]) || 0; // Crosses
    // Simulating additional secondary keys using data scales for radar visualization fallback
    const passesComp = Math.round(ninetyS * 40 * (ast > 0 ? 1.1 : 0.8)); 
    const keyPasses = Math.round(ast * 4 + (gls * 0.5));
    const progressivePasses = Math.round(ninetyS * 4);

    // --- 3. POSSESSION METRICS ---
    const fld = parseInt(row[96]) || 0; // Fouls Drawn
    const off = parseInt(row[97]) || 0; // Offsides
    const touches = Math.round(ninetyS * 55);
    const carries = Math.round(ninetyS * 35);
    const takeOns = Math.round(fld * 0.8);

    // --- 4. DEFENDING & DISCIPLINE METRICS ---
    const crdy = parseInt(row[18]) || 0; // Yellow Cards
    const crdr = parseInt(row[19]) || 0; // Red Cards
    const fls = parseInt(row[95]) || 0;  // Fouls Committed
    const inter = parseInt(row[99]) || 0; // Interceptions
    const tklw = parseInt(row[100]) || 0; // Tackles Won

    // --- NORMALIZATION AND VECTOR ASSEMBLY (0.0 to 1.0 scales) ---
    const vec_shooting = `[${Math.min(gls/35, 1).toFixed(2)},${Math.min(sh/140, 1).toFixed(2)},${Math.min(sot/70, 1).toFixed(2)},${Math.min(sh90/5, 1).toFixed(2)},${Math.min(sot90/2.5, 1).toFixed(2)}]`;
    const vec_passing = `[${Math.min(ast/20, 1).toFixed(2)},${Math.min(crs/250, 1).toFixed(2)},${Math.min(passesComp/2000, 1).toFixed(2)},${Math.min(keyPasses/80, 1).toFixed(2)},${Math.min(progressivePasses/250, 1).toFixed(2)}]`;
    const vec_possession = `[${Math.min(touches/2500, 1).toFixed(2)},${Math.min(carries/1800, 1).toFixed(2)},${Math.min(takeOns/100, 1).toFixed(2)},${Math.min(fld/80, 1).toFixed(2)},${Math.min(1 - (off/40), 1).toFixed(2)}]`;
    // Invert fouls/cards so that lower discipline counts yield HIGHER performance rankings
    const vec_defending = `[${Math.min(inter/75, 1).toFixed(2)},${Math.min(tklw/60, 1).toFixed(2)},${Math.min(Math.max(1 - (fls/60), 0), 1).toFixed(2)},${Math.min(Math.max(1 - (crdy/12), 0), 1).toFixed(2)},${Math.min(Math.max(1 - crdr, 0), 1).toFixed(2)}]`;

    const query = `
      INSERT INTO players (
        player, nation, pos, squad, comp, age, born, mp, starts, min, "90s",
        gls, sh, sot, sh_90, sot_90, ast, crs, fld, off, crdy, crdr, fls, int, tklw,
        vector_shooting, vector_passing, vector_possession, vector_defending
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29)
    `;

    try {
      await db.query(query, [
        player, nation, pos, squad, comp, age, born, mp, starts, min, ninetyS,
        gls, sh, sot, sh90, sot90, ast, crs, fld, off, crdy, crdr, fls, inter, tklw,
        vec_shooting, vec_passing, vec_possession, vec_defending
      ]);
      successCount++;
    } catch (err) {
      console.error(`Error ${player}:`, err.message);
    }
  }
  console.log(`Successfully ingested ${successCount} multi-vector assets.`);
  process.exit();
}
importDataset();