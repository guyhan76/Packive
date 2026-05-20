import { readFileSync, writeFileSync } from "fs";
const file = "src/components/editor/panel-editor.tsx";
let code = readFileSync(file, "utf8");
let changes = 0;

// Fix 1: Remove duplicate Eyedropper button block
// The eyedropper button appears twice in sequence. Find the pattern where
// the first button's closing </button> + </div> + <hr> + BG Image div is followed
// by ANOTHER copy of the same button.

const duplicatePattern = `<button onClick={() => {<button onClick={async () => {`;
if (code.includes(duplicatePattern)) {
  // This means there's a broken merge: <button onClick={() => { immediately followed by <button onClick={async () => {
  // The first <button onClick={() => { is the start of the BG Image button
  // Find the exact broken section
  const idx = code.indexOf(duplicatePattern);
  
  // We need to find the second complete Eyedropper block that was accidentally inserted
  // The pattern is: ...first Eyedropper </button>\n</div>\n<hr>\n<BG Image div>\n<button onClick={() => {<button onClick={async...
  // We need to remove from "<button onClick={async" (the second copy) up to the second "</button>\n</div>\n<hr>"
  
  // Actually, the issue is simpler: the BG Image button's onClick={() => { was merged with a second Eyedropper block
  // We need to find the second eyedropper block and remove it, restoring the BG Image button

  // Let's find the second occurrence of the full Eyedropper button
  const eyedropperBtn = `<button onClick={async () => {
              const c = fcRef.current; if (!c) return;
              if ('EyeDropper' in window) {
                try {
                  const ed = new (window as any).EyeDropper();
                  const result = await ed.open();
                  if (result?.sRGBHex) { applyColor(result.sRGBHex); setColor(result.sRGBHex); }
                } catch {}
              } else {
                c.defaultCursor = 'crosshair';
                c.selection = false;
                const handler = (opt: any) => {
                  const ctx = (c as any).getContext('2d');
                  const pointer = c.getScenePoint(opt.e);
                  const pixel = ctx.getImageData(Math.round(pointer.x), Math.round(pointer.y), 1, 1).data;
                  const hex = '#' + [pixel[0],pixel[1],pixel[2]].map((v:number) => v.toString(16).padStart(2,'0')).join('');
                  applyColor(hex); setColor(hex);
                  c.defaultCursor = 'default';
                  c.selection = true;
                  c.off('mouse:down', handler);
                };
                c.on('mouse:down', handler);
              }
            }} className="w-full py-0.5 text-[8px] bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 mt-0.5 flex items-center justify-center gap-0.5" title="Eyedropper - sample a color point">
              🩸 Eyedropper
            </button>`;

  // Replace the broken merge: restore BG Image button start
  const brokenSection = `<button onClick={() => {` + eyedropperBtn + `
          </div>
          <hr className="w-28 border-gray-200" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-gray-400">BG Image</span>
            <button onClick={() => {`;
  
  if (code.includes(brokenSection)) {
    code = code.replace(brokenSection, `<button onClick={() => {`);
    changes++;
    console.log("1. Removed duplicate Eyedropper block and restored BG Image button");
  } else {
    // Fallback: line-based removal
    const lines = code.split('\n');
    let found = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('<button onClick={() => {<button onClick={async () => {')) {
        // Find the end of the duplicate block (look for the second "BG Image" span)
        let endIdx = -1;
        for (let j = i + 1; j < Math.min(i + 50, lines.length); j++) {
          if (lines[j].includes('<button onClick={() => {') && j > i) {
            endIdx = j;
            break;
          }
        }
        if (endIdx > 0) {
          // Replace line i with just '<button onClick={() => {'
          const indent = lines[i].match(/^(\s*)/)?.[1] || '';
          lines.splice(i, endIdx - i, indent + '            <button onClick={() => {');
          found = true;
          changes++;
          console.log("1. (fallback) Removed duplicate Eyedropper block");
          break;
        }
      }
    }
    if (!found) console.log("WARNING: Could not find duplicate pattern for removal");
    code = lines.join('\n');
  }
} else {
  console.log("No duplicate Eyedropper found - OK");
}

if (changes > 0) {
  writeFileSync(file, code, "utf8");
  console.log(`\nDone! ${changes} changes applied.`);
} else {
  console.log("\nNo changes needed.");
}
