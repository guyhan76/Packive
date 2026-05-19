const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let lines = fs.readFileSync(file, "utf8").split("\n");
let changes = 0;

// Fix 1: doSave - filter out guide objects before toJSON, then restore them
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const json = JSON.stringify(c.toJSON(") && 
      i > 2 && lines[i-1].includes("c.renderAll()") &&
      lines[i-2].includes("visible") && lines[i-3].includes("selectable === false")) {
    // Replace the toJSON line with one that removes guide objects first, then re-adds
    var indent = "    ";
    lines[i] = [
      indent + "// Remove guide objects before saving",
      indent + "const guideObjs = c.getObjects().filter((o: any) => o.selectable === false && o.evented === false);",
      indent + "guideObjs.forEach((o: any) => c.remove(o));",
      indent + "c.renderAll();",
      indent + "const json = JSON.stringify(c.toJSON(['src']));",
      indent + "// Re-add guide objects",
      indent + "guideObjs.forEach((o: any) => c.add(o));",
      indent + "guideObjs.forEach((o: any) => c.sendObjectToBack(o));",
      indent + "c.renderAll();",
    ].join("\n");
    changes++;
    console.log("1. Fixed doSave to exclude guide objects from JSON");
    break;
  }
}

// Fix 2: After loadFromJSON for savedJSON - remove the post-load forEach fix
// and instead just ensure guide objects exist
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("await canvas.loadFromJSON(JSON.parse(savedJSON))")) {
    // Find the forEach block that tries to fix selectable
    for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
      if (lines[j].includes("canvas.getObjects().forEach") && lines[j].includes("_isSafeZone")) {
        // Remove this block (it spans multiple lines until closing })
        var endBlock = j;
        for (let k = j; k < Math.min(j + 6, lines.length); k++) {
          if (lines[k].includes("});") && k > j) {
            endBlock = k;
            break;
          }
          if (lines[k].trim() === "});") {
            endBlock = k;
            break;
          }
        }
        // Replace with: remove all non-selectable objects that came from JSON, then re-create guides
        var indent2 = lines[j].match(/^(\s*)/)[1];
        var newBlock = [
          indent2 + "// Remove any guide objects that were accidentally saved in JSON",
          indent2 + "canvas.getObjects().filter((o: any) => o.selectable === false || o.evented === false).forEach((o: any) => canvas.remove(o));",
          indent2 + "// Re-create safe zone, guide text, size label",
          indent2 + "const _cw = canvas.getWidth(); const _ch = canvas.getHeight();",
          indent2 + "const _mg = Math.round(5 * scaleRef.current);",
          indent2 + "const _sz = new Rect({ left: _mg, top: _mg, originX: 'left', originY: 'top', width: _cw - _mg*2, height: _ch - _mg*2, fill: 'transparent', stroke: '#93B5F7', strokeWidth: 1.5, strokeDashArray: [8,5], selectable: false, evented: false });",
          indent2 + "canvas.add(_sz); canvas.sendObjectToBack(_sz);",
          indent2 + "const _gt = new FabricText(guideText, { left: _cw/2, top: _ch/2-10, originX: 'center', originY: 'center', fontSize: 13, fill: '#C0C0C0', fontFamily: 'Arial, sans-serif', selectable: false, evented: false });",
          indent2 + "canvas.add(_gt); canvas.sendObjectToBack(_gt);",
          indent2 + "const _sl = new FabricText(widthMM+' \\u00d7 '+heightMM+' mm', { left: _cw-_mg-4, top: _ch-_mg-4, originX: 'right', originY: 'bottom', fontSize: 11, fill: '#B0B0B0', fontFamily: 'Arial, sans-serif', selectable: false, evented: false });",
          indent2 + "canvas.add(_sl); canvas.sendObjectToBack(_sl);",
        ];
        lines.splice(j, endBlock - j + 1, ...newBlock);
        changes++;
        console.log("2. Fixed post-loadFromJSON to re-create guide objects");
        break;
      }
    }
    break;
  }
}

if (changes > 0) {
  fs.writeFileSync(file, lines.join("\n"), "utf8");
  console.log("Done! " + changes + " changes applied.");
} else {
  console.log("No changes made. Debug:");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("const json = JSON.stringify(c.toJSON(")) {
      for (let j = Math.max(0,i-4); j < i+2; j++) {
        console.log((j+1) + ": " + lines[j]);
      }
    }
  }
}
