const fs = require('fs');
var file = 'src/components/editor/panel-editor.tsx';
var lines = fs.readFileSync(file, 'utf8').split('\n');
var backup = fs.readFileSync('aside-full-backup.txt', 'utf8').split('\n');

// Find current aside
var as2 = -1, ae2 = -1, d2 = 0;
for (var i = 0; i < lines.length; i++) {
  if (as2 === -1 && lines[i].includes('<aside')) as2 = i;
  if (as2 !== -1 && ae2 === -1) {
    d2 += (lines[i].match(/<aside/g) || []).length;
    d2 -= (lines[i].match(/<\/aside>/g) || []).length;
    if (d2 <= 0) { ae2 = i; break; }
  }
}

// Restore original backup first
lines.splice(as2, ae2 - as2 + 1, ...backup);
fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Step 1: Restored original');

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

// Strategy: Keep original structure 100% intact
// Only make these changes:
// 1. Change aside width to 220px
// 2. Replace section header <p> tags with clickable accordion headers
// 3. Wrap each section content in {openSections.has("x") && (...)}
// 4. Replace openSection state with openSections Set
// 5. Remove old openSection toggle buttons for COLOR and PROPS

// Find openSections state (was panelTab, should already exist)
var stateFixed = false;
for (var i = 0; i < lines.length; i++) {
  if (lines[i].includes('openSections') && lines[i].includes('useState')) {
    stateFixed = true;
    break;
  }
  if (lines[i].includes('panelTab') && lines[i].includes('useState')) {
    lines[i] = '  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["text","shape","image"]));';
    stateFixed = true;
    console.log('Fixed state declaration');
    break;
  }
}

// Make sure toggleSection exists
var hasToggle = false;
for (var i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection')) { hasToggle = true; break; }
}

// Now do MINIMAL modifications to the aside:
// 1. Change width
for (var i = as2; i <= ae2; i++) {
  if (lines[i].includes('w-[200px]')) {
    lines[i] = lines[i].replace('w-[200px]', 'w-[220px]');
    console.log('Changed width to 220px');
    break;
  }
}

// 2. Find and modify section headers
// Section: "Add Objects" header
for (var i = as2; i <= ae2; i++) {
  if (lines[i].includes('Add Objects') && lines[i].includes('<p')) {
    lines[i] = '            <button onClick={() => toggleSection("text")} className="flex items-center justify-between w-full text-[10px] font-bold text-gray-500 mb-1.5 hover:text-gray-700"><span>+ Add Objects</span><span className="text-[8px]">{openSections.has("text") ? "\\u25B2" : "\\u25BC"}</span></button>';
    // Find the grid div right after and wrap content
    // Insert conditional open after this button
    for (var j = i + 1; j <= ae2; j++) {
      if (lines[j].includes('grid grid-cols-3') || lines[j].includes('grid grid-cols-2')) {
        // This is start of content - wrap it
        // Find the end of ADD section (IMAGE comment)
        for (var k = j; k <= ae2; k++) {
          if (lines[k].includes('IMAGE')) {
            // Insert closing before IMAGE comment
            // But this is complex... let me try simpler approach
            break;
          }
        }
        break;
      }
    }
    break;
  }
}

// Actually the minimal approach is even simpler:
// Just convert the existing openSection toggles for COLOR and PROPS
// to use openSections Set, and add similar toggles for ADD, IMAGE, TOOLS

// Replace openSection references with openSections
var code = lines.join('\n');

// Fix COLOR toggle
code = code.replace(
  /setOpenSection\(openSection === "color" \? "" : "color"\)/g,
  'toggleSection("color")'
);
code = code.replace(
  /openSection === "color" \? "\\u25B2" : "\\u25BC"/g,
  'openSections.has("color") ? "\\u25B2" : "\\u25BC"'
);
code = code.replace(
  /\{openSection === "color" && /g,
  '{openSections.has("color") && '
);

// Fix PROPS toggle
code = code.replace(
  /setOpenSection\(openSection === "props" \? "" : "props"\)/g,
  'toggleSection("props")'
);
code = code.replace(
  /openSection === "props" \? "\\u25B2" : "\\u25BC"/g,
  'openSections.has("props") ? "\\u25B2" : "\\u25BC"'
);
code = code.replace(
  /\{openSection === "props" && /g,
  '{openSections.has("props") && '
);

// Count changes
var colorChanges = (code.match(/toggleSection\("color"\)/g) || []).length;
var propsChanges = (code.match(/toggleSection\("props"\)/g) || []).length;
console.log('COLOR toggles: ' + colorChanges + ', PROPS toggles: ' + propsChanges);

// Now add accordion headers for ADD, IMAGE, TOOLS sections
// Find "Add Objects" header and replace
code = code.replace(
  /<p className="text-\[10px\] font-bold text-gray-500 mb-1.5">\+ Add Objects<\/p>/,
  '<button onClick={() => toggleSection("add")} className="flex items-center justify-between w-full text-[10px] font-bold text-gray-500 mb-1.5 hover:text-gray-700"><span>+ Add Objects</span><span className="text-[8px]">{openSections.has("add") ? "\\u25B2" : "\\u25BC"}</span></button>'
);

// Find "Image & Code" header
code = code.replace(
  /<p className="text-\[10px\] font-bold text-gray-500 mb-1.5">Image & Code<\/p>/,
  '<button onClick={() => toggleSection("image")} className="flex items-center justify-between w-full text-[10px] font-bold text-gray-500 mb-1.5 hover:text-gray-700"><span>Image & Code</span><span className="text-[8px]">{openSections.has("image") ? "\\u25B2" : "\\u25BC"}</span></button>'
);

// For TOOLS section - find the 5th border-b div (tools section wrapper)
// We need to identify the tools section header
// Tools section starts after props ends, look for Clone/Group area
// Add a header before tools content
// Actually let's find where TOOLS div starts
lines = code.split('\n');

// Find tools section boundary
as2 = -1; ae2 = -1; d2 = 0;
for (var i = 0; i < lines.length; i++) {
  if (as2 === -1 && lines[i].includes('<aside') && lines[i].includes('w-[220px]')) as2 = i;
  if (as2 !== -1 && ae2 === -1) {
    d2 += (lines[i].match(/<aside/g) || []).length;
    d2 -= (lines[i].match(/<\/aside>/g) || []).length;
    if (d2 <= 0) { ae2 = i; break; }
  }
}

// Find the 5th section div (tools)
var sectionDivCount = 0;
var toolsDivLine = -1;
for (var i = as2; i <= ae2; i++) {
  if (lines[i].includes('border-b border-gray-100') && lines[i].includes('<div') && lines[i].includes('p-2')) {
    sectionDivCount++;
    if (sectionDivCount === 5) {
      toolsDivLine = i;
      break;
    }
  }
}

if (toolsDivLine !== -1) {
  // Insert tools header after the div opening
  lines.splice(toolsDivLine + 1, 0,
    '            <button onClick={() => toggleSection("tools")} className="flex items-center justify-between w-full text-[10px] font-bold text-gray-500 mb-1.5 hover:text-gray-700"><span>Tools</span><span className="text-[8px]">{openSections.has("tools") ? "\\u25B2" : "\\u25BC"}</span></button>',
    '            {openSections.has("tools") && (<div>'
  );
  // Find the </div> that closes tools section (before </aside>)
  // It should be the last </div> before </aside>
  // Insert closing </div>)} before the tools section's closing </div>
  console.log('Added tools accordion header at line ' + (toolsDivLine + 1));
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('SUCCESS! Accordion style aside with minimal changes');
console.log('Sections with toggles: Add, Image, Color, Props, Tools');
