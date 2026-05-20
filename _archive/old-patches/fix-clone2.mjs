import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let lines = readFileSync(f, "utf8").split("\n");
let changes = 0;

// 1. Fix Ctrl+D - add e.preventDefault()
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("// Ctrl+D = Duplicate")) {
    // Next line should be the if statement
    const ifLine = i + 1;
    // Find the line after the if { opening
    // Replace the entire Ctrl+D block
    let blockEnd = -1;
    for (let j = ifLine; j < ifLine + 10; j++) {
      if (lines[j].trim().startsWith("if (obj) { obj.clone()")) {
        blockEnd = j;
        break;
      }
    }
    if (blockEnd === -1) continue;
    
    // Replace from ifLine to blockEnd+1
    const newBlock = [
      '        if ((e.ctrlKey || e.metaKey) && e.code === "KeyD") {',
      '          e.preventDefault();',
      '          const obj = canvas.getActiveObject();',
      '          if (obj) {',
      '            if (obj.type === "image") {',
      '              const { FabricImage } = await import("fabric");',
      '              const src = (obj as any).getSrc ? (obj as any).getSrc() : (obj as any)._element?.src;',
      '              if (src) {',
      '                const img = await FabricImage.fromURL(src);',
      '                img.set({ left: (obj.left||0)+20, top: (obj.top||0)+20, scaleX: (obj as any).scaleX, scaleY: (obj as any).scaleY, angle: obj.angle });',
      '                canvas.add(img); canvas.setActiveObject(img); canvas.renderAll(); refreshLayers();',
      '              }',
      '            } else {',
      '              const cl = await obj.clone();',
      '              cl.set({ left: (cl.left||0)+20, top: (cl.top||0)+20 });',
      '              canvas.add(cl); canvas.setActiveObject(cl); canvas.renderAll(); refreshLayers();',
      '            }',
      '          }',
      '        }',
    ];
    lines.splice(ifLine, blockEnd - ifLine + 1, ...newBlock);
    changes++;
    console.log("1. Fixed Ctrl+D block (preventDefault + image clone)");
    break;
  }
}

// 2. Make keyHandler async
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const keyHandler = (e:") || lines[i].includes("const keyHandler = (e :")) {
    lines[i] = lines[i].replace("const keyHandler = (e:", "const keyHandler = async (e:");
    changes++;
    console.log("2. Made keyHandler async at line " + (i+1));
    break;
  }
}

// 3. Fix Clone button for images
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ToolButton label="Clone"')) {
    // Find the block end
    let blockEnd = -1;
    for (let j = i; j < i + 15; j++) {
      if (lines[j].includes("}} />") && j > i) {
        blockEnd = j;
        break;
      }
    }
    if (blockEnd === -1) continue;
    
    const newClone = [
      '          <ToolButton label="Clone" icon="\uD83D\uDCCB" onClick={async () => {',
      '            const c = fcRef.current; if (!c) return;',
      '            const obj = c.getActiveObject();',
      '            if (!obj) return;',
      '            if (obj.type === "image") {',
      '              const { FabricImage } = await import("fabric");',
      '              const src = (obj as any).getSrc ? (obj as any).getSrc() : (obj as any)._element?.src;',
      '              if (src) {',
      '                const img = await FabricImage.fromURL(src);',
      '                img.set({ left: (obj.left||0)+20, top: (obj.top||0)+20, scaleX: (obj as any).scaleX, scaleY: (obj as any).scaleY, angle: obj.angle });',
      '                c.add(img); c.setActiveObject(img); c.renderAll(); refreshLayers();',
      '              }',
      '            } else {',
      '              const cloned = await obj.clone();',
      '              cloned.set({ left: (obj.left||0)+20, top: (obj.top||0)+20 });',
      '              c.add(cloned); c.setActiveObject(cloned); c.renderAll(); refreshLayers();',
      '            }',
      '          }} />',
    ];
    lines.splice(i, blockEnd - i + 1, ...newClone);
    changes++;
    console.log("3. Fixed Clone button for image support");
    break;
  }
}

writeFileSync(f, lines.join("\n"), "utf8");
console.log("Done! Changes: " + changes);
