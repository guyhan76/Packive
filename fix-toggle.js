const fs = require('fs');
var file = 'src/components/editor/panel-editor.tsx';
var lines = fs.readFileSync(file, 'utf8').split('\n');
var changes = 0;

// 1. Add toggleSection function after openSections state
for (var i = 0; i < lines.length; i++) {
  if (lines[i].includes('openSections') && lines[i].includes('useState')) {
    lines.splice(i + 1, 0, '  const toggleSection = (id: string) => setOpenSections(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });');
    changes++;
    console.log('1. Added toggleSection function at line ' + (i + 2));
    break;
  }
}

// 2. Fix remaining openSection references (old variable name)
var code = lines.join('\n');

// Fix any remaining openSection (singular) references
code = code.replace(/openSection === "color" \? "▲" : "▼"/g, 'openSections.has("color") ? "\\u25B2" : "\\u25BC"');
code = code.replace(/openSection === "props" \? "▲" : "▼"/g, 'openSections.has("props") ? "\\u25B2" : "\\u25BC"');
console.log('2. Fixed remaining openSection arrow references');

fs.writeFileSync(file, code, 'utf8');
changes++;
console.log('Done! ' + changes + ' fixes applied.');
