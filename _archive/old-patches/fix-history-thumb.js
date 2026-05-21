const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');
let changes = 0;

// Fix: add safety check before canvas.toDataURL in history thumb
const oldThumb = "const thumbData = canvas.toDataURL({ format: 'png', multiplier: 0.15, quality: 0.5 });";
const newThumb = "if (!canvas.getContext()) throw new Error('canvas not ready');\n            const thumbData = canvas.toDataURL({ format: 'png', multiplier: 0.15, quality: 0.5 });";

if (code.includes(oldThumb) && !code.includes('canvas not ready')) {
  code = code.replace(oldThumb, newThumb);
  changes++;
  console.log('Added canvas ready check before toDataURL');
}

// Also fix: the initial history push might happen before canvas is fully rendered
// Find the setTimeout that contains this thumb code and increase delay
const oldDelay = "}, 400);";
// We need to find the specific 400ms delay near the thumb code
// Find the thumb code position first
const thumbPos = code.indexOf('canvas not ready');
if (thumbPos > 0) {
  // Find the next "}, 400);" after thumb code
  const delayPos = code.indexOf("}, 400);", thumbPos);
  if (delayPos > 0 && delayPos - thumbPos < 500) {
    code = code.slice(0, delayPos) + "}, 800);" + code.slice(delayPos + "}, 400);".length);
    changes++;
    console.log('Increased initial history delay 400 -> 800ms');
  }
}

fs.writeFileSync(file, code, 'utf8');
console.log('\nDone! ' + changes + ' changes.');
