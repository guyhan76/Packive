// batch-final-retry.js
const fs = require('fs');
const path = require('path');
const OUTPUT_DIR = path.join(__dirname, 'public', 'dielines', 'previews');

const MODELS = [
  // fefco-0310: telescope - needs H parameter, fetch failed (server may have crashed from route.ts change, retry now)
  {
    id: 'fefco-0310',
    body: {
      modelName: 'fefco_0310', epmModel: 'fefco_0310',
      length: 300, width: 200, depth: 100, height: 50, thickness: 3.0, units: 'mm',
      options: { DimensionType: 'In', KnifeInfo: true, Sizes: true }
    }
  },
  // ecma-b10-tray: needs H param, Lid option, thickness <=2mm (ECMA = folding carton, not corrugated)
  {
    id: 'ecma-b10-tray',
    body: {
      modelName: 'B10_02_00_00_Lid', epmModel: 'B10_02_00_00_Lid',
      length: 200, width: 150, depth: 40, height: 20, thickness: 0.5, units: 'mm',
      options: { DimensionType: 'In', KnifeInfo: true, Sizes: true, Lid: 'B10_02_00_00_A' }
    }
  },
  // ecma-b20-hinged: same issues as b10
  {
    id: 'ecma-b20-hinged',
    body: {
      modelName: 'B20_01_00_00_Lid', epmModel: 'B20_01_00_00_Lid',
      length: 200, width: 150, depth: 40, height: 20, thickness: 0.5, units: 'mm',
      options: { DimensionType: 'In', KnifeInfo: true, Sizes: true, Lid: 'B20_02_00_00_A' }
    }
  },
];

async function generate(box, retries = 2) {
  const outputFile = path.join(OUTPUT_DIR, `${box.id}.svg`);
  if (fs.existsSync(outputFile)) {
    console.log(`  [SKIP] ${box.id}`);
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
      const t = await res.text();
      throw new Error(`HTTP ${res.status}: ${t.substring(0, 300)}`);
    }
    const data = await res.json();
    if (data.svg) {
      fs.writeFileSync(outputFile, data.svg, 'utf8');
      console.log(`  [OK]   ${box.id} -> ${(fs.statSync(outputFile).size/1024).toFixed(1)} KB`);
      return { id: box.id, status: 'ok' };
    }
    throw new Error(data.error || 'No SVG');
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
  console.log('=== Final Retry (3 models) ===\n');
  for (const box of MODELS) {
    const r = await generate(box);
    if (r.status === 'ok') await new Promise(r => setTimeout(r, 2000));
  }
  console.log('\nDone. Run: node update-svg-paths.js');
}
main().catch(console.error);
