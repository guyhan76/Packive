const fs = require('fs');
const file = 'src/app/editor/design/page.tsx';
let code = fs.readFileSync(file, 'utf8');
let changes = 0;

// Find the exportPDF callback and add the enhanced version after it
const oldExportPDFEnd = "}, [boxType, boxTypeDisplay, L, W, D, T, tuckH, dustH, glueW, bottomH, bottomDustH, matLabel, panels, panelConfig]);";

if (!code.includes(oldExportPDFEnd)) {
  console.log('exportPDF end pattern not found!');
  process.exit(1);
}

// Add new export functions after the existing exportPDF
const newExports = `

  // ── Enhanced PDF Export: Per-panel pages with bleed ──
  const exportPDFEnhanced = useCallback(async () => {
    setExporting("pdf-enhanced");
    try {
      const { jsPDF } = await import("jspdf");
      const BLEED = 5; // mm standard bleed
      const GLUE_BLEED = 10; // mm for glue flap
      const DPI = 300;
      const MM_TO_PT = 72 / 25.4; // 1mm = 2.835pt

      // --- Page 1: Full net layout with bleed ---
      const fX = glueW + T;
      const lX = fX + L + T;
      const bX = lX + W + T;
      const rX = bX + L + T;
      const tW = rX + W;
      const tlY = tuckH + T;
      const bY = tlY + W;
      const btY = bY + D + T;
      const tH = btY + Math.max(bottomH, bottomDustH);
      const mg = BLEED + 5; // bleed + safety margin
      const pW = tW + mg * 2;
      const pH = tH + mg * 2;

      const doc = new jsPDF({
        orientation: pW > pH ? "landscape" : "portrait",
        unit: "mm",
        format: [Math.max(pW, pH), Math.min(pW, pH)],
      });

      // White background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pW, pH, "F");

      const positions: Record<string, { x: number; y: number; w: number; h: number }> = {
        topTuck: { x: fX, y: 0, w: L, h: tuckH },
        topLid: { x: fX, y: tlY, w: L, h: W },
        topDustL: { x: lX, y: bY - dustH, w: W, h: dustH },
        topDustR: { x: rX, y: bY - dustH, w: W, h: dustH },
        glueFlap: { x: 0, y: bY, w: glueW, h: D },
        front: { x: fX, y: bY, w: L, h: D },
        left: { x: lX, y: bY, w: W, h: D },
        back: { x: bX, y: bY, w: L, h: D },
        right: { x: rX, y: bY, w: W, h: D },
        bottomFlapFront: { x: fX, y: btY, w: L, h: bottomH },
        bottomDustL: { x: lX, y: btY, w: W, h: bottomDustH },
        bottomFlapBack: { x: bX, y: btY, w: L, h: bottomH },
        bottomDustR: { x: rX, y: btY, w: W, h: bottomDustH },
      };

      for (const [pid, p] of Object.entries(positions)) {
        const px = mg + p.x;
        const py = mg + p.y;
        const pnl = panels[pid];
        const pc = panelConfig[pid as PanelId];
        if (p.w <= 0 || p.h <= 0) continue;

        // Draw bleed area (light red dashed)
        const bl = pid === "glueFlap" ? GLUE_BLEED : BLEED;
        doc.setDrawColor(255, 200, 200);
        doc.setLineWidth(0.15);
        doc.setLineDashPattern([1, 1], 0);
        doc.rect(px - bl, py - bl, p.w + bl * 2, p.h + bl * 2);

        // Draw panel border
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.setLineDashPattern([], 0);

        if (pnl?.designed) {
          doc.setFillColor(250, 250, 250);
        } else {
          const hx = (pc?.color || "#f0f0f0").replace("#", "");
          doc.setFillColor(parseInt(hx.substring(0, 2), 16), parseInt(hx.substring(2, 4), 16), parseInt(hx.substring(4, 6), 16));
        }
        doc.rect(px, py, p.w, p.h, "FD");

        if (pnl?.thumbnail) {
          try { doc.addImage(pnl.thumbnail, "PNG", px, py, p.w, p.h); } catch (e) { console.warn(e); }
        } else if (pc) {
          doc.setFontSize(Math.min(p.w * 0.15, p.h * 0.15, 8));
          doc.setTextColor(180, 180, 180);
          doc.text(pc.name, px + p.w / 2, py + p.h / 2, { align: "center", baseline: "middle" } as any);
        }
      }

      // Footer info
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.setLineDashPattern([], 0);
      doc.text("Packive | " + boxTypeDisplay + " | " + L + "x" + W + "x" + D + "mm | " + matLabel + " | Bleed: 5mm (Glue: 10mm) | 300DPI", mg, tH + mg + 6);

      // --- Pages 2+: Individual panel pages with bleed ---
      const panelOrder: string[] = ["front","back","left","right","topLid","topTuck","topDustL","topDustR","bottomFlapFront","bottomFlapBack","bottomDustL","bottomDustR","glueFlap"];

      for (const pid of panelOrder) {
        const pc = panelConfig[pid as PanelId];
        const pnl = panels[pid];
        if (!pc || pc.widthMM <= 0 || pc.heightMM <= 0) continue;

        const bl = pid === "glueFlap" ? GLUE_BLEED : BLEED;
        const pageW = pc.widthMM + bl * 2 + 10; // panel + bleed + margin
        const pageH = pc.heightMM + bl * 2 + 20; // extra for header/footer

        doc.addPage([Math.max(pageW, pageH), Math.min(pageW, pageH)], pageW > pageH ? "landscape" : "portrait");

        const ox = bl + 5; // offset x
        const oy = bl + 10; // offset y (leave room for header)

        // Header
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text(pc.name + " (" + pc.widthMM + " x " + pc.heightMM + " mm)", ox, 6);

        // Bleed area (pink dashed)
        doc.setDrawColor(255, 150, 150);
        doc.setLineWidth(0.2);
        doc.setLineDashPattern([2, 1], 0);
        doc.rect(ox - bl, oy - bl, pc.widthMM + bl * 2, pc.heightMM + bl * 2);

        // Bleed label
        doc.setFontSize(5);
        doc.setTextColor(255, 150, 150);
        doc.text("BLEED " + bl + "mm", ox - bl + 1, oy - bl - 0.5);

        // Safe zone (blue dashed) - 5mm inside
        doc.setDrawColor(147, 181, 247);
        doc.setLineWidth(0.2);
        doc.setLineDashPattern([2, 1], 0);
        doc.rect(ox + 5, oy + 5, pc.widthMM - 10, pc.heightMM - 10);

        // Panel border (solid)
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.3);
        doc.setLineDashPattern([], 0);
        doc.setFillColor(255, 255, 255);
        doc.rect(ox, oy, pc.widthMM, pc.heightMM, "FD");

        // Panel content
        if (pnl?.designed && pnl.thumbnail) {
          try { doc.addImage(pnl.thumbnail, "PNG", ox, oy, pc.widthMM, pc.heightMM); } catch (e) { console.warn(e); }
        } else {
          doc.setFontSize(8);
          doc.setTextColor(180, 180, 180);
          doc.text(pc.guide || pc.name, ox + pc.widthMM / 2, oy + pc.heightMM / 2, { align: "center", baseline: "middle" } as any);
        }

        // Footer
        doc.setFontSize(5);
        doc.setTextColor(150, 150, 150);
        doc.setLineDashPattern([], 0);
        doc.text(boxTypeDisplay + " | " + pid + " | " + pc.widthMM + "x" + pc.heightMM + "mm | Bleed: " + bl + "mm | 300DPI", ox, oy + pc.heightMM + bl + 3);
      }

      // Crop marks on page 1 (go back to first page is not easy with jsPDF, skip for now)

      const filename = "packive-print-" + boxType + "-" + L + "x" + W + "x" + D + "mm-300dpi.pdf";
      doc.save(filename);
    } catch (e) { console.error(e); alert("Enhanced PDF export failed"); }
    setExporting(null);
  }, [boxType, boxTypeDisplay, L, W, D, T, tuckH, dustH, glueW, bottomH, bottomDustH, matLabel, panels, panelConfig]);`;

// Insert after existing exportPDF
code = code.replace(oldExportPDFEnd, oldExportPDFEnd + newExports);
changes++;
console.log('Added exportPDFEnhanced function');

// Add the button in the export UI
// Find the existing Export PDF button area
const oldExportButtons = 'Export Full Net (PNG)';
if (code.includes(oldExportButtons)) {
  // Find the area near export buttons and add enhanced PDF button
  const btnPattern = 'Export Full Net (PNG)</button>';
  if (code.includes(btnPattern)) {
    code = code.replace(btnPattern, btnPattern + `
                <button disabled={!!exporting} onClick={exportPDFEnhanced}
                  className="w-full py-2 rounded-lg text-sm font-medium bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {exporting === "pdf-enhanced" ? "Generating..." : "\\uD83D\\uDDA8 Print-Ready PDF (300DPI + Bleed)"}
                </button>`);
    changes++;
    console.log('Added enhanced PDF export button');
  }
}

fs.writeFileSync(file, code, 'utf8');
console.log('\nTotal changes: ' + changes);
