const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');
let changes = 0;

// Step 1: Remove "let didRestore = false;" from inside the try block
const oldDidRestore = "      let didRestore = false;\n      const addSafeZone";
const newDidRestore = "      const addSafeZone";
if (code.includes(oldDidRestore)) {
  code = code.replace(oldDidRestore, newDidRestore);
  changes++;
  console.log('Step1: Removed didRestore from inside try block');
}

// Step 2: Insert "let didRestore = false;" BEFORE the try block
// Find "// Auto-save: restore from localStorage"
const autoSaveComment = "// Auto-save: restore from localStorage";
if (code.includes(autoSaveComment)) {
  code = code.replace(autoSaveComment, "let didRestore = false;\n\n      " + autoSaveComment);
  changes++;
  console.log('Step2: Inserted didRestore before auto-save try block');
}

// Step 3: Also move addSafeZone definition before the try block
// Currently it is inside the try block after some filter code
// Find "const addSafeZone = () => {" and extract the whole function
const funcStart = code.indexOf("      const addSafeZone = () => {");
if (funcStart > 0) {
  // Find the matching closing "      };"
  let braceCount = 0;
  let funcEnd = -1;
  let inFunc = false;
  for (let i = funcStart; i < code.length; i++) {
    if (code[i] === '{') { braceCount++; inFunc = true; }
    if (code[i] === '}') { braceCount--; }
    if (inFunc && braceCount === 0) {
      // Check if next char is ';'
      if (code[i+1] === ';') {
        funcEnd = i + 2; // include the ';'
      } else {
        funcEnd = i + 1;
      }
      break;
    }
  }
  
  if (funcEnd > funcStart) {
    const funcCode = code.substring(funcStart, funcEnd);
    console.log('Step3: Found addSafeZone function (' + funcCode.length + ' chars)');
    
    // Remove from current position
    code = code.substring(0, funcStart) + code.substring(funcEnd);
    changes++;
    
    // Insert before "// Auto-save: restore from localStorage"
    const insertPoint = code.indexOf(autoSaveComment);
    if (insertPoint > 0) {
      code = code.substring(0, insertPoint) + funcCode + "\n\n      " + code.substring(insertPoint);
      changes++;
      console.log('Step3: Moved addSafeZone before auto-save block');
    }
  }
} else {
  console.log('Step3: addSafeZone function not found');
}

fs.writeFileSync(file, code, 'utf8');
console.log('\nTotal changes: ' + changes);

// Verify
const final = fs.readFileSync(file, 'utf8');
const lines = final.split('\n');
let defLine = -1, tryLine = -1, didLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const addSafeZone') && defLine === -1) defLine = i + 1;
  if (lines[i].includes('let didRestore') && didLine === -1) didLine = i + 1;
  if (lines[i].includes('Auto-save: restore from localStorage') && tryLine === -1) tryLine = i + 1;
}
console.log('didRestore at line: ' + didLine);
console.log('addSafeZone at line: ' + defLine);
console.log('Auto-save try at line: ' + tryLine);
console.log('Order correct: ' + (didLine < defLine && defLine < tryLine));
