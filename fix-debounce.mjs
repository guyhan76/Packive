import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');
let done = 0;

// 1. Replace pushHistory with debounced version
const oldPush = "const pushHistory = () => {\n        if (loadingRef.current) return;\n        const json = JSON.stringify(canvas.toJSON());\n        if (json === historyRef.current[historyIdxRef.current]) { console.log(\"PUSH skipped: same\"); return; }";

const newPush = "let pushTimer: any = null;\n      const pushHistory = () => {\n        if (loadingRef.current) return;\n        if (pushTimer) clearTimeout(pushTimer);\n        pushTimer = setTimeout(() => {\n          const json = JSON.stringify(canvas.toJSON());\n          if (json === historyRef.current[historyIdxRef.current]) return;";

if (code.includes(oldPush)) {
  code = code.replace(oldPush, newPush);
  done++;
  console.log('1. Added debounce to pushHistory');
}

// 2. Fix the closing of pushHistory - add extra } for setTimeout
const oldPushEnd = "historyIdxRef.current = historyRef.current.length - 1;\n        console.log(\"PUSH idx=\" + historyIdxRef.current + \" len=\" + historyRef.current.length);\n      };";

const newPushEnd = "historyIdxRef.current = historyRef.current.length - 1;\n        }, 300);\n      };";

if (code.includes(oldPushEnd)) {
  code = code.replace(oldPushEnd, newPushEnd);
  done++;
  console.log('2. Fixed pushHistory closing with debounce');
}

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Changes: ' + done);
