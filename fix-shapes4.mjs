import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
const lines = readFileSync(f, "utf8").split('\n');
let changes = 0;

// Find line 2145 (0-indexed) which is <optgroup label="Special">
let specialLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('optgroup label="Special"')) { specialLine = i; break; }
}

if (specialLine >= 0 && !lines.some(l => l.includes('Curves & Arcs'))) {
  const newGroups = [
    '              <optgroup label="Curves & Arcs">',
    '                <option value="semiCircle">\u25D7 Semi Circle</option>',
    '                <option value="arc">\u2312 Arc</option>',
    '                <option value="wave">\u223F Wave</option>',
    '                <option value="fan">\u25D4 Fan</option>',
    '                <option value="spiral">\uD83C\uDF00 Spiral</option>',
    '              </optgroup>',
    '              <optgroup label="Bubbles & Shapes">',
    '                <option value="speechBubble">\uD83D\uDCAC Speech Bubble</option>',
    '                <option value="cloud">\u2601 Cloud</option>',
    '                <option value="moon">\u263D Moon</option>',
    '                <option value="ring">\u25CE Ring</option>',
    '                <option value="roundedSquare">\u25A2 Rounded Square</option>',
    '              </optgroup>',
    '              <optgroup label="Symbols">',
    '                <option value="lightning">\u26A1 Lightning</option>',
    '                <option value="plus">\u2795 Plus (outline)</option>',
    '              </optgroup>',
  ];
  lines.splice(specialLine, 0, ...newGroups);
  changes++;
  console.log("1. Added new shape groups before Special at line " + specialLine);
}

// Fix draw color - when color changes, update brush
let code = lines.join('\n');

// Add color picker to draw mode panel
const oldDrawPanel = `<span className="text-[8px] text-gray-300">{brushSize}px</span>
            </div>
          )}`;
const newDrawPanel = `<span className="text-[8px] text-gray-300">{brushSize}px</span>
              <span className="text-[8px] text-gray-400">Pen Color</span>
              <input type="color" value={color} onChange={e => {
                const newColor = e.target.value;
                setColor(newColor);
                const c = fcRef.current;
                if (c && c.freeDrawingBrush) c.freeDrawingBrush.color = newColor;
              }} className="w-8 h-4 cursor-pointer border-0" />
            </div>
          )}`;
if (code.includes(oldDrawPanel)) {
  code = code.replace(oldDrawPanel, newDrawPanel);
  changes++;
  console.log("2. Added pen color picker to draw panel");
}

if (changes > 0) {
  writeFileSync(f, code, "utf8");
  console.log("Done! Applied " + changes + " changes");
} else {
  console.log("No changes applied");
}
