const fs = require('fs');
const f = 'src/app/editor/design/page.tsx';
let src = fs.readFileSync(f, 'utf8');
let changes = 0;

// Fix 1: Add Save/Load Project buttons before Export button in header
const oldExportBtn = [
  '              <button',
  '                disabled={bodyDesigned === 0}',
  '                onClick={() => setShowExport(true)}',
  '                className={"px-4 py-2 text-sm rounded-lg transition " + (bodyDesigned > 0 ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-400 cursor-not-allowed")}',
  '              >',
  '                Export',
  '              </button>'
].join('\n');

const newBtns = [
  '              <button',
  '                onClick={saveProject}',
  '                className="px-3 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition"',
  '                title="Save entire project"',
  '              >',
  '                Save Project',
  '              </button>',
  '              <button',
  '                onClick={loadProject}',
  '                className="px-3 py-2 text-sm rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"',
  '                title="Load project file"',
  '              >',
  '                Load Project',
  '              </button>',
  '              <button',
  '                disabled={bodyDesigned === 0}',
  '                onClick={() => setShowExport(true)}',
  '                className={"px-4 py-2 text-sm rounded-lg transition " + (bodyDesigned > 0 ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-400 cursor-not-allowed")}',
  '              >',
  '                Export',
  '              </button>'
].join('\n');

if (src.includes(oldExportBtn)) {
  src = src.replace(oldExportBtn, newBtns);
  changes++;
  console.log('[Fix 1] Added Save/Load Project buttons before Export');
} else {
  console.log('[Fix 1] SKIP - Export button pattern not found');
  // Debug: find the line
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('setShowExport(true)')) {
      console.log('  Found setShowExport at line ' + (i+1) + ': ' + lines[i].trim());
    }
    if (lines[i].trim() === 'Export') {
      console.log('  Found "Export" text at line ' + (i+1) + ': ' + lines[i].trim());
    }
  }
}

// Fix 2: Save to localStorage in handleSave (if not already)
if (!src.includes("packive_project_")) {
  const marker = 'setPanels((prev) => ({ ...prev, [pid]: { json, thumbnail: thumb, designed: true } }));';
  if (src.includes(marker)) {
    const saveCode = marker + '\n    // Auto-save to localStorage\n    try {\n      const storageKey = "packive_project_" + boxType + "_" + L + "_" + W + "_" + D;\n      const updatedPanels = Object.assign({}, panels, { [pid]: { json: json, thumbnail: thumb, designed: true } });\n      localStorage.setItem(storageKey, JSON.stringify({ panels: updatedPanels, savedAt: new Date().toISOString() }));\n    } catch (e) { console.warn("Failed to auto-save", e); }';
    src = src.replace(marker, saveCode);
    changes++;
    console.log('[Fix 2] Added localStorage auto-save to handleSave');
  } else {
    console.log('[Fix 2] SKIP - setPanels marker not found');
  }
} else {
  console.log('[Fix 2] SKIP - already has packive_project_');
}

fs.writeFileSync(f, src, 'utf8');
console.log('Total changes: ' + changes);
