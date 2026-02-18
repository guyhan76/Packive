import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");
let changes = 0;

// 1. Add autoSave interval after canvas initialization (after fcRef.current = canvas;)
const initAnchor = `fcRef.current = canvas;


      const scale = canvasW / widthMM;`;

const initReplace = `fcRef.current = canvas;

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

      // Auto-save: periodically save to localStorage every 30 seconds
      const autoSaveInterval = setInterval(() => {
        const cv = fcRef.current;
        if (!cv) return;
        try {
          const json = cv.toJSON();
          localStorage.setItem(storageKey, JSON.stringify(json));
        } catch (err) { console.warn('Auto-save failed:', err); }
      }, 30000);

      const scale = canvasW / widthMM;`;

if (code.includes(initAnchor) && !code.includes('autoSaveInterval')) {
  code = code.replace(initAnchor, initReplace);
  changes++;
  console.log("1. Added auto-save restore and interval");
}

// 2. Clean up interval on dispose - find the dispose/cleanup section
// Look for the return cleanup function in useEffect
const disposeAnchor = `if (fcRef.current) {
        try { fcRef.current.dispose(); } catch {}`;
const disposeReplace = `clearInterval(autoSaveInterval);
      if (fcRef.current) {
        try { fcRef.current.dispose(); } catch {}`;

if (code.includes(disposeAnchor) && changes > 0) {
  // Only replace the SECOND occurrence (cleanup), not the first (init)
  const firstIdx = code.indexOf(disposeAnchor);
  const secondIdx = code.indexOf(disposeAnchor, firstIdx + 1);
  if (secondIdx >= 0) {
    code = code.substring(0, secondIdx) + disposeReplace + code.substring(secondIdx + disposeAnchor.length);
    changes++;
    console.log("2. Added clearInterval on cleanup");
  } else {
    // Only one occurrence, check if it's in return () =>
    const returnIdx = code.lastIndexOf('return () =>');
    const dispIdx = code.indexOf(disposeAnchor);
    if (returnIdx >= 0 && dispIdx > returnIdx) {
      code = code.substring(0, dispIdx) + disposeReplace + code.substring(dispIdx + disposeAnchor.length);
      changes++;
      console.log("2. Added clearInterval on cleanup (single occurrence)");
    }
  }
}

// 3. Also save on important actions - add save helper after storageKey
// Already handled by the interval, but also save on export/page leave
const beforeUnload = `
      // Auto-save on page unload
      const handleBeforeUnload = () => {
        const cv = fcRef.current;
        if (!cv) return;
        try {
          const json = cv.toJSON();
          localStorage.setItem(storageKey, JSON.stringify(json));
        } catch {}
      };
      window.addEventListener('beforeunload', handleBeforeUnload);`;

// Insert after the autoSaveInterval block
const afterIntervalAnchor = `}, 30000);

      const scale = canvasW / widthMM;`;
const afterIntervalReplace = `}, 30000);${beforeUnload}

      const scale = canvasW / widthMM;`;

if (code.includes(afterIntervalAnchor) && !code.includes('handleBeforeUnload')) {
  code = code.replace(afterIntervalAnchor, afterIntervalReplace);
  changes++;
  console.log("3. Added beforeunload save handler");
}

if (changes > 0) {
  writeFileSync(f, code, "utf8");
  console.log("Done! Applied " + changes + " changes for Auto-Save");
} else {
  console.log("No changes applied");
}
