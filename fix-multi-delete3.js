const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// 1. Fix Delete/Backspace key handler (find by content)
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim().startsWith("if (e.key === 'Delete' || e.key === 'Backspace')")) {
    // Check next lines match the old pattern
    if (lines[i+1] && lines[i+1].trim().startsWith('const obj = canvas.getActiveObject()') &&
        lines[i+2] && lines[i+2].trim().startsWith('if (obj && obj.selectable !== false)') &&
        lines[i+3] && lines[i+3].trim().includes('canvas.remove(obj)')) {
      const indent = lines[i].match(/^(\s*)/)[1];
      const I = indent + '  ';
      const newLines = [
        `${indent}if (e.key === 'Delete' || e.key === 'Backspace') {`,
        `${I}const obj = canvas.getActiveObject();`,
        `${I}if (obj && obj.selectable !== false) {`,
        `${I}  if (obj.type === 'activeselection') {`,
        `${I}    const objs = (obj as any)._objects ? [...(obj as any)._objects] : [];`,
        `${I}    canvas.discardActiveObject();`,
        `${I}    objs.forEach((o: any) => { if (o.selectable !== false) canvas.remove(o); });`,
        `${I}  } else {`,
        `${I}    canvas.remove(obj); canvas.discardActiveObject();`,
        `${I}  }`,
        `${I}  canvas.renderAll(); refreshLayers();`,
        `${I}}`,
        `${indent}}`,
      ];
      // Find closing brace count
      let end = i + 3;
      while (end < lines.length && !lines[end].trim().startsWith('}')) end++;
      lines.splice(i, end - i + 1, ...newLines);
      changes++;
      console.log('[delete] Fixed Delete/Backspace at line ' + (i+1));
      break;
    }
  }
}

// 2. Fix del callback
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === 'const del = useCallback(() => {') {
    if (lines[i+2] && lines[i+2].trim().startsWith('const obj = c.getActiveObject()') &&
        lines[i+3] && lines[i+3].trim().includes('c.remove(obj)') && lines[i+3].trim().includes('c.discardActiveObject()')) {
      const indent = lines[i].match(/^(\s*)/)[1];
      const I = indent + '  ';
      const newLines = [
        `${indent}const del = useCallback(() => {`,
        `${I}const c = fcRef.current; if (!c) return;`,
        `${I}const obj = c.getActiveObject();`,
        `${I}if (obj && obj.selectable !== false) {`,
        `${I}  if (obj.type === 'activeselection') {`,
        `${I}    const objs = (obj as any)._objects ? [...(obj as any)._objects] : [];`,
        `${I}    c.discardActiveObject();`,
        `${I}    objs.forEach((o: any) => { if (o.selectable !== false) c.remove(o); });`,
        `${I}  } else {`,
        `${I}    c.remove(obj); c.discardActiveObject();`,
        `${I}  }`,
        `${I}  c.renderAll(); refreshLayers();`,
        `${I}}`,
        `${indent}}, []);`,
      ];
      // Count lines to replace: from 'const del' to '}, []);'
      let end = i + 1;
      while (end < lines.length && !lines[end].trim().startsWith('}, [])')) end++;
      lines.splice(i, end - i + 1, ...newLines);
      changes++;
      console.log('[del] Fixed del callback at line ' + (i+1));
      break;
    }
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Total changes: ' + changes);
