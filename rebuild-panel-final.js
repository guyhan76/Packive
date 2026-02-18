const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Find aside
let asideStart = -1, asideEnd = -1, depth = 0;
for (let i = 0; i < lines.length; i++) {
  if (asideStart === -1 && lines[i].includes('<aside') && lines[i].includes('w-[200px]')) asideStart = i;
  if (asideStart !== -1 && asideEnd === -1) {
    depth += (lines[i].match(/<aside/g) || []).length;
    depth -= (lines[i].match(/<\/aside>/g) || []).length;
    if (depth <= 0) { asideEnd = i; break; }
  }
}

const oldAside = lines.slice(asideStart, asideEnd + 1);
console.log('Old aside: ' + oldAside.length + ' lines');

// Find section boundaries within oldAside (relative indices)
// Section divs are at relative: 2,162,322,513,966
// ADD: lines 2-161 (relative)
// IMAGE: lines 162-321
// COLOR: lines 322-512
// PROPS: lines 513-965
// TOOLS: lines 966-end

let sections = { add: [], image: [], color: [], props: [], tools: [] };

// Find exact div boundaries
let divStarts = [];
for (let i = 0; i < oldAside.length; i++) {
  if (oldAside[i].includes('border-b border-gray-100') && oldAside[i].includes('<div')) {
    divStarts.push(i);
  }
}

// Map sections
// divStarts[0] = ADD start, divStarts[1] = IMAGE start, divStarts[2] = COLOR start, divStarts[3] = PROPS start, divStarts[4] = TOOLS start
if (divStarts.length >= 5) {
  sections.add = oldAside.slice(divStarts[0], divStarts[1]);
  sections.image = oldAside.slice(divStarts[1], divStarts[2]);
  sections.color = oldAside.slice(divStarts[2], divStarts[3]);
  sections.props = oldAside.slice(divStarts[3], divStarts[4]);
  sections.tools = oldAside.slice(divStarts[4]);
  // Remove trailing </aside> from tools if present
  const lastToolIdx = sections.tools.length - 1;
  if (sections.tools[lastToolIdx] && sections.tools[lastToolIdx].includes('</aside>')) {
    sections.tools[lastToolIdx] = sections.tools[lastToolIdx].replace('</aside>', '');
  }
} else {
  console.log('ERROR: Expected 5 section divs, found ' + divStarts.length);
  console.log('Div positions:', divStarts);
  process.exit(1);
}

console.log('Section sizes: ADD=' + sections.add.length + ' IMAGE=' + sections.image.length + ' COLOR=' + sections.color.length + ' PROPS=' + sections.props.length + ' TOOLS=' + sections.tools.length);

// Clean up old section headers from each section
function removeOldHeaders(arr) {
  return arr.filter(line => {
    if (line.includes('text-[10px] font-bold text-gray-500 mb-1.5')) return false;
    if (line.includes('setOpenSection')) return false;
    if (line.includes('openSection ===')) return false;
    return true;
  });
}

// For color and props, remove the collapsible wrappers but keep content
function unwrapCollapsible(arr) {
  let result = [];
  let skipToggle = false;
  for (let i = 0; i < arr.length; i++) {
    const line = arr[i];
    if (line.includes('setOpenSection')) continue;
    if (line.includes('openSection ===') && line.includes('&&')) continue;
    result.push(line);
  }
  return result;
}

sections.color = unwrapCollapsible(sections.color);
sections.props = unwrapCollapsible(sections.props);

// Build new aside
const newAside = [];

// Tab bar
newAside.push('        <aside className="w-[220px] bg-white border-r flex flex-col shrink-0">');
newAside.push('          {/* Tab Bar */}');
newAside.push('          <div className="flex border-b bg-gray-50 shrink-0">');
newAside.push('            {[');
newAside.push('              { id: "add", icon: "\\u271A", label: "Add" },');
newAside.push('              { id: "style", icon: "\\uD83C\\uDFA8", label: "Style" },');
newAside.push('              { id: "tools", icon: "\\uD83D\\uDD27", label: "Tools" },');
newAside.push('              { id: "arrange", icon: "\\u25A6", label: "Arrange" },');
newAside.push('            ].map(tab => (');
newAside.push('              <button key={tab.id} onClick={() => setPanelTab(tab.id)}');
newAside.push('                className={lex-1 py-2 text-center text-[10px] font-medium transition-colors }>');
newAside.push('                <div className="text-sm">{tab.icon}</div>');
newAside.push('                <div>{tab.label}</div>');
newAside.push('              </button>');
newAside.push('            ))}');
newAside.push('          </div>');
newAside.push('');
newAside.push('          {/* Tab Content */}');
newAside.push('          <div className="flex-1 overflow-y-auto">');
newAside.push('');

// === ADD TAB (Text + Shape + Image + Code) ===
newAside.push('          {panelTab === "add" && (');
newAside.push('            <div className="p-2 space-y-3">');
newAside.push('              {/* Text */}');
newAside.push('              <div>');
newAside.push('                <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Text</p>');
newAside.push('                <div className="grid grid-cols-3 gap-1">');

// Insert ADD section content (Text, Curved, Path Text buttons)
// Find ToolButton lines in ADD section
for (let i = 0; i < sections.add.length; i++) {
  const line = sections.add[i];
  if (line.includes('ToolButton') && (line.includes('Text') || line.includes('Curved') || line.includes('Path'))) {
    // Find the complete handler block
    let block = [line];
    if (!line.includes('/>')) {
      let braceDepth = 0;
      for (let j = i; j < sections.add.length; j++) {
        braceDepth += (sections.add[j].match(/\{/g) || []).length;
        braceDepth -= (sections.add[j].match(/\}/g) || []).length;
        if (j > i) block.push(sections.add[j]);
        if (braceDepth <= 0 && sections.add[j].includes('/>')) break;
      }
    }
    block.forEach(b => newAside.push('            ' + b.trim()));
  }
}

newAside.push('                </div>');
newAside.push('              </div>');

// Shape subsection
newAside.push('              {/* Shape */}');
newAside.push('              <div>');
newAside.push('                <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Shape</p>');

// Find shape select in ADD section
let inShapeSelect = false;
let shapeBlock = [];
for (let i = 0; i < sections.add.length; i++) {
  const line = sections.add[i];
  if (line.includes('<select') && (line.includes('Shape') || line.includes('shapeType') || line.includes('circle'))) {
    inShapeSelect = true;
  }
  if (inShapeSelect) {
    shapeBlock.push(line);
    if (line.includes('</select>')) {
      inShapeSelect = false;
    }
  }
}
if (shapeBlock.length > 0) {
  shapeBlock.forEach(b => newAside.push('            ' + b.trim()));
} else {
  // Fallback: include all non-ToolButton, non-header content from ADD
  console.log('WARNING: Shape select not found, including raw ADD section');
}

newAside.push('              </div>');

// Image & Code subsection
newAside.push('              {/* Image & Code */}');
newAside.push('              <div>');
newAside.push('                <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Image & Code</p>');
newAside.push('                <div className="grid grid-cols-2 gap-1">');

// Insert IMAGE section buttons
for (let i = 0; i < sections.image.length; i++) {
  const line = sections.image[i];
  if (line.includes('ToolButton') || (line.includes('<button') && line.includes('onClick'))) {
    let block = [line];
    let braceDepth = 0;
    for (let j = i; j < sections.image.length; j++) {
      braceDepth += (sections.image[j].match(/\{/g) || []).length;
      braceDepth -= (sections.image[j].match(/\}/g) || []).length;
      if (j > i) block.push(sections.image[j]);
      if (braceDepth <= 0 && (sections.image[j].includes('/>') || sections.image[j].includes('</button>'))) break;
    }
    block.forEach(b => newAside.push('            ' + b.trim()));
  }
}

newAside.push('                </div>');
newAside.push('              </div>');
newAside.push('            </div>');
newAside.push('          )}');
newAside.push('');

// === STYLE TAB (Color + Properties) ===
newAside.push('          {panelTab === "style" && (');
newAside.push('            <div className="p-2 space-y-2">');

// Color section content (remove old wrapper divs)
let colorContent = sections.color.filter(line => {
  if (line.includes('<div className="p-2 border-b')) return false;
  if (line.includes('border-b border-gray-100')) return false;
  return true;
});
colorContent.forEach(line => newAside.push('          ' + line.trimEnd()));

newAside.push('              <hr className="border-gray-100" />');

// Props section content
let propsContent = sections.props.filter(line => {
  if (line.includes('<div className="p-2 border-b')) return false;
  if (line.includes('border-b border-gray-100')) return false;
  return true;
});
propsContent.forEach(line => newAside.push('          ' + line.trimEnd()));

newAside.push('            </div>');
newAside.push('          )}');
newAside.push('');

// === TOOLS TAB ===
newAside.push('          {panelTab === "tools" && (');
newAside.push('            <div className="p-2 space-y-2">');

// Tools section content
let toolsContent = sections.tools.filter(line => {
  if (line.includes('<div className="p-2 border-b')) return false;
  if (line.includes('border-b border-gray-100')) return false;
  return true;
});
toolsContent.forEach(line => newAside.push('          ' + line.trimEnd()));

newAside.push('            </div>');
newAside.push('          )}');
newAside.push('');

// === ARRANGE TAB ===
newAside.push('          {panelTab === "arrange" && (');
newAside.push('            <div className="p-2 space-y-3">');
newAside.push('              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Position</p>');
newAside.push('              <div className="grid grid-cols-3 gap-1">');
newAside.push('                <button onClick={() => { const c=fcRef.current;const o=c?.getActiveObject();if(o){o.set({left:0,originX:\"left\"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100" title="Align Left">Left</button>');
newAside.push('                <button onClick={() => { const c=fcRef.current;const o=c?.getActiveObject();if(o&&c){o.set({left:c.getWidth()/2,originX:\"center\"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100" title="Center H">Center H</button>');
newAside.push('                <button onClick={() => { const c=fcRef.current;const o=c?.getActiveObject();if(o&&c){o.set({left:c.getWidth(),originX:\"right\"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100" title="Align Right">Right</button>');
newAside.push('                <button onClick={() => { const c=fcRef.current;const o=c?.getActiveObject();if(o){o.set({top:0,originY:\"top\"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100" title="Align Top">Top</button>');
newAside.push('                <button onClick={() => { const c=fcRef.current;const o=c?.getActiveObject();if(o&&c){o.set({top:c.getHeight()/2,originY:\"center\"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100" title="Center V">Center V</button>');
newAside.push('                <button onClick={() => { const c=fcRef.current;const o=c?.getActiveObject();if(o&&c){o.set({top:c.getHeight(),originY:\"bottom\"});c.renderAll();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100" title="Align Bottom">Bottom</button>');
newAside.push('              </div>');
newAside.push('');
newAside.push('              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1 mt-2">Layer Order</p>');
newAside.push('              <div className="grid grid-cols-2 gap-1">');
newAside.push('                <button onClick={() => { const c=fcRef.current;const o=c?.getActiveObject();if(o&&c){c.bringObjectForward(o);c.renderAll();refreshLayers();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Bring Forward</button>');
newAside.push('                <button onClick={() => { const c=fcRef.current;const o=c?.getActiveObject();if(o&&c){c.sendObjectBackwards(o);c.renderAll();refreshLayers();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Send Backward</button>');
newAside.push('                <button onClick={() => { const c=fcRef.current;const o=c?.getActiveObject();if(o&&c){c.bringObjectToFront(o);c.renderAll();refreshLayers();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">To Front</button>');
newAside.push('                <button onClick={() => { const c=fcRef.current;const o=c?.getActiveObject();if(o&&c){c.sendObjectToBack(o);c.renderAll();refreshLayers();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">To Back</button>');
newAside.push('              </div>');
newAside.push('');
newAside.push('              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1 mt-2">Group</p>');
newAside.push('              <div className="grid grid-cols-2 gap-1">');
newAside.push('                <button onClick={() => { const c=fcRef.current;if(!c)return;const sel=c.getActiveObject();if(sel&&sel.type===\"activeselection\"){(sel as any).toGroup();c.renderAll();refreshLayers();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Group</button>');
newAside.push('                <button onClick={() => { const c=fcRef.current;if(!c)return;const sel=c.getActiveObject();if(sel&&sel.type===\"group\"){(sel as any).toActiveSelection();c.renderAll();refreshLayers();} }} className="px-1 py-1.5 text-[9px] bg-gray-50 border rounded hover:bg-gray-100">Ungroup</button>');
newAside.push('              </div>');
newAside.push('            </div>');
newAside.push('          )}');
newAside.push('');

// Close tab content and aside
newAside.push('          </div>');
newAside.push('        </aside>');

// Replace old aside with new
lines.splice(asideStart, asideEnd - asideStart + 1, ...newAside);

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('SUCCESS! Replaced ' + (asideEnd - asideStart + 1) + ' lines with ' + newAside.length + ' lines');
console.log('New aside has 4 tabs: Add, Style, Tools, Arrange');
