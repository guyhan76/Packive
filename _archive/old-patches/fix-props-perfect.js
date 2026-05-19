const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');
let changes = 0;

// 1. Remove ALL <hr> that are inside flex-col divs (between div open and span label)
// Pattern: gap-1 py-0.5">\n            <hr ...>\n            <span
// Replace with: gap-1 py-0.5">\n            <span (hr removed)

const hrInsideDiv = /(<div className="flex flex-col items-center gap-1 py-0\.5">)\s*\n\s*<hr[^>]*\/?\s*>\s*\n(\s*<span)/g;
const matches1 = code.match(hrInsideDiv);
console.log('HR inside div found: ' + (matches1 ? matches1.length : 0));
code = code.replace(hrInsideDiv, '\n');
if (matches1) changes += matches1.length;

// 2. Now insert proper dividers BETWEEN closing </div> and opening <div>
// Before Stroke Color group: after Letter Spacing's </div>, before Stroke Color's <div>
// We need to find: </div>\n          <div ...>Stroke Color
// And insert a divider line between them

const groupFirstLabels = ['Stroke Color', 'Image Filters', 'Rotation', 'Shadow', 'Font', 'Position'];

for (const label of groupFirstLabels) {
  // Find pattern: </div>\n  (whitespace) <div className="flex flex-col items-center gap-1 py-0.5">\n (whitespace) <span ...>LABEL</span>
  const regex = new RegExp(
    '(</div>\\s*\\n)(\\s*<div className="flex flex-col items-center gap-1 py-0\\.5">\\s*\\n\\s*<span[^>]*>' + label + '</span>)',
    'g'
  );
  const found = code.match(regex);
  if (found) {
    code = code.replace(regex, '          <div className="w-full my-1.5" style={{borderTop:"1px solid #d1d5db"}} />\n');
    changes++;
    console.log('+ Divider before: ' + label);
  } else {
    console.log('Pattern not found for: ' + label);
  }
}

// 3. Verify
const remainingHR = (code.match(/<hr[^>]*>/g) || []).length;
console.log('Remaining <hr> tags in file: ' + remainingHR);

fs.writeFileSync(file, code, 'utf8');
console.log('\\nDone! ' + changes + ' changes.');
