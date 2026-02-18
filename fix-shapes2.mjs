import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");
let changes = 0;

// 1. Remove duplicate actions block
const dupActions = `                  semiCircle: addSemiCircle, arc: addArc, wave: addWave, fan: addFan, spiral: addSpiral,
                  speechBubble: addSpeechBubble, cloud: addCloud, moon: addMoon, ring: addRing,
                  roundedSquare: addRoundedSquare, lightning: addLightning, plus: addPlus,
                  semiCircle: addSemiCircle, arc: addArc, wave: addWave, fan: addFan, spiral: addSpiral,
                  speechBubble: addSpeechBubble, cloud: addCloud, moon: addMoon, ring: addRing,
                  roundedSquare: addRoundedSquare, lightning: addLightning, plus: addPlus,`;
const singleActions = `                  semiCircle: addSemiCircle, arc: addArc, wave: addWave, fan: addFan, spiral: addSpiral,
                  speechBubble: addSpeechBubble, cloud: addCloud, moon: addMoon, ring: addRing,
                  roundedSquare: addRoundedSquare, lightning: addLightning, plus: addPlus,`;
if (code.includes(dupActions)) {
  code = code.replace(dupActions, singleActions);
  changes++;
  console.log("1. Removed duplicate actions");
}

// 2. Remove duplicate Draw button - find and remove the second one
const drawBtnStart = '<ToolButton label={drawMode ? "Drawing" : "Draw"} icon="✏"';
const firstIdx = code.indexOf(drawBtnStart);
const secondIdx = code.indexOf(drawBtnStart, firstIdx + 1);
if (secondIdx > firstIdx && firstIdx >= 0) {
  // Find the end of second draw block including the drawMode && conditional
  let endSearch = secondIdx;
  // Find the closing of {drawMode && ( ... )} block after second button
  const afterSecond = code.indexOf('{drawMode && (', endSearch);
  if (afterSecond > 0) {
    // Find matching closing
    let depth = 0;
    let cutEnd = afterSecond;
    for (let i = afterSecond; i < code.length; i++) {
      if (code[i] === '{') depth++;
      if (code[i] === '}') { depth--; if (depth === 0) { cutEnd = i + 1; break; } }
    }
    // Cut from second ToolButton start to end of conditional block
    // Find the start of the line with second ToolButton
    let lineStart = secondIdx;
    while (lineStart > 0 && code[lineStart-1] !== '\n') lineStart--;
    code = code.substring(0, lineStart) + code.substring(cutEnd);
    changes++;
    console.log("2. Removed duplicate Draw button block");
  }
}

// 3. Add shape functions if missing
if (!code.includes('const addSemiCircle')) {
  const funcAnchor = "c.add(b); c.setActiveObject(b); c.renderAll();\n  }, [color]);\n\n\n  const uploadImage";
  const newFuncs = `c.add(b); c.setActiveObject(b); c.renderAll();
  }, [color]);

  const addSemiCircle = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    const p = new Path('M 0 50 A 50 50 0 0 1 100 50 L 0 50 Z', {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center', fill: color,
    });
    c.add(p); c.setActiveObject(p); c.renderAll();
  }, [color]);

  const addArc = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    const p = new Path('M 0 60 Q 50 0, 100 60', {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center',
      fill: 'transparent', stroke: color, strokeWidth: 3,
    });
    c.add(p); c.setActiveObject(p); c.renderAll();
  }, [color]);

  const addWave = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    const p = new Path('M 0 30 Q 25 0, 50 30 Q 75 60, 100 30 Q 125 0, 150 30', {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center',
      fill: 'transparent', stroke: color, strokeWidth: 3,
    });
    c.add(p); c.setActiveObject(p); c.renderAll();
  }, [color]);

  const addFan = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    const p = new Path('M 50 50 L 50 0 A 50 50 0 0 1 93 25 Z', {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center', fill: color,
    });
    c.add(p); c.setActiveObject(p); c.renderAll();
  }, [color]);

  const addSpeechBubble = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    const p = new Path('M 10 0 L 110 0 Q 120 0, 120 10 L 120 60 Q 120 70, 110 70 L 40 70 L 20 90 L 30 70 L 10 70 Q 0 70, 0 60 L 0 10 Q 0 0, 10 0 Z', {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center', fill: color,
    });
    c.add(p); c.setActiveObject(p); c.renderAll();
  }, [color]);

  const addCloud = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    const p = new Path('M 25 60 Q 0 60, 5 45 Q 0 30, 15 25 Q 10 10, 30 10 Q 35 0, 50 5 Q 65 0, 70 10 Q 85 5, 90 20 Q 105 20, 100 35 Q 110 45, 95 55 Q 100 65, 85 60 Z', {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center', fill: color,
    });
    c.add(p); c.setActiveObject(p); c.renderAll();
  }, [color]);

  const addMoon = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    const p = new Path('M 40 0 A 50 50 0 1 0 40 100 A 35 35 0 1 1 40 0 Z', {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center', fill: color,
    });
    c.add(p); c.setActiveObject(p); c.renderAll();
  }, [color]);

  const addRing = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    const p = new Path('M 50 0 A 50 50 0 1 0 50 100 A 50 50 0 1 0 50 0 Z M 50 15 A 35 35 0 1 1 50 85 A 35 35 0 1 1 50 15 Z', {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center', fill: color,
    });
    c.add(p); c.setActiveObject(p); c.renderAll();
  }, [color]);

  const addPlus = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    const p = new Path('M 35 0 L 65 0 L 65 35 L 100 35 L 100 65 L 65 65 L 65 100 L 35 100 L 35 65 L 0 65 L 0 35 L 35 35 Z', {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center',
      fill: 'transparent', stroke: color, strokeWidth: 2,
    });
    c.add(p); c.setActiveObject(p); c.renderAll();
  }, [color]);

  const addSpiral = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    let d = 'M 50 50';
    for (let i = 0; i < 720; i += 10) {
      const r = 2 + i * 0.06;
      const rad = (i * Math.PI) / 180;
      d += ' L ' + (50 + r * Math.cos(rad)).toFixed(1) + ' ' + (50 + r * Math.sin(rad)).toFixed(1);
    }
    const p = new Path(d, {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center',
      fill: 'transparent', stroke: color, strokeWidth: 2,
    });
    c.add(p); c.setActiveObject(p); c.renderAll();
  }, [color]);

  const addLightning = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Polygon } = await import('fabric');
    const p = new Polygon([
      {x:40,y:0},{x:70,y:0},{x:50,y:35},{x:75,y:35},{x:30,y:90},{x:45,y:50},{x:20,y:50}
    ], {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center', fill: color,
    });
    c.add(p); c.setActiveObject(p); c.renderAll();
  }, [color]);

  const addRoundedSquare = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Rect } = await import('fabric');
    const r = new Rect({
      left: c.width/2, top: c.height/2, originX:'center', originY:'center',
      width: 80, height: 80, rx: 20, ry: 20, fill: color,
    });
    c.add(r); c.setActiveObject(r); c.renderAll();
  }, [color]);


  const uploadImage`;

  if (code.includes(funcAnchor)) {
    code = code.replace(funcAnchor, newFuncs);
    changes++;
    console.log("3. Added shape functions");
  } else {
    console.log("3. Shape function anchor not found");
  }
}

// 4. Add dropdown options if missing
if (!code.includes('Curves & Arcs')) {
  const optAnchor = `              <optgroup label="Special">
                <option value="heart">♥ Heart</option>
                <option value="cross">✚ Cross</option>
                <option value="arrow">➤ Arrow</option>
                <option value="chevron">› Chevron</option>
                <option value="ribbon">⚑ Ribbon</option>
              </optgroup>`;
  const optReplace = `              <optgroup label="Curves & Arcs">
                <option value="semiCircle">◗ Semi Circle</option>
                <option value="arc">⌒ Arc</option>
                <option value="wave">∿ Wave</option>
                <option value="fan">◔ Fan</option>
                <option value="spiral">🌀 Spiral</option>
              </optgroup>
              <optgroup label="Bubbles & Shapes">
                <option value="speechBubble">💬 Speech Bubble</option>
                <option value="cloud">☁ Cloud</option>
                <option value="moon">☽ Moon</option>
                <option value="ring">◎ Ring</option>
                <option value="roundedSquare">▢ Rounded Square</option>
              </optgroup>
              <optgroup label="Symbols">
                <option value="lightning">⚡ Lightning</option>
                <option value="plus">➕ Plus (outline)</option>
              </optgroup>
              <optgroup label="Special">
                <option value="heart">♥ Heart</option>
                <option value="cross">✚ Cross</option>
                <option value="arrow">➤ Arrow</option>
                <option value="chevron">› Chevron</option>
                <option value="ribbon">⚑ Ribbon</option>
              </optgroup>`;
  if (code.includes(optAnchor)) {
    code = code.replace(optAnchor, optReplace);
    changes++;
    console.log("4. Added dropdown options");
  } else {
    console.log("4. Dropdown anchor not found");
  }
}

if (changes > 0) {
  writeFileSync(f, code, "utf8");
  console.log("Done! Applied " + changes + " changes");
} else {
  console.log("No changes applied");
}
