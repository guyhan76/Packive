import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

// Remove duplicate opacity state (keep first one)
code = code.replace(
  `const [opacity, setOpacity] = useState(100);
  const [opacity, setOpacity] = useState(100);`,
  `const [opacity, setOpacity] = useState(100);`
);

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Duplicate removed.');
