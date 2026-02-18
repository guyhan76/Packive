const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// Helper: insert a divider line before a given line number (1-based)
function insertDivider(lineNum1, label) {
  const idx = lineNum1 - 1;
  const divider = '            <hr className="my-2 border-gray-200" />';
  lines.splice(idx, 0, divider);
  changes++;
  console.log('Divider before line ' + lineNum1 + ' (' + label + ')');
  return 1; // offset
}

// We need to work from bottom to top to avoid line shifts

// ============================================
// 1. TOOLS section - add dividers & 2-col grid
// ============================================
// Tools items: Group(3181), Clone(~3210+), Delete(~3230+), Draw(~3240+), Measure(~3330+), Clear Canvas(3369), Undo/Redo(3373)

// Find exact lines for Tools items
let toolCloneLine = 0, toolDeleteLine = 0, toolDrawLine = 0, toolMeasureLine = 0, toolClearLine = 0, toolUndoLine = 0;
for (let i = 0; i < lines.length; i++) {
  const l = lines[i].trim();
  if (l.includes('Clone</span>') || l.includes('>Clone<')) { if (!toolCloneLine) toolCloneLine = i + 1; }
  if (l.includes('Delete</span>') || l.includes('>Delete<')) { if (!toolDeleteLine) toolDeleteLine = i + 1; }
  if (l.includes('Draw</span>') || l.includes('>Draw<') || l.includes('Draw</')) { if (!toolDrawLine) toolDrawLine = i + 1; }
  if (l.includes('Measure</span>') || l.includes('>Measure<')) { if (!toolMeasureLine) toolMeasureLine = i + 1; }
  if (l.includes('Clear Canvas') && l.includes('button')) { if (!toolClearLine) toolClearLine = i + 1; }
  if (l.includes('onClick={undo}')) { if (!toolUndoLine) toolUndoLine = i + 1; }
}
console.log('Tools lines - Clone:' + toolCloneLine + ' Delete:' + toolDeleteLine + ' Draw:' + toolDrawLine + ' Measure:' + toolMeasureLine + ' Clear:' + toolClearLine + ' Undo:' + toolUndoLine);

// ============================================
// 2. PROPERTIES section - add dividers between groups
// ============================================
// Groups: Opacity(2728), Size(2739), LineHeight(2762), LetterSpacing(2785) = "Text Size"
// StrokeColor(2808), StrokeWidth(2819) = "Stroke"
// ImageFilters(2838) = "Filters"
// Rotation(2941) = "Transform"
// Shadow(2964) = "Shadow"
// Font(3024), Align(3072), Style(3121) = "Font & Style"
// Position(3162) = "Position"

// Work bottom to top
let propPositionLine = 0, propFontLine = 0, propShadowLine = 0, propRotationLine = 0;
let propFiltersLine = 0, propStrokeLine = 0;
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.includes('>Position</span>') && !propPositionLine) propPositionLine = i + 1;
  if (l.includes('>Font</span>') && !propFontLine) propFontLine = i + 1;
  if (l.includes('>Shadow</span>') && !propShadowLine) propShadowLine = i + 1;
  if (l.includes('>Rotation</span>') && !propRotationLine) propRotationLine = i + 1;
  if (l.includes('>Image Filters</span>') && !propFiltersLine) propFiltersLine = i + 1;
  if (l.includes('>Stroke Color</span>') && !propStrokeLine) propStrokeLine = i + 1;
}
console.log('Props lines - Stroke:' + propStrokeLine + ' Filters:' + propFiltersLine + ' Rotation:' + propRotationLine + ' Shadow:' + propShadowLine + ' Font:' + propFontLine + ' Position:' + propPositionLine);

// ============================================
// 3. COLOR section - add dividers between groups
// ============================================
// Groups: Color grid + Pick Color, BG Image(2574), BG Color(2631), BG Gradient(2645), BG Opacity(2691), Select BG(2719)
let colorBGImageLine = 0, colorBGColorLine = 0, colorBGGradLine = 0, colorBGOpacityLine = 0;
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.includes('>BG Image</span>') && !colorBGImageLine) colorBGImageLine = i + 1;
  if (l.includes('>BG Color</span>') && !colorBGColorLine) colorBGColorLine = i + 1;
  if (l.includes('>BG Gradient</span>') && !colorBGGradLine) colorBGGradLine = i + 1;
  if (l.includes('>BG Opacity</span>') && !colorBGOpacityLine) colorBGOpacityLine = i + 1;
}
console.log('Color lines - BGImage:' + colorBGImageLine + ' BGColor:' + colorBGColorLine + ' BGGrad:' + colorBGGradLine + ' BGOpacity:' + colorBGOpacityLine);

// ============================================
// NOW INSERT DIVIDERS (bottom to top to preserve line numbers)
// ============================================
let allInserts = [];

// Color section dividers
if (colorBGImageLine) allInserts.push({ line: colorBGImageLine, label: 'Color > BG Image' });
if (colorBGColorLine) allInserts.push({ line: colorBGColorLine, label: 'Color > BG Color' });
if (colorBGGradLine) allInserts.push({ line: colorBGGradLine, label: 'Color > BG Gradient' });
if (colorBGOpacityLine) allInserts.push({ line: colorBGOpacityLine, label: 'Color > BG Opacity' });

// Properties section dividers
if (propStrokeLine) allInserts.push({ line: propStrokeLine, label: 'Props > Stroke' });
if (propFiltersLine) allInserts.push({ line: propFiltersLine, label: 'Props > Filters' });
if (propRotationLine) allInserts.push({ line: propRotationLine, label: 'Props > Rotation' });
if (propShadowLine) allInserts.push({ line: propShadowLine, label: 'Props > Shadow' });
if (propFontLine) allInserts.push({ line: propFontLine, label: 'Props > Font & Style' });
if (propPositionLine) allInserts.push({ line: propPositionLine, label: 'Props > Position' });

// Sort descending so we insert from bottom to top
allInserts.sort((a, b) => b.line - a.line);

for (const ins of allInserts) {
  const idx = ins.line - 1;
  // Find the parent <div> that contains this span (usually 1-2 lines above)
  // Insert divider before the parent div
  let targetIdx = idx;
  for (let k = idx; k >= Math.max(0, idx - 3); k--) {
    if (lines[k].trim().startsWith('<div')) { targetIdx = k; break; }
    if (lines[k].trim().startsWith('<span')) { targetIdx = k; break; }
  }
  lines.splice(targetIdx, 0, '            <hr className="my-1.5 border-gray-100" />');
  changes++;
  console.log('+ Divider: ' + ins.label + ' at line ' + (targetIdx + 1));
}

// ============================================
// 4. Tools: wrap Group+Clone+Delete in 2-col grid, Draw+Measure in 2-col
// ============================================
// Find the Group span line again (shifted now)
let groupSpanIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('>Group</span>') && lines[i].includes('text-[9px]')) {
    groupSpanIdx = i;
    break;
  }
}
if (groupSpanIdx >= 0) {
  // Add divider before Clone (find it)
  for (let i = groupSpanIdx + 1; i < Math.min(groupSpanIdx + 80, lines.length); i++) {
    if (lines[i].includes('Clone') && (lines[i].includes('span') || lines[i].includes('title'))) {
      lines.splice(i, 0, '            <hr className="my-1.5 border-gray-100" />');
      changes++;
      console.log('+ Divider before Clone at ' + (i+1));
      break;
    }
  }
  // Add divider before Draw
  for (let i = groupSpanIdx + 1; i < Math.min(groupSpanIdx + 120, lines.length); i++) {
    if ((lines[i].includes('>Draw<') || lines[i].includes('Draw</')) && lines[i].includes('span')) {
      lines.splice(i, 0, '            <hr className="my-1.5 border-gray-100" />');
      changes++;
      console.log('+ Divider before Draw at ' + (i+1));
      break;
    }
  }
  // Add divider before Clear Canvas
  for (let i = groupSpanIdx + 1; i < Math.min(groupSpanIdx + 200, lines.length); i++) {
    if (lines[i].includes('Clear Canvas') && lines[i].includes('button')) {
      lines.splice(i, 0, '            <hr className="my-1.5 border-gray-100" />');
      changes++;
      console.log('+ Divider before Clear Canvas at ' + (i+1));
      break;
    }
  }
}

// ============================================
// 5. Make Tools Group buttons (G, UG) into a 2-col grid
// ============================================
// Find "Group</span>" then the next <div className="flex gap
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('>Group</span>') && lines[i].includes('text-[9px]')) {
    for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
      if (lines[j].includes('flex gap')) {
        lines[j] = lines[j].replace(/flex gap-[0-9.]+/, 'grid grid-cols-2 gap-1');
        changes++;
        console.log('Tools Group: flex -> grid-cols-2 at line ' + (j+1));
        break;
      }
    }
    break;
  }
}

// ============================================
// 6. Reduce panel width to 150px
// ============================================
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('w-[160px]') && lines[i].includes('aside')) {
    lines[i] = lines[i].replace('w-[160px]', 'w-[150px]');
    changes++;
    console.log('Panel width: 160 -> 150px');
    break;
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Done! ' + changes + ' changes applied.');
