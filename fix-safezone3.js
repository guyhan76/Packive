const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let lines = fs.readFileSync(file, "utf8").split("\n");
let changes = 0;

// Fix 1: doSave - exclude guide objects from JSON
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("c.toJSON(['src','selectable','evented','_isSafeZone'")) {
    lines[i] = "    const guideObjs = c.getObjects().filter((o: any) => o.selectable === false && o.evented === false);" +
      "\n    guideObjs.forEach((o: any) => c.remove(o));" +
      "\n    c.renderAll();" +
      "\n    const json = JSON.stringify(c.toJSON(['src']));" +
      "\n    guideObjs.forEach((o: any) => c.add(o));" +
      "\n    guideObjs.forEach((o: any) => c.sendObjectToBack(o));" +
      "\n    c.renderAll();";
    changes++;
    console.log("1. Fixed doSave to exclude guide objects");
    break;
  }
}

// Fix 2: After loadFromJSON - re-create guide objects instead of trying to fix properties
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("await canvas.loadFromJSON(JSON.parse(savedJSON))")) {
    // Find the forEach block after this
    for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
      if (lines[j].includes("canvas.getObjects().forEach") && 
          (lines[j].includes("_isSafeZone") || lines[j].includes("selectable === false"))) {
        // Find end of this block
        var endBlock = j;
        for (let k = j; k < Math.min(j + 8, lines.length); k++) {
          if (lines[k].includes("});") || (lines[k].trim() === "});" )) {
            endBlock = k;
            break;
          }
        }
        var indent = "          ";
        var newLines = [
          indent + "// Remove guide objects from loaded JSON and re-create fresh ones",
          indent + "canvas.getObjects().filter((o: any) => o.selectable === false || o.evented === false).forEach((o: any) => canvas.remove(o));",
          indent + "const _cw = canvas.getWidth(); const _ch = canvas.getHeight();",
          indent + "const _mg = Math.round(5 * scaleRef.current);",
          indent + "const _sz = new Rect({ left: _mg, top: _mg, originX: 'left', originY: 'top', width: _cw-_mg*2, height: _ch-_mg*2, fill: 'transparent', stroke: '#93B5F7', strokeWidth: 1.5, strokeDashArray: [8,5], selectable: false, evented: false });",
          indent + "canvas.add(_sz); canvas.sendObjectToBack(_sz);",
          indent + "const _gt = new FabricText(guideText, { left: _cw/2, top: _ch/2-10, originX: 'center', originY: 'center', fontSize: 13, fill: '#C0C0C0', fontFamily: 'Arial, sans-serif', selectable: false, evented: false });",
          indent + "canvas.add(_gt); canvas.sendObjectToBack(_gt);",
          indent + "const _sl = new FabricText(widthMM+'\\u00d7'+heightMM+' mm', { left: _cw-_mg-4, top: _ch-_mg-4, originX: 'right', originY: 'bottom', fontSize: 11, fill: '#B0B0B0', fontFamily: 'Arial, sans-serif', selectable: false, evented: false });",
          indent + "canvas.add(_sl); canvas.sendObjectToBack(_sl);",
        ];
        lines.splice(j, endBlock - j + 1, ...newLines);
        changes++;
        console.log("2. Fixed post-loadFromJSON to re-create guide objects");
        break;
      }
    }
    break;
  }
}

// Fix 3: pushHistory - also exclude guide objects
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("canvas.toJSON(['src','selectable','evented','_isSafeZone'")) {
    lines[i] = lines[i].replace(
      /canvas\.toJSON\(\[.*?\]\)/,
      "canvas.toJSON(['src'])"
    );
    changes++;
    console.log("3. Fixed pushHistory toJSON");
    break;
  }
}

// Fix 4: initial historyRef
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("historyRef.current = [JSON.stringify(canvas.toJSON(") && 
      lines[i].includes("selectable")) {
    lines[i] = lines[i].replace(
      /canvas\.toJSON\(\[.*?\]\)/,
      "canvas.toJSON(['src'])"
    );
    changes++;
    console.log("4. Fixed initial history toJSON");
    break;
  }
}

if (changes > 0) {
  fs.writeFileSync(file, lines.join("\n"), "utf8");
  console.log("Done! " + changes + " changes applied.");
} else {
  console.log("No changes made.");
}
