import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");

const anchor = `<button onClick={exportSVG} className="px-4 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700">Export SVG</button>`;

const replacement = `<button onClick={exportSVG} className="px-4 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700">Export SVG</button>
          <button onClick={async () => {
            const c = fcRef.current; if (!c) return;
            const { default: jsPDF } = await import('jspdf');
            const multiplier = exportScale;
            const dataUrl = c.toDataURL({ format: 'png', quality: 1, multiplier });
            const cw = c.getWidth() * multiplier;
            const ch = c.getHeight() * multiplier;
            const orientation = cw > ch ? 'landscape' : 'portrait';
            const pdf = new jsPDF({ orientation, unit: 'px', format: [cw, ch] });
            pdf.addImage(dataUrl, 'PNG', 0, 0, cw, ch);
            pdf.save(panelName + '.pdf');
          }} className="px-4 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Export PDF</button>`;

if (code.includes(anchor) && !code.includes('Export PDF')) {
  code = code.replace(anchor, replacement);
  writeFileSync(f, code, "utf8");
  console.log("Done! Added Export PDF button");
} else if (code.includes('Export PDF')) {
  console.log("Export PDF already exists");
} else {
  console.log("Pattern not found");
}
