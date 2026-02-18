const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');
let changes = 0;

// The real fix: Move initial safe zone creation AFTER auto-save/savedJSON restore
// Currently: create safe zone -> load auto-save (which replaces canvas) -> re-create safe zone
// This causes double safe zones if auto-save has 0 valid objects but still runs loadFromJSON

// Fix 1: Don't create safe zone before auto-save/savedJSON block
// Instead, create it only once, AFTER all loading is done

// Find the initial safe zone creation block and wrap it
const safeRectCreate = "(safeRect as any)._isSafeZone = true;\n      canvas.add(safeRect);\n      canvas.sendObjectToBack(safeRect);";
const guideCreate = "(guide as any)._isGuideText = true;\n      canvas.add(guide);\n      canvas.sendObjectToBack(guide);";
const sizeLabelCreate = "(sizeLabel as any)._isSizeLabel = true;\n      canvas.add(sizeLabel);\n      canvas.sendObjectToBack(sizeLabel);";

// Remove the initial canvas.add calls (keep the object creation for later use)
if (code.includes(safeRectCreate)) {
  code = code.replace(safeRectCreate, "(safeRect as any)._isSafeZone = true;\n      // Deferred: added after auto-save/savedJSON load");
  changes++; console.log('Fix1a: Deferred safeRect add');
}
if (code.includes(guideCreate)) {
  code = code.replace(guideCreate, "(guide as any)._isGuideText = true;\n      // Deferred: added after auto-save/savedJSON load");
  changes++; console.log('Fix1b: Deferred guide add');
}
if (code.includes(sizeLabelCreate)) {
  code = code.replace(sizeLabelCreate, "(sizeLabel as any)._isSizeLabel = true;\n      // Deferred: added after auto-save/savedJSON load");
  changes++; console.log('Fix1c: Deferred sizeLabel add');
}

// Fix 2: After ALL loading (auto-save and savedJSON), add safe zone objects once
// Find "canvas.renderAll();" right after sizeLabel creation
const oldRenderAfterSize = "canvas.renderAll();\n\n      if (savedJSON)";
const newRenderAfterSize = `// Add safe zone objects to canvas (deferred)
      canvas.add(safeRect); canvas.sendObjectToBack(safeRect);
      canvas.add(guide); canvas.sendObjectToBack(guide);
      canvas.add(sizeLabel); canvas.sendObjectToBack(sizeLabel);
      canvas.renderAll();

      if (savedJSON)`;
if (code.includes(oldRenderAfterSize)) {
  code = code.replace(oldRenderAfterSize, newRenderAfterSize);
  changes++; console.log('Fix2: Added deferred safe zone objects before savedJSON block');
} else {
  // Try with different whitespace
  const alt = "canvas.renderAll();\n      if (savedJSON)";
  if (code.includes(alt)) {
    code = code.replace(alt, `canvas.add(safeRect); canvas.sendObjectToBack(safeRect);
      canvas.add(guide); canvas.sendObjectToBack(guide);
      canvas.add(sizeLabel); canvas.sendObjectToBack(sizeLabel);
      canvas.renderAll();
      if (savedJSON)`);
    changes++; console.log('Fix2alt: Added deferred safe zone objects');
  } else { console.log('Fix2: not found'); }
}

// Fix 3: In auto-save restore, SKIP loadFromJSON if 0 valid objects remain after filtering
// This prevents loadFromJSON from wiping the canvas when there's nothing useful to restore
const oldAutoLoad = "if (parsed.objects.length > 0) {\n              await canvas.loadFromJSON(parsed);";
const newAutoLoad = `if (parsed.objects.length > 0) {
              // Remove existing safe zone before loadFromJSON replaces canvas
              canvas.getObjects().slice().forEach((o: any) => {
                if (o._isSafeZone || o._isGuideText || o._isSizeLabel || o._isGuideLine) canvas.remove(o);
              });
              await canvas.loadFromJSON(parsed);`;
if (code.includes(oldAutoLoad)) {
  code = code.replace(oldAutoLoad, newAutoLoad);
  changes++; console.log('Fix3: Remove safe zone before auto-save loadFromJSON');
} else { console.log('Fix3: not found'); }

// Fix 4: In savedJSON restore, same - remove existing safe zone before loadFromJSON
const oldSavedLoad = "await canvas.loadFromJSON(_parsedSaved);";
if (code.includes(oldSavedLoad)) {
  code = code.replace(oldSavedLoad, `// Remove existing safe zone before loadFromJSON replaces canvas
              canvas.getObjects().slice().forEach((o: any) => {
                if (o._isSafeZone || o._isGuideText || o._isSizeLabel || o._isGuideLine) canvas.remove(o);
              });
              await canvas.loadFromJSON(_parsedSaved);`);
  changes++; console.log('Fix4: Remove safe zone before savedJSON loadFromJSON');
} else { console.log('Fix4: not found'); }

// Fix 5: Add detailed logging to see what 5 objects are being restored
const oldAutoLog = "console.log('Auto-save restored', parsed.objects.length, 'objects');";
const newAutoLog = `console.log('Auto-save restored', parsed.objects.length, 'objects');
              console.log('Restored object types:', canvas.getObjects().map((o: any) => ({ type: o.type, fill: o.fill, stroke: o.stroke, safe: o._isSafeZone, guide: o._isGuideText, size: o._isSizeLabel })));`;
if (code.includes(oldAutoLog)) {
  code = code.replace(oldAutoLog, newAutoLog);
  changes++; console.log('Fix5: Added detailed restore logging');
} else { console.log('Fix5: not found'); }

fs.writeFileSync(file, code, 'utf8');
console.log('\nTotal changes: ' + changes);
