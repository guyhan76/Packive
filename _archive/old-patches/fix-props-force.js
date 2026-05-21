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

// Step 1: Remove ALL <hr> inside Properties
let removed = 0;
for (let i = propsEnd - 1; i >= propsStart; i--) {
  if (lines[i].trim().startsWith('<hr')) {
    lines.splice(i, 1);
    removed++;
  }
}
console.log('Removed ' + removed + ' old <hr> tags');

// Recalculate
propsStart = -1; propsEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection("props")')) propsStart = i;
  if (propsStart > 0 && !propsEnd && lines[i].includes('toggleSection("tools")')) { propsEnd = i; break; }
}

// Step 2: Force ALL flex-col items-center divs to have identical classes
for (let i = propsStart; i < propsEnd; i++) {
  if (lines[i].includes('flex flex-col items-center') && 
      !lines[i].includes('bg-blue-50') && !lines[i].includes('bg-red-50') &&
      !lines[i].includes('w-[120px]')) {
    // Replace the className entirely
    lines[i] = lines[i].replace(
      /className="[^"]*flex flex-col items-center[^"]*"/,
      'className="flex flex-col items-center gap-1 py-1.5"'
    );
    changes++;
    console.log('Normalized div at line ' + (i+1));
  }
}

// Step 3: Insert dividers between groups
// Re-find label positions
const groupBoundaries = [
  { label: 'Stroke Color', search: '>Stroke Color</span>' },
  { label: 'Image Filters', search: '>Image Filters</span>' },
  { label: 'Rotation', search: '>Rotation</span>' },
  { label: 'Shadow', search: '>Shadow</span>' },
  { label: 'Font', search: '>Font</span>' },
  { label: 'Position', search: '>Position</span>' },
];

// Recalculate boundaries
propsStart = -1; propsEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection("props")')) propsStart = i;
  if (propsStart > 0 && !propsEnd && lines[i].includes('toggleSection("tools")')) { propsEnd = i; break; }
}

const insertPoints = [];
for (const gb of groupBoundaries) {
  for (let i = propsStart; i < propsEnd; i++) {
    if (lines[i].includes(gb.search) && lines[i].includes('text-gray-400')) {
      // Find parent flex-col div
      for (let k = i; k >= Math.max(propsStart, i - 3); k--) {
        if (lines[k].includes('flex flex-col items-center')) {
          insertPoints.push({ idx: k, label: gb.label });
          break;
        }
      }
      break;
    }
  }
}

// Sort descending and insert
insertPoints.sort((a, b) => b.idx - a.idx);
for (const p of insertPoints) {
  lines.splice(p.idx, 0, '          <div className="border-t border-gray-200 my-1" />');
  changes++;
  console.log('+ Divider before ' + p.label + ' at line ' + (p.idx+1));
}

// Step 4: Upload Font button - make bigger
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Upload Font') && lines[i].includes('button')) {
    lines[i] = lines[i]
      .replace('text-[8px]', 'text-[11px] font-semibold')
      .replace('py-0.5', 'py-1.5');
    changes++;
    console.log('Upload Font button enlarged at line ' + (i+1));
    break;
  }
}

// Also make the icon text bigger
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Upload Font') && !lines[i].includes('button') && !lines[i].includes('input')) {
    lines[i] = lines[i].replace('📁 Upload Font', '📁 Upload Font');
    break;
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('\\nDone! ' + changes + ' changes.');
