import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");

// Replace the simple loadFromJSON restore with one that filters out blob URLs
const oldRestore = `try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.objects && parsed.objects.length > 0) {
            await canvas.loadFromJSON(parsed);
            canvas.requestRenderAll();
            console.log('Auto-save restored');
          }
        }
      } catch (err) { console.warn('Auto-save restore failed:', err); }`;

const newRestore = `try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.objects && parsed.objects.length > 0) {
            // Remove objects with blob/object URLs that cannot be restored
            parsed.objects = parsed.objects.filter((obj: any) => {
              if (obj.type === 'image' && obj.src && (obj.src.startsWith('blob:') || obj.src.startsWith('object:'))) {
                console.warn('Skipping blob image in auto-save restore');
                return false;
              }
              return true;
            });
            if (parsed.objects.length > 0) {
              await canvas.loadFromJSON(parsed);
              canvas.requestRenderAll();
              console.log('Auto-save restored', parsed.objects.length, 'objects');
            }
          }
        }
      } catch (err) { console.warn('Auto-save restore failed:', err); }`;

if (code.includes(oldRestore)) {
  code = code.replace(oldRestore, newRestore);
  writeFileSync(f, code, "utf8");
  console.log("Done! Updated auto-save restore to skip blob URLs");
} else {
  console.log("Pattern not found");
}
