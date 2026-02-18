const fs = require('fs');
const lines = fs.readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');

// Step 1: Add collapsible section state after panelSection
const eraserSizeIdx = lines.findIndex(l => l.includes('const [eraserSize, setEraserSize]'));
if (eraserSizeIdx === -1) { console.log('ERROR: eraserSize not found'); process.exit(1); }
// Check if already added
if (!lines.some(l => l.includes('openSection'))) {
  lines.splice(eraserSizeIdx + 1, 0, '  const [openSection, setOpenSection] = useState<string>(\"add\");');
  console.log('1. Added openSection state');
} else {
  console.log('1. openSection state already exists');
}

// Step 2: Replace aside block (line 2237 to 3384, adjusted for inserted line)
// Find aside start and end again after insertion
let asideStartIdx = lines.findIndex(l => l.includes('w-[140px] bg-white border-r flex flex-col items-center'));
if (asideStartIdx === -1) {
  asideStartIdx = lines.findIndex(l => l.includes('w-[160px] bg-white border-r flex flex-col'));
}
if (asideStartIdx === -1) { console.log('ERROR: aside start not found'); process.exit(1); }

let asideEndIdx = -1;
for (let i = asideStartIdx + 1; i < lines.length; i++) {
  if (lines[i].trim() === '</aside>' && i > asideStartIdx + 100) {
    asideEndIdx = i;
    break;
  }
}
if (asideEndIdx === -1) { console.log('ERROR: aside end not found'); process.exit(1); }

console.log('Aside: line ' + (asideStartIdx+1) + ' to ' + (asideEndIdx+1));

// Extract all the handler code blocks we need to preserve
// We'll reference them by extracting from the backup
const oldLines = lines.slice(asideStartIdx, asideEndIdx + 1);
const oldCode = oldLines.join('\n');

// Save backup
fs.writeFileSync('aside-backup-full.txt', oldCode, 'utf8');

// Build new aside - keeping ALL onClick handlers intact
// We use a helper: SectionHeader component inline
const S = '        '; // 8 spaces base indent
const S2 = S + '  '; // 10 spaces
const S3 = S2 + '  '; // 12 spaces
const S4 = S3 + '  '; // 14 spaces

const newPanel = [];
newPanel.push(S + '<aside className=\"w-[160px] bg-white border-r flex flex-col shrink-0 overflow-y-auto\">');

// ===== ADD SECTION =====
newPanel.push(S2 + '{/* ── Add Objects ── */}');
newPanel.push(S2 + '<button onClick={() => setOpenSection(openSection === \"add\" ? \"\" : \"add\")} className=\"flex items-center justify-between w-full px-3 py-2 text-[10px] font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border-b\">');
newPanel.push(S3 + '<span>\\u270E Add</span><span>{openSection === \"add\" ? \"\\u25B2\" : \"\\u25BC\"}</span>');
newPanel.push(S2 + '</button>');
newPanel.push(S2 + '{openSection === \"add\" && (');
newPanel.push(S3 + '<div className=\"p-2 border-b border-gray-100\">');

// Text row
newPanel.push(S4 + '<p className=\"text-[8px] text-gray-400 mb-1\">Text</p>');
newPanel.push(S4 + '<div className=\"grid grid-cols-3 gap-1 mb-2\">');
newPanel.push(S4 + '  <ToolButton label=\"Text\" icon=\"T\" onClick={addText} />');

// Curved - extract the onClick from old code
const curvedOnClickStart = oldCode.indexOf('label=\"Curved\" icon=\"\\u2312\" onClick={async () => {');
// Too complex to extract. Instead, keep the ToolButton approach but reference callbacks
// We'll extract Curved and PathText into standalone callbacks

newPanel.push(S4 + '  <ToolButton label=\"Curved\" icon=\"\\u2312\" onClick={async () => {');
newPanel.push(S4 + '    const c = fcRef.current; if (!c) return;');
newPanel.push(S4 + '    const text = prompt(\"Enter curved text:\", \"CURVED TEXT\") || \"CURVED TEXT\";');
newPanel.push(S4 + '    const radius = +(prompt(\"Radius (50-300):\", \"120\") || \"120\");');
newPanel.push(S4 + '    const { Group, FabricText } = await import(\"fabric\");');
newPanel.push(S4 + '    const chars: any[] = []; const totalAngle = text.length * 12; const startAngle = -90 - totalAngle / 2;');
newPanel.push(S4 + '    for (let i = 0; i < text.length; i++) { const angle = startAngle + i * 12; const rad = (angle * Math.PI) / 180; chars.push(new FabricText(text[i], { left: radius * Math.cos(rad), top: radius * Math.sin(rad), fontSize: fSize, fill: color, fontFamily: selectedFont, originX: \"center\", originY: \"center\", angle: angle + 90 })); }');
newPanel.push(S4 + '    const grp = new Group(chars, { left: c.width/2, top: c.height/2, originX: \"center\", originY: \"center\" }); c.add(grp); c.setActiveObject(grp); c.renderAll(); refreshLayers();');
newPanel.push(S4 + '  }} />');

newPanel.push(S4 + '  <ToolButton label=\"Path\" icon=\"\\u301C\" onClick={async () => {');
newPanel.push(S4 + '    const c = fcRef.current; if (!c) return;');
newPanel.push(S4 + '    const text = prompt(\"Enter text for path:\", \"Hello Path Text\") || \"Hello Path Text\";');
newPanel.push(S4 + '    const pathType = prompt(\"Path type: 1=Wave 2=ArcTop 3=ArcBottom 4=S-Curve 5=Custom\", \"1\") || \"1\";');
newPanel.push(S4 + '    const { FabricText, Path } = await import(\"fabric\"); const cw = c.getWidth(); const ch = c.getHeight(); let pathStr = \"\";');
newPanel.push(S4 + '    if (pathType === \"1\") { pathStr = \"M 0 0 Q \" + (cw*0.25) + \" \" + (-ch*0.15) + \" \" + (cw*0.5) + \" 0 Q \" + (cw*0.75) + \" \" + (ch*0.15) + \" \" + cw + \" 0\"; }');
newPanel.push(S4 + '    else if (pathType === \"2\") { pathStr = \"M 0 \" + (ch*0.2) + \" Q \" + (cw*0.5) + \" \" + (-ch*0.2) + \" \" + cw + \" \" + (ch*0.2); }');
newPanel.push(S4 + '    else if (pathType === \"3\") { pathStr = \"M 0 0 Q \" + (cw*0.5) + \" \" + (ch*0.4) + \" \" + cw + \" 0\"; }');
newPanel.push(S4 + '    else if (pathType === \"4\") { pathStr = \"M 0 \" + (ch*0.1) + \" C \" + (cw*0.33) + \" \" + (-ch*0.15) + \" \" + (cw*0.66) + \" \" + (ch*0.35) + \" \" + cw + \" \" + (ch*0.1); }');
newPanel.push(S4 + '    else if (pathType === \"5\") { pathStr = prompt(\"Enter SVG path:\", \"M 0 0 Q 150 -50 300 0\") || \"M 0 0 Q 150 -50 300 0\"; }');
newPanel.push(S4 + '    else { pathStr = \"M 0 0 Q \" + (cw*0.25) + \" \" + (-ch*0.15) + \" \" + (cw*0.5) + \" 0 Q \" + (cw*0.75) + \" \" + (ch*0.15) + \" \" + cw + \" 0\"; }');
newPanel.push(S4 + '    const pathObj = new Path(pathStr, { fill: \"\", stroke: \"\", visible: false });');
newPanel.push(S4 + '    const pathText = new FabricText(text, { left: cw/2, top: ch/2, fontSize: fSize, fill: color, fontFamily: selectedFont, originX: \"center\", originY: \"center\", path: pathObj });');
newPanel.push(S4 + '    c.add(pathText); c.setActiveObject(pathText); c.renderAll(); refreshLayers();');
newPanel.push(S4 + '  }} />');
newPanel.push(S4 + '</div>');

// Shape dropdown
newPanel.push(S4 + '<p className=\"text-[8px] text-gray-400 mb-1\">Shape</p>');
// Extract shape select from old code
const shapeSelectStart = oldCode.indexOf('<select');
const shapeSelectEnd = oldCode.indexOf('</select>', shapeSelectStart) + '</select>'.length;
// Find the closing divs after select
let shapeBlock = oldCode.substring(shapeSelectStart, shapeSelectEnd);
// Fix indentation
newPanel.push(S4 + shapeBlock.split('\\n').join('\\n' + S4));

// Image row
newPanel.push(S4 + '<p className=\"text-[8px] text-gray-400 mt-2 mb-1\">Image & Code</p>');
newPanel.push(S4 + '<div className=\"grid grid-cols-2 gap-1\">');
newPanel.push(S4 + '  <ToolButton label=\"Image\" icon=\"\\uD83D\\uDDBC\" onClick={uploadImage} />');
newPanel.push(S4 + '  <ToolButton label=\"Paste\" icon=\"\\uD83D\\uDCCB\" onClick={async () => {');

console.log('Script is getting too large for this approach.');
console.log('Switching to a simpler strategy: wrap existing sections with collapsible headers.');
console.log('');
console.log('New approach: Keep existing code structure but add section wrappers.');

process.exit(0);
