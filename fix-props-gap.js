const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// Find the Properties content wrapper: {openSections.has("props") && <div className="px-2 pb-2">
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('openSections.has("props")') && lines[i].includes('px-2 pb-2')) {
    // Add flex flex-col gap-3 to create uniform spacing between all child divs
    lines[i] = lines[i].replace('px-2 pb-2', 'px-2 pb-2 flex flex-col gap-3');
    changes++;
    console.log('Added gap-3 to Properties wrapper at line ' + (i+1));
    break;
  }
}

// Remove all py-0.5 from individual items (the wrapper gap handles spacing now)
let propsStart = -1, propsEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection("props")')) propsStart = i;
  if (propsStart > 0 && !propsEnd && lines[i].includes('toggleSection("tools")')) { propsEnd = i; break; }
}

for (let i = propsStart; i < propsEnd; i++) {
  if (lines[i].includes('flex flex-col items-center') && lines[i].includes('py-0.5')) {
    lines[i] = lines[i].replace(' py-0.5', '');
    changes++;
  }
}

// Remove any inline divider divs (w-full my-1.5 borderTop)
for (let i = propsEnd - 1; i >= propsStart; i--) {
  if (lines[i].includes('w-full my-1.5') && lines[i].includes('borderTop')) {
    lines.splice(i, 1);
    changes++;
    console.log('Removed inline divider at line ' + (i+1));
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('\\nDone! ' + changes + ' changes. All spacing now controlled by wrapper gap-3.');
