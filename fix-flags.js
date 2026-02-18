const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');
let changes = 0;

// Fix: Add _isSafeZone, _isGuideText, _isSizeLabel flags to initial creation
// safeRect
const oldSafe = "canvas.add(safeRect);";
if (code.includes(oldSafe)) {
  code = code.replace(oldSafe, "(safeRect as any)._isSafeZone = true;\n      canvas.add(safeRect);\n      canvas.sendObjectToBack(safeRect);");
  changes++; console.log('Fix1: Added _isSafeZone flag to safeRect');
}

// guide text
const oldGuide = "canvas.add(guide);";
if (code.includes(oldGuide)) {
  code = code.replace(oldGuide, "(guide as any)._isGuideText = true;\n      canvas.add(guide);\n      canvas.sendObjectToBack(guide);");
  changes++; console.log('Fix2: Added _isGuideText flag to guide');
}

// sizeLabel
const oldSize = "canvas.add(sizeLabel);";
if (code.includes(oldSize)) {
  code = code.replace(oldSize, "(sizeLabel as any)._isSizeLabel = true;\n      canvas.add(sizeLabel);\n      canvas.sendObjectToBack(sizeLabel);");
  changes++; console.log('Fix3: Added _isSizeLabel flag to sizeLabel');
}

// Fix: In savedJSON block, don't remove ALL non-selectable objects
// The current code removes everything with selectable===false, which kills user-locked objects too
// Replace broad removal with flag-based removal only
const oldBroadRemove = "loadedObjs.forEach((o: any) => {\n            if (o.selectable === false || o.evented === false) canvas.remove(o);";
if (code.includes(oldBroadRemove)) {
  code = code.replace(oldBroadRemove, 
    "loadedObjs.forEach((o: any) => {\n            if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel) canvas.remove(o);");
  changes++; console.log('Fix4: Changed broad selectable removal to flag-based removal');
} else {
  // Try alternate whitespace
  const altRemove = /loadedObjs\.forEach\(\(o: any\) => \{\s*\n\s*if \(o\.selectable === false \|\| o\.evented === false\) canvas\.remove\(o\)/;
  if (altRemove.test(code)) {
    code = code.replace(altRemove, 
      "loadedObjs.forEach((o: any) => {\n            if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel) canvas.remove(o)");
    changes++; console.log('Fix4alt: Changed broad removal to flag-based');
  } else {
    console.log('Fix4: broad removal pattern not found');
  }
}

// Fix: Also ensure auto-save restore block doesn't have the same issue
// After auto-save loadFromJSON, remove only flagged objects (already done in previous fix)
// But verify the initial safe objects aren't duplicated

// Fix 5: In the savedJSON block, before re-creating safe zone,
// also remove the initial (now-flagged) safe objects
// This is already handled by the filter line, but let's make sure
// the loadFromJSON doesn't wipe out the flags

fs.writeFileSync(file, code, 'utf8');
console.log('\nTotal changes: ' + changes);

// Verify flags are set
const final = fs.readFileSync(file, 'utf8');
const safeFlags = (final.match(/_isSafeZone\s*=\s*true/g) || []).length;
const guideFlags = (final.match(/_isGuideText\s*=\s*true/g) || []).length;
const sizeFlags = (final.match(/_isSizeLabel\s*=\s*true/g) || []).length;
console.log('Verify - _isSafeZone=true count: ' + safeFlags);
console.log('Verify - _isGuideText=true count: ' + guideFlags);
console.log('Verify - _isSizeLabel=true count: ' + sizeFlags);
