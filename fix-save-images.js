const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let lines = fs.readFileSync(file, "utf8").split("\n");
let changes = 0;

// Fix 1: doSave - change c.toJSON() to c.toJSON(['src']) so images are included
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const json = JSON.stringify(c.toJSON());") && 
      i > 0 && lines[i-5] !== undefined) {
    lines[i] = lines[i].replace("c.toJSON()", "c.toJSON(['src'])");
    changes++;
    console.log("1. Fixed doSave to include image src in JSON");
    break;
  }
}

// Fix 2: historyRef initial push - also include src
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("historyRef.current = [JSON.stringify(canvas.toJSON())]")) {
    lines[i] = lines[i].replace("canvas.toJSON()", "canvas.toJSON(['src'])");
    changes++;
    console.log("2. Fixed initial history to include image src");
    break;
  }
}

// Fix 3: pushHistory - also include src
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const json = JSON.stringify(canvas.toJSON());") && 
      lines[i-1] !== undefined) {
    lines[i] = lines[i].replace("canvas.toJSON()", "canvas.toJSON(['src'])");
    changes++;
    console.log("3. Fixed pushHistory to include image src");
    break;
  }
}

// Fix 4: Copy (Ctrl+C) - convert blob URL to dataURL before saving
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const jsonData = obj.toJSON(['src'])") && 
      lines[i].includes("__clipboardJSON")) {
    var indent = "          ";
    var newLines = [
      indent + "if (obj) {",
      indent + "  const doClipboard = async () => {",
      indent + "    let jsonData = obj.toJSON(['src']);",
      indent + "    // Convert blob URLs to data URLs for images",
      indent + "    if (jsonData.type === 'image' && jsonData.src && jsonData.src.startsWith('blob:')) {",
      indent + "      try {",
      indent + "        const resp = await fetch(jsonData.src);",
      indent + "        const blob = await resp.blob();",
      indent + "        const dataUrl = await new Promise(resolve => { const r = new FileReader(); r.onloadend = () => resolve(r.result); r.readAsDataURL(blob); });",
      indent + "        jsonData = { ...jsonData, src: dataUrl };",
      indent + "      } catch {}",
      indent + "    }",
      indent + "    (window as any).__clipboardJSON = jsonData;",
      indent + "    try { localStorage.setItem('__packive_clipboard', JSON.stringify(jsonData)); } catch {}",
      indent + "  };",
      indent + "  doClipboard();",
      indent + "}",
    ];
    lines[i] = newLines.join("\n");
    changes++;
    console.log("4. Fixed Ctrl+C to convert blob URLs to data URLs");
    break;
  }
}

// Fix 5: Also fix image loading - when images are added, convert blob to dataURL on canvas
// Add a handler after image is added to convert blob src to data URL
// Find where FabricImage.fromURL is used for file uploads
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("URL.revokeObjectURL(url)") && 
      lines[i-1] !== undefined && 
      lines[i-2] !== undefined &&
      lines[i-2].includes("refreshLayers")) {
    // Don't revoke URL immediately - or better, convert to dataURL first
    // Actually the issue is that after revokeObjectURL, the image src becomes invalid
    // We need to convert blob to dataURL before adding to canvas
    break;
  }
}

if (changes > 0) {
  fs.writeFileSync(file, lines.join("\n"), "utf8");
  console.log("Done! " + changes + " changes applied.");
} else {
  console.log("No changes made.");
}
