// src/lib/diecut-engines/svg-exporter.ts
// Dieline SVG/PDF exporter — industry standard layers

import { DiecutResult } from "./fefco-0215"

interface ExportOptions {
  showBleed?: boolean
  bleedMM?: number
  showLabels?: boolean
  unit?: "mm" | "pt"  // mm for screen, pt for print (1mm = 2.83465pt)
}

/**
 * Generate industry-standard SVG from DiecutResult
 * Layers: CutContour (red), Crease (green), Bleed (blue), Labels (gray)
 * All coordinates in mm, viewBox in mm
 */
export function generateSVG(result: DiecutResult, options: ExportOptions = {}): string {
  const { showBleed = true, bleedMM = 3, showLabels = true } = options
  const { paths, totalWidth, totalHeight, panels } = result

  const vbX = -bleedMM
  const vbY = -bleedMM
  const vbW = totalWidth + bleedMM * 2
  const vbH = totalHeight + bleedMM * 2

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
  viewBox="${vbX} ${vbY} ${vbW} ${vbH}"
  width="${vbW}mm" height="${vbH}mm"
  style="background:#FFFFFF">
  <!-- Packive Dieline Generator — Industry Standard SVG -->
  <!-- CutContour: die-cut lines (red #FF0000) -->
  <!-- Crease: fold/score lines (green #00AA00) -->
  <!-- Bleed: bleed area (blue #0055FF) -->
`

  // ─── Bleed layer ───
  if (showBleed) {
    svg += `  <g id="Bleed" style="display:inline">\n`
    panels.forEach(p => {
      if (p.width > 0 && p.height > 0) {
        svg += `    <rect x="${(p.x - bleedMM).toFixed(2)}" y="${(p.y - bleedMM).toFixed(2)}" width="${(p.width + bleedMM * 2).toFixed(2)}" height="${(p.height + bleedMM * 2).toFixed(2)}" fill="none" stroke="#0055FF" stroke-width="0.15" stroke-dasharray="1 0.5" />\n`
      }
    })
    svg += `  </g>\n`
  }

  // ─── Crease layer (fold lines) ───
  svg += `  <g id="Crease" style="display:inline">\n`
  paths.filter(p => p.type === "fold").forEach(p => {
    if (p.points.length === 2) {
      svg += `    <line x1="${p.points[0].x.toFixed(2)}" y1="${p.points[0].y.toFixed(2)}" x2="${p.points[1].x.toFixed(2)}" y2="${p.points[1].y.toFixed(2)}" stroke="#00AA00" stroke-width="0.25" stroke-dasharray="2 1" fill="none" />\n`
    }
  })
  svg += `  </g>\n`

  // ─── CutContour layer (die-cut lines) ───
  svg += `  <g id="CutContour" style="display:inline">\n`
  paths.filter(p => p.type === "cut").forEach(p => {
    if (p.points.length < 2) return
    let d = `M ${p.points[0].x.toFixed(2)} ${p.points[0].y.toFixed(2)}`

    // Check if this path has arc data
    for (let i = 1; i < p.points.length; i++) {
      const pt = p.points[i] as any
      if (pt.arc) {
        // SVG arc command: A rx ry rotation large-arc sweep x y
        d += ` A ${pt.arc.rx.toFixed(2)} ${pt.arc.ry.toFixed(2)} 0 ${pt.arc.largeArc ? 1 : 0} ${pt.arc.sweep ? 1 : 0} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`
      } else if (pt.bezier) {
        // Cubic bezier: C cx1 cy1, cx2 cy2, x y
        d += ` C ${pt.bezier.cx1.toFixed(2)} ${pt.bezier.cy1.toFixed(2)}, ${pt.bezier.cx2.toFixed(2)} ${pt.bezier.cy2.toFixed(2)}, ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`
      } else {
        d += ` L ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`
      }
    }

    svg += `    <path d="${d}" stroke="#FF0000" stroke-width="0.25" fill="none" />\n`
  })
  svg += `  </g>\n`

  // ─── Labels layer ───
  if (showLabels) {
    svg += `  <g id="Labels" style="display:inline">\n`
    panels.forEach(p => {
      if (p.width > 0 && p.height > 0) {
        const cx = p.x + p.width / 2
        const cy = p.y + p.height / 2
        const fs = Math.max(3, Math.min(8, p.width * 0.06))
        svg += `    <text x="${cx.toFixed(2)}" y="${cy.toFixed(2)}" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="${fs.toFixed(1)}" fill="rgba(0,0,0,0.15)">${p.name}</text>\n`
      }
    })
    svg += `  </g>\n`
  }

  svg += `</svg>`
  return svg
}

/**
 * Generate SVG as data URL for canvas background
 */
export function generateSVGDataUrl(result: DiecutResult, options: ExportOptions = {}): string {
  const svg = generateSVG(result, options)
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)
}

/**
 * Download SVG file
 */
export function downloadSVG(result: DiecutResult, filename: string, options: ExportOptions = {}): void {
  const svg = generateSVG(result, options)
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename.endsWith(".svg") ? filename : filename + ".svg"
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Download PDF with dieline (using jsPDF)
 */
export async function downloadDielinePDF(result: DiecutResult, filename: string): Promise<void> {
  const { jsPDF } = await import("jspdf")
  const { paths, totalWidth, totalHeight, panels } = result

  const doc = new jsPDF({
    orientation: totalWidth > totalHeight ? "landscape" : "portrait",
    unit: "mm",
    format: [totalWidth + 10, totalHeight + 10],
  })

  const ox = 5, oy = 5  // 5mm margin

  // Crease lines (green, dashed)
  doc.setDrawColor(0, 170, 0)
  doc.setLineWidth(0.2)
  doc.setLineDashPattern([2, 1], 0)
  paths.filter(p => p.type === "fold").forEach(p => {
    if (p.points.length === 2) {
      doc.line(p.points[0].x + ox, p.points[0].y + oy, p.points[1].x + ox, p.points[1].y + oy)
    }
  })

  // CutContour lines (red, solid)
  doc.setDrawColor(255, 0, 0)
  doc.setLineWidth(0.25)
  doc.setLineDashPattern([], 0)
  paths.filter(p => p.type === "cut").forEach(p => {
    if (p.points.length < 2) return
    for (let i = 1; i < p.points.length; i++) {
      doc.line(
        p.points[i-1].x + ox, p.points[i-1].y + oy,
        p.points[i].x + ox, p.points[i].y + oy
      )
    }
  })

  // Panel labels
  doc.setFontSize(6)
  doc.setTextColor(180, 180, 180)
  panels.forEach(p => {
    if (p.width > 0 && p.height > 0) {
      doc.text(p.name, p.x + p.width / 2 + ox, p.y + p.height / 2 + oy, { align: "center" })
    }
  })

  doc.save(filename.endsWith(".pdf") ? filename : filename + ".pdf")
}
