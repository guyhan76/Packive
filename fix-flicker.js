const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// FIX: Hide canvas container during initialization
const marker1 = `await waitForLayout();
      await new Promise(r => setTimeout(r, 100));`;
if (code.includes(marker1)) {
  code = code.replace(marker1,
    `// Hide canvas until fully initialized
      if (wrapperRef.current) wrapperRef.current.style.opacity = "0";
      await waitForLayout();
      await new Promise(r => setTimeout(r, 100));`);
  changes++;
  console.log("[Fix 1] Hide canvas during init");
}

// Show canvas after initialization complete
const marker2 = `if (!didRestore) {
        addSafeZone();
      }`;
if (code.includes(marker2)) {
  code = code.replace(marker2,
    `if (!didRestore) {
        addSafeZone();
      }
      // Show canvas now that initialization is complete
      requestAnimationFrame(() => {
        if (wrapperRef.current) {
          wrapperRef.current.style.transition = "opacity 0.15s";
          wrapperRef.current.style.opacity = "1";
        }
      });`);
  changes++;
  console.log("[Fix 2] Show canvas after init");
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
