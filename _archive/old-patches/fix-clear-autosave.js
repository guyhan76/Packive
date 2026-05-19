const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// FIX 1: Clear Canvas - also clear localStorage auto-save
const oldClear = `if (!confirm(t("tool.clearCanvasConfirm"))) return;
            const all = c.getObjects().slice();
            all.forEach((o:any) => c.remove(o));
            c.set('backgroundColor', '#FFFFFF');`;

const newClear = `if (!confirm(t("tool.clearCanvasConfirm"))) return;
            const all = c.getObjects().slice();
            all.forEach((o:any) => c.remove(o));
            c.set('backgroundColor', '#FFFFFF');
            // Clear auto-save data
            try { localStorage.removeItem('panelEditor_autoSave_' + panelId); } catch {}
            // Reset history
            historyRef.current = [];
            historyIdxRef.current = -1;`;

if (code.includes(oldClear)) {
  code = code.replace(oldClear, newClear);
  changes++;
  console.log("[Fix 1] Clear Canvas: now clears localStorage auto-save");
}

// FIX 2: doSave - also clear auto-save after successful save
const oldOnSave = `onSave(panelId, json, thumb);
  }, [panelId, onSave]);`;
const newOnSave = `onSave(panelId, json, thumb);
    // Clear auto-save after successful manual save
    try { localStorage.removeItem('panelEditor_autoSave_' + panelId); } catch {}
  }, [panelId, onSave]);`;

if (code.includes(oldOnSave)) {
  code = code.replace(oldOnSave, newOnSave);
  changes++;
  console.log("[Fix 2] doSave: clears auto-save after successful save");
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
if (changes >= 2) console.log("✅ Clear Canvas + Save now properly clear auto-save!");
