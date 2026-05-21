const fs = require('fs');
var file = 'src/components/editor/panel-editor.tsx';
var lines = fs.readFileSync(file, 'utf8').split('\n');
var changes = 0;

// Find the problem area: </div>\n</div>\n</div>\n{/* IMAGE */}
for (var i = 0; i < lines.length; i++) {
  if (lines[i].includes('IMAGE') && lines[i].includes('{/*')) {
    // Check lines before
    console.log('IMAGE comment at line ' + (i+1));
    for (var j = i - 5; j <= i + 2; j++) {
      console.log('  ' + (j+1) + ': [' + lines[j].trim() + ']');
    }
    
    // Count consecutive </div> before IMAGE comment
    var divCount = 0;
    var firstDiv = i - 1;
    while (firstDiv >= 0 && lines[firstDiv].trim() === '</div>') {
      divCount++;
      firstDiv--;
    }
    firstDiv++; // back to first </div>
    
    console.log('Found ' + divCount + ' closing </div> before IMAGE (lines ' + (firstDiv+1) + '-' + (i) + ')');
    
    // Shape section structure:
    // </div> = last grid close
    // </div> = display toggle wrapper close
    // Then the ADD section wrapper should close
    // Original had </div></div></div> for the ADD wrapper
    // But now Shape is inside the ADD section, and we added our own </div></div>
    // We need exactly: </div> (grid) + </div> (display wrapper) + </div> (p-2 border-b wrapper)
    // That's 3 </div> then IMAGE comment
    
    if (divCount > 3) {
      // Remove extra </div>
      var toRemove = divCount - 3;
      lines.splice(firstDiv, toRemove);
      changes++;
      console.log('Removed ' + toRemove + ' extra </div>');
    }
    
    // Fix IMAGE comment indentation
    for (var k = 0; k < lines.length; k++) {
      if (lines[k].includes('IMAGE') && lines[k].includes('{/*') && !lines[k].startsWith('          ')) {
        lines[k] = '          ' + lines[k].trim();
        changes++;
        console.log('Fixed IMAGE comment indentation');
        break;
      }
    }
    
    break;
  }
}

if (changes > 0) {
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  console.log('Done! ' + changes + ' fixes.');
} else {
  console.log('No changes needed.');
}
