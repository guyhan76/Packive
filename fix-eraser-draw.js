const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let lines = code.split("\n");
console.log("Start:", lines.length);

// ═══════════════════════════════════════════
// FIX 1: addText — eraser 비활성화 추가
// ═══════════════════════════════════════════
const addTextIdx = lines.findIndex(l => l.includes("const addText = useCallback"));
if (addTextIdx !== -1) {
  const oldLine = lines[addTextIdx + 1];
  // Add eraser cleanup before canvas operations
  lines[addTextIdx + 1] = "    if (eraserMode) { toggleEraser(); }\n" + oldLine;
  console.log("FIX 1a: addText eraser cleanup at line", addTextIdx + 2);
}
code = lines.join("\n"); lines = code.split("\n");

// ═══════════════════════════════════════════
// FIX 1b: addShape — eraser 비활성화 추가
// ═══════════════════════════════════════════
const addShapeIdx = lines.findIndex(l => l.includes("const addShape = useCallback"));
if (addShapeIdx !== -1) {
  const oldLine2 = lines[addShapeIdx + 1];
  lines[addShapeIdx + 1] = "    if (eraserMode) { toggleEraser(); }\n" + oldLine2;
  console.log("FIX 1b: addShape eraser cleanup at line", addShapeIdx + 2);
}
code = lines.join("\n"); lines = code.split("\n");

// ═══════════════════════════════════════════
// FIX 1c: addImage — eraser 비활성화 추가
// ═══════════════════════════════════════════
const addImgIdx = lines.findIndex(l => l.includes("const addImage = useCallback") && l.includes("fileRef"));
if (addImgIdx !== -1) {
  lines[addImgIdx] = "    const addImage = useCallback(() => { if (eraserMode) { toggleEraser(); } fileRef.current?.click(); }, [eraserMode, toggleEraser]);";
  console.log("FIX 1c: addImage eraser cleanup at line", addImgIdx + 1);
}
code = lines.join("\n"); lines = code.split("\n");

// ═══════════════════════════════════════════
// FIX 1d: toggleDraw — eraser 비활성화 강화
// ═══════════════════════════════════════════
const toggleDrawIdx = lines.findIndex(l => l.includes("const toggleDraw = useCallback"));
if (toggleDrawIdx !== -1) {
  // Find setEraserMode(false) line and add full cleanup
  for (let i = toggleDrawIdx; i < toggleDrawIdx + 25; i++) {
    if (lines[i] && lines[i].includes("setEraserMode(false)")) {
      // Replace with full eraser cleanup
      lines[i] = "        // Full eraser cleanup\n        if (eraserMode) { toggleEraser(); } else { setEraserMode(false); }";
      console.log("FIX 1d: toggleDraw eraser cleanup at line", i + 1);
      break;
    }
  }
}
code = lines.join("\n"); lines = code.split("\n");

// ═══════════════════════════════════════════
// FIX 2: path:created — 일반 그리기 시 eraser 로직 방지
// ═══════════════════════════════════════════
const pathCreatedIdx = lines.findIndex(l => l.includes("path:created"));
if (pathCreatedIdx !== -1) {
  // Find the full handler block and replace
  let pcEnd = pathCreatedIdx;
  let braces = 0; let started = false;
  for (let i = pathCreatedIdx; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === "{") { braces++; started = true; }
      if (ch === "}") braces--;
    }
    if (started && braces === 0) { pcEnd = i; break; }
  }
  
  const newPathCreated = `      // Handle path creation — push history for normal drawing
      canvas.on('path:created', () => {
        if (!loadingRef.current) { pushHistory(); refreshLayers(); }
      });`;
  
  lines.splice(pathCreatedIdx, pcEnd - pathCreatedIdx + 1, ...newPathCreated.split("\n"));
  console.log("FIX 2: path:created simplified at line", pathCreatedIdx + 1);
}
code = lines.join("\n"); lines = code.split("\n");

// ═══════════════════════════════════════════
// FIX 3: toggleEraser dependency — eraserMode 추가 확인
// ═══════════════════════════════════════════
// Already has [eraserMode, refreshLayers, pushHistory] — just verify
const teIdx = lines.findIndex(l => l.includes("const toggleEraser = useCallback"));
if (teIdx !== -1) {
  // Find the dependency array
  let teBraces = 0; let teStarted = false;
  for (let i = teIdx; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === "{") { teBraces++; teStarted = true; }
      if (ch === "}") teBraces--;
    }
    if (teStarted && teBraces === 0) {
      console.log("FIX 3: toggleEraser ends at line", i + 1, ":", lines[i].substring(0, 80));
      break;
    }
  }
}

// ═══════════════════════════════════════════
// FIX 4: addText, addShape deps에 eraserMode, toggleEraser 추가
// ═══════════════════════════════════════════
// addText deps
const addTextDepsIdx = lines.findIndex(l => l.includes("fSize, color, selectedFont, refreshLayers"));
if (addTextDepsIdx !== -1 && !lines[addTextDepsIdx].includes("eraserMode")) {
  lines[addTextDepsIdx] = lines[addTextDepsIdx].replace("fSize, color, selectedFont, refreshLayers", "fSize, color, selectedFont, refreshLayers, eraserMode, toggleEraser");
  console.log("FIX 4a: addText deps updated at line", addTextDepsIdx + 1);
}
// addShape deps
const addShapeDepsIdx = lines.findIndex(l => l.includes("color, refreshLayers]") && !l.includes("eraserMode"));
if (addShapeDepsIdx !== -1) {
  lines[addShapeDepsIdx] = lines[addShapeDepsIdx].replace("color, refreshLayers]", "color, refreshLayers, eraserMode, toggleEraser]");
  console.log("FIX 4b: addShape deps updated at line", addShapeDepsIdx + 1);
}

// Write final
code = lines.join("\n");
lines = code.split("\n");
const ob = (code.match(/\{/g) || []).length;
const cb2 = (code.match(/\}/g) || []).length;
console.log("Done! Lines:", lines.length, "| { :", ob, "| } :", cb2, "| diff:", ob - cb2);
fs.writeFileSync(file, code, "utf8");
