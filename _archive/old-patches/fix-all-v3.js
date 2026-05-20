const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// FIX 1: Clear Canvas - add localStorage clear
const marker1 = `all.forEach((o:any) => c.remove(o));
            c.set('backgroundColor', '#FFFFFF');
            // Re-add safe zone and guide text`;
const replace1 = `all.forEach((o:any) => c.remove(o));
            c.set('backgroundColor', '#FFFFFF');
            // Clear auto-save data so refresh starts fresh
            try { localStorage.removeItem('panelEditor_autoSave_' + panelId); } catch {}
            historyRef.current = []; historyIdxRef.current = -1;
            // Re-add safe zone and guide text`;

if (code.includes(marker1)) {
  code = code.replace(marker1, replace1);
  changes++;
  console.log("[Fix 1] Clear Canvas: added localStorage.removeItem");
} else {
  console.log("[Skip 1] Clear Canvas marker not found");
  // Debug: find nearby text
  const idx = code.indexOf("c.set('backgroundColor', '#FFFFFF')");
  if (idx > -1) console.log("  Found backgroundColor set at index", idx);
}

// FIX 2: doSave - clear auto-save after save
const marker2 = `onSave(panelId, json, thumb);
  }, [panelId, onSave]);`;
const replace2 = `onSave(panelId, json, thumb);
    try { localStorage.removeItem('panelEditor_autoSave_' + panelId); } catch {}
  }, [panelId, onSave]);`;

if (code.includes(marker2)) {
  code = code.replace(marker2, replace2);
  changes++;
  console.log("[Fix 2] doSave: added localStorage.removeItem after save");
} else {
  console.log("[Skip 2] doSave marker not found");
  const idx = code.indexOf("onSave(panelId, json, thumb)");
  if (idx > -1) console.log("  Found onSave at index", idx);
}

// FIX 3: savedJSON restore - preserve backgroundColor
const marker3 = `await canvas.loadFromJSON(_parsedSaved);`;
if (code.includes(marker3)) {
  const idx = code.indexOf(marker3);
  // Check if backgroundColor preservation already exists
  const nearby = code.substring(idx - 100, idx + 200);
  if (!nearby.includes("_savedBg") && !nearby.includes("savedBgColor")) {
    code = code.replace(marker3, 
      `const _savedBgColor = _parsedSaved.backgroundColor;
          await canvas.loadFromJSON(_parsedSaved);
          if (_savedBgColor) canvas.backgroundColor = _savedBgColor;`);
    changes++;
    console.log("[Fix 3] savedJSON restore: preserve backgroundColor");
  } else {
    console.log("[Skip 3] backgroundColor preservation already exists");
  }
} else {
  console.log("[Skip 3] loadFromJSON(_parsedSaved) not found");
}

// FIX 4: Auto-save restore - preserve backgroundColor  
const marker4 = `await canvas.loadFromJSON(parsed);
              canvas.requestRenderAll();`;
if (code.includes(marker4)) {
  const nearby = code.substring(code.indexOf(marker4) - 50, code.indexOf(marker4) + 100);
  if (!nearby.includes("savedBgColor") && !nearby.includes("autoBgColor")) {
    code = code.replace(marker4,
      `const _autoBgColor = parsed.backgroundColor;
              await canvas.loadFromJSON(parsed);
              if (_autoBgColor) canvas.backgroundColor = _autoBgColor;
              canvas.requestRenderAll();`);
    changes++;
    console.log("[Fix 4] Auto-save restore: preserve backgroundColor");
  }
}

// FIX 5: Auto-save interval - ensure backgroundColor is saved
const marker5 = `localStorage.setItem(storageKey, JSON.stringify(json));`;
if (code.includes(marker5)) {
  const idx = code.indexOf(marker5);
  const before = code.substring(idx - 200, idx);
  if (!before.includes("json.backgroundColor")) {
    code = code.replace(marker5, 
      `if (cv.backgroundColor) json.backgroundColor = cv.backgroundColor;
          localStorage.setItem(storageKey, JSON.stringify(json));`);
    changes++;
    console.log("[Fix 5] Auto-save: ensure backgroundColor is saved");
  }
}

// FIX 6: Canvas init flicker - hide until ready
const marker6 = `await waitForLayout();
      await new Promise(r => setTimeout(r, 100));`;
if (code.includes(marker6) && !code.includes("wrapperRef.current.style.opacity")) {
  code = code.replace(marker6, 
    `if (wrapperRef.current) wrapperRef.current.style.opacity = "0";
      await waitForLayout();
      await new Promise(r => setTimeout(r, 100));`);
  changes++;
  console.log("[Fix 6] Hide canvas during init");
}

// Show after init
const marker7 = `if (!didRestore) {
        addSafeZone();
      }`;
if (code.includes(marker7) && !code.includes("opacity = \"1\"")) {
  code = code.replace(marker7, 
    `if (!didRestore) {
        addSafeZone();
      }
      requestAnimationFrame(() => {
        if (wrapperRef.current) { wrapperRef.current.style.transition = "opacity 0.15s"; wrapperRef.current.style.opacity = "1"; }
      });`);
  changes++;
  console.log("[Fix 7] Show canvas after init");
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
