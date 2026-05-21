const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// ═══════════════════════════════════════════════
// FIX 1: doSave - preserve backgroundColor properly
// The issue: guideObjs removal deletes ALL non-selectable objects including bg images
// ═══════════════════════════════════════════════

const oldDoSave = `const guideObjs = c.getObjects().filter((o: any) => o.selectable === false && o.evented === false);
    guideObjs.forEach((o: any) => c.remove(o));
    c.renderAll();
    const _ej = c.toJSON(['src','_isSafeZone','_isGuideLine','_isGuideText','_isSizeLabel']);
    _ej.objects = (_ej.objects || []).filter((o) => !o._isSafeZone && !o._isGuideLine && !o._isGuideText && !o._isSizeLabel);
    const json = JSON.stringify(_ej);
    guideObjs.forEach((o: any) => c.add(o));
    guideObjs.forEach((o: any) => c.sendObjectToBack(o));
    c.renderAll();`;

const newDoSave = `// Save JSON: include backgroundColor, exclude only guide objects
    const _ej = c.toJSON(['src','_isSafeZone','_isGuideLine','_isGuideText','_isSizeLabel','_isBgImage','_isBgPattern']);
    _ej.objects = (_ej.objects || []).filter((o: any) => {
      if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel) return false;
      return true;
    });
    // Ensure backgroundColor is preserved
    const bgColor = c.backgroundColor;
    if (bgColor) _ej.backgroundColor = bgColor;
    const json = JSON.stringify(_ej);`;

if (code.includes(oldDoSave)) {
  code = code.replace(oldDoSave, newDoSave);
  changes++;
  console.log("[Fix 1] doSave: no longer removes guide objects from canvas, preserves backgroundColor");
}

// ═══════════════════════════════════════════════
// FIX 2: savedJSON restore - preserve backgroundColor
// ═══════════════════════════════════════════════

const oldRestore = `await canvas.loadFromJSON(_parsedSaved);
              canvas.getObjects().filter((o) => o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel).forEach((o) => canvas.remove(o));
          // Remove any guide objects loaded from JSON, re-create fresh
          const loadedObjs = canvas.getObjects().slice();
          loadedObjs.forEach((o: any) => {
            if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel) { canvas.remove(o); return; }
            if (o.selectable === false && o.evented === false) { canvas.remove(o); return; }
            if (o.type === 'rect' && o.stroke === '#93B5F7' && o.fill === 'transparent') { canvas.remove(o); return; }
            if (o.type === 'text' && (o.fill === '#C0C0C0' || o.fill === '#B0B0B0') && o.fontSize <= 13) { canvas.remove(o); return; }
          });
          addSafeZone();`;

const newRestore = `// Preserve backgroundColor from saved JSON
          const savedBgColor = _parsedSaved.backgroundColor;
          await canvas.loadFromJSON(_parsedSaved);
          // Restore backgroundColor if it was lost
          if (savedBgColor) {
            canvas.backgroundColor = savedBgColor;
          }
          // Remove only guide overlay objects, keep everything else
          canvas.getObjects().slice().forEach((o: any) => {
            if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel) canvas.remove(o);
          });
          addSafeZone();`;

if (code.includes(oldRestore)) {
  code = code.replace(oldRestore, newRestore);
  changes++;
  console.log("[Fix 2] Restore: preserve backgroundColor, only remove guide objects");
}

// ═══════════════════════════════════════════════
// FIX 3: Auto-save restore - preserve backgroundColor
// ═══════════════════════════════════════════════

const oldAutoRestore = `if (parsed.objects.length > 0) {
              await canvas.loadFromJSON(parsed);
              canvas.requestRenderAll();
              canvas.getObjects().filter((o: any) => {
                if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel) return true;
                if (o.selectable === false && o.evented === false) return true;
                if (o.type === 'rect' && o.stroke === '#93B5F7' && o.fill === 'transparent') return true;
                if (o.type === 'text' && (o.fill === '#C0C0C0' || o.fill === '#B0B0B0') && o.fontSize <= 13) return true;
                return false;
              }).forEach((o) => canvas.remove(o));`;

const newAutoRestore = `if (parsed.objects.length > 0) {
              const autoBgColor = parsed.backgroundColor;
              await canvas.loadFromJSON(parsed);
              // Restore backgroundColor
              if (autoBgColor) canvas.backgroundColor = autoBgColor;
              // Remove only guide objects
              canvas.getObjects().slice().forEach((o: any) => {
                if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel) canvas.remove(o);
              });`;

if (code.includes(oldAutoRestore)) {
  code = code.replace(oldAutoRestore, newAutoRestore);
  changes++;
  console.log("[Fix 3] Auto-restore: preserve backgroundColor");
}

// ═══════════════════════════════════════════════
// FIX 4: Auto-save interval - include backgroundColor
// ═══════════════════════════════════════════════

const oldAutoSaveJson = `const json = cv.toJSON(['_isBgImage', '_isSafeZone', '_isCropRect', '_isGuideLine', '_isGuideText', '_isSizeLabel', '_isBgPattern']);
          json.objects = (json.objects || []).filter((o) => !o._isSafeZone && !o._isGuideLine && !o._isGuideText && !o._isSizeLabel);`;

const newAutoSaveJson = `const json = cv.toJSON(['_isBgImage', '_isSafeZone', '_isCropRect', '_isGuideLine', '_isGuideText', '_isSizeLabel', '_isBgPattern']);
          json.objects = (json.objects || []).filter((o: any) => !o._isSafeZone && !o._isGuideLine && !o._isGuideText && !o._isSizeLabel);
          // Ensure backgroundColor is saved
          if (cv.backgroundColor) json.backgroundColor = cv.backgroundColor;`;

// Replace ALL occurrences (interval + beforeUnload)
let autoSaveCount = 0;
while (code.includes(oldAutoSaveJson)) {
  code = code.replace(oldAutoSaveJson, newAutoSaveJson);
  autoSaveCount++;
}
if (autoSaveCount > 0) {
  changes += autoSaveCount;
  console.log(`[Fix 4] Auto-save: added backgroundColor to ${autoSaveCount} save location(s)`);
}

// ═══════════════════════════════════════════════
// FIX 5: Canvas flicker - hide canvas until fully initialized
// ═══════════════════════════════════════════════

// Add opacity:0 initially, set to 1 after boot
const oldWaitForLayout = `const waitForLayout = () => new Promise<void>(resolve => {
        const check = () => {
          if (disposed) { resolve(); return; }
          const w = wrapperRef.current;
          if (w && w.clientWidth > 100 && w.clientHeight > 100) { resolve(); return; }  
          requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
      });
      await waitForLayout();
      await new Promise(r => setTimeout(r, 100));`;

const newWaitForLayout = `const waitForLayout = () => new Promise<void>(resolve => {
        const check = () => {
          if (disposed) { resolve(); return; }
          const w = wrapperRef.current;
          if (w && w.clientWidth > 100 && w.clientHeight > 100) { resolve(); return; }
          requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
      });
      // Hide canvas container until fully initialized
      if (wrapperRef.current) wrapperRef.current.style.opacity = "0";
      await waitForLayout();
      await new Promise(r => setTimeout(r, 100));`;

if (code.includes(oldWaitForLayout)) {
  code = code.replace(oldWaitForLayout, newWaitForLayout);
  changes++;
  console.log("[Fix 5] Canvas hidden during initialization");
}

// Show canvas after initialization complete (after addSafeZone or didRestore)
const oldDidRestore = `if (!didRestore) {
        addSafeZone();
      }`;
const newDidRestore = `if (!didRestore) {
        addSafeZone();
      }
      // Show canvas now that initialization is complete
      if (wrapperRef.current) {
        wrapperRef.current.style.transition = "opacity 0.15s ease-in";
        wrapperRef.current.style.opacity = "1";
      }`;

if (code.includes(oldDidRestore)) {
  code = code.replace(oldDidRestore, newDidRestore);
  changes++;
  console.log("[Fix 6] Canvas shown after initialization");
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
if (changes >= 4) console.log("✅ Background preservation + canvas flicker fixes applied!");
else console.log("⚠️ Some patterns not matched - check manually");
