import { readFileSync } from 'fs';
const lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');

let depth = 0;
for (let i = 1563; i < 1835; i++) {
  const l = lines[i];
  const divOpens = (l.match(/<div[^/]*>/g) || []).length;
  const divCloses = (l.match(/<\/div>/g) || []).length;
  const asideOpens = (l.match(/<aside[^/]*>/g) || []).length;
  const asideCloses = (l.match(/<\/aside>/g) || []).length;
  
  const net = divOpens + asideOpens - divCloses - asideCloses;
  depth += net;
  
  if (net !== 0) {
    console.log('L' + (i+1) + ' d=' + depth + ' n=' + net + ': ' + l.trim().substring(0, 90));
  }
}
console.log('Final depth: ' + depth);
