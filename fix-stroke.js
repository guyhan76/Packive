const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Find the broken line: starts with className="text-[9px]...>Stroke Color
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim().startsWith('className="text-[9px] text-gray-400">Stroke Color</span>')) {
    console.log('Found broken Stroke Color at line ' + (i+1));
    console.log('Before: ' + lines[i]);
    // Replace with proper div + span
    lines[i] = '          <div className="flex flex-col items-center gap-1 py-0.5">\n            <span className="text-[9px] text-gray-400">Stroke Color</span>';
    console.log('Fixed: restored <div> and <span>');
    break;
  }
}

// Check for same issue with Image Filters
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim().startsWith('className="text-[9px] text-gray-400">Image Filters</span>')) {
    console.log('Found broken Image Filters at line ' + (i+1));
    lines[i] = '          <div className="flex flex-col items-center gap-1 py-0.5">\n            <span className="text-[9px] text-gray-400">Image Filters</span>';
    console.log('Fixed Image Filters');
    break;
  }
}

// Check Rotation
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim().startsWith('className="text-[9px] text-gray-400">Rotation</span>')) {
    console.log('Found broken Rotation at line ' + (i+1));
    lines[i] = '          <div className="flex flex-col items-center gap-1 py-0.5">\n            <span className="text-[9px] text-gray-400">Rotation</span>';
    console.log('Fixed Rotation');
    break;
  }
}

// Check Shadow
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim().startsWith('className="text-[9px] text-gray-400">Shadow</span>')) {
    console.log('Found broken Shadow at line ' + (i+1));
    lines[i] = '          <div className="flex flex-col items-center gap-1 py-0.5">\n            <span className="text-[9px] text-gray-400">Shadow</span>';
    console.log('Fixed Shadow');
    break;
  }
}

// Check Font
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim().startsWith('className="text-[9px] text-gray-400">Font</span>')) {
    console.log('Found broken Font at line ' + (i+1));
    lines[i] = '          <div className="flex flex-col items-center gap-1 py-0.5">\n            <span className="text-[9px] text-gray-400">Font</span>';
    console.log('Fixed Font');
    break;
  }
}

// Check Position
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim().startsWith('className="text-[9px] text-gray-400">Position</span>')) {
    console.log('Found broken Position at line ' + (i+1));
    lines[i] = '          <div className="flex flex-col items-center gap-1 py-0.5">\n            <span className="text-[9px] text-gray-400">Position</span>';
    console.log('Fixed Position');
    break;
  }
}

// Also check if divider lines were inserted correctly - remove any broken ones
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('w-full my-1.5') && lines[i].includes('borderTop')) {
    // Check if next line is broken (starts with className=)
    if (i + 1 < lines.length && lines[i+1].trim().startsWith('className=')) {
      console.log('Removing broken divider at line ' + (i+1));
      lines.splice(i, 1);
    }
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('\\nDone! Restoration complete.');
