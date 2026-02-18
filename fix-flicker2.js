const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// Add initial opacity:0 to canvas container via style
const oldClassName = 'className={`flex-1 flex bg-gray-100 min-h-0 min-w-0 overflow-auto p-5 relative ${zoom <= 100 ? "items-center justify-center" : "items-start justify-start"}`}';

if (code.includes(oldClassName)) {
  // Check if there's already a style after it
  const idx = code.indexOf(oldClassName);
  const after = code.substring(idx + oldClassName.length, idx + oldClassName.length + 100);
  
  // The style line should be right after
  if (after.includes('style={{ cursor:')) {
    // Replace existing style to add opacity: 0 initially
    const oldStyle = 'style={{ cursor: undefined }}';
    const newStyle = 'style={{ opacity: 0 }}';
    if (code.includes(oldStyle)) {
      code = code.replace(oldStyle, newStyle);
      changes++;
      console.log("[Fix 1] Set initial opacity: 0 on canvas container");
    }
  }
}

// Remove the duplicate "if (wrapperRef.current) wrapperRef.current.style.opacity = "0""
// since we now use CSS directly
const oldHide = `// Hide canvas until fully initialized
      if (wrapperRef.current) wrapperRef.current.style.opacity = "0";`;
if (code.includes(oldHide)) {
  code = code.replace(oldHide, "");
  changes++;
  console.log("[Fix 2] Removed JS opacity hide (now CSS)");
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
