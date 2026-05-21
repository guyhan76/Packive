const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// Find Properties section boundaries
let propsStart = -1, propsEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection("props")')) propsStart = i;
  if (propsStart > 0 && !propsEnd && lines[i].includes('toggleSection("tools")')) { propsEnd = i; break; }
}
console.log('Properties: lines ' + (propsStart+1) + ' to ' + (propsEnd+1));

// Find each label span and its parent div
const labels = ['Opacity', 'Size', 'Line Height', 'Letter Spacing', 
                'Stroke Color', 'Stroke Width',
                'Image Filters',
                'Rotation',
                'Shadow',
                'Font', 'Align', 'Style',
                'Position'];

// Group definitions - items within same group get small gap, between groups get divider
const groups = [
  ['Opacity', 'Size', 'Line Height', 'Letter Spacing'],
  ['Stroke Color', 'Stroke Width'],
  ['Image Filters'],
  ['Rotation'],
  ['Shadow'],
  ['Font', 'Align', 'Style'],
  ['Position']
];

// Find line numbers for each label's parent div
let labelLines = {};
for (let i = propsStart; i < propsEnd; i++) {
  for (const lbl of labels) {
    if (lines[i].includes('>' + lbl + '</span>') && lines[i].includes('text-gray-400')) {
      // Find parent div (search up max 2 lines)
      for (let k = i; k >= Math.max(propsStart, i - 2); k--) {
        if (lines[k].includes('flex flex-col items-center')) {
          labelLines[lbl] = k;
          break;
        }
      }
      break;
    }
  }
}
console.log('Label positions:', JSON.stringify(labelLines));

// First remove ALL existing <hr> in properties section
for (let i = propsEnd - 1; i >= propsStart; i--) {
  if (lines[i].trim().startsWith('<hr') && lines[i].includes('border-gray')) {
    lines.splice(i, 1);
    changes++;
    console.log('Removed old hr at line ' + (i+1));
  }
}

// Recalculate after removals
propsStart = -1; propsEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection("props")')) propsStart = i;
  if (propsStart > 0 && !propsEnd && lines[i].includes('toggleSection("tools")')) { propsEnd = i; break; }
}

// Recalculate label positions
labelLines = {};
for (let i = propsStart; i < propsEnd; i++) {
  for (const lbl of labels) {
    if (lines[i].includes('>' + lbl + '</span>') && lines[i].includes('text-gray-400') && !labelLines[lbl]) {
      for (let k = i; k >= Math.max(propsStart, i - 2); k--) {
        if (lines[k].includes('flex flex-col items-center')) {
          labelLines[lbl] = k;
          break;
        }
      }
    }
  }
}
console.log('Label positions after cleanup:', JSON.stringify(labelLines));

// Normalize all flex-col divs: remove old mb-3, set consistent gap
for (let i = propsStart; i < propsEnd; i++) {
  if (lines[i].includes('flex flex-col items-center') && 
      !lines[i].includes('bg-blue-50') && !lines[i].includes('bg-red-50')) {
    lines[i] = lines[i]
      .replace(/gap-[0-9.]+ mb-[0-9]+/g, 'gap-1')
      .replace(/gap-[0-9.]+/g, 'gap-1');
    changes++;
  }
}

// Insert dividers between groups (bottom to top)
// First group item of each group (except first) gets a divider before its parent div
const groupFirstLabels = groups.slice(1).map(g => g[0]); // Skip first group
const insertPositions = [];

for (const lbl of groupFirstLabels) {
  // Re-find position
  for (let i = propsStart; i < propsEnd; i++) {
    if (lines[i].includes('>' + lbl + '</span>') && lines[i].includes('text-gray-400')) {
      for (let k = i; k >= Math.max(propsStart, i - 2); k--) {
        if (lines[k].includes('flex flex-col items-center')) {
          insertPositions.push({ idx: k, label: lbl });
          break;
        }
      }
      break;
    }
  }
}

// Sort descending
insertPositions.sort((a, b) => b.idx - a.idx);

for (const pos of insertPositions) {
  lines.splice(pos.idx, 0, '          <hr className="my-2 border-gray-200 w-full" />');
  changes++;
  console.log('+ Divider before ' + pos.label + ' at line ' + (pos.idx + 1));
}

// Add mb-1 spacing between items within same group
// Re-find all flex-col divs and add pb-1
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection("props")')) propsStart = i;
  if (propsStart > 0 && lines[i].includes('toggleSection("tools")')) { propsEnd = i; break; }
}
for (let i = propsStart; i < propsEnd; i++) {
  if (lines[i].includes('flex flex-col items-center gap-1') && 
      !lines[i].includes('pb-') &&
      !lines[i].includes('bg-blue-50') && !lines[i].includes('bg-red-50')) {
    lines[i] = lines[i].replace('gap-1"', 'gap-1 pb-1"').replace("gap-1'", "gap-1 pb-1'");
    changes++;
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('\\nDone! ' + changes + ' changes applied.');
