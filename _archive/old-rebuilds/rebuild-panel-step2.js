const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Find aside boundaries
let asideStart = -1, asideEnd = -1, depth = 0;
for (let i = 0; i < lines.length; i++) {
  if (asideStart === -1 && lines[i].includes('<aside') && lines[i].includes('w-[200px]')) asideStart = i;
  if (asideStart !== -1 && asideEnd === -1) {
    depth += (lines[i].match(/<aside/g) || []).length;
    depth -= (lines[i].match(/<\/aside>/g) || []).length;
    if (depth <= 0) { asideEnd = i; break; }
  }
}
console.log('Replacing aside lines ' + (asideStart+1) + '-' + (asideEnd+1));

// Extract existing aside content
const oldAside = lines.slice(asideStart, asideEnd + 1);

// Helper: extract block between markers
function extractBetween(arr, startPat, endPat) {
  let s = -1, e = -1;
  for (let i = 0; i < arr.length; i++) {
    if (s === -1 && arr[i].includes(startPat)) s = i;
    if (s !== -1 && arr[i].includes(endPat) && i > s) { e = i; break; }
  }
  return s !== -1 ? { lines: arr.slice(s, e !== -1 ? e + 1 : arr.length), start: s, end: e } : null;
}

// Find key handler blocks in old aside
// We need to extract onClick handlers for each button

// Strategy: Keep the OLD aside lines but wrap them in tab containers
// Find section markers in old aside
let addSectionStart = -1, addSectionEnd = -1;
let imageSectionStart = -1, imageSectionEnd = -1;
let colorSectionStart = -1, colorSectionEnd = -1;
let propsSectionStart = -1, propsSectionEnd = -1;
let toolsSectionStart = -1;

for (let i = 0; i < oldAside.length; i++) {
  const line = oldAside[i];
  if (line.includes('Add Objects')) addSectionStart = i;
  if (line.includes('Image & Code')) imageSectionStart = i;
  if (line.includes('Color & Background') || line.includes('color" ? "" : "color"')) {
    if (colorSectionStart === -1) colorSectionStart = i;
  }
  if (line.includes('Properties') || line.includes('props" ? "" : "props"')) {
    if (propsSectionStart === -1) propsSectionStart = i;
  }
  if (line.includes('TOOLS') || line.includes('Clone') && line.includes('ToolButton')) {
    if (toolsSectionStart === -1) toolsSectionStart = i;
  }
}

// Find section boundaries more precisely
// ADD section: from addSectionStart to imageSectionStart - some lines
// IMAGE section: from imageSectionStart to colorSectionStart - some lines
// etc.

// Let me find the div boundaries
let sectionDivs = [];
let divStack = 0;
for (let i = 0; i < oldAside.length; i++) {
  if (oldAside[i].includes('border-b border-gray-100') && oldAside[i].includes('<div')) {
    sectionDivs.push(i);
  }
}
console.log('Section div starts:', sectionDivs.map(s => s + asideStart + 1));

// Find all ToolButton and button onClick handlers
let buttons = [];
for (let i = 0; i < oldAside.length; i++) {
  if (oldAside[i].includes('ToolButton') || (oldAside[i].includes('<button') && oldAside[i].includes('onClick'))) {
    let label = '';
    const labelMatch = oldAside[i].match(/label="([^"]+)"/);
    const titleMatch = oldAside[i].match(/title="([^"]+)"/);
    if (labelMatch) label = labelMatch[1];
    else if (titleMatch) label = titleMatch[1];
    else {
      // check next few lines for text content
      for (let j = i; j < Math.min(i + 3, oldAside.length); j++) {
        const tm = oldAside[j].match(/>([^<]+)</);
        if (tm) { label = tm[1].trim(); break; }
      }
    }
    buttons.push({ line: i + asideStart + 1, label: label || '(unknown)' });
  }
}
console.log('Found ' + buttons.length + ' buttons:');
buttons.forEach(b => console.log('  Line ' + b.line + ': ' + b.label));

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Analysis complete. Ready for step 3.');
