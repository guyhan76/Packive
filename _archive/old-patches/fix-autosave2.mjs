import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");
let changes = 0;

// 1. Add auto-save logic after fcRef.current = canvas;
const anchor = "fcRef.current = canvas;\n\n\n      const scale = canvasW / widthMM;";

const replacement = `fcRef.current = canvas;

      // Auto-save: restore from localStorage
      const storageKey = 'panelEditor_autoSave_' + panelId;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.objects && parsed.objects.length > 0) {
            await canvas.loadFromJSON(parsed);
            canvas.requestRenderAll();
            console.log('Auto-save restored from localStorage');
          }
        }
      } catch (err) { console.warn('Auto-save restore failed:', err); }

      // Auto-save: save to localStorage every 10 seconds
      const autoSaveInterval = setInterval(() => {
        const cv = fcRef.current;
        if (!cv) return;
        try {
          const json = cv.toJSON();
          localStorage.setItem(storageKey, JSON.stringify(json));
        } catch (err) { console.warn('Auto-save failed:', err); }
      }, 10000);

      // Auto-save on page unload
      const handleBeforeUnload = () => {
        const cv = fcRef.current;
        if (!cv) return;
        try {
          const json = cv.toJSON();
          localStorage.setItem(storageKey, JSON.stringify(json));
        } catch {}
      };
      window.addEventListener('beforeunload', handleBeforeUnload);

      const scale = canvasW / widthMM;`;

if (code.includes(anchor)) {
  code = code.replace(anchor, replacement);
  changes++;
  console.log("1. Added auto-save restore, interval (10s), and beforeunload");
} else {
  console.log("Pattern not found. Checking actual bytes...");
  const idx = code.indexOf("fcRef.current = canvas;");
  if (idx >= 0) {
    const after = code.substring(idx, idx + 80);
    console.log("After fcRef:", JSON.stringify(after));
  }
}

// 2. Add cleanup in dispose
if (changes > 0) {
  const disposeAnchor = "return () => {";
  const lastReturn = code.lastIndexOf(disposeAnchor);
  if (lastReturn >= 0) {
    const insertPos = lastReturn + disposeAnchor.length;
    const cleanup = "\n        clearInterval(autoSaveInterval);\n        window.removeEventListener('beforeunload', handleBeforeUnload);";
    code = code.substring(0, insertPos) + cleanup + code.substring(insertPos);
    changes++;
    console.log("2. Added cleanup for interval and beforeunload");
  }
}

if (changes > 0) {
  writeFileSync(f, code, "utf8");
  console.log("Done! Applied " + changes + " changes. Auto-save interval: 10 seconds");
} else {
  console.log("No changes applied");
}
