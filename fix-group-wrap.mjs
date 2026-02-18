import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');
let fixed = 0;

// Find the Group/Ungroup section - starts after hr, has G and UG buttons, then </div>
// The issue: G and UG buttons are outside a <div>, but </div> at line 1818 closes them
// Fix: The </div> at line 1818 is extra - it closes the Style section's div
// The G/UG buttons need their own wrapping <div>

// Find line with "title=\"Group\"" 
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<hr className="w-10 border-gray-200"') && 
      i + 2 < lines.length && lines[i + 2].includes('const sel = c.getActiveObject()')) {
    // This hr is before Group buttons - replace it with <div> wrapped version
    // Find the UG button closing line (has </div> after it)
    let ugEnd = -1;
    for (let j = i; j < i + 30; j++) {
      if (lines[j].includes('title="Ungroup"')) {
        ugEnd = j;
        break;
      }
    }
    
    if (ugEnd > -1) {
      // Find the </div> after UG button
      let closeDivLine = -1;
      for (let j = ugEnd; j < ugEnd + 3; j++) {
        if (lines[j].trim() === '</div>') {
          closeDivLine = j;
          break;
        }
      }
      
      // Replace the hr line with <div> + hr
      lines[i] = '          <hr className="w-28 border-gray-200" />';
      // Add <div> wrapper before Group button
      lines.splice(i + 1, 0, '          <div className="flex gap-0.5">');
      fixed++;
      console.log('1. Added wrapping <div> for Group/Ungroup at line ' + (i + 2));
      
      // Now the </div> that was already there will close this new <div>
      console.log('2. Existing </div> will close the wrapper');
    }
    break;
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Fixed ' + fixed + ' issues.');
