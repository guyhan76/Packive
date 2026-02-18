const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// Find the broken </div> inside Measure ToolButton
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ToolButton') && lines[i].includes('Measure') && lines[i].includes('onClick')) {
    // Check if next line is the stray </div>
    if (lines[i+1] && lines[i+1].trim() === '</div>') {
      console.log('Found stray </div> at line ' + (i+2) + ', removing it');
      lines.splice(i+1, 1);
      changes++;
      break;
    }
  }
}

// Now find where the Measure ToolButton ends (the closing /> )
// The ToolButton for Measure is a self-closing component: <ToolButton ... onClick={() => { ... }} />
// Find the line with the closing of setMeasureMode callback and the /> of ToolButton
let measureEndIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ToolButton') && lines[i].includes('Measure')) {
    // Search forward for the closing /> of this ToolButton
    for (let j = i; j < Math.min(i + 40, lines.length); j++) {
      if (lines[j].trim() === '/>' || lines[j].trim().endsWith('/>') || lines[j].includes('}} />')) {
        measureEndIdx = j;
        console.log('Measure ToolButton ends at line ' + (j+1) + ': ' + lines[j].trim().substring(0, 60));
        break;
      }
    }
    break;
  }
}

// Insert the grid closing </div> after the Measure ToolButton end
if (measureEndIdx > 0) {
  lines.splice(measureEndIdx + 1, 0, '            </div>');
  changes++;
  console.log('Inserted grid closing </div> after Measure at line ' + (measureEndIdx + 2));
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Done! ' + changes + ' fixes applied.');
