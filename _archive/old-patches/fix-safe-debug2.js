const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');

// addSafeZone에서 rect 추가 후 실제 bounding rect를 로그
code = code.replace(
  'canvas.bringObjectToFront(sr);',
  `canvas.bringObjectToFront(sr);
      // DEBUG: log actual rendered positions
      canvas.renderAll();
      const srBound = sr.getBoundingRect();
      console.log("[SafeZone DEBUG] sr.left:", sr.left, "sr.top:", sr.top, "sr.width:", sr.width, "sr.height:", sr.height);
      console.log("[SafeZone DEBUG] boundingRect:", JSON.stringify(srBound));
      console.log("[SafeZone DEBUG] canvas:", cw, "x", ch, "right-gap:", cw - sr.left - sr.width, "bottom-gap:", ch - sr.top - sr.height);
      console.log("[SafeZone DEBUG] strokeWidth:", sr.strokeWidth, "strokeUniform:", sr.strokeUniform);`
);

fs.writeFileSync(file, code, 'utf8');
console.log('Debug logs added');
