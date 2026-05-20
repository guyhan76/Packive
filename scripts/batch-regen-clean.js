const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = path.join(__dirname, "public", "dielines", "previews");

const TYPES = [
  { id: "fefco-0203", model: "fefco_0203", L: 300, W: 200, D: 250, Th: 3.0 },
  { id: "fefco-0210", model: "fefco_0210", L: 300, W: 200, D: 250, Th: 3.0 },
  { id: "fefco-0216", model: "fefco_0216", L: 300, W: 200, D: 250, Th: 3.0 },
  { id: "fefco-0217", model: "fefco_0217", L: 300, W: 200, D: 250, Th: 3.0 },
  { id: "fefco-0225", model: "fefco_0225", L: 300, W: 200, D: 250, Th: 3.0 },
  { id: "fefco-0301", model: "fefco_0301", L: 300, W: 200, D: 100, Th: 3.0, H: 50 },
  { id: "fefco-0304", model: "fefco_0304", L: 300, W: 200, D: 100, Th: 3.0, H: 50 },
  { id: "fefco-0310", model: "fefco_0310", L: 300, W: 200, D: 100, Th: 3.0, H: 50 },
  { id: "fefco-0401", model: "fefco_0401", L: 300, W: 200, D: 100, Th: 3.0 },
  { id: "fefco-0409", model: "fefco_0409", L: 300, W: 200, D: 100, Th: 3.0 },
  { id: "fefco-0421", model: "fefco_0421", L: 300, W: 200, D: 100, Th: 3.0 },
  { id: "fefco-0427", model: "fefco_0427", L: 300, W: 200, D: 100, Th: 3.0 },
  { id: "fefco-0501", model: "fefco_0501", L: 300, W: 200, D: 100, Th: 3.0 },
  { id: "fefco-0503", model: "fefco_0503", L: 300, W: 200, D: 100, Th: 3.0 },
  { id: "fefco-0711", model: "fefco_0711", L: 300, W: 200, D: 250, Th: 3.0 },
  { id: "fefco-0713", model: "fefco_0713", L: 300, W: 200, D: 250, Th: 3.0 },
  { id: "ecma-a20-reverse", model: "A20_20_03_04", L: 80, W: 40, D: 120, Th: 0.5 },
  { id: "ecma-a10-seal", model: "A10_20_01_04", L: 80, W: 40, D: 120, Th: 0.5 },
  { id: "ecma-a55-snaplock", model: "A55_20_03_01", L: 80, W: 40, D: 120, Th: 0.5 },
  { id: "ecma-a55-hanger", model: "A55_20_03_01", L: 80, W: 40, D: 120, Th: 0.5 },
  { id: "ecma-b10-tray", model: "B10_02_00_00_Lid", L: 200, W: 150, D: 40, Th: 0.5, H: 20 },
  { id: "ecma-b20-hinged", model: "B20_01_00_00_Lid", L: 200, W: 150, D: 40, Th: 0.5, H: 20 },
];

async function generate(type) {
  const outFile = path.join(OUTPUT_DIR, `${type.id}.svg`);
  
  const body = {
    modelName: type.model,
    epmModel: type.model,
    length: type.L,
    width: type.W,
    depth: type.D,
    thickness: type.Th,
    units: "mm",
    options: {
      DimensionType: "In",
      KnifeInfo: false,
      Sizes: false,
      GlueZone: false,
    },
  };
  if (type.H) body.height = type.H;
  // B10/B20 Lid option
  if (type.model.includes("B10")) body.options.Lid = "B10_02_00_00_A";
  if (type.model.includes("B20")) body.options.Lid = "B20_02_00_00_A";

  console.log(`[GEN] ${type.id} (${type.model})...`);
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch("http://localhost:3000/api/dieline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.log(`  [FAIL] attempt ${attempt}: HTTP ${res.status} - ${errText.substring(0, 120)}`);
        if (attempt < 3) { await new Promise(r => setTimeout(r, 3000)); continue; }
        return false;
      }
      const svgText = await res.text();
      if (!svgText.includes("<svg")) {
        console.log(`  [FAIL] attempt ${attempt}: response is not SVG`);
        if (attempt < 3) { await new Promise(r => setTimeout(r, 3000)); continue; }
        return false;
      }
      fs.writeFileSync(outFile, svgText, "utf8");
      const sizeKB = (fs.statSync(outFile).size / 1024).toFixed(1);
      console.log(`  [OK] ${sizeKB} KB → ${outFile}`);
      return true;
    } catch (err) {
      console.log(`  [FAIL] attempt ${attempt}: ${err.message}`);
      if (attempt < 3) { await new Promise(r => setTimeout(r, 3000)); continue; }
      return false;
    }
  }
  return false;
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  let ok = 0, fail = 0;
  for (const type of TYPES) {
    const success = await generate(type);
    if (success) ok++; else fail++;
    await new Promise(r => setTimeout(r, 2000)); // 2s delay between calls
  }
  
  console.log(`\n=== DONE ===`);
  console.log(`OK: ${ok}, Failed: ${fail}`);
  console.log(`Estimated cost: ~$${(ok * 0.47).toFixed(2)}`);
  console.log(`\nNext: run "node update-svg-paths.js" if needed`);
}

main();