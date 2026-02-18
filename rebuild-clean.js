const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';

// Read backup
var backup = fs.readFileSync('aside-full-backup.txt', 'utf8').split('\n');
console.log('Backup lines: ' + backup.length);

// Find each section's CONTENT (skip wrapper divs and headers)
// ADD section: lines 3-162, wrapped in <div p-2 border-b><p>Add Objects</p><div grid>...</div></div></div>
// IMAGE section: lines 163-322, wrapped in <div p-2 border-b><p>Image & Code</p><div grid>...</div></div>
// COLOR section: lines 323-513, has openSection toggle
// PROPS section: lines 514-964, has openSection toggle  
// TOOLS section: lines 965-1164

// Strategy: strip the outer <div border-b> wrapper and section headers from each section
function stripWrapper(arr) {
  var result = [];
  var i = 0;
  // Skip leading whitespace-only lines
  while (i < arr.length && arr[i].trim() === '') i++;
  // Skip <div with border-b
  if (i < arr.length && arr[i].includes('border-b')) i++;
  // Skip <p header
  while (i < arr.length && arr[i].includes('text-[10px] font-bold text-gray-500')) { i++; }
  // Skip grid wrapper opening
  if (i < arr.length && arr[i].includes('grid grid-cols')) i++;
  
  // Take content until last closing divs
  var end = arr.length - 1;
  // Skip trailing </div> tags
  while (end > i && arr[end].trim() === '</div>') end--;
  // Also skip </div></div> on same line
  
  for (var j = i; j <= end; j++) {
    result.push(arr[j]);
  }
  return result;
}

function stripColorProps(arr) {
  // Remove openSection toggle and conditional wrapper
  var result = [];
  for (var i = 0; i < arr.length; i++) {
    var line = arr[i];
    if (line.includes('setOpenSection')) continue;
    if (line.includes('openSection ===') && line.includes('&&')) continue;
    if (line.trim() === '</div>}') continue;
    if (line.includes('border-b border-gray-100') && line.includes('<div')) continue;
    result.push(line);
  }
  return result;
}

var addRaw = backup.slice(3, 163);
var imageRaw = backup.slice(163, 323);
var colorRaw = backup.slice(323, 514);
var propsRaw = backup.slice(514, 965);
var toolsRaw = backup.slice(965, 1165);

var colorClean = stripColorProps(colorRaw);
var propsClean = stripColorProps(propsRaw);

// Build tick and dollar
var T = String.fromCharCode(96);
var D = String.fromCharCode(36);
var Q = String.fromCharCode(63);
var A = String.fromCharCode(38);

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

// ADD TAB = add + image content (both in original wrapper divs)
na.push('          {panelTab === "add" && (');
na.push('          <div className="p-2 space-y-3">');
// Keep original ADD and IMAGE sections with their own internal structure
addRaw.forEach(function(l) { na.push(l); });
imageRaw.forEach(function(l) { na.push(l); });
na.push('          </div>');
na.push('          )}');

// STYLE TAB = color + props content
na.push('          {panelTab === "style" && (');
na.push('          <div className="p-2 space-y-2">');
colorClean.forEach(function(l) { na.push(l); });
na.push('          <hr className="my-2 border-gray-100" />');
propsClean.forEach(function(l) { na.push(l); });
na.push('          </div>');
na.push('          )}');

// TOOLS TAB
na.push('          {panelTab === "tools" && (');
na.push('          <div className="p-2 space-y-2">');
toolsRaw.forEach(function(l) { na.push(l); });
na.push('          </div>');
na.push('          )}');

// ARRANGE TAB
na.push('          {panelTab === "arrange" && (');
na.push('          <div className="p-2 space-y-3">');
na.push('            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Position</p>');
na.push('            <div className="grid grid-cols-3 gap-1">');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + Q + '.getActiveObject();if(o){o.set({left:0,originX:"left"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Left</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + Q + '.getActiveObject();if(o' + A + A + 'c){o.set({left:c.getWidth()/2,originX:"center"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Center</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + Q + '.getActiveObject();if(o' + A + A + 'c){o.set({left:c.getWidth(),originX:"right"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Right</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + Q + '.getActiveObject();if(o){o.set({top:0,originY:"top"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Top</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + Q + '.getActiveObject();if(o' + A + A + 'c){o.set({top:c.getHeight()/2,originY:"center"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Middle</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + Q + '.getActiveObject();if(o' + A + A + 'c){o.set({top:c.getHeight(),originY:"bottom"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Bottom</button>');
na.push('            </div>');
na.push('            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1 mt-3">Layer</p>');
na.push('            <div className="grid grid-cols-2 gap-1">');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + Q + '.getActiveObject();if(o' + A + A + 'c){c.bringObjectForward(o);c.renderAll();refreshLayers();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Forward</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + Q + '.getActiveObject();if(o' + A + A + 'c){c.sendObjectBackwards(o);c.renderAll();refreshLayers();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Backward</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + Q + '.getActiveObject();if(o' + A + A + 'c){c.bringObjectToFront(o);c.renderAll();refreshLayers();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">To Front</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + Q + '.getActiveObject();if(o' + A + A + 'c){c.sendObjectToBack(o);c.renderAll();refreshLayers();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">To Back</button>');
na.push('            </div>');
na.push('          </div>');
na.push('          )}');

// Close
na.push('          </div>');
na.push('        </aside>');

// Now replace in main file
var lines = fs.readFileSync(file, 'utf8').split('\n');
var as2 = -1, ae2 = -1, d2 = 0;
for (var i = 0; i < lines.length; i++) {
  if (as2 === -1 && lines[i].includes('<aside') && (lines[i].includes('w-[220px]') || lines[i].includes('w-[200px]'))) as2 = i;
  if (as2 !== -1 && ae2 === -1) {
    d2 += (lines[i].match(/<aside/g) || []).length;
    d2 -= (lines[i].match(/<\/aside>/g) || []).length;
    if (d2 <= 0) { ae2 = i; break; }
  }
}

lines.splice(as2, ae2 - as2 + 1, ...na);
fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Done! Replaced aside (' + (ae2-as2+1) + ' lines) with new tabbed layout (' + na.length + ' lines)');
