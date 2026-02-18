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
console.log('Removing current aside: lines ' + (as2+1) + '-' + (ae2+1));

// First restore original backup
lines.splice(as2, ae2 - as2 + 1, ...backup);
fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Restored original backup');

// Re-read
lines = fs.readFileSync(file, 'utf8').split('\n');

// Find restored aside
as2 = -1; ae2 = -1; d2 = 0;
for (var i = 0; i < lines.length; i++) {
  if (as2 === -1 && lines[i].includes('<aside') && lines[i].includes('w-[200px]')) as2 = i;
  if (as2 !== -1 && ae2 === -1) {
    d2 += (lines[i].match(/<aside/g) || []).length;
    d2 -= (lines[i].match(/<\/aside>/g) || []).length;
    if (d2 <= 0) { ae2 = i; break; }
  }
}
console.log('Restored aside: ' + (as2+1) + '-' + (ae2+1));

// Now modify: change panelTab state to accordion set
// First find panelTab state and change it to openSections (Set)
var panelTabLine = -1;
for (var i = 0; i < lines.length; i++) {
  if (lines[i].includes('panelTab') && lines[i].includes('useState')) {
    panelTabLine = i;
    break;
  }
}
if (panelTabLine !== -1) {
  lines[panelTabLine] = '  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["text","shape","image"]));';
  console.log('Replaced panelTab with openSections state');
}

// Build toggle function as a string to insert after the state
var toggleFn = '  const toggleSection = (id: string) => setOpenSections(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });';
lines.splice(panelTabLine + 1, 0, toggleFn);
console.log('Added toggleSection function');

// Now rebuild aside content
// Extract sections from backup
var addSlice = backup.slice(1, 162);
var imageSlice = backup.slice(162, 322);
var colorSlice = backup.slice(322, 514);
var propsSlice = backup.slice(514, 966);
var toolsSlice = backup.slice(966, 1165);

// Clean openSection from color and props
function cleanSection(arr) {
  var result = [];
  for (var i = 0; i < arr.length; i++) {
    var l = arr[i];
    if (l.includes('setOpenSection')) continue;
    if (l.includes('openSection ===') && l.includes('&&')) continue;
    if (l.trim() === '</div>}') continue;
    result.push(l);
  }
  return result;
}

var colorClean = cleanSection(colorSlice);
var propsClean = cleanSection(propsSlice);

// Now split ADD into: text buttons + shape section
// ADD slice contains: header, Text/Curved/PathText buttons, Shape select
var textButtons = [];
var shapeContent = [];
var inShape = false;
for (var i = 0; i < addSlice.length; i++) {
  var l = addSlice[i];
  if (l.includes('Shape') && (l.includes('<select') || l.includes('text-[9px]') || l.includes('Shape</p>'))) {
    inShape = true;
  }
  if (!inShape) {
    // Skip wrapper divs and headers
    if (l.includes('Add Objects')) continue;
    if (l.includes('border-b border-gray-100') && l.includes('<div') && i < 3) continue;
    if (l.includes('grid grid-cols-3') && i < 5) continue;
    textButtons.push(l);
  } else {
    shapeContent.push(l);
  }
}

// Build accordion section helper
var T = String.fromCharCode(96);
var D = String.fromCharCode(36);

function makeAccordionHeader(id, label) {
  return [
    '            <button onClick={() => toggleSection("' + id + '")} className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 border-b border-gray-100">',
    '              <span>' + label + '</span>',
    '              <span className="text-[10px] text-gray-400">{openSections.has("' + id + '") ? "\\u25B2" : "\\u25BC"}</span>',
    '            </button>'
  ];
}

function makeAccordionContent(id, contentLines) {
  var result = [];
  result.push('            {openSections.has("' + id + '") && (');
  result.push('              <div className="px-3 py-2">');
  contentLines.forEach(function(l) { result.push('            ' + l); });
  result.push('              </div>');
  result.push('            )}');
  return result;
}

// Build new aside
var na = [];
na.push('        <aside className="w-[220px] bg-white border-r flex flex-col shrink-0 overflow-y-auto">');

// TEXT section
na.push.apply(na, makeAccordionHeader('text', 'Text'));
na.push('            {openSections.has("text") && (');
na.push('              <div className="px-3 py-2">');
na.push('                <div className="grid grid-cols-3 gap-1 mb-2">');
textButtons.forEach(function(l) { na.push('              ' + l); });
na.push('                </div>');
na.push('              </div>');
na.push('            )}');

// SHAPE section
na.push.apply(na, makeAccordionHeader('shape', 'Shape'));
na.push('            {openSections.has("shape") && (');
na.push('              <div className="px-3 py-2">');
shapeContent.forEach(function(l) { na.push('            ' + l); });
na.push('              </div>');
na.push('            )}');

// IMAGE section
na.push.apply(na, makeAccordionHeader('image', 'Image & Code'));
na.push('            {openSections.has("image") && (');
na.push('              <div className="px-3 py-2">');
// Use image slice but skip its own wrapper
for (var i = 0; i < imageSlice.length; i++) {
  var l = imageSlice[i];
  if (l.includes('Image & Code') && l.includes('<p')) continue;
  if (l.includes('border-b border-gray-100') && l.includes('<div') && i < 3) continue;
  if (l.includes('grid grid-cols-2') && i < 5) continue;
  na.push('            ' + l);
}
na.push('              </div>');
na.push('            )}');

// COLOR section
na.push.apply(na, makeAccordionHeader('color', 'Color & Background'));
na.push('            {openSections.has("color") && (');
na.push('              <div className="px-3 py-2">');
// Remove wrapper divs from colorClean
for (var i = 0; i < colorClean.length; i++) {
  var l = colorClean[i];
  if (l.includes('border-b border-gray-100') && l.includes('<div') && i < 3) continue;
  na.push('            ' + l);
}
na.push('              </div>');
na.push('            )}');

// PROPERTIES section (Opacity, Rotation, Shadow, Filters)
na.push.apply(na, makeAccordionHeader('props', 'Properties'));
na.push('            {openSections.has("props") && (');
na.push('              <div className="px-3 py-2">');
for (var i = 0; i < propsClean.length; i++) {
  var l = propsClean[i];
  if (l.includes('border-b border-gray-100') && l.includes('<div') && i < 3) continue;
  na.push('            ' + l);
}
na.push('              </div>');
na.push('            )}');

// TOOLS section
na.push.apply(na, makeAccordionHeader('tools', 'Tools'));
na.push('            {openSections.has("tools") && (');
na.push('              <div className="px-3 py-2">');
for (var i = 0; i < toolsSlice.length; i++) {
  var l = toolsSlice[i];
  if (l.includes('border-b border-gray-100') && l.includes('<div') && i < 3) continue;
  na.push('            ' + l);
}
na.push('              </div>');
na.push('            )}');

na.push('        </aside>');

// Replace aside in file
// Re-find aside position (may have shifted due to state line insert)
lines = fs.readFileSync(file, 'utf8').split('\n');
as2 = -1; ae2 = -1; d2 = 0;
for (var i = 0; i < lines.length; i++) {
  if (as2 === -1 && lines[i].includes('<aside') && lines[i].includes('w-[200px]')) as2 = i;
  if (as2 !== -1 && ae2 === -1) {
    d2 += (lines[i].match(/<aside/g) || []).length;
    d2 -= (lines[i].match(/<\/aside>/g) || []).length;
    if (d2 <= 0) { ae2 = i; break; }
  }
}

lines.splice(as2, ae2 - as2 + 1, ...na);
fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('SUCCESS! Accordion aside: ' + na.length + ' lines');
console.log('Sections: Text, Shape, Image, Color, Properties, Tools');
