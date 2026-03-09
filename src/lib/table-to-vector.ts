// table-to-vector.ts - SVG post-processing
import type { TableConfig, TableCellData } from "./table-engine";

function createSvgElement(tag: string, attrs: Record<string, string | number>): Element {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

/**
 * Build vector table matching the EXACT coordinate space of the raster <image>.
 * The <image> has x=-w/2, y=-h/2 (Fabric center-origin), so vector starts there too.
 */
function buildVectorTable(
  config: TableConfig,
  imgX: number, imgY: number,
  imgW: number, imgH: number
): Element {
  const { rows, cols, cells, colWidths, rowHeights, borderColor, borderWidth } = config;
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  const totalH = rowHeights.reduce((a, b) => a + b, 0);

  // Map from table logical coords to raster image pixel coords
  // rasterW = (totalW+2)*4, so table area starts at pixel 4 (=1*4) from left
  const scaleX = imgW / (totalW + 2);
  const scaleY = imgH / (totalH + 2);
  // Origin offset: image starts at imgX, imgY (typically -w/2, -h/2)
  // Plus 1-unit padding scaled to raster
  const ox = imgX + 1 * scaleX;
  const oy = imgY + 1 * scaleY;

  const g = createSvgElement("g", {});

  // White background
  g.appendChild(createSvgElement("rect", {
    x: ox, y: oy, width: totalW * scaleX, height: totalH * scaleY,
    fill: "#ffffff", stroke: "none"
  }));

  // Cumulative positions
  const xPos: number[] = [0];
  for (let c = 0; c < cols; c++) xPos.push(xPos[c] + colWidths[c]);
  const yPos: number[] = [0];
  for (let r = 0; r < rows; r++) yPos.push(yPos[r] + rowHeights[r]);

  const drawn = new Set<string>();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${r}-${c}`;
      if (drawn.has(key)) continue;
      const cell: TableCellData | undefined = cells[r]?.[c];
      if (!cell) continue;
      if (cell.merged && cell.mergedBy) { drawn.add(key); continue; }

      const colSpan = cell.colSpan || 1;
      const rowSpan = cell.rowSpan || 1;
      for (let dr = 0; dr < rowSpan; dr++)
        for (let dc = 0; dc < colSpan; dc++)
          drawn.add(`${r + dr}-${c + dc}`);

      const cx = xPos[c], cy = yPos[r];
      const cw = xPos[c + colSpan] - xPos[c];
      const ch = yPos[r + rowSpan] - yPos[r];

      // Cell background
      const bg = cell.bgColor || "#ffffff";
      if (bg.toLowerCase() !== "#ffffff" && bg !== "transparent") {
        g.appendChild(createSvgElement("rect", {
          x: ox + cx * scaleX, y: oy + cy * scaleY,
          width: cw * scaleX, height: ch * scaleY,
          fill: bg, stroke: "none"
        }));
      }

      // Cell text
      const text = cell.text || "";
      if (text) {
        const fo = createSvgElement("foreignObject", {
          x: ox + cx * scaleX, y: oy + cy * scaleY,
          width: cw * scaleX, height: ch * scaleY
        });
        const div = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
        div.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");

        const fontSize = (cell.fontSize || 12) * scaleX;
        const padding = (cell.padding !== undefined ? cell.padding : 4) * scaleX;
        const vAlign = cell.verticalAlign || "middle";
        const tAlign = cell.textAlign || "center";
        const alignItems = vAlign === "top" ? "flex-start" : vAlign === "bottom" ? "flex-end" : "center";
        const justifyContent = tAlign === "left" ? "flex-start" : tAlign === "right" ? "flex-end" : "center";

        div.setAttribute("style", [
          `width:${cw * scaleX}px;height:${ch * scaleY}px`,
          `display:flex;align-items:${alignItems};justify-content:${justifyContent}`,
          `text-align:${tAlign}`,
          `font-family:${cell.fontFamily || "Arial"},Noto Sans KR,sans-serif`,
          `font-size:${fontSize}px`,
          `font-weight:${cell.fontWeight || "normal"}`,
          `font-style:${cell.fontStyle || "normal"}`,
          `color:${cell.textColor || "#222222"}`,
          `padding:${padding}px;box-sizing:border-box`,
          `overflow:hidden;white-space:pre-wrap;word-break:break-word`,
          `line-height:${cell.lineHeight || 1.4};margin:0`
        ].join(";"));
        div.textContent = text;
        fo.appendChild(div);
        g.appendChild(fo);
      }
    }
  }

  // Borders per cell (respects merged cells)
  drawn.clear();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${r}-${c}`;
      if (drawn.has(key)) continue;
      const cell = cells[r]?.[c];
      if (!cell) continue;
      if (cell.merged && cell.mergedBy) { drawn.add(key); continue; }

      const colSpan = cell.colSpan || 1;
      const rowSpan = cell.rowSpan || 1;
      for (let dr = 0; dr < rowSpan; dr++)
        for (let dc = 0; dc < colSpan; dc++)
          drawn.add(`${r + dr}-${c + dc}`);

      const cx = xPos[c], cy = yPos[r];
      const cw = xPos[c + colSpan] - xPos[c];
      const ch = yPos[r + rowSpan] - yPos[r];
      const bColor = cell.cellBorderColor || borderColor || "#000000";
      const bScale = scaleX;

      const x1 = ox + cx * scaleX, y1 = oy + cy * scaleY;
      const x2 = ox + (cx + cw) * scaleX, y2 = oy + (cy + ch) * scaleY;

      if (cell.borderTop > 0)
        g.appendChild(createSvgElement("line", { x1, y1, x2, y2: y1, stroke: bColor, "stroke-width": cell.borderTop * bScale }));
      if (cell.borderBottom > 0)
        g.appendChild(createSvgElement("line", { x1, y1: y2, x2, y2, stroke: bColor, "stroke-width": cell.borderBottom * bScale }));
      if (cell.borderLeft > 0)
        g.appendChild(createSvgElement("line", { x1, y1, x2: x1, y2, stroke: bColor, "stroke-width": cell.borderLeft * bScale }));
      if (cell.borderRight > 0)
        g.appendChild(createSvgElement("line", { x1: x2, y1, x2, y2, stroke: bColor, "stroke-width": cell.borderRight * bScale }));
    }
  }

  return g;
}

export function vectorizeTablesInSvg(svgString: string, canvasObjects: any[]): string {
  const tableObjs = canvasObjects.filter((o: any) => o._isTable && o._tableConfig);
  if (!tableObjs.length) return svgString;

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svgEl = doc.documentElement;

  const images = Array.from(svgEl.querySelectorAll("image")).filter(img => {
    const href = img.getAttribute("href") || img.getAttributeNS("http://www.w3.org/1999/xlink", "href") || "";
    return href.startsWith("data:image/png;base64,");
  });

  console.log(`[TABLE-VEC] ${tableObjs.length} table(s), ${images.length} image(s)`);

  for (let i = 0; i < Math.min(tableObjs.length, images.length); i++) {
    try {
      const config: TableConfig = JSON.parse(tableObjs[i]._tableConfig);
      const imgEl = images[i];
      const imgX = parseFloat(imgEl.getAttribute("x") || "0");
      const imgY = parseFloat(imgEl.getAttribute("y") || "0");
      const imgW = parseFloat(imgEl.getAttribute("width") || "0");
      const imgH = parseFloat(imgEl.getAttribute("height") || "0");

      console.log(`[TABLE-VEC] table[${i}] img x=${imgX} y=${imgY} w=${imgW} h=${imgH}`);

      const vectorGroup = buildVectorTable(config, imgX, imgY, imgW, imgH);

      // Replace <image> but keep parent <g> with its transform
      const parent = imgEl.parentElement;
      if (parent) {
        parent.replaceChild(vectorGroup, imgEl);
        console.log(`[TABLE-VEC] Replaced table[${i}], parent transform="${parent.getAttribute("transform")}"`);
      }
    } catch (e) {
      console.error(`[TABLE-VEC] Error:`, e);
    }
  }


  // DEBUG: count text elements in svgEl before serialization
  const allTexts = svgEl.querySelectorAll("text");
  console.log("[TABLE-VEC] <text> elements in DOM before serialize:", allTexts.length);
  if (allTexts.length > 0) {
    allTexts.forEach((t, idx) => console.log(`[TABLE-VEC] text[${idx}]:`, t.textContent?.substring(0,30), t.outerHTML?.substring(0,120)));
  }
  // Also check raw string for "text" tag
  const raw = new XMLSerializer().serializeToString(svgEl);
  console.log("[TABLE-VEC] <text in serialized:", (raw.match(/<text[\s>]/g) || []).length);
  console.log("[TABLE-VEC] <foreignObject in serialized:", (raw.match(/<foreignObject/g) || []).length);
  return raw;
}
