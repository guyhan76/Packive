const fs = require('fs');
const f = 'src/components/editor/panel-editor.tsx';
let src = fs.readFileSync(f, 'utf8');
src = src.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
let changes = 0;

// Fix 1: Add contextmenu prevention on the canvas wrapper
// Find the canvas fireRightClick setting or canvas initialization
const canvasInit = "canvas.on('mouse:down', (opt: any) => {\n        if (opt.e && opt.e.button === 2) {";
if (src.includes(canvasInit)) {
  // Add fireRightClick and stopContextMenu to canvas before the mouse:down handler
  const insertBefore = "// Right-click context menu\n      canvas.on('mouse:down', (opt: any) => {";
  if (src.includes(insertBefore)) {
    const canvasConfig = "// Enable right-click on canvas\n      canvas.fireRightClick = true;\n      canvas.stopContextMenu = true;\n\n      " + insertBefore;
    src = src.replace(insertBefore, canvasConfig);
    changes++;
    console.log('[Fix 1] Added fireRightClick and stopContextMenu to canvas');
  }
} else {
  console.log('[Fix 1] SKIP - canvas init pattern not found');
}

// Fix 2: Add onContextMenu handler to the canvas container div
// Find the wrapper div that contains the canvas
const wrapperPattern = 'className="relative flex-1 overflow-hidden bg-gray-100"';
if (src.includes(wrapperPattern)) {
  if (!src.includes('onContextMenu')) {
    src = src.replace(
      wrapperPattern,
      wrapperPattern + '\n          onContextMenu={(e) => e.preventDefault()}'
    );
    changes++;
    console.log('[Fix 2] Added onContextMenu preventDefault to canvas wrapper');
  }
} else {
  console.log('[Fix 2] SKIP - wrapper pattern not found');
}

// Fix 3: Check and translate remaining context menu items
const ctxLines = src.split('\n');
for (let i = 0; i < ctxLines.length; i++) {
  const line = ctxLines[i];
  if (line.includes('ctxMenu') && (line.includes('Lock') || line.includes('Unlock') || line.includes('Bring') || line.includes('Send'))) {
    console.log('[Debug] ctx line ' + (i+1) + ': ' + line.trim().substring(0, 80));
  }
}

src = src.replace(/\n/g, '\r\n');
fs.writeFileSync(f, src, 'utf8');
console.log('Total changes: ' + changes);
