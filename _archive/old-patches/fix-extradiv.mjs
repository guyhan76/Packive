import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');

// Find the </div> after UG button (the extra one)
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('title="Ungroup"') && lines[i].includes('UG</button>')) {
    // Next line should be the extra </div>
    if (lines[i+1] && lines[i+1].trim() === '</div>') {
      lines.splice(i+1, 1);
      console.log('Removed extra </div> at line ' + (i+2));
    }
    break;
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done!');
