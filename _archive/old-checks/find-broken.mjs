import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');

let fixed = 0;
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.includes("IText(") && (l.includes('?') || /[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(l) || /[가-힣]{1}[^\s'",)}]/.test(l))) {
    // Check for broken patterns like "?뗥" or "?쩟" etc
    if (/\?\s*[가-힣]/.test(l) || /[가-힣]\s*[가-힣]\s*[가-힣]/.test(l)) {
      console.log('Line ' + (i+1) + ': ' + l.trim().substring(0, 100));
      fixed++;
    }
  }
}
if (fixed === 0) console.log('No broken IText lines found with simple check.');

// Also search for common broken emoji patterns
let broken = [];
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.includes("IText('") || l.includes('IText("')) {
    // Extract the text content between quotes
    const m = l.match(/IText\(['"]([^'"]*)['"]/);
    if (m && m[1]) {
      const txt = m[1];
      if (txt.includes('?') && txt.length <= 10) {
        broken.push({ line: i+1, text: txt, full: l.trim().substring(0, 120) });
      }
    }
  }
}
broken.forEach(b => console.log('Line ' + b.line + ' text="' + b.text + '": ' + b.full));
console.log('Total broken: ' + broken.length);
