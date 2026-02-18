import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");

// Replace the boot timing: add a ResizeObserver wait + retry logic
const oldBoot = `const boot = async () => {
      await new Promise(r => setTimeout(r, 150));
      if (disposed || !canvasElRef.current || !wrapperRef.current) return;`;

const newBoot = `const boot = async () => {
      // Wait for wrapper to have real dimensions (layout must complete)
      const waitForLayout = () => new Promise<void>(resolve => {
        const check = () => {
          if (disposed) { resolve(); return; }
          const w = wrapperRef.current;
          if (w && w.clientWidth > 100 && w.clientHeight > 100) { resolve(); return; }
          requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
      });
      await waitForLayout();
      // Extra safety delay for paint
      await new Promise(r => setTimeout(r, 100));
      if (disposed || !canvasElRef.current || !wrapperRef.current) return;`;

if (code.includes(oldBoot)) {
  code = code.replace(oldBoot, newBoot);
  writeFileSync(f, code, "utf8");
  console.log("Done! Fixed boot() to wait for wrapper layout");
} else {
  console.log("Pattern not found - checking...");
  // Try line-based approach
  const lines = code.split("\n");
  let found = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("const boot = async () => {")) {
      // Find the next line with setTimeout
      if (i + 1 < lines.length && lines[i+1].includes("await new Promise(r => setTimeout(r, 150))")) {
        // Replace these two lines plus the disposed check
        const replacement = [
          "    const boot = async () => {",
          "      // Wait for wrapper to have real dimensions (layout must complete)",
          "      const waitForLayout = () => new Promise<void>(resolve => {",
          "        const check = () => {",
          "          if (disposed) { resolve(); return; }",
          "          const w = wrapperRef.current;",
          "          if (w && w.clientWidth > 100 && w.clientHeight > 100) { resolve(); return; }",
          "          requestAnimationFrame(check);",
          "        };",
          "        requestAnimationFrame(check);",
          "      });",
          "      await waitForLayout();",
          "      await new Promise(r => setTimeout(r, 100));",
          "      if (disposed || !canvasElRef.current || !wrapperRef.current) return;",
        ];
        // Find the disposed check line
        let endIdx = i + 2;
        if (lines[endIdx] && lines[endIdx].includes("if (disposed || !canvasElRef")) {
          lines.splice(i, endIdx - i + 1, ...replacement);
        } else {
          lines.splice(i, 2, ...replacement);
        }
        found = true;
        break;
      }
    }
  }
  if (found) {
    writeFileSync(f, lines.join("\n"), "utf8");
    console.log("Done! Fixed boot() via line-based approach");
  } else {
    console.log("ERROR: Could not find boot() pattern");
  }
}
