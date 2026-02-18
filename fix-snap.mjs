import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");

const old = `let vLine: any = null, hLine: any = null;
      canvas.on('object:moving', (e: any) => {
        const obj = e.target; if (!obj) return;
        const cw = canvas.getWidth(); const ch = canvas.getHeight();
        const bound = obj.getBoundingRect();
        const cx = bound.left + bound.width / 2;
        const cy = bound.top + bound.height / 2;
        const snapPx = SNAP_MM * scaleRef.current;
        // Remove old lines
        if (vLine) { canvas.remove(vLine); vLine = null; }
        if (hLine) { canvas.remove(hLine); hLine = null; }
        let snappedV = false, snappedH = false;
        if (Math.abs(cx - cw / 2) < snapPx) {
          obj.set("left", cw / 2 - bound.width / 2 + (obj.left - bound.left));
          snappedV = true;
        }
        if (Math.abs(cy - ch / 2) < snapPx) {
          obj.set("top", ch / 2 - bound.height / 2 + (obj.top - bound.top));
          snappedH = true;
        }
        const lineColor = (snappedV && snappedH) ? "#4CAF50" : "#ff0000";
        if (snappedV) {
          const { Line } = require("fabric");
          vLine = new Line([cw/2, 0, cw/2, ch], { stroke: lineColor, strokeWidth: 1, strokeDashArray: [5,3], selectable: false, evented: false });
          (vLine as any)._isGuideLine = true;
          canvas.add(vLine);
        }
        if (snappedH) {
          const { Line } = require("fabric");
          hLine = new Line([0, ch/2, cw, ch/2], { stroke: lineColor, strokeWidth: 1, strokeDashArray: [5,3], selectable: false, evented: false });
          (hLine as any)._isGuideLine = true;
          canvas.add(hLine);
        }
        canvas.renderAll();
      });`;

const fix = `let guideLines: any[] = [];
      canvas.on('object:moving', (e: any) => {
        const obj = e.target; if (!obj) return;
        const cw = canvas.getWidth(); const ch = canvas.getHeight();
        const snapPx = SNAP_MM * scaleRef.current;

        // Remove old guide lines
        guideLines.forEach(l => { try { canvas.remove(l); } catch {} });
        guideLines = [];

        const bound = obj.getBoundingRect();
        const objCx = bound.left + bound.width / 2;
        const objCy = bound.top + bound.height / 2;
        const objLeft = bound.left;
        const objRight = bound.left + bound.width;
        const objTop = bound.top;
        const objBottom = bound.top + bound.height;

        // Collect snap targets: canvas center + edges + other objects
        const vTargets: number[] = [cw / 2, 0, cw]; // vertical snap X positions
        const hTargets: number[] = [ch / 2, 0, ch]; // horizontal snap Y positions

        canvas.getObjects().forEach((other: any) => {
          if (other === obj || other._isGuideLine || other._isSafeZone) return;
          const ob = other.getBoundingRect();
          vTargets.push(ob.left, ob.left + ob.width / 2, ob.left + ob.width);
          hTargets.push(ob.top, ob.top + ob.height / 2, ob.top + ob.height);
        });

        let snappedX = false, snappedY = false;
        let snapXPos = 0, snapYPos = 0;

        // Check vertical snaps (X axis): obj left, center, right vs targets
        const objXPoints = [objLeft, objCx, objRight];
        for (const tx of vTargets) {
          for (const ox of objXPoints) {
            if (Math.abs(ox - tx) < snapPx) {
              const diff = tx - ox;
              obj.set("left", obj.left + diff);
              snappedX = true;
              snapXPos = tx;
              break;
            }
          }
          if (snappedX) break;
        }

        // Check horizontal snaps (Y axis): obj top, center, bottom vs targets
        const objYPoints = [objTop, objCy, objBottom];
        for (const ty of hTargets) {
          for (const oy of objYPoints) {
            if (Math.abs(oy - ty) < snapPx) {
              const diff = ty - oy;
              obj.set("top", obj.top + diff);
              snappedY = true;
              snapYPos = ty;
              break;
            }
          }
          if (snappedY) break;
        }

        // Draw guide lines
        const { Line: FLine } = require("fabric");
        if (snappedX) {
          const vl = new FLine([snapXPos, 0, snapXPos, ch], {
            stroke: "#ff4081", strokeWidth: 1, strokeDashArray: [4, 3],
            selectable: false, evented: false, excludeFromExport: true,
          });
          (vl as any)._isGuideLine = true;
          canvas.add(vl); guideLines.push(vl);
        }
        if (snappedY) {
          const hl = new FLine([0, snapYPos, cw, snapYPos], {
            stroke: "#ff4081", strokeWidth: 1, strokeDashArray: [4, 3],
            selectable: false, evented: false, excludeFromExport: true,
          });
          (hl as any)._isGuideLine = true;
          canvas.add(hl); guideLines.push(hl);
        }
        canvas.renderAll();
      });`;

if (code.includes(old)) {
  code = code.replace(old, fix);
  writeFileSync(f, code, "utf8");
  console.log("Done! Enhanced snap guidelines with object-to-object snapping");
} else {
  console.log("Pattern not found");
}
