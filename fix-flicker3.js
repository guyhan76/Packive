const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
const lines = fs.readFileSync(file, "utf8").split("\n");
let changes = 0;

// FIX 1: Add style={{ opacity: 0 }} to the canvas container div
// Find the className line with "flex-1 flex bg-gray-100"
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('flex-1 flex bg-gray-100 min-h-0 min-w-0 overflow-auto p-5 relative')) {
    // Check if next line already has style with opacity
    if (!lines[i+1].includes('opacity')) {
      // Insert style line right after className
      const indent = lines[i].match(/^\s*/)[0];
      lines.splice(i + 1, 0, indent + 'style={{ opacity: 0 }}');
      changes++;
      console.log(`[Fix 1] Added style={{ opacity: 0 }} after line ${i + 1}`);
    }
    break;
  }
}

// FIX 2: Show canvas (opacity: 1) after initialization
// Find "if (!didRestore) { addSafeZone(); }"
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('if (!didRestore)') && lines[i+1] && lines[i+1].includes('addSafeZone()')) {
    // Find the closing } of this if block
    let j = i + 2;
    while (j < lines.length && !lines[j].trim().startsWith('}')) j++;
    // Check if opacity:1 already exists nearby
    const nearbyCode = lines.slice(j, j + 10).join('\n');
    if (!nearbyCode.includes('opacity')) {
      const indent = '      ';
      lines.splice(j + 1, 0,
        indent + '// Show canvas after initialization',
        indent + 'requestAnimationFrame(() => {',
        indent + '  const wrapper = wrapperRef.current;',
        indent + '  if (wrapper) { wrapper.style.transition = "opacity 0.2s"; wrapper.style.opacity = "1"; }',
        indent + '});'
      );
      changes++;
      console.log(`[Fix 2] Added opacity:1 after line ${j + 1}`);
    }
    break;
  }
}

fs.writeFileSync(file, lines.join("\n"), "utf8");
console.log(`\nTotal changes: ${changes}`);
