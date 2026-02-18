const fs = require('fs');
let changes = 0;

// File 1: panel-editor.tsx
const f1 = 'src/components/editor/panel-editor.tsx';
let src1 = fs.readFileSync(f1, 'utf8');
src1 = src1.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

const logsToRemove = [
  "              console.log('Auto-save restored', parsed.objects.length, 'objects');\n",
  "              console.log('Restored object types:', canvas.getObjects().map((o: any) => ({ type: o.type, fill: o.fill, stroke: o.stroke, safe: o._isSafeZone, guide: o._isGuideText, size: o._isSizeLabel })));\n",
  "              console.log('Pasted image from clipboard:', offscreen.width, 'x', offscreen.height);\n",
  "                  console.log('Pasted image:', offscreen.width, 'x', offscreen.height);\n",
];

logsToRemove.forEach((log, i) => {
  if (src1.includes(log)) {
    src1 = src1.replace(log, '');
    changes++;
    console.log('[panel-editor] Removed log ' + (i+1));
  } else {
    // Try trimmed version
    const trimmed = log.trim();
    const lines = src1.split('\n');
    for (let j = 0; j < lines.length; j++) {
      if (lines[j].trim() === trimmed) {
        lines.splice(j, 1);
        src1 = lines.join('\n');
        changes++;
        console.log('[panel-editor] Removed log ' + (i+1) + ' (trimmed match at line ' + (j+1) + ')');
        break;
      }
    }
  }
});

// Also remove [Panning] debug logs if any remain
const panningLogs = src1.split('\n').filter(l => l.includes('[Panning]'));
if (panningLogs.length > 0) {
  const lines = src1.split('\n');
  const filtered = lines.filter(l => !l.includes('[Panning]'));
  const removed = lines.length - filtered.length;
  src1 = filtered.join('\n');
  changes += removed;
  console.log('[panel-editor] Removed ' + removed + ' [Panning] debug logs');
} else {
  console.log('[panel-editor] No [Panning] logs found');
}

src1 = src1.replace(/\n/g, '\r\n');
fs.writeFileSync(f1, src1, 'utf8');

// File 2: page.tsx - only has console.warn (keep those)
console.log('[page.tsx] Only console.warn found - keeping for error handling');

console.log('Total changes: ' + changes);
