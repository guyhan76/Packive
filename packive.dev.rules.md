# Packive Dev Rules & Roadmap
> Updated: 2026-03-10 | Status: Phase 1 ready

## Export Strategy
- PDF (CMYK vector) — print + AI conversion
- PNG — preview / sharing
- Dieline PDF — cut lines only
- SVG — removed (not used in print industry)

## Revenue Model
- Subscription only, no extra paid options
- All features (incl. BG removal) unlimited for subscribers

## Phase Order
1. Table (independent Rect+Line+Textbox, NO Group)
2. Ruler (mm/px, guidelines, snap)
3. Shape vector editing (anchor points, bezier)
4. Pen tool / path clipping
5. Panel Map (per-face design)
6. AI (ad copy, logo, BG removal BRIA RMBG 2.0, Image Trace)
7. Design templates
8. Print essentials (Bleed 5mm clipper2-ts, spot color, overprint, preflight)
9. 3D mockup upgrade (Pacdora level)
10. Dieline UI/UX redesign
11. Collaboration / approval workflow

## Dev Rules
- Backup BEFORE any edit
- Small unit test first, then expand
- One file at a time
- 3 failures = restore + redesign
- NO Fabric.js Group for tables
- NO DOMParser for SVG manipulation
- NO 100+ lines in one write

## Tech Stack
Next.js, TypeScript, Fabric.js, clipper2-ts, opentype.js, svg2pdf.js, jsPDF, ONNX Runtime Web, BRIA RMBG 2.0, FOGRA39 ICC

## Restore Points
- backup-before-table-rewrite
- backup-restored-raster-20260309_220044 (current stable)
