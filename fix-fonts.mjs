import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

code = code.replace(
  "{ name: 'Jua', family: 'Jua, sans-serif', category: 'Korean' },",
  `{ name: 'Jua', family: 'Jua, sans-serif', category: 'Korean' },
  { name: 'Nanum Gothic', family: "'Nanum Gothic', sans-serif", category: 'Korean' },
  { name: 'Nanum Myeongjo', family: "'Nanum Myeongjo', serif", category: 'Korean' },
  { name: 'Do Hyeon', family: "'Do Hyeon', sans-serif", category: 'Korean' },
  { name: 'Gamja Flower', family: "'Gamja Flower', cursive", category: 'Korean' },
  { name: 'Gothic A1', family: "'Gothic A1', sans-serif", category: 'Korean' },
  { name: 'Sunflower', family: "'Sunflower', sans-serif", category: 'Korean' },
  { name: 'Gaegu', family: "'Gaegu', cursive", category: 'Korean' },
  { name: 'Hi Melody', family: "'Hi Melody', cursive", category: 'Korean' },
  { name: 'Song Myung', family: "'Song Myung', serif", category: 'Korean' },
  { name: 'Stylish', family: "'Stylish', sans-serif", category: 'Korean' },`
);

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Korean fonts added.');
