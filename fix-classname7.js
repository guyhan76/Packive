const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');

// Show exact bytes around the problem
const idx = code.indexOf('lex-1 py-2 text-center');
if (idx === -1) {
  console.log('Pattern not found at all!');
  process.exit(0);
}

const before = code.substring(idx - 15, idx + 5);
console.log('Raw chars before lex-1:');
for (let i = 0; i < before.length; i++) {
  console.log('  pos ' + i + ': char=' + JSON.stringify(before[i]) + ' code=' + before.charCodeAt(i));
}

// Now do a byte-level replacement
// Find className={ followed by anything then lex-1
const searchStart = idx - 15;
const classNamePos = code.lastIndexOf('className={', idx);
const closingPos = code.indexOf('}>', idx);
if (classNamePos !== -1 && closingPos !== -1) {
  const oldChunk = code.substring(classNamePos, closingPos + 2);
  console.log('Old chunk: ' + JSON.stringify(oldChunk));
  
  const newChunk = 'className={lex-1 py-2 text-center text-[10px] font-medium transition-colors }>';
  
  code = code.substring(0, classNamePos) + newChunk + code.substring(closingPos + 2);
  fs.writeFileSync(file, code, 'utf8');
  console.log('Replaced with: ' + newChunk.substring(0, 60) + '...');
  console.log('File saved successfully.');
  
  // Verify
  const verify = fs.readFileSync(file, 'utf8');
  const verifyIdx = verify.indexOf('flex-1 py-2 text-center');
  if (verifyIdx !== -1) {
    console.log('VERIFIED: flex-1 found at position ' + verifyIdx);
    const ctx = verify.substring(verifyIdx - 15, verifyIdx + 40);
    console.log('Context: ' + JSON.stringify(ctx));
  }
} else {
  console.log('Could not find className or }> boundaries');
}
