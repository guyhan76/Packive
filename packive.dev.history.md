# Packive Development History
> Completed features and past lessons

## Completed (as of 2026-03-10)
- CMYK color picker (FOGRA39 ICC LUT)
- PDF/PNG/Dieline export (CMYK vector, K100)
- Dieline upload (EPS/AI/PDF/SVG)
- Dieline API (cut=red, fold=green)
- Text editing (Korean fonts)
- Text to outlines (opentype.js)
- Shapes (fixed, resize only)
- Barcode/QR generation
- Spot color (basic)
- 3D mockup (basic)
- Multi-cell select, cell merge
- Backup & Git management
- Table (raster PNG, canvas OK, export needs vector)

## Lessons Learned
- Fabric.js Group table: auto coord recalc broke bounding box -> restored
- SVG vector conversion: DOMParser namespace lost text -> SVG removed
- Bleed attempt 1: failed to auto-detect outer path -> clipper2-ts planned

## Key Files
- src/lib/table-engine.ts
- src/lib/table-to-vector.ts (delete after Phase 1)
- src/lib/text-to-outlines.ts
- src/lib/pdf-cmyk-export.ts
- src/components/editor/unified-editor.tsx
