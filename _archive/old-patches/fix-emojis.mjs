import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

// Shape options
code = code.replace('>Rectangle</option>', '>▬ Rectangle</option>');
code = code.replace('>Rounded Rect</option>', '>▢ Rounded Rect</option>');
code = code.replace('>Circle</option>', '>● Circle</option>');
code = code.replace('>Ellipse</option>', '>⬮ Ellipse</option>');
code = code.replace('>Solid Line</option>', '>━ Solid Line</option>');
code = code.replace('>Dashed Line</option>', '>┅ Dashed Line</option>');
code = code.replace('>Dotted Line</option>', '>⋯ Dotted Line</option>');
code = code.replace('>Vertical Line</option>', '>┃ Vertical Line</option>');
code = code.replace('>Arrow Right</option>', '>→ Arrow Right</option>');
code = code.replace('>Arrow Left</option>', '>← Arrow Left</option>');
code = code.replace('>Arrow Both</option>', '>↔ Arrow Both</option>');
code = code.replace('>Triangle</option>', '>▲ Triangle</option>');
code = code.replace('>Right Triangle</option>', '>▶ Right Triangle</option>');
code = code.replace('>Left Triangle</option>', '>◀ Left Triangle</option>');
code = code.replace('>Pentagon</option>', '>⬠ Pentagon</option>');
code = code.replace('>Hexagon</option>', '>⬡ Hexagon</option>');
code = code.replace('>Octagon</option>', '>⯃ Octagon</option>');
code = code.replace('>Diamond</option>', '>◆ Diamond</option>');
code = code.replace('>Parallelogram</option>', '>▰ Parallelogram</option>');
code = code.replace('>Trapezoid</option>', '>⏢ Trapezoid</option>');
code = code.replace('>Star (5pt)</option>', '>★ Star (5pt)</option>');
code = code.replace('>Star (6pt)</option>', '>✡ Star (6pt)</option>');
code = code.replace('>Badge</option>', '>🏷 Badge</option>');
code = code.replace('>Heart</option>', '>♥ Heart</option>');
code = code.replace('>Cross</option>', '>✚ Cross</option>');
code = code.replace('>Arrow</option>', '>➤ Arrow</option>');
code = code.replace('>Chevron</option>', '>❯ Chevron</option>');
code = code.replace('>Ribbon</option>', '>🎀 Ribbon</option>');

// ToolButton icons
code = code.replace('icon={String.fromCodePoint(0x1F5BC)}', 'icon="🖼"');
code = code.replace('icon={String.fromCodePoint(0x2B06)}', 'icon="⬆"');
code = code.replace('icon={String.fromCodePoint(0x2B07)}', 'icon="⬇"');
code = code.replace('icon={String.fromCodePoint(0x1F5D1)}', 'icon="🗑"');

// Undo/Redo buttons
code = code.replace(/>Undo<\/button>/, '>↩</button>');
code = code.replace(/>Redo<\/button>/, '>↪</button>');

// Tab labels
code = code.replace("label: 'Templates'", "label: '🎨 Templates'");
code = code.replace("label: 'Copy'", "label: '📝 Copy'");

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! All emojis restored.');
