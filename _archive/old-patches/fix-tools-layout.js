const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// Find Tools section boundaries
let toolsToggleIdx = -1;
let toolsDisplayIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection(\"tools\")')) { toolsToggleIdx = i; }
  if (lines[i].includes('openSections.has(\"tools\")') && lines[i].includes('display')) { toolsDisplayIdx = i; break; }
}
console.log('Tools toggle line:', toolsToggleIdx + 1, 'Display line:', toolsDisplayIdx + 1);

// Find Clone ToolButton
let cloneIdx = -1;
for (let i = toolsDisplayIdx; i < lines.length; i++) {
  if (lines[i].includes('ToolButton') && lines[i].includes('Clone')) { cloneIdx = i; break; }
}
console.log('Clone ToolButton at line:', cloneIdx + 1);

// Find Delete ToolButton
let deleteIdx = -1;
for (let i = cloneIdx + 1; i < lines.length; i++) {
  if (lines[i].includes('ToolButton') && lines[i].includes('Delete')) { deleteIdx = i; break; }
}
console.log('Delete ToolButton at line:', deleteIdx + 1);

// Find Draw ToolButton
let drawIdx = -1;
for (let i = deleteIdx + 1; i < lines.length; i++) {
  if (lines[i].includes('ToolButton') && lines[i].includes('Draw')) { drawIdx = i; break; }
}
console.log('Draw ToolButton at line:', drawIdx + 1);

// Find Measure ToolButton
let measureIdx = -1;
for (let i = drawIdx + 1; i < lines.length; i++) {
  if (lines[i].includes('ToolButton') && lines[i].includes('Measure')) { measureIdx = i; break; }
}
console.log('Measure ToolButton at line:', measureIdx + 1);

// Find Clear Canvas button
let clearIdx = -1;
for (let i = measureIdx + 1; i < lines.length; i++) {
  if (lines[i].includes('Clear Canvas') && lines[i].includes('confirm')) { clearIdx = i; break; }
}
// Actually find the <button onClick line for Clear Canvas
for (let i = measureIdx + 1; i < lines.length; i++) {
  if (lines[i].includes('Clear canvas? This cannot be undone')) { clearIdx = i - 2; break; }
}
console.log('Clear Canvas near line:', clearIdx + 1);

// Find Undo/Redo div
let undoIdx = -1;
for (let i = (clearIdx > 0 ? clearIdx : measureIdx) + 1; i < lines.length; i++) {
  if (lines[i].includes('onClick={undo}')) { undoIdx = i; break; }
}
console.log('Undo at line:', undoIdx + 1);

// Now insert dividers and grid wrappers (bottom to top)

// Before Undo/Redo - add divider
if (undoIdx > 0) {
  // Find the <div className="flex gap before undo
  let undoDivIdx = undoIdx;
  for (let k = undoIdx; k >= undoIdx - 3; k--) {
    if (lines[k].includes('flex gap')) { undoDivIdx = k; break; }
  }
  lines.splice(undoDivIdx, 0, '            <hr className="my-1.5 border-gray-100" />');
  changes++;
  console.log('+ Divider before Undo/Redo');
}

// Recalculate - find Clear Canvas button again
let clearBtnIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Clear canvas? This cannot be undone')) { clearBtnIdx = i - 2; break; }
}
if (clearBtnIdx > 0) {
  lines.splice(clearBtnIdx, 0, '            <hr className="my-1.5 border-gray-100" />');
  changes++;
  console.log('+ Divider before Clear Canvas');
}

// Recalculate - find Measure
let measureIdx2 = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ToolButton') && lines[i].includes('Measure')) { measureIdx2 = i; break; }
}

// Find Draw ToolButton again (before the drawMode conditional)
let drawIdx2 = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ToolButton') && lines[i].includes('Draw')) { drawIdx2 = i; break; }
}
if (drawIdx2 > 0) {
  lines.splice(drawIdx2, 0, '            <hr className="my-1.5 border-gray-100" />');
  changes++;
  console.log('+ Divider before Draw');
}

// Find Clone again
let cloneIdx2 = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ToolButton') && lines[i].includes('Clone')) { cloneIdx2 = i; break; }
}
if (cloneIdx2 > 0) {
  lines.splice(cloneIdx2, 0, '            <hr className="my-1.5 border-gray-100" />');
  changes++;
  console.log('+ Divider before Clone');
}

// Now wrap Clone+Delete in a 2-col grid
// Find Clone and Delete again
let cIdx = -1, dIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ToolButton') && lines[i].includes('Clone') && cIdx < 0) cIdx = i;
  if (lines[i].includes('ToolButton') && lines[i].includes('Delete') && dIdx < 0) dIdx = i;
}
if (cIdx >= 0 && dIdx >= 0) {
  // Wrap in grid: insert opening div before Clone, closing div after Delete
  lines.splice(dIdx + 1, 0, '            </div>');
  lines.splice(cIdx, 0, '            <div className="grid grid-cols-2 gap-1">');
  changes += 2;
  console.log('Wrapped Clone+Delete in 2-col grid');
}

// Wrap Draw+Measure in a 2-col grid
// Find them again
let drIdx = -1, msIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ToolButton') && lines[i].includes('Draw') && drIdx < 0) drIdx = i;
  if (lines[i].includes('ToolButton') && lines[i].includes('Measure') && msIdx < 0) msIdx = i;
}
if (drIdx >= 0 && msIdx >= 0) {
  // The drawMode conditional block is between Draw and Measure
  // We need to put Draw and Measure in a grid, with the conditional after
  // Insert grid open before Draw, close after Measure  
  // But drawMode block is between them - let's put just labels in grid
  // Actually, let's wrap Draw+Measure ToolButtons only
  // Find the end of Measure ToolButton line
  lines.splice(msIdx + 1, 0, '            </div>');
  lines.splice(drIdx, 0, '            <div className="grid grid-cols-2 gap-1">');
  changes += 2;
  console.log('Wrapped Draw+Measure in 2-col grid');
}

// Wrap Undo+Redo buttons - make them 2-col too (they already are in flex gap)
// Already a flex gap div - just ensure it's grid-cols-2
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('onClick={undo}')) {
    for (let k = i; k >= i - 3; k--) {
      if (lines[k].includes('flex gap-0.5') || lines[k].includes('flex gap')) {
        lines[k] = lines[k].replace(/flex gap-[0-9.]+/, 'grid grid-cols-2 gap-1');
        changes++;
        console.log('Undo/Redo: flex -> grid-cols-2');
        break;
      }
    }
    break;
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('\\nDone! ' + changes + ' changes applied to Tools section.');
