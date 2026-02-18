import { readFileSync, writeFileSync } from "fs";
const file = "src/components/editor/panel-editor.tsx";
let code = readFileSync(file, "utf8");
let changes = 0;

// Fix 1: BG Pattern removal - forEach + remove skips items. Use filter + loop instead.
const oldRemove = `c.getObjects().forEach((o: any) => { if (o._isBgPattern) c.remove(o); });`;
const newRemove = `c.getObjects().filter((o: any) => o._isBgPattern).forEach((o: any) => c.remove(o));`;

if (code.includes(oldRemove)) {
  code = code.replace(oldRemove, newRemove);
  changes++;
  console.log("1. Fixed BG Pattern removal (filter then remove)");
}

// Fix 2: Also clear leftover pattern objects on canvas init / load
// Add cleanup in the bgPattern onChange: after removing, also do a second pass
const oldNoneCheck = `if (v === 'none') { c.renderAll(); return; }`;
const newNoneCheck = `if (v === 'none') {
                  // Double-pass cleanup to catch any stragglers
                  let remaining = c.getObjects().filter((o: any) => o._isBgPattern);
                  while (remaining.length > 0) { remaining.forEach((o: any) => c.remove(o)); remaining = c.getObjects().filter((o: any) => o._isBgPattern); }
                  c.renderAll(); return;
                }`;

if (code.includes(oldNoneCheck)) {
  code = code.replace(oldNoneCheck, newNoneCheck);
  changes++;
  console.log("2. Added thorough cleanup for BG Pattern None");
}

// Fix 3: The grid circle in the screenshot looks like it might be from the
// Eyedropper's canvas fallback or an old pattern. Let's also ensure pattern objects
// are cleaned up when switching between patterns (not just on 'none')
const oldPatternStart = `import('fabric').then(F => {
                  const cw = c.getWidth();
                  const ch = c.getHeight();
                  const gap = 20;`;
const newPatternStart = `import('fabric').then(F => {
                  // Extra cleanup pass before adding new pattern
                  let leftover = c.getObjects().filter((o: any) => o._isBgPattern);
                  while (leftover.length > 0) { leftover.forEach((o: any) => c.remove(o)); leftover = c.getObjects().filter((o: any) => o._isBgPattern); }
                  const cw = c.getWidth();
                  const ch = c.getHeight();
                  const gap = 20;`;

if (code.includes(oldPatternStart)) {
  code = code.replace(oldPatternStart, newPatternStart);
  changes++;
  console.log("3. Added cleanup pass before adding new pattern");
}

if (changes > 0) {
  writeFileSync(file, code, "utf8");
  console.log(`\nDone! ${changes} changes applied.`);
} else {
  console.log("No changes made.");
}
