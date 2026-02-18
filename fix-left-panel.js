const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');

// Find the left toolbar section
const startMarker = '{/* Left Toolbar */}';
const startIdx = code.indexOf(startMarker);
if (startIdx === -1) { console.log('ERROR: Left Toolbar marker not found'); process.exit(1); }

// Find the aside opening tag
const asideStart = code.indexOf('<aside', startIdx);
const asideTagEnd = code.indexOf('>', asideStart) + 1;

// Find the closing </aside> - count nested aside tags
let depth = 1;
let searchPos = asideTagEnd;
let asideEnd = -1;
while (depth > 0 && searchPos < code.length) {
  const nextOpen = code.indexOf('<aside', searchPos);
  const nextClose = code.indexOf('</aside>', searchPos);
  if (nextClose === -1) break;
  if (nextOpen !== -1 && nextOpen < nextClose) {
    depth++;
    searchPos = nextOpen + 6;
  } else {
    depth--;
    if (depth === 0) {
      asideEnd = nextClose + '</aside>'.length;
    }
    searchPos = nextClose + 8;
  }
}

if (asideEnd === -1) { console.log('ERROR: Could not find closing </aside>'); process.exit(1); }

// Extract the current aside content (between aside tags)
const currentContent = code.substring(asideTagEnd, asideEnd - '</aside>'.length);

// Now we need to find each section in currentContent and reorganize
// Instead of parsing, we'll build a new sidebar that references the same onClick handlers

// First, let's add a state for collapsed sections
// Find the leftToolbarSection state area
const stateInsertPoint = code.indexOf('const [eraserSize, setEraserSize]');
if (stateInsertPoint === -1) { console.log('ERROR: eraserSize state not found'); process.exit(1); }
const stateLineEnd = code.indexOf(';', stateInsertPoint) + 1;

const newState = '\n  const [panelSection, setPanelSection] = useState<string|null>(null);';
code = code.substring(0, stateLineEnd) + newState + code.substring(stateLineEnd);

// Now replace the aside content with reorganized layout
// We keep ALL the original functionality but wrap in collapsible sections
const newAside = '<aside className=\"w-[160px] bg-white border-r flex flex-col overflow-y-auto shrink-0 text-center\">' +
  '\n          {/* ── Add Objects ── */}' +
  '\n          <div className=\"border-b border-gray-100 p-2\">' +
  '\n            <p className=\"text-[9px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider\">Add</p>' +
  '\n            <div className=\"grid grid-cols-2 gap-1\">' +
  '\n              <button onClick={addText} className=\"flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition text-[9px] text-gray-600\"><span className=\"text-base\">T</span>Text</button>' +
  '\n              <button onClick={async () => { const c = fcRef.current; if (!c) return; const text = prompt(\"Enter curved text:\", \"CURVED TEXT\") || \"CURVED TEXT\"; const radius = +(prompt(\"Radius (50-300):\", \"120\") || \"120\"); const { Group, FabricText } = await import(\"fabric\"); const chars: any[] = []; const totalAngle = text.length * 12; const startAngle = -90 - totalAngle / 2; for (let i = 0; i < text.length; i++) { const angle = startAngle + i * 12; const rad = (angle * Math.PI) / 180; const x = radius * Math.cos(rad); const y = radius * Math.sin(rad); chars.push(new FabricText(text[i], { left: x, top: y, fontSize: fSize, fill: color, fontFamily: selectedFont, originX: \"center\", originY: \"center\", angle: angle + 90 })); } const grp = new Group(chars, { left: c.width/2, top: c.height/2, originX: \"center\", originY: \"center\" }); c.add(grp); c.setActiveObject(grp); c.renderAll(); refreshLayers(); }} className=\"flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition text-[9px] text-gray-600\"><span className=\"text-base\">\u2312</span>Curved</button>' +
  '\n            </div>' +
  '\n          </div>';

// This approach is getting too complex for inline replacement.
// Let's use a different strategy: wrap existing sections with collapsible headers

console.log('Aside found from char ' + asideStart + ' to ' + asideEnd);
console.log('Content length: ' + currentContent.length);
console.log('Strategy: Will create reorganized panel');

// Write current content to a temp file for reference
fs.writeFileSync('current-aside.txt', currentContent, 'utf8');
console.log('Saved current aside content to current-aside.txt');
console.log('Will build new panel in next step.');
