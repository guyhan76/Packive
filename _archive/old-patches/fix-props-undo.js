const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// 1. Properties 구분선: border-gray-100 -> border-gray-300, my-1.5 -> my-3
// Find Properties section
let propsStart = -1;
let propsEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection("props")') || lines[i].includes("toggleSection('props')")) {
    propsStart = i;
  }
  if (propsStart > 0 && lines[i].includes('toggleSection("tools")')) {
    propsEnd = i;
    break;
  }
}
console.log('Properties section: ' + (propsStart+1) + ' to ' + (propsEnd+1));

if (propsStart > 0 && propsEnd > 0) {
  for (let i = propsStart; i < propsEnd; i++) {
    if (lines[i].includes('<hr') && lines[i].includes('my-1.5') && lines[i].includes('border-gray-100')) {
      lines[i] = lines[i].replace('my-1.5', 'my-3').replace('border-gray-100', 'border-gray-300');
      changes++;
      console.log('Props divider upgraded at line ' + (i+1));
    }
  }
}

// 2. Color section dividers too - make them more visible
let colorStart = -1;
let colorEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection("color")') || lines[i].includes("toggleSection('color')")) {
    colorStart = i;
  }
  if (colorStart > 0 && !colorEnd && (lines[i].includes('toggleSection("props")') || lines[i].includes("toggleSection('props')"))) {
    colorEnd = i;
    break;
  }
}
console.log('Color section: ' + (colorStart+1) + ' to ' + (colorEnd+1));

if (colorStart > 0 && colorEnd > 0) {
  for (let i = colorStart; i < colorEnd; i++) {
    if (lines[i].includes('<hr') && lines[i].includes('my-1.5') && lines[i].includes('border-gray-100')) {
      lines[i] = lines[i].replace('my-1.5', 'my-3').replace('border-gray-100', 'border-gray-300');
      changes++;
      console.log('Color divider upgraded at line ' + (i+1));
    }
  }
}

// 3. Tools section dividers - upgrade too
let toolsStart = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection("tools")') || lines[i].includes("toggleSection('tools')")) {
    toolsStart = i;
    break;
  }
}
if (toolsStart > 0) {
  for (let i = toolsStart; i < Math.min(toolsStart + 250, lines.length); i++) {
    if (lines[i].includes('<hr') && lines[i].includes('my-1.5') && lines[i].includes('border-gray-100')) {
      lines[i] = lines[i].replace('my-1.5', 'my-3').replace('border-gray-100', 'border-gray-300');
      changes++;
      console.log('Tools divider upgraded at line ' + (i+1));
    }
  }
}

// 4. Undo/Redo - change from arrow icons to text labels and center align
// Find the Undo/Redo buttons
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('onClick={undo}') && lines[i].includes('title="Undo"')) {
    // Replace the arrow with "Undo" text
    lines[i] = '            <button onClick={undo} title="Undo" className="flex-1 py-1.5 text-[10px] font-medium border border-gray-200 rounded hover:bg-gray-100 text-center">Undo</button>';
    changes++;
    console.log('Undo button updated at line ' + (i+1));
  }
  if (lines[i].includes('onClick={redo}') && lines[i].includes('title="Redo"')) {
    lines[i] = '            <button onClick={redo} title="Redo" className="flex-1 py-1.5 text-[10px] font-medium border border-gray-200 rounded hover:bg-gray-100 text-center">Redo</button>';
    changes++;
    console.log('Redo button updated at line ' + (i+1));
  }
}

// 5. Undo/Redo container - center and compact
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('onClick={undo}')) {
    // Find parent grid/flex div
    for (let k = i; k >= Math.max(0, i - 5); k--) {
      if (lines[k].includes('grid grid-cols-2') || lines[k].includes('flex gap')) {
        lines[k] = '            <div className="grid grid-cols-2 gap-1 w-full">';
        changes++;
        console.log('Undo/Redo container centered at line ' + (k+1));
        break;
      }
    }
    break;
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('\\nDone! ' + changes + ' changes applied.');
