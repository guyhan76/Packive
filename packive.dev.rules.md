# Packive Dev Rules & Roadmap
> Updated: 2026-03-14 | Status: Phase 2 ready

## Export Strategy
- PDF (CMYK vector) — print + AI conversion
- PNG — preview / sharing
- Dieline PDF — cut lines only
- SVG — removed (not used in print industry)

## Revenue Model
- Subscription only, no extra paid options
- All features (incl. BG removal) unlimited for subscribers

## Phase Order
1. ✅ Table (completed 2026-03-14)
   - Independent Rect+Line+Textbox, NO Group
   - Add/delete/undo, drag-move, re-select
   - Cell text, merge/unmerge, border, row/col resize
   - Font change (English/Korean/Japanese via Google Fonts unicode-range subsets)
   - Font category tabs (All/English/한국어/日本語)
   - Cell background/text color (CMYK picker)
   - Bold/Weight/Style, Line Height, Text Align
   - PDF CMYK export with text-to-outlines
   - Direct property update (fontFamily etc.) without rebuild for performance

2. Ruler (mm/inch, guidelines, snap)
   - Canvas top/left mm/inch ruler display
   - Drag from ruler to create guidelines
   - Object snap to guidelines on move/resize
   - mm ↔ inch unit toggle
   - Leverage existing _isGuideLayer, _isFoldLine code where applicable

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
- backup-restored-raster-20260309_220044
- phase1-complete-20260314 (table fully working, font/PDF/outline OK)