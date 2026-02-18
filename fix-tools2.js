const fs = require('fs');
var file = 'src/components/editor/panel-editor.tsx';
var lines = fs.readFileSync(file, 'utf8').split('\n');

// Find tools toggle button
var toolsToggle = -1;
for (var i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection("tools")')) {
    toolsToggle = i;
    break;
  }
}
console.log('Tools toggle at line ' + (toolsToggle+1));

// The next line has display toggle on Group div only - remove it
// Line after toggle: <div style={{display:...}} className="flex flex-col items-center gap-1">
// Change back to normal and wrap ALL tools content differently

// Find the tools section wrapper div (the one with p-2 border-b above the toggle)
var toolsWrapperDiv = -1;
for (var i = toolsToggle - 1; i > toolsToggle - 5; i--) {
  if (lines[i].includes('p-2 border-b border-gray-100') && lines[i].includes('<div')) {
    toolsWrapperDiv = i;
    break;
  }
}
console.log('Tools wrapper div at line ' + (toolsWrapperDiv+1));

// Remove the display toggle from Group div
for (var i = toolsToggle + 1; i < toolsToggle + 3; i++) {
  if (lines[i].includes('style={{display:') && lines[i].includes('openSections.has("tools")')) {
    lines[i] = lines[i].replace(' style={{display: openSections.has("tools") ? "flex" : "none"}}', '');
    console.log('Removed display toggle from Group div at line ' + (i+1));
    break;
  }
}

// Now: the tools section is wrapped in <div className="p-2 border-b border-gray-100">
// After toggle button, ALL content should be conditionally shown
// Insert a wrapper div with display toggle right after the toggle button
// And close it right before the section's closing </div>

// Find end of tools section (the </div> that closes the p-2 border-b div)
// Count div depth from toolsWrapperDiv
var depth = 0;
var toolsEndDiv = -1;
for (var i = toolsWrapperDiv; i < lines.length; i++) {
  var opens = (lines[i].match(/<div/g) || []).length;
  var closes = (lines[i].match(/<\/div>/g) || []).length;
  depth += opens - closes;
  if (depth <= 0) {
    toolsEndDiv = i;
    break;
  }
}
console.log('Tools section ends at line ' + (toolsEndDiv+1));

// Insert closing </div> before toolsEndDiv
lines.splice(toolsEndDiv, 0, '            </div>');
// Insert opening div with display toggle after toggle button
lines.splice(toolsToggle + 1, 0, '            <div style={{display: openSections.has("tools") ? "block" : "none"}}>');

console.log('Wrapped ALL tools content in display toggle');

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Done!');
