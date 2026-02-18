import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');

// Line 1037 (index 1036) = extra "        }"
if (lines[1036].trim() === '}') {
  lines.splice(1036, 1);
  console.log('Done! Removed extra } at line 1037.');
} else {
  console.log('Not found. Line 1037: "' + lines[1036] + '"');
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
