// batch-retry-failed.js
// Retries the 7 failed box types with corrected parameters
// Run: node batch-retry-failed.js (while npm run dev is running)

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'public', 'dielines', 'previews');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// 7 failed models with corrected parameters
const FAILED_TYPES = [
  // fefco-0310: needs "height" parameter (H) - telescope box has L,W,D,H
  {
    id: 'fefco-0310',
    body: {
      modelName: 'fefco_0310', epmModel: 'fefco_0310',
      length: 300, width: 200, depth: 100, height: 50, thickness: 3.0, units: 'mm',
      options: { DimensionType: 'In', KnifeInfo: true, Sizes: true }
    }
  },
  // fefco-0401: no GlueZone support
  {
    id: 'fefco-0401',
    body: {
      modelName: 'fefco_0401', epmModel: 'fefco_0401',
      length: 300, width: 200, depth: 100, thickness: 3.0, units: 'mm',
      options: { DimensionType: 'In', KnifeInfo: true, Sizes: true }
    }
  },
  // fefco-0409: no GlueZone
  {
    id: 'fefco-0409',
    body: {
      modelName: 'fefco_0409', epmModel: 'fefco_0409',
      length: 250, width: 200, depth: 80, thickness: 3.0, units: 'mm',
      options: { DimensionType: 'In', KnifeInfo: true, Sizes: true }
    }
  },
  // fefco-0421: no GlueZone
  {
    id: 'fefco-0421',
    body: {
      modelName: 'fefco_0421', epmModel: 'fefco_0421',
      length: 250, width: 150, depth: 100, thickness: 3.0, units: 'mm',
      options: { DimensionType: 'In', KnifeInfo: true, Sizes: true }
    }
  },
  // fefco-0427: no GlueZone
  {
    id: 'fefco-0427',
    body: {
      modelName: 'fefco_0427', epmModel: 'fefco_0427',
      length: 250, width: 150, depth: 100, thickness: 3.0, units: 'mm',
      options: { DimensionType: 'In', KnifeInfo: true, Sizes: true }
    }
  },
  // ecma-b10-tray: correct model name is B10_02_00_00_Lid (with Lid suffix)
  {
    id: 'ecma-b10-tray',
    body: {
      modelName: 'B10_02_00_00_Lid', epmModel: 'B10_02_00_00_Lid',
      length: 200, width: 150, depth: 60, thickness: 400, units: 'mm',
      options: { DimensionType: 'In', KnifeInfo: true, Sizes: true }
    }
  },
  // ecma-b20-hinged: correct model name is B20_01_00_00_Lid (with Lid suffix)
  {
    id: 'ecma-b20-hinged',
    body: {
      modelName: 'B20_01_00_00_Lid', epmModel: 'B20_01_00_00_Lid',
      length: 200, width: 150, depth: 60, thickness: 400, units: 'mm',
      options: { DimensionType: 'In', KnifeInfo: true, Sizes: true }
    }
  },
];

async function generate(box, retries = 2) {
  const outputFile = path.join(OUTPUT_DIR, `${box.id}.svg`);

  if (fs.existsSync(outputFile)) {
    console.log(`  [SKIP] ${box.id} - already exists`);
    return { id: box.id, status: 'skipped' };
  }

  try {
    console.log(`  [GEN]  ${box.id} (${box.body.epmModel})...`);

    const res = await fetch('http://localhost:3000/api/dieline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(box.body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText.substring(0, 300)}`);
    }

    const data = await res.json();
    if (data.svg) {
      fs.writeFileSync(outputFile, data.svg, 'utf8');
      const sizeKB = (fs.statSync(outputFile).size / 1024).toFixed(1);
      console.log(`  [OK]   ${box.id} -> ${sizeKB} KB`);
      return { id: box.id, status: 'ok', size: sizeKB };
    } else {
      throw new Error(data.error || 'No SVG in response');
    }
  } catch (err) {
    if (retries > 0) {
      console.log(`  [RETRY] ${box.id} - ${err.message}`);
      await new Promise(r => setTimeout(r, 3000));
      return generate(box, retries - 1);
    }
    console.log(`  [FAIL] ${box.id} - ${err.message}`);
    return { id: box.id, status: 'failed', error: err.message };
  }
}

async function main() {
  console.log('=== Retry Failed Models (7 types) ===\n');

  const results = [];
  for (const box of FAILED_TYPES) {
    const result = await generate(box);
    results.push(result);
    if (result.status === 'ok') await new Promise(r => setTimeout(r, 2000));
  }

  const ok = results.filter(r => r.status === 'ok').length;
  const failed = results.filter(r => r.status === 'failed').length;
  console.log(`\n=== RESULT: OK ${ok} | Failed ${failed} / ${FAILED_TYPES.length} ===`);

  if (failed > 0) {
    console.log('\nStill failing:');
    results.filter(r => r.status === 'failed').forEach(r => console.log(`  ${r.id}: ${r.error}`));
  }

  console.log('\nNext: run "node update-svg-paths.js" to update template paths');
}

main().catch(console.error);
