import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');

// Line 1028 (index 1027) = "      };"  <-- extra, remove this
// Line 1029 (index 1028) = "      window.addEventListener..."
// Line 1030 (index 1029) = "    };"

// Verify and remove
if (lines[1027].trim() === '};' && lines[1028].includes('addEventListener')) {
  lines.splice(1027, 1);
  console.log('Done! Removed extra }; at line 1028.');
} else {
  console.log('Line 1027: ' + lines[1027]);
  console.log('Line 1028: ' + lines[1028]);
  console.log('ERROR: unexpected content');
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
