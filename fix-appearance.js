const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');
let changes = 0;

// Fix 1: In savedJSON loading, filter out safe-zone-like objects by APPEARANCE
// not just by flag (old savedJSON may not have flags)
const oldSavedFilter = "_parsedSaved.objects = (_parsedSaved.objects || []).filter((o: any) => !o._isSafeZone && !o._isGuideLine && !o._isGuideText && !o._isSizeLabel);";
const newSavedFilter = `_parsedSaved.objects = (_parsedSaved.objects || []).filter((o: any) => {
              if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel) return false;
              if (o.selectable === false && o.evented === false) return false;
              if (o.type === 'rect' && o.stroke === '#93B5F7' && o.fill === 'transparent') return false;
              if (o.type === 'text' && o.fill === '#C0C0C0' && o.selectable === false) return false;
              if (o.type === 'text' && o.fill === '#B0B0B0' && o.selectable === false) return false;
              return true;
            });`;
if (code.includes(oldSavedFilter)) {
  code = code.replace(oldSavedFilter, newSavedFilter);
  changes++; console.log('Fix1: savedJSON - appearance-based filter');
} else { console.log('Fix1: not found'); }

// Fix 2: In auto-save restore, same appearance-based filter
const oldAutoFilter = "if (obj._isSafeZone || obj._isGuideLine || obj._isGuideText || obj._isSizeLabel) return false;";
const newAutoFilter = `if (obj._isSafeZone || obj._isGuideLine || obj._isGuideText || obj._isSizeLabel) return false;
              if (obj.selectable === false && obj.evented === false) return false;
              if (obj.type === 'rect' && obj.stroke === '#93B5F7' && obj.fill === 'transparent') return false;
              if (obj.type === 'text' && obj.fill === '#C0C0C0' && obj.selectable === false) return false;
              if (obj.type === 'text' && obj.fill === '#B0B0B0' && obj.selectable === false) return false;`;
if (code.includes(oldAutoFilter)) {
  code = code.replace(oldAutoFilter, newAutoFilter);
  changes++; console.log('Fix2: auto-save - appearance-based filter');
} else { console.log('Fix2: not found'); }

// Fix 3: After loadFromJSON in savedJSON block, remove by appearance too
const oldLoadedRemove = "loadedObjs.forEach((o: any) => {\n            if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel) canvas.remove(o);";
const newLoadedRemove = `loadedObjs.forEach((o: any) => {
            if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel) { canvas.remove(o); return; }
            if (o.selectable === false && o.evented === false) { canvas.remove(o); return; }
            if (o.type === 'rect' && o.stroke === '#93B5F7' && o.fill === 'transparent') { canvas.remove(o); return; }
            if (o.type === 'text' && (o.fill === '#C0C0C0' || o.fill === '#B0B0B0') && o.fontSize <= 13) { canvas.remove(o); return; }`;
if (code.includes(oldLoadedRemove)) {
  code = code.replace(oldLoadedRemove, newLoadedRemove);
  changes++; console.log('Fix3: loadedObjs - appearance-based removal');
} else { console.log('Fix3: not found'); }

// Fix 4: After auto-save loadFromJSON, remove canvas objects by appearance
const oldAutoCanvasRemove = "canvas.getObjects().filter((o) => o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel).forEach((o) => canvas.remove(o));\n              // Re-create safe zone";
const newAutoCanvasRemove = `canvas.getObjects().filter((o: any) => {
                if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel) return true;
                if (o.selectable === false && o.evented === false) return true;
                if (o.type === 'rect' && o.stroke === '#93B5F7' && o.fill === 'transparent') return true;
                if (o.type === 'text' && (o.fill === '#C0C0C0' || o.fill === '#B0B0B0') && o.fontSize <= 13) return true;
                return false;
              }).forEach((o) => canvas.remove(o));
              // Re-create safe zone`;
if (code.includes(oldAutoCanvasRemove)) {
  code = code.replace(oldAutoCanvasRemove, newAutoCanvasRemove);
  changes++; console.log('Fix4: auto-save canvas objects - appearance removal');
} else { console.log('Fix4: not found'); }

// Fix 5: Ensure initial safe zone creation happens BEFORE auto-save/savedJSON load
// and that loadFromJSON in auto-save does NOT clear the already-created safe zone
// Add a guard: skip auto-save restore if savedJSON exists
const oldAutoSaveCheck = "const stored = localStorage.getItem(storageKey);";
if (code.includes(oldAutoSaveCheck)) {
  // Count occurrences
  const count = code.split(oldAutoSaveCheck).length - 1;
  console.log('Fix5: Found localStorage.getItem count: ' + count);
  // We want to add: if savedJSON exists, skip auto-save restore
  // Find the auto-save restore block
}

fs.writeFileSync(file, code, 'utf8');
console.log('\nTotal changes: ' + changes);
