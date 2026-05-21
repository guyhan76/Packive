const fs = require('fs');
var file = 'src/components/editor/panel-editor.tsx';
var code = fs.readFileSync(file, 'utf8');
var changes = 0;

// 1. Aside width: 220px -> 190px
code = code.replace('w-[220px] bg-white border-r flex flex-col shrink-0 overflow-y-auto', 'w-[190px] bg-white border-r flex flex-col shrink-0 overflow-y-auto');
changes++;
console.log('1. Width 220->190px');

// 2. Add Objects grid: 3 cols -> 2 cols
code = code.replace('grid grid-cols-3 gap-1">\n        <ToolButton label="Text"', 'grid grid-cols-2 gap-1">\n        <ToolButton label="Text"');
if (code.includes('grid grid-cols-3 gap-1')) {
  code = code.replace(/grid grid-cols-3 gap-1/g, function(match) {
    changes++;
    return 'grid grid-cols-2 gap-1';
  });
  console.log('2. Changed grid cols 3->2');
}

// 3. Make Add Objects section collapsible
// The header button already has toggleSection("text") but content is not wrapped
// Find the Add Objects button and the content after it
var lines = code.split('\n');
var addBtnLine = -1, imageBtnLine = -1, colorLine = -1, toolsLine = -1;

for (var i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection("text")') && addBtnLine === -1) addBtnLine = i;
  if (lines[i].includes('toggleSection("image")') && imageBtnLine === -1) imageBtnLine = i;
  if (lines[i].includes('toggleSection("color")') && colorLine === -1) colorLine = i;
  if (lines[i].includes('toggleSection("tools")') && toolsLine === -1) toolsLine = i;
}

console.log('Add btn: ' + (addBtnLine+1) + ', Image btn: ' + (imageBtnLine+1) + ', Color: ' + (colorLine+1) + ', Tools: ' + (toolsLine+1));

// For ADD section: wrap content between addBtnLine+1 and the line before IMAGE section comment
// Find IMAGE comment
var imageCommentLine = -1;
for (var i = addBtnLine + 1; i < lines.length; i++) {
  if (lines[i].includes('IMAGE') && lines[i].includes('{/*')) {
    imageCommentLine = i;
    break;
  }
}

// Find the content start (grid div after add button)
var addContentStart = addBtnLine + 1;
// Find content end (before IMAGE comment, skip closing divs)
var addContentEnd = imageCommentLine - 1;
// Skip trailing </div> that belong to the wrapper
while (addContentEnd > addContentStart && lines[addContentEnd].trim() === '</div>') addContentEnd--;
addContentEnd++; // include the first </div>

console.log('Add content: ' + (addContentStart+1) + '-' + (addContentEnd+1) + ', Image comment: ' + (imageCommentLine+1));

// Insert wrap: after addBtnLine insert {openSections.has("text") && (<div>
// before imageCommentLine insert </div>)}
// Work backwards
lines.splice(imageCommentLine, 0, '            </div>)}');
lines.splice(addBtnLine + 1, 0, '            {openSections.has("text") && (<div>');
changes++;
console.log('3. Wrapped Add Objects in accordion');

// Re-find positions (lines shifted by 2)
imageBtnLine = -1; colorLine = -1; toolsLine = -1;
var imageCommentLine2 = -1;
for (var i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection("image")') && imageBtnLine === -1) imageBtnLine = i;
  if (lines[i].includes('toggleSection("color")') && colorLine === -1) colorLine = i;
  if (lines[i].includes('toggleSection("tools")') && toolsLine === -1) toolsLine = i;
  if (lines[i].includes('COLOR') && lines[i].includes('{/*') && imageCommentLine2 === -1 && i > imageBtnLine) imageCommentLine2 = i;
}

// For IMAGE section: wrap between imageBtnLine+1 and before COLOR comment
if (imageBtnLine !== -1 && imageCommentLine2 !== -1) {
  lines.splice(imageCommentLine2, 0, '            </div>)}');
  lines.splice(imageBtnLine + 1, 0, '            {openSections.has("image") && (<div>');
  changes++;
  console.log('4. Wrapped Image in accordion');
}

// Re-find tools position
toolsLine = -1;
for (var i = 0; i < lines.length; i++) {
  if (lines[i].includes('toggleSection("tools")') && toolsLine === -1) toolsLine = i;
}

// For TOOLS section: check if already wrapped
if (toolsLine !== -1) {
  // Check if next line already has openSections.has("tools")
  var nextLine = lines[toolsLine + 1] || '';
  if (!nextLine.includes('openSections.has("tools")')) {
    // Find the </aside> or end of tools section
    // Tools content goes until </aside> practically
    // Find </aside>
    var asideEndLine = -1;
    for (var i = toolsLine; i < lines.length; i++) {
      if (lines[i].includes('</aside>')) { asideEndLine = i; break; }
    }
    if (asideEndLine !== -1) {
      // Insert closing before the tools section's wrapper </div> (before </aside>)
      // The </aside> is preceded by </div> for the section wrapper
      lines.splice(asideEndLine, 0, '            </div>)}');
      lines.splice(toolsLine + 1, 0, '            {openSections.has("tools") && (<div>');
      changes++;
      console.log('5. Wrapped Tools in accordion');
    }
  }
}

// 6. Select BG button - center align
code = lines.join('\n');
code = code.replace(
  /title="Select template background">\s*\n\s*Select BG\s*\n\s*<\/button>/g,
  function(match) {
    changes++;
    return match;
  }
);
// Find Select BG button and add mx-auto or text-center
code = code.replace(
  /className="w-\[120px\] py-1 text-\[10px\] bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 font-medium" title="Select template background"/g,
  'className="w-[120px] py-1 text-[10px] bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 font-medium mx-auto block" title="Select template background"'
);
changes++;
console.log('6. Select BG centered');

// 7. Pick Color - make icon bigger
code = code.replace(
  /Pick Color<\/span>/g,
  'Pick Color</span>'
);
// Find the Pick Color button and increase size
code = code.replace(
  /className="w-\[120px\] py-1 text-\[10px\][^"]*" title="Pick Color from screen"/g,
  function(match) {
    return match.replace('text-[10px]', 'text-[12px] font-semibold');
  }
);
changes++;
console.log('7. Pick Color bigger');

// 8. Tools buttons - make 2-col grid
// Find tools ToolButtons and wrap in grid
// Tools has: Group(G/UG), Clone, Delete, Draw, Measure, Clear, Undo/Redo
// These are individual ToolButtons - need to find them and wrap in grid

fs.writeFileSync(file, code, 'utf8');
console.log('Done! ' + changes + ' changes applied.');
