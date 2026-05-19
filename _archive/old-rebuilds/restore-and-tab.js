const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Find current aside boundaries
let asideStart = -1, asideEnd = -1, depth = 0;
for (let i = 0; i < lines.length; i++) {
  if (asideStart === -1 && lines[i].includes('<aside') && (lines[i].includes('w-[220px]') || lines[i].includes('w-[200px]'))) asideStart = i;
  if (asideStart !== -1 && asideEnd === -1) {
    depth += (lines[i].match(/<aside/g) || []).length;
    depth -= (lines[i].match(/<\/aside>/g) || []).length;
    if (depth <= 0) { asideEnd = i; break; }
  }
}
console.log('Current aside: lines ' + (asideStart+1) + '-' + (asideEnd+1));

// Read backup
if (!fs.existsSync('aside-full-backup.txt')) {
  console.log('ERROR: aside-full-backup.txt not found!');
  process.exit(1);
}
let backup = fs.readFileSync('aside-full-backup.txt', 'utf8').split('\n');
console.log('Backup: ' + backup.length + ' lines');

// Restore original aside first
lines.splice(asideStart, asideEnd - asideStart + 1, ...backup);
console.log('Restored original aside');

// Now find the restored aside boundaries
asideStart = -1; asideEnd = -1; depth = 0;
for (let i = 0; i < lines.length; i++) {
  if (asideStart === -1 && lines[i].includes('<aside') && (lines[i].includes('w-[200px]') || lines[i].includes('w-[220px]'))) asideStart = i;
  if (asideStart !== -1 && asideEnd === -1) {
    depth += (lines[i].match(/<aside/g) || []).length;
    depth -= (lines[i].match(/<\/aside>/g) || []).length;
    if (depth <= 0) { asideEnd = i; break; }
  }
}
console.log('Restored aside: lines ' + (asideStart+1) + '-' + (asideEnd+1));

// Find section boundaries inside restored aside
var rel = lines.slice(asideStart, asideEnd + 1);
var addStart = -1, imageStart = -1, colorStart = -1, propsStart = -1, toolsStart = -1;
for (let i = 0; i < rel.length; i++) {
  if (rel[i].includes('Add Objects') && addStart === -1) addStart = i;
  if (rel[i].includes('Image & Code') && imageStart === -1) imageStart = i;
  if (rel[i].includes('setOpenSection') && rel[i].includes('color') && colorStart === -1) colorStart = i;
  if (rel[i].includes('setOpenSection') && rel[i].includes('props') && propsStart === -1) propsStart = i;
  // Tools section: after props, look for Clone/Draw/Measure
  if (propsStart !== -1 && toolsStart === -1 && (rel[i].includes('Clone') || rel[i].includes('TOOLS'))) toolsStart = i;
}

// Find end of each section (next section start - header lines)
var addEnd = imageStart - 1;
var imageEnd = colorStart - 1;
var colorEnd = propsStart - 1;
var propsEnd = toolsStart !== -1 ? toolsStart - 1 : rel.length - 2;
var toolsEnd = rel.length - 2; // before </aside>

console.log('ADD: ' + addStart + '-' + addEnd);
console.log('IMAGE: ' + imageStart + '-' + imageEnd);
console.log('COLOR: ' + colorStart + '-' + colorEnd);
console.log('PROPS: ' + propsStart + '-' + propsEnd);
console.log('TOOLS: ' + toolsStart + '-' + toolsEnd);

// Extract section contents (inner content, skip section header div)
function getInner(arr, start, end) {
  var result = [];
  for (var i = start; i <= end && i < arr.length; i++) {
    result.push(arr[i]);
  }
  return result;
}

var addContent = getInner(rel, addStart, addEnd);
var imageContent = getInner(rel, imageStart, imageEnd);
var colorContent = getInner(rel, colorStart, colorEnd);
var propsContent = getInner(rel, propsStart, propsEnd);
var toolsContent = toolsStart !== -1 ? getInner(rel, toolsStart, toolsEnd) : [];

// Remove openSection references from color and props
colorContent = colorContent.filter(function(l) {
  return !l.includes('setOpenSection') && !l.includes('openSection ===');
});
propsContent = propsContent.filter(function(l) {
  return !l.includes('setOpenSection') && !l.includes('openSection ===');
});

// Build tick and dollar without escaping issues
var T = String.fromCharCode(96);
var D = String.fromCharCode(36);

// Build new aside
var na = [];
na.push('        <aside className="w-[220px] bg-white border-r flex flex-col shrink-0">');
na.push('          <div className="flex border-b bg-gray-50 shrink-0">');
na.push('            {[');
na.push('              { id: "add", label: "Add" },');
na.push('              { id: "style", label: "Style" },');
na.push('              { id: "tools", label: "Tools" },');
na.push('              { id: "arrange", label: "Arrange" },');
na.push('            ].map(tab => (');
na.push('              <button key={tab.id} onClick={() => setPanelTab(tab.id)}');
na.push('                className={' + T + 'flex-1 py-2 text-center text-[10px] font-medium transition-colors ' + D + '{panelTab === tab.id ? "bg-white text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}' + T + '}>');
na.push('                {tab.label}');
na.push('              </button>');
na.push('            ))}');
na.push('          </div>');
na.push('          <div className="flex-1 overflow-y-auto">');

// ADD TAB
na.push('          {panelTab === "add" && (<div className="p-2">');
addContent.forEach(function(l) { na.push(l); });
na.push('          <div className="mt-2">');
imageContent.forEach(function(l) { na.push(l); });
na.push('          </div>');
na.push('          </div>)}');

// STYLE TAB
na.push('          {panelTab === "style" && (<div className="p-2">');
colorContent.forEach(function(l) { na.push(l); });
na.push('          <hr className="my-2 border-gray-100" />');
propsContent.forEach(function(l) { na.push(l); });
na.push('          </div>)}');

// TOOLS TAB
na.push('          {panelTab === "tools" && (<div className="p-2">');
if (toolsContent.length > 0) {
  toolsContent.forEach(function(l) { na.push(l); });
}
na.push('          </div>)}');

// ARRANGE TAB
na.push('          {panelTab === "arrange" && (<div className="p-2 space-y-3">');
na.push('            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Position</p>');
na.push('            <div className="grid grid-cols-3 gap-1">');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + String.fromCharCode(63) + '.getActiveObject();if(o){o.set({left:0,originX:"left"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Left</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + String.fromCharCode(63) + '.getActiveObject();if(o' + String.fromCharCode(38) + String.fromCharCode(38) + 'c){o.set({left:c.getWidth()/2,originX:"center"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Center</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + String.fromCharCode(63) + '.getActiveObject();if(o' + String.fromCharCode(38) + String.fromCharCode(38) + 'c){o.set({left:c.getWidth(),originX:"right"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Right</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + String.fromCharCode(63) + '.getActiveObject();if(o){o.set({top:0,originY:"top"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Top</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + String.fromCharCode(63) + '.getActiveObject();if(o' + String.fromCharCode(38) + String.fromCharCode(38) + 'c){o.set({top:c.getHeight()/2,originY:"center"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Middle</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + String.fromCharCode(63) + '.getActiveObject();if(o' + String.fromCharCode(38) + String.fromCharCode(38) + 'c){o.set({top:c.getHeight(),originY:"bottom"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Bottom</button>');
na.push('            </div>');
na.push('            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1 mt-3">Layer</p>');
na.push('            <div className="grid grid-cols-2 gap-1">');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + String.fromCharCode(63) + '.getActiveObject();if(o' + String.fromCharCode(38) + String.fromCharCode(38) + 'c){c.bringObjectForward(o);c.renderAll();refreshLayers();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Forward</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + String.fromCharCode(63) + '.getActiveObject();if(o' + String.fromCharCode(38) + String.fromCharCode(38) + 'c){c.sendObjectBackwards(o);c.renderAll();refreshLayers();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Backward</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + String.fromCharCode(63) + '.getActiveObject();if(o' + String.fromCharCode(38) + String.fromCharCode(38) + 'c){c.bringObjectToFront(o);c.renderAll();refreshLayers();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">To Front</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + String.fromCharCode(63) + '.getActiveObject();if(o' + String.fromCharCode(38) + String.fromCharCode(38) + 'c){c.sendObjectToBack(o);c.renderAll();refreshLayers();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">To Back</button>');
na.push('            </div>');
na.push('          </div>)}');

na.push('          </div>');
na.push('        </aside>');

// Replace
lines.splice(asideStart, asideEnd - asideStart + 1, ...na);
fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('SUCCESS! New aside: ' + na.length + ' lines (was ' + (asideEnd - asideStart + 1) + ')');
