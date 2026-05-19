const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let lines = fs.readFileSync(file, "utf8").split("\n");
let changes = 0;

// Fix 1: Add blob-to-dataURL converter on object:added
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("canvas.on('object:added', () => { if (!loadingRef.current) pushHistory(); refreshLayers(); });")) {
    lines[i] = [
      "      canvas.on('object:added', (opt: any) => {",
      "        const obj = opt.target;",
      "        // Auto-convert blob URLs to data URLs for images",
      "        if (obj && obj.type === 'image' && obj._element && obj._element.src && obj._element.src.startsWith('blob:')) {",
      "          const el = obj._element;",
      "          const cvs = document.createElement('canvas');",
      "          cvs.width = el.naturalWidth || el.width;",
      "          cvs.height = el.naturalHeight || el.height;",
      "          const ctx2 = cvs.getContext('2d');",
      "          if (ctx2) {",
      "            ctx2.drawImage(el, 0, 0);",
      "            try {",
      "              const dataUrl = cvs.toDataURL('image/png');",
      "              obj.setSrc(dataUrl).then(() => { canvas.renderAll(); });",
      "            } catch {}",
      "          }",
      "        }",
      "        if (!loadingRef.current) pushHistory(); refreshLayers();",
      "      });",
    ].join("\n");
    changes++;
    console.log("1. Added blob-to-dataURL auto-converter on object:added");
    break;
  }
}

// Fix 2: Fix doSave to use toJSON(['src'])  - verify it was applied
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const json = JSON.stringify(c.toJSON(['src']));")) {
    console.log("2. doSave already uses toJSON(['src']) - OK");
    break;
  }
  if (lines[i].includes("const json = JSON.stringify(c.toJSON());")) {
    lines[i] = lines[i].replace("c.toJSON()", "c.toJSON(['src'])");
    changes++;
    console.log("2. Fixed doSave to use toJSON(['src'])");
    break;
  }
}

// Fix 3: Fix all canvas.toJSON() in pushHistory to include src
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const json = JSON.stringify(canvas.toJSON(['src']));")) {
    continue; // already fixed
  }
  if (lines[i].includes("const json = JSON.stringify(canvas.toJSON());") && 
      i > 0 && (lines[i-1].includes("pushTimer") || lines[i-2].includes("pushTimer") || lines[i-3].includes("pushTimer"))) {
    lines[i] = lines[i].replace("canvas.toJSON()", "canvas.toJSON(['src'])");
    changes++;
    console.log("3. Fixed pushHistory to use toJSON(['src'])");
    break;
  }
}

// Fix 4: Fix historyRef initial
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("historyRef.current = [JSON.stringify(canvas.toJSON(['src']))]")) {
    console.log("4. Initial history already uses toJSON(['src']) - OK");
    break;
  }
  if (lines[i].includes("historyRef.current = [JSON.stringify(canvas.toJSON())]")) {
    lines[i] = lines[i].replace("canvas.toJSON()", "canvas.toJSON(['src'])");
    changes++;
    console.log("4. Fixed initial history to use toJSON(['src'])");
    break;
  }
}

if (changes > 0) {
  fs.writeFileSync(file, lines.join("\n"), "utf8");
  console.log("Done! " + changes + " changes applied.");
} else {
  console.log("No changes made.");
}
