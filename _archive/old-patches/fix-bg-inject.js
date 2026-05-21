const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// Strategy: After EVERY toJSON call, manually inject _isBgImage from canvas objects
// Find all toJSON calls and add injection logic after them

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Match lines like: const json = cv.toJSON([...]) or const _ej = c.toJSON([...])
  const match = line.match(/const\s+(\w+)\s*=\s*(\w+)\.toJSON\(/);
  if (match) {
    const varName = match[1];
    const canvasVar = match[2];
    // Check if next line already has _isBgImage injection
    if (lines[i+1] && lines[i+1].includes('_isBgImage inject')) continue;
    if (lines[i+1] && lines[i+1].includes('bgImg inject')) continue;
    
    const indent = line.match(/^(\s*)/)[1];
    // Insert injection: match canvas objects with JSON objects and copy _isBgImage
    lines.splice(i + 1, 0,
      `${indent}// bgImg inject: manually add _isBgImage to serialized objects`,
      `${indent}(() => { const _co = ${canvasVar}.getObjects(); (${varName}.objects||[]).forEach((jo: any, idx: number) => { if (_co[idx] && ((_co[idx] as any)._isBgImage)) jo._isBgImage = true; }); })();`
    );
    changes++;
    console.log('[inject] Added _isBgImage injection after toJSON at line ' + (i+1));
    i += 2; // skip inserted lines
  }
}

// FIX panelsRef error: page.tsx line 484
const file2 = 'src/app/editor/design/page.tsx';
const lines2 = fs.readFileSync(file2, 'utf8').split('\n');

// Check the error line - panelsRef at line 482
for (let i = 0; i < lines2.length; i++) {
  if (lines2[i].includes('panelsRef.current') && lines2[i].includes('Object.assign')) {
    // panelsRef should be available since we found it at line 238
    // The error might be because handleSave closure doesn't capture it
    // Check if it's inside useCallback with empty deps
    console.log('[panelsRef] Found at line ' + (i+1) + ': ' + lines2[i].trim().substring(0, 80));
  }
}

// The issue is handleSave has [], so panelsRef might not be in scope
// Let's check import
const hasUseRef = lines2.some(l => l.includes('useRef'));
if (!hasUseRef) {
  // Add useRef to imports
  for (let i = 0; i < lines2.length; i++) {
    if (lines2[i].includes('import React') && lines2[i].includes('useState')) {
      if (!lines2[i].includes('useRef')) {
        lines2[i] = lines2[i].replace('useState', 'useState, useRef');
        changes++;
        console.log('[import] Added useRef to imports');
      }
      break;
    }
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
fs.writeFileSync(file2, lines2.join('\n'), 'utf8');
console.log('Total changes: ' + changes);
