// batch-generate-previews.js
// Run: 1) npm run dev (terminal 1)  2) node batch-generate-previews.js (terminal 2)
// Generates dieline preview SVGs for all box types via Packive /api/dieline

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'public', 'dielines', 'previews');

// 22 remaining box types (3 already exist in public/dielines/)
const BOX_TYPES = [
  // Slotted
  { id: 'fefco-0203', model: 'fefco_0203', L: 300, W: 200, H: 200, Th: 3.0 },
  { id: 'fefco-0210', model: 'fefco_0210', L: 300, W: 200, H: 200, Th: 3.0 },
  { id: 'fefco-0216', model: 'fefco_0216', L: 300, W: 200, H: 200, Th: 3.0 },
  { id: 'fefco-0217', model: 'fefco_0217', L: 300, W: 200, H: 200, Th: 3.0 },
  { id: 'fefco-0225', model: 'fefco_0225', L: 300, W: 200, H: 200, Th: 3.0 },
  // Telescope
  { id: 'fefco-0301', model: 'fefco_0301', L: 300, W: 200, H: 150, Th: 3.0 },
  { id: 'fefco-0304', model: 'fefco_0304', L: 300, W: 200, H: 150, Th: 3.0 },
  { id: 'fefco-0310', model: 'fefco_0310', L: 300, W: 200, H: 150, Th: 3.0 },
  // Folder
  { id: 'fefco-0401', model: 'fefco_0401', L: 300, W: 200, H: 100, Th: 3.0 },
  { id: 'fefco-0409', model: 'fefco_0409', L: 250, W: 200, H: 80, Th: 3.0 },
  { id: 'fefco-0421', model: 'fefco_0421', L: 250, W: 150, H: 100, Th: 3.0 },
  { id: 'fefco-0427', model: 'fefco_0427', L: 250, W: 150, H: 100, Th: 3.0 },
  // Slide
  { id: 'fefco-0501', model: 'fefco_0501', L: 200, W: 150, H: 80, Th: 3.0 },
  { id: 'fefco-0503', model: 'fefco_0503', L: 200, W: 150, H: 80, Th: 3.0 },
  // Ready-glued
  { id: 'fefco-0711', model: 'fefco_0711', L: 250, W: 180, H: 100, Th: 3.0 },
  { id: 'fefco-0713', model: 'fefco_0713', L: 250, W: 180, H: 60, Th: 3.0 },
  // ECMA Tuck-end
  { id: 'ecma-a20-reverse', model: 'A20_20_03_01', L: 80, W: 40, H: 120, Th: 0.4 },
  { id: 'ecma-a10-seal', model: 'A10_10_03_03', L: 80, W: 40, H: 120, Th: 0.4 },
  // ECMA Snap-lock
  { id: 'ecma-a55-snaplock', model: 'A55_20_01_03', L: 80, W: 50, H: 100, Th: 0.4 },
  { id: 'ecma-a55-hanger', model: 'A55_21_01_03', L: 80, W: 50, H: 100, Th: 0.4 },
  // ECMA Tray-lid
  { id: 'ecma-b10-tray', model: 'B10_20_05_01', L: 200, W: 150, H: 60, Th: 0.5 },
  { id: 'ecma-b20-hinged', model: 'B20_20_01_05', L: 200, W: 150, H: 60, Th: 0.5 },
];

async function generatePreview(box, retries = 2) {
  const outputFile = path.join(OUTPUT_DIR, `${box.id}.svg`);

  if (fs.existsSync(outputFile)) {
    console.log(`  [SKIP] ${box.id} - already exists`);
    return { id: box.id, status: 'skipped' };
  }

  try {
    console.log(`  [GEN]  ${box.id} (${box.model}) ${box.L}x${box.W}x${box.H}...`);

    const res = await fetch('http://localhost:3000/api/dieline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelName: box.model,
        epmModel: box.model,
        length: box.L,
        width: box.W,
        depth: box.H,
        thickness: box.Th,
        units: 'mm',
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText.substring(0, 200)}`);
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
      return generatePreview(box, retries - 1);
    }
    console.log(`  [FAIL] ${box.id} - ${err.message}`);
    return { id: box.id, status: 'failed', error: err.message };
  }
}

async function main() {
  console.log('=== Batch Dieline Preview Generator ===');
  console.log(`Generating: ${BOX_TYPES.length} box types`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Already have: FEFCO-0201, FEFCO-0215, ECMA-A20.20.03.03\n`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const results = [];
  for (const box of BOX_TYPES) {
    const result = await generatePreview(box);
    results.push(result);
    if (result.status === 'ok') {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Summary
  const ok = results.filter(r => r.status === 'ok').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const failed = results.filter(r => r.status === 'failed').length;

  console.log('\n=== SUMMARY ===');
  console.log(`OK: ${ok} | Skipped: ${skipped} | Failed: ${failed} / ${results.length}`);
  console.log(`Total cost: ~$${(ok * 0.47).toFixed(2)} (${ok} API calls x $0.47)`);

  if (failed > 0) {
    console.log('\nFailed:');
    results.filter(r => r.status === 'failed').forEach(r => console.log(`  ${r.id}: ${r.error}`));
  }

  // Output svgPath mapping for quick copy-paste
  console.log('\n=== svgPath mapping (copy this) ===');
  const allOk = results.filter(r => r.status === 'ok');
  allOk.forEach(r => console.log(`  "${r.id}": "/dielines/previews/${r.id}.svg"`));
}

main().catch(console.error);
