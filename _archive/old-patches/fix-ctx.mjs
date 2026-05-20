import { readFileSync, writeFileSync } from "fs";
const file = "src/components/editor/panel-editor.tsx";
let code = readFileSync(file, "utf8");
let changes = 0;

// 1. Fix right-click handler - use opt.target instead of canvas.findTarget
const oldCtx = `// Right-click context menu
      canvas.on('mouse:down', (opt: any) => {
        if (opt.e && opt.e.button === 2) {
          opt.e.preventDefault();
          opt.e.stopPropagation();
          const target = canvas.findTarget(opt.e);
          if (target && target.selectable !== false) {
            canvas.setActiveObject(target);
            canvas.requestRenderAll();
            const wrapperEl = wrapperRef.current;
            if (wrapperEl) {
              const rect = wrapperEl.getBoundingClientRect();
              setCtxMenu({ x: opt.e.clientX - rect.left, y: opt.e.clientY - rect.top, target });
            }
          }
        } else {
          setCtxMenu(null);
        }
      });`;

const newCtx = `// Right-click context menu
      canvas.on('mouse:down', (opt: any) => {
        if (opt.e && opt.e.button === 2) {
          opt.e.preventDefault();
          opt.e.stopPropagation();
          const target = opt.target;
          if (target && target.selectable !== false) {
            canvas.setActiveObject(target);
            canvas.requestRenderAll();
            const wrapperEl = wrapperRef.current;
            if (wrapperEl) {
              const rect = wrapperEl.getBoundingClientRect();
              setCtxMenu({ x: opt.e.clientX - rect.left, y: opt.e.clientY - rect.top, target });
            }
          }
        } else {
          setCtxMenu(null);
        }
      });`;

if (code.includes(oldCtx)) {
  code = code.replace(oldCtx, newCtx);
  changes++;
  console.log("1. Fixed right-click: use opt.target instead of findTarget");
}

// 2. Check if Grid button exists, if not find the correct pattern
const gridPatterns = [
  'label={showGrid ? "Grid ON" : "Grid"}',
  'showGrid',
  'setShowGrid'
];

let hasGrid = false;
for (const p of gridPatterns) {
  if (code.includes(p)) { hasGrid = true; break; }
}
console.log("Grid button exists:", hasGrid);

// 3. Check if Text Shadow section was added
console.log("Text Shadow exists:", code.includes('Text Shadow'));
console.log("BG Pattern state exists:", code.includes('bgPattern'));

if (changes > 0) {
  writeFileSync(file, code, "utf8");
  console.log(`\nDone! ${changes} changes applied.`);
} else {
  console.log("No changes needed.");
}
