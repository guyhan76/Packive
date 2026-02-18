import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");

// Replace the simple toJSON auto-save with one that converts images to dataURLs
const oldInterval = `// Auto-save: save to localStorage every 10 seconds
      const autoSaveInterval = setInterval(() => {
        const cv = fcRef.current;
        if (!cv) return;
        try {
          const json = cv.toJSON();
          localStorage.setItem(storageKey, JSON.stringify(json));
        } catch (err) { console.warn('Auto-save failed:', err); }
      }, 10000);`;

const newInterval = `// Auto-save: save to localStorage every 10 seconds (with image data URLs)
      const autoSaveInterval = setInterval(() => {
        const cv = fcRef.current;
        if (!cv) return;
        try {
          const json = cv.toJSON(['_isBgImage', '_isSafeZone', '_isCropRect', '_isGuideLine']);
          // Convert blob/object URLs in image sources to data URLs
          const objs = cv.getObjects();
          json.objects?.forEach((jObj: any, i: number) => {
            if (jObj.type === 'image' && jObj.src && (jObj.src.startsWith('blob:') || jObj.src.startsWith('object:'))) {
              try {
                const el = (objs[i] as any)?._element || (objs[i] as any)?.getElement?.();
                if (el) {
                  const tempCanvas = document.createElement('canvas');
                  tempCanvas.width = el.naturalWidth || el.width;
                  tempCanvas.height = el.naturalHeight || el.height;
                  const tempCtx = tempCanvas.getContext('2d')!;
                  tempCtx.drawImage(el, 0, 0);
                  jObj.src = tempCanvas.toDataURL('image/png');
                }
              } catch {}
            }
          });
          localStorage.setItem(storageKey, JSON.stringify(json));
        } catch (err) { console.warn('Auto-save failed:', err); }
      }, 10000);`;

if (code.includes(oldInterval)) {
  code = code.replace(oldInterval, newInterval);
  console.log("1. Updated auto-save interval with image data URL conversion");
} else {
  console.log("Interval pattern not found");
}

// Also fix the beforeunload handler
const oldUnload = `const handleBeforeUnload = () => {
        const cv = fcRef.current;
        if (!cv) return;
        try {
          const json = cv.toJSON();
          localStorage.setItem(storageKey, JSON.stringify(json));
        } catch {}
      };`;

const newUnload = `const handleBeforeUnload = () => {
        const cv = fcRef.current;
        if (!cv) return;
        try {
          const json = cv.toJSON(['_isBgImage', '_isSafeZone', '_isCropRect', '_isGuideLine']);
          const objs = cv.getObjects();
          json.objects?.forEach((jObj: any, i: number) => {
            if (jObj.type === 'image' && jObj.src && (jObj.src.startsWith('blob:') || jObj.src.startsWith('object:'))) {
              try {
                const el = (objs[i] as any)?._element || (objs[i] as any)?.getElement?.();
                if (el) {
                  const tc = document.createElement('canvas');
                  tc.width = el.naturalWidth || el.width;
                  tc.height = el.naturalHeight || el.height;
                  tc.getContext('2d')!.drawImage(el, 0, 0);
                  jObj.src = tc.toDataURL('image/png');
                }
              } catch {}
            }
          });
          localStorage.setItem(storageKey, JSON.stringify(json));
        } catch {}
      };`;

if (code.includes(oldUnload)) {
  code = code.replace(oldUnload, newUnload);
  console.log("2. Updated beforeunload handler with image data URL conversion");
} else {
  console.log("Unload pattern not found");
}

writeFileSync(f, code, "utf8");
console.log("Done!");
