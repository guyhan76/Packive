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

// 2. Add Crop button - exact pattern from file
const imgBtnAnchor = `<ToolButton label="Image" icon="\u{1F5BC}" onClick={uploadImage} />

          <hr className="w-10 border-gray-200" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-gray-400">Color</span>`;

const imgBtnReplace = `<ToolButton label="Image" icon="\u{1F5BC}" onClick={uploadImage} />
          <ToolButton label={cropMode ? "Cropping..." : "Crop"} icon="\u2702" onClick={() => {
            const c = fcRef.current; if (!c) return;
            if (cropMode) {
              const rect = cropRectRef.current;
              const target = cropTargetRef.current;
              if (rect && target && target.type === 'image') {
                const tsx = target.scaleX || 1;
                const tsy = target.scaleY || 1;
                const originX = target.originX === 'center' ? (target.left||0) - (target.width*tsx)/2 : (target.left||0);
                const originY = target.originY === 'center' ? (target.top||0) - (target.height*tsy)/2 : (target.top||0);
                const rsx = rect.scaleX || 1;
                const rsy = rect.scaleY || 1;
                const rw = (rect.width||0) * rsx;
                const rh = (rect.height||0) * rsy;
                const rectOX = rect.originX === 'center' ? (rect.left||0) - rw/2 : (rect.left||0);
                const rectOY = rect.originY === 'center' ? (rect.top||0) - rh/2 : (rect.top||0);
                const cropX = (rectOX - originX) / tsx;
                const cropY = (rectOY - originY) / tsy;
                const cropW = rw / tsx;
                const cropH = rh / tsy;
                const el = (target as any)._element || (target as any).getElement?.();
                if (el) {
                  const natW = el.naturalWidth || el.width;
                  const natH = el.naturalHeight || el.height;
                  const imgSX = (target.width || natW) / natW;
                  const imgSY = (target.height || natH) / natH;
                  const sx = Math.max(0, Math.round(cropX / imgSX));
                  const sy = Math.max(0, Math.round(cropY / imgSY));
                  const sw = Math.min(Math.round(cropW / imgSX), natW - sx);
                  const sh = Math.min(Math.round(cropH / imgSY), natH - sy);
                  const offscreen = document.createElement('canvas');
                  offscreen.width = sw; offscreen.height = sh;
                  const ctx2 = offscreen.getContext('2d')!;
                  ctx2.drawImage(el, sx, sy, sw, sh, 0, 0, sw, sh);
                  const dataUrl = offscreen.toDataURL('image/png');
                  import('fabric').then(F => {
                    F.FabricImage.fromURL(dataUrl).then((newImg: any) => {
                      newImg.set({ left: rectOX, top: rectOY, originX: 'left', originY: 'top', scaleX: rw/sw, scaleY: rh/sh });
                      newImg.setCoords();
                      c.remove(target); c.remove(rect);
                      c.add(newImg); c.setActiveObject(newImg); c.requestRenderAll();
                      if (typeof refreshLayers === 'function') refreshLayers();
                    });
                  });
                }
              } else if (rect) { c.remove(rect); c.requestRenderAll(); }
              cropRectRef.current = null; cropTargetRef.current = null;
              setCropMode(false);
              return;
            }
            const obj = c.getActiveObject() as any;
            if (!obj || obj.type !== 'image') { alert('Select an image first'); return; }
            setCropMode(true); cropTargetRef.current = obj;
            const ol = obj.originX==='center' ? (obj.left||0)-(obj.width*(obj.scaleX||1))/2 : (obj.left||0);
            const ot = obj.originY==='center' ? (obj.top||0)-(obj.height*(obj.scaleY||1))/2 : (obj.top||0);
            const ow = obj.width*(obj.scaleX||1); const oh = obj.height*(obj.scaleY||1);
            import('fabric').then(F => {
              const cr = new F.Rect({ left:ol+ow*0.1, top:ot+oh*0.1, width:ow*0.8, height:oh*0.8,
                fill:'rgba(0,120,255,0.15)', stroke:'#0078ff', strokeWidth:2, strokeDashArray:[5,5],
                originX:'left', originY:'top', cornerColor:'#0078ff', cornerSize:8,
                transparentCorners:false, lockRotation:true });
              (cr as any)._isCropRect = true;
              c.add(cr); c.setActiveObject(cr); c.requestRenderAll();
              cropRectRef.current = cr;
            });
          }} />

          <hr className="w-10 border-gray-200" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-gray-400">Color</span>`;

if (code.includes(imgBtnAnchor) && !code.includes('_isCropRect')) {
  code = code.replace(imgBtnAnchor, imgBtnReplace);
  changes++;
  console.log("2. Added Crop button after Image");
}

if (changes > 0) {
  writeFileSync(f, code, "utf8");
  console.log("Done! Applied " + changes + " changes for Crop feature");
} else {
  // Fallback: line-based insertion
  console.log("Direct pattern not found, trying line-based...");
  const lines = code.split('\n');
  let imgLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('label="Image"') && lines[i].includes('uploadImage')) { imgLine = i; break; }
  }
  if (imgLine >= 0) {
    // Find next <hr> after imgLine
    let hrLine = -1;
    for (let i = imgLine+1; i < Math.min(imgLine+5, lines.length); i++) {
      if (lines[i].includes('<hr')) { hrLine = i; break; }
    }
    if (hrLine >= 0) {
      const cropBtn = `          <ToolButton label={cropMode ? "Cropping..." : "Crop"} icon="\u2702" onClick={() => {
            const c = fcRef.current; if (!c) return;
            if (cropMode) {
              const rect = cropRectRef.current; const target = cropTargetRef.current;
              if (rect && target && target.type === 'image') {
                const tsx=target.scaleX||1; const tsy=target.scaleY||1;
                const ox=target.originX==='center'?(target.left||0)-(target.width*tsx)/2:(target.left||0);
                const oy=target.originY==='center'?(target.top||0)-(target.height*tsy)/2:(target.top||0);
                const rsx=rect.scaleX||1; const rsy=rect.scaleY||1;
                const rw=(rect.width||0)*rsx; const rh=(rect.height||0)*rsy;
                const rx=rect.originX==='center'?(rect.left||0)-rw/2:(rect.left||0);
                const ry=rect.originY==='center'?(rect.top||0)-rh/2:(rect.top||0);
                const cropX=(rx-ox)/tsx; const cropY=(ry-oy)/tsy; const cropW=rw/tsx; const cropH=rh/tsy;
                const el=(target as any)._element||(target as any).getElement?.();
                if(el){const nW=el.naturalWidth||el.width;const nH=el.naturalHeight||el.height;
                const isx=(target.width||nW)/nW;const isy=(target.height||nH)/nH;
                const sx=Math.max(0,Math.round(cropX/isx));const sy=Math.max(0,Math.round(cropY/isy));
                const sw=Math.min(Math.round(cropW/isx),nW-sx);const sh=Math.min(Math.round(cropH/isy),nH-sy);
                const oc=document.createElement('canvas');oc.width=sw;oc.height=sh;
                const x2=oc.getContext('2d')!;x2.drawImage(el,sx,sy,sw,sh,0,0,sw,sh);
                const du=oc.toDataURL('image/png');
                import('fabric').then(F=>{F.FabricImage.fromURL(du).then((ni:any)=>{
                ni.set({left:rx,top:ry,originX:'left',originY:'top',scaleX:rw/sw,scaleY:rh/sh});
                ni.setCoords();c.remove(target);c.remove(rect);c.add(ni);c.setActiveObject(ni);c.requestRenderAll();
                if(typeof refreshLayers==='function')refreshLayers();});});}
              } else if(rect){c.remove(rect);c.requestRenderAll();}
              cropRectRef.current=null;cropTargetRef.current=null;setCropMode(false);return;
            }
            const obj=c.getActiveObject() as any;
            if(!obj||obj.type!=='image'){alert('Select an image first');return;}
            setCropMode(true);cropTargetRef.current=obj;
            const ol=obj.originX==='center'?(obj.left||0)-(obj.width*(obj.scaleX||1))/2:(obj.left||0);
            const ot=obj.originY==='center'?(obj.top||0)-(obj.height*(obj.scaleY||1))/2:(obj.top||0);
            const ow=obj.width*(obj.scaleX||1);const oh=obj.height*(obj.scaleY||1);
            import('fabric').then(F=>{const cr=new F.Rect({left:ol+ow*0.1,top:ot+oh*0.1,width:ow*0.8,height:oh*0.8,
            fill:'rgba(0,120,255,0.15)',stroke:'#0078ff',strokeWidth:2,strokeDashArray:[5,5],
            originX:'left',originY:'top',cornerColor:'#0078ff',cornerSize:8,transparentCorners:false,lockRotation:true});
            (cr as any)._isCropRect=true;c.add(cr);c.setActiveObject(cr);c.requestRenderAll();cropRectRef.current=cr;});
          }} />`;
      lines.splice(hrLine, 0, cropBtn);
      code = lines.join('\n');
      // Also add state if not already added
      if (!code.includes('cropMode')) {
        code = code.replace('const [measureMode, setMeasureMode] = useState(false);',
          'const [measureMode, setMeasureMode] = useState(false);\n  const [cropMode, setCropMode] = useState(false);\n  const cropRectRef = useRef<any>(null);\n  const cropTargetRef = useRef<any>(null);');
      }
      writeFileSync(f, code, "utf8");
      console.log("Done (fallback)! Inserted Crop button at line " + hrLine);
    } else { console.log("Could not find <hr> after Image button"); }
  } else { console.log("Could not find Image button line"); }
}
