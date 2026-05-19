const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');
let changes = 0;

// Replace the broken check with a proper one
const oldCheck = "if (!canvas.getContext()) throw new Error('canvas not ready');";
if (code.includes(oldCheck)) {
  code = code.replace(oldCheck, "if (!canvas.contextContainer || !canvas.lowerCanvasEl) throw new Error('canvas not ready');");
  changes++;
  console.log('Fixed canvas ready check');
}

// Also increase delay from 800 to 1500ms to give canvas more time
if (code.includes('}, 800);')) {
  // Find the one near pushHistory
  const histPos = code.indexOf('pushHistory');
  if (histPos > 0) {
    const delay800 = code.indexOf('}, 800);', histPos);
    if (delay800 > 0 && delay800 - histPos < 2000) {
      code = code.slice(0, delay800) + '}, 1500);' + code.slice(delay800 + '}, 800);'.length);
      changes++;
      console.log('Increased delay 800 -> 1500ms');
    }
  }
}

fs.writeFileSync(file, code, 'utf8');
console.log('\nDone! ' + changes + ' changes.');
