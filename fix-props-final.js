const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// Find Properties section
let propsStart = -1, propsEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection("props")')) propsStart = i;
  if (propsStart > 0 && !propsEnd && lines[i].includes('toggleSection("tools")')) { propsEnd = i; break; }
}
console.log('Properties: ' + (propsStart+1) + ' to ' + (propsEnd+1));

// Step 1: Remove ALL <hr> inside Properties section
for (let i = propsEnd - 1; i >= propsStart; i--) {
  if (lines[i].trim().startsWith('<hr')) {
    lines.splice(i, 1);
    changes++;
  }
}

// Recalculate
propsStart = -1; propsEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection("props")')) propsStart = i;
  if (propsStart > 0 && !propsEnd && lines[i].includes('toggleSection("tools")')) { propsEnd = i; break; }
}

// Step 2: Normalize ALL flex-col divs - set uniform gap and padding
for (let i = propsStart; i < propsEnd; i++) {
  if (lines[i].includes('flex flex-col items-center') && 
      !lines[i].includes('bg-blue-50') && !lines[i].includes('bg-red-50')) {
    // Strip all existing gap/mb/pb classes and set uniform
    lines[i] = lines[i]
      .replace(/gap-[0-9.]+/g, '')
      .replace(/mb-[0-9]+/g, '')
      .replace(/pb-[0-9]+/g, '')
      .replace(/items-center\s+/g, 'items-center ')
      .replace('items-center"', 'items-center gap-1 py-2"')
      .replace("items-center'", "items-center gap-1 py-2'");
    changes++;
  }
}

// Step 3: Find each label and its parent div index
const labelOrder = [];
const labelDivs = {};
for (let i = propsStart; i < propsEnd; i++) {
  const m = lines[i].match(/>([^<]+)<\/span>/);
  if (m && lines[i].includes('text-gray-400') && lines[i].includes('text-[9px]')) {
    const label = m[1].trim();
    // Find parent div
    for (let k = i; k >= Math.max(propsStart, i - 3); k--) {
      if (lines[k].includes('flex flex-col items-center')) {
        labelDivs[label] = k;
        labelOrder.push(label);
        break;
      }
    }
  }
}
console.log('Labels found:', labelOrder.join(', '));

// Step 4: Define groups and insert <hr> between groups
const groups = [
  ['Opacity', 'Size', 'Line Height', 'Letter Spacing'],
  ['Stroke Color', 'Stroke Width'],
  ['Image Filters'],
  ['Rotation'],
  ['Shadow'],
  ['Font', 'Align', 'Style'],
  ['Position']
];

// Find first label of each group (except first group)
const dividerBeforeLabels = [];
for (let g = 1; g < groups.length; g++) {
  dividerBeforeLabels.push(groups[g][0]);
}

// Re-find positions after normalization
for (let i = propsStart; i < propsEnd; i++) {
  const m = lines[i].match(/>([^<]+)<\/span>/);
  if (m && lines[i].includes('text-gray-400') && lines[i].includes('text-[9px]')) {
    const label = m[1].trim();
    for (let k = i; k >= Math.max(propsStart, i - 3); k--) {
      if (lines[k].includes('flex flex-col items-center')) {
        labelDivs[label] = k;
        break;
      }
    }
  }
}

// Insert dividers bottom to top
const positions = dividerBeforeLabels
  .filter(l => labelDivs[l] !== undefined)
  .map(l => ({ label: l, idx: labelDivs[l] }))
  .sort((a, b) => b.idx - a.idx);

for (const p of positions) {
  lines.splice(p.idx, 0, '          <hr className="border-gray-200" />');
  changes++;
  console.log('+ Divider before: ' + p.label);
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('\\nDone! ' + changes + ' changes.');
