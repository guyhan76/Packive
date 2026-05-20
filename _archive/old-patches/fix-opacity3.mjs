import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

// 1. Add opacity state
code = code.replace(
  'const [fSize, setFSize] = useState(24);',
  `const [fSize, setFSize] = useState(24);
  const [opacity, setOpacity] = useState(100);`
);

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! opacity state added.');
