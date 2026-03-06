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
    padding: 4, merged: false, mergedBy: null,
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
    cells, borderColor: "#333333",
    borderWidth: 0.5, outerBorderWidth: 1.5,
  };
}

// ─── Canvas2D로 표 이미지 생성 ───
export function renderTableToDataURL(config: TableConfig, scale = 2): string {
  const { rows, cols, cells, colWidths, rowHeights, borderColor, borderWidth, outerBorderWidth } = config;
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  const totalH = rowHeights.reduce((a, b) => a + b, 0);

  const canvas = document.createElement("canvas");
  canvas.width = totalW * scale;
  canvas.height = totalH * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  // 1) White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, totalW, totalH);

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
        const weight = cell.fontWeight === "bold" ? "bold " : "";
        ctx.font = `${style}${weight}${fs}px ${cell.fontFamily}`;
        ctx.fillStyle = cell.textColor;

        // horizontal align
        let tx: number;
        if (cell.textAlign === "left") { ctx.textAlign = "left"; tx = x + cell.padding; }
        else if (cell.textAlign === "right") { ctx.textAlign = "right"; tx = x + cw - cell.padding; }
        else { ctx.textAlign = "center"; tx = x + cw / 2; }

        // vertical align
        ctx.textBaseline = "middle";
        let ty: number;
        if (cell.verticalAlign === "top") ty = y + cell.padding + fs / 2;
        else if (cell.verticalAlign === "bottom") ty = y + ch - cell.padding - fs / 2;
        else ty = y + ch / 2;

        ctx.fillText(cell.text, tx, ty, cw - cell.padding * 2);
      }
    }
  }

  // 3) Grid lines - skip merged cell interiors
  ctx.strokeStyle = borderColor;

  // Helper: check if a grid line segment is inside a merged cell
  const isMergedH = (r: number, c: number): boolean => {
    // Is horizontal line at row r, column c inside a merged cell?
    for (let mr = 0; mr < rows; mr++) {
      for (let mc = 0; mc < cols; mc++) {
        const cell = cells[mr][mc];
        if (cell.merged || (cell.rowSpan <= 1 && cell.colSpan <= 1)) continue;
        if (r > mr && r < mr + cell.rowSpan && c >= mc && c < mc + cell.colSpan) return true;
      }
    }
    return false;
  };
  const isMergedV = (r: number, c: number): boolean => {
    for (let mr = 0; mr < rows; mr++) {
      for (let mc = 0; mc < cols; mc++) {
        const cell = cells[mr][mc];
        if (cell.merged || (cell.rowSpan <= 1 && cell.colSpan <= 1)) continue;
        if (c > mc && c < mc + cell.colSpan && r >= mr && r < mr + cell.rowSpan) return true;
      }
    }
    return false;
  };

  // inner horizontal lines (segment by segment)
  for (let r = 1; r < rows; r++) {
    let y = 0; for (let i = 0; i < r; i++) y += rowHeights[i];
    ctx.lineWidth = borderWidth;
    for (let c = 0; c < cols; c++) {
      if (isMergedH(r, c)) continue;
      let x = 0; for (let i = 0; i < c; i++) x += colWidths[i];
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + colWidths[c], y); ctx.stroke();
    }
  }

  // inner vertical lines (segment by segment)
  for (let c = 1; c < cols; c++) {
    let x = 0; for (let i = 0; i < c; i++) x += colWidths[i];
    ctx.lineWidth = borderWidth;
    for (let r = 0; r < rows; r++) {
      if (isMergedV(r, c)) continue;
      let y = 0; for (let i = 0; i < r; i++) y += rowHeights[i];
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + rowHeights[r]); ctx.stroke();
    }
  }

  // outer border
  ctx.lineWidth = outerBorderWidth;
  ctx.strokeRect(outerBorderWidth / 2, outerBorderWidth / 2, totalW - outerBorderWidth, totalH - outerBorderWidth);

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
