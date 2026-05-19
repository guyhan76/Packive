const fs = require('fs');
var file = 'src/components/editor/panel-editor.tsx';
var backup = fs.readFileSync('aside-full-backup.txt', 'utf8').split('\n');
var lines = fs.readFileSync(file, 'utf8').split('\n');

// Find current aside and replace with backup
var as2 = -1, ae2 = -1, d2 = 0;
for (var i = 0; i < lines.length; i++) {
  if (as2 === -1 && lines[i].includes('<aside')) as2 = i;
  if (as2 !== -1 && ae2 === -1) {
    d2 += (lines[i].match(/<aside/g) || []).length;
    d2 -= (lines[i].match(/<\/aside>/g) || []).length;
    if (d2 <= 0) { ae2 = i; break; }
  }
}
lines.splice(as2, ae2 - as2 + 1, ...backup);
fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Restored backup');

// Re-read
lines = fs.readFileSync(file, 'utf8').split('\n');

// Find aside again
as2 = -1; ae2 = -1; d2 = 0;
for (var i = 0; i < lines.length; i++) {
  if (as2 === -1 && lines[i].includes('<aside') && lines[i].includes('w-[200px]')) as2 = i;
  if (as2 !== -1 && ae2 === -1) {
    d2 += (lines[i].match(/<aside/g) || []).length;
    d2 -= (lines[i].match(/<\/aside>/g) || []).length;
    if (d2 <= 0) { ae2 = i; break; }
  }
}
console.log('Aside: ' + (as2+1) + '-' + (ae2+1));

// Strategy: Each section has a wrapper <div className="p-2 border-b border-gray-100">
// We will:
// 1. Replace header <p> with clickable accordion header
// 2. Add style={{display: openSections.has("x") ? "block" : "none"}} to the content area
// This way we DON'T change the div structure at all!

// Find the 5 section wrapper divs
var sectionDivs = [];
for (var i = as2; i <= ae2; i++) {
  if (lines[i].includes('border-b border-gray-100') && lines[i].includes('<div') && lines[i].includes('p-2')) {
    sectionDivs.push(i);
  }
  // Also catch the color/props wrapper (no p-2)
  if (lines[i].includes('border-b border-gray-100') && lines[i].includes('<div') && !lines[i].includes('p-2')) {
    sectionDivs.push(i);
  }
}
console.log('Section divs at lines: ' + sectionDivs.map(function(s){return s+1;}).join(', '));

// Section mapping:
// sectionDivs[0] = ADD (has "Add Objects" <p>)
// sectionDivs[1] = IMAGE (has "Image & Code" <p>)
// sectionDivs[2] = COLOR (has openSection toggle for color)
// sectionDivs[3] = PROPS (has openSection toggle for props)
// sectionDivs[4] = TOOLS (has "Tools" <p>) - if exists

// Change width
lines[as2] = lines[as2].replace('w-[200px]', 'w-[190px]');

// Process each section
var sectionConfig = [
  { id: 'add', label: '+ Add Objects', headerPattern: 'Add Objects' },
  { id: 'image', label: 'Image & Code', headerPattern: 'Image & Code' },
  { id: 'color', label: 'Color & Background', headerPattern: 'Color & Background' },
  { id: 'props', label: 'Properties', headerPattern: 'Properties' },
  { id: 'tools', label: 'Tools', headerPattern: null } // will find manually
];

// For ADD and IMAGE: replace <p> header with accordion button, add display toggle to content div
// For COLOR and PROPS: replace existing toggle button, change openSection to openSections
// For TOOLS: add accordion header

// Process ADD section
for (var i = as2; i <= ae2; i++) {
  if (lines[i].includes('Add Objects') && lines[i].includes('<p')) {
    lines[i] = '            <button onClick={() => toggleSection("add")} className="flex items-center justify-between w-full text-[10px] font-bold text-gray-500 mb-1.5 hover:text-gray-700"><span>+ Add Objects</span><span className="text-[8px]">{openSections.has("add") ? "\\u25B2" : "\\u25BC"}</span></button>';
    // Find the grid div after this and wrap in conditional display
    for (var j = i + 1; j < i + 5; j++) {
      if (lines[j].includes('grid grid-cols')) {
        // Change grid-cols-3 to grid-cols-2
        lines[j] = lines[j].replace('grid-cols-3', 'grid-cols-2');
        // Add display toggle to the parent div or this div
        lines[j] = lines[j].replace('<div className="', '<div style={{display: openSections.has("add") ? "grid" : "none"}} className="');
        console.log('ADD: header + display toggle + 2cols');
        break;
      }
    }
    break;
  }
}

// Process IMAGE section
for (var i = as2; i <= ae2; i++) {
  if (lines[i].includes('Image & Code') && lines[i].includes('<p')) {
    lines[i] = '            <button onClick={() => toggleSection("image")} className="flex items-center justify-between w-full text-[10px] font-bold text-gray-500 mb-1.5 hover:text-gray-700"><span>Image & Code</span><span className="text-[8px]">{openSections.has("image") ? "\\u25B2" : "\\u25BC"}</span></button>';
    for (var j = i + 1; j < i + 5; j++) {
      if (lines[j].includes('grid grid-cols')) {
        lines[j] = lines[j].replace('<div className="', '<div style={{display: openSections.has("image") ? "grid" : "none"}} className="');
        console.log('IMAGE: header + display toggle');
        break;
      }
    }
    break;
  }
}

// Process COLOR section - replace existing toggle
for (var i = as2; i <= ae2; i++) {
  if (lines[i].includes('setOpenSection') && lines[i].includes('color')) {
    lines[i] = '            <button onClick={() => toggleSection("color")} className="flex items-center justify-between w-full px-2 py-1.5 text-[10px] font-bold text-gray-500 hover:bg-gray-50"><span>Color & Background</span><span className="text-[8px]">{openSections.has("color") ? "\\u25B2" : "\\u25BC"}</span></button>';
    // Next line should be the conditional content - replace openSection
    if (lines[i+1] && lines[i+1].includes('openSection === "color"')) {
      lines[i+1] = lines[i+1].replace('openSection === "color"', 'openSections.has("color")');
    }
    console.log('COLOR: updated toggle');
    break;
  }
}

// Process PROPS section - replace existing toggle
for (var i = as2; i <= ae2; i++) {
  if (lines[i].includes('setOpenSection') && lines[i].includes('props')) {
    lines[i] = '            <button onClick={() => toggleSection("props")} className="flex items-center justify-between w-full px-2 py-1.5 text-[10px] font-bold text-gray-500 hover:bg-gray-50"><span>Properties</span><span className="text-[8px]">{openSections.has("props") ? "\\u25B2" : "\\u25BC"}</span></button>';
    if (lines[i+1] && lines[i+1].includes('openSection === "props"')) {
      lines[i+1] = lines[i+1].replace('openSection === "props"', 'openSections.has("props")');
    }
    console.log('PROPS: updated toggle');
    break;
  }
}

// Process TOOLS section - find "Tools" header <p>
for (var i = as2; i <= ae2; i++) {
  if (lines[i].includes('>Tools</p>') && lines[i].includes('text-[10px]')) {
    lines[i] = '            <button onClick={() => toggleSection("tools")} className="flex items-center justify-between w-full text-[10px] font-bold text-gray-500 mb-1.5 hover:text-gray-700"><span>Tools</span><span className="text-[8px]">{openSections.has("tools") ? "\\u25B2" : "\\u25BC"}</span></button>';
    // Find the content div after this
    for (var j = i + 1; j < i + 5; j++) {
      if (lines[j].includes('<div') && lines[j].includes('flex')) {
        lines[j] = lines[j].replace('<div className="', '<div style={{display: openSections.has("tools") ? "flex" : "none"}} className="');
        console.log('TOOLS: header + display toggle');
        break;
      }
    }
    break;
  }
}

// Select BG center
var code = lines.join('\n');
code = code.replace(
  'className="w-[120px] py-1 text-[10px] bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 font-medium" title="Select template background"',
  'className="w-[120px] py-1 text-[10px] bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 font-medium mx-auto block" title="Select template background"'
);
console.log('Select BG: centered');

// Pick Color bigger
code = code.replace(
  'title="Pick Color from screen"',
  'title="Pick Color from screen" style={{fontSize:"13px",fontWeight:"600"}}'
);
console.log('Pick Color: bigger');

fs.writeFileSync(file, code, 'utf8');
console.log('SUCCESS! Accordion with display toggle - no div structure changes.');
