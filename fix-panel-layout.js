const fs = require('fs');
let lines = fs.readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');

// Find aside start
const asideIdx = lines.findIndex(l => l.includes('w-[140px] bg-white border-r flex flex-col items-center'));
if (asideIdx === -1) { console.log('ERROR: aside not found'); process.exit(1); }

// 1. Change aside width and style
lines[asideIdx] = lines[asideIdx].replace(
  'w-[140px] bg-white border-r flex flex-col items-center py-3 gap-2 overflow-y-auto shrink-0',
  'w-[160px] bg-white border-r flex flex-col shrink-0 overflow-y-auto'
);
console.log('1. Updated aside width to 160px');

// Helper: insert lines after a specific line index
function insertAfter(idx, newLines) {
  lines.splice(idx + 1, 0, ...newLines);
  return newLines.length;
}

// Helper: insert lines before a specific line index  
function insertBefore(idx, newLines) {
  lines.splice(idx, 0, ...newLines);
  return newLines.length;
}

// Find key markers and wrap with section headers
let offset = 0;

// Section 1: ADD - before ToolButton Text
let textBtnIdx = lines.findIndex((l, i) => i > asideIdx && l.includes('label=\"Text\" icon=\"T\"'));
if (textBtnIdx >= 0) {
  const n = insertBefore(textBtnIdx, [
    '          {/* ── ADD ── */}',
    '          <div className=\"p-2 border-b border-gray-100\">',
    '            <p className=\"text-[9px] font-bold text-gray-500 mb-1.5 tracking-wider\">\\u2795 ADD</p>',
    '            <div className=\"grid grid-cols-3 gap-1\">',
  ]);
  offset += n;
  console.log('2. Added ADD section header');
}

// Close ADD grid after Path Text button (find }} /> after Path Text)
let pathTextIdx = lines.findIndex((l, i) => i > asideIdx && l.includes('label=\"Path Text\"') || l.includes('label=\"Path\"'));
if (pathTextIdx === -1) pathTextIdx = lines.findIndex((l, i) => i > asideIdx && l.includes('Path Text'));
if (pathTextIdx >= 0) {
  // Find the closing }} /> for Path Text
  for (let i = pathTextIdx; i < Math.min(pathTextIdx + 30, lines.length); i++) {
    if (lines[i].trim() === '}} />') {
      insertAfter(i, ['            </div>']);
      offset++;
      break;
    }
  }
}

// Section: SHAPE - before Shape dropdown  
let shapeSpanIdx = lines.findIndex((l, i) => i > asideIdx && l.includes('text-gray-400\">Shape</span>'));
if (shapeSpanIdx >= 0) {
  // Find the parent div
  let parentDiv = shapeSpanIdx - 1;
  while (parentDiv > asideIdx && !lines[parentDiv].includes('<div')) parentDiv--;
  insertBefore(parentDiv, [
    '            <p className=\"text-[9px] font-bold text-gray-500 mt-2 mb-1 tracking-wider\">\\uD83D\\uDD37 SHAPE</p>',
  ]);
  offset++;
  console.log('3. Added SHAPE section header');
}

// Find end of shape select block and close ADD div, start IMAGE section
let imageToolIdx = lines.findIndex((l, i) => i > asideIdx && l.includes('label=\"Image\" icon'));
if (imageToolIdx >= 0) {
  insertBefore(imageToolIdx, [
    '          </div>',
    '          {/* ── IMAGE ── */}',
    '          <div className=\"p-2 border-b border-gray-100\">',
    '            <p className=\"text-[9px] font-bold text-gray-500 mb-1.5 tracking-wider\">\\uD83D\\uDDBC IMAGE</p>',
    '            <div className=\"grid grid-cols-2 gap-1\">',
  ]);
  offset += 5;
  console.log('4. Added IMAGE section header');
}

// Close IMAGE grid after Barcode button
let barcodeEndIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('label=\"Barcode\"')) {
    for (let j = i; j < Math.min(i + 50, lines.length); j++) {
      if (lines[j].trim() === '}} />') {
        barcodeEndIdx = j;
        break;
      }
    }
    break;
  }
}
if (barcodeEndIdx >= 0) {
  insertAfter(barcodeEndIdx, [
    '            </div>',
    '          </div>',
  ]);
  offset += 2;
  console.log('5. Closed IMAGE section after Barcode');
}

// Section: COLOR - before Color span
let colorSpanIdx = lines.findIndex((l, i) => i > asideIdx && l.includes('text-gray-400\">Color</span>'));
if (colorSpanIdx >= 0) {
  let parentDiv2 = colorSpanIdx - 1;
  while (parentDiv2 > asideIdx && !lines[parentDiv2].includes('<div')) parentDiv2--;
  insertBefore(parentDiv2, [
    '          {/* ── COLOR & BG ── */}',
    '          <div className=\"p-2 border-b border-gray-100\">',
    '            <p className=\"text-[9px] font-bold text-gray-500 mb-1.5 tracking-wider\">\\uD83C\\uDFA8 COLOR & BG</p>',
  ]);
  offset += 3;
  console.log('6. Added COLOR section header');
}

// Close COLOR section after Select BG button
let selectBGIdx = lines.findIndex((l, i) => i > asideIdx && l.includes('Select BG'));
if (selectBGIdx >= 0) {
  // Find the closing tag
  for (let i = selectBGIdx; i < Math.min(selectBGIdx + 5, lines.length); i++) {
    if (lines[i].includes('</button>')) {
      insertAfter(i, [
        '          </div>',
      ]);
      offset++;
      break;
    }
  }
  console.log('7. Closed COLOR section after Select BG');
}

// Section: PROPERTIES - before Opacity
let opacityIdx = lines.findIndex((l, i) => i > asideIdx && l.includes('text-gray-400\">Opacity</span>') && !l.includes('BG Opacity'));
if (opacityIdx >= 0) {
  // Find hr before it
  let hrIdx = opacityIdx - 1;
  while (hrIdx > asideIdx && !lines[hrIdx].includes('<hr')) hrIdx--;
  insertBefore(hrIdx >= asideIdx ? hrIdx : opacityIdx, [
    '          {/* ── PROPERTIES ── */}',
    '          <div className=\"p-2 border-b border-gray-100\">',
    '            <p className=\"text-[9px] font-bold text-gray-500 mb-1.5 tracking-wider\">\\u2699 PROPERTIES</p>',
  ]);
  offset += 3;
  console.log('8. Added PROPERTIES section header');
}

// Close PROPERTIES after Position grid
let positionIdx = lines.findIndex((l, i) => i > asideIdx && l.includes('text-gray-400\">Position</span>'));
if (positionIdx >= 0) {
  // Find end of position grid - look for closing </div> after grid-cols-3
  for (let i = positionIdx; i < Math.min(positionIdx + 20, lines.length); i++) {
    if (lines[i].includes('</div>') && i > positionIdx + 5) {
      insertAfter(i, [
        '          </div>',
      ]);
      offset++;
      console.log('9. Closed PROPERTIES after Position');
      break;
    }
  }
}

// Section: TOOLS - before Group
let groupIdx = lines.findIndex((l, i) => i > asideIdx && l.includes('text-gray-400\">Group</span>'));
if (groupIdx >= 0) {
  let hrIdx2 = groupIdx - 1;
  while (hrIdx2 > asideIdx && !lines[hrIdx2].includes('<hr') && !lines[hrIdx2].includes('<div')) hrIdx2--;
  insertBefore(hrIdx2 >= asideIdx ? hrIdx2 : groupIdx, [
    '          {/* ── TOOLS ── */}',
    '          <div className=\"p-2 border-b border-gray-100\">',
    '            <p className=\"text-[9px] font-bold text-gray-500 mb-1.5 tracking-wider\">\\uD83D\\uDEE0 TOOLS</p>',
  ]);
  offset += 3;
  console.log('10. Added TOOLS section header');
}

// Close TOOLS before </aside>
let asideEndIdx2 = lines.findIndex((l, i) => i > asideIdx + 100 && l.trim() === '</aside>');
if (asideEndIdx2 >= 0) {
  insertBefore(asideEndIdx2, [
    '          </div>',
  ]);
  offset++;
  console.log('11. Closed TOOLS section');
}

// Remove old <hr> dividers (they're now replaced by section headers)
let removed = 0;
for (let i = lines.length - 1; i >= asideIdx; i--) {
  if (lines[i].trim() === '<hr className=\"w-10 border-gray-200\" />' || 
      lines[i].trim() === '<hr className=\"w-28 border-gray-200\" />') {
    // Check it's within aside
    if (i < asideEndIdx2 + offset + 10) {
      lines.splice(i, 1);
      removed++;
    }
  }
}
console.log('12. Removed ' + removed + ' old <hr> dividers');

fs.writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('\\nDone! Panel reorganized.');
