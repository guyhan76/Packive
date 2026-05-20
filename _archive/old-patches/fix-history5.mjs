import { readFileSync, writeFileSync } from "fs";
const file = "src/components/editor/panel-editor.tsx";
let code = readFileSync(file, "utf8");
let changes = 0;

// Fix the thumbnail generation logic
const oldThumb = `try {
          const thumbData = canvas.toDataURL({ format: 'png', multiplier: 0.15, quality: 0.5 });
          const now = new Date();
          const timeStr = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0') + ':' + now.getSeconds().toString().padStart(2,'0');
          setHistoryThumbs(prev => {
            const next = prev.slice(0, historyIdxRef.current);
            next.push({ idx: historyIdxRef.current, thumb: thumbData, time: timeStr });
            if (next.length > 50) next.shift();
            return next;
          });
          setHistoryIdx(historyIdxRef.current);
        } catch(e) { console.error('History thumb error:', e); }`;

const newThumb = `try {
          const thumbData = canvas.toDataURL({ format: 'png', multiplier: 0.15, quality: 0.5 });
          const now = new Date();
          const timeStr = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0') + ':' + now.getSeconds().toString().padStart(2,'0');
          const currentIdx = historyIdxRef.current;
          setHistoryThumbs(() => {
            const arr: {idx:number;thumb:string;time:string}[] = [];
            for (let ti = 0; ti <= currentIdx; ti++) {
              arr.push({ idx: ti, thumb: ti === currentIdx ? thumbData : (arr[ti]?.thumb || thumbData), time: ti === currentIdx ? timeStr : (arr[ti]?.time || timeStr) });
            }
            return arr;
          });
          setHistoryIdx(currentIdx);
        } catch(e) { console.error('History thumb error:', e); }`;

if (code.includes(oldThumb)) {
  code = code.replace(oldThumb, newThumb);
  changes++;
  console.log("1. Fixed thumbnail logic - but still loses old thumbs");
}

// Actually better approach: keep previous thumbs, just append/trim
if (changes > 0) {
  // Undo and redo with better logic
  code = code.replace(newThumb, `try {
          const thumbData = canvas.toDataURL({ format: 'png', multiplier: 0.15, quality: 0.5 });
          const now = new Date();
          const timeStr = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0') + ':' + now.getSeconds().toString().padStart(2,'0');
          const hIdx = historyIdxRef.current;
          setHistoryThumbs(prev => {
            // Trim future states (after undo+edit)
            const trimmed = prev.filter(p => p.idx < hIdx);
            trimmed.push({ idx: hIdx, thumb: thumbData, time: timeStr });
            // Keep max 50
            while (trimmed.length > 50) trimmed.shift();
            return trimmed;
          });
          setHistoryIdx(hIdx);
        } catch(e) { console.error('History thumb error:', e); }`);
  console.log("1b. Replaced with correct append logic");
}

if (changes > 0) {
  writeFileSync(file, code, "utf8");
  console.log(`\nDone! ${changes} changes applied.`);
} else {
  console.log("No changes made.");
}
