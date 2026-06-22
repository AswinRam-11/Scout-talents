// backend/ingest.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const db = require('./db');

const csvFilename = 'players_data-2025_2026.csv';
const csvPath = path.join(process.cwd(), csvFilename);

// 1. Verify the CSV data source file exists before doing anything else
if (!fs.existsSync(csvPath)) {
  console.error(`\n❌ CRITICAL ERROR: Source file not found at: ${csvPath}`);
  console.error(`Please move your CSV file into the same directory as this ingest.js script.\n`);
  process.exit(1);
}

// 2. Load distributions calculated from standardization step
let presets;
try {
  const presetsPath = path.join(process.cwd(), 'metric_presets.json');
  presets = JSON.parse(fs.readFileSync(presetsPath, 'utf8'));
  console.log('✅ Metric presets configuration loaded successfully.');
} catch (e) {
  console.error("\n❌ CRITICAL ERROR: Run 'node standardize.js' before running the ingestion pipeline.");
  process.exit(1);
}

function getZScore(metricName, rawValue) {
  const config = presets[metricName];
  if (!config) return 0;
  // Ensure we are working with a real number
  const val = isNaN(rawValue) ? 0 : parseFloat(rawValue);
  const score = (val - config.mean) / (config.stddev || 1);
  return Math.max(Math.min(score, 3.5), -3.5);
}

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
  try {
    // Wipe database safely
    console.log('Wiping old database structures via TRUNCATE...');
    await db.query('TRUNCATE TABLE players RESTART IDENTITY;');
    
    const fileStream = fs.createReadStream(csvPath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  
    let isHeader = true;
    let successCount = 0;
    let lineCount = 0;

    console.log('Beginning row-by-row data pipeline streaming...');

for await (const line of rl) {
  lineCount++;
  if (isHeader) { isHeader = false; continue; }
  if (!line.trim()) continue;

  const row = parseCsvLine(line);
  
  if (row.length < 100) {
    console.warn(`⚠️ Skipping line ${lineCount}: Expected at least 100 columns, got ${row.length}`);
    continue;
  }

  // Identity and general metadata
  const player = row[1] || 'Unknown Player';
  const nation = row[2] || '';
  const pos = row[3] || '';
  const squad = row[4] || '';
  const comp = row[5] || '';
  const age = parseInt(parseFloat(row[6])) || 0;
  const born = parseInt(parseFloat(row[7])) || 0;
  const mp = parseInt(row[8]) || 0;
  const starts = parseInt(row[9]) || 0;
  const min = parseInt(row[10]) || 0;
  const ninetyS = parseFloat(row[11]) || 0.0;

  // Raw Matrix Extractions (Keep these as total integers/counts for DB display)
  const gls = parseInt(row[12]) || 0;
  const sh = parseInt(row[53]) || 0;
  const sot = parseInt(row[54]) || 0;
  const sh90 = parseFloat(row[56]) || 0.0;
  const sot90 = parseFloat(row[57]) || 0.0;
  const ast = parseInt(row[13]) || 0;
  const crs = parseInt(row[98]) || 0;
  const fld = parseInt(row[96]) || 0;
  const off = parseInt(row[97]) || 0;
  const crdy = parseInt(row[18]) || 0;
  const crdr = parseInt(row[19]) || 0;
  const fls = parseInt(row[95]) || 0;
  const inter = parseInt(row[99]) || 0;
  const tklw = parseInt(row[100]) || 0;

  // --- SAFEGUARD SCALAR TO PREVENT DIVISION BY ZERO ---
  const per90Scalar = ninetyS > 0 ? ninetyS : 1;

  // --- COMPUTE PER-90 RATES FOR VECTOR SIMILARITY ---
  const gls_90  = gls / per90Scalar;
  const sh_90   = sh / per90Scalar;
  const sot_90  = sot / per90Scalar;
  const ast_90  = ast / per90Scalar;
  const crs_90  = crs / per90Scalar;
  const fld_90  = fld / per90Scalar;
  const off_90  = off / per90Scalar;
  const fls_90  = fls / per90Scalar;
  const int_90  = inter / per90Scalar;
  const tklw_90 = tklw / per90Scalar;
  const crdy_90 = crdy / per90Scalar;
  const crdr_90 = crdr / per90Scalar;

  // --- RECALCULATED ESTIMATED PER-90 DERIVED STATS ---
  const passesComp_90 = 40 * (ast > 0 ? 1.1 : 0.8); 
  const keyPasses_90  = (ast_90 * 4) + (gls_90 * 0.5);
  const progressivePasses_90 = 4.0;
  const touches_90    = 55.0;
  const carries_90    = 35.0;
  const takeOns_90    = fld_90 * 0.8;

  // --- ASSEMBLE VECTOR STRINGS PURELY DRIVEN BY PER-90 INTERVALS ---
  // Note: We use the newly computed _90 variables inside the getZScore calls.
  // Ensure your getZScore function is configured to evaluate against Per-90 means/stdDevs.
  const vec_shooting   = `[${getZScore('gls', gls_90)},${getZScore('sh', sh_90)},${getZScore('sot', sot_90)},${getZScore('sh_90', sh90)},${getZScore('sot_90', sot90)}]`;
  const vec_passing    = `[${getZScore('ast', ast_90)},${getZScore('crs', crs_90)},${Math.min(passesComp_90 / 100, 1)},${Math.min(keyPasses_90 / 10, 1)},${Math.min(progressivePasses_90 / 15, 1)}]`;
  const vec_possession = `[${Math.min(touches_90 / 100, 1)},${Math.min(carries_90 / 80, 1)},${Math.min(takeOns_90 / 10, 1)},${getZScore('fld', fld_90)},${getZScore('off', off_90)}]`;
  const vec_defending  = `[${getZScore('int', int_90)},${getZScore('tklw', tklw_90)},${-getZScore('fls', fls_90)},${-getZScore('crdy', crdy_90)},${-getZScore('crdr', crdr_90)}]`;

  const query = `
    INSERT INTO players (
      player, nation, pos, squad, comp, age, born, mp, starts, min, "90s",
      gls, sh, sot, sh_90, sot_90, ast, crs, fld, off, crdy, crdr, fls, int, tklw,
      vector_shooting, vector_passing, vector_possession, vector_defending
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29)
  `;

  try {
    // Keep inserting raw totals ($12 to $25) to satisfy display requirements, 
    // while the vector slots ($26 to $29) remain optimized for Per 90 profiles.
    await db.query(query, [
      player, nation, pos, squad, comp, age, born, mp, starts, min, ninetyS,
      gls, sh, sot, sh90, sot90, ast, crs, fld, off, crdy, crdr, fls, inter, tklw,
      vec_shooting, vec_passing, vec_possession, vec_defending
    ]);
    successCount++;
    
    if (successCount % 200 === 0) {
      console.log(`⏳ Ingested ${successCount} profiles successfully...`);
    }
  } catch (err) {
    console.error(`❌ DB Insert Error on line ${lineCount} (${player}):`, err.message);
  }
}
    
    console.log(`\n🎉 PIPELINE COMPLETE: Successfully populated ${successCount} players into the database.`);
    process.exit(0);
  } catch (globalErr) {
    console.error('\n❌ CRITICAL RUNTIME CRASH:', globalErr.message);
    process.exit(1);
  }
}

importDataset();