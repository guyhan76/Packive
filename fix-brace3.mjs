import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');

// Line 967 (index 966) = "          }"  (closing of historyIdx > 0)
// Line 968 (index 967) = "        // Ctrl+Y ..."  <-- missing "}" before this

// Insert closing brace at index 967
lines.splice(967, 0, '        }');

// Now find the extra "}" before "};" at end of keyHandler
// Search from line 1030+ for the pattern "}\n        }\n      };"
let found = false;
for (let i = 1030; i < 1050; i++) {
  if (lines[i] && lines[i].trim() === '}' && 
      lines[i+1] && lines[i+1].trim() === '}' && 
      lines[i+2] && lines[i+2].trim() === '};') {
    lines.splice(i, 1); // remove one extra "}"
    found = true;
    console.log('Removed extra } at line ' + (i+1));
    break;
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Inserted } at line 968.' + (found ? '' : ' WARNING: could not find extra }'));
