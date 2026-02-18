import { readFileSync, writeFileSync } from "fs";
const file = "src/components/editor/panel-editor.tsx";
let code = readFileSync(file, "utf8");
let changes = 0;

// Add Path Text button after the Curved Text button
const curvedEnd = `c.add(grp);
            c.setActiveObject(grp);
            c.renderAll();
            refreshLayers();
          }} />`;

const pathTextBtn = `c.add(grp);
            c.setActiveObject(grp);
            c.renderAll();
            refreshLayers();
          }} />
          <ToolButton label="Path Text" icon="〰" onClick={async () => {
            const c = fcRef.current; if (!c) return;
            const text = prompt('Enter text for path:', 'Hello Path Text') || 'Hello Path Text';
            const pathType = prompt('Path type:\\n1 = Wave\\n2 = Arc (top)\\n3 = Arc (bottom)\\n4 = S-Curve\\n5 = Custom SVG path', '1') || '1';
            const { FabricText, Path } = await import('fabric');
            const cw = c.getWidth();
            const ch = c.getHeight();
            let pathStr = '';
            switch (pathType) {
              case '1': // Wave
                pathStr = \`M 0 0 Q \${cw*0.25} \${-ch*0.15} \${cw*0.5} 0 Q \${cw*0.75} \${ch*0.15} \${cw} 0\`;
                break;
              case '2': // Arc top
                pathStr = \`M 0 \${ch*0.2} Q \${cw*0.5} \${-ch*0.2} \${cw} \${ch*0.2}\`;
                break;
              case '3': // Arc bottom
                pathStr = \`M 0 0 Q \${cw*0.5} \${ch*0.4} \${cw} 0\`;
                break;
              case '4': // S-Curve
                pathStr = \`M 0 \${ch*0.1} C \${cw*0.33} \${-ch*0.15} \${cw*0.66} \${ch*0.35} \${cw} \${ch*0.1}\`;
                break;
              case '5': // Custom
                pathStr = prompt('Enter SVG path (e.g. M 0 0 Q 150 -50 300 0):', 'M 0 0 Q 150 -50 300 0') || 'M 0 0 Q 150 -50 300 0';
                break;
              default:
                pathStr = \`M 0 0 Q \${cw*0.25} \${-ch*0.15} \${cw*0.5} 0 Q \${cw*0.75} \${ch*0.15} \${cw} 0\`;
            }
            const pathObj = new Path(pathStr, {
              fill: '',
              stroke: '',
              visible: false,
            });
            const pathText = new FabricText(text, {
              left: cw / 2,
              top: ch / 2,
              fontSize: fSize,
              fill: color,
              fontFamily: selectedFont,
              originX: 'center',
              originY: 'center',
              path: pathObj,
            } as any);
            c.add(pathText);
            c.setActiveObject(pathText);
            c.renderAll();
            refreshLayers();
          }} />`;

if (code.includes(curvedEnd)) {
  code = code.replace(curvedEnd, pathTextBtn);
  changes++;
  console.log("1. Added Path Text button after Curved Text");
} else {
  console.log("ERROR: Curved Text end pattern not found");
  // Fallback: line search
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('c.add(grp);') && i + 3 < lines.length && lines[i+3].includes('}} />')) {
      const indent = '          ';
      const insertLines = pathTextBtn.split('\n').slice(4); // skip the first 4 lines (already there)
      lines.splice(i + 4, 0, ...insertLines.map(l => l));
      changes++;
      console.log("1. (fallback) Added Path Text button");
      break;
    }
  }
  code = lines.join('\n');
}

if (changes > 0) {
  writeFileSync(file, code, "utf8");
  console.log(\`\nDone! \${changes} changes applied.\`);
} else {
  console.log("No changes made.");
}
