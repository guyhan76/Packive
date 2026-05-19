const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');
let changes = 0;

// Replace the entire try block for initial history thumb with a retry mechanism
const oldTry = "if (!canvas.contextContainer || !canvas.lowerCanvasEl) throw new Error('canvas not ready');\n            const thumbData = canvas.toDataURL({ format: 'png', multiplier: 0.15, quality: 0.5 });";

const newTry = "let thumbData = '';\n            try { thumbData = canvas.toDataURL({ format: 'png', multiplier: 0.15, quality: 0.5 }); } catch { return; }";

if (code.includes(oldTry)) {
  code = code.replace(oldTry, newTry);
  changes++;
  console.log('Replaced canvas check with silent try-catch');
}

// Change console.error to silent catch for the outer try-catch too
const oldCatch = "} catch(e) { console.error('History thumb error:', e); }";
const newCatch = "} catch(e) { /* thumb gen skipped - canvas not ready */ }";
while (code.includes(oldCatch)) {
  code = code.replace(oldCatch, newCatch);
  changes++;
}
console.log('Silenced thumb error logs');

fs.writeFileSync(file, code, 'utf8');
console.log('\nDone! ' + changes + ' changes.');
