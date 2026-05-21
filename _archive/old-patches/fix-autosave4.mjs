import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
const lines = readFileSync(f, "utf8").split('\n');

// Find "fcRef.current = canvas;" line
let fcLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === 'fcRef.current = canvas;') { fcLine = i; break; }
}

if (fcLine < 0) { console.log("fcRef.current = canvas; not found"); process.exit(1); }

// Find "const scale = canvasW / widthMM;" after fcLine
let scaleLine = -1;
for (let i = fcLine + 1; i < Math.min(fcLine + 10, lines.length); i++) {
  if (lines[i].includes('const scale = canvasW / widthMM;')) { scaleLine = i; break; }
}

if (scaleLine < 0) { console.log("const scale line not found"); process.exit(1); }

console.log("Found fcRef at line " + fcLine + ", scale at line " + scaleLine);

const autoSaveBlock = [
  '',
  '      // Auto-save: restore from localStorage',
  '      const storageKey = \'panelEditor_autoSave_\' + panelId;',
  '      try {',
  '        const saved = localStorage.getItem(storageKey);',
  '        if (saved) {',
  '          const parsed = JSON.parse(saved);',
  '          if (parsed && parsed.objects && parsed.objects.length > 0) {',
  '            await canvas.loadFromJSON(parsed);',
  '            canvas.requestRenderAll();',
  '            console.log(\'Auto-save restored\');',
  '          }',
  '        }',
  '      } catch (err) { console.warn(\'Auto-save restore failed:\', err); }',
  '',
  '      // Auto-save: save every 10 seconds',
  '      const autoSaveInterval = setInterval(() => {',
  '        const cv = fcRef.current;',
  '        if (!cv) return;',
  '        try {',
  '          const json = cv.toJSON([\'_isBgImage\', \'_isSafeZone\', \'_isCropRect\', \'_isGuideLine\']);',
  '          const objs = cv.getObjects();',
  '          json.objects?.forEach((jObj: any, idx: number) => {',
  '            if (jObj.type === \'image\' && jObj.src && (jObj.src.startsWith(\'blob:\') || jObj.src.startsWith(\'object:\'))) {',
  '              try {',
  '                const el = (objs[idx] as any)?._element || (objs[idx] as any)?.getElement?.();',
  '                if (el) {',
  '                  const tc = document.createElement(\'canvas\');',
  '                  tc.width = el.naturalWidth || el.width;',
  '                  tc.height = el.naturalHeight || el.height;',
  '                  tc.getContext(\'2d\')!.drawImage(el, 0, 0);',
  '                  jObj.src = tc.toDataURL(\'image/png\');',
  '                }',
  '              } catch {}',
  '            }',
  '          });',
  '          localStorage.setItem(storageKey, JSON.stringify(json));',
  '        } catch (err) { console.warn(\'Auto-save failed:\', err); }',
  '      }, 10000);',
  '',
  '      // Auto-save on page unload',
  '      const handleBeforeUnload = () => {',
  '        const cv = fcRef.current;',
  '        if (!cv) return;',
  '        try {',
  '          const json = cv.toJSON([\'_isBgImage\', \'_isSafeZone\', \'_isCropRect\', \'_isGuideLine\']);',
  '          const objs = cv.getObjects();',
  '          json.objects?.forEach((jObj: any, idx: number) => {',
  '            if (jObj.type === \'image\' && jObj.src && (jObj.src.startsWith(\'blob:\') || jObj.src.startsWith(\'object:\'))) {',
  '              try {',
  '                const el = (objs[idx] as any)?._element || (objs[idx] as any)?.getElement?.();',
  '                if (el) {',
  '                  const tc = document.createElement(\'canvas\');',
  '                  tc.width = el.naturalWidth || el.width;',
  '                  tc.height = el.naturalHeight || el.height;',
  '                  tc.getContext(\'2d\')!.drawImage(el, 0, 0);',
  '                  jObj.src = tc.toDataURL(\'image/png\');',
  '                }',
  '              } catch {}',
  '            }',
  '          });',
  '          localStorage.setItem(storageKey, JSON.stringify(json));',
  '        } catch {}',
  '      };',
  '      window.addEventListener(\'beforeunload\', handleBeforeUnload);',
  '',
];

// Insert after fcRef line, before scale line
lines.splice(fcLine + 1, scaleLine - fcLine - 1, ...autoSaveBlock);

// Now add cleanup in return () => { disposed = true;
let code = lines.join('\n');
const cleanupAnchor = 'disposed = true;';
const lastCleanup = code.lastIndexOf(cleanupAnchor);
if (lastCleanup >= 0) {
  const insertAt = lastCleanup + cleanupAnchor.length;
  const cleanupCode = '\n        clearInterval(autoSaveInterval);\n        window.removeEventListener(\'beforeunload\', handleBeforeUnload);';
  code = code.substring(0, insertAt) + cleanupCode + code.substring(insertAt);
  console.log("Added cleanup code");
}

writeFileSync(f, code, "utf8");
console.log("Done! Auto-save with 10s interval added successfully");
