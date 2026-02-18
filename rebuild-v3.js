const fs = require('fs');
var file = 'src/components/editor/panel-editor.tsx';
var lines = fs.readFileSync(file, 'utf8').split('\n');
var backup = fs.readFileSync('aside-full-backup.txt', 'utf8').split('\n');

// Find current aside
var as2 = -1, ae2 = -1, d2 = 0;
for (var i = 0; i < lines.length; i++) {
  if (as2 === -1 && lines[i].includes('<aside') && (lines[i].includes('w-[220px]') || lines[i].includes('w-[200px]'))) as2 = i;
  if (as2 !== -1 && ae2 === -1) {
    d2 += (lines[i].match(/<aside/g) || []).length;
    d2 -= (lines[i].match(/<\/aside>/g) || []).length;
    if (d2 <= 0) { ae2 = i; break; }
  }
}
console.log('Removing current aside: ' + (as2+1) + '-' + (ae2+1));

// Restore backup exactly as-is first
lines.splice(as2, ae2 - as2 + 1, ...backup);
fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Step 1: Restored original backup (' + backup.length + ' lines)');

// Now re-read and make minimal changes:
// 1. Change aside width to 220px
// 2. Add tab bar at top of aside
// 3. Wrap each section in panelTab conditional
// 4. Replace openSection with always-open (remove toggles)

var code = fs.readFileSync(file, 'utf8');
var T = String.fromCharCode(96);
var D = String.fromCharCode(36);

// 1. Width
code = code.replace('w-[200px] bg-white border-r flex flex-col shrink-0 overflow-y-auto', 'w-[220px] bg-white border-r flex flex-col shrink-0');

// 2. Add tab bar right after <aside>
var tabBar = '<aside className="w-[220px] bg-white border-r flex flex-col shrink-0">' +
  '\\n          <div className="flex border-b bg-gray-50 shrink-0">' +
  '\\n            {["Add","Style","Tools","Arrange"].map(t => (' +
  '\\n              <button key={t} onClick={() => setPanelTab(t.toLowerCase())}' +
  '\\n                className={' + T + 'flex-1 py-2 text-center text-[10px] font-medium ' + D + '{panelTab === t.toLowerCase() ? "bg-white text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}' + T + '}>' +
  '\\n                {t}' +
  '\\n              </button>' +
  '\\n            ))}' +
  '\\n          </div>' +
  '\\n          <div className="flex-1 overflow-y-auto">';

// This is getting complex with string replacement. Let me use line-based approach instead.
console.log('Step 2: Proceeding with line-based modifications...');

// Re-read as lines
lines = fs.readFileSync(file, 'utf8').split('\n');

// Find restored aside
as2 = -1; ae2 = -1; d2 = 0;
for (var i = 0; i < lines.length; i++) {
  if (as2 === -1 && lines[i].includes('<aside')) as2 = i;
  if (as2 !== -1 && ae2 === -1) {
    d2 += (lines[i].match(/<aside/g) || []).length;
    d2 -= (lines[i].match(/<\/aside>/g) || []).length;
    if (d2 <= 0) { ae2 = i; break; }
  }
}

// Find section positions (absolute line numbers)
var addPos = -1, imagePos = -1, colorPos = -1, propsPos = -1, toolsPos = -1;
for (var i = as2; i <= ae2; i++) {
  if (lines[i].includes('Add Objects') && addPos === -1) addPos = i;
  if (lines[i].includes('Image & Code') && imagePos === -1) imagePos = i;
  if (lines[i].includes('setOpenSection') && lines[i].includes('color') && colorPos === -1) colorPos = i;
  if (lines[i].includes('setOpenSection') && lines[i].includes('props') && propsPos === -1) propsPos = i;
}
// Find tools: after props, look for Clone
for (var i = propsPos + 1; i <= ae2; i++) {
  if (lines[i].includes('border-b border-gray-100') && lines[i].includes('<div') && i > propsPos + 50) {
    toolsPos = i;
    break;
  }
}

console.log('Sections: ADD=' + addPos + ' IMAGE=' + imagePos + ' COLOR=' + colorPos + ' PROPS=' + propsPos + ' TOOLS=' + toolsPos + ' END=' + ae2);

// Find the <div> that wraps ADD section (the one right after <aside>)
// It should be the first <div with border-b after aside
var addDivStart = -1;
for (var i = as2 + 1; i < imagePos; i++) {
  if (lines[i].includes('border-b border-gray-100') && lines[i].includes('<div') && addDivStart === -1) {
    addDivStart = i;
    break;
  }
}

// Strategy: Insert markers, then wrap
// Instead of complex parsing, just:
// 1. Replace <aside> line with <aside> + tab bar
// 2. Before ADD div, insert {panelTab === "add" && (<>
// 3. Before COLOR section, insert </>)} + {panelTab === "style" && (<>
// 4. Before TOOLS section, insert </>)} + {panelTab === "tools" && (<>  
// 5. Before </aside>, insert </>)}
// 6. Fix openSection to always show (remove toggles)

// Also fix COLOR and PROPS to always be open
// Replace openSection toggles with simple headers
if (colorPos !== -1) {
  lines[colorPos] = '            <p className="text-[10px] font-bold text-gray-500 mb-1 mt-2">Color & Background</p>';
  // Find the conditional line
  for (var i = colorPos; i < colorPos + 3; i++) {
    if (lines[i].includes('openSection === "color"') && lines[i].includes('&&')) {
      lines[i] = '            <div className="px-2 pb-2">';
      break;
    }
  }
}
if (propsPos !== -1) {
  lines[propsPos] = '            <p className="text-[10px] font-bold text-gray-500 mb-1 mt-2">Properties</p>';
  for (var i = propsPos; i < propsPos + 3; i++) {
    if (lines[i].includes('openSection === "props"') && lines[i].includes('&&')) {
      lines[i] = '            <div className="px-2 pb-2">';
      break;
    }
  }
}

// Remove </div>} (closing of openSection conditionals)
// These are at specific positions - find them
for (var i = as2; i <= ae2; i++) {
  if (lines[i].trim() === '</div>}') {
    lines[i] = '            </div>';
  }
}

// Now insert tab wrappers
// Work backwards to preserve line numbers

// Before </aside> (ae2): insert </>)} and </div> for overflow wrapper
lines.splice(ae2, 0, '          </>)}', '          </div>');

// Before TOOLS section: insert </>)}{panelTab === "tools" && (<>
if (toolsPos !== -1) {
  lines.splice(toolsPos, 0, '          </>)}', '          {panelTab === "tools" && (<>');
}

// Before COLOR section (colorPos - 1 is the comment line): insert </>)}{panelTab === "style" && (<>
// Find the {/* COLOR */} comment
var colorCommentPos = -1;
for (var i = colorPos - 3; i <= colorPos; i++) {
  if (i >= 0 && lines[i].includes('COLOR')) { colorCommentPos = i; break; }
}
if (colorCommentPos === -1) colorCommentPos = colorPos - 1;
lines.splice(colorCommentPos, 0, '          </>)}', '          {panelTab === "style" && (<>');

// Before ADD section: insert {panelTab === "add" && (<> after tab bar
// Replace the <aside> line
lines[as2] = '        <aside className="w-[220px] bg-white border-r flex flex-col shrink-0">';

// Insert tab bar and opening wrapper right after <aside>
var tabLines = [
  '          <div className="flex border-b bg-gray-50 shrink-0">',
  '            {["Add","Style","Tools","Arrange"].map(t => (',
  '              <button key={t} onClick={() => setPanelTab(t.toLowerCase())}',
  '                className={' + T + 'flex-1 py-2 text-center text-[10px] font-medium ' + D + '{panelTab === t.toLowerCase() ? "bg-white text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}' + T + '}>',
  '                {t}',
  '              </button>',
  '            ))}',
  '          </div>',
  '          <div className="flex-1 overflow-y-auto">',
  '          {panelTab === "add" && (<>'
];
lines.splice(as2 + 1, 0, ...tabLines);

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('SUCCESS! Tab-based aside with original content preserved.');
console.log('Tabs: Add (text+shapes+image+code), Style (color+props), Tools, Arrange');
