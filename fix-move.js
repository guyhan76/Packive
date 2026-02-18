const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// Step 1: Find and extract the addSafeZone function block (line 1002~) and didRestore (line 1016)
let funcStart = -1, funcEnd = -1, didRestoreLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const addSafeZone = () => {') && funcStart === -1) {
    funcStart = i;
  }
  if (funcStart > 0 && funcEnd === -1 && i > funcStart) {
    // Find closing of the function - match indentation
    if (lines[i].trim() === '};') {
      funcEnd = i;
    }
  }
  if (lines[i].includes('let didRestore = false;')) {
    didRestoreLine = i;
  }
}

console.log('addSafeZone defined at line: ' + (funcStart + 1));
console.log('addSafeZone ends at line: ' + (funcEnd + 1));
console.log('didRestore at line: ' + (didRestoreLine + 1));

if (funcStart < 0 || funcEnd < 0 || didRestoreLine < 0) {
  console.log('Could not find all targets!');
  process.exit(1);
}

// Extract the function block and didRestore line
const funcBlock = lines.slice(funcStart, funcEnd + 1);
const didRestoreCode = lines[didRestoreLine];

console.log('Function block lines: ' + funcBlock.length);

// Step 2: Remove the old positions (remove didRestore first since it's after funcEnd usually)
// Remove in reverse order to keep line numbers stable
if (didRestoreLine > funcEnd) {
  lines.splice(didRestoreLine, 1);
  lines.splice(funcStart, funcEnd - funcStart + 1);
} else {
  lines.splice(funcStart, funcEnd - funcStart + 1);
  lines.splice(didRestoreLine, 1);
}
changes++;
console.log('Removed old addSafeZone and didRestore');

// Also remove any blank lines left behind (optional cleanup)

// Step 3: Find the first call to addSafeZone() to insert before it
let firstCall = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('addSafeZone()')) {
    firstCall = i;
    break;
  }
}
console.log('First addSafeZone() call at line: ' + (firstCall + 1));

// Insert the function definition and didRestore BEFORE the first call
const insertBlock = [
  '',
  didRestoreCode,
  ...funcBlock,
  ''
];

lines.splice(firstCall, 0, ...insertBlock);
changes++;
console.log('Inserted addSafeZone and didRestore before line ' + (firstCall + 1));

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('\nTotal changes: ' + changes);

// Verify order
const final = fs.readFileSync(file, 'utf8').split('\n');
let defLine = -1, firstCallLine = -1;
for (let i = 0; i < final.length; i++) {
  if (final[i].includes('const addSafeZone = () => {') && defLine === -1) defLine = i + 1;
  if (final[i].includes('addSafeZone()') && firstCallLine === -1) firstCallLine = i + 1;
}
console.log('Verify - addSafeZone defined at line: ' + defLine);
console.log('Verify - first call at line: ' + firstCallLine);
console.log('Order correct: ' + (defLine < firstCallLine));
