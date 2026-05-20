import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');

const fixes = {
  155: { from: '?뙼', to: '\u{1F33F}' },       // leaf 
  280: { from: '?뙵', to: '\u{1F338}' },       // flower1 
  281: { from: '?뙷', to: '\u{1F33A}' },       // flower2 
  282: { from: '?뙴', to: '\u{1F337}' },       // flower3 
  317: { from: '?뜫', to: '\u{1F36C}' },       // candy1 
  318: { from: '?뜭', to: '\u{1F36D}' },       // candy2 
  382: { from: '?쪖', to: '\u{2728}' },        // icon 
  399: { from: '?맽', to: '\u{1F43E}' },       // paw 
  404: { from: '?릷 Vet Recommended', to: '\u{2705} Vet Recommended' }, // badge 
  421: { from: '?뙮', to: '\u{1F343}' },       // leaf 
  433: { from: '?뵦', to: '\u{1F525}' },       // fire 
  448: { from: '?뜷', to: '\u{1F36A}' },       // icon cookie 
  480: { from: '?뜱', to: '\u{1F382}' },       // icon cake 
  512: { from: '?뮙', to: '\u{1F4A5}' },       // burst 
  515: { from: '?뜪 Chocolate Blast!', to: '\u{1F36B} Chocolate Blast!' }, // chocolate 
  530: { from: '?쫨', to: '\u{1F431}' },       // icon cat 
  535: { from: '?맽', to: '\u{1F43E}' },       // paw 
  547: { from: '?릩', to: '\u{1F420}' },       // icon fish 
  564: { from: '?맻', to: '\u{1F43B}' },       // icon bear 
  568: { from: '?럨', to: '\u{1F340}' },       // leaf clover 
  579: { from: '?맩', to: '\u{1F436}' },       // icon dog 
  580: { from: '?맽', to: '\u{1F43E}' },       // paw1 
  581: { from: '?맽', to: '\u{1F43E}' },       // paw2 
  598: { from: '?릷', to: '\u{2705}' },        // icon 
  599: { from: '?\u252B', to: '\u{1F9B4}' },   // bone 
  600: { from: '?\u252B', to: '\u{1F9B4}' },   // bone2 
  604: { from: '?룇 Vet Approved', to: '\u{1F3C5} Vet Approved' }, // badge 
  615: { from: '?쫳', to: '\u{1F41D}' },       // b1 bee 
  616: { from: '?쫳', to: '\u{1F41D}' },       // b2 bee 
  617: { from: '?쫳', to: '\u{1F41D}' },       // b3 bee 
  618: { from: '?뙹', to: '\u{1F33B}' },       // flower sunflower 
  633: { from: '?쫲', to: '\u{1F41C}' },       // icon ant 
  634: { from: '?뙯', to: '\u{1F332}' },       // tree1 
  635: { from: '?뙯', to: '\u{1F332}' },       // tree2 
  640: { from: '?뛼', to: '\u{1F341}' },       // leaf maple 
  652: { from: '?맕', to: '\u{1F414}' },       // icon chicken 
  677: { from: '?룆 100% Pure', to: '\u{1F3C6} 100% Pure' }, // badge trophy 
  689: { from: '?쬅', to: '\u{1F422}' },       // icon turtle 
  690: { from: '?뙱', to: '\u{1F334}' },       // palm 
  691: { from: '?뙱', to: '\u{1F334}' },       // palm2 
};

let count = 0;
for (const [lineNum, fix] of Object.entries(fixes)) {
  const idx = parseInt(lineNum) - 1;
  if (lines[idx] && lines[idx].includes(fix.from)) {
    lines[idx] = lines[idx].replace(fix.from, fix.to);
    count++;
  } else {
    console.log('WARNING: Line ' + lineNum + ' not matched. Content: ' + (lines[idx] || '').substring(0, 80));
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Fixed ' + count + ' / ' + Object.keys(fixes).length + ' broken emojis.');
