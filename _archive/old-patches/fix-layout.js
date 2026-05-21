const fs = require('fs');
var file = 'src/components/editor/panel-editor.tsx';
var code = fs.readFileSync(file, 'utf8');
var changes = 0;

// 1. Width 190 -> 160
code = code.replace('w-[190px]', 'w-[160px]');
changes++;
console.log('1. Width -> 160px');

// 2. Shape section: replace select with button grid + accordion
// Find the Shape section
var shapeStart = code.indexOf('<p className="text-[10px] font-bold text-gray-500 mb-1">Shape</p>');
var selectStart = code.indexOf('<select', shapeStart);
var selectEnd = code.indexOf('</select>', selectStart) + '</select>'.length;

// Also find the wrapper divs around the select
var shapeHeaderEnd = code.indexOf('</p>', shapeStart) + '</p>'.length;

// Build new shape section with button grid
var T = String.fromCharCode(96);
var D = String.fromCharCode(36);

var shapeButtons = '';
shapeButtons += '\\n            <button onClick={() => toggleSection("shape")} className="flex items-center justify-between w-full text-[10px] font-bold text-gray-500 mb-1 hover:text-gray-700"><span>Shape</span><span className="text-[8px]">{openSections.has("shape") ? "\\u25B2" : "\\u25BC"}</span></button>';
shapeButtons += '\\n            <div style={{display: openSections.has("shape") ? "block" : "none"}}>';

// Basic shapes
shapeButtons += '\\n              <p className="text-[8px] text-gray-400 mt-1 mb-1">Basic</p>';
shapeButtons += '\\n              <div className="grid grid-cols-4 gap-1 mb-2">';
shapeButtons += '\\n                <button onClick={addRect} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Rectangle">■</button>';
shapeButtons += '\\n                <button onClick={addRoundedRect} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Rounded Rect">▢</button>';
shapeButtons += '\\n                <button onClick={addCircle} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Circle">●</button>';
shapeButtons += '\\n                <button onClick={addEllipse} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Ellipse">⬮</button>';
shapeButtons += '\\n              </div>';

// Lines
shapeButtons += '\\n              <p className="text-[8px] text-gray-400 mt-1 mb-1">Lines</p>';
shapeButtons += '\\n              <div className="grid grid-cols-4 gap-1 mb-2">';
shapeButtons += '\\n                <button onClick={addSolidLine} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Solid">──</button>';
shapeButtons += '\\n                <button onClick={addDashedLine} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Dashed">╌╌</button>';
shapeButtons += '\\n                <button onClick={addDottedLine} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Dotted">···</button>';
shapeButtons += '\\n                <button onClick={addVerticalLine} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Vertical">│</button>';
shapeButtons += '\\n                <button onClick={addArrowLineRight} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Arrow Right">→</button>';
shapeButtons += '\\n                <button onClick={addArrowLineLeft} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Arrow Left">←</button>';
shapeButtons += '\\n                <button onClick={addArrowLineBoth} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Arrow Both">↔</button>';
shapeButtons += '\\n              </div>';

// Triangles
shapeButtons += '\\n              <p className="text-[8px] text-gray-400 mt-1 mb-1">Triangles</p>';
shapeButtons += '\\n              <div className="grid grid-cols-4 gap-1 mb-2">';
shapeButtons += '\\n                <button onClick={addTriangle} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Triangle">▲</button>';
shapeButtons += '\\n                <button onClick={addRightTriangle} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Right">◣</button>';
shapeButtons += '\\n                <button onClick={addLeftTriangle} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Left">◢</button>';
shapeButtons += '\\n              </div>';

// Polygons
shapeButtons += '\\n              <p className="text-[8px] text-gray-400 mt-1 mb-1">Polygons</p>';
shapeButtons += '\\n              <div className="grid grid-cols-4 gap-1 mb-2">';
shapeButtons += '\\n                <button onClick={addPentagon} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Pentagon">⬠</button>';
shapeButtons += '\\n                <button onClick={addHexagon} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Hexagon">⬡</button>';
shapeButtons += '\\n                <button onClick={addOctagon} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Octagon">⯃</button>';
shapeButtons += '\\n                <button onClick={addDiamond} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Diamond">◆</button>';
shapeButtons += '\\n                <button onClick={addParallelogram} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Parallelogram">▱</button>';
shapeButtons += '\\n                <button onClick={addTrapezoid} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Trapezoid">⏢</button>';
shapeButtons += '\\n              </div>';

// Stars
shapeButtons += '\\n              <p className="text-[8px] text-gray-400 mt-1 mb-1">Stars & Badges</p>';
shapeButtons += '\\n              <div className="grid grid-cols-4 gap-1 mb-2">';
shapeButtons += '\\n                <button onClick={addStar} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Star 5">★</button>';
shapeButtons += '\\n                <button onClick={addStar6} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Star 6">✡</button>';
shapeButtons += '\\n                <button onClick={addBadge} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Badge">✺</button>';
shapeButtons += '\\n              </div>';

// Curves
shapeButtons += '\\n              <p className="text-[8px] text-gray-400 mt-1 mb-1">Curves & Arcs</p>';
shapeButtons += '\\n              <div className="grid grid-cols-4 gap-1 mb-2">';
shapeButtons += '\\n                <button onClick={addSemiCircle} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Semi Circle">◗</button>';
shapeButtons += '\\n                <button onClick={addArc} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Arc">⌒</button>';
shapeButtons += '\\n                <button onClick={addWave} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Wave">∿</button>';
shapeButtons += '\\n                <button onClick={addFan} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Fan">◔</button>';
shapeButtons += '\\n                <button onClick={addSpiral} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Spiral">🌀</button>';
shapeButtons += '\\n              </div>';

// Bubbles
shapeButtons += '\\n              <p className="text-[8px] text-gray-400 mt-1 mb-1">Bubbles & Special</p>';
shapeButtons += '\\n              <div className="grid grid-cols-4 gap-1 mb-2">';
shapeButtons += '\\n                <button onClick={addSpeechBubble} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Speech Bubble">💬</button>';
shapeButtons += '\\n                <button onClick={addCloud} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Cloud">☁</button>';
shapeButtons += '\\n                <button onClick={addMoon} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Moon">☽</button>';
shapeButtons += '\\n                <button onClick={addRing} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Ring">◎</button>';
shapeButtons += '\\n                <button onClick={addRoundedSquare} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Rounded Square">▢</button>';
shapeButtons += '\\n                <button onClick={addLightning} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Lightning">⚡</button>';
shapeButtons += '\\n                <button onClick={addPlus} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Plus">➕</button>';
shapeButtons += '\\n                <button onClick={addHeart} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Heart">♥</button>';
shapeButtons += '\\n                <button onClick={addCross} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Cross">✚</button>';
shapeButtons += '\\n                <button onClick={addArrow} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Arrow">➤</button>';
shapeButtons += '\\n                <button onClick={addChevron} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Chevron">›</button>';
shapeButtons += '\\n                <button onClick={addRibbon} className="p-1 text-[10px] border rounded hover:bg-gray-100" title="Ribbon">⚑</button>';
shapeButtons += '\\n              </div>';
shapeButtons += '\\n            </div>';

// Replace from Shape header to </select> + closing divs
// Find the exact range to replace
var afterSelect = code.indexOf('</select>', selectStart) + '</select>'.length;
// Skip closing </div></div></div> after select
var replaceEnd = afterSelect;
var remaining = code.substring(afterSelect);
// Skip whitespace and </div> tags until IMAGE comment
var match = remaining.match(/^[\s\n]*(<\/div>[\s\n]*)*(?=\{\/\* .* IMAGE)/);
if (match) {
  replaceEnd = afterSelect + match[0].length;
}

var beforeShape = code.substring(0, shapeStart);
var afterShape = code.substring(replaceEnd);
code = beforeShape + shapeButtons + '\\n          </div>\\n          </div>\\n' + afterShape;
changes++;
console.log('2. Shape: select -> button grid with categories');

// 3. Add "shape" to default open sections
code = code.replace('new Set(["text","image","tools"])', 'new Set(["text","shape","image"])');
changes++;
console.log('3. Default sections: text, shape, image');

fs.writeFileSync(file, code, 'utf8');
console.log('Done! ' + changes + ' changes. Check browser.');
