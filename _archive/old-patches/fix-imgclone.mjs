import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");
let changes = 0;

// 1. Fix Ctrl+D block - replace image clone with toDataURL approach
const oldCtrlD = `if ((e.ctrlKey || e.metaKey) && e.code === "KeyD") {
          e.preventDefault();
          const obj = canvas.getActiveObject();
          if (obj) {
            if (obj.type === "image") {
              const { FabricImage } = await import("fabric");
              const src = (obj as any).getSrc ? (obj as any).getSrc() : (obj as any)._element?.src;
              if (src) {
                const img = await FabricImage.fromURL(src);
                img.set({ left: (obj.left||0)+20, top: (obj.top||0)+20, scaleX: (obj as any).scaleX, scaleY: (obj as any).scaleY, angle: obj.angle });
                canvas.add(img); canvas.setActiveObject(img); canvas.renderAll(); refreshLayers();
              }
            } else {
              const cl = await obj.clone();
              cl.set({ left: (cl.left||0)+20, top: (cl.top||0)+20 });
              canvas.add(cl); canvas.setActiveObject(cl); canvas.renderAll(); refreshLayers();
            }
          }
        }`;

const newCtrlD = `if ((e.ctrlKey || e.metaKey) && e.code === "KeyD") {
          e.preventDefault(); e.stopPropagation();
          const obj = canvas.getActiveObject();
          if (obj) {
            if (obj.type === "image") {
              const { FabricImage } = await import("fabric");
              const tmpCanvas = document.createElement("canvas");
              const o = obj as any;
              tmpCanvas.width = o.getScaledWidth();
              tmpCanvas.height = o.getScaledHeight();
              const tmpCtx = tmpCanvas.getContext("2d");
              if (tmpCtx && o._element) {
                tmpCtx.drawImage(o._element, 0, 0, tmpCanvas.width, tmpCanvas.height);
                const dataUrl = tmpCanvas.toDataURL("image/png");
                const img = await FabricImage.fromURL(dataUrl);
                img.set({ left: (obj.left||0)+20, top: (obj.top||0)+20, scaleX: 1, scaleY: 1, angle: obj.angle });
                canvas.add(img); canvas.setActiveObject(img); canvas.renderAll(); refreshLayers();
              }
            } else {
              const cl = await obj.clone();
              cl.set({ left: (cl.left||0)+20, top: (cl.top||0)+20 });
              canvas.add(cl); canvas.setActiveObject(cl); canvas.renderAll(); refreshLayers();
            }
          }
        }`;

if (code.includes('if ((e.ctrlKey || e.metaKey) && e.code === "KeyD")')) {
  code = code.replace(oldCtrlD, newCtrlD);
  changes++;
  console.log("1. Fixed Ctrl+D image clone");
}

// 2. Fix Clone button - same approach
const oldCloneBtn = `if (obj.type === "image") {
              const { FabricImage } = await import("fabric");
              const src = (obj as any).getSrc ? (obj as any).getSrc() : (obj as any)._element?.src;
              if (src) {
                const img = await FabricImage.fromURL(src);
                img.set({ left: (obj.left||0)+20, top: (obj.top||0)+20, scaleX: (obj as any).scaleX, scaleY: (obj as any).scaleY, angle: obj.angle });
                c.add(img); c.setActiveObject(img); c.renderAll(); refreshLayers();
              }`;

const newCloneBtn = `if (obj.type === "image") {
              const { FabricImage } = await import("fabric");
              const tmpCanvas = document.createElement("canvas");
              const o = obj as any;
              tmpCanvas.width = o.getScaledWidth();
              tmpCanvas.height = o.getScaledHeight();
              const tmpCtx = tmpCanvas.getContext("2d");
              if (tmpCtx && o._element) {
                tmpCtx.drawImage(o._element, 0, 0, tmpCanvas.width, tmpCanvas.height);
                const dataUrl = tmpCanvas.toDataURL("image/png");
                const img = await FabricImage.fromURL(dataUrl);
                img.set({ left: (obj.left||0)+20, top: (obj.top||0)+20, scaleX: 1, scaleY: 1, angle: obj.angle });
                c.add(img); c.setActiveObject(img); c.renderAll(); refreshLayers();
              }`;

if (code.includes(oldCloneBtn)) {
  code = code.replace(oldCloneBtn, newCloneBtn);
  changes++;
  console.log("2. Fixed Clone button image clone");
}

writeFileSync(f, code, "utf8");
console.log("Done! Changes: " + changes);
