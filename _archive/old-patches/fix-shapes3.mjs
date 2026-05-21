import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");
const lines = code.split('\n');
let changes = 0;

// 1. Find "const uploadImage" line and insert shape functions before it
let uploadLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const uploadImage = useCallback')) { uploadLine = i; break; }
}

if (uploadLine >= 0 && !code.includes('const addSemiCircle')) {
  const shapeFuncs = `
  const addSemiCircle = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    const p = new Path('M 0 50 A 50 50 0 0 1 100 50 L 0 50 Z', {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center', fill: color,
    });
    c.add(p); c.setActiveObject(p); c.renderAll(); refreshLayers();
  }, [color]);

  const addArc = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    const p = new Path('M 0 60 Q 50 0, 100 60', {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center',
      fill: 'transparent', stroke: color, strokeWidth: 3,
    });
    c.add(p); c.setActiveObject(p); c.renderAll(); refreshLayers();
  }, [color]);

  const addWave = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    const p = new Path('M 0 30 Q 25 0, 50 30 Q 75 60, 100 30 Q 125 0, 150 30', {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center',
      fill: 'transparent', stroke: color, strokeWidth: 3,
    });
    c.add(p); c.setActiveObject(p); c.renderAll(); refreshLayers();
  }, [color]);

  const addFan = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    const p = new Path('M 50 50 L 50 0 A 50 50 0 0 1 93 25 Z', {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center', fill: color,
    });
    c.add(p); c.setActiveObject(p); c.renderAll(); refreshLayers();
  }, [color]);

  const addSpeechBubble = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    const p = new Path('M 10 0 L 110 0 Q 120 0, 120 10 L 120 60 Q 120 70, 110 70 L 40 70 L 20 90 L 30 70 L 10 70 Q 0 70, 0 60 L 0 10 Q 0 0, 10 0 Z', {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center', fill: color,
    });
    c.add(p); c.setActiveObject(p); c.renderAll(); refreshLayers();
  }, [color]);

  const addCloud = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    const p = new Path('M 25 60 Q 0 60, 5 45 Q 0 30, 15 25 Q 10 10, 30 10 Q 35 0, 50 5 Q 65 0, 70 10 Q 85 5, 90 20 Q 105 20, 100 35 Q 110 45, 95 55 Q 100 65, 85 60 Z', {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center', fill: color,
    });
    c.add(p); c.setActiveObject(p); c.renderAll(); refreshLayers();
  }, [color]);

  const addMoon = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    const p = new Path('M 40 0 A 50 50 0 1 0 40 100 A 35 35 0 1 1 40 0 Z', {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center', fill: color,
    });
    c.add(p); c.setActiveObject(p); c.renderAll(); refreshLayers();
  }, [color]);

  const addRing = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    const p = new Path('M 50 0 A 50 50 0 1 0 50 100 A 50 50 0 1 0 50 0 Z M 50 15 A 35 35 0 1 1 50 85 A 35 35 0 1 1 50 15 Z', {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center', fill: color,
    });
    c.add(p); c.setActiveObject(p); c.renderAll(); refreshLayers();
  }, [color]);

  const addPlus = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    const p = new Path('M 35 0 L 65 0 L 65 35 L 100 35 L 100 65 L 65 65 L 65 100 L 35 100 L 35 65 L 0 65 L 0 35 L 35 35 Z', {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center',
      fill: 'transparent', stroke: color, strokeWidth: 2,
    });
    c.add(p); c.setActiveObject(p); c.renderAll(); refreshLayers();
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
    c.add(p); c.setActiveObject(p); c.renderAll(); refreshLayers();
  }, [color]);

  const addLightning = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Polygon } = await import('fabric');
    const p = new Polygon([
      {x:40,y:0},{x:70,y:0},{x:50,y:35},{x:75,y:35},{x:30,y:90},{x:45,y:50},{x:20,y:50}
    ], {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center', fill: color,
    });
    c.add(p); c.setActiveObject(p); c.renderAll(); refreshLayers();
  }, [color]);

  const addRoundedSquare = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Rect } = await import('fabric');
    const r = new Rect({
      left: c.width/2, top: c.height/2, originX:'center', originY:'center',
      width: 80, height: 80, rx: 20, ry: 20, fill: color,
    });
    c.add(r); c.setActiveObject(r); c.renderAll(); refreshLayers();
  }, [color]);
`;

  lines.splice(uploadLine, 0, ...shapeFuncs.split('\n'));
  changes++;
  console.log("1. Added " + 13 + " new shape functions at line " + uploadLine);
}

// Rejoin and handle remaining fixes
code = lines.join('\n');

// 2. Add dropdown options if missing
if (!code.includes('Curves & Arcs')) {
  const optAnchor = `<optgroup label="Special">
                <option value="heart">`;
  const optReplace = `<optgroup label="Curves & Arcs">
                <option value="semiCircle">\u25D7 Semi Circle</option>
                <option value="arc">\u2312 Arc</option>
                <option value="wave">\u223F Wave</option>
                <option value="fan">\u25D4 Fan</option>
                <option value="spiral">\uD83C\uDF00 Spiral</option>
              </optgroup>
              <optgroup label="Bubbles & Shapes">
                <option value="speechBubble">\uD83D\uDCAC Speech Bubble</option>
                <option value="cloud">\u2601 Cloud</option>
                <option value="moon">\u263D Moon</option>
                <option value="ring">\u25CE Ring</option>
                <option value="roundedSquare">\u25A2 Rounded Square</option>
              </optgroup>
              <optgroup label="Symbols">
                <option value="lightning">\u26A1 Lightning</option>
                <option value="plus">\u2795 Plus (outline)</option>
              </optgroup>
              <optgroup label="Special">
                <option value="heart">`;
  if (code.includes(optAnchor)) {
    code = code.replace(optAnchor, optReplace);
    changes++;
    console.log("2. Added dropdown options");
  }
}

// 3. Fix Draw button - create PencilBrush manually
const oldDraw = `c.isDrawingMode = true;
              if (c.freeDrawingBrush) {
                c.freeDrawingBrush.color = color;
                c.freeDrawingBrush.width = brushSize;
              }`;
const newDraw = `c.isDrawingMode = true;
              import('fabric').then(F => {
                const brush = new F.PencilBrush(c);
                brush.color = color;
                brush.width = brushSize;
                c.freeDrawingBrush = brush;
              });`;
if (code.includes(oldDraw)) {
  code = code.replace(oldDraw, newDraw);
  changes++;
  console.log("3. Fixed Draw brush initialization");
}

// 4. Fix pen color change in draw mode - add color sync
const oldPenSize = `if (c && c.freeDrawingBrush) c.freeDrawingBrush.width = s;`;
const newPenSize = `if (c && c.freeDrawingBrush) { c.freeDrawingBrush.width = s; c.freeDrawingBrush.color = color; }`;
if (code.includes(oldPenSize)) {
  code = code.replace(oldPenSize, newPenSize);
  changes++;
  console.log("4. Fixed pen size/color sync");
}

if (changes > 0) {
  writeFileSync(f, code, "utf8");
  console.log("Done! Applied " + changes + " changes");
} else {
  console.log("No changes applied");
}
