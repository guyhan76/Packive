import { readFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.includes("IText(") || l.includes("Textbox(")) {
    const m = l.match(/(?:IText|Textbox)\(['"]([^'"]+)['"]/);
    if (m && m[1]) {
      const txt = m[1];
      // Check for broken Korean chars mixed with English
      if (/[a-zA-Z][가-힣]|[가-힣][a-zA-Z]/.test(txt) && !/Noto|Gothic|Myeongjo|Hyeon|Gamja|Flower|Melody|Myung|Sunflower|Gaegu|Stylish/.test(txt)) {
        console.log('Line ' + (i+1) + ': "' + txt + '"');
      }
    }
  }
}
console.log('--- Search complete ---');
