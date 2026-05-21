const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');
let changes = 0;

// ============================================================
// STRATEGY: 
// 1. Remove initial safe zone add (before auto-save)
// 2. Auto-save restore: load user objects only, then add safe zone AFTER
// 3. If no auto-save/savedJSON: just add safe zone
// 4. Safe zone creation as a single reusable block
// ============================================================

// Fix 1: Remove the deferred add block before savedJSON check
// Current code adds safeRect/guide/sizeLabel then checks savedJSON
const oldDeferredAdd = `// Add safe zone objects to canvas (deferred)
      canvas.add(safeRect); canvas.sendObjectToBack(safeRect);
      canvas.add(guide); canvas.sendObjectToBack(guide);
      canvas.add(sizeLabel); canvas.sendObjectToBack(sizeLabel);
      canvas.renderAll();
      if (savedJSON)`;

if (code.includes(oldDeferredAdd)) {
  code = code.replace(oldDeferredAdd, `canvas.renderAll();

      // Helper: add safe zone objects to canvas
      const addSafeZone = () => {
        // Remove any existing safe zone objects first
        canvas.getObjects().slice().forEach((o) => {
          if (o._isSafeZone || o._isGuideText || o._isSizeLabel) canvas.remove(o);
        });
        canvas.add(safeRect); canvas.sendObjectToBack(safeRect);
        canvas.add(guide); canvas.sendObjectToBack(guide);
        canvas.add(sizeLabel); canvas.sendObjectToBack(sizeLabel);
        canvas.renderAll();
      };

      let didRestore = false;
      if (savedJSON)`);
  changes++; console.log('Fix1: Replaced deferred add with addSafeZone helper');
} else { console.log('Fix1: not found'); }

// Fix 2: In auto-save restore, after re-create safe zone, replace with addSafeZone()
// Find the re-create block in auto-save
const oldAutoRecreate = `// Re-create safe zone
              try {
                const _sc = scaleRef.current; const _cw = canvas.getWidth(); const _ch = canvas.getHeight();
                const _mg = Math.round(5 * _sc);
                const { Rect: _R, FabricText: _FT } = require('fabric');
                const _szR = new _R({ left: _mg, top: _mg, originX: 'left', originY: 'top', width: _cw-_mg*2, height: _ch-_mg*2, fill: 'transparent', stroke: '#93B5F7', strokeWidth: 1.5, strokeDashArray: [8,5], selectable: false, evented: false });
                _szR._isSafeZone = true; canvas.add(_szR); canvas.sendObjectToBack(_szR);
                const _gtR = new _FT(guideText || '', { left: _cw/2, top: _ch/2-10, originX: 'center', originY: 'center', fontSize: 13, fill: '#C0C0C0', fontFamily: 'Arial, sans-serif', selectable: false, evented: false });
                _gtR._isGuideText = true; canvas.add(_gtR); canvas.sendObjectToBack(_gtR);
              } catch(e) { console.warn('Safe zone re-create:', e); }`;

if (code.includes(oldAutoRecreate)) {
  code = code.replace(oldAutoRecreate, `addSafeZone();
              didRestore = true;`);
  changes++; console.log('Fix2: Auto-save re-create replaced with addSafeZone()');
} else { console.log('Fix2: not found'); }

// Fix 3: In savedJSON restore, replace the re-create block with addSafeZone()
// Find the savedJSON re-create block (lines ~1022-1028)
const oldSavedRecreate = /const _cw2 = canvas\.getWidth\(\);.*?canvas\.renderAll\(\);\s*\n\s*loadingRef\.current = false;/s;
if (oldSavedRecreate.test(code)) {
  code = code.replace(oldSavedRecreate, `addSafeZone();
          didRestore = true;
          canvas.renderAll();
          loadingRef.current = false;`);
  changes++; console.log('Fix3: savedJSON re-create replaced with addSafeZone()');
} else {
  console.log('Fix3: regex not found, trying literal...');
  // Try to find by unique markers
  const marker1 = "const _cw2 = canvas.getWidth(); const _ch2 = canvas.getHeight();";
  const marker2 = "loadingRef.current = false;";
  if (code.includes(marker1) && code.includes(marker2)) {
    const start = code.indexOf(marker1);
    const end = code.indexOf(marker2, start) + marker2.length;
    const oldBlock = code.substring(start, end);
    code = code.replace(oldBlock, `addSafeZone();
          didRestore = true;
          canvas.renderAll();
          loadingRef.current = false;`);
    changes++; console.log('Fix3alt: savedJSON re-create replaced');
  } else { console.log('Fix3: completely not found'); }
}

// Fix 4: After both savedJSON and auto-save blocks, add safe zone if neither restored
// Find the spot after auto-save try/catch block
const oldAfterAutoSave = "} catch (err) { console.warn('Auto-save restore failed:', err); }";
if (code.includes(oldAfterAutoSave)) {
  code = code.replace(oldAfterAutoSave, `} catch (err) { console.warn('Auto-save restore failed:', err); }

      // If neither savedJSON nor auto-save restored, add safe zone now
      if (!didRestore) {
        addSafeZone();
      }`);
  changes++; console.log('Fix4: Added fallback addSafeZone()');
} else { console.log('Fix4: not found'); }

// Fix 5: Remove the "Remove existing safe zone before loadFromJSON" blocks
// since addSafeZone() already handles cleanup
const oldRemoveBeforeLoad = `// Remove existing safe zone before loadFromJSON replaces canvas
              canvas.getObjects().slice().forEach((o: any) => {
                if (o._isSafeZone || o._isGuideText || o._isSizeLabel || o._isGuideLine) canvas.remove(o);
              });
              await canvas.loadFromJSON(parsed);`;
if (code.includes(oldRemoveBeforeLoad)) {
  code = code.replace(oldRemoveBeforeLoad, `await canvas.loadFromJSON(parsed);`);
  changes++; console.log('Fix5a: Removed redundant safe zone removal before auto-save load');
}

const oldRemoveBeforeSaved = `// Remove existing safe zone before loadFromJSON replaces canvas
              canvas.getObjects().slice().forEach((o: any) => {
                if (o._isSafeZone || o._isGuideText || o._isSizeLabel || o._isGuideLine) canvas.remove(o);
              });
              await canvas.loadFromJSON(_parsedSaved);`;
if (code.includes(oldRemoveBeforeSaved)) {
  code = code.replace(oldRemoveBeforeSaved, `await canvas.loadFromJSON(_parsedSaved);`);
  changes++; console.log('Fix5b: Removed redundant safe zone removal before savedJSON load');
}

fs.writeFileSync(file, code, 'utf8');
console.log('\nTotal changes: ' + changes);
