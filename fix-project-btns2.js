const fs = require('fs');
const f = 'src/app/editor/design/page.tsx';
let src = fs.readFileSync(f, 'utf8');
let changes = 0;

// Fix 1: Insert Save/Load buttons before Export button
// Use exact whitespace from the file (lines 580-586)
const oldBlock = '               <button\n                 disabled={bodyDesigned === 0}\n                 onClick={() => setShowExport(true)}';

const newBlock = '               <button\n                 onClick={saveProject}\n                 className="px-3 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition"\n                 title="Save entire project"\n               >\n                 Save Project\n               </button>\n               <button\n                 onClick={loadProject}\n                 className="px-3 py-2 text-sm rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"\n                 title="Load project file"\n               >\n                 Load Project\n               </button>\n               <button\n                 disabled={bodyDesigned === 0}\n                 onClick={() => setShowExport(true)}';

if (src.includes(oldBlock)) {
  src = src.replace(oldBlock, newBlock);
  changes++;
  console.log('[Fix 1] Added Save/Load Project buttons before Export');
} else {
  console.log('[Fix 1] SKIP - pattern not found');
  // Extra debug
  const lines = src.split('\n');
  console.log('  Line 580 starts with ' + JSON.stringify(lines[579].substring(0, 25)));
  console.log('  Line 581 starts with ' + JSON.stringify(lines[580].substring(0, 25)));
}

// Fix 2: Add localStorage auto-save in handleSave
const lines = src.split('\n');
let fix2done = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('setPanels') && lines[i].includes('thumbnail: thumb') && lines[i].includes('designed: true')) {
    if (!src.includes('packive_project_')) {
      const indent = lines[i].match(/^(\s*)/)[1];
      const saveLines = [
        indent + '// Auto-save to localStorage',
        indent + 'try {',
        indent + '  const storageKey = "packive_project_" + boxType + "_" + L + "_" + W + "_" + D;',
        indent + '  const updatedPanels = Object.assign({}, panels, { [pid]: { json: json, thumbnail: thumb, designed: true } });',
        indent + '  localStorage.setItem(storageKey, JSON.stringify({ panels: updatedPanels, savedAt: new Date().toISOString() }));',
        indent + '} catch (e) { console.warn("Failed to auto-save", e); }'
      ].join('\n');
      lines.splice(i + 1, 0, saveLines);
      src = lines.join('\n');
      changes++;
      fix2done = true;
      console.log('[Fix 2] Added localStorage auto-save after line ' + (i + 1));
    } else {
      console.log('[Fix 2] SKIP - packive_project_ already exists');
    }
    break;
  }
}
if (!fix2done && !src.includes('packive_project_')) {
  console.log('[Fix 2] SKIP - setPanels pattern not found');
}

fs.writeFileSync(f, src, 'utf8');
console.log('Total changes: ' + changes);
