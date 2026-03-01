// ─── Table Data Model ───
export interface TableCell {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: "normal" | "bold";
  textAlign: "left" | "center" | "right";
  verticalAlign: "top" | "middle" | "bottom";
  fill: string;
  textColor: string;
  borderColor: string;
  colspan: number;
  rowspan: number;
  merged: boolean;
  mergedBy: [number, number] | null;
  padding: number;
}

export interface TableData {
  rows: number;
  cols: number;
  colWidths: number[];
  rowHeights: number[];
  cells: TableCell[][];
  borderWidth: number;
  borderColor: string;
  outerBorderWidth: number;
}

export function createDefaultCell(isHeader: boolean = false): TableCell {
  return {
    text: "",
    fontFamily: "Inter",
    fontSize: 11,
    fontWeight: isHeader ? "bold" : "normal",
    textAlign: "center",
    verticalAlign: "middle",
    fill: isHeader ? "#e8edf2" : "#ffffff",
    textColor: "#222222",
    borderColor: "#999999",
    colspan: 1,
    rowspan: 1,
    merged: false,
    mergedBy: null,
    padding: 4,
  };
}

export function createTableData(rows: number, cols: number): TableData {
  const cells: TableCell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: TableCell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push(createDefaultCell(r === 0));
    }
    cells.push(row);
  }
  return {
    rows, cols,
    colWidths: Array(cols).fill(90),
    rowHeights: Array(rows).fill(32),
    cells,
    borderWidth: 1,
    borderColor: "#666666",
    outerBorderWidth: 2,
  };
}

export function mergeCells(td: TableData, sr: number, sc: number, er: number, ec: number): TableData {
  const d = structuredClone(td);
  const anchor = d.cells[sr][sc];
  const rs = er - sr + 1;
  const cs = ec - sc + 1;
  if (rs <= 1 && cs <= 1) return d;
  anchor.colspan = cs;
  anchor.rowspan = rs;
  for (let r = sr; r <= er; r++) {
    for (let c = sc; c <= ec; c++) {
      if (r === sr && c === sc) continue;
      d.cells[r][c].merged = true;
      d.cells[r][c].mergedBy = [sr, sc];
      d.cells[r][c].text = "";
    }
  }
  return d;
}

export function unmergeCells(td: TableData, row: number, col: number): TableData {
  const d = structuredClone(td);
  const anchor = d.cells[row][col];
  if (anchor.colspan <= 1 && anchor.rowspan <= 1) return d;
  const er = row + anchor.rowspan - 1;
  const ec = col + anchor.colspan - 1;
  anchor.colspan = 1;
  anchor.rowspan = 1;
  for (let r = row; r <= er; r++) {
    for (let c = col; c <= ec; c++) {
      if (r === row && c === col) continue;
      d.cells[r][c].merged = false;
      d.cells[r][c].mergedBy = null;
    }
  }
  return d;
}

export function addRow(td: TableData, afterIndex: number): TableData {
  const d = structuredClone(td);
  const newRow: TableCell[] = [];
  for (let c = 0; c < d.cols; c++) newRow.push(createDefaultCell(false));
  d.cells.splice(afterIndex + 1, 0, newRow);
  d.rowHeights.splice(afterIndex + 1, 0, 32);
  d.rows++;
  return d;
}

export function addCol(td: TableData, afterIndex: number): TableData {
  const d = structuredClone(td);
  for (let r = 0; r < d.rows; r++) {
    d.cells[r].splice(afterIndex + 1, 0, createDefaultCell(r === 0));
  }
  d.colWidths.splice(afterIndex + 1, 0, 90);
  d.cols++;
  return d;
}

export function deleteRow(td: TableData, index: number): TableData {
  if (td.rows <= 1) return td;
  const d = structuredClone(td);
  d.cells.splice(index, 1);
  d.rowHeights.splice(index, 1);
  d.rows--;
  return d;
}

export function deleteCol(td: TableData, index: number): TableData {
  if (td.cols <= 1) return td;
  const d = structuredClone(td);
  for (let r = 0; r < d.rows; r++) d.cells[r].splice(index, 1);
  d.colWidths.splice(index, 1);
  d.cols--;
  return d;
}

export function setCellFill(td: TableData, row: number, col: number, color: string): TableData {
  const d = structuredClone(td);
  d.cells[row][col].fill = color;
  return d;
}

export function setCellTextColor(td: TableData, row: number, col: number, color: string): TableData {
  const d = structuredClone(td);
  d.cells[row][col].textColor = color;
  return d;
}

export function setCellFontSize(td: TableData, row: number, col: number, size: number): TableData {
  const d = structuredClone(td);
  d.cells[row][col].fontSize = size;
  return d;
}

export function setCellFontWeight(td: TableData, row: number, col: number, weight: "normal" | "bold"): TableData {
  const d = structuredClone(td);
  d.cells[row][col].fontWeight = weight;
  return d;
}

export function setCellTextAlign(td: TableData, row: number, col: number, align: "left" | "center" | "right"): TableData {
  const d = structuredClone(td);
  d.cells[row][col].textAlign = align;
  return d;
}

// ─── High quality SVG for canvas display ───
export function tableDataToSVG(td: TableData): string {
  const totalW = td.colWidths.reduce((a, b) => a + b, 0);
  const totalH = td.rowHeights.reduce((a, b) => a + b, 0);
  const p = td.outerBorderWidth;
  const W = totalW + p * 2;
  const H = totalH + p * 2;

  const parts: string[] = [];
  parts.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">');
  parts.push('<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#ffffff"/>');

  // Cell fills
  let y = p;
  for (let r = 0; r < td.rows; r++) {
    let x = p;
    for (let c = 0; c < td.cols; c++) {
      const cell = td.cells[r][c];
      if (!cell.merged) {
        let cw = 0; for (let i = c; i < c + cell.colspan; i++) cw += td.colWidths[i];
        let ch = 0; for (let i = r; i < r + cell.rowspan; i++) ch += td.rowHeights[i];
        parts.push('<rect x="' + x + '" y="' + y + '" width="' + cw + '" height="' + ch + '" fill="' + cell.fill + '"/>');
        if (cell.text) {
          const lines = cell.text.split("\\n");
          const lineH = cell.fontSize * 1.3;
          const totalTextH = lines.length * lineH;
          let startY = y + ch / 2 - totalTextH / 2 + cell.fontSize * 0.85;
          if (cell.verticalAlign === "top") startY = y + cell.padding + cell.fontSize;
          if (cell.verticalAlign === "bottom") startY = y + ch - cell.padding - totalTextH + cell.fontSize;
          let tx = x + cw / 2;
          const anchor = cell.textAlign === "left" ? "start" : cell.textAlign === "right" ? "end" : "middle";
          if (cell.textAlign === "left") tx = x + cell.padding;
          if (cell.textAlign === "right") tx = x + cw - cell.padding;
          for (let li = 0; li < lines.length; li++) {
            const ly = startY + li * lineH;
            parts.push('<text x="' + tx + '" y="' + ly + '" font-family="' + cell.fontFamily + ',sans-serif" font-size="' + cell.fontSize + '" font-weight="' + cell.fontWeight + '" fill="' + cell.textColor + '" text-anchor="' + anchor + '">' + esc(lines[li]) + '</text>');
          }
        }
      }
      x += td.colWidths[c];
    }
    y += td.rowHeights[r];
  }

  // Grid lines (skip inside merged areas)
  const drawn = new Set<string>();
  y = p;
  for (let r = 0; r <= td.rows; r++) {
    let x = p;
    for (let c = 0; c <= td.cols; c++) {
      if (c < td.cols && r <= td.rows) {
        // horizontal line at top of cell [r][c]
        if (r < td.rows) {
          const cell = td.cells[r][c < td.cols ? c : c - 1];
          if (!cell.merged || r === 0) {
            // check if this segment should be drawn
          }
        }
      }
      if (c < td.cols) x += td.colWidths[c];
    }
    if (r < td.rows) y += td.rowHeights[r];
  }

  // Simple approach: draw all grid lines, then overlay merged cell rects
  // Horizontal lines
  y = p;
  for (let r = 0; r <= td.rows; r++) {
    const sw = (r === 0 || r === td.rows) ? td.outerBorderWidth : td.borderWidth;
    parts.push('<line x1="' + p + '" y1="' + y + '" x2="' + (totalW + p) + '" y2="' + y + '" stroke="' + td.borderColor + '" stroke-width="' + sw + '" shape-rendering="crispEdges"/>');
    if (r < td.rows) y += td.rowHeights[r];
  }
  // Vertical lines
  let x2 = p;
  for (let c = 0; c <= td.cols; c++) {
    const sw = (c === 0 || c === td.cols) ? td.outerBorderWidth : td.borderWidth;
    parts.push('<line x1="' + x2 + '" y1="' + p + '" x2="' + x2 + '" y2="' + (totalH + p) + '" stroke="' + td.borderColor + '" stroke-width="' + sw + '" shape-rendering="crispEdges"/>');
    if (c < td.cols) x2 += td.colWidths[c];
  }

  // Merged cell overlay (cover internal lines)
  y = p;
  for (let r = 0; r < td.rows; r++) {
    let x = p;
    for (let c = 0; c < td.cols; c++) {
      const cell = td.cells[r][c];
      if (!cell.merged && (cell.colspan > 1 || cell.rowspan > 1)) {
        let cw = 0; for (let i = c; i < c + cell.colspan; i++) cw += td.colWidths[i];
        let ch = 0; for (let i = r; i < r + cell.rowspan; i++) ch += td.rowHeights[i];
        parts.push('<rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="' + (cw - 2) + '" height="' + (ch - 2) + '" fill="' + cell.fill + '"/>');
        if (cell.text) {
          const lines = cell.text.split("\\n");
          const lineH = cell.fontSize * 1.3;
          const totalTextH = lines.length * lineH;
          let startY = y + ch / 2 - totalTextH / 2 + cell.fontSize * 0.85;
          let tx = x + cw / 2;
          const anchor = cell.textAlign === "left" ? "start" : cell.textAlign === "right" ? "end" : "middle";
          if (cell.textAlign === "left") tx = x + cell.padding;
          if (cell.textAlign === "right") tx = x + cw - cell.padding;
          for (let li = 0; li < lines.length; li++) {
            parts.push('<text x="' + tx + '" y="' + (startY + li * lineH) + '" font-family="' + cell.fontFamily + ',sans-serif" font-size="' + cell.fontSize + '" font-weight="' + cell.fontWeight + '" fill="' + cell.textColor + '" text-anchor="' + anchor + '">' + esc(lines[li]) + '</text>');
          }
        }
      }
      x += td.colWidths[c];
    }
    y += td.rowHeights[r];
  }

  parts.push('</svg>');
  return parts.join("");
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
