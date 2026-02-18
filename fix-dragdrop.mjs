import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let lines = readFileSync(f, "utf8").split("\n");

// Find the canvas wrapper div with ref={wrapperRef}
let wrapperIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ref={wrapperRef}') && lines[i].includes('flex-1')) {
    wrapperIdx = i;
    break;
  }
}

if (wrapperIdx === -1) { console.log("ERROR: wrapperRef div not found"); process.exit(1); }

// Replace the wrapper line to add drag & drop handlers
const oldLine = lines[wrapperIdx];
const newLine = oldLine.replace(
  'className="flex-1',
  `onDragOver={e => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = "copy"; }}
          onDrop={async e => {
            e.preventDefault(); e.stopPropagation();
            const c = fcRef.current; if (!c) return;
            const files = e.dataTransfer.files;
            if (!files || files.length === 0) return;
            const { FabricImage } = await import("fabric");
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              if (!file.type.startsWith("image/")) continue;
              const url = URL.createObjectURL(file);
              try {
                const img = await FabricImage.fromURL(url);
                const maxW = c.width * 0.6;
                const maxH = c.height * 0.6;
                const sc = Math.min(maxW / (img.width || 1), maxH / (img.height || 1), 1);
                img.set({ left: c.width / 2, top: c.height / 2, originX: "center", originY: "center", scaleX: sc, scaleY: sc });
                c.add(img); c.setActiveObject(img); c.renderAll();
                refreshLayers();
              } catch (err) { console.error("Drop image error:", err); }
              URL.revokeObjectURL(url);
            }
          }}
          className="flex-1`
);

lines[wrapperIdx] = newLine;
writeFileSync(f, lines.join("\n"), "utf8");
console.log("Done! Drag & drop added to canvas wrapper at line " + (wrapperIdx + 1));
