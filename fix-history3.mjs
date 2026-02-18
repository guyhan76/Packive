import { readFileSync, writeFileSync } from "fs";
const file = "src/components/editor/panel-editor.tsx";
let code = readFileSync(file, "utf8");
let changes = 0;

// Replace the pushHistory timer that only saves JSON with one that also generates thumbnails
const oldPush = `pushTimer = setTimeout(() => {
          const json = JSON.stringify(canvas.toJSON());
          if (json === historyRef.current[historyIdxRef.current]) return;
          historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
          historyRef.current.push(json);
          if (historyRef.current.length > 50) historyRef.current.shift();
          historyIdxRef.current = historyRef.current.length - 1;
        }, 400);`;

const newPush = `pushTimer = setTimeout(() => {
          const json = JSON.stringify(canvas.toJSON());
          if (json === historyRef.current[historyIdxRef.current]) return;
          historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
          historyRef.current.push(json);
          if (historyRef.current.length > 50) historyRef.current.shift();
          historyIdxRef.current = historyRef.current.length - 1;
          // Generate thumbnail for history panel
          try {
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
          } catch(e) { console.error('History thumb error:', e); }
        }, 400);`;

if (code.includes(oldPush)) {
  code = code.replace(oldPush, newPush);
  changes++;
  console.log("1. Added thumbnail generation to pushHistory");
} else {
  console.log("ERROR: pushHistory pattern not found");
  // Debug
  const lines = code.split('\n');
  for (let i = 1015; i < 1030; i++) {
    console.log(`${i}: ${lines[i]}`);
  }
}

if (changes > 0) {
  writeFileSync(file, code, "utf8");
  console.log(`\nDone! ${changes} changes applied.`);
} else {
  console.log("No changes made.");
}
