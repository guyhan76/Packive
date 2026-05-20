const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// ═══ FIX 1: doSave - stop removing guide objects from canvas ═══
// Replace the guideObjs remove/add pattern with clean JSON export
const oldGuide = `const guideObjs = c.getObjects().filter((o: any) => o.selectable === false && o.evented === false);
    guideObjs.forEach((o: any) => c.remove(o));
    c.renderAll();
    const _ej = c.toJSON(['src','_isSafeZone','_isGuideLine','_isGuideText','_isSizeLabel']);
    _ej.objects = (_ej.objects || []).filter((o) => !o._isSafeZone && !o._isGuideLine && !o._isGuideText && !o._isSizeLabel);
    const json = JSON.stringify(_ej);
    guideObjs.forEach((o: any) => c.add(o));
    guideObjs.forEach((o: any) => c.sendObjectToBack(o));
    c.renderAll();`;

const newGuide = `// Export JSON without removing objects from canvas
    const _ej = c.toJSON(['src','_isSafeZone','_isGuideLine','_isGuideText','_isSizeLabel','_isBgImage','_isBgPattern']);
    _ej.objects = (_ej.objects || []).filter((o: any) => !o._isSafeZone && !o._isGuideLine && !o._isGuideText && !o._isSizeLabel);
    // Preserve backgroundColor
    if (c.backgroundColor) _ej.backgroundColor = c.backgroundColor;
    const json = JSON.stringify(_ej);`;

if (code.includes(oldGuide)) {
  code = code.replace(oldGuide, newGuide);
  changes++;
  console.log("[Fix 1] doSave: no longer removes/re-adds guide objects");
} else {
  console.log("[Skip 1] doSave pattern not found");
}

// ═══ FIX 2: Auto-save restore - preserve backgroundColor ═══
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
              const savedBgColor = parsed.backgroundColor;
              await canvas.loadFromJSON(parsed);
              if (savedBgColor) canvas.backgroundColor = savedBgColor;
              canvas.requestRenderAll();
              // Remove only guide overlay objects
              canvas.getObjects().slice().forEach((o: any) => {
                if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel) canvas.remove(o);
              });`;

if (code.includes(oldAutoRestore)) {
  code = code.replace(oldAutoRestore, newAutoRestore);
  changes++;
  console.log("[Fix 2] Auto-restore: preserve backgroundColor");
} else {
  console.log("[Skip 2] Auto-restore pattern not found");
}

// ═══ FIX 3: savedJSON restore - preserve backgroundColor ═══
const oldSavedRestore = `await canvas.loadFromJSON(_parsedSaved);
              canvas.getObjects().filter((o) => o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel).forEach((o) => canvas.remove(o));`;

const newSavedRestore = `const _savedBg = _parsedSaved.backgroundColor;
          await canvas.loadFromJSON(_parsedSaved);
              if (_savedBg) canvas.backgroundColor = _savedBg;
              canvas.getObjects().filter((o: any) => o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel).forEach((o: any) => canvas.remove(o));`;

if (code.includes(oldSavedRestore)) {
  code = code.replace(oldSavedRestore, newSavedRestore);
  changes++;
  console.log("[Fix 3] savedJSON restore: preserve backgroundColor");
} else {
  console.log("[Skip 3] savedJSON restore pattern not found - checking variant...");
  // Try without the extra spaces
  if (code.includes("await canvas.loadFromJSON(_parsedSaved);")) {
    console.log("  Found loadFromJSON(_parsedSaved) - needs manual context");
  }
}

// ═══ FIX 4: Hide canvas during init, show after ═══
if (code.includes("if (wrapperRef.current) wrapperRef.current.style.opacity")) {
  console.log("[Skip 4] Already has opacity fix");
} else {
  // Add opacity:0 before waitForLayout
  const oldBoot = `await waitForLayout();
      await new Promise(r => setTimeout(r, 100));`;
  const newBoot = `// Hide canvas until fully loaded
      if (wrapperRef.current) wrapperRef.current.style.opacity = "0";
      await waitForLayout();
      await new Promise(r => setTimeout(r, 100));`;
  if (code.includes(oldBoot)) {
    code = code.replace(oldBoot, newBoot);
    changes++;
    console.log("[Fix 4] Hide canvas during init");
  } else {
    console.log("[Skip 4] Boot pattern not found");
  }
}

// Show canvas after init
const oldNoRestore = `if (!didRestore) {
        addSafeZone();
      }`;
const newNoRestore = `if (!didRestore) {
        addSafeZone();
      }
      // Show canvas after initialization
      requestAnimationFrame(() => {
        if (wrapperRef.current) {
          wrapperRef.current.style.transition = "opacity 0.15s";
          wrapperRef.current.style.opacity = "1";
        }
      });`;
if (code.includes(oldNoRestore)) {
  code = code.replace(oldNoRestore, newNoRestore);
  changes++;
  console.log("[Fix 5] Show canvas after init");
} else {
  console.log("[Skip 5] didRestore pattern not found");
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
