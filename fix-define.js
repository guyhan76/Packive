const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// Find the line "canvas.renderAll();" before the savedJSON or auto-save block
// We need to insert addSafeZone helper and didRestore variable after canvas setup
// Look for the safeRect/guide/sizeLabel creation, then the renderAll after sizeLabel

let insertIdx = -1;
for (let i = 0; i < lines.length; i++) {
  // Find "_isSizeLabel = true" line - this is the last safe zone object setup
  if (lines[i].includes('_isSizeLabel = true')) {
    // Find the next "canvas.renderAll();" or the auto-save block
    for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
      if (lines[j].trim().startsWith('canvas.renderAll()')) {
        insertIdx = j + 1;
        break;
      }
    }
    if (insertIdx > 0) break;
  }
}

if (insertIdx === -1) {
  // Fallback: find "// Auto-save: restore from localStorage"
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Auto-save: restore from localStorage')) {
      insertIdx = i;
      break;
    }
  }
}

console.log('Insert point: line ' + (insertIdx + 1));

if (insertIdx > 0) {
  // Find the safeRect variable name
  let safeRectVar = 'safeRect';
  let guideVar = 'guide';
  let sizeLabelVar = 'sizeLabel';

  const helperCode = [
    '',
    '      // Helper: add safe zone objects to canvas',
    '      const addSafeZone = () => {',
    '        canvas.getObjects().slice().forEach((o: any) => {',
    '          if (o._isSafeZone || o._isGuideText || o._isSizeLabel) canvas.remove(o);',
    '        });',
    '        const _sc = scaleRef.current; const _cw = canvas.getWidth(); const _ch = canvas.getHeight();',
    '        const _mg = Math.round(5 * _sc);',
    '        const _sr = new Rect({ left: _mg, top: _mg, originX: "left", originY: "top", width: _cw-_mg*2, height: _ch-_mg*2, fill: "transparent", stroke: "#93B5F7", strokeWidth: 1.5, strokeDashArray: [8,5], selectable: false, evented: false });',
    '        (_sr as any)._isSafeZone = true; canvas.add(_sr); canvas.sendObjectToBack(_sr);',
    '        const _gt = new FabricText(guideText || "", { left: _cw/2, top: _ch/2-10, originX: "center", originY: "center", fontSize: 13, fill: "#C0C0C0", fontFamily: "Arial, sans-serif", selectable: false, evented: false });',
    '        (_gt as any)._isGuideText = true; canvas.add(_gt); canvas.sendObjectToBack(_gt);',
    '        const _sl = new FabricText(widthMM + " \\u00d7 " + heightMM + " mm", { left: _cw-_mg-4, top: _ch-_mg-4, originX: "right", originY: "bottom", fontSize: 11, fill: "#B0B0B0", fontFamily: "Arial, sans-serif", selectable: false, evented: false });',
    '        (_sl as any)._isSizeLabel = true; canvas.add(_sl); canvas.sendObjectToBack(_sl);',
    '        canvas.renderAll();',
    '      };',
    '      let didRestore = false;',
    ''
  ];

  lines.splice(insertIdx, 0, ...helperCode);
  changes++;
  console.log('Inserted addSafeZone helper and didRestore at line ' + (insertIdx + 1));
}

// Now remove the initial canvas.add(safeRect) etc if they still exist as deferred comments
// Find and remove the old safeRect/guide/sizeLabel add calls (the ones before auto-save)
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// Deferred: added after auto-save/savedJSON load')) {
    // This line exists from previous fix - the objects are created but not added
    // We should keep object creation but it is now handled by addSafeZone
    // Actually addSafeZone creates its own objects, so we can remove the initial creation entirely
    console.log('Found deferred comment at line ' + (i+1) + ': ' + lines[i].trim());
  }
}

// Remove initial safeRect, guide, sizeLabel creation since addSafeZone handles it
// Find "const safeRect = new Rect({" and remove until the deferred comment
let removeStart = -1;
let removeEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const safeRect = new Rect(')) {
    removeStart = i;
  }
  if (removeStart > 0 && lines[i].includes('_isSizeLabel = true')) {
    // Find the next line(s) up to and including deferred comment or canvas.renderAll
    for (let j = i; j < Math.min(i + 5, lines.length); j++) {
      if (lines[j].includes('Deferred') || lines[j].trim() === '' || lines[j].includes('canvas.renderAll')) {
        removeEnd = j;
      }
    }
    break;
  }
}

if (removeStart > 0 && removeEnd > removeStart) {
  console.log('Removing initial safe zone creation: lines ' + (removeStart+1) + ' to ' + (removeEnd+1));
  // Replace with a single addSafeZone() call
  const indent = '      ';
  lines.splice(removeStart, removeEnd - removeStart + 1, indent + 'addSafeZone();');
  changes++;
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('\nTotal changes: ' + changes);

// Verify
const final = fs.readFileSync(file, 'utf8');
console.log('addSafeZone defined: ' + final.includes('const addSafeZone'));
console.log('didRestore defined: ' + final.includes('let didRestore'));
console.log('addSafeZone calls: ' + (final.match(/addSafeZone\(\)/g) || []).length);
