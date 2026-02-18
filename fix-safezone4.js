const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let lines = fs.readFileSync(file, "utf8").split("\n");
let changes = 0;

// Find exact line: "canvas.getObjects().forEach" after "loadFromJSON(JSON.parse(savedJSON))"
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("await canvas.loadFromJSON(JSON.parse(savedJSON))")) {
    // Find the forEach block
    for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
      if (lines[j].includes("canvas.getObjects().forEach((o: any)")) {
        // Find closing of this forEach - look for matching });
        var startDel = j;
        var endDel = j;
        var braceCount = 0;
        for (let k = j; k < Math.min(j + 10, lines.length); k++) {
          var line = lines[k];
          for (var ch = 0; ch < line.length; ch++) {
            if (line[ch] === '{') braceCount++;
            if (line[ch] === '}') braceCount--;
          }
          if (braceCount <= 0 && k > j) {
            endDel = k;
            break;
          }
          if (k === j && braceCount <= 0) {
            endDel = k;
            break;
          }
        }
        
        var indent = "          ";
        var newLines = [
          indent + "// Remove any guide objects loaded from JSON, re-create fresh",
          indent + "const loadedObjs = canvas.getObjects().slice();",
          indent + "loadedObjs.forEach((o: any) => {",
          indent + "  if (o.selectable === false || o.evented === false) canvas.remove(o);",
          indent + "});",
          indent + "const _cw2 = canvas.getWidth(); const _ch2 = canvas.getHeight();",
          indent + "const _mg2 = Math.round(5 * scaleRef.current);",
          indent + "const { Rect: R2, FabricText: FT2 } = await import('fabric');",
          indent + "const _sz2 = new R2({ left: _mg2, top: _mg2, originX: 'left', originY: 'top', width: _cw2-_mg2*2, height: _ch2-_mg2*2, fill: 'transparent', stroke: '#93B5F7', strokeWidth: 1.5, strokeDashArray: [8,5], selectable: false, evented: false });",
          indent + "canvas.add(_sz2); canvas.sendObjectToBack(_sz2);",
          indent + "const _gt2 = new FT2(guideText, { left: _cw2/2, top: _ch2/2-10, originX: 'center', originY: 'center', fontSize: 13, fill: '#C0C0C0', fontFamily: 'Arial, sans-serif', selectable: false, evented: false });",
          indent + "canvas.add(_gt2); canvas.sendObjectToBack(_gt2);",
          indent + "const _sl2 = new FT2(widthMM + ' \\u00d7 ' + heightMM + ' mm', { left: _cw2-_mg2-4, top: _ch2-_mg2-4, originX: 'right', originY: 'bottom', fontSize: 11, fill: '#B0B0B0', fontFamily: 'Arial, sans-serif', selectable: false, evented: false });",
          indent + "canvas.add(_sl2); canvas.sendObjectToBack(_sl2);",
        ];
        
        console.log("Replacing lines " + (startDel+1) + " to " + (endDel+1));
        lines.splice(startDel, endDel - startDel + 1, ...newLines);
        changes++;
        console.log("1. Replaced post-loadFromJSON forEach with fresh guide creation");
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
  console.log("No changes made.");
}
