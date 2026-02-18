const fs = require('fs');
const f = 'src/app/editor/design/page.tsx';
let src = fs.readFileSync(f, 'utf8');
let changes = 0;

// Normalize line endings to \n
src = src.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
console.log('Normalized line endings');

// Fix 1: Insert Save/Load buttons before Export button
const oldBlock = '              <button\n                disabled={bodyDesigned === 0}\n                onClick={() => setShowExport(true)}';

const newBlock = '              <button\n                onClick={saveProject}\n                className="px-3 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition"\n                title="Save entire project"\n              >\n                Save Project\n              </button>\n              <button\n                onClick={loadProject}\n                className="px-3 py-2 text-sm rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"\n                title="Load project file"\n              >\n                Load Project\n              </button>\n              <button\n                disabled={bodyDesigned === 0}\n                onClick={() => setShowExport(true)}';

if (src.includes(oldBlock)) {
  src = src.replace(oldBlock, newBlock);
  changes++;
  console.log('[Fix 1] Added Save/Load Project buttons before Export');
} else {
  console.log('[Fix 1] SKIP');
  const lines = src.split('\n');
  for (let i = 578; i < 588; i++) {
    console.log('  L' + (i+1) + ' [' + lines[i].length + '] ' + JSON.stringify(lines[i]));
  }
}

// Fix 2: Add localStorage auto-save in handleSave
const lines2 = src.split('\n');
for (let i = 0; i < lines2.length; i++) {
  if (lines2[i].includes('setPanels') && lines2[i].includes('thumbnail') && lines2[i].includes('designed')) {
    console.log('[Fix 2] Found setPanels at line ' + (i+1) + ': ' + lines2[i].trim().substring(0, 80));
    if (!src.includes('packive_project_')) {
      const indent = lines2[i].match(/^(\s*)/)[1];
      const saveCode = [
        indent + '// Auto-save to localStorage',
        indent + 'try {',
        indent + '  const storageKey = "packive_project_" + boxType + "_" + L + "_" + W + "_" + D;',
        indent + '  const up = Object.assign({}, panels, { [pid]: { json: json, thumbnail: thumb, designed: true } });',
        indent + '  localStorage.setItem(storageKey, JSON.stringify({ panels: up, savedAt: new Date().toISOString() }));',
        indent + '} catch (e) { console.warn("auto-save failed", e); }'
      ].join('\n');
      lines2.splice(i + 1, 0, saveCode);
      src = lines2.join('\n');
      changes++;
      console.log('[Fix 2] Added localStorage auto-save');
    }
    break;
  }
}

// Restore \r\n for Windows
src = src.replace(/\n/g, '\r\n');
fs.writeFileSync(f, src, 'utf8');
console.log('Total changes: ' + changes);
