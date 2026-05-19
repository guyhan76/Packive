import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');

// Line 948 (index 947) = extra "};"
if (lines[947].trim() === '};') {
  lines.splice(947, 1);
  console.log('Done! Removed extra }; at line 948.');
} else {
  console.log('Line 948: "' + lines[947] + '"');
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
