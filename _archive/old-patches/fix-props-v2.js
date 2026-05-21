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

// Problem: <hr> is INSIDE the <div className="flex flex-col items-center">
// It should be OUTSIDE (between divs)
// Pattern:
//   <div className="flex flex-col items-center gap-0.5">
//     <hr className="my-3 border-gray-300" />
//     <span>Label</span>
// Should become:
//   <hr className="my-3 border-gray-300" />
//   <div className="flex flex-col items-center gap-1 mb-3">
//     <span>Label</span>

for (let i = propsEnd - 1; i >= propsStart; i--) {
  if (i + 1 < lines.length && 
      lines[i].trim().startsWith('<div') && 
      lines[i].includes('flex flex-col items-center') &&
      lines[i+1] && lines[i+1].trim().startsWith('<hr')) {
    
    // Extract the hr line
    const hrLine = lines[i+1];
    // Remove hr from inside div
    lines.splice(i+1, 1);
    // Insert hr BEFORE the div
    lines.splice(i, 0, hrLine);
    changes++;
    console.log('Moved <hr> outside div at line ' + (i+1));
  }
}

// Now add mb-3 to ALL flex-col items-center divs in Properties section
// Recalculate boundaries
propsStart = -1; propsEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection("props")')) propsStart = i;
  if (propsStart > 0 && !propsEnd && lines[i].includes('toggleSection("tools")')) { propsEnd = i; break; }
}

for (let i = propsStart; i < propsEnd; i++) {
  if (lines[i].includes('flex flex-col items-center') && 
      !lines[i].includes('mb-') &&
      !lines[i].includes('bg-blue-50') &&
      !lines[i].includes('bg-red-50')) {
    // Add mb-3 for spacing between groups
    lines[i] = lines[i].replace(/gap-[0-9.]+/, 'gap-1 mb-3');
    changes++;
    console.log('Added mb-3 at line ' + (i+1));
  }
}

// Set default openSections to empty (all closed)
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('new Set(') && lines[i].includes('openSections')) {
    const oldLine = lines[i];
    lines[i] = lines[i].replace(/new Set\(\[.*?\]\)/, 'new Set([])');
    if (lines[i] !== oldLine) {
      changes++;
      console.log('Default sections: all closed');
    }
    break;
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('\\nDone! ' + changes + ' changes applied.');
