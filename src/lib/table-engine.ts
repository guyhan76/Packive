// ─── Packive Table Engine v4 ───
// Canvas2D 렌더링 → FabricImage 방식

export interface TableCellData {
  row: number; col: number;
  rowSpan: number; colSpan: number;
  text: string;
  bgColor: string; textColor: string;
  fontSize: number; fontFamily: string;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  textAlign: "left" | "center" | "right";
  verticalAlign: "top" | "middle" | "bottom";
  padding: number;
  merged: boolean;
  mergedBy: [number, number] | null;
  borderTop: number; borderRight: number; borderBottom: number; borderLeft: number;
  cellBorderColor: string; lineHeight: number;
}

export interface TableConfig {
  rows: number; cols: number;
  colWidths: number[]; rowHeights: number[];
  cells: TableCellData[][];
  borderColor: string; borderWidth: number;
  outerBorderWidth: number;
}

export function createDefaultCell(row: number, col: number): TableCellData {
  return {
    row, col, rowSpan: 1, colSpan: 1,
    text: "", bgColor: "#ffffff", textColor: "#222222",
    fontSize: 12, fontFamily: "Arial",
    fontWeight: "normal", fontStyle: "normal",
    textAlign: "center", verticalAlign: "middle",
    padding: 4, merged: false, mergedBy: null, borderTop: 0.5, borderRight: 0.5, borderBottom: 0.5, borderLeft: 0.5, cellBorderColor: "#000000", lineHeight: 1.4,
  };
}

export function createTableConfig(rows: number, cols: number, cellW = 90, cellH = 32): TableConfig {
  const cells: TableCellData[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: TableCellData[] = [];
    for (let c = 0; c < cols; c++) row.push(createDefaultCell(r, c));
    cells.push(row);
  }
  return {
    rows, cols,
    colWidths: Array(cols).fill(cellW),
    rowHeights: Array(rows).fill(cellH),
    cells, borderColor: "#000000",
    borderWidth: 0, outerBorderWidth: 0,
  };
}

// ─── Canvas2D로 표 이미지 생성 ───
export function renderTableToDataURL(config: TableConfig, scale = 4): string {
  const { rows, cols, cells, colWidths, rowHeights, borderColor, borderWidth, outerBorderWidth } = config;
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  const totalH = rowHeights.reduce((a, b) => a + b, 0);

  const canvas = document.createElement("canvas");
  canvas.width = (totalW + 2) * scale;
  canvas.height = (totalH + 2) * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale); ctx.translate(1, 1);

  // 1) White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-1, -1, totalW + 2, totalH + 2);

  // 2) Cell backgrounds + text
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = cells[r][c];
      if (cell.merged) continue;

      let x = 0; for (let i = 0; i < c; i++) x += colWidths[i];
      let y = 0; for (let i = 0; i < r; i++) y += rowHeights[i];
      let cw = 0; for (let i = c; i < Math.min(c + cell.colSpan, cols); i++) cw += colWidths[i];
      let ch = 0; for (let i = r; i < Math.min(r + cell.rowSpan, rows); i++) ch += rowHeights[i];

      // bg
      if (cell.bgColor && cell.bgColor !== "#ffffff") {
        ctx.fillStyle = cell.bgColor;
        ctx.fillRect(x, y, cw, ch);
      }

      // text
      if (cell.text) {
        const fs = cell.fontSize;
        const style = cell.fontStyle === "italic" ? "italic " : "";
        const weight = cell.fontWeight ? cell.fontWeight + " " : "";
        ctx.font = `${style}${weight}${fs}px ${cell.fontFamily}`;
        ctx.fillStyle = cell.textColor;

        // horizontal align
        let tx: number;
        if (cell.textAlign === "left") { ctx.textAlign = "left"; tx = x + cell.padding; }
        else if (cell.textAlign === "right") { ctx.textAlign = "right"; tx = x + cw - cell.padding; }
        else { ctx.textAlign = "center"; tx = x + cw / 2; }

        // multi-line + vertical align (alphabetic baseline)
        ctx.textBaseline = "alphabetic";
        const textLines = cell.text.split("\n");
        const lineH = fs * (cell.lineHeight || 1.4);
        const metrics = ctx.measureText("Mg");
        const ascent = metrics.fontBoundingBoxAscent ?? fs * 0.8;
        const descent = metrics.fontBoundingBoxDescent ?? fs * 0.2;
        const realH = ascent + descent;
        const totalTextH = textLines.length > 1 ? (textLines.length - 1) * lineH + realH : realH;
        let baseY: number;
        if (cell.verticalAlign === "top") baseY = y + cell.padding + ascent;
        else if (cell.verticalAlign === "bottom") baseY = y + ch - cell.padding - totalTextH + ascent;
        else baseY = y + (ch - totalTextH) / 2 + ascent;
        const maxW = cw - cell.padding * 2;
        for (let li = 0; li < textLines.length; li++) {
          ctx.fillText(textLines[li], tx, baseY + li * lineH, maxW > 0 ? maxW : undefined);
        }
      }
    }
  }


  // 3) Draw grid lines - unified approach
  const xPos: number[] = [0];
  for (let c = 0; c < cols; c++) xPos.push(xPos[c] + colWidths[c]);
  const yPos: number[] = [0];
  for (let r = 0; r < rows; r++) yPos.push(yPos[r] + rowHeights[r]);

  const masterId = (r: number, c: number): string => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return `out-${r}-${c}`;
    const cell = cells[r][c];
    if (cell.merged && cell.mergedBy) return `${cell.mergedBy[0]}-${cell.mergedBy[1]}`;
    return `${r}-${c}`;
  };

  const snap = (v: number, lw: number): number => {
    if (lw % 2 !== 0) return Math.round(v) + 0.5;
    return Math.round(v);
  };

  const safeCell = (r: number, c: number) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
    const cell = cells[r][c];
    if (cell.merged && cell.mergedBy) return cells[cell.mergedBy[0]]?.[cell.mergedBy[1]] || null;
    return cell;
  };

  for (let r = 0; r <= rows; r++) {
    const y = yPos[r];
    let segStart = 0; let segLw = 0; let segColor = borderColor;
    for (let c = 0; c <= cols; c++) {
      let lw = 0; let color = borderColor; let skip = false;
      if (c < cols) {
        if (r > 0 && r < rows && masterId(r, c) === masterId(r - 1, c)) { skip = true; }
        else {
          const above = safeCell(r - 1, c);
          const below = safeCell(r, c);
          if (r === 0 && below) { lw = below.borderTop || 0.5; color = below.cellBorderColor || borderColor; }
          else if (r === rows && above) { lw = above.borderBottom || 0.5; color = above.cellBorderColor || borderColor; }
          else { const bB = below?.borderTop || 0; const bA = above?.borderBottom || 0; lw = Math.max(bB, bA); color = (bB >= bA ? below?.cellBorderColor : above?.cellBorderColor) || borderColor; }
        }
      }
      if (c === cols || skip || lw !== segLw || color !== segColor) {
        if (segLw > 0 && segStart < c) {
          const sy = snap(y, segLw * 2); ctx.strokeStyle = segColor; ctx.lineWidth = Math.max(0.5, segLw * 2);
          ctx.beginPath(); ctx.moveTo(xPos[segStart], sy); ctx.lineTo(xPos[c], sy); ctx.stroke();
        }
        segStart = c; segLw = skip ? 0 : lw; segColor = skip ? borderColor : color;
        if (skip) segStart = c + 1;
      }
    }
  }

  for (let c = 0; c <= cols; c++) {
    const x = xPos[c];
    let segStart = 0; let segLw = 0; let segColor = borderColor;
    for (let r = 0; r <= rows; r++) {
      let lw = 0; let color = borderColor; let skip = false;
      if (r < rows) {
        if (c > 0 && c < cols && masterId(r, c) === masterId(r, c - 1)) { skip = true; }
        else {
          const left = safeCell(r, c - 1);
          const right = safeCell(r, c);
          if (c === 0 && right) { lw = right.borderLeft || 0.5; color = right.cellBorderColor || borderColor; }
          else if (c === cols && left) { lw = left.borderRight || 0.5; color = left.cellBorderColor || borderColor; }
          else { const bR = right?.borderLeft || 0; const bL = left?.borderRight || 0; lw = Math.max(bR, bL); color = (bR >= bL ? right?.cellBorderColor : left?.cellBorderColor) || borderColor; }
        }
      }
      if (r === rows || skip || lw !== segLw || color !== segColor) {
        if (segLw > 0 && segStart < r) {
          const sx = snap(x, segLw * 2); ctx.strokeStyle = segColor; ctx.lineWidth = Math.max(0.5, segLw * 2);
          ctx.beginPath(); ctx.moveTo(sx, yPos[segStart]); ctx.lineTo(sx, yPos[r]); ctx.stroke();
        }
        segStart = r; segLw = skip ? 0 : lw; segColor = skip ? borderColor : color;
        if (skip) segStart = r + 1;
      }
    }
  }

  return canvas.toDataURL("image/png");
}

// ─── Fabric.js Image 객체로 변환 ───
export async function buildTableImage(
  config: TableConfig,
  FabricModule: any
): Promise<any> {
  const dataURL = renderTableToDataURL(config);
  const totalW = config.colWidths.reduce((a, b) => a + b, 0);
  const totalH = config.rowHeights.reduce((a, b) => a + b, 0);

  const img = await FabricModule.FabricImage.fromURL(dataURL);
  img.set({
    scaleX: totalW / img.width,
    scaleY: totalH / img.height,
    _isTable: true,
    _tableConfig: JSON.stringify(config),
    name: `Table ${config.rows}×${config.cols}`,
  });
  return img;
}

// ─── Cell operations ───
export function mergeCells(config: TableConfig, sr: number, sc: number, er: number, ec: number): TableConfig {
  const d = structuredClone(config);
  const startR = Math.min(sr, er), endR = Math.max(sr, er);
  const startC = Math.min(sc, ec), endC = Math.max(sc, ec);
  if (startR === endR && startC === endC) return d;
  const anchor = d.cells[startR][startC];
  anchor.colSpan = endC - startC + 1;
  anchor.rowSpan = endR - startR + 1;
  let mergedText = anchor.text;
  for (let r = startR; r <= endR; r++) {
    for (let c = startC; c <= endC; c++) {
      if (r === startR && c === startC) continue;
      if (d.cells[r][c].text && !mergedText) mergedText = d.cells[r][c].text;
      d.cells[r][c].merged = true;
      d.cells[r][c].mergedBy = [startR, startC];
      d.cells[r][c].text = "";
    }
  }
  anchor.text = mergedText;
  // Preserve outer borders on merged cell
  anchor.borderTop = anchor.borderTop || 0.5;
  anchor.borderBottom = anchor.borderBottom || 0.5;
  anchor.borderLeft = anchor.borderLeft || 0.5;
  anchor.borderRight = anchor.borderRight || 0.5;
  return d;
}

export function unmergeCells(config: TableConfig, row: number, col: number): TableConfig {
  const d = structuredClone(config);
  const anchor = d.cells[row][col];
  if (anchor.colSpan <= 1 && anchor.rowSpan <= 1) return d;
  const er = row + anchor.rowSpan - 1, ec = col + anchor.colSpan - 1;
  anchor.colSpan = 1; anchor.rowSpan = 1;
  for (let r = row; r <= er; r++) {
    for (let c = col; c <= ec; c++) {
      if (r === row && c === col) continue;
      d.cells[r][c].merged = false;
      d.cells[r][c].borderTop = 0.5; d.cells[r][c].borderRight = 0.5; d.cells[r][c].borderBottom = 0.5; d.cells[r][c].borderLeft = 0.5;
      d.cells[r][c].mergedBy = null;
    }
  }
  return d;
}

export function addRow(config: TableConfig, afterIndex: number): TableConfig {
  const d = structuredClone(config);
  d.rows++;
  const newRow: TableCellData[] = [];
  for (let c = 0; c < d.cols; c++) newRow.push(createDefaultCell(afterIndex + 1, c));
  d.cells.splice(afterIndex + 1, 0, newRow);
  d.rowHeights.splice(afterIndex + 1, 0, d.rowHeights[afterIndex] || 32);
  return d;
}

export function addCol(config: TableConfig, afterIndex: number): TableConfig {
  const d = structuredClone(config);
  d.cols++;
  for (let r = 0; r < d.rows; r++) d.cells[r].splice(afterIndex + 1, 0, createDefaultCell(r, afterIndex + 1));
  d.colWidths.splice(afterIndex + 1, 0, d.colWidths[afterIndex] || 90);
  return d;
}

export function deleteRow(config: TableConfig, index: number): TableConfig {
  if (config.rows <= 1) return config;
  const d = structuredClone(config);
  d.rows--;
  d.cells.splice(index, 1);
  d.rowHeights.splice(index, 1);
  return d;
}

export function deleteCol(config: TableConfig, index: number): TableConfig {
  if (config.cols <= 1) return config;
  const d = structuredClone(config);
  d.cols--;
  for (let r = 0; r < d.rows; r++) d.cells[r].splice(index, 1);
  d.colWidths.splice(index, 1);
  return d;
}

export function updateCell(
  config: TableConfig, row: number, col: number,
  props: Partial<TableCellData>
): TableConfig {
  const d = structuredClone(config);
  Object.assign(d.cells[row][col], props);
  return d;
}

export function getCellBounds(config: TableConfig, row: number, col: number): { x: number; y: number; w: number; h: number } {
  let x = 0; for (let i = 0; i < col; i++) x += config.colWidths[i];
  let y = 0; for (let i = 0; i < row; i++) y += config.rowHeights[i];
  const cell = config.cells[row][col];
  let w = 0; for (let i = col; i < Math.min(col + cell.colSpan, config.cols); i++) w += config.colWidths[i];
  let h = 0; for (let i = row; i < Math.min(row + cell.rowSpan, config.rows); i++) h += config.rowHeights[i];
  return { x, y, w, h };
}
