const fs = require('fs');
var file = 'src/components/editor/panel-editor.tsx';
var code = fs.readFileSync(file, 'utf8');

// Replace literal \n with actual newlines in the shape section
// Find the shape button line (it starts with \n and has toggleSection("shape"))
var lines = code.split('\n');
var changes = 0;

for (var i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection("shape")') && lines[i].includes('\\n')) {
    // This line has literal \n - split it into real lines
    var fixed = lines[i].replace(/\\n/g, '\n');
    var newLines = fixed.split('\n');
    lines.splice(i, 1, ...newLines);
    changes++;
    console.log('Fixed shape section: split 1 line into ' + newLines.length + ' lines at line ' + (i+1));
    break;
  }
}

// Also fix the closing divs line if it has \n
for (var i = 0; i < lines.length; i++) {
  if (lines[i].includes('\\n') && lines[i].includes('</div>') && lines[i].includes('IMAGE')) {
    var fixed = lines[i].replace(/\\n/g, '\n');
    var newLines = fixed.split('\n');
    lines.splice(i, 1, ...newLines);
    changes++;
    console.log('Fixed closing divs line at ' + (i+1));
    break;
  }
}

if (changes > 0) {
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  console.log('Done! ' + changes + ' fixes.');
} else {
  console.log('No literal \\n found.');
}
