const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// 1) Add tabIndex={-1} to zoom minus button
const zoomMinusOld = `<button onClick={() => applyZoom(zoom - 25)} className="w-7 h-7 flex items-center justify-center text-sm text-gray-600 hover:bg-gray-100 rounded">−</button>`;
const zoomMinusNew = `<button tabIndex={-1} onClick={() => applyZoom(zoom - 25)} className="w-7 h-7 flex items-center justify-center text-sm text-gray-600 hover:bg-gray-100 rounded">−</button>`;
if (code.includes(zoomMinusOld)) {
  code = code.replace(zoomMinusOld, zoomMinusNew);
  changes++;
  console.log("[Fix] zoom - button: added tabIndex={-1}");
}

// 2) Add tabIndex={-1} to zoom plus button
const zoomPlusOld = `<button onClick={() => applyZoom(zoom + 25)} className="w-7 h-7 flex items-center justify-center text-sm text-gray-600 hover:bg-gray-100 rounded">+</button>`;
const zoomPlusNew = `<button tabIndex={-1} onClick={() => applyZoom(zoom + 25)} className="w-7 h-7 flex items-center justify-center text-sm text-gray-600 hover:bg-gray-100 rounded">+</button>`;
if (code.includes(zoomPlusOld)) {
  code = code.replace(zoomPlusOld, zoomPlusNew);
  changes++;
  console.log("[Fix] zoom + button: added tabIndex={-1}");
}

// 3) Add tabIndex={-1} to zoom reset button (100%)
const zoomResetOld = `<button onClick={() => applyZoom(100)}`;
const zoomResetNew = `<button tabIndex={-1} onClick={() => applyZoom(100)}`;
if (code.includes(zoomResetOld)) {
  code = code.replace(zoomResetOld, zoomResetNew);
  changes++;
  console.log("[Fix] zoom reset button: added tabIndex={-1}");
}

// 4) In Space DOWN handler, blur any focused element first
const spaceDownOld = `if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        e.stopPropagation();
        setIsPanning(true);
        isPanningRef.current = true;`;
const spaceDownNew = `if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        e.stopPropagation();
        // Blur focused button to prevent space triggering zoom
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        setIsPanning(true);
        isPanningRef.current = true;`;
if (code.includes(spaceDownOld)) {
  code = code.replace(spaceDownOld, spaceDownNew);
  changes++;
  console.log("[Fix] Space DOWN: added blur() to prevent button activation");
}

// 5) Also add tabIndex={-1} to grid toggle and minimap toggle buttons
const gridBtnOld = `title="Toggle Grid">⊞</button>`;
const gridBtnNew = `title="Toggle Grid" tabIndex={-1}>⊞</button>`;
if (code.includes(gridBtnOld)) {
  code = code.replace(gridBtnOld, gridBtnNew);
  changes++;
  console.log("[Fix] grid toggle: added tabIndex={-1}");
}

const minimapBtnOld = `title="Toggle Minimap">🗺</button>`;
const minimapBtnNew = `title="Toggle Minimap" tabIndex={-1}>🗺</button>`;
if (code.includes(minimapBtnOld)) {
  code = code.replace(minimapBtnOld, minimapBtnNew);
  changes++;
  console.log("[Fix] minimap toggle: added tabIndex={-1}");
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
if (changes >= 4) console.log("✅ Space bar will no longer trigger zoom buttons!");
else console.log("⚠️ Some patterns not found, check manually");
