const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');
let changes = 0;

// FIX 1: Auto-save - filter out system objects before saving
const oldSave = "cv.toJSON(['_isBgImage', '_isSafeZone', '_isCropRect', '_isGuideLine'])";
const newSave = "cv.toJSON(['_isBgImage', '_isSafeZone', '_isCropRect', '_isGuideLine', '_isGuideText', '_isSizeLabel', '_isBgPattern'])";
while (code.includes(oldSave)) {
  code = code.replace(oldSave, newSave);
  changes++;
}
console.log('toJSON updated: ' + changes);

// After each toJSON, add filter line if not already present
// Find all newSave occurrences and add filter after the semicolon
const filterLine = '\n          json.objects = (json.objects || []).filter((o) => !o._isSafeZone && !o._isGuideLine && !o._isGuideText && !o._isSizeLabel);';
const saveWithSemicolon = newSave + ';';
let idx = 0;
while ((idx = code.indexOf(saveWithSemicolon, idx)) !== -1) {
  const afterSemicolon = idx + saveWithSemicolon.length;
  // Check if filter already added
  if (!code.substring(afterSemicolon, afterSemicolon + 80).includes('filter')) {
    code = code.slice(0, afterSemicolon) + filterLine + code.slice(afterSemicolon);
    changes++;
    console.log('Added save filter at offset ' + afterSemicolon);
  }
  idx = afterSemicolon + 100;
}

// FIX 2: Auto-save restore - re-lock after loadFromJSON
const restoreLog = "console.log('Auto-save restored'";
if (code.includes(restoreLog)) {
  const lockCode = "canvas.getObjects().forEach((o) => { if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel) { o.set({ selectable: false, evented: false }); } });\n              ";
  code = code.replace(restoreLog, lockCode + restoreLog);
  changes++;
  console.log('Added re-lock after auto-save restore');
}

// FIX 3: savedJSON restore - re-lock after loadFromJSON
const savedLoad = "await canvas.loadFromJSON(JSON.parse(savedJSON));";
if (code.includes(savedLoad)) {
  const lockAfter = "\n              canvas.getObjects().forEach((o) => { if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel) { o.set({ selectable: false, evented: false }); } });";
  code = code.replace(savedLoad, savedLoad + lockAfter);
  changes++;
  console.log('Added re-lock after savedJSON restore');
}

// FIX 4: Undo/Redo await style - re-lock
const historyAwait = "await c.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current]));";
while (code.includes(historyAwait)) {
  const lockAfterH = "\n    c.getObjects().forEach((o) => { if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel) { o.set({ selectable: false, evented: false }); } });";
  // Only add if not already present after
  const pos = code.indexOf(historyAwait);
  const after = code.substring(pos + historyAwait.length, pos + historyAwait.length + 100);
  if (!after.includes('_isSafeZone')) {
    code = code.slice(0, pos + historyAwait.length) + lockAfterH + code.slice(pos + historyAwait.length);
    changes++;
    console.log('Added re-lock after history await load');
  }
  // Move past this occurrence
  break;
}

// FIX 4b: Second await occurrence
let pos2 = code.indexOf(historyAwait, code.indexOf(historyAwait) + historyAwait.length + 150);
if (pos2 !== -1) {
  const after2 = code.substring(pos2 + historyAwait.length, pos2 + historyAwait.length + 100);
  if (!after2.includes('_isSafeZone')) {
    const lockAfterH2 = "\n    c.getObjects().forEach((o) => { if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel) { o.set({ selectable: false, evented: false }); } });";
    code = code.slice(0, pos2 + historyAwait.length) + lockAfterH2 + code.slice(pos2 + historyAwait.length);
    changes++;
    console.log('Added re-lock after 2nd history await load');
  }
}

// FIX 5: .then() style history loads
const thenLoad = "canvas.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current])).then(() => {";
while (code.includes(thenLoad)) {
  const thenPos = code.indexOf(thenLoad);
  const insertAt = thenPos + thenLoad.length;
  const afterThen = code.substring(insertAt, insertAt + 120);
  if (!afterThen.includes('_isSafeZone')) {
    const lockThen = "\n              canvas.getObjects().forEach((o) => { if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel) { o.set({ selectable: false, evented: false }); } });";
    code = code.slice(0, insertAt) + lockThen + code.slice(insertAt);
    changes++;
    console.log('Added re-lock after .then() history load');
  }
  break;
}
// Check for 2nd .then()
let thenPos2 = code.indexOf(thenLoad, code.indexOf(thenLoad) + thenLoad.length + 200);
if (thenPos2 !== -1) {
  const afterT2 = code.substring(thenPos2 + thenLoad.length, thenPos2 + thenLoad.length + 120);
  if (!afterT2.includes('_isSafeZone')) {
    const lockThen2 = "\n              canvas.getObjects().forEach((o) => { if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel) { o.set({ selectable: false, evented: false }); } });";
    code = code.slice(0, thenPos2 + thenLoad.length) + lockThen2 + code.slice(thenPos2 + thenLoad.length);
    changes++;
    console.log('Added re-lock after 2nd .then() history load');
  }
}

// FIX 6: refreshLayers filter - add _isGuideText and _isSizeLabel
const oldFilter = "o.selectable !== false && !o._isBgRect && !o._isSafeZone && !o._isGuideLine";
if (code.includes(oldFilter) && !code.includes(oldFilter + " && !o._isGuideText")) {
  code = code.replace(oldFilter, oldFilter + " && !o._isGuideText && !o._isSizeLabel");
  changes++;
  console.log('Updated refreshLayers filter');
}

fs.writeFileSync(file, code, 'utf8');
console.log('\nDone! ' + changes + ' changes applied.');
