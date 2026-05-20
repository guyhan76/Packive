const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');
let changes = 0;

// FIX 1: Auto-save restore - filter out system objects BEFORE loadFromJSON
// Find: parsed.objects = parsed.objects.filter((obj: any) => {
//          if (obj.type === 'image' && obj.src && (obj.src.startsWith('blob:')
// Add additional filter for system objects

const oldBlobFilter = "parsed.objects = parsed.objects.filter((obj: any) => {\n              if (obj.type === 'image' && obj.src && (obj.src.startsWith('blob:') || obj.src.startsWith('object:'))) {\n                console.warn('Skipping blob image in auto-save restore');\n                return false;\n              }\n              return true;\n            });";

if (code.includes(oldBlobFilter)) {
  const newBlobFilter = "parsed.objects = parsed.objects.filter((obj: any) => {\n              if (obj._isSafeZone || obj._isGuideLine || obj._isGuideText || obj._isSizeLabel) return false;\n              if (obj.type === 'image' && obj.src && (obj.src.startsWith('blob:') || obj.src.startsWith('object:'))) {\n                console.warn('Skipping blob image in auto-save restore');\n                return false;\n              }\n              return true;\n            });";
  code = code.replace(oldBlobFilter, newBlobFilter);
  changes++;
  console.log('Added system object filter to auto-save restore');
} else {
  console.log('Blob filter pattern not found, trying alternative...');
  // Try to find just the filter start
  const altFilter = "parsed.objects = parsed.objects.filter((obj: any) => {";
  if (code.includes(altFilter)) {
    code = code.replace(altFilter, 
      "parsed.objects = parsed.objects.filter((obj: any) => {\n              if (obj._isSafeZone || obj._isGuideLine || obj._isGuideText || obj._isSizeLabel) return false;");
    changes++;
    console.log('Added system filter (alt method)');
  }
}

// FIX 2: Also filter on savedJSON restore
// Find: await canvas.loadFromJSON(JSON.parse(savedJSON));
// Before it, parse and filter
const oldSavedLoad = "await canvas.loadFromJSON(JSON.parse(savedJSON));";
if (code.includes(oldSavedLoad)) {
  const newSavedLoad = "const _parsedSaved = JSON.parse(savedJSON);\n            _parsedSaved.objects = (_parsedSaved.objects || []).filter((o: any) => !o._isSafeZone && !o._isGuideLine && !o._isGuideText && !o._isSizeLabel);\n            await canvas.loadFromJSON(_parsedSaved);";
  code = code.replace(oldSavedLoad, newSavedLoad);
  changes++;
  console.log('Added filter to savedJSON restore');
}

// FIX 3: Also filter objects that have selectable:false and look like system objects
// After ANY loadFromJSON, ensure system objects are removed if they snuck in
// Add a helper that runs after every restore
const reLockPattern = "canvas.getObjects().forEach((o) => { if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel) { o.set({ selectable: false, evented: false }); } });";

// Upgrade: instead of just locking, REMOVE them (they get re-created anyway)
const removePattern = "canvas.getObjects().filter((o) => o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel).forEach((o) => canvas.remove(o));";

if (code.includes(reLockPattern)) {
  // Replace all instances of re-lock with remove
  while (code.includes(reLockPattern)) {
    code = code.replace(reLockPattern, removePattern);
    changes++;
  }
  console.log('Changed re-lock to remove for restored system objects');
}

// FIX 4: Reduce the excessive "Auto-save restored" logging
// The auto-save is restoring too many times - probably multiple panels
// Not a bug per se, but let's make sure each panel only restores once

fs.writeFileSync(file, code, 'utf8');
console.log('\nDone! ' + changes + ' changes.');
