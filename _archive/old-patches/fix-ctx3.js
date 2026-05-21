const fs = require('fs');
const f = 'src/components/editor/panel-editor.tsx';
let src = fs.readFileSync(f, 'utf8');
src = src.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
let changes = 0;

// Fix 1: Add contextmenu event prevention on canvas element after initialization
const marker = 'canvas.fireRightClick = true;\n      canvas.stopContextMenu = true;';
if (src.includes(marker)) {
  const newCode = marker + "\n\n      // Prevent browser context menu on canvas\n      const upperEl = canvas.upperCanvasEl || canvas.getElement();\n      if (upperEl) {\n        upperEl.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); });\n      }";
  src = src.replace(marker, newCode);
  changes++;
  console.log('[Fix 1] Added contextmenu prevention on canvas element');
} else {
  console.log('[Fix 1] SKIP - marker not found');
}

// Fix 2: Also add contextmenu prevention on the lower canvas
const marker2 = "const upperEl = canvas.upperCanvasEl || canvas.getElement();";
// Already added by Fix 1, now also handle wrapperRef
const wrapperMarker = "canvas.on('mouse:down', (opt: any) => {\n        if (opt.e && opt.e.button === 2) {";
if (src.includes(wrapperMarker)) {
  console.log('[Fix 2] Right-click handler exists');
} else {
  console.log('[Fix 2] SKIP - right-click handler not found');
}

// Fix 3: Ensure ctxMenu renders inside the canvas wrapper, not after shortcuts modal
// Find ctxMenu block
const ctxMenuStart = '              {ctxMenu && (';
const ctxMenuAlt = '      {ctxMenu && (';
let ctxFound = false;

const lines = src.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '{ctxMenu && (') {
    console.log('[Debug] ctxMenu block at line ' + (i+1));
    // Check if it's inside the shortcuts modal closure
    if (i > 0 && lines[i-1].trim() === ')}') {
      console.log('[Debug] ctxMenu is right after modal close - might be outside canvas wrapper');
    }
    ctxFound = true;
    break;
  }
}

// Fix 4: Add a console.log to debug right-click in browser
// Let's verify the issue by checking if wrapperRef.current is set
const debugMarker = "setCtxMenu({ x: opt.e.clientX - rect.left, y: opt.e.clientY - rect.top, target });";
if (src.includes(debugMarker)) {
  console.log('[Fix 4] setCtxMenu call exists at correct position');
}

// Fix 5: The canvas wrapper div needs to also prevent contextmenu
// Find the ref callback for wrapperRef
const wrapperRefCallback = '(wrapperRef as any).current = el;';
if (src.includes(wrapperRefCallback)) {
  if (!src.includes("el.addEventListener('contextmenu'")) {
    src = src.replace(
      wrapperRefCallback,
      wrapperRefCallback + "\n              el.addEventListener('contextmenu', (ev) => { ev.preventDefault(); });"
    );
    changes++;
    console.log('[Fix 5] Added contextmenu prevention on wrapper element');
  }
} else {
  console.log('[Fix 5] SKIP - wrapperRef callback not found');
}

src = src.replace(/\n/g, '\r\n');
fs.writeFileSync(f, src, 'utf8');
console.log('Total changes: ' + changes);
