import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");
let changes = 0;

// 1. Add cropMode state after measureMode state
const stateAnchor = `const [measureMode, setMeasureMode] = useState(false);`;
const stateInsert = `const [measureMode, setMeasureMode] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const cropRectRef = useRef<any>(null);
  const cropTargetRef = useRef<any>(null);`;
if (code.includes(stateAnchor) && !code.includes('cropMode')) {
  code = code.replace(stateAnchor, stateInsert);
  changes++;
  console.log("1. Added cropMode state");
}

// 2. Add Crop button after Image ToolButton
const imgBtnAnchor = `<ToolButton label="Image" icon="🖼" onClick={uploadImage} />

          <hr className="w-10 border-gray-200" />`;
const imgBtnReplace = `<ToolButton label="Image" icon="🖼" onClick={uploadImage} />
          <ToolButton label={cropMode ? "Cropping..." : "Crop"} icon="✂" onClick={() => {
            const c = fcRef.current; if (!c) return;
            if (cropMode) {
              // Apply crop
              const rect = cropRectRef.current;
              const target = cropTargetRef.current;
              if (rect && target && target.type === 'image') {
                const tl = target.left || 0;
                const tt = target.top || 0;
                const tsx = target.scaleX || 1;
                const tsy = target.scaleY || 1;
                const rl = rect.left || 0;
                const rt = rect.top || 0;
                const rw = (rect.width || 0) * (rect.scaleX || 1);
                const rh = (rect.height || 0) * (rect.scaleY || 1);
                // Calculate crop area relative to original image
                const originX = target.originX === 'center' ? tl - (target.width * tsx) / 2 : tl;
                const originY = target.originY === 'center' ? tt - (target.height * tsy) / 2 : tt;
                const rectOriginX = rect.originX === 'center' ? rl - rw / 2 : rl;
                const rectOriginY = rect.originY === 'center' ? rt - rh / 2 : rt;
                const cropX = (rectOriginX - originX) / tsx;
                const cropY = (rectOriginY - originY) / tsy;
                const cropW = rw / tsx;
                const cropH = rh / tsy;
                // Use offscreen canvas to crop
                const el = (target as any)._element || (target as any).getElement();
                if (el) {
                  const offscreen = document.createElement('canvas');
                  const natW = el.naturalWidth || el.width;
                  const natH = el.naturalHeight || el.height;
                  const imgScaleX = (target.width || natW) / natW;
                  const imgScaleY = (target.height || natH) / natH;
                  const sx = Math.max(0, Math.round(cropX / imgScaleX));
                  const sy = Math.max(0, Math.round(cropY / imgScaleY));
                  const sw = Math.min(Math.round(cropW / imgScaleX), natW - sx);
                  const sh = Math.min(Math.round(cropH / imgScaleY), natH - sy);
                  offscreen.width = sw;
                  offscreen.height = sh;
                  const ctx2 = offscreen.getContext('2d')!;
                  ctx2.drawImage(el, sx, sy, sw, sh, 0, 0, sw, sh);
                  const dataUrl = offscreen.toDataURL('image/png');
                  import('fabric').then(F => {
                    F.FabricImage.fromURL(dataUrl).then((newImg: any) => {
                      newImg.set({
                        left: rectOriginX,
                        top: rectOriginY,
                        originX: 'left',
                        originY: 'top',
                        scaleX: rw / sw,
                        scaleY: rh / sh,
                      });
                      newImg.setCoords();
                      c.remove(target);
                      c.remove(rect);
                      c.add(newImg);
                      c.setActiveObject(newImg);
                      c.requestRenderAll();
                    });
                  });
                }
              } else if (rect) {
                c.remove(rect);
              }
              cropRectRef.current = null;
              cropTargetRef.current = null;
              setCropMode(false);
              return;
            }
            // Start crop mode
            const obj = c.getActiveObject() as any;
            if (!obj || obj.type !== 'image') {
              alert('Please select an image first');
              return;
            }
            setCropMode(true);
            cropTargetRef.current = obj;
            const ol = obj.originX === 'center' ? (obj.left || 0) - (obj.width * (obj.scaleX||1)) / 2 : (obj.left || 0);
            const ot = obj.originY === 'center' ? (obj.top || 0) - (obj.height * (obj.scaleY||1)) / 2 : (obj.top || 0);
            const ow = obj.width * (obj.scaleX || 1);
            const oh = obj.height * (obj.scaleY || 1);
            import('fabric').then(F => {
              const cropRect = new F.Rect({
                left: ol + ow * 0.1,
                top: ot + oh * 0.1,
                width: ow * 0.8,
                height: oh * 0.8,
                fill: 'rgba(0,120,255,0.15)',
                stroke: '#0078ff',
                strokeWidth: 2,
                strokeDashArray: [5, 5],
                originX: 'left',
                originY: 'top',
                cornerColor: '#0078ff',
                cornerSize: 8,
                transparentCorners: false,
                hasRotatingPoint: false,
                lockRotation: true,
              });
              (cropRect as any)._isCropRect = true;
              c.add(cropRect);
              c.setActiveObject(cropRect);
              c.requestRenderAll();
              cropRectRef.current = cropRect;
            });
          }} />

          <hr className="w-10 border-gray-200" />`;

if (code.includes(imgBtnAnchor) && !code.includes('_isCropRect')) {
  code = code.replace(imgBtnAnchor, imgBtnReplace);
  changes++;
  console.log("2. Added Crop button");
}

if (changes > 0) {
  writeFileSync(f, code, "utf8");
  console.log("Done! Applied " + changes + " changes for Crop feature");
} else {
  console.log("No changes applied. Patterns not found.");
  // Debug: check what's around Image button
  const idx = code.indexOf('label="Image"');
  if (idx >= 0) console.log("Image btn context:", code.substring(idx, idx + 200));
}
