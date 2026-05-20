import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');

// Line 972 (index 971) = extra "        }"
if (lines[971].trim() === '}') {
  lines.splice(971, 1);
  console.log('Done! Removed extra } at line 972.');
} else {
  console.log('Line 972: "' + lines[971] + '"');
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
