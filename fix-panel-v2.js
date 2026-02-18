const fs = require('fs');
let lines = fs.readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');
let changes = 0;

// Fix width
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('w-[160px] bg-white border-r flex flex-col shrink-0 overflow-y-auto')) {
    lines[i] = lines[i].replace('w-[160px]', 'w-[200px]');
    changes++;
    console.log('1. Width 200px');
    break;
  }
}

// Fix all section headers - replace broken unicode with actual text
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('\\u2795 ADD') || lines[i].includes('\u2795 ADD')) {
    lines[i] = lines[i].replace(/.*/, '            <p className=\"text-[10px] font-bold text-gray-500 mb-1.5\">+ Add Objects</p>');
    changes++;
    console.log('2a. Fixed ADD header');
  }
  if (lines[i].includes('\\uD83D\\uDD37 SHAPE') || lines[i].includes('\uD83D\uDD37 SHAPE')) {
    lines[i] = '            <p className=\"text-[10px] font-bold text-gray-500 mb-1\">Shape</p>';
    changes++;
    console.log('2b. Fixed SHAPE header');
  }
  if (lines[i].includes('\\uD83D\\uDDBC IMAGE') || lines[i].includes('\uD83D\uDDBC IMAGE')) {
    lines[i] = '            <p className=\"text-[10px] font-bold text-gray-500 mb-1.5\">Image & Code</p>';
    changes++;
    console.log('2c. Fixed IMAGE header');
  }
  if (lines[i].includes('\\uD83C\\uDFA8 COLOR') || lines[i].includes('\uD83C\uDFA8 COLOR')) {
    lines[i] = '            <p className=\"text-[10px] font-bold text-gray-500 mb-1.5\">Color & Background</p>';
    changes++;
    console.log('2d. Fixed COLOR header');
  }
  if (lines[i].includes('\\u2699 PROPERTIES') || lines[i].includes('\u2699 PROPERTIES') || lines[i].includes('\u2699\uFE0F Properties')) {
    lines[i] = '            <p className=\"text-[10px] font-bold text-gray-500 mb-1.5\">Properties</p>';
    changes++;
    console.log('2e. Fixed PROPERTIES header');
  }
  if (lines[i].includes('\\uD83D\\uDEE0 TOOLS') || lines[i].includes('\uD83D\uDEE0 TOOLS') || lines[i].includes('\uD83D\uDEE0\uFE0F Tools')) {
    lines[i] = '            <p className=\"text-[10px] font-bold text-gray-500 mb-1.5\">Tools</p>';
    changes++;
    console.log('2f. Fixed TOOLS header');
  }
}

// Make PROPERTIES and COLOR sections collapsible
// Find COLOR section opening div
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Color & Background')) {
    // Find the <div className="p-2 border-b"> before it
    for (let j = i - 1; j > Math.max(0, i - 5); j--) {
      if (lines[j].includes('p-2 border-b border-gray-100')) {
        // Replace static div with collapsible
        lines[j] = '          <div className=\"border-b border-gray-100\">';
        lines[i] = '            <button onClick={() => setOpenSection(openSection === \"color\" ? \"\" : \"color\")} className=\"flex items-center justify-between w-full px-2 py-1.5 text-[10px] font-bold text-gray-500 hover:bg-gray-50\">' +
          '<span>Color & Background</span><span className=\"text-[8px]\">{openSection === \"color\" ? \"\u25B2\" : \"\u25BC\"}</span></button>';
        // Add conditional wrapper after button
        lines.splice(i + 1, 0, '            {openSection === \"color\" && <div className=\"px-2 pb-2\">');
        changes++;
        console.log('3. Made COLOR collapsible');
        break;
      }
    }
    break;
  }
}

// Close the collapsible COLOR div before PROPERTIES
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Properties') && lines[i].includes('font-bold')) {
    // Find the closing </div> of COLOR section just before
    for (let j = i - 1; j > Math.max(0, i - 10); j--) {
      if (lines[j].trim() === '</div>') {
        lines.splice(j, 0, '            </div>}');
        changes++;
        console.log('4. Closed collapsible COLOR');
        break;
      }
    }
    break;
  }
}

// Make PROPERTIES collapsible
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Properties') && lines[i].includes('font-bold') && lines[i].includes('<p')) {
    for (let j = i - 1; j > Math.max(0, i - 5); j--) {
      if (lines[j].includes('p-2 border-b border-gray-100')) {
        lines[j] = '          <div className=\"border-b border-gray-100\">';
        lines[i] = '            <button onClick={() => setOpenSection(openSection === \"props\" ? \"\" : \"props\")} className=\"flex items-center justify-between w-full px-2 py-1.5 text-[10px] font-bold text-gray-500 hover:bg-gray-50\">' +
          '<span>Properties</span><span className=\"text-[8px]\">{openSection === \"props\" ? \"\u25B2\" : \"\u25BC\"}</span></button>';
        lines.splice(i + 1, 0, '            {openSection === \"props\" && <div className=\"px-2 pb-2\">');
        changes++;
        console.log('5. Made PROPERTIES collapsible');
        break;
      }
    }
    break;
  }
}

// Close PROPERTIES collapsible before TOOLS
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Tools') && lines[i].includes('font-bold')) {
    for (let j = i - 1; j > Math.max(0, i - 10); j--) {
      if (lines[j].trim() === '</div>') {
        lines.splice(j, 0, '            </div>}');
        changes++;
        console.log('6. Closed collapsible PROPERTIES');
        break;
      }
    }
    break;
  }
}

// Fix TOOLS section: make Clone, Delete, Draw, Measure in 2x2 grid
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Tools') && lines[i].includes('font-bold')) {
    // Find Clone button
    for (let j = i; j < Math.min(i + 20, lines.length); j++) {
      if (lines[j].includes('label=\"Clone\"')) {
        // Insert grid wrapper before Clone
        lines.splice(j, 0, '            <div className=\"grid grid-cols-2 gap-1\">');
        changes++;
        console.log('7. Added grid for TOOLS');
        break;
      }
    }
    break;
  }
}

// Close tools grid before Clear Canvas
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Clear Canvas') && lines[i].includes('button')) {
    lines.splice(i, 0, '            </div>');
    changes++;
    console.log('8. Closed TOOLS grid');
    break;
  }
}

if (changes > 0) {
  fs.writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
  console.log('Done! ' + changes + ' changes applied.');
} else {
  console.log('No changes made.');
}
