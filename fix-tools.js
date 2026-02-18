const fs = require('fs');
var file = 'src/components/editor/panel-editor.tsx';
var code = fs.readFileSync(file, 'utf8');
var changes = 0;

// 1. Replace Tools header with accordion toggle
code = code.replace(
  '<p className="text-[10px] font-bold text-gray-500 mb-1.5">Tools</p>',
  '<button onClick={() => toggleSection("tools")} className="flex items-center justify-between w-full text-[10px] font-bold text-gray-500 mb-1.5 hover:text-gray-700"><span>Tools</span><span className="text-[8px]">{openSections.has("tools") ? "\\u25B2" : "\\u25BC"}</span></button>'
);
changes++;
console.log('1. Tools header -> accordion toggle');

// 2. Add accordion wrapper after Tools header
// Find the tools toggle button and insert wrapper
var lines = code.split('\n');
var toolsToggleLine = -1;
for (var i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection("tools")')) {
    toolsToggleLine = i;
    break;
  }
}

if (toolsToggleLine !== -1) {
  // Find </aside> to know where tools section ends
  var asideEnd = -1;
  for (var i = toolsToggleLine; i < lines.length; i++) {
    if (lines[i].includes('</aside>')) { asideEnd = i; break; }
  }
  
  // The tools section content starts after the toggle button
  // and ends before </aside> (there are closing </div> tags)
  // Insert opening wrapper after toggle
  lines.splice(toolsToggleLine + 1, 0, '            {openSections.has("tools") && (<div>');
  
  // Find the closing </div> of the tools section (before </aside>)
  // After splice, asideEnd shifted by 1
  asideEnd++;
  // Insert closing before the section's last </div> before </aside>
  // Go backwards from </aside> to find the tools section boundary
  // The line before </aside> should be </div> (closing the p-2 border-b div)
  lines.splice(asideEnd, 0, '            </div>)}');
  
  changes++;
  console.log('2. Wrapped Tools in accordion. Toggle at line ' + (toolsToggleLine+1));
}

// 3. Add "tools" to default open sections
code = lines.join('\n');
code = code.replace(
  'new Set(["text","shape","image"])',
  'new Set(["text","image","tools"])'
);
changes++;
console.log('3. Updated default open sections');

fs.writeFileSync(file, code, 'utf8');
console.log('Done! ' + changes + ' changes applied.');
