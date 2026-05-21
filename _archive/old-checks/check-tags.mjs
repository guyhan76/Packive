import { readFileSync } from 'fs';
const lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');

let depth = 0;
// Check lines 1564 (aside open) to 1830
for (let i = 1563; i < 1830; i++) {
  const l = lines[i];
  const opens = (l.match(/<(?:div|aside|select|button|optgroup)[^/]*>/g) || []).length;
  const closes = (l.match(/<\/(?:div|aside|select|button|optgroup)>/g) || []).length;
  const selfClose = (l.match(/\/>/g) || []).length;
  
  // Only track div and aside
  const divOpens = (l.match(/<div[^/]*>/g) || []).length;
  const divCloses = (l.match(/<\/div>/g) || []).length;
  const asideOpens = (l.match(/<aside[^/]*>/g) || []).length;
  const asideCloses = (l.match(/<\/aside>/g) || []).length;
  
  const net = divOpens + asideOpens - divCloses - asideCloses;
  depth += net;
  
  if (net !== 0 || l.trim().startsWith('</') || l.includes('<aside') || l.includes('<div')) {
    console.log('L' + (i+1) + ' depth=' + depth + ' net=' + net + ': ' + l.trim().substring(0, 80));
  }
}
console.log('Final depth at line 1830: ' + depth);
