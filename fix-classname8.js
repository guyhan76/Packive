const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let buf = fs.readFileSync(file);
let code = buf.toString('utf8');

// Remove the form feed character (0x0C) entirely
const before = (code.match(/\x0C/g) || []).length;
code = code.replace(/\x0C/g, '');
const after = (code.match(/\x0C/g) || []).length;
console.log('Removed ' + (before - after) + ' form feed chars');

// Now fix the className line: className={lex-1...}> needs backtick template
// After removing \f, it becomes: className={lex-1 py-2...}>
const bad = 'className={lex-1 py-2 text-center text-[10px] font-medium transition-colors }>';

if (code.includes(bad)) {
  // Build replacement without using backtick in this source
  var tick = String.fromCharCode(96);
  var dollar = String.fromCharCode(36);
  var replacement = 'className={' + tick + 'flex-1 py-2 text-center text-[10px] font-medium transition-colors ' + dollar + '{panelTab === tab.id ? "bg-white text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}' + tick + '}>';
  code = code.replace(bad, replacement);
  console.log('Fixed className template literal');
} else {
  console.log('Bad pattern not found after cleanup. Searching...');
  var idx = code.indexOf('lex-1 py-2 text-center');
  if (idx !== -1) {
    console.log('Found at ' + idx + ': ' + JSON.stringify(code.substring(idx-20, idx+60)));
  }
}

fs.writeFileSync(file, code, 'utf8');
console.log('File saved.');

// Verify
var v = fs.readFileSync(file, 'utf8');
var vi = v.indexOf('flex-1 py-2 text-center');
if (vi !== -1) {
  console.log('Verify context: ' + JSON.stringify(v.substring(vi-15, vi+80)));
}
