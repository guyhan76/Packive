const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
console.log("Start:",lines.length);

// ═══ FIX 1: pushHistory - remove guides completely, not just hide ═══
for(let i=1441;i<1455;i++){
  if(lines[i] && lines[i].includes("const pushHistory = useCallback")){
    // Replace pushHistory (lines i to i+12)
    const end = lines.findIndex((l,idx) => idx > i && l.trim().startsWith("}, ["));
    if(end > 0){
      const newPush = [
        "  const pushHistory = useCallback(() => {",
        "    const c = fcRef.current; if (!c) return;",
        "    // Remove guide objects before saving",
        "    const guides: any[] = [];",
        "    c.getObjects().slice().forEach((o: any) => {",
        "      if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern) {",
        "        guides.push(o); c.remove(o);",
        "      }",
        "    });",
        "    const json = JSON.stringify(c.toJSON(['_isBgImage','selectable','evented','name']));",
        "    // Re-add guides",
        "    guides.forEach(g => c.add(g));",
        "    c.renderAll();",
        "    const arr = historyRef.current;",
        "    if (historyIdxRef.current < arr.length - 1) arr.splice(historyIdxRef.current + 1);",
        "    arr.push(json); if (arr.length > 50) arr.shift();",
        "    historyIdxRef.current = arr.length - 1; setHistoryIdx(historyIdxRef.current);",
        "  }, []);"
      ];
      lines.splice(i, end - i + 1, ...newPush);
      console.log("FIX 1: pushHistory rewritten at line", i+1);
      break;
    }
  }
}

// ═══ FIX 2: initial history - remove guides, not hide ═══
for(let i=1380;i<1395;i++){
  if(lines[i] && lines[i].includes("initGuides.forEach") && lines[i].includes("visible:false")){
    // Replace lines from initGuides definition to canvas.renderAll()
    const startLine = i - 1; // line with const initGuides =
    // Find the renderAll line
    let endLine = i;
    for(let j=i;j<i+5;j++){
      if(lines[j] && lines[j].includes("canvas.renderAll()")){
        endLine = j; break;
      }
    }
    const newInit = [
      "      const initGuides: any[] = [];",
      "      canvas.getObjects().slice().forEach((o: any) => {",
      "        if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern) {",
      "          initGuides.push(o); canvas.remove(o);",
      "        }",
      "      });",
      "      historyRef.current = [JSON.stringify(canvas.toJSON(['_isBgImage','selectable','evented','name']))];",
      "      initGuides.forEach(g => canvas.add(g));",
      "      canvas.renderAll();"
    ];
    lines.splice(startLine, endLine - startLine + 1, ...newInit);
    console.log("FIX 2: initial history rewritten at line", startLine+1);
    break;
  }
}

// ═══ FIX 3: Canvas sizing - better proportions for all panels ═══
for(let i=0;i<lines.length;i++){
  if(lines[i] && lines[i].includes("if (ratio >= 1)")) {
    // Find the closing bracket of this if-else block
    let braceCount = 0; let endIdx = i;
    for(let j=i;j<i+15;j++){
      const ob = (lines[j].match(/\{/g)||[]).length;
      const cb = (lines[j].match(/\}/g)||[]).length;
      braceCount += ob - cb;
      if(j > i && braceCount <= 0) { endIdx = j; break; }
    }
    const newSizing = [
      "      // Unified sizing: fit within available area maintaining aspect ratio",
      "      const maxW = availW * 0.7;",
      "      const maxH = availH * 0.75;",
      "      if (maxW / maxH > ratio) {",
      "        canvasH = maxH;",
      "        canvasW = maxH * ratio;",
      "      } else {",
      "        canvasW = maxW;",
      "        canvasH = maxW / ratio;",
      "      }",
      "      // Ensure minimum visible size",
      "      if (canvasW < 200) { canvasW = 200; canvasH = 200 / ratio; }",
      "      if (canvasH < 120) { canvasH = 120; canvasW = 120 * ratio; }",
      "      // Ensure doesn't exceed available space",
      "      if (canvasW > availW * 0.85) { canvasW = availW * 0.85; canvasH = canvasW / ratio; }",
      "      if (canvasH > availH * 0.85) { canvasH = availH * 0.85; canvasW = canvasH * ratio; }"
    ];
    lines.splice(i, endIdx - i + 1, ...newSizing);
    console.log("FIX 3: Canvas sizing rewritten at line", i+1);
    break;
  }
}

const code = lines.join("\n");
fs.writeFileSync(file, code, "utf8");
const ob = (code.match(/\{/g)||[]).length;
const cb = (code.match(/\}/g)||[]).length;
console.log("Done! Lines:", code.split("\n").length, "| diff:", ob-cb);
