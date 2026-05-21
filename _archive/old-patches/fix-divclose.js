const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// Remove </div>} lines at 2680 and 3129 (old openSection wrappers)
// Work backwards to preserve line numbers
var toRemove = [];
for (var i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '</div>}') {
    toRemove.push(i);
    console.log('Found </div>} at line ' + (i+1) + ' context: prev=' + lines[i-1].trim().substring(0,40) + ' next=' + lines[i+1].trim().substring(0,40));
  }
}

// Remove from end to start
for (var j = toRemove.length - 1; j >= 0; j--) {
  lines.splice(toRemove[j], 1);
  changes++;
  console.log('Removed line ' + (toRemove[j]+1));
}

if (changes > 0) {
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  console.log('Done! Removed ' + changes + ' stale </div>} lines.');
} else {
  console.log('No </div>} found.');
}
