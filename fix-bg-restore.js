const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// Fix all places where selectable===false && evented===false removes bg images
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Pattern 1: filter that removes selectable:false before loadFromJSON (line ~1188)
  if (line === 'if (o.selectable === false && o.evented === false) return false;') {
    lines[i] = lines[i].replace(
      'if (o.selectable === false && o.evented === false) return false;',
      'if (o.selectable === false && o.evented === false && !o._isBgImage) return false;'
    );
    changes++;
    console.log('[fix] Added _isBgImage exception at line ' + (i+1));
  }
  
  // Pattern 2: forEach that removes selectable:false after loadFromJSON (line ~1202)
  if (line === 'if (o.selectable === false && o.evented === false) { canvas.remove(o); return; }') {
    lines[i] = lines[i].replace(
      'if (o.selectable === false && o.evented === false) { canvas.remove(o); return; }',
      'if (o.selectable === false && o.evented === false && !o._isBgImage) { canvas.remove(o); return; }'
    );
    changes++;
    console.log('[fix] Added _isBgImage exception at line ' + (i+1));
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Total changes: ' + changes);
