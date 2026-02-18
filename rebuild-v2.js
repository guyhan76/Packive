const fs = require('fs');
var backup = fs.readFileSync('aside-full-backup.txt', 'utf8').split('\n');
var file = 'src/components/editor/panel-editor.tsx';
var lines = fs.readFileSync(file, 'utf8').split('\n');

// Original backup structure (1-indexed in backup):
// Line 1: <aside ...>
// Lines 2-3: <!-- ADD --> header comment area
// Lines 4-161: ADD section content (with its own <div> wrappers, ends with </div></div></div>)
// Line 162: {/* IMAGE */} comment
// Lines 163-321: IMAGE section (with <div> wrapper, ends with </div></div>)
// Line 322: {/* COLOR */} comment  
// Lines 323-513: COLOR section (with openSection toggle)
// Line 514: implied start of PROPS
// Lines 514-964: PROPS section (with openSection toggle)
// Lines 965-1165: TOOLS section
// Line 1166: </aside>

// Correct slice boundaries (0-indexed):
// ADD = backup[1] to backup[160] (skip <aside> at 0, include up to </div></div></div>)
// IMAGE = backup[161] to backup[320] (comment + content + closing divs)
// COLOR = backup[321] to backup[513]
// PROPS = backup[513] to backup[964]
// TOOLS = backup[964] to backup[1164]
// backup[1165] = </aside>

// Let's find exact boundaries by looking for section comments
var addStart = 1; // after <aside>
var imageComment = -1, colorComment = -1;
var propsLine = -1, toolsLine = -1;

for (var i = 0; i < backup.length; i++) {
  if (backup[i].includes('IMAGE') && backup[i].includes('{/*')) imageComment = i;
  if (backup[i].includes('COLOR') && backup[i].includes('{/*')) colorComment = i;
  if (backup[i].includes('setOpenSection') && backup[i].includes('props') && propsLine === -1) propsLine = i;
}

// TOOLS: find after props section - look for Clone/Draw buttons area
for (var i = propsLine; i < backup.length; i++) {
  // Props section ends, tools starts - find the div after props closes
  if (backup[i].includes('Clone') && backup[i].includes('ToolButton')) { toolsLine = i - 5; break; }
  if (backup[i].includes('TOOLS') || (backup[i].includes('border-b') && i > propsLine + 100)) { toolsLine = i; break; }
}

// Actually let's use the known positions from analysis
// divStarts were at relative positions: 2, 162, 322, 513, 966 (0-indexed in backup)
// So:
var addSlice = backup.slice(1, 162); // after <aside>, before IMAGE comment
var imageSlice = backup.slice(162, 322); // IMAGE comment through end  
var colorSlice = backup.slice(322, 514); // COLOR section
var propsSlice = backup.slice(514, 966); // PROPS section
var toolsSlice = backup.slice(966, 1165); // TOOLS section (before </aside>)

console.log('ADD: ' + addSlice.length + ' lines');
console.log('IMAGE: ' + imageSlice.length + ' lines');
console.log('COLOR: ' + colorSlice.length + ' lines');
console.log('PROPS: ' + propsSlice.length + ' lines');
console.log('TOOLS: ' + toolsSlice.length + ' lines');

// Clean COLOR: remove openSection toggle, keep content inside
var colorClean = [];
var inColorContent = false;
for (var i = 0; i < colorSlice.length; i++) {
  var l = colorSlice[i];
  if (l.includes('setOpenSection') && l.includes('color')) continue;
  if (l.includes('openSection === "color"') && l.includes('&&')) {
    // This line opens the conditional div - skip it but start collecting content
    inColorContent = true;
    continue;
  }
  if (l.trim() === '</div>}') continue; // close of conditional
  if (l.includes('border-b border-gray-100') && l.includes('<div') && !inColorContent) continue;
  colorClean.push(l);
}

// Clean PROPS similarly
var propsClean = [];
for (var i = 0; i < propsSlice.length; i++) {
  var l = propsSlice[i];
  if (l.includes('setOpenSection') && l.includes('props')) continue;
  if (l.includes('openSection === "props"') && l.includes('&&')) continue;
  if (l.trim() === '</div>}') continue;
  if (l.includes('border-b border-gray-100') && l.includes('<div') && i < 3) continue;
  propsClean.push(l);
}

// Build new aside with tabs
var T = String.fromCharCode(96);
var D = String.fromCharCode(36);
var Q = String.fromCharCode(63);
var AA = String.fromCharCode(38) + String.fromCharCode(38);

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

// ADD TAB: contains ADD + IMAGE sections with their ORIGINAL div wrappers intact
na.push('          {panelTab === "add" && (<>');
addSlice.forEach(function(l) { na.push(l); });
imageSlice.forEach(function(l) { na.push(l); });
na.push('          </>)}');

// STYLE TAB: contains cleaned COLOR + PROPS
na.push('          {panelTab === "style" && (<div className="p-2">');
colorClean.forEach(function(l) { na.push(l); });
na.push('          <hr className="my-2 border-gray-100" />');
propsClean.forEach(function(l) { na.push(l); });
na.push('          </div>)}');

// TOOLS TAB: contains TOOLS section with original wrapper
na.push('          {panelTab === "tools" && (<>');
toolsSlice.forEach(function(l) { na.push(l); });
na.push('          </>)}');

// ARRANGE TAB
na.push('          {panelTab === "arrange" && (');
na.push('          <div className="p-2 space-y-3">');
na.push('            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Position</p>');
na.push('            <div className="grid grid-cols-3 gap-1">');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + Q + '.getActiveObject();if(o){o.set({left:0,originX:"left"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Left</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + Q + '.getActiveObject();if(o' + AA + 'c){o.set({left:c.getWidth()/2,originX:"center"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Center</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + Q + '.getActiveObject();if(o' + AA + 'c){o.set({left:c.getWidth(),originX:"right"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Right</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + Q + '.getActiveObject();if(o){o.set({top:0,originY:"top"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Top</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + Q + '.getActiveObject();if(o' + AA + 'c){o.set({top:c.getHeight()/2,originY:"center"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Middle</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + Q + '.getActiveObject();if(o' + AA + 'c){o.set({top:c.getHeight(),originY:"bottom"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Bottom</button>');
na.push('            </div>');
na.push('            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1 mt-3">Layer</p>');
na.push('            <div className="grid grid-cols-2 gap-1">');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + Q + '.getActiveObject();if(o' + AA + 'c){c.bringObjectForward(o);c.renderAll();refreshLayers();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Forward</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + Q + '.getActiveObject();if(o' + AA + 'c){c.sendObjectBackwards(o);c.renderAll();refreshLayers();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Backward</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + Q + '.getActiveObject();if(o' + AA + 'c){c.bringObjectToFront(o);c.renderAll();refreshLayers();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">To Front</button>');
na.push('              <button onClick={() => { const c=fcRef.current;const o=c' + Q + '.getActiveObject();if(o' + AA + 'c){c.sendObjectToBack(o);c.renderAll();refreshLayers();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">To Back</button>');
na.push('            </div>');
na.push('          </div>');
na.push('          )}');

na.push('          </div>');
na.push('        </aside>');

// Find and replace aside in main file
var as2 = -1, ae2 = -1, d2 = 0;
for (var i = 0; i < lines.length; i++) {
  if (as2 === -1 && lines[i].includes('<aside') && (lines[i].includes('w-[220px]') || lines[i].includes('w-[200px]'))) as2 = i;
  if (as2 !== -1 && ae2 === -1) {
    d2 += (lines[i].match(/<aside/g) || []).length;
    d2 -= (lines[i].match(/<\/aside>/g) || []).length;
    if (d2 <= 0) { ae2 = i; break; }
  }
}

console.log('Replacing lines ' + (as2+1) + '-' + (ae2+1));
lines.splice(as2, ae2 - as2 + 1, ...na);
fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('SUCCESS! New aside: ' + na.length + ' lines');
